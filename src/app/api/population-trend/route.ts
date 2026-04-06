/**
 * GET /api/population-trend?sgisCode=31&years=10
 *
 * SGIS API에서 최근 N년간 인구 추이 데이터를 조회합니다.
 * - sgisCode (필수): SGIS 지역코드 (시도 2자리 또는 시군구 5자리)
 * - years (선택): 조회할 연수 (기본 10, 최대 15)
 *
 * 반환: { data: TrendItem[] }
 */

import { NextRequest, NextResponse } from "next/server";

interface TrendItem {
  year: number;
  population: number;
  householdCount: number;
  agingRate: number;
}

const AUTH_URL =
  "https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json";
const STATS_URL =
  "https://sgisapi.mods.go.kr/OpenAPI3/stats/searchStats.json";

async function getAccessToken(): Promise<string | null> {
  const consumerKey = process.env.SGIS_KEY;
  const consumerSecret = process.env.SGIS_SECRET;
  if (!consumerKey || !consumerSecret) return null;

  const url = new URL(AUTH_URL);
  url.searchParams.set("consumer_key", consumerKey);
  url.searchParams.set("consumer_secret", consumerSecret);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") throw new Error(json.errMsg);
    return json.result?.accessToken ?? null;
  } catch (error) {
    console.error("SGIS auth error:", error);
    return null;
  }
}

async function fetchYearData(
  accessToken: string,
  regionCode: string,
  year: number
): Promise<TrendItem | null> {
  const url = new URL(STATS_URL);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("admCd", regionCode);
  url.searchParams.set("year", String(year));
  url.searchParams.set("low_search", "0");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const json = await res.json();
    if (json.errCd !== 0 && json.errCd !== "0") return null;

    const item = Array.isArray(json.result) ? json.result[0] : json.result;
    if (!item) return null;

    const population = parseInt(item.population, 10) || 0;
    const household = parseInt(item.household, 10) || 0;
    const pop65Over = parseInt(item.population_65_over || "0", 10);
    const agingRate =
      population > 0
        ? Math.round((pop65Over / population) * 1000) / 10
        : 0;

    return { year, population, householdCount: household, agingRate };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sgisCode = searchParams.get("sgisCode");
  const yearsParam = Math.min(
    parseInt(searchParams.get("years") || "10", 10),
    15
  );

  if (!sgisCode) {
    return NextResponse.json(
      { error: "sgisCode is required" },
      { status: 400 }
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Failed to authenticate with SGIS" },
      { status: 502 }
    );
  }

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsParam + 1;
  const years = Array.from(
    { length: yearsParam },
    (_, i) => startYear + i
  );

  // 병렬 호출 (rate limit 고려하여 최대 10개)
  const results = await Promise.allSettled(
    years.map((year) => fetchYearData(accessToken, sgisCode, year))
  );

  const data: TrendItem[] = results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((v): v is TrendItem => v !== null)
    .sort((a, b) => a.year - b.year);

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    }
  );
}
