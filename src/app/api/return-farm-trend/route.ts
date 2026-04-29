/**
 * GET /api/return-farm-trend?regionCode=31070&years=10
 *
 * KOSIS에서 시군구별 귀농·귀촌 연도별 추이를 조회합니다.
 * - regionCode (필수): 시군구 행정코드 (5자리)
 * - years (선택): 조회할 연수 (기본 10, 최대 15)
 *
 * - Rate Limiting: IP 기반 분당 30건
 * 반환: { data: ReturnFarmTrendItem[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchReturnFarmTrend } from "@/lib/api/kosis";

// ── Rate Limiter (인메모리, Serverless 인스턴스 단위) ──

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1분
const MAX_REQUESTS = 30; // 분당 30건

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

// 오래된 항목 주기적 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimit) {
    if (now > val.resetAt) rateLimit.delete(key);
  }
}, 60_000);

export async function GET(request: NextRequest) {
  // Rate Limit 체크
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

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
