"use client";

/**
 * ActiveFilterChips — 모바일 메인 화면에 표시되는 1줄 활성 필터 row.
 *
 * 구조: [≡ 필터 N] | [경기도 ×] [정착·창업 ×] … (가로 스크롤)
 * - "필터 N" 버튼 클릭 → BottomSheetFilter 열기
 * - 각 칩의 × 클릭 → 해당 칩 제거 (즉시 router.push)
 * - 활성 필터가 0개라도 "필터" 버튼은 노출 (입구 보장)
 */

import { SlidersHorizontal, X } from "lucide-react";
import s from "./active-filter-chips.module.css";

export interface ActiveChip {
  /** chip 식별자 (key용) */
  id: string;
  /** chip 표시 라벨 */
  label: string;
  /** × 버튼 클릭 시 호출 */
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  activeChips: ActiveChip[];
  /** "필터 N" 배지 카운트 (보통 activeChips.length) */
  filterCount: number;
  onOpenFilter: () => void;
  className?: string;
}

export function ActiveFilterChips({
  activeChips,
  filterCount,
  onOpenFilter,
  className,
}: ActiveFilterChipsProps) {
  return (
    /* 9/29 회장: 모바일에서 "필터" 글자만 터치되던 것을 **행 전체**로 — 칩(제거 버튼)을 제외한 빈 영역·
       안내 문구를 눌러도 필터가 열린다. 접근성 진입점은 여전히 "필터 열기" 버튼(행 자체는 presentation). */
    <div
      className={className ? `${s.row} ${s.rowTappable} ${className}` : `${s.row} ${s.rowTappable}`}
      role="presentation"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        onOpenFilter();
      }}
    >
      <button
        type="button"
        className={s.filterBtn}
        onClick={onOpenFilter}
        aria-label="필터 열기"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>필터</span>
        {filterCount > 0 && <span className={s.filterBadge}>{filterCount}</span>}
      </button>

      <div className={s.divider} aria-hidden="true" />

      <div className={s.chipsScroll}>
        {activeChips.length === 0 && (
          <span className={s.empty}>전체 결과를 보고 있어요</span>
        )}
        {activeChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={s.chip}
            onClick={chip.onRemove}
            aria-label={`${chip.label} 필터 제거`}
          >
            <span>{chip.label}</span>
            <X size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
