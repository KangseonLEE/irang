"use client";

import { useEffect, useRef, useState } from "react";
import { useCountUp } from "@/lib/hooks/use-count-up";

interface Props {
  /** 최종 표기 (콤마·단위 접미 포함 가능) — 서버 렌더에는 이 문자열이 그대로 들어간다 */
  value: string;
  /** 카운트 지속 시간 (기본 800ms) */
  duration?: number;
  className?: string;
}

/**
 * 뷰포트에 들어오면 숫자를 0 → 값으로 세는 작은 클라이언트 섬 (2026-09-28).
 *
 * 서버 컴포넌트 안에서도 쓸 수 있고, 첫 렌더가 곧 최종 표기라 SSR HTML·JS 차단 환경에서
 * 숫자가 사라지지 않는다. reduced-motion 이면 훅이 애니메이션 자체를 건너뛴다.
 */
export function CountUp({ value, duration = 800, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [trigger, setTrigger] = useState(false);
  const display = useCountUp(value, trigger, duration);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTrigger(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
