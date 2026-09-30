/**
 * Cloudflare Worker — Bot Detection (Sprint D D2 prod, 2026-05-19)
 *
 * 목적: CF edge cache HIT 응답이 middleware를 우회하는 한계(5/14 박제) 해결.
 * Worker는 cache lookup 이전 단계에서 실행되어 cache HIT/MISS 무관하게 검사.
 *
 * 검증 가능한 목표 (Sprint plan):
 *   - cache HIT 상태에서도 봇 차단
 *   - verify: curl -A "HeadlessChrome" -H "cf-ipcountry: US" https://irangfarm.com/
 *             응답 cf-cache-status: HIT 여도 403/503
 *
 * 정책 (middleware.ts 1)~1-1)과 동일 — 통합 일관성):
 *   1) AI 학습 봇 UA → 403 (즉시)
 *   2) Headless browser UA → 403 (즉시)
 *   3) cf-ipcountry !== KR 이고 verified bot 아님 + e2e UA 아님 + 지리 예외 경로 아님 → 503
 *   4) 그 외 → fetch(request) — origin/edge cache 정상 흐름
 *
 * 지리 예외 경로 (2026-09-30, middleware.ts 1-1) 과 동일):
 *   - /api/sentry-webhook — Sentry(미국 GCP 발신) 웹훅. HMAC 서명으로 자체 인증.
 *     9/30 실측: WAF 는 verified bot 으로 skip 했지만 이 Worker 가 503 을 내 브리지가
 *     7회 연속 실패했다(오리진 미도달 — CF httpRequests 에 originResponseStatus 0).
 *   - /.well-known/acme-challenge/ — Let's Encrypt HTTP-01 검증(해외 발신). 7/24 526 사고의
 *     경로가 Worker 계층에서도 막혀 있었다.
 *
 * 비고: CF Workers API는 .ts 자동 transpile X (5/19 D2 실 배포 함정 박제).
 *      TS 타입 어노테이션은 SyntaxError(10021). .js 순수 ESM 모듈로 작성.
 *      향후 esbuild 빌드 step 추가는 별도 sprint.
 *
 * 비용 (Workers Free 100k req/day):
 *   - 라이브 트래픽 일별 < 1k (5/14 이후 CF 차단 효과)
 *   - 봇 차단 후 정상 KR 사용자만 origin 도달 → Worker는 사실상 < 5k/day
 *   - 결론: Free plan 여유 큼
 */

const BLOCKED_BOT_PATTERNS = [
  /GPTBot/i, /ClaudeBot/i, /anthropic-ai/i, /Claude-Web/i, /Google-Extended/i,
  /CCBot/i, /Bytespider/i, /PerplexityBot/i, /Meta-ExternalAgent/i,
  /Applebot-Extended/i, /Diffbot/i, /Omgilibot/i, /Omgili/i, /ImagesiftBot/i,
  /cohere-ai/i, /Amazonbot/i, /DuckAssistBot/i, /FacebookBot/i,
];

const HEADLESS_BROWSER_PATTERNS = [
  /HeadlessChrome/i, /puppeteer/i, /playwright/i,
];

// PerplexityBot 은 학습용 BLOCKED 와 preview용 VERIFIED 양쪽 포함되지만
// BLOCKED 가 먼저 검사되므로 차단이 우선. SEO 영향 X (학습 봇 차단 정책).
const VERIFIED_BOT_PATTERNS = [
  /Googlebot/i, /AdsBot-Google/i, /Mediapartners-Google/i,
  /Bingbot/i, /BingPreview/i,
  /Twitterbot/i, /facebookexternalhit/i, /LinkedInBot/i, /Slackbot/i,
  /ChatGPT-User/i,
  /Yeti/i, /Daum/i, /NaverBot/i,
];

function isBlockedBot(ua) {
  if (!ua) return false;
  return BLOCKED_BOT_PATTERNS.some((re) => re.test(ua))
      || HEADLESS_BROWSER_PATTERNS.some((re) => re.test(ua));
}

function isVerifiedBot(ua) {
  if (!ua) return false;
  return VERIFIED_BOT_PATTERNS.some((re) => re.test(ua));
}

// 지리 차단(503) 예외 — 서버-서버 연동·인증서 검증은 방문자 지역과 무관하다
const GEO_EXEMPT_PATHS = new Set(["/api/sentry-webhook"]);
const GEO_EXEMPT_PREFIXES = ["/.well-known/acme-challenge/"];

function isGeoExemptPath(pathname) {
  return GEO_EXEMPT_PATHS.has(pathname)
      || GEO_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
}

function decide(req) {
  const ua = req.headers.get("user-agent") || "";
  const country = req.headers.get("cf-ipcountry") || "";
  const isE2eUa = ua.includes("irang-e2e/1.0");
  const pathname = new URL(req.url).pathname;

  if (isBlockedBot(ua)) return "block-403";
  if (country && country !== "KR" && !isVerifiedBot(ua) && !isE2eUa && !isGeoExemptPath(pathname)) {
    return "block-503";
  }
  return "allow";
}

function block403() {
  return new Response(null, {
    status: 403,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}

function block503() {
  return new Response(null, {
    status: 503,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "Retry-After": "3600",
    },
  });
}

export default {
  async fetch(request, env) {
    const decision = decide(request);
    if (decision === "block-403") return block403();
    if (decision === "block-503") return block503();
    return fetch(request);
  },
};

// Export for local sim testing (D1).
export const __test = { decide, isBlockedBot, isVerifiedBot, isGeoExemptPath };
