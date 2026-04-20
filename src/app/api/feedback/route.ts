/**
 * POST /api/feedback
 *
 * 사용자 피드백 수집.
 * 현재: 입력 검증 후 200 OK 반환, 서버 로그로만 기록.
 * Supabase user_feedback 테이블 연동 시 INSERT 추가 예정.
 */

import { NextRequest, NextResponse } from "next/server";

const MAX_COMMENT_LENGTH = 200;
const MAX_TAGS = 10;

export async function POST(request: NextRequest) {
  let body: {
    rating?: unknown;
    tags?: unknown;
    comment?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rating, tags, comment } = body;

  if (
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be 1-5" },
      { status: 400 }
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
