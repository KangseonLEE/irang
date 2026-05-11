"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { X, Search, Plus, MapPin, Loader2 } from "lucide-react";
import type { Station } from "@/lib/data/stations";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import s from "./region-selector.module.css";

const MAX_SELECTION = 3;

interface RegionSelectorProps {
  /** backward compat — props 유지 (page.tsx 시그니처 변경 없음) */
  stations: Station[];
  /** 현재 선택된 region IDs ("seoul" 또는 "jeonnam:suncheon-si") */
  selectedRegionIds: string[];
  /** canonical URL param (디버그 전용) */
  canonicalParam: string;
}

/** 검색 결과 단일 item — 시도 또는 시군구 */
interface SearchResultItem {
  /** "{provinceId}" 또는 "{provinceId}:{sigunguId}" */
  id: string;
  type: "sido" | "sigungu";
  /** 표시 라벨 — 시도는 "전남", 시군구는 "전남 순천시" */
  label: string;
  /** 검색용 정규화 텍스트 (공백 제거) */
  searchText: string;
  provinceShortName: string;
  sigunguName?: string;
}

/**
 * 2026-05-12 Phase D: 슬롯 3개 + 통합 검색 UI.
 *
 * - 상단 검색 input → 시도/시군구 통합 검색 결과 dropdown
 * - 슬롯 3개 박스 (selected display 또는 "+ 지역 추가" placeholder)
 * - 검색 결과 클릭 → 비어있는 첫 슬롯에 채워짐
 * - 슬롯의 X 클릭 → 해제
 *
 * 이전 17개 시도 grid + ▾ dropdown 패턴 폐기.
 */
export function RegionSelector({
  selectedRegionIds,
}: RegionSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // local optimistic state — chip 클릭 즉시 반영. props 변경 시 sync.
  const [optimisticIds, setOptimisticIds] = useState<string[]>(selectedRegionIds);
  useEffect(() => {
    setOptimisticIds(selectedRegionIds);
  }, [selectedRegionIds]);

  // 검색 인덱스 — 시도 17개 + 시군구 229개 (총 246개)
  const searchIndex = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];
    for (const p of PROVINCES) {
      items.push({
        id: p.id,
        type: "sido",
        label: p.shortName,
        searchText: `${p.name}${p.shortName}`.replace(/\s/g, ""),
        provinceShortName: p.shortName,
      });
    }
    for (const sg of SIGUNGUS) {
      const province = PROVINCES.find((p) => p.id === sg.sidoId);
      if (!province) continue;
      items.push({
        id: `${sg.sidoId}:${sg.id}`,
        type: "sigungu",
        label: `${province.shortName} ${sg.name}`,
        searchText: `${province.name}${province.shortName}${sg.name}${sg.shortName}`.replace(/\s/g, ""),
        provinceShortName: province.shortName,
        sigunguName: sg.name,
      });
    }
    return items;
  }, []);

  const trimmedQuery = query.trim().replace(/\s/g, "");
  const filteredResults = useMemo<SearchResultItem[]>(() => {
    if (!trimmedQuery) {
      // 검색어 없으면 시도 17개 + 인기 시군구 노출 안 함, 시도만 우선
      return searchIndex.filter((r) => r.type === "sido");
    }
    const lower = trimmedQuery.toLowerCase();
    return searchIndex
      .filter((r) => r.searchText.toLowerCase().includes(lower))
      .slice(0, 30); // 최대 30개
  }, [searchIndex, trimmedQuery]);

  // dropdown 외부 클릭 시 닫기
  useEffect(() => {
    if (!isFocused) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !inputRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [trimmedQuery]);

  const pushSelection = useCallback(
    (newIds: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("stations");
      if (newIds.length === 0) {
        params.delete("regions");
      } else {
        params.set("regions", newIds.join(","));
      }
      const qs = params.toString();
      setOptimisticIds(newIds);
      startTransition(() => {
        router.push(qs ? `/regions/compare?${qs}` : "/regions/compare");
      });
    },
    [searchParams, router],
  );

  const addRegion = useCallback(
    (item: SearchResultItem) => {
      // 이미 같은 province가 선택돼 있으면 그 슬롯을 새 선택으로 대체
      const provinceId = item.id.split(":")[0];
      const existingIdx = optimisticIds.findIndex(
        (id) => id === provinceId || id.startsWith(`${provinceId}:`),
      );
      if (existingIdx >= 0) {
        const newIds = [...optimisticIds];
        newIds[existingIdx] = item.id;
        pushSelection(newIds);
      } else if (optimisticIds.length < MAX_SELECTION) {
        pushSelection([...optimisticIds, item.id]);
      } else {
        return; // 한도 초과 — 무시
      }
      setQuery("");
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [optimisticIds, pushSelection],
  );

  const removeRegion = useCallback(
    (id: string) => {
      pushSelection(optimisticIds.filter((rid) => rid !== id));
    },
    [optimisticIds, pushSelection],
  );

  const clearAll = useCallback(() => {
    pushSelection([]);
  }, [pushSelection]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isFocused || filteredResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((idx) => Math.min(idx + 1, filteredResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((idx) => Math.max(idx - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = filteredResults[highlightIdx];
        if (target) addRegion(target);
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isFocused, filteredResults, highlightIdx, addRegion],
  );

  // 슬롯 표시 — 3개 (selected display 또는 placeholder)
  const slots = useMemo(() => {
    const arr: ({ id: string; label: string; provinceShortName: string; sigunguName?: string } | null)[] = [
      null,
      null,
      null,
    ];
    optimisticIds.forEach((id, i) => {
      if (i >= MAX_SELECTION) return;
      const [provinceId, sigunguId] = id.split(":");
      const province = PROVINCES.find((p) => p.id === provinceId);
      if (!province) return;
      const sigungu = sigunguId
        ? SIGUNGUS.find((sg) => sg.id === sigunguId && sg.sidoId === provinceId)
        : null;
      arr[i] = {
        id,
        label: sigungu ? `${province.shortName} ${sigungu.name}` : province.shortName,
        provinceShortName: province.shortName,
        sigunguName: sigungu?.name,
      };
    });
    return arr;
  }, [optimisticIds]);

  const reachedLimit = optimisticIds.length >= MAX_SELECTION;
  const showDropdown = isFocused && filteredResults.length > 0;

  return (
    <div className={s.card} role="group" aria-label="비교할 지역 선택">
      {/* ---- 상단 헤더 + 검색 input ---- */}
      <div className={s.searchHeader}>
        <div className={s.searchWrap}>
          <Search size={18} className={s.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              reachedLimit
                ? "최대 3곳까지 선택했어요"
                : "지역명으로 찾기 (예: 전남, 순천시)"
            }
            className={s.searchInput}
            aria-label="지역 검색"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="region-search-results"
            disabled={reachedLimit && !optimisticIds.length}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className={s.searchClearBtn}
              aria-label="검색어 지우기"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className={s.headerRight}>
          {isPending && (
            <span className={s.loadingHint} aria-live="polite">
              <Loader2 size={14} className={s.spinner} aria-hidden="true" />
              불러오는 중
            </span>
          )}
          <span className={s.counter} aria-live="polite">
            {optimisticIds.length}/{MAX_SELECTION}
          </span>
          {optimisticIds.length > 0 && (
            <button
              type="button"
              className={s.clearAllBtn}
              onClick={clearAll}
              disabled={isPending}
            >
              모두 지우기
            </button>
          )}
        </div>

        {/* ---- 검색 결과 dropdown ---- */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            id="region-search-results"
            className={s.dropdown}
            role="listbox"
          >
            {!trimmedQuery && (
              <div className={s.dropdownHint}>17개 시·도를 둘러보거나, 입력해서 시·군·구까지 찾아보세요</div>
            )}
            {filteredResults.map((item, idx) => {
              const isAlready = optimisticIds.includes(item.id);
              const isSameProvinceDifferentLevel = optimisticIds.some(
                (oid) => {
                  const op = oid.split(":")[0];
                  const ip = item.id.split(":")[0];
                  return op === ip && oid !== item.id;
                },
              );
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={highlightIdx === idx}
                  className={
                    highlightIdx === idx
                      ? s.dropdownItemActive
                      : s.dropdownItem
                  }
                  onClick={() => addRegion(item)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                >
                  <MapPin size={14} className={s.dropdownItemIcon} aria-hidden="true" />
                  <span className={s.dropdownItemLabel}>{item.label}</span>
                  <span className={s.dropdownItemType}>
                    {item.type === "sido" ? "시·도" : "시·군·구"}
                  </span>
                  {isAlready && (
                    <span className={s.dropdownItemBadge}>선택됨</span>
                  )}
                  {!isAlready && isSameProvinceDifferentLevel && (
                    <span className={s.dropdownItemBadgeSwap}>변경</span>
                  )}
                </button>
              );
            })}
            {filteredResults.length === 0 && trimmedQuery && (
              <div className={s.dropdownEmpty}>
                &ldquo;{query}&rdquo; 검색 결과 없음
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- 슬롯 3개 ---- */}
      <div className={s.slots}>
        {slots.map((slot, i) => {
          if (!slot) {
            return (
              <button
                key={`empty-${i}`}
                type="button"
                className={s.slotEmpty}
                onClick={() => {
                  inputRef.current?.focus();
                  setIsFocused(true);
                }}
                aria-label={`${i + 1}번째 지역 추가`}
                disabled={isPending}
              >
                <Plus size={28} aria-hidden="true" />
                <span className={s.slotEmptyText}>지역 추가</span>
                <span className={s.slotEmptyIndex}>{i + 1}</span>
              </button>
            );
          }
          return (
            <div key={slot.id} className={s.slotFilled}>
              <button
                type="button"
                className={s.slotRemoveBtn}
                onClick={() => removeRegion(slot.id)}
                aria-label={`${slot.label} 해제`}
                disabled={isPending}
              >
                <X size={16} aria-hidden="true" />
              </button>
              <div className={s.slotPin}>
                <MapPin size={20} aria-hidden="true" />
              </div>
              <div className={s.slotProvince}>{slot.provinceShortName}</div>
              {slot.sigunguName && (
                <div className={s.slotSigungu}>{slot.sigunguName}</div>
              )}
              <div className={s.slotIndex}>{i + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
