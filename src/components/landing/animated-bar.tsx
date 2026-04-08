"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedBarProps {
  /** 채워질 퍼센트 (0~100) */
  percent: number;
  /** 애니메이션 지속 시간 ms (기본 1600) */
  duration?: number;
  /** 바 전체 className */
  barClassName?: string;
  /** 채워지는 영역 className */
  fillClassName?: string;
  /** 바 안쪽 퍼센트 텍스트 className */
  percentClassName?: string;
  /** 퍼센트 텍스트 표시 여부 */
  showPercent?: boolean;
}

/** easeOutExpo — CountUp과 동일한 이징 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedBar({
  percent,
  duration = 1600,
  barClassName,
  fillClassName,
  percentClassName,
  showPercent = true,
}: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 뷰포트 진입 → 0부터 애니메이션 시작
          if (rafId.current) cancelAnimationFrame(rafId.current);
          setWidth(0);

          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            setWidth(eased * percent);

            if (progress < 1) {
              rafId.current = requestAnimationFrame(tick);
            } else {
              setWidth(percent);
            }
          }

          rafId.current = requestAnimationFrame(tick);
        } else {
          // 뷰포트 이탈 → 리셋 (다시 보일 때 재생되도록)
          if (rafId.current) cancelAnimationFrame(rafId.current);
          setWidth(0);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [percent, duration]);

  return (
    <div ref={ref} className={barClassName}>
      <div
        className={fillClassName}
        style={{ width: `${width}%` }}
      >
        {showPercent && width > 10 && (
          <span className={percentClassName}>
            {width >= percent ? `${percent}%` : `${Math.round(width)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
