/**
 * 데이터 갱신 메타 로더 — data_sync_log 기반 periodLabel·기준 연도
 *
 * 2026-09-02 정리: 여기 있던 loadPrograms/loadEducation/loadEvents 하이브리드 로더는
 * 프로덕션 호출 0건인 중복 구현이었다(실제 경로는 각 데이터 모듈의 동명 함수 —
 * programs.ts::loadPrograms → filterProgramsAsync). 회귀 테스트가 이 죽은 구현을 보던
 * 문제(loadPrograms.test.ts)를 실제 경로로 교정하면서 함께 삭제. 메타 함수 3종만 유지.
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

// ═══════════════════════════════════════
// 0. 갱신 메타 정보
// ═══════════════════════════════════════

/**
 * 데이터 갱신 메타 정보 조회
 * - data_sync_log에서 해당 테이블의 최신 성공 sync 시각을 반환
 * - Supabase 미설정 또는 로그 없으면 null 반환
 */
export async function loadSyncMeta(
  tableName: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from("data_sync_log")
      .select("created_at")
      .eq("table_name", tableName)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.created_at) {
      return data.created_at;
    }
  } catch {
    // Supabase 에러 → null
  }

  return null;
}

/**
 * periodLabel 자동 생성
 * - sync 시각이 있으면 해당 날짜 기반, 없으면 fallbackPeriod("YYYY-MM") 기반
 */
export function buildPeriodLabel(
  lastSyncAt: string | null,
  fallbackPeriod: string
): string {
  if (lastSyncAt) {
    const d = new Date(lastSyncAt);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }
  const [pYear, pMonth] = fallbackPeriod.split("-");
  return `${pYear}년 ${parseInt(pMonth)}월`;
}

/**
 * 데이터 기준 연도 추출
 * - sync 시각이 있으면 해당 연도, 없으면 현재 연도
 */
export function getDataYear(lastSyncAt: string | null): number {
  if (lastSyncAt) {
    return new Date(lastSyncAt).getFullYear();
  }
  return new Date().getFullYear();
}
