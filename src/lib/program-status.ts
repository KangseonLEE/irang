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

const DAY_MS = 24 * 60 * 60 * 1000;
/** KST = UTC+9 고정 (1988년 이후 서머타임 없음) */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 한국 시간(KST) 기준 오늘 날짜 YYYY-MM-DD.
 * Vercel 서버는 UTC 동작 — 오프셋 없이 toISOString().slice(0,10)을 쓰면 한국 자정~오전 9시
 * 9시간 동안 today가 어제 날짜로 잘못 계산되어 마감/모집 전환이 9시간 지연됨(5/26 박제).
 * 여기서는 +9h 를 더한 뒤 자르므로 서버(UTC)·브라우저(어느 타임존·로케일이든) 결과가 같다.
 * Intl(en-CA) 포맷에 기대지 않는다 — 브라우저 ICU 버전마다 날짜 모양이 바뀐 전례가 있다.
 *
 * 하이드레이션 규칙(10/3): 클라이언트 컴포넌트가 렌더 중 이 값을 직접 부르면 ISR 스냅샷 날짜와
 * 방문자 날짜가 갈려 React #418 이 난다. 서버가 `asOf={kstToday()}` 로 넘기고 클라이언트는
 * `useKstToday(asOf)`(lib/hooks/use-kst-today) 로 읽는다.
 */
export function kstToday(nowMs: number = Date.now()): string {
  return new Date(nowMs + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD"(뒤에 시각이 붙어도 앞 10자) → UTC 기준 일 번호. 타임존 무관 */
function dayNumber(date: string): number {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

/** 두 날짜(YYYY-MM-DD) 사이 달력 일수 — `to` 가 뒤면 양수. 타임존·시각 무관 */
export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}

/** ISO 시각(또는 YYYY-MM-DD) → 그 순간의 KST 날짜 YYYY-MM-DD */
function kstDateOf(iso: string): string {
  return kstToday(new Date(iso).getTime());
}

/**
 * 신청기간 기반 상태 판별 (YYYY-MM-DD 문자열).
 * `today` 를 넘기면 그 날 기준(하이드레이션 안전), 생략하면 지금 KST 날짜.
 */
export function deriveStatus(
  applicationStart?: string | null,
  applicationEnd?: string | null,
  today: string = kstToday(),
): ProgramStatus {
  // 상시모집: applicationEnd가 없거나 ALWAYS_OPEN이면 마감 없음
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) {
    if (!applicationStart || today >= applicationStart) return "모집중";
    return "모집예정";
  }
  // 시작일 미상(null 또는 9999) + 마감일 확정 — 마감일까지 모집중. 표기(format.ts "~ {마감일}")와 같은 판정.
  // 10/3 RDA 수집기가 상세 보강에 실패한 행을 "시작 9999 + 실제 마감일"로 두면서 생긴 조합(정적 데이터엔 0건).
  if (!applicationStart || applicationStart === ALWAYS_OPEN) return today > applicationEnd ? "마감" : "모집중";
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

/**
 * 마감까지 남은 일수 (0 = 오늘 마감, 음수면 이미 마감, 상시모집이면 Infinity). KST 기준.
 * `today`(YYYY-MM-DD) 를 넘기면 그 날 기준 — 클라이언트 트리에서 SSR 되는 곳은 반드시 넘긴다.
 */
export function daysUntilDeadline(
  applicationEnd?: string | null,
  today: string = kstToday(),
): number {
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) return Infinity;
  return daysBetween(today, applicationEnd);
}

/**
 * createdAt 기준 14일 이내 + 마감되지 않은 프로그램만 "신규"로 판정.
 * Sprint S (2026-05-20): program-card.tsx → lib로 이동 (컴포넌트 export 의존성 제거).
 *
 * `today`(KST YYYY-MM-DD) 를 넘기면 날짜 단위로 센다 — 등록일(KST)부터 14일째 전날까지.
 * 생략하면 종전대로 지금 시각과의 ms 차이. SSR 되는 클라이언트 트리는 today 를 넘겨야
 * 서버·브라우저 판정이 같다(10/3).
 */
const NEW_THRESHOLD_DAYS = 14;

export function isNewProgram(createdAt?: string, status?: string, today?: string): boolean {
  if (!createdAt) return false;
  if (status === "마감") return false;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  if (today) {
    const diffDays = daysBetween(kstDateOf(createdAt), today);
    return diffDays >= 0 && diffDays < NEW_THRESHOLD_DAYS;
  }
  const diffMs = Date.now() - created.getTime();
  return diffMs >= 0 && diffMs < NEW_THRESHOLD_DAYS * DAY_MS;
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

/** 연례 창구형(9999 페어 + applicationCycle) 상태 배지 라벨 */
export const CYCLE_LABEL = "정기 접수";

/**
 * 상태 배지 라벨 SSOT (9/27): 9999 페어인데 접수 시기(applicationCycle)가 있으면 "정기 접수",
 * 시기도 없으면 "공고 발표 예정", 그 외는 deriveStatus 값.
 */
export function programStatusLabel(p: {
  status: ProgramStatus;
  applicationStart?: string | null;
  applicationEnd?: string | null;
  applicationCycle?: string | null;
}): string {
  if (!isUnannounced(p.applicationStart ?? undefined, p.applicationEnd ?? undefined)) return p.status;
  return p.applicationCycle?.trim() ? CYCLE_LABEL : UNANNOUNCED_LABEL;
}

