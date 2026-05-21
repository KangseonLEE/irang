"use client";

/**
 * ProgramsFilter — /programs 필터 wrap (데스크탑 그대로 + 모바일만 BottomSheet 전환).
 *
 * - 데스크탑(>= 640px): 기존 FilterBar(+ FilterActions + FilterRow + FilterGroup × 4) 그대로 노출.
 *   → 서버 사이드 SEO 보존 + 키보드 네비 보존 + JS 없이도 동작.
 * - 모바일(< 640px): ActiveFilterChips(메인 화면 1줄 row) + BottomSheetFilter(탭 모달) 노출.
 *   → 첫 뷰 좌석 절약, 칩 직접 제거, 시트 일괄 적용.
 *
 * URL state(searchParams)는 서버가 source-of-truth. ProgramsFilter는 URL ↔ local selections 변환만 담당.
 * Apply 클릭 시 router.push로 다시 SSR 트리거 → 결과 카운트는 자연히 SSR로 갱신.
 *
 * 결과 카운트 실시간 갱신은 D2 범위 외(서버 의존 filterProgramsAsync는 client 호출 불가).
 * D2.5에서 client filter 캐시 또는 prefetch 방식 검토.
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
import s from "./programs-filter.module.css";

export interface ProgramsFilterParam {
  /** URL searchParam 키 (region·supportType·category·age) */
  paramKey: string;
  /** 탭 라벨 (지역·지원 유형·카테고리·연령대) */
  label: string;
  /** 선택 가능한 option value 목록 */
  options: readonly string[];
  /** value → 한글 라벨 매핑 (category 영문 ID 대응). 없으면 value 그대로 */
  optionLabels?: Record<string, string>;
  /** 현재 URL의 값 (CSV) */
  currentValue: string | undefined;
}

interface ProgramsFilterProps {
  /** 데스크탑 영역 — 기존 FilterBar 트리 그대로 children으로 전달 받음 (Server Component 출력 OK) */
  desktopFilter: ReactNode;
  /**
   * 모바일 영역 상단 — 검색 폼 + "마감 포함" 토글 등 (4 chip 그룹 외 액션은 BottomSheet 밖에 노출).
   * 보통 FilterActions를 단독으로 넘긴다. 카드 wrap 없음.
   */
  mobileActions?: ReactNode;
  /** 모바일 BottomSheet에 띄울 필터 그룹들 (4종) */
  params: ProgramsFilterParam[];
  /** base path — 보통 "/programs" */
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

export function ProgramsFilter({
  desktopFilter,
  mobileActions,
  params,
  basePath,
  currentFilters,
}: ProgramsFilterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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

  // ── 활성 칩 (1줄 row에 표시될 개별 selected option들) ──
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
            // 해당 value만 CSV에서 제거 → 빈 배열이면 key 자체 제거
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
    // tabs id == paramKey이므로 selections를 그대로 URL changes로 변환
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
    // 4개 필터 paramKey만 제거. q / includeClosed / persona / view 등 다른 param은 보존.
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
        /* resultCount: D2.5 추후 — client filter 캐시 도입 시 number 주입 */
        title="필터"
      />
    </>
  );
}
