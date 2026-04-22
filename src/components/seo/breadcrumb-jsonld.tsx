import { JsonLd } from "./json-ld";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

const BASE_URL = "https://irangfarm.com";

/**
 * BreadcrumbList JSON-LD 구조화 데이터.
 *
 * Google 검색 결과에 경로 탐색(breadcrumb) 표시를 유도한다.
 * `items` 배열은 **홈을 제외**한 경로만 전달하면 되며,
 * 홈("이랑")은 자동으로 첫 번째 항목으로 삽입된다.
 *
 * @example
 * ```tsx
 * <BreadcrumbJsonLd items={[
 *   { name: "작물 정보", href: "/crops" },
 *   { name: "딸기", href: "/crops/strawberry" },
 * ]} />
 * ```
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const all: BreadcrumbItem[] = [{ name: "이랑", href: "/" }, ...items];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: all.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          item: `${BASE_URL}${item.href}`,
        })),
      }}
    />
  );
}
