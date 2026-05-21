"use client";

/**
 * BottomSheetFilter — 모바일 필터 바텀시트 (네이버 플러스 스토어 패턴).
 *
 * - 공용 Modal 재사용 (Portal·ESC·포커스 트랩·드래그 dismiss·dvh·safe-area-inset 전부 내장)
 * - 상단 가로 탭 row, 본문 chip 그리드, 하단 sticky CTA(초기화 + N건 결과 보기)
 * - 옵션 선택은 local state — Apply 시점에만 부모 onApply 호출 → router.push.
 * - 결과 카운트는 부모에서 selections 변경마다 계산해 resultCount로 주입.
 *
 * 5/20 박제 border-left 0건. 5/06 모바일 사전 점검 5종 통과 (vh→dvh / sticky / hover wrap / viewport / safe-area).
 * 카피 톤: "초기화"·"N건 결과 보기" (copywriting.md UX 라이팅 §종결).
 */

import { useState, useMemo } from "react";
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

  // open false → true 전환마다 부모 URL state로 재동기화.
  // React 19 공식 권장 "Adjusting state on prop change" 패턴 — prev prop을 state로 추적.
  // useEffect / useRef render 쓰기는 React 19 hook 룰 위반 (set-state-in-effect / refs).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelections(initial);
      if (defaultTabId) setActiveTabId(defaultTabId);
    }
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

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

  // 탭별 선택 개수 (탭 row 배지)
  const tabCount = (tabId: string) => selections[tabId]?.length ?? 0;

  return (
    <Modal open={open} onClose={onClose} title={title} bodyVariant="flush">
      <div className={s.sheet}>
        {/* 상단 탭 row (가로 스크롤) */}
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
                className={active ? s.tabActive : s.tab}
                onClick={() => setActiveTabId(t.id)}
              >
                <span>{t.label}</span>
                {cnt > 0 && <span className={s.tabBadge}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* 본문 — 현재 탭의 chip 옵션 그리드 */}
        <div
          className={s.body}
          role="tabpanel"
          aria-label={`${activeTab?.label} 필터 옵션`}
        >
          <div className={s.optionGrid}>
            {activeTab?.options.map((opt) => {
              const selected =
                selections[activeTab.id]?.includes(opt.value) ?? false;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={selected}
                  className={selected ? s.chipActive : s.chip}
                  onClick={() => toggleOption(activeTab.id, opt.value)}
                >
                  {opt.label}
                  {typeof opt.count === "number" && (
                    <span className={s.chipCount}>{opt.count}</span>
                  )}
                </button>
              );
            })}
          </div>
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
