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
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Clock, X, MessageSquarePlus, ArrowLeft, MapPin, FileText, Trash2, Loader2 } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { searchItems, POPULAR_TAGS, type SearchItem } from "@/lib/data/search-index";
import { POPULAR_KEYWORDS } from "./popular-keywords";
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
  /** 외부 오버레이 닫기 콜백 (SearchOverlay 연동용) */
  onClose?: () => void;
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

/** 검색어 없을 때(최근 검색 등) 사용하는 기본 섹션 순서 */
const DEFAULT_SECTION_ORDER: SearchItem["type"][] = ["region", "crop", "program", "education", "event", "guide"];

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

/** 최근 검색어 전체 삭제 */
function clearAllRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
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
    onClose: onCloseProp,
  },
  ref,
) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 네비게이션 직후 popstate sentinel cleanup이 router.push(startTransition)와
  // 경합하지 않도록 가드. router.push는 내부적으로 startTransition을 쓰기 때문에
  // pushState가 지연될 수 있어, 그 사이 cleanup의 history.back()이 네비게이션을
  // 취소시키는 현상이 있었음.
  const isNavigatingRef = useRef(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  // 네비게이션 중 오버레이를 유지하며 로딩 UI 노출
  const [isNavigating, setIsNavigating] = useState(false);
  const navStartPathRef = useRef<string | null>(null);

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
    setIsNavigating(false);
    setRecentSearches(loadRecent());
    inputRef.current?.blur();
    onCloseProp?.();
  }, [onCloseProp]);

  // 네비게이션 완료(pathname 변경) 시 오버레이 닫기
  useEffect(() => {
    if (!isNavigating) return;
    if (navStartPathRef.current === null) return;
    if (pathname !== navStartPathRef.current) {
      handleClose();
      navStartPathRef.current = null;
    }
  }, [pathname, isNavigating, handleClose]);

  // 네비게이션 시작 헬퍼 — 오버레이를 즉시 닫지 않고 로딩 상태로 전환
  // (onCloseProp는 pathname 변경 후 handleClose에서 호출 — 오버레이 언마운트로
  // 로딩 UI가 사라지지 않도록 유지)
  const beginNavigation = useCallback(() => {
    isNavigatingRef.current = true;
    navStartPathRef.current = pathname;
    setIsNavigating(true);
    // 키보드는 즉시 내림
    inputRef.current?.blur();
  }, [pathname]);

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
      // 네비게이션 중이면 sentinel 제거를 건너뛴다 — router.push의 pushState가
      // startTransition으로 지연되어 아직 state가 바뀌지 않았을 수 있음.
      // 이 때 history.back()을 호출하면 네비게이션이 취소됨.
      if (isNavigatingRef.current) return;
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

  // ----- Group results by type (관련도 기반 동적 섹션 순서) -----
  const grouped = useMemo(() => {
    // 결과 순서에서 섹션 순서 도출 — 가장 관련도 높은 타입이 먼저
    const seen = new Set<SearchItem["type"]>();
    const order: SearchItem["type"][] = [];
    for (const r of results) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        order.push(r.type);
      }
    }
    // 결과가 없으면 기본 순서 폴백
    const sectionOrder = order.length > 0 ? order : DEFAULT_SECTION_ORDER;

    return sectionOrder.reduce<
      { type: SearchItem["type"]; items: SearchItem[] }[]
    >((acc, type) => {
      const items = results.filter((r) => r.type === type);
      if (items.length > 0) acc.push({ type, items });
      return acc;
    }, []);
  }, [results]);

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

  // ----- Navigate to result (form submit 경로) -----
  const navigateTo = useCallback(
    (href: string, searchQuery?: string) => {
      if (searchQuery) {
        saveRecent(searchQuery);
        analytics.search(searchQuery);
      }
      beginNavigation();
      router.push(href);
    },
    [router, beginNavigation],
  );

  // ----- 확장 모드 "바로 탐색" Link 클릭 처리 -----
  const handleQuickNav = useCallback(() => {
    beginNavigation();
  }, [beginNavigation]);

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

  // ----- 최근 검색어 전체 삭제 -----
  const handleClearAllRecent = useCallback(() => {
    clearAllRecent();
    setRecentSearches([]);
  }, []);

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
      } else if (e.key === "Escape") {
        if (isExpanded) {
          handleClose();
        } else {
          setIsOpen(false);
          inputRef.current?.blur();
          onCloseProp?.();
        }
      }
      // Enter는 form onSubmit이 처리 — iOS 가상 키보드 Search 버튼과의 호환성 확보
    },
    [allItems.length, isExpanded, handleClose, onCloseProp],
  );

  // ----- Form submit: 드롭다운 선택 vs 통합검색 페이지 분기 -----
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < allItems.length) {
        const focused = allItems[focusedIndex];
        if (focused.type === "recent") handleRecentClick(focused.query);
        else navigateTo(focused.item.href, query);
      } else if (query.trim().length > 0) {
        navigateTo(`/search?q=${encodeURIComponent(query.trim())}`, query);
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

  // ----- Render -----
  const wrapClass = [
    size === "large" ? s.inputWrapLarge : s.inputWrap,
    autoFocus && !isExpanded ? s.inputWrapAutoFocus : "",
    isExpanded ? s.inputWrapExpanded : "",
  ].filter(Boolean).join(" ");

  const containerClass = `${s.container}${isExpanded ? ` ${s.containerExpanded}` : ""}`;

  const showDropdown =
    isNavigating ||
    isExpanded ||
    (isOpen && (showRecent || grouped.length > 0 || (query.trim().length > 0 && grouped.length === 0)));

  const dropdownClass = `${s.dropdown}${isExpanded ? ` ${s.dropdownExpanded}` : ""}`;

  return (
    <div className={containerClass} ref={containerRef}>
      <form className={wrapClass} onSubmit={handleSubmit} role="search">
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
          name="q"
          className={s.input}
          type="search"
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
      </form>

      {showDropdown && isNavigating && (
        <div
          className={dropdownClass}
          role="status"
          aria-live="polite"
        >
          <div className={s.navigatingWrap}>
            <Loader2 size={28} className={s.navigatingSpinner} aria-hidden="true" />
            <span className={s.navigatingText}>이동 중…</span>
          </div>
        </div>
      )}

      {showDropdown && !isNavigating && (
        <div
          id="search-listbox"
          className={dropdownClass}
          role="listbox"
          aria-label="검색 결과"
          aria-live="polite"
        >
          {/* 최근 검색어 */}
          {showRecent && (
            <div className={s.dropdownSection}>
              <div className={s.sectionLabelRow}>
                <div className={s.sectionLabel}>
                  <Clock size={12} className={s.sectionLabelIcon} />
                  최근 검색
                </div>
                {isExpanded && (
                  <button
                    type="button"
                    className={s.clearAllBtn}
                    onClick={handleClearAllRecent}
                  >
                    <Trash2 size={12} />
                    전체삭제
                  </button>
                )}
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

          {/* ── 확장 모드 검색 홈: 추천 검색어 + 바로 탐색 ── */}
          {isExpanded && query.trim().length === 0 && (
            <>
              {/* 추천 검색어 태그 */}
              <div className={s.expandedSection}>
                <div className={s.sectionLabel}>추천 검색어</div>
                <div className={s.tagGrid}>
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      className={s.tagChip}
                      onClick={() => handleRecentClick(tag.query)}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 인기 검색어 */}
              <div className={s.expandedSection}>
                <div className={s.sectionLabel}>인기 검색어</div>
                <div className={s.popularList}>
                  {POPULAR_KEYWORDS.map((kw, i) => {
                    const rank = i + 1;
                    const isTop = rank <= 3;
                    return (
                      <button
                        key={kw.label}
                        type="button"
                        className={s.popularItem}
                        onClick={() => handleRecentClick(kw.label)}
                      >
                        <span
                          className={`${s.popularRank}${isTop ? ` ${s.popularRankTop}` : ""}`}
                          aria-hidden="true"
                        >
                          {rank}
                        </span>
                        <span className={s.popularLabel}>{kw.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 바로 탐색 */}
              <div className={s.expandedSection}>
                <div className={s.sectionLabel}>바로 탐색</div>
                <div className={s.quickGrid}>
                  <Link href="/regions" className={s.quickItem} onClick={handleQuickNav}>
                    <MapPin size={16} />
                    <span>지역 비교</span>
                  </Link>
                  <Link href="/crops" className={s.quickItem} onClick={handleQuickNav}>
                    <Sprout size={16} />
                    <span>작물 정보</span>
                  </Link>
                  <Link href="/programs" className={s.quickItem} onClick={handleQuickNav}>
                    <FileText size={16} />
                    <span>지원사업</span>
                  </Link>
                  <Link href="/match" className={s.quickItem} onClick={handleQuickNav}>
                    <Search size={16} />
                    <span>유형 진단</span>
                  </Link>
                </div>
              </div>
            </>
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
                    <Link
                      key={itemId}
                      id={`search-item-${itemId}`}
                      href={item.href}
                      prefetch
                      className={`${s.resultItem} ${focusedIndex === currentFlatIndex ? s.resultItemFocused : ""}`}
                      role="option"
                      aria-selected={focusedIndex === currentFlatIndex}
                      onClick={() => {
                        if (query.trim()) {
                          saveRecent(query);
                          analytics.search(query);
                        }
                        beginNavigation();
                      }}
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
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* 전체 검색 결과 보기 링크 */}
          {grouped.length > 0 && query.trim().length > 0 && (
            <div className={s.dropdownFooter}>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                className={s.viewAllLink}
                role="option"
                aria-selected={false}
                onClick={() => {
                  saveRecent(query);
                  analytics.search(query);
                  beginNavigation();
                }}
              >
                <Search size={14} />
                &ldquo;{query}&rdquo; 전체 검색 결과 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
