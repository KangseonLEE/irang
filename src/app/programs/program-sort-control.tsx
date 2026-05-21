"use client";

/**
 * ProgramSortControl — /programs 정렬 UI wrap.
 *
 * 5/22 회장 결재 — SortSelector를 router.push와 연결.
 *  - URL searchParam 'sort' 변경 → SSR 재실행 → 정렬된 결과 렌더.
 *  - default(deadline)는 URL에 노출 안 함 (cleanliness).
 *  - scroll: false — 정렬 변경은 리스트 시각 변화이므로 페이지 점프 차단.
 */

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  SortSelector,
  type SortSelectorOption,
} from "@/components/filter/sort-selector";
import {
  PROGRAM_SORT_OPTIONS,
  DEFAULT_PROGRAM_SORT,
  type ProgramSortKey,
} from "@/lib/data/programs";

interface ProgramSortControlProps {
  /** 현재 sort 값 (URL 또는 default) */
  currentSort: ProgramSortKey;
  /** 현재 URL의 다른 filter searchParams — sort 변경 시 보존 */
  currentFilters: Record<string, string | undefined>;
  /** base path — 보통 "/programs" */
  basePath: string;
}

export function ProgramSortControl({
  currentSort,
  currentFilters,
  basePath,
}: ProgramSortControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleChange = (value: ProgramSortKey) => {
    const merged: Record<string, string | undefined> = { ...currentFilters };
    // default는 URL에서 제외 (cleanliness)
    merged.sort = value === DEFAULT_PROGRAM_SORT ? undefined : value;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "전체") sp.set(k, v);
    }
    const qs = sp.toString();
    const url = qs ? `${basePath}?${qs}` : basePath;
    startTransition(() => router.push(url, { scroll: false }));
  };

  // PROGRAM_SORT_OPTIONS는 readonly tuple — SortSelector generic으로 좁힘
  const options: readonly SortSelectorOption<ProgramSortKey>[] = PROGRAM_SORT_OPTIONS;

  return (
    <SortSelector<ProgramSortKey>
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
