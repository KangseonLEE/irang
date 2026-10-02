"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { useSearchShortcut, useIsMac, shortcutLabel } from "@/lib/hooks/use-search-shortcut";
import { SearchPanel } from "@/components/search/search-panel";
import { analytics } from "@/lib/analytics";
import {
  NAV_GROUPS,
  isNavItemActive,
  resolveActiveGroupId,
} from "@/lib/data/navigation";
import s from "./header.module.css";

const SEARCH_PANEL_ID = "header-search-panel";

/** 구독이 필요 없는 스냅샷용 — 인라인으로 두면 렌더마다 새 함수라 재구독이 일어난다 */
const subscribeNoop = () => () => {};

export function Header() {
  const pathname = usePathname();
  /** 헤더 검색 패널 (10/2 — 헤더 아래로 내려오는 패널, 전 뷰포트 공통) */
  const [searchOpen, setSearchOpen] = useState(false);
  /** 열 때마다 +1 — 패널 속 SearchBar 를 새로 마운트(검색어 초기화 + 입력 포커스). 0 이면 아직 안 열어 마운트도 안 한다 */
  const [searchSession, setSearchSession] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  /** 스크롤 핸들러가 읽는 열림 상태 — 열린 동안엔 헤더를 숨기지 않는다 */
  const searchOpenRef = useRef(false);
  /** 드롭다운 클릭 후 일시적으로 hover를 무시하기 위한 플래그 */
  const [navHidden, setNavHidden] = useState(false);
  /** 클릭·키보드로 명시적으로 연 그룹 (hover 열림은 CSS가 담당) */
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  /** 겹치는 basePath 중 가장 긴 것 하나만 활성 — 두 그룹 동시 활성 방지 */
  const activeGroupId = resolveActiveGroupId(pathname);
  /** `/search` 는 페이지 검색바가 주인 — 헤더 트리거를 숨겨 입구가 둘이 되지 않게 (QA) */
  const isSearchPage = pathname === "/search";
  /** 스크롤 내리면 헤더 숨김, 올리면 표시 */
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  /* 키캡 표기는 마운트 후에만 — 서버/클라이언트 첫 페인트 불일치 방지 */
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    searchOpenRef.current = searchOpen;
  }, [searchOpen]);

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

    const onScroll = () => {
      const y = window.scrollY;
      scrollingUp = y < lastScrollY.current;
      scheduleSnap();
      // 검색 패널이 열린 동안엔 헤더(패널이 붙어 있다)를 숨기지 않는다
      if (searchOpenRef.current) {
        lastScrollY.current = y;
        return;
      }
      // 최상단 근처에서는 항상 표시
      if (y < 56) {
        setHeaderHidden(false);
        delete document.documentElement.dataset.headerHidden;
        lastScrollY.current = y;
        return;
      }
      const delta = y - lastScrollY.current;
      if (delta > THRESHOLD) {
        setHeaderHidden(true);
        document.documentElement.dataset.headerHidden = "";
      } else if (delta < -THRESHOLD) {
        setHeaderHidden(false);
        delete document.documentElement.dataset.headerHidden;
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (snapTimer) window.clearTimeout(snapTimer);
    };
  }, []);

  /** 작은 검색창(768+) · 돋보기(<768) — 닫힐 때 보이는 쪽으로 포커스를 돌려준다 */
  const searchFieldRef = useRef<HTMLButtonElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);

  /* 검색 패널 열기 — **이 함수 하나**가 모든 진입(트리거 클릭·⌘K)을 받는다.
     계측은 닫힘→열림 전이에서만 1회. 업데이터 안에서 발화하면 StrictMode 이중 호출로 2건이 된다(9/29) */
  const openSearchUi = useCallback(
    (method: string) => {
      if (searchOpen) return;
      analytics.searchOverlayOpen(method);
      setSearchSession((n) => n + 1);
      setSearchOpen(true);
      // 아래로 스크롤해 숨은 헤더에서 ⌘K 로 열어도 헤더(패널이 붙는 자리)를 먼저 되살린다
      setHeaderHidden(false);
      delete document.documentElement.dataset.headerHidden;
    },
    [searchOpen],
  );

  /** 닫기 — Esc·✕ 는 트리거로 포커스 복귀, 바깥 클릭·포커스 이탈·페이지 이동은 그대로 둔다 */
  const closeSearch = useCallback((restoreFocus: boolean) => {
    setSearchOpen(false);
    if (!restoreFocus) return;
    // ✕ 버튼이 트리거로 바뀐 뒤(다음 프레임)에 보이는 트리거로 — display:none 인 쪽은 offsetParent 가 null
    requestAnimationFrame(() => {
      const target = [searchFieldRef.current, searchBtnRef.current].find(
        (el) => el && el.offsetParent !== null,
      );
      target?.focus({ preventScroll: true });
    });
  }, []);

  /* ⌘K(mac) / Ctrl+K — 트리거 클릭과 같은 경로로 연다. 이미 열려 있으면 입력창으로 포커스만 옮긴다 */
  const isMac = useIsMac();
  const onShortcut = useCallback(() => {
    if (searchOpen) {
      const input = headerRef.current?.querySelector<HTMLInputElement>("[role='dialog'] input");
      input?.focus();
      input?.select();
      return;
    }
    openSearchUi("shortcut");
  }, [openSearchUi, searchOpen]);
  useSearchShortcut(onShortcut);

  // 페이지 이동 시 검색 패널 닫기 (포커스는 새 페이지에 맡긴다)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchOpen(false);
  }, [pathname]);

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

  // Esc — 열린 드롭다운 닫기 + 포커스 해제
  useEffect(() => {
    if (!openGroupId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenGroupId(null);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openGroupId]);

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
      <header
        ref={headerRef}
        className={`${s.header}${headerHidden ? ` ${s.headerHidden}` : ""}${searchOpen ? ` ${s.searchOpen}` : ""}`}
      >
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
              return (
                <div key={group.id} className={s.navGroup}>
                  <button
                    type="button"
                    className={`${s.navLink} ${isGroupActive ? s.active : ""}`}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleGroup(group.id)}
                    onFocus={() => setOpenGroupId(group.id)}
                  >
                    {group.label}
                  </button>
                  <div
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
            {/* 검색 — <768 은 돋보기 아이콘, 768+ 는 작은 입력창 모양 트리거. 누르면 헤더 아래로 패널이 내려온다(10/2).
                열린 동안 트리거 자리는 ✕(닫기) 하나 — 레퍼런스(기후금융포털)와 같다.
                `/search` 에서는 페이지 자체 검색바가 주인이라 트리거를 숨긴다(QA — 이중 노출, ⌘K 는 동작). */}
            {searchOpen ? (
              <button
                type="button"
                className={s.searchClose}
                aria-label="검색 닫기"
                aria-expanded={true}
                aria-controls={SEARCH_PANEL_ID}
                onClick={() => closeSearch(true)}
              >
                <X size={22} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : (
              !isSearchPage && (
                <div className={s.searchWrap}>
                  <button
                    type="button"
                    ref={searchBtnRef}
                    className={s.searchBtn}
                    aria-label="통합검색"
                    aria-haspopup="dialog"
                    aria-expanded={false}
                    aria-controls={SEARCH_PANEL_ID}
                    onClick={() => openSearchUi("mobile_button")}
                    aria-keyshortcuts={mounted ? (isMac ? "Meta+K" : "Control+K") : undefined}
                  >
                    <Search size={20} strokeWidth={1.75} />
                  </button>

                  <button
                    type="button"
                    ref={searchFieldRef}
                    className={s.searchField}
                    aria-label="통합검색 열기"
                    aria-haspopup="dialog"
                    aria-expanded={false}
                    aria-controls={SEARCH_PANEL_ID}
                    /* Tab 으로 지나가기만 해도 열리면 계측이 오염된다(QA) — 클릭·Enter/Space(button 기본)·⌘K 만 */
                    onClick={() => openSearchUi("header_input")}
                    aria-keyshortcuts={mounted ? (isMac ? "Meta+K" : "Control+K") : undefined}
                  >
                    <Search size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className={s.searchFieldText}>검색</span>
                    {/* 단축키 키캡 — 입력창 안 우측, 1024+ 에서만. 마운트 전엔 빈 배지로 폭만 잡아 CLS 0 */}
                    <span className={s.searchKbd} aria-hidden="true">
                      {shortcutLabel(mounted, isMac)}
                    </span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* 검색 패널 — 헤더 안에 두어 sticky 헤더와 함께 움직이고, 헤더 아래로만 내려온다 */}
        <SearchPanel
          id={SEARCH_PANEL_ID}
          open={searchOpen}
          sessionKey={searchSession}
          boundaryRef={headerRef}
          onClose={closeSearch}
        />
      </header>
    </>
  );
}
