/**
 * 지역 상세 통계 정합성 전수 대조 (2026-10-07, 회장 "정확한 데이터인지 항상 정합성 체크 — 신뢰도가 생명")
 *
 * 지역 상세(시·도 17·시·군·구 230·시 아래 구 39)의 의료기관·학교·인구 카드가 공공데이터 원천과 맞는지 본다.
 * 기준값은 우리 수집 코드를 거치지 않고 원천에서 직접 만든다 — 같은 코드로 만든 기준은 같은 실수를 정답으로 삼는다.
 *   1) 학교: 교육부 NEIS 시·도 목록 전부 → 주소 낱말 일치로 셈 + 시·도별 포착률(어느 시·군·구에도 안 잡힌 학교).
 *      시 아래 구는 주소에 구 이름이 없으면(부천·화성 — 10/7) 통계청 주소 좌표 변환(SGIS geocode)이 돌려주는 구 코드로 —
 *      앱은 법정 읍·면·동으로 나누므로(education.ts schoolMatcher) 둘은 서로 다른 길이다
 *   2) 의료기관: 심평원 코드별 건수 + 응답 지역명(코드가 정말 그 지역인가) + 시·도 합계 = 시·군·구 합 교차 확인.
 *      구 신설 뒤 시 단위 코드로 남은 기관(화성 312500)은 주소 좌표 변환으로 구를 정해 더한다
 *   3) 인구: 통계청 SGIS (앱과 같은 연도) — 시·군·구는 시·도 아래 목록에서, 구가 있는 시는 구 합, 인천 신설 4개 구는
 *      행정동 합(region-composites.ts 정의) + 네 구 합 = 옛 중구·동구·서구 합 교차 확인 (10/7 A안)
 *   4) 화면: 운영 페이지 카드 값과 대조 — 일치 / 캐시 시점 차이(±2, 0.5%) / 불일치 / 시·도 대체값('기준').
 *      구가 있는 시는 화면끼리도 맞춰 본다 — 구 화면 합 = 시 화면(의료기관·학교·인구)
 * 10/7 첫 실행이 찾은 것: 광주 5구 코드 이전(서구 '0개'), 세종 코드, 군위 편입, 시 아래 구 코드 16곳 뒤바뀜,
 * 화성 신설 구, 청주 인구 코드, 학교 1,000건 제한·이름 부분 일치.
 *
 * 실행(한국 회선 — data.go.kr 은 클라우드 대역을 막는다):
 *   npx tsx scripts/check-region-stats-integrity.ts [--base=https://irangfarm.com] [--only=gwangju,incheon] [--json=요약.json]
 * 대조는 운영 페이지를 렌더하므로 시·도별 첫 쪽은 하나씩(데이터 캐시 예열), 나머지는 동시 2개로 연다 —
 * 동시 요청이 시간 초과를 만들면 시·도 대체값이 하루 캐시에 남는다(10/7 1차 대조에서 실제로 일어남).
 * 불일치가 있으면 exit 1.
 *
 * CI(주 1회 .github/workflows/region-integrity.yml, 미국 러너 — 10/7 추가):
 *   - 키는 .env.local 위에 환경변수를 얹어 읽는다(환경변수 우선). CI 엔 .env.local 이 없다.
 *   - 심평원은 DATA_GO_KR_PROXY_URL·SECRET 이 있으면 앱과 같은 프록시 Worker 경유(src/lib/api/_datagokr.ts),
 *     없으면 직접 호출(로컬 한국 회선). 프록시로 받을 땐 저장분(KV, 심평원 7일)을 건너뛰고 원천에서 새로 받는다
 *     (x-irang-proxy-fresh — 10/7, 저장 시점이 다른 합계끼리 비교하면 1~2개 차이가 불일치로 잡혔다). CI 키는 Worker
 *     PROXY_SECRET_CI(GitHub DATAGOKR_PROXY_CI_KEY) — 앱 키와 별개.
 *   - 운영 페이지는 E2E_SECRET 이 있으면 e2e 우회(UA irang-e2e/1.0 + 시크릿 헤더, playwright.config.ts) —
 *     Cloudflare 가 한국 외를 막는다. 이 UA 는 GA·DB 적재에서 빠진다.
 *   - 대조 전 접근 점검(NEIS·심평원·운영 페이지 각 1건) — 하나라도 막히면 278쪽을 돌기 전에 이유와 함께 멈춘다.
 *   - --json 은 요약(건수·불일치 목록·코드↔지역명·시·도 합계·학교 포착률·접근 점검)을 쓴다. 대조를 끝내지
 *     못해도 fatal 과 함께 쓴다. 공개 저장소라 키·프록시 주소는 메시지에서 가린다.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { buildDataGoKrRequest, isDataGoKrProxied } from "@/lib/api/_datagokr";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS, type GuDistrict } from "@/lib/data/gus";
import { GU_HIRA_CODES_MAP, toHiraSidoCd } from "@/lib/api/hira";
import { REGION_REORGANIZATIONS } from "@/lib/data/region-reorganizations";
import { INTEGRATED_CITY_GU_CODES } from "@/lib/data/integrated-cities";
import { REPLACED_SGIS_GU, compositeRows, compositesInProvince, getSgisComposite, splitGuOf } from "@/lib/data/region-composites";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const BASE = (args.base ?? "https://irangfarm.com").replace(/\/+$/, "");
const ONLY = args.only ? new Set(String(args.only).split(",").map((s) => s.trim()).filter(Boolean)) : null;
const JSON_OUT = args.json && args.json !== "true" ? args.json : null;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

// .env.local(로컬) 위에 환경변수(CI·일회성 덮어쓰기)를 얹는다 — dotenv·Next 와 같은 우선순위. 빈 값은 없는 것으로 본다
const env: Record<string, string | undefined> = {};
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
// 환경변수에도 .env.local 과 같은 정리(앞뒤 공백·따옴표)를 한다. 10/7 첫 CI 실측: GitHub 시크릿 키로 NEIS ERROR-290·
// 심평원 403 code 30 — 로컬에서 키를 따옴표로 감싸거나 끝에 공백을 붙이면 똑같이 재현된다. 정리한 키는 요약에 남겨 재등록을 알린다
const KEY_NAMES = ["DATA_GO_KR_API_KEY", "DATA_GO_KR_PROXY_URL", "DATA_GO_KR_PROXY_SECRET", "NEIS_API_KEY", "E2E_SECRET", "SGIS_KEY", "SGIS_SECRET"];
const envFixed: string[] = [];
for (const k of KEY_NAMES) {
  const raw = process.env[k];
  const v = raw?.trim().replace(/^["']|["']$/g, "");
  if (!v) continue;
  if (v !== raw) envFixed.push(k);
  env[k] = v;
}
if (envFixed.length) console.warn(`환경변수 ${envFixed.join("·")} 값 앞뒤의 공백·따옴표를 정리해 썼어요 — 원본 시크릿 재등록을 권해요`);

// 미국 러너(CI)는 Cloudflare 가 한국 외를 막는다 — E2E 와 같은 우회(UA 토큰 + 시크릿 헤더). 시크릿은 헤더로만 보낸다
const PAGE_HEADERS: Record<string, string> = env.E2E_SECRET
  ? {
      "User-Agent": `${UA} irang-e2e/1.0`,
      "Accept-Language": "ko-KR,ko;q=0.9",
      "x-irang-e2e": "region-integrity",
      "x-irang-e2e-secret": env.E2E_SECRET,
    }
  : { "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9" };

/** 메시지·요약에 남기기 전 키·프록시 주소를 가린다 — 공개 저장소의 로그·이슈로 나간다 */
function mask(s: string): string {
  let out = s.replace(/(KEY|serviceKey|accessToken|consumer_key|consumer_secret)=[^&\s)]+/g, "$1=***");
  const proxy = env.DATA_GO_KR_PROXY_URL?.replace(/\/+$/, "");
  if (proxy) out = out.split(proxy).join("{프록시}");
  for (const v of [env.DATA_GO_KR_PROXY_SECRET, env.DATA_GO_KR_API_KEY, env.NEIS_API_KEY, env.E2E_SECRET, env.SGIS_KEY, env.SGIS_SECRET]) {
    if (v && v.length >= 8) out = out.split(v).join("***");
  }
  return out;
}
const snippet = (t: string) => t.replace(/\s+/g, " ").trim().slice(0, 160);
function errText(e: unknown): string {
  if (!(e instanceof Error)) return String(e);
  if (e.name === "TimeoutError") return "시간 초과";
  const cause = (e as { cause?: { code?: string } }).cause?.code;
  return cause ? `${e.message} (${cause})` : e.message;
}

async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
      const text = await res.text();
      if (res.ok) {
        try {
          return JSON.parse(text) as T;
        } catch {
          last = `JSON 아님 — ${snippet(text)}`;
        }
      } else last = `HTTP ${res.status} ${snippet(text)}`;
    } catch (e) {
      last = errText(e);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(mask(`원천 응답 실패 (${last}): ${url}`));
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
type SchoolRow = { ORG_RDNMA?: string; SCHUL_NM?: string };
type NeisJson = {
  schoolInfo?: [{ head?: { list_total_count?: number }[] }, { row?: SchoolRow[] }];
  RESULT?: { CODE?: string; MESSAGE?: string };
};
const neisCache = new Map<string, SchoolRow[]>();
const neisUrl = (edu: string, i: number, size = 1000) =>
  `https://open.neis.go.kr/hub/schoolInfo?KEY=${env.NEIS_API_KEY}&Type=json&pIndex=${i}&pSize=${size}&ATPT_OFCDC_SC_CODE=${edu}`;
async function neisRows(edu: string): Promise<SchoolRow[]> {
  if (neisCache.has(edu)) return neisCache.get(edu)!;
  const first = await getJson<NeisJson>(neisUrl(edu, 1));
  // 원천이 오류(키·일일 한도·점검)라고 답하면 0건으로 세지 않는다 — '데이터 없음'(INFO-200)만 0건
  if (!first?.schoolInfo && first?.RESULT?.CODE !== "INFO-200")
    throw new Error(`NEIS ${edu} 오류 ${first?.RESULT?.CODE ?? "(형식 다름)"} ${first?.RESULT?.MESSAGE ?? ""}`.trim());
  const total = Number(first?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
  const rows: SchoolRow[] = [...(first?.schoolInfo?.[1]?.row ?? [])];
  for (let i = 2; rows.length < total; i++) {
    const page = await getJson<NeisJson>(neisUrl(edu, i));
    const r = page?.schoolInfo?.[1]?.row ?? [];
    if (!r.length) break;
    rows.push(...r);
  }
  // 덜 받은 목록으로 세지 않는다 — 중간 쪽이 오류면 그 시·도 학교 수가 통째로 작게 나온다
  if (rows.length < total) throw new Error(`NEIS ${edu} 목록 ${rows.length}/${total}건만 받음`);
  neisCache.set(edu, rows);
  return rows;
}
const inDistrict = (addr: string | undefined, name: string) => !!addr && addr.split(/\s+/).includes(name);

// ── 원천: 심평원 ──
type HiraItem = { sidoCdNm?: string; sgguCdNm?: string };
type HiraJson = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { totalCount?: number | string; items?: { item?: HiraItem | HiraItem[] } };
  };
};
const HIRA_PATH = "B551182/hospInfoServicev2/getHospBasisList";
async function hira(sidoCd: string, sgguCd?: string) {
  // 앱(hira.ts)과 같은 파라미터. 프록시 경로(CI)도 저장분(KV)을 건너뛰고 원천에서 새로 받는다(fresh) —
  // 기준값은 우리 경로를 거치지 않고 원천에서 만든다. 저장분끼리 비교하면 시·도 합계와 구별 건수의 저장 시점이 달라
  // 1~2개 차이가 '불일치'로 잡혔다(10/7 대구 4,236 ≠ 4,235). 받은 새 값은 Worker 가 KV 에도 다시 써 앱도 최신이 된다
  const params: Record<string, string> = { sidoCd, pageNo: "1", numOfRows: "1", _type: "json" };
  if (sgguCd) params.sgguCd = sgguCd;
  const req = buildDataGoKrRequest(HIRA_PATH, params, env, { fresh: true });
  if (!req) throw new Error("심평원 키 없음 — DATA_GO_KR_API_KEY 또는 DATA_GO_KR_PROXY_URL·SECRET");
  const j = await getJson<HiraJson>(req.url, req.headers);
  const head = j?.response?.header;
  if (head?.resultCode && head.resultCode !== "00")
    throw new Error(mask(`심평원 resultCode ${head.resultCode} ${head.resultMsg ?? ""}: ${req.url}`));
  const body = j?.response?.body;
  const item = Array.isArray(body?.items?.item) ? body.items.item[0] : body?.items?.item;
  return { total: Number(body?.totalCount ?? NaN), name: item ? `${item.sidoCdNm} ${item.sgguCdNm}` : null };
}

/** 코드 하나의 목록 전부(시 단위로 남은 코드처럼 몇 건뿐인 목록용) — 주소로 구를 정한다 */
async function hiraItems(sidoCd: string, sgguCd: string): Promise<{ yadmNm?: string; addr?: string }[]> {
  const out: { yadmNm?: string; addr?: string }[] = [];
  for (let page = 1; page <= 10; page++) {
    const params = { sidoCd, sgguCd, pageNo: String(page), numOfRows: "100", _type: "json" };
    const req = buildDataGoKrRequest(HIRA_PATH, params, env, { fresh: true });
    if (!req) throw new Error("심평원 키 없음");
    type ListJson = { response?: { body?: { totalCount?: number | string; items?: { item?: unknown } | "" } } };
    const body = (await getJson<ListJson>(req.url, req.headers))?.response?.body;
    const total = Number(body?.totalCount);
    if (!Number.isFinite(total)) throw new Error(mask(`심평원 목록 ${sgguCd} totalCount 없음`));
    const raw = body?.items && typeof body.items === "object" ? (body.items as { item?: unknown }).item : undefined;
    const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as { yadmNm?: string; addr?: string }[];
    out.push(...items);
    if (out.length >= total) return out;
    if (!items.length) break;
  }
  throw new Error(`심평원 목록 ${sgguCd} 덜 받음 (${out.length})`);
}

// ── 원천: 통계청 SGIS 인구 ──
type SgisRow = { adm_cd: string; adm_nm?: string; tot_ppltn: string };
type SgisJson<T> = { errCd?: number | string; errMsg?: string; result?: T };
/** 앱(lib/api/sgis.ts)과 같은 연도 — 통계는 1~2년 늦게 나온다 */
const SGIS_YEAR = new Date().getFullYear() - 2;
const SGIS_BASE = "https://sgisapi.kostat.go.kr/OpenAPI3";
let sgisAccess: string | null | undefined;
/** 인구 대조를 건너뛴 이유(키 없음·인증 실패) — null 이면 대조함 */
let sgisSkip: string | null = null;
/** SGIS 키가 없거나 인증이 안 되면 null — 인구 대조만 건너뛰고 이유를 요약에 남긴다 */
async function sgisToken(): Promise<string | null> {
  if (sgisAccess !== undefined) return sgisAccess;
  sgisAccess = null;
  if (!env.SGIS_KEY || !env.SGIS_SECRET) {
    sgisSkip = "SGIS_KEY·SGIS_SECRET 없음";
    return null;
  }
  try {
    const j = await getJson<SgisJson<{ accessToken?: string }>>(
      `${SGIS_BASE}/auth/authentication.json?consumer_key=${env.SGIS_KEY}&consumer_secret=${env.SGIS_SECRET}`,
    );
    sgisAccess = j?.result?.accessToken ?? null;
    if (!sgisAccess) sgisSkip = `SGIS 인증 실패 ${j?.errCd ?? ""} ${j?.errMsg ?? ""}`.trim();
  } catch (e) {
    sgisSkip = mask(e instanceof Error ? e.message : String(e));
  }
  return sgisAccess;
}
/** adm_cd 바로 아래 단계 인구 전부(시·도 → 시·군·구, 시·군·구 → 행정동). 오류면 throw — 0명으로 세지 않는다 */
async function sgisRows(token: string, admCd: string): Promise<SgisRow[]> {
  const j = await getJson<SgisJson<SgisRow[]>>(
    `${SGIS_BASE}/stats/population.json?accessToken=${token}&adm_cd=${admCd}&year=${SGIS_YEAR}&low_search=1`,
  );
  if (String(j?.errCd) !== "0" || !Array.isArray(j?.result) || !j.result.length)
    throw new Error(`SGIS 인구 ${admCd} ${SGIS_YEAR} 오류 ${j?.errCd ?? ""} ${j?.errMsg ?? ""}`.trim());
  return j.result;
}
async function sgisTotal(token: string, admCd: string): Promise<number> {
  const j = await getJson<SgisJson<SgisRow[]>>(`${SGIS_BASE}/stats/population.json?accessToken=${token}&adm_cd=${admCd}&year=${SGIS_YEAR}`);
  const row = Array.isArray(j?.result) ? j.result[0] : undefined;
  if (String(j?.errCd) !== "0" || !row) throw new Error(`SGIS 인구 ${admCd} ${SGIS_YEAR} 오류 ${j?.errCd ?? ""} ${j?.errMsg ?? ""}`.trim());
  return Number(row.tot_ppltn);
}
const popOf = (rows: SgisRow[]) => rows.reduce((a, r) => a + Number(r.tot_ppltn), 0);

/**
 * 주소 → 시·군·구(구) 코드 — 통계청 주소 좌표 변환(SGIS geocode). 화성 신설 구(31241~31244)도 이미 새 코드로 답한다(10/7 확인).
 * 앱의 법정 읍·면·동 판정과 다른 길이라 구별 학교·의료기관 기준값으로 쓴다. 변환 못 한 주소는 null(요약에 남긴다)
 */
const geoCache = new Map<string, string | null>();
async function geocodeSgg(token: string, address: string): Promise<string | null> {
  const addr = address.replace(/\s+/g, " ").trim();
  if (geoCache.has(addr)) return geoCache.get(addr)!;
  // 동시에 많이 물으면 멀쩡한 주소도 가끔 실패한다(10/7: 경기경영고 1회 실패 → 다시 물으면 31052) — 두 번 더 묻는다
  let sgg: string | null = null;
  for (let attempt = 0; attempt < 3 && !sgg; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 500 * attempt));
    const j = await getJson<SgisJson<{ resultdata?: { sgg_cd?: string }[] }>>(
      `${SGIS_BASE}/addr/geocode.json?accessToken=${token}&address=${encodeURIComponent(addr)}&resultcount=1`,
    );
    sgg = String(j?.errCd) === "0" ? (j?.result?.resultdata?.[0]?.sgg_cd ?? null) : null;
  }
  geoCache.set(addr, sgg);
  return sgg;
}

type Expected = {
  name: string;
  medical?: number;
  school?: number;
  population?: number;
  hiraNames?: (string | null)[];
  /** 기준값을 못 만든 카드(좌표 변환 불가 등) — 대조하지 않고 요약(geoIssues)에 이유를 남긴다 */
  skip?: string[];
};

async function buildExpected() {
  const sido: Record<string, Expected & { sigunguSum?: number }> = {};
  const sigungu: Record<string, Expected> = {};
  const gu: Record<string, Expected> = {};
  const coverage: string[] = [];
  /** 좌표 변환으로 구를 못 정한 학교·기관 — 요약에 남긴다 */
  const geoIssues: string[] = [];
  const provinces = PROVINCES.filter((p) => !ONLY || ONLY.has(p.id));

  for (const p of provinces) {
    const rows = await neisRows(p.eduCode);
    sido[p.id] = { name: p.name, school: rows.length };
    const matched = new Set<number>();
    for (const sg of SIGUNGUS.filter((s) => s.sidoId === p.id)) {
      let c = 0;
      rows.forEach((r, i) => {
        if (inDistrict(r.ORG_RDNMA, sg.name)) {
          c++;
          matched.add(i);
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
    // 구가 있는 시에서 주소에 구 이름이 없는 학교 — 주소 좌표 변환으로 구를 정해 더한다 (부천·화성, 10/7)
    for (const sg of SIGUNGUS.filter((s) => s.sidoId === p.id)) {
      const gus = GUS.filter((g) => g.sidoId === p.id && g.parentSigunguId === sg.id);
      if (!gus.length) continue;
      const noGu = rows.filter((r) => inDistrict(r.ORG_RDNMA, sg.name) && !gus.some((g) => inDistrict(r.ORG_RDNMA, g.name)));
      if (!noGu.length) continue;
      const token = await sgisToken();
      if (!token) {
        for (const g of gus) (gu[`${p.id}/${sg.id}/${g.id}`].skip ??= []).push("학교");
        geoIssues.push(`${sg.name} 학교 ${noGu.length}곳 주소에 구 이름이 없는데 좌표 변환 불가(${sgisSkip}) — 구별 학교 대조 건너뜀`);
        continue;
      }
      const unresolved: string[] = [];
      await pool(noGu, 2, async (r) => {
        const sgg = await geocodeSgg(token, r.ORG_RDNMA ?? "");
        const g = gus.find((x) => x.sgisCode === sgg);
        const e = g ? gu[`${p.id}/${sg.id}/${g.id}`] : undefined;
        if (e) e.school = (e.school ?? 0) + 1;
        else unresolved.push(`${r.SCHUL_NM ?? "?"}(${r.ORG_RDNMA ?? ""}${sgg ? ` → ${sgg}` : ""})`);
      });
      if (unresolved.length) {
        geoUnresolved.set(sg.id, (geoUnresolved.get(sg.id) ?? 0) + unresolved.length);
        geoIssues.push(`${sg.name} 학교 좌표 변환 못 함 ${unresolved.length}곳 — ${unresolved.join(", ")}`);
      }
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
      const parts = await Promise.all(codes.map((c) => hira(toHiraSidoCd(p.hiraSidoCd), c)));
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
  // 구 신설 뒤 시 단위 코드로 남은 기관(화성 312500) — 시 코드 목록 중 어느 구 코드도 아닌 것. 주소 좌표 변환으로 구를 정해 더한다
  for (const sg of SIGUNGUS.filter((s) => !ONLY || ONLY.has(s.sidoId))) {
    const gus: GuDistrict[] = GUS.filter((g) => g.sidoId === sg.sidoId && g.parentSigunguId === sg.id);
    const residual = (GU_HIRA_CODES_MAP[sg.hiraSgguCd] ?? []).filter((c) => !gus.some((g) => g.hiraSgguCd === c));
    if (!gus.length || !residual.length) continue;
    const p = PROVINCES.find((x) => x.id === sg.sidoId)!;
    const token = await sgisToken();
    for (const code of residual) {
      const items = await hiraItems(toHiraSidoCd(p.hiraSidoCd), code);
      if (!token) {
        for (const g of gus) (gu[`${p.id}/${sg.id}/${g.id}`].skip ??= []).push("의료기관");
        geoIssues.push(`${sg.name} 심평원 시 단위 코드 ${code} ${items.length}곳 — 좌표 변환 불가(${sgisSkip}), 구별 의료기관 대조 건너뜀`);
        continue;
      }
      for (const it of items) {
        const sgg = await geocodeSgg(token, it.addr ?? "");
        const g = gus.find((x) => x.sgisCode === sgg);
        const e = g ? gu[`${p.id}/${sg.id}/${g.id}`] : undefined;
        if (e) e.medical = (e.medical ?? 0) + 1;
        else {
          geoUnresolved.set(sg.id, (geoUnresolved.get(sg.id) ?? 0) + 1);
          geoIssues.push(`${sg.name} 심평원 ${code} '${it.yadmNm ?? "?"}'(${it.addr ?? ""}) 구 좌표 변환 못 함`);
        }
      }
    }
  }

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
    sido[p.id].sigunguSum = SIGUNGUS.filter((s) => s.sidoId === p.id).reduce(
      (a, s) => a + (sigungu[`${p.id}/${s.id}`]?.medical ?? 0),
      0,
    );
  }

  // 인구 — SGIS 키가 없으면 건너뛴다(요약에 이유). 신설 구는 행정동 합 + 네 구 합 = 옛 구 합
  const popIssues: string[] = [];
  const token = await sgisToken();
  if (token) {
    for (const p of provinces) {
      sido[p.id].population = await sgisTotal(token, p.sgisCode);
      const rows = await sgisRows(token, p.sgisCode);
      const byCode = new Map(rows.map((r) => [r.adm_cd, r]));
      const composites = compositesInProvince(p.sgisCode);
      const dongRowsByGu = new Map<string, SgisRow[]>();
      for (const g of splitGuOf(composites)) dongRowsByGu.set(g, await sgisRows(token, g));
      for (const sg of SIGUNGUS.filter((s) => s.sidoId === p.id)) {
        const key = `${p.id}/${sg.id}`;
        const composite = getSgisComposite(sg.sgisCode);
        const cityGu = INTEGRATED_CITY_GU_CODES[sg.sgisCode];
        const parts = composite
          ? compositeRows(composite, rows, dongRowsByGu)
          : cityGu
            ? cityGu.map((c) => byCode.get(c)).every(Boolean)
              ? cityGu.map((c) => byCode.get(c)!)
              : null
            : byCode.has(sg.sgisCode)
              ? [byCode.get(sg.sgisCode)!]
              : null;
        if (parts) sigungu[key].population = popOf(parts);
        else popIssues.push(`${key} ${sg.name} — SGIS ${SGIS_YEAR} 에서 인구를 만들 수 없음(코드 ${sg.sgisCode})`);
      }
      for (const g of GUS.filter((x) => x.sidoId === p.id)) {
        const key = `${p.id}/${g.parentSigunguId}/${g.id}`;
        // 시 아래 신설 구(화성 2026 — SGIS 미등재)는 시의 행정동을 정의대로 더한다
        const composite = getSgisComposite(g.sgisCode);
        if (composite?.split && !dongRowsByGu.has(composite.split.gu)) dongRowsByGu.set(composite.split.gu, await sgisRows(token, composite.split.gu));
        const parts = composite ? compositeRows(composite, rows, dongRowsByGu) : byCode.has(g.sgisCode) ? [byCode.get(g.sgisCode)!] : null;
        if (parts) gu[key].population = popOf(parts);
        else popIssues.push(`${key} ${g.name} — SGIS ${SGIS_YEAR} 에 코드 ${g.sgisCode} 없음`);
      }
      // 시 아래 신설 구 합 = 시 (화성: 행정동 정의가 빠짐없이 시를 덮는가)
      for (const sg of SIGUNGUS.filter((s) => s.sidoId === p.id)) {
        const subs = GUS.filter((g) => g.parentSigunguId === sg.id && g.sidoId === p.id && getSgisComposite(g.sgisCode));
        if (!subs.length) continue;
        const sum = subs.reduce((a, g) => a + (gu[`${p.id}/${sg.id}/${g.id}`]?.population ?? NaN), 0);
        const city = sigungu[`${p.id}/${sg.id}`]?.population;
        if (sum !== city) popIssues.push(`${p.id}/${sg.id} 신설 구 인구 합 ${sum} ≠ ${sg.name} ${city} — 행정동 정의 확인`);
      }
      if (composites.length) {
        const newSum = composites.reduce((a, c) => a + (sigungu[`${p.id}/${c.sigunguId}`]?.population ?? NaN), 0);
        const oldSum = popOf([...REPLACED_SGIS_GU].filter((c) => c.startsWith(p.sgisCode)).map((c) => byCode.get(c)!).filter(Boolean));
        if (newSum !== oldSum) popIssues.push(`${p.id} 신설 구 인구 합 ${newSum} ≠ 옛 구 합 ${oldSum} — 행정동 정의 확인`);
      }
    }
  }
  return { sido, sigungu, gu, coverage, popIssues, geoIssues };
}

/** 시별 좌표 변환 못 한 학교·기관 수 — 구 화면이 기준값보다 이만큼 많아도 '불일치'가 아니라 '확인 못 함'으로 본다 */
const geoUnresolved = new Map<string, number>();

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
  const m = v.match(/^([\d,]+)\s*(개|곳|명)?$/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

/** 페이지 실패 사유(마지막 시도) — 요약에서 '막혔나(403·503)·느렸나(시간 초과)'를 가른다 */
const pageFailures = new Map<string, string>();
async function fetchPage(path: string): Promise<string | null> {
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE}/regions/${path}`, {
        headers: PAGE_HEADERS,
        signal: AbortSignal.timeout(150_000),
      });
      if (res.ok) {
        const html = await res.text();
        pageFailures.delete(path);
        return html;
      }
      await res.body?.cancel();
      last = `HTTP ${res.status}`;
    } catch (e) {
      last = errText(e);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
  }
  pageFailures.set(path, last);
  return null;
}

// ── 접근 점검 (CI 대비) ──
type Access = { ok: boolean; label: string; detail: string };
const access: Record<"neis" | "hira" | "page", Access | undefined> = { neis: undefined, hira: undefined, page: undefined };
const route = () => ({ hira: isDataGoKrProxied(env) ? "proxy" : "direct", page: env.E2E_SECRET ? "e2e" : "browser" });

/** 대조 전 원천 2종·운영 페이지를 1건씩 — 하나라도 막히면 수백 쪽을 돌기 전에 이유와 함께 멈춘다 */
async function preflight() {
  const unknown = ONLY ? [...ONLY].filter((id) => !PROVINCES.some((p) => p.id === id)) : [];
  if (unknown.length) throw new Error(`알 수 없는 시·도 id: ${unknown.join(", ")} (PROVINCES.id)`);
  if (ONLY && !ONLY.size) throw new Error("--only 에 시·도 id 가 없어요");
  if (!env.NEIS_API_KEY) throw new Error("NEIS_API_KEY 없음");
  const p = PROVINCES.find((x) => !ONLY || ONLY.has(x.id))!;
  const r = route();
  const probes: Record<keyof typeof access, [string, () => Promise<string>]> = {
    neis: [
      "교육부 NEIS",
      async () => {
        const j = await getJson<NeisJson>(neisUrl(p.eduCode, 1, 1));
        const n = Number(j?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
        if (!n) throw new Error(`학교 0건 — ${j?.RESULT?.CODE ?? "형식 다름"} ${j?.RESULT?.MESSAGE ?? ""}`.trim());
        return `${p.name} 학교 ${n.toLocaleString("ko-KR")}곳`;
      },
    ],
    hira: [
      `심평원 (${r.hira === "proxy" ? "프록시" : "직접"})`,
      async () => {
        const h = await hira(toHiraSidoCd(p.hiraSidoCd));
        if (!Number.isFinite(h.total)) throw new Error("응답에 totalCount 없음");
        return `${p.name} 의료기관 ${h.total.toLocaleString("ko-KR")}곳`;
      },
    ],
    page: [
      `운영 페이지 (${r.page === "e2e" ? "e2e 우회" : "일반 UA"})`,
      async () => {
        const html = await fetchPage(p.id);
        if (!html) throw new Error(pageFailures.get(p.id) ?? "응답 없음");
        return `/regions/${p.id} 통계 카드 ${Object.keys(readCards(html)).length}개`;
      },
    ],
  };
  await Promise.all(
    (Object.keys(probes) as (keyof typeof access)[]).map(async (k) => {
      const [label, run] = probes[k];
      try {
        access[k] = { ok: true, label, detail: await run() };
      } catch (e) {
        access[k] = { ok: false, label, detail: mask(e instanceof Error ? e.message : String(e)) };
      }
    }),
  );
  for (const a of Object.values(access)) console.log(`  ${a?.ok ? "✓" : "✗"} ${a?.label} — ${a?.detail}`);
  const bad = Object.values(access).filter((a): a is Access => !!a && !a.ok);
  if (!bad.length) return;
  // 원인을 오류 코드로 바로 짚는다 — 키 무효(NEIS ERROR-290·심평원 code 30)와 미국 러너 차단(심평원 400 code 10)은 처방이 다르다
  const hints: string[] = [];
  const ci = !!process.env.GITHUB_ACTIONS;
  // 키 지문(sha256 앞 8자) — 값을 드러내지 않고 시크릿이 로컬 .env.local 의 키와 같은지 대조한다
  const fp = (v?: string) => (v ? createHash("sha256").update(v).digest("hex").slice(0, 8) : "없음");
  if (access.neis && !access.neis.ok && access.neis.detail.includes("ERROR-290"))
    hints.push(`NEIS 키가 무효예요(ERROR-290) — NEIS_API_KEY 값 확인(따옴표·공백·옛 키, 지문 ${fp(env.NEIS_API_KEY)})`);
  if (access.hira && !access.hira.ok && /SERVICE_KEY_IS_NOT_REGISTERED|"returnReasonCode": ?"30"/.test(access.hira.detail))
    hints.push(
      `심평원 키가 무효예요(code 30) — ${r.hira === "proxy" ? "프록시 Worker 의 DATA_GO_KR_API_KEY" : `DATA_GO_KR_API_KEY 값(따옴표·공백·옛 키, 지문 ${fp(env.DATA_GO_KR_API_KEY)})`} 확인`,
    );
  if (ci && !access.hira?.ok && r.hira === "direct")
    hints.push("미국 러너는 data.go.kr 직접 호출이 막혀요(400 code 10) — GitHub 시크릿 DATA_GO_KR_PROXY_URL·DATA_GO_KR_PROXY_SECRET 필요");
  if (ci && !access.page?.ok && r.page === "browser")
    hints.push("미국 러너는 운영 페이지가 막혀요 — GitHub 시크릿 E2E_SECRET 필요");
  throw new Error(
    `접근 점검 실패 — ${bad.map((a) => `${a.label}: ${a.detail}`).join(" / ")}${hints.length ? ` · ${hints.join(" · ")}` : ""}`,
  );
}

/** --json 요약. 대조를 끝내지 못했을 때도 fatal 과 접근 점검 결과를 남긴다 */
function writeSummary(extra: Record<string, unknown>) {
  if (!JSON_OUT) return;
  const summary = { generatedAt: new Date().toISOString(), base: BASE, only: ONLY ? [...ONLY] : null, route: route(), access, envFixed, ...extra };
  writeFileSync(JSON_OUT, `${JSON.stringify(summary, null, 2)}\n`);
}

async function main() {
  console.log(`접근 점검 (원천 2종·운영 페이지, 심평원 ${route().hira} · 페이지 ${route().page})…`);
  await preflight();
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
    if (!html) return { ...j, status: "ERR", msgs: ["페이지 실패"], near: [] as string[], vals: {} as Record<string, number> };
    const c = readCards(html);
    const msgs: string[] = [];
    const near: string[] = [];
    /** 화면 값 — 구 화면 합 = 시 화면 대조용 */
    const vals: Record<string, number> = {};
    // 좌표 변환으로 구를 못 정한 학교·기관 수(그 시) — 구 화면이 기준값보다 이만큼까지 많으면 '확인 못 함'
    const geoSlack = j.kind === "gu" ? (geoUnresolved.get(j.key.split("/")[1]) ?? 0) : 0;
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
      if (n !== null) vals[label] = n;
      if (j.e.skip?.includes(label)) continue;
      if (n === null || want === undefined) { msgs.push(`${label} 값 해석 불가 '${got.value}'`); continue; }
      const d = n - want;
      if (d === 0) continue;
      if (d > 0 && d <= geoSlack) near.push(`${label} ${n} vs 원천 ${want} (좌표 변환 못 한 ${geoSlack}곳 몫)`);
      else if (Math.abs(d) <= Math.max(2, Math.round(want * 0.005))) near.push(`${label} ${n} vs 원천 ${want}`);
      else msgs.push(`${label} 화면 ${n} ≠ 원천 ${want}`);
    }
    const pop = c["실거주 인구"];
    const popN = pop ? toNum(pop.value) : null;
    if (popN !== null && !pop?.sub.includes("기준")) vals["인구"] = popN;
    if (pop?.sub.includes("기준")) msgs.push(`인구 시·도 대체값 ${pop.value}`);
    else if (j.e.population !== undefined) {
      const n = pop ? toNum(pop.value) : null;
      if (!pop) msgs.push("인구 카드 없음");
      else if (n === null) msgs.push(`인구 값 해석 불가 '${pop.value}'`);
      else if (n !== j.e.population) {
        const d = Math.abs(n - j.e.population);
        if (d <= Math.max(2, Math.round(j.e.population * 0.005))) near.push(`인구 ${n} vs 원천 ${j.e.population}`);
        else msgs.push(`인구 화면 ${n} ≠ 원천 ${j.e.population}`);
      }
    }
    return { ...j, status: msgs.length ? "MISMATCH" : near.length ? "NEAR" : "OK", msgs, near, vals };
  };

  console.log(`운영 화면 대조 중 (${BASE}, ${jobs.length}쪽)…`);
  const bySido = new Map<string, Job[]>();
  for (const j of jobs) bySido.set(j.key.split("/")[0], [...(bySido.get(j.key.split("/")[0]) ?? []), j]);
  const results: Awaited<ReturnType<typeof check>>[] = [];
  for (const list of bySido.values()) results.push(await check(list[0]));
  results.push(...(await pool([...bySido.values()].flatMap((l) => l.slice(1)), 2, check)));

  // 구가 있는 시 — 구 화면 합 = 시 화면 (의료기관·학교·인구). 구 판정이 어느 학교·기관을 빠뜨리거나 두 번 세면 여기서 드러난다
  const guSumIssues: string[] = [];
  const guSumNear: string[] = [];
  const byKey = new Map(results.map((r) => [r.key, r]));
  for (const sg of SIGUNGUS) {
    const gus = GUS.filter((g) => g.sidoId === sg.sidoId && g.parentSigunguId === sg.id);
    const city = byKey.get(`${sg.sidoId}/${sg.id}`);
    const parts = gus.map((g) => byKey.get(`${sg.sidoId}/${sg.id}/${g.id}`));
    if (!gus.length || !city || parts.some((r) => !r)) continue;
    for (const label of ["의료기관", "학교", "인구"]) {
      const whole = city.vals[label];
      const nums = parts.map((r) => r!.vals[label]);
      if (whole === undefined || nums.some((v) => v === undefined)) continue;
      const sum = nums.reduce((a, b) => a + b, 0);
      if (sum === whole) continue;
      const msg = `${sg.name} ${label} 구 화면 합 ${sum} ≠ 시 화면 ${whole} (${gus.map((g, i) => `${g.shortName} ${nums[i]}`).join(" · ")})`;
      if (Math.abs(sum - whole) <= Math.max(2, Math.round(whole * 0.005))) guSumNear.push(msg);
      else guSumIssues.push(msg);
    }
  }

  const count = (s: string) => results.filter((r) => r.status === s).length;
  console.log(`\n화면 ${results.length}쪽 — 일치 ${count("OK")} · 캐시 시점 차이 ${count("NEAR")} · 불일치 ${count("MISMATCH")} · 실패 ${count("ERR")}`);
  for (const r of results.filter((x) => x.status === "MISMATCH" || x.status === "ERR")) console.log(`  ✗ ${r.key} — ${r.msgs.join("; ")}`);
  for (const r of results.filter((x) => x.status === "NEAR")) console.log(`  ≈ ${r.key} — ${r.near.join("; ")}`);
  console.log(`\n심평원 코드 ↔ 지역명 불일치 ${nameIssues.length}건`);
  for (const n of nameIssues) console.log(`  ✗ ${n}`);
  console.log(`시·도 합계 ≠ 시·군·구 합 ${sumIssues.length}건`);
  for (const n of sumIssues) console.log(`  · ${n}`);
  console.log(sgisSkip ? `인구 대조 건너뜀 — ${sgisSkip}` : `인구(SGIS ${SGIS_YEAR}) 원천 문제 ${exp.popIssues.length}건`);
  for (const n of exp.popIssues) console.log(`  · ${n}`);
  console.log(`학교 포착률 확인 ${exp.coverage.length}건 (빈 주소·붙은 주소는 원천 쪽 문제)`);
  for (const n of exp.coverage) console.log(`  · ${n}`);
  console.log(`구 화면 합 ≠ 시 화면 ${guSumIssues.length}건${guSumNear.length ? ` (캐시 시점 차이 ${guSumNear.length}건)` : ""}`);
  for (const n of guSumIssues) console.log(`  ✗ ${n}`);
  for (const n of guSumNear) console.log(`  ≈ ${n}`);
  console.log(`주소 좌표 변환(구 판정 기준값) 확인 ${exp.geoIssues.length}건`);
  for (const n of exp.geoIssues) console.log(`  · ${n}`);
  if (count("MISMATCH") || count("ERR") || exp.popIssues.length || guSumIssues.length) process.exitCode = 1;

  // ── 요약 (--json) — 판정은 위 결과를 그대로 옮긴다 ──
  if (pageFailures.size) {
    const causes: Record<string, number> = {};
    for (const c of pageFailures.values()) causes[c] = (causes[c] ?? 0) + 1;
    console.log(`페이지 실패 사유: ${Object.entries(causes).map(([c, n]) => `${c} ${n}쪽`).join(" · ")}`);
  }
  writeSummary({
    fatal: null,
    pages: results.length,
    counts: { ok: count("OK"), near: count("NEAR"), mismatch: count("MISMATCH"), err: count("ERR") },
    problems: results
      .filter((r) => r.status === "MISMATCH" || r.status === "ERR")
      .map((r) => ({ key: r.key, kind: r.kind, status: r.status, msgs: r.msgs, ...(pageFailures.has(r.key) ? { reason: pageFailures.get(r.key) } : {}) })),
    near: results.filter((r) => r.status === "NEAR").map((r) => ({ key: r.key, kind: r.kind, near: r.near })),
    nameIssues,
    sumIssues,
    popIssues: exp.popIssues,
    population: sgisSkip ? { skipped: sgisSkip } : { year: SGIS_YEAR },
    coverage: exp.coverage,
    guSumIssues,
    guSumNear,
    geoIssues: exp.geoIssues,
  });
}

main().catch((e) => {
  const msg = mask(e instanceof Error ? e.message : String(e));
  console.error(msg);
  writeSummary({ fatal: msg });
  process.exit(1);
});
