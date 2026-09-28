"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import { useSearchShortcut, useIsMac, shortcutLabel } from "@/lib/hooks/use-search-shortcut";
import SearchBar from "@/components/search/search-bar";
import { Modal } from "@/components/ui/modal";
import { analytics } from "@/lib/analytics";
import {
  NAV_GROUPS,
  isNavItemActive,
  resolveActiveGroupId,
} from "@/lib/data/navigation";
import s from "./header.module.css";

/** 구독이 필요 없는 스냅샷용 — 인라인으로 두면 렌더마다 새 함수라 재구독이 일어난다 */
const subscribeNoop = () => () => {};

export function Header() {
  const pathname = usePathname();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
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
  const { open: openSearch, isOpen: overlayOpen } = useSearchOverlay();

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

  /* 검색 UI 열기 — **이 함수 하나**가 모든 진입(버튼 클릭·⌘K)을 받는다.
     모바일(<640)은 전역 오버레이, 그 위는 헤더 인라인 검색바. 계측은 오버레이 쪽은 Provider 가
     닫힘→열림 전이에서, 인라인 바는 여기서 같은 전이 조건으로 1회씩만 보낸다(중복 0). */
  const openSearchUi = useCallback(
    (method: string) => {
      /* 트리거에 포커스를 두고 연다 — 닫힐 때 Modal 이 previousActive 로 되돌려 주므로
         ⌘K 로 열어도 포커스가 검색창으로 복귀한다(QA) */
      searchTriggerRef.current?.focus({ preventScroll: true });
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
        openSearch(method);
        return;
      }
      // 업데이터 안에서 발화하면 StrictMode 이중 호출로 2건이 된다(9/29 실측) → 현재 상태로 판정
      if (!searchModalOpen) analytics.searchOverlayOpen(method);
      setSearchModalOpen(true);
    },
    [openSearch, searchModalOpen],
  );

  /* 돋보기 버튼은 <768 에서만 렌더(768+ 는 작은 검색창이 header_input 으로 연다) — 라벨은 mobile_button 하나 */
  const handleSearchClick = useCallback(() => {
    openSearchUi("mobile_button");
  }, [openSearchUi]);

  const closeSearchModal = useCallback(() => {
    setSearchModalOpen(false);
    /* 닫은 뒤 포커스를 트리거로 되돌린다 (QA). Modal 의 previousActive 복원(150ms 애니메이션 뒤)
       보다 나중에 실행돼야 해서 220ms — 그 전에 우리가 먼저 부르면 Modal 이 body 로 덮어쓴다. */
    setTimeout(() => searchTriggerRef.current?.focus({ preventScroll: true }), 220);
  }, []);
  const searchModalRef = useRef<HTMLDivElement>(null);
  /** 작은 검색창(트리거) — 모달이 닫힐 때 공용 Modal 이 이 요소로 포커스를 돌려준다 */
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  /* ⌘K(mac) / Ctrl+K — 검색 버튼 클릭과 **같은 경로**로 연다(모바일 오버레이·데스크탑 인라인 바).
     이미 열려 있으면 입력창으로 포커스만 옮긴다. 닫기는 종전대로 Esc. */
  const isMac = useIsMac();
  const onShortcut = useCallback(() => {
    const input = searchModalRef.current?.querySelector("input");
    if (input) {
      // 이미 열려 있으면 포커스만 — 계측은 발화하지 않는다
      input.focus();
      input.select();
      return;
    }
    if (overlayOpen) return; // 모바일 오버레이가 이미 열린 상태
    openSearchUi("shortcut");
  }, [openSearchUi, overlayOpen]);
  useSearchShortcut(onShortcut);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchModalOpen(false);
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

          {/* Desktop Navigation — 드롭다운 GNB (검색은 모달이라 nav 를 교체하지 않는다) */}
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
            {/* 검색 — <768 은 돋보기 아이콘, 768+ 는 상시 노출되는 작은 입력창(누르면 모달).
                아이콘과 입력창은 서로 배타적인 뷰포트에서만 보인다 (9/29 회장).
                `/search` 에서는 페이지 자체 검색바가 주인이라 헤더 트리거를 숨긴다(QA — 이중 노출). */}
            {!isSearchPage && (
            <div className={s.searchWrap}>
              <button
                type="button"
                className={s.searchBtn}
                aria-label="통합검색"
                aria-haspopup="dialog"
                aria-expanded={searchModalOpen}
                onClick={handleSearchClick}
                aria-keyshortcuts={mounted ? (isMac ? "Meta+K" : "Control+K") : undefined}
              >
                <Search size={20} strokeWidth={1.75} />
              </button>

              <button
                type="button"
                /* 모달이 열려도 트리거는 그대로 둔다 — 감추면 헤더 액션 폭이 줄어 레이아웃이 흔들린다 */
                className={s.searchField}
                aria-label="통합검색 열기"
                aria-haspopup="dialog"
                aria-expanded={searchModalOpen}
                ref={searchTriggerRef}
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
            )}
          </div>
        </div>
      </header>

      {/* 통합검색 모달 (768+) — 공용 Modal: 백드롭 클릭·X·Esc 닫기, 포커스 트랩, 스크롤 잠금.
          <768 은 풀스크린 오버레이(SearchOverlay) 유지 — 중앙 모달은 가상 키보드와 싸운다 (9/29 회장). */}
      <Modal
        open={searchModalOpen}
        onClose={closeSearchModal}
        title="통합검색"
        align="top"
        size="search"
      >
        <div ref={searchModalRef} className={s.searchModalBody}>
          <SearchBar
            size="large"
            placeholder="궁금한 농촌 정착 정보를 검색해보세요"
            mobilePlaceholder="지역, 작물, 교육, 비용 검색"
            richMode
            inlineDropdown
            autoFocus
            onClose={closeSearchModal}
          />
        </div>
      </Modal>

    </>
  );
}
