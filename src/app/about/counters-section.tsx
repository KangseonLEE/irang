"use client";

import { useEffect, useRef, useState } from "react";
import s from "./counters-section.module.css";

interface CounterItem {
  /** 최종 표시 값 (숫자 또는 "30+" 같은 prefix·suffix 포함 문자열) */
  display: string;
  /** 애니메이션 종착값 (숫자만). 0이면 애니메이션 생략 */
  target: number;
  /** "+" 같은 suffix (애니메이션 중에도 노출) */
  suffix?: string;
  label: string;
  caption: string;
}

const ITEMS: CounterItem[] = [
  {
    display: "17",
    target: 17,
    label: "개 지역",
    caption: "전국 광역시·도",
  },
  {
    display: "",
    target: 0, // CROPS.length 를 props 로 받음
    label: "종 작물",
    caption: "주요 농업 작물",
  },
  {
    display: "30",
    target: 30,
    suffix: "+",
    label: "건 지원사업",
    caption: "전국·지역별 정착 지원",
  },
  {
    display: "",
    target: 0, // interviews.length 를 props 로 받음
    label: "명 이야기",
    caption: "실제 정착인 인터뷰",
  },
  {
    display: "5",
    target: 5,
    label: "개 기관",
    caption: "공공 데이터 출처",
  },
];

export interface CountersSectionProps {
  cropsCount: number;
  interviewsCount: number;
}

/**
 * 숫자 카운트업 애니메이션 섹션 (about 페이지 N2).
 *
 * - IntersectionObserver 로 viewport 진입 시 1회 발화
 * - prefers-reduced-motion: 즉시 최종값 표시
 * - 1200ms easeOutCubic
 */
export function CountersSection({
  cropsCount,
  interviewsCount,
}: CountersSectionProps) {
  const items: CounterItem[] = [
    ITEMS[0],
    { ...ITEMS[1], display: String(cropsCount), target: cropsCount },
    ITEMS[2],
    {
      ...ITEMS[3],
      display: String(interviewsCount),
      target: interviewsCount,
    },
    ITEMS[4],
  ];

  return (
    <section className={s.counters} aria-label="이랑이 큐레이션한 영역">
      <h2 className={s.title}>이랑이 큐레이션한 영역</h2>
      <p className={s.desc}>지금 둘러볼 수 있는 정착 정보예요.</p>
      <ul className={s.grid}>
        {items.map((it, i) => (
          <li key={i} className={s.item}>
            <CounterValue target={it.target} suffix={it.suffix} />
            <span className={s.label}>{it.label}</span>
            <span className={s.caption}>{it.caption}</span>
          </li>
        ))}
      </ul>
      <p className={s.note}>
        기상청·통계청(KOSIS·SGIS)·농촌진흥청·심평원·교육부 데이터 기반이에요.
      </p>
    </section>
  );
}

function CounterValue({
  target,
  suffix,
}: {
  target: number;
  suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    // prefers-reduced-motion: 즉시 최종값
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setValue(target);
      return;
    }

    const el = ref.current;
    if (!el) {
      setValue(target);
      return;
    }

    const startAnimation = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const duration = 1200;
      const startTime = performance.now();
      const startValue = 0;
      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        const next = Math.round(startValue + (target - startValue) * eased);
        setValue(next);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startAnimation();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, [target]);

  return (
    <span ref={ref} className={s.value}>
      {value}
      {suffix ? <span className={s.suffix}>{suffix}</span> : null}
    </span>
  );
}
