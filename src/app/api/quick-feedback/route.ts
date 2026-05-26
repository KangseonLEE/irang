/**
 * POST /api/quick-feedback
 *
 * quick_feedback 테이블에 사용자 피드백을 기록합니다 (서버 사이드).
 * - 클라이언트에서 직접 Supabase INSERT 대신 이 Route Handler를 호출
 * - service_role key로 INSERT → RLS는 service_role만 통과 (anon 차단 유지)
 * - search-log와 동일 패턴 (5/4 hardening 누락분 보강)
 *
 * 입력 (JSON):
 * - rating: "good" | "neutral" | "bad" (선택, thumbs 사용 시 생략 가능)
 * - message: string (선택, 최대 300자)
 * - page: string (필수, 최대 500자)
 * - request_kind: "item" | "feature" | null (선택, 2026-05-15 Phase 3)
 * - item_category: string | null (선택, request_kind='item'일 때 8종 enum)
 * - thumbs: "up" | "down" | null (선택, 2026-05-16 Phase 6 B4)
 * - recommendation_id: string | null (선택, thumbs 사용 시 추천 대상 ID)
 * - persona: string | null (선택, 페르소나 5종 중 1)
 *
 * Rate limit: IP별 분당 10건
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, recordApiFallback } from "@/lib/supabase";

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
const VALID_THUMBS = new Set(["up", "down"]);
const VALID_PERSONAS = new Set([
  "family",
  "farmYouth",
  "elderRural",
  "commuter",
  "balanced",
]);
const MAX_RECOMMENDATION_ID_LENGTH = 100;
const MAX_PERSONA_LENGTH = 32;

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
    thumbs?: unknown;
    recommendation_id?: unknown;
    persona?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    rating,
    message,
    page,
    request_kind,
    item_category,
    thumbs,
    recommendation_id,
    persona,
  } = body;

  // thumbs 검증 (Phase 6 B4, 2026-05-16)
  const safeThumbs =
    typeof thumbs === "string" && VALID_THUMBS.has(thumbs) ? thumbs : null;

  // thumbs가 있으면 rating 생략 가능, 둘 다 없으면 거부
  if (!safeThumbs) {
    if (typeof rating !== "string" || !VALID_RATINGS.has(rating)) {
      return NextResponse.json(
        { error: "rating must be good|neutral|bad (or use thumbs)" },
        { status: 400 },
      );
    }
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

  // recommendation_id 검증 (thumbs 사용 시만 유의)
  const safeRecommendationId =
    safeThumbs && typeof recommendation_id === "string"
      ? recommendation_id.slice(0, MAX_RECOMMENDATION_ID_LENGTH)
      : null;

  // persona 검증 (5종 enum + 자유 확장 대비 32자 컷)
  let safePersona: string | null = null;
  if (typeof persona === "string") {
    if (VALID_PERSONAS.has(persona)) {
      safePersona = persona;
    } else {
      // enum 외 페르소나는 길이만 컷해 저장(추후 enum 확장 대응)
      safePersona = persona.slice(0, MAX_PERSONA_LENGTH);
    }
  }

  // thumbs 사용 시 rating은 NULL 저장 (CHECK 제약 없음) — 별 응답 row와 구분
  const safeRating =
    typeof rating === "string" && VALID_RATINGS.has(rating) ? rating : null;

  // Supabase service_role로 INSERT
  const sb = getSupabaseAdmin();
  if (!sb) {
    // Supabase 미설정 — 개발 환경 fallback (조용히 성공 처리)
    console.warn("[quick-feedback] Supabase admin not configured, skipping insert");
    await recordApiFallback({
      endpoint: "/api/quick-feedback",
      statusCode: 200,
      fallbackReason: "no-supabase",
      userAgent: request.headers.get("user-agent"),
      page: safePage,
      requestMeta: {
        thumbs: safeThumbs,
        request_kind: safeRequestKind,
        persona: safePersona,
      },
    });
    return NextResponse.json({ ok: true, skipped: "no-supabase" });
  }

  // 1차 시도: 신규 컬럼 모두 포함 INSERT (5/15 + 5/16)
  const fullPayload = {
    rating: safeRating,
    message: safeMessage,
    page: safePage,
    created_at: new Date().toISOString(),
    request_kind: safeRequestKind,
    item_category: safeItemCategory,
    thumbs: safeThumbs,
    recommendation_id: safeRecommendationId,
    persona: safePersona,
  };

  const { error } = await sb.from("quick_feedback").insert(fullPayload);

  if (error) {
    // 마이그레이션 미적용 환경: 신규 컬럼 부재 시 fallback
    // Supabase는 unknown column 시 PGRST204 또는 42703 코드 반환
    const msg = error.message ?? "";
    const isMissingColumn =
      msg.includes("request_kind") ||
      msg.includes("item_category") ||
      msg.includes("thumbs") ||
      msg.includes("recommendation_id") ||
      msg.includes("persona") ||
      msg.includes("column") ||
      (error as { code?: string }).code === "PGRST204" ||
      (error as { code?: string }).code === "42703";

    if (isMissingColumn) {
      console.warn(
        "[quick-feedback] new columns missing — fallback to legacy insert (rating only)",
      );
      // thumbs만 있고 rating은 NULL인 경우: legacy fallback 불가 (rating NOT NULL일 가능성)
      // 이 경우 silent fail 아닌 명시적 에러 반환
      if (!safeRating) {
        console.warn(
          "[quick-feedback] thumbs-only insert blocked by missing migration — apply 20260516_quick_feedback_thumbs.sql",
        );
        await recordApiFallback({
          endpoint: "/api/quick-feedback",
          statusCode: 202,
          fallbackReason: "migration-pending",
          userAgent: request.headers.get("user-agent"),
          page: safePage,
          requestMeta: {
            thumbs: safeThumbs,
            request_kind: safeRequestKind,
            persona: safePersona,
            missing_column_hint: error.message ?? null,
          },
        });
        return NextResponse.json(
          { ok: true, skipped: "migration-pending" },
          { status: 202 },
        );
      }
      const { error: fallbackError } = await sb.from("quick_feedback").insert({
        rating: safeRating,
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
      await recordApiFallback({
        endpoint: "/api/quick-feedback",
        statusCode: 200,
        fallbackReason: "legacy-columns-only",
        userAgent: request.headers.get("user-agent"),
        page: safePage,
        requestMeta: {
          thumbs: safeThumbs,
          request_kind: safeRequestKind,
          persona: safePersona,
          missing_column_hint: error.message ?? null,
        },
      });
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
