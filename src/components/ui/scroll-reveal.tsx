"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { analytics } from "@/lib/analytics";
import s from "./scroll-reveal.module.css";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div";
  /**
   * 랜딩 IA 계측 (8/30): 지정 시 뷰포트 50% 이상 노출 1회에 GA4 `landing_section_view`를 보낸다.
   * reveal 애니메이션(0.15)과 별개 observer — "봤다"의 기준을 절반 노출로 둔다.
   */
  trackId?: string;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  trackId,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !trackId) return;
    // "봤다" 판정: 섹션의 50% 이상이 보이거나, 섹션이 뷰포트 높이의 50% 이상을 차지할 때.
    // 후자가 없으면 뷰포트보다 2배 이상 긴 섹션(모바일 트렌드·비용 등)은 50% 동시 노출이 불가능해
    // 영영 안 찍힌다 (8/30 375px 실측에서 trend_cost 누락).
    const observer = new IntersectionObserver(
      ([entry]) => {
        const seen =
          entry.intersectionRatio >= 0.5 ||
          entry.intersectionRect.height >= window.innerHeight * 0.5;
        if (entry.isIntersecting && seen) {
          analytics.landingSectionView(trackId);
          observer.disconnect();
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trackId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.add(s.visible);
      el.dataset.visible = "";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(s.visible);
          el.dataset.visible = "";
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${s.reveal} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
