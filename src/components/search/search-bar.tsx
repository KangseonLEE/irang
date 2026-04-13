"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Clock, X, MessageSquarePlus, ArrowLeft } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { searchItems, type SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import { analytics } from "@/lib/analytics";
import s from "./search-bar.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchBarProps {
  placeholder?: string;
  /** 모바일(< 640px)에서만 사용할 짧은 placeholder */
  mobilePlaceholder?: string;
  size?: "default" | "large";
  /** 마운트 시 자동 포커스 (검색 페이지 진입 시 등) */
  autoFocus?: boolean;
  /** 모바일에서 포커스 시 풀스크린 오버레이로 확장 (키보드 유지) */
  mobileExpand?: boolean;
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
  guide: { label: "가이드·정보", icon: "\u{1F4D6}" },
};

const SECTION_ORDER: SearchItem["type"][] = ["region", "crop", "program", "education", "event", "guide"];

/** SSR-safe useLayoutEffect — 서버에서는 useEffect 폴백 (SSR 경고 방지) */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
    autoFocus = false,
    mobileExpand,
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

  // 모바일 반응형 감지 (placeholder 전환 + 풀스크린 확장 모두에 사용)
  const [isMobile, setIsMobile] = useState(false);
  const needsMobileDetect = !!(mobilePlaceholder || mobileExpand);
  // useLayoutEffect: 브라우저 페인트 전에 실행 → placeholder 깜빡임 방지
  // (SSR에서는 useEffect 폴백으로 경고 없이 동작)
  useIsomorphicLayoutEffect(() => {
    if (!needsMobileDetect) return;
    const mql = window.matchMedia("(max-width: 639px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [needsMobileDetect]);

  const activePlaceholder = mobilePlaceholder && isMobile ? mobilePlaceholder : placeholder;

  // ── 모바일 풀스크린 확장 ──
  // 핵심 원리: 유저가 실제 input을 탭 → 키보드가 자연스럽게 열림 (user activation)
  // → 페이지 이동 대신 같은 input을 유지한 채 컨테이너만 풀스크린으로 확장
  // → DOM에서 input이 제거되지 않으므로 키보드가 닫히지 않음
  const isExpanded = !!(mobileExpand && isMobile && isOpen);

  // 풀스크린 확장 시 body 스크롤 잠금
  useEffect(() => {
    if (!isExpanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded]);

  // 풀스크린 닫기
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setFocusedIndex(-1);
    setRecentSearches(loadRecent());
    inputRef.current?.blur();
  }, []);

  // 풀스크린 확장 시 Android 뒤로가기(하드웨어) / 브라우저 뒤로가기 지원
  // history에 sentinel state를 push하고, popstate로 닫기 처리
  useEffect(() => {
    if (!isExpanded) return;
    const sentinel = { __searchExpanded: true };
    window.history.pushState(sentinel, "");
    const onPopState = () => {
      handleClose();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // 컴포넌트 언마운트나 isExpanded가 false로 바뀔 때 sentinel 제거
      if (
        window.history.state &&
        (window.history.state as Record<string, unknown>).__searchExpanded
      ) {
        window.history.back();
      }
    };
  }, [isExpanded, handleClose]);

  // 마운트 시 최근 검색어 로드
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentSearches(loadRecent());
  }, []);

  // autoFocus: 마운트 시 입력란에 포커스 + 드롭다운 오픈
  useEffect(() => {
    if (!autoFocus) return;
    let mounted = true;
    const tryFocus = () => {
      if (!mounted) return;
      inputRef.current?.focus({ preventScroll: true });
    };
    tryFocus();
    const t1 = setTimeout(tryFocus, 100);
    const t2 = setTimeout(tryFocus, 300);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(true);
    return () => { mounted = false; clearTimeout(t1); clearTimeout(t2); };
  }, [autoFocus]);

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

  // id → flat index 사전 매핑 (렌더 시 mutable counter 사용 방지)
  const flatIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    allItems.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [allItems]);

  // Reset focusedIndex when results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      if (searchQuery) {
        saveRecent(searchQuery);
        analytics.search(searchQuery);
      }
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
        if (isExpanded) {
          handleClose();
        } else {
          setIsOpen(false);
          inputRef.current?.blur();
        }
      }
    },
    [allItems, focusedIndex, navigateTo, query, handleRecentClick, isExpanded, handleClose],
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

  // ----- Render -----
  const wrapClass = [
    size === "large" ? s.inputWrapLarge : s.inputWrap,
    autoFocus && !isExpanded ? s.inputWrapAutoFocus : "",
    isExpanded ? s.inputWrapExpanded : "",
  ].filter(Boolean).join(" ");

  const containerClass = `${s.container}${isExpanded ? ` ${s.containerExpanded}` : ""}`;

  const showDropdown =
    isExpanded ||
    (isOpen && (showRecent || grouped.length > 0 || (query.trim().length > 0 && grouped.length === 0)));

  const dropdownClass = `${s.dropdown}${isExpanded ? ` ${s.dropdownExpanded}` : ""}`;

  return (
    <div className={containerClass} ref={containerRef}>
      <div className={wrapClass}>
        {isExpanded ? (
          <button
            type="button"
            className={s.expandedBack}
            onClick={handleClose}
            aria-label="검색 닫기"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <Search
            size={size === "large" ? 22 : 18}
            className={s.searchIcon}
            aria-hidden="true"
          />
        )}
        <input
          ref={inputRef}
          className={s.input}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            // iOS Safari: 가상 키보드 등장 시 브라우저가 input을 뷰포트 중앙으로
            // scroll-into-view하면서 페이지가 밀리는 현상 방지.
            // mobileExpand 모드에서도 fixed 레이아웃 적용(React re-render) 전에
            // 브라우저의 scrollIntoView가 먼저 실행되므로 항상 방지 필요.
            const y = window.scrollY;
            requestAnimationFrame(() => {
              window.scrollTo({ top: y });
            });
          }}
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
        {isExpanded && query.length > 0 && (
          <button
            type="button"
            className={s.expandedClear}
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="search-listbox"
          className={dropdownClass}
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
                const currentFlatIndex = flatIndexMap.get(itemId) ?? -1;
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

          {/* 확장 모드 빈 상태 — 최근 검색 없고 검색어도 없을 때 */}
          {isExpanded && !showRecent && query.trim().length === 0 && (
            <div className={s.expandedEmpty}>
              <Search size={24} className={s.expandedEmptyIcon} />
              <p className={s.expandedEmptyText}>검색어를 입력하세요</p>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {!showRecent && grouped.length === 0 && query.trim().length > 0 && (
            <div className={s.noResult}>
              <p className={s.noResultText}>
                &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다
              </p>
              <a
                href="https://tally.so/r/9qv8lp"
                target="_blank"
                rel="noopener noreferrer"
                className={s.requestLink}
              >
                <MessageSquarePlus size={14} />
                정보 추가 요청하기
              </a>
            </div>
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
                  const currentFlatIndex = flatIndexMap.get(itemId) ?? -1;
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
