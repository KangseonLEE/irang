"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Wallet } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import {
  TREND_BENTO_PROFILES,
  COST_TYPE_PROFILES,
  type TrendTypeId,
  type CostTypeId,
  type CostHighlightCard,
} from "@/lib/data/landing";
import { DataSource } from "@/components/ui/data-source";
import s from "./demo-a.module.css";

/* ── 통합 카테고리 ── */

interface UnifiedCategory {
  id: string;
  label: string;
  icon: typeof TrendingUp;
  trendKey: TrendTypeId;
  costKey: CostTypeId;
}

const CATEGORIES: UnifiedCategory[] = [
  { id: "farming", label: "귀농", icon: TrendingUp, trendKey: "farming", costKey: "farming" },
  { id: "rural", label: "귀촌", icon: TrendingUp, trendKey: "rural", costKey: "village" },
  { id: "youth", label: "청년농", icon: TrendingUp, trendKey: "youth", costKey: "youth" },
  { id: "mountain", label: "귀산촌", icon: TrendingUp, trendKey: "mountain", costKey: "forestry" },
  { id: "smartfarm", label: "스마트팜", icon: TrendingUp, trendKey: "smartfarm", costKey: "smartfarm" },
];

/* ── 숫자 카운트업 ── */

function parseNumeric(raw: string) {
  const m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], num: parseFloat(m[2].replace(/,/g, "")), suffix: m[3] };
}

function formatBack(num: number, original: string): string {
  const parsed = parseNumeric(original);
  if (!parsed) return original;
  const dotIdx = original.replace(/,/g, "").indexOf(".");
  const decimals = dotIdx >= 0 ? original.replace(/,/g, "").length - dotIdx - 1 : 0;
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${parsed.prefix}${withComma}${decPart ? `.${decPart}` : ""}${parsed.suffix}`;
}

function useCountUp(target: string, trigger: boolean, duration = 700) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!trigger) return;
    const parsed = parseNumeric(target);
    if (!parsed) { setDisplay(target); return; }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatBack(parsed.num * eased, target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else setDisplay(target);
    };
    setDisplay(formatBack(0, target));
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, trigger, duration]);
  return display;
}

function formatCostValue(card: CostHighlightCard, raw: number): string {
  switch (card.format) {
    case "integer": return Math.round(raw).toLocaleString();
    case "decimal1": return raw.toFixed(1);
    case "plain": return Math.round(raw).toString();
  }
}

/**
 * 데모 A — 트렌드 + 비용 통합 섹션
 * 상단 카테고리 셀렉터 하나로 양쪽 데이터를 동시에 전환
 */
export function DemoA() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [renderedIdx, setRenderedIdx] = useState(0);
  const [countTrigger, setCountTrigger] = useState(true);
  const outTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cat = CATEGORIES[renderedIdx];
  const trend = TREND_BENTO_PROFILES[cat.trendKey];
  const cost = COST_TYPE_PROFILES[cat.costKey];
  const maxPct = Math.max(...trend.chart.items.map((r) => r.pct));

  const heroDisplay = useCountUp(trend.hero.value, countTrigger, 800);
  const stat0Display = useCountUp(trend.stats[0].value, countTrigger, 600);
  const stat1Display = useCountUp(trend.stats[1].value, countTrigger, 650);

  // Cost count-up
  const allCostCards = [cost.hero, ...cost.cards];
  const [costVals, setCostVals] = useState(() =>
    allCostCards.map((c) => formatCostValue(c, c.value)),
  );

  const handleChange = useCallback((idx: number) => {
    if (idx === activeIdx || phase !== "idle") return;
    setActiveIdx(idx);
    setPhase("out");
    setCountTrigger(false);

    if (outTimer.current) clearTimeout(outTimer.current);
    if (inTimer.current) clearTimeout(inTimer.current);

    outTimer.current = setTimeout(() => {
      setRenderedIdx(idx);
      setPhase("in");
      // 비용 카드 값 갱신
      const nextCat = CATEGORIES[idx];
      const nextCost = COST_TYPE_PROFILES[nextCat.costKey];
      const nextCards = [nextCost.hero, ...nextCost.cards];
      setCostVals(nextCards.map((c) => formatCostValue(c, c.value)));
      setTimeout(() => setCountTrigger(true), 120);
      inTimer.current = setTimeout(() => setPhase("idle"), 700);
    }, 300);
  }, [activeIdx, phase]);

  const phaseClass = phase === "out" ? s.phaseOut : phase === "in" ? s.phaseIn : "";

  return (
    <section className={s.section} aria-label="귀농 유형별 현황">
      {/* ── 헤더 + 카테고리 셀렉터 ── */}
      <div className={s.stickyBar}>
        <div className={s.headerRow}>
          <div>
            <span className={s.eyebrow}>#유형별 현황</span>
            <h2 className={s.title}>
              <em>{cat.label}</em>, 어떤 모습일까?
            </h2>
          </div>
        </div>

        <div className={s.selector} role="tablist" aria-label="귀농 유형 선택">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={activeIdx === i}
              className={`${s.selectorItem} ${activeIdx === i ? s.selectorItemActive : ""}`}
              onClick={() => handleChange(i)}
              type="button"
            >
              <span className={s.selectorLabel}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 트렌드 블록 ── */}
      <div className={s.blockHeader}>
        <TrendingUp size={16} />
        <span>트렌드</span>
        <Link href={trend.href} className={s.blockLink}>
          자세히 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <div className={`${s.bento} ${phaseClass}`}>
        <div className={s.tileHero}>
          <span className={s.heroValue}>{heroDisplay}</span>
          <span className={s.heroLabel}>{trend.hero.label}</span>
          <span className={s.heroSub}>{trend.hero.sub}</span>
          <p className={s.heroDesc}>{trend.hero.desc}</p>
        </div>

        {trend.stats.map((stat, i) => (
          <div key={`${cat.id}-stat-${i}`} className={s.tileStat}>
            <span className={s.subValue}>{i === 0 ? stat0Display : stat1Display}</span>
            <span className={s.subLabel}>{stat.label}</span>
            <span className={s.subSub}>{stat.sub}</span>
          </div>
        ))}

        <div className={s.tileReasons}>
          <div className={s.reasonsHeader}>
            <h3 className={s.reasonsTitle}>{trend.chart.title}</h3>
            <span className={s.surveyCount}>{trend.chart.surveyLabel}</span>
          </div>
          <div className={s.reasonsList}>
            {trend.chart.items.map((reason, i) => (
              <div key={`${cat.id}-r-${i}`} className={s.reasonRow} style={{ "--row-idx": i } as React.CSSProperties}>
                <span className={s.reasonLabel}>{reason.label}</span>
                <div className={s.reasonBarBg}>
                  <div className={s.reasonBar} data-rank={String(i + 1)}
                    style={{ "--bar-w": `${(reason.pct / maxPct) * 100}%` } as React.CSSProperties} />
                </div>
                <span className={s.reasonPct}>{reason.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.tileCompare}>
          <h3 className={s.compareTitle}>{trend.compare.title}</h3>
          <div className={s.compareList}>
            {trend.compare.items.map((row, i) => (
              <div key={row.label} className={s.compareItem} style={{ "--ci": i } as React.CSSProperties}>
                <span className={s.compareLabel}>{row.label}</span>
                <span className={s.compareChange}>{row.change}</span>
                <span className={s.compareDetail}>{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataSource source={trend.source} />

      {/* ── 구분선 ── */}
      <hr className={s.divider} />

      {/* ── 비용 블록 ── */}
      <div className={s.blockHeader}>
        <Wallet size={16} />
        <span>예상 비용</span>
        <Link href={`/costs?type=${cost.id}`} className={s.blockLink}>
          비용 가이드 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <div className={`${s.costGrid} ${phaseClass}`}>
        <div className={s.costHero}>
          <div>
            <p className={s.costHeroLabel}>{cost.hero.label}</p>
            <p className={s.costHeroDesc}>{cost.hero.desc}</p>
          </div>
          <div className={s.costHeroBottom}>
            <span className={s.costHeroNum}>{costVals[0]}</span>
            <span className={s.costHeroUnit}>{cost.hero.unit}</span>
          </div>
        </div>

        {cost.cards.map((card, i) => {
          const colorClass = card.color === "primary" ? s.numPrimary
            : card.color === "amber" ? s.numAmber : s.numMuted;
          return (
            <div key={`${cat.id}-cost-${i}`} className={s.costCard}>
              <p className={s.costCardLabel}>{card.label}</p>
              <p className={s.costCardDesc}>{card.desc}</p>
              <div className={s.costCardBottom}>
                <span className={`${s.costCardNum} ${colorClass}`}>{costVals[i + 1]}</span>
                <span className={s.costCardUnit}>{card.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <DataSource source={cost.source} />
    </section>
  );
}
