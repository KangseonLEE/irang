"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CountUpProps {
  /** 최종 목표 숫자 (예: 6219, 27.4, 3) */
  end: number;
  /** 소수점 자릿수 (기본 0) */
  decimals?: number;
  /** 천 단위 구분자 사용 여부 (기본 true) */
  separator?: boolean;
  /** 숫자 앞 접두사 (예: "최대 ") */
  prefix?: string;
  /** 애니메이션 지속 시간 ms (기본 2400) */
  duration?: number;
  /** 추가 className */
  className?: string;
}

/** easeOutExpo — 빠르게 올라가다 끝에서 감속 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** 천 단위 콤마 포맷 */
function formatNumber(n: number, decimals: number, useSeparator: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!useSeparator) return fixed;
  const [intPart, decPart] = fixed.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withComma}.${decPart}` : withComma;
}

export function CountUp({
  end,
  decimals = 0,
  separator = true,
  prefix = "",
  duration = 2400,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(prefix + formatNumber(0, decimals, separator));
  const rafId = useRef<number>(0);
  const hasPlayed = useRef(false);

  const animate = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    setDisplay(prefix + formatNumber(0, decimals, separator));

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * end;

      setDisplay(prefix + formatNumber(current, decimals, separator));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setDisplay(prefix + formatNumber(end, decimals, separator));
      }
    }

    rafId.current = requestAnimationFrame(tick);
  }, [end, decimals, separator, prefix, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
