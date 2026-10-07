"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
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
import { CountUp } from "@/components/ui/count-up";
import { useCountUp } from "@/lib/hooks/use-count-up";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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

function formatCostValue(card: CostHighlightCard, raw: number): string {
  switch (card.format) {
    // 로캘 고정 — 브라우저 로캘(de-DE "1.234")과 서버 출력("1,234")이 갈려 하이드레이션 #418 (10/2 QA)
    case "integer": return Math.round(raw).toLocaleString("ko-KR");
    case "decimal1": return raw.toFixed(1);
    case "plain": return Math.round(raw).toString();
  }
}

/* ── 타이틀에서 em 부분만 강조 렌더링 ── */
function renderTitleWithEm(title: string, em: string) {
  const idx = title.indexOf(em);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}<em>{em}</em>{title.slice(idx + em.length)}
    </>
  );
}

/* ── 카테고리 셀렉터 (인라인 + 모바일 sticky 공용) ──
   indicator div를 JS로 동적 계산하던 패턴을 제거하고 .tabActive에 background를
   직접 적용. flex: 1 1 0 균등 분배에서 sub-pixel 오차 없이 글자가 항상
   활성 영역 정중앙에 위치.
   10/6 QA: role=tab 인데 ←/→ 이동·aria-controls 가 없어 역할과 동작이 어긋났다 → APG 탭 관례대로
   roving tabindex(Tab 은 활성 탭 하나에만 멈춘다) + ←/→·Home/End(포커스 이동 = 선택) + 패널 연결. */

interface CategorySelectorProps {
  activeIdx: number;
  /** via = "keyboard" 면 모바일 자동 스크롤을 건너뛴다 — 포커스가 있는 탭을 화면 밖으로 밀어내지 않게 */
  onChange: (idx: number, via: "pointer" | "keyboard") => void;
  ariaLabel: string;
  /** 탭 id 접두 — 인라인·하단 고정 두 묶음이 같은 id 를 쓰지 않게 */
  idPrefix: string;
  /** 두 묶음이 함께 가리키는 콘텐츠 패널 id */
  panelId: string;
}

function CategorySelector({ activeIdx, onChange, ariaLabel, idPrefix, panelId }: CategorySelectorProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const last = CATEGORIES.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = activeIdx === last ? 0 : activeIdx + 1;
    else if (e.key === "ArrowLeft") next = activeIdx === 0 ? last : activeIdx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    onChange(next, "keyboard");
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  return (
    <div className={s.selector} role="tablist" aria-label={ariaLabel} ref={listRef} onKeyDown={onKeyDown}>
      {CATEGORIES.map((c, i) => (
        <button
          key={c.id}
          role="tab"
          id={`${idPrefix}-${c.id}`}
          aria-selected={activeIdx === i}
          aria-controls={panelId}
          tabIndex={activeIdx === i ? 0 : -1}
          className={`${s.tab} ${activeIdx === i ? s.tabActive : ""}`}
          onClick={() => onChange(i, "pointer")}
          type="button"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

interface TrendCostSectionProps {
  /**
   * 유형별 "정착한 사람" 띠 (10/5 회장) — 서버가 유형마다 그려 넘긴다(components/landing/type-interview-band).
   * 이 섹션은 고른 탭 것 하나만 트렌드와 비용 사이에 마운트한다. 없으면 띠 자리를 그리지 않는다.
   */
  interviewBands?: Partial<Record<TrendTypeId, React.ReactNode>>;
}

/**
 * 트렌드 + 비용 통합 섹션
 * 상단 underline tabs로 5개 카테고리 공유 전환
 * 각 블록(트렌드 벤토 / 비용 카드)은 원래 헤더·카피·CTA 유지
 */
export function TrendCostSection({ interviewBands }: TrendCostSectionProps = {}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [renderedIdx, setRenderedIdx] = useState(0);
  const [countTrigger, setCountTrigger] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const outTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** 탭·패널 id (인라인·하단 고정 두 tablist 가 같은 패널을 가리킨다) */
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const inlineTabId = `${baseId}-tab`;
  /** ←/→ 로 바꾼 탭이면 모바일 자동 스크롤을 건너뛴다 — 포커스가 있는 인라인 탭이 화면 밖으로 밀려나지 않게 */
  const skipScrollRef = useRef(false);

  /* ── 모바일 하단 sticky 가시성 ── */
  const sectionRef = useRef<HTMLElement>(null);
  const inlineSelectorRef = useRef<HTMLDivElement>(null);
  /** 탭 변경 시 스크롤 앵커 (트렌드 블록의 #정착 트렌드 eyebrow 시작점) */
  const trendBlockRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const computeSticky = () => {
      const section = sectionRef.current;
      const inline = inlineSelectorRef.current;
      if (!section || !inline) return;

      const vh = window.innerHeight;
      const sectionRect = section.getBoundingClientRect();
      const inlineRect = inline.getBoundingClientRect();

      // 섹션이 뷰포트와 겹치는지
      const sectionVisible = sectionRect.top < vh && sectionRect.bottom > 0;
      // 인라인 셀렉터의 하단이 GNB(56) 영역에 도달하면 sticky 등장.
      // top < 0 기준은 너무 엄격해 trendBlock으로 scroll 후에도 sticky 미등장
      // 케이스 발생. bottom 기준으로 변경해 사용자 직접 스크롤 시도 더 자연스럽게.
      const inlineScrolledAbove = inlineRect.bottom < 64;

      setShowSticky(sectionVisible && inlineScrolledAbove);
    };

    computeSticky();
    window.addEventListener("scroll", computeSticky, { passive: true });
    window.addEventListener("resize", computeSticky);
    return () => {
      window.removeEventListener("scroll", computeSticky);
      window.removeEventListener("resize", computeSticky);
    };
  }, []);

  /* ── 탭 변경 시 트렌드 블록으로 자동 스크롤 (모바일 전용) ──
        모바일은 sticky bar UX와 결합해 사용자가 카테고리 비교를 빠르게 할 수
        있도록 스크롤. 데스크탑은 한 화면에 콘텐츠가 거의 보이므로 불필요.
        scrollOffset = 56px → trendBlock.top = 56, selectorWrap.bottom ≈ 48
        (임계 < 64 충족, sticky bar 확실히 등장).
        hasInteracted=false 첫 마운트는 스크롤 X. */
  useEffect(() => {
    if (!hasInteracted) return;
    if (typeof window === "undefined") return;
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const target = trendBlockRef.current;
    if (!target) return;
    const scrollOffset = 56;
    const top =
      target.getBoundingClientRect().top + window.scrollY - scrollOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [activeIdx, hasInteracted]);

  /* ── sticky selector 노출 시 글로벌 CSS 변수에 offset을 알려서
        플로팅 피드백 버튼이 가려지지 않고 sticky 박스 바로 위에 위치하도록 함.
        값: sticky 박스 높이(~56px) − fab과 nav 간 gap 차이 = 48px
        (너무 크면 fab이 콘텐츠 가운데로 떠올라 부담스러움) ── */
  useEffect(() => {
    const root = document.documentElement;
    if (showSticky) {
      root.style.setProperty("--sticky-selector-offset", "48px");
    } else {
      root.style.removeProperty("--sticky-selector-offset");
    }
    return () => {
      root.style.removeProperty("--sticky-selector-offset");
    };
  }, [showSticky]);

  const cat = CATEGORIES[renderedIdx];
  const trend = TREND_BENTO_PROFILES[cat.trendKey];
  const cost = COST_TYPE_PROFILES[cat.costKey];
  const maxPct = Math.max(...trend.chart.items.map((r) => r.pct));
  /** 근거를 찾지 못한 비교 항목은 데이터에서 지웠다(10/3) — 탭마다 0~4개 */
  const compareItems = trend.compare?.items ?? [];

  /* 카운트업 시작 — 마운트 즉시가 아니라 섹션이 뷰포트에 들어올 때 (9/28).
     마운트 트리거면 사용자가 이 섹션에 닿기 전에 애니메이션이 끝나 아무도 못 본다. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // reduced-motion 이면 트리거를 켜지 않는다 — 훅의 초기 표시가 이미 최종값이다
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountTrigger(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const heroDisplay = useCountUp(trend.hero.value, countTrigger, 800);
  const stat0Display = useCountUp(trend.stats[0].value, countTrigger, 800);
  const stat1Display = useCountUp(trend.stats[1].value, countTrigger, 800);

  // 비용 카드 값
  const allCostCards = [cost.hero, ...cost.cards];
  const [costVals, setCostVals] = useState(() =>
    allCostCards.map((c) => formatCostValue(c, c.value)),
  );

  const handleChange = useCallback((idx: number, via: "pointer" | "keyboard" = "pointer") => {
    // 같은 탭 클릭만 무시 — phase 가드는 제거해서 애니메이션 중에도 즉시 반응
    if (idx === activeIdx) return;
    skipScrollRef.current = via === "keyboard";

    // 진행 중이던 타이머 모두 취소
    if (outTimer.current) clearTimeout(outTimer.current);
    if (inTimer.current) clearTimeout(inTimer.current);

    // selector + 콘텐츠 즉시 갱신 (out 단계 생략 — 빠른 연속 클릭 대응)
    setActiveIdx(idx);
    setRenderedIdx(idx);
    const nextCat = CATEGORIES[idx];
    const nextCost = COST_TYPE_PROFILES[nextCat.costKey];
    setCostVals([nextCost.hero, ...nextCost.cards].map((c) => formatCostValue(c, c.value)));

    // 페이드 in + 카운트업 재시작
    setCountTrigger(false);
    setPhase("in");
    if (!hasInteracted) setHasInteracted(true);

    setTimeout(() => setCountTrigger(true), 50);
    inTimer.current = setTimeout(() => setPhase("idle"), 350);
  }, [activeIdx, hasInteracted]);

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
    <section ref={sectionRef} className={s.section} aria-label="정착 유형별 트렌드와 비용">
      {/* ── 통합 타이틀 ── */}
      <div className={s.sectionIntro} data-reveal-x="left">
        <span className={s.sectionEyebrow}>#유형별 트렌드·비용</span>
        <h2 className={s.sectionTitle}>
          귀농, <em>농사</em>가 다는 아니에요
        </h2>
        <p className={s.sectionSub}>
          유형을 선택하면 트렌드와 비용을 한눈에 비교할 수 있어요
        </p>
      </div>

      {/* ── 세그먼트 컨트롤 (인라인) ── */}
      <div className={s.selectorWrap} ref={inlineSelectorRef}>
        <CategorySelector
          activeIdx={activeIdx}
          onChange={handleChange}
          ariaLabel="정착 유형 선택"
          idPrefix={inlineTabId}
          panelId={panelId}
        />
      </div>

      {/* ═══ 탭 패널 — 트렌드·정착한 사람 띠·비용 세 블록이 함께 바뀐다(10/6 QA: 탭이 가리킬 패널) ═══ */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${inlineTabId}-${CATEGORIES[activeIdx].id}`}
        className={s.panel}
      >
      {/* ═══ 트렌드 블록 — 원래 헤더 유지 (탭 변경 스크롤 앵커) ═══ */}
      <div ref={trendBlockRef} className={s.block}>
        <div className={s.blockHeader}>
          <div className={s.blockHeaderLeft}>
            <span className={s.eyebrow}>#정착 트렌드</span>
            <h2 className={s.title}>
              {renderTitleWithEm(trend.title, trend.titleEm)}
            </h2>
            <p className={s.subtitle}>{trend.subtitle}</p>
          </div>
          <Link href={trend.href} className={s.moreLink} data-track="trend:more">
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

          {/* 바 차트 타일 — 비교 타일이 없는 탭(귀산촌)은 1024+ 에서 그 자리(3열 2행)까지 채운다(CSS :has) */}
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

          {/* 비교 타일 — 공식 근거가 있는 항목만 데이터에 남는다(10/3). 0개면 타일째 숨기고,
              2열 목록에서 홀수 개면 마지막 칸을 전폭으로 편다(CSS :nth-child) */}
          {trend.compare && compareItems.length > 0 && (
            <div className={s.tileCompare}>
              <h3 className={s.compareTitle}>{trend.compare.title}</h3>
              <div className={s.compareList}>
                {compareItems.map((row, i) => (
                  <div key={row.label} className={s.compareItem}
                    style={{ "--ci": i } as React.CSSProperties}>
                    <span className={s.compareLabel}>{row.label}</span>
                    <span className={s.compareChange}>{row.change}</span>
                    <span className={s.compareDetail}>{row.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DataSource source={trend.source} />
      </div>

      {/* ═══ 정착한 사람 띠 — 고른 유형의 인터뷰만 (10/5 회장: 트렌드와 비용 사이, 지역 띠처럼 배경 그림) ═══
          계측 래퍼(trackId="interviews")는 탭을 바꿔도 그대로라 노출이 한 번만 찍히고, 안쪽 key 만 바뀌며
          그 유형의 띠가 새로 들어온다(바탕색은 띠가 쥐고 있어 전환 때 흰 틈이 없다) */}
      {interviewBands && (
        <ScrollReveal trackId="interviews" variant="fade" className={s.bandSlot}>
          <div key={cat.id}>{interviewBands[cat.trendKey] ?? null}</div>
        </ScrollReveal>
      )}

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
            <Link href={`/costs?type=${cost.id}`} className={s.costCta} data-track={`cost:${cost.id}`}>
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
                <span className={s.costCardNum}><CountUp value={costVals[0]} /></span>
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
                    <span className={`${s.costCardNum} ${colorClass}`}><CountUp value={costVals[i + 1]} /></span>
                    <span className={s.costCardUnit}>{card.unit}</span>
                  </div>
                  {card.note && <span className={s.costCardNote}>{card.note}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      </div>

      {/* ── 모바일 하단 sticky 세그먼트 (Portal — ScrollReveal transform 회피) ── */}
      {mounted && createPortal(
        <div
          className={`${s.stickyBar} ${showSticky ? s.stickyVisible : ""}`}
          aria-hidden={!showSticky}
          /* 숨은 동안 버튼 5개가 화면 밖에서 Tab 포커스를 받았다(10/2 QA) — aria-hidden 만으로는 포커스가 막히지 않는다 */
          inert={!showSticky}
        >
          <CategorySelector
            activeIdx={activeIdx}
            onChange={handleChange}
            ariaLabel="정착 유형 선택 (고정)"
            idPrefix={`${baseId}-stab`}
            panelId={panelId}
          />
        </div>,
        document.body,
      )}
    </section>
  );
}
