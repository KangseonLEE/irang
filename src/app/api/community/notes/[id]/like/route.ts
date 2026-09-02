/**
 * POST /api/community/notes/[id]/like — 공감 (ip_hash 당 1회, 멱등)
 */

import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, hashIp, isE2eRequest } from "@/lib/community/ip-hash";
import { likeNote } from "@/lib/community/queries";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
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
    return NextResponse.json({ ok: true, skipped: "e2e", likeCount: 0 }, { status: 202, headers: NO_STORE });
  }
  const ip = clientIp(req);
  if (limiter.isLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate limited" }, { status: 429, headers: NO_STORE });
  }
  const result = await likeNote(noteId, hashIp(ip));
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 503, headers: NO_STORE });
  }
  return NextResponse.json({ ok: true, likeCount: result.data }, { headers: NO_STORE });
}
