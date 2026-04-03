"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { CROP_CATEGORIES, type CropCategory } from "@/lib/data/crops";
import s from "./crop-filter.module.css";

interface CropFilterProps {
  currentCategory: CropCategory;
}

export function CropFilter({ currentCategory }: CropFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tablistRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuery = searchParams.get("q") ?? "";

  /** URL search params를 업데이트하는 공통 헬퍼 */
  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.push(`/crops${qs ? `?${qs}` : ""}`);
    },
    [searchParams, router],
  );

  const handleCategoryChange = useCallback(
    (value: unknown) => {
      const category = value as string;
      pushParams({
        category: category === "전체" ? null : category,
      });
    },
    [pushParams],
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      pushParams({ q: e.target.value || null });
    },
    [pushParams],
  );

  const handleSearchClear = useCallback(() => {
    pushParams({ q: null });
    inputRef.current?.focus();
  }, [pushParams]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const tabs = tablistRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]'
      );
      if (!tabs || tabs.length === 0) return;

      const currentIndex = CROP_CATEGORIES.indexOf(currentCategory);
      let nextIndex: number | null = null;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % CROP_CATEGORIES.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex =
          (currentIndex - 1 + CROP_CATEGORIES.length) %
          CROP_CATEGORIES.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = CROP_CATEGORIES.length - 1;
      }

      if (nextIndex !== null) {
        tabs[nextIndex].focus();
        handleCategoryChange(CROP_CATEGORIES[nextIndex]);
      }
    },
    [currentCategory, handleCategoryChange],
  );

  return (
    <div className={s.filterWrap}>
      {/* 검색 입력 */}
      <div className={s.searchWrap}>
        <Search size={16} className={s.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className={s.searchInput}
          placeholder="작물명 또는 설명으로 검색"
          value={currentQuery}
          onChange={handleSearchChange}
          aria-label="작물 검색"
        />
        {currentQuery && (
          <button
            type="button"
            className={s.searchClear}
            onClick={handleSearchClear}
            aria-label="검색어 지우기"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div
        ref={tablistRef}
        className={s.filterBar}
        role="tablist"
        aria-label="작물 카테고리 필터"
        onKeyDown={handleKeyDown}
      >
        {CROP_CATEGORIES.map((cat) => {
          const isSelected = currentCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`${s.chip}${isSelected ? ` ${s.chipActive}` : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
