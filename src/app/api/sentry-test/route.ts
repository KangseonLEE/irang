/**
 * Sentry 캡처 검증용 endpoint.
 *
 * 사용법: curl https://irangfarm.com/api/sentry-test?type=server
 *
 * type 파라미터:
 * - server: server-side throw (sentry.server.config.ts 검증)
 * - api: Route Handler 명시적 throw
 *
 * 응답이 500이면 정상. Sentry 대시보드에서 5분 내 이벤트 확인 가능해야 함.
 *
 * 보안: GET only, no body, no side effect 외엔 throw만. 누구나 호출 가능하지만
 * abuse 위험 낮음 (각 호출은 단순 에러 캡처 1건).
 */

import { NextResponse, type NextRequest } from "next/server";

class SentryTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryTestError";
  }
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "api";
  const timestamp = new Date().toISOString();

  if (type === "server") {
    // Server-side execution context — sentry.server.config.ts 캡처 대상
    throw new SentryTestError(
      `[Sentry test] server-side error fired at ${timestamp}`,
    );
  }

  if (type === "api") {
    // Route Handler 자체에서 throw — sentry.server.config.ts 캡처 대상
    throw new SentryTestError(
      `[Sentry test] api route error fired at ${timestamp}`,
    );
  }

  return NextResponse.json({
    ok: true,
    note: "Use ?type=server or ?type=api to trigger a test error",
    timestamp,
  });
}
