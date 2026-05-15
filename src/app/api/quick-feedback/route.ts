/**
 * POST /api/quick-feedback
 *
 * quick_feedback 테이블에 사용자 피드백을 기록합니다 (서버 사이드).
 * - 클라이언트에서 직접 Supabase INSERT 대신 이 Route Handler를 호출
 * - service_role key로 INSERT → RLS는 service_role만 통과 (anon 차단 유지)
 * - search-log와 동일 패턴 (5/4 hardening 누락분 보강)
 *
 * 입력 (JSON):
 * - rating: "good" | "neutral" | "bad" (필수)
 * - message: string (선택, 최대 300자)
 * - page: string (필수, 최대 500자)
 * - request_kind: "item" | "feature" | null (선택, 2026-05-15 Phase 3)
 * - item_category: string | null (선택, request_kind='item'일 때 8종 enum)
 *
 * Rate limit: IP별 분당 10건
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// ── 입력 검증 상수 ──
const MAX_MESSAGE_LENGTH = 300;
const MAX_PAGE_LENGTH = 500;
const VALID_RATINGS = new Set(["good", "neutral", "bad"]);
const VALID_REQUEST_KINDS = new Set(["item", "feature"]);
const VALID_ITEM_CATEGORIES = new Set([
  "crop",
  "glossary",
  "program",
  "region",
  "education",
  "event",
  "interview",
  "etc",
]);

// ── 인메모리 레이트 리밋 (Serverless 인스턴스 단위) ──
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // 만료된 엔트리는 조회 시 정리 (lazy cleanup, search-log와 동일 패턴)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // IP 추출
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // 본문 파싱
  let body: {
    rating?: unknown;
    message?: unknown;
    page?: unknown;
    request_kind?: unknown;
    item_category?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rating, message, page, request_kind, item_category } = body;

  // rating 검증
  if (typeof rating !== "string" || !VALID_RATINGS.has(rating)) {
    return NextResponse.json(
      { error: "rating must be good|neutral|bad" },
      { status: 400 },
    );
  }

  // page 검증 (필수)
  if (typeof page !== "string" || page.trim().length === 0) {
    return NextResponse.json(
      { error: "page must be a non-empty string" },
      { status: 400 },
    );
  }

  // message 검증 (선택)
  const safeMessage =
    typeof message === "string" && message.trim().length > 0
      ? message.slice(0, MAX_MESSAGE_LENGTH)
      : null;

  const safePage = page.slice(0, MAX_PAGE_LENGTH);

  // request_kind 검증 (2026-05-15 Phase 3, 선택)
  const safeRequestKind =
    typeof request_kind === "string" && VALID_REQUEST_KINDS.has(request_kind)
      ? request_kind
      : null;

  // item_category 검증 (request_kind='item'일 때만 유의)
  const safeItemCategory =
    safeRequestKind === "item" &&
    typeof item_category === "string" &&
    VALID_ITEM_CATEGORIES.has(item_category)
      ? item_category
      : null;

  // Supabase service_role로 INSERT
  const sb = getSupabaseAdmin();
  if (!sb) {
    // Supabase 미설정 — 개발 환경 fallback (조용히 성공 처리)
    console.warn("[quick-feedback] Supabase admin not configured, skipping insert");
    return NextResponse.json({ ok: true, skipped: "no-supabase" });
  }

  // 1차 시도: 신규 컬럼 포함 INSERT
  const fullPayload = {
    rating,
    message: safeMessage,
    page: safePage,
    created_at: new Date().toISOString(),
    request_kind: safeRequestKind,
    item_category: safeItemCategory,
  };

  const { error } = await sb.from("quick_feedback").insert(fullPayload);

  if (error) {
    // 마이그레이션 미적용 환경: request_kind/item_category 컬럼 부재 시 fallback
    // Supabase는 unknown column 시 PGRST204 또는 42703 코드 반환
    const msg = error.message ?? "";
    const isMissingColumn =
      msg.includes("request_kind") ||
      msg.includes("item_category") ||
      msg.includes("column") ||
      (error as { code?: string }).code === "PGRST204" ||
      (error as { code?: string }).code === "42703";

    if (isMissingColumn) {
      console.warn(
        "[quick-feedback] request_kind/item_category columns missing — fallback to legacy insert",
      );
      const { error: fallbackError } = await sb.from("quick_feedback").insert({
        rating,
        message: safeMessage,
        page: safePage,
        created_at: new Date().toISOString(),
      });
      if (fallbackError) {
        console.error(
          "[quick-feedback] fallback insert failed:",
          fallbackError.message,
        );
        return NextResponse.json(
          { error: "Failed to save feedback" },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, fallback: true });
    }

    console.error("[quick-feedback] insert failed:", error.message);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
