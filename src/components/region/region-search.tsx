"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, Loader2, ChevronRight } from "lucide-react";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { useActiveOptionScroll } from "@/lib/hooks/use-active-option-scroll";
import {
  normalizeRegionQuery,
  searchRegions,
  type RegionSearchEntry,
} from "@/lib/region-search-index";
import s from "./region-search.module.css";

/** 이 컴포넌트가 다루는 항목 — 공용 인덱스 엔트리에서 이동에 필요한 필드만 */
type SearchResult = Pick<RegionSearchEntry, "href" | "type" | "label">;

/**
 * 지역 탐색 검색창 — 지도 대신 검색으로 시·군·구까지 바로 이동 (2026-09-02 회장 지시).
 * - 입력 없음: 시·도 → 시·군·구 2단 트리 탐색 (좌 시·도, 우 해당 시·군·구 + 전체 보기)
 *   탭/하이라이트 = 펼침, 이동은 우측 패널에서 — hover 없는 터치와 데스크탑 동작 통일.
 *   키보드: ↑↓ 이동 · →/← 패널 전환 · Enter 이동(시·도 패널에선 시·도 페이지).
 * - 입력 시: 시·도 + 시·군·구 평면 검색 (compare 셀렉터와 동일 매칭)
 * useSearchParams 미사용 — Suspense bailout 없음 (2026-06-01 lessons).
 */
export function RegionSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [sidoIdx, setSidoIdx] = useState(0);
  const [sigunguIdx, setSigunguIdx] = useState(0);
  const [pane, setPane] = useState<"sido" | "sigungu">("sido");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidoListRef = useRef<HTMLDivElement>(null);
  const sigunguListRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = normalizeRegionQuery(query);
  const isTree = trimmedQuery.length === 0;

  const filteredResults = useMemo<SearchResult[]>(
    () => searchRegions(trimmedQuery),
    [trimmedQuery],
  );

  /** 트리 우측 패널: 선택 시·도 전체 보기 + 시·군·구 목록 */
  const subItems = useMemo<SearchResult[]>(() => {
    const p = PROVINCES[sidoIdx];
    if (!p) return [];
    const items: SearchResult[] = [
      {
        href: `/regions/${p.id}`,
        type: "sido",
        label: `${p.shortName} 전체 보기`,
      },
    ];
    for (const sg of SIGUNGUS) {
      if (sg.sidoId !== p.id) continue;
      items.push({
        href: `/regions/${p.id}/${sg.id}`,
        type: "sigungu",
        label: sg.name,
      });
    }
    return items;
  }, [sidoIdx]);

  const showDropdown = isFocused && (isTree || trimmedQuery.length > 0);

  useActiveOptionScroll(dropdownRef, highlightIdx, showDropdown && !isTree);
  useActiveOptionScroll(sidoListRef, sidoIdx, showDropdown && isTree);
  useActiveOptionScroll(
    sigunguListRef,
    sigunguIdx,
    showDropdown && isTree && pane === "sigungu",
  );

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

  const goTo = useCallback(
    (item: SearchResult) => {
      setQuery(item.label);
      setIsFocused(false);
      inputRef.current?.blur();
      startTransition(() => {
        router.push(item.href);
      });
    },
    [router],
  );

  const expandSido = useCallback((idx: number) => {
    setSidoIdx(idx);
    setSigunguIdx(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        return;
      }
      if (!showDropdown) return;

      if (!isTree) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightIdx((idx) =>
            Math.min(idx + 1, filteredResults.length - 1),
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightIdx((idx) => Math.max(idx - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          const target = filteredResults[highlightIdx];
          if (target) goTo(target);
        }
        return;
      }

      // ── 트리 모드 키보드 ──
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (pane === "sido") {
          expandSido(Math.min(sidoIdx + 1, PROVINCES.length - 1));
        } else {
          setSigunguIdx((idx) => Math.min(idx + 1, subItems.length - 1));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (pane === "sido") {
          expandSido(Math.max(sidoIdx - 1, 0));
        } else {
          setSigunguIdx((idx) => Math.max(idx - 1, 0));
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPane("sigungu");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPane("sido");
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (pane === "sido") {
          const p = PROVINCES[sidoIdx];
          if (p)
            goTo({ href: `/regions/${p.id}`, type: "sido", label: p.shortName });
        } else {
          const target = subItems[sigunguIdx];
          if (target) goTo(target);
        }
      }
    },
    [
      showDropdown,
      isTree,
      pane,
      sidoIdx,
      sigunguIdx,
      subItems,
      filteredResults,
      highlightIdx,
      goTo,
      expandSido,
    ],
  );

  return (
    <div className={s.searchWrap}>
      <Search size={18} className={s.searchIcon} aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightIdx(0);
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder="지역명으로 바로 찾기 (예: 강원, 영주시, 순천)"
        className={s.searchInput}
        role="combobox"
        aria-label="지역 검색"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls="region-search-listbox"
      />
      {isPending ? (
        <Loader2 size={16} className={s.spinner} aria-hidden="true" />
      ) : (
        query && (
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
        )
      )}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="region-search-listbox"
          className={s.dropdown}
          role={isTree ? undefined : "listbox"}
        >
          {isTree ? (
            <>
              <div className={s.dropdownHint}>
                시·도를 고르거나, 입력해서 시·군·구까지 찾아보세요
              </div>
              <div className={s.treePanes}>
                <div
                  ref={sidoListRef}
                  className={s.pane}
                  role="listbox"
                  aria-label="시·도"
                >
                  {PROVINCES.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={sidoIdx === idx}
                      className={
                        sidoIdx === idx ? s.treeItemActive : s.treeItem
                      }
                      onClick={() => {
                        expandSido(idx);
                        setPane("sigungu");
                      }}
                      onMouseEnter={() => expandSido(idx)}
                    >
                      <span className={s.treeItemLabel}>{p.shortName}</span>
                      <ChevronRight
                        size={14}
                        className={s.treeItemChevron}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <div
                  ref={sigunguListRef}
                  className={s.pane}
                  role="listbox"
                  aria-label={`${PROVINCES[sidoIdx]?.shortName ?? ""} 시·군·구`}
                >
                  {subItems.map((item, idx) => (
                    <button
                      key={item.href}
                      type="button"
                      role="option"
                      aria-selected={pane === "sigungu" && sigunguIdx === idx}
                      className={[
                        pane === "sigungu" && sigunguIdx === idx
                          ? s.treeItemActive
                          : s.treeItem,
                        idx === 0 ? s.treeItemAll : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => goTo(item)}
                      onMouseEnter={() => {
                        setPane("sigungu");
                        setSigunguIdx(idx);
                      }}
                    >
                      <span className={s.treeItemLabel}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {filteredResults.map((item, idx) => (
                <button
                  key={item.href}
                  type="button"
                  role="option"
                  aria-selected={highlightIdx === idx}
                  className={
                    highlightIdx === idx ? s.dropdownItemActive : s.dropdownItem
                  }
                  onClick={() => goTo(item)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                >
                  <MapPin
                    size={14}
                    className={s.dropdownItemIcon}
                    aria-hidden="true"
                  />
                  <span className={s.dropdownItemLabel}>{item.label}</span>
                  <span className={s.dropdownItemType}>
                    {item.type === "sido" ? "시·도" : "시·군·구"}
                  </span>
                </button>
              ))}
              {filteredResults.length === 0 && (
                <div className={s.dropdownEmpty}>
                  &ldquo;{query}&rdquo; 검색 결과 없음
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
