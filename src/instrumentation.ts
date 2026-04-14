/**
 * Next.js Instrumentation Hook
 *
 * 서버 시작 시 Sentry를 초기화합니다.
 * Next.js App Router에서 공식 지원하는 instrumentation API를 사용합니다.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Next.js onRequestError 훅 → Sentry에 에러 자동 전달
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
