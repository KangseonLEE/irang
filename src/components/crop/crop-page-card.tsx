import Image from "next/image";
import Link from "next/link";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { PersonaScoreExplain } from "@/components/persona/persona-score-explain";
import type { CropInfo } from "@/lib/data/crops";
import type { FitTrace } from "@/lib/data/persona-fit";
import { getCropImageSrc } from "@/lib/crop-image";
import s from "./crop-page-card.module.css";

/* ==========================================================================
   CropPageCard — 작물 페이지·검색 결과 공통 풍부 카드
   상단 정사각 이미지(카테고리 칩) + 하단 텍스트(이름·난이도·재배시기·설명)
   /crops 페이지 그리드와 /search 결과의 작물 섹션에서 공유.
   ========================================================================== */

const DIFFICULTY_CLASS: Record<string, string> = {
  쉬움: s.difficultyEasy,
  보통: s.difficultyMedium,
  어려움: s.difficultyHard,
};

interface CropPageCardProps {
  crop: CropInfo;
  /** 페르소나 모드일 때 점수 explain row 표시 (선택) */
  trace?: FitTrace;
  /** 본문 설명에 AutoGlossary 적용 여부 (기본 true) */
  autoGlossary?: boolean;
}

export function CropPageCard({ crop, trace, autoGlossary = true }: CropPageCardProps) {
  const cardLink = (
    <Link href={`/crops/${crop.id}`} className={s.cropCard}>
      <div className={s.cropCardImageWrap}>
        <Image
          src={getCropImageSrc(crop.id)}
          alt={`${crop.name} 작물 사진`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={s.cropCardImage}
          style={{ objectFit: "cover" }}
        />
        <span className={s.cropCardCategory}>{crop.category}</span>
      </div>

      <div className={s.cropCardContent}>
        <div className={s.cropCardNameRow}>
          <h3 className={s.cropCardName}>{crop.name}</h3>
          <span
            className={`${s.difficultyBadge} ${DIFFICULTY_CLASS[crop.difficulty] ?? s.difficultyMedium}`}
          >
            난이도 · {crop.difficulty}
          </span>
        </div>

        <p className={s.cropCardSeason}>{crop.growingSeason}</p>

        <p className={s.cropCardDesc}>
          {autoGlossary ? <AutoGlossary text={crop.description} /> : crop.description}
        </p>
      </div>
    </Link>
  );

  // 페르소나 모드: 카드 + explain row를 column wrapper로 묶음 (a 태그 nesting 방지)
  if (trace) {
    return (
      <article className={s.cropCellPersona}>
        {cardLink}
        <PersonaScoreExplain trace={trace} subject="이 작물" />
      </article>
    );
  }

  return cardLink;
}
