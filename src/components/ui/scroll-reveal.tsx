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
  /**
   * 리빌 방식 (9/28): "rise"(기본) = 아래에서 떠오름, "fade" = 이동 없이 페이드.
   * 자식이 순차로 떠오르는 섹션(stagger)은 부모까지 움직이면 과해서 "fade" 를 쓴다.
   */
  variant?: "rise" | "fade";
  /**
   * 자식 순차 리빌 (9/28). 켜면 안쪽의 `[data-reveal-item]` 형제가 80ms 간격으로 떠오른다.
   * 대상 요소에 `data-reveal-item` 을 붙여야 동작한다(타일·카드 등).
   */
  stagger?: boolean;
  /**
   * 가벼운 패럴랙스 (9/28). 스크롤 진행에 따라 `--parallax` 를 0 → -20px 로 준다.
   * 배경 레이어를 가진 섹션이 `transform: translate3d(0, var(--parallax, 0px), 0)` 로 받아 쓴다.
   */
  parallax?: boolean;
}

/** 패럴랙스 최대 이동량 (px) */
const PARALLAX_MAX = 20;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  trackId,
  variant = "rise",
  stagger = false,
  parallax = false,
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

  /* 패럴랙스 — rAF 로 묶어 스크롤당 1회만 쓴다. 모션 최소화 설정이면 아예 걸지 않는다 */
  useEffect(() => {
    const el = ref.current;
    if (!el || !parallax) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      el.style.setProperty("--parallax", `${(-PARALLAX_MAX * clamped).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty("--parallax");
    };
  }, [parallax]);

  const cls = [
    s.reveal,
    variant === "fade" ? s.fade : "",
    stagger ? s.stagger : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref as never}
      className={cls}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
