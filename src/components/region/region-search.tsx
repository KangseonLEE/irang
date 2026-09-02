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
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import s from "./region-search.module.css";

interface SearchResult {
  /** 이동 경로 (예: "/regions/gyeongbuk/yeongju") */
  href: string;
  type: "sido" | "sigungu";
  label: string;
  /** 공백 제거·소문자 매칭용 (compare 셀렉터와 동일 패턴) */
  searchText: string;
}

/**
 * 지역 탐색 검색창 — 지도 대신 검색으로 시·군·구까지 바로 이동 (2026-09-02 회장 지시).
 * /regions/compare 셀렉터의 검색 UX를 따르되, 다중 선택 대신 상세 페이지로 push.
 * useSearchParams 미사용 — Suspense bailout 없음 (2026-06-01 lessons).
 */
export function RegionSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchIndex = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];
    for (const p of PROVINCES) {
      items.push({
        href: `/regions/${p.id}`,
        type: "sido",
        label: p.shortName,
        searchText: `${p.name}${p.shortName}`.replace(/\s/g, ""),
      });
    }
    for (const sg of SIGUNGUS) {
      const province = PROVINCES.find((p) => p.id === sg.sidoId);
      if (!province) continue;
      items.push({
        href: `/regions/${sg.sidoId}/${sg.id}`,
        type: "sigungu",
        label: `${province.shortName} ${sg.name}`,
        searchText: `${province.name}${province.shortName}${sg.name}${sg.shortName}`.replace(
          /\s/g,
          "",
        ),
      });
    }
    return items;
  }, []);

  const trimmedQuery = query.trim().replace(/\s/g, "");

  const filteredResults = useMemo<SearchResult[]>(() => {
    if (!trimmedQuery) return searchIndex.filter((r) => r.type === "sido");
    return searchIndex
      .filter((r) =>
        r.searchText.toLowerCase().includes(trimmedQuery.toLowerCase()),
      )
      .slice(0, 30);
  }, [searchIndex, trimmedQuery]);

  const showDropdown =
    isFocused && (filteredResults.length > 0 || trimmedQuery.length > 0);

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        return;
      }
      if (!showDropdown) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((idx) => Math.min(idx + 1, filteredResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((idx) => Math.max(idx - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = filteredResults[highlightIdx];
        if (target) goTo(target);
      }
    },
    [showDropdown, filteredResults, highlightIdx, goTo],
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
          role="listbox"
        >
          {!trimmedQuery && (
            <div className={s.dropdownHint}>
              시·도를 고르거나, 입력해서 시·군·구까지 찾아보세요
            </div>
          )}
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
          {filteredResults.length === 0 && trimmedQuery && (
            <div className={s.dropdownEmpty}>
              &ldquo;{query}&rdquo; 검색 결과 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
}
