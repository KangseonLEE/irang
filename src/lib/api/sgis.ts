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

const AUTH_URL = "https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json";
const POPULATION_URL = "https://sgisapi.mods.go.kr/OpenAPI3/stats/population.json";

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
    const res = await fetch(url.toString(), { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) });
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
const GU_CODES_MAP: Record<string, string[]> = {
  "31010": ["31011", "31012", "31013", "31014"], // 수원시 (장안·권선·팔달·영통)
  "31020": ["31021", "31022", "31023"],           // 성남시 (수정·중원·분당)
  "31040": ["31041", "31042"],                    // 안양시 (만안·동안)
  "31050": ["31051", "31052", "31053"],           // 부천시 (원미·소사·오정)
  "31090": ["31091", "31092"],                    // 안산시 (상록·단원)
  "31100": ["31101", "31103", "31104"],           // 고양시 (덕양·일산동·일산서)
  "31190": ["31191", "31192", "31193"],           // 용인시 (처인·기흥·수지)
  "33010": ["33041", "33042", "33043", "33044"],  // 청주시 (상당·서원·흥덕·청원)
  "34010": ["34011", "34012"],                    // 천안시 (동남·서북)
  "35010": ["35011", "35012"],                    // 전주시 (완산·덕진)
  "37010": ["37011", "37012"],                    // 포항시 (남·북)
  "38010": ["38111", "38112", "38113", "38114", "38115"], // 창원시 (의창·성산·마산합포·마산회원·진해)
};

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
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
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
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
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
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
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
