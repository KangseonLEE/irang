import type { ReactNode } from "react";

/**
 * 텍스트에서 query 부분을 <mark>로 하이라이팅 (React 엘리먼트 배열 반환)
 * @param text    원본 텍스트
 * @param query   하이라이팅할 검색어
 * @param cls     <mark>에 적용할 CSS 클래스명
 */
export function highlightMatch(
  text: string,
  query: string,
  cls?: string,
): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className={cls}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
