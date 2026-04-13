"use client";

import { createContext, useContext } from "react";

interface SearchOverlayContextValue {
  /** 검색 오버레이 열기 */
  open: () => void;
}

export const SearchOverlayContext = createContext<SearchOverlayContextValue>({
  open: () => {},
});

export function useSearchOverlay() {
  return useContext(SearchOverlayContext);
}
