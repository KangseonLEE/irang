import { useEffect } from "react";

/**
 * 모달·오버레이 활성 시 body 스크롤 잠금.
 *
 * iOS Safari는 `overflow: hidden`만으로는 background scroll을 막지 못함 — 알려진 버그.
 * 검증된 해결책: position: fixed + top: -scrollY 로 화면을 고정하고,
 * 닫힐 때 원래 scroll 위치로 복원.
 *
 * 동작:
 * - active = true → 현재 scrollY 저장, body 고정, scroll 차단
 * - active = false (cleanup) → body 스타일 복원, scrollTo(0, scrollY)
 *
 * @example
 * useBodyScrollLock(isOpen);
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const scrollY = window.scrollY;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
