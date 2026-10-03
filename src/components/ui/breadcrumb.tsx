import Link from "next/link";
import { ChevronRight } from "lucide-react";
import s from "./breadcrumb.module.css";

export interface BreadcrumbTrailItem {
  name: string;
  /** 없으면 링크 없는 글자(현재 위치·분류명) */
  href?: string;
}

/**
 * 상세 페이지 공통 브레드크럼 (2026-10-02 회장: "상세 페이지 히어로 아래에 공통으로, 탭은 그 아래").
 *
 * - 홈("이랑")은 자동으로 첫 항목. `items` 마지막이 현재 페이지(aria-current).
 * - 배치: 히어로(상단 대표 영역) 바로 아래 → 섹션 탭(AnchorTabNav) 위.
 * - 구조화 데이터는 별도 `BreadcrumbJsonLd` 가 맡는다(같은 items 를 넘기면 된다).
 */
export function Breadcrumb({ items, className }: { items: BreadcrumbTrailItem[]; className?: string }) {
  const all: BreadcrumbTrailItem[] = [{ name: "이랑", href: "/" }, ...items];
  return (
    <nav className={className ? `${s.breadcrumb} ${className}` : s.breadcrumb} aria-label="현재 위치">
      <ol className={s.list}>
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${item.name}-${i}`} className={s.item}>
              {i > 0 && <ChevronRight size={14} strokeWidth={1.75} className={s.sep} aria-hidden="true" />}
              {last ? (
                <span className={s.current} aria-current="page">
                  {item.name}
                </span>
              ) : item.href ? (
                <Link href={item.href} className={s.link}>
                  {item.name}
                </Link>
              ) : (
                <span className={s.text}>{item.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
