"use client";

import { createContext, useContext } from "react";

interface SearchOverlayContextValue {
  /** 검색 오버레이 열기 — `method` 는 계측 라벨(shortcut·mobile_button·search_page_bar…) */
  open: (method?: string) => void;
  /** 이미 열려 있는지 — 호출처가 중복 계측·중복 열기를 피할 때 본다 */
  isOpen: boolean;
}

export const SearchOverlayContext = createContext<SearchOverlayContextValue>({
  open: () => {},
  isOpen: false,
});

export function useSearchOverlay() {
  return useContext(SearchOverlayContext);
}
