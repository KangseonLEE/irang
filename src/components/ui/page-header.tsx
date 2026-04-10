import type { ReactNode } from "react";
import { CalendarDays, Info } from "lucide-react";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page-header.module.css";

interface PageHeaderProps {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  count?: number;
  periodLabel?: string;
  /** 데이터 기준 안내 (예: "2026년 데이터만 제공되며, 연도 변경은 지원되지 않습니다") */
  dataNote?: string;
}

export function PageHeader({
  icon,
  label,
  title,
  description,
  count,
  periodLabel,
  dataNote,
}: PageHeaderProps) {
  return (
    <div className={s.pageHeader}>
      <div className={s.headerTop}>
        {icon}
        {label}
      </div>
      <h1 className={s.headerTitle}>{title}</h1>
      <p className={s.headerDesc}><AutoGlossary text={description} /></p>
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
      {dataNote && (
        <p className={s.dataNote}>
          <Info size={12} aria-hidden="true" />
          {dataNote}
        </p>
      )}
    </div>
  );
}
