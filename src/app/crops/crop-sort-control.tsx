"use client";

/**
 * CropSortControl — /crops 정렬 UI wrap (5/25 회장 결재 Sprint 2).
 * default(name)은 URL에 노출 안 함.
 */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  SortSelector,
  type SortSelectorOption,
} from "@/components/filter/sort-selector";
import {
  CROP_SORT_OPTIONS,
  DEFAULT_CROP_SORT,
  type CropSortKey,
} from "@/lib/data/crops";

interface CropSortControlProps {
  currentSort: CropSortKey;
  currentFilters: Record<string, string | undefined>;
  basePath: string;
}

export function CropSortControl({
  currentSort,
  currentFilters,
  basePath,
}: CropSortControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleChange = (value: CropSortKey) => {
    const merged: Record<string, string | undefined> = { ...currentFilters };
    merged.sort = value === DEFAULT_CROP_SORT ? undefined : value;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "전체") sp.set(k, v);
    }
    const qs = sp.toString();
    const url = qs ? `${basePath}?${qs}` : basePath;
    startTransition(() => router.push(url, { scroll: false }));
  };

  const options: readonly SortSelectorOption<CropSortKey>[] = CROP_SORT_OPTIONS;

  return (
    <SortSelector<CropSortKey>
      options={options}
      value={currentSort}
      onChange={handleChange}
      open={open}
      onToggle={() => setOpen((v) => !v)}
      onClose={() => setOpen(false)}
      alignRight
      ariaLabel="정렬"
    />
  );
}
