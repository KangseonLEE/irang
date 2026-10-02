/**
 * Sentry 서버 설정
 *
 * Node.js 서버 런타임에서 발생하는 에러를 Sentry로 전송합니다.
 * Server Components, API Routes, middleware 등에 적용됩니다.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

/**
 * 운영 배포에서만 전송 (10/3 dev QA). NODE_ENV=production 은 로컬 `next start`·Vercel 미리보기(main 푸시)
 * 에서도 참이라, 그 서버 오류가 "production" 으로 올라가 Sentry→GitHub 이슈(회장 폰 알림)로 샜다.
 * 클라이언트는 호스트 게이트(src/instrumentation-client.ts)가 있고, 서버·엣지는 robots.ts·layout.tsx 와 같은 판정을 쓴다.
 */
const IS_PUBLIC_PRODUCTION = process.env.VERCEL_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 구분
  environment: process.env.NODE_ENV,

  // 에러 샘플링 비율
  sampleRate: 1.0,

  // Performance 모니터링 (서버 사이드)
  tracesSampleRate: IS_PUBLIC_PRODUCTION ? 0.1 : 0,

  // 운영 배포에서만 (로컬·미리보기·개발 비활성)
  enabled: IS_PUBLIC_PRODUCTION,

  // 디버그 로그
  debug: false,
});
