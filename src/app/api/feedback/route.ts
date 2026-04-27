/**
 * POST /api/feedback
 *
 * 사용자 피드백 수집.
 * 두 가지 타입 지원:
 * 1. 기존 별점 피드백 (type 없음): rating(1-5), tags, comment
 * 2. 퀵 이모지 피드백 (type="quick"): rating(good|neutral|bad), message, page
 *
 * 현재: 입력 검증 후 200 OK 반환, 서버 로그로만 기록.
 * Supabase 연동 시 INSERT 추가 예정.
 */

import { NextRequest, NextResponse } from "next/server";

const MAX_COMMENT_LENGTH = 300;
const MAX_TAGS = 10;
const VALID_QUICK_RATINGS = new Set(["good", "neutral", "bad"]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 퀵 피드백 (인앱 위젯)
  if (body.type === "quick") {
    const { rating, message, page } = body;

    if (typeof rating !== "string" || !VALID_QUICK_RATINGS.has(rating)) {
      return NextResponse.json(
        { error: "rating must be good|neutral|bad" },
        { status: 400 },
      );
    }

    const safeMessage =
      typeof message === "string"
        ? message.slice(0, MAX_COMMENT_LENGTH)
        : "";

    const safePage =
      typeof page === "string" ? page.slice(0, 500) : "/";

    console.info("[feedback:quick]", {
      rating,
      messageLength: safeMessage.length,
      page: safePage,
    });

    return NextResponse.json({ ok: true });
  }

  // 기존 별점 피드백
  const { rating, tags, comment } = body;

  if (
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be 1-5" },
      { status: 400 },
    );
  }

  const safeTags = Array.isArray(tags)
    ? tags
        .filter((t): t is string => typeof t === "string")
        .slice(0, MAX_TAGS)
    : [];

  const safeComment =
    typeof comment === "string"
      ? comment.slice(0, MAX_COMMENT_LENGTH)
      : "";

  console.info("[feedback] received", {
    rating,
    tags: safeTags,
    commentLength: safeComment.length,
  });

  return NextResponse.json({ ok: true });
}
