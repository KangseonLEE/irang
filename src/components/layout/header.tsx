"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { X } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import SearchBar from "@/components/search/search-bar";
import {
  NAV_GROUPS,
  isNavItemActive,
  resolveActiveGroupId,
} from "@/lib/data/navigation";
import s from "./header.module.css";

export function Header() {
  const pathname = usePathname();
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [gnbSearchOpen, setGnbSearchOpen] = useState(false);
  /** 드롭다운 클릭 후 일시적으로 hover를 무시하기 위한 플래그 */
  const [navHidden, setNavHidden] = useState(false);
  /** 클릭·키보드로 명시적으로 연 그룹 (hover 열림은 CSS가 담당) */
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  /** 겹치는 basePath 중 가장 긴 것 하나만 활성 — 두 그룹 동시 활성 방지 */
  const activeGroupId = resolveActiveGroupId(pathname);
  /** 스크롤 내리면 헤더 숨김, 올리면 표시 */
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { count, mounted } = useBookmarks();
  const { open: openSearch } = useSearchOverlay();

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

  const handleSearchClick = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
      openSearch();
    } else {
      setGnbSearchOpen(true);
    }
  }, [openSearch]);

  const closeGnbSearch = useCallback(() => setGnbSearchOpen(false), []);
  const gnbSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGnbSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!gnbSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGnbSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gnbSearchOpen, closeGnbSearch]);

  // 뷰포트가 모바일로 줄어들면 GNB 검색 자동 닫기
  useEffect(() => {
    if (!gnbSearchOpen) return;
    const mql = window.matchMedia("(max-width: 767px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 뷰포트 변경 시 즉시 닫기 필요
    if (mql.matches) { closeGnbSearch(); return; }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) closeGnbSearch();
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [gnbSearchOpen, closeGnbSearch]);

  // 포커스가 검색 영역 밖으로 이동하면 닫기
  useEffect(() => {
    if (!gnbSearchOpen) return;
    const el = gnbSearchRef.current;
    if (!el) return;
    const onFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as Node | null;
      if (related && el.contains(related)) return;
      closeGnbSearch();
    };
    el.addEventListener("focusout", onFocusOut);
    return () => el.removeEventListener("focusout", onFocusOut);
  }, [gnbSearchOpen, closeGnbSearch]);

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
            <span className={s.logoTextWrap}>
              <span className={s.logoTitle}>이랑</span>
              <span className={s.logoSub}>농촌 정착을 꿈꾸는 모든 이들의 시작점</span>
            </span>
          </Link>

          {/* 검색 모드: nav 대신 검색바를 풀폭으로 표시 */}
          {gnbSearchOpen ? (
            <div className={s.gnbSearchBar} ref={gnbSearchRef}>
              <SearchBar
                size="default"
                placeholder="궁금한 농촌 정착 정보를 검색해보세요"
                mobilePlaceholder="지역, 작물, 교육, 비용 검색"
                richMode
                autoFocus
                onClose={closeGnbSearch}
              />
              <button
                type="button"
                className={s.gnbSearchClose}
                onClick={closeGnbSearch}
                aria-label="검색 닫기"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            /* Desktop Navigation — 드롭다운 GNB */
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
          )}

          {/* Right Actions */}
          <div className={s.actions}>
            <div className={s.searchWrap}>
              <button
                type="button"
                className={`${s.searchBtn}${gnbSearchOpen ? ` ${s.searchBtnHidden}` : ""}`}
                aria-label="통합검색"
                aria-haspopup="dialog"
                aria-expanded={gnbSearchOpen}
                onClick={handleSearchClick}
              >
                <Search size={20} strokeWidth={1.75} />
              </button>
            </div>
            <button
              type="button"
              className={s.bookmarkBtn}
              onClick={() => setBookmarkOpen(true)}
              aria-label="저장 목록 열기"
            >
              <Heart size={20} strokeWidth={1.75} />
              {mounted && count > 0 && (
                <span className={s.badge}>{count > 99 ? "99+" : count}</span>
              )}
            </button>
            <Link
              href="/match"
              className={s.ctaButton}
            >
              농촌 정착 적합도 진단
              <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </header>

      <BookmarkList open={bookmarkOpen} onClose={() => setBookmarkOpen(false)} />
    </>
  );
}
