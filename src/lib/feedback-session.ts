/**
 * 피드백 모달 트리거 관리
 *
 * - sessionStorage: 세션 내 의미있는 이벤트 카운터
 * - localStorage: "이미 노출됨" 영구 플래그 또는 "나중에"(7일 유예)
 *
 * SSR 안전 — 모든 함수가 `typeof window` 체크를 수행.
 */

const EVENT_KEY = "irang:feedback-events-v1";
const SHOWN_KEY = "irang:feedback-shown-v1";

/** 의미있는 이벤트 2회 이상이면 모달 조건 충족 */
const EVENT_THRESHOLD = 2;

/** "나중에" 선택 시 재노출까지의 유예 기간 */
const REMIND_LATER_MS = 7 * 24 * 60 * 60 * 1000; // 7일

type FeedbackEvent =
  | "assess_result"
  | "regions_compare_result"
  | "programs_filter"
  | "match_result";

type ShownState =
  | { type: "sent" } // 제출 완료 — 영구 미노출
  | { type: "dismissed" } // X 닫기 — 영구 미노출
  | { type: "later"; until: number }; // 나중에 — until 이후 재노출 가능

/** 의미있는 이벤트 기록 (세션 단위) */
export function trackFeedbackEvent(_event: FeedbackEvent): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(EVENT_KEY);
    const count = raw ? Number.parseInt(raw, 10) || 0 : 0;
    window.sessionStorage.setItem(EVENT_KEY, String(count + 1));
  } catch {
    // sessionStorage 접근 실패 시 조용히 무시
  }
}

/** 현재 세션 이벤트 카운트 */
export function getFeedbackEventCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(EVENT_KEY);
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/** 노출 상태 조회 */
function readShownState(): ShownState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHOWN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShownState;
    return parsed;
  } catch {
    return null;
  }
}

/** 노출 상태 저장 */
function writeShownState(state: ShownState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHOWN_KEY, JSON.stringify(state));
  } catch {
    // localStorage 실패는 치명적이지 않음 — 무시
  }
}

/** 모달 노출 조건 충족 여부 (이벤트 수 + 영구 플래그 미설정) */
export function shouldShowFeedback(): boolean {
  if (typeof window === "undefined") return false;

  const state = readShownState();
  if (state) {
    if (state.type === "sent" || state.type === "dismissed") return false;
    if (state.type === "later" && Date.now() < state.until) return false;
  }

  return getFeedbackEventCount() >= EVENT_THRESHOLD;
}

export function markFeedbackSent(): void {
  writeShownState({ type: "sent" });
}

export function markFeedbackDismissed(): void {
  writeShownState({ type: "dismissed" });
}

export function markFeedbackLater(): void {
  writeShownState({ type: "later", until: Date.now() + REMIND_LATER_MS });
}
