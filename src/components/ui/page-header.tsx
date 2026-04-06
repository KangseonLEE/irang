import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import s from "./page-header.module.css";

interface PageHeaderProps {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  count?: number;
  periodLabel?: string;
}

export function PageHeader({
  icon,
  label,
  title,
  description,
  count,
  periodLabel,
}: PageHeaderProps) {
  return (
    <div className={s.pageHeader}>
      <div className={s.headerTop}>
        {icon}
        {label}
      </div>
      <h1 className={s.headerTitle}>{title}</h1>
      <p className={s.headerDesc}>{description}</p>
      {(count != null || periodLabel) && (
        <div className={s.headerMeta}>
          {count != null && (
            <p className={s.headerCount}>
              총 <span className={s.headerCountNumber}>{count}</span>건
            </p>
          )}
          {periodLabel && (
            <span className={s.headerPeriod}>
              <CalendarDays size={14} />
              {periodLabel} 기준
            </span>
          )}
        </div>
      )}
    </div>
  );
}
