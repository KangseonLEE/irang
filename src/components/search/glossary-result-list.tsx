import Link from "next/link";
import type { ReactNode } from "react";

import type { SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import { glossaryMap, CATEGORY_LABELS } from "@/lib/data/glossary";

import s from "./glossary-result-list.module.css";

/**
 * 용어 결과 — 정의 리스트 (Phase C, 2026-09-26)
 *
 * 용어는 "이게 무슨 뜻인가" 한 줄이면 끝이라 카드 뼈대(아이콘 44px + 배지 + 칩)가 과했다.
 * `<dl>` 로 용어–정의 관계를 그대로 표현하고 한 항목을 두 줄로 줄인다.
 * (`<dl>` 안의 `<div>` 묶음은 HTML 표준 — 계측 속성을 항목 단위로 붙일 수 있다.)
 */
export function GlossaryResultList({
  items,
  query,
  highlightCls,
  rankOffset = 0,
  trackType = "glossary",
}: {
  items: SearchItem[];
  query: string;
  highlightCls: string;
  /** 계측 순위 시작값 (섹션 안 1-based) */
  rankOffset?: number;
  /** 계측 라벨의 타입 부분 — 직답 블록에서는 "pinned" */
  trackType?: string;
}): ReactNode {
  return (
    <dl className={s.list}>
      {items.map((item, i) => {
        const entry = glossaryMap.get(item.id);
        const term = entry?.term ?? item.title;
        const desc = entry?.shortDesc ?? item.subtitle;
        const aliases = entry?.aliases?.slice(0, 2) ?? [];

        return (
          <div
            key={`${item.type}-${item.id}`}
            className={s.entry}
            data-search-result={`${trackType}:${rankOffset + i + 1}`}
          >
            <dt className={s.term}>
              <Link href={item.href} className={s.termLink} aria-label={term}>
                {highlightMatch(term, query, highlightCls)}
              </Link>
              {entry && <span className={s.category}>{CATEGORY_LABELS[entry.category]}</span>}
              {aliases.length > 0 && <span className={s.alias}>= {aliases.join(", ")}</span>}
            </dt>
            <dd className={s.desc}>{highlightMatch(desc, query, highlightCls)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
