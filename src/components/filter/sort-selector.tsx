"use client";

/**
 * SortSelector — 리스트 페이지 정렬 selector.
 *
 * 5/22 회장 결재 — /programs 1차 도입 (옵션 A 마감 임박 + 최근 등록).
 *  - trigger button (현재 선택값 표시 + ChevronDown)
 *  - 클릭 → anchored popover (옵션 list, 단일 선택)
 *  - 옵션 클릭 시 즉시 onChange + popover close (Apply 단계 없음 — 정렬은 즉시 적용 UX)
 *  - outside click·ESC 닫기
 *  - 한 옵션만 active (radio 의미론, role="menu")
 *
 * 디자인:
 *  - DropdownFilter와 동일한 시각 톤 (trigger 칩 + popover + clip-path arrow)
 *  - 5/20 박제 border-left 0건 / 5/22 박제 clip-path 패턴 준수
 *
 * 향후 다른 페이지 재사용 시 generic options prop으로 확장:
 *  - /education·/events 등 추가 도입 가능
 *  - value 타입은 호출처가 string union으로 좁힐 수 있도록 generic은 string으로 유지
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import s from "./sort-selector.module.css";

export interface SortSelectorOption<V extends string = string> {
  value: V;
  label: string;
}

interface SortSelectorProps<V extends string = string> {
  /** 옵션 list (단일 선택) */
  options: readonly SortSelectorOption<V>[];
  /** 현재 선택값 */
  value: V;
  /** 선택 변경 콜백 (즉시 호출 + popover close) */
  onChange: (value: V) => void;
  /** popover open 상태 — 부모가 다른 dropdown과 한 번에 1개만 열리도록 통제 가능 */
  open: boolean;
  /** trigger 클릭 콜백 */
  onToggle: () => void;
  /** outside·ESC·옵션 선택 시 닫기 */
  onClose: () => void;
  /** popover 우측 정렬 (viewport 우측 끝에서 잘림 방지). 기본 우측 정렬 (toolbar 우측에 배치되는 경우가 많음) */
  alignRight?: boolean;
  /** aria-label (예: "정렬 옵션"). 기본 "정렬" */
  ariaLabel?: string;
}

export function SortSelector<V extends string = string>({
  options,
  value,
  onChange,
  open,
  onToggle,
  onClose,
  alignRight = true,
  ariaLabel = "정렬",
}: SortSelectorProps<V>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = useCallback(
    (v: V) => {
      if (v !== value) onChange(v);
      onClose();
      triggerRef.current?.focus();
    },
    [value, onChange, onClose],
  );

  const currentLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "",
    [options, value],
  );

  const popoverId = "sort-selector-popover";

  return (
    <div className={open ? `${s.root} ${s.rootOpen}` : s.root}>
      <button
        ref={triggerRef}
        type="button"
        className={s.trigger}
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={popoverId}
        aria-label={`${ariaLabel}: ${currentLabel}`}
      >
        <ArrowUpDown size={14} aria-hidden="true" className={s.triggerIcon} />
        <span className={s.triggerLabel}>{currentLabel}</span>
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
          role="menu"
          aria-label={ariaLabel}
          className={alignRight ? s.popoverRight : s.popover}
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={selected ? s.optionActive : s.option}
                onClick={() => handleSelect(opt.value)}
              >
                <span>{opt.label}</span>
                {selected && (
                  <span className={s.optionCheck} aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
