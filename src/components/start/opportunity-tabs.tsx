"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { SectionPager } from "@/components/ui/section-pager";
import s from "./opportunity-tabs.module.css";

export interface OpportunityPanel {
  id: string;
  label: string;
  /** 서버가 렌더한 카드들 — 링크가 전부 SSR HTML 에 들어간다. 상한(지원사업 12·교육/체험 24)까지만 */
  items: ReactNode[];
  /**
   * 상한 전 전체 건수 — 탭 배지에 쓴다(10/3 QA). 배지가 `items.length` 면 바로 위 타일 "32건"과
   * 탭 "지원사업 12"가 한 화면에서 다른 수를 말한다.
   */
  total: number;
  /** 0건일 때 보일 안내(서버 렌더) */
  empty: ReactNode;
  /** 목록 페이지 링크 */
  moreHref: string;
  moreLabel: string;
  /** 계측 라벨 접미사 — data-track="start_hub_more:<lane>:<track>" */
  track: string;
}

/** 데스크탑 3열 × 2줄 */
const PAGE_SIZE = 6;

/**
 * 정착 유형 상세 "지금 신청할 수 있어요" — 지원사업·교육·체험 탭 + 6건 페이지네이션 (2026-10-02 회장).
 *
 * ⚠️ 숨은 탭·숨은 페이지도 **항상 렌더하고 `hidden` 으로만 감춘다** — 조건부 렌더면 내부 링크가
 * SSR HTML 에서 사라진다(SidebarTabs 9/17 박제, 유입의 61%가 Organic).
 *
 * 페이지를 넘기면 패널 맨 위로 스크롤하고 패널에 포커스를 둔다(10/3 QA) — 375 에서 "다음"을 누르면 새 페이지의
 * 첫 카드가 화면 위 −900~−1,800px 에 있어 마지막 카드만 보였고, 마지막 쪽에서 "다음"이 비활성이 되며 포커스가
 * `<body>` 로 빠졌다(WCAG 2.4.3).
 */
export function OpportunityTabs({
  panels,
  laneId,
  gridClassName,
}: {
  panels: OpportunityPanel[];
  laneId: string;
  /** 카드 그리드 클래스(페이지 모듈) — 1 → 2 → 3열 */
  gridClassName: string;
}) {
  const baseId = useId();
  const [active, setActive] = useState(panels[0]?.id ?? "");
  const [pages, setPages] = useState<Record<string, number>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /** 방금 페이지를 넘긴 패널 — 렌더가 끝난 뒤 그 패널로 스크롤·포커스 */
  const pagedPanel = useRef<string | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent, idx: number) => {
      let next: number;
      switch (e.key) {
        case "ArrowRight":
          next = (idx + 1) % panels.length;
          break;
        case "ArrowLeft":
          next = (idx - 1 + panels.length) % panels.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = panels.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      const target = panels[next];
      setActive(target.id);
      tabRefs.current[target.id]?.focus();
    },
    [panels],
  );

  const goPage = useCallback((panelId: string, next: number) => {
    pagedPanel.current = panelId;
    setPages((prev) => ({ ...prev, [panelId]: next }));
  }, []);

  useEffect(() => {
    const id = pagedPanel.current;
    if (!id) return;
    pagedPanel.current = null;
    const panel = panelRefs.current[id];
    if (!panel) return;
    // 패널 머리가 이미 화면 안이면 움직이지 않는다(데스크탑처럼 한 화면에 다 들어오는 경우)
    const margin = Number.parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
    if (panel.getBoundingClientRect().top < margin) {
      const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView?.({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
    panel.focus({ preventScroll: true });
  }, [pages]);

  return (
    <div className={s.root}>
      <div className={s.tabList} role="tablist" aria-label="신청할 수 있는 것 전환">
        {panels.map((p, i) => {
          const selected = p.id === active;
          return (
            <button
              key={p.id}
              ref={(el) => {
                tabRefs.current[p.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${p.id}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? s.tabActive : s.tab}
              data-track={`start_hub_tab:${laneId}:${p.track}`}
              onClick={() => setActive(p.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {p.label}
              <span className={s.count}>{p.total}</span>
            </button>
          );
        })}
      </div>

      {panels.map((p) => {
        const totalPages = Math.max(1, Math.ceil(p.items.length / PAGE_SIZE));
        const page = Math.min(pages[p.id] ?? 0, totalPages - 1);
        const chunks = Array.from({ length: totalPages }, (_, k) => p.items.slice(k * PAGE_SIZE, (k + 1) * PAGE_SIZE));
        const capped = p.total > p.items.length;
        return (
          <div
            key={p.id}
            ref={(el) => {
              panelRefs.current[p.id] = el;
            }}
            role="tabpanel"
            id={`${baseId}-panel-${p.id}`}
            aria-labelledby={`${baseId}-tab-${p.id}`}
            hidden={p.id !== active}
            tabIndex={-1}
            className={s.panel}
          >
            {p.items.length === 0
              ? p.empty
              : chunks.map((chunk, k) => (
                  <ul key={k} className={gridClassName} hidden={k !== page} data-page={k + 1}>
                    {chunk.map((node, j) => (
                      <li key={j} className={s.cell}>
                        {node}
                      </li>
                    ))}
                  </ul>
                ))}
            <div className={s.footer}>
              <SectionPager
                page={page}
                total={totalPages}
                onChange={(next) => goPage(p.id, next)}
                ariaLabel={`${p.label} 페이지`}
              />
              <p className={s.moreRow}>
                {/* 상한에 걸리면 몇 건 중 몇 건인지 밝힌다 — 배지(전체)와 목록(상한)의 차이를 설명 */}
                {capped && <span className={s.capNote}>{`${p.total}건 중 ${p.items.length}건`}</span>}
                <Link href={p.moreHref} className={s.more} data-track={`start_hub_more:${laneId}:${p.track}`}>
                  {p.moreLabel} →
                </Link>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
