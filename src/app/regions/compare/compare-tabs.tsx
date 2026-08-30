"use client";

import { useEffect, useRef } from "react";
import { Thermometer, Stethoscope, Sprout } from "lucide-react";
import { TabBar, type TabItem } from "@/components/ui/tab-bar";

import type { TabId } from "./compare-tab-ids";

const TABS: ReadonlyArray<TabItem<TabId>> = [
  { id: "climate", label: "기후", icon: Thermometer },
  { id: "infra", label: "생활 인프라", icon: Stethoscope },
  { id: "suitability", label: "작물 적합성", icon: Sprout },
];

interface Props {
  activeTab: TabId;
  baseQuery: string;
}

const MOBILE_QUERY = "(max-width: 767px)";
const CONTENT_ANCHOR_ID = "compare-content";
const GAP_BELOW_TABS = 8;

/**
 * 지역 비교 탭 — URL `?tab=climate|infra|suitability` 기반 view switcher.
 * 공용 TabBar 컴포넌트 사용 (crops/compare 와 동일 패턴).
 *
 * 모바일 (8/30 회장): 스크롤 위치가 어디든 탭을 누르면 그 탭 콘텐츠 상단(#compare-content)이
 * sticky 탭바 바로 아래에 오도록 이동 — 작물 적합성은 첫 요소가 작물 검색창이라 바로 검색할 수 있다.
 * TabBar Link는 scroll={false}라 라우터가 맨 위로 튀지 않고, 여기서만 정밀 이동한다.
 * "사용자가 탭을 눌렀을 때"만 이동하고(뒤로가기·직접 진입은 제외) 데스크탑은 그대로 둔다.
 */
export function CompareTabs({ activeTab, baseQuery }: Props) {
  const clickedRef = useRef(false);

  // 탭 링크 클릭 감지 — TabBar를 div로 감싸면 sticky 컨테이닝 블록이 그 div가 되어 고정이 풀린다(8/30 실측)
  // → DOM 래퍼 없이 document 캡처 리스너로 "탭바 안 <a> 클릭"만 표시해 둔다.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("[role='tablist'][aria-label='비교 항목 선택'] a")) clickedRef.current = true;
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!clickedRef.current) return;
    clickedRef.current = false;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;

    const anchor = document.getElementById(CONTENT_ANCHOR_ID);
    const tabs = document.querySelector<HTMLElement>("[role='tablist'][aria-label='비교 항목 선택']");
    if (!anchor || !tabs) return;

    // 1차: 앵커를 대략 위치로 → 보정은 두 번: 즉시(헤더 표시/숨김 반영) + 스켈레톤→실제 콘텐츠 교체 뒤
    const first = anchor.getBoundingClientRect().top + window.scrollY - (tabs.getBoundingClientRect().height + 56 + 44 + GAP_BELOW_TABS);
    window.scrollTo({ top: Math.max(0, first) });
    const adjust = () => {
      const delta = anchor.getBoundingClientRect().top - tabs.getBoundingClientRect().bottom - GAP_BELOW_TABS;
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta });
    };
    requestAnimationFrame(adjust);
    const t1 = window.setTimeout(adjust, 400);
    const t2 = window.setTimeout(adjust, 1200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [activeTab]);

  return (
    <TabBar
      tabs={TABS}
      activeId={activeTab}
      basePath="/regions/compare"
      baseQuery={baseQuery}
      ariaLabel="비교 항목 선택"
    />
  );
}
