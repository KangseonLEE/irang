"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "./swipe-hint.module.css";

interface SwipeHintProps {
  /** 스크롤 감지 대상의 CSS selector 또는 ref 역할 — 부모 내 .tableWrap */
  scrollSelector?: string;
}

/**
 * 모바일에서 테이블 좌우 스크롤 안내를 표시하는 컴포넌트.
 * - 3초 후 자동 사라짐
 * - 첫 스크롤 감지 시 즉시 사라짐
 * - 768px 이상에서는 CSS로 숨김
 */
export function SwipeHint({ scrollSelector }: SwipeHintProps) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const hide = useCallback(() => {
    setVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // 3초 자동 숨김
    timerRef.current = setTimeout(hide, 3000);

    // 스크롤 감지 — 힌트의 다음 형제(tableWrap)에서 스크롤 이벤트 감지
    const hintEl = hintRef.current;
    let scrollTarget: Element | null = null;

    if (hintEl) {
      if (scrollSelector) {
        scrollTarget = hintEl.parentElement?.querySelector(scrollSelector) ?? null;
      } else {
        // 기본: 다음 형제 요소
        scrollTarget = hintEl.nextElementSibling;
      }
    }

    const onScroll = () => hide();

    if (scrollTarget) {
      scrollTarget.addEventListener("scroll", onScroll, { once: true, passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (scrollTarget) {
        scrollTarget.removeEventListener("scroll", onScroll);
      }
    };
  }, [hide, scrollSelector]);

  return (
    <div
      ref={hintRef}
      className={visible ? s.hint : s.hintHidden}
      aria-hidden="true"
    >
      ← 좌우로 밀어보세요
    </div>
  );
}
