import s from "./support-type-badge.module.css";

/* ── 타입 → 컬러 클래스 맵 ── */
const COLOR: Record<string, string> = {
  보조금: s.grant,
  융자: s.loan,
  교육: s.education,
  현물: s.inKind,
  컨설팅: s.consulting,
  혼합: s.mixed,
};

/**
 * 지원 유형 컬러 클래스만 필요할 때 사용.
 * 커스텀 레이아웃에서 색상만 입히고 싶은 경우 유용합니다.
 */
export function getSupportTypeColorClass(type: string): string {
  return COLOR[type] ?? s.fallback;
}

/* ── Props ── */
interface SupportTypeBadgeProps {
  /** 지원 유형 값 (보조금 | 융자 | 교육 | 현물 | 컨설팅 | 혼합) */
  type: string;
  /** 표시 텍스트를 직접 지정 (기본값: type 값 그대로) */
  label?: string;
  /** 라벨 앞에 붙는 접두어 (예: "지원 유형: ") */
  prefix?: string;
  /** chip: 컴팩트 pill (기본), meta: 아이콘 메타 배지 */
  variant?: "chip" | "meta";
  /** 배지 앞에 표시할 아이콘 */
  icon?: React.ReactNode;
  /** 추가 className */
  className?: string;
}

/**
 * 지원 유형 배지 — 디자인 시스템 공유 컴포넌트.
 *
 * ```tsx
 * <SupportTypeBadge type="융자" />
 * <SupportTypeBadge type="보조금" prefix="지원 유형: " />
 * <SupportTypeBadge type="현물" variant="meta" icon={<Coins size={13} />} />
 * ```
 */
export function SupportTypeBadge({
  type,
  label,
  prefix,
  variant = "chip",
  icon,
  className,
}: SupportTypeBadgeProps) {
  const colorClass = COLOR[type] ?? s.fallback;
  const variantClass = variant === "meta" ? s.meta : s.chip;

  return (
    <span
      className={`${variantClass} ${colorClass}${className ? ` ${className}` : ""}`}
    >
      {icon}
      {prefix && <span className={s.prefix}>{prefix}</span>}
      {label ?? type}
    </span>
  );
}
