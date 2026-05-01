"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FarmingStats } from "@/components/stats/farming-stats";
import { VillageStats } from "@/components/stats/village-stats";
import { YouthStats } from "@/components/stats/youth-stats";
import { MountainStats } from "@/components/stats/mountain-stats";
import { SmartfarmStats } from "@/components/stats/smartfarm-stats";
import { STATS_TABS, type StatsTabId } from "./stats-tabs";
import s from "./stats-client.module.css";

/* ── 탭 셀렉터 (인라인·sticky 공용) ──
   inlineRefForVisibility prop으로 외부에서 가시성 추적용 ref 받음.
   모바일 하단 sticky bar와 인라인 셀렉터가 둘 다 같은 컴포넌트 사용. */
function StatsTabNav({
  activeTab,
  onChange,
  innerRefProp,
  ariaLabel,
}: {
  activeTab: StatsTabId;
  onChange: (id: StatsTabId) => void;
  innerRefProp?: React.RefObject<HTMLDivElement | null>;
  ariaLabel: string;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const innerRef = innerRefProp ?? localRef;

  /** 활성 탭이 항상 가운데 보이도록 가로 스크롤 (탭이 좁아 잘렸을 때) */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const active = inner.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      active.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [activeTab, innerRef]);

  return (
    <nav className={s.tabNav} aria-label={ariaLabel}>
      <div ref={innerRef} className={s.tabNavInner} role="tablist">
        {STATS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`summary-${tab.id}`}
            aria-selected={tab.id === activeTab}
            aria-current={tab.id === activeTab ? "page" : undefined}
            onClick={() => onChange(tab.id)}
            className={`${s.tab} ${tab.id === activeTab ? s.tabActive : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ── 메인 클라이언트 ── */
interface StatsClientProps {
  initialTab: StatsTabId;
}

export function StatsClient({ initialTab }: StatsClientProps) {
  const [activeTab, setActiveTab] = useState<StatsTabId>(initialTab);

  /* ── 모바일 하단 sticky bar 가시성 ──
     인라인 탭바가 viewport 위로 사라지면 모바일에서만 하단 fixed bar 노출. */
  const inlineSelectorRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      const inline = inlineSelectorRef.current;
      if (!inline) return;
      const rect = inline.getBoundingClientRect();
      // 인라인 셀렉터의 하단이 viewport 위로 사라지면 sticky bar 노출
      setShowStickyBar(rect.bottom < 0);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const handleTabChange = useCallback((id: StatsTabId) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", `/stats?tab=${id}`);
    }
  }, []);

  /**
   * 탭 변경 시 해당 섹션이 viewport 상단(GNB 아래)에 보이도록 부드러운 스크롤.
   * 첫 마운트(URL 직접 진입 = 새로고침/외부 링크)에는 스크롤 안 함.
   */
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const target = document.getElementById(`summary-${activeTab}`);
    if (!target) return;
    // GNB(56) + 여유 8 — 탭바 자체는 인라인이므로 offset 가산 X
    const stickyOffset = 56 + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [activeTab]);

  return (
    <>
      {/* 인라인 탭바 (페이지 첫 부분) */}
      <StatsTabNav
        activeTab={activeTab}
        onChange={handleTabChange}
        innerRefProp={inlineSelectorRef}
        ariaLabel="통계 카테고리 선택"
      />

      {/* 모바일 하단 sticky bar — 인라인이 viewport 밖으로 나가면 등장 */}
      <div
        className={`${s.stickyBar} ${showStickyBar ? s.stickyVisible : ""}`}
        aria-hidden={!showStickyBar}
      >
        <StatsTabNav
          activeTab={activeTab}
          onChange={handleTabChange}
          ariaLabel="통계 카테고리 선택 (하단)"
        />
      </div>

      {/* key로 wrapper를 re-mount시켜 탭 변경 시 fade-in 애니메이션 재실행 */}
      <div key={activeTab} className={s.contentWrap}>
        {activeTab === "farming" && <FarmingStats />}
        {activeTab === "village" && <VillageStats />}
        {activeTab === "youth" && <YouthStats />}
        {activeTab === "mountain" && <MountainStats />}
        {activeTab === "smartfarm" && <SmartfarmStats />}
      </div>
    </>
  );
}
