"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { REGIONS, SUPPORT_TYPES, STATUS_OPTIONS } from "@/lib/data/programs";
import s from "./program-filter.module.css";

interface ProgramFilterProps {
  currentFilters: {
    region: string;
    age: string;
    supportType: string;
    status: string;
  };
}

export function ProgramFilter({ currentFilters }: ProgramFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 나이 입력은 로컬 상태로 관리하여 즉각 반영하되, URL은 debounce로 지연 업데이트
  const [localAge, setLocalAge] = useState(currentFilters.age);

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

  const handleAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // 숫자만 허용, 빈 값도 허용 (필터 해제)
      if (value === "" || /^\d+$/.test(value)) {
        setLocalAge(value);
        // 250ms debounce: 빠른 연속 입력 시 마지막 값만 URL에 반영
        if (ageDebounceRef.current) clearTimeout(ageDebounceRef.current);
        ageDebounceRef.current = setTimeout(() => {
          updateFilter("age", value);
        }, 250);
      }
    },
    [updateFilter]
  );

  const clearAllFilters = useCallback(() => {
    setLocalAge("");
    if (ageDebounceRef.current) clearTimeout(ageDebounceRef.current);
    router.replace("/programs");
  }, [router]);

  const hasActiveFilters =
    currentFilters.region ||
    currentFilters.age ||
    currentFilters.supportType ||
    currentFilters.status;

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

        {/* 모집 상태 필터 */}
        <div className={s.field}>
          <label htmlFor="status-filter" className={s.label}>
            모집 상태
          </label>
          <select
            id="status-filter"
            className={s.select}
            value={currentFilters.status || "전체"}
            onChange={(e) => updateFilter("status", e.target.value)}
          >
            <option value="전체">전체 상태</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
