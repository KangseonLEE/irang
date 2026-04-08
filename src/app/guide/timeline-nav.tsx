"use client";

import { type ReactNode, useEffect, useRef } from "react";
import s from "./timeline-nav.module.css";

/* ═══════════════════════════════════════════════════════
   TimelineLink — 타임라인 클릭 → 해당 단계 스크롤 + 열기
   ═══════════════════════════════════════════════════════ */

interface TimelineLinkProps {
  stepId: string;
  className?: string;
  children: ReactNode;
}

export function TimelineLink({ stepId, className, children }: TimelineLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(stepId);
    if (!target) return;

    // <details> 아코디언 열기 — toggle 이벤트가 스크롤 처리
    if (target instanceof HTMLDetailsElement && !target.open) {
      target.open = true;
    } else {
      // 이미 열려있으면 직접 스크롤
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a href={`#${stepId}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

/* ═══════════════════════════════════════════════════════
   AccordionScrollWrapper — 아코디언 열릴 때 자동 스크롤
   <details> 를 감싸고, toggle 이벤트를 감지하여
   열릴 때 해당 아코디언 상단으로 부드럽게 스크롤합니다.
   ═══════════════════════════════════════════════════════ */

interface AccordionScrollWrapperProps {
  children: ReactNode;
}

export function AccordionScrollWrapper({ children }: AccordionScrollWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  /** hash 기반 스크롤 진행 중이면 toggle 핸들러의 스크롤을 억제 */
  const hashScrolling = useRef(false);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const detailsElements = container.querySelectorAll("details");

    // ── 아코디언 toggle 시 자동 스크롤 (사용자 직접 클릭) ──
    const handleToggle = (e: Event) => {
      if (!(e.target instanceof HTMLDetailsElement)) return;
      if (!e.target.open) return;
      // hash 기반 스크롤 중이면 건너뜀 (이중 스크롤 방지)
      if (hashScrolling.current) return;

      const target = e.target;
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    detailsElements.forEach((el) => {
      el.addEventListener("toggle", handleToggle);
    });

    // ── 레이아웃 안정화 후 정확한 위치로 스크롤 ──
    // 아코디언 콘텐츠(체크리스트·팁·인터뷰)가 모두 렌더링된 뒤
    // 높이가 안정화되었을 때 최종 스크롤을 실행합니다.
    const scrollWhenStable = (el: HTMLElement) => {
      let prevHeight = -1;
      let stableCount = 0;
      const maxAttempts = 20; // 최대 1초 (50ms × 20)
      let attempts = 0;

      const check = () => {
        attempts++;
        const currentHeight = el.getBoundingClientRect().height;

        if (currentHeight === prevHeight) {
          stableCount++;
        } else {
          stableCount = 0;
        }
        prevHeight = currentHeight;

        // 높이가 2회 연속 동일하면 안정화된 것으로 판단
        if (stableCount >= 2 || attempts >= maxAttempts) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // 안전장치 해제
          setTimeout(() => {
            hashScrolling.current = false;
          }, 500);
          return;
        }

        setTimeout(check, 50);
      };

      // 첫 프레임 이후 시작
      requestAnimationFrame(() => check());
    };

    // ── URL hash 기반 아코디언 열기 ──
    const openFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash || !hash.startsWith("step-")) return;

      const target = container.querySelector<HTMLDetailsElement>(
        `#${CSS.escape(hash)}`,
      );
      if (!(target instanceof HTMLDetailsElement)) return;

      // toggle 핸들러의 스크롤 억제
      hashScrolling.current = true;

      // 다른 아코디언 닫기 (해당 단계만 포커스)
      detailsElements.forEach((el) => {
        if (el !== target && el.open) el.open = false;
      });

      if (!target.open) target.open = true;

      // 콘텐츠 높이가 안정화된 뒤 정확한 위치로 스크롤
      scrollWhenStable(target);
    };

    // 초기 마운트 시 hash 확인
    openFromHash();

    // hashchange 이벤트 — 같은 페이지 내 hash 변경 시 대응
    window.addEventListener("hashchange", openFromHash);

    return () => {
      detailsElements.forEach((el) => {
        el.removeEventListener("toggle", handleToggle);
      });
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  return (
    <div ref={ref} className={s.accordionGroup}>
      {children}
    </div>
  );
}
