"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import s from "./snap-dots.module.css";

interface Props {
  /** scroll-snap 가로 트랙 ref (자식 1개 = 카드 1장) */
  trackRef: RefObject<HTMLElement | null>;
  /** 카드 수 — 2장 미만이면 렌더하지 않는다 */
  count: number;
  /** 점 묶음 aria-label */
  label?: string;
  /** 각 점의 aria-label (없으면 "N번째") */
  itemLabel?: (index: number) => string;
  /** 어두운 배경 위(히어로)에서는 흰 점으로 — 기본 브랜드 그린은 대비가 1.05:1 까지 떨어진다 (9/29 QA) */
  tone?: "default" | "onDark";
  /** 768+ 에서도 보이기 — 데스크탑에서도 한 장씩 넘기는 캐러셀(히어로 유형 카드, 10/2)만 켠다 */
  persistent?: boolean;
  className?: string;
}

/**
 * 가로 스냅 캐러셀의 현재 위치 점 (2026-09-28: start-cards 로컬 구현을 공용으로 승격).
 *
 * - 스크롤 위치 → 활성 점 동기화. 점 클릭 시 해당 카드로 스크롤.
 * - 데스크탑(768+)에서는 CSS 로 숨긴다 — 그리드로 전부 보이므로 위치 개념이 없다.
 * - 트랙 내용이 바뀌는 경우(탭 전환)는 호출처에서 `key` 로 초기화한다.
 */
export function SnapDots({
  trackRef,
  count,
  label = "카드 위치",
  itemLabel,
  tone = "default",
  persistent = false,
  className,
}: Props) {
  const [active, setActive] = useState(0);

  const step = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.children.length) return 0;
    const first = el.children[0] as HTMLElement;
    return first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
  }, [trackRef]);

  const sync = useCallback(() => {
    const el = trackRef.current;
    const width = step();
    if (!el || !width) return;
    setActive(Math.max(0, Math.min(Math.round(el.scrollLeft / width), count - 1)));
  }, [trackRef, step, count]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    return () => el.removeEventListener("scroll", sync);
  }, [trackRef, sync]);

  if (count < 2) return null;

  const jump = (i: number) => {
    const el = trackRef.current;
    const width = step();
    if (!el || !width) return;
    el.scrollTo({ left: i * width, behavior: "smooth" });
  };

  return (
    <div
      className={`${s.dots}${tone === "onDark" ? ` ${s.dotsOnDark}` : ""}${persistent ? ` ${s.dotsPersistent}` : ""} ${className ?? ""}`}
      role="tablist"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={itemLabel ? itemLabel(i) : `${i + 1}번째`}
          className={`${s.dot} ${i === active ? s.dotActive : ""}`}
          onClick={() => jump(i)}
        />
      ))}
    </div>
  );
}
