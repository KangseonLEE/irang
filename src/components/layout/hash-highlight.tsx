"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HIGHLIGHT_CLASS = "hash-target-highlight";
const DURATION = 1800; // ms

/**
 * URL 해시(#id) 대상 요소에 하이라이트 애니메이션을 적용합니다.
 * Next.js 클라이언트 사이드 네비게이션에서도 동작합니다.
 * (CSS :target은 브라우저 네이티브 해시 이동에서만 동작)
 */
function highlightHash() {
  const raw = window.location.hash.slice(1);
  if (!raw) return;
  // 한글 해시는 브라우저가 percent-encode할 수 있으므로 디코딩
  const hash = decodeURIComponent(raw);

  // 이전 하이라이트 제거
  document
    .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
    .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));

  // 약간의 딜레이: 아코디언 열림/DOM 업데이트 대기
  setTimeout(() => {
    const el = document.getElementById(hash);
    if (!el) return;

    el.classList.add(HIGHLIGHT_CLASS);
    setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), DURATION);
  }, 300);
}

export function HashHighlight() {
  const pathname = usePathname();

  // pathname 변경 시 (검색 결과에서 클릭하여 진입)
  useEffect(() => {
    highlightHash();
  }, [pathname]);

  // 같은 페이지 내 해시 변경
  useEffect(() => {
    window.addEventListener("hashchange", highlightHash);
    return () => window.removeEventListener("hashchange", highlightHash);
  }, []);

  return null;
}
