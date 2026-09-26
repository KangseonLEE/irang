import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { INTERVIEW_CATEGORY_LABEL, type InterviewCard } from "@/lib/data/landing";
import { getInterviewImageSrc } from "@/lib/interview-image";
import { highlightMatch } from "@/lib/highlight-match";

import s from "./result-card.module.css";

interface InterviewResultCardProps {
  person: InterviewCard;
  href: string;
  query: string;
  highlightCls: string;
  /** 계측 라벨 `interview:<순위>` */
  track?: string;
}

/**
 * 인터뷰 결과 — 인물 카드 (Phase C, 2026-09-26)
 *
 * 다른 유형과 같은 뼈대(아이콘 44px + 제목 + 한 줄)로는 "누구의 이야기인가"가 드러나지 않았다.
 * 원형 56px 일러 썸네일(19명 전원 보유) + 이름·지역·작물 + 인용구 `<blockquote>` 로 사람을 먼저 보여준다.
 * 썸네일은 장식이라 `alt=""` + `aria-hidden` — 정보는 옆 텍스트에 다 있다.
 */
export function InterviewResultCard({
  person,
  href,
  query,
  highlightCls,
  track,
}: InterviewResultCardProps): ReactNode {
  const thumb = getInterviewImageSrc(person.id);
  const titleStr = `${person.name} · ${person.region}`;
  const categoryLabel = INTERVIEW_CATEGORY_LABEL[person.category];

  return (
    <article className={s.cardPerson} data-search-result={track}>
      <span className={s.avatar} aria-hidden="true">
        {thumb ? (
          <Image src={thumb} alt="" width={56} height={56} />
        ) : (
          <span className={s.avatarFallback}>{"\u{1F464}"}</span>
        )}
      </span>
      <Link href={href} className={s.personTitleCell} aria-label={titleStr}>
        <span className={s.title}>{highlightMatch(titleStr, query, highlightCls)}</span>
      </Link>
      <blockquote className={s.quote}>
        {highlightMatch(`“${person.quote}”`, query, highlightCls)}
      </blockquote>
      <div className={s.metaRow}>
        {person.crop && <span className={s.metaChip}>{person.crop}</span>}
        {person.age && (
          <>
            <span className={s.metaSep} aria-hidden="true">·</span>
            <span className={s.metaItem}>{person.age}</span>
          </>
        )}
      </div>
      {categoryLabel && <span className={s.badge}>{categoryLabel}</span>}
    </article>
  );
}
