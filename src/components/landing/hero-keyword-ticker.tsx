"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { HERO_INTRO_MS } from "./hero-intro";
import s from "./hero-search-hub.module.css";

/**
 * 히어로 검색창 아래 "이런 검색어를 추천해요 {검색어}" — 한 단어씩 아래→위로 넘긴다 (10/2 회장).
 * 칩 6개를 늘어놓던 것을 한 줄로 줄였다. 링크는 전부 SSR 에 남는다(대기 중인 항목은 시각적으로만 숨김,
 * 포커스는 지금 보이는 것 하나만 받는다).
 *
 * - 마우스·키보드 포커스가 줄 위에 있는 동안은 넘기지 않는다(누르려는 순간 바뀌면 안 된다).
 * - prefers-reduced-motion / 숨은 탭: 정지.
 * - 10/2: 히어로 등장 연출(HERO_INTRO_MS)이 끝난 뒤부터 넘긴다. 대기는 마운트 1회만 —
 *   hover 로 멈췄다 풀릴 때마다 다시 기다리지 않게 별도 상태로 둔다.
 */
const INTERVAL_MS = 3200;

export function HeroKeywordTicker({ keywords }: { keywords: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), HERO_INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced || held || !introDone || keywords.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % keywords.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduced, held, introDone, keywords.length]);

  const current = reduced ? 0 : index;
  const prev = (current - 1 + keywords.length) % keywords.length;

  return (
    <p
      className={s.ticker}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <span className={s.tickerLabel}>이런 검색어를 추천해요</span>
      <span className={s.tickerSlot}>
        {keywords.map((kw, i) => {
          const state = i === current ? "in" : i === prev ? "out" : "wait";
          return (
            <Link
              key={kw}
              href={`/search?q=${encodeURIComponent(kw)}`}
              className={s.tickerItem}
              data-state={state}
              data-track={`hero_tag:${kw}`}
              aria-hidden={state === "in" ? undefined : true}
              tabIndex={state === "in" ? undefined : -1}
            >
              {kw}
            </Link>
          );
        })}
      </span>
    </p>
  );
}
