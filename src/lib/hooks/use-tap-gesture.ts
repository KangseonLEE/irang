"use client";

/**
 * useTapGesture — "눌렀다 뗀" 탭만 인식하는 포인터 핸들러 (2026-09-07)
 *
 * 배경: 모바일 히어로 검색창이 onPointerDown 에서 오버레이를 열어, 검색창을 잡고 스크롤을
 * 시작하기만 해도(손가락을 떼지 않았는데) 오버레이가 떠 버렸다(회장 라이브 리포트).
 * 탭 판정: pointerdown → pointerup 사이 이동 거리 < TAP_SLOP 이고 페이지 스크롤이 없어야 한다.
 * pointercancel(브라우저가 스크롤 제스처로 가져간 경우)은 탭 아님.
 */

import { useCallback, useRef } from "react";

/** 이동 허용 픽셀 — 이보다 크면 스크롤/드래그로 본다 */
export const TAP_SLOP = 10;

export interface TapStart {
  x: number;
  y: number;
  scrollY: number;
}

/** 순수 판정 함수 — 테스트용으로 export */
export function isTap(start: TapStart, end: { x: number; y: number; scrollY: number }): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.hypot(dx, dy) < TAP_SLOP && end.scrollY === start.scrollY;
}

export function useTapGesture(onTap: () => void, enabled = true) {
  const startRef = useRef<TapStart | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      startRef.current = { x: e.clientX, y: e.clientY, scrollY: window.scrollY };
    },
    [enabled],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!enabled || !start) return;
      if (isTap(start, { x: e.clientX, y: e.clientY, scrollY: window.scrollY })) onTap();
    },
    [enabled, onTap],
  );

  const onPointerCancel = useCallback(() => {
    startRef.current = null;
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onTap();
      }
    },
    [enabled, onTap],
  );

  return enabled
    ? { onPointerDown, onPointerUp, onPointerCancel, onKeyDown }
    : {};
}
