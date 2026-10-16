"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchOverlayContext } from "@/lib/hooks/use-search-overlay";
import { analytics } from "@/lib/analytics";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";
import { runWhenIdleAfterLoad } from "@/lib/idle-after-load";
import s from "./search-overlay.module.css";

/**
 * 검색창 본체(SearchBar)는 첫 화면이 다 그려진 뒤에 받는다 (2026-10-17, 모바일 LCP 2단계).
 *
 * SearchBar 는 검색 색인(작물·지역·지원사업·용어 정적 데이터 전부)과 Supabase 클라이언트를 import 해,
 * 레이아웃에 정적으로 두면 **모든 페이지 첫 로드**에 수백 KB 의 JS 가 실렸다. 오버레이는 열 때만 그리므로
 * 첫 화면엔 필요 없다 — 로드가 끝나고 한가해지면(`runWhenIdleAfterLoad`) 미리 받아 두고,
 * 사용자가 그보다 먼저 열면 그때 받는다. 미리 받아 두면 여는 순간 동기 렌더라 `autoFocus` 가 탭 제스처 안에서
 * 일어나 iOS 키보드도 그대로 뜬다.
 */
type SearchBarComponent = typeof import("./search-bar").default;
let searchBarModule: SearchBarComponent | null = null;
let searchBarPromise: Promise<SearchBarComponent> | null = null;
function loadSearchBar(): Promise<SearchBarComponent> {
  searchBarPromise ??= import("./search-bar").then((m) => {
    searchBarModule = m.default;
    return m.default;
  });
  return searchBarPromise;
}

/**
 * 전역 검색 오버레이 Provider + 렌더러.
 * 레이아웃에 1개만 배치하면 헤더·히어로 어디서든 `useSearchOverlay().open()`으로 열 수 있음.
 *
 * - 모바일(< 640px): SearchBar의 `containerExpanded`가 풀스크린 담당 (래퍼는 투명)
 * - 데스크탑(>= 640px): 배경 딤 + 상단 중앙 정렬 카드 스타일 (네이버+ 스토어 스타일)
 */
export function SearchOverlayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  /** 결과 화면 검색창에서 열렸는가 — 그때만 지금 검색어를 채워서 연다 (10/6 QA Q4) */
  const [fromResultBar, setFromResultBar] = useState(false);

  /* 열림 계측은 **여기 한 곳** — 닫힌 상태에서 열릴 때만 1회 (9/29).
     ⚠️ setState 업데이터 **안에서** 발화하면 StrictMode 가 업데이터를 두 번 호출해 2건이 찍힌다
     (9/29 라이브 실측에서 잡음). 업데이터는 순수하게 두고 현재 상태로 판정한다. */
  const open = useCallback(
    (method = "unknown") => {
      if (!isOpen) {
        analytics.searchOverlayOpen(method);
        setFromResultBar(method === "search_page_bar");
      }
      setIsOpen(true);
    },
    [isOpen],
  );
  const close = useCallback(() => setIsOpen(false), []);

  const ctx = useMemo(() => ({ open, isOpen }), [open, isOpen]);

  const [SearchBar, setSearchBar] = useState<SearchBarComponent | null>(() => searchBarModule);
  // 한가할 때 미리 받기 — 이미 받았으면 아무것도 안 한다
  useEffect(() => {
    if (SearchBar) return;
    let cancelled = false;
    const cancelIdle = runWhenIdleAfterLoad(() => {
      loadSearchBar().then((C) => {
        if (!cancelled) setSearchBar(() => C);
      }, () => {
        searchBarPromise = null; // 네트워크 실패 — 다음 열기에서 다시 시도
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [SearchBar]);
  // 미리 받기 전에 열었으면 지금 받는다
  useEffect(() => {
    if (!isOpen || SearchBar) return;
    let cancelled = false;
    loadSearchBar().then((C) => {
      if (!cancelled) setSearchBar(() => C);
    }, () => {
      searchBarPromise = null;
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, SearchBar]);

  // 오버레이 오픈 시 body 스크롤 잠금 — iOS Safari 호환(position: fixed 패턴).
  useBodyScrollLock(isOpen);

  // ESC로 오버레이 닫기 (데스크탑에서도 안전하게)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <SearchOverlayContext.Provider value={ctx}>
      {children}
      {isOpen && (
        <div
          className={s.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="통합 검색"
          onClick={(e) => {
            // 배경 클릭 시 닫기 (내부 클릭은 stopPropagation된 영역에서만 전파되므로 안전)
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={s.overlayInner}>
            {SearchBar && <SearchBar
              size="large"
              placeholder="궁금한 농촌 정착 정보를 검색해보세요"
              mobilePlaceholder="지역, 작물, 교육, 비용 검색"
              mobileExpand
              richMode
              autoFocus
              onClose={close}
              syncQueryFromUrl={fromResultBar}
            />}
          </div>
        </div>
      )}
    </SearchOverlayContext.Provider>
  );
}
