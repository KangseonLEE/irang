import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./json-ld";
import type { BreadcrumbList as BreadcrumbListSchema } from "schema-dts";
import { Icon } from "@/components/ui/icon";
import s from "./breadcrumbs.module.css";

const BASE_URL = "https://irangfarm.com";

export interface BreadcrumbItem {
  /** 표시 이름 */
  label: string;
  /** 링크 경로 (없으면 현재 페이지 — 마지막 항목) */
  href?: string;
}

/**
 * 시각적 breadcrumb 네비게이션 + BreadcrumbList JSON-LD.
 *
 * "홈" 항목은 자동으로 맨 앞에 추가된다.
 * 마지막 항목은 현재 페이지로 간주하여 링크 없이 렌더링한다.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: "지역", href: "/regions" },
 *     { label: "전라남도" },
 *   ]}
 * />
 * ```
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  // "홈"을 포함한 전체 breadcrumb 목록
  const allItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    ...items,
  ];

  // JSON-LD용 BreadcrumbList
  const jsonLdData = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd<BreadcrumbListSchema> data={jsonLdData} />
      <nav className={s.nav} aria-label="현재 위치">
        <ol className={s.list}>
          {allItems.map((crumb, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className={s.item}>
                {index > 0 && (
                  <Icon icon={ChevronRight} size="sm" className={s.separator} />
                )}
                {isLast || !crumb.href ? (
                  <span className={s.current} aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className={s.link}>
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
