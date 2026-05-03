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
import { FETCH_TIMEOUT } from "./_build-phase";

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
  if (!accessToken) return null;

  // 구 분할 시: 상위 시/도에서 low_search=1로 구 데이터를 받아 합산
  const guCodes = GU_CODES_MAP[sgisCode];
  if (guCodes) {
    return fetchMultiGuPopulation(accessToken, sgisCode, guCodes, year);
  }

  return fetchFromSGIS(accessToken, sgisCode, year);
}

/**
 * 구 분할 시(성남시 등)의 인구를 구별 데이터 합산으로 조회한다.
 * 상위 시/도 코드로 low_search=1 호출 → 해당 구 코드만 필터링 → 합산.
 */
async function fetchMultiGuPopulation(
  accessToken: string,
  cityCode: string,
  guCodes: string[],
  year: number,
): Promise<PopulationData | null> {
  const provinceCode = cityCode.substring(0, 2); // "31020" → "31"

  const url = new URL(POPULATION_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("adm_cd", provinceCode);
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
    if (!results || !Array.isArray(results)) return null;

    const guSet = new Set(guCodes);
    const matched = results.filter((r) => guSet.has(r.adm_cd));
    if (matched.length === 0) return null;

    // 합산
    let totalPop = 0;
    let totalHousehold = 0;
    let weightedOldage = 0;
    let weightedJuv = 0;

    for (const item of matched) {
      const pop = parseInt(item.tot_ppltn, 10) || 0;
      totalPop += pop;
      totalHousehold += parseInt(item.tot_family, 10) || 0;

      // 가중 평균 부양비 (인구 비례)
      const oldageDep = parseFloat(item.oldage_suprt_per || "0");
      const juvDep = parseFloat(item.juv_suprt_per || "0");
      weightedOldage += oldageDep * pop;
      weightedJuv += juvDep * pop;
    }

    const avgOldage = totalPop > 0 ? weightedOldage / totalPop : 0;
    const avgJuv = totalPop > 0 ? weightedJuv / totalPop : 0;
    const agingRate =
      avgOldage + avgJuv > 0
        ? Math.round((avgOldage / (100 + avgOldage + avgJuv)) * 1000) / 10
        : 0;

    // 시 이름 추출: "성남시 수정구" → "성남시"
    const cityName = matched[0].adm_nm?.split(" ")[0] || "";

    return {
      regionCode: cityCode,
      regionName: cityName,
      population: totalPop,
      householdCount: totalHousehold,
      agingRate,
    };
  } catch {
    return null;
  }
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
  // SGIS 통계는 보통 1~2년 지연 — 현재 연도 - 2를 안전한 최신으로 사용
  const year = new Date().getFullYear() - 2;
  const accessToken = await getAccessToken();
  if (!accessToken) return {};

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
    if (!results || !Array.isArray(results)) return {};

    const map: Record<string, PopulationData> = {};
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

    return map;
  } catch {
    return {};
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

function farmStatToData(stat: FarmStat, isFallback = true): FarmHouseholdData {
  return {
    regionCode: stat.sgisCode,
    regionName: stat.name,
    farmCount: stat.farmCount,
    farmPopulation: stat.farmPopulation,
    avgPopulation: stat.avgPopulation,
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
    return {
      regionCode: item.adm_cd,
      regionName: item.adm_nm || "",
      farmCount: parseInt(item.farm_cnt, 10) || 0,
      farmPopulation: parseInt(item.population, 10) || 0,
      avgPopulation: parseFloat(item.avg_population) || 0,
      isFallback: false,
    };
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
      apiMap[item.adm_cd] = {
        regionCode: item.adm_cd,
        regionName: item.adm_nm || "",
        farmCount: parseInt(item.farm_cnt, 10) || 0,
        farmPopulation: parseInt(item.population, 10) || 0,
        avgPopulation: parseFloat(item.avg_population) || 0,
        isFallback: false,
      };
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

// ──────────────────────────────────────────────────────────────────────────
// 인구 추이 (5년치 시계열 — population.json 단건을 연도별로 호출)
// ──────────────────────────────────────────────────────────────────────────

/** 연도별 인구 데이터 한 점 */
export interface PopulationYearPoint {
  year: number;
  population: number;
  householdCount: number;
  agingRate: number;
}

/**
 * 특정 시군구(또는 시도)의 인구 시계열을 조회한다.
 * - SGIS API: stats/population.json (year별 단건 호출, Promise.allSettled 병렬)
 * - 빌드 단계: SGIS 호출 없이 정적 폴백만 사용 (Vercel 빌드 60s 한도 보호)
 * - 런타임: 5개 연도 병렬 호출 후 실패 점은 제외
 *
 * @param sgisCode SGIS 코드 (시도 2자리 또는 시군구 5자리)
 * @param years 조회 연도 배열 (예: [2018,2019,2020,2021,2022])
 */
export async function fetchPopulationTrend(
  sgisCode: string,
  years: number[],
): Promise<PopulationYearPoint[]> {
  // 빌드 단계: 정적 폴백만 — population-trend.ts 가 있으면 거기서 가져온다
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  // 구 분할 시(성남시 등): 상위 시도에서 low_search=1로 받아 해당 구만 합산 — 연도별로 반복
  const guCodes = GU_CODES_MAP[sgisCode];

  const settled = await Promise.allSettled(
    years.map(async (year) => {
      if (guCodes) {
        const data = await fetchMultiGuPopulation(
          accessToken,
          sgisCode,
          guCodes,
          year,
        );
        if (!data) return null;
        return {
          year,
          population: data.population,
          householdCount: data.householdCount,
          agingRate: data.agingRate,
        } satisfies PopulationYearPoint;
      }

      const data = await fetchFromSGIS(accessToken, sgisCode, year);
      if (!data) return null;
      return {
        year,
        population: data.population,
        householdCount: data.householdCount,
        agingRate: data.agingRate,
      } satisfies PopulationYearPoint;
    }),
  );

  const points: PopulationYearPoint[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value) points.push(r.value);
  }
  // 연도 오름차순 정렬
  points.sort((a, b) => a.year - b.year);
  return points;
}
