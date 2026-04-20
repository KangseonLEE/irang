"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchOverlayContext } from "@/lib/hooks/use-search-overlay";
import SearchBar from "./search-bar";
import s from "./search-overlay.module.css";

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

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const ctx = useMemo(() => ({ open }), [open]);

  // 오버레이 오픈 시 body 스크롤 잠금 (데스크탑). 모바일은 SearchBar 내부에서 이미 처리.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

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
            <SearchBar
              size="large"
              placeholder="궁금한 귀농 정보를 검색해보세요"
              mobilePlaceholder="지역, 작물, 교육, 비용 검색"
              mobileExpand
              richMode
              autoFocus
              onClose={close}
            />
          </div>
        </div>
      )}
    </SearchOverlayContext.Provider>
  );
}
