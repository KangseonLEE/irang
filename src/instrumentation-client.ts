/**
 * Sentry 클라이언트 설정 (Next.js `instrumentation-client` 파일 컨벤션)
 *
 * 브라우저에서 발생하는 에러를 Sentry로 전송합니다.
 * 앱이 인터랙티브해지기 전에 Next 가 이 파일을 직접 실행한다.
 *
 * ⚠️ 2026-09-30: 이 파일은 `sentry.client.config.ts` 였고 **Next 16 은 그 파일을 로드하지 않는다**.
 * 실측(`window.__SENTRY__["10.73.0"]`)에 client 가 없어 `Sentry.init` 이 아예 실행되지 않았고,
 * 그래서 `PageError` 의 `captureException` 을 포함한 **브라우저 오류가 Sentry 에 한 건도 올라가지
 * 않았다**(서버 측 `src/instrumentation.ts` 경로만 동작). 파일 위치를 Next 16 컨벤션
 * (루트 또는 `src/`)으로 옮겨 초기화를 되살렸다.
 *
 * @see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.md
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

/**
 * 사이트에서 온 사람 트래픽일 때만 Sentry 를 켠다 (9/19 GA 게이트와 같은 원칙).
 *
 * 이 초기화가 되살아나면서 처음으로 브라우저 이벤트가 실제로 올라가므로, GA 가 겪었던 두 구멍을
 * 같은 자리에서 미리 막는다:
 *   - **호스트**: `NODE_ENV=production` 은 로컬 `next start`·Vercel 미리보기 alias 에서도 참이다.
 *     9/17 에 GA 활성 86명 중 70명이 localhost 실측이었던 것과 같은 경로로 Sentry 이슈가 오염된다.
 *   - **자동화**: Playwright·e2e 가 낸 오류까지 이슈로 쌓이면 진짜 신호를 가린다.
 *
 * 운영자 표식(`irang-internal`)은 **일부러 제외하지 않는다** — 회장이 라이브에서 만난 오류는
 * 집계 잡음이 아니라 우리가 가장 먼저 봐야 할 신호다(GA·DB 게이트와 다른 점).
 */
function isReportableClient(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host !== "irangfarm.com" && host !== "www.irangfarm.com") return false;
  const nav = navigator as Navigator & { webdriver?: boolean };
  if (nav.webdriver === true) return false;
  if ((nav.userAgent || "").includes("irang-e2e")) return false;
  return true;
}

const REPORTABLE = isReportableClient();

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 구분
  environment: process.env.NODE_ENV,

  // Sentry SDK 내부 에러 및 노이즈 필터링
  beforeSend(event) {
    const frames = event.exception?.values?.[0]?.stacktrace?.frames;
    if (frames?.some((f) => f.filename?.includes("sentry/scripts"))) {
      return null; // Sentry 자체 스크립트 에러 무시
    }
    // 브라우저 확장 프로그램에서 발생하는 에러 무시
    if (frames?.some((f) => f.filename?.startsWith("chrome-extension://"))) {
      return null;
    }
    return event;
  },

  // 에러 샘플링 비율 (1.0 = 100% — Free 플랜 5K 이벤트/월 기준)
  sampleRate: 1.0,

  // Performance 모니터링 (성능 트레이싱)
  // Free 플랜 한도를 고려하여 10%만 샘플링
  tracesSampleRate: REPORTABLE ? 0.1 : 0,

  // 로컬·미리보기·자동화에서는 전송하지 않는다 (위 isReportableClient 참고)
  enabled: REPORTABLE,

  // 디버그 로그 (개발 시에만)
  debug: false,

  // 세션 리플레이 (Free 플랜 한도 고려하여 비활성화)
  // 필요 시 replaysSessionSampleRate / replaysOnErrorSampleRate 설정
  integrations: [
    Sentry.replayIntegration({
      // 에러 발생 시에만 리플레이 캡처 (10%)
      maskAllText: true,
      blockAllMedia: true,
      // 9/30 오류 보고 기능과 함께 명시 — 사용자가 "관리자에게 알리기"로 화면 정황을 보낼 때
      // 입력값(input·textarea·select)이 그대로 올라가지 않게 한다. SDK 기본값도 true 지만
      // 이 기능의 개인정보 전제라 의존하지 않고 못 박는다.
      maskAllInputs: true,
    }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: REPORTABLE ? 0.1 : 0,
});

/**
 * App Router 내비게이션 시작 훅 — Next 가 호출한다.
 * Sentry 가 클라이언트 이동을 트레이스로 잇는 데 쓴다(`tracesSampleRate` 적용).
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
