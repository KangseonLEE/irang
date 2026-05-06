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
import * as Sentry from "@sentry/nextjs";

class SentryTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SentryTestError";
  }
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "api";
  const timestamp = new Date().toISOString();

  // 명시적 캡처 — SDK 로드 여부 진단용
  if (type === "explicit") {
    const error = new SentryTestError(
      `[Sentry test] explicit captureException at ${timestamp}`,
    );
    const client = Sentry.getClient();
    const clientOptions = client?.getOptions();
    const dsn = clientOptions?.dsn;
    const enabled = clientOptions?.enabled;
    const env = clientOptions?.environment;

    const eventId = Sentry.captureException(error);
    const flushed = await Sentry.flush(5000);

    // === 추가 진단: 동일 Vercel function에서 직접 Sentry endpoint POST ===
    // 이게 작동하면 네트워크 egress OK → SDK transport 버그 확정.
    // 이게 실패하면 Vercel egress 차단 → 인프라 이슈.
    const dsnUrl = dsn ? new URL(dsn) : null;
    const dsnKey = dsnUrl?.username || "";
    const projectId = dsnUrl?.pathname.replace(/^\//, "") || "";
    const ingestHost = dsnUrl?.host || "";

    let directFetchResult: {
      attempted: boolean;
      status?: number;
      body?: string;
      error?: string;
    } = { attempted: false };

    if (dsnKey && projectId && ingestHost) {
      try {
        const directUrl = `https://${ingestHost}/api/${projectId}/store/?sentry_version=7&sentry_key=${dsnKey}&sentry_client=manual-fetch-from-vercel/1.0`;
        const directResp = await fetch(directUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: Math.floor(Date.now() / 1000),
            platform: "javascript",
            level: "error",
            environment: "production",
            transaction: "/api/sentry-test (direct fetch from Vercel fn)",
            exception: {
              values: [{
                type: "DirectFetchTestError",
                value: `Direct fetch from Vercel function at ${timestamp}`,
                stacktrace: { frames: [{ filename: "vercel-fn.js", function: "directFetch", lineno: 1 }] },
              }],
            },
          }),
        });
        directFetchResult = {
          attempted: true,
          status: directResp.status,
          body: (await directResp.text()).slice(0, 200),
        };
      } catch (e) {
        directFetchResult = {
          attempted: true,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }

    return NextResponse.json({
      ok: true,
      diagnostics: {
        client_initialized: Boolean(client),
        dsn_set: Boolean(dsn),
        dsn_host: dsn ? new URL(dsn).host : null,
        enabled,
        environment: env,
        node_env: process.env.NODE_ENV,
        next_runtime: process.env.NEXT_RUNTIME,
        sentry_event_id: eventId,
        flushed_successfully: flushed,
        // === 핵심 진단 ===
        direct_fetch: directFetchResult,
      },
      note: "direct_fetch.status=200 + flushed=true 인데 Sentry Stats만 0 → SDK transport 버그 확정",
      timestamp,
    });
  }

  if (type === "server") {
    throw new SentryTestError(
      `[Sentry test] server-side error fired at ${timestamp}`,
    );
  }

  if (type === "api") {
    throw new SentryTestError(
      `[Sentry test] api route error fired at ${timestamp}`,
    );
  }

  return NextResponse.json({
    ok: true,
    note: "Use ?type=api|server|explicit",
    timestamp,
  });
}
