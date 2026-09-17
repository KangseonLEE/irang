"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import s from "./sidebar-tabs.module.css";

export interface SidebarTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * 사이드바 탭 패널 (2026-09-17, 공용 승격).
 *
 * 배경: 사이드바가 1,749px였고 그중 관련 작물이 1,083px(62%)였다. `position: sticky` 가
 * 걸려 있었지만 높이가 뷰포트(900px)를 넘어 **실제로는 따라다니지 못했다**.
 * 패널을 탭으로 교체해 높이를 뷰포트 안으로 넣으면 sticky 가 비로소 작동한다.
 *
 * ⚠️ **모든 패널을 항상 렌더하고 `hidden` 으로만 감춘다.** 조건부 렌더로 바꾸면
 * 숨은 탭의 내부 링크(관련 작물·의견)가 SSR HTML 에서 사라진다 — 유입의 61%가
 * Organic Search 라 내부 링크 손실은 이 사이트에서 가장 비싼 실수다.
 */
/*
 * ⚠️ 패널 내부 공용 클래스(sideTabCropList·sideTabMore·sideTabNotes…)는 이 파일에서
 * re-export 하지 않는다. "use client" 모듈의 비컴포넌트 export 를 서버 컴포넌트가 import 하면
 * 클라이언트 참조 프록시가 와서 `st.sideTabMore` 가 undefined 로 풀린다 — 9/17 라이브에서
 * 사이드바 링크 3종·카드 간격이 전부 무스타일로 렌더된 원인. 페이지는 CSS 모듈을 직접 import 한다:
 *   import st from "@/components/ui/sidebar-tabs.module.css";
 */
export function SidebarTabs({ tabs }: { tabs: SidebarTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      const target = tabs[next];
      setActive(target.id);
      tabRefs.current[target.id]?.focus();
    },
    [tabs],
  );

  return (
    <div className={s.sideTabs}>
      <div className={s.sideTabList} role="tablist" aria-label="사이드 정보 전환">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls={`${baseId}-panel-${t.id}`}
            tabIndex={t.id === active ? 0 : -1}
            className={s.sideTabItem}
            data-active={t.id === active ? "true" : undefined}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${baseId}-panel-${t.id}`}
          aria-labelledby={`${baseId}-tab-${t.id}`}
          hidden={t.id !== active}
          className={s.sideTabPanel}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
