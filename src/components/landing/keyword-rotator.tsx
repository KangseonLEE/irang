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

  // 각 키워드별 너비 개별 측정
  const remeasure = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    const measured = KEYWORDS.map((kw) => {
      el.textContent = kw;
      return el.offsetWidth;
    });
    setWidths(measured);
  }, []);

  // 마운트 + 리사이즈 시 재측정
  useEffect(() => {
    remeasure();
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, [remeasure]);

  // 키워드 로테이션
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

  // 애니메이팅 중 → 다음 키워드 너비, idle → 현재 키워드 너비
  const targetWidth =
    widths.length > 0
      ? phase === "animating"
        ? widths[nextIdx]
        : widths[current]
      : undefined;

  return (
    <span className={s.rotator} aria-label={KEYWORDS.join(", ")}>
      <span ref={measureRef} className={s.measure} aria-hidden="true" />
      {/* sizer: 너비 transition 담당, overflow 제한 없음 */}
      <span
        className={s.sizer}
        style={targetWidth != null ? { width: targetWidth } : undefined}
      >
        {/* clipper: clip-path로 상하만 클리핑, 좌우는 자유 */}
        <span className={s.clipper}>
          <span className={`${s.word} ${phase === "animating" ? s.exit : ""}`}>
            {KEYWORDS[current]}
          </span>
          <span
            className={`${s.word} ${s.nextWord} ${phase === "animating" ? s.enter : ""}`}
            aria-hidden="true"
          >
            {KEYWORDS[nextIdx]}
          </span>
        </span>
      </span>
    </span>
  );
}
