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
