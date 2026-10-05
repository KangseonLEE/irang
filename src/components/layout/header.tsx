"use client";

import { useState, useEffect, useCallback, useId, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { useSearchShortcut, useIsMac, shortcutLabel } from "@/lib/hooks/use-search-shortcut";
import { analytics } from "@/lib/analytics";
import {
  NAV_GROUPS,
  isNavItemActive,
  resolveActiveGroupId,
} from "@/lib/data/navigation";
import s from "./header.module.css";


/** 구독이 필요 없는 스냅샷용 — 인라인으로 두면 렌더마다 새 함수라 재구독이 일어난다 */
const subscribeNoop = () => () => {};

/** Navigation API 최소 형태 — TS DOM 라이브러리에 아직 `window.navigation` 이 없다 */
interface NavigationLike {
  currentEntry: { index: number } | null;
  entries: () => { url: string | null }[];
}

/**
 * 지금 기록에서 /search 밖 마지막 페이지까지 몇 단계 뒤인가.
 * 0 = 이 탭의 같은 사이트 기록에 /search 밖 페이지가 없다(바로 들어옴). null = 판단 불가(API 미지원).
 */
function stepsBackOutOfSearch(): number | null {
  const nav = (window as Window & { navigation?: NavigationLike }).navigation;
  if (!nav?.currentEntry || typeof nav.entries !== "function") return null;
  const entries = nav.entries();
  const current = nav.currentEntry.index;
  for (let i = current - 1; i >= 0; i--) {
    const url = entries[i]?.url;
    if (url && new URL(url).pathname !== "/search") return current - i;
  }
  return 0;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  /* 10/2 오후 회장: 헤더 검색도 히어로 검색과 같은 화면(`/search`)으로 간다 — 헤더 아래 패널은 폐기.
     /search 에서는 트리거 자리에 ✕(닫기)를 두고, 들어오기 직전 페이지로 돌려보낸다. */
  /** 마지막으로 머문 /search 밖 주소(경로+쿼리). 있으면 앱 안에서 /search 로 들어왔다는 뜻 — Navigation API 가 없는
      브라우저에서 ✕ 를 '한 단계 뒤로'로 처리할지 판정한다(없으면 홈으로 교체) */
  const returnPathRef = useRef<string | null>(null);
  /** 드롭다운 클릭 후 일시적으로 hover를 무시하기 위한 플래그 */
  const [navHidden, setNavHidden] = useState(false);
  /** 클릭·키보드로 명시적으로 연 그룹 (hover 열림은 CSS가 담당) */
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  /**
   * 마우스가 올라가 있는 그룹 — 펼치는 건 CSS `:hover` 지만 aria-expanded 가 화면과 같아야 한다(10/3 QA:
   * hover 로 열린 메뉴가 false 로 남았다). 마우스 포인터만 센다 — 터치 탭은 클릭(openGroupId)이 맡고,
   * CSS hover 열림도 `(hover: hover)` 에서만 일어난다.
   */
  const [hoverGroupId, setHoverGroupId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  /** 그룹 버튼 ↔ 드롭다운 id 접두(aria-controls·Esc 복귀용) */
  const navIdBase = useId();
  /** 겹치는 basePath 중 가장 긴 것 하나만 활성 — 두 그룹 동시 활성 방지 */
  const activeGroupId = resolveActiveGroupId(pathname);
  /** `/search` 는 페이지 검색바가 주인 — 헤더 트리거를 숨겨 입구가 둘이 되지 않게 (QA) */
  const isSearchPage = pathname === "/search";
  /** 스크롤 내리면 헤더 숨김, 올리면 표시 */
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  /* 키캡 표기는 마운트 후에만 — 서버/클라이언트 첫 페인트 불일치 방지 */
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  // /search 밖 주소를 계속 기억 — /search 에 들어오면 그 직전 값이 ✕ 의 목적지
  useEffect(() => {
    if (pathname !== "/search") returnPathRef.current = window.location.pathname + window.location.search;
  }, [pathname]);

  // 스크롤 방향 감지 — 내리면 숨김, 올리면 표시
  useEffect(() => {
    const THRESHOLD = 10; // 미세 스크롤 무시
    // 스냅-투-탑 (모바일, 9/2 회장 iOS Chrome 리포트): 위로 스크롤하면 브라우저 주소창이 펴지면서 그 높이(≈100px)만큼
    // 스크롤을 흡수해 "최상단처럼 보이지만 헤더+탭 높이만큼 남은" 지점에 멈춘다. 그 지점에선 sticky 바가 제목을 덮거나
    // (바가 없으면) 바가 안 보인다. 위로 향한 스크롤이 스택 높이 근처에서 멈추면 0 으로 붙여 바와 제목을 모두 보인다.
    const SNAP_ZONE = 120; // 헤더 56 + SectionNav 44 + 여유
    let snapTimer: number | null = null;
    let scrollingUp = false;
    const scheduleSnap = () => {
      if (snapTimer) window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        const y = window.scrollY;
        if (scrollingUp && y > 0 && y < SNAP_ZONE && !window.matchMedia("(min-width: 768px)").matches) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 160);
    };

    /* 모바일(<768) 방향 판정 기준점 — 방향이 바뀐 지점에서부터 누적 이동량을 잰다(10/2 회장).
       데스크탑은 종전대로 "직전 이벤트와의 차이"로 판정한다(동작 불변 지시). */
    let anchorY = window.scrollY;
    let anchorDir: 1 | -1 = 1;
    const show = () => {
      setHeaderHidden(false);
      delete document.documentElement.dataset.headerHidden;
    };
    const hide = () => {
      setHeaderHidden(true);
      document.documentElement.dataset.headerHidden = "";
    };

    const onScroll = () => {
      const y = window.scrollY;
      scrollingUp = y < lastScrollY.current;
      scheduleSnap();
      const mobile = !window.matchMedia("(min-width: 768px)").matches;
      /* 최상단 근처에서는 항상 표시 — 헤더가 흐름 안에 자리를 차지하는 페이지에선 그 높이(56)만큼.
         랜딩은 히어로가 헤더 뒤까지 차올라(투명 오버레이) 숨겨도 빈 띠가 생기지 않으므로,
         모바일에선 이 구간을 두지 않고 내리기 시작하자마자 숨긴다(10/2 회장 "내리는 즉시"). */
      const topZone = mobile && document.querySelector("[data-landing-hero]") ? 0 : 56;
      if (y <= topZone) {
        show();
        lastScrollY.current = y;
        anchorY = y;
        return;
      }
      if (mobile) {
        /* 10/2: 직전 이벤트와의 차이(>10px)로만 판정하면 손가락으로 천천히 끄는 터치 스크롤은
           이벤트마다 3~8px 라 영원히 임계를 못 넘는다 — 빠르게 튕길 때만 숨던 원인.
           방향이 바뀐 지점(anchor)부터 누적해 판정한다. */
        const dir: 1 | -1 = y > lastScrollY.current ? 1 : y < lastScrollY.current ? -1 : anchorDir;
        if (dir !== anchorDir) {
          anchorDir = dir;
          anchorY = lastScrollY.current;
        }
        const moved = y - anchorY;
        if (moved > THRESHOLD) hide();
        else if (moved < -THRESHOLD) show();
        lastScrollY.current = y;
        return;
      }
      const delta = y - lastScrollY.current;
      if (delta > THRESHOLD) hide();
      else if (delta < -THRESHOLD) show();
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (snapTimer) window.clearTimeout(snapTimer);
    };
  }, []);

  /** 검색 화면으로 — 트리거 클릭·⌘K 공통. 계측은 기존 이벤트(search_overlay_open, method)를 그대로 쓴다 */
  const goSearch = useCallback(
    (method: string) => {
      analytics.searchOverlayOpen(method);
      router.push("/search");
    },
    [router],
  );

  /**
   * ✕ — 들어오기 직전 페이지로 **되돌아간다**(새 기록을 쌓지 않는다, 10/2 QA C-Y11).
   * push 로 가면 ✕ 뒤 '뒤로'가 다시 /search 로 왔다(기록 2→4).
   * - 앱 안에서 들어왔으면 /search 기록을 거슬러 그 직전 페이지로 — /search 안에서 검색을 여러 번 했어도 한 번에
   * - 바로 /search 로 들어왔으면(기록에 이 사이트 다른 페이지 없음) 홈으로 **교체** — 사이트 밖으로 나가지 않는다
   */
  const closeSearch = useCallback(() => {
    const steps = stepsBackOutOfSearch();
    if (steps !== null) {
      if (steps > 0) window.history.go(-steps);
      else router.replace("/");
      return;
    }
    // Navigation API 가 없는 브라우저 — 기록 깊이를 몰라 back() 은 /search 안 직전 검색으로 갈 수 있다
    // (10/3 재검증: 검색 2회 뒤 ✕ → /search?q=사과 에 남음). 들어오기 직전 경로로 **교체**한다.
    router.replace(returnPathRef.current ?? "/");
  }, [router]);

  /* ⌘K(mac) / Ctrl+K — /search 밖에서는 검색 화면으로, /search 에서는 입력창으로 포커스 */
  const isMac = useIsMac();
  const onShortcut = useCallback(() => {
    if (isSearchPage) {
      const input = document.querySelector<HTMLInputElement>("main input[type='search'], main input[name='q']");
      input?.focus();
      input?.select();
      return;
    }
    goSearch("shortcut");
  }, [goSearch, isSearchPage]);
  useSearchShortcut(onShortcut);

  // 페이지 이동 시 데스크탑 드롭다운 닫기
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavHidden(true);
    setOpenGroupId(null);

    // :focus-within 해제 → 드롭다운 CSS 비활성화
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 터치 디바이스 fallback — mouseleave 미발생 시 자동 해제
    // (마우스 이탈 해제는 nav 의 onMouseLeave 가 담당)
    const t = setTimeout(() => setNavHidden(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  // 드롭다운 아이템 클릭 후 즉시 숨기기 (pathname 변경 전 선제 처리)
  const hideDropdowns = useCallback(() => {
    setNavHidden(true);
    setOpenGroupId(null);
    // :focus-within 해제
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  /** 그룹 버튼 토글 — 열려 있으면 닫고(hover 열림도 navHidden 으로 함께 억제) 아니면 연다 */
  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroupId((prev) => {
      const next = prev === groupId ? null : groupId;
      setNavHidden(next === null);
      return next;
    });
  }, []);

  /** 지금 펼쳐진 그룹(클릭으로 연 것 우선, 없으면 마우스가 올라간 것). navHidden 이면 CSS 가 둘 다 숨긴다 */
  const expandedGroupId = navHidden ? null : (openGroupId ?? hoverGroupId);

  // Esc — 열린 드롭다운 닫기. 포커스가 메뉴 안에 있었으면 그 그룹 버튼으로 되돌린다(APG disclosure).
  // 예전엔 포커스를 body 로 날려 키보드 사용자가 메뉴 위치를 잃었다(10/2 QA).
  // hover 로 열린 메뉴도 닫는다(WCAG 1.4.13 — 포인터를 옮기지 않고 닫을 수 있어야) — 마우스가 nav 를 떠나거나
  // 다른 그룹에 들어갈 때까지 hover 열림을 멈춘다(navHidden).
  useEffect(() => {
    if (!expandedGroupId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const focusInNav = navRef.current?.contains(document.activeElement) ?? false;
      const trigger = document.getElementById(`${navIdBase}-${expandedGroupId}-trigger`);
      setOpenGroupId(null);
      setNavHidden(true);
      if (focusInNav) trigger?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedGroupId, navIdBase]);

  // 바깥 클릭 — 열린 드롭다운 닫기
  useEffect(() => {
    if (!openGroupId) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = navRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setOpenGroupId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openGroupId]);

  return (
    <>
      <header className={`${s.header}${headerHidden ? ` ${s.headerHidden}` : ""}`}>
        <div className={s.inner}>
          {/* Logo — 심볼 + 워드마크 */}
          <Link
            href="/"
            className={s.logo}
            aria-label="이랑 홈으로 이동"
          >
            <IrangSymbol size={28} />
            {/* 슬로건은 제거 (9/29 회장) — 로고는 심볼 + 워드마크만 */}
            <span className={s.logoTitle}>이랑</span>
          </Link>

          {/* Desktop Navigation — 드롭다운 GNB (검색 패널이 열려도 GNB 는 그대로 보인다) */}
          <nav
            className={`${s.nav}${navHidden ? ` ${s.navHidden}` : ""}`}
            aria-label="주요 메뉴"
            ref={navRef}
            onMouseLeave={() => setNavHidden(false)}
            onBlur={(e) => {
              // 포커스가 nav 밖으로 나가면 열린 드롭다운 정리
              if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
              setOpenGroupId(null);
            }}
          >
            {NAV_GROUPS.map((group) => {
              const isGroupActive = activeGroupId === group.id;
              const isOpen = openGroupId === group.id;
              /* 화면에 펼쳐져 있는가 — 클릭으로 열었거나(.dropdownOpen) 마우스가 올라가 있다(CSS :hover).
                 둘 다 navHidden 이면 CSS 가 숨기므로 같은 조건으로 판정한다 */
              const isExpanded = !navHidden && (isOpen || hoverGroupId === group.id);
              return (
                <div
                  key={group.id}
                  className={s.navGroup}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    setHoverGroupId(group.id);
                    // 다른 그룹에 들어오면 hover 열림을 다시 허용하고, 클릭으로 열려 있던 다른 그룹은 닫는다(두 메뉴 겹침 방지)
                    setNavHidden(false);
                    setOpenGroupId((prev) => (prev !== null && prev !== group.id ? null : prev));
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "mouse") return;
                    setHoverGroupId((prev) => (prev === group.id ? null : prev));
                  }}
                >
                  {/* 디스클로저 버튼(APG) — 포커스만으로는 열지 않는다. Enter·Space(클릭)로 열고 닫고, Esc 는 닫고 버튼으로.
                      예전엔 포커스로 열려 Enter 를 누르면 오히려 닫혔다(10/2 QA). 다른 그룹 버튼으로 포커스가 오면 열린 그룹은 닫는다 */}
                  <button
                    type="button"
                    id={`${navIdBase}-${group.id}-trigger`}
                    className={`${s.navLink} ${isGroupActive ? s.active : ""}`}
                    aria-expanded={isExpanded}
                    aria-controls={`${navIdBase}-${group.id}-menu`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleGroup(group.id)}
                    onFocus={() => setOpenGroupId((prev) => (prev !== null && prev !== group.id ? null : prev))}
                  >
                    {group.label}
                  </button>
                  <div
                    id={`${navIdBase}-${group.id}-menu`}
                    className={`${s.dropdown}${isOpen ? ` ${s.dropdownOpen}` : ""}`}
                  >
                    {group.items.map((item) => {
                      const isItemActive = isNavItemActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${s.dropdownItem} ${isItemActive ? s.dropdownItemActive : ""}`}
                          onClick={hideDropdowns}
                        >
                          <span className={s.dropdownLabel}>{item.label}</span>
                          <span className={s.dropdownDesc}>{item.desc}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className={s.actions}>
            {/* 검색 — <768 돋보기 · 768+ 작은 입력창 모양. 누르면 히어로 검색과 같은 `/search` 화면으로 간다(10/2 오후 회장).
                `/search` 에서는 같은 자리에 ✕(닫기) — 들어오기 직전 페이지로 돌아간다. */}
            {isSearchPage ? (
              <button type="button" className={s.searchClose} aria-label="검색 닫기" onClick={closeSearch}>
                <X size={22} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : (
              <div className={s.searchWrap}>
                <Link
                  href="/search"
                  className={s.searchBtn}
                  aria-label="통합검색"
                  onClick={() => analytics.searchOverlayOpen("mobile_button")}
                  aria-keyshortcuts={mounted ? (isMac ? "Meta+K" : "Control+K") : undefined}
                >
                  <Search size={20} strokeWidth={1.75} />
                </Link>

                <Link
                  href="/search"
                  className={s.searchField}
                  aria-label="통합검색 열기"
                  onClick={() => analytics.searchOverlayOpen("header_input")}
                  aria-keyshortcuts={mounted ? (isMac ? "Meta+K" : "Control+K") : undefined}
                >
                  <Search size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span className={s.searchFieldText}>검색</span>
                  {/* 단축키 키캡 — 입력창 안 우측, 1024+ 에서만. 마운트 전엔 빈 배지로 폭만 잡아 CLS 0 */}
                  <span className={s.searchKbd} aria-hidden="true">
                    {shortcutLabel(mounted, isMac)}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

      </header>
    </>
  );
}
