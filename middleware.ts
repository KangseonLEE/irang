/**
 * Next.js Middleware
 *
 * 1) AI 학습 크롤러 강제 차단 (403) — robots.txt를 무시하는 봇 대응
 * 2) /admin/* 인증 가드 — admin_token 쿠키 검증
 *
 * matcher 확장으로 정적 자산을 제외한 모든 요청에 적용.
 * 봇 차단이 우선이므로 _next/static, 이미지, favicon 등은 매처에서 제외해
 * middleware 호출 비용을 최소화한다.
 */

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/admin/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/api/auth"];

/**
 * AI 학습 크롤러 user-agent 패턴.
 * robots.txt에 차단된 명단과 동일하게 유지.
 * Googlebot/Bingbot 등 검색용 봇은 차단하지 않는다 (SEO 영향 X).
 */
const BLOCKED_BOT_PATTERNS = [
  /GPTBot/i,
  /ClaudeBot/i,
  /anthropic-ai/i,
  /Claude-Web/i,
  /Google-Extended/i,
  /CCBot/i,
  /Bytespider/i,
  /PerplexityBot/i,
  /Meta-ExternalAgent/i,
  /Applebot-Extended/i,
  /Diffbot/i,
  /Omgilibot/i,
  /Omgili/i,
  /ImagesiftBot/i,
  /cohere-ai/i,
  /Amazonbot/i,
  /DuckAssistBot/i,
  /FacebookBot/i,
];

function isBlockedBot(ua: string): boolean {
  if (!ua) return false;
  return BLOCKED_BOT_PATTERNS.some((re) => re.test(ua));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent") || "";

  // 1) AI 학습 크롤러 즉시 403 — 모든 경로
  if (isBlockedBot(ua)) {
    return new NextResponse(null, {
      status: 403,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
      },
    });
  }

  // 2) /admin/* 인증 가드
  if (pathname.startsWith("/admin")) {
    if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * 정적 자산 제외 (middleware 호출 비용 최소화):
   * - _next/static, _next/image: Next.js 빌드 자산
   * - favicon, icon, manifest, robots.txt, sitemap.xml
   * - 모든 이미지/폰트 확장자
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.json|robots\\.txt|sitemap|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf)).*)",
  ],
};
