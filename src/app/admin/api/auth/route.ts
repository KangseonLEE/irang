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

export async function POST(request: NextRequest) {
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
