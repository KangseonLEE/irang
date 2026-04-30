"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import s from "./scroll-indicator.module.css";

/**
 * 모바일 hero 영역 하단 스크롤 다운 indicator.
 * - 두 화살표가 0.4s 간격으로 위→아래로 흘러내리는 sequential 애니메이션
 * - scrollY > 40px이면 fade out, scrollY ≤ 40px이면 fade in
 * - hero 내부 absolute 배치이므로 hero를 완전히 벗어난 뒤에는 자연스럽게 viewport 밖
 */
export function ScrollIndicator() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`${s.indicator} ${hidden ? s.indicatorHidden : ""}`}
      aria-hidden="true"
    >
      <ChevronDown size={24} strokeWidth={2.25} className={s.chevron1} />
      <ChevronDown size={24} strokeWidth={2.25} className={s.chevron2} />
    </div>
  );
}
