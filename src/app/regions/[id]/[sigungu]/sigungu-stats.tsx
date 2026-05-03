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
  SettlementRadarChart,
} from "@/components/charts/lazy";
import { formatPopulation, SEOUL_AREA_KM2 } from "@/lib/format";
import { AreaModal } from "../modals/area-modal";
import { PopulationModal } from "../modals/population-modal";
import { MedicalModal } from "../modals/medical-modal";
import { SchoolModal } from "../modals/school-modal";
import { ReturnFarmModal } from "../modals/return-farm-modal";
import { FarmHouseholdModal } from "../modals/farm-household-modal";
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
  /** 정착 점수 (Phase 3 — 정적 모델) */
  settlementScore: {
    totalScore: number;
    dimensions: {
      farm: number;
      populationTrend: number;
      youth: number;
      density: number;
    };
    /** 전국 백분위 (0~100, 100 = 1위) */
    percentile: number | null;
    /** 시도 평균 총점 (비교용) */
    sidoAvgTotalScore: number | null;
    /** 시도 평균 차원 점수 (레이더 비교용) */
    sidoAvgDimensions: {
      farm: number;
      populationTrend: number;
      youth: number;
      density: number;
    } | null;
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
  settlementScore,
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

      {/* ── 정착 점수 (Phase 3 — 4차원 가중 평균) ── */}
      {settlementScore && (
        <section className={s.scoreSection} aria-label="정착 점수">
          <div className={s.scoreHeader}>
            <div>
              <h3 className={s.scoreSectionTitle}>정착 점수</h3>
              <p className={s.scoreSectionDesc}>
                농가·인구·청년성·거주 적정성 4개 차원의 가중 평균이에요.
              </p>
            </div>
            <div className={s.scoreSummary}>
              <span className={s.scoreSummaryValue}>
                {settlementScore.totalScore.toFixed(1)}
                <span className={s.scoreSummaryUnit}>점</span>
              </span>
              {settlementScore.percentile !== null && (
                <span className={s.scoreSummaryRank}>
                  전국 상위 {Math.max(1, 100 - settlementScore.percentile)}%
                </span>
              )}
              {settlementScore.sidoAvgTotalScore !== null && (
                <span className={s.scoreSummaryCompare}>
                  {provinceShortName} 평균{" "}
                  {settlementScore.sidoAvgTotalScore.toFixed(1)}점 대비{" "}
                  {settlementScore.totalScore >=
                  settlementScore.sidoAvgTotalScore
                    ? "+"
                    : ""}
                  {(
                    settlementScore.totalScore -
                    settlementScore.sidoAvgTotalScore
                  ).toFixed(1)}
                  점
                </span>
              )}
            </div>
          </div>
          <SettlementRadarChart
            dimensions={settlementScore.dimensions}
            sidoAvgDimensions={settlementScore.sidoAvgDimensions ?? undefined}
            sigunguName={sigunguName}
            sidoShortName={provinceShortName}
          />
          <div className={s.scoreNote}>
            <Link href="/regions/ranking" className={s.scoreLink}>
              전국 랭킹에서 비교하기 →
            </Link>
          </div>
        </section>
      )}

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
