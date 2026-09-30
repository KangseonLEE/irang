/**
 * Sentry 웹훅 페이로드 → GitHub 이슈용 중간 표현(SentryReport) 변환.
 *
 * 다루는 리소스 2종 (`sentry-hook-resource` 헤더):
 *   - `event_alert` — 알림 규칙(Alert Rule)의 액션으로 발사. `data.event` 가 이벤트 원본.
 *   - `issue`       — 이슈 생애주기 훅. `data.issue` 가 이슈 직렬화.
 * 그 외(`installation`·`comment`·`metric_alert`…)는 route 가 204 로 흘린다.
 *
 * 페이로드 형태는 Sentry 버전·기능에 따라 필드가 늘거나 빠지므로 전부 optional 로 읽고
 * 없는 값은 행을 생략한다. 추정값을 채우지 않는다(데이터 무결성 원칙).
 */

/** 오류 이슈인지 사용자 피드백인지 — GitHub 라벨과 본문 구성을 가른다 */
type SentryReportKind = "error" | "feedback";

interface SentryFeedback {
  message?: string;
  email?: string;
  name?: string;
  /** 피드백을 남긴 페이지 */
  url?: string;
  /** 스크린샷 등 첨부 URL (payload 에 있을 때만) */
  attachments: string[];
}

export interface SentryReport {
  /** Sentry 이슈 id — GitHub 이슈 중복 방지 마커의 키 */
  issueId: string;
  kind: SentryReportKind;
  title: string;
  /** 사람이 열어 볼 Sentry 링크 (web_url 우선, 없으면 API issue_url) */
  sentryUrl?: string;
  level?: string;
  environment?: string;
  project?: string;
  culprit?: string;
  /** 알림을 발사한 규칙 이름 (event_alert) */
  alertRule?: string;
  /** 웹훅 action (`triggered` · `created` · `regression` …) */
  action?: string;
  shortId?: string;
  /** 발생 경로 — `route`·`url`·`transaction` 태그에서 뽑는다 */
  route?: string;
  /** React ErrorBoundary 태그 */
  errorBoundary?: string;
  tags: [string, string][];
  feedback?: SentryFeedback;
  resource: "event_alert" | "issue";
}

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return undefined;
}

/** Sentry 태그는 `[["key","value"], …]` 또는 `{key: value}` 두 형태로 온다 */
function readTags(raw: unknown): [string, string][] {
  const out: [string, string][] = [];
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (Array.isArray(entry)) {
        const k = str(entry[0]);
        const v = str(entry[1]);
        if (k && v) out.push([k, v]);
      } else if (isObj(entry)) {
        const k = str(entry.key);
        const v = str(entry.value);
        if (k && v) out.push([k, v]);
      }
    }
  } else if (isObj(raw)) {
    for (const [k, v] of Object.entries(raw)) {
      const s = str(v);
      if (s) out.push([k, s]);
    }
  }
  return out;
}

function tagValue(tags: [string, string][], key: string): string | undefined {
  return tags.find(([k]) => k === key)?.[1];
}

/** 첨부는 문자열 URL 배열 또는 `{url|download_url|name}` 객체 배열로 온다 */
function readAttachments(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const a of raw) {
    const url = typeof a === "string" ? a : isObj(a) ? str(a.url) ?? str(a.download_url) : undefined;
    if (url) out.push(url);
  }
  return out;
}

function projectName(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw;
  if (isObj(raw)) return str(raw.slug) ?? str(raw.name);
  return undefined;
}

function looksLikeFeedback(source: Json, tags: [string, string][], title?: string): boolean {
  const contexts = isObj(source.contexts) ? source.contexts : undefined;
  if (contexts && isObj(contexts.feedback)) return true;
  if (str(source.type) === "feedback") return true;
  if (str(source.issueCategory) === "feedback") return true;
  const metadata = isObj(source.metadata) ? source.metadata : undefined;
  if (metadata && str(metadata.source) === "feedback") return true;
  if (tagValue(tags, "feedback")) return true;
  if (title && /user feedback|사용자 피드백/i.test(title)) return true;
  return false;
}

function readFeedback(source: Json): SentryFeedback | undefined {
  const contexts = isObj(source.contexts) ? source.contexts : undefined;
  const fb = contexts && isObj(contexts.feedback) ? contexts.feedback : undefined;
  const user = isObj(source.user) ? source.user : undefined;
  const metadata = isObj(source.metadata) ? source.metadata : undefined;

  const message =
    (fb && str(fb.message)) ??
    (metadata && str(metadata.value)) ??
    str(source.message);
  const email = (fb && (str(fb.contact_email) ?? str(fb.email))) ?? (user && str(user.email));
  const name = (fb && str(fb.name)) ?? (user && (str(user.username) ?? str(user.name)));
  const url = (fb && str(fb.url)) ?? str(source.url);
  const attachments = [
    ...readAttachments(fb?.attachments),
    ...readAttachments(source.attachments),
    ...readAttachments((fb && fb.screenshots) ?? undefined),
  ];

  if (!message && !email && !name && attachments.length === 0) return undefined;
  return { message, email, name, url, attachments: [...new Set(attachments)] };
}

/** `event_alert` 페이로드의 `data.event` 를 읽는다 */
function parseEventAlert(data: Json, action: string | undefined): SentryReport | null {
  const event = isObj(data.event) ? data.event : null;
  if (!event) return null;

  // issue_id 가 없는 페이로드(테스트 알림·일부 이벤트)는 issue_url 끝 세그먼트 → event_id 순으로 대체.
  // 9/30 실측: 테스트 알림이 여기서 null → 204 로 조용히 떨어져 원인 추적이 막혔다.
  const fromIssueUrl = (() => {
    const u = str(event.issue_url) ?? str(event.web_url);
    const m = u ? /\/issues\/(\d+)/.exec(u) : null;
    return m ? m[1] : undefined;
  })();
  const issueId =
    str(event.issue_id) ?? str(event.groupID) ?? str(event.group_id) ?? fromIssueUrl ?? str(event.event_id);
  if (!issueId) return null;

  const tags = readTags(event.tags);
  const title = str(event.title) ?? str(event.message) ?? `Sentry 이슈 ${issueId}`;
  const issueAlert = isObj(data.issue_alert) ? data.issue_alert : undefined;

  const kind: SentryReportKind = looksLikeFeedback(event, tags, title) ? "feedback" : "error";

  return {
    issueId,
    kind,
    title,
    sentryUrl: str(event.web_url) ?? str(event.issue_url) ?? str(event.url),
    level: str(event.level) ?? tagValue(tags, "level"),
    environment: str(event.environment) ?? tagValue(tags, "environment"),
    project: projectName(event.project_slug ?? event.project),
    culprit: str(event.culprit),
    alertRule: str(data.triggered_rule) ?? (issueAlert && str(issueAlert.title)),
    action,
    route:
      tagValue(tags, "route") ??
      str(event.transaction) ??
      tagValue(tags, "transaction") ??
      tagValue(tags, "url"),
    errorBoundary: tagValue(tags, "error_boundary") ?? tagValue(tags, "errorBoundary"),
    tags,
    feedback: kind === "feedback" ? readFeedback(event) : undefined,
    resource: "event_alert",
  };
}

/** `issue` 페이로드의 `data.issue` 를 읽는다 */
function parseIssue(data: Json, action: string | undefined): SentryReport | null {
  const issue = isObj(data.issue) ? data.issue : null;
  if (!issue) return null;

  const issueId = str(issue.id);
  if (!issueId) return null;

  const tags = readTags(issue.tags);
  const metadata = isObj(issue.metadata) ? issue.metadata : undefined;
  const title = str(issue.title) ?? (metadata && str(metadata.value)) ?? `Sentry 이슈 ${issueId}`;
  const kind: SentryReportKind = looksLikeFeedback(issue, tags, title) ? "feedback" : "error";

  return {
    issueId,
    kind,
    title,
    sentryUrl: str(issue.web_url) ?? str(issue.permalink) ?? str(issue.url),
    level: str(issue.level) ?? tagValue(tags, "level"),
    environment: tagValue(tags, "environment"),
    project: projectName(issue.project),
    culprit: str(issue.culprit),
    action,
    shortId: str(issue.shortId),
    route: tagValue(tags, "route") ?? tagValue(tags, "transaction") ?? tagValue(tags, "url"),
    errorBoundary: tagValue(tags, "error_boundary") ?? tagValue(tags, "errorBoundary"),
    tags,
    feedback: kind === "feedback" ? readFeedback(issue) : undefined,
    resource: "issue",
  };
}

/**
 * 리소스별 분기 파서. 우리가 다루지 않는 리소스·형태면 null
 * (route 는 null 을 204 로 흘려 Sentry 재시도를 유발하지 않는다).
 */
export function parseSentryWebhook(resource: string | null, payload: unknown): SentryReport | null {
  if (!isObj(payload)) return null;
  const data = isObj(payload.data) ? payload.data : {};
  const action = str(payload.action);

  if (resource === "event_alert") return parseEventAlert(data, action);
  if (resource === "issue") return parseIssue(data, action);
  return null;
}

/**
 * `issue` 훅에서 GitHub 이슈로 옮길 가치가 있는 action 만 통과.
 *
 * `created` 는 제외한다 (2026-09-30): 새 이슈는 알림 규칙의 `event_alert` 가 이미 옮기는데,
 * Sentry 는 `issue.created` 훅을 **같은 순간** 따로 쏜다. 두 요청이 동시에 검색 API 를 보면
 * 둘 다 "없음"을 받아 GitHub 이슈가 2건 생겼다(9/30 실측 #147·#148, 1초 차). 서버리스에는
 * 잠금이 없으므로 한 경로만 생성하게 한다 — 신규는 알림 규칙, 재발(unresolved·regression)은 훅.
 */
export const HANDLED_ISSUE_ACTIONS = new Set(["unresolved", "regression"]);
