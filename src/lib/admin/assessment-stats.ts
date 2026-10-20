/**
 * 어드민 진단 결과 통계 — assessment_results 행을 화면 단위로 집계 (2026-10-20)
 *
 * DB 에는 진단을 끝낸 사람만 남는다. 도달·시작·문항별 이탈은 GA(ga4-snapshot 이슈)에 있고
 * 결과 뒤 동선은 아직 계측이 없다 — 이 모듈은 DB 로 셀 수 있는 것만 센다.
 * 순수 함수라 페이지와 테스트가 같은 경로를 쓴다.
 */

import { migrateFarmTypeId } from "@/lib/data/match-questions";
import type { AssessmentRow } from "./types";

export type AssessMode = "assess" | "match" | "quick";
export type ReferrerGroup = "direct" | "naver" | "google" | "internal" | "other";
export type DeviceKind = "mobile" | "desktop";

export const ASSESS_MODES: AssessMode[] = ["assess", "match", "quick"];
export const REFERRER_GROUPS: ReferrerGroup[] = ["direct", "naver", "google", "internal", "other"];
export const AGE_GROUPS = ["youth", "30s", "40s", "50s", "60plus"] as const;
export const FARM_TYPES = ["guinong", "guichon", "guisanchon", "smartfarm", "cheongnyeon"] as const;
export const TIER_IDS = ["starter", "sprout", "seedling", "ready"] as const;

/** source=quick → 빠른 점검, 준비 단계가 있으면 준비도 진단(/match?mode=assess), 나머지는 14문항 매칭. */
export function modeOf(row: Pick<AssessmentRow, "source" | "answers">): AssessMode {
  if (row.source === "quick") return "quick";
  if (row.answers && typeof row.answers.__assess_tier === "string") return "assess";
  return "match";
}

/** referrer 는 document.referrer(바깥 주소)라 사이트 안 진입 화면은 알 수 없다. */
export function referrerGroupOf(referrer: string | null | undefined): ReferrerGroup {
  if (!referrer) return "direct";
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return "other";
  }
  if (host === "irangfarm.com" || host.endsWith(".irangfarm.com")) return "internal";
  if (host === "naver.com" || host.endsWith(".naver.com")) return "naver";
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return "google";
  return "other";
}

export function deviceOf(userAgent: string | null | undefined): DeviceKind {
  return /Mobi|iPhone|iPad|Android/i.test(userAgent ?? "") ? "mobile" : "desktop";
}

export interface WeeklyBucket {
  /** 주 시작(월요일) KST 날짜 YYYY-MM-DD */
  weekStart: string;
  counts: Record<AssessMode, number>;
}

interface QuestionDistribution {
  questionId: string;
  /** 응답한 사람 수 */
  answered: number;
  /** score 값(1~4) → 사람 수 */
  byScore: Record<number, number>;
}

export interface AssessmentStats {
  total: number;
  previousTotal: number;
  byMode: Record<AssessMode, number>;
  byDevice: Record<DeviceKind, number>;
  byReferrer: Record<ReferrerGroup, number>;
  /** 지역·작물 추천을 저장한 행 */
  withRecommendations: number;
  byType: Record<string, number>;
  /** 연령대 × 결과 유형 — 연령·유형이 둘 다 있는 행만 */
  ageByType: Record<string, Record<string, number>>;
  ageByTypeTotal: number;
  /** 연령 미응답 또는 유형 없음으로 교차표에서 빠진 행 */
  ageByTypeExcluded: number;
  byTier: Record<string, number>;
  tierTotal: number;
  questions: QuestionDistribution[];
}

const KST_OFFSET = 9 * 3_600_000;
const DAY = 86_400_000;

function emptyRecord<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

/**
 * @param current  선택 기간의 행
 * @param previousTotal 직전 같은 길이 기간의 건수(전체 기간이면 0)
 * @param questionIds 준비도 진단 문항 id 순서
 */
export function buildAssessmentStats(
  current: AssessmentRow[],
  previousTotal: number,
  questionIds: string[],
): AssessmentStats {
  const byMode = emptyRecord(ASSESS_MODES);
  const byDevice = emptyRecord<DeviceKind>(["mobile", "desktop"]);
  const byReferrer = emptyRecord(REFERRER_GROUPS);
  const byType: Record<string, number> = {};
  const ageByType: Record<string, Record<string, number>> = {};
  const byTier = emptyRecord(TIER_IDS) as Record<string, number>;
  let withRecommendations = 0;
  let ageByTypeTotal = 0;
  let tierTotal = 0;

  const questions: QuestionDistribution[] = questionIds.map((id) => ({
    questionId: id,
    answered: 0,
    byScore: {},
  }));

  for (const row of current) {
    const mode = modeOf(row);
    byMode[mode]++;
    byDevice[deviceOf(row.user_agent)]++;
    byReferrer[referrerGroupOf(row.referrer)]++;
    if ((row.top_regions?.length ?? 0) > 0 || (row.top_crops?.length ?? 0) > 0) withRecommendations++;

    const type = row.farm_type_id ? migrateFarmTypeId(row.farm_type_id) : null;
    if (type) byType[type] = (byType[type] ?? 0) + 1;
    if (type && row.age_group) {
      ageByType[row.age_group] ??= {};
      ageByType[row.age_group][type] = (ageByType[row.age_group][type] ?? 0) + 1;
      ageByTypeTotal++;
    }

    if (mode === "assess") {
      const tier = row.answers.__assess_tier as string;
      byTier[tier] = (byTier[tier] ?? 0) + 1;
      tierTotal++;
      for (const q of questions) {
        const v = row.answers[q.questionId];
        if (typeof v !== "number") continue;
        q.answered++;
        q.byScore[v] = (q.byScore[v] ?? 0) + 1;
      }
    }
  }

  const withType = Object.values(byType).reduce((a, b) => a + b, 0);

  return {
    total: current.length,
    previousTotal,
    byMode,
    byDevice,
    byReferrer,
    withRecommendations,
    byType,
    ageByType,
    ageByTypeTotal,
    ageByTypeExcluded: withType - ageByTypeTotal,
    byTier,
    tierTotal,
    questions,
  };
}

/** KST 기준 월요일 0시의 날짜 문자열 */
export function kstWeekStart(iso: string): string {
  const d = new Date(Date.parse(iso) + KST_OFFSET);
  const weekday = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - weekday))
    .toISOString()
    .slice(0, 10);
}

/** now 가 속한 주까지 최근 n주(오래된 주 → 최근 주). 빈 주도 0 으로 채운다. */
export function buildWeeklyTrend(rows: AssessmentRow[], now: Date, weeks = 12): WeeklyBucket[] {
  const lastWeek = kstWeekStart(now.toISOString());
  const lastMs = Date.parse(`${lastWeek}T00:00:00Z`);
  const buckets: WeeklyBucket[] = [];
  const index = new Map<string, WeeklyBucket>();
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(lastMs - i * 7 * DAY).toISOString().slice(0, 10);
    const bucket = { weekStart, counts: emptyRecord(ASSESS_MODES) };
    buckets.push(bucket);
    index.set(weekStart, bucket);
  }
  for (const row of rows) {
    const bucket = index.get(kstWeekStart(row.created_at));
    if (bucket) bucket.counts[modeOf(row)]++;
  }
  return buckets;
}

export interface AssessmentListFilter {
  mode?: AssessMode;
  device?: DeviceKind;
  referrer?: ReferrerGroup;
}

export function filterAssessmentRows(rows: AssessmentRow[], filter: AssessmentListFilter): AssessmentRow[] {
  return rows.filter(
    (r) =>
      (!filter.mode || modeOf(r) === filter.mode) &&
      (!filter.device || deviceOf(r.user_agent) === filter.device) &&
      (!filter.referrer || referrerGroupOf(r.referrer) === filter.referrer),
  );
}
