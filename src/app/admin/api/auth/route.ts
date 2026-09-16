/**
 * POST /admin/api/auth — 로그인
 * DELETE /admin/api/auth — 로그아웃
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createToken,
  buildCookieHeader,
  buildLogoutCookieHeader,
} from "@/lib/admin/auth";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * 로그인 시도 제한 (2026-09-16 보안 점검).
 *
 * 관리자 인증은 공유 비밀번호 하나뿐인데 시도 횟수 제한이 없었다. CF 의 KR 외 차단이
 * 1차 방어이긴 하나 국내에서는 무제한 대입이 가능했다. 인스턴스 단위 인메모리라
 * 완벽한 차단은 아니지만, 자동화 대입의 속도를 실용적으로 꺾는다.
 *
 * 성공 시에도 카운터는 유지한다 — 정상 운영자가 10분에 5회를 넘길 일은 없고,
 * 리셋 로직을 두면 그 경로 자체가 또 하나의 우회 표면이 된다.
 * 오타로 잠기면 10분 뒤 풀린다.
 */
const loginLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 5 });

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  if (loginLimiter.isLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "시도가 너무 많아요. 잠시 후 다시 해주세요" },
      { status: 429, headers: { "Retry-After": "600", "Cache-Control": "private, no-store" } },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { password } = body;
  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "비밀번호를 입력해 주세요" },
      { status: 400 },
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않아요" },
      { status: 401 },
    );
  }

  const token = await createToken();
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildCookieHeader(token));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", buildLogoutCookieHeader());
  return res;
}
