"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import {
  TREND_TYPES,
  TREND_BENTO_PROFILES,
  COST_TYPES,
  COST_TYPE_PROFILES,
  type TrendTypeId,
  type CostTypeId,
  type CostHighlightCard,
} from "@/lib/data/landing";
import { DataSource } from "@/components/ui/data-source";
import s from "./demo-b.module.css";

/* ── 공용 셀렉터 컴포넌트 (B안의 핵심) ── */

interface TypeSelectorProps<T extends string> {
  items: { id: T; label: string }[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}

function TypeSelector<T extends string>({ items, activeId, onChange, ariaLabel }: TypeSelectorProps<T>) {
  return (
    <div className={s.typePills} role="tablist" aria-label={ariaLabel}>
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={activeId === t.id}
          className={`${s.typePill} ${activeId === t.id ? s.typePillActive : ""}`}
          onClick={() => onChange(t.id)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function formatCostValue(card: CostHighlightCard, raw: number): string {
  switch (card.format) {
    case "integer": return Math.round(raw).toLocaleString();
    case "decimal1": return raw.toFixed(1);
    case "plain": return Math.round(raw).toString();
  }
}

/**
 * 데모 B — 트렌드/비용 분리 유지 + 공용 TypeSelector
 * 각 섹션이 독립 상태, pill UI만 통일
 */
export function DemoB() {
  /* ── 트렌드 섹션 상태 ── */
  const [trendType, setTrendType] = useState<TrendTypeId>("farming");
  const [trendPhase, setTrendPhase] = useState<"idle" | "out" | "in">("idle");
  const [renderedTrend, setRenderedTrend] = useState<TrendTypeId>("farming");
  const trendOut = useRef<ReturnType<typeof setTimeout>>(undefined);
  const trendIn = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tp = TREND_BENTO_PROFILES[renderedTrend];
  const maxPct = Math.max(...tp.chart.items.map((r) => r.pct));

  const handleTrendChange = useCallback((id: TrendTypeId) => {
    if (id === trendType || trendPhase !== "idle") return;
    setTrendType(id);
    setTrendPhase("out");
    if (trendOut.current) clearTimeout(trendOut.current);
    if (trendIn.current) clearTimeout(trendIn.current);
    trendOut.current = setTimeout(() => {
      setRenderedTrend(id);
      setTrendPhase("in");
      trendIn.current = setTimeout(() => setTrendPhase("idle"), 700);
    }, 300);
  }, [trendType, trendPhase]);

  /* ── 비용 섹션 상태 ── */
  const [costType, setCostType] = useState<CostTypeId>("farming");
  const [costTransitioning, setCostTransitioning] = useState(false);
  const costTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cp = COST_TYPE_PROFILES[costType];
  const allCostCards = [cp.hero, ...cp.cards];
  const [costVals, setCostVals] = useState(() =>
    allCostCards.map((c) => formatCostValue(c, c.value)),
  );

  const handleCostChange = useCallback((id: CostTypeId) => {
    if (id === costType) return;
    setCostType(id);
    setCostTransitioning(true);
    if (costTimer.current) clearTimeout(costTimer.current);
    costTimer.current = setTimeout(() => {
      const next = COST_TYPE_PROFILES[id];
      const cards = [next.hero, ...next.cards];
      setCostVals(cards.map((c) => formatCostValue(c, c.value)));
      setCostTransitioning(false);
    }, 150);
  }, [costType]);

  const trendPhaseClass = trendPhase === "out" ? s.phaseOut : trendPhase === "in" ? s.phaseIn : "";

  return (
    <div className={s.wrapper}>
      {/* ═══ 트렌드 섹션 ═══ */}
      <section className={s.section} aria-label="귀농 트렌드">
        <div className={s.header}>
          <div>
            <span className={s.eyebrow}>#귀농 트렌드</span>
            <h2 className={s.title}>왜 <em>{tp.titleEm}</em>을 할까?</h2>
            <p className={s.subtitle}>{tp.subtitle}</p>
          </div>
          <Link href={tp.href} className={s.moreLink}>
            자세히 보기 <IconWrap icon={ArrowRight} size="sm" />
          </Link>
        </div>

        <TypeSelector items={TREND_TYPES} activeId={trendType} onChange={handleTrendChange} ariaLabel="트렌드 유형" />

        <div className={`${s.bento} ${trendPhaseClass}`}>
          <div className={s.tileHero}>
            <span className={s.heroValue}>{tp.hero.value}</span>
            <span className={s.heroLabel}>{tp.hero.label}</span>
            <span className={s.heroSub}>{tp.hero.sub}</span>
            <p className={s.heroDesc}>{tp.hero.desc}</p>
          </div>

          {tp.stats.map((stat, i) => (
            <div key={`${renderedTrend}-s-${i}`} className={s.tileStat}>
              <span className={s.subValue}>{stat.value}</span>
              <span className={s.subLabel}>{stat.label}</span>
              <span className={s.subSub}>{stat.sub}</span>
            </div>
          ))}

          <div className={s.tileReasons}>
            <div className={s.reasonsHeader}>
              <h3 className={s.reasonsTitle}>{tp.chart.title}</h3>
              <span className={s.surveyCount}>{tp.chart.surveyLabel}</span>
            </div>
            <div className={s.reasonsList}>
              {tp.chart.items.map((r, i) => (
                <div key={`${renderedTrend}-r-${i}`} className={s.reasonRow}
                  style={{ "--row-idx": i } as React.CSSProperties}>
                  <span className={s.reasonLabel}>{r.label}</span>
                  <div className={s.reasonBarBg}>
                    <div className={s.reasonBar} data-rank={String(i + 1)}
                      style={{ "--bar-w": `${(r.pct / maxPct) * 100}%` } as React.CSSProperties} />
                  </div>
                  <span className={s.reasonPct}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.tileCompare}>
            <h3 className={s.compareTitle}>{tp.compare.title}</h3>
            <div className={s.compareList}>
              {tp.compare.items.map((row) => (
                <div key={row.label} className={s.compareItem}>
                  <span className={s.compareLabel}>{row.label}</span>
                  <span className={s.compareChange}>{row.change}</span>
                  <span className={s.compareDetail}>{row.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DataSource source={tp.source} />
      </section>

      {/* ═══ 비용 섹션 ═══ */}
      <section className={s.costSection} aria-label="비용 가이드">
        <div className={s.costLayout}>
          <div className={s.costText}>
            <span className={s.eyebrow}>#비용 가이드</span>
            <TypeSelector items={COST_TYPES} activeId={costType} onChange={handleCostChange} ariaLabel="비용 유형" />
            <h3 className={s.costHeadline}>{cp.headline} <em>{cp.em}</em></h3>
            <p className={s.costDesc}>{cp.desc}</p>
            <Link href={`/costs?type=${costType}`} className={s.costCta}>
              비용 가이드 보기 <ArrowRight size={15} />
            </Link>
            <span className={s.costSource}>출처: {cp.source}</span>
          </div>

          <div className={`${s.costCards} ${costTransitioning ? s.costCardsOut : ""}`}>
            <div className={s.costHero}>
              <div>
                <p className={s.costHeroLabel}>{cp.hero.label}</p>
                <p className={s.costHeroDesc}>{cp.hero.desc}</p>
              </div>
              <div className={s.costHeroBottom}>
                <span className={s.costHeroNum}>{costVals[0]}</span>
                <span className={s.costHeroUnit}>{cp.hero.unit}</span>
              </div>
            </div>
            {cp.cards.map((card, i) => {
              const cc = card.color === "primary" ? s.numPrimary
                : card.color === "amber" ? s.numAmber : s.numMuted;
              return (
                <div key={`${costType}-c-${i}`} className={s.costCard}>
                  <p className={s.costCardLabel}>{card.label}</p>
                  <p className={s.costCardDesc}>{card.desc}</p>
                  <div className={s.costCardBottom}>
                    <span className={`${s.costCardNum} ${cc}`}>{costVals[i + 1]}</span>
                    <span className={s.costCardUnit}>{card.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DataSource source={cp.source} />
      </section>
    </div>
  );
}
