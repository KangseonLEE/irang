"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Search } from "lucide-react";
import { REGIONS, SUPPORT_TYPES } from "@/lib/data/programs";
import s from "./program-filter.module.css";

interface ProgramFilterProps {
  currentFilters: {
    region: string;
    age: string;
    supportType: string;
    query: string;
    includeClosed: boolean;
  };
}

export function ProgramFilter({ currentFilters }: ProgramFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 로컬 상태: 입력 즉시 반영, URL은 debounce로 지연 업데이트
  const [localAge, setLocalAge] = useState(currentFilters.age);
  const [localQuery, setLocalQuery] = useState(currentFilters.query);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "전체") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`/programs?${params.toString()}`);
    },
    [searchParams, router]
  );

  const updateFilterDebounced = useCallback(
    (key: string, value: string, delay: number = 300) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateFilter(key, value);
      }, delay);
    },
    [updateFilter]
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuery(value);
      updateFilterDebounced("q", value, 300);
    },
    [updateFilterDebounced]
  );

  const handleAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d+$/.test(value)) {
        setLocalAge(value);
        updateFilterDebounced("age", value, 250);
      }
    },
    [updateFilterDebounced]
  );

  const handleIncludeClosedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.checked) {
        params.set("includeClosed", "1");
      } else {
        params.delete("includeClosed");
      }
      router.replace(`/programs?${params.toString()}`);
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    setLocalAge("");
    setLocalQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.replace("/programs");
  }, [router]);

  const hasActiveFilters =
    currentFilters.region ||
    currentFilters.age ||
    currentFilters.supportType ||
    currentFilters.query ||
    currentFilters.includeClosed;

  return (
    <div className={s.filterCard}>
      <div className={s.header}>
        <p className={s.title}>검색 조건</p>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className={s.clearButton}>
            필터 초기화
          </button>
        )}
      </div>

      {/* 텍스트 검색 */}
      <div className={s.searchRow}>
        <div className={s.searchInputWrap}>
          <Search size={16} className={s.searchIcon} />
          <input
            id="query-filter"
            type="text"
            placeholder="지원사업명, 지역, 기관명으로 검색"
            className={s.searchInput}
            value={localQuery}
            onChange={handleQueryChange}
          />
        </div>
      </div>

      <div className={s.grid}>
        {/* 지역 필터 */}
        <div className={s.field}>
          <label htmlFor="region-filter" className={s.label}>
            지역
          </label>
          <select
            id="region-filter"
            className={s.select}
            value={currentFilters.region || "전체"}
            onChange={(e) => updateFilter("region", e.target.value)}
          >
            <option value="전체">전체 지역</option>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* 나이 필터 */}
        <div className={s.field}>
          <label htmlFor="age-filter" className={s.label}>
            나이
          </label>
          <input
            id="age-filter"
            type="number"
            min={1}
            max={100}
            placeholder="만 나이 입력"
            className={s.input}
            value={localAge}
            onChange={handleAgeChange}
          />
        </div>

        {/* 지원 유형 필터 */}
        <div className={s.field}>
          <label htmlFor="type-filter" className={s.label}>
            지원 유형
          </label>
          <select
            id="type-filter"
            className={s.select}
            value={currentFilters.supportType || "전체"}
            onChange={(e) => updateFilter("supportType", e.target.value)}
          >
            <option value="전체">전체 유형</option>
            {SUPPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 마감건 포함 체크박스 */}
        <div className={s.field}>
          <span className={s.label}>마감 여부</span>
          <label htmlFor="include-closed" className={s.checkboxLabel}>
            <input
              id="include-closed"
              type="checkbox"
              className={s.checkbox}
              checked={currentFilters.includeClosed}
              onChange={handleIncludeClosedChange}
            />
            <span className={s.checkboxText}>마감건 포함</span>
          </label>
        </div>
      </div>
    </div>
  );
}
