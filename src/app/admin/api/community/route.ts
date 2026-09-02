/**
 * PATCH /admin/api/community — 의견 상태 변경 (승인·반려·숨김·대기 복귀)
 * Body: { id: number, status: "pending" | "approved" | "rejected" | "hidden", reason?: string }
 * 인증은 middleware 의 /admin/* 쿠키 가드가 담당.
 */

import { NextRequest, NextResponse } from "next/server";
import { isNoteStatus } from "@/lib/community/types";
import { updateNoteStatus } from "@/lib/community/queries";

export async function PATCH(request: NextRequest) {
  let body: { id?: unknown; status?: unknown; reason?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status } = body;
  if (typeof id !== "number" || !Number.isInteger(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  if (!isNoteStatus(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const reason =
    typeof body.reason === "string" ? body.reason.trim().slice(0, 200) || null : undefined;

  const ok = await updateNoteStatus(id, status, status === "rejected" ? (reason ?? "admin") : reason);
  if (!ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
