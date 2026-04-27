/**
 * Next.js Middleware — 어드민 인증 가드
 *
 * /admin/* 경로 접근 시 admin_token 쿠키 검증.
 * 미인증 → /admin/login 리다이렉트.
 * 공개 경로: /admin/login, /admin/api/auth
 */

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/admin/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 어드민 경로는 통과
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 쿠키에서 토큰 확인
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token || !(await verifyToken(token))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
