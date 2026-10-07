/**
 * SGIS 통계지리정보서비스 API 유틸리티
 * - 시도별 / 시군구별 인구통계 데이터 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 * - SGIS API 장애 시 fallback 데이터 사용
 *
 * ⚠ 빌드 시 동시에 수백 개 요청이 발생하면 SGIS rate limit(HTTP 404)에 걸릴 수 있음.
 *   → generateStaticParams를 30개 이내로 제한하고, 나머지는 ISR on-demand로 처리.
 */

import { getPopulationFallback } from "@/lib/data/population";
import {
  getFarmFallback,
  getFarmsBySido,
  type FarmStat,
} from "@/lib/data/farms";
import { INTEGRATED_CITY_GU_CODES } from "@/lib/data/integrated-cities";
import {
  compositeRows,
  compositesInProvince,
  getSgisComposite,
  splitGuOf,
  type SgisComposite,
} from "@/lib/data/region-composites";
import {
  POPULATION_TREND_SIGUNGU,
  POPULATION_TREND_YEARS,
} from "@/lib/data/population-trend";
import { FETCH_TIMEOUT } from "./_build-phase";

/**
 * 시군구 인구 정적 폴백 인덱스 (POPULATION_TREND 최신 연도 = 2022).
 * SGIS 단건 호출이 -100 반환하는 통합시·일부 시군구를 위한 보호 장치.
 * 시도 폴백되기 전에 우선 사용 — 시도 인구가 시군구로 잘못 표시되는 사고 방지.
 */
const _SIGUNGU_FALLBACK_YEAR =
  POPULATION_TREND_YEARS[POPULATION_TREND_YEARS.length - 1];
const SIGUNGU_POP_STATIC_INDEX = new Map(
  POPULATION_TREND_SIGUNGU.filter(
    (p) => p.year === _SIGUNGU_FALLBACK_YEAR,
  ).map((p) => [p.sgisCode, p]),
);

function getSigunguStaticPop(sgisCode: string): PopulationData | null {
  const trend = SIGUNGU_POP_STATIC_INDEX.get(sgisCode);
  if (!trend) return null;
  return {
    regionCode: sgisCode,
    regionName: trend.name,
    population: trend.population,
    householdCount: trend.householdCount,
    agingRate: trend.agingRate,
  };
}

const AUTH_URL = "https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json";
const POPULATION_URL = "https://sgisapi.mods.go.kr/OpenAPI3/stats/population.json";
const FARM_URL = "https://sgisapi.mods.go.kr/OpenAPI3/stats/farmhousehold.json";

/**
 * SGIS 농림어업총조사 최신 기준연도.
 * 5년 주기(2000/2005/2010/2015/2020). 다음 갱신은 2025 조사 발표(~2026 말).
 * 새 연도가 추가되면 이 상수와 scripts/collect-farms.ts 의 YEAR 를 함께 변경.
 */
const FARM_YEAR = 2020;

export interface PopulationData {
  regionCode: string;
  regionName: string;
  population: number;
  householdCount: number;
  agingRate: number; // 65세 이상 비율
}

// --- 인증 ---

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/**
 * SGIS 인증 토큰 발급 (캐시 사용)
 */
async function getAccessToken(): Promise<string | null> {
  // 캐시된 토큰이 유효하면 재사용
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  const consumerKey = process.env.SGIS_KEY;
  const consumerSecret = process.env.SGIS_SECRET;

  if (!consumerKey || !consumerSecret) return null;

  const url = new URL(AUTH_URL);
  url.searchParams.set("consumer_key", consumerKey);
  url.searchParams.set("consumer_secret", consumerSecret);

  try {
    // revalidate: 3600 (1시간) — SGIS 토큰 유효기간(2시간)보다 짧게 설정
    const res = await fetch(url.toString(), { next: { revalidate: 3600 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    if (json.errCd !== 0 && json.errCd !== "0") {
      throw new Error(`SGIS auth error: ${json.errMsg || json.errCd}`);
    }

    const accessToken = json.result?.accessToken;
    if (!accessToken) throw new Error("No accessToken in response");

    // 토큰 유효시간: SGIS 기본 2시간, 안전하게 1시간 50분 캐시
    cachedToken = {
      accessToken,
      expiresAt: Date.now() + 110 * 60 * 1000,
    };

    return accessToken;
  } catch {
    cachedToken = null;
    return null;
  }
}

// --- 구 분할 시 매핑 ---
// SGIS는 구가 있는 시(성남시 등)의 시 통합코드를 인식하지 못한다.
// 시 코드로 조회하면 "검색결과가 존재하지 않습니다" 에러 발생.
// → 해당 시의 구 코드들을 명시적으로 매핑하여, 구별 데이터를 합산한다.
// SSOT: src/lib/data/integrated-cities.ts (인구·농가 양쪽에서 공유)
const GU_CODES_MAP = INTEGRATED_CITY_GU_CODES;

// --- 인구통계 조회 ---

interface SGISPopulationResult {
  adm_cd: string;
  adm_nm: string;
  tot_ppltn: string;       // 총 인구
  tot_family: string;      // 총 세대수
  avg_age?: string;
  // 부양비 (고령화율 역산용)
  oldage_suprt_per?: string; // 노인부양비: (65+) / (15~64) × 100
  juv_suprt_per?: string;    // 유소년부양비: (0~14) / (15~64) × 100
}

/**
 * SGIS API로 특정 지역(시도/시군구)의 인구 데이터를 조회한다.
 * admCd에 코드(2자리 시도 or 5자리 시군구)를 넣어 조회.
 */
async function fetchFromSGIS(
  accessToken: string,
  regionCode: string,
  year: number
): Promise<PopulationData | null> {
  const url = new URL(POPULATION_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("adm_cd", regionCode);
  url.searchParams.set("year", String(year));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    if (json.errCd !== 0 && json.errCd !== "0") {
      throw new Error(`SGIS stats error: ${json.errMsg || json.errCd}`);
    }

    const result = json.result;
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("No result from SGIS");
    }

    // SGIS 응답 구조에 따라 파싱
    const item: SGISPopulationResult = Array.isArray(result) ? result[0] : result;

    const population = parseInt(item.tot_ppltn, 10) || 0;
    const household = parseInt(item.tot_family, 10) || 0;

    // 고령화율(65+/전체) 계산:
    // SGIS population.json은 직접 제공하지 않으므로 부양비로 역산
    // oldage_suprt_per = (65+) / (15~64) × 100
    // juv_suprt_per = (0~14) / (15~64) × 100
    // → agingRate = oldage / (100 + oldage + juv) × 100
    const oldageDep = parseFloat(item.oldage_suprt_per || "0");
    const juvDep = parseFloat(item.juv_suprt_per || "0");
    const agingRate =
      oldageDep + juvDep > 0
        ? Math.round((oldageDep / (100 + oldageDep + juvDep)) * 1000) / 10
        : 0;

    return {
      regionCode,
      regionName: item.adm_nm || "",
      population,
      householdCount: household,
      agingRate,
    };
  } catch {
    return null;
  }
}

/**
 * SGIS API로 시군구 단위 인구 데이터를 조회한다.
 * 시군구 코드(5자리)를 admCd에 넣어 직접 조회한다.
 * API 실패 시 null을 반환한다 (상위 시/도 데이터로 폴백 처리는 호출자가 담당).
 *
 * ⚠ 빌드 시 SGIS rate limit으로 404가 발생할 수 있으나,
 *   ISR 런타임에서는 단일 요청이므로 정상 작동한다.
 */
export async function fetchSigunguPopulationData(
  sgisCode: string
): Promise<PopulationData | null> {
  // SGIS 통계는 보통 1~2년 지연 — 현재 연도 - 2를 안전한 최신으로 사용
  const year = new Date().getFullYear() - 2;
  const accessToken = await getAccessToken();

  // 토큰 발급 실패 → 정적 폴백 즉시 반환 (시도 폴백 안 거침)
  if (!accessToken) return getSigunguStaticPop(sgisCode);

  // 신설 구(인천 2026 개편 — SGIS 미등재): 옛 구·행정동 값을 더한다. 더할 수 없으면 같은 코드로 직접
  // (SGIS 가 새 구를 싣는 해부터는 직접 조회가 답한다), 그것도 없으면 정적 값
  const composite = getSgisComposite(sgisCode);
  if (composite) {
    const result =
      (await fetchCompositePopulation(accessToken, composite, year)) ??
      (await fetchFromSGIS(accessToken, sgisCode, year));
    return result ?? getSigunguStaticPop(sgisCode);
  }

  // 구 분할 시: 상위 시/도에서 low_search=1로 구 데이터를 받아 합산
  const guCodes = GU_CODES_MAP[sgisCode];
  if (guCodes) {
    const result = await fetchMultiGuPopulation(accessToken, sgisCode, guCodes, year);
    return result ?? getSigunguStaticPop(sgisCode);
  }

  // SGIS 단건 호출 실패 시 정적 폴백 (시도 폴백 안 거침 — 잘못된 인구 표시 방지)
  const result = await fetchFromSGIS(accessToken, sgisCode, year);
  return result ?? getSigunguStaticPop(sgisCode);
}

/**
 * SGIS 인구 통계 — admCd 바로 아래 단계 전부(시·도 → 시·군·구, 시·군·구 → 행정동). 실패면 null.
 */
async function fetchPopulationRows(
  accessToken: string,
  admCd: string,
  year: number,
): Promise<SGISPopulationResult[] | null> {
  const url = new URL(POPULATION_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("adm_cd", admCd);
  url.searchParams.set("year", String(year));
  url.searchParams.set("low_search", "1");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") {
      throw new Error(`SGIS error: ${json.errMsg || json.errCd}`);
    }

    const results = json.result as SGISPopulationResult[] | undefined;
    return Array.isArray(results) && results.length > 0 ? results : null;
  } catch {
    return null;
  }
}

/** 행 하나의 고령화율(65세 이상 / 전체, 0~1) — 부양비로 역산 */
function agingShareOf(item: SGISPopulationResult): number {
  const oldageDep = parseFloat(item.oldage_suprt_per || "0");
  const juvDep = parseFloat(item.juv_suprt_per || "0");
  return oldageDep + juvDep > 0 ? oldageDep / (100 + oldageDep + juvDep) : 0;
}

/**
 * 여러 행을 하나로 — 인구·세대는 합, 고령화율은 Σ(65세 이상) / Σ(인구).
 * 행마다 65세 이상 = 인구 × 그 행 고령화율이라, 인구로 가중한 고령화율 평균이 곧 정확한 합이다.
 */
function sumPopulationRows(
  rows: readonly SGISPopulationResult[],
  regionCode: string,
  regionName: string,
): PopulationData {
  let population = 0;
  let householdCount = 0;
  let elderly = 0;
  for (const item of rows) {
    const pop = parseInt(item.tot_ppltn, 10) || 0;
    population += pop;
    householdCount += parseInt(item.tot_family, 10) || 0;
    elderly += pop * agingShareOf(item);
  }
  return {
    regionCode,
    regionName,
    population,
    householdCount,
    agingRate: population > 0 ? Math.round((elderly / population) * 1000) / 10 : 0,
  };
}

/**
 * 구 분할 시(성남시 등)의 인구를 구별 데이터 합산으로 조회한다.
 * 상위 시/도 코드로 low_search=1 호출 → 해당 구 코드만 필터링 → 합산.
 * 구 하나라도 응답에 없으면 null — 덜 센 합을 숫자로 내보내지 않는다 (10/7).
 */
async function fetchMultiGuPopulation(
  accessToken: string,
  cityCode: string,
  guCodes: string[],
  year: number,
): Promise<PopulationData | null> {
  const results = await fetchPopulationRows(accessToken, cityCode.substring(0, 2), year); // "31020" → "31"
  if (!results) return null;

  const guSet = new Set(guCodes);
  const matched = results.filter((r) => guSet.has(r.adm_cd));
  if (matched.length !== guSet.size) return null;

  // 시 이름 추출: "성남시 수정구" → "성남시"
  const cityName = matched[0].adm_nm?.split(" ")[0] || "";
  return sumPopulationRows(matched, cityCode, cityName);
}

/**
 * 신설 구(SGIS 미등재)의 인구 — 통째로 들어온 옛 구 + 나뉜 옛 구의 해당 행정동을 더한다.
 * 필요한 행이 하나라도 없으면 null (region-composites.ts).
 */
async function fetchCompositePopulation(
  accessToken: string,
  composite: SgisComposite,
  year: number,
): Promise<PopulationData | null> {
  const splitGu = splitGuOf([composite]);
  const [guRows, ...dongLists] = await Promise.all([
    composite.wholeGu.length > 0
      ? fetchPopulationRows(accessToken, composite.sgisCode.substring(0, 2), year)
      : Promise.resolve([] as SGISPopulationResult[]),
    ...splitGu.map((gu) => fetchPopulationRows(accessToken, gu, year)),
  ]);
  if (!guRows || dongLists.some((d) => d === null)) return null;
  const dongRowsByGu = new Map(splitGu.map((gu, i) => [gu, dongLists[i] as SGISPopulationResult[]]));
  const rows = compositeRows(composite, guRows, dongRowsByGu);
  if (!rows) return null;
  return sumPopulationRows(rows, composite.sgisCode, composite.name);
}

/**
 * 신설 구의 연도별 인구 (/api/population-trend 용) — SGIS 는 지난 연도도 지금의 행정동 코드로
 * 돌려줘 같은 묶음으로 더할 수 있다. 합을 못 낸 해는 뺀다. 신설 구가 아니거나 인증 실패면 null.
 */
export async function fetchCompositePopulationTrend(
  sgisCode: string,
  years: readonly number[],
): Promise<{ year: number; population: number; householdCount: number; agingRate: number }[] | null> {
  const composite = getSgisComposite(sgisCode);
  if (!composite) return null;
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  const perYear = await Promise.all(
    years.map(async (year) => {
      const data =
        (await fetchCompositePopulation(accessToken, composite, year)) ??
        (await fetchFromSGIS(accessToken, sgisCode, year));
      return data
        ? { year, population: data.population, householdCount: data.householdCount, agingRate: data.agingRate }
        : null;
    }),
  );
  return perYear.filter((p): p is NonNullable<typeof p> => p !== null);
}

/**
 * 특정 시/도의 하위 시군구 인구 데이터를 한 번에 조회한다.
 * SGIS low_search=1 옵션으로 하위 행정구역 데이터를 일괄 반환받는다.
 * → 시/도 상세 페이지의 시군구 밀도 지도에 사용.
 *
 * @returns sgisCode → PopulationData 매핑 (실패 시 빈 객체)
 */
export async function fetchSubRegionPopulations(
  provinceSgisCode: string,
): Promise<Record<string, PopulationData>> {
  // 정적 폴백 미리 준비 — SGIS 실패해도 시·군·구 밀도 지도가 항상 채워지도록.
  // 5/10 추가: 경기 등 시·도 페이지에서 SGIS 응답 누락 시 지도가 회색이 되던 이슈.
  const fallbackMap: Record<string, PopulationData> = {};
  for (const [code, trend] of SIGUNGU_POP_STATIC_INDEX) {
    if (code.startsWith(provinceSgisCode)) {
      fallbackMap[code] = {
        regionCode: code,
        regionName: trend.name,
        population: trend.population,
        householdCount: trend.householdCount,
        agingRate: trend.agingRate,
      };
    }
  }

  // SGIS 통계는 보통 1~2년 지연 — 현재 연도 - 2를 안전한 최신으로 사용
  const year = new Date().getFullYear() - 2;
  const accessToken = await getAccessToken();
  if (!accessToken) return fallbackMap;

  const url = new URL(POPULATION_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("adm_cd", provinceSgisCode);
  url.searchParams.set("year", String(year));
  url.searchParams.set("low_search", "1"); // 하위 행정구역 일괄 조회

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") {
      throw new Error(`SGIS sub-region error: ${json.errMsg || json.errCd}`);
    }

    const results = json.result;
    if (!results || !Array.isArray(results)) return fallbackMap;

    // SGIS 응답을 fallbackMap 위에 덮어씌움 — 최신 데이터 우선, 누락 항목은 폴백 유지
    const map: Record<string, PopulationData> = { ...fallbackMap };
    for (const item of results as SGISPopulationResult[]) {
      const population = parseInt(item.tot_ppltn, 10) || 0;
      const household = parseInt(item.tot_family, 10) || 0;

      // 고령화율 역산: oldage / (100 + oldage + juv) × 100
      const oldageDep = parseFloat(item.oldage_suprt_per || "0");
      const juvDep = parseFloat(item.juv_suprt_per || "0");
      const agingRate =
        oldageDep + juvDep > 0
          ? Math.round((oldageDep / (100 + oldageDep + juvDep)) * 1000) / 10
          : 0;

      map[item.adm_cd] = {
        regionCode: item.adm_cd,
        regionName: item.adm_nm || "",
        population,
        householdCount: household,
        agingRate,
      };
    }

    // 신설 구(인천 2026 개편) — 나뉜 옛 구만 행정동으로 한 번 더 받아 더한다. 못 더하면 정적 값 유지
    const composites = compositesInProvince(provinceSgisCode);
    if (composites.length > 0) {
      const splitGu = splitGuOf(composites);
      const dongLists = await Promise.all(splitGu.map((gu) => fetchPopulationRows(accessToken, gu, year)));
      const dongRowsByGu = new Map<string, SGISPopulationResult[]>();
      splitGu.forEach((gu, i) => {
        const rows = dongLists[i];
        if (rows) dongRowsByGu.set(gu, rows);
      });
      for (const c of composites) {
        const rows = compositeRows(c, results as SGISPopulationResult[], dongRowsByGu);
        if (rows) map[c.sgisCode] = sumPopulationRows(rows, c.sgisCode, c.name);
      }
    }

    return map;
  } catch {
    return fallbackMap;
  }
}

/**
 * 여러 시도의 인구 데이터를 조회한다.
 * SGIS API가 실패하면 fallback 상수 데이터를 사용한다.
 */
export async function fetchPopulationData(
  regionCodes: string[]
): Promise<PopulationData[]> {
  // 중복 제거
  const uniqueCodes = [...new Set(regionCodes)];
  // SGIS 통계는 보통 1~2년 지연 — 현재 연도 - 2를 안전한 최신으로 사용
  const year = new Date().getFullYear() - 2;

  // SGIS 토큰 발급 시도
  const accessToken = await getAccessToken();

  const results: PopulationData[] = [];

  if (accessToken) {
    // SGIS API 병렬 호출
    const apiResults = await Promise.allSettled(
      uniqueCodes.map((code) => fetchFromSGIS(accessToken, code, year))
    );

    for (let i = 0; i < uniqueCodes.length; i++) {
      const result = apiResults[i];
      if (result.status === "fulfilled" && result.value) {
        results.push(result.value);
      } else {
        // 개별 실패 시 해당 지역만 fallback
        const fallback = getPopulationFallback(uniqueCodes[i]);
        if (fallback) {
          results.push({
            regionCode: fallback.sgisCode,
            regionName: fallback.name,
            population: fallback.population,
            householdCount: fallback.householdCount,
            agingRate: fallback.agingRate,
          });
        }
      }
    }
  } else {
    // 토큰 발급 자체가 실패하면 전체 fallback
    for (const code of uniqueCodes) {
      const fallback = getPopulationFallback(code);
      if (fallback) {
        results.push({
          regionCode: fallback.sgisCode,
          regionName: fallback.name,
          population: fallback.population,
          householdCount: fallback.householdCount,
          agingRate: fallback.agingRate,
        });
      }
    }
  }

  return results;
}

// ──────────────────────────────────────────────────────────────────────────
// 농가 통계 (SGIS farmhousehold.json — 농림어업총조사 5년 주기, 최신 2020)
// ──────────────────────────────────────────────────────────────────────────

/** 농가 단건/일괄 응답 데이터 */
export interface FarmHouseholdData {
  /** 행정코드 (SGIS, 시도 2자리 또는 시군구 5자리) */
  regionCode: string;
  /** 행정구역명 */
  regionName: string;
  /** 농가 수 (가구) */
  farmCount: number;
  /** 농가 인구 (명) */
  farmPopulation: number;
  /** 가구당 평균 농가 인구 */
  avgPopulation: number;
  /** 폴백 데이터 사용 여부 */
  isFallback?: boolean;
}

interface SGISFarmResult {
  adm_cd: string;
  adm_nm: string;
  farm_cnt: string;
  population: string;
  avg_population: string;
}

/**
 * 가구당 농가 인구 — 농가 인구 ÷ 농가 수. SGIS 의 avg_population 은 정수로 반올림돼 와(중구 2.34 → "2")
 * 시·도 평균(소수 한 자리)과 비교하면 크게 어긋났다(10/7). 항상 두 수로 다시 계산한다.
 */
function farmAvg(farmCount: number, farmPopulation: number): number {
  return farmCount > 0 ? Math.round((farmPopulation / farmCount) * 10) / 10 : 0;
}

/** 가구당 농가 인구가 시·도 평균보다 몇 % 많은가(음수 = 적음) — 반올림하기 전의 두 수로 계산한다 */
export function farmAvgDiffPct(
  farm: { farmCount: number; farmPopulation: number },
  sido: { farmCount: number; farmPopulation: number },
): number | null {
  if (farm.farmCount <= 0 || sido.farmCount <= 0 || farm.farmPopulation <= 0 || sido.farmPopulation <= 0) return null;
  const mine = farm.farmPopulation / farm.farmCount;
  const avg = sido.farmPopulation / sido.farmCount;
  return Math.round(((mine - avg) / avg) * 100);
}

/** SGIS 농가 행 하나 → 화면 데이터 */
function farmRowToData(item: SGISFarmResult): FarmHouseholdData {
  const farmCount = parseInt(item.farm_cnt, 10) || 0;
  const farmPopulation = parseInt(item.population, 10) || 0;
  return {
    regionCode: item.adm_cd,
    regionName: item.adm_nm || "",
    farmCount,
    farmPopulation,
    avgPopulation: farmAvg(farmCount, farmPopulation),
    isFallback: false,
  };
}

/** 여러 농가 행의 합 — 비공개(N/A) 값이 하나라도 있으면 합을 알 수 없어 null */
function sumFarmRows(
  rows: readonly SGISFarmResult[],
  regionCode: string,
  regionName: string,
): FarmHouseholdData | null {
  let farmCount = 0;
  let farmPopulation = 0;
  for (const r of rows) {
    const c = Number(r.farm_cnt);
    const p = Number(r.population);
    if (!Number.isFinite(c) || !Number.isFinite(p)) return null;
    farmCount += c;
    farmPopulation += p;
  }
  return { regionCode, regionName, farmCount, farmPopulation, avgPopulation: farmAvg(farmCount, farmPopulation), isFallback: false };
}

/** SGIS 농가 통계 — admCd 바로 아래 단계 전부. 실패면 null */
async function fetchFarmRows(accessToken: string, admCd: string, year: number): Promise<SGISFarmResult[] | null> {
  const url = new URL(FARM_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("year", String(year));
  url.searchParams.set("adm_cd", admCd);
  url.searchParams.set("low_search", "1");
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") throw new Error(`SGIS farm error: ${json.errMsg || json.errCd}`);
    const results = json.result as SGISFarmResult[] | undefined;
    return Array.isArray(results) && results.length > 0 ? results : null;
  } catch {
    return null;
  }
}

/** 신설 구의 농가 — 통째로 들어온 옛 구 + 나뉜 옛 구의 해당 행정동 */
async function fetchCompositeFarm(
  accessToken: string,
  composite: SgisComposite,
  year: number,
): Promise<FarmHouseholdData | null> {
  const splitGu = splitGuOf([composite]);
  const [guRows, ...dongLists] = await Promise.all([
    composite.wholeGu.length > 0
      ? fetchFarmRows(accessToken, composite.sgisCode.substring(0, 2), year)
      : Promise.resolve([] as SGISFarmResult[]),
    ...splitGu.map((gu) => fetchFarmRows(accessToken, gu, year)),
  ]);
  if (!guRows || dongLists.some((d) => d === null)) return null;
  const dongRowsByGu = new Map(splitGu.map((gu, i) => [gu, dongLists[i] as SGISFarmResult[]]));
  const rows = compositeRows(composite, guRows, dongRowsByGu);
  return rows ? sumFarmRows(rows, composite.sgisCode, composite.name) : null;
}

function farmStatToData(stat: FarmStat, isFallback = true): FarmHouseholdData {
  return {
    regionCode: stat.sgisCode,
    regionName: stat.name,
    farmCount: stat.farmCount,
    farmPopulation: stat.farmPopulation,
    avgPopulation: farmAvg(stat.farmCount, stat.farmPopulation),
    isFallback,
  };
}

/**
 * 시군구 단건 농가 데이터.
 * - 빌드 안정성을 위해 빌드 단계에서는 SGIS 호출 없이 정적 폴백만 사용.
 * - ISR on-demand(런타임) 단계에서는 API 호출 후 실패 시 폴백.
 *
 * @param sgisCode SGIS 5자리 시군구 코드
 * @param year 기본 2020 (5년 주기 농림어업총조사)
 */
export async function fetchFarmHousehold(
  sgisCode: string,
  year: number = FARM_YEAR,
): Promise<FarmHouseholdData | null> {
  // 빌드 단계: 정적 폴백만 사용 (Vercel 빌드 60s 한도 보호)
  if (process.env.NEXT_PHASE === "phase-production-build") {
    const fb = getFarmFallback(sgisCode);
    return fb ? farmStatToData(fb, true) : null;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    const fb = getFarmFallback(sgisCode);
    return fb ? farmStatToData(fb, true) : null;
  }

  // 신설 구(인천 2026 개편) — 행정동 값을 더한다. 비공개(N/A) 동이 있으면 합을 낼 수 없어 null
  // (2025 농림어업총조사가 SGIS 에 실리면 같은 코드 직접 조회로 넘어가도록 아래 단건 조회를 그대로 탄다)
  const composite = getSgisComposite(sgisCode);
  if (composite) {
    const summed = await fetchCompositeFarm(accessToken, composite, year);
    if (summed) return summed;
  }

  const url = new URL(FARM_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("year", String(year));
  url.searchParams.set("adm_cd", sgisCode);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") {
      throw new Error(`SGIS farm error: ${json.errMsg || json.errCd}`);
    }

    const result = json.result;
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("No result");
    }

    const item: SGISFarmResult = Array.isArray(result) ? result[0] : result;
    return farmRowToData(item);
  } catch {
    const fb = getFarmFallback(sgisCode);
    return fb ? farmStatToData(fb, true) : null;
  }
}

/**
 * 시도 하위 시군구 농가 데이터 일괄 조회 (low_search=1).
 * - 빌드 단계: 정적 폴백 사용.
 * - 런타임: API 호출 → 실패 시 정적 폴백.
 *
 * @param provinceSgisCode SGIS 시도 2자리 코드
 * @returns sigungu sgisCode → FarmHouseholdData 매핑
 */
export async function fetchSubRegionFarms(
  provinceSgisCode: string,
  year: number = FARM_YEAR,
): Promise<Record<string, FarmHouseholdData>> {
  // 빌드 단계: 정적 폴백만 — 한 번에 17개 시도가 빌드되면 SGIS 부하 큼
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return fallbackSubRegionFarms(provinceSgisCode);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return fallbackSubRegionFarms(provinceSgisCode);

  const url = new URL(FARM_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("year", String(year));
  url.searchParams.set("adm_cd", provinceSgisCode);
  url.searchParams.set("low_search", "1");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") {
      throw new Error(`SGIS sub farm error: ${json.errMsg || json.errCd}`);
    }

    const results = json.result as SGISFarmResult[] | undefined;
    if (!results || !Array.isArray(results)) {
      return fallbackSubRegionFarms(provinceSgisCode);
    }

    const apiMap: Record<string, FarmHouseholdData> = {};
    for (const item of results) {
      apiMap[item.adm_cd] = farmRowToData(item);
    }

    // 신설 구(인천 2026 개편) — 나뉜 옛 구만 행정동으로 받아 더한다
    const composites = compositesInProvince(provinceSgisCode);
    if (composites.length > 0) {
      const splitGu = splitGuOf(composites);
      const dongLists = await Promise.all(splitGu.map((gu) => fetchFarmRows(accessToken, gu, year)));
      const dongRowsByGu = new Map<string, SGISFarmResult[]>();
      splitGu.forEach((gu, i) => {
        const rows = dongLists[i];
        if (rows) dongRowsByGu.set(gu, rows);
      });
      for (const c of composites) {
        const rows = compositeRows(c, results, dongRowsByGu);
        const summed = rows ? sumFarmRows(rows, c.sgisCode, c.name) : null;
        if (summed) apiMap[c.sgisCode] = summed;
      }
    }

    // CLAUDE.md 데이터 병합 원칙: API 응답에 없는 항목은 정적 폴백 보충
    const fallbackMap = fallbackSubRegionFarms(provinceSgisCode);
    for (const [code, data] of Object.entries(fallbackMap)) {
      if (!apiMap[code]) apiMap[code] = data;
    }

    return apiMap;
  } catch {
    return fallbackSubRegionFarms(provinceSgisCode);
  }
}

function fallbackSubRegionFarms(
  provinceSgisCode: string,
): Record<string, FarmHouseholdData> {
  const map: Record<string, FarmHouseholdData> = {};
  for (const stat of getFarmsBySido(provinceSgisCode)) {
    map[stat.sgisCode] = farmStatToData(stat, true);
  }
  return map;
}
