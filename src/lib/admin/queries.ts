/**
 * 어드민 대시보드 Supabase 쿼리
 *
 * Server Component에서 직접 호출 (service_role key 사용).
 * 모든 함수는 Supabase 미설정 시 빈 데이터 반환.
 */

import { getSupabaseAdmin, getTrendingSearches } from "@/lib/supabase";
import { trendingSearches as fallbackTrending } from "@/lib/data/landing";
import { migrateFarmTypeId } from "@/lib/data/match-questions";
import type {
  QuickFeedbackRow,
  RequestRow,
  RequestKeywordCount,
  RequestStatus,
  SearchLogRow,
  TopKeyword,
  DailySearchCount,
  AssessmentRow,
  TypeDistribution,
  AdminKpi,
  TrendingDataSourceStatus,
  ThumbsStats,
  ThumbsByPersona,
  TopThumbsRecommendation,
} from "./types";

// ── 유틸 ──

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

/**
 * 자연어 형태 검색어 — supabase.ts의 logSearch와 동일 정의.
 * 신규 수집은 logSearch에서 차단하지만, 기존 누적 데이터에 자연어가 있을 수
 * 있어 admin 집계 단계에서도 동일하게 제외해야 랜딩과 지표 일관.
 */
function isNaturalLanguageQuery(query: string): boolean {
  const t = query.trim();
  if (/[?]/.test(t)) return true;
  if (
    /(어떻|어느|왜|어디|언제|무엇|얼마|어떤|있나|있어|되나|가능|뭐가|뭐예|뭐임)/.test(t)
  )
    return true;
  if (t.length > 20) return true;
  if (t.split(/\s+/).length >= 5) return true;
  return false;
}

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// ── KPI (Overview) ──

export async function fetchAdminKpi(): Promise<AdminKpi> {
  const sb = getSupabaseAdmin();
  if (!sb)
    return {
      todayFeedback: 0,
      weeklySearches: 0,
      weeklyAssessments: 0,
      zeroResultCount: 0,
    };

  const [fb, sl, as, zr] = await Promise.all([
    sb
      .from("quick_feedback")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart()),
    sb
      .from("search_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", daysAgo(7)),
    sb
      .from("assessment_results")
      .select("id", { count: "exact", head: true })
      .gte("created_at", daysAgo(7)),
    sb
      .from("search_logs")
      .select("id", { count: "exact", head: true })
      .eq("result_count", 0)
      .gte("created_at", daysAgo(7)),
  ]);

  return {
    todayFeedback: fb.count ?? 0,
    weeklySearches: sl.count ?? 0,
    weeklyAssessments: as.count ?? 0,
    zeroResultCount: zr.count ?? 0,
  };
}

// ── 피드백 ──

export async function fetchFeedbackList(
  page = 1,
  perPage = 20,
  ratingFilter?: string,
): Promise<{ data: QuickFeedbackRow[]; total: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { data: [], total: 0 };

  let query = sb.from("quick_feedback").select("*", { count: "exact" });

  if (ratingFilter && ratingFilter !== "all") {
    query = query.eq("rating", ratingFilter);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { data: (data as QuickFeedbackRow[]) ?? [], total: count ?? 0 };
}

// ── B4: 추천 thumbs 시각화 ──

/**
 * thumbs 분포 요약 — 전체 / 7일 / 30일 × up/down.
 *
 * 마이그 미적용(thumbs 컬럼 부재) 또는 0건이면 모두 0 반환.
 * head:true count 5종을 Promise.all로 병렬 실행.
 */
export async function fetchThumbsStats(): Promise<ThumbsStats> {
  const empty: ThumbsStats = {
    total: { up: 0, down: 0 },
    week: { up: 0, down: 0 },
    month: { up: 0, down: 0 },
  };

  const sb = getSupabaseAdmin();
  if (!sb) return empty;

  const week = daysAgo(7);
  const month = daysAgo(30);

  try {
    const [tu, td, wu, wd, mu, md] = await Promise.all([
      sb.from("quick_feedback").select("id", { count: "exact", head: true }).eq("thumbs", "up"),
      sb.from("quick_feedback").select("id", { count: "exact", head: true }).eq("thumbs", "down"),
      sb.from("quick_feedback").select("id", { count: "exact", head: true }).eq("thumbs", "up").gte("created_at", week),
      sb.from("quick_feedback").select("id", { count: "exact", head: true }).eq("thumbs", "down").gte("created_at", week),
      sb.from("quick_feedback").select("id", { count: "exact", head: true }).eq("thumbs", "up").gte("created_at", month),
      sb.from("quick_feedback").select("id", { count: "exact", head: true }).eq("thumbs", "down").gte("created_at", month),
    ]);

    // 마이그 미적용 시 모든 응답이 error를 가짐 → 빈 stats 반환
    if (tu.error || td.error) return empty;

    return {
      total: { up: tu.count ?? 0, down: td.count ?? 0 },
      week: { up: wu.count ?? 0, down: wd.count ?? 0 },
      month: { up: mu.count ?? 0, down: md.count ?? 0 },
    };
  } catch {
    return empty;
  }
}

/**
 * 페르소나별 thumbs ratio (전체 누적).
 *
 * 5종 페르소나(family/farmYouth/elderRural/commuter/balanced) + (null/기타) 분리.
 * up + down = 0인 페르소나는 제외하지만, ratio 계산 시 분모 0이면 null.
 */
export async function fetchThumbsByPersona(): Promise<ThumbsByPersona[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("quick_feedback")
    .select("persona, thumbs")
    .not("thumbs", "is", null);

  if (error || !data) return [];

  const map = new Map<string, { up: number; down: number }>();
  for (const row of data as Array<{ persona: string | null; thumbs: string | null }>) {
    const key = row.persona ?? "(기타)";
    const bucket = map.get(key) ?? { up: 0, down: 0 };
    if (row.thumbs === "up") bucket.up += 1;
    else if (row.thumbs === "down") bucket.down += 1;
    map.set(key, bucket);
  }

  return [...map.entries()]
    .map(([persona, { up, down }]) => ({
      persona,
      up,
      down,
      ratio: up + down === 0 ? null : up / (up + down),
    }))
    .sort((a, b) => b.up + b.down - (a.up + a.down));
}

/**
 * 상위 thumbs 추천 — recommendation_id × persona 조합별 누적 thumbs total 내림차순.
 *
 * 학습 루프 design 시 reference. up이 많은 추천 = persona-fit이 잘 맞는 것,
 * down이 많은 추천 = 가중치 보정 후보. 단계 C(가중치 보정 dry-run)에서 활용.
 */
export async function fetchTopThumbsRecommendations(
  limit = 20,
): Promise<TopThumbsRecommendation[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("quick_feedback")
    .select("recommendation_id, persona, thumbs")
    .not("thumbs", "is", null)
    .not("recommendation_id", "is", null);

  if (error || !data) return [];

  type Key = string; // `${recommendation_id}::${persona ?? "_"}`
  const map = new Map<Key, { recommendation_id: string; persona: string | null; up: number; down: number }>();

  for (const row of data as Array<{ recommendation_id: string | null; persona: string | null; thumbs: string | null }>) {
    if (!row.recommendation_id) continue;
    const key = `${row.recommendation_id}::${row.persona ?? "_"}`;
    const bucket = map.get(key) ?? {
      recommendation_id: row.recommendation_id,
      persona: row.persona,
      up: 0,
      down: 0,
    };
    if (row.thumbs === "up") bucket.up += 1;
    else if (row.thumbs === "down") bucket.down += 1;
    map.set(key, bucket);
  }

  return [...map.values()]
    .map((row) => ({ ...row, total: row.up + row.down }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ── 랜딩 인기 검색어 데이터 소스 ──

/**
 * 랜딩 히어로 "지금 많이 찾는 키워드"가 실데이터를 쓰는지, 정적 폴백을 쓰는지 판정.
 *
 * 임계치(MIN_REAL_DATA = 5)는 src/components/landing/trending-searches.tsx 정의와 동일.
 * 임계치 변경 시 양쪽을 함께 갱신해야 한다.
 */
export async function fetchTrendingDataSourceStatus(): Promise<TrendingDataSourceStatus> {
  const MIN_REAL_DATA = 5;
  const realData = await getTrendingSearches(7, 12);
  const realDataCount = realData.length;

  return {
    realDataCount,
    threshold: MIN_REAL_DATA,
    isFallback: realDataCount < MIN_REAL_DATA,
    fallbackCount: fallbackTrending.length,
  };
}

// ── 검색 분석 ──

export async function fetchTopKeywords(
  days = 7,
  limit = 20,
): Promise<TopKeyword[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  // RPC가 없으면 직접 쿼리로 집계
  const { data } = await sb
    .from("search_logs")
    .select("query")
    .gte("created_at", daysAgo(days));

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const q = (row as { query: string }).query.toLowerCase().trim();
    // 2자 미만 검색어 제외 — 랜딩의 get_trending_searches RPC와 동일 필터
    if (q.length < 2) continue;
    // 자연어 검색어 제외 (기존 누적 데이터 보정)
    if (isNaturalLanguageQuery(q)) continue;
    counts.set(q, (counts.get(q) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

export async function fetchZeroResultQueries(
  days = 7,
  limit = 20,
): Promise<TopKeyword[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("search_logs")
    .select("query")
    .eq("result_count", 0)
    .gte("created_at", daysAgo(days));

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const q = (row as { query: string }).query.toLowerCase().trim();
    counts.set(q, (counts.get(q) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}

export async function fetchDailySearchCounts(
  days = 14,
): Promise<DailySearchCount[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("search_logs")
    .select("created_at")
    .gte("created_at", daysAgo(days));

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const date = (row as { created_at: string }).created_at.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  // 빈 날짜도 0으로 채우기
  const result: DailySearchCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000)
      .toISOString()
      .slice(0, 10);
    result.push({ date, count: counts.get(date) ?? 0 });
  }

  return result;
}

export async function fetchSearchLogs(
  page = 1,
  perPage = 50,
): Promise<{ data: SearchLogRow[]; total: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { data: [], total: 0 };

  const { data, count } = await sb
    .from("search_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { data: (data as SearchLogRow[]) ?? [], total: count ?? 0 };
}

// ── 진단 결과 ──

export async function fetchTypeDistribution(
  days = 30,
): Promise<TypeDistribution[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("assessment_results")
    .select("farm_type_id")
    .gte("created_at", daysAgo(days));

  if (!data) return [];

  // 구 ID(weekend/rural-life/young-entrepreneur)와 신 ID가 DB에 섞여 있어
  // migrateFarmTypeId로 신 ID 5종(guinong/guichon/...) 기준 합산.
  const counts = new Map<string, number>();
  for (const row of data) {
    const raw = (row as { farm_type_id: string }).farm_type_id;
    if (!raw) continue;
    const normalized = migrateFarmTypeId(raw);
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));
}

export async function fetchAssessmentList(
  page = 1,
  perPage = 20,
): Promise<{ data: AssessmentRow[]; total: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { data: [], total: 0 };

  const { data, count } = await sb
    .from("assessment_results")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { data: (data as AssessmentRow[]) ?? [], total: count ?? 0 };
}

// ── 요청 관리 ──

/** "[카테고리 요청: 키워드] 메시지" 형식에서 카테고리와 키워드를 파싱 */
function parseRequestMessage(message: string): {
  category: string;
  keyword: string;
} {
  const match = message.match(/^\[(.+?)\s*요청(?::\s*(.+?))?\]/);
  if (!match) return { category: "기타", keyword: "" };
  return { category: match[1], keyword: match[2] ?? "" };
}

/** 요청 항목만 조회 (message에 "[요청" 포함된 것만) */
export async function fetchRequestList(
  page = 1,
  perPage = 20,
  statusFilter?: string,
  categoryFilter?: string,
): Promise<{ data: RequestRow[]; total: number }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { data: [], total: 0 };

  let query = sb
    .from("quick_feedback")
    .select("*", { count: "exact" })
    .like("message", "%요청%");

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const rows = ((data as QuickFeedbackRow[]) ?? []).map((row) => {
    const { category, keyword } = parseRequestMessage(row.message);
    return { ...row, category, keyword } as RequestRow;
  });

  // 카테고리 필터 (클라이언트 사이드 — message 파싱 기반)
  const filtered = categoryFilter && categoryFilter !== "all"
    ? rows.filter((r) => r.category === categoryFilter)
    : rows;

  return {
    data: filtered,
    total: categoryFilter && categoryFilter !== "all"
      ? filtered.length
      : count ?? 0,
  };
}

/** 요청 키워드 빈도 순 집계 */
export async function fetchRequestKeywords(
  limit = 20,
): Promise<RequestKeywordCount[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data } = await sb
    .from("quick_feedback")
    .select("message")
    .like("message", "%요청%");

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const { keyword } = parseRequestMessage(
      (row as { message: string }).message,
    );
    if (!keyword) continue;
    counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));
}

/** 요청 건수 (대시보드 KPI용) */
export async function fetchPendingRequestCount(): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb) return 0;

  const { count } = await sb
    .from("quick_feedback")
    .select("id", { count: "exact", head: true })
    .like("message", "%요청%")
    .eq("status", "pending");

  return count ?? 0;
}

/** 요청 상태 변경 */
export async function updateRequestStatus(
  id: number,
  status: RequestStatus,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;

  const { error } = await sb
    .from("quick_feedback")
    .update({ status })
    .eq("id", id);

  return !error;
}
