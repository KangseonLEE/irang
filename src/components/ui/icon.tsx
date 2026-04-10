/**
 * Icon — 통일된 아이콘 래퍼 컴포넌트
 *
 * lucide-react 아이콘을 감싸서 사이즈·컨테이너·컬러를 일관되게 적용.
 * 기존 코드와 점진적으로 교체 가능하도록 설계.
 *
 * @example
 * // 인라인 (bare)
 * <Icon icon={Search} size="md" />
 *
 * // 섹션 헤더 (soft 배경 박스)
 * <Icon icon={Sprout} size="lg" variant="soft" box="md" />
 *
 * // 시맨틱 컬러
 * <Icon icon={AlertTriangle} size="lg" variant="soft" box="md" color="warning" />
 */

import type { LucideIcon } from "lucide-react";
import s from "./icon.module.css";

/** 아이콘 사이즈 — globals.css --icon-* 토큰과 매핑 */
const SIZE_MAP = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
} as const;

type IconSize = keyof typeof SIZE_MAP;
type BoxSize = "sm" | "md" | "lg" | "xl";
type Variant = "bare" | "soft" | "solid";
type SemanticColor = "primary" | "success" | "warning" | "error" | "info";

interface IconProps {
  /** lucide-react 아이콘 컴포넌트 */
  icon: LucideIcon;
  /** 아이콘 사이즈 (기본: md = 16px) */
  size?: IconSize;
  /** 컨테이너 스타일 (기본: bare = 아이콘만) */
  variant?: Variant;
  /** soft/solid 컨테이너 크기 (기본: md = 34px) */
  box?: BoxSize;
  /** 시맨틱 컬러 (soft variant에서 배경·아이콘 색 변경) */
  color?: SemanticColor;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 접근성: 장식용이면 true (기본: true) */
  decorative?: boolean;
  /** 접근성: 의미 있는 아이콘이면 라벨 제공 */
  label?: string;
}

export function Icon({
  icon: LucideIcon,
  size = "md",
  variant = "bare",
  box = "md",
  color,
  className,
  decorative = true,
  label,
}: IconProps) {
  const iconPx = SIZE_MAP[size];

  // 클래스 조합
  const classes = [
    s.icon,
    s[variant],
    // soft/solid면 박스 크기 적용
    variant !== "bare" ? s[`box${box.charAt(0).toUpperCase()}${box.slice(1)}`] : "",
    // 시맨틱 컬러 (soft 전용)
    color && color !== "primary" && variant === "soft"
      ? s[`color${color.charAt(0).toUpperCase()}${color.slice(1)}`]
      : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? "true" : undefined}
    >
      <LucideIcon size={iconPx} strokeWidth={1.75} />
    </span>
  );
}
