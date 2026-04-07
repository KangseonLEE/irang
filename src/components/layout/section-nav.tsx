"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./section-nav.module.css";

export interface SectionNavItem {
  href: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  /** 현재 경로 정확 매치가 아닌 startsWith 매치 사용 */
  matchPrefix?: boolean;
}

/**
 * LNB — 섹션 내 하위 페이지 탭 네비게이션
 * 통계, 지역 비교 등 하위 페이지가 2개 이상인 섹션에 사용
 */
export function SectionNav({ items, matchPrefix = false }: SectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className={s.nav} aria-label="섹션 내 탐색">
      <div className={s.inner}>
        {items.map((item) => {
          const isActive = matchPrefix
            ? pathname.startsWith(item.href)
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${s.tab} ${isActive ? s.tabActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
