"use client";

import { useSyncExternalStore } from "react";

/**
 * 히어로 여정 카드의 "선택 중" 신호 (2026-09-29 S).
 *
 * 선택 패널이 떠 있는 동안 배경 슬라이드 자동 전환을 멈춘다 — 읽는 중에 배경이 바뀌면 산만하다.
 * `JourneyLanes`(선택 상태 보유)와 `HeroSlider`(자동 전환 보유)는 형제라 props 로 이을 수 없고,
 * 둘 다 서버 컴포넌트(page.tsx)의 자식이라 Context Provider 를 새로 끼우면 히어로 전체가 client 가 된다.
 * 그래서 모듈 스코프 스토어 하나로 잇는다 — SSR 스냅샷은 항상 false 라 하이드레이션 불일치가 없다.
 */

let selected = false;
const listeners = new Set<() => void>();

export function setHeroLaneSelected(next: boolean) {
  if (selected === next) return;
  selected = next;
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** @public 보관(10/1 회장) — 여정 레인 히어로(archive/hero-journey-lanes-2026-10-01)를 되살릴 때 HeroSlider 가 쓴다 */
export function useHeroLaneSelected(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => selected,
    () => false,
  );
}
