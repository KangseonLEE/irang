import type { ReactNode } from "react";
import s from "./list-toolbar.module.css";

interface ListToolbarProps {
  /** 결과 건수 */
  count: number;
  /** 단위. 기본 "건" */
  unit?: string;
  /** 라벨. 기본 "검색 결과" */
  label?: string;
  /** 우측 슬롯 (보기 토글, 정렬 등). 없으면 좌측 텍스트만 표시 */
  children?: ReactNode;
}

/**
 * 리스트형 페이지 상단 — 결과 수(좌) + 액션 슬롯(우)
 * 사용처: /programs, /events, /education 등
 */
export function ListToolbar({
  count,
  unit = "건",
  label = "검색 결과",
  children,
}: ListToolbarProps) {
  return (
    <div className={s.toolbar}>
      <p className={s.resultText}>
        {label} <span className={s.resultTotal}>{count}</span>
        {unit}
      </p>
      {children && <div className={s.actions}>{children}</div>}
    </div>
  );
}
