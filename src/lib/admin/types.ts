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

// ── 랜딩 인기 검색어 데이터 소스 ──

/**
 * 랜딩 히어로 하단 "지금 많이 찾는 키워드" 영역의 데이터 소스 상태.
 *
 * - realDataCount: Supabase get_trending_searches RPC가 반환한 실데이터 키워드 수 (최근 7일)
 * - threshold: 실데이터로 노출되기 위한 최소 키워드 수 (TrendingSearches 컴포넌트 정의)
 * - isFallback: realDataCount < threshold 인 경우 true → landing.ts trendingSearches 정적 폴백 사용 중
 * - fallbackCount: 정적 폴백 키워드 수 (참고용)
 */
export interface TrendingDataSourceStatus {
  realDataCount: number;
  threshold: number;
  isFallback: boolean;
  fallbackCount: number;
}
