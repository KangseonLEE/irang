/**
 * GET /api/return-farm-trend?regionCode=31070&years=10
 *
 * KOSIS에서 시군구별 귀농·귀촌 연도별 추이를 조회합니다.
 * - regionCode (필수): 시군구 행정코드 (5자리)
 * - years (선택): 조회할 연수 (기본 10, 최대 15)
 *
 * 반환: { data: ReturnFarmTrendItem[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchReturnFarmTrend } from "@/lib/api/kosis";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const regionCode = searchParams.get("regionCode");
  const years = Math.min(
    parseInt(searchParams.get("years") || "10", 10),
    15,
  );

  if (!regionCode || !/^\d{5}$/.test(regionCode)) {
    return NextResponse.json(
      { error: "regionCode must be a 5-digit code" },
      { status: 400 },
    );
  }

  if (isNaN(years) || years < 1) {
    return NextResponse.json(
      { error: "years must be a positive number" },
      { status: 400 },
    );
  }

  const data = await fetchReturnFarmTrend(regionCode, years);

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    },
  );
}
