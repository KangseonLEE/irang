"use client";

import { useEffect, useRef, useState } from "react";
import s from "./page.module.css";

export interface StickyChip {
  /** 칩 라벨 — 짧게 (예: "정착 점수 78") */
  label: string;
  /** 클릭 시 스크롤 anchor (#id) — 없으면 비-링크 칩 */
  href?: string;
  /** 강조 톤 — 기본 default · 점수 강조 시 primary */
  tone?: "default" | "primary";
}

interface StickyRegionHeaderProps {
  overline: string;
  shortName: string;
  /** 감시할 hero 컨테이너 ID. 이 요소가 viewport 위로 사라지면 sticky bar 노출. */
  watchTargetId: string;
  /** 추가 정보 칩 (정착 점수 / 추천 작물 수 등) — 가로 스크롤 + anchor 탭 */
  chips?: StickyChip[];
}

/**
 * 스크롤 시 상단에 fixed 노출되는 컴팩트 헤더.
 * 모바일 전용 (CSS에서 데스크탑은 display: none).
 *
 * 동작: hero 컨테이너의 bottom이 viewport 상단에서 사라지면 노출.
 * IntersectionObserver로 sentinel 감시 — scroll 이벤트보다 가벼움.
 *
 * 칩(chips):
 *   - 정착 점수, 추천 작물 수 등 정착 결정에 필요한 추가 정보 노출.
 *   - href 지정 시 같은 페이지 anchor로 부드럽게 스크롤.
 *   - 가로 스크롤 (overflow-x: auto) — 페이지 자체에는 영향 없음.
 */
export function StickyRegionHeader({
  overline,
  shortName,
  watchTargetId,
  chips,
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

  const hasChips = chips && chips.length > 0;

  return (
    <div
      ref={barRef}
      className={`${s.stickyTitleBar} ${visible ? s.stickyTitleBarVisible : ""}`}
      role="banner"
      aria-hidden={!visible}
    >
      <div className={s.stickyTitleBarTop}>
        <span className={s.stickyTitleBarOverline}>{overline}</span>
        <span className={s.stickyTitleBarName}>{shortName}</span>
      </div>
      {hasChips && (
        <div
          className={s.stickyChips}
          role="list"
          aria-label={`${shortName} 추가 정보`}
        >
          {chips.map((chip, idx) =>
            chip.href ? (
              <a
                key={`${chip.label}-${idx}`}
                href={chip.href}
                role="listitem"
                className={`${s.stickyChip} ${
                  chip.tone === "primary" ? s.stickyChipPrimary : ""
                }`}
                tabIndex={visible ? 0 : -1}
              >
                {chip.label}
              </a>
            ) : (
              <span
                key={`${chip.label}-${idx}`}
                role="listitem"
                className={`${s.stickyChip} ${
                  chip.tone === "primary" ? s.stickyChipPrimary : ""
                }`}
              >
                {chip.label}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
