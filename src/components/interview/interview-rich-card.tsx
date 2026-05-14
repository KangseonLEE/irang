import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Quote, MapPin } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { getInterviewImageSrc } from "@/lib/interview-image";
import {
  hasFullStory,
  INTERVIEW_CATEGORY_LABEL,
  type InterviewCard,
} from "@/lib/data/landing";
import s from "./interview-rich-card.module.css";

/* ==========================================================================
   InterviewRichCard — 인터뷰 페이지·검색 결과 공통 풍부 카드
   상단 일러스트(3:2) + 카테고리 chip + 프로필 + 직업 변화 +
   인용문 + 푸터(지역·작물·CTA). /interviews 페이지와 /search 결과 공유.
   ========================================================================== */

interface InterviewRichCardProps {
  person: InterviewCard;
  /** 본문(인용문)에 AutoGlossary 적용 여부 (기본 true) */
  autoGlossary?: boolean;
}

export function InterviewRichCard({ person, autoGlossary = true }: InterviewRichCardProps) {
  const illustration = getInterviewImageSrc(person.id);
  const isInternal = hasFullStory(person);

  const cardInner = (
    <>
      {illustration && (
        <div className={s.cardImageWrap}>
          <Image
            src={illustration}
            alt={`${person.name}님의 농장 일러스트`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
            className={s.cardImage}
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      {/* 카테고리 chip */}
      <span className={s.cardCategoryChip}>
        {INTERVIEW_CATEGORY_LABEL[person.category]}
      </span>
      {/* 프로필 */}
      <div className={s.cardHeader}>
        {!illustration && (
          <FarmerAvatar name={person.name} seed={person.id} size="md" />
        )}
        <div className={s.cardProfile}>
          <span className={s.cardName}>{person.name}</span>
          <span className={s.cardMeta}>
            <Icon icon={MapPin} size="xs" /> {person.region} · {person.age}
          </span>
        </div>
      </div>

      {/* 직업 변화 */}
      <div className={s.cardTags}>
        <span className={s.cardTag}>
          <Icon icon={Briefcase} size="xs" />
          {person.prevJob}
        </span>
        <span className={s.cardTagArrow}>&rarr;</span>
        <span className={s.cardTag}>
          <Icon icon={Sprout} size="xs" />
          {person.currentJob}
        </span>
      </div>

      {/* 인용문 */}
      <div className={s.cardQuoteWrap}>
        <Icon icon={Quote} size="md" className={s.cardQuoteIcon} />
        <p className={s.cardQuote}>
          {autoGlossary ? <AutoGlossary text={person.quote} /> : person.quote}
        </p>
      </div>

      {/* 푸터 */}
      <div className={s.cardFooter}>
        <div className={s.cardFooterBadges}>
          <span className={s.cardRegionBadge}>
            <Icon icon={MapPin} size="xs" /> {person.region}
          </span>
          <span className={s.cardCrop}>
            <Icon icon={Sprout} size="xs" /> {person.crop}
          </span>
        </div>
        <span className={s.cardCta}>
          {isInternal ? "이야기 읽기" : `${person.sourceName} 원문`}{" "}
          <Icon icon={ArrowRight} size="sm" />
        </span>
      </div>
    </>
  );

  return isInternal ? (
    <Link href={`/interviews/${person.id}`} className={s.card}>
      {cardInner}
    </Link>
  ) : (
    <a
      href={person.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={s.card}
    >
      {cardInner}
    </a>
  );
}
