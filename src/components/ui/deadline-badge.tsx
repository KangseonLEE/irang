import { daysUntilDeadline, ALWAYS_OPEN } from "@/lib/program-status";
import s from "./deadline-badge.module.css";

interface DeadlineBadgeProps {
  /** 신청 종료일 (YYYY-MM-DD). undefined/null/ALWAYS_OPEN이면 상시 표시 */
  applicationEnd?: string | null;
  /** 마감된 사업은 숨김 (이미 StatusBadge가 표시) */
  status?: string;
}

/**
 * 마감 임박 D-N 시각화 배지
 * - D-3 이내: 빨강(--error) 강조
 * - D-4~D-7: 앰버(--warning)
 * - D-8~D-30: 표시 안 함 (그냥 신청기간만)
 * - 상시: "상시"
 * - 마감 / 미정(9999): 표시 안 함
 */
export function DeadlineBadge({ applicationEnd, status }: DeadlineBadgeProps) {
  // 마감된 사업은 표시 안 함
  if (status === "마감") return null;

  // 상시모집
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) {
    return <span className={s.always}>상시</span>;
  }

  const days = daysUntilDeadline(applicationEnd);

  // 이미 마감(음수) 또는 미정/먼 미래(Infinity)
  if (days < 0 || !Number.isFinite(days)) return null;

  // D-30 초과는 표시 안 함
  if (days > 7) return null;

  // D-day (오늘 마감)
  if (days === 0) {
    return <span className={s.urgent}>오늘 마감</span>;
  }

  // D-3 이내 — 빨강
  if (days <= 3) {
    return <span className={s.urgent}>마감 D-{days}</span>;
  }

  // D-7 이내 — 앰버
  return <span className={s.warning}>마감 D-{days}</span>;
}
