/**
 * Sentry 서버 설정
 *
 * Node.js 서버 런타임에서 발생하는 에러를 Sentry로 전송합니다.
 * Server Components, API Routes, middleware 등에 적용됩니다.
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

  // Performance 모니터링 (서버 사이드)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // 개발 환경에서는 비활성화
  enabled: process.env.NODE_ENV === "production",

  // 디버그 로그
  debug: false,
});
