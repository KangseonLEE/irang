"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Mode = "fit" | "free" | "top" | "bottom";

/**
 * 뷰포트보다 긴 사이드바를 위한 "스마트 sticky" (2026-09-17).
 *
 * CSS `position: sticky; top: X` 는 사이드바 높이 ≤ 뷰포트일 때만 온전하다. 더 길면
 * 상단만 붙잡혀 **하단이 잘린 채** 영영 안 보인다(회장 스크린샷: 노트북 뷰포트에서
 * "근거 보기" 버튼이 화면 밖). 여기서는 스크롤 방향에 따라 붙잡는 변을 바꾼다:
 *   - 아래로 스크롤: 사이드바가 화면을 다 지나가면 **하단**을 뷰포트 하단에 고정
 *   - 위로 스크롤: 사이드바가 화면을 다 지나가면 **상단**을 헤더 아래에 고정
 *   - 방향이 바뀌면 그 자리에서 풀어(relative + margin-top) 콘텐츠와 함께 흐르다가 반대 변에 붙는다
 * 사이드바가 뷰포트 안에 들어오면 아무것도 건드리지 않고 CSS sticky 에 맡긴다.
 *
 * 인라인 스타일만 쓰므로 페이지 CSS(`.sidebar` 의 sticky·top)는 그대로 둔다.
 * 고정 오프셋(헤더 + 여백)은 마운트 시 계산된 `top` 에서 `--sticky-top` 을 빼 읽는다 —
 * 하드코딩 금지 규칙(8/30) 유지.
 */
export function StickySidebar({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const html = document.documentElement;
    const mq = window.matchMedia("(min-width: 1024px)");

    const stickyTop = () => {
      const raw = getComputedStyle(html).getPropertyValue("--sticky-top").trim();
      const n = parseFloat(raw);
      if (Number.isNaN(n)) return 56;
      return raw.endsWith("rem") ? n * parseFloat(getComputedStyle(html).fontSize) : n;
    };
    // 페이지 CSS 의 `top: calc(var(--sticky-top) + 여백)` 에서 여백만 추출
    const baseTop = parseFloat(getComputedStyle(el).top);
    const gap = Number.isNaN(baseTop) ? 12 : Math.max(0, baseTop - stickyTop());

    let mode: Mode = "fit";
    let lastY = window.scrollY;
    let raf = 0;

    const reset = () => {
      el.style.position = "";
      el.style.top = "";
      el.style.marginTop = "";
      el.style.transition = "";
      mode = "fit";
    };
    /** 그 자리에서 풀어 콘텐츠와 함께 흐르게 — `topInParent` 는 부모 상단 기준 현재 y */
    const free = (topInParent: number) => {
      el.style.transition = "none";
      el.style.position = "relative";
      el.style.top = "auto";
      el.style.marginTop = `${Math.max(0, topInParent)}px`;
      mode = "free";
    };
    const pin = (top: number, next: Mode) => {
      el.style.transition = "none";
      el.style.position = "sticky";
      el.style.marginTop = "0px";
      el.style.top = `${top}px`;
      mode = next;
    };

    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (!mq.matches) {
        if (mode !== "fit") reset();
        return;
      }
      const vh = window.innerHeight;
      const h = el.offsetHeight;
      const pinTop = stickyTop() + gap;
      if (h + pinTop + gap <= vh) {
        if (mode !== "fit") reset();
        return;
      }
      const parentEl = el.parentElement;
      if (!parentEl) return;
      const rect = el.getBoundingClientRect();
      const parent = parentEl.getBoundingClientRect();
      const bottomTop = vh - gap - h;

      if (mode === "fit") {
        // 뷰포트보다 길어진 걸 처음 안 순간 — CSS sticky 가 상단을 붙잡기 전에 풀어 둔다
        free(rect.top - parent.top);
        return;
      }
      // 방향이 바뀌는 첫 틱: 붙잡혀 있던 동안 콘텐츠만 dy 만큼 움직였으므로 그만큼 따라 보낸다
      // (보정 없이 풀면 한 틱 분량이 어긋나고, 휠 한 번에 크게 스크롤하면 그대로 남는다)
      if (dy > 0) {
        if (mode === "top") {
          if (rect.bottom - dy <= vh - gap) pin(bottomTop, "bottom");
          else free(rect.top - dy - parent.top);
        } else if (mode === "free" && rect.bottom <= vh - gap) pin(bottomTop, "bottom");
        else if (mode === "bottom") el.style.top = `${bottomTop}px`;
      } else if (dy < 0) {
        if (mode === "bottom") {
          if (rect.top - dy >= pinTop) pin(pinTop, "top");
          else free(rect.top - dy - parent.top);
        } else if (mode === "free" && rect.top >= pinTop) pin(pinTop, "top");
        else if (mode === "top") el.style.top = `${pinTop}px`; // 헤더 복귀로 --sticky-top 이 바뀐 경우
      } else if (mode === "bottom") {
        el.style.top = `${bottomTop}px`; // 탭 전환 등으로 높이가 바뀐 경우
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      reset();
    };
  }, []);

  return (
    <aside ref={ref} className={className}>
      {children}
    </aside>
  );
}
