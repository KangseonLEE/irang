"use client";

import { useState, useEffect, useRef } from "react";
import s from "./keyword-rotator.module.css";

const KEYWORDS = [
  "귀농",
  "귀촌",
  "귀산촌",
  "청년농",
  "스마트팜",
  "치유농업",
  "사회적 농업",
  "농촌 쉼터",
];
const INTERVAL_MS = 2000;
const ANIM_MS = 650;

export function KeywordRotator() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"idle" | "animating">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const nextIdx = (current + 1) % KEYWORDS.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    timerRef.current = setInterval(() => {
      setPhase("animating");
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % KEYWORDS.length);
        setPhase("idle");
      }, ANIM_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <span className={s.block} aria-label={KEYWORDS.join(", ")}>
      {/* 현재 키워드 + "준비," */}
      <span className={`${s.line} ${phase === "animating" ? s.exit : ""}`}>
        <span className={s.keyword}>{KEYWORDS[current]}</span> 준비,
      </span>
      {/* 다음 키워드 + "준비," */}
      <span
        className={`${s.line} ${s.nextLine} ${phase === "animating" ? s.enter : ""}`}
        aria-hidden="true"
      >
        <span className={s.keyword}>{KEYWORDS[nextIdx]}</span> 준비,
      </span>
    </span>
  );
}
