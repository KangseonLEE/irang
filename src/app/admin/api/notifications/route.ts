/**
 * GET /admin/api/notifications — 어드민 처리 대기 건수 (종 아이콘·탭 배지용, 2026-09-03)
 * 인증은 middleware 의 /admin/* 쿠키 가드가 담당. 캐시 금지 — 승인 직후 배지가 바로 줄어야 한다.
 */

import { NextResponse } from "next/server";
import { fetchAdminNotifications } from "@/lib/admin/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchAdminNotifications();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
