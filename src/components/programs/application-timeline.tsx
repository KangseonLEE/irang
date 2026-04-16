"use client";

import { Calendar, Clock } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./application-timeline.module.css";

interface ApplicationTimelineProps {
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getDaysText(days: number): string {
  if (days === 0) return "오늘";
  if (days === 1) return "내일";
  return `${days}일`;
}

export function ApplicationTimeline({
  applicationStart,
  applicationEnd,
  status,
}: ApplicationTimelineProps) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(applicationStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(applicationEnd);
  end.setHours(23, 59, 59, 999);

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const progress = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 0;

  const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / 86400000);
  const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / 86400000);

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <Icon icon={Calendar} size="sm" />
        <span className={s.headerLabel}>신청 기간</span>
      </div>

      <div className={s.dates}>
        <span className={s.dateStart}>{formatShortDate(applicationStart)}</span>
        <span className={s.dateSep}>~</span>
        <span className={s.dateEnd}>{formatShortDate(applicationEnd)}</span>
      </div>

      <div className={s.bar}>
        <div
          className={`${s.barFill} ${status === "모집중" ? s.barActive : status === "모집예정" ? s.barUpcoming : s.barClosed}`}
          style={{ width: `${progress}%` }}
        />
        {status === "모집중" && progress > 0 && progress < 100 && (
          <div className={s.barMarker} style={{ left: `${progress}%` }} />
        )}
      </div>

      <div className={s.info}>
        <Icon icon={Clock} size="xs" />
        {status === "모집중" && daysUntilEnd > 0 && (
          <span>마감까지 <strong>{getDaysText(daysUntilEnd)}</strong> 남았어요</span>
        )}
        {status === "모집중" && daysUntilEnd <= 0 && (
          <span>오늘 마감이에요</span>
        )}
        {status === "모집예정" && daysUntilStart > 0 && (
          <span>접수 시작까지 <strong>{getDaysText(daysUntilStart)}</strong> 남았어요</span>
        )}
        {status === "모집예정" && daysUntilStart <= 0 && (
          <span>곧 접수가 시작돼요</span>
        )}
        {status === "마감" && (
          <span>접수가 마감되었어요</span>
        )}
      </div>
    </div>
  );
}
