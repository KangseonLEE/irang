/**
 * SentryReport → GitHub 이슈 생성/코멘트.
 *
 * 중복 방지: 이슈 본문에 `<!-- sentry:<id> -->` 마커를 넣고, 생성 전에 Search API 로
 * 같은 마커를 가진 이슈를 찾는다. 있으면 새 이슈 대신 코멘트만 추가한다 —
 * 같은 Sentry 이슈가 다시 알림돼도 GitHub 이슈는 한 건으로 모인다.
 *
 * 실패는 throw 한다. route 가 5xx 로 돌려 Sentry 가 재시도하게 하는 것이 정답
 * (성공처럼 200 을 돌리면 알림이 조용히 사라진다 — 5/26 silent 202 교훈).
 */

import type { SentryReport } from "./payload";

const GITHUB_API = "https://api.github.com";
const FETCH_TIMEOUT_MS = 10_000;
/** GitHub 이슈 제목 상한은 256자 — 접두사 여유를 두고 자른다 */
const MAX_TITLE_LENGTH = 200;

export interface GitHubIssueOptions {
  token: string;
  /** `owner/repo` */
  repo: string;
}

export type EnsureIssueResult = {
  action: "created" | "commented";
  issueNumber: number;
  url: string;
};

/** 본문에 심는 중복 방지 마커 */
export function sentryMarker(issueId: string): string {
  return `<!-- sentry:${issueId} -->`;
}

/** 표 셀·제목 안의 개행·파이프는 마크다운 표를 깨뜨린다 */
function cell(value: string): string {
  return value.replace(/\s*\r?\n\s*/g, " ").replace(/\|/g, "\\|").trim();
}

export function buildIssueTitle(report: SentryReport): string {
  const raw = cell(report.title);
  const clipped = raw.length > MAX_TITLE_LENGTH ? `${raw.slice(0, MAX_TITLE_LENGTH - 1)}…` : raw;
  return `[Sentry] ${clipped}`;
}

export function issueLabels(report: SentryReport): string[] {
  return report.kind === "feedback" ? ["user-feedback"] : ["bug"];
}

function metaTable(report: SentryReport): string {
  const rows: [string, string][] = [];
  const push = (label: string, value?: string) => {
    if (value) rows.push([label, cell(value)]);
  };

  push("종류", report.kind === "feedback" ? "사용자 피드백" : "오류");
  push("레벨", report.level);
  push("환경", report.environment);
  push("프로젝트", report.project);
  push("경로", report.route);
  push("error_boundary", report.errorBoundary);
  push("발생 위치", report.culprit);
  push("이슈 번호", report.shortId);
  push("알림 규칙", report.alertRule);
  push("Sentry 이슈 id", report.issueId);

  if (rows.length === 0) return "";
  return ["| 항목 | 값 |", "| --- | --- |", ...rows.map(([k, v]) => `| ${k} | ${v} |`)].join("\n");
}

function feedbackBlock(report: SentryReport): string {
  const fb = report.feedback;
  if (!fb) return "";

  const parts: string[] = ["### 사용자 피드백"];
  if (fb.message) {
    parts.push(
      fb.message
        .split(/\r?\n/)
        .map((line) => `> ${line}`)
        .join("\n")
    );
  }

  const rows: [string, string][] = [];
  if (fb.email) rows.push(["이메일", cell(fb.email)]);
  if (fb.name) rows.push(["이름", cell(fb.name)]);
  if (fb.url) rows.push(["남긴 페이지", cell(fb.url)]);
  fb.attachments.forEach((url, i) => {
    rows.push([`첨부 ${i + 1}`, `[스크린샷 열기](${url})`]);
  });
  if (rows.length > 0) {
    parts.push(
      ["| 항목 | 값 |", "| --- | --- |", ...rows.map(([k, v]) => `| ${k} | ${v} |`)].join("\n")
    );
  }
  return parts.join("\n\n");
}

function tagBlock(report: SentryReport): string {
  if (report.tags.length === 0) return "";
  const lines = report.tags.slice(0, 20).map(([k, v]) => `- \`${k}\`: ${cell(v)}`);
  return ["<details><summary>태그</summary>", "", ...lines, "</details>"].join("\n");
}

export function buildIssueBody(report: SentryReport): string {
  const blocks = [
    sentryMarker(report.issueId),
    metaTable(report),
    feedbackBlock(report),
    report.sentryUrl ? `[Sentry 에서 열기](${report.sentryUrl})` : "",
    tagBlock(report),
    "_Sentry 웹훅(`/api/sentry-webhook`)이 자동 생성한 이슈예요._",
  ];
  return blocks.filter(Boolean).join("\n\n");
}

export function buildCommentBody(report: SentryReport): string {
  const blocks = [
    `같은 Sentry 이슈(\`${report.issueId}\`)가 다시 알림됐어요${
      report.action ? ` — \`${report.action}\`` : ""
    }.`,
    metaTable(report),
    feedbackBlock(report),
    report.sentryUrl ? `[Sentry 에서 열기](${report.sentryUrl})` : "",
  ];
  return blocks.filter(Boolean).join("\n\n");
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "irang-sentry-bridge",
  };
}

async function findExistingIssue(
  report: SentryReport,
  { token, repo }: GitHubIssueOptions
): Promise<number | null> {
  const q = `repo:${repo} "sentry:${report.issueId}" in:body`;
  const url = `${GITHUB_API}/search/issues?q=${encodeURIComponent(q)}&per_page=5&sort=created&order=desc`;

  const res = await fetch(url, {
    headers: headers(token),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  // 검색 실패(레이트 리밋 등)는 치명적이지 않다 — 중복 위험을 감수하고 생성으로 넘어간다.
  // 알림 유실(이슈 미생성)이 중복 이슈보다 나쁘다.
  if (!res.ok) return null;

  const json = (await res.json()) as { items?: { number?: number; body?: string | null }[] };
  const marker = sentryMarker(report.issueId);
  const hit = (json.items ?? []).find(
    (item) => typeof item.number === "number" && (item.body ?? "").includes(marker)
  );
  return hit?.number ?? null;
}

async function createIssue(
  report: SentryReport,
  opts: GitHubIssueOptions
): Promise<EnsureIssueResult> {
  const payload = {
    title: buildIssueTitle(report),
    body: buildIssueBody(report),
    labels: issueLabels(report),
  };

  const post = (body: object) =>
    fetch(`${GITHUB_API}/repos/${opts.repo}/issues`, {
      method: "POST",
      headers: headers(opts.token),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

  let res = await post(payload);

  // 라벨이 리포에 없으면 422 — 라벨을 빼고 한 번 더. 라벨보다 이슈 생성이 우선.
  if (res.status === 422) {
    res = await post({ title: payload.title, body: payload.body });
  }

  if (!res.ok) {
    throw new Error(`GitHub 이슈 생성 실패 (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }

  const json = (await res.json()) as { number?: number; html_url?: string };
  return {
    action: "created",
    issueNumber: json.number ?? 0,
    url: json.html_url ?? `https://github.com/${opts.repo}/issues`,
  };
}

async function commentOnIssue(
  report: SentryReport,
  issueNumber: number,
  opts: GitHubIssueOptions
): Promise<EnsureIssueResult> {
  const res = await fetch(`${GITHUB_API}/repos/${opts.repo}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers: headers(opts.token),
    body: JSON.stringify({ body: buildCommentBody(report) }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`GitHub 코멘트 실패 (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }

  return {
    action: "commented",
    issueNumber,
    url: `https://github.com/${opts.repo}/issues/${issueNumber}`,
  };
}

/** 기존 이슈가 있으면 코멘트, 없으면 새 이슈 */
export async function ensureGitHubIssue(
  report: SentryReport,
  opts: GitHubIssueOptions
): Promise<EnsureIssueResult> {
  const existing = await findExistingIssue(report, opts);
  return existing === null
    ? createIssue(report, opts)
    : commentOnIssue(report, existing, opts);
}
