import type { CSSProperties } from "react";

type SkeletonVariant = "text" | "rect" | "circle";

interface Props {
  /** width — 숫자(px) 또는 CSS 값(`"60%"`, `"3rem"` 등) */
  width?: string | number;
  /** height — 숫자(px) 또는 CSS 값 */
  height?: string | number;
  /** 모양 변형 (기본 rect) */
  variant?: SkeletonVariant;
  /** border-radius 오버라이드 */
  radius?: string | number;
  /** 추가 className (도메인 형상 보강 용) */
  className?: string;
  /** 인라인 style 오버라이드 (margin 등) */
  style?: CSSProperties;
  /** 스크린리더용 라벨 (기본 "콘텐츠 로딩 중") */
  ariaLabel?: string;
}

function toCss(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

function variantRadius(variant: SkeletonVariant): string | undefined {
  switch (variant) {
    case "text":
      return "4px";
    case "circle":
      return "9999px";
    case "rect":
    default:
      return undefined; // .irang-skeleton 기본값 (6px) 사용
  }
}

/**
 * 공용 Skeleton 컴포넌트.
 *
 * 글로벌 `.irang-skeleton` 클래스(globals.css)의 pulse 애니메이션 + muted 배경을 적용.
 * width/height는 props 또는 className으로 지정. 신규 사용처에서 권장.
 *
 * @example
 * <Skeleton width="60%" height={28} />
 * <Skeleton variant="circle" width={32} height={32} />
 * <Skeleton width="100%" height={120} radius={16} />
 */
export function Skeleton({
  width,
  height,
  variant = "rect",
  radius,
  className,
  style,
  ariaLabel = "콘텐츠 로딩 중",
}: Props) {
  const mergedStyle: CSSProperties = {
    width: toCss(width),
    height: toCss(height),
    borderRadius: toCss(radius) ?? variantRadius(variant),
    ...style,
  };

  const composed = ["irang-skeleton", className].filter(Boolean).join(" ");

  return (
    <span
      className={composed}
      style={mergedStyle}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    />
  );
}
