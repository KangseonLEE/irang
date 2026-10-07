"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useFocusDodge } from "@/lib/hooks/use-focus-dodge";
import s from "./scroll-to-top-button.module.css";

/**
 * 데스크탑 전용 플로팅 스크롤-투-탑 버튼.
 * 일정 이상 스크롤 시 우측 하단에 표시.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /* 보이는 동안 키보드 포커스를 가리면 비켜난다 — 10/3 QA(WCAG 2.4.11) */
  const dodge = useFocusDodge(buttonRef, visible);

  useEffect(() => {
    const SHOW_THRESHOLD = 400;
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // 맨 위에 닿으면 버튼이 숨으며 inert 가 되어 포커스가 body 로 떨어진다(10/4 QA) — 버튼에 포커스가 있던
    // 경우(키보드)엔 페이지 첫 제목으로 옮겨 다음 Tab 이 본문 처음부터 이어지게 한다
    if (document.activeElement !== buttonRef.current) return;
    const heading = document.querySelector<HTMLElement>("main h1");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${s.button}${visible ? ` ${s.visible}` : ""}`}
      data-dodge={dodge ? "true" : undefined}
      /* 키보드 포커스를 가리면 스스로 비켜난다 — 전역 포커스 노출(use-focus-reveal)이 문서를 밀 띠로 세지 않게 */
      data-focus-reveal-ignore=""
      onClick={handleClick}
      aria-label="맨 위로 이동"
      /* 숨김 상태(투명)에서는 Tab 이 보이지 않는 버튼에 머물지 않게 — 10/3 QA(포커스가 보이지 않음) */
      inert={!visible}
    >
      <ArrowUp size={20} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
