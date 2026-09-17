"use client";

import { useCallback, useEffect, useState } from "react";
import s from "./anchor-tab-nav.module.css";

interface AnchorSection {
  id: string;
  label: string;
  /** 계측 훅 — 전역 AssessEntryTracker 가 `data-community-jump` 을 위임 수집한다 */
  track?: string;
}

interface AnchorTabNavProps {
  sections: AnchorSection[];
}

/**
 * Sticky Anchor Tab Navigation — 긴 상세 페이지의 섹션 탐색 (공용, 2026-09-17 승격)
 * - 스크롤 위치로 현재 섹션을 판정(뷰포트 상단에 가장 가까운 섹션)
 * - 탭 클릭 시 해당 섹션으로 smooth scroll
 * - 배민/컬리 스타일 sticky 상단 고정
 */
export function AnchorTabNav({ sections }: AnchorTabNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  /**
   * 활성 탭 판정 — "뷰포트 상단에 가장 가까운(그리고 그보다 위에 있는) 섹션" (2026-09-17 교체).
   *
   * 이전에는 IntersectionObserver 의 intersectionRatio 최대값을 썼는데,
   * **ratio 는 그 요소가 얼마나 보이는가(0~1)라서 짧은 섹션이 항상 이긴다.**
   * 섹션이 긴 작물 상세에서는 티가 안 났지만, 섹션이 짧은 지역 상세에서는
   * "지원사업"을 눌러도 활성 탭이 "필지·임지"로 켜졌다(라이브 실측).
   *
   * 스크롤 위치로 직접 계산하면 규칙이 한 줄로 서고 클릭·스크롤 결과가 일치한다.
   */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let current = sections[0]?.id ?? "";
      let bestTop = -Infinity;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        // 기준선은 섹션이 자기 scroll-margin-top 만큼 내려앉은 지점 — 화면 크기마다
        // 다른 고정 OFFSET 을 추측하지 않는다(모바일은 섹션이 ~200px 에 안착한다).
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        const top = el.getBoundingClientRect().top - margin;
        // 기준선을 지난 것 중 **가장 아래** 를 고른다. 배열 순서로 훑으면 탭 순서와
        // DOM 순서가 다를 때 판정이 뒤집힌다(시군구: 지원센터가 지원사업보다 위인데
        // 탭에서는 뒤에 있어 "지원사업" 클릭에 "지원센터"가 켜졌다).
        if (top <= 8 && top > bestTop) {
          bestTop = top;
          current = id;
        }
      }
      // 문서 끝에 닿으면 마지막 섹션을 활성으로 — 짧은 마지막 섹션이 영영 안 켜지는 것 방지
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = [...sections].reverse().find(({ id }) => document.getElementById(id));
        if (last) current = last.id;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // offset은 CSS scroll-margin-top(section)이 화면별로 담당 — sticky 높이 + 여백 일원화
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav className={s.anchorTab} aria-label="섹션 탐색">
      {sections.map(({ id, label, track }) => (
        <button
          key={id}
          type="button"
          className={s.anchorTabItem}
          data-active={id === activeId ? "true" : undefined}
          data-community-jump={track}
          onClick={() => scrollToSection(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
