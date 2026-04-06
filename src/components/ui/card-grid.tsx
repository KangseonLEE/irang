import type { ReactNode } from "react";
import s from "./card-grid.module.css";

interface CardGridProps {
  children: ReactNode;
  className?: string;
}

/** 반응형 카드 그리드: 1열(모바일) → 2열(640px) → 3열(1024px) */
export function CardGrid({ children, className }: CardGridProps) {
  return (
    <div className={className ? `${s.grid} ${className}` : s.grid}>
      {children}
    </div>
  );
}
