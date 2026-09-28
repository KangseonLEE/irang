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
}

/** 자식 순차 리빌이 끝나기까지의 시간 (최대 지연 640 + 지속 550 + 여유) — 이후 마커를 떼어낸다 */
const STAGGER_SETTLE_MS = 1400;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  trackId,
  variant = "rise",
  stagger = false,
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

    let settle = 0;

    /* 리빌이 끝나면 자식 마커를 떼어낸다 — `.stagger.visible [data-reveal-item]`(0,3,0) 이
       살아 있으면 카드 자신의 `:hover { transform }`(0,2,0) 을 영구히 눌러버린다.
       이미 최종 상태이므로 마커 제거는 화면상 변화 0. 리빌은 한 번만 = 되돌릴 일도 없다. */
    const dropMarkers = () => {
      el.querySelectorAll("[data-reveal-item]").forEach((n) =>
        n.removeAttribute("data-reveal-item"),
      );
    };

    const show = (instant: boolean) => {
      el.classList.add(s.visible);
      if (instant) el.classList.add(s.instant);
      el.dataset.visible = "";
      if (instant) dropMarkers();
      else settle = window.setTimeout(dropMarkers, STAGGER_SETTLE_MS);
    };

    const rect = el.getBoundingClientRect();
    /* 첫 화면에서 실제로 읽히는 위치(상단 3/4) 에 있는 섹션은 애니메이션 없이 즉시 표시한다 —
       JS 지연·차단 시에도 첫 화면이 비지 않고, opacity 0 이 LCP 페인트를 늦추지 않는다.
       (레이아웃 속성은 건드리지 않으므로 CLS 영향은 애초에 0)
       0.9 로 잡으면 같은 섹션이 375 에선 즉시·1280 에선 애니메이션으로 갈려 동작이 들쑥날쑥해진다. */
    const inInitialViewport = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || inInitialViewport) {
      show(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show(false);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (settle) clearTimeout(settle);
    };
  }, []);

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
