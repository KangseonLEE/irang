/**
 * POST /api/feedback
 *
 * 사용자 피드백 수집 스텁.
 *
 * TODO(data-engineer):
 *   - Supabase `user_feedback` 테이블 마이그레이션 후 INSERT 연동
 *   - 스키마 예시: id, rating (1-5), tags (text[]), comment (text <= 200),
 *     user_agent, ip_hash, created_at
 *   - chief-of-staff 승인 후 수동 apply 예정이므로 이번 PR에서는 stub만 유지
 *
 * 현재: 입력 최소 검증 후 200 OK 반환. 서버 로그로만 기록.
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

  // TODO: Supabase 연동 전까지 서버 콘솔로만 남김
  console.info("[feedback] received", {
    rating,
    tags: safeTags,
    commentLength: safeComment.length,
  });

  return NextResponse.json({ ok: true });
}
