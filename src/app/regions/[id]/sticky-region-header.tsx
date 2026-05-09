"use client";

import { useEffect, useRef, useState } from "react";
import s from "./page.module.css";

interface StickyRegionHeaderProps {
  overline: string;
  shortName: string;
  /** 감시할 hero 컨테이너 ID. 이 요소가 viewport 위로 사라지면 sticky bar 노출. */
  watchTargetId: string;
}

/**
 * 스크롤 시 상단에 fixed 노출되는 컴팩트 헤더.
 * 모바일 전용 (CSS에서 데스크탑은 display: none).
 *
 * 동작: hero 컨테이너의 bottom이 viewport 상단에서 사라지면 노출.
 * IntersectionObserver로 sentinel 감시 — scroll 이벤트보다 가벼움.
 */
export function StickyRegionHeader({
  overline,
  shortName,
  watchTargetId,
}: StickyRegionHeaderProps) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(watchTargetId);
    if (!target) return;

    // 헤더 높이 만큼 마진 — hero가 그만큼 사라지면 sticky 표시
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting === true 이면 hero가 보임 → sticky 숨김
        // false면 hero가 viewport 밖 → sticky 노출
        setVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        // 상단 60px(safe-area + sticky bar 자체 높이)을 마지노선으로
        rootMargin: "-60px 0px 0px 0px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [watchTargetId]);

  return (
    <div
      ref={barRef}
      className={`${s.stickyTitleBar} ${visible ? s.stickyTitleBarVisible : ""}`}
      role="banner"
      aria-hidden={!visible}
    >
      <span className={s.stickyTitleBarOverline}>{overline}</span>
      <span className={s.stickyTitleBarName}>{shortName}</span>
    </div>
  );
}
