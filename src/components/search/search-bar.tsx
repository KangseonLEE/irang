"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, X } from "lucide-react";
import { searchItems, type SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import s from "./search-bar.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchBarProps {
  placeholder?: string;
  /** 모바일(< 640px)에서만 사용할 짧은 placeholder */
  mobilePlaceholder?: string;
  size?: "default" | "large";
}

export interface SearchBarHandle {
  fillQuery: (q: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECENT_KEY = "irang-recent-searches";
const MAX_RECENT = 5;

const SECTION_META: Record<
  SearchItem["type"],
  { label: string; icon: string }
> = {
  region: { label: "지역", icon: "\u{1F4CD}" },
  crop: { label: "작물", icon: "\u{1F331}" },
  program: { label: "지원사업", icon: "\u{1F4CB}" },
  education: { label: "교육", icon: "\u{1F393}" },
  event: { label: "체험·행사", icon: "\u{1F389}" },
};

const SECTION_ORDER: SearchItem["type"][] = ["region", "crop", "program", "education", "event"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** localStorage에서 최근 검색어 불러오기 */
function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/** 최근 검색어 저장 (중복 제거, 최대 5개) */
function saveRecent(query: string) {
  try {
    const prev = loadRecent().filter((q) => q !== query);
    const next = [query, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

/** 최근 검색어 하나 삭제 */
function removeRecent(query: string) {
  try {
    const next = loadRecent().filter((q) => q !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

/** search-bar 전용 하이라이팅 래퍼 */
function highlight(text: string, query: string): React.ReactNode {
  return highlightMatch(text, query, s.highlight);
}

// ---------------------------------------------------------------------------
// Flat item type for keyboard navigation
// ---------------------------------------------------------------------------

type FlatItem =
  | { type: "recent"; id: string; query: string }
  | { type: "result"; id: string; item: SearchItem };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar(
  {
    placeholder = "지역, 작물, 지원사업 검색...",
    mobilePlaceholder,
    size = "default",
  },
  ref,
) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // 모바일 반응형 placeholder
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (!mobilePlaceholder) return;
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mobilePlaceholder]);

  const activePlaceholder = mobilePlaceholder && isMobile ? mobilePlaceholder : placeholder;

  // 마운트 시 최근 검색어 로드
  useEffect(() => {
    setRecentSearches(loadRecent());
  }, []);

  // ----- Imperative handle for SearchGroup -----
  useImperativeHandle(ref, () => ({
    fillQuery(q: string) {
      setQuery(q);
      const found = searchItems(q);
      setResults(found);
      setIsOpen(true);
      setFocusedIndex(-1);
      inputRef.current?.focus();
    },
  }));

  // ----- Group results by type -----
  const grouped = useMemo(
    () =>
      SECTION_ORDER.reduce<
        { type: SearchItem["type"]; items: SearchItem[] }[]
      >((acc, type) => {
        const items = results.filter((r) => r.type === type);
        if (items.length > 0) acc.push({ type, items });
        return acc;
      }, []),
    [results],
  );

  // 검색어가 비어있고 최근 검색이 있으면 최근 검색 표시
  const showRecent = query.trim().length === 0 && recentSearches.length > 0;

  // ----- Flatten all visible items for keyboard nav -----
  const allItems: FlatItem[] = useMemo(() => {
    if (showRecent) {
      return recentSearches.map((q, i) => ({
        type: "recent" as const,
        id: `recent-${i}`,
        query: q,
      }));
    }
    return grouped.flatMap((section) =>
      section.items.map((item) => ({
        type: "result" as const,
        id: `${item.type}-${item.id}`,
        item,
      })),
    );
  }, [showRecent, recentSearches, grouped]);

  // Reset focusedIndex when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [allItems.length]);

  // ----- Debounced search -----
  const handleChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      setResults([]);
      setIsOpen(true); // 빈 상태에서도 최근 검색어 표시
      return;
    }

    debounceRef.current = setTimeout(() => {
      const found = searchItems(value);
      setResults(found);
      setIsOpen(true);
    }, 200);
  }, []);

  // ----- Navigate to result -----
  const navigateTo = useCallback(
    (href: string, searchQuery?: string) => {
      if (searchQuery) saveRecent(searchQuery);
      setIsOpen(false);
      setQuery("");
      setResults([]);
      setFocusedIndex(-1);
      setRecentSearches(loadRecent());
      router.push(href);
    },
    [router],
  );

  // ----- 최근 검색어 클릭 → 검색 실행 -----
  const handleRecentClick = useCallback(
    (recentQuery: string) => {
      setQuery(recentQuery);
      const found = searchItems(recentQuery);
      setResults(found);
      setIsOpen(true);
      setFocusedIndex(-1);
    },
    [],
  );

  // ----- 최근 검색어 삭제 -----
  const handleRemoveRecent = useCallback((e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    removeRecent(q);
    setRecentSearches(loadRecent());
  }, []);

  // ----- Keyboard: ArrowDown / ArrowUp / Enter / Escape -----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allItems.length) {
          const focused = allItems[focusedIndex];
          if (focused.type === "recent") handleRecentClick(focused.query);
          else navigateTo(focused.item.href, query);
        } else if (query.trim().length > 0) {
          // 드롭다운에서 선택하지 않으면 통합검색 결과 페이지로 이동
          navigateTo(`/search?q=${encodeURIComponent(query.trim())}`, query);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [allItems, focusedIndex, navigateTo, query, handleRecentClick],
  );

  // ----- Click outside -----
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ----- Cleanup debounce on unmount -----
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ----- Compute active descendant id -----
  const activeDescendant =
    focusedIndex >= 0 && focusedIndex < allItems.length
      ? `search-item-${allItems[focusedIndex].id}`
      : undefined;

  // ----- Render helper: compute flat index for an item -----
  let flatCounter = 0;

  // ----- Render -----
  const wrapClass = size === "large" ? s.inputWrapLarge : s.inputWrap;

  return (
    <div className={s.container} ref={containerRef}>
      <div className={wrapClass}>
        <Search
          size={size === "large" ? 22 : 18}
          className={s.searchIcon}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          className={s.input}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={activePlaceholder}
          role="combobox"
          aria-label="통합 검색"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={activeDescendant}
          autoComplete="off"
        />
      </div>

      {isOpen && (
        <div
          id="search-listbox"
          className={s.dropdown}
          role="listbox"
          aria-label="검색 결과"
        >
          {/* 최근 검색어 */}
          {showRecent && (
            <div className={s.dropdownSection}>
              <div className={s.sectionLabel}>
                <Clock size={12} className={s.sectionLabelIcon} />
                최근 검색
              </div>
              {recentSearches.map((q, i) => {
                const itemId = `recent-${i}`;
                const currentFlatIndex = flatCounter++;
                return (
                  <div
                    key={`recent-${q}`}
                    id={`search-item-${itemId}`}
                    className={`${s.resultItem} ${focusedIndex === currentFlatIndex ? s.resultItemFocused : ""}`}
                    role="option"
                    aria-selected={focusedIndex === currentFlatIndex}
                    onClick={() => handleRecentClick(q)}
                  >
                    <span className={s.recentIcon} aria-hidden="true">
                      <Clock size={14} />
                    </span>
                    <div className={s.resultItemContent}>
                      <div className={s.resultItemTitle}>{q}</div>
                    </div>
                    <button
                      type="button"
                      className={s.removeRecent}
                      onClick={(e) => handleRemoveRecent(e, q)}
                      aria-label={`"${q}" 최근 검색 삭제`}
                      tabIndex={-1}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 검색 결과 */}
          {!showRecent && grouped.length === 0 && query.trim().length > 0 && (
            <p className={s.noResult}>
              &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다
            </p>
          )}

          {grouped.map((section) => {
            const meta = SECTION_META[section.type];
            return (
              <div key={section.type} className={s.dropdownSection}>
                <div className={s.sectionLabel}>
                  {meta.icon} {meta.label}
                </div>
                {section.items.map((item) => {
                  const itemId = `${item.type}-${item.id}`;
                  const currentFlatIndex = flatCounter++;
                  return (
                    <div
                      key={itemId}
                      id={`search-item-${itemId}`}
                      className={`${s.resultItem} ${focusedIndex === currentFlatIndex ? s.resultItemFocused : ""}`}
                      role="option"
                      aria-selected={focusedIndex === currentFlatIndex}
                      onClick={() => navigateTo(item.href, query)}
                    >
                      <span className={s.resultItemIcon} aria-hidden="true">
                        {item.icon}
                      </span>
                      <div className={s.resultItemContent}>
                        <div className={s.resultItemTitle}>
                          {highlight(item.title, query)}
                        </div>
                        <div className={s.resultItemSubtitle}>
                          {highlight(item.subtitle, query)}
                        </div>
                      </div>
                      {item.badge && (
                        <span className={s.resultBadge}>{item.badge}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* 전체 검색 결과 보기 링크 */}
          {grouped.length > 0 && query.trim().length > 0 && (
            <div className={s.dropdownFooter}>
              <div
                className={s.viewAllLink}
                role="option"
                aria-selected={false}
                onClick={() =>
                  navigateTo(
                    `/search?q=${encodeURIComponent(query.trim())}`,
                    query
                  )
                }
              >
                <Search size={14} />
                &ldquo;{query}&rdquo; 전체 검색 결과 보기
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
