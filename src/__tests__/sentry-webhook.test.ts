import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { verifySentrySignature } from "@/lib/sentry-webhook/verify";
import { parseSentryWebhook } from "@/lib/sentry-webhook/payload";
import {
  buildCommentBody,
  buildIssueBody,
  buildIssueTitle,
  issueLabels,
  sentryMarker,
} from "@/lib/sentry-webhook/github";
import { POST } from "@/app/api/sentry-webhook/route";

/**
 * Sentry Internal Integration 웹훅 → GitHub 이슈 브리지 (2026-09-30).
 *
 * Sentry 의 GitHub 이슈 생성 액션이 요금제 변경으로 죽어 알림 체인이 끊긴 것을
 * 웹훅으로 대체했다. 검증 포인트는 세 가지:
 *   1. 서명 검증 — 시크릿 미설정은 503, 불일치는 401 (조용한 성공 금지)
 *   2. 리소스 분기 — 우리가 다루지 않는 훅은 204 로 흘려 Sentry 재시도를 막는다
 *   3. 중복 방지 — 같은 Sentry 이슈면 새 이슈 대신 코멘트
 */

const SECRET = "test-client-secret-0123456789";

function sign(raw: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(raw, "utf8").digest("hex");
}

// ── fixtures (Sentry 웹훅 문서 형태) ──

/** 알림 규칙 액션이 보내는 오류 이벤트 */
const errorAlertPayload = {
  action: "triggered",
  installation: { uuid: "a8dc7e2a-6f0d-4f0f-8b1b-000000000001" },
  data: {
    event: {
      event_id: "d2f1c0f9a1b24a0e9b7c0a1b2c3d4e5f",
      project: 4509000000000000,
      project_slug: "irang",
      issue_id: "6612345678",
      issue_url: "https://sentry.io/api/0/organizations/irang/issues/6612345678/",
      web_url: "https://irang.sentry.io/issues/6612345678/events/d2f1c0f9a1b24a0e9b7c0a1b2c3d4e5f/",
      url: "https://sentry.io/api/0/projects/irang/irang/events/d2f1c0f9a1b24a0e9b7c0a1b2c3d4e5f/",
      title: "TypeError: Cannot read properties of undefined (reading 'name')",
      culprit: "Page(app/crops/[id]/page)",
      level: "error",
      environment: "production",
      transaction: "/crops/cherry-tomato",
      datetime: "2026-09-30T02:11:04.000Z",
      platform: "javascript-nextjs",
      tags: [
        ["level", "error"],
        ["environment", "production"],
        ["error_boundary", "true"],
        ["route", "/crops/[id]"],
        ["browser", "Chrome 141.0.0"],
      ],
    },
    triggered_rule: "새 오류가 생기면 알림",
  },
  actor: { type: "application", id: "sentry", name: "Sentry" },
};

/** 사용자 피드백 알림 — contexts.feedback 이 본문·이메일·첨부를 담는다 */
const feedbackAlertPayload = {
  action: "triggered",
  installation: { uuid: "a8dc7e2a-6f0d-4f0f-8b1b-000000000001" },
  data: {
    event: {
      event_id: "ab12cd34ef56ab78cd90ef12ab34cd56",
      type: "feedback",
      project_slug: "irang",
      issue_id: "6698765432",
      web_url: "https://irang.sentry.io/feedback/?feedbackSlug=irang%3A6698765432",
      title: "User Feedback",
      level: "info",
      environment: "production",
      tags: [
        ["environment", "production"],
        ["url", "https://irangfarm.com/programs/SP-020"],
      ],
      contexts: {
        feedback: {
          contact_email: "grower@example.com",
          name: "김농부",
          message: "지원사업 원문 링크가 안 보여요.\n모바일에서 특히 그래요.",
          url: "https://irangfarm.com/programs/SP-020",
          source: "widget",
          attachments: [
            { url: "https://irang.sentry.io/api/0/attachments/9001/?download=1", name: "screenshot.png" },
          ],
        },
      },
    },
    triggered_rule: "사용자 피드백 알림",
  },
  actor: { type: "application", id: "sentry", name: "Sentry" },
};

/** issue 리소스 — 생애주기 훅 */
const issueCreatedPayload = {
  action: "created",
  installation: { uuid: "a8dc7e2a-6f0d-4f0f-8b1b-000000000001" },
  data: {
    issue: {
      id: "6612345678",
      shortId: "IRANG-3F",
      title: "Error: supabase insert failed",
      culprit: "POST /api/quick-feedback",
      level: "error",
      status: "unresolved",
      web_url: "https://irang.sentry.io/issues/6612345678/",
      project: { id: "4509", name: "irang", slug: "irang", platform: "javascript-nextjs" },
      metadata: { type: "Error", value: "supabase insert failed" },
      count: "3",
    },
  },
  actor: { type: "application", id: "sentry", name: "Sentry" },
};

function webhookRequest(
  resource: string | null,
  payload: unknown,
  opts: { signature?: string | null; secret?: string } = {}
): NextRequest {
  const raw = JSON.stringify(payload);
  const headers = new Headers({ "content-type": "application/json" });
  if (resource) headers.set("sentry-hook-resource", resource);
  const sig = opts.signature === undefined ? sign(raw, opts.secret ?? SECRET) : opts.signature;
  if (sig !== null) headers.set("sentry-hook-signature", sig);
  return new NextRequest("https://irangfarm.com/api/sentry-webhook", {
    method: "POST",
    headers,
    body: raw,
  });
}

// ── 1. 서명 검증 ──

describe("verifySentrySignature", () => {
  const raw = JSON.stringify(errorAlertPayload);

  it("올바른 서명은 통과", () => {
    expect(verifySentrySignature(raw, sign(raw), SECRET)).toBe(true);
  });

  it("본문이 한 글자라도 바뀌면 거부", () => {
    expect(verifySentrySignature(raw + " ", sign(raw), SECRET)).toBe(false);
  });

  it("다른 시크릿으로 서명한 요청은 거부", () => {
    expect(verifySentrySignature(raw, sign(raw, "other-secret"), SECRET)).toBe(false);
  });

  it("시크릿 미설정이면 어떤 서명도 통과하지 못한다", () => {
    expect(verifySentrySignature(raw, sign(raw), undefined)).toBe(false);
    expect(verifySentrySignature(raw, sign(raw), "")).toBe(false);
  });

  it("서명 헤더가 없거나 hex 형식이 아니면 거부", () => {
    expect(verifySentrySignature(raw, null, SECRET)).toBe(false);
    expect(verifySentrySignature(raw, "not-a-hex-digest!", SECRET)).toBe(false);
  });
});

// ── 2. 페이로드 → 이슈 본문 변환 ──

describe("parseSentryWebhook → GitHub 이슈 본문", () => {
  it("오류 event_alert 에서 레벨·환경·경로·error_boundary·규칙을 뽑는다", () => {
    const report = parseSentryWebhook("event_alert", errorAlertPayload);
    expect(report).not.toBeNull();
    expect(report!.kind).toBe("error");
    expect(report!.issueId).toBe("6612345678");
    expect(report!.level).toBe("error");
    expect(report!.environment).toBe("production");
    expect(report!.route).toBe("/crops/[id]");
    expect(report!.errorBoundary).toBe("true");
    expect(report!.alertRule).toBe("새 오류가 생기면 알림");
    expect(report!.sentryUrl).toContain("irang.sentry.io/issues/6612345678");

    const body = buildIssueBody(report!);
    expect(body).toContain(sentryMarker("6612345678"));
    expect(body).toContain("| 레벨 | error |");
    expect(body).toContain("| 환경 | production |");
    expect(body).toContain("| 경로 | /crops/[id] |");
    expect(body).toContain("| error_boundary | true |");
    expect(body).toContain("| 알림 규칙 | 새 오류가 생기면 알림 |");
    expect(body).toContain("[Sentry 에서 열기](https://irang.sentry.io/issues/6612345678/events/");
    expect(buildIssueTitle(report!)).toBe(
      "[Sentry] TypeError: Cannot read properties of undefined (reading 'name')"
    );
    expect(issueLabels(report!)).toEqual(["bug"]);
  });

  it("피드백 event_alert 은 메시지·이메일·첨부를 본문에 담고 라벨이 user-feedback", () => {
    const report = parseSentryWebhook("event_alert", feedbackAlertPayload);
    expect(report!.kind).toBe("feedback");
    expect(report!.feedback?.email).toBe("grower@example.com");
    expect(report!.feedback?.name).toBe("김농부");
    expect(report!.feedback?.attachments).toHaveLength(1);

    const body = buildIssueBody(report!);
    expect(body).toContain("### 사용자 피드백");
    expect(body).toContain("> 지원사업 원문 링크가 안 보여요.");
    expect(body).toContain("> 모바일에서 특히 그래요.");
    expect(body).toContain("| 이메일 | grower@example.com |");
    expect(body).toContain("| 남긴 페이지 | https://irangfarm.com/programs/SP-020 |");
    expect(body).toContain("[스크린샷 열기](https://irang.sentry.io/api/0/attachments/9001/?download=1)");
    expect(issueLabels(report!)).toEqual(["user-feedback"]);
  });

  it("issue 리소스는 shortId·발생 위치를 담고, 코멘트 본문에 Sentry id 를 남긴다", () => {
    const report = parseSentryWebhook("issue", issueCreatedPayload);
    expect(report!.resource).toBe("issue");
    expect(report!.action).toBe("created");
    expect(report!.shortId).toBe("IRANG-3F");
    expect(report!.project).toBe("irang");
    expect(buildIssueBody(report!)).toContain("| 이슈 번호 | IRANG-3F |");
    expect(buildCommentBody(report!)).toContain("`6612345678`");
  });

  it("제목에 파이프·개행이 있어도 표를 깨뜨리지 않는다", () => {
    const report = parseSentryWebhook("event_alert", {
      action: "triggered",
      data: { event: { issue_id: "1", title: "Error: a | b\nc", tags: [] } },
    });
    expect(buildIssueTitle(report!)).toBe("[Sentry] Error: a \\| b c");
  });

  it("다루지 않는 리소스·형태면 null", () => {
    expect(parseSentryWebhook("installation", { action: "created", data: {} })).toBeNull();
    expect(parseSentryWebhook("comment", { action: "created", data: {} })).toBeNull();
    // issue_id 가 없으면 중복 방지 키를 만들 수 없다
    expect(parseSentryWebhook("event_alert", { action: "triggered", data: { event: {} } })).toBeNull();
  });
});

// ── 3. 라우트: 서명·리소스 분기·GitHub 연동 ──

describe("POST /api/sentry-webhook", () => {
  const originalEnv = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.SENTRY_WEBHOOK_SECRET = SECRET;
    process.env.GITHUB_ISSUE_TOKEN = "github_pat_test";
    process.env.GITHUB_ISSUE_REPO = "KangseonLEE/irang";
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const jsonRes = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("시크릿 미설정이면 503 — 조용한 성공 응답을 돌려주지 않는다", async () => {
    delete process.env.SENTRY_WEBHOOK_SECRET;
    const res = await POST(webhookRequest("event_alert", errorAlertPayload));
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toMatchObject({ error: "secret-missing" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("서명이 틀리면 401", async () => {
    const res = await POST(
      webhookRequest("event_alert", errorAlertPayload, { signature: sign("{}", "wrong") })
    );
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("서명 헤더가 없으면 401", async () => {
    const res = await POST(webhookRequest("event_alert", errorAlertPayload, { signature: null }));
    expect(res.status).toBe(401);
  });

  it("다루지 않는 리소스는 204 (Sentry 재시도 유발 안 함)", async () => {
    const res = await POST(webhookRequest("installation", { action: "created", data: {} }));
    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("issue 훅의 resolved 같은 action 은 204", async () => {
    const payload = { ...issueCreatedPayload, action: "resolved" };
    const res = await POST(webhookRequest("issue", payload));
    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("기존 이슈가 없으면 GitHub 이슈를 생성한다", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/search/issues")) return jsonRes({ total_count: 0, items: [] });
      return jsonRes({ number: 140, html_url: "https://github.com/KangseonLEE/irang/issues/140" }, 201);
    });

    const res = await POST(webhookRequest("event_alert", errorAlertPayload));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, action: "created", issueNumber: 140 });

    const createCall = fetchMock.mock.calls.find(([u]) => String(u).endsWith("/issues"));
    expect(createCall).toBeDefined();
    const sent = JSON.parse(String(createCall![1].body));
    expect(sent.labels).toEqual(["bug"]);
    expect(sent.body).toContain(sentryMarker("6612345678"));
    expect(String(createCall![1].headers.Authorization)).toBe("Bearer github_pat_test");
  });

  it("같은 Sentry 이슈 마커를 가진 이슈가 있으면 코멘트만 추가한다", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/search/issues")) {
        return jsonRes({
          total_count: 1,
          items: [{ number: 131, body: `앞부분\n${sentryMarker("6612345678")}\n뒷부분` }],
        });
      }
      return jsonRes({ id: 1, html_url: "https://github.com/KangseonLEE/irang/issues/131#c1" }, 201);
    });

    const res = await POST(webhookRequest("event_alert", errorAlertPayload));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ action: "commented", issueNumber: 131 });

    const urls = fetchMock.mock.calls.map(([u]) => String(u));
    expect(urls.some((u) => u.endsWith("/issues/131/comments"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/repos/KangseonLEE/irang/issues"))).toBe(false);
  });

  it("라벨이 없어 422 면 라벨을 빼고 다시 생성한다", async () => {
    let attempts = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/search/issues")) return jsonRes({ items: [] });
      attempts += 1;
      if (attempts === 1) return jsonRes({ message: "Validation Failed" }, 422);
      return jsonRes({ number: 141, html_url: "https://github.com/KangseonLEE/irang/issues/141" }, 201);
    });

    const res = await POST(webhookRequest("event_alert", feedbackAlertPayload));
    expect(res.status).toBe(200);
    expect(attempts).toBe(2);
    const retry = JSON.parse(String(fetchMock.mock.calls.at(-1)![1].body));
    expect(retry.labels).toBeUndefined();
  });

  it("GitHub 토큰이 없으면 503", async () => {
    delete process.env.GITHUB_ISSUE_TOKEN;
    const res = await POST(webhookRequest("event_alert", errorAlertPayload));
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toMatchObject({ error: "github-token-missing" });
  });

  it("GitHub 호출이 실패하면 502 로 돌려 Sentry 가 재시도하게 한다", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/search/issues")) return jsonRes({ items: [] });
      return new Response("bad credentials", { status: 401 });
    });

    const res = await POST(webhookRequest("event_alert", errorAlertPayload));
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toMatchObject({ error: "github-failed" });
  });

  it("검색 API 가 실패해도 이슈 생성으로 넘어간다 (알림 유실보다 중복이 낫다)", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes("/search/issues")) return new Response("rate limited", { status: 403 });
      return jsonRes({ number: 142, html_url: "https://github.com/KangseonLEE/irang/issues/142" }, 201);
    });

    const res = await POST(webhookRequest("event_alert", errorAlertPayload));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ action: "created", issueNumber: 142 });
  });
});
