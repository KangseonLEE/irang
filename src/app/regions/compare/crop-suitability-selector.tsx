"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Sprout } from "lucide-react";
import type { CropInfo } from "@/lib/data/crops";
import s from "./crop-suitability-selector.module.css";

interface Props {
  crops: CropInfo[];
  selectedId: string | null;
}

const CATEGORY_ORDER: CropInfo["category"][] = ["식량", "채소", "과수", "특용"];

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

  const selectedCrop = useMemo(
    () => (selectedId ? crops.find((c) => c.id === selectedId) ?? null : null),
    [crops, selectedId],
  );

  // ---- 검색 인덱스 ----
  interface SearchResult {
    crop: CropInfo;
    searchText: string;
  }
  const searchIndex = useMemo<SearchResult[]>(
    () =>
      crops.map((c) => ({
        crop: c,
        searchText: `${c.name}${c.category}${c.description}`.replace(/\s/g, "").toLowerCase(),
      })),
    [crops],
  );

  const trimmedQuery = query.trim().replace(/\s/g, "").toLowerCase();
  const filtered = useMemo<CropInfo[]>(() => {
    if (!trimmedQuery) return crops;
    return searchIndex
      .filter((r) => r.searchText.includes(trimmedQuery))
      .map((r) => r.crop)
      .slice(0, 40);
  }, [crops, searchIndex, trimmedQuery]);

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
    const order: CropInfo[] = [];
    for (const cat of CATEGORY_ORDER) {
      const arr = grouped.get(cat);
      if (arr) order.push(...arr);
    }
    return order;
  }, [grouped]);

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
      if (!isFocused || flatOrder.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((idx) => Math.min(idx + 1, flatOrder.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((idx) => Math.max(idx - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flatOrder[highlightIdx];
        if (target) handleSelect(target.id);
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isFocused, flatOrder, highlightIdx, handleSelect],
  );

  const showDropdown = isFocused;

  return (
    <div className={s.wrap}>
      {/* 검색 input — 선택된 작물 정보는 아래 cropSummary 카드에 노출 */}
      <div className={s.searchWrap}>
        <Sprout size={18} className={s.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIdx(0);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedCrop
              ? "다른 작물로 바꾸려면 검색해 보세요"
              : "작물 이름으로 찾아보세요 (예: 딸기, 사과, 인삼)"
          }
          className={s.searchInput}
          aria-label="작물 검색"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={s.searchClearBtn}
            aria-label="검색어 지우기"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}

        {showDropdown && (
          <div ref={dropdownRef} className={s.dropdown} role="listbox">
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

            {CATEGORY_ORDER.map((category) => {
              const items = grouped.get(category);
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
