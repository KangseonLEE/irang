"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import {
  TREND_TYPES,
  TREND_BENTO_PROFILES,
  type TrendTypeId,
} from "@/lib/data/landing";
import { DataSource } from "@/components/ui/data-source";
import s from "./trend-highlight.module.css";

/* ── 숫자 카운트업 훅 ── */

function parseNumeric(raw: string): { num: number; prefix: string; suffix: string } | null {
  const m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], num: parseFloat(m[2].replace(/,/g, "")), suffix: m[3] };
}

function formatBack(num: number, original: string): string {
  const parsed = parseNumeric(original);
  if (!parsed) return original;

  // 소수점 자릿수 판단
  const dotIdx = original.replace(/,/g, "").indexOf(".");
  const decimals = dotIdx >= 0 ? original.replace(/,/g, "").length - dotIdx - 1 : 0;

  // 콤마 포맷
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
    if (!parsed) {
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parsed.num * eased;
      setDisplay(formatBack(current, target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(target);
      }
    };

    setDisplay(formatBack(0, target));
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, trigger, duration]);

  return display;
}

/**
 * 귀농 트렌드 벤토 그리드
 * pill 탭으로 5개 카테고리 전환, 동일한 벤토 레이아웃에 데이터만 교체
 * 전환 시 방향별 slide + stagger + 카운트업 애니메이션
 */
export function TrendHighlight() {
  const [activeType, setActiveType] = useState<TrendTypeId>("farming");
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [renderedType, setRenderedType] = useState<TrendTypeId>("farming");
  const [countTrigger, setCountTrigger] = useState(false);
  // 탭 전환 경험 여부 — true면 ScrollReveal 대신 phase 애니메이션만 사용
  const [hasInteracted, setHasInteracted] = useState(false);
  const outTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const p = TREND_BENTO_PROFILES[renderedType];
  const maxPct = Math.max(...p.chart.items.map((r) => r.pct));

  // 카운트업: 최초 마운트 + 탭 전환 in phase 시 트리거
  useEffect(() => {
    setCountTrigger(true);
  }, []);

  const heroDisplay = useCountUp(p.hero.value, countTrigger, 800);
  const stat0Display = useCountUp(p.stats[0].value, countTrigger, 600);
  const stat1Display = useCountUp(p.stats[1].value, countTrigger, 650);

  const handleTypeChange = useCallback((typeId: TrendTypeId) => {
    if (typeId === activeType || phase !== "idle") return;
    setActiveType(typeId);
    setPhase("out");
    setCountTrigger(false);
    if (!hasInteracted) setHasInteracted(true);

    if (outTimer.current) clearTimeout(outTimer.current);
    if (inTimer.current) clearTimeout(inTimer.current);

    outTimer.current = setTimeout(() => {
      setRenderedType(typeId);
      setPhase("in");
      // 약간의 딜레이 후 카운트업 시작 (타일이 보이기 시작한 뒤)
      setTimeout(() => setCountTrigger(true), 120);
      inTimer.current = setTimeout(() => setPhase("idle"), 700);
    }, 300);
  }, [activeType, phase, hasInteracted]);

  const bentoClass = [
    s.bento,
    phase === "out" ? s.phaseOut : phase === "in" ? s.phaseIn : "",
    hasInteracted ? s.interacted : "",
  ].filter(Boolean).join(" ");

  return (
    <section className={s.section} aria-label="귀농 트렌드">
      {/* ── 헤더 ── */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <span className={s.eyebrow}>#귀농 트렌드</span>
          <h2 className={s.title}>
            왜 <em>{p.titleEm}</em>을 할까?
          </h2>
          <p className={s.subtitle}>{p.subtitle}</p>
        </div>
        <Link href={p.href} className={s.moreLink}>
          자세히 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      {/* ── pill 탭 ── */}
      <div className={s.typePills} role="tablist" aria-label="트렌드 유형 선택">
        {TREND_TYPES.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeType === t.id}
            className={`${s.typePill} ${activeType === t.id ? s.typePillActive : ""}`}
            onClick={() => handleTypeChange(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 벤토 그리드 ── */}
      <div className={bentoClass}>
        {/* 히어로 타일 — 왼쪽 큰 카드 */}
        <div className={s.tileHero} style={{ "--idx": 0 } as React.CSSProperties}>
          <span className={s.heroValue}>{heroDisplay}</span>
          <span className={s.heroLabel}>{p.hero.label}</span>
          <span className={s.heroSub}>{p.hero.sub}</span>
          <p className={s.heroDesc}>{p.hero.desc}</p>
        </div>

        {/* 보조 통계 2개 — 가운데 열 */}
        {p.stats.map((stat, i) => (
          <div
            key={`${renderedType}-stat-${i}`}
            className={s.tileStat}
            style={{ "--idx": i + 1 } as React.CSSProperties}
          >
            <span className={s.subValue}>
              {i === 0 ? stat0Display : stat1Display}
            </span>
            <span className={s.subLabel}>{stat.label}</span>
            <span className={s.subSub}>{stat.sub}</span>
            <p className={s.subDesc}>{stat.desc}</p>
          </div>
        ))}

        {/* 바 차트 타일 — 우상단 */}
        <div
          className={s.tileReasons}
          style={{ "--idx": 3 } as React.CSSProperties}
        >
          <div className={s.reasonsHeader}>
            <h3 className={s.reasonsTitle}>{p.chart.title}</h3>
            <span className={s.surveyCount}>{p.chart.surveyLabel}</span>
          </div>
          <div className={s.reasonsList}>
            {p.chart.items.map((reason, i) => (
              <div
                key={`${renderedType}-r-${i}`}
                className={s.reasonRow}
                style={{ "--row-idx": i } as React.CSSProperties}
              >
                <span className={s.reasonLabel}>{reason.label}</span>
                <div className={s.reasonBarBg}>
                  <div
                    className={s.reasonBar}
                    data-rank={String(i + 1)}
                    style={{
                      "--bar-w": `${(reason.pct / maxPct) * 100}%`,
                    } as React.CSSProperties}
                  />
                </div>
                <span className={s.reasonPct}>{reason.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 비교 타일 — 우하단 */}
        <div
          className={s.tileCompare}
          style={{ "--idx": 4 } as React.CSSProperties}
        >
          <h3 className={s.compareTitle}>{p.compare.title}</h3>
          <div className={s.compareList}>
            {p.compare.items.map((row, i) => (
              <div
                key={row.label}
                className={s.compareItem}
                style={{ "--ci": i } as React.CSSProperties}
              >
                <span className={s.compareLabel}>{row.label}</span>
                <span className={s.compareChange}>{row.change}</span>
                <span className={s.compareDetail}>{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataSource source={p.source} />
    </section>
  );
}
