"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import s from "./service-carousel.module.css";

/* ── 타입 ── */

export interface ServiceCard {
  badge: string;
  title: string;
  desc: string;
  items: { label: string; sub: string; href: string }[];
  more: { label: string; href: string };
  illustration: React.ReactNode;
  variant?: "region" | "crop" | "program";
}

interface ServiceCarouselProps {
  cards: ServiceCard[];
}

/* ── 카드 배경 변형 ── */

const variantClass: Record<string, string> = {
  region: s.cardRegion,
  crop: s.cardCrop,
  program: s.cardProgram,
};

/* ── 컴포넌트 ── */

/**
 * 카카오뱅크 블로그 스타일 대형 카드 캐러셀.
 *
 * - IntersectionObserver(ratioMap) 기반 정확한 인디케이터 동기화
 * - track.scrollTo 기반 스크롤 (scrollIntoView 세로 점프 방지)
 * - rAF throttle로 scroll 이벤트 성능 최적화
 * - WCAG 접근성: role, aria-roledescription, 클릭 가능한 도트
 */
export function ServiceCarousel({ cards }: ServiceCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const ratioMap = useRef(new Map<Element, number>());
  const rafId = useRef<number | null>(null);

  // 마우스 드래그 스크롤
  useDragScroll(trackRef);

  const [current, setCurrent] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // refs 배열 길이를 cards.length에 맞춤 (useEffect로 이동하여 렌더 중 ref 접근 방지)
  useEffect(() => {
    cardRefs.current.length = cards.length;
  }, [cards.length]);

  /* ── IntersectionObserver: 가장 많이 보이는 카드 추적 ── */

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // cleanup에서 사용할 ref 값을 effect 본문에서 캡처
    const currentRatioMap = ratioMap.current;

    const observer = new IntersectionObserver(
      (entries) => {
        // 각 entry의 ratio를 Map에 누적
        entries.forEach((entry) => {
          currentRatioMap.set(entry.target, entry.intersectionRatio);
        });

        // 전체 카드 중 가장 많이 보이는 카드를 current로
        let maxRatio = 0;
        let maxIdx = 0;
        cardRefs.current.forEach((el, idx) => {
          if (!el) return;
          const ratio = currentRatioMap.get(el) ?? 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxIdx = idx;
          }
        });

        if (maxRatio > 0) setCurrent(maxIdx);
      },
      {
        root: track,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      currentRatioMap.clear();
    };
  }, [cards.length]);

  /* ── scroll 이벤트: canPrev/canNext 업데이트 (rAF throttle) ── */

  const updateNav = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateNav();

    const onScroll = () => {
      if (rafId.current != null) return;
      rafId.current = requestAnimationFrame(() => {
        updateNav();
        rafId.current = null;
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateNav);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateNav);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [updateNav]);

  /* ── 스크롤 네비게이션 ── */

  const scrollToIndex = useCallback((idx: number) => {
    const el = cardRefs.current[idx];
    const track = trackRef.current;
    if (!el || !track) return;
    setCurrent(idx); // 즉시 반영 (빠른 연속 클릭 대응)
    track.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
  }, []);

  const goPrev = useCallback(
    () => scrollToIndex(Math.max(0, current - 1)),
    [current, scrollToIndex],
  );

  const goNext = useCallback(
    () => scrollToIndex(Math.min(cards.length - 1, current + 1)),
    [current, cards.length, scrollToIndex],
  );

  /* ── 렌더 ── */

  return (
    <div
      className={s.wrapper}
      role="region"
      aria-roledescription="carousel"
      aria-label="주요 서비스"
    >
      {/* 캐러셀 트랙 */}
      <div ref={trackRef} className={s.track} aria-live="polite">
        {cards.map((card, i) => (
          <article
            key={card.badge}
            ref={(el) => { cardRefs.current[i] = el; }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${cards.length}: ${card.title}`}
            className={`${s.card} ${card.variant ? variantClass[card.variant] ?? "" : ""}`}
          >
            {/* 왼쪽: 콘텐츠 */}
            <div className={s.cardContent}>
              <span className={s.badge}>{card.badge}</span>
              <h3 className={s.cardTitle}>{card.title}</h3>
              <p className={s.cardDesc}>{card.desc}</p>

              <div className={s.itemList}>
                {card.items.map((item, idx) => (
                  <Link key={item.href} href={item.href} className={s.item}>
                    <span className={s.itemNum}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className={s.itemText}>
                      <span className={s.itemLabel}>{item.label}</span>
                      <span className={s.itemSub}>{item.sub}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <Link href={card.more.href} className={s.moreLink}>
                {card.more.label}
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* 오른쪽: 일러스트 */}
            <div className={s.cardIllust}>{card.illustration}</div>
          </article>
        ))}
      </div>

      {/* 하단 컨트롤: 화살표 + 도트 가운데 정렬 */}
      <div className={s.controls}>
        <button
          type="button"
          className={s.arrowBtn}
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="이전 카드"
        >
          <ChevronLeft size={18} />
        </button>

        <div className={s.dots} role="tablist" aria-label="슬라이드 선택">
          {cards.map((card, i) => (
            <button
              key={card.badge}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`${card.title} 슬라이드`}
              className={`${s.dot} ${i === current ? s.dotActive : ""}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className={s.arrowBtn}
          onClick={goNext}
          disabled={!canNext}
          aria-label="다음 카드"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
