"use client";

/**
 * EducationFilter — /education 필터 wrap.
 *
 * 5/22 회장 결재 — 데스크탑 광역 dropdown sprint (옵션 A 카테고리별 dropdown).
 * - 데스크탑(>= 640px): mobileActions + DropdownFilter row + 전체 초기화.
 * - 모바일(< 640px): ActiveFilterChips + BottomSheetFilter.
 *
 * 탭: 지역(EDUCATION_REGIONS) · 유형(EDUCATION_TYPES) · 난이도(EDUCATION_LEVELS) 3종.
 */

import { useRouter } from "next/navigation";
import { useState, useTransition, useMemo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import {
  BottomSheetFilter,
  type FilterTab,
  type FilterOption,
} from "@/components/filter/bottom-sheet-filter";
import {
  ActiveFilterChips,
  type ActiveChip,
} from "@/components/filter/active-filter-chips";
import { DropdownFilter } from "@/components/filter/dropdown-filter";
import s from "./education-filter.module.css";

export interface EducationFilterParam {
  paramKey: string;
  label: string;
  options: readonly string[];
  optionLabels?: Record<string, string>;
  currentValue: string | undefined;
}

interface EducationFilterProps {
  /** 데스크탑 fallback. 5/22 dropdown 도입 후 사용 안 함 (호환 위해 prop 보존) */
  desktopFilter?: ReactNode;
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
  mobileActions,
  params,
  basePath,
  currentFilters,
}: EducationFilterProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
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

  const handleSheetApply = (selections: Record<string, string[]>) => {
    const changes: Record<string, string | undefined> = {};
    for (const p of params) {
      const sel = selections[p.paramKey] ?? [];
      changes[p.paramKey] = sel.length > 0 ? sel.join(",") : undefined;
    }
    const url = buildUrl(basePath, currentFilters, changes);
    setSheetOpen(false);
    startTransition(() => router.push(url, { scroll: false }));
  };

  const handleSheetReset = () => {
    const changes: Record<string, string | undefined> = {};
    for (const p of params) changes[p.paramKey] = undefined;
    const url = buildUrl(basePath, currentFilters, changes);
    setSheetOpen(false);
    startTransition(() => router.push(url, { scroll: false }));
  };

  const handleDropdownApply = (paramKey: string, values: string[]) => {
    const csv = values.length > 0 ? values.join(",") : undefined;
    const url = buildUrl(basePath, currentFilters, { [paramKey]: csv });
    setOpenDropdownId(null);
    startTransition(() => router.push(url, { scroll: false }));
  };

  const handleResetAll = () => {
    const changes: Record<string, string | undefined> = {};
    for (const p of params) changes[p.paramKey] = undefined;
    const url = buildUrl(basePath, currentFilters, changes);
    setOpenDropdownId(null);
    startTransition(() => router.push(url, { scroll: false }));
  };

  const filterCount = activeChips.length;

  return (
    <>
      {/* 데스크탑 (>= 640px) — actions + dropdown row */}
      <div className={s.desktopOnly}>
        {mobileActions && <div className={s.desktopActions}>{mobileActions}</div>}
        <div className={s.dropdownRow} role="group" aria-label="필터 분류">
          {params.map((p, idx) => {
            const selectedValues = p.currentValue
              ? p.currentValue.split(",").filter(Boolean)
              : [];
            const options = p.options.map((opt) => ({
              value: opt,
              label: p.optionLabels?.[opt] ?? opt,
            }));
            const alignRight = idx === params.length - 1;
            return (
              <DropdownFilter
                key={p.paramKey}
                label={p.label}
                options={options}
                selectedValues={selectedValues}
                open={openDropdownId === p.paramKey}
                onToggle={() =>
                  setOpenDropdownId((prev) =>
                    prev === p.paramKey ? null : p.paramKey,
                  )
                }
                onClose={() => setOpenDropdownId(null)}
                onApply={(values) => handleDropdownApply(p.paramKey, values)}
                alignRight={alignRight}
              />
            );
          })}
          {filterCount > 0 && (
            <button
              type="button"
              className={s.resetAllBtn}
              onClick={handleResetAll}
              aria-label="필터 전체 초기화"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* 모바일 (< 640px) — 검색·토글 + Active row + BottomSheet */}
      <div className={s.mobileOnly}>
        {mobileActions && (
          <div className={s.mobileActionsWrap}>{mobileActions}</div>
        )}
        <ActiveFilterChips
          activeChips={activeChips}
          filterCount={filterCount}
          onOpenFilter={() => setSheetOpen(true)}
        />
      </div>
      <BottomSheetFilter
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        tabs={tabs}
        onApply={handleSheetApply}
        onReset={handleSheetReset}
        title="필터"
      />
    </>
  );
}
