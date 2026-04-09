"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import type { InterviewCard } from "@/lib/data/landing";
import s from "./interview-carousel.module.css";

interface InterviewCarouselProps {
  items: InterviewCard[];
}

export function InterviewCarousel({ items }: InterviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  // 마우스 드래그 스크롤
  useDragScroll(scrollRef);

  /** 현재 보이는 카드 인덱스 계산 */
  const updateIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const gap = 16;
    const cardWidth = card.offsetWidth + gap;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(idx, items.length - 1));
  }, [items.length]);

  /** 반응형 visible count 계산 */
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisibleCount(3);
      else if (w >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /** 스크롤 이벤트 리스너 */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateIndex);
  }, [updateIndex]);

  /** 화살표 클릭으로 이동 */
  const scrollTo = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const gap = 16;
    const cardWidth = card.offsetWidth + gap;
    const target =
      direction === "next"
        ? el.scrollLeft + cardWidth
        : el.scrollLeft - cardWidth;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const maxIndex = Math.max(0, items.length - visibleCount);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < maxIndex;

  return (
    <div className={s.wrapper}>
      {/* 카드 스크롤 영역 */}
      <div ref={scrollRef} className={s.scrollArea}>
        {items.map((person) => (
          <Link
            key={person.id}
            href={`/interviews/${person.id}`}
            className={s.card}
          >
            {/* 상단: 아바타 + 이야기 읽기 */}
            <div className={s.cardTop}>
              <FarmerAvatar name={person.name} seed={person.id} size="sm" />
              <span className={s.readMore}>
                이야기 읽기 <ArrowRight size={12} />
              </span>
            </div>

            <div className={s.profile}>
              <span className={s.name}>
                {person.name} · {person.age}
              </span>
              <span className={s.meta}>
                {person.prevJob} &rarr; {person.currentJob}
              </span>
            </div>

            <p className={s.quote}>{person.quote}</p>

            <div className={s.tags}>
              <span className={s.tag}>{person.region}</span>
              <span className={s.tag}>{person.crop}</span>
            </div>

            {/* 출처 */}
            <div className={s.source}>
              {person.sourceName} · {person.sourceDate}
            </div>
          </Link>
        ))}
      </div>

      {/* 캐러셀 컨트롤: 모바일 + 데스크탑 */}
      <div className={s.controls}>
        <button
          className={s.arrow}
          onClick={() => scrollTo("prev")}
          disabled={!canPrev}
          aria-label="이전 인터뷰"
        >
          <ChevronLeft size={18} />
        </button>

        <div className={s.dots} role="tablist" aria-label="인터뷰 캐러셀 탐색">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`인터뷰 ${i + 1}번 보기`}
              className={`${s.dot} ${i === activeIndex ? s.dotActive : ""}`}
              onClick={() => {
                const el = scrollRef.current;
                if (!el || !el.children.length) return;
                const card = el.children[0] as HTMLElement;
                const gap = 16;
                const cardWidth = card.offsetWidth + gap;
                el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
              }}
            />
          ))}
        </div>

        <button
          className={s.arrow}
          onClick={() => scrollTo("next")}
          disabled={!canNext}
          aria-label="다음 인터뷰"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
