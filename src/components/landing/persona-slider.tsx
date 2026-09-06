"use client";

/**
 * PersonaSlider — 랜딩 "내 조건으로 순위 보기" 일러스트 카드 슬라이드 (2026-09-06 회장 지시)
 *
 * - 카드 전부 <Link> 라 SSR HTML 에 /regions/ranking?persona= 4개가 항상 남는다(8/30 SSR 링크 보존).
 * - 스크롤은 CSS scroll-snap, 화살표·점은 보조 조작. useSearchParams 미사용(Suspense 불필요).
 * - 일러스트는 public/landing/personas/{id}.webp (흰 배경 수채화 톤 — 작물 일러스트 규칙과 동일).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import s from "./persona-slider.module.css";

export interface PersonaCard {
  id: string;
  /** 버튼 한 줄 라벨 ("자녀 있어요") */
  label: string;
  /** 어떤 지역을 앞세우는지 한 줄 */
  hint: string;
  /** 일러스트 경로 */
  image: string;
  /** 일러스트 대체 텍스트 */
  alt: string;
}

const GAP = 12;

export function PersonaSlider({ items }: { items: readonly PersonaCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useDragScroll(scrollRef);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    const step = card.offsetWidth + GAP;
    setActive(Math.min(Math.round(el.scrollLeft / step), items.length - 1));
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [items.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const move = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    el.scrollBy({ left: dir * (card.offsetWidth + GAP), behavior: "smooth" });
  };

  const jump = (index: number) => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const card = el.children[0] as HTMLElement;
    el.scrollTo({ left: index * (card.offsetWidth + GAP), behavior: "smooth" });
  };

  return (
    <div className={s.root}>
      <div ref={scrollRef} className={s.track} aria-label="내 조건으로 지역 순위 보기">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/regions/ranking?persona=${item.id}`}
            className={s.card}
            data-track={`quickstart:persona:${item.id}`}
            prefetch={false}
          >
            <span className={s.figure} aria-hidden="true">
              <Image
                src={item.image}
                alt=""
                width={320}
                height={320}
                sizes="(min-width: 768px) 200px, 62vw"
                className={s.image}
              />
            </span>
            <span className={s.body}>
              <span className={s.label}>{item.label}</span>
              <span className={s.hint}>{item.hint}</span>
              <span className={s.cta}>
                순위 보기 <ArrowRight size={14} aria-hidden="true" />
              </span>
            </span>
            <span className={s.srOnly}>{item.alt}</span>
          </Link>
        ))}
      </div>

      <div className={s.controls}>
        <button
          type="button"
          className={s.arrow}
          onClick={() => move(-1)}
          disabled={!canPrev}
          aria-label="이전 조건"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className={s.dots} role="tablist" aria-label="조건 카드 위치">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${item.label} 카드로`}
              className={`${s.dot} ${i === active ? s.dotActive : ""}`}
              onClick={() => jump(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className={s.arrow}
          onClick={() => move(1)}
          disabled={!canNext}
          aria-label="다음 조건"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
