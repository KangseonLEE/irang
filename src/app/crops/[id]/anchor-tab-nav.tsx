"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import s from "./page.module.css";

interface AnchorSection {
  id: string;
  label: string;
}

interface AnchorTabNavProps {
  sections: AnchorSection[];
}

/**
 * Sticky Anchor Tab Navigation
 * - IntersectionObserver로 현재 보이는 섹션을 감지
 * - 탭 클릭 시 해당 섹션으로 smooth scroll
 * - 배민/컬리 스타일 sticky 상단 고정
 */
export function AnchorTabNav({ sections }: AnchorTabNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ratioMap = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratioMap.set(entry.target.id, entry.intersectionRatio);
        });

        let maxRatio = 0;
        let maxId = activeId;

        ratioMap.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        });

        if (maxRatio > 0) setActiveId(maxId);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "-80px 0px 0px 0px" },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 120; // header + tab height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <nav className={s.anchorTab} aria-label="섹션 탐색">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={s.anchorTabItem}
          data-active={id === activeId ? "true" : undefined}
          onClick={() => scrollToSection(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
