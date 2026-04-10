/**
 * IrangSearch — 이랑 커스텀 돋보기 아이콘
 *
 * lucide Search 대비 원을 약간 줄여 손잡이가 길고 또렷한 인상.
 * lucide LucideIcon 인터페이스와 호환 → Icon 래퍼에서 그대로 사용 가능.
 *
 * 기본 lucide Search: circle r=8, handle ~4.3 units
 * 이랑 Search:        circle r=7, handle ~5.7 units (≈33% 더 긴 손잡이)
 */

import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

const IrangSearch = forwardRef<SVGSVGElement, LucideProps>(
  (
    {
      size = 24,
      strokeWidth = 1.75,
      color = "currentColor",
      className,
      ...rest
    },
    ref,
  ) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {/* 돋보기 원 — cx 10.5 cy 10.5 r 7 (lucide 대비 원 12.5% 축소) */}
      <circle cx="10.5" cy="10.5" r="7" />
      {/* 손잡이 — 원 접선(≈15.45)부터 우하단 모서리(21.5)까지 */}
      <line x1="15.45" y1="15.45" x2="21.5" y2="21.5" />
    </svg>
  ),
);

IrangSearch.displayName = "IrangSearch";

export { IrangSearch };
