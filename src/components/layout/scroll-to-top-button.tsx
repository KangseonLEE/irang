"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import s from "./scroll-to-top-button.module.css";

/**
 * 데스크탑 전용 플로팅 스크롤-투-탑 버튼.
 * 일정 이상 스크롤 시 우측 하단에 표시.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

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
  };

  return (
    <button
      type="button"
      className={`${s.button}${visible ? ` ${s.visible}` : ""}`}
      onClick={handleClick}
      aria-label="맨 위로 이동"
    >
      <ArrowUp size={20} strokeWidth={2} />
    </button>
  );
}
