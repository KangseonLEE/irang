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

/**
 * Headless browser 자동화 도구 user-agent 패턴 (2026-05-14 추가).
 *
 * 배경: 5/14 GA에서 Cheyenne(미국 와이오밍 클라우드 데이터센터) 활성 사용자
 * 64명/30분 발견. CF Bot Fight Mode + ASN 6개 Block 룰을 통과한 잔존 봇.
 * CF Bot Fight는 JS challenge 기반이라 puppeteer/playwright의 headless
 * Chromium은 JS 실행으로 통과함. UA 단에서 추가 차단해야 함.
 *
 * 정상 사용자는 절대 이런 UA를 사용하지 않으므로 false positive 0.
 * SEO 영향 X (Googlebot 등 verified bot의 UA에는 포함 안 됨).
 */
const HEADLESS_BROWSER_PATTERNS = [
  /HeadlessChrome/i,
  /puppeteer/i,
  /playwright/i,
];

function isBlockedBot(ua: string): boolean {
  if (!ua) return false;
  if (BLOCKED_BOT_PATTERNS.some((re) => re.test(ua))) return true;
  if (HEADLESS_BROWSER_PATTERNS.some((re) => re.test(ua))) return true;
  return false;
}

/**
 * Non-KR geo 차단 + verified bot whitelist (2026-05-18 추가, B안 회장 결재).
 *
 * 배경: CF Order 3 ASN Block 룰(A안)이 cache hit 응답에는 미적용(5/14 박제).
 * 정적 페이지가 CF에 캐시되면 비 KR 봇이 통과 가능. middleware는 origin 단에서
 * 작동하므로 cache hit 우회를 막을 수 있다(defense in depth).
 *
 * 화이트리스트 정책:
 * - 한국 검색엔진 봇(Yeti/Daum)은 cf-ipcountry 무관 통과 — 해외 데이터센터 IP 사용 가능
 * - 글로벌 verified 검색·소셜 봇은 모든 country 통과 — SEO/preview 영향 X
 * - AhrefsBot/SemrushBot 등 SEO crawler는 화이트리스트 제외(차단 의도)
 *
 * 5/14 박제: GSC 12h 차단 사고 재발 방지. Googlebot/Bingbot UA는 반드시 통과.
 */
const VERIFIED_BOT_PATTERNS = [
  // Google
  /Googlebot/i,
  /AdsBot-Google/i,
  /Mediapartners-Google/i,
  // Microsoft / Bing
  /Bingbot/i,
  /BingPreview/i,
  // Social previews
  /Twitterbot/i,
  /facebookexternalhit/i,
  /LinkedInBot/i,
  /Slackbot/i,
  // AI assistants (preview/citation용 — 학습 봇과 별개 GPTBot/ClaudeBot은 위에서 이미 차단됨)
  /ChatGPT-User/i,
  /PerplexityBot/i,
  // Korean search engines (cf-ipcountry 무관 통과)
  /Yeti/i,
  /Daum/i,
  /NaverBot/i,
];

function isVerifiedBot(ua: string): boolean {
  if (!ua) return false;
  return VERIFIED_BOT_PATTERNS.some((re) => re.test(ua));
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

  // 1-1) Non-KR geo + non-verified bot 503 차단 (2026-05-18, B안 회장 결재).
  // CF cache HIT 응답에는 WAF 룰이 미적용(5/14 박제) → middleware에서 cache 이전
  // 단으로 한 번 더 차단. 한국 사용자(cf-ipcountry=KR)와 verified bot은 통과.
  // cf-ipcountry 헤더는 Cloudflare가 모든 요청에 자동 주입. 누락 시(로컬 dev 등)
  // 통과(undefined !== "KR" 조건이지만 verified bot whitelist에 의해 통과 시도).
  //
  // 5/11 박제 — middleware 응답 CF cache hold 사고 재발 방지: Cache-Control 헤더 필수.
  // 5/14 박제 — verified bot 차단 사고 재발 방지: Googlebot 등 whitelist 통과 보장.
  //
  // 2026-05-19 추가 (Sprint B D2): E2E 테스트 UA whitelist.
  // CF Order 2에서 GH Actions IP CIDR + irang-e2e/1.0 UA로 이중 검증 통과한 요청은
  // middleware에서도 통과시켜야 e2e 실패 안 함. CF는 KR 외 GH Actions runner IP
  // (대부분 미국 데이터센터)에서 호출되므로 cf-ipcountry !== KR에 걸려 503.
  // CF가 이미 IP+UA 이중 검증으로 통과시킨 신호이므로 middleware도 동일 신뢰.
  const country = request.headers.get("cf-ipcountry");
  const isE2eUa = ua.includes("irang-e2e/1.0");
  if (country && country !== "KR" && !isVerifiedBot(ua) && !isE2eUa) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
        "Retry-After": "3600",
      },
    });
  }

  // 1-2) Dynamic [id] route non-ASCII slug 즉시 404 (2026-05-21 Sentry Issue #49)
  // Next.js 16이 dynamic route 응답에 x-next-cache-tags 헤더를 자동 추가.
  // 한글 slug가 cache-tag 값에 포함되면 ISO-8859-1 위반으로 TypeError throw → 500 응답.
  // dynamicParams=false도 cache-tag 헤더 생성 이후 처리되므로 효과 없음.
  // middleware origin 단에서 즉시 404 반환해 Next.js 도달 자체 차단.
  const DYNAMIC_ID_ROUTES_RE = /^\/(crops|interviews|education|events|programs|regions)\//;
  if (DYNAMIC_ID_ROUTES_RE.test(pathname)) {
    let decodedPath = pathname;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      // malformed URI — also reject
      return new NextResponse(null, {
        status: 404,
        headers: {
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "private, no-store, max-age=0",
        },
      });
    }
    if (/[^\x00-\x7F]/.test(decodedPath)) {
      return new NextResponse(null, {
        status: 404,
        headers: {
          "X-Robots-Tag": "noindex, nofollow",
          "Cache-Control": "private, no-store, max-age=0",
        },
      });
    }
  }

  // 1-3) Secret fishing path 즉시 404 — Vercel Function 호출 차단 (2026-05-11)
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
    const { cleaned } = normalizeSearchParams(
      request.nextUrl.searchParams,
      options,
    );
    // pathname 자체가 trailing slash 포함이면 추가로 redirect (canonical 통일)
    const pathChanged = normalizedPath !== pathname;
    // 2026-05-11 site-wide 308 무한 redirect 사고 fix:
    // 빈 query에서도 normalize가 changed=true 반환하는 케이스가 있어 자기 자신으로 redirect 발생.
    // 안전 가드: cleaned가 원본과 실제로 다를 때만 redirect (toString 비교).
    const originalSearch = request.nextUrl.searchParams.toString();
    const cleanedSearch = cleaned.toString();
    const actuallyChanged = originalSearch !== cleanedSearch;
    if (actuallyChanged || pathChanged) {
      const url = request.nextUrl.clone();
      url.pathname = normalizedPath;
      url.search = cleanedSearch;
      const response = NextResponse.redirect(url, 308);
      // 2026-05-11 site-wide 308 사고 fix:
      // CF cache key가 path-only라 308 응답이 일반 GET에도 hit 되는 무한 redirect 사고.
      // 봇 abuse query에 대한 308 응답은 CF에 절대 캐시하지 않도록 강제.
      response.headers.set("Cache-Control", "private, no-store, max-age=0");
      return response;
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
