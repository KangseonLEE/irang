/**
 * Sentry Edge 런타임 설정
 *
 * Vercel Edge Functions / Middleware에서 발생하는 에러를 Sentry로 전송합니다.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 구분
  environment: process.env.NODE_ENV,

  // 에러 샘플링 비율
  sampleRate: 1.0,

  // Performance 모니터링
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // 개발 환경에서는 비활성화
  enabled: process.env.NODE_ENV === "production",

  debug: false,
});
