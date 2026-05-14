import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CropImage } from "@/components/ui/crop-image";
import s from "./metric-card.module.css";

// ============================================================================
// 공통 타입
// ============================================================================

export interface CropRowMeta {
  /** 작물 식별자 (key + thumbnail 소스) */
  cropId: string;
  /** 작물 이름 (서브 라벨 + thumbnail alt) */
  cropName: string;
}

// ============================================================================
// CropMetricCard — 막대 + 수치 (numeric metric)
// 토스 스타일: 큰 수치 + 단위 일관 + best 시각 강조
// ============================================================================

export interface NumericRow extends CropRowMeta {
  /** 수치 값 — null 이면 데이터 없음 */
  value: number | null;
  /** 막대 위 표기용 raw 텍스트 (예: "1,200~1,500") — value 가 null 이거나 범위 표시 시 */
  displayText?: string;
}

interface CropMetricCardProps {
  title: string;
  unit: string;
  icon: LucideIcon;
  /** "highest"=가장 큰 값을 best 로, "lowest"=가장 작은 값을 best 로 강조 */
  emphasis: "highest" | "lowest";
  emphasisLabelHighest: string;
  emphasisLabelLowest: string;
  rows: NumericRow[];
}

export function CropMetricCard({
  title,
  unit,
  icon,
  emphasis,
  emphasisLabelHighest,
  emphasisLabelLowest,
  rows,
}: CropMetricCardProps) {
  const validRows = rows.filter(
    (r): r is NumericRow & { value: number } => r.value !== null,
  );

  if (validRows.length === 0) {
    return (
      <article className={s.metricCard}>
        <header className={s.metricCardHeader}>
          <span className={s.metricCardIcon}>
            <Icon icon={icon} size="sm" />
          </span>
          <h3 className={s.metricCardTitle}>{title}</h3>
          <span className={s.metricCardUnit}>{unit}</span>
        </header>
        <p className={s.metricCardEmpty}>측정값이 없어요</p>
      </article>
    );
  }

  const maxVal = Math.max(...validRows.map((r) => r.value));
  const minVal = Math.min(...validRows.map((r) => r.value));
  const range = maxVal - minVal;
  const barPercent = (v: number) =>
    range === 0 ? 100 : 35 + ((v - minVal) / range) * 65;

  const targetVal = emphasis === "highest" ? maxVal : minVal;
  const target = validRows.find((r) => r.value === targetVal);

  return (
    <article className={s.metricCard}>
      <header className={s.metricCardHeader}>
        <span className={s.metricCardIcon}>
          <Icon icon={icon} size="sm" />
        </span>
        <h3 className={s.metricCardTitle}>{title}</h3>
        <span className={s.metricCardUnit}>{unit}</span>
      </header>
      <ul className={s.metricRowList}>
        {rows.map((r) => {
          const isTarget = r.value !== null && r.value === targetVal;
          return (
            <li key={r.cropId} className={s.metricRow}>
              <span className={s.metricRowLabel}>
                <CropImage cropId={r.cropId} cropName={r.cropName} size="inline" />
                {r.cropName}
              </span>
              <div
                className={`${s.metricRowBarTrack} ${isTarget ? s.metricRowBarTrackTarget : ""}`}
              >
                {r.value !== null && (
                  <div
                    className={`${s.metricRowBar} ${isTarget ? s.metricRowBarTarget : ""}`}
                    style={{ width: `${barPercent(r.value)}%` }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`${s.metricRowValue} ${isTarget ? s.metricRowValueTarget : ""}`}
                >
                  {r.value === null
                    ? "—"
                    : (r.displayText ?? r.value.toLocaleString())}
                  {r.value !== null && (
                    <span className={s.metricRowUnit}>{unit}</span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {target && validRows.length >= 2 && (
        <footer className={s.metricCardFooter}>
          <span className={s.metricCardFooterLabel}>
            {emphasis === "highest"
              ? emphasisLabelHighest
              : emphasisLabelLowest}
          </span>
          <span className={s.metricCardFooterCrop}>
            <CropImage cropId={target.cropId} cropName={target.cropName} size="inline" />
            {target.cropName}
          </span>
        </footer>
      )}
    </article>
  );
}

// ============================================================================
// CropBadgeMetricCard — 배지 (enum/category metric)
// ============================================================================

export type BadgeTone =
  | "easy"
  | "medium"
  | "hard"
  | "neutral"
  | "primary";

export interface BadgeRow extends CropRowMeta {
  /** 배지 안에 보일 텍스트 */
  badge: string;
  /** 배지 색상 톤 */
  tone: BadgeTone;
  /** 옵션: 배지 우측에 작은 보조 텍스트 */
  subText?: string | null;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  easy: s.toneEasy,
  medium: s.toneMedium,
  hard: s.toneHard,
  neutral: s.toneNeutral,
  primary: s.tonePrimary,
};

interface CropBadgeMetricCardProps {
  title: string;
  icon: LucideIcon;
  rows: BadgeRow[];
  /** 옵션: 카드 footer 한줄 인사이트 (텍스트 + 작물 thumbnail 혼합 가능) */
  footerLabel?: React.ReactNode;
}

export function CropBadgeMetricCard({
  title,
  icon,
  rows,
  footerLabel,
}: CropBadgeMetricCardProps) {
  return (
    <article className={s.metricCard}>
      <header className={s.metricCardHeader}>
        <span className={s.metricCardIcon}>
          <Icon icon={icon} size="sm" />
        </span>
        <h3 className={s.metricCardTitle}>{title}</h3>
      </header>
      <ul className={s.badgeRowList}>
        {rows.map((r) => (
          <li key={r.cropId} className={s.badgeRow}>
            <span className={s.badgeRowLabel}>
              <CropImage cropId={r.cropId} cropName={r.cropName} size="inline" />
              {r.cropName}
            </span>
            <span>
              <span className={`${s.badge} ${TONE_CLASS[r.tone]}`}>
                {r.badge}
              </span>
              {r.subText && (
                <span className={s.badgeSubText}>{r.subText}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {footerLabel && (
        <footer className={s.metricCardFooter}>
          <span className={s.metricCardFooterLabel}>{footerLabel}</span>
        </footer>
      )}
    </article>
  );
}

// ============================================================================
// 그리드 wrapper
// ============================================================================

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className={s.metricGrid}>{children}</div>;
}
