"use client";

import { useCallback, useMemo, useState } from "react";
import { SearchOverlayContext } from "@/lib/hooks/use-search-overlay";
import SearchBar from "./search-bar";
import s from "./search-overlay.module.css";

/**
 * 전역 검색 오버레이 Provider + 렌더러.
 * 레이아웃에 1개만 배치하면 헤더·히어로 어디서든 `useSearchOverlay().open()`으로 열 수 있음.
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

  return (
    <SearchOverlayContext.Provider value={ctx}>
      {children}
      {isOpen && (
        <div className={s.overlay}>
          <SearchBar
            size="large"
            placeholder="궁금한 지역이나 작물을 검색해보세요"
            mobilePlaceholder="지역, 작물, 지원사업 검색"
            mobileExpand
            autoFocus
            onClose={close}
          />
        </div>
      )}
    </SearchOverlayContext.Provider>
  );
}
