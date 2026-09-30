/**
 * POST /api/sentry-webhook
 *
 * Sentry Internal Integration 웹훅 → GitHub 이슈 브리지 (2026-09-30).
 *
 * 왜: Sentry 알림 규칙의 GitHub 이슈 생성 액션이 요금제 변경으로
 * "The GitHub action is no longer available" 상태가 되어
 * **Sentry → GitHub Issue → auto-assign → iPhone 푸시** 체인이 끊겼다.
 * 무료 플랜에서도 쓸 수 있는 Internal Integration 웹훅이 그 자리를 대신한다.
 *
 * 흐름: Sentry 알림 규칙 액션 → 이 엔드포인트 → GitHub Issues API
 *       → 기존 auto-assign 워크플로 → iPhone 푸시
 *
 * 검증: `sentry-hook-signature` = HMAC-SHA256(원문 body, SENTRY_WEBHOOK_SECRET) hex.
 *   - 시크릿 미설정 → 503 (조용한 성공 응답 금지 — 5/26 silent 202 가 33일 잠복한 교훈)
 *   - 서명 불일치  → 401
 *   - 우리가 다루지 않는 리소스·action → 204 (Sentry 재시도 유발 안 함)
 *   - GitHub 호출 실패 → 502 (5xx 라서 Sentry 가 재시도한다)
 *
 * 서버-서버 호출이라 내부 트래픽 게이트(`internalSkipReason`)는 적용하지 않는다.
 * 집계 테이블에 쓰지 않고, Sentry 는 브라우저가 아니라 표식을 실을 수도 없다.
 *
 * 환경변수: SENTRY_WEBHOOK_SECRET (Internal Integration Client Secret),
 *          GITHUB_ISSUE_TOKEN (fine-grained PAT, Issues: write),
 *          GITHUB_ISSUE_REPO (선택, 기본 KangseonLEE/irang)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  SENTRY_RESOURCE_HEADER,
  SENTRY_SIGNATURE_HEADER,
  verifySentrySignature,
} from "@/lib/sentry-webhook/verify";
import { HANDLED_ISSUE_ACTIONS, parseSentryWebhook } from "@/lib/sentry-webhook/payload";
import { ensureGitHubIssue } from "@/lib/sentry-webhook/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "KangseonLEE/irang";
const HANDLED_RESOURCES = new Set(["event_alert", "issue"]);

/** 본문 없는 204 — Sentry 는 2xx 면 성공으로 보고 재시도하지 않는다 */
const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  // 대시보드 붙여넣기 시 끝에 줄바꿈이 따라오는 일이 있어(9/30 실측 41자) 양쪽 공백을 걷어낸다
  const secret = (process.env.SENTRY_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    console.error("[sentry-webhook] SENTRY_WEBHOOK_SECRET 미설정 — 요청 거부");
    return NextResponse.json({ ok: false, error: "secret-missing" }, { status: 503 });
  }

  // 서명은 파싱 전 원문으로만 검증할 수 있다
  const rawBody = await request.text();
  const signature = request.headers.get(SENTRY_SIGNATURE_HEADER);
  if (!verifySentrySignature(rawBody, signature, secret)) {
    console.warn("[sentry-webhook] 서명 불일치 — 401");
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 401 });
  }

  const resource = request.headers.get(SENTRY_RESOURCE_HEADER);
  if (!resource || !HANDLED_RESOURCES.has(resource)) return noContent();

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const report = parseSentryWebhook(resource, payload);
  if (!report) return noContent();

  // issue 훅은 생성·재발만 옮긴다 (resolved·assigned 까지 이슈를 만들면 소음)
  if (report.resource === "issue" && !HANDLED_ISSUE_ACTIONS.has(report.action ?? "")) {
    return noContent();
  }

  const token = (process.env.GITHUB_ISSUE_TOKEN ?? "").trim();
  if (!token) {
    console.error("[sentry-webhook] GITHUB_ISSUE_TOKEN 미설정 — 이슈 생성 불가");
    return NextResponse.json({ ok: false, error: "github-token-missing" }, { status: 503 });
  }

  try {
    const result = await ensureGitHubIssue(report, {
      token,
      repo: process.env.GITHUB_ISSUE_REPO || DEFAULT_REPO,
    });
    console.log(
      `[sentry-webhook] ${resource}/${report.action ?? "-"} ${report.kind} sentry:${report.issueId} → #${result.issueNumber} ${result.action}`
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[sentry-webhook] GitHub 연동 실패", error);
    return NextResponse.json({ ok: false, error: "github-failed" }, { status: 502 });
  }
}

/**
 * 진단 전용 GET — 값은 절대 내보내지 않고 "런타임에 보이는지"만 알린다 (2026-09-30 브리지 503 원인 추적).
 * 서버-서버 웹훅 경로라 사용자 노출 0. 시크릿 존재 여부는 공격 표면이 아니다(값 없음).
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      runtime: "nodejs",
      env: {
        SENTRY_WEBHOOK_SECRET: Boolean(process.env.SENTRY_WEBHOOK_SECRET),
        GITHUB_ISSUE_TOKEN: Boolean(process.env.GITHUB_ISSUE_TOKEN),
        GITHUB_ISSUE_TOKEN_len: (process.env.GITHUB_ISSUE_TOKEN ?? "").trim().length,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
