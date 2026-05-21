"use client";

/**
 * DropdownFilter — 데스크탑(>= 640px) 카테고리별 dropdown popover 필터.
 *
 * 5/22 회장 결재 — 데스크탑 광역 적용 sprint (옵션 A — 카테고리별 dropdown).
 *   - 칩 1개 = 1 카테고리(예: 지역·지원유형·카테고리·연령대 각각).
 *   - 클릭 시 anchored popover 펼침 (한 번에 1개만).
 *   - 옵션 chip 그리드 + 하단 CTA [초기화] [적용].
 *   - outside click·ESC 닫기.
 *   - "적용" 시 부모 onApply → router.push.
 *
 * 모바일(< 640px)에서는 display: none. BottomSheetFilter가 담당.
 *
 * a11y:
 *   - trigger button aria-expanded / aria-haspopup="listbox" / aria-controls
 *   - popover role="dialog" aria-labelledby
 *   - 옵션 button aria-pressed (multi)
 *   - ESC: trigger로 focus 복귀
 *
 * 5/20 박제 border-left 0건. 5/06 모바일 5종 점검은 데스크탑 한정이라 N/A.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import s from "./dropdown-filter.module.css";

export interface DropdownFilterOption {
  value: string;
  label: string;
}

interface DropdownFilterProps {
  /** trigger 칩에 표시될 라벨 (예: "지역") */
  label: string;
  /** 옵션 list */
  options: readonly DropdownFilterOption[];
  /** 현재 URL의 선택값 (props로 주입 — popover open 시 local state에 복제) */
  selectedValues: string[];
  /** dropdown 펼침 상태 (부모가 한 번에 1개만 open되도록 통제) */
  open: boolean;
  /** trigger 클릭 콜백 — 부모가 openId state 토글 */
  onToggle: () => void;
  /** outside click·ESC·apply·reset 등 닫기 신호 */
  onClose: () => void;
  /** "적용" 클릭 시 호출 — 부모가 router.push 수행 */
  onApply: (values: string[]) => void;
  /** 단일 선택 모드 (기본: multi). 본 sprint 모든 4 카테고리 multi이지만 향후 확장 대비 */
  multiSelect?: boolean;
  /** popover 우측 정렬 (viewport 우측 끝 칩에서 잘림 방지 — 호출처에서 명시) */
  alignRight?: boolean;
}

export function DropdownFilter({
  label,
  options,
  selectedValues,
  open,
  onToggle,
  onClose,
  onApply,
  multiSelect = true,
  alignRight = false,
}: DropdownFilterProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // local selection — open 시 props로 동기화. React 19 권장 "Adjusting state on prop change" 패턴.
  const [localValues, setLocalValues] = useState<string[]>(selectedValues);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      // popover 열릴 때 props 기준으로 reset
      setLocalValues(selectedValues);
    }
  }

  // outside click 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    // capture phase로 등록 — popover 내부 클릭 후 즉시 close 되는 race 방지
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // ESC 닫기 + focus trigger
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const toggleOption = useCallback(
    (value: string) => {
      setLocalValues((prev) => {
        if (multiSelect) {
          return prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value];
        }
        // single: 같은 값 다시 클릭 시 unselect, 다른 값 클릭 시 교체
        return prev.includes(value) ? [] : [value];
      });
    },
    [multiSelect],
  );

  const handleReset = useCallback(() => {
    setLocalValues([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply(localValues);
    // onApply 내부에서 setOpen(null) 호출하지만, 안전망으로 명시
    onClose();
  }, [localValues, onApply, onClose]);

  const selectedCount = selectedValues.length;
  const popoverId = useMemo(
    () => `dd-popover-${label.replace(/\s/g, "-")}`,
    [label],
  );

  return (
    <div className={open ? `${s.root} ${s.rootOpen}` : s.root}>
      <button
        ref={triggerRef}
        type="button"
        className={open || selectedCount > 0 ? s.triggerActive : s.trigger}
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={popoverId}
      >
        <span>{label}</span>
        {selectedCount > 0 && (
          <span className={s.triggerBadge}>{selectedCount}</span>
        )}
        {open ? (
          <ChevronUp size={14} aria-hidden="true" />
        ) : (
          <ChevronDown size={14} aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label={`${label} 필터`}
          className={alignRight ? s.popoverRight : s.popover}
        >
          <div className={s.optionGrid}>
            {options.map((opt) => {
              const selected = localValues.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={selected}
                  className={selected ? s.chipActive : s.chip}
                  onClick={() => toggleOption(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

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
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
