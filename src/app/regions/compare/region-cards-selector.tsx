"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Search, Plus, X, MapPin, ChevronDown, Loader2 } from "lucide-react";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import s from "./region-cards-selector.module.css";

const MAX_SELECTION = 3;

interface SearchResult {
  id: string;
  type: "sido" | "sigungu";
  label: string;
  searchText: string;
  provinceShortName: string;
  sigunguName?: string;
}

interface Props {
  selectedRegionIds: string[];
}

/**
 * v2 prototype — `?v2=1` query 분기로 활성화.
 * - 상단 검색 input 1개 (시도+시군구 통합)
 * - 그 아래 3개 카드 그리드 — 카드 자체가 selector + viewer (이미지+select)
 */
export function RegionCardsSelector({ selectedRegionIds }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [optimisticIds, setOptimisticIds] = useState<string[]>(selectedRegionIds);

  // 2026-05-12 race fix v2:
  // v1(latestRef만)로는 빠른 연속 클릭 시 "click 1의 stale server props가 click 2 이후 도착"하면서
  // optimisticIds를 옛 값으로 리셋하는 사고가 남아 있었음. pendingTargetRef로 "마지막으로 push한 의도"를
  // 기록하고, 그 값과 일치하는 server props가 올 때까지 동기화를 보류한다.
  const latestRef = useRef<string[]>(selectedRegionIds);
  const pendingTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const incomingKey = selectedRegionIds.join(",");
    if (pendingTargetRef.current && pendingTargetRef.current !== incomingKey) {
      // 더 오래된 server props가 추월해서 도착 — 무시
      return;
    }
    pendingTargetRef.current = null;
    setOptimisticIds(selectedRegionIds);
    latestRef.current = selectedRegionIds;
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
    if (!trimmedQuery) return searchIndex.filter((r) => r.type === "sido");
    const lower = trimmedQuery.toLowerCase();
    return searchIndex
      .filter((r) => r.searchText.toLowerCase().includes(lower))
      .slice(0, 30);
  }, [searchIndex, trimmedQuery]);

  useEffect(() => {
    if (!isFocused) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!inputRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFocused]);

  useEffect(() => setHighlightIdx(0), [trimmedQuery]);

  const pushSelection = useCallback(
    (newIds: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("stations");
      params.delete("v2"); // 정식 라우트 promote — v2 query 정리
      if (newIds.length === 0) {
        params.delete("regions");
      } else {
        params.set("regions", newIds.join(","));
      }
      const qs = params.toString();
      // race fix v2: 의도한 최종 상태(newIds)를 pendingTargetRef로 기록.
      // server props가 이 값과 일치할 때까지 effect의 reset이 보류된다.
      latestRef.current = newIds;
      pendingTargetRef.current = newIds.join(",");
      setOptimisticIds(newIds);
      startTransition(() => {
        router.push(qs ? `/regions/compare?${qs}` : "/regions/compare");
      });
    },
    [searchParams, router],
  );

  const addRegion = useCallback(
    (id: string) => {
      const current = latestRef.current; // 최신 상태 기반 (race 회피)
      const provinceId = id.split(":")[0];
      const existingIdx = current.findIndex(
        (rid) => rid === provinceId || rid.startsWith(`${provinceId}:`),
      );
      if (existingIdx >= 0) {
        if (current[existingIdx] === id) return;
        const newIds = [...current];
        newIds[existingIdx] = id;
        pushSelection(newIds);
      } else if (current.length < MAX_SELECTION) {
        pushSelection([...current, id]);
      }
    },
    [pushSelection],
  );

  const removeSlot = useCallback(
    (id: string) => pushSelection(latestRef.current.filter((rid) => rid !== id)),
    [pushSelection],
  );

  const changeSlotSigungu = useCallback(
    (slotId: string, sigunguId: string | "") => {
      const current = latestRef.current;
      const provinceId = slotId.split(":")[0];
      const newId = sigunguId ? `${provinceId}:${sigunguId}` : provinceId;
      const idx = current.indexOf(slotId);
      if (idx < 0) return;
      const newIds = [...current];
      newIds[idx] = newId;
      pushSelection(newIds);
    },
    [pushSelection],
  );

  const clearAll = useCallback(() => pushSelection([]), [pushSelection]);

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
  const showDropdown = isFocused;

  const slots: (
    | {
        id: string;
        provinceId: string;
        provinceName: string;
        provinceShortName: string;
        sigunguId: string | null;
        sigunguName?: string;
      }
    | null
  )[] = [null, null, null];
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
      provinceName: province.name,
      provinceShortName: province.shortName,
      sigunguId: sigunguId ?? null,
      sigunguName: sigungu?.name,
    };
  });

  return (
    <div className={s.wrap}>
      {/* 상단 검색 */}
      <div className={s.searchRow}>
        <div className={s.searchWrap}>
          <Search size={18} className={s.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={reachedLimit ? "3곳 모두 골랐어요" : "지역명으로 검색해 보세요 (예: 전남, 순천시, 춘천)"}
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
              {!trimmedQuery && (
                <div className={s.dropdownHint}>시·도를 고르거나, 입력해서 시·군·구까지 찾아보세요</div>
              )}
              {filteredResults.map((item, idx) => {
                const isAlready = optimisticIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={highlightIdx === idx}
                    className={highlightIdx === idx ? s.dropdownItemActive : s.dropdownItem}
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
              {filteredResults.length === 0 && trimmedQuery && (
                <div className={s.dropdownEmpty}>&ldquo;{query}&rdquo; 검색 결과 없음</div>
              )}
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
          <span className={s.counter}>{optimisticIds.length}/{MAX_SELECTION}</span>
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

      {/* 3개 카드 그리드 */}
      <div className={s.cards}>
        {slots.map((slot, i) => {
          if (!slot) {
            return (
              <button
                key={`empty-${i}`}
                type="button"
                className={s.cardEmpty}
                onClick={() => {
                  inputRef.current?.focus();
                  setIsFocused(true);
                }}
                aria-label={`${i + 1}번째 슬롯에 지역 추가`}
                disabled={isPending}
              >
                <span className={s.cardIndex}>{i + 1}</span>
                <div className={s.cardEmptyIcon}>
                  <Plus size={36} aria-hidden="true" />
                </div>
                <span className={s.cardEmptyText}>지역 추가</span>
                <span className={s.cardEmptyHint}>검색하거나 카드를 눌러보세요</span>
              </button>
            );
          }
          const sigungus = sigungusByProvince.get(slot.provinceId) ?? [];
          return (
            <div key={slot.id} className={s.cardFilled}>
              <span className={s.cardIndex}>{i + 1}</span>
              <button
                type="button"
                className={s.cardRemoveBtn}
                onClick={() => removeSlot(slot.id)}
                aria-label={`${slot.provinceShortName} 해제`}
                disabled={isPending}
              >
                <X size={16} aria-hidden="true" />
              </button>
              <div className={s.cardImageWrap}>
                <Image
                  src={`/images/regions/${slot.provinceId}.png`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={s.cardImage}
                  priority={i === 0}
                />
              </div>
              <div className={s.cardBody}>
                <div className={s.cardProvinceTop}>
                  <MapPin size={14} aria-hidden="true" />
                  <span>{slot.provinceName}</span>
                </div>
                <div className={s.cardProvinceMain}>{slot.provinceShortName}</div>
                {sigungus.length > 0 && (
                  <div className={s.cardSelectWrap}>
                    <select
                      className={s.cardSelect}
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
                    <ChevronDown size={14} className={s.cardSelectIcon} aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
