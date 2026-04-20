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
  "https://sgisapi.mods.go.kr/OpenAPI3/stats/population.json";

/**
 * 통계 데이터 최신 가용 연도.
 * SGIS 통계는 보통 1~2년 지연 — 현재 연도 - 2를 안전한 최신으로 사용.
 */
function getLatestAvailableYear(): number {
  return new Date().getFullYear() - 2; // 2026 → 2024
}

async function getAccessToken(): Promise<string | null> {
  const consumerKey = process.env.SGIS_KEY;
  const consumerSecret = process.env.SGIS_SECRET;
  if (!consumerKey || !consumerSecret) return null;

  const url = new URL(AUTH_URL);
  url.searchParams.set("consumer_key", consumerKey);
  url.searchParams.set("consumer_secret", consumerSecret);

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });
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
  url.searchParams.set("adm_cd", regionCode);
  url.searchParams.set("year", String(year));

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const json = await res.json();
    // SGIS 에러 응답
    if (json.errCd && json.errCd !== 0 && json.errCd !== "0") return null;

    const item = Array.isArray(json.result) ? json.result[0] : json.result;
    if (!item) return null;

    const population = parseInt(item.tot_ppltn, 10) || 0;
    const householdCount = parseInt(item.tot_family, 10) || 0;

    // 고령화율(65+/전체) 계산:
    // SGIS는 직접 제공하지 않으므로 노인부양비 + 유소년부양비로 역산
    // oldage_suprt_per = (65+) / (15~64) × 100
    // juv_suprt_per = (0~14) / (15~64) × 100
    // → agingRate = oldage / (100 + oldage + juv) × 100
    const oldageDep = parseFloat(item.oldage_suprt_per) || 0;
    const juvDep = parseFloat(item.juv_suprt_per) || 0;
    const agingRate =
      oldageDep + juvDep > 0
        ? Math.round((oldageDep / (100 + oldageDep + juvDep)) * 1000) / 10
        : 0;

    return { year, population, householdCount, agingRate };
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

  // sgisCode: 시도 2자리 또는 시군구 5자리 숫자만 허용
  if (!sgisCode || !/^\d{2,5}$/.test(sgisCode)) {
    return NextResponse.json(
      { error: "sgisCode is required and must be a 2-5 digit code" },
      { status: 400 }
    );
  }

  if (isNaN(yearsParam) || yearsParam < 1) {
    return NextResponse.json(
      { error: "years must be a positive number" },
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

  const latestYear = getLatestAvailableYear();
  const startYear = latestYear - yearsParam + 1;
  const years = Array.from(
    { length: yearsParam },
    (_, i) => startYear + i
  );

  // 병렬 호출
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
