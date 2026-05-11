/**
 * Next.js Middleware
 *
 * 1) AI 학습 크롤러 강제 차단 (403) — robots.txt를 무시하는 봇 대응
 * 2) list 페이지(/events 등) searchParams 정규화 — 봇 abuse query 308 redirect
 * 3) /admin/* 인증 가드 — admin_token 쿠키 검증
 *
 * matcher 확장으로 정적 자산을 제외한 모든 요청에 적용.
 * 봇 차단이 우선이므로 _next/static, 이미지, favicon 등은 매처에서 제외해
 * middleware 호출 비용을 최소화한다.
 *
 * 주의 (2026-05-06): Next.js 16의 Server Component `redirect()`는 HTTP 307이
 * 아니라 meta refresh 태그만 삽입함 → 봇은 무시. 따라서 봇 abuse 차단은
 * 반드시 middleware의 NextResponse.redirect()로 구현해야 효과 있음.
 *
 * 주의 (2026-05-10): Cloudflare가 `Vary: rsc` 헤더를 무시해 RSC variant 응답이
 * 일반 GET 응답으로 잘못 캐시되는 사고 발생(/programs 사례). RSC fetch에는
 * Cache-Control: private, no-store 강제로 Cloudflare 캐시를 원천 차단.
 */

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/admin/auth";
import {
  LIST_PAGE_NORMALIZE_OPTIONS,
  normalizeSearchParams,
} from "@/lib/search-params/normalize";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/api/auth"];

const NORMALIZE_PATHS = new Set(Object.keys(LIST_PAGE_NORMALIZE_OPTIONS));

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

/**
 * 봇 secret fishing path (2026-05-11 추가, B안 Hobby 유지 sprint).
 *
 * Cloudflare WAF가 1차 방어선이지만, middleware에서 한 번 더 차단해 Vercel
 * Function 호출을 0으로 만든다 (defense in depth). 정상 사용자는 절대
 * 이런 path를 요청하지 않으므로 false positive 위험 없음.
 *
 * 패턴은 일반적인 secret fishing/CMS abuse target. 매처가 정적 자산을 제외하므로
 * 여기 들어오면 그냥 404 응답 후 종료.
 */
const FISHING_PATH_PATTERNS = [
  /^\/\.env(?:\.|$)/i, // .env, .env.local, .env.production
  /^\/\.git\//i, // .git/config 등
  /^\/wp-admin\b/i,
  /^\/wp-login\.php/i,
  /^\/wp-config\.php/i,
  /^\/wp-content\b/i,
  /^\/wp-includes\b/i,
  /^\/xmlrpc\.php/i,
  /^\/phpmyadmin\b/i,
  /^\/phpinfo\.php/i,
  /^\/aws_credentials/i,
  /^\/\.aws\//i,
  /^\/\.ssh\//i,
  /^\/cgi-bin\//i,
  /^\/server-status\b/i,
  /^\/server-info\b/i,
  /^\/\.DS_Store$/i,
  /^\/web\.config$/i,
  /^\/credentials\.json$/i,
];

// .well-known/security.txt 는 정상 표준이므로 별도 화이트리스트
const FISHING_PATH_WHITELIST = [
  /^\/\.well-known\//i,
];

function isFishingPath(pathname: string): boolean {
  if (FISHING_PATH_WHITELIST.some((re) => re.test(pathname))) return false;
  return FISHING_PATH_PATTERNS.some((re) => re.test(pathname));
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

  // 1-2) Secret fishing path 즉시 404 — Vercel Function 호출 차단 (2026-05-11)
  // Cloudflare WAF 1차 방어선과 별개로 defense in depth.
  if (isFishingPath(pathname)) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  // 2) list 페이지 searchParams 정규화 — 알 수 없는 param/값은 cleaned URL로 308 redirect
  // 봇이 random query (?xyz=abc) 보내면 cache pollution + Vercel Function 호출 폭증.
  // canonical URL만 통과시켜 cache hit률↑, abuse 차단.
  // codex 권고 (5/7): trailing slash 정규화 — /programs/ 도 /programs와 동일 처리
  const normalizedPath = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  if (NORMALIZE_PATHS.has(normalizedPath)) {
    const options = LIST_PAGE_NORMALIZE_OPTIONS[normalizedPath];
    const { cleaned, changed } = normalizeSearchParams(
      request.nextUrl.searchParams,
      options,
    );
    // pathname 자체가 trailing slash 포함이면 추가로 redirect (canonical 통일)
    const pathChanged = normalizedPath !== pathname;
    if (changed || pathChanged) {
      const url = request.nextUrl.clone();
      url.pathname = normalizedPath;
      url.search = cleaned.toString();
      // 308 (permanent) — 봇이 다음에 같은 abuse URL 시도해도 즉시 cleaned로 매핑.
      // 캐시도 308 응답을 invalidate 권한으로 길게 유지.
      return NextResponse.redirect(url, 308);
    }
  }

  // 3) RSC variant 응답 캐시 차단 — Cloudflare가 vary: rsc를 무시해
  // RSC payload(text/x-component)가 일반 HTML 응답으로 잘못 캐시되는 사고 방지.
  // Next.js prefetch는 RSC 헤더 또는 Next-Router-Prefetch 헤더를 동반함.
  const isRscRequest =
    request.headers.get("rsc") === "1" ||
    request.headers.get("RSC") === "1" ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("Next-Router-Prefetch") ||
    request.headers.has("next-router-state-tree") ||
    request.headers.has("Next-Router-State-Tree");
  if (isRscRequest) {
    const res = NextResponse.next();
    // Cloudflare가 캐시하지 않도록 강제. 클라이언트(브라우저)도 캐시 안 함.
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
    res.headers.set("CDN-Cache-Control", "no-store");
    return res;
  }

  // 4) /admin/* 인증 가드
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
