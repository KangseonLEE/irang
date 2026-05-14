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
import { Search, Plus, X, Sprout, Loader2 } from "lucide-react";
import type { CropInfo } from "@/lib/data/crops";
import { getCropImageSrc } from "@/lib/crop-image";
import s from "./crop-selector.module.css";

const MAX_SELECTION = 4;

interface CropSelectorProps {
  crops: CropInfo[];
  selectedIds: string[];
}

const CATEGORY_ORDER: CropInfo["category"][] = ["식량", "채소", "과수", "특용"];

interface SearchResult {
  id: string;
  name: string;
  category: CropInfo["category"];
  difficulty: CropInfo["difficulty"];
  emoji: string;
  searchText: string;
}

/**
 * v2 패턴 (regions/compare promote 이후 통일).
 * - 검색 input 1개
 * - dropdown 안에 카테고리 그룹 헤더 + 카드 grid (모바일 1열, 데스크탑 2열)
 * - 선택된 작물은 dropdown 위 카드 carousel/grid (X 버튼으로 해제)
 * - searchParams `ids` 유지
 * - 최대 4개 선택
 * - race fix v2 (latestRef + pendingTargetRef)
 */
export function CropSelector({ crops, selectedIds }: CropSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [swapMessage, setSwapMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [optimisticIds, setOptimisticIds] = useState<string[]>(selectedIds);

  // race fix v2 (regions/compare 패턴 이식):
  // 빠른 연속 클릭 시 stale server props로 optimistic 리셋 방지.
  // pendingTargetRef는 "마지막으로 push한 의도"를 기록하고, 그 값과 일치하는
  // server props가 도착할 때까지 effect의 reset을 보류한다.
  const latestRef = useRef<string[]>(selectedIds);
  const pendingTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const incomingKey = selectedIds.join(",");
    if (pendingTargetRef.current && pendingTargetRef.current !== incomingKey) {
      // 더 오래된 server props가 추월해서 도착 — 무시
      return;
    }
    pendingTargetRef.current = null;
    setOptimisticIds(selectedIds);
    latestRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const cropById = useMemo(() => {
    const map = new Map<string, CropInfo>();
    for (const c of crops) map.set(c.id, c);
    return map;
  }, [crops]);

  const searchIndex = useMemo<SearchResult[]>(() => {
    return crops.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      difficulty: c.difficulty,
      emoji: c.emoji,
      searchText: `${c.name}${c.description}${c.category}`.replace(/\s/g, ""),
    }));
  }, [crops]);

  const trimmedQuery = query.trim().replace(/\s/g, "");
  const filteredResults = useMemo<SearchResult[]>(() => {
    if (!trimmedQuery) return searchIndex;
    const lower = trimmedQuery.toLowerCase();
    return searchIndex.filter((r) => r.searchText.toLowerCase().includes(lower));
  }, [searchIndex, trimmedQuery]);

  const groupedResults = useMemo(() => {
    const groups = new Map<CropInfo["category"], SearchResult[]>();
    for (const cat of CATEGORY_ORDER) groups.set(cat, []);
    for (const item of filteredResults) {
      const arr = groups.get(item.category);
      if (arr) arr.push(item);
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: groups.get(cat) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [filteredResults]);

  // dropdown highlight: query 변경 시 onChange 핸들러에서 직접 reset
  // (set-state-in-effect 회피 — regions/compare 패턴)

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

  const showSwapFeedback = useCallback((replacedName: string, newName: string) => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setSwapMessage(
      `최대 ${MAX_SELECTION}개까지 골랐어요. "${replacedName}" 대신 "${newName}"(으)로 바꿨어요.`,
    );
    messageTimerRef.current = setTimeout(() => setSwapMessage(""), 3000);
  }, []);

  const pushSelection = useCallback(
    (newIds: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newIds.length === 0) {
        params.delete("ids");
      } else {
        params.set("ids", newIds.join(","));
      }
      const qs = params.toString();
      latestRef.current = newIds;
      pendingTargetRef.current = newIds.join(",");
      setOptimisticIds(newIds);
      startTransition(() => {
        router.push(qs ? `/crops/compare?${qs}` : "/crops/compare");
      });
    },
    [searchParams, router],
  );

  const addCrop = useCallback(
    (cropId: string) => {
      const current = latestRef.current;
      if (current.includes(cropId)) return;
      if (current.length >= MAX_SELECTION) {
        const replacedId = current[0];
        const replacedCrop = cropById.get(replacedId);
        const newCrop = cropById.get(cropId);
        const newIds = [...current.slice(1), cropId];
        if (replacedCrop && newCrop) {
          showSwapFeedback(replacedCrop.name, newCrop.name);
        }
        pushSelection(newIds);
      } else {
        pushSelection([...current, cropId]);
      }
    },
    [cropById, pushSelection, showSwapFeedback],
  );

  const removeCrop = useCallback(
    (cropId: string) => {
      const next = latestRef.current.filter((id) => id !== cropId);
      // 0개까지 비울 수 있음 (2026-05-14 정책 변경)
      pushSelection(next);
    },
    [pushSelection],
  );

  const clearAll = useCallback(() => {
    if (latestRef.current.length === 0) return;
    pushSelection([]);
  }, [pushSelection]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isFocused || filteredResults.length === 0) return;
      const idx = filteredResults.findIndex((r) => r.id === highlightId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = filteredResults[Math.min(idx + 1, filteredResults.length - 1)];
        if (next) setHighlightId(next.id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = filteredResults[Math.max(idx - 1, 0)];
        if (prev) setHighlightId(prev.id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = filteredResults[idx >= 0 ? idx : 0];
        if (target) {
          addCrop(target.id);
          setQuery("");
          setIsFocused(false);
          inputRef.current?.blur();
        }
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isFocused, filteredResults, highlightId, addCrop],
  );

  const reachedLimit = optimisticIds.length >= MAX_SELECTION;
  const showDropdown = isFocused;

  const selectedCrops = optimisticIds
    .map((id) => cropById.get(id))
    .filter((c): c is CropInfo => c != null);

  return (
    <div className={s.wrap} role="group" aria-label="비교할 작물 선택">
      {/* 상단 검색 + 메타 */}
      <div className={s.searchRow}>
        <div className={s.searchWrap}>
          <Search size={18} className={s.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              // filteredResults가 query에 따라 즉시 재계산되므로
              // highlight를 첫 항목으로 동기화 (set-state-in-effect 회피)
              const trimmed = next.trim().replace(/\s/g, "").toLowerCase();
              const nextResults = trimmed
                ? searchIndex.filter((r) =>
                    r.searchText.toLowerCase().includes(trimmed),
                  )
                : searchIndex;
              setHighlightId(nextResults.length > 0 ? nextResults[0].id : null);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (!highlightId && filteredResults.length > 0) {
                setHighlightId(filteredResults[0].id);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              reachedLimit
                ? `${MAX_SELECTION}개 모두 골랐어요`
                : "작물명, 설명으로 검색해 보세요 (예: 딸기, 고소득)"
            }
            className={s.searchInput}
            role="combobox"
            aria-label="작물 검색"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="crop-selector-dropdown"
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
            <div
              ref={dropdownRef}
              className={s.dropdown}
              role="listbox"
              id="crop-selector-dropdown"
            >
              {!trimmedQuery && (
                <div className={s.dropdownHint}>
                  카테고리별로 살펴보거나, 입력해서 찾아보세요
                </div>
              )}
              {groupedResults.map((group) => (
                <div key={group.category} className={s.dropdownGroup}>
                  <div className={s.dropdownGroupLabel}>{group.category}</div>
                  <div className={s.dropdownGrid}>
                    {group.items.map((item) => {
                      const isAlready = optimisticIds.includes(item.id);
                      const isHighlighted = highlightId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isHighlighted}
                          className={
                            isHighlighted ? s.dropdownCardActive : s.dropdownCard
                          }
                          onClick={() => {
                            addCrop(item.id);
                            setQuery("");
                            setIsFocused(false);
                            inputRef.current?.blur();
                          }}
                          onMouseEnter={() => setHighlightId(item.id)}
                          disabled={isAlready}
                        >
                          <span className={s.dropdownCardEmoji} aria-hidden="true">
                            {item.emoji}
                          </span>
                          <span className={s.dropdownCardBody}>
                            <span className={s.dropdownCardName}>{item.name}</span>
                            <span className={s.dropdownCardMeta}>
                              난이도 {item.difficulty}
                            </span>
                          </span>
                          {isAlready && (
                            <span className={s.dropdownCardBadge}>선택됨</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {groupedResults.length === 0 && trimmedQuery && (
                <div className={s.dropdownEmpty}>
                  &ldquo;{query}&rdquo; 검색 결과 없음
                </div>
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

      {/* swap 피드백 (시각 + 스크린리더) */}
      <div aria-live="polite" aria-atomic="true" className={s.srOnly}>
        {swapMessage}
      </div>
      {swapMessage && <p className={s.swapMessage}>{swapMessage}</p>}

      {/* 선택된 작물 카드 grid */}
      <div className={s.cards}>
        {selectedCrops.map((crop, i) => (
          <div key={crop.id} className={s.cardFilled}>
            <span className={s.cardIndex}>{i + 1}</span>
            <button
              type="button"
              className={s.cardRemoveBtn}
              onClick={() => removeCrop(crop.id)}
              aria-label={`${crop.name} 해제`}
              disabled={isPending}
            >
              <X size={16} aria-hidden="true" />
            </button>
            <div className={s.cardImageWrap}>
              <Image
                src={getCropImageSrc(crop.id)}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={s.cardImage}
                priority={i === 0}
              />
            </div>
            <div className={s.cardBody}>
              <div className={s.cardCategoryRow}>
                <Sprout size={14} aria-hidden="true" />
                <span>{crop.category}</span>
              </div>
              <div className={s.cardName}>
                <span className={s.cardEmoji} aria-hidden="true">
                  {crop.emoji}
                </span>
                {crop.name}
              </div>
              <div className={s.cardDifficulty}>난이도 {crop.difficulty}</div>
            </div>
          </div>
        ))}

        {selectedCrops.length < MAX_SELECTION && (
          <button
            type="button"
            className={s.cardEmpty}
            onClick={() => {
              inputRef.current?.focus();
              setIsFocused(true);
            }}
            aria-label="작물 추가"
            disabled={isPending}
          >
            <span className={s.cardIndex}>{selectedCrops.length + 1}</span>
            <div className={s.cardEmptyIcon}>
              <Plus size={32} aria-hidden="true" />
            </div>
            <span className={s.cardEmptyText}>작물 추가</span>
            <span className={s.cardEmptyHint}>검색하거나 카드를 눌러보세요</span>
          </button>
        )}
      </div>
    </div>
  );
}
