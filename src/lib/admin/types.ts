/**
 * 어드민 대시보드 데이터 타입
 */

// ── 피드백 ──

export interface QuickFeedbackRow {
  id: number;
  rating: "good" | "neutral" | "bad";
  message: string;
  page: string;
  created_at: string;
}

// ── 검색 로그 ──

export interface SearchLogRow {
  id: number;
  query: string;
  result_count: number;
  created_at: string;
}

export interface TopKeyword {
  query: string;
  count: number;
}

export interface DailySearchCount {
  date: string;
  count: number;
}

// ── 진단 결과 ──

export interface AssessmentRow {
  id: number;
  result_type: string;
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
