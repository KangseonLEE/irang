"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  COST_TYPES,
  COST_TYPE_PROFILES,
  type CostTypeId,
  type CostHighlightCard,
} from "@/lib/data/landing";
import s from "./cost-highlight.module.css";

function formatCardValue(card: CostHighlightCard, raw: number): string {
  switch (card.format) {
    case "integer":
      return Math.round(raw).toLocaleString();
    case "decimal1":
      return raw.toFixed(1);
    case "plain":
      return Math.round(raw).toString();
  }
}

/**
 * 비용 핵심 지표 하이라이트
 * 좌: 텍스트 헤드라인 + CTA / 우: 히어로 카드 1장 + 보조 라인 카드 4장
 * 유형 선택(귀농·귀촌·청년농·귀산촌·스마트팜)으로 데이터 전환
 */
export function CostHighlight() {
  const ref = useRef<HTMLDivElement>(null);
  const hasEnteredView = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [activeType, setActiveType] = useState<CostTypeId>("farming");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const profile = COST_TYPE_PROFILES[activeType];
  const allCards = [profile.hero, ...profile.cards];

  const [vals, setVals] = useState(() =>
    allCards.map((c) => formatCardValue(c, c.value)),
  );

  const animate = useCallback(
    (cards: CostHighlightCard[]) => {
      // Cancel previous fade if still pending
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      // Cross-fade: brief opacity dip, then set final values
      setIsTransitioning(true);
      fadeTimer.current = setTimeout(() => {
        setVals(cards.map((c) => formatCardValue(c, c.value)));
        setIsTransitioning(false);
      }, 150);
    },
    [],
  );

  // Initial viewport entry: count-up animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rafId = { current: 0 };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEnteredView.current) {
          hasEnteredView.current = true;
          observer.disconnect();

          const start = performance.now();
          const duration = 1000;
          const cards = allCards;

          function easeOutQuint(t: number): number {
            return 1 - Math.pow(1 - t, 5);
          }

          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = easeOutQuint(progress);
            setVals(cards.map((c) => formatCardValue(c, eased * c.value)));
            if (progress < 1) rafId.current = requestAnimationFrame(tick);
          }

          rafId.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Type switch: cross-fade transition
  const handleTypeChange = (typeId: CostTypeId) => {
    if (typeId === activeType) return;
    setActiveType(typeId);
    const nextProfile = COST_TYPE_PROFILES[typeId];
    const nextCards = [nextProfile.hero, ...nextProfile.cards];
    animate(nextCards);
  };

  return (
    <div ref={ref} className={s.section}>
      {/* 좌측 텍스트 */}
      <div className={s.textSide}>
        <span className={s.overline}>#비용 가이드</span>
        <div className={s.typePills} role="tablist" aria-label="비용 유형 선택">
          {COST_TYPES.map((t) => (
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
        <h3 className={s.headline}>
          {profile.headline} <em>{profile.em}</em>
        </h3>
        <p className={s.desc}>{profile.desc}</p>
        <Link href={`/costs?type=${activeType}`} className={s.cta}>
          비용 가이드 보기 <ArrowRight size={15} />
        </Link>
        <span className={s.source}>출처: {profile.source}</span>
        {profile.confidenceNote && (
          <span className={s.confidenceNote}>* {profile.confidenceNote}</span>
        )}
      </div>

      {/* 우측 카드 그리드 */}
      <div
        className={`${s.cards} ${isTransitioning ? s.cardsTransitioning : ""}`}
      >
        {/* 히어로 카드 — 총 투자금 (2열 span, 딥그린) */}
        <div className={`${s.card} ${s.cardHero}`}>
          <div>
            <p className={s.cardLabel}>{profile.hero.label}</p>
            <p className={s.cardDesc}>{profile.hero.desc}</p>
          </div>
          <div className={s.cardBottom}>
            <span className={s.cardNum}>{vals[0]}</span>
            <span className={s.cardUnit}>{profile.hero.unit}</span>
          </div>
        </div>

        {/* 보조 카드 4장 */}
        {profile.cards.map((card, i) => {
          const colorClass =
            card.color === "primary"
              ? s.numPrimary
              : card.color === "amber"
                ? s.numAmber
                : s.numMuted;
          return (
            <div key={`${activeType}-${i}`} className={`${s.card} ${s.cardSub}`}>
              <p className={s.cardLabel}>{card.label}</p>
              <p className={s.cardDesc}>
                {card.desc}
                {card.source && (
                  <span className={s.cardSource}>{card.source}</span>
                )}
              </p>
              <div className={s.cardBottom}>
                <span className={`${s.cardNum} ${colorClass}`}>
                  {vals[i + 1]}
                </span>
                <span className={s.cardUnit}>{card.unit}</span>
              </div>
              {card.note && (
                <span className={s.cardSubNote}>{card.note}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
