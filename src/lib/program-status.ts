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

/**
 * 한국 시간(KST) 기준 오늘 날짜 YYYY-MM-DD.
 * Vercel 서버는 UTC 동작 — toISOString().slice(0,10)을 쓰면 한국 자정~오전 9시 9시간 동안
 * today가 어제 날짜로 잘못 계산되어 마감/모집 전환이 9시간 지연됨.
 */
function kstToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** 신청기간 기반 상태 판별 (YYYY-MM-DD 문자열) */
export function deriveStatus(
  applicationStart?: string | null,
  applicationEnd?: string | null,
): ProgramStatus {
  const today = kstToday();
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

/**
 * 신청 시작·종료가 모두 9999-12-31 = 공고 미발표(일자 미정) 페어.
 * deriveStatus는 이 페어를 "모집예정"으로 산출하지만, 실제 의미는 "공고 발표 예정"
 * (format.ts SSOT와 정합)이라 표시 계층·필터에서 별도 분기가 필요하다.
 */
export function isUnannounced(
  applicationStart?: string | null,
  applicationEnd?: string | null,
): boolean {
  return applicationStart === ALWAYS_OPEN && applicationEnd === ALWAYS_OPEN;
}

/** 공고 미발표(9999 페어) 표시 라벨 — format.ts "공고 발표 예정" SSOT와 일치 */
export const UNANNOUNCED_LABEL = "공고 발표 예정";

/**
 * StatusBadge·목록 표기용 status 라벨.
 * 9999 페어는 deriveStatus의 "모집예정" 대신 "공고 발표 예정"으로 표기한다.
 * ProgramStatus 타입은 변경하지 않으며, 반환 타입만 string으로 확장한다.
 */
export function deriveStatusLabel(
  applicationStart?: string | null,
  applicationEnd?: string | null,
): string {
  if (isUnannounced(applicationStart, applicationEnd)) return UNANNOUNCED_LABEL;
  return deriveStatus(applicationStart, applicationEnd);
}

/** 마감까지 남은 일수 (음수면 이미 마감, 상시모집이면 Infinity). KST 기준. */
export function daysUntilDeadline(applicationEnd?: string | null): number {
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) return Infinity;
  const today = new Date(kstToday() + "T00:00:00+09:00");
  const end = new Date(applicationEnd + "T00:00:00+09:00");
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * createdAt 기준 14일 이내 + 마감되지 않은 프로그램만 "신규"로 판정.
 * Sprint S (2026-05-20): program-card.tsx → lib로 이동 (컴포넌트 export 의존성 제거).
 */
const NEW_THRESHOLD_DAYS = 14;

export function isNewProgram(createdAt?: string, status?: string): boolean {
  if (!createdAt) return false;
  if (status === "마감") return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs >= 0 && diffMs < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

/** 체험행사 신청기간 기반 상태 판별 (KST) */
export function deriveEventStatus(
  applicationStart?: string,
  applicationEnd?: string,
  dateEnd?: string | null,
): EventStatus {
  const today = kstToday();
  const end = applicationEnd ?? dateEnd ?? null;
  const start = applicationStart ?? null;
  if (start && today < start) return "접수예정";
  if (end && today > end) return "마감";
  return "접수중";
}
