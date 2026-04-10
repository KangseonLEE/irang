/**
 * IrangSprout — 이랑 커스텀 새싹 아이콘
 *
 * lucide Sprout 기반 + 이랑 아이덴티티:
 * - 잎을 좀 더 풍성하게 (이중 곡선)
 * - 줄기 하단에 밭이랑(물결) 곡선 → 흙에서 올라오는 느낌
 * - 전체적으로 부드럽고 유기적인 라인
 *
 * lucide LucideIcon 인터페이스 호환 → Icon 래퍼에서 그대로 사용.
 */

import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

const IrangSprout = forwardRef<SVGSVGElement, LucideProps>(
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
      {/* 줄기 — 땅에서 올라오는 부드러운 S커브 */}
      <path d="M12 21c0-4 0-7 0-9" />
      {/* 왼쪽 잎 — 풍성한 곡선 */}
      <path d="M12 12C12 8 8 5.5 4 6c0 4 2.5 7 8 6" />
      {/* 오른쪽 작은 잎 — 성장 중인 새 잎 */}
      <path d="M12 15c0-2.5 2.5-4.5 6-4 0 2.5-2 4.5-6 4" />
      {/* 밭이랑 — 흙의 물결선, 이랑 브랜드 모티프 */}
      <path d="M5 21c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0" />
    </svg>
  ),
);

IrangSprout.displayName = "IrangSprout";

export { IrangSprout };
