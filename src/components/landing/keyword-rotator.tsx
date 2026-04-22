"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [widths, setWidths] = useState<number[]>([]);
  const measureRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const nextIdx = (current + 1) % KEYWORDS.length;

  const remeasure = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    setWidths(
      KEYWORDS.map((kw) => {
        el.textContent = kw;
        return el.offsetWidth;
      }),
    );
  }, []);

  useEffect(() => {
    remeasure();
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, [remeasure]);

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

  const targetWidth =
    widths.length > 0
      ? phase === "animating"
        ? widths[nextIdx]
        : widths[current]
      : undefined;

  return (
    <>
      {/* 측정용 숨김 span — h1 폰트 스타일 상속 */}
      <span ref={measureRef} className={s.measure} aria-hidden="true" />
      <span
        className={s.rotator}
        style={targetWidth != null ? { width: targetWidth } : undefined}
        aria-label={KEYWORDS.join(", ")}
      >
        <span className={`${s.word} ${phase === "animating" ? s.exit : ""}`}>
          {KEYWORDS[current]}
        </span>
        <span
          className={`${s.word} ${phase === "animating" ? s.enter : ""}`}
          aria-hidden="true"
        >
          {KEYWORDS[nextIdx]}
        </span>
      </span>
    </>
  );
}
