"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { FarmingStats } from "@/components/stats/farming-stats";
import { VillageStats } from "@/components/stats/village-stats";
import { YouthStats } from "@/components/stats/youth-stats";
import { MountainStats } from "@/components/stats/mountain-stats";
import { SmartfarmStats } from "@/components/stats/smartfarm-stats";
import { centeredScrollLeft } from "@/lib/scroll-geometry";
import { STATS_TABS, type StatsTabId } from "./stats-tabs";
import s from "./stats-client.module.css";

/* ── 탭 셀렉터 (인라인·sticky 공용) ──
   inlineRefForVisibility prop으로 외부에서 가시성 추적용 ref 받음.
   모바일 하단 sticky bar와 인라인 셀렉터가 둘 다 같은 컴포넌트 사용.
   10/6 QA: ① 두 묶음이 같은 탭 id(tab-farming…)를 써서 id 가 겹쳤다 → 하단 바는 idSuffix 로 가른다
   ② role=tab 인데 ←/→ 가 없었다 → APG 탭 관례(roving tabindex + ←/→·Home/End, 포커스 이동 = 선택) */
function StatsTabNav({
  activeTab,
  onChange,
  innerRefProp,
  ariaLabel,
  idSuffix = "",
}: {
  activeTab: StatsTabId;
  onChange: (id: StatsTabId, via?: "pointer" | "keyboard") => void;
  innerRefProp?: React.RefObject<HTMLDivElement | null>;
  ariaLabel: string;
  /** 탭 id 접미 — 패널(aria-labelledby="tab-…")은 인라인 묶음 id 를 가리킨다 */
  idSuffix?: string;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const innerRef = innerRefProp ?? localRef;

  /**
   * 활성 탭이 항상 가운데 보이도록 **탭바 안에서만** 가로 스크롤 (탭이 좁아 잘렸을 때).
   * 10/6 R2-Q3: scrollIntoView 는 세로로 문서까지 움직였다 — 숨은 인라인 탭바를 따라 문서가 y 2284→286 으로 튀었고(N3),
   * 마운트 때 부르면 크롬의 순차 포커스 시작점이 그 탭으로 옮겨 첫 Tab 이 헤더·내비를 건너뛰었다(F1).
   */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const active = inner.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!active || inner.scrollWidth <= inner.clientWidth) return;
    const itemLeft = active.getBoundingClientRect().left - inner.getBoundingClientRect().left + inner.scrollLeft;
    inner.scrollTo({ left: centeredScrollLeft(itemLeft, active.offsetWidth, inner.clientWidth, inner.scrollWidth), behavior: "instant" });
  }, [activeTab, innerRef]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const index = STATS_TABS.findIndex((t) => t.id === activeTab);
    const last = STATS_TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    onChange(STATS_TABS[next].id, "keyboard");
    innerRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  return (
    <nav className={s.tabNav} aria-label={ariaLabel}>
      <div ref={innerRef} className={s.tabNavInner} role="tablist" onKeyDown={onKeyDown}>
        {STATS_TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}${idSuffix}`}
              /* 패널은 고른 탭 것만 렌더된다 — 없는 id 를 가리키지 않게 선택된 탭만 연결 */
              aria-controls={selected ? `summary-${tab.id}` : undefined}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={`${s.tab} ${selected ? s.tabActive : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
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
    // 사이트 푸터만 — 통계 대시보드 안에도 <footer>(출처 줄)가 있어 첫 footer 를 잡으면 바가 엉뚱하게 숨는다.
    // 잴 때마다 찾는다(찾을 때까지) — 마운트 순간 한 번만 찾고 포기하면 늦게 붙는 경우 영영 못 잰다
    let footer: Element | null = null;
    const compute = () => {
      const inline = inlineSelectorRef.current;
      if (!inline) return;
      footer ??= document.querySelector("body > footer");
      const rect = inline.getBoundingClientRect();
      // 인라인 셀렉터의 하단이 viewport 위로 사라지면 sticky bar 노출.
      // 푸터가 화면에 들어오면 다시 숨긴다 — 바가 떠 있으면 피드백 버튼이 바 위로 48px 올라가 문서 끝 '이용약관'을 덮었다
      // (10/6 R2-Q3 N1, 320~340 에서 누르면 피드백 창이 열렸다). 랜딩 하단 도크와 같은 규칙
      const footerIn = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      setShowStickyBar(rect.bottom < 0 && !footerIn);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  /**
   * 하단 바가 숨는데(inert) 포커스가 그 안에 있으면 BODY 로 떨어진다 — 이후 화살표가 먹지 않았다(10/6 R2-Q3 N3).
   * 같은 탭의 인라인 묶음으로 옮긴다(스크롤 없이 — 지금 보고 있는 자리를 지킨다).
   * layout effect — inert 가 붙은 뒤 브라우저가 포커스를 BODY 로 정리하기(다음 렌더링) 전에 옮긴다.
   */
  const stickyBarRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (showStickyBar) return;
    const bar = stickyBarRef.current;
    const active = document.activeElement;
    if (!bar || !(active instanceof HTMLElement) || !bar.contains(active)) return;
    const inlineTab = inlineSelectorRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    inlineTab?.focus({ preventScroll: true });
  }, [showStickyBar]);

  /** ←/→ 로 바꾼 탭인가 — 모바일에선 인라인 탭바가 흐름 안에 있어, 내용으로 스크롤하면 포커스가 있는 탭이 화면 밖으로 나간다 */
  const keyboardChangeRef = useRef(false);

  const handleTabChange = useCallback((id: StatsTabId, via: "pointer" | "keyboard" = "pointer") => {
    keyboardChangeRef.current = via === "keyboard";
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
    const keyboard = keyboardChangeRef.current;
    keyboardChangeRef.current = false;
    if (keyboard && window.matchMedia("(max-width: 767px)").matches) return;
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

      {/* 모바일 하단 sticky bar — 인라인이 viewport 밖으로 나가면 등장.
          숨은 동안 inert — aria-hidden 만으로는 Tab 이 화면 밖 버튼에 멈췄다(10/6 QA: 첫 Tab 4번이 보이지 않는 바로 갔다,
          axe aria-hidden-focus). 랜딩 트렌드·비용 하단 바와 같은 처리 */}
      <div
        ref={stickyBarRef}
        className={`${s.stickyBar} ${showStickyBar ? s.stickyVisible : ""}`}
        aria-hidden={!showStickyBar}
        inert={!showStickyBar}
      >
        <StatsTabNav
          activeTab={activeTab}
          onChange={handleTabChange}
          ariaLabel="통계 카테고리 선택 (하단)"
          idSuffix="-bar"
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
