"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { HERO_INTRO_MS } from "./hero-intro";
import { useHeroMotionPaused } from "./hero-motion";
import s from "./hero-search-hub.module.css";

/**
 * 히어로 장면 회전 (2026-10-01 회장: "처음처럼 문장 속 단어가 슬라이드되며 전환, 배경 이미지도 슬라이드").
 *
 * 한 타이머가 세 가지를 같이 넘긴다 — 순서가 어긋나면 "문장은 귀촌인데 배경은 스마트팜"이 된다.
 *   ① 배경 레이어(이 컴포넌트가 직접 그림): 크로스페이드 + 천천히 확대
 *   ② h1 안의 단어(서버 마크업 `[data-hero-word=<id>]`): data-state 로 아래→위 슬라이드
 *   ③ 유형 카드(서버 마크업 `[data-hero-card=<id>]`): data-active 강조
 * ②③ 은 서버 컴포넌트라 상태를 props 로 줄 수 없어 히어로 루트 안에서 DOM 속성으로만 잇는다.
 *
 * - prefers-reduced-motion: 첫 장면에 멈춘다(SSR 상태 그대로).
 * - 탭이 숨겨진 동안은 넘기지 않는다.
 * - 10/2: 등장 연출(HERO_INTRO_MS)이 끝난 뒤에 타이머를 건다 — 첫 장면은 연출 + 한 주기만큼 머문다.
 */

export interface HeroScene {
  id: string;
  image: string;
}

const INTERVAL_MS = 4500;

export function HeroRotator({ scenes }: { scenes: readonly HeroScene[] }) {
  const [index, setIndex] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const paused = useHeroMotionPaused();
  const rootRef = useRef<HTMLDivElement>(null);
  /**
   * 배경 이미지는 첫 장면만 처음에 받는다 — 5장(데스크탑 ≈600KB)을 한꺼번에 받던 것을(10/2 실측)
   * 등장 연출이 끝나면 다음 장면 1장, 이후엔 "지금 + 다음"만 미리 받는 식으로 나눈다.
   */
  const [ticks, setTicks] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  // 연출 전엔 첫 장면만, 연출 뒤엔 "지금까지 지나간 장면 + 다음 1장"
  const loadedUpTo = introDone ? Math.min(ticks + 1, scenes.length - 1) : 0;

  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), HERO_INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced || paused || !introDone || scenes.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % scenes.length);
      setTicks((t) => t + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduced, paused, introDone, scenes.length]);

  const current = reduced ? 0 : index;
  const prev = (current - 1 + scenes.length) % scenes.length;

  useEffect(() => {
    const hero = rootRef.current?.closest("[data-landing-hero]");
    if (!hero) return;
    const activeId = scenes[current]?.id;
    const prevId = scenes[prev]?.id;
    hero.querySelectorAll<HTMLElement>("[data-hero-word]").forEach((el) => {
      const id = el.dataset.heroWord;
      el.dataset.state = id === activeId ? "in" : id === prevId ? "out" : "wait";
    });
    hero.querySelectorAll<HTMLElement>("[data-hero-card]").forEach((el) => {
      if (el.dataset.heroCard === activeId) el.setAttribute("data-active", "");
      else el.removeAttribute("data-active");
    });
  }, [current, prev, scenes]);

  return (
    <div ref={rootRef} className={s.bgLayers}>
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          className={s.bgLayer}
          data-on={i === current ? "" : undefined}
          /* 들어오는 장면이 위 — 나가는 장면 위로 덮이며 페이드 */
          style={{ zIndex: i === current ? 2 : i === prev ? 1 : 0 }}
        >
          {(i <= loadedUpTo || i === current) && (
            <Image src={scene.image} alt="" fill priority={i === 0} sizes="100vw" quality={70} className={s.bgImage} />
          )}
        </div>
      ))}
    </div>
  );
}
