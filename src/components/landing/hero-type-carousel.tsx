"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SnapDots } from "@/components/ui/snap-dots";
import s from "./hero-search-hub.module.css";

/**
 * 히어로 정착 유형 카드 캐러셀 (2026-10-02 회장).
 *
 * - 모든 폭에서 카드 한 장 + 다음 카드 peek 가로 스냅. 1차(같은 날 오전)는 <768 만 캐러셀이고
 *   768+ 는 그리드였는데, 1024~1279 의 2열 3행이 그대로 보인다는 회장 피드백으로 전 폭 통일.
 * - 768+ 는 마우스로 밀기 어려워 이전·다음 화살표를 점 양옆에 둔다(모바일은 스와이프 + 점).
 * - 카드(<li><Link>)는 서버가 children 으로 넘긴다 → SSR 링크 6개 유지.
 * - HeroRotator 가 카드에 `data-active` 를 옮겨도 트랙을 스크롤하지 않는다(사용자가 보던 위치를 빼앗지 않음).
 */
export function HeroTypeCarousel({ labels, children }: { labels: string[]; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);

  const move = (dir: 1 | -1) => {
    const el = trackRef.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    const max = el.scrollWidth - el.clientWidth;
    const next = el.scrollLeft + dir * step;
    // 양 끝에서는 반대쪽으로 돌아간다 — 6장을 한 바퀴 돌 수 있게
    const target = next > max + 2 ? 0 : next < -2 ? max : next;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <ul ref={trackRef} className={s.typeGrid}>
        {children}
      </ul>
      <div className={s.typeNav}>
        <button type="button" className={s.typeNavBtn} onClick={() => move(-1)} aria-label="이전 정착 유형">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <SnapDots
          trackRef={trackRef}
          count={labels.length}
          label="정착 유형 카드 위치"
          itemLabel={(i) => `${labels[i]} 카드로`}
          tone="onDark"
          persistent
          className={s.typeDots}
        />
        <button type="button" className={s.typeNavBtn} onClick={() => move(1)} aria-label="다음 정착 유형">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
