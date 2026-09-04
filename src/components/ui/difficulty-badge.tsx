import s from "./difficulty-badge.module.css";

/* ==========================================================================
   DifficultyBadge — 작물 재배 난이도 배지 (공용)
   /crops 카드 · 재배 캘린더 확장 패널 · /costs 비용 비교 표가 공유한다.
   색·크기 정의는 difficulty-badge.module.css 한 곳에만 둔다.
   ========================================================================== */

const COLOR: Record<string, string> = {
  쉬움: s.easy,
  보통: s.medium,
  어려움: s.hard,
};

interface DifficultyBadgeProps {
  /** 난이도 값 (쉬움 | 보통 | 어려움) */
  level: string;
  /** "난이도 · " 접두어 표시 여부 (기본 false) */
  prefix?: boolean;
  /** md: pill (기본, 작물 카드·캘린더) · sm: 컴팩트 태그 (비용 표) */
  size?: "sm" | "md";
  /** 추가 className */
  className?: string;
}

/**
 * 난이도 배지 — 디자인 시스템 공유 컴포넌트.
 *
 * ```tsx
 * <DifficultyBadge level={crop.difficulty} prefix />
 * <DifficultyBadge level={crop.difficulty} size="sm" />
 * ```
 */
export function DifficultyBadge({
  level,
  prefix = false,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  const sizeClass = size === "sm" ? s.sm : s.md;
  const colorClass = COLOR[level] ?? s.medium;

  return (
    <span
      className={`${sizeClass} ${colorClass}${className ? ` ${className}` : ""}`}
    >
      {prefix ? `난이도 · ${level}` : level}
    </span>
  );
}
