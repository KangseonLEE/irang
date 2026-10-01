"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import s from "./hero-showcase.module.css";

/**
 * 히어로 문장의 바뀌는 여정어 + 세로 점 (2026-10-01, efusioni 번안).
 *
 * - 시각 전용 — 부모 줄이 aria-hidden 이고 스크린리더는 h1 의 srOnly 문장을 읽는다(aria-live 없음).
 * - 같은 순간 `[data-hero]` 안의 `[data-hero-card=<id>]` 에 `data-active` 를 세워 카드 강조를 맞춘다.
 *   카드는 서버 마크업이라 상태를 props 로 내려 줄 수 없어 DOM 속성으로만 잇는다.
 * - prefers-reduced-motion 이면 첫 단어에 멈춘다(카드 강조도 첫 카드 고정).
 * - 탭이 숨겨진 동안은 넘기지 않는다 — 돌아왔을 때 몇 바퀴 건너뛴 상태로 보이지 않게.
 */

const INTERVAL_MS = 2800;

interface Word {
  id: string;
  word: string;
}

export function HeroWordRotator({ words }: { words: readonly Word[] }) {
  const [index, setIndex] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % words.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced, words.length]);

  const current = reduced ? 0 : index;
  const activeId = words[current]?.id;

  useEffect(() => {
    const root = anchorRef.current?.closest("[data-hero]");
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-hero-card]").forEach((el) => {
      if (el.dataset.heroCard === activeId) el.setAttribute("data-active", "");
      else el.removeAttribute("data-active");
    });
  }, [activeId]);

  return (
    <>
      <span ref={anchorRef} className={s.wordSlot}>
        {/* key 로 다시 마운트해 들어오는 애니메이션을 매번 재생한다 */}
        <span key={current} className={s.word}>
          {words[current]?.word}
        </span>
      </span>
      <span className={s.dots}>
        {words.map((w, i) => (
          <span key={w.id} className={s.dot} data-on={i === current ? "" : undefined} />
        ))}
      </span>
    </>
  );
}
