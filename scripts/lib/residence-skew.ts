/**
 * 2025 농림어업총조사 '주소지 쏠림' 판정 — 시·군·구 단위 (2026-10-10, QA 후속).
 *
 * 왜: 총조사 재배면적은 **농가 주소지** 기준이라, 도시 시에 사는 농가가 다른 시·군 논밭을 지으면 도시 시의 값이 된다.
 *   안양 총조사 벼 262ha vs 실제 논 0ha, 성남 209/3.9, 목포 564/95, 수원 1,513/470. 그 값이 '주요 작물 쌀'·'주요 산지'로 나갔다.
 *   종전 규칙은 시·도 단위(서울만)라 이런 시를 못 걸렀다.
 *
 * 기준: 같은 해 실제 경지면적 — 국가데이터처 KOSIS 101/DT_1EB002 「시군별 논밭별 경지면적」 2025 (T10 계·T20 논·T30 밭, 헥타르).
 *   - 벼: 총조사 벼 ÷ 실제 논 > RICE_SKEW_MAX → 그 단위의 벼를 뺀다
 *   - 전체: 총조사 37개 작물 합 ÷ 실제 경지(논+밭) > ALL_SKEW_MAX → 그 단위의 작물을 전부 뺀다
 *   자기 땅에서라면 1을 넘기 어렵다(전국 벼/논 0.72, 37개 작물/경지 0.63). 농촌 군의 최댓값은 벼 ≈1.0·전체 ≈0.95(이모작 포함).
 *   문턱은 2025 분포의 첫 빈틈에 둔다 — 벼 1.49(계룡) ↔ 1.71(광주 광산구 외) 사이 1.6, 전체 1.20(부산 기장군 외) ↔
 *   1.44(울산 울주군 외) 사이 1.3. 문턱 ±0.1 안에 든 단위는 실행할 때마다 출력해 다음 해 분포가 바뀌면 눈에 띄게 한다.
 *
 * 단위 짝: 경지면적 표는 시(구 행 없음)·군 행이 있고, 광역시는 군 행 + 'OO군외'(자치구 묶음) 행, 서울·대전은 시·도 행뿐이다.
 *   → 원천 행이 있는 시·군은 그 행, 나머지 자치구는 묶음(없으면 시·도 행) 하나로 판정하고 묶음 안 모든 단위에 같은 판정을 준다.
 *   시 아래 구는 부모 시 판정을 따른다(호출하는 쪽에서). 총조사 쪽 묶음 값 = 그 자치구들의 총조사 합.
 * 가드 — 하나라도 어긋나면 problems 에 담는다(호출하는 쪽이 아무것도 쓰지 않는다): 항목 이름·단위, 2025 행,
 *   계 = 논 + 밭, 시·도 = 그 아래 행 합, 전국 = 시·도 합, 이름 짝 0개·2개 이상, 묶음 행 누락.
 */

import { PROVINCES } from "../../src/lib/data/regions";

export const LAND_TABLE = { orgId: "101", tblId: "DT_1EB002", year: 2025 } as const;
export const RICE_SKEW_MAX = 1.6;
export const ALL_SKEW_MAX = 1.3;
const BORDER = 0.1;

const KOSIS_URL = "https://kosis.kr/openapi/Param/statisticsParameterData.do";
const LAND_ITEMS = { T10: "경지면적: 계", T20: "논", T30: "밭" } as const;

interface LandRow { C1: string; C1_NM: string; ITM_ID: string; ITM_NM: string; UNIT_NM: string; DT: string; PRD_DE: string }

export interface SkewJudgment {
  /** 판정한 원천 단위 이름(묶음이면 'OO군외'·시·도 이름) */
  landUnit: string;
  /** 총조사 벼 ÷ 실제 논 (논 0 이면 Infinity) */
  riceRatio: number;
  /** 총조사 37개 작물 ÷ 실제 경지 */
  allRatio: number;
  rice: boolean;
  all: boolean;
}

async function fetchLand(itmId: string, cache?: Record<string, unknown[]>): Promise<LandRow[]> {
  const ck = `${LAND_TABLE.tblId}/${itmId}`;
  if (cache?.[ck]) return cache[ck] as LandRow[];
  const key = (process.env.KOSIS_API_KEY ?? "").trim();
  if (!key) throw new Error("KOSIS_API_KEY 없음");
  const url = new URL(KOSIS_URL);
  for (const [k, v] of Object.entries({
    method: "getList", apiKey: key, itmId, objL1: "ALL", objL2: "", format: "json", jsonVD: "Y",
    prdSe: "Y", startPrdDe: String(LAND_TABLE.year), endPrdDe: String(LAND_TABLE.year), orgId: LAND_TABLE.orgId, tblId: LAND_TABLE.tblId,
  })) url.searchParams.set(k, v);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const json = (await res.json()) as LandRow[] | { err?: string };
      if (!Array.isArray(json)) throw new Error(`KOSIS ${ck}: ${JSON.stringify(json).slice(0, 100)}`);
      if (cache) cache[ck] = json;
      return json;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw lastErr;
}

/**
 * @param census 총조사 최상위 시·군·구 5자리 코드 → { name, rice(ha), all(ha) } (호출하는 쪽이 이미 읽은 37개 작물로 만든다)
 * @returns 총조사 5자리 코드 → 판정
 */
export async function judgeResidenceSkew(
  census: Map<string, { name: string; rice: number; all: number }>,
  cache?: Record<string, unknown[]>,
): Promise<{ byCode: Map<string, SkewJudgment>; problems: string[]; lines: string[] }> {
  const problems: string[] = [];
  const lines: string[] = [];
  /** 코드 → { name, 계, 논, 밭 } */
  const land = new Map<string, { name: string; total?: number; non: number; bat: number }>();
  for (const [itmId, itemName] of Object.entries(LAND_ITEMS)) {
    const rows = await fetchLand(itmId, cache);
    if (!rows.some((r) => r.PRD_DE === String(LAND_TABLE.year))) problems.push(`경지면적 ${itmId}: ${LAND_TABLE.year}년 행 없음`);
    for (const r of rows) {
      if (r.PRD_DE !== String(LAND_TABLE.year)) continue;
      if (r.ITM_NM !== itemName) { problems.push(`경지면적 ${itmId} 항목 ${r.ITM_NM} ≠ ${itemName}`); break; }
      if (r.UNIT_NM !== "헥타르") { problems.push(`경지면적 ${itmId} 단위 ${r.UNIT_NM}`); break; }
      let v = Number(r.DT);
      if (!Number.isFinite(v)) { problems.push(`경지면적 ${r.C1_NM} ${itmId} 값 ${r.DT}`); continue; }
      if (v < 0) {
        // 원천에 아주 작은 음수가 있다(2025 태백 논 −0.14) — 1ha 미만이면 0, 그 이상이면 멈춘다
        if (v < -1) problems.push(`경지면적 ${r.C1_NM} ${itmId} 음수 ${r.DT}`);
        v = 0;
      }
      const u = land.get(r.C1) ?? { name: r.C1_NM, non: 0, bat: 0 };
      if (itmId === "T10") u.total = v; else if (itmId === "T20") u.non = v; else u.bat = v;
      land.set(r.C1, u);
    }
  }
  // 계 = 논 + 밭 (원천은 행마다 소수 둘째 자리)
  for (const [c, u] of land) {
    if (u.total === undefined) { problems.push(`경지면적 ${u.name}(${c}) 계 행 없음`); continue; }
    if (Math.abs(u.total - u.non - u.bat) > 0.2) problems.push(`경지면적 ${u.name} 계 ${u.total} ≠ 논 ${u.non} + 밭 ${u.bat}`);
  }
  const sidoCodes = [...land.keys()].filter((c) => c.length === 2 && c !== "00");
  const want = new Set(PROVINCES.map((p) => p.sgisCode));
  if (sidoCodes.length !== want.size || sidoCodes.some((c) => !want.has(c))) problems.push(`경지면적 시·도 코드 ${sidoCodes.join(",")} ≠ PROVINCES`);
  const sum = (cs: string[], k: "total" | "non" | "bat") => cs.reduce((a, c) => a + (land.get(c)?.[k] ?? 0), 0);
  for (const k of ["total", "non", "bat"] as const) {
    const nat = land.get("00")?.[k] ?? NaN;
    const s = sum(sidoCodes, k);
    if (!(Math.abs(nat - s) <= nat * 0.001 + 1)) problems.push(`경지면적 전국 ${k} ${nat} ≠ 시·도 합 ${s.toFixed(1)}`);
    for (const sc of sidoCodes) {
      const subs = [...land.keys()].filter((c) => c.length === 5 && c.startsWith(sc));
      if (!subs.length) continue;
      const sv = land.get(sc)![k] ?? 0;
      const ss = sum(subs, k);
      if (!(Math.abs(sv - ss) <= sv * 0.001 + 1)) problems.push(`경지면적 ${land.get(sc)!.name} ${k} ${sv} ≠ 아래 합 ${ss.toFixed(1)}`);
    }
  }

  const byCode = new Map<string, SkewJudgment>();
  const judge = (landUnit: string, L: { non: number; bat: number }, rice: number, all: number): SkewJudgment => {
    const riceRatio = L.non > 0 ? rice / L.non : rice > 0 ? Infinity : 0;
    const totalLand = L.non + L.bat;
    const allRatio = totalLand > 0 ? all / totalLand : all > 0 ? Infinity : 0;
    const j = { landUnit, riceRatio, allRatio, rice: riceRatio > RICE_SKEW_MAX, all: allRatio > ALL_SKEW_MAX };
    if (Math.abs(riceRatio - RICE_SKEW_MAX) <= BORDER) lines.push(`  문턱 근처(벼) ${landUnit} ${riceRatio.toFixed(2)}`);
    if (Math.abs(allRatio - ALL_SKEW_MAX) <= BORDER) lines.push(`  문턱 근처(전체) ${landUnit} ${allRatio.toFixed(2)}`);
    return j;
  };
  for (const p of PROVINCES) {
    const tops = [...census.keys()].filter((c) => c.startsWith(p.sgisCode));
    const landSubs = [...land.keys()].filter((c) => c.length === 5 && c.startsWith(p.sgisCode));
    const own = new Set<string>();
    let aggRow: string | null = null;
    for (const lc of landSubs) {
      const nm = land.get(lc)!.name;
      if (nm.endsWith("외")) { if (aggRow) problems.push(`경지면적 ${p.shortName} 묶음 행 여럿`); aggRow = lc; continue; }
      const m = tops.filter((c) => census.get(c)!.name === nm);
      if (m.length !== 1) { problems.push(`경지면적 짝 없음/여럿: ${p.shortName} ${nm} (${m.length})`); continue; }
      own.add(m[0]);
      const cv = census.get(m[0])!;
      byCode.set(m[0], judge(nm, land.get(lc)!, cv.rice, cv.all));
    }
    const rest = tops.filter((c) => !own.has(c));
    if (!rest.length) { if (aggRow) problems.push(`경지면적 ${p.shortName} 묶음 행이 있는데 남은 단위 없음`); continue; }
    if (landSubs.length && !aggRow) { problems.push(`경지면적 ${p.shortName} 행 없는 단위: ${rest.map((c) => census.get(c)!.name).join(",")}`); continue; }
    const L = land.get(aggRow ?? p.sgisCode);
    if (!L) { problems.push(`경지면적 ${p.shortName} 시·도 행 없음`); continue; }
    const unitName = aggRow ? `${p.shortName} ${L.name}` : `${p.shortName} 전체`;
    const j = judge(unitName, L, rest.reduce((a, c) => a + census.get(c)!.rice, 0), rest.reduce((a, c) => a + census.get(c)!.all, 0));
    for (const c of rest) byCode.set(c, j);
  }
  const flagged = [...new Map([...byCode.values()].filter((j) => j.rice || j.all).map((j) => [j.landUnit, j])).values()]
    .sort((a, b) => b.allRatio - a.allRatio || b.riceRatio - a.riceRatio);
  const f = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : "∞");
  lines.unshift(
    `주소지 쏠림(경지면적 ${LAND_TABLE.tblId} ${LAND_TABLE.year}, 벼 > ${RICE_SKEW_MAX} · 전체 > ${ALL_SKEW_MAX}): ` +
      flagged.map((j) => `${j.landUnit} ${j.all ? "전체" : "벼"}(벼 ${f(j.riceRatio)}·전체 ${f(j.allRatio)})`).join(" · "),
  );
  return { byCode, problems, lines };
}
