"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
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
 */

export interface HeroScene {
  id: string;
  image: string;
}

const INTERVAL_MS = 4500;

export function HeroRotator({ scenes }: { scenes: readonly HeroScene[] }) {
  const [index, setIndex] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || scenes.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % scenes.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduced, scenes.length]);

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
          <Image
            src={scene.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            quality={70}
            className={s.bgImage}
          />
        </div>
      ))}
    </div>
  );
}
