/**
 * 어드민 진단 결과 통계 — assessment_results 행을 화면 단위로 집계 (2026-10-20)
 *
 * DB 에는 진단을 끝낸 사람만 남는다. 도달·시작·문항별 이탈은 GA(ga4-snapshot 이슈)에 있고
 * 결과 뒤 동선은 아직 계측이 없다 — 이 모듈은 DB 로 셀 수 있는 것만 센다.
 * 순수 함수라 페이지와 테스트가 같은 경로를 쓴다.
 */

import { migrateFarmTypeId } from "@/lib/data/match-questions";
import { detectInApp } from "@/lib/inapp-browser";
import type { AssessmentRow } from "./types";

export type AssessMode = "assess" | "match" | "quick";
/** 유입 묶음 — 목록 필터·요약용 */
export type ChannelGroup = "search" | "social" | "share" | "mail" | "internal" | "direct" | "unrecorded";
export type DeviceKind = "mobile" | "desktop";

export const ASSESS_MODES: AssessMode[] = ["assess", "match", "quick"];
export const CHANNEL_GROUPS: ChannelGroup[] = ["search", "social", "share", "mail", "internal", "direct", "unrecorded"];
export const AGE_GROUPS = ["youth", "30s", "40s", "50s", "60plus"] as const;
export const FARM_TYPES = ["guinong", "guichon", "guisanchon", "smartfarm", "cheongnyeon"] as const;
export const TIER_IDS = ["starter", "sprout", "seedling", "ready"] as const;

/** source=quick → 빠른 점검, 준비 단계가 있으면 준비도 진단(/match?mode=assess), 나머지는 14문항 매칭. */
export function modeOf(row: Pick<AssessmentRow, "source" | "answers">): AssessMode {
  if (row.source === "quick") return "quick";
  if (row.answers && typeof row.answers.__assess_tier === "string") return "assess";
  return "match";
}

/**
 * 빠른 점검·매칭은 이 시각(10/20 운영 배포) 전까지 유입 주소를 아예 보내지 않았다 —
 * 그 전 행의 빈 referrer 는 '직접'이 아니라 '기록 없음'이다.
 */
const REFERRER_RECORDED_SINCE = "2026-10-20T03:48:37Z";

export interface Channel {
  /** 세부 경로 id (집계 키) */
  id: string;
  /** 화면 라벨 */
  label: string;
  group: ChannelGroup;
}

const UTM_LABEL: Record<string, string> = {
  kakao: "카카오톡 공유",
  copy_link: "링크 복사 공유",
  share_sheet: "휴대폰 공유 창",
};

/** 바깥 주소 host → 세부 경로. 위에서부터 첫 일치 */
const HOST_RULES: Array<{ test: (host: string) => boolean; id: string; label: string; group: ChannelGroup }> = [
  { test: (h) => /(^|\.)irangfarm\.com$/.test(h), id: "internal", label: "사이트 안", group: "internal" },
  { test: (h) => /^mail\.(naver|google|daum)\.(com|net)$/.test(h) || /(^|\.)outlook\.(live|office)\.com$/.test(h), id: "webmail", label: "웹메일", group: "mail" },
  { test: (h) => /(^|\.)search\.naver\.com$/.test(h), id: "naver_search", label: "네이버 검색", group: "search" },
  { test: (h) => /^(m\.)?blog\.naver\.com$/.test(h), id: "naver_blog", label: "네이버 블로그", group: "social" },
  { test: (h) => /^(m\.)?cafe\.naver\.com$/.test(h), id: "naver_cafe", label: "네이버 카페", group: "social" },
  { test: (h) => h === "naver.com" || h.endsWith(".naver.com"), id: "naver_etc", label: "네이버 기타", group: "search" },
  { test: (h) => /(^|\.)google\.[a-z.]+$/.test(h), id: "google", label: "구글 검색", group: "search" },
  { test: (h) => h === "daum.net" || h.endsWith(".daum.net"), id: "daum", label: "다음", group: "search" },
  { test: (h) => /(^|\.)bing\.com$/.test(h), id: "bing", label: "빙", group: "search" },
  { test: (h) => /(^|\.)instagram\.com$/.test(h), id: "instagram", label: "인스타그램", group: "social" },
  { test: (h) => /(^|\.)facebook\.com$/.test(h), id: "facebook", label: "페이스북", group: "social" },
  { test: (h) => /(^|\.)threads\.(net|com)$/.test(h), id: "threads", label: "스레드", group: "social" },
  { test: (h) => /(^|\.)youtube\.com$/.test(h) || h === "youtu.be", id: "youtube", label: "유튜브", group: "social" },
  { test: (h) => /(^|\.)kakao\.com$/.test(h), id: "kakao_web", label: "카카오(웹)", group: "social" },
];

/**
 * 한 행이 어디서 왔나 — 꼬리표(utm) > 바깥 주소 > 앱 안 브라우저 > 직접 순.
 * 꼬리표는 우리가 만든 링크라 가장 확실하고, 앱 판별은 주소가 비었을 때만 쓴다.
 */
export function channelOf(
  row: Pick<AssessmentRow, "referrer" | "user_agent" | "created_at" | "source" | "answers"> & {
    utm_source?: string | null;
    utm_medium?: string | null;
  },
): Channel {
  const utm = row.utm_source?.toLowerCase();
  if (utm) {
    const medium = row.utm_medium?.toLowerCase();
    const group: ChannelGroup =
      medium === "share" || utm in UTM_LABEL ? "share" : medium === "email" ? "mail" : "social";
    return { id: `utm_${utm}`, label: UTM_LABEL[utm] ?? `꼬리표: ${utm}`, group };
  }
  if (row.referrer) {
    let host: string | null = null;
    try {
      host = new URL(row.referrer).hostname.toLowerCase();
    } catch {
      host = null;
    }
    if (host) {
      const rule = HOST_RULES.find((r) => r.test(host));
      if (rule) return { id: rule.id, label: rule.label, group: rule.group };
      return { id: "other_site", label: "기타 사이트", group: "social" };
    }
  }
  const app = detectInApp(row.user_agent);
  if (app) return { id: `inapp_${app.id}`, label: `${app.name} 앱 안 (출처 없음)`, group: "social" };
  if (modeOf(row) !== "assess" && Date.parse(row.created_at) < Date.parse(REFERRER_RECORDED_SINCE)) {
    return { id: "unrecorded", label: "기록 없음", group: "unrecorded" };
  }
  return { id: "direct", label: "직접·알 수 없음", group: "direct" };
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
  /** 진단 종류 × 기기 */
  deviceByMode: Record<AssessMode, Record<DeviceKind, number>>;
  /** 세부 경로별 */
  byChannel: Record<string, { label: string; group: ChannelGroup; count: number }>;
  byChannelGroup: Record<ChannelGroup, number>;
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
  /** 진입 기록이 남은 행(entry_from 또는 entry_path) — 10/20 계측 이후 저장분 */
  entryRecorded: number;
  /** 진입 버튼 라벨별 */
  byEntryFrom: Record<string, number>;
  /** 직전 경로를 화면 단위로 묶은 것(entryPathGroup) */
  byEntryPath: Record<string, number>;
}

const KST_OFFSET = 9 * 3_600_000;
const DAY = 86_400_000;

function emptyRecord<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

/** 직전 경로 → 화면 단위. "/crops/apple" → "/crops/*", "/crops" 는 그대로 */
export function entryPathGroup(path: string): string {
  const segs = path.split("/").filter(Boolean);
  if (segs.length === 0) return "/";
  if (segs.length === 1) return `/${segs[0]}`;
  return `/${segs[0]}/*`;
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
  const deviceByMode = Object.fromEntries(
    ASSESS_MODES.map((m) => [m, emptyRecord<DeviceKind>(["mobile", "desktop"])]),
  ) as Record<AssessMode, Record<DeviceKind, number>>;
  const byChannel: AssessmentStats["byChannel"] = {};
  const byChannelGroup = emptyRecord(CHANNEL_GROUPS);
  const byType: Record<string, number> = {};
  const ageByType: Record<string, Record<string, number>> = {};
  const byTier = emptyRecord(TIER_IDS) as Record<string, number>;
  const byEntryFrom: Record<string, number> = {};
  const byEntryPath: Record<string, number> = {};
  let entryRecorded = 0;
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
    const device = deviceOf(row.user_agent);
    byDevice[device]++;
    deviceByMode[mode][device]++;
    const channel = channelOf(row);
    byChannel[channel.id] ??= { label: channel.label, group: channel.group, count: 0 };
    byChannel[channel.id].count++;
    byChannelGroup[channel.group]++;
    if (row.entry_from || row.entry_path) entryRecorded++;
    if (row.entry_from) byEntryFrom[row.entry_from] = (byEntryFrom[row.entry_from] ?? 0) + 1;
    if (row.entry_path) {
      const group = entryPathGroup(row.entry_path);
      byEntryPath[group] = (byEntryPath[group] ?? 0) + 1;
    }
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
    deviceByMode,
    byChannel,
    byChannelGroup,
    withRecommendations,
    byType,
    ageByType,
    ageByTypeTotal,
    ageByTypeExcluded: withType - ageByTypeTotal,
    byTier,
    tierTotal,
    questions,
    entryRecorded,
    byEntryFrom,
    byEntryPath,
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
  channel?: ChannelGroup;
}

export function filterAssessmentRows(rows: AssessmentRow[], filter: AssessmentListFilter): AssessmentRow[] {
  return rows.filter(
    (r) =>
      (!filter.mode || modeOf(r) === filter.mode) &&
      (!filter.device || deviceOf(r.user_agent) === filter.device) &&
      (!filter.channel || channelOf(r).group === filter.channel),
  );
}
