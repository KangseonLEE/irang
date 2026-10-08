/**
 * 농가 통계 일괄 수집 — 2025 농림어업총조사 확정 결과 (2026-10-08 SGIS 2020 → KOSIS 2025).
 *
 * 원천: 국가데이터처 KOSIS 101/DT_1AG25104 「가구원수별 농가」(행정구역별) — T00 농가(가구)·T01 가구원 총수(= 농가 인구),
 *   특성 000(계), prdSe=F(Y 로 부르면 err 30). 2025-12-01 기준, 확정 공표 2026-09-29(잠정 2026-04-28).
 *   T01 의 메타 단위가 '가구'로 붙어 있지만 값은 사람 수다(확정 보도자료 표와 282/282 일치 — 10/8 조사).
 * 왜 바꿨나: SGIS farmhousehold 에는 2025 가 아직 없다(2015·2020 만). 2025 는 KOSIS 에만 있다.
 * 비교 유의: 2025 조사는 명부에 농지대장 등 행정자료를 더해(공표 일러두기 "전주기 대비 비교 시 이용에 유의")
 *   특히 도시 구의 농가가 크게 늘었다. 화면에 2020→2025 증감을 보이지 않는다.
 *
 * 짝 맞추기: 우리 단위(시·도·시·군·구·구, SGIS 코드 키) ↔ KOSIS 행을 시·도 코드 앞자리 안에서 **이름**으로 맞추고,
 *   구는 부모 시 코드(앞 4자리)로 한 번 더 좁힌다(청주 33010↔33040, 창원 38010↔38110 처럼 코드가 다른 통합시가 있다).
 *   - 통합시(INTEGRATED_CITY_GU_CODES)는 행을 쓰지 않는다 — farms.ts 가 구 행을 더해 만든다(원천에서 시 = 구 합 확인)
 *   - 행정동 묶음 신설 구(인천 2026·화성 2026 — region-composites)는 2025 표에 없다(조사 기준일 경계) → 행을 쓰지 않는다
 *     (인천 4구 카드는 숨고, 화성 4구는 화면이 '화성시 농가'로 시 범위를 밝힌다)
 * 가드 — 하나라도 어긋나면 아무것도 쓰지 않는다: 짝이 0개·2개 이상인 단위, 시·도 행 이름, 원천 안의 시·도 = 시·군·구 합,
 *   시 = 구 합, 우리가 쓴 단위 합 = 시·도(인천은 옛 중구·동구·서구 몫만큼 빈다 — 정확히 그만큼인지 확인)
 *
 * 실행: npx tsx scripts/collect-farms.ts   (.env.local 의 KOSIS_API_KEY, 키 값은 출력하지 않는다)
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });
import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { GUS } from "../src/lib/data/gus";
import { INTEGRATED_CITY_GU_CODES } from "../src/lib/data/integrated-cities";
import { getSgisComposite } from "../src/lib/data/region-composites";

const YEAR = 2025;
const KOSIS_URL = "https://kosis.kr/openapi/Param/statisticsParameterData.do";

/** KOSIS 2025 시·도 이름 ↔ PROVINCES.name(구표기 SSOT) */
const SIDO_NAME_ALIAS: Record<string, string> = { 강원도: "강원특별자치도", 전라북도: "전북특별자치도" };

/** 인천 2026-07-01 개편 전 구 — 2025 표에는 옛 구로만 있다(조사 기준일 2025-12-01). 우리 화면엔 이 구들이 없다 */
const INCHEON_PRE_REORG_GU = ["중구", "동구", "서구"];

interface KosisRow {
  C1: string;
  C1_NM: string;
  ITM_ID: string;
  DT: string;
}

interface KRow {
  code: string;
  name: string;
  farm: number;
  pop: number;
}

interface Out {
  sgisCode: string;
  name: string;
  farmCount: number;
  farmPopulation: number;
  avgPopulation: number;
}

const avgOf = (farm: number, pop: number) => (farm > 0 ? Math.round((pop / farm) * 10) / 10 : 0);

async function fetchKosis(): Promise<Map<string, KRow>> {
  const key = (process.env.KOSIS_API_KEY ?? "").trim();
  if (!key) throw new Error("KOSIS_API_KEY missing");
  const url = new URL(KOSIS_URL);
  const params: Record<string, string> = {
    method: "getList",
    apiKey: key,
    itmId: "T00+T01+",
    objL1: "ALL",
    objL2: "000",
    format: "json",
    jsonVD: "Y",
    prdSe: "F",
    startPrdDe: String(YEAR),
    endPrdDe: String(YEAR),
    orgId: "101",
    tblId: "DT_1AG25104",
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const json = (await res.json()) as KosisRow[] | { err?: string; errMsg?: string };
      if (!Array.isArray(json)) throw new Error(`KOSIS 오류: ${JSON.stringify(json).slice(0, 120)}`);
      const map = new Map<string, KRow>();
      for (const r of json) {
        const cur = map.get(r.C1) ?? { code: r.C1, name: r.C1_NM, farm: NaN, pop: NaN };
        const v = Number(r.DT);
        if (r.ITM_ID === "T00") cur.farm = v;
        if (r.ITM_ID === "T01") cur.pop = v;
        map.set(r.C1, cur);
      }
      return map;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

async function main() {
  const K = await fetchKosis();
  console.log(`[collect-farms] KOSIS DT_1AG25104 ${YEAR} — 지역 ${K.size}곳`);
  const problems: string[] = [];

  const sub5 = (sidoCode: string) =>
    [...K.values()].filter((k) => k.code.length === 5 && k.code.startsWith(sidoCode) && !/^\d{2}00[345]$/.test(k.code));
  const findK = (sidoCode: string, name: string, parentCode?: string): KRow | null => {
    let cands = sub5(sidoCode).filter((k) => k.name === name);
    if (parentCode) cands = cands.filter((k) => k.code !== parentCode && k.code.slice(0, 4) === parentCode.slice(0, 4));
    return cands.length === 1 ? cands[0] : null;
  };
  const isValid = (k: KRow) => Number.isFinite(k.farm) && Number.isFinite(k.pop);

  // ── 원천 안에서 먼저 맞춰 본다: 시·도 = 시·군·구 합, 시 = 구 합 ──
  for (const p of PROVINCES) {
    const sido = K.get(p.sgisCode);
    if (!sido || !isValid(sido) || (sido.name !== p.name && SIDO_NAME_ALIAS[p.name] !== sido.name)) {
      problems.push(`시·도 행 없음/이름 다름: ${p.sgisCode} ${p.name} ↔ ${sido?.name ?? "—"}`);
      continue;
    }
    const subs = sub5(p.sgisCode);
    const cityCodes = new Set(
      subs.filter((k) => k.code.endsWith("0") && subs.some((g) => g.code !== k.code && g.code.slice(0, 4) === k.code.slice(0, 4))).map((k) => k.code),
    );
    const top = subs.filter((k) => cityCodes.has(k.code) || ![...cityCodes].some((c) => c !== k.code && c.slice(0, 4) === k.code.slice(0, 4)));
    const tf = top.reduce((a, k) => a + k.farm, 0);
    const tp = top.reduce((a, k) => a + k.pop, 0);
    if (tf !== sido.farm || tp !== sido.pop) problems.push(`원천 시·도 합 차이 ${p.name}: ${sido.farm}/${sido.pop} vs ${tf}/${tp}`);
    for (const c of cityCodes) {
      const city = K.get(c)!;
      const gus = subs.filter((g) => g.code !== c && g.code.slice(0, 4) === c.slice(0, 4));
      const gf = gus.reduce((a, k) => a + k.farm, 0);
      const gp = gus.reduce((a, k) => a + k.pop, 0);
      if (gf !== city.farm || gp !== city.pop) problems.push(`원천 시 = 구 합 차이 ${city.name}: ${city.farm}/${city.pop} vs ${gf}/${gp}`);
    }
  }

  // ── 우리 단위 ↔ KOSIS 행 ──
  const provinceById = new Map(PROVINCES.map((p) => [p.id, p]));
  const sigunguRows: Out[] = [];
  const kCodeBySigunguId = new Map<string, string>();
  for (const sg of SIGUNGUS) {
    if (getSgisComposite(sg.sgisCode)) continue; // 인천 신설 4구 — 2025 표에 없음
    const p = provinceById.get(sg.sidoId)!;
    const k = findK(p.sgisCode, sg.name);
    if (!k || !isValid(k)) {
      problems.push(`시·군·구 짝 없음/여럿: ${sg.sgisCode} ${p.shortName} ${sg.name}`);
      continue;
    }
    kCodeBySigunguId.set(sg.id, k.code);
    if (INTEGRATED_CITY_GU_CODES[sg.sgisCode]) continue; // 통합시 — farms.ts 가 구 합으로 만든다
    sigunguRows.push({ sgisCode: sg.sgisCode, name: sg.name, farmCount: k.farm, farmPopulation: k.pop, avgPopulation: avgOf(k.farm, k.pop) });
  }
  const guRows: Out[] = [];
  for (const g of GUS) {
    if (getSgisComposite(g.sgisCode)) continue; // 화성 신설 4구 — 2025 표엔 화성시 하나
    const p = provinceById.get(g.sidoId)!;
    const parentCode = kCodeBySigunguId.get(g.parentSigunguId);
    const k = parentCode ? findK(p.sgisCode, g.name, parentCode) : null;
    if (!k || !isValid(k)) {
      problems.push(`구 짝 없음/여럿: ${g.sgisCode} ${p.shortName} ${g.name}`);
      continue;
    }
    guRows.push({ sgisCode: g.sgisCode, name: g.name, farmCount: k.farm, farmPopulation: k.pop, avgPopulation: avgOf(k.farm, k.pop) });
  }
  // 통합시 구 코드가 전부 행으로 들어왔는지(빠지면 farms.ts 가 그 시 합을 못 낸다)
  const guCodes = new Set(guRows.map((r) => r.sgisCode));
  for (const [city, codes] of Object.entries(INTEGRATED_CITY_GU_CODES)) {
    for (const c of codes) if (!guCodes.has(c)) problems.push(`통합시 ${city} 의 구 ${c} 행 없음`);
  }

  // ── 시·도 행 + 우리가 쓴 단위 합 = 시·도 ──
  const sidoRows: Out[] = [];
  for (const p of PROVINCES) {
    const sido = K.get(p.sgisCode);
    if (!sido || !isValid(sido)) continue;
    sidoRows.push({ sgisCode: p.sgisCode, name: p.shortName, farmCount: sido.farm, farmPopulation: sido.pop, avgPopulation: avgOf(sido.farm, sido.pop) });
    const mine = [...sigunguRows, ...guRows].filter((r) => r.sgisCode.startsWith(p.sgisCode));
    const mf = mine.reduce((a, r) => a + r.farmCount, 0);
    const mp = mine.reduce((a, r) => a + r.farmPopulation, 0);
    let ef = sido.farm;
    let ep = sido.pop;
    if (p.id === "incheon") {
      // 옛 중구·동구·서구 몫만큼 빈다 — 정확히 그만큼인지 본다
      for (const name of INCHEON_PRE_REORG_GU) {
        const old = findK(p.sgisCode, name);
        if (!old) {
          problems.push(`인천 옛 ${name} 행 없음`);
          continue;
        }
        ef -= old.farm;
        ep -= old.pop;
      }
    }
    if (mf !== ef || mp !== ep) problems.push(`우리 단위 합 ≠ 시·도 ${p.name}: ${mf}/${mp} vs 기대 ${ef}/${ep}`);
  }

  if (problems.length > 0) {
    console.error(`[collect-farms] 문제 ${problems.length}건 — 아무것도 쓰지 않아요`);
    problems.forEach((m) => console.error("  " + m));
    process.exit(1);
  }
  console.log(`[collect-farms] 시·도 ${sidoRows.length} · 시·군·구 ${sigunguRows.length} · 구 ${guRows.length} — 원천 합계 가드 통과`);

  const filePath = resolve(__dirname, "../src/lib/data/farms.ts");
  const body = `/**
 * 농가 통계 정적 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-farms.ts
 * 데이터 소스: 국가데이터처 KOSIS 101/DT_1AG25104 가구원수별 농가 — ${YEAR} 농림어업총조사 확정(2026-09-29 공표, 2025-12-01 기준)
 * 비교 유의: ${YEAR} 조사는 명부에 농지대장 등 행정자료를 더해 2020 값과 바로 비교하면 안 된다(공표 일러두기)
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-farms.ts\`
 *
 * 화면·순위가 같은 값을 쓰도록 실행 중 외부 호출 없이 이 값만 쓴다(lib/api/sgis.ts fetchFarmHousehold).
 * 행정동 묶음 신설 구(인천 2026·화성 2026)는 조사 기준일 경계라 표에 없어 행이 없다.
 */

import {
  INTEGRATED_CITY_GU_CODES,
  INTEGRATED_CITY_NAMES,
} from "./integrated-cities";

export interface FarmStat {
  /** 우리 단위 코드 (SGIS 체계 — 시도 2자리 또는 시군구·구 5자리) */
  sgisCode: string;
  /** 행정구역명 */
  name: string;
  /** 농가 수 (가구) */
  farmCount: number;
  /** 농가 인구 (명) */
  farmPopulation: number;
  /** 가구당 평균 농가 인구 (명) — 농가 인구 ÷ 농가 수, 소수 한 자리 */
  avgPopulation: number;
}

/** 시군구·구 농가 통계 */
export const FARM_FALLBACK_SIGUNGU: FarmStat[] = ${JSON.stringify([...sigunguRows, ...guRows], null, 2)};

/** 시도 농가 통계 (원천 시·도 행 그대로) */
const FARM_FALLBACK_SIDO: FarmStat[] = ${JSON.stringify(sidoRows, null, 2)};

/** 시군구 sgisCode → FarmStat 빠른 조회 */
const SIGUNGU_INDEX = new Map(FARM_FALLBACK_SIGUNGU.map((f) => [f.sgisCode, f]));

/** 시도 sgisCode → FarmStat 빠른 조회 */
const SIDO_INDEX = new Map(FARM_FALLBACK_SIDO.map((f) => [f.sgisCode, f]));

/**
 * 통합시(수원·성남·용인 등) 농가 통계를 구 데이터 합산으로 산출 — 원천에서 시 = 구 합을 확인하고 쓴다.
 * 구 하나라도 없으면 null — 덜 센 합을 숫자로 내보내지 않는다 (10/7).
 */
function aggregateIntegratedCity(sgisCode: string): FarmStat | null {
  const guCodes = INTEGRATED_CITY_GU_CODES[sgisCode];
  if (!guCodes) return null;

  let farmCount = 0;
  let farmPopulation = 0;

  for (const gu of guCodes) {
    const stat = SIGUNGU_INDEX.get(gu);
    if (!stat) return null;
    farmCount += stat.farmCount;
    farmPopulation += stat.farmPopulation;
  }

  if (farmCount === 0) return null;

  return {
    sgisCode,
    name: INTEGRATED_CITY_NAMES[sgisCode] ?? "",
    farmCount,
    farmPopulation,
    avgPopulation:
      Math.round((farmPopulation / farmCount) * 10) / 10, // 소수점 1자리
  };
}

/** 통합시 sgisCode → 합산 FarmStat 캐시 (모듈 로드 시 1회 계산) */
const INTEGRATED_CITY_INDEX: Map<string, FarmStat> = new Map(
  Object.keys(INTEGRATED_CITY_GU_CODES)
    .map((code) => [code, aggregateIntegratedCity(code)] as const)
    .filter((entry): entry is [string, FarmStat] => entry[1] !== null),
);

export function getFarmFallback(sgisCode: string): FarmStat | null {
  return (
    SIGUNGU_INDEX.get(sgisCode) ??
    INTEGRATED_CITY_INDEX.get(sgisCode) ??
    SIDO_INDEX.get(sgisCode) ??
    null
  );
}

/** 특정 시도(2자리) 하위 시군구 농가 통계 일괄 조회 */
export function getFarmsBySido(sidoSgisCode: string): FarmStat[] {
  // 일반 시군구 + 통합시 합산본 모두 포함 (시도 페이지 카드/지도용)
  const direct = FARM_FALLBACK_SIGUNGU.filter((f) =>
    f.sgisCode.startsWith(sidoSgisCode),
  );
  const integrated = Array.from(INTEGRATED_CITY_INDEX.values()).filter((f) =>
    f.sgisCode.startsWith(sidoSgisCode),
  );
  return [...direct, ...integrated];
}
`;

  writeFileSync(filePath, body, "utf-8");
  console.log(`[collect-farms] wrote ${filePath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
