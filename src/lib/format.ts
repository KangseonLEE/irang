/**
 * 공용 포맷 유틸리티
 * - 지역 통계, 모달 등에서 공통으로 사용하는 포맷 함수
 */

/** 인구수를 "N만명" 또는 "N명" 형식으로 포맷 */
export function formatPopulation(pop: number): string {
  if (pop >= 10000) {
    return `${Math.round(pop / 10000)}만명`;
  }
  return `${pop.toLocaleString()}명`;
}

/** 서울 면적 기준 상수 (km²) */
export const SEOUL_AREA_KM2 = 605;

/** "2026-05-15" → "2026. 5. 15 (금)" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${dayNames[d.getDay()]})`;
}

/** "2026-05-15" ~ "2026-05-20" → formatted range (같은 달이면 간략 표시) */
export function formatDateRange(start: string, end: string | null): string {
  if (!end) return formatDate(start);
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    return `${s.getFullYear()}. ${s.getMonth() + 1}. ${s.getDate()} ~ ${e.getDate()} (${dayNames[e.getDay()]})`;
  }
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}
