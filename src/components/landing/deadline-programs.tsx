import Link from "next/link";
import { ArrowRight, Clock, ChevronRight } from "lucide-react";
import { PROGRAMS } from "@/lib/data/programs";
import { deriveStatus, daysUntilDeadline } from "@/lib/program-status";
import s from "./deadline-programs.module.css";

const DEADLINE_THRESHOLD_DAYS = 14;

export function DeadlinePrograms() {
  const approaching = PROGRAMS
    .map((p) => ({
      ...p,
      status: deriveStatus(p.applicationStart, p.applicationEnd),
      daysLeft: daysUntilDeadline(p.applicationEnd),
    }))
    .filter((p) => p.status === "모집중" && p.daysLeft >= 0 && p.daysLeft <= DEADLINE_THRESHOLD_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  if (approaching.length === 0) return null;

  return (
    <section className={s.section} aria-label="마감 임박 지원사업">
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Clock size={18} className={s.headerIcon} />
          <h2 className={s.title}>마감이 다가오는 지원사업</h2>
        </div>
        <Link href="/programs" className={s.viewAll}>
          전체 보기 <ArrowRight size={14} />
        </Link>
      </div>
      <div className={s.list}>
        {approaching.map((p) => (
          <Link
            key={p.id}
            href={`/programs/${p.id}`}
            className={s.card}
          >
            <div className={s.cardBody}>
              <div className={s.cardTopRow}>
                <span className={s.dday}>
                  {p.daysLeft === 0 ? "오늘 마감" : `D-${p.daysLeft}`}
                </span>
                <span className={s.region}>{p.region}</span>
              </div>
              <h3 className={s.cardTitle}>{p.title}</h3>
              <p className={s.cardDesc}>{p.summary}</p>
              <div className={s.cardMeta}>
                <span className={s.badge}>{p.supportType}</span>
                <span className={s.date}>~{p.applicationEnd.slice(5).replace("-", ".")}</span>
              </div>
            </div>
            <ChevronRight size={16} className={s.arrow} />
          </Link>
        ))}
      </div>
    </section>
  );
}
