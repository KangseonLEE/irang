interface IrangSymbolProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * 이랑 브랜드 심볼 — 밭고랑(이랑)을 추상화한 3줄 웨이브
 * color에 CSS variable을 넘기면 다크모드 자동 대응
 */
export function IrangSymbol({
  size = 28,
  color = "var(--primary)",
  className,
}: IrangSymbolProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="이랑 심볼"
      className={className}
    >
      <path
        d="M3 9 C7 6, 11 6, 14 9 S21 12, 25 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M3 14 C7 11, 11 11, 14 14 S21 17, 25 14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M3 19 C7 16, 11 16, 14 19 S21 22, 25 19"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
