/**
 * 프로그램 상태 판별 유틸리티 (클라이언트/서버 공용)
 *
 * - 신청기간 날짜를 기준으로 현재 상태를 자동 산출
 * - 하드코딩된 status 대신 이 함수를 사용하면 시간 경과에 따라 자동 갱신
 */

export type ProgramStatus = "모집중" | "모집예정" | "마감";

/** 신청기간 기반 상태 판별 (YYYY-MM-DD 문자열) */
export function deriveStatus(
  applicationStart: string,
  applicationEnd: string
): ProgramStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (today < applicationStart) return "모집예정";
  if (today > applicationEnd) return "마감";
  return "모집중";
}
