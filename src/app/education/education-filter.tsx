"use client";

/**
 * EducationFilter — /education 필터 wrap (데스크탑 그대로 + 모바일만 BottomSheet 전환).
 *
 * D3 광역 sprint — /programs ProgramsFilter 동일 패턴 (2026-05-21).
 * 데스크탑(>= 640px)은 기존 FilterBar 그대로, 모바일(< 640px)은 ActiveFilterChips + BottomSheetFilter.
 *
 * 탭: 지역(EDUCATION_REGIONS) · 유형(EDUCATION_TYPES) · 난이도(EDUCATION_LEVELS) 3종.
 */

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, type ReactNode } from "react";
import {
  BottomSheetFilter,
  type FilterTab,
  type FilterOption,
} from "@/components/filter/bottom-sheet-filter";
import {
  ActiveFilterChips,
  type ActiveChip,
} from "@/components/filter/active-filter-chips";
import s from "./education-filter.module.css";

export interface EducationFilterParam {
  paramKey: string;
  label: string;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  currentValue: string | undefined;
}

interface EducationFilterProps {
  desktopFilter: ReactNode;
  mobileActions?: ReactNode;
  params: EducationFilterParam[];
  basePath: string;
  currentFilters: Record<string, string | undefined>;
}

function buildUrl(
  basePath: string,
  currentFilters: Record<string, string | undefined>,
  changes: Record<string, string | undefined>,
): string {
  const merged = { ...currentFilters, ...changes };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== "전체") sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function EducationFilter({
  desktopFilter,
  mobileActions,
  params,
  basePath,
  currentFilters,
}: EducationFilterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const tabs: FilterTab[] = useMemo(
    () =>
      params.map((p) => {
        const selectedValues = p.currentValue
          ? p.currentValue.split(",").filter(Boolean)
          : [];
        const options: FilterOption[] = p.options.map((opt) => ({
          value: opt,
          label: p.optionLabels?.[opt] ?? opt,
        }));
        return {
          id: p.paramKey,
          label: p.label,
          options,
          selectedValues,
          multiSelect: true,
        };
      }),
    [params],
  );

  const activeChips: ActiveChip[] = useMemo(() => {
    const chips: ActiveChip[] = [];
    for (const p of params) {
      if (!p.currentValue) continue;
      const values = p.currentValue.split(",").filter(Boolean);
      for (const v of values) {
        const label = p.optionLabels?.[v] ?? v;
        chips.push({
          id: `${p.paramKey}:${v}`,
          label,
          onRemove: () => {
            const next = values.filter((x) => x !== v);
            const nextCsv = next.length > 0 ? next.join(",") : undefined;
            const url = buildUrl(basePath, currentFilters, {
              [p.paramKey]: nextCsv,
            });
            startTransition(() => router.push(url, { scroll: false }));
          },
        });
      }
    }
    return chips;
  }, [params, basePath, currentFilters, router]);

  const handleApply = (selections: Record<string, string[]>) => {
    const changes: Record<string, string | undefined> = {};
    for (const p of params) {
      const sel = selections[p.paramKey] ?? [];
      changes[p.paramKey] = sel.length > 0 ? sel.join(",") : undefined;
    }
    const url = buildUrl(basePath, currentFilters, changes);
    setOpen(false);
    startTransition(() => router.push(url, { scroll: false }));
  };

  const handleReset = () => {
    const changes: Record<string, string | undefined> = {};
    for (const p of params) changes[p.paramKey] = undefined;
    const url = buildUrl(basePath, currentFilters, changes);
    setOpen(false);
    startTransition(() => router.push(url, { scroll: false }));
  };

  const filterCount = activeChips.length;

  return (
    <>
      {/* 데스크탑 (>= 640px) — 기존 FilterBar 그대로 */}
      <div className={s.desktopOnly}>{desktopFilter}</div>

      {/* 모바일 (< 640px) — 검색·토글 + Active row + BottomSheet */}
      <div className={s.mobileOnly}>
        {mobileActions && (
          <div className={s.mobileActionsWrap}>{mobileActions}</div>
        )}
        <ActiveFilterChips
          activeChips={activeChips}
          filterCount={filterCount}
          onOpenFilter={() => setOpen(true)}
        />
      </div>
      <BottomSheetFilter
        open={open}
        onClose={() => setOpen(false)}
        tabs={tabs}
        onApply={handleApply}
        onReset={handleReset}
        title="필터"
      />
    </>
  );
}
