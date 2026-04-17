"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Users, Leaf, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import type { YouthCaseCard } from "@/lib/api/rda-youth";
import s from "./youth-case-cards.module.css";

interface YouthCaseCardsProps {
  cases: YouthCaseCard[];
  /** 섹션 제목 (기본: "청년농 재배 사례") */
  title?: string;
  /** 섹션 설명 */
  description?: string;
  /** 로드맵 인라인 모드 (border 없음) */
  inline?: boolean;
}

/**
 * 청년농 사례 캐러셀 — 3단 슬라이드 + 드래그 스크롤
 * 모바일: 1장, 태블릿: 2장, 데스크탑: 3장
 */
export function YouthCaseCards({
  cases,
  title = "청년농 재배 사례",
  description,
  inline = false,
}: YouthCaseCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useDragScroll(scrollRef);

  /** 현재 보이는 카드 인덱스 계산 */
  const updateIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const gap = 14;
    const cardWidth = card.offsetWidth + gap;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(idx, cases.length - 1));
  }, [cases.length]);

  /** 반응형 visible count */
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 1280) setVisibleCount(3);
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

  /** 화살표 클릭 이동 */
  const scrollTo = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const gap = 14;
    const cardWidth = card.offsetWidth + gap;
    const target =
      direction === "next"
        ? el.scrollLeft + cardWidth
        : el.scrollLeft - cardWidth;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  if (cases.length === 0) return null;

  const maxIndex = Math.max(0, cases.length - visibleCount);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < maxIndex;

  return (
    <section className={`${s.section} ${inline ? s.inline : ""}`}>
      <div className={s.header}>
        <div>
          <h2 className={s.sectionTitle}>
            <Icon icon={Users} size="lg" />
            {title}
          </h2>
          {description && <p className={s.sectionDesc}>{description}</p>}
        </div>

        {/* 데스크탑 화살표 (헤더 우측) */}
        <div className={s.headerArrows}>
          <button
            className={s.arrow}
            onClick={() => scrollTo("prev")}
            disabled={!canPrev}
            aria-label="이전 사례"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className={s.arrow}
            onClick={() => scrollTo("next")}
            disabled={!canNext}
            aria-label="다음 사례"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 캐러셀 스크롤 영역 */}
      <div ref={scrollRef} className={s.scrollArea}>
        {cases.map((c) => (
          <a
            key={c.id}
            href={c.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={s.card}
          >
            {/* YouTube 썸네일 (16:9) */}
            {c.youtubeId && (
              <div className={s.thumbnailWrap}>
                <Image
                  src={`https://img.youtube.com/vi/${c.youtubeId}/mqdefault.jpg`}
                  alt={c.title}
                  fill
                  sizes="(max-width: 767px) 85vw, (max-width: 1023px) 45vw, 30vw"
                  style={{ objectFit: "cover" }}
                />
                <span className={s.playButton} aria-hidden="true">
                  <Play size={20} fill="white" />
                </span>
              </div>
            )}

            {/* 유튜브 스타일 텍스트 영역 */}
            <div className={s.cardBody}>
              <div className={s.avatarSlot} aria-hidden="true">
                <Leaf size={16} />
              </div>
              <div className={s.cardText}>
                <p className={s.title}>{c.title}</p>
                <div className={s.meta}>
                  <span>{c.farmerName}</span>
                  <span className={s.metaDot} aria-hidden="true">·</span>
                  <span>{c.cropName}</span>
                  {c.region && (
                    <>
                      <span className={s.metaDot} aria-hidden="true">·</span>
                      <span>{c.region}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* 하단 인디케이터 닷 */}
      {maxIndex > 0 && (
        <div className={s.controls}>
          <button
            className={s.arrowMobile}
            onClick={() => scrollTo("prev")}
            disabled={!canPrev}
            aria-label="이전 사례"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={s.dots} role="tablist" aria-label="청년농 사례 탐색">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`사례 ${i + 1}번 보기`}
                className={`${s.dot} ${i === activeIndex ? s.dotActive : ""}`}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el || !el.children.length) return;
                  const card = el.children[0] as HTMLElement;
                  const gap = 14;
                  const cardWidth = card.offsetWidth + gap;
                  el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
                }}
              />
            ))}
          </div>

          <button
            className={s.arrowMobile}
            onClick={() => scrollTo("next")}
            disabled={!canNext}
            aria-label="다음 사례"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
