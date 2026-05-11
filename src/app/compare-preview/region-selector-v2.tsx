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
import { X, Search, Plus, MapPin, Loader2, ChevronDown } from "lucide-react";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import s from "./region-selector-v2.module.css";

const MAX_SELECTION = 3;

interface SearchResult {
  id: string;
  type: "sido" | "sigungu";
  label: string;
  searchText: string;
  provinceShortName: string;
  sigunguName?: string;
}

interface RegionSelectorV2Props {
  selectedRegionIds: string[];
}

/**
 * 2026-05-12 Preview UI:
 * - 상단 검색 input + 17개 시·도 chip 그리드 병행
 * - 슬롯 3개 (가로 분할) — 빈 슬롯은 + placeholder, 채워진 슬롯은 시도 + 시군구 select
 * - 슬롯 안의 select로 시군구 정제. 시도 단위(전체)로 돌릴 수도 있음.
 */
export function RegionSelectorV2({ selectedRegionIds }: RegionSelectorV2Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [optimisticIds, setOptimisticIds] = useState<string[]>(selectedRegionIds);
  useEffect(() => {
    setOptimisticIds(selectedRegionIds);
  }, [selectedRegionIds]);

  const sigungusByProvince = useMemo(() => {
    const map = new Map<string, typeof SIGUNGUS>();
    for (const sg of SIGUNGUS) {
      const arr = map.get(sg.sidoId) ?? [];
      arr.push(sg);
      map.set(sg.sidoId, arr);
    }
    return map;
  }, []);

  // 검색 인덱스 — 시도 17개 + 시군구 229개
  const searchIndex = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];
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
  const filteredResults = useMemo<SearchResult[]>(() => {
    if (!trimmedQuery) return [];
    const lower = trimmedQuery.toLowerCase();
    return searchIndex
      .filter((r) => r.searchText.toLowerCase().includes(lower))
      .slice(0, 20);
  }, [searchIndex, trimmedQuery]);

  // dropdown 외부 클릭 닫기
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
        router.push(qs ? `/compare-preview?${qs}` : "/compare-preview");
      });
    },
    [searchParams, router],
  );

  /** 시도 단위로 토글 (chip 그리드 + 검색 결과 공용) */
  const addRegion = useCallback(
    (id: string) => {
      const provinceId = id.split(":")[0];
      const existingIdx = optimisticIds.findIndex(
        (rid) => rid === provinceId || rid.startsWith(`${provinceId}:`),
      );
      if (existingIdx >= 0) {
        // 이미 선택 → 입력값으로 swap (시군구 → 시도 등)
        if (optimisticIds[existingIdx] === id) return; // 같은 것 무시
        const newIds = [...optimisticIds];
        newIds[existingIdx] = id;
        pushSelection(newIds);
      } else if (optimisticIds.length < MAX_SELECTION) {
        pushSelection([...optimisticIds, id]);
      }
    },
    [optimisticIds, pushSelection],
  );

  const removeSlot = useCallback(
    (id: string) => {
      pushSelection(optimisticIds.filter((rid) => rid !== id));
    },
    [optimisticIds, pushSelection],
  );

  /** 슬롯 내 시군구 변경 — provinceId에 sigungu drilldown 또는 전체로 복귀 */
  const changeSlotSigungu = useCallback(
    (slotId: string, sigunguId: string | "") => {
      const provinceId = slotId.split(":")[0];
      const newId = sigunguId ? `${provinceId}:${sigunguId}` : provinceId;
      const idx = optimisticIds.indexOf(slotId);
      if (idx < 0) return;
      const newIds = [...optimisticIds];
      newIds[idx] = newId;
      pushSelection(newIds);
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
        if (target) {
          addRegion(target.id);
          setQuery("");
          setIsFocused(false);
          inputRef.current?.blur();
        }
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isFocused, filteredResults, highlightIdx, addRegion],
  );

  const reachedLimit = optimisticIds.length >= MAX_SELECTION;
  const showDropdown = isFocused && filteredResults.length > 0;

  // 슬롯 데이터 — 3개 (selected display 또는 null placeholder)
  const slots: ({ id: string; provinceId: string; provinceShortName: string; sigunguId: string | null; sigunguName?: string } | null)[] = [
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
    slots[i] = {
      id,
      provinceId,
      provinceShortName: province.shortName,
      sigunguId: sigunguId ?? null,
      sigunguName: sigungu?.name,
    };
  });

  return (
    <div className={s.card} role="group" aria-label="비교할 지역 선택">
      {/* ---- 검색 + 헤더 메타 ---- */}
      <div className={s.topRow}>
        <div className={s.searchWrap}>
          <Search size={18} className={s.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="지역명으로 빠르게 찾기 (예: 순천시, 춘천)"
            className={s.searchInput}
            aria-label="지역 검색"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            disabled={reachedLimit}
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
          {showDropdown && (
            <div ref={dropdownRef} className={s.dropdown} role="listbox">
              {filteredResults.map((item, idx) => {
                const isAlready = optimisticIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={highlightIdx === idx}
                    className={
                      highlightIdx === idx ? s.dropdownItemActive : s.dropdownItem
                    }
                    onClick={() => {
                      addRegion(item.id);
                      setQuery("");
                      setIsFocused(false);
                      inputRef.current?.blur();
                    }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    <MapPin size={14} className={s.dropdownItemIcon} aria-hidden="true" />
                    <span className={s.dropdownItemLabel}>{item.label}</span>
                    <span className={s.dropdownItemType}>
                      {item.type === "sido" ? "시·도" : "시·군·구"}
                    </span>
                    {isAlready && <span className={s.dropdownItemBadge}>선택됨</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className={s.metaRight}>
          {isPending && (
            <span className={s.loadingHint} aria-live="polite">
              <Loader2 size={14} className={s.spinner} aria-hidden="true" />
              불러오는 중
            </span>
          )}
          <span className={s.counter}>
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
      </div>

      {/* ---- 시·도 chip 그리드 (17개 — 큰 지역 빠른 선택용) ---- */}
      <div className={s.sidoSection}>
        <div className={s.sectionLabel}>큰 지역에서 빠르게 고르기</div>
        <div className={s.sidoGrid}>
          {PROVINCES.map((p) => {
            const isSelected = optimisticIds.some(
              (id) => id === p.id || id.startsWith(`${p.id}:`),
            );
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => addRegion(p.id)}
                className={isSelected ? s.sidoChipSelected : s.sidoChip}
                aria-pressed={isSelected}
                disabled={!isSelected && reachedLimit}
              >
                {p.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 슬롯 3개 ---- */}
      <div className={s.slotsSection}>
        <div className={s.sectionLabel}>비교 슬롯 (최대 3곳)</div>
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
                  aria-label={`${i + 1}번째 슬롯에 지역 추가`}
                  disabled={isPending}
                >
                  <div className={s.slotEmptyIcon}>
                    <Plus size={28} aria-hidden="true" />
                  </div>
                  <span className={s.slotEmptyText}>지역 추가</span>
                  <span className={s.slotIndexBadge}>{i + 1}</span>
                </button>
              );
            }
            const sigungus = sigungusByProvince.get(slot.provinceId) ?? [];
            return (
              <div key={slot.id} className={s.slotFilled}>
                <span className={s.slotIndexBadge}>{i + 1}</span>
                <button
                  type="button"
                  className={s.slotRemoveBtn}
                  onClick={() => removeSlot(slot.id)}
                  aria-label={`${slot.provinceShortName} 해제`}
                  disabled={isPending}
                >
                  <X size={16} aria-hidden="true" />
                </button>
                <div className={s.slotPin}>
                  <MapPin size={20} aria-hidden="true" />
                </div>
                <div className={s.slotProvince}>{slot.provinceShortName}</div>
                {sigungus.length > 0 && (
                  <div className={s.slotSelectWrap}>
                    <select
                      className={s.slotSelect}
                      value={slot.sigunguId ?? ""}
                      onChange={(e) => changeSlotSigungu(slot.id, e.target.value)}
                      aria-label={`${slot.provinceShortName} 시·군·구 선택`}
                      disabled={isPending}
                    >
                      <option value="">전체 (시·도 단위)</option>
                      {sigungus.map((sg) => (
                        <option key={sg.id} value={sg.id}>
                          {sg.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className={s.slotSelectIcon} aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
