"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SnapDots } from "@/components/ui/snap-dots";
import s from "./hero-search-hub.module.css";

/**
 * 히어로 정착 유형 카드 목록 (2026-10-02 회장: 모바일은 6장을 한 장씩 슬라이드).
 *
 * - <768: 가로 스냅 캐러셀(한 장 + 다음 카드 peek, 스와이프) + 위치 점(공용 SnapDots, 768+ 는 CSS 로 숨김).
 *   지금 스냅된 카드에 `data-active` 를 옮겨 강조한다(같은 날 오후 회장: 문장 속 유형어 회전과 싱크하지 않고
 *   "모바일은 슬라이드했을 때 포커싱"). 강조 CSS 는 <768 에만 있어 768+ 그리드는 호버로만 강조된다.
 * - 768+: CSS 가 그리드로 되돌린다.
 * - 카드(<li><Link>)는 서버가 children 으로 그대로 넘긴다 → SSR 링크 6개 유지.
 */
export function HeroTypeCarousel({ labels, children }: { labels: string[]; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const mark = () => {
      raf = 0;
      const items = Array.from(track.children) as HTMLElement[];
      if (!items.length) return;
      const step = items[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
      const index = step > 0 ? Math.min(items.length - 1, Math.max(0, Math.round(track.scrollLeft / step))) : 0;
      items.forEach((li, i) => {
        const card = li.querySelector<HTMLElement>("[data-hero-card]");
        if (!card) return;
        if (i === index) card.setAttribute("data-active", "");
        else card.removeAttribute("data-active");
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(mark);
    };
    mark();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <ul ref={trackRef} className={s.typeGrid}>
        {children}
      </ul>
      <SnapDots
        trackRef={trackRef}
        count={labels.length}
        label="정착 유형 카드 위치"
        itemLabel={(i) => `${labels[i]} 카드로`}
        tone="onDark"
        className={s.typeDots}
      />
    </>
  );
}
