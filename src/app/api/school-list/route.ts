/**
 * GET /api/school-list?eduCode=J10&sigunguName=수원시
 *
 * 교육부 NEIS API에서 학교 리스트를 조회합니다.
 * - eduCode (필수): 시도교육청 코드
 * - sigunguName (선택): 시군구명 — 없으면 시도 전체
 * - page (선택): 페이지 번호 (기본 1)
 *
 * - Rate Limiting: IP 기반 분당 30건
 * 반환: { items: SchoolItem[], totalCount: number }
 */

import { NextRequest, NextResponse } from "next/server";

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

interface SchoolItem {
  name: string; // 학교명
  type: string; // 학교 종류 (초등학교, 중학교, 고등학교 등)
  address: string; // 주소
  foundType: string; // 설립 구분 (국립, 공립, 사립)
}

const API_BASE = "https://open.neis.go.kr/hub/schoolInfo";

/** 시도교육청 코드: 대문자 1자리 + 숫자 2자리 (예: J10) */
const VALID_EDU_CODE = /^[A-Z]\d{2}$/;
const VALID_PAGE_PATTERN = /^\d{1,3}$/;
/** 시군구명에 허용되지 않는 문자 차단 */
const VALID_SIGUNGU_NAME = /^[가-힣\s]{1,20}$/;

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
  const eduCode = searchParams.get("eduCode");
  const sigunguName = searchParams.get("sigunguName");
  const page = searchParams.get("page") || "1";

  if (!eduCode || !VALID_EDU_CODE.test(eduCode)) {
    return NextResponse.json(
      { error: "eduCode is required and must be a valid education office code" },
      { status: 400 }
    );
  }

  if (sigunguName && !VALID_SIGUNGU_NAME.test(sigunguName)) {
    return NextResponse.json(
      { error: "sigunguName must be a valid Korean district name" },
      { status: 400 }
    );
  }

  if (!VALID_PAGE_PATTERN.test(page)) {
    return NextResponse.json(
      { error: "page must be a number" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // NEIS LCTN_SC_NM은 시도 수준만 지원하므로,
    // 시군구 필터링은 전체 조회 후 주소(ORG_RDNMA) 기반으로 수행
    if (sigunguName) {
      // 1단계: 전체 건수 확인
      const countUrl = new URL(API_BASE);
      countUrl.searchParams.set("KEY", apiKey);
      countUrl.searchParams.set("Type", "json");
      countUrl.searchParams.set("pIndex", "1");
      countUrl.searchParams.set("pSize", "1");
      countUrl.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

      const countRes = await fetch(countUrl.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
      if (!countRes.ok) throw new Error(`HTTP ${countRes.status}`);
      const countJson = await countRes.json();

      if (countJson.RESULT) {
        if (countJson.RESULT.CODE === "INFO-200") {
          return NextResponse.json({ items: [], totalCount: 0 });
        }
        throw new Error(`NEIS error: ${countJson.RESULT.CODE}`);
      }

      const totalAll = countJson?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0;

      // 2단계: 전체 받아서 주소 필터링
      const fullUrl = new URL(API_BASE);
      fullUrl.searchParams.set("KEY", apiKey);
      fullUrl.searchParams.set("Type", "json");
      fullUrl.searchParams.set("pIndex", "1");
      fullUrl.searchParams.set("pSize", String(Math.min(totalAll, 1000)));
      fullUrl.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

      const fullRes = await fetch(fullUrl.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
      if (!fullRes.ok) throw new Error(`HTTP ${fullRes.status}`);
      const fullJson = await fullRes.json();

      if (fullJson.RESULT) {
        if (fullJson.RESULT.CODE === "INFO-200") {
          return NextResponse.json({ items: [], totalCount: 0 });
        }
        throw new Error(`NEIS error: ${fullJson.RESULT.CODE}`);
      }

      const allRows = fullJson?.schoolInfo?.[1]?.row ?? [];
      const filtered = allRows.filter(
        (item: Record<string, string>) =>
          (item.ORG_RDNMA || "").includes(sigunguName)
      );

      // 페이지네이션 적용
      const pageNum = parseInt(page, 10);
      const pageSize = 30;
      const start = (pageNum - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      const items: SchoolItem[] = paged.map(
        (item: Record<string, string>) => ({
          name: item.SCHUL_NM || "",
          type: item.SCHUL_KND_SC_NM || "",
          address: item.ORG_RDNMA || item.ORG_RDNDA || "",
          foundType: item.FOND_SC_NM || "",
        })
      );

      return NextResponse.json(
        { items, totalCount: filtered.length },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=3600",
          },
        }
      );
    }

    // 시군구 필터 없으면 시도 전체 조회
    const url = new URL(API_BASE);
    url.searchParams.set("KEY", apiKey);
    url.searchParams.set("Type", "json");
    url.searchParams.set("pIndex", page);
    url.searchParams.set("pSize", "30");
    url.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    // NEIS 에러 응답
    if (json.RESULT) {
      if (json.RESULT.CODE === "INFO-200") {
        return NextResponse.json({ items: [], totalCount: 0 });
      }
      throw new Error(`NEIS error: ${json.RESULT.CODE}`);
    }

    const schoolInfo = json?.schoolInfo;
    if (!schoolInfo || !Array.isArray(schoolInfo)) {
      throw new Error("Invalid response structure");
    }

    const totalCount = schoolInfo[0]?.head?.[0]?.list_total_count ?? 0;
    const rawItems = schoolInfo[1]?.row ?? [];

    const items: SchoolItem[] = rawItems.map(
      (item: Record<string, string>) => ({
        name: item.SCHUL_NM || "",
        type: item.SCHUL_KND_SC_NM || "",
        address: item.ORG_RDNMA || item.ORG_RDNDA || "",
        foundType: item.FOND_SC_NM || "",
      })
    );

    return NextResponse.json(
      { items, totalCount },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("School list API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school list" },
      { status: 502 }
    );
  }
}
