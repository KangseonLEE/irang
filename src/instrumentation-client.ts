/**
 * Sentry 클라이언트 설정
 *
 * 브라우저에서 발생하는 에러를 Sentry로 전송합니다.
 * 이 파일은 Next.js 클라이언트 번들에 포함됩니다.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

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
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // 개발 환경에서는 Sentry 비활성화
  enabled: process.env.NODE_ENV === "production",

  // 디버그 로그 (개발 시에만)
  debug: false,

  // 세션 리플레이 (Free 플랜 한도 고려하여 비활성화)
  // 필요 시 replaysSessionSampleRate / replaysOnErrorSampleRate 설정
  integrations: [
    Sentry.replayIntegration({
      // 에러 발생 시에만 리플레이 캡처 (10%)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
});
