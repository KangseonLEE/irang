"use client";

import { useRef, type ReactNode } from "react";
import { SnapDots } from "@/components/ui/snap-dots";
import s from "./hero-search-hub.module.css";

/**
 * 히어로 정착 유형 카드 목록 (2026-10-02 회장: 모바일은 6장을 한 장씩 슬라이드).
 *
 * - <768: 가로 스냅 캐러셀(한 장 + 다음 카드 peek, 스와이프) + 위치 점(공용 SnapDots, 768+ 는 CSS 로 숨김).
 * - 768+: CSS 가 기존 그리드로 되돌린다 — 이 컴포넌트는 트랙 ref 만 쥔다.
 * - 카드(<li><Link>)는 서버가 children 으로 그대로 넘긴다 → SSR 링크 6개 유지.
 * - HeroRotator 가 카드에 `data-active` 를 옮겨도 트랙을 스크롤하지 않는다 — 사용자가 넘기던 위치를
 *   4.5초마다 빼앗지 않도록 강조만 한다.
 */
export function HeroTypeCarousel({ labels, children }: { labels: string[]; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);

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
