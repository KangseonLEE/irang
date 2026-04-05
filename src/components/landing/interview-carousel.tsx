"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import type { InterviewCard } from "@/lib/data/landing";
import s from "./interview-carousel.module.css";

interface InterviewCarouselProps {
  items: InterviewCard[];
}

export function InterviewCarousel({ items }: InterviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);

  /** 현재 보이는 카드 인덱스 계산 */
  const updateIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const cardWidth = card.offsetWidth + 16; // gap 포함
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(idx, items.length - 1));
  }, [items.length]);

  /** 모바일 여부 판단 (768px 미만에서만 캐러셀 UI) */
  useEffect(() => {
    const check = () => setShowArrows(window.innerWidth < 768);
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
    const cardWidth = card.offsetWidth + 16;
    const target =
      direction === "next"
        ? el.scrollLeft + cardWidth
        : el.scrollLeft - cardWidth;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

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

            {/* 귀농 동기 1줄 미리보기 */}
            <p className={s.motivation}>{person.motivation}</p>

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

      {/* 모바일 전용: 화살표 + 인디케이터 */}
      {showArrows && (
        <div className={s.controls}>
          <button
            className={s.arrow}
            onClick={() => scrollTo("prev")}
            disabled={activeIndex === 0}
            aria-label="이전 인터뷰"
          >
            <ChevronLeft size={18} />
          </button>

          <div className={s.dots}>
            {items.map((_, i) => (
              <span
                key={i}
                className={`${s.dot} ${i === activeIndex ? s.dotActive : ""}`}
              />
            ))}
          </div>

          <button
            className={s.arrow}
            onClick={() => scrollTo("next")}
            disabled={activeIndex === items.length - 1}
            aria-label="다음 인터뷰"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
