/**
 * 프로그램 상태 판별 유틸리티 (클라이언트/서버 공용)
 *
 * - 신청기간 날짜를 기준으로 현재 상태를 자동 산출
 * - 하드코딩된 status 대신 이 함수를 사용하면 시간 경과에 따라 자동 갱신
 */

export type ProgramStatus = "모집중" | "모집예정" | "마감";
export type EventStatus = "접수중" | "접수예정" | "마감";

/** 상시모집 마커 — applicationEnd에 이 값이면 마감 없는 상시 프로그램 */
export const ALWAYS_OPEN = "9999-12-31";

/** 신청기간 기반 상태 판별 (YYYY-MM-DD 문자열) */
export function deriveStatus(
  applicationStart?: string | null,
  applicationEnd?: string | null,
): ProgramStatus {
  const today = new Date().toISOString().slice(0, 10);
  // 상시모집: applicationEnd가 없거나 ALWAYS_OPEN이면 마감 없음
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) {
    if (!applicationStart || today >= applicationStart) return "모집중";
    return "모집예정";
  }
  if (!applicationStart) return today > applicationEnd ? "마감" : "모집중";
  if (today < applicationStart) return "모집예정";
  if (today > applicationEnd) return "마감";
  return "모집중";
}

/** 마감까지 남은 일수 (음수면 이미 마감, 상시모집이면 Infinity) */
export function daysUntilDeadline(applicationEnd?: string | null): number {
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(applicationEnd + "T00:00:00");
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** 체험행사 신청기간 기반 상태 판별 */
export function deriveEventStatus(
  applicationStart?: string,
  applicationEnd?: string,
  dateEnd?: string | null,
): EventStatus {
  const today = new Date().toISOString().slice(0, 10);
  const end = applicationEnd ?? dateEnd ?? null;
  const start = applicationStart ?? null;
  if (start && today < start) return "접수예정";
  if (end && today > end) return "마감";
  return "접수중";
}
