/**
 * 어드민 대시보드 Supabase 쿼리
 *
 * Server Component에서 직접 호출 (service_role key 사용).
 * 모든 함수는 Supabase 미설정 시 빈 데이터 반환.
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  QuickFeedbackRow,
  SearchLogRow,
  TopKeyword,
  DailySearchCount,
  AssessmentRow,
  TypeDistribution,
  AdminKpi,
} from "./types";

// ── 유틸 ──

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
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
      .from("assessments")
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
    .from("assessments")
    .select("result_type")
    .gte("created_at", daysAgo(days));

  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const t = (row as { result_type: string }).result_type;
    counts.set(t, (counts.get(t) ?? 0) + 1);
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
    .from("assessments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { data: (data as AssessmentRow[]) ?? [], total: count ?? 0 };
}
