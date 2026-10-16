/**
 * POST /api/assess 입력 검증 (2026-10-16 보안 QA 🟡6).
 *
 * 예전엔 answers(임의 객체)·top_regions·top_crops·recommended_programs(임의 배열)·referrer(임의 타입)를
 * 길이·원소 검증 없이 저장했다. 공유 결과 화면(/assess/result/[id], /r/[id])이 top_regions 를
 * 그대로 그려, 지어낸 지역 id 로 irangfarm.com 화면에 임의 문구를 띄울 수 있었다(콘텐츠 위조).
 *
 * 원칙: 알 수 있는 값만 남긴다.
 * - top_regions = PROVINCES id, top_crops = CROPS id — 모르는 id 는 버리고 최대 5개.
 * - answers 키 = 세 위저드(정식 match·14문항 assess·quick)의 실제 질문 id + assess 위저드가 붙이는 `__` 메타 3종.
 *   값은 짧은 문자열 / 유한 숫자 / 짧은 문자열 배열만. JSON 8KB 상한.
 * - referrer = 문자열(200자까지 자름) 또는 null. 다른 타입은 400.
 *
 * 위저드에 질문을 추가하면 데이터 모듈의 QUESTIONS 배열에서 자동으로 따라온다.
 */

import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { QUESTIONS as MATCH_QUESTIONS, TRACK_QUESTIONS } from "@/lib/data/match-questions";
import { QUESTIONS as ASSESS_QUESTIONS } from "@/lib/data/assessment";
import { QUICK_QUESTIONS } from "@/lib/data/quick-check";

export const MAX_ANSWERS_JSON_BYTES = 8 * 1024;
/** 요청 본문 전체 상한 — answers 8KB + 나머지 필드 여유 */
export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_LIST_ITEMS = 5;
export const MAX_REFERRER_LENGTH = 200;
const MAX_VALUE_LENGTH = 64;
const MAX_ARRAY_VALUES = 20;
const MAX_PROGRAMS = 10;

const PROVINCE_IDS = new Set(PROVINCES.map((p) => p.id));
const CROP_IDS = new Set(CROPS.map((c) => c.id));
const TRACK_IDS = new Set(TRACK_QUESTIONS.map((q) => q.id));

/** assessment-wizard 가 answers 에 덧붙이는 메타 키 */
const META_KEYS = new Set(["__assess_tier", "__assess_total_score", "__track_answers"]);

export const ALLOWED_ANSWER_KEYS: ReadonlySet<string> = new Set([
  ...MATCH_QUESTIONS.map((q) => q.id),
  ...ASSESS_QUESTIONS.map((q) => q.id),
  ...QUICK_QUESTIONS.map((q) => q.id),
  ...META_KEYS,
]);

const PROGRAM_ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isShortString(v: unknown): v is string {
  return typeof v === "string" && v.length <= MAX_VALUE_LENGTH;
}

/** 답 하나 — 짧은 문자열 / 유한 숫자 / 짧은 문자열 배열 */
function isAnswerValue(v: unknown): boolean {
  if (isShortString(v)) return true;
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.length <= MAX_ARRAY_VALUES && v.every(isShortString);
  return false;
}

export function validateAnswers(raw: unknown): Ok<Record<string, unknown>> | Err {
  if (!isPlainObject(raw)) return { ok: false, error: "answers must be an object" };

  let json: string;
  try {
    json = JSON.stringify(raw);
  } catch {
    return { ok: false, error: "answers not serializable" };
  }
  if (new TextEncoder().encode(json).length > MAX_ANSWERS_JSON_BYTES) {
    return { ok: false, error: "answers too large" };
  }

  for (const [key, value] of Object.entries(raw)) {
    if (!ALLOWED_ANSWER_KEYS.has(key)) return { ok: false, error: `unknown answer key` };
    if (key === "__track_answers") {
      if (!isPlainObject(value)) return { ok: false, error: "invalid __track_answers" };
      for (const [tk, tv] of Object.entries(value)) {
        if (!TRACK_IDS.has(tk) || !isAnswerValue(tv)) {
          return { ok: false, error: "invalid __track_answers" };
        }
      }
      continue;
    }
    if (!isAnswerValue(value)) return { ok: false, error: "invalid answer value" };
  }
  return { ok: true, value: raw };
}

/** 알려진 id 만, 중복 없이, 최대 5개. 배열이 아니면 null(호출측이 400 여부 결정) */
function filterKnownIds(raw: unknown, known: ReadonlySet<string>): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) return null;
  const out: string[] = [];
  for (const v of raw) {
    if (typeof v === "string" && known.has(v) && !out.includes(v)) out.push(v);
    if (out.length >= MAX_LIST_ITEMS) break;
  }
  return out;
}

export function filterRegionIds(raw: unknown): string[] | null {
  return filterKnownIds(raw, PROVINCE_IDS);
}

export function filterCropIds(raw: unknown): string[] | null {
  return filterKnownIds(raw, CROP_IDS);
}

/** 추천 지원사업 id — DB 전용 행도 있어 목록 대조 대신 형식만 */
export function validatePrograms(raw: unknown): Ok<string[]> | Err {
  if (raw === undefined || raw === null) return { ok: true, value: [] };
  if (!Array.isArray(raw) || raw.length > MAX_PROGRAMS) {
    return { ok: false, error: "invalid recommended_programs" };
  }
  if (!raw.every((v) => typeof v === "string" && PROGRAM_ID_RE.test(v))) {
    return { ok: false, error: "invalid recommended_programs" };
  }
  return { ok: true, value: raw as string[] };
}

export function normalizeReferrer(raw: unknown): Ok<string | null> | Err {
  if (raw === undefined || raw === null || raw === "") return { ok: true, value: null };
  if (typeof raw !== "string") return { ok: false, error: "invalid referrer" };
  return { ok: true, value: raw.slice(0, MAX_REFERRER_LENGTH) };
}
