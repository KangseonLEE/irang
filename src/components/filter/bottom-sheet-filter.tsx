"use client";

/**
 * BottomSheetFilter — 모바일 필터 바텀시트 (네이버 플러스 스토어 앵커 패턴).
 *
 * 5/21 회장 결재 — 탭 switch → 앵커 패턴 전환:
 *   - 변경 전: 탭 클릭 시 해당 그룹만 표시 (다른 그룹 숨김).
 *   - 변경 후: 모든 4 그룹(지역·지원유형·카테고리·연령대)을 세로로 동시 노출.
 *     탭은 각 section으로 smooth scroll시키는 앵커 역할.
 *     본문 스크롤 시 화면 상단에 가장 가까운 section의 탭이 자동 active.
 *
 * - 공용 Modal 재사용 (Portal·ESC·포커스 트랩·드래그 dismiss·dvh·safe-area-inset 내장)
 * - Modal overlay: rgba(0,0,0,0.4) dim + body overflow:hidden scroll lock (기존)
 * - Modal panel mobile max-height: 95dvh (회장 OK — 더 큰 영역 환영)
 * - 옵션 선택은 local state — Apply 시점에만 부모 onApply 호출 → router.push.
 *
 * 5/20 박제 border-left 0건. 5/06 모바일 사전 점검 5종 통과 (vh→dvh / sticky / hover wrap / viewport / safe-area).
 * 카피 톤: "초기화"·"N건 결과 보기" (copywriting.md UX 라이팅 §종결).
 */

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import s from "./bottom-sheet-filter.module.css";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterTab {
  id: string;
  label: string;
  options: readonly FilterOption[];
  /** 현재 선택값(부모 URL state에서 주입) */
  selectedValues: string[];
  /** 단일 선택은 미사용 — 4 그룹 전부 multi. 향후 확장 대비 옵션 유지 */
  multiSelect?: boolean;
}

interface BottomSheetFilterProps {
  open: boolean;
  onClose: () => void;
  tabs: FilterTab[];
  defaultTabId?: string;
  /** Apply 클릭 시 호출. selections는 { tabId: string[] } 형태 */
  onApply: (selections: Record<string, string[]>) => void;
  /** "초기화" 클릭 시 호출 — basePath 이동 등 부모가 결정 */
  onReset: () => void;
  /**
   * CTA 버튼 라벨. 카운트가 있으면 `{count}건 결과 보기`로 렌더, 없으면 "결과 보기" 단일 텍스트.
   * D2: 서버 filterProgramsAsync 의존으로 client 실시간 카운트 불가 → undefined.
   * D2.5: client filter 캐시 또는 prefetch 도입 시 number 전달.
   */
  resultCount?: number;
  /** title은 Modal에 전달되지만 a11y용 — 시각적으로는 안 보임. 기본 "필터" */
  title?: string;
}

export function BottomSheetFilter({
  open,
  onClose,
  tabs,
  defaultTabId,
  onApply,
  onReset,
  resultCount,
  title = "필터",
}: BottomSheetFilterProps) {
  // local selections: { tabId: string[] } — open될 때마다 tabs에서 동기화
  const initial = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const t of tabs) map[t.id] = [...t.selectedValues];
    return map;
  }, [tabs]);

  const [selections, setSelections] = useState<Record<string, string[]>>(initial);
  const [activeTabId, setActiveTabId] = useState<string>(
    defaultTabId ?? tabs[0]?.id ?? "",
  );

  // 본문 scroll container + section refs (앵커 scroll 및 active 탭 동기화용)
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  // 탭 클릭으로 인한 programmatic scroll 중에는 scroll handler가 active 갱신 안 하도록 가드
  const scrollingByClickRef = useRef(false);

  // open false → true 전환마다 부모 URL state로 재동기화.
  // React 19 공식 권장 "Adjusting state on prop change" 패턴 — prev prop을 state로 추적.
  // useEffect / useRef render 쓰기는 React 19 hook 룰 위반 (set-state-in-effect / refs).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelections(initial);
      setActiveTabId(defaultTabId ?? tabs[0]?.id ?? "");
    }
  }

  // open 직후 body scrollTop = 0 (이전 열기에서 스크롤 위치 남았을 수 있음).
  // scrollTo는 effect로 처리 — render 중 DOM 조작은 React 룰 위반.
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [open]);

  const toggleOption = (tabId: string, value: string) => {
    setSelections((prev) => {
      const cur = prev[tabId] ?? [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...prev, [tabId]: next };
    });
  };

  const handleReset = () => {
    const cleared: Record<string, string[]> = {};
    for (const t of tabs) cleared[t.id] = [];
    setSelections(cleared);
    onReset();
  };

  const handleApply = () => {
    onApply(selections);
  };

  // 탭 클릭 → 해당 section으로 smooth scroll + active 즉시 갱신
  const handleTabClick = useCallback((tabId: string) => {
    const section = sectionRefs.current.get(tabId);
    const body = bodyRef.current;
    if (!section || !body) {
      setActiveTabId(tabId);
      return;
    }
    setActiveTabId(tabId);
    scrollingByClickRef.current = true;
    // section의 body 내 상대 offset = offsetTop (body가 nearest positioned ancestor)
    const targetTop = section.offsetTop;
    body.scrollTo({ top: targetTop, behavior: "smooth" });
    // smooth scroll 종료 후(약 400ms) scroll handler 다시 활성
    window.setTimeout(() => {
      scrollingByClickRef.current = false;
    }, 500);
  }, []);

  // 본문 scroll → 가장 가까운 section의 탭 active 자동 갱신.
  // scroll position 기반(IntersectionObserver보다 단순·결정적 — section 4개라 부담 미미).
  const handleBodyScroll = useCallback(() => {
    if (scrollingByClickRef.current) return;
    const body = bodyRef.current;
    if (!body) return;
    // 화면 상단 기준 + 작은 offset(24px) — section header가 막 들어오면 active로 본다
    const threshold = body.scrollTop + 24;
    let nextActive = tabs[0]?.id ?? "";
    for (const t of tabs) {
      const sec = sectionRefs.current.get(t.id);
      if (!sec) continue;
      if (sec.offsetTop <= threshold) {
        nextActive = t.id;
      } else {
        break;
      }
    }
    setActiveTabId((cur) => (cur === nextActive ? cur : nextActive));
  }, [tabs]);

  // 탭별 선택 개수 (탭 row 배지)
  const tabCount = (tabId: string) => selections[tabId]?.length ?? 0;

  return (
    <Modal open={open} onClose={onClose} title={title} bodyVariant="flush" mobileHeight="tall">
      <div className={s.sheet}>
        {/* 상단 탭 row (sticky, 앵커 역할) */}
        <div className={s.tabRow} role="tablist" aria-label="필터 분류">
          {tabs.map((t) => {
            const active = t.id === activeTabId;
            const cnt = tabCount(t.id);
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`bsf-section-${t.id}`}
                className={active ? s.tabActive : s.tab}
                onClick={() => handleTabClick(t.id)}
              >
                <span>{t.label}</span>
                {cnt > 0 && <span className={s.tabBadge}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* 본문 — 모든 그룹 세로 동시 노출 (앵커 패턴) */}
        <div
          ref={bodyRef}
          className={s.body}
          onScroll={handleBodyScroll}
        >
          {tabs.map((t) => (
            <section
              key={t.id}
              id={`bsf-section-${t.id}`}
              ref={(el) => {
                if (el) sectionRefs.current.set(t.id, el);
                else sectionRefs.current.delete(t.id);
              }}
              className={s.section}
              aria-labelledby={`bsf-heading-${t.id}`}
            >
              <h3 id={`bsf-heading-${t.id}`} className={s.sectionHeading}>
                {t.label}
              </h3>
              <div className={s.optionGrid}>
                {t.options.map((opt) => {
                  const selected = selections[t.id]?.includes(opt.value) ?? false;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      className={selected ? s.chipActive : s.chip}
                      onClick={() => toggleOption(t.id, opt.value)}
                    >
                      {opt.label}
                      {typeof opt.count === "number" && (
                        <span className={s.chipCount}>{opt.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* 하단 sticky CTA */}
        <div className={s.cta}>
          <button
            type="button"
            className={s.resetBtn}
            onClick={handleReset}
          >
            초기화
          </button>
          <button
            type="button"
            className={s.applyBtn}
            onClick={handleApply}
          >
            {typeof resultCount === "number" ? `${resultCount}건 결과 보기` : "결과 보기"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
