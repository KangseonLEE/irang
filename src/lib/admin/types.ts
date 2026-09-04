/**
 * 어드민 대시보드 데이터 타입
 */

// ── 피드백 ──

export interface QuickFeedbackRow {
  id: number;
  rating: "good" | "neutral" | "bad";
  message: string;
  page: string;
  status: "pending" | "done" | "rejected";
  created_at: string;
  // 5/16 B4 D1: thumbs 컬럼 추가. 마이그 적용 전 row는 NULL.
  thumbs?: "up" | "down" | null;
  recommendation_id?: string | null;
  persona?: string | null;
}

// ── B4: thumbs 시각화 ──

export interface ThumbsStats {
  /** 전체 누적 */
  total: { up: number; down: number };
  /** 최근 7일 */
  week: { up: number; down: number };
  /** 최근 30일 */
  month: { up: number; down: number };
}

export interface ThumbsByPersona {
  persona: string;
  up: number;
  down: number;
  /** up / (up + down). 분모 0이면 null. */
  ratio: number | null;
}

export interface TopThumbsRecommendation {
  recommendation_id: string;
  persona: string | null;
  up: number;
  down: number;
  total: number;
}

// ── 요청 관리 ──

export type RequestStatus = "pending" | "done" | "rejected";

export interface RequestRow extends QuickFeedbackRow {
  /** 파싱된 카테고리 (정보/작물/지원사업/의견) */
  category: string;
  /** 파싱된 키워드 */
  keyword: string;
}

export interface RequestKeywordCount {
  keyword: string;
  count: number;
}

// ── 검색 로그 ──

/** 결과 없는 검색어 — 로그 시점 0건이었던 검색어를 현재 인덱스로 재검색한 결과 포함 (2026-09-02) */
export interface ZeroResultKeyword extends TopKeyword {
  /** 현재 검색 인덱스 결과 수. > 0 이면 데이터 보강으로 해결된 것 */
  nowCount: number;
}

export interface ZeroResultReport {
  /** 지금도 0건 — 실제 조치 대상 */
  unresolved: ZeroResultKeyword[];
  /** 로그 시점엔 0건이었지만 지금은 결과가 있음 */
  resolved: ZeroResultKeyword[];
}

export interface TopKeyword {
  query: string;
  count: number;
}

export interface DailySearchCount {
  date: string;
  count: number;
  /** 그날 검색된 키워드 분해 (빈도 내림차순) — 차트 호버 툴팁용 */
  keywords: { query: string; count: number }[];
}

// ── 진단 결과 ──

export interface AssessmentRow {
  id: number;
  /** 실제 컬럼명. assessment_results.farm_type_id (예: "guinong"·"guichon"·"guisanchon"·"smartfarm"·"cheongnyeon") */
  farm_type_id: string;
  answers: Record<string, string>;
  created_at: string;
}

export interface TypeDistribution {
  type: string;
  count: number;
}

// ── 대시보드 KPI ──

export interface AdminKpi {
  todayFeedback: number;
  weeklySearches: number;
  weeklyAssessments: number;
  zeroResultCount: number;
}
