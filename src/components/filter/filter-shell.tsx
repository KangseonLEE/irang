"use client";

/**
 * FilterShell — 4 리스트형 페이지(programs·education·events·crops) 공용 필터 wrap.
 *
 * 5/22 회장 결재 — programs/education/events/crops *-filter.tsx 4 파일 ~220줄/파일이
 * 옵셔널 comment + Type 이름 외에 100% 동일 → 단일 컴포넌트로 통합.
 *
 * - 데스크탑(>= 640px): mobileActions(검색·토글 등) + DropdownFilter row + 전체 초기화.
 * - 모바일(< 640px): ActiveFilterChips(메인 1줄 row) + BottomSheetFilter(앵커 모달).
 *
 * URL state(searchParams)는 서버가 source-of-truth. wrap은 URL ↔ local selections 변환만 담당.
 * Apply 클릭 시 router.push로 다시 SSR 트리거 → 결과 카운트 자연 갱신.
 *
 * 한 번에 1 dropdown만 open — openDropdownId state로 통제.
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
import s from "./filter-shell.module.css";

export interface FilterShellParam {
  /** URL searchParam 키 (region·type·category·age 등) */
  paramKey: string;
  /** 탭 라벨 (지역·유형·카테고리·연령대 등) */
  label: string;
  /** 선택 가능한 option value 목록 */
  options: readonly string[];
  /** value → 한글 라벨 매핑 (영문 ID 대응). 없으면 value 그대로 */
  optionLabels?: Record<string, string>;
  /** 현재 URL의 값 (CSV) */
  currentValue: string | undefined;
}

interface FilterShellProps {
  /** 데스크탑·모바일 공용 actions — 검색 폼 + 토글 등. dropdown row 위에 노출. */
  mobileActions?: ReactNode;
  /** N종 필터 그룹 정의 */
  params: FilterShellParam[];
  /** base path — 보통 "/programs", "/education" 등 */
  basePath: string;
  /** 기존 활성 필터 전체 — Apply / Reset / 칩 제거 시 URL 빌딩에 사용 */
  currentFilters: Record<string, string | undefined>;
}

/** URL 빌더 — currentFilters에 changes를 덮어쓰고 빈 값은 제거. */
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

export function FilterShell({
  mobileActions,
  params,
  basePath,
  currentFilters,
}: FilterShellProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // ── 모바일: URL → BottomSheet tabs 변환 ──
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

  // ── 활성 칩 (모바일 1줄 row) ──
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

  // 데스크탑 dropdown 적용 — 해당 paramKey만 변경
  const handleDropdownApply = (paramKey: string, values: string[]) => {
    const csv = values.length > 0 ? values.join(",") : undefined;
    const url = buildUrl(basePath, currentFilters, { [paramKey]: csv });
    setOpenDropdownId(null);
    startTransition(() => router.push(url, { scroll: false }));
  };

  // 데스크탑 전체 초기화 — 모든 paramKey 제거 (다른 param은 보존)
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
            // 마지막 칩은 viewport 우측 끝 잘림 방지 위해 popover 우측 정렬
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

      {/* 모바일 (< 640px) — actions + Active row + BottomSheet */}
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
