"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { SectionPager } from "@/components/ui/section-pager";
import s from "./opportunity-tabs.module.css";

export interface OpportunityPanel {
  id: string;
  label: string;
  /** 서버가 렌더한 카드들 — 링크가 전부 SSR HTML 에 들어간다 */
  items: ReactNode[];
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

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = e.key === "ArrowRight" ? (idx + 1) % panels.length : (idx - 1 + panels.length) % panels.length;
      const target = panels[next];
      setActive(target.id);
      tabRefs.current[target.id]?.focus();
    },
    [panels],
  );

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
              <span className={s.count}>{p.items.length}</span>
            </button>
          );
        })}
      </div>

      {panels.map((p) => {
        const totalPages = Math.max(1, Math.ceil(p.items.length / PAGE_SIZE));
        const page = Math.min(pages[p.id] ?? 0, totalPages - 1);
        const chunks = Array.from({ length: totalPages }, (_, k) => p.items.slice(k * PAGE_SIZE, (k + 1) * PAGE_SIZE));
        return (
          <div
            key={p.id}
            role="tabpanel"
            id={`${baseId}-panel-${p.id}`}
            aria-labelledby={`${baseId}-tab-${p.id}`}
            hidden={p.id !== active}
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
                onChange={(next) => setPages((prev) => ({ ...prev, [p.id]: next }))}
                ariaLabel={`${p.label} 페이지`}
              />
              <Link href={p.moreHref} className={s.more} data-track={`start_hub_more:${laneId}:${p.track}`}>
                {p.moreLabel} →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
