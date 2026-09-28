"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * 미디어쿼리 구독 훅 (2026-09-28).
 *
 * `useSyncExternalStore` 로 읽는다 — 서버 스냅샷은 항상 false 라 SSR/하이드레이션 불일치가
 * 없고(9/6 landing-region-search 패턴), 뷰포트 변경도 리렌더로 따라온다.
 * "데스크탑에서만 마운트" 같은 게이트에 쓰면 모바일 DOM 이 서버 렌더와 동일하게 유지된다.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useMemo(
    () => () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
