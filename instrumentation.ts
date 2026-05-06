/**
 * Next.js Instrumentation Hook
 *
 * @sentry/nextjs v9+ 필수 — server/edge 런타임에 sentry config를 로드한다.
 * 이 파일이 없으면 sentry.server.config.ts / sentry.edge.config.ts가 실행되지
 * 않아 server-side / middleware / API route 에러가 Sentry로 전송되지 않는다.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Server Component / Route Handler 에러 자동 캡처
export { captureRequestError as onRequestError } from "@sentry/nextjs";
