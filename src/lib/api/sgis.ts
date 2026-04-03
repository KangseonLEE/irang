/**
 * SGIS 통계지리정보서비스 API 유틸리티
 * - 시도별 인구통계 데이터 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 * - SGIS API 장애 시 fallback 데이터 사용
 */

import { getPopulationFallback } from "@/lib/data/population";

const AUTH_URL = "https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json";
const POPULATION_URL = "https://sgisapi.mods.go.kr/OpenAPI3/stats/population.json";
const SEARCH_STATS_URL = "https://sgisapi.mods.go.kr/OpenAPI3/stats/searchStats.json";

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

  if (!consumerKey || !consumerSecret) {
    console.error("SGIS_KEY or SGIS_SECRET is not set");
    return null;
  }

  const url = new URL(AUTH_URL);
  url.searchParams.set("consumer_key", consumerKey);
  url.searchParams.set("consumer_secret", consumerSecret);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
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
  } catch (error) {
    console.error("Failed to get SGIS access token:", error);
    cachedToken = null;
    return null;
  }
}

// --- 인구통계 조회 ---

interface SGISPopulationResult {
  adm_cd: string;
  adm_nm: string;
  population: string;
  household: string;
  avg_age?: string;
  // 연령대별 인구
  population_0_14?: string;
  population_15_64?: string;
  population_65_over?: string;
}

/**
 * SGIS API로 시도별 인구 데이터를 조회한다.
 * API 장애 시 fallback 상수 데이터로 대체한다.
 */
async function fetchFromSGIS(
  accessToken: string,
  regionCode: string,
  year: number
): Promise<PopulationData | null> {
  // 인구 통계 조회 시도
  const url = new URL(SEARCH_STATS_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("admCd", regionCode);
  url.searchParams.set("year", String(year));
  url.searchParams.set("low_search", "0"); // 시도 단위

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
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

    const population = parseInt(item.population, 10) || 0;
    const household = parseInt(item.household, 10) || 0;
    const pop65Over = parseInt(item.population_65_over || "0", 10);
    const agingRate = population > 0 ? Math.round((pop65Over / population) * 1000) / 10 : 0;

    return {
      regionCode,
      regionName: item.adm_nm || "",
      population,
      householdCount: household,
      agingRate,
    };
  } catch (error) {
    console.error(`SGIS stats failed for region ${regionCode}:`, error);
    return null;
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
  const year = new Date().getFullYear();

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
