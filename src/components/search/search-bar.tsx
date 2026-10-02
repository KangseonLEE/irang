"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, X, ArrowLeft, MapPin, FileText, Loader2, Compass, GraduationCap, ArrowUpLeft, Trash2 } from "lucide-react";
// ArrowUpLeft: 자동완성 우상단 화살표 (네이버 패턴 — 클릭 시 입력창 채움)
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { getQuerySuggestions, searchAll } from "@/lib/data/search-index";
import { RECOMMENDED_KEYWORDS } from "@/lib/data/popular-keywords";
import { highlightMatch } from "@/lib/highlight-match";
import { analytics } from "@/lib/analytics";
import { logSearch } from "@/lib/supabase";
import { RequestButton } from "@/components/feedback/request-modal";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import { useActiveOptionScroll } from "@/lib/hooks/use-active-option-scroll";
import { PLAN_STEPS } from "@/lib/data/plan";
import { SEARCH_FAQS } from "@/lib/data/search-faq";

// 검색 홈에서 노출할 FAQ — 큐레이션된 5건 (자주 들어오는 질문 위주).
// 답: 첫 5개 표준 FAQ — 5단계 로드맵·비용·적합도·생활비·작물 추천.
const FEATURED_FAQ_INDICES = [0, 2, 4, 5, 6] as const;

import { isComposingEvent } from "@/lib/ime";
import { useDialog } from "@/components/ui/confirm-dialog";
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
  /** 디바이스 무관 — 포커스 시 항상 풀페이지로 확장 (히어로/헤더 상시 검색용) */
  alwaysExpand?: boolean;
  /**
   * 검색어가 비어있을 때 추천/인기/바로탐색 섹션을 노출.
   * 모바일 풀스크린 확장과 무관하게(데스크탑 오버레이에서도) 사용하기 위한 스위치.
   */
  richMode?: boolean;
  /** 외부 오버레이 닫기 콜백 (SearchOverlay 연동용) */
  onClose?: () => void;
  /** 읽기 전용 표시 모드 — 시각적으로만 렌더링하고 포커스/인터랙션 비활성화 */
  readOnlyDisplay?: boolean;
  /**
   * 제안 목록을 절대 배치 대신 **흐름 배치**로 (2026-09-29 통합검색 모달).
   * 모달 패널은 overflow: hidden 이라 absolute 드롭다운이 잘린다 — 흐름에 두면 모달 본문이 함께 스크롤된다.
   */
  inlineDropdown?: boolean;
  /**
   * 헤더 검색 패널 배치 (2026-10-02 회장 — 기후금융포털식 위에서 내려오는 패널).
   * 제안 목록은 흐름 배치 + 상시 노출(바깥 클릭으로 접지 않는다 — 패널이 열림/닫힘을 맡는다),
   * 빈 입력이면 추천 검색어 칩 → 최근 검색·바로 탐색 / 단계별 가이드 / 자주 묻는 질문 열(列) 배치,
   * 검색 버튼은 입력 오른쪽.
   */
  panelLayout?: boolean;
}

interface SearchBarHandle {
  fillQuery: (q: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECENT_KEY = "irang-recent-searches";
const MAX_RECENT = 10;

/** SSR-safe useLayoutEffect — 서버에서는 useEffect 폴백 (SSR 경고 방지) */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ---------------------------------------------------------------------------
// Helpers — 최근 검색어 (날짜 포함, 최대 10개)
// ---------------------------------------------------------------------------

interface RecentItem {
  query: string;
  date: string; // YYYY.MM.DD
}

/** 오늘 날짜를 YYYY.MM.DD 형식으로 */
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** localStorage에서 최근 검색어 불러오기 (구버전 string[] → 자동 마이그레이션) */
function loadRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 구버전(string[]) → 새 형식(RecentItem[]) 마이그레이션
    return parsed.slice(0, MAX_RECENT).map((item: string | RecentItem) =>
      typeof item === "string" ? { query: item, date: "" } : item,
    );
  } catch {
    return [];
  }
}

/** 최근 검색어 저장 (중복 제거, 최대 10개, 날짜 포함) */
function saveRecent(query: string) {
  try {
    const prev = loadRecent().filter((r) => r.query !== query);
    const next: RecentItem[] = [{ query, date: todayStr() }, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

/** 최근 검색어 하나 삭제 */
function removeRecent(query: string) {
  try {
    const next = loadRecent().filter((r) => r.query !== query);
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
//
// Phase 1C (2026-05-15): 네이버 스타일 텍스트 리스트로 단순화.
// 입력 후 dropdown 본문은 string[] 자동완성만 노출 (풍부 카드 제거).
// 풍부 카드는 /search 결과 페이지에서만 사용 (result-card.tsx).

type FlatItem =
  | { type: "suggestion"; id: string; query: string }
  | { type: "recent"; id: string; query: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar(
  {
    placeholder = "지역, 작물, 교육, 비용 검색...",
    mobilePlaceholder,
    size = "default",
    autoFocus = false,
    mobileExpand,
    alwaysExpand = false,
    richMode = false,
    onClose: onCloseProp,
    readOnlyDisplay = false,
    inlineDropdown = false,
    panelLayout = false,
  },
  ref,
) {
  const { confirm } = useDialog();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 같은 페이지 내 query 변경(/search?q=A → /search?q=B) 감지를 위해 search string 포함
  const locationKey = `${pathname}?${searchParams.toString()}`;
  const containerRef = useRef<HTMLDivElement>(null);
  /* 리스트박스·옵션 id — 인스턴스마다 고유(/search 검색 바와 오버레이가 동시에 떠도 aria-activedescendant 가 섞이지 않게) */
  const idBase = useId();
  const listboxId = `${idBase}-listbox`;
  const optionId = (itemId: string) => `${idBase}-opt-${itemId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 네비게이션 직후 popstate sentinel cleanup이 router.push(startTransition)와
  // 경합하지 않도록 가드. router.push는 내부적으로 startTransition을 쓰기 때문에
  // pushState가 지연될 수 있어, 그 사이 cleanup의 history.back()이 네비게이션을
  // 취소시키는 현상이 있었음.
  const isNavigatingRef = useRef(false);
  // 안전망 timeout — navigation 5초 내 cleanup 안 되면 강제 해제
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentItem[]>([]);
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
  const isExpanded = !!(((mobileExpand && isMobile) || alwaysExpand) && isOpen);
  /** 풀스크린 확장 또는 richMode일 때 추천/인기/바로탐색 노출 */
  const showRich = isExpanded || richMode;

  // 풀스크린 확장 시 body 스크롤 잠금 — iOS Safari 호환(position: fixed 패턴).
  useBodyScrollLock(isExpanded);

  // 풀스크린 닫기
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSuggestions([]);
    setFocusedIndex(-1);
    setIsNavigating(false);
    isNavigatingRef.current = false;
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
    setRecentSearches(loadRecent());
    inputRef.current?.blur();
    onCloseProp?.();
  }, [onCloseProp]);

  // 네비게이션 완료(URL 변경) 시 오버레이 닫기.
  // pathname만 비교하면 같은 페이지 내 query 변경(/search?q=A → /search?q=B)을
  // 감지 못 해 isNavigating이 stuck. searchParams까지 포함한 locationKey 비교.
  useEffect(() => {
    if (!isNavigating) return;
    if (navStartPathRef.current === null) return;
    if (locationKey !== navStartPathRef.current) {
      // URL 변경에 반응하여 오버레이 상태를 외부(URL)와 동기화
      handleClose();
      navStartPathRef.current = null;
    }
  }, [locationKey, isNavigating, handleClose]);

  // 네비게이션 시작 헬퍼 — 오버레이를 즉시 닫지 않고 로딩 상태로 전환
  // (onCloseProp는 URL 변경 후 handleClose에서 호출 — 오버레이 언마운트로
  // 로딩 UI가 사라지지 않도록 유지)
  const beginNavigation = useCallback(() => {
    isNavigatingRef.current = true;
    navStartPathRef.current = locationKey;
    setIsNavigating(true);
    // 키보드는 즉시 내림
    inputRef.current?.blur();
    // 안전망: 5초 내 URL 변경 cleanup이 안 발생하면 강제 해제.
    // router.push 실패/취소·동일 URL 재push·React transition pending 등 어떤 사유로든
    // stuck되는 것을 방지.
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
      setIsNavigating(false);
      navStartPathRef.current = null;
      navTimeoutRef.current = null;
    }, 5000);
  }, [locationKey]);

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

  // bfcache 복원 시 네비게이팅 상태 리셋 — 뒤로가기 후 로딩 스피너 무한회전 방지
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && isNavigatingRef.current) {
        isNavigatingRef.current = false;
        setIsNavigating(false);
        navStartPathRef.current = null;
        if (navTimeoutRef.current) {
          clearTimeout(navTimeoutRef.current);
          navTimeoutRef.current = null;
        }
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // sentinel이 history에 잔존하면 정리 — 뒤로가기 시 중복 sentinel 방지
  useEffect(() => {
    if (
      !isExpanded &&
      !isNavigating &&
      window.history.state?.__searchExpanded
    ) {
      window.history.replaceState(null, "");
    }
  }, [isExpanded, isNavigating]);

  // 마운트 시 최근 검색어 로드
  useEffect(() => {
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
    setIsOpen(true);
    return () => { mounted = false; clearTimeout(t1); clearTimeout(t2); };
  }, [autoFocus]);

  // ── 모바일 풀스크린 확장 시 dropdown 스크롤 → input.blur (키보드 자동 닫힘) ──
  // 회장 요청 (2026-05-14): 검색 안 하고 스크롤만 내릴 때 키보드가 자연스럽게 닫혀야 함.
  // - body는 useBodyScrollLock으로 잠겨있어 window scroll listener 무용 →
  //   실제 스크롤 컨테이너인 dropdownRef에 listener 부착.
  // - threshold 40px: 작은 스와이프나 iOS scroll-into-view false trigger 회피.
  //   (iOS Safari의 가상 키보드 등장 시 dropdown 높이 변동으로 ~10~30px 자동 스크롤
  //    발생할 수 있어 그보다 큰 값 필요)
  // - blur 후 listener 유지 + input focus 시 startScrollTop reset → 사용자가
  //   재포커스해도 동일 동작 보장 (5/25 회장 라이브 발견 fix).
  // - isExpanded === true (모바일 풀스크린 활성)일 때만 동작 — 데스크탑은 영향 0.
  useEffect(() => {
    if (!isExpanded) return;
    const dropdown = dropdownRef.current;
    const input = inputRef.current;
    if (!dropdown || !input) return;

    const THRESHOLD_PX = 40;
    // 5/16 회장 보고: 재open 시 dropdown DOM이 같은 인스턴스로 유지되어 이전
    // scroll position 잔존. 부착 시점 capture 방식은 첫 진입만 정상 동작.
    // 첫 scroll 이벤트 시점 capture로 변경 — 사용자가 어떤 scroll 위치에서 시작하든
    // 항상 그 기준점에서 40px 이동 시 blur 트리거.
    let startScrollTop: number | null = null;

    // 5/25 회장 라이브: 첫 진입 blur 후 사용자가 input 다시 탭하면 listener가 이미
    // 제거되어 재스크롤 시 키패드가 안 사라짐. listener 제거 패턴 폐기 + focus 이벤트로
    // 기준점만 reset.
    const resetCapture = () => {
      startScrollTop = null;
    };

    const onScroll = () => {
      if (startScrollTop === null) {
        startScrollTop = dropdown.scrollTop;
        return;
      }
      if (Math.abs(dropdown.scrollTop - startScrollTop) >= THRESHOLD_PX) {
        if (document.activeElement === input) {
          input.blur();
        }
        // listener 유지 — 다음 포커스+스크롤 사이클에서도 동작해야 함.
        // 동일 스크롤 흐름에서 중복 blur 시도 방지를 위해 기준점만 reset.
        startScrollTop = null;
      }
    };

    dropdown.addEventListener("scroll", onScroll, { passive: true });
    input.addEventListener("focus", resetCapture);
    return () => {
      dropdown.removeEventListener("scroll", onScroll);
      input.removeEventListener("focus", resetCapture);
    };
  }, [isExpanded]);

  // ----- Imperative handle for SearchGroup -----
  // SearchTags 등 외부 트리거로 쿼리를 채울 때 사용. 사용자가 명시적으로 키워드를
  // 선택한 시점이므로 search_logs 적재.
  useImperativeHandle(ref, () => ({
    fillQuery(q: string) {
      setQuery(q);
      const sugg = getQuerySuggestions(q);
      setSuggestions(sugg);
      // 결과 페이지 매칭 건수는 풍부 검색(searchAll) 기준으로 적재
      const matched = searchAll(q).length;
      setIsOpen(true);
      setFocusedIndex(-1);
      inputRef.current?.focus();
      logSearch(q, matched);
    },
  }));

  // 검색어가 비어있고 최근 검색이 있으면 최근 검색 표시
  const showRecent = query.trim().length === 0 && recentSearches.length > 0;

  // ----- Flatten all visible items for keyboard nav -----
  const allItems: FlatItem[] = useMemo(() => {
    if (showRecent) {
      return recentSearches.map((r, i) => ({
        type: "recent" as const,
        id: `recent-${i}`,
        query: r.query,
      }));
    }
    return suggestions.map((sq, i) => ({
      type: "suggestion" as const,
      id: `suggestion-${i}`,
      query: sq,
    }));
  }, [showRecent, recentSearches, suggestions]);

  // id → flat index 사전 매핑 (렌더 시 mutable counter 사용 방지)
  const flatIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    allItems.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [allItems]);

  // Reset focusedIndex when the query or result count changes (9/29 QA: 같은 건수면 직전 하이라이트가 남아 배추→고구마 결)
  useEffect(() => {
    setFocusedIndex(-1);
  }, [query, allItems.length]);

  // ----- Debounced suggestions -----
  // Phase 1C: dropdown은 네이버 스타일 텍스트 자동완성만 노출.
  // 풍부 카드(섹션·서브타이틀·배지)는 /search?q= 결과 페이지에서만 사용.
  const handleChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(true); // 빈 상태에서도 최근 검색어/인기 검색어 노출
      return;
    }

    debounceRef.current = setTimeout(() => {
      setSuggestions(getQuerySuggestions(value));
      setIsOpen(true);
    }, 150);
  }, []);

  // ----- Navigate to /search (자동완성·최근·인기 클릭 공통) -----
  const navigateToSearch = useCallback(
    (term: string) => {
      const q = term.trim();
      if (q.length === 0) return;
      saveRecent(q);
      analytics.search(q);
      // 자동완성·최근·인기 클릭은 /search 페이지로 이동 → /search useEffect가 logSearch 1회 호출.
      // (중복 적재 방지를 위해 여기서는 logSearch 미호출)
      beginNavigation();
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [router, beginNavigation],
  );

  // ----- 우상단 화살표 — 검색 실행하지 않고 입력창에 텍스트만 채움 (네이버 패턴) -----
  const fillInputWithSuggestion = useCallback(
    (e: React.MouseEvent, term: string) => {
      e.preventDefault();
      e.stopPropagation();
      setQuery(term);
      setSuggestions(getQuerySuggestions(term));
      setFocusedIndex(-1);
      inputRef.current?.focus();
    },
    [],
  );

  // ----- 확장 모드 "바로 탐색" Link 클릭 처리 -----
  const handleQuickNav = useCallback(() => {
    beginNavigation();
  }, [beginNavigation]);

  // ----- 최근 검색어 전체 삭제 (공용 확인 다이얼로그 — window.confirm 금지, 9/29) -----
  const handleClearAllRecent = useCallback(async () => {
    const ok = await confirm({
      title: "최근 검색어를 모두 지울까요?",
      description: "이 기기에 저장된 검색 기록만 지워져요.",
      confirmLabel: "모두 지우기",
      tone: "danger",
      icon: Trash2,
    });
    if (!ok) return;
    clearAllRecent();
    setRecentSearches([]);
  }, [confirm]);

  // ----- 최근 검색어 삭제 -----
  const handleRemoveRecent = useCallback((e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    removeRecent(q);
    setRecentSearches(loadRecent());
  }, []);

  // ----- Keyboard: ArrowDown / ArrowUp / Enter / Escape -----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isComposingEvent(e)) {
        // 한글 조합 확정 Enter 가 form submit 으로 새지 않게 — 부분 검색어("배")로 /search 이동하던 결함 (9/7)
        e.preventDefault();
        return;
      }
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

  // ----- Form submit: 자동완성 선택 vs 통합검색 페이지 분기 -----
  // Phase 1C: dropdown 본문은 텍스트 자동완성만 노출 → Enter는 항상 /search?q= 이동.
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < allItems.length) {
        const focused = allItems[focusedIndex];
        navigateToSearch(focused.query);
      } else if (query.trim().length > 0) {
        navigateToSearch(query);
      }
    },
    [allItems, focusedIndex, navigateToSearch, query],
  );

  // ----- Click outside -----
  // 외부 클릭 시 dropdown + 네비게이션 로딩 overlay 모두 정리.
  // (네비게이션 로딩이 stuck된 경우 사용자가 다른 영역 클릭으로 빠져나갈 수 있어야 함)
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      /* 확인 다이얼로그(포털)는 DOM 상 바깥이지만 사용자에겐 이 드롭다운의 연장 — 닫지 않는다 */
      if ((e.target as Element | null)?.closest?.("[data-irang-dialog]")) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
          setIsNavigating(false);
          navStartPathRef.current = null;
          if (navTimeoutRef.current) {
            clearTimeout(navTimeoutRef.current);
            navTimeoutRef.current = null;
          }
        }
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ----- Cleanup debounce + nav timeout on unmount -----
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  // ----- Compute active descendant id -----
  const activeDescendant =
    focusedIndex >= 0 && focusedIndex < allItems.length
      ? optionId(allItems[focusedIndex].id)
      : undefined;

  // 키보드 하이라이트를 드롭다운 스크롤 시야 안으로 (readOnly 얼리 리턴보다 위 — hooks 규칙)
  useActiveOptionScroll(dropdownRef, focusedIndex, focusedIndex >= 0);

  // ── 읽기 전용 표시 모드: 시각적 껍데기만 렌더링 ──
  if (readOnlyDisplay) {
    const wrapCls = size === "large" ? s.inputWrapLarge : s.inputWrap;
    return (
      <div className={s.container}>
        <div className={`${wrapCls} ${s.inputWrapReadOnly}`} style={{ pointerEvents: "none" }}>
          <Search
            size={size === "large" ? 22 : 18}
            className={s.searchIcon}
            aria-hidden="true"
          />
          <span style={{ color: "var(--muted-foreground)", fontSize: "inherit", lineHeight: "var(--lh-normal)" }}>
            {placeholder}
          </span>
        </div>
      </div>
    );
  }

  // ----- Render -----
  const wrapClass = [
    size === "large" ? s.inputWrapLarge : s.inputWrap,
    autoFocus && !isExpanded && !panelLayout ? s.inputWrapAutoFocus : "",
    isExpanded ? s.inputWrapExpanded : "",
    panelLayout ? s.inputWrapPanel : "",
  ].filter(Boolean).join(" ");

  const containerClass = `${s.container}${isExpanded ? ` ${s.containerExpanded}` : ""}`;

  const showDropdown =
    isNavigating ||
    isExpanded ||
    panelLayout ||
    (isOpen &&
      (richMode ||
        showRecent ||
        suggestions.length > 0 ||
        query.trim().length > 0));

  const isEmptyQuery = query.trim().length === 0;
  const hasSuggestions = suggestions.length > 0 && !isEmptyQuery;
  /* 옵션 묶음(role=listbox)이 지금 화면에 있는가 — 입력창 aria-expanded·aria-controls 의 단일 기준.
     빈 입력이면 최근 검색, 입력 중이면 자동완성만 리스트박스다. 추천 검색어·바로 탐색·가이드·FAQ 는 버튼·링크라
     리스트박스 밖에 둔다(10/2 QA C-Y3 axe critical: listbox 안 버튼·링크 26개, option 0개). */
  const listboxVisible = showDropdown && !isNavigating && (isEmptyQuery ? showRecent : hasSuggestions);

  const dropdownClass = `${s.dropdown}${isExpanded ? ` ${s.dropdownExpanded}` : ""}${
    inlineDropdown ? ` ${s.dropdownInline}` : ""
  }${panelLayout ? ` ${s.dropdownPanel}` : ""}${showRich && isEmptyQuery ? ` ${s.dropdownRich}` : ""}`;

  // ── 빈 입력 화면의 섹션들 — 모달·오버레이(세로 스택)와 헤더 패널(열 배치)이 같은 조각을 쓴다 ──

  /* 최근 검색어 */
  const recentSection = showRecent ? (
    <div className={s.dropdownSection}>
      <div className={s.sectionLabelRow}>
        <div className={s.sectionLabel}>
          최근 검색
        </div>
        <button
          type="button"
          className={s.clearAllBtn}
          onClick={handleClearAllRecent}
        >
          전체삭제
        </button>
      </div>
      <div role="listbox" id={listboxId} aria-label="최근 검색">
        {recentSearches.map((r, i) => {
          const itemId = `recent-${i}`;
          const currentFlatIndex = flatIndexMap.get(itemId) ?? -1;
          return (
            <div
              key={`recent-${r.query}`}
              id={optionId(itemId)}
              className={`${s.resultItem} ${s.resultItemCompact} ${focusedIndex === currentFlatIndex ? s.resultItemFocused : ""}`}
              role="option"
              aria-selected={focusedIndex === currentFlatIndex}
              onClick={() => navigateToSearch(r.query)}
            >
              <span className={s.recentIcon} aria-hidden="true">
                <Clock size={14} />
              </span>
              <div className={s.resultItemContent}>
                <div className={s.resultItemTitle}>{r.query}</div>
              </div>
              {r.date && (
                <span className={s.recentDate}>{r.date}</span>
              )}
              <button
                type="button"
                className={s.removeRecent}
                onClick={(e) => handleRemoveRecent(e, r.query)}
                aria-label={`"${r.query}" 최근 검색 삭제`}
                tabIndex={-1}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  /* 바로 탐색 */
  const quickSection = (
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
        <Link href="/guide" className={s.quickItem} onClick={handleQuickNav}>
          <Compass size={16} />
          <span>정착 로드맵</span>
        </Link>
        <Link href="/education" className={s.quickItem} onClick={handleQuickNav}>
          <GraduationCap size={16} />
          <span>교육·체험</span>
        </Link>
        <Link href="/match" className={s.quickItem} onClick={handleQuickNav}>
          <Search size={16} />
          <span>유형 진단</span>
        </Link>
      </div>
    </div>
  );

  /* 단계별 가이드 */
  const guideSection = (
    <div className={s.expandedSection}>
      <div className={s.sectionLabel}>단계별 가이드</div>
      <div className={s.guideStepsGrid}>
        {PLAN_STEPS.map((step) => (
          <Link
            key={step.id}
            href={`/guide#step${step.step}`}
            className={s.guideStepCard}
            onClick={handleQuickNav}
          >
            <span className={s.guideStepNum}>{step.step}</span>
            <span className={s.guideStepBody}>
              <span className={s.guideStepTitle}>{step.title}</span>
              <span className={s.guideStepHint}>{step.timeline}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );

  /* 추천 검색어 목록 — 모바일 풀스크린 확장·히어로 드롭다운.
     10/2 단일 출처(RECOMMENDED_KEYWORDS)로 통일. 실제 인기 순위가 아니므로 순위 번호·"인기" 표현은 쓰지 않는다. */
  const popularSection = (
    <div className={s.expandedSection}>
      <div className={s.sectionLabel}>추천 검색어</div>
      <div className={s.popularList}>
        {RECOMMENDED_KEYWORDS.map((kw) => (
          <button key={kw} type="button" className={s.popularItem} onClick={() => navigateToSearch(kw)}>
            <span className={s.popularLabel}>{kw}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* 자주 묻는 질문 */
  const faqSection = (
    <div className={s.expandedSection}>
      <div className={s.sectionLabel}>자주 묻는 질문</div>
      <div className={s.faqList}>
        {FEATURED_FAQ_INDICES.map((idx) => {
          const faq = SEARCH_FAQS[idx];
          if (!faq) return null;
          return (
            <Link
              key={faq.href + idx}
              href={faq.href}
              className={s.faqItem}
              onClick={handleQuickNav}
            >
              <span className={s.faqQ}>{faq.patterns[0]}</span>
              <span className={s.faqA}>{faq.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

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
        ) : panelLayout ? null : (
          <button type="submit" className={s.searchSubmitBtn} aria-label="검색">
            <Search
              size={size === "large" ? 22 : 18}
              className={s.searchIcon}
              aria-hidden="true"
            />
          </button>
        )}
        <input
          ref={inputRef}
          name="q"
          className={s.input}
          type="search"
          inputMode="search"
          enterKeyHint="search"
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
          aria-expanded={listboxVisible}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxVisible ? listboxId : undefined}
          aria-activedescendant={listboxVisible ? activeDescendant : undefined}
          autoComplete="off"
        />
        {/* X — 검색어가 있으면 지우기. 헤더 검색 패널(onClose 있음)에서는 항상 보이고, 비어 있을 때 누르면 패널을 닫는다
            (10/2 회장 "X 버튼은 항상 위치"). /search 페이지처럼 닫을 대상이 없으면 검색어가 있을 때만 */}
        {(isExpanded || panelLayout) && (query.length > 0 || (panelLayout && onCloseProp)) && (
          <button
            type="button"
            className={s.expandedClear}
            onClick={() => {
              if (query.length === 0 && panelLayout && onCloseProp) {
                onCloseProp();
                return;
              }
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            aria-label={query.length === 0 && panelLayout && onCloseProp ? "검색 닫기" : "검색어 지우기"}
          >
            <X size={16} />
          </button>
        )}
        {panelLayout && (
          <button type="submit" className={`${s.searchSubmitBtn} ${s.panelSubmitBtn}`} aria-label="검색">
            <Search size={24} className={s.searchIcon} aria-hidden="true" />
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
        /* 바깥 상자는 리스트박스가 아니다 — 옵션 묶음만 role=listbox. 입력 중 제안 변화 안내(aria-live)는
           입력이 있을 때만(빈 화면은 고정 안내라 읽어 줄 변화가 없다) */
        <div
          ref={dropdownRef}
          className={dropdownClass}
          aria-live={isEmptyQuery ? undefined : "polite"}
        >
          {panelLayout && isEmptyQuery ? (
            /* ── 헤더 패널 검색 홈 (10/2): 추천 검색어 칩 → 3열(최근·바로 탐색 / 가이드 / FAQ) ── */
            <>
              <div className={s.panelChips}>
                <span className={s.panelChipsLabel}>추천 검색어</span>
                <div className={s.panelChipList}>
                  {RECOMMENDED_KEYWORDS.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      className={s.panelChip}
                      onClick={() => navigateToSearch(kw)}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.panelGrid}>
                <div className={s.panelCol}>
                  {recentSection}
                  {quickSection}
                </div>
                <div className={s.panelCol}>{guideSection}</div>
                <div className={s.panelCol}>{faqSection}</div>
              </div>
            </>
          ) : (
            <>
              {recentSection}

              {/* ── 확장/리치 모드 검색 홈: 바로 탐색 + 인기 검색어 ── */}
              {showRich && isEmptyQuery && (
                <>
                  {quickSection}
                  {guideSection}
                  {/* 인기 검색어 — 모달(inlineDropdown)에서는 제외 (9/29 회장): 바로 탐색 → 가이드 → FAQ 만 */}
                  {!inlineDropdown && popularSection}
                  {faqSection}
                </>
              )}
            </>
          )}

          {/* 자동완성 텍스트 리스트 (네이버 스타일) */}
          {hasSuggestions && (
            <div className={s.dropdownSection} role="listbox" id={listboxId} aria-label="검색어 제안">
              {suggestions.map((sq, i) => {
                const itemId = `suggestion-${i}`;
                const currentFlatIndex = flatIndexMap.get(itemId) ?? -1;
                return (
                  <div
                    key={itemId}
                    id={optionId(itemId)}
                    className={`${s.suggestRow} ${focusedIndex === currentFlatIndex ? s.suggestRowFocused : ""}`}
                    role="option"
                    aria-selected={focusedIndex === currentFlatIndex}
                    onClick={() => navigateToSearch(sq)}
                  >
                    <span className={s.suggestIcon} aria-hidden="true">
                      <Search size={14} />
                    </span>
                    <span className={s.suggestText}>
                      {highlight(sq, query)}
                    </span>
                    <button
                      type="button"
                      className={s.suggestFill}
                      onClick={(e) => fillInputWithSuggestion(e, sq)}
                      aria-label={`"${sq}" 입력창에 채우기`}
                      tabIndex={-1}
                    >
                      <ArrowUpLeft size={16} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 자동완성 0건 안내 — 입력값이 시드/searchAll/QUERY_SUGGESTIONS 어디에도 매칭 안 됨 */}
          {!showRecent && suggestions.length === 0 && query.trim().length > 0 && (
            <div className={s.noResult}>
              <p className={s.noResultText}>
                &ldquo;{query}&rdquo;에 대한 검색어가 없어요
              </p>
              <RequestButton
                keyword={query.trim()}
                pageName="통합 검색"
                label="정보 추가 요청하기"
                className={s.requestLink}
                iconSize={14}
              />
            </div>
          )}

          {/* 전체 검색 결과 보기 footer — 자동완성 있을 때만 노출 */}
          {suggestions.length > 0 && query.trim().length > 0 && (
            <div className={s.dropdownFooter}>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                className={s.viewAllLink}
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
