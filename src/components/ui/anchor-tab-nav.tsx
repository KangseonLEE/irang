"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

/** 섹션 안에서 순차 포커스(Tab)가 닿는 요소 — 포커스 받을 제목이 이것들보다 앞에 있어야 한다 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * 탭으로 이동한 섹션에서 포커스를 받을 요소 (10/6 QA F4).
 * 섹션 이름(aria-labelledby) → 첫 제목 순으로 고르되, **섹션의 첫 조작 요소보다 앞**에 있고 조작 요소 안이 아닐 때만 쓴다.
 * 정착 점수처럼 제목이 접기 버튼(summary) 안에 있으면 그 제목에 포커스를 두는 순간 다음 Tab 이 접기 버튼을 건너뛴다 —
 * 그때는 섹션 자신을 받는다(다음 Tab = 섹션의 첫 조작 요소).
 */
function sectionFocusTarget(section: HTMLElement): HTMLElement {
  const labelId = section.getAttribute("aria-labelledby")?.split(/\s+/)[0];
  const firstFocusable = section.querySelector<HTMLElement>(FOCUSABLE);
  const candidates = [
    labelId ? document.getElementById(labelId) : null,
    section.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6"),
  ];
  for (const c of candidates) {
    if (!c || !section.contains(c) || c.closest(FOCUSABLE)) continue;
    if (firstFocusable && c.compareDocumentPosition(firstFocusable) & Node.DOCUMENT_POSITION_PRECEDING) continue;
    return c;
  }
  return section;
}

/**
 * Sticky Anchor Tab Navigation — 긴 상세 페이지의 섹션 탐색 (공용, 2026-09-17 승격)
 * - 스크롤 위치로 현재 섹션을 판정(뷰포트 상단에 가장 가까운 섹션)
 * - 탭 클릭 시 해당 섹션으로 smooth scroll + 포커스를 섹션 제목으로(다음 Tab 이 그 섹션 안에서 이어진다)
 * - 배민/컬리 스타일 sticky 상단 고정
 */
export function AnchorTabNav({ sections }: AnchorTabNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  /**
   * 섹션별 "헤더가 보일 때의" scroll-margin-top (10/3 QA).
   * /start 처럼 착지 여백이 `var(--sticky-top)`(헤더 보임 56 / 숨김 0)을 따르는 페이지에서는, 헤더가 보일 때 탭을
   * 누르면 68px 여백으로 착지하고 → 아래로 가는 동안 헤더가 숨어 여백이 12px 로 줄어 → 착지한 섹션이
   * 기준선(12+8)보다 56px 아래에 남아 **한 칸 앞 섹션**이 켜졌다(1440·375 전 탭 재현).
   * 헤더가 보일 때 잰 여백을 기억해 두고 둘 중 큰 쪽을 기준선으로 쓴다 — 여백이 상수인 페이지(작물·지역)는 그대로.
   */
  const visibleMarginsRef = useRef(new Map<string, number>());

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

    const visibleMargins = visibleMarginsRef.current;
    const update = () => {
      frame = 0;
      let current = sections[0]?.id ?? "";
      let bestTop = -Infinity;
      const headerHidden = document.documentElement.hasAttribute("data-header-hidden");
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        // 기준선은 섹션이 자기 scroll-margin-top 만큼 내려앉은 지점 — 화면 크기마다
        // 다른 고정 OFFSET 을 추측하지 않는다(모바일은 섹션이 ~200px 에 안착한다).
        const nowMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        if (!headerHidden) visibleMargins.set(id, nowMargin);
        // 헤더가 숨어 여백이 줄었어도 헤더가 보일 때의 여백으로 착지했을 수 있다 — 큰 쪽을 기준선으로
        const margin = Math.max(nowMargin, visibleMargins.get(id) ?? nowMargin);
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
    // 폭이 바뀌면 여백 규칙(미디어쿼리)도 바뀐다 — 기억한 값을 버리고 다시 잰다.
    // 높이만 바뀌는 resize(모바일 주소창 접힘·펼침)는 무시 — 헤더가 숨은 채 지우면 기억이 사라진다
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        visibleMargins.clear();
      }
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // offset은 CSS scroll-margin-top(section)이 화면별로 담당 — sticky 높이 + 여백 일원화
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // 포커스도 그 섹션으로 — 탭 버튼에 남아 있으면 키보드 사용자의 다음 Tab 이 섹션이 아니라 다음 탭으로 갔다(10/6 QA F4).
    // 스크롤은 위 smooth 한 번만(preventScroll). 마우스로 누른 경우엔 :focus-visible 이 붙지 않아 링이 보이지 않는다.
    const target = sectionFocusTarget(el);
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
      // 붙인 tabindex 는 포커스가 떠나면 뗀다 — 섹션에 남겨 두면 WebKit(사파리·iOS 전 브라우저)이 그 안 버튼 클릭 포커스를
      // 섹션에 줘서, "relatedTarget 이 바깥이면 닫는" 드롭다운의 선택이 사라진다(10/8 2차 QA — <main> 상시 tabindex 와 같은 결)
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
    target.focus({ preventScroll: true });
  }, []);

  return (
    <nav className={s.anchorTab} aria-label="섹션 탐색">
      {sections.map(({ id, label, track }) => (
        <button
          key={id}
          type="button"
          className={s.anchorTabItem}
          data-active={id === activeId ? "true" : undefined}
          /* 지금 보고 있는 섹션 — 색·밑줄만으로는 스크린리더에 전달되지 않았다(10/6 QA) */
          aria-current={id === activeId ? "true" : undefined}
          data-community-jump={track}
          onClick={() => scrollToSection(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
