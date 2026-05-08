/**
 * 맞춤 추천 위저드 — 결과 화면
 *
 * match-wizard.tsx에서 분리한 결과 표시 컴포넌트.
 * 귀농 유형, 추천 지역, 추천 작물, 추천 지원사업을 보여줍니다.
 */

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  RotateCcw,
  FileText,
  Users,
  Sparkles,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS, type SupportProgram } from "@/lib/data/programs";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { ShareButtons } from "@/components/share/share-buttons";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import type { FarmType } from "@/lib/data/match-questions";
import { PersonalizedRoadmap } from "@/components/match/personalized-roadmap";
import { mapDemographicToPersona } from "@/lib/data/personas";
import {
  rankCropsForPersona,
  rankProgramsForPersona,
} from "@/lib/data/persona-fit";
import type { ScoredProvince, RecommendedCrop } from "@/lib/match-scoring";
import s from "./match-wizard.module.css";

interface MatchResultProps {
  farmType: FarmType;
  topProvinces: ScoredProvince[];
  recommendedCrops: RecommendedCrop[];
  recommendedPrograms: SupportProgram[];
  resultId: string | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  ageGroup?: string;
  onReset: () => void;
}

export function MatchResult({
  farmType,
  topProvinces,
  recommendedCrops,
  recommendedPrograms,
  resultId,
  saveStatus,
  ageGroup,
  onReset,
}: MatchResultProps) {
  const recommendedPersona = mapDemographicToPersona(ageGroup);
  const showPersonaCta = recommendedPersona.id !== "balanced";

  // 페르소나의 가장 큰 가중치 2개 차원 추출 (사용자에게 어떤 점이 강조되는지 안내)
  const PERSONA_DIM_LABELS: Record<string, string> = {
    populationTrend: "인구 추세",
    farmActivity: "농가 활성도",
    medical: "의료 인프라",
    school: "학교 인프라",
    returnFarm: "귀농 활성도",
  };
  const topDims = Object.entries(recommendedPersona.weights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k, v]) => `${PERSONA_DIM_LABELS[k]} ${v}%`);

  // 페르소나 기반 추천 작물·사업 (점수 4 이상만)
  const personaCrops = showPersonaCta
    ? rankCropsForPersona(CROPS, recommendedPersona.id)
        .filter((r) => r.score >= 4)
        .slice(0, 4)
    : [];
  const personaPrograms = showPersonaCta
    ? rankProgramsForPersona(PROGRAMS, recommendedPersona.id)
        .filter((r) => r.score >= 4)
        // 모집중 우선
        .sort((a, b) => {
          const aOpen = a.program.status === "모집중" ? 1 : 0;
          const bOpen = b.program.status === "모집중" ? 1 : 0;
          if (aOpen !== bOpen) return bOpen - aOpen;
          return b.score - a.score;
        })
        .slice(0, 4)
    : [];

  return (
    <div className={s.page}>
      {/* 유형 카드 — 최상단 */}
      <div className={s.farmTypeCard}>
        <span className={s.farmTypeEmoji}>{farmType.emoji}</span>
        <span className={s.farmTypeOverline}>나의 귀농 유형</span>
        <h1 className={s.farmTypeLabel}>{farmType.label}</h1>
        <p className={s.farmTypeTagline}>{farmType.tagline}</p>
        <p className={s.farmTypeDesc}>{farmType.description}</p>
        <div className={s.farmTypeTraits}>
          {farmType.traits.map((t) => (
            <span key={t} className={s.farmTypeTrait}>#{t}</span>
          ))}
        </div>
      </div>

      <ReferenceNotice text="유형 분류와 추천 정보는 공공데이터 기반 참고 가이드예요. 최종 결정은 현지 방문과 전문가 상담을 권장해요." />

      {/* 추천 지역 */}
      <section className={s.resultSection}>
        <h2 className={s.resultSectionTitle}>
          <MapPin size={18} />
          {farmType.label}에 어울리는 지역
        </h2>
        <div className={s.resultCards}>
          {topProvinces.map((sp, i) => (
            <Link
              key={sp.province.id}
              href={`/regions/${sp.province.id}`}
              className={s.resultCard}
            >
              <div className={s.resultCardRank}>
                {i + 1}
              </div>
              <div className={s.resultCardBody}>
                <h3 className={s.resultCardTitle}>{sp.province.shortName}</h3>
                <p className={s.resultCardDesc}>
                  {sp.province.description}
                </p>
                {sp.matchReasons.length > 0 && (
                  <div className={s.resultCardTags}>
                    {sp.matchReasons.slice(0, 4).map((r) => (
                      <span key={r} className={s.resultCardTag}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
                <span className={s.resultCardLink}>
                  상세 보기 <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 페르소나 추천 — 시군구 추천 deep link */}
      {showPersonaCta && (
        <Link
          href={`/regions/ranking?persona=${recommendedPersona.id}`}
          className={s.personaCard}
          title={`${recommendedPersona.audience} · ${recommendedPersona.desc}`}
        >
          <div className={s.personaCardIcon} aria-hidden="true">
            <Users size={20} />
          </div>
          <div className={s.personaCardBody}>
            <span className={s.personaCardLabel}>당신과 어울리는 페르소나</span>
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
      )}

      {/* 페르소나 기반 추천 — 작물 + 사업 (balanced 제외) */}
      {showPersonaCta && (personaCrops.length > 0 || personaPrograms.length > 0) && (
        <section className={s.personaPicksSection}>
          <h2 className={s.personaPicksTitle}>
            <Sparkles size={16} />
            {recommendedPersona.label}이 자주 선택하는
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
                        <h4 className={s.personaPickProgramTitle}>{program.title}</h4>
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
                        <span className={s.programCardBadge}>{program.supportType}</span>
                        <span className={s.programCardRegion}>{program.region}</span>
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

      {/* 추천 작물 */}
      <section className={s.resultSection}>
        <h2 className={s.resultSectionTitle}>
          <Sprout size={18} />
          {farmType.label}에 적합한 작물
        </h2>
        <div className={s.cropCards}>
          {recommendedCrops.map((rc) => (
            <CropLinkCard
              key={rc.crop.id}
              cropId={rc.crop.id}
              name={rc.crop.name}
              href={`/crops/${rc.crop.id}`}
              meta={`${rc.crop.category} · 난이도 ${rc.crop.difficulty}${rc.reasons.length > 0 ? ` · ${rc.reasons.join(" · ")}` : ""}`}
            />
          ))}
        </div>
      </section>

      {/* 추천 지원사업 */}
      {recommendedPrograms.length > 0 && (
        <section className={`${s.resultSection} ${s.programSection}`}>
          <h2 className={s.resultSectionTitle}>
            <FileText size={18} />
            {farmType.label}에 맞는 지원사업
          </h2>
          <div className={s.programCards}>
            {recommendedPrograms.map((prog) => (
              <Link
                key={prog.id}
                href={`/programs/${prog.id}`}
                className={s.programCard}
              >
                <div className={s.programCardBody}>
                  <div className={s.programCardTitleRow}>
                    <h3 className={s.programCardTitle}>{prog.title}</h3>
                    <span
                      className={
                        prog.status === "마감"
                          ? s.programStatusClosed
                          : s.programStatusOpen
                      }
                    >
                      {prog.status}
                    </span>
                  </div>
                  <p className={s.programCardDesc}>{prog.summary}</p>
                  {prog.status === "마감" && (
                    <p className={s.programClosedHint}>
                      매년 유사 시기에 재공고되는 사업이에요
                    </p>
                  )}
                  <div className={s.programCardMeta}>
                    <span className={s.programCardBadge}>{prog.supportType}</span>
                    <span className={s.programCardRegion}>{prog.region}</span>
                  </div>
                </div>
                <ChevronRight size={16} className={s.programCardArrow} />
              </Link>
            ))}
          </div>
          <Link href="/programs" className={s.programViewAll}>
            전체 지원사업 보기 <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* 공유 버튼 */}
      {/* 맞춤 로드맵 */}
      <PersonalizedRoadmap
        farmTypeId={farmType.id}
        farmTypeLabel={farmType.label}
      />

      {resultId && saveStatus === "saved" && (
        <ShareButtons resultId={resultId} farmTypeLabel={farmType.label} />
      )}
      {saveStatus === "saving" && (
        <p className={s.savingHint}>결과를 저장하고 있어요...</p>
      )}

      {/* 액션 버튼 */}
      <div className={s.resultActions}>
        <button onClick={onReset} className={s.resetBtn}>
          <RotateCcw size={16} />
          다시 시작하기
        </button>
        <Link href="/regions" className={s.exploreBtn}>
          전체 지역 탐색
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
