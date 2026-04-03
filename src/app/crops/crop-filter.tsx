"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, type KeyboardEvent } from "react";
import { CROP_CATEGORIES, type CropCategory } from "@/lib/data/crops";
import s from "./crop-filter.module.css";

interface CropFilterProps {
  currentCategory: CropCategory;
}

export function CropFilter({ currentCategory }: CropFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleCategoryChange = useCallback(
    (value: unknown) => {
      const category = value as string;
      const params = new URLSearchParams(searchParams.toString());
      if (category === "전체") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      const qs = params.toString();
      router.push(`/crops${qs ? `?${qs}` : ""}`);
    },
    [searchParams, router]
  );

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
    [currentCategory, handleCategoryChange]
  );

  return (
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
  );
}
