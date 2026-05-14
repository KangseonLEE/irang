import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 설정 — 회장 직접 검증 layer 자동화
 *
 * 기본 타겟은 prod (irangfarm.com). 로컬 검증 시:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
 *
 * CI에서는 GitHub Actions가 push 후 sleep 120s로 Vercel 배포 대기 → 동일 prod URL로 검증.
 */

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://irangfarm.com";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // 봇 차단 회피 — Cloudflare/middleware UA 차단 패턴 회피
    // CF Custom Rule "Allow irang E2E tests"가 토큰 "irang-e2e/1.0" 매칭으로 Skip 처리
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 irang-e2e/1.0",
    extraHTTPHeaders: {
      // E2E 식별용 헤더 — 운영 시 로그에서 식별 가능
      "x-irang-e2e": "playwright",
    },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        // devices["Desktop Chrome"] 의 default UA 가 spread 후 top-level use.userAgent 를
        // override 하므로 project 안에서도 명시적으로 재선언해 irang-e2e/1.0 토큰 보존.
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 irang-e2e/1.0",
      },
    },
    {
      // 회장 권고: 모바일 viewport 1개 추가. webkit 미설치 환경 호환을 위해
      // chromium 엔진에 iPhone 13 viewport·UA만 적용 (실제 webkit 렌더 차이 검증은
      // 향후 별도 워크플로에서). 핵심 목표는 모바일 사이즈에서 RSC payload / 빈 화면
      // / 9999 raw 같은 콘텐츠 회귀를 잡는 것.
      name: "chromium-mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 irang-e2e/1.0",
        isMobile: false, // Chromium engine doesn't support touch-with-mobile-ua emulation reliably here
        hasTouch: true,
      },
    },
  ],
});
