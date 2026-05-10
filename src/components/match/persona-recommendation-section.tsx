/**
 * PersonaRecommendationSection — 페르소나 추천 통합 섹션
 *
 * 진단 결과 화면(/match, /assess, /assess/result/[id], /assess/r/[data]) 4곳에서
 * 동일한 페르소나 추천 UI를 노출하기 위한 공통 컴포넌트.
 *
 * 노출 구성:
 *   1. 페르소나 카드 (시군구 추천 deep link)
 *   2. 페르소나 기반 추천 작물 (top 4, score >= 4)
 *   3. 페르소나 기반 추천 지원사업 (top 4, score >= 4, 모집중 우선)
 *
 * 미노출 조건: persona.id === "balanced" (전 차원 균등 → 추천 의미 약함)
 */

import Link from "next/link";
import { ChevronRight, Users, Sparkles } from "lucide-react";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { mapDemographicToPersona } from "@/lib/data/personas";
import {
  rankCropsForPersona,
  rankProgramsForPersona,
} from "@/lib/data/persona-fit";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import s from "./persona-recommendation-section.module.css";

interface PersonaRecommendationSectionProps {
  /** 위저드 demoAnswers.ageGroup ('youth' | '30s' | '40s' | '50s' | '60plus' | undefined) */
  ageGroup: string | undefined;
}

const PERSONA_DIM_LABELS: Record<string, string> = {
  populationTrend: "인구 추세",
  farmActivity: "농가 활성도",
  medical: "의료 인프라",
  school: "학교 인프라",
  returnFarm: "귀농 활성도",
};

export function PersonaRecommendationSection({
  ageGroup,
}: PersonaRecommendationSectionProps) {
  const recommendedPersona = mapDemographicToPersona(ageGroup);
  const showPersonaCta = recommendedPersona.id !== "balanced";

  if (!showPersonaCta) return null;

  const topDims = Object.entries(recommendedPersona.weights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k, v]) => `${PERSONA_DIM_LABELS[k]} ${v}%`);

  const personaCrops = rankCropsForPersona(CROPS, recommendedPersona.id)
    .filter((r) => r.score >= 4)
    .slice(0, 4);

  const personaPrograms = rankProgramsForPersona(PROGRAMS, recommendedPersona.id)
    .filter((r) => r.score >= 4)
    .sort((a, b) => {
      const aOpen = a.program.status === "모집중" ? 1 : 0;
      const bOpen = b.program.status === "모집중" ? 1 : 0;
      if (aOpen !== bOpen) return bOpen - aOpen;
      return b.score - a.score;
    })
    .slice(0, 4);

  return (
    <>
      {/* 페르소나 카드 — 시군구 추천 deep link */}
      <Link
        href={`/regions/ranking?persona=${recommendedPersona.id}`}
        className={s.personaCard}
        title={`${recommendedPersona.audience} · ${recommendedPersona.desc}`}
      >
        <div className={s.personaCardIcon} aria-hidden="true">
          <Users size={20} />
        </div>
        <div className={s.personaCardBody}>
          <span className={s.personaCardLabel}>당신과 어울리는 귀농 스타일</span>
          <h3 className={s.personaCardTitle}>{recommendedPersona.label}</h3>
          <p className={s.personaCardDesc}>{recommendedPersona.desc}</p>
          <p className={s.personaCardWeights}>
            <strong>{topDims.join(" · ")}</strong> 우선 반영
          </p>
        </div>
        <span className={s.personaCardCta}>
          시군구 추천 <ChevronRight size={16} />
        </span>
      </Link>

      {/* 페르소나 기반 추천 picks */}
      {(personaCrops.length > 0 || personaPrograms.length > 0) && (
        <section className={s.personaPicksSection}>
          <h2 className={s.personaPicksTitle}>
            <Sparkles size={16} />
            {recommendedPersona.label} 유형이 자주 선택하는
          </h2>

          {personaCrops.length > 0 && (
            <div className={s.personaPicksBlock}>
              <h3 className={s.personaPicksSubtitle}>추천 작물</h3>
              <div className={s.personaPicksGrid}>
                {personaCrops.map(({ crop }) => (
                  <CropLinkCard
                    key={crop.id}
                    cropId={crop.id}
                    name={crop.name}
                    href={`/crops/${crop.id}`}
                    meta={`${crop.category} · ${crop.difficulty}`}
                  />
                ))}
              </div>
            </div>
          )}

          {personaPrograms.length > 0 && (
            <div className={s.personaPicksBlock}>
              <h3 className={s.personaPicksSubtitle}>추천 지원사업</h3>
              <div className={s.personaPicksProgramList}>
                {personaPrograms.map(({ program }) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.id}`}
                    className={s.personaPickProgram}
                  >
                    <div className={s.personaPickProgramBody}>
                      <div className={s.personaPickProgramTop}>
                        <h4 className={s.personaPickProgramTitle}>
                          {program.title}
                        </h4>
                        <span
                          className={
                            program.status === "마감"
                              ? s.programStatusClosed
                              : s.programStatusOpen
                          }
                        >
                          {program.status}
                        </span>
                      </div>
                      <div className={s.personaPickProgramMeta}>
                        <span className={s.programCardBadge}>
                          {program.supportType}
                        </span>
                        <span className={s.programCardRegion}>
                          {program.region}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className={s.programCardArrow} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
