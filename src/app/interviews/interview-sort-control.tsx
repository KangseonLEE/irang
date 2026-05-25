"use client";

/**
 * InterviewSortControl — /interviews 정렬 UI wrap (5/25 회장 결재 Sprint 2).
 * default(recent)는 URL에 노출 안 함.
 */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  SortSelector,
  type SortSelectorOption,
} from "@/components/filter/sort-selector";
import {
  INTERVIEW_SORT_OPTIONS,
  DEFAULT_INTERVIEW_SORT,
  type InterviewSortKey,
} from "@/lib/data/landing";

interface InterviewSortControlProps {
  currentSort: InterviewSortKey;
  currentFilters: Record<string, string | undefined>;
  basePath: string;
}

export function InterviewSortControl({
  currentSort,
  currentFilters,
  basePath,
}: InterviewSortControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleChange = (value: InterviewSortKey) => {
    const merged: Record<string, string | undefined> = { ...currentFilters };
    merged.sort = value === DEFAULT_INTERVIEW_SORT ? undefined : value;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "전체") sp.set(k, v);
    }
    const qs = sp.toString();
    const url = qs ? `${basePath}?${qs}` : basePath;
    startTransition(() => router.push(url, { scroll: false }));
  };

  const options: readonly SortSelectorOption<InterviewSortKey>[] =
    INTERVIEW_SORT_OPTIONS;

  return (
    <SortSelector<InterviewSortKey>
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
