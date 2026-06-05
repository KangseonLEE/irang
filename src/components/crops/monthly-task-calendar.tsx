"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CROP_CALENDARS, type MonthlyTask } from "@/lib/data/crop-calendar";
import s from "./monthly-task-calendar.module.css";

interface MonthlyTaskCalendarProps {
  cropId: string;
}

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const SHORT_MONTH = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const INTENSITY_CELL: Record<MonthlyTask["intensity"], string> = {
  상: s.cellHigh,
  중: s.cellMedium,
  하: s.cellLow,
  없음: s.cellNone,
};

const INTENSITY_LABEL: Record<MonthlyTask["intensity"], string> = {
  상: "작업 많음",
  중: "작업 보통",
  하: "작업 적음",
  없음: "휴지기",
};

const LEGEND: { intensity: MonthlyTask["intensity"]; label: string }[] = [
  { intensity: "없음", label: "휴지기" },
  { intensity: "하", label: "적음" },
  { intensity: "중", label: "보통" },
  { intensity: "상", label: "많음" },
];

export function MonthlyTaskCalendar({ cropId }: MonthlyTaskCalendarProps) {
  const calendar = CROP_CALENDARS.find((c) => c.cropId === cropId);
  // 활성 툴팁 month (터치/키보드 대응). null = 없음
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  if (!calendar) return null;

  const currentMonth = new Date().getMonth() + 1; // 1-based
  // month 순으로 정렬 (데이터 순서 의존 제거)
  const tasks = [...calendar.tasks].sort((a, b) => a.month - b.month);
  const currentTask = tasks.find((t) => t.month === currentMonth);

  const renderCell = (task: MonthlyTask) => {
    const isCurrent = task.month === currentMonth;
    const isActive = activeMonth === task.month;
    const isIdle = task.intensity === "없음";

    return (
      <div key={task.month} className={s.cellWrap}>
        <button
          type="button"
          className={`${s.cell} ${INTENSITY_CELL[task.intensity]} ${isCurrent ? s.cellCurrent : ""}`}
          aria-label={`${MONTH_LABELS[task.month - 1]} ${isIdle ? "휴지기" : task.task}, ${INTENSITY_LABEL[task.intensity]}`}
          aria-pressed={isActive}
          onMouseEnter={() => setActiveMonth(task.month)}
          onMouseLeave={() => setActiveMonth((m) => (m === task.month ? null : m))}
          onFocus={() => setActiveMonth(task.month)}
          onBlur={() => setActiveMonth((m) => (m === task.month ? null : m))}
          onClick={() =>
            setActiveMonth((m) => (m === task.month ? null : task.month))
          }
        >
          {isCurrent && <span className={s.pointer} aria-hidden="true" />}
          <span className={s.cellMonth}>{SHORT_MONTH[task.month - 1]}</span>
        </button>
        {isActive && (
          <div className={s.tooltip} role="tooltip">
            <span className={s.tooltipMonth}>{MONTH_LABELS[task.month - 1]}</span>
            <span className={s.tooltipTask}>{isIdle ? "휴지기" : task.task}</span>
            <span className={s.tooltipDetail}>{task.detail}</span>
          </div>
        )}
      </div>
    );
  };

  const firstHalf = tasks.filter((t) => t.month <= 6);
  const secondHalf = tasks.filter((t) => t.month >= 7);

  return (
    <section id="monthly-calendar" className={s.section}>
      <div className={s.card}>
        <div className={s.head}>
          <h2 className={s.sectionHeader}>
            <Icon icon={Calendar} size="lg" />
            연간 작업 흐름
          </h2>
          {currentTask && currentTask.intensity !== "없음" && (
            <span className={s.currentBadge}>
              {currentMonth}월: {currentTask.task}
            </span>
          )}
        </div>

        {/* 데스크탑: 12개월 1행 strip */}
        <div className={s.stripDesktop}>{tasks.map(renderCell)}</div>

        {/* 모바일: 상반기/하반기 2행 strip */}
        <div className={s.stripMobile}>
          <div className={s.halfRow}>
            <span className={s.halfLabel}>상반기</span>
            <div className={s.halfCells}>{firstHalf.map(renderCell)}</div>
          </div>
          <div className={s.halfRow}>
            <span className={s.halfLabel}>하반기</span>
            <div className={s.halfCells}>{secondHalf.map(renderCell)}</div>
          </div>
        </div>

        {/* 색상 범례 */}
        <div className={s.legend}>
          {LEGEND.map((item) => (
            <span key={item.intensity} className={s.legendItem}>
              <span
                className={`${s.legendSwatch} ${INTENSITY_CELL[item.intensity]}`}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </div>

        <p className={s.note}>
          중부 기준이에요. 남부·제주는 1~2주 빠를 수 있어요.
        </p>
      </div>
    </section>
  );
}
