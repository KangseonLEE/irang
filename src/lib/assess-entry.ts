/**
 * 진단 진입 기록 (2026-10-20) — 진단 결과 저장 때 "사이트 안 어디서 들어왔나"를 함께 남긴다.
 *
 * GA 의 assess_entry_click 은 클릭 수만 있고 완료와 이어지지 않는다. 지면별 '클릭 → 완료'를 DB 에서
 * 바로 세려고, 진입 버튼 라벨(entry_from)과 진단 화면 직전 경로(entry_path)를 sessionStorage 에 두고
 * saveAssessmentResult 가 읽어 보낸다. 저장소가 막힌 환경(사생활 모드 등)에서는 조용히 null.
 */

const ENTRY_KEY = "irang-assess-entry";
const LAST_PATH_KEY = "irang-last-path";
const LANDING_TAGS_KEY = "irang-landing-tags";
/** 진입 버튼을 누른 뒤 이 시간 안에 끝낸 진단만 그 버튼 덕으로 센다 */
const ENTRY_TTL_MS = 60 * 60 * 1000;

/** 진단 화면 — 직전 경로 기록에서 뺀다 */
function isAssessPath(pathname: string): boolean {
  return pathname === "/match" || pathname.startsWith("/match/") || pathname === "/assess" || pathname.startsWith("/assess/");
}

/** 지면 라벨: data-assess-entry 값과 같은 형식 */
export function isValidEntryFrom(v: unknown): v is string {
  return typeof v === "string" && /^[a-z0-9_]{1,40}$/.test(v);
}

/** 경로만(쿼리·해시 없이), 200자 안 */
export function isValidEntryPath(v: unknown): v is string {
  return typeof v === "string" && v.length <= 200 && /^\/[A-Za-z0-9/_\-.%]*$/.test(v);
}

/** utm 값 — normalize.ts TRACKING_PARAM_VALUE 보다 좁게(저장용) */
export function isValidUtmValue(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9_.-]{1,40}$/.test(v);
}

/**
 * 첫 방문 꼬리표 — 세션에서 처음 본 utm_source·utm_medium 만 남긴다(첫 접점).
 * 같은 세션에서 꼬리표 없는 화면으로 옮겨도 지워지지 않는다. PageViewTracker 가 첫 렌더에 부른다.
 */
export function captureLandingTags(search: string): void {
  try {
    if (sessionStorage.getItem(LANDING_TAGS_KEY)) return;
    const params = new URLSearchParams(search);
    const source = params.get("utm_source");
    if (!isValidUtmValue(source)) return;
    const medium = params.get("utm_medium");
    sessionStorage.setItem(
      LANDING_TAGS_KEY,
      JSON.stringify({ source, medium: isValidUtmValue(medium) ? medium : null }),
    );
  } catch {
    // 저장소 막힘
  }
}

/** 진입 버튼 클릭 — AssessEntryTracker 가 부른다 */
export function rememberAssessEntry(from: string, now = Date.now()): void {
  if (!isValidEntryFrom(from)) return;
  try {
    sessionStorage.setItem(ENTRY_KEY, JSON.stringify({ from, at: now }));
  } catch {
    // 저장소 막힘 — 기록 없이 진행
  }
}

/** 경로 이동마다 — 진단 화면이 아닌 마지막 경로를 기억한다 (PageViewTracker 가 부른다) */
export function noteVisitedPath(pathname: string): void {
  if (isAssessPath(pathname) || !isValidEntryPath(pathname)) return;
  try {
    sessionStorage.setItem(LAST_PATH_KEY, pathname);
  } catch {
    // 저장소 막힘
  }
}

export interface AssessEntry {
  entry_from: string | null;
  entry_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
}

export function readAssessEntry(now = Date.now()): AssessEntry {
  let entry_from: string | null = null;
  let entry_path: string | null = null;
  let utm_source: string | null = null;
  let utm_medium: string | null = null;
  try {
    const raw = sessionStorage.getItem(ENTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { from?: unknown; at?: unknown };
      if (isValidEntryFrom(parsed.from) && typeof parsed.at === "number" && now - parsed.at <= ENTRY_TTL_MS) {
        entry_from = parsed.from;
      }
    }
    const last = sessionStorage.getItem(LAST_PATH_KEY);
    if (isValidEntryPath(last)) entry_path = last;
    const tags = sessionStorage.getItem(LANDING_TAGS_KEY);
    if (tags) {
      const parsed = JSON.parse(tags) as { source?: unknown; medium?: unknown };
      if (isValidUtmValue(parsed.source)) utm_source = parsed.source;
      if (isValidUtmValue(parsed.medium)) utm_medium = parsed.medium;
    }
  } catch {
    // 저장소 막힘·깨진 값
  }
  return { entry_from, entry_path, utm_source, utm_medium };
}

/** 결과 화면 링크 → 이동한 곳 분류 (assess_result_click 라벨) */
export function resultClickTarget(href: string, origin: string): string {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return "other";
  }
  if (url.origin !== origin) return "external";
  const seg = url.pathname.split("/")[1] ?? "";
  switch (seg) {
    case "regions":
      return "region";
    case "crops":
      return "crop";
    case "programs":
      return "program";
    case "costs":
      return "costs";
    case "match":
    case "assess":
      return "next_assess";
    default:
      return "other";
  }
}
