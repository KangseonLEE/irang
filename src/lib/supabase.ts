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
 * - 싱글턴: 모듈 로드 시 1회만 생성, 이후 재사용
 */
let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceRoleKey) return null;
  if (!_adminClient) {
    _adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return _adminClient;
}

// ── 검색 로그 ─���

/**
 * 자연어 형태의 검색어인지 휴리스틱 판정.
 * 자연어는 키워드 통계로서 의미가 약하므로 수집에서 제외
 * (David 원칙: "자연어 통합검색 안 함").
 *
 * 시그널 (하나라도 충족 시 자연어):
 * - 물음표 포함 (?)
 * - 의문/감정 단어 포함 (어떻/어느/왜/어디/언제/무엇/얼마/어떤/있나/되나/가능 등)
 * - 길이 20자 초과
 * - 공백 분리 단어 5개 이상
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

/**
 * 검색어를 search_logs 테이블에 기록 (서버 사이드 Route Handler 경유)
 * - /api/search-log POST → service_role key로 INSERT
 * - 빈 검색어, 2자 미만은 무시
 * - 자연어 형태(의문문·문장)는 무시 — 키워드 통계만 수집
 * - fire-and-forget (에러 시 조용히 무시)
 */
export function logSearch(query: string, resultCount: number): void {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;
  if (isNaturalLanguageQuery(trimmed)) return;

  fetch("/api/search-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: trimmed, resultCount }),
  }).catch(() => {
    // fire-and-forget: 실패 시 조용히 무시
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
  description: string;
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
  created_at: string;
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
  application_start: string | null;
  application_end: string | null;
  location: string;
  cost: string;
  description: string;
  capacity: number | null;
  target: string;
  url: string;
  status: string;
}
