"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ruler,
  Users,
  Building2,
  GraduationCap,
  Sprout,
  Home,
  Tractor,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { ClimateSection } from "@/components/stats/climate-section";
import type { ClimateInfo } from "@/components/stats/climate-section";
import {
  SigunguPopulationTrendChart,
} from "@/components/charts/lazy";
import { formatPopulation, SEOUL_AREA_KM2 } from "@/lib/format";
import { AreaModal } from "../modals/area-modal";
import { PopulationModal } from "../modals/population-modal";
import { MedicalModal } from "../modals/medical-modal";
import { SchoolModal } from "../modals/school-modal";
import { ReturnFarmModal } from "../modals/return-farm-modal";
import { FarmHouseholdModal } from "../modals/farm-household-modal";
import { PersonaScorePicker } from "./persona-score-picker";
import s from "./page.module.css";

// ── Props (서버 컴포넌트에서 전달) ──

export type { ClimateInfo };

export interface SigunguStatsProps {
  provinceShortName: string;
  provinceName: string;
  sigunguName: string;
  area: number;
  population: {
    population: number;
    householdCount: number;
    agingRate: number;
  } | null;
  isPopulationFallback: boolean;
  medical: { totalCount: number } | null;
  isMedicalFallback: boolean;
  school: { totalCount: number } | null;
  isSchoolFallback: boolean;
  returnFarm: {
    returnFarmPerson: number;
    returnFarmHousehold: number;
    returnRuralPerson: number;
    year: number;
  } | null;
  climate: ClimateInfo | null;
  hasFallback: boolean;
  /** 농가 통계 (SGIS 농림어업총조사 2020) */
  farm: {
    farmCount: number;
    farmPopulation: number;
    avgPopulation: number;
    isFallback: boolean;
  } | null;
  /** 같은 시도 평균 가구원수 (비교용) */
  sidoFarmAvgPopulation: number | null;
  /** 시도 평균 대비 가구원수 차이(%, 양수=많음) */
  farmRatioVsSido: number | null;
  /** 인구 5년 추이 (정적 폴백 — SGIS 인구통계) */
  populationTrend: Array<{
    year: number;
    population: number;
    sidoAvg?: number;
  }>;
  /** 인구 추이 연도 (예: [2018,2019,2020,2021,2022]) */
  populationTrendYears: number[];
  /** 인구 5년 변화율 (%, 양수=증가) */
  populationChangePct: number | null;
  /**
   * 차원별 5점수 (Phase 4 — 정적 분위 모델).
   * null = 도시 자치구 또는 데이터 부재 (UI에서 카드 hide).
   */
  dimensionScores: {
    /** 인구 추세 점수 (0~100). 5년 변화율 선형 정규화 */
    populationTrend: number | null;
    /** 농가 활성도 분위 (1~100). 도시 자치구 null */
    farmActivity: number | null;
    /** 의료 인프라 분위 (1~100) */
    medical: number | null;
    /** 학교 인프라 분위 (1~100). 군위 null */
    school: number | null;
    /** 귀농 활성도 분위 (1~100). 도시 자치구 null */
    returnFarm: number | null;
  } | null;
  // 모달 데이터 페칭용 코드
  sgisCode: string;
  hiraSidoCd: string;
  hiraSgguCd: string;
  eduCode: string;
  sigunguNameForNeis: string;
  /** KOSIS 행정코드 (귀농귀촌 추이 모달용) */
  admCode?: string;
}

type ModalType =
  | "area"
  | "population"
  | "medical"
  | "school"
  | "returnFarm"
  | "farm"
  | null;

export function SigunguStats({
  provinceShortName,
  provinceName,
  sigunguName,
  area,
  population,
  isPopulationFallback,
  medical,
  isMedicalFallback,
  school,
  isSchoolFallback,
  returnFarm,
  climate,
  hasFallback,
  farm,
  sidoFarmAvgPopulation,
  farmRatioVsSido,
  populationTrend,
  populationTrendYears,
  populationChangePct,
  dimensionScores,
  sgisCode,
  hiraSidoCd,
  hiraSgguCd,
  eduCode,
  sigunguNameForNeis,
  admCode,
}: SigunguStatsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = () => setActiveModal(null);

  const seoulRatio = (area / SEOUL_AREA_KM2).toFixed(1);
  const density = population ? Math.round(population.population / area) : null;

  // 트렌드 배지 분류 (5년 변화율 기준)
  const trendBadge: {
    label: string;
    color: string;
    bg: string;
  } | null = (() => {
    if (populationChangePct === null) return null;
    const v = populationChangePct;
    if (v >= 1) {
      return {
        label: `회복 중 +${v.toFixed(1)}%`,
        color: "#059669",
        bg: "color-mix(in srgb, #059669 12%, transparent)",
      };
    }
    if (v <= -5) {
      return {
        label: `가속 감소 ${v.toFixed(1)}%`,
        color: "#d97706",
        bg: "color-mix(in srgb, #d97706 12%, transparent)",
      };
    }
    return {
      label: `안정 ${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
      color: "var(--muted-foreground)",
      bg: "var(--muted)",
    };
  })();

  const hasTrendChart = populationTrend.length >= 2;
  const trendYearStart = populationTrendYears[0];
  const trendYearEnd = populationTrendYears[populationTrendYears.length - 1];

  return (
    <>
      {/* ── Stats Grid (클릭 가능) ── */}
      <section className={s.statsGrid} aria-label="주요 통계">
        <button
          type="button"
          className={s.statCard}
          onClick={() => setActiveModal("area")}
          aria-haspopup="dialog"
        >
          <Icon icon={Ruler} size="lg"  />
          <div className={s.statBody}>
            <span className={s.statLabel}>면적</span>
            <span className={s.statValue}>{area.toLocaleString()} km²</span>
            <span className={s.statSub}>서울의 약 {seoulRatio}배</span>
          </div>
        </button>

        {population && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("population")}
            aria-haspopup="dialog"
          >
            <Icon icon={Users} size="lg"  />
            <div className={s.statBody}>
              <span className={s.statLabel}>실거주 인구</span>
              <span className={s.statValue}>{formatPopulation(population.population)}</span>
              <span className={s.statSub}>
                고령화율 {population.agingRate}%
                {isPopulationFallback && (
                  <>
                    <br />({provinceShortName} 기준)
                  </>
                )}
              </span>
            </div>
          </button>
        )}

        {medical && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("medical")}
            aria-haspopup="dialog"
          >
            <Icon icon={Building2} size="lg"  />
            <div className={s.statBody}>
              <span className={s.statLabel}>의료기관</span>
              <span className={s.statValue}>{medical.totalCount.toLocaleString()}개</span>
              <span className={s.statSub}>
                {isMedicalFallback ? `${provinceShortName} 기준 ·` : ""} 상세 보기 →
              </span>
            </div>
          </button>
        )}

        {school && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("school")}
            aria-haspopup="dialog"
          >
            <Icon icon={GraduationCap} size="lg"  />
            <div className={s.statBody}>
              <span className={s.statLabel}>학교</span>
              <span className={s.statValue}>{school.totalCount.toLocaleString()}개</span>
              <span className={s.statSub}>
                {isSchoolFallback ? `${provinceShortName} 기준 ·` : ""} 상세 보기 →
              </span>
            </div>
          </button>
        )}

        {farm && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("farm")}
            aria-haspopup="dialog"
          >
            <Icon icon={Tractor} size="lg" />
            <div className={s.statBody}>
              <span className={s.statLabel}>농가</span>
              <span className={s.statValue}>
                {farm.farmCount.toLocaleString()}호
              </span>
              <span className={s.statSub}>
                가구당 {farm.avgPopulation.toFixed(1)}명
                {farmRatioVsSido !== null && farmRatioVsSido !== 0 && (
                  <>
                    {" · "}
                    {provinceShortName} 평균 대비{" "}
                    {farmRatioVsSido > 0 ? "+" : ""}
                    {farmRatioVsSido}%
                  </>
                )}
              </span>
            </div>
          </button>
        )}

        {returnFarm && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("returnFarm")}
            aria-haspopup="dialog"
          >
            <Icon icon={Sprout} size="lg" />
            <div className={s.statBody}>
              <span className={s.statLabel}>귀농</span>
              <span className={s.statValue}>
                {returnFarm.returnFarmPerson.toLocaleString()}명
              </span>
              <span className={s.statSub}>
                {returnFarm.returnFarmHousehold.toLocaleString()}가구 · {returnFarm.year}년 기준
              </span>
            </div>
          </button>
        )}

        {returnFarm && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("returnFarm")}
            aria-haspopup="dialog"
          >
            <Icon icon={Home} size="lg" />
            <div className={s.statBody}>
              <span className={s.statLabel}>귀촌</span>
              <span className={s.statValue}>
                {returnFarm.returnRuralPerson.toLocaleString()}명
              </span>
              <span className={s.statSub}>
                {returnFarm.year}년 기준 · 상세 보기 →
              </span>
            </div>
          </button>
        )}
      </section>

      {/* ── 인구 5년 추이 ── */}
      {hasTrendChart && (
        <section className={s.trendSection} aria-label="인구 5년 추이">
          <div className={s.trendHeader}>
            <div>
              <h3 className={s.trendTitle}>인구 5년 추이</h3>
              <p className={s.trendDesc}>
                {trendYearStart}년부터 {trendYearEnd}년까지 {sigunguName} 인구
                변화예요.
              </p>
            </div>
            {trendBadge && (
              <span
                className={s.trendBadge}
                style={{
                  color: trendBadge.color,
                  background: trendBadge.bg,
                }}
              >
                {trendBadge.label}
              </span>
            )}
          </div>
          <SigunguPopulationTrendChart
            data={populationTrend}
            sigunguName={sigunguName}
            showSidoCompare
          />
        </section>
      )}

      {/* ── 차원별 5점수 (Phase 4 — 전국 분위 정규화) ── */}
      {dimensionScores && (
        <section className={s.scoreSection} aria-label="차원별 점수">
          <div className={s.scoreHeader}>
            <div>
              <h3 className={s.scoreSectionTitle}>{sigunguName} 차원별 점수</h3>
              <p className={s.scoreSectionDesc}>
                전국에서 어디쯤인지 5가지 차원으로 보여드려요.
              </p>
            </div>
          </div>
          <div className={s.dimensionGrid}>
            {dimensionScores.populationTrend !== null && (
              <DimensionCard
                label="인구 추세"
                score={dimensionScores.populationTrend}
                kind="trend"
                changePct={populationChangePct}
              />
            )}
            {dimensionScores.farmActivity !== null && (
              <DimensionCard
                label="농가 활성도"
                score={dimensionScores.farmActivity}
                kind="percentile"
              />
            )}
            {dimensionScores.medical !== null && (
              <DimensionCard
                label="의료 인프라"
                score={dimensionScores.medical}
                kind="percentile"
              />
            )}
            {dimensionScores.school !== null && (
              <DimensionCard
                label="학교 인프라"
                score={dimensionScores.school}
                kind="percentile"
              />
            )}
            {dimensionScores.returnFarm !== null && (
              <DimensionCard
                label="귀농 활성도"
                score={dimensionScores.returnFarm}
                kind="percentile"
              />
            )}
          </div>
          <p className={s.scoreFootnote}>
            <Link href="/regions/ranking/methodology" className={s.scoreLink}>
              점수는 어떻게 만들었나요? →
            </Link>
          </p>
        </section>
      )}

      {/* ── 페르소나별 종합 점수 (Phase 5) ── */}
      <PersonaScorePicker
        dimensionScores={dimensionScores}
        sigunguName={sigunguName}
      />


      {/* ── 기후 정보 (공용 컴포넌트) ── */}
      {climate && (
        <ClimateSection
          climate={climate}
          provinceShortName={provinceShortName}
          notice={`시군구별 기상 관측소가 없어 ${provinceShortName} 대표 관측소 데이터를 표시해요.`}
        />
      )}

      {hasFallback && (
        <p className={s.fallbackNotice}>
          일부 데이터는 시군구 수준 제공이 불가하여 {provinceShortName} 기준으로 표시돼요.
        </p>
      )}

      {/* ── 모달 ── */}
      <Modal open={activeModal === "area"} onClose={closeModal} title={`${sigunguName} 면적 정보`}>
        <AreaModal
          provinceName={provinceName}
          provinceShortName={sigunguName}
          area={area}
          population={population?.population ?? null}
        />
      </Modal>

      <Modal open={activeModal === "population"} onClose={closeModal} title={`${sigunguName} 인구 통계`}>
        <PopulationModal
          provinceShortName={sigunguName}
          population={population}
          sgisCode={sgisCode}
          density={density}
        />
      </Modal>

      <Modal open={activeModal === "medical"} onClose={closeModal} title={`${sigunguName} 의료기관`}>
        <MedicalModal
          provinceShortName={sigunguName}
          totalCount={medical?.totalCount ?? 0}
          hiraSidoCd={hiraSidoCd}
          sgguCd={hiraSgguCd}
        />
      </Modal>

      <Modal open={activeModal === "school"} onClose={closeModal} title={`${sigunguName} 학교`}>
        <SchoolModal
          provinceShortName={sigunguName}
          totalCount={school?.totalCount ?? 0}
          eduCode={eduCode}
          sigunguName={sigunguNameForNeis}
        />
      </Modal>

      {returnFarm && admCode && (
        <Modal open={activeModal === "returnFarm"} onClose={closeModal} title={`${sigunguName} 귀농·귀촌`}>
          <ReturnFarmModal
            returnFarm={returnFarm}
            regionCode={admCode}
            sigunguName={sigunguName}
          />
        </Modal>
      )}

      {farm && (
        <Modal
          open={activeModal === "farm"}
          onClose={closeModal}
          title={`${sigunguName} 농가 통계`}
        >
          <FarmHouseholdModal
            sigunguName={sigunguName}
            provinceShortName={provinceShortName}
            farm={farm}
            sidoAvgPopulation={sidoFarmAvgPopulation}
            ratioVsSido={farmRatioVsSido}
          />
        </Modal>
      )}
    </>
  );
}

// ── 차원별 점수 카드 (Phase 4) ──

interface DimensionCardProps {
  label: string;
  /** 0~100 점수 (분위 또는 절대값) */
  score: number;
  /** 'trend' = 인구 추세 (점수 + 변화율), 'percentile' = 전국 분위 */
  kind: "trend" | "percentile";
  /** kind='trend' 일 때 5년 변화율 (%, 양수=증가) */
  changePct?: number | null;
}

function DimensionCard({ label, score, kind, changePct }: DimensionCardProps) {
  // 분위 → 어르신 친화 카피
  let summary: string;
  if (kind === "trend") {
    if (changePct === null || changePct === undefined) {
      summary = `${score}점`;
    } else if (changePct >= 1) {
      summary = `회복 중 +${changePct.toFixed(1)}%`;
    } else if (changePct <= -5) {
      summary = `가속 감소 ${changePct.toFixed(1)}%`;
    } else {
      summary = `안정 ${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}%`;
    }
  } else {
    // 점수 50 이상은 평균 위 → "상위 N%", 50 미만은 평균 아래 → "하위 N%"로 솔직하게
    if (score >= 50) {
      const topPct = Math.max(1, 100 - score);
      summary = `전국 상위 ${topPct}%`;
    } else {
      const bottomPct = Math.max(1, score);
      summary = `전국 하위 ${bottomPct}%`;
    }
  }

  // 색상: 분위 또는 점수에 따라
  const tone = score >= 70 ? "high" : score >= 40 ? "mid" : "low";

  return (
    <div className={s.dimensionCard} data-tone={tone}>
      <span className={s.dimensionLabel}>{label}</span>
      <div className={s.dimensionValueRow}>
        <span className={s.dimensionValue}>{score}</span>
        <span className={s.dimensionUnit}>점</span>
      </div>
      <div className={s.dimensionBar} aria-hidden="true">
        <span
          className={s.dimensionBarFill}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={s.dimensionSummary}>{summary}</span>
    </div>
  );
}
