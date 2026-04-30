"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import {
  TREND_BENTO_PROFILES,
  COST_TYPE_PROFILES,
  type TrendTypeId,
  type CostTypeId,
  type CostHighlightCard,
} from "@/lib/data/landing";
import { DataSource } from "@/components/ui/data-source";
import s from "./trend-cost-section.module.css";

/* ── 통합 카테고리 매핑 ── */

interface Category {
  id: string;
  label: string;
  trendKey: TrendTypeId;
  costKey: CostTypeId;
}

const CATEGORIES: Category[] = [
  { id: "farming", label: "귀농", trendKey: "farming", costKey: "farming" },
  { id: "rural", label: "귀촌", trendKey: "rural", costKey: "village" },
  { id: "youth", label: "청년농", trendKey: "youth", costKey: "youth" },
  { id: "mountain", label: "귀산촌", trendKey: "mountain", costKey: "forestry" },
  { id: "smartfarm", label: "스마트팜", trendKey: "smartfarm", costKey: "smartfarm" },
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
 * 트렌드 + 비용 통합 섹션
 * 상단 underline tabs로 5개 카테고리 공유 전환
 * 각 블록(트렌드 벤토 / 비용 카드)은 원래 헤더·카피·CTA 유지
 */
export function TrendCostSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [renderedIdx, setRenderedIdx] = useState(0);
  const [countTrigger, setCountTrigger] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const outTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const selectorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cat = CATEGORIES[renderedIdx];
  const trend = TREND_BENTO_PROFILES[cat.trendKey];
  const cost = COST_TYPE_PROFILES[cat.costKey];
  const maxPct = Math.max(...trend.chart.items.map((r) => r.pct));

  // 카운트업
  useEffect(() => { setCountTrigger(true); }, []);
  const heroDisplay = useCountUp(trend.hero.value, countTrigger, 800);
  const stat0Display = useCountUp(trend.stats[0].value, countTrigger, 600);
  const stat1Display = useCountUp(trend.stats[1].value, countTrigger, 650);

  // 비용 카드 값
  const allCostCards = [cost.hero, ...cost.cards];
  const [costVals, setCostVals] = useState(() =>
    allCostCards.map((c) => formatCostValue(c, c.value)),
  );

  const handleChange = useCallback((idx: number) => {
    if (idx === activeIdx || phase !== "idle") return;
    setActiveIdx(idx);
    setPhase("out");
    setCountTrigger(false);
    if (!hasInteracted) setHasInteracted(true);

    if (outTimer.current) clearTimeout(outTimer.current);
    if (inTimer.current) clearTimeout(inTimer.current);

    outTimer.current = setTimeout(() => {
      setRenderedIdx(idx);
      // 비용 카드 값 갱신
      const nextCat = CATEGORIES[idx];
      const nextCost = COST_TYPE_PROFILES[nextCat.costKey];
      setCostVals([nextCost.hero, ...nextCost.cards].map((c) => formatCostValue(c, c.value)));
      setPhase("in");
      setTimeout(() => setCountTrigger(true), 120);
      inTimer.current = setTimeout(() => setPhase("idle"), 700);
    }, 300);
  }, [activeIdx, phase, hasInteracted]);

  /* ── 인디케이터 위치 계산 ── */
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const updateIndicator = useCallback((idx: number) => {
    const tab = tabRefs.current[idx];
    const container = selectorRef.current;
    if (!tab || !container) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    setIndicatorStyle({
      transform: `translateX(${tabRect.left - containerRect.left - 4}px)`,
      width: `${tabRect.width}px`,
    });
  }, []);

  useEffect(() => {
    updateIndicator(activeIdx);
  }, [activeIdx, updateIndicator]);

  useEffect(() => {
    const onResize = () => updateIndicator(activeIdx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIdx, updateIndicator]);

  const bentoClass = [
    s.bento,
    phase === "out" ? s.phaseOut : phase === "in" ? s.phaseIn : "",
    hasInteracted ? s.interacted : "",
  ].filter(Boolean).join(" ");

  const costClass = [
    s.costCards,
    phase === "out" ? s.phaseOut : phase === "in" ? s.phaseIn : "",
    hasInteracted ? s.interacted : "",
  ].filter(Boolean).join(" ");

  return (
    <section className={s.section} aria-label="귀농 유형별 트렌드와 비용">
      {/* ── 통합 타이틀 ── */}
      <div className={s.sectionIntro}>
        <span className={s.sectionEyebrow}>#유형별 트렌드·비용</span>
        <h2 className={s.sectionTitle}>
          어떤 <em>귀농</em>이 있을까?
        </h2>
        <p className={s.sectionSub}>
          유형을 선택하면 트렌드와 비용을 한눈에 비교할 수 있어요
        </p>
      </div>

      {/* ── 세그먼트 컨트롤 ── */}
      <div className={s.selectorWrap}>
        <div className={s.selector} ref={selectorRef} role="tablist" aria-label="귀농 유형 선택">
          <div className={s.indicator} style={indicatorStyle} />
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              aria-selected={activeIdx === i}
              className={`${s.tab} ${activeIdx === i ? s.tabActive : ""}`}
              onClick={() => handleChange(i)}
              type="button"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 트렌드 블록 — 원래 헤더 유지 ═══ */}
      <div className={s.block}>
        <div className={s.blockHeader}>
          <div className={s.blockHeaderLeft}>
            <span className={s.eyebrow}>#귀농 트렌드</span>
            <h2 className={s.title}>
              왜 <em>{trend.titleEm}</em>을 할까?
            </h2>
            <p className={s.subtitle}>{trend.subtitle}</p>
          </div>
          <Link href={trend.href} className={s.moreLink}>
            자세히 보기 <IconWrap icon={ArrowRight} size="sm" />
          </Link>
        </div>

        <div className={bentoClass}>
          {/* 히어로 타일 */}
          <div className={s.tileHero}>
            <span className={s.heroValue}>{heroDisplay}</span>
            <span className={s.heroLabel}>{trend.hero.label}</span>
            <span className={s.heroSub}>{trend.hero.sub}</span>
            <p className={s.heroDesc}>{trend.hero.desc}</p>
          </div>

          {/* 보조 통계 2개 */}
          {trend.stats.map((stat, i) => (
            <div key={`${cat.id}-stat-${i}`} className={s.tileStat}>
              <span className={s.subValue}>{i === 0 ? stat0Display : stat1Display}</span>
              <span className={s.subLabel}>{stat.label}</span>
              <span className={s.subSub}>{stat.sub}</span>
              <p className={s.subDesc}>{stat.desc}</p>
            </div>
          ))}

          {/* 바 차트 타일 */}
          <div className={s.tileReasons}>
            <div className={s.reasonsHeader}>
              <h3 className={s.reasonsTitle}>{trend.chart.title}</h3>
              <span className={s.surveyCount}>{trend.chart.surveyLabel}</span>
            </div>
            <div className={s.reasonsList}>
              {trend.chart.items.map((reason, i) => (
                <div key={`${cat.id}-r-${i}`} className={s.reasonRow}
                  style={{ "--row-idx": i } as React.CSSProperties}>
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

          {/* 비교 타일 */}
          <div className={s.tileCompare}>
            <h3 className={s.compareTitle}>{trend.compare.title}</h3>
            <div className={s.compareList}>
              {trend.compare.items.map((row, i) => (
                <div key={row.label} className={s.compareItem}
                  style={{ "--ci": i } as React.CSSProperties}>
                  <span className={s.compareLabel}>{row.label}</span>
                  <span className={s.compareChange}>{row.change}</span>
                  <span className={s.compareDetail}>{row.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DataSource source={trend.source} />
      </div>

      {/* ═══ 비용 블록 — 원래 헤더 유지 ═══ */}
      <div className={s.block}>
        <div className={s.costLayout}>
          {/* 좌측 텍스트 */}
          <div className={s.costText}>
            <span className={s.eyebrow}>#비용 가이드</span>
            <h3 className={s.costHeadline}>
              {cost.headline} <em>{cost.em}</em>
            </h3>
            <p className={s.costDesc}>{cost.desc}</p>
            <Link href={`/costs?type=${cost.id}`} className={s.costCta}>
              비용 가이드 보기 <ArrowRight size={15} />
            </Link>
            <span className={s.costSource}>출처: {cost.source}</span>
            {cost.confidenceNote && (
              <span className={s.costConfidence}>* {cost.confidenceNote}</span>
            )}
          </div>

          {/* 우측 카드 그리드 */}
          <div className={costClass}>
            <div className={`${s.costCard} ${s.costCardHero}`}>
              <div>
                <p className={s.costCardLabel}>{cost.hero.label}</p>
                <p className={s.costCardDesc}>{cost.hero.desc}</p>
              </div>
              <div className={s.costCardBottom}>
                <span className={s.costCardNum}>{costVals[0]}</span>
                <span className={s.costCardUnit}>{cost.hero.unit}</span>
              </div>
            </div>

            {cost.cards.map((card, i) => {
              const colorClass = card.color === "primary" ? s.numPrimary
                : card.color === "amber" ? s.numAmber : s.numMuted;
              return (
                <div key={`${cat.id}-cost-${i}`} className={`${s.costCard} ${s.costCardSub}`}>
                  <p className={s.costCardLabel}>{card.label}</p>
                  <p className={s.costCardDesc}>
                    {card.desc}
                    {card.source && <span className={s.costCardSource}>{card.source}</span>}
                  </p>
                  <div className={s.costCardBottom}>
                    <span className={`${s.costCardNum} ${colorClass}`}>{costVals[i + 1]}</span>
                    <span className={s.costCardUnit}>{card.unit}</span>
                  </div>
                  {card.note && <span className={s.costCardNote}>{card.note}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
