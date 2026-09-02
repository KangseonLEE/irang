"use client";

import { useEffect } from "react";

/**
 * 모바일 가상 키보드 안전망 (2026-09-02 회장 iOS Chrome 리포트).
 *
 * 입력창에 포커스가 가고 키보드가 자리 잡은 뒤(visualViewport 축소 완료), 그 입력창이
 * "보이는 영역"(헤더 아래 ~ 하단 탭바 위) 밖에 있으면 중앙으로 스크롤한다. 브라우저의 기본
 * 스크롤이 고정 하단 탭바·짧은 페이지 조합에서 입력창을 화면 밖으로 밀어내는 경우만 개입 —
 * 이미 보이면 아무것도 하지 않아 기본 동작과 싸우지 않는다.
 *
 * 제외: 검색바(role=search — mobileExpand 고정 오버레이라 자체 스크롤 복원 로직 보유),
 *       Modal 등 fixed 컨테이너 안의 입력(문서 스크롤과 무관).
 * hover 가능한(데스크탑) 환경은 가상 키보드가 없어 등록하지 않는다.
 */
export function KeyboardFocusGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: hover)").matches) return;
    const vv = window.visualViewport;
    if (!vv) return;

    let timer: number | null = null;

    const isEditable = (el: Element | null): el is HTMLElement =>
      !!el &&
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable) &&
      !(el instanceof HTMLInputElement && ["checkbox", "radio", "button", "submit", "range", "file"].includes(el.type));

    const insideFixed = (el: HTMLElement): boolean => {
      for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
        if (n.closest('[role="search"]')) return true;
        const pos = getComputedStyle(n).position;
        if (pos === "fixed") return true;
      }
      return false;
    };

    const ensureVisible = (el: HTMLElement) => {
      if (document.activeElement !== el) return;
      const rect = el.getBoundingClientRect();
      // 헤더는 --sticky-top(스크롤 다운 시 0) 이 아니라 실높이 --h-header 로 — 위로 스크롤하면 다시 나타난다.
      // --sticky-extra(SectionNav 높이)는 섹션 레이아웃 스코프 변수라 요소의 computed style 에서 읽는다
      const elStyle = getComputedStyle(el);
      const headerH =
        (parseFloat(elStyle.getPropertyValue("--h-header")) || 56) +
        (parseFloat(elStyle.getPropertyValue("--sticky-extra")) || 0);
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--h-mobile-nav")) || 56;
      // visualViewport 기준 보이는 구간 — offsetTop 은 레이아웃 뷰포트 대비 시각 뷰포트의 위치
      const top = vv.offsetTop + headerH;
      const bottom = vv.offsetTop + vv.height - navH;
      if (rect.top >= top && rect.bottom <= bottom) return;
      el.scrollIntoView({ block: "center", behavior: "auto" });
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as Element | null;
      if (!isEditable(el) || insideFixed(el)) return;
      if (timer) window.clearTimeout(timer);
      // iOS 키보드 등장 애니메이션(~250ms) 후 판정. resize 이벤트가 먼저 오면 그때 판정.
      timer = window.setTimeout(() => ensureVisible(el), 350);
    };

    const onResize = () => {
      const el = document.activeElement;
      if (!isEditable(el) || insideFixed(el)) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => ensureVisible(el), 120);
    };

    document.addEventListener("focusin", onFocusIn);
    vv.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      vv.removeEventListener("resize", onResize);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
