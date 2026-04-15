/**
 * GET /api/assess/[id] — 진단 결과 조회
 *
 * - 공유 링크 랜딩 페이지에서 SSR 시 사용
 * - Public Read (RLS)
 * - 1시간 캐싱
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isValidResultId } from "@/lib/assess-result";

export async function GET(
  _req: NextRequest,
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

  // 2. Supabase 조회 (anon — Public Read 정책)
  const sb = getSupabase();
  if (!sb) {
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
