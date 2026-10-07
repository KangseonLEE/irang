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
import { Search, Plus, X, Sprout, Loader2, Pencil, Check } from "lucide-react";
import type { CropInfo } from "@/lib/data/crops";
import { CROP_CATEGORY_NAMES } from "@/lib/data/crop-categories";
import { getCropImageSrc } from "@/lib/crop-image";
import { isComposingEvent, pickOnEnter, rankByName } from "@/lib/ime";
import { withJosa } from "@/lib/format";
import s from "./crop-selector.module.css";

const MAX_SELECTION = 4;

/**
 * selector 에 필요한 최소 필드만 — emoji 같은 표시 외 필드는 props 직렬화에서 제외.
 * (RSC payload 에 불필요한 데이터 노출 방지)
 */
export type CropSelectorItem = Pick<
  CropInfo,
  "id" | "name" | "category" | "difficulty" | "description"
>;

interface CropSelectorProps {
  crops: CropSelectorItem[];
  selectedIds: string[];
}

const CATEGORY_ORDER: readonly CropInfo["category"][] = CROP_CATEGORY_NAMES;

interface SearchResult {
  id: string;
  name: string;
  category: CropInfo["category"];
  difficulty: CropInfo["difficulty"];
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
  /** ↑↓로 하이라이트를 직접 옮겼는가 — 옮겼으면 Enter 는 이름 완전 일치보다 그 항목을 고른다
   *  ("배" 입력 후 ↓로 "배추"를 골라도 완전 일치 "배"가 추가되던 것 방지) */
  const navigatedRef = useRef(false);

  const [optimisticIds, setOptimisticIds] = useState<string[]>(selectedIds);
  // compact 모드: 2개 이상 선택 완료 시 카드 4슬롯을 칩 strip 으로 접어 결과까지 스크롤 단축.
  // 사용자가 "편집"을 누르면 펼침. 0~1개(미완)일 땐 항상 펼쳐 추가 유도.
  const [editing, setEditing] = useState(false);

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
    const map = new Map<string, CropSelectorItem>();
    for (const c of crops) map.set(c.id, c);
    return map;
  }, [crops]);

  const searchIndex = useMemo<SearchResult[]>(() => {
    return crops.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      difficulty: c.difficulty,
      searchText: `${c.name}${c.description}${c.category}`.replace(/\s/g, ""),
    }));
  }, [crops]);

  const trimmedQuery = query.trim().replace(/\s/g, "");
  // 이름 우선 랭킹(9/7): 부분 입력에서 설명문만 맞는 항목이 앞에 오지 않게
  const filteredResults = useMemo<SearchResult[]>(() => {
    if (!trimmedQuery) return searchIndex;
    return rankByName(searchIndex, trimmedQuery, (r) => r.name, (r) => `${r.category}${r.searchText}`).map((r) => r.item);
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
    // "(으)로" 를 그대로 노출하지 않는다 — 따옴표 뒤 조사는 이름 끝 글자에 맞춘다 (10/6 QA1)
    const toJosa = withJosa(newName, "으로").slice(newName.length);
    setSwapMessage(
      `최대 ${MAX_SELECTION}개까지 골랐어요. "${replacedName}" 대신 "${newName}"${toJosa} 바꿨어요.`,
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
      // Tab 으로 검색창을 벗어나면 목록을 닫는다 — 열린 채로 남으면 다음 포커스("작물 추가" 등)를
      // 덮었다 (10/6 QA1 Q3-🟡8). 기본 동작(포커스 이동)은 그대로 둔다.
      if (e.key === "Tab") {
        setIsFocused(false);
        return;
      }
      if (!isFocused || filteredResults.length === 0) return;
      const idx = filteredResults.findIndex((r) => r.id === highlightId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigatedRef.current = true;
        const next = filteredResults[Math.min(idx + 1, filteredResults.length - 1)];
        if (next) setHighlightId(next.id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigatedRef.current = true;
        const prev = filteredResults[Math.max(idx - 1, 0)];
        if (prev) setHighlightId(prev.id);
      } else if (e.key === "Enter") {
        if (isComposingEvent(e)) return; // 한글 조합 확정 Enter 무시 (9/7)
        e.preventDefault();
        const highlighted = filteredResults[idx >= 0 ? idx : 0];
        const target = navigatedRef.current
          ? highlighted
          : pickOnEnter(
              rankByName(filteredResults, trimmedQuery, (r) => r.name, (r) => `${r.category}${r.searchText}`),
              highlighted,
            );
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
    [isFocused, filteredResults, highlightId, addCrop, trimmedQuery],
  );

  /** 포커스가 검색 영역 밖으로 나가면 닫기 — 마우스 바깥 클릭은 mousedown 핸들러가 맡는다.
   *  relatedTarget 이 없으면(Safari 버튼 클릭은 포커스를 옮기지 않는다) 여기서 닫지 않는다:
   *  닫으면 옵션 버튼이 click 전에 사라져 선택이 먹히지 않는다. */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) setIsFocused(false);
  }, []);

  const reachedLimit = optimisticIds.length >= MAX_SELECTION;
  const showDropdown = isFocused;

  const selectedCrops = optimisticIds
    .map((id) => cropById.get(id))
    .filter((c): c is CropInfo => c != null);

  // 2개 이상 선택 완료 + 편집 모드 아님 → compact 칩 strip
  const collapsed = selectedCrops.length >= 2 && !editing;

  return (
    <div className={s.wrap} role="group" aria-label="비교할 작물 선택">
      {/* 상단 검색 + 메타 */}
      <div className={s.searchRow}>
        <div className={s.searchWrap} onBlur={handleBlur}>
          <Search size={18} className={s.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              navigatedRef.current = false;
              // filteredResults가 query에 따라 즉시 재계산되므로
              // highlight를 첫 항목으로 동기화 (set-state-in-effect 회피).
              // 목록과 같은 이름 우선 랭킹으로 — 단순 포함 검색의 첫 항목은 설명문만 맞는 작물일 수 있다
              const trimmed = next.trim().replace(/\s/g, "");
              const nextResults = trimmed
                ? rankByName(searchIndex, trimmed, (r) => r.name, (r) => `${r.category}${r.searchText}`).map((r) => r.item)
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
            // 키보드 하이라이트를 보조기기에 알린다 (10/6 QA2 F6)
            aria-activedescendant={
              showDropdown && highlightId && filteredResults.some((r) => r.id === highlightId)
                ? `crop-selector-opt-${highlightId}`
                : undefined
            }
            disabled={reachedLimit}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                navigatedRef.current = false;
                setHighlightId(searchIndex[0]?.id ?? null);
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
                          id={`crop-selector-opt-${item.id}`}
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
                          <span className={s.dropdownCardThumb}>
                            <Image
                              src={getCropImageSrc(item.id)}
                              alt=""
                              width={32}
                              height={32}
                              className={s.dropdownCardThumbImg}
                            />
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

      {/* compact 칩 strip (2개 이상 선택 완료 시) */}
      {collapsed && (
        <div className={s.compactRow}>
          <ul className={s.chips}>
            {selectedCrops.map((crop) => (
              <li key={crop.id} className={s.chip}>
                <Image
                  src={getCropImageSrc(crop.id)}
                  alt=""
                  width={22}
                  height={22}
                  className={s.chipImg}
                />
                <span className={s.chipName}>{crop.name}</span>
                <button
                  type="button"
                  className={s.chipRemoveBtn}
                  onClick={() => removeCrop(crop.id)}
                  aria-label={`${crop.name} 해제`}
                  disabled={isPending}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={s.editBtn}
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} aria-hidden="true" />
            편집
          </button>
        </div>
      )}

      {/* 선택된 작물 카드 grid (미완 또는 편집 모드) */}
      {!collapsed && (
        <>
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
              <div className={s.cardName}>{crop.name}</div>
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

      {/* 편집 중 + 2개 이상 → 접기 버튼 */}
      {editing && selectedCrops.length >= 2 && (
        <button
          type="button"
          className={s.doneBtn}
          onClick={() => setEditing(false)}
          disabled={isPending}
        >
          <Check size={15} aria-hidden="true" />
          편집 완료
        </button>
      )}
        </>
      )}
    </div>
  );
}
