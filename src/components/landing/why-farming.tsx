import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { DataSource } from "@/components/ui/data-source";
import {
  trendStats,
  trendReasons,
  cityVsRural,
} from "@/lib/data/landing";
import s from "./why-farming.module.css";

const COMPARE_PICKS = ["월 생활비", "주거비 (3.3㎡당)", "출퇴근", "생활 만족도"];

export function WhyFarming() {
  const picks = cityVsRural.filter((r) => COMPARE_PICKS.includes(r.label));
  const hero = trendStats[0]; // 1.2만
  const subs = trendStats.slice(1); // 13.1%, 70%

  return (
    <section className={s.section} aria-label="귀농 동기">
      <div className={s.header}>
        <div className={s.headerLeft}>
          <span className={s.eyebrow}>#귀농 트렌드</span>
          <h2 className={s.title}>왜 <em>귀농</em>을 할까?</h2>
          <p className={s.subtitle}>
            매년 1.2만 명이 도시를 떠나 농촌을 선택하고 있어요
          </p>
        </div>
        <Link href="/stats" className={s.moreLink}>
          자세히 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      {/* ── 벤토 그리드 ── */}
      <div className={s.bento}>
        {/* 히어로 숫자 — 1.2만 */}
        <Link href={hero.href} className={`${s.tile} ${s.tileHero}`}>
          <span className={s.heroValue}>{hero.value}</span>
          <span className={s.heroLabel}>{hero.label}</span>
          <span className={s.heroSub}>{hero.sub}</span>
          <p className={s.heroDesc}>{hero.desc}</p>
          <span className={s.tileArrow}><ArrowRight size={16} /></span>
        </Link>

        {/* 보조 숫자 2개 */}
        {subs.map((stat) => (
          <Link key={stat.label} href={stat.href} className={`${s.tile} ${s.tileStat}`}>
            <span className={s.subValue}>{stat.value}</span>
            <span className={s.subLabel}>{stat.label}</span>
            <span className={s.subSub}>{stat.sub}</span>
            <p className={s.subDesc}>{stat.desc}</p>
            <span className={s.tileArrow}><ArrowRight size={14} /></span>
          </Link>
        ))}

        {/* 귀농 이유 바 차트 */}
        <div className={`${s.tile} ${s.tileReasons}`}>
          <h3 className={s.reasonsTitle}>어떤 이유로 떠났을까?</h3>
          <div className={s.reasonsList}>
            {trendReasons.map((reason, i) => (
              <div key={reason.label} className={s.reasonRow}>
                <span className={s.reasonLabel}>{reason.label}</span>
                <div className={s.reasonBarBg}>
                  <div
                    className={s.reasonBar}
                    data-rank={String(i + 1)}
                    style={{ width: `${(reason.pct / 30) * 100}%` }}
                  />
                </div>
                <span className={s.reasonPct}>{reason.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 도시 vs 농촌 비교 */}
        <div className={`${s.tile} ${s.tileCompare}`}>
          <h3 className={s.compareTitle}>농촌으로 가면 뭐가 달라질까?</h3>
          <div className={s.compareList}>
            {picks.map((row) => (
              <div key={row.label} className={s.compareItem}>
                <span className={s.compareLabel}>{row.label}</span>
                <span className={s.compareChange}>{row.change}</span>
                <span className={s.compareDetail}>
                  {row.city} → {row.rural}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataSource source="통계청 · 농림축산식품부 2025 귀농귀촌 실태조사" />
    </section>
  );
}
