"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import s from "./hero-search-hub.module.css";

/**
 * 히어로 자동 전환(장면·추천 검색어) 정지 상태 (2026-10-02).
 *
 * WCAG 2.2.2 — 5초 넘게 스스로 움직이는 콘텐츠는 멈출 수 있어야 한다. 장면 회전(HeroRotator)과
 * 추천 검색어 회전(HeroKeywordTicker)이 같은 버튼 하나로 함께 멈추도록 상태를 공유한다.
 * 히어로 본체는 서버 컴포넌트라 이 Provider 가 children(서버 마크업)을 그대로 감싼다.
 */
const HeroMotionContext = createContext<{ paused: boolean; toggle: () => void }>({
  paused: false,
  toggle: () => {},
});

export function HeroMotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <HeroMotionContext.Provider value={{ paused, toggle: () => setPaused((p) => !p) }}>
      {children}
    </HeroMotionContext.Provider>
  );
}

export function useHeroMotionPaused(): boolean {
  return useContext(HeroMotionContext).paused;
}

export function HeroPauseButton() {
  const { paused, toggle } = useContext(HeroMotionContext);
  return (
    <button
      type="button"
      className={s.pauseBtn}
      onClick={toggle}
      aria-pressed={paused}
      aria-label={paused ? "장면 자동 전환 다시 재생" : "장면 자동 전환 멈추기"}
      title={paused ? "다시 재생" : "멈추기"}
    >
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
    </button>
  );
}
