/**
 * GET /api/population-trend?sgisCode=31&years=10
 *
 * SGIS API에서 최근 N년간 인구 추이 데이터를 조회합니다.
 * - sgisCode (필수): SGIS 지역코드 (시도 2자리 또는 시군구 5자리)
 * - years (선택): 조회할 연수 (기본 10, 최대 15)
 *
 * - Rate Limiting: IP 기반 분당 30건
 * 반환: { data: TrendItem[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";

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

/**
 * SGIS access token 모듈 레벨 캐시.
 * SGIS 토큰 유효시간은 보통 4시간 — 안전하게 1시간만 캐시.
 * 매 요청마다 auth 호출하면 rate limit / 일시 장애에 취약.
 */
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_CACHE_MS = 60 * 60 * 1000; // 1시간

async function getAccessToken(): Promise<string | null> {
  // 캐시된 토큰이 유효하면 재사용
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const consumerKey = process.env.SGIS_KEY;
  const consumerSecret = process.env.SGIS_SECRET;
  if (!consumerKey || !consumerSecret) return null;

  const url = new URL(AUTH_URL);
  url.searchParams.set("consumer_key", consumerKey);
  url.searchParams.set("consumer_secret", consumerSecret);

  // 1회 retry로 일시 장애 방어
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.errCd !== 0 && json.errCd !== "0") throw new Error(json.errMsg);
      const token = json.result?.accessToken ?? null;
      if (token) {
        cachedToken = { token, expiresAt: Date.now() + TOKEN_CACHE_MS };
        return token;
      }
      throw new Error("No token in response");
    } catch (error) {
      console.error(`SGIS auth error (attempt ${attempt + 1}):`, error);
      if (attempt === 1) return null;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return null;
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

  let data: TrendItem[] = results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((v): v is TrendItem => v !== null)
    .sort((a, b) => a.year - b.year);

  // ── 일반시 fallback: SGIS는 구가 있는 시(예: 성남시 31020)에 시 단위
  //   추이를 반환하지 않음. 빈 결과면 산하 구의 trend를 합산해 시 trend 생성.
  if (data.length === 0) {
    const parentSigungu = SIGUNGUS.find((s) => s.sgisCode === sgisCode);
    const childGus = parentSigungu
      ? GUS.filter((g) => g.parentSigunguId === parentSigungu.id)
      : [];
    if (childGus.length > 0) {
      const childResults = await Promise.allSettled(
        childGus.flatMap((gu) =>
          years.map((year) => fetchYearData(accessToken, gu.sgisCode, year)),
        ),
      );
      // year별로 그룹화 → 합산 (인구·세대 합, 고령화율은 인구 가중평균)
      const yearMap = new Map<number, TrendItem[]>();
      childResults.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          const v = r.value;
          if (!yearMap.has(v.year)) yearMap.set(v.year, []);
          yearMap.get(v.year)!.push(v);
        }
      });
      data = Array.from(yearMap.entries())
        .map(([year, items]) => {
          const population = items.reduce((s, i) => s + i.population, 0);
          const householdCount = items.reduce((s, i) => s + i.householdCount, 0);
          const agingRate = population > 0
            ? Math.round(
                (items.reduce((s, i) => s + i.agingRate * i.population, 0) /
                  population) * 10,
              ) / 10
            : 0;
          return { year, population, householdCount, agingRate };
        })
        .sort((a, b) => a.year - b.year);
    }
  }

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
