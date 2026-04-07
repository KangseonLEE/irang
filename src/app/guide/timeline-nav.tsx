"use client";

import { type ReactNode, useEffect, useRef } from "react";

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

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // 내부의 모든 <details> 요소에 toggle 이벤트 리스너 등록
    const detailsElements = container.querySelectorAll("details");

    const handleToggle = (e: Event) => {
      const details = e.target as HTMLDetailsElement;
      if (!details.open) return;

      // 애니메이션 후 스크롤 (CSS transition 시간 고려)
      requestAnimationFrame(() => {
        details.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    detailsElements.forEach((el) => {
      el.addEventListener("toggle", handleToggle);
    });

    return () => {
      detailsElements.forEach((el) => {
        el.removeEventListener("toggle", handleToggle);
      });
    };
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {children}
    </div>
  );
}
