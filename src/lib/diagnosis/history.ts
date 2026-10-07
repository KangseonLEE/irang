/**
 * 진단 결과 히스토리 — 이 브라우저(localStorage)에만 남기는 최근 결과 5건 (2026-10-06 QA Q4-W11).
 *
 * 예전엔 정착 유형 진단(10문항)만 저장해서, 빠른 점검·적합도 진단(14문항)을 마친 사람은 "이전 진단 결과"에서
 * 다시 볼 수 없었다. 재방문은 M7 판정 지표라 세 진단을 같은 목록에 같은 방식으로 남긴다.
 *
 * - 저장 키는 예전 그대로(`irang_assess_history`) — 이미 쌓인 기록을 잃지 않는다. 예전 항목은 `kind` 가 없고
 *   정착 유형 진단으로 읽는다.
 * - 답변을 그대로 남겨 결과 화면을 다시 계산한다(점수·문구가 바뀌어도 지금 기준으로 다시 보여 준다).
 * - 순수 함수만 둔다 — 브라우저 저장소 읽기·쓰기는 use-diagnosis-history.ts.
 */
import type { FarmTypeId } from "@/lib/data/match-questions";
import type { QuickAnswers } from "@/lib/data/quick-check";

export const HISTORY_STORAGE_KEY = "irang_assess_history";
export const HISTORY_MAX_ITEMS = 5;

const FARM_TYPE_IDS: readonly string[] = [
  "guinong",
  "guichon",
  "guisanchon",
  "smartfarm",
  "cheongnyeon",
  // 4/18 이전 구 ID 도 읽는다 — 화면에서는 migrateFarmTypeId 로 바꿔 쓴다
  "weekend",
  "rural-life",
  "young-entrepreneur",
];

interface HistoryBase {
  resultId: string;
  /** ISO 8601 */
  savedAt: string;
}

/** 정착 유형 진단(10문항) — 2026-10-06 이전 항목은 kind 가 없다 */
interface MatchHistoryItem extends HistoryBase {
  kind?: "match";
  farmTypeId: FarmTypeId;
  farmTypeLabel: string;
  /** 표시용 시·도 짧은 이름 */
  topRegions: string[];
  topRegionIds?: string[];
  topCropIds?: string[];
}

/** 빠른 점검(4문항) */
interface QuickHistoryItem extends HistoryBase {
  kind: "quick";
  answers: QuickAnswers;
}

/** 적합도 진단(14문항) — 결과 화면을 그대로 다시 그릴 수 있게 세 단계 답을 모두 남긴다 */
interface AssessHistoryItem extends HistoryBase {
  kind: "assess";
  /** 적합도 문항 id → 점수 */
  answers: Record<string, number>;
  /** 기본 정보(연령대·성별·농한기) id → 값 */
  demo: Record<string, string>;
  /** 국가지원 트랙 문항 id → 선택지 id 배열 */
  track: Record<string, string[]>;
  /** 추천 국가지원 트랙 — 가이드 맞춤 배너가 쓴다 */
  farmTypeId: FarmTypeId;
  farmTypeLabel: string;
}

export type DiagnosisHistoryItem = MatchHistoryItem | QuickHistoryItem | AssessHistoryItem;

/** 저장할 때 넘기는 모양 — savedAt 은 저장 시각으로 채운다 */
export type NewHistoryItem =
  | Omit<MatchHistoryItem, "savedAt">
  | Omit<QuickHistoryItem, "savedAt">
  | Omit<AssessHistoryItem, "savedAt">;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isStringRecord(v: unknown): v is Record<string, string> {
  return isRecord(v) && Object.values(v).every((x) => typeof x === "string");
}

function isNumberRecord(v: unknown): v is Record<string, number> {
  return isRecord(v) && Object.values(v).every((x) => typeof x === "number" && Number.isFinite(x));
}

function isStringArrayRecord(v: unknown): v is Record<string, string[]> {
  return isRecord(v) && Object.values(v).every(isStringArray);
}

function isFarmTypeId(v: unknown): v is FarmTypeId {
  return typeof v === "string" && FARM_TYPE_IDS.includes(v);
}

/** 한 항목 검증 — 모양이 어긋난 항목(직접 고친 저장소·옛 버전 잔재)은 버린다 */
function toHistoryItem(v: unknown): DiagnosisHistoryItem | null {
  if (!isRecord(v)) return null;
  if (typeof v.resultId !== "string" || typeof v.savedAt !== "string") return null;
  const base = { resultId: v.resultId, savedAt: v.savedAt };

  if (v.kind === "quick") {
    return isStringRecord(v.answers)
      ? { ...base, kind: "quick", answers: v.answers as QuickAnswers }
      : null;
  }

  if (v.kind === "assess") {
    if (
      !isNumberRecord(v.answers) ||
      !isStringRecord(v.demo) ||
      !isStringArrayRecord(v.track) ||
      !isFarmTypeId(v.farmTypeId) ||
      typeof v.farmTypeLabel !== "string"
    ) {
      return null;
    }
    return {
      ...base,
      kind: "assess",
      answers: v.answers,
      demo: v.demo,
      track: v.track,
      farmTypeId: v.farmTypeId,
      farmTypeLabel: v.farmTypeLabel,
    };
  }

  if (v.kind !== undefined && v.kind !== "match") return null;
  if (!isFarmTypeId(v.farmTypeId) || typeof v.farmTypeLabel !== "string" || !isStringArray(v.topRegions)) {
    return null;
  }
  return {
    ...base,
    kind: "match",
    farmTypeId: v.farmTypeId,
    farmTypeLabel: v.farmTypeLabel,
    topRegions: v.topRegions,
    ...(isStringArray(v.topRegionIds) ? { topRegionIds: v.topRegionIds } : {}),
    ...(isStringArray(v.topCropIds) ? { topCropIds: v.topCropIds } : {}),
  };
}

/** 저장소 원본(JSON 파싱 결과) → 검증된 목록 */
export function parseHistory(raw: unknown): DiagnosisHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const out: DiagnosisHistoryItem[] = [];
  for (const v of raw) {
    const item = toHistoryItem(v);
    if (item) out.push(item);
  }
  return out.slice(0, HISTORY_MAX_ITEMS);
}

function isMatchItem(
  x: DiagnosisHistoryItem | NewHistoryItem,
): x is MatchHistoryItem | Omit<MatchHistoryItem, "savedAt"> {
  return x.kind === undefined || x.kind === "match";
}

function sameIds(a: readonly string[] | undefined, b: readonly string[] | undefined): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
}

/**
 * 같은 결과인가 — 목록에 같은 결과가 두 칸 들어가지 않게.
 * 빠른 점검·적합도 진단은 답으로, 정착 유형 진단은 결과(유형 + 추천 지역·작물)로 본다 — 유형 진단 항목은 답을 남기지
 * 않아서 예전엔 늘 "다른 결과"로 판정돼 같은 답으로 다시 마치면 두 칸이 됐다 (10/6 2차 QA R2-Q4).
 */
function sameResult(a: DiagnosisHistoryItem, b: NewHistoryItem): boolean {
  if (a.kind === "quick" && b.kind === "quick") {
    return JSON.stringify(a.answers) === JSON.stringify(b.answers);
  }
  if (a.kind === "assess" && b.kind === "assess") {
    return (
      JSON.stringify(a.answers) === JSON.stringify(b.answers) &&
      JSON.stringify(a.demo) === JSON.stringify(b.demo) &&
      JSON.stringify(a.track) === JSON.stringify(b.track)
    );
  }
  if (isMatchItem(a) && isMatchItem(b)) {
    return a.farmTypeId === b.farmTypeId && sameIds(a.topRegionIds, b.topRegionIds) && sameIds(a.topCropIds, b.topCropIds);
  }
  return false;
}

/**
 * 새 결과를 맨 앞에 넣는다 — 최대 5건.
 * 같은 resultId 는 무시하고, 목록에 같은 결과가 이미 있으면 그 칸을 빼고 맨 앞에 새로 둔다(시각만 새로).
 */
export function addHistoryItem(
  list: readonly DiagnosisHistoryItem[],
  item: NewHistoryItem,
  savedAt: string,
): DiagnosisHistoryItem[] {
  if (list.some((h) => h.resultId === item.resultId)) return [...list];
  const rest = list.filter((h) => !sameResult(h, item));
  return [{ ...item, savedAt } as DiagnosisHistoryItem, ...rest].slice(0, HISTORY_MAX_ITEMS);
}
