"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 히어로 카드 그리드 + 커서 추종 3D 기울기 (2026-10-01, efusioni 번안).
 *
 * - 카드는 서버 마크업(children). 여기서는 `<ul>` 하나에 포인터 리스너를 위임해
 *   `[data-hero-card]` 안의 `[data-tilt]` 요소 transform 만 rAF 로 바꾼다.
 * - `(hover: hover) and (pointer: fine)` 이고 reduced-motion 이 아닐 때만 리스너를 단다 —
 *   터치·키보드·모션 축소 환경에서는 아무 일도 하지 않는다.
 * - 움직이는 동안 transition 0.1s(커서 추종), 떠날 때 0.3s ease-in-out 으로 제자리.
 */

const MAX_DEG = 7;
const PERSPECTIVE = 1000;

export function HeroTiltGrid({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let current: HTMLElement | null = null;
    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.transition = "transform 0.3s ease-in-out";
      el.style.transform = "";
    };

    const apply = () => {
      frame = 0;
      if (!current || !pending) return;
      const rect = current.getBoundingClientRect();
      const px = (pending.x - rect.left) / rect.width - 0.5; // -0.5 ~ 0.5
      const py = (pending.y - rect.top) / rect.height - 0.5;
      const rx = (-py * 2 * MAX_DEG).toFixed(2);
      const ry = (px * 2 * MAX_DEG).toFixed(2);
      current.style.transition = "transform 0.1s linear";
      current.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const card = (e.target as Element | null)?.closest<HTMLElement>("[data-hero-card]");
      const tilt = card?.querySelector<HTMLElement>("[data-tilt]") ?? null;
      if (tilt !== current) {
        reset(current);
        current = tilt;
      }
      if (!current) return;
      pending = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      reset(current);
      current = null;
    };

    let attached = false;
    const sync = () => {
      const enable = fine.matches && !reduced.matches;
      if (enable && !attached) {
        list.addEventListener("pointermove", onMove);
        list.addEventListener("pointerleave", onLeave);
        attached = true;
      } else if (!enable && attached) {
        list.removeEventListener("pointermove", onMove);
        list.removeEventListener("pointerleave", onLeave);
        onLeave();
        attached = false;
      }
    };

    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
