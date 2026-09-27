import type { ReactNode } from "react";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * 텍스트에서 검색어를 <mark>로 하이라이팅 (React 엘리먼트 배열 반환)
 *
 * 9/28 QA: "전남 귀농"·"충북 서산"처럼 띄어 쓴 복합어는 원문에 그 어구가 통째로 없어 mark 0 이었다.
 * 어절 단위로 나눠 각각 매칭한다(긴 어절 우선, 1자 어절은 제외 — 조사·한 글자 잡음).
 * @param text    원본 텍스트
 * @param query   하이라이팅할 검색어
 * @param cls     <mark>에 적용할 CSS 클래스명
 */
export function highlightMatch(
  text: string,
  query: string,
  cls?: string,
): ReactNode {
  const terms = [...new Set(query.trim().split(/\s+/).filter(Boolean))];
  const usable = terms.length === 1 ? terms : terms.filter((t) => t.length >= 2);
  if (usable.length === 0) return text;
  const pattern = usable
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|");
  const splitter = new RegExp(`(${pattern})`, "gi");
  const tester = new RegExp(`^(?:${pattern})$`, "i");
  const parts = text.split(splitter);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    tester.test(part) ? (
      <mark key={i} className={cls}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
