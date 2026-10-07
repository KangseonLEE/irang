"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Sprout } from "lucide-react";
import type { CropInfo } from "@/lib/data/crops";
import { CROP_CATEGORY_NAMES } from "@/lib/data/crop-categories";
import { useActiveOptionScroll } from "@/lib/hooks/use-active-option-scroll";
import { isComposingEvent, pickOnEnter, rankByName } from "@/lib/ime";
import s from "./crop-suitability-selector.module.css";

interface Props {
  crops: CropInfo[];
  selectedId: string | null;
}

const CATEGORY_ORDER: readonly CropInfo["category"][] = CROP_CATEGORY_NAMES;

/**
 * 작물 selector — region-cards-selector 와 동일한 검색 dropdown 패턴.
 * - 검색 input 1개 + focus 시 dropdown 으로 카테고리 그룹 + 매칭 결과
 * - 선택 시 input 자리에 chip + × 해제 버튼
 * - 1개만 선택 가능 (URL ?crop=...)
 */
export function CropSuitabilitySelector({ crops, selectedId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  /** ↑↓로 하이라이트를 직접 옮겼는가 — 옮겼으면 Enter 는 이름 완전 일치보다 그 항목을 고른다 */
  const navigatedRef = useRef(false);

  const selectedCrop = useMemo(
    () => (selectedId ? crops.find((c) => c.id === selectedId) ?? null : null),
    [crops, selectedId],
  );

  const trimmedQuery = query.trim().replace(/\s/g, "").toLowerCase();
  // 이름 우선 랭킹(9/7): "배" 같은 부분 입력에서 설명문("재배")만 맞는 30건이 앞에 오지 않게
  const ranked = useMemo(
    () => rankByName(crops, trimmedQuery, (c) => c.name, (c) => `${c.category}${c.description}`),
    [crops, trimmedQuery],
  );
  const filtered = useMemo<CropInfo[]>(() => {
    if (!trimmedQuery) return crops;
    return ranked.map((r) => r.item).slice(0, 40);
  }, [crops, ranked, trimmedQuery]);

  // 카테고리별 그룹핑 (dropdown 안에서)
  const grouped = useMemo(() => {
    const map = new Map<CropInfo["category"], CropInfo[]>();
    for (const c of filtered) {
      const arr = map.get(c.category) ?? [];
      arr.push(c);
      map.set(c.category, arr);
    }
    return map;
  }, [filtered]);

  // dropdown 안에서 flat 순회 가능한 순서 (키보드 navigation용)
  const flatOrder = useMemo<CropInfo[]>(() => {
    // 검색어가 있으면 랭킹 순(이름 일치 먼저) 그대로 — 카테고리 순으로 다시 섞으면 첫 항목이 '쌀'이 된다 (9/7)
    if (trimmedQuery) return filtered;
    const order: CropInfo[] = [];
    for (const cat of CATEGORY_ORDER) {
      const arr = grouped.get(cat);
      if (arr) order.push(...arr);
    }
    return order;
  }, [grouped, filtered, trimmedQuery]);

  // 외부 클릭 시 dropdown 닫기
  useEffect(() => {
    if (!isFocused) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!inputRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFocused]);

  const pushCrop = useCallback(
    (cropId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cropId) params.set("crop", cropId);
      else params.delete("crop");
      router.push(`/regions/compare?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleSelect = useCallback(
    (cropId: string) => {
      // 이미 선택된 작물을 다시 클릭하면 해제 (toggle)
      pushCrop(selectedId === cropId ? null : cropId);
      setQuery("");
      setIsFocused(false);
      setHighlightIdx(0);
      inputRef.current?.blur();
    },
    [pushCrop, selectedId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Tab 으로 검색창을 벗어나면 목록을 닫는다 — 열린 채로 남으면 다음 포커스를 덮는다 (10/6 QA1 Q3-🟡8)
      if (e.key === "Tab") {
        setIsFocused(false);
        return;
      }
      if (!isFocused || flatOrder.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigatedRef.current = true;
        setHighlightIdx((idx) => Math.min(idx + 1, flatOrder.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigatedRef.current = true;
        setHighlightIdx((idx) => Math.max(idx - 1, 0));
      } else if (e.key === "Enter") {
        // 한글 조합 중 Enter(조합 확정)는 무시 — 부분 문자열로 엉뚱한 작물이 확정되던 사고(9/7 배추→고구마)
        if (isComposingEvent(e)) return;
        e.preventDefault();
        const highlighted = flatOrder[highlightIdx];
        const target = navigatedRef.current
          ? highlighted
          : pickOnEnter(
              ranked.filter((r) => flatOrder.some((c) => c.id === r.item.id)),
              highlighted,
            );
        if (target) handleSelect(target.id);
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isFocused, flatOrder, highlightIdx, handleSelect, ranked],
  );

  /** 포커스가 검색 영역 밖으로 나가면 닫기 — 마우스 바깥 클릭은 mousedown 핸들러가 맡는다.
   *  relatedTarget 이 없으면(Safari 버튼 클릭은 포커스를 옮기지 않는다) 여기서 닫지 않는다. */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) setIsFocused(false);
  }, []);

  const showDropdown = isFocused;

  useActiveOptionScroll(dropdownRef, highlightIdx, showDropdown);

  return (
    <div className={s.wrap}>
      {/* 검색 input — 선택된 작물 정보는 아래 cropSummary 카드에 노출 */}
      <div className={s.searchWrap} onBlur={handleBlur}>
        <Sprout size={18} className={s.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIdx(0);
            navigatedRef.current = false;
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedCrop
              ? "다른 작물로 바꾸려면 검색해 보세요"
              : "작물 이름으로 찾아보세요 (예: 딸기, 사과, 인삼)"
          }
          className={s.searchInput}
          role="combobox"
          aria-label="작물 검색"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="crop-suitability-listbox"
          // 키보드 하이라이트를 보조기기에 알린다 (10/6 QA2 F6)
          aria-activedescendant={
            showDropdown && flatOrder[highlightIdx]
              ? `crop-suitability-opt-${flatOrder[highlightIdx].id}`
              : undefined
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setHighlightIdx(0);
              navigatedRef.current = false;
              inputRef.current?.focus();
            }}
            className={s.searchClearBtn}
            aria-label="검색어 지우기"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}

        {showDropdown && (
          <div ref={dropdownRef} id="crop-suitability-listbox" className={s.dropdown} role="listbox">
            {!trimmedQuery && (
              <div className={s.dropdownHint}>
                <Search size={12} aria-hidden="true" />
                작물 이름·종류를 입력하거나 아래 카테고리에서 골라보세요
              </div>
            )}

            {flatOrder.length === 0 && trimmedQuery && (
              <div className={s.dropdownEmpty}>
                &ldquo;{query}&rdquo; 매칭 결과 없음
              </div>
            )}

            {(trimmedQuery ? ["검색 결과" as const] : CATEGORY_ORDER).map((category) => {
              const items = trimmedQuery ? flatOrder : grouped.get(category as CropInfo["category"]);
              if (!items || items.length === 0) return null;
              return (
                <div key={category} className={s.dropdownGroup}>
                  <div className={s.dropdownGroupLabel}>{category}</div>
                  <div className={s.dropdownGroupItems}>
                    {items.map((c) => {
                      const globalIdx = flatOrder.findIndex((x) => x.id === c.id);
                      const isHighlighted = highlightIdx === globalIdx;
                      const isSelected = c.id === selectedId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="option"
                          id={`crop-suitability-opt-${c.id}`}
                          aria-selected={isHighlighted}
                          className={
                            isSelected
                              ? s.dropdownItemSelected
                              : isHighlighted
                                ? s.dropdownItemActive
                                : s.dropdownItem
                          }
                          onClick={() => handleSelect(c.id)}
                          onMouseEnter={() => setHighlightIdx(globalIdx)}
                        >
                          <span className={s.dropdownItemEmoji}>{c.emoji}</span>
                          <span className={s.dropdownItemName}>{c.name}</span>
                          {isSelected && (
                            <span className={s.dropdownItemBadge}>선택됨</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
