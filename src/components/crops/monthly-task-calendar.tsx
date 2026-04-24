import { Calendar } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CROP_CALENDARS } from "@/lib/data/crop-calendar";
import s from "./monthly-task-calendar.module.css";

interface MonthlyTaskCalendarProps {
  cropId: string;
}

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const INTENSITY_CLASS: Record<string, string> = {
  상: s.intensityHigh,
  중: s.intensityMedium,
  하: s.intensityLow,
  없음: s.intensityNone,
};

export function MonthlyTaskCalendar({ cropId }: MonthlyTaskCalendarProps) {
  const calendar = CROP_CALENDARS.find((c) => c.cropId === cropId);
  if (!calendar) return null;

  const currentMonth = new Date().getMonth() + 1; // 1-based
  const currentTask = calendar.tasks.find((t) => t.month === currentMonth);

  return (
    <section id="monthly-calendar" className={s.section}>
      <details className={s.details}>
        <summary className={s.summary}>
          <h2 className={s.sectionHeader}>
            <Icon icon={Calendar} size="lg" />
            월별 작업 캘린더
          </h2>
          {currentTask && currentTask.intensity !== "없음" && (
            <span className={s.currentBadge}>
              {currentMonth}월: {currentTask.task}
            </span>
          )}
          <span className={s.toggleIcon} aria-hidden="true" />
        </summary>
        <div className={s.grid}>
          {calendar.tasks.map((task) => {
            const isCurrent = task.month === currentMonth;
            const isIdle = task.intensity === "없음";
            return (
              <div
                key={task.month}
                className={`${s.card} ${isCurrent ? s.cardCurrent : ""} ${isIdle ? s.cardIdle : ""}`}
              >
                <div className={s.cardTop}>
                  <span className={`${s.month} ${isCurrent ? s.monthCurrent : ""}`}>
                    {MONTH_LABELS[task.month - 1]}
                  </span>
                  <span className={`${s.intensity} ${INTENSITY_CLASS[task.intensity] ?? s.intensityNone}`}>
                    {task.intensity !== "없음" ? task.intensity : ""}
                  </span>
                </div>
                <p className={s.task}>{task.task}</p>
                <p className={s.detail}>{task.detail}</p>
              </div>
            );
          })}
        </div>
        <p className={s.note}>
          중부 기준이에요. 남부·제주는 1~2주 빠를 수 있어요.
        </p>
      </details>
    </section>
  );
}
