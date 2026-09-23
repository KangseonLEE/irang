/**
 * POST /api/search-log
 *
 * 검색어를 search_logs 테이블에 기록합니다 (서버 사이드).
 * - 클라이언트에서 직접 Supabase INSERT 대신 이 Route Handler를 호출
 * - service_role key로 INSERT → anon INSERT RLS 제거 가능
 * - 간단한 IP 기반 레이트 리밋 (분당 30회)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, recordApiFallback } from "@/lib/supabase";
import { internalSkipReason } from "@/lib/internal-traffic";
import { isNaturalLanguageQuery, isMarkupOrSchemeQuery } from "@/lib/search-log-guard";

// ── 입력 검증 ──
const MAX_QUERY_LENGTH = 200;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULT_COUNT = 100_000;

// ── 간단한 인메모리 레이트 리밋 (IP별 분당 30회) ──
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // 만료된 엔트리는 조회 시 정리 (서버리스 환경에서 setInterval 대신 lazy cleanup)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // 0. 내부·테스트 트래픽 적재 차단 (2026-09-16)
  // 운영자 테스트 검색이 admin 인기 검색어·결과 없는 검색어 집계를 오염시킨다
  // (9/14 세션 48건이 30일 집계 1위). e2e·운영자 브라우저·로컬 dev 는 저장만 skip.
  const skip = internalSkipReason(request);
  if (skip) {
    return NextResponse.json({ ok: true, skipped: skip });
  }

  // IP 추출 (Vercel 환경: x-forwarded-for)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // 요청 본문 파싱
  let body: { query?: unknown; resultCount?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { query, resultCount } = body;

  // 입력 검증
  if (typeof query !== "string") {
    return NextResponse.json(
      { error: "query must be a string" },
      { status: 400 }
    );
  }

  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH || trimmed.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `query length must be ${MIN_QUERY_LENGTH}-${MAX_QUERY_LENGTH}` },
      { status: 400 }
    );
  }

  // 마크업·스킴·템플릿 문자열은 스캐너·실측 페이로드 — 인기 검색어 집계에서 제외 (2026-09-23)
  if (isMarkupOrSchemeQuery(trimmed)) {
    await recordApiFallback({
      endpoint: "/api/search-log",
      statusCode: 200,
      fallbackReason: "markup",
      userAgent: request.headers.get("user-agent"),
      page: null,
      requestMeta: { query_length: trimmed.length },
    });
    return NextResponse.json({ ok: true, skipped: "markup" });
  }

  // 자연어 형태는 통계로 의미 약함 — 조용히 성공 처리하고 INSERT 생략
  if (isNaturalLanguageQuery(trimmed)) {
    await recordApiFallback({
      endpoint: "/api/search-log",
      statusCode: 200,
      fallbackReason: "natural-language",
      userAgent: request.headers.get("user-agent"),
      page: null,
      requestMeta: { query_length: trimmed.length },
    });
    return NextResponse.json({ ok: true, skipped: "natural-language" });
  }

  const count =
    typeof resultCount === "number" && Number.isFinite(resultCount)
      ? Math.max(0, Math.min(resultCount, MAX_RESULT_COUNT))
      : 0;

  // Supabase 서비스 롤로 INSERT
  const sb = getSupabaseAdmin();
  if (!sb) {
    // Supabase 미설정 → 조용히 성공 처리 (로그만 남김)
    await recordApiFallback({
      endpoint: "/api/search-log",
      statusCode: 200,
      fallbackReason: "no-supabase",
      userAgent: request.headers.get("user-agent"),
      page: null,
      requestMeta: null,
    });
    return NextResponse.json({ ok: true, skipped: "no-supabase" });
  }

  const { error } = await sb
    .from("search_logs")
    .insert({ query: trimmed, result_count: count });

  if (error) {
    console.error("[search-log] insert failed:", error.message);
    return NextResponse.json(
      { error: "Failed to log search" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
