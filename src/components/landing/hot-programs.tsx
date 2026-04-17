import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { PROGRAMS } from "@/lib/data/programs";
import { deriveStatus } from "@/lib/program-status";
import s from "./hot-programs.module.css";

/** 랜딩에 노출할 추천 프로그램 ID (우선순위 순) */
const FEATURED_IDS = ["SP-001", "SP-002", "SP-011", "SP-005"];

export function HotPrograms() {
  const programs = FEATURED_IDS
    .map((id) => PROGRAMS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => {
      if (!p) return false;
      const status = deriveStatus(p.applicationStart, p.applicationEnd);
      return status !== "마감";
    })
    .slice(0, 4);

  if (programs.length === 0) return null;

  return (
    <section className={s.section} aria-label="주요 지원사업">
      <div className={s.header}>
        <div className={s.heading}>
          <span className={s.eyebrow}>#모집 중인 공고</span>
          <h2 className={s.title}>지금 신청할 수 있는 <em>지원사업</em></h2>
          <p className={s.subtitle}>
            귀농을 준비하는 분들이 가장 많이 찾는 공고예요
          </p>
        </div>
        <Link href="/programs" className={s.viewAll}>
          전체 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <div className={s.grid}>
        {programs.map((p) => (
          <Link key={p.id} href={`/programs/${p.id}`} className={s.card}>
            <div className={s.cardTopRow}>
              <span className={s.tag}>{p.supportType}</span>
              <span className={s.region}>{p.region}</span>
            </div>
            <h3 className={s.cardTitle}>{p.title}</h3>
            <span className={s.amount}>{p.supportAmount}</span>
            <div className={s.cardBottom}>
              <span className={s.type}>{p.supportType}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
