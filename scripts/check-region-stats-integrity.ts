/**
 * 지역 상세 통계 정합성 전수 대조 (2026-10-07, 회장 "정확한 데이터인지 항상 정합성 체크 — 신뢰도가 생명")
 *
 * 지역 상세(시·도 17·시·군·구 229·시 아래 구 32)의 의료기관·학교·인구 카드가 공공데이터 원천과 맞는지 본다.
 * 기준값은 우리 수집 코드를 거치지 않고 원천에서 직접 만든다 — 같은 코드로 만든 기준은 같은 실수를 정답으로 삼는다.
 *   1) 학교: 교육부 NEIS 시·도 목록 전부 → 주소 낱말 일치로 셈 + 시·도별 포착률(어느 시·군·구에도 안 잡힌 학교)
 *   2) 의료기관: 심평원 코드별 건수 + 응답 지역명(코드가 정말 그 지역인가) + 시·도 합계 = 시·군·구 합 교차 확인
 *   3) 화면: 운영 페이지 카드 값과 대조 — 일치 / 캐시 시점 차이(±2, 0.5%) / 불일치 / 시·도 대체값('기준')
 * 10/7 첫 실행이 찾은 것: 광주 5구 코드 이전(서구 '0개'), 세종 코드, 군위 편입, 시 아래 구 코드 16곳 뒤바뀜,
 * 화성 신설 구, 청주 인구 코드, 학교 1,000건 제한·이름 부분 일치.
 *
 * 실행(한국 회선 — data.go.kr 은 클라우드 대역을 막는다):
 *   npx tsx scripts/check-region-stats-integrity.ts [--base=https://irangfarm.com] [--only=gwangju,incheon]
 * 대조는 운영 페이지를 렌더하므로 시·도별 첫 쪽은 하나씩(데이터 캐시 예열), 나머지는 동시 2개로 연다 —
 * 동시 요청이 시간 초과를 만들면 시·도 대체값이 하루 캐시에 남는다(10/7 1차 대조에서 실제로 일어남).
 * 불일치가 있으면 exit 1.
 */
import { readFileSync } from "node:fs";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
import { GU_HIRA_CODES_MAP, toHiraSidoCd } from "@/lib/api/hira";
import { REGION_REORGANIZATIONS } from "@/lib/data/region-reorganizations";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const BASE = (args.base ?? "https://irangfarm.com").replace(/\/+$/, "");
const ONLY = args.only ? new Set(String(args.only).split(",")) : null;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

async function getJson<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (res.ok) return (await res.json()) as T;
    } catch {}
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(`원천 응답 실패: ${url.replace(/(KEY|serviceKey)=[^&]+/, "$1=***")}`);
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// ── 원천: 교육부 NEIS ──
type SchoolRow = { ORG_RDNMA?: string };
type NeisJson = { schoolInfo?: [{ head?: { list_total_count?: number }[] }, { row?: SchoolRow[] }] };
const neisCache = new Map<string, SchoolRow[]>();
async function neisRows(edu: string): Promise<SchoolRow[]> {
  if (neisCache.has(edu)) return neisCache.get(edu)!;
  const url = (i: number) =>
    `https://open.neis.go.kr/hub/schoolInfo?KEY=${env.NEIS_API_KEY}&Type=json&pIndex=${i}&pSize=1000&ATPT_OFCDC_SC_CODE=${edu}`;
  const first = await getJson<NeisJson>(url(1));
  const total = Number(first?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
  const rows: SchoolRow[] = [...(first?.schoolInfo?.[1]?.row ?? [])];
  for (let i = 2; rows.length < total; i++) {
    const page = await getJson<NeisJson>(url(i));
    const r = page?.schoolInfo?.[1]?.row ?? [];
    if (!r.length) break;
    rows.push(...r);
  }
  neisCache.set(edu, rows);
  return rows;
}
const inDistrict = (addr: string | undefined, name: string) => !!addr && addr.split(/\s+/).includes(name);

// ── 원천: 심평원 ──
type HiraItem = { sidoCdNm?: string; sgguCdNm?: string };
type HiraJson = { response?: { body?: { totalCount?: number | string; items?: { item?: HiraItem | HiraItem[] } } } };
async function hira(sidoCd: string, sgguCd?: string) {
  const q = `sidoCd=${sidoCd}${sgguCd ? `&sgguCd=${sgguCd}` : ""}&pageNo=1&numOfRows=1&_type=json`;
  const j = await getJson<HiraJson>(
    `https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?serviceKey=${env.DATA_GO_KR_API_KEY}&${q}`,
  );
  const body = j?.response?.body;
  const item = Array.isArray(body?.items?.item) ? body.items.item[0] : body?.items?.item;
  return { total: Number(body?.totalCount ?? NaN), name: item ? `${item.sidoCdNm} ${item.sgguCdNm}` : null };
}

type Expected = { name: string; medical?: number; school?: number; hiraNames?: (string | null)[] };

async function buildExpected() {
  const sido: Record<string, Expected & { sigunguSum?: number }> = {};
  const sigungu: Record<string, Expected> = {};
  const gu: Record<string, Expected> = {};
  const coverage: string[] = [];
  const provinces = PROVINCES.filter((p) => !ONLY || ONLY.has(p.id));

  for (const p of provinces) {
    const rows = await neisRows(p.eduCode);
    sido[p.id] = { name: p.name, school: rows.length };
    const matched = new Set<number>();
    for (const sg of SIGUNGUS.filter((s) => s.sidoId === p.id)) {
      const own = sg.eduCode ? await neisRows(sg.eduCode) : rows;
      let c = 0;
      own.forEach((r, i) => {
        if (inDistrict(r.ORG_RDNMA, sg.name)) {
          c++;
          if (!sg.eduCode) matched.add(i);
        }
      });
      sigungu[`${p.id}/${sg.id}`] = { name: sg.name, school: c };
    }
    for (const g of GUS.filter((x) => x.sidoId === p.id)) {
      gu[`${p.id}/${g.parentSigunguId}/${g.id}`] = {
        name: g.name,
        school: rows.filter((r) => inDistrict(r.ORG_RDNMA, g.name)).length,
      };
    }
    if (matched.size !== rows.length) {
      const miss: Record<string, number> = {};
      rows.forEach((r, i) => {
        if (matched.has(i)) return;
        const t = (r.ORG_RDNMA ?? "").split(/\s+/)[1] ?? "(빈 주소)";
        miss[t] = (miss[t] ?? 0) + 1;
      });
      coverage.push(`${p.name} 학교 ${matched.size}/${rows.length} 포착 — 미포착 ${JSON.stringify(miss)}`);
    }
  }

  await pool(
    SIGUNGUS.filter((s) => s.hiraSgguCd && (!ONLY || ONLY.has(s.sidoId))),
    4,
    async (sg) => {
      const p = PROVINCES.find((x) => x.id === sg.sidoId)!;
      const codes = GU_HIRA_CODES_MAP[sg.hiraSgguCd] ?? [sg.hiraSgguCd];
      const parts = await Promise.all(codes.map((c) => hira(toHiraSidoCd(sg.hiraSidoCd ?? p.hiraSidoCd), c)));
      Object.assign(sigungu[`${p.id}/${sg.id}`], {
        medical: parts.reduce((a, b) => a + (Number.isFinite(b.total) ? b.total : 0), 0),
        hiraNames: parts.map((x) => x.name),
      });
    },
  );
  await pool(
    GUS.filter((g) => !ONLY || ONLY.has(g.sidoId)),
    4,
    async (g) => {
      const p = PROVINCES.find((x) => x.id === g.sidoId)!;
      const r = await hira(toHiraSidoCd(p.hiraSidoCd), g.hiraSgguCd);
      Object.assign(gu[`${p.id}/${g.parentSigunguId}/${g.id}`], { medical: r.total, hiraNames: [r.name] });
    },
  );

  // 시·도 의료기관 — 광주 = 통합 코드 아래 광주 5구 합, 전남 = 통합 전체 − 광주, 그 밖 = 시·도 전체
  const GWANGJU = ["360801", "360802", "360803", "360804", "360805"];
  const gwangju = (await Promise.all(GWANGJU.map((c) => hira("360000", c)))).reduce((a, b) => a + b.total, 0);
  for (const p of provinces) {
    sido[p.id].medical =
      p.hiraSidoCd === "240000"
        ? gwangju
        : p.hiraSidoCd === "360000"
          ? (await hira("360000")).total - gwangju
          : (await hira(toHiraSidoCd(p.hiraSidoCd))).total;
    sido[p.id].sigunguSum = SIGUNGUS.filter((s) => s.sidoId === p.id && !s.hiraSidoCd).reduce(
      (a, s) => a + (sigungu[`${p.id}/${s.id}`]?.medical ?? 0),
      0,
    );
  }
  return { sido, sigungu, gu, coverage };
}

// ── 화면 대조 ──
function readCards(html: string) {
  const s = html.replace(/<!-- -->/g, "");
  const out: Record<string, { value: string; sub: string }> = {};
  const re =
    /__statLabel[^"]*">([^<]+)<\/span><span class="[^"]*__statValue[^"]*">([^<]*)<\/span><span class="[^"]*__statSub[^"]*">([\s\S]*?)<\/span>/g;
  for (const m of s.matchAll(re)) out[m[1].trim()] = { value: m[2].trim(), sub: m[3].replace(/<[^>]+>/g, "").trim() };
  return out;
}
const toNum = (v: string) => {
  const m = v.match(/^([\d,]+)\s*(개|곳)?$/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

async function fetchPage(path: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE}/regions/${path}`, {
        headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" },
        signal: AbortSignal.timeout(150_000),
      });
      if (res.ok) return await res.text();
    } catch {}
    await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
  }
  return null;
}

async function main() {
  console.log(`원천 기준값 생성 중 (NEIS·심평원)…`);
  const exp = await buildExpected();
  const unavailable = new Set(
    Object.entries(REGION_REORGANIZATIONS)
      .filter(([, r]) => r.countsUnavailable)
      .map(([id]) => {
        const sg = SIGUNGUS.find((s) => s.id === id)!;
        return `${sg.sidoId}/${id}`;
      }),
  );

  const nameIssues: string[] = [];
  for (const [key, v] of [...Object.entries(exp.sigungu), ...Object.entries(exp.gu)]) {
    if (unavailable.has(key)) continue;
    const short = v.name.replace(/(특별자치시|시|군|구)$/, "");
    for (const n of v.hiraNames ?? []) if (!n || !n.includes(short)) nameIssues.push(`${key} ${v.name} → 심평원 '${n ?? "결과 없음"}'`);
  }
  const sumIssues = Object.entries(exp.sido)
    .filter(([, v]) => v.medical !== v.sigunguSum)
    .map(([k, v]) => `${k} 시·도 ${v.medical} ≠ 시·군·구 합 ${v.sigunguSum}`);

  type Job = { kind: "sido" | "sigungu" | "gu"; key: string; e: Expected };
  const jobs: Job[] = [
    ...Object.entries(exp.sido).map(([key, e]) => ({ kind: "sido" as const, key, e })),
    ...Object.entries(exp.sigungu).map(([key, e]) => ({ kind: "sigungu" as const, key, e })),
    ...Object.entries(exp.gu).map(([key, e]) => ({ kind: "gu" as const, key, e })),
  ];
  const check = async (j: Job) => {
    const html = await fetchPage(j.key);
    if (!html) return { ...j, status: "ERR", msgs: ["페이지 실패"], near: [] as string[] };
    const c = readCards(html);
    const msgs: string[] = [];
    const near: string[] = [];
    for (const [label, want] of [
      ["의료기관", j.e.medical],
      ["학교", j.e.school],
    ] as const) {
      const got = c[label];
      if (unavailable.has(j.key)) {
        if (got?.value !== "확인 불가") msgs.push(`${label} 개편 구인데 '${got?.value}'`);
        continue;
      }
      if (!got) { msgs.push(`${label} 카드 없음`); continue; }
      if (got.sub.includes("기준")) { msgs.push(`${label} 시·도 대체값 ${got.value}`); continue; }
      const n = toNum(got.value);
      if (n === null || want === undefined) { msgs.push(`${label} 값 해석 불가 '${got.value}'`); continue; }
      const d = n - want;
      if (d === 0) continue;
      if (Math.abs(d) <= Math.max(2, Math.round(want * 0.005))) near.push(`${label} ${n} vs 원천 ${want}`);
      else msgs.push(`${label} 화면 ${n} ≠ 원천 ${want}`);
    }
    const pop = c["실거주 인구"];
    if (pop?.sub.includes("기준")) msgs.push(`인구 시·도 대체값 ${pop.value}`);
    return { ...j, status: msgs.length ? "MISMATCH" : near.length ? "NEAR" : "OK", msgs, near };
  };

  console.log(`운영 화면 대조 중 (${BASE}, ${jobs.length}쪽)…`);
  const bySido = new Map<string, Job[]>();
  for (const j of jobs) bySido.set(j.key.split("/")[0], [...(bySido.get(j.key.split("/")[0]) ?? []), j]);
  const results: Awaited<ReturnType<typeof check>>[] = [];
  for (const list of bySido.values()) results.push(await check(list[0]));
  results.push(...(await pool([...bySido.values()].flatMap((l) => l.slice(1)), 2, check)));

  const count = (s: string) => results.filter((r) => r.status === s).length;
  console.log(`\n화면 ${results.length}쪽 — 일치 ${count("OK")} · 캐시 시점 차이 ${count("NEAR")} · 불일치 ${count("MISMATCH")} · 실패 ${count("ERR")}`);
  for (const r of results.filter((x) => x.status === "MISMATCH" || x.status === "ERR")) console.log(`  ✗ ${r.key} — ${r.msgs.join("; ")}`);
  for (const r of results.filter((x) => x.status === "NEAR")) console.log(`  ≈ ${r.key} — ${r.near.join("; ")}`);
  console.log(`\n심평원 코드 ↔ 지역명 불일치 ${nameIssues.length}건`);
  for (const n of nameIssues) console.log(`  ✗ ${n}`);
  console.log(`시·도 합계 ≠ 시·군·구 합 ${sumIssues.length}건 (인천 개편 구·대구 군위는 설계상 차이)`);
  for (const n of sumIssues) console.log(`  · ${n}`);
  console.log(`학교 포착률 확인 ${exp.coverage.length}건 (빈 주소·붙은 주소는 원천 쪽 문제)`);
  for (const n of exp.coverage) console.log(`  · ${n}`);
  if (count("MISMATCH") || count("ERR")) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
