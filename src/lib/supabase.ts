/**
 * Supabase 클라이언트 설정
 * - 서버/클라이언트 양쪽에서 사용 가능
 * - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 필요
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Supabase가 설정되어 있는지 확인 */
export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

/**
 * Public (anon) 클라이언트 — 읽기 전용 용도
 * - 브라우저 + 서버 컴포넌트 양쪽에서 사용
 * - RLS policy에 의해 읽기만 가능
 */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

/**
 * Service role 클라이언트 — 쓰기 용도 (서버 전용)
 * - API Route / Edge Function / 마이그레이션 스크립트에서만 사용
 * - SUPABASE_SERVICE_ROLE_KEY 필요
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ── 검색 로그 ─���

/**
 * 검색어를 search_logs 테이블에 기록 (클라이언트에서 호출)
 * - anon key로 INSERT 가능 (RLS: public insert)
 * - 빈 검색어, 2자 미만은 무시
 * - fire-and-forget (에러 시 조용히 무시)
 */
export function logSearch(query: string, resultCount: number): void {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;

  const sb = getSupabase();
  if (!sb) return;

  sb.from("search_logs")
    .insert({ query: trimmed, result_count: resultCount })
    .then(({ error }) => {
      if (error) console.warn("[search-log] insert failed:", error.message);
    });
}

/**
 * 최근 N일간 인기 검색어 조회 (서버 사이드 전용)
 * - get_trending_searches RPC 함수 호출
 * - service role key 필요
 */
export async function getTrendingSearches(
  daysBack = 7,
  maxResults = 12
): Promise<{ query: string; count: number }[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  try {
    const { data, error } = await sb.rpc("get_trending_searches", {
      days_back: daysBack,
      max_results: maxResults,
    });

    if (error || !data) return [];

    return (data as { query: string; search_count: number }[]).map((row) => ({
      query: row.query,
      count: Number(row.search_count),
    }));
  } catch {
    return [];
  }
}

// ── DB Row 타입 (쿼리 결과 매핑용) ──

export interface ProgramRow {
  slug: string;
  title: string;
  summary: string;
  region: string;
  organization: string;
  support_type: string;
  support_amount: string;
  eligibility_age_min: number;
  eligibility_age_max: number;
  eligibility_detail: string;
  application_start: string;
  application_end: string;
  status: string;
  related_crops: string[] | null;
  source_url: string;
  link_status: string | null;
  year: number;
}

export interface EducationRow {
  slug: string;
  title: string;
  region: string;
  organization: string;
  type: string;
  duration: string;
  schedule: string;
  target: string;
  cost: string;
  description: string;
  capacity: number | null;
  application_start: string;
  application_end: string;
  status: string;
  level: string;
  url: string;
  link_status: string | null;
}

export interface EventRow {
  slug: string;
  title: string;
  region: string;
  organization: string;
  type: string;
  date_start: string;
  date_end: string | null;
  location: string;
  cost: string;
  description: string;
  capacity: number | null;
  target: string;
  url: string;
  status: string;
}
