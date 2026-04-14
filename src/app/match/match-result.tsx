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
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import type { SupportProgram } from "@/lib/data/programs";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { ResultSaveCta } from "@/components/result/result-save-cta";
import type { FarmType } from "@/lib/data/match-questions";
import type { ScoredProvince, RecommendedCrop } from "@/lib/match-scoring";
import s from "./match-wizard.module.css";

interface MatchResultProps {
  farmType: FarmType;
  topProvinces: ScoredProvince[];
  recommendedCrops: RecommendedCrop[];
  recommendedPrograms: SupportProgram[];
  onReset: () => void;
}

export function MatchResult({
  farmType,
  topProvinces,
  recommendedCrops,
  recommendedPrograms,
  onReset,
}: MatchResultProps) {
  return (
    <div className={s.page}>
      {/* 유형 카드 — 최상단 */}
      <div className={s.farmTypeCard}>
        <span className={s.farmTypeEmoji}>{farmType.emoji}</span>
        <span className={s.farmTypeOverline}>당신의 귀농 유형</span>
        <h1 className={s.farmTypeLabel}>{farmType.label}</h1>
        <p className={s.farmTypeTagline}>{farmType.tagline}</p>
        <p className={s.farmTypeDesc}>{farmType.description}</p>
        <div className={s.farmTypeTraits}>
          {farmType.traits.map((t) => (
            <span key={t} className={s.farmTypeTrait}>#{t}</span>
          ))}
        </div>
      </div>

      {/* 추천 지역 */}
      <section className={s.resultSection}>
        <h2 className={s.resultSectionTitle}>
          <MapPin size={18} />
          추천 지역 Top 3
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

      {/* 추천 작물 */}
      <section className={s.resultSection}>
        <h2 className={s.resultSectionTitle}>
          <Sprout size={18} />
          추천 작물
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
        <section className={s.resultSection}>
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
                      매년 유사 시기에 재공고되는 사업입니다
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

      {/* 결과 출력/저장 CTA */}
      <ResultSaveCta printTitle="이랑 - 맞춤 귀농지 추천 결과" />

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
