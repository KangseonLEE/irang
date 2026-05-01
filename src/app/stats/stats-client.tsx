"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FarmingStats } from "@/components/stats/farming-stats";
import { VillageStats } from "@/components/stats/village-stats";
import { YouthStats } from "@/components/stats/youth-stats";
import { MountainStats } from "@/components/stats/mountain-stats";
import { SmartfarmStats } from "@/components/stats/smartfarm-stats";
import { STATS_TABS, type StatsTabId } from "./stats-tabs";
import s from "./stats-client.module.css";

/* ── 탭 셀렉터 ── */
function StatsTabNav({
  activeTab,
  onChange,
}: {
  activeTab: StatsTabId;
  onChange: (id: StatsTabId) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

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
  }, [activeTab]);

  return (
    <nav className={s.tabNav} aria-label="통계 카테고리 선택">
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

  const handleTabChange = useCallback((id: StatsTabId) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", `/stats?tab=${id}`);
    }
  }, []);

  /**
   * 탭 변경 시 해당 섹션이 sticky 탭 바로 아래에 보이도록 부드러운 스크롤.
   * 첫 마운트(URL 직접 진입 = 새로고침/외부 링크)에는 스크롤 안 함 — 기본 위치 유지.
   */
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const target = document.getElementById(`summary-${activeTab}`);
    if (!target) return;
    // sticky GNB(56px) + 탭바(약 50px) + 여유 8px
    const stickyOffset = 56 + 50 + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [activeTab]);

  return (
    <>
      <StatsTabNav activeTab={activeTab} onChange={handleTabChange} />
      {activeTab === "farming" && <FarmingStats />}
      {activeTab === "village" && <VillageStats />}
      {activeTab === "youth" && <YouthStats />}
      {activeTab === "mountain" && <MountainStats />}
      {activeTab === "smartfarm" && <SmartfarmStats />}
    </>
  );
}
