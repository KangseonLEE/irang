/**
 * POST /api/community/notes/[id]/report — 신고 (ip_hash 당 1회, 3건 누적 시 자동 숨김)
 * Body: { reason?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, hashIp, isE2eRequest } from "@/lib/community/ip-hash";
import { reportNote } from "@/lib/community/queries";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400, headers: NO_STORE });
  }
  if (isE2eRequest(req)) {
    return NextResponse.json({ ok: true, skipped: "e2e" }, { status: 202, headers: NO_STORE });
  }
  const ip = clientIp(req);
  if (limiter.isLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate limited" }, { status: 429, headers: NO_STORE });
  }
  let reason: string | null = null;
  try {
    const body = (await req.json()) as { reason?: unknown };
    if (typeof body.reason === "string") reason = body.reason.trim().slice(0, 200) || null;
  } catch {
    // body 없는 신고 허용
  }
  const result = await reportNote(noteId, hashIp(ip), reason);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 503, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true, reportCount: result.data }, { headers: NO_STORE });
}
