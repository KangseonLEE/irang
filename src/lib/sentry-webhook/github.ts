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
  // id 를 영숫자로 거른다 — `-->` 등으로 주석을 닫고 본문에 끼어들지 못하게 (2차 QA A5)
  return `<!-- sentry:${safeId(issueId)} -->`;
}

/** 표 셀·제목 안의 개행·파이프는 마크다운 표를 깨뜨린다 */
function cell(value: string): string {
  return value.replace(/\s*\r?\n\s*/g, " ").replace(/\|/g, "\\|").trim();
}

/** 표 값 한 칸 상한 — 길게 지어낸 문구가 이슈 본문을 채우지 못하게 */
const MAX_CELL_LENGTH = 120;

/**
 * 공개 이슈에 싣는 **외부 유래 값**(title·culprit·route·environment·태그 값…)은 전부 코드 스팬으로 감싼다
 * (2026-10-16 보안 2차 QA A5).
 *
 * 클라이언트 번들에 공개된 DSN 으로 누구나 오류 이벤트를 지어 보낼 수 있다. 원문을 표에 그대로 두면
 * 공개 리포 이슈에 마크다운 링크(`[..](https://피싱)`)·`@멘션`·`#번호` 이슈 링크가 그대로 렌더되고,
 * 회장 폰으로 푸시까지 간다. 코드 스팬 안에서는 GitHub 가 링크·멘션·이슈 참조를 만들지 않는다.
 * 백틱은 지워 코드 스팬을 벗어나지 못하게 하고, `@` 는 전각으로 한 번 더 무력화한다.
 */
function code(value: string): string {
  const flat = cell(value).replace(/`/g, "'").replace(/@/g, "＠");
  const clipped = flat.length > MAX_CELL_LENGTH ? `${flat.slice(0, MAX_CELL_LENGTH - 1)}…` : flat;
  return `\`${clipped}\``;
}

/** 제목·식별자에 쓰는 id — 영숫자·`-`·`_` 만 */
function safeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40) || "unknown";
}

/** Sentry 링크는 sentry.io 하위 https 주소일 때만 — 페이로드 값으로 다른 곳을 가리키지 못하게 */
function safeSentryUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return undefined;
    const host = u.hostname.toLowerCase();
    if (host !== "sentry.io" && !host.endsWith(".sentry.io")) return undefined;
    return u.toString().replace(/[()<>\s]/g, (c) => encodeURIComponent(c));
  } catch {
    return undefined;
  }
}

/**
 * 이슈 제목은 **고정 형식** — 원문(title)은 Sentry 링크로만 본다 (2차 QA A5, 피드백은 1차 🔴2).
 * 제목에는 링크·멘션이 렌더되지 않지만 검색·알림 미리보기에 지어낸 문구가 그대로 노출되기 때문.
 */
export function buildIssueTitle(report: SentryReport): string {
  const id = safeId(report.shortId ?? report.issueId);
  return report.kind === "feedback" ? `[Sentry] 사용자 피드백 (${id})` : `[Sentry] 오류 (${id})`;
}

export function issueLabels(report: SentryReport): string[] {
  return report.kind === "feedback" ? ["user-feedback"] : ["bug"];
}

function metaTable(report: SentryReport): string {
  const rows: [string, string][] = [];
  const push = (label: string, value?: string) => {
    if (value) rows.push([label, code(value)]);
  };

  push("종류", report.kind === "feedback" ? "사용자 피드백" : "오류");
  // 오류 원문 제목 — 고정 형식 이슈 제목 대신 표 안에서 코드 스팬으로만 (피드백은 사용자 문장일 수 있어 생략)
  if (report.kind !== "feedback") push("제목", report.title);
  push("레벨", report.level);
  push("환경", report.environment);
  push("프로젝트", report.project);
  // url 태그에서 온 경로는 쿼리(검색어 등 사용자 입력)를 떼고 경로만
  push("경로", report.route && /^https?:\/\//i.test(report.route) ? pagePath(report.route) : report.route);
  push("error_boundary", report.errorBoundary);
  push("발생 위치", report.culprit);
  push("이슈 번호", report.shortId);
  push("알림 규칙", report.alertRule);
  push("Sentry 이슈 id", safeId(report.issueId));

  if (rows.length === 0) return "";
  return ["| 항목 | 값 |", "| --- | --- |", ...rows.map(([k, v]) => `| ${k} | ${v} |`)].join("\n");
}

/**
 * 사용자 피드백 블록 — **사용자가 쓴 내용은 싣지 않는다** (2026-10-16 보안 QA 🔴2).
 *
 * 이슈가 올라가는 리포는 공개라 검색 엔진에 색인된다. 오류 보고 창의 메시지·이메일·이름·
 * 스크린샷을 여기 옮기면 개인정보를 목적 외로 공개하는 셈이다. 운영자는 링크를 눌러
 * Sentry(비공개)에서 원문을 본다. 남긴 페이지는 경로만 — 쿼리(`?q=` 검색어 등)도 사용자 입력이다.
 */
function feedbackBlock(report: SentryReport): string {
  const fb = report.feedback;
  if (!fb) return "";

  const lines: string[] = ["### 사용자 피드백"];
  const page = pagePath(fb.url);
  if (page) lines.push(`- 남긴 페이지: ${code(page)}`);
  const has: string[] = [];
  if (fb.message) has.push("메시지");
  if (fb.email || fb.name) has.push("연락처");
  if (fb.attachments.length > 0) has.push(`첨부 ${fb.attachments.length}건`);
  lines.push(
    `- ${has.length > 0 ? `${has.join("·")}이 있어요. ` : ""}내용은 공개 이슈에 옮기지 않아요 — ${
      safeSentryUrl(report.sentryUrl) ? `[Sentry 에서 확인](${safeSentryUrl(report.sentryUrl)})` : "Sentry 에서 확인"
    }하세요.`,
  );
  return lines.join("\n");
}

/** URL → 경로만 (호스트·쿼리·해시 제거). 해석 불가면 생략 */
function pagePath(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const p = new URL(url).pathname;
    return cell(p).replace(/`/g, "").slice(0, 120) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * 공개 이슈에 옮길 수 있는 태그만 — 사용자 식별·입력 값이 담길 수 있는 키는 버린다.
 * 피드백 이벤트는 태그 전체를 생략한다(url·user 계열이 대부분).
 */
const PUBLIC_TAG_KEYS = new Set([
  "environment",
  "level",
  "release",
  "runtime",
  "runtime.name",
  "browser",
  "browser.name",
  "os",
  "os.name",
  "device",
  "device.family",
  "handled",
  "mechanism",
  "error_boundary",
  "errorBoundary",
  "transaction",
  "route",
]);

function tagBlock(report: SentryReport): string {
  if (report.kind === "feedback") return "";
  const tags = report.tags.filter(([k]) => PUBLIC_TAG_KEYS.has(k));
  if (tags.length === 0) return "";
  const lines = tags.slice(0, 20).map(([k, v]) => `- \`${k}\`: ${code(v)}`);
  return ["<details><summary>태그</summary>", "", ...lines, "</details>"].join("\n");
}

export function buildIssueBody(report: SentryReport): string {
  const blocks = [
    sentryMarker(report.issueId),
    metaTable(report),
    feedbackBlock(report),
    safeSentryUrl(report.sentryUrl) ? `[Sentry 에서 열기](${safeSentryUrl(report.sentryUrl)})` : "",
    tagBlock(report),
    "_Sentry 웹훅(`/api/sentry-webhook`)이 자동 생성한 이슈예요._",
  ];
  return blocks.filter(Boolean).join("\n\n");
}

export function buildCommentBody(report: SentryReport): string {
  const blocks = [
    `같은 Sentry 이슈(\`${safeId(report.issueId)}\`)가 다시 알림됐어요${
      report.action ? ` — ${code(report.action)}` : ""
    }.`,
    metaTable(report),
    feedbackBlock(report),
    safeSentryUrl(report.sentryUrl) ? `[Sentry 에서 열기](${safeSentryUrl(report.sentryUrl)})` : "",
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
  const q = `repo:${repo} "sentry:${safeId(report.issueId)}" in:body`;
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
