/**
 * GET /api/assess/[id] — 진단 결과 조회
 *
 * - 공유 링크 랜딩 페이지에서 SSR 시 사용
 * - service_role 로 조회 (2026-09-16): anon "Public Read" 정책은 id 필터를 강제할 수 없어
 *   테이블 전체가 공개 조회됐다(45행, answers·user_agent·referrer 포함). 읽기를 이 서버
 *   라우트로 모으고 anon 정책을 제거한다 — 공유 링크 동작은 그대로다.
 * - 1시간 캐싱
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, recordApiFallback } from "@/lib/supabase";
import { isValidResultId } from "@/lib/assess-result";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. ID 형식 검증
  if (!isValidResultId(id)) {
    return NextResponse.json(
      { error: "Invalid result ID" },
      { status: 400 }
    );
  }

  // 2. Supabase 조회 (service_role — anon 전체 공개를 막고 id 단건만 서버에서 내보낸다)
  const sb = getSupabaseAdmin();
  if (!sb) {
    await recordApiFallback({
      endpoint: "/api/assess/[id]",
      statusCode: 503,
      fallbackReason: "not-configured",
      userAgent: req.headers.get("user-agent"),
      page: null,
      requestMeta: { id },
    });
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await sb
    .from("assessment_results")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Result not found" },
      { status: 404 }
    );
  }

  // 3. 응답 + 캐싱 헤더
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
