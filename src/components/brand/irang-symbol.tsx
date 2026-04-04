import s from "./irang-symbol.module.css";

interface IrangSymbolProps {
  size?: number;
  color?: string;
  /** 가운데 줄 색상 (기본: --brand-400, 밝은 녹색) */
  midColor?: string;
  className?: string;
  /** false로 설정하면 애니메이션 없이 정적 렌더링 */
  animate?: boolean;
}

/**
 * 이랑 브랜드 심볼 — 밭고랑(이랑)을 추상화한 3줄 웨이브
 * 기본: 무한 루프 (그려짐 → 물결 → 지워짐 → 반복)
 * 가운데 줄은 밝은 녹색으로 깊이감 부여
 */
export function IrangSymbol({
  size = 28,
  color = "var(--primary)",
  midColor = "var(--brand-400, #4A9E85)",
  className,
  animate = true,
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
      className={`${animate ? s.symbol : ""} ${className ?? ""}`.trim()}
    >
      <path
        d="M3 9 C7 6, 11 6, 14 9 S21 12, 25 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        className={animate ? `${s.line} ${s.line1}` : undefined}
      />
      <path
        d="M3 14 C7 11, 11 11, 14 14 S21 17, 25 14"
        stroke={midColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        className={animate ? `${s.line} ${s.line2}` : undefined}
      />
      <path
        d="M3 19 C7 16, 11 16, 14 19 S21 22, 25 19"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        className={animate ? `${s.line} ${s.line3}` : undefined}
      />
    </svg>
  );
}
