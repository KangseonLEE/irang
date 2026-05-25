"use client";

/**
 * EventSortControl — /events 정렬 UI wrap.
 *
 * 5/25 회장 결재 — ProgramSortControl 패턴 그대로 적용.
 * default(deadline)는 URL에 노출 안 함 (cleanliness).
 */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  SortSelector,
  type SortSelectorOption,
} from "@/components/filter/sort-selector";
import {
  EVENT_SORT_OPTIONS,
  DEFAULT_EVENT_SORT,
  type EventSortKey,
} from "@/lib/data/events";

interface EventSortControlProps {
  currentSort: EventSortKey;
  currentFilters: Record<string, string | undefined>;
  basePath: string;
}

export function EventSortControl({
  currentSort,
  currentFilters,
  basePath,
}: EventSortControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleChange = (value: EventSortKey) => {
    const merged: Record<string, string | undefined> = { ...currentFilters };
    merged.sort = value === DEFAULT_EVENT_SORT ? undefined : value;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "전체") sp.set(k, v);
    }
    const qs = sp.toString();
    const url = qs ? `${basePath}?${qs}` : basePath;
    startTransition(() => router.push(url, { scroll: false }));
  };

  const options: readonly SortSelectorOption<EventSortKey>[] =
    EVENT_SORT_OPTIONS;

  return (
    <SortSelector<EventSortKey>
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
