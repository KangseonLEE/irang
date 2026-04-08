"use client";

import { useState } from "react";
import { Ruler, Users, Building2, GraduationCap } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ClimateSection } from "@/components/stats/climate-section";
import type { ClimateInfo } from "@/components/stats/climate-section";
import { formatPopulation, SEOUL_AREA_KM2 } from "@/lib/format";
import { AreaModal } from "../modals/area-modal";
import { PopulationModal } from "../modals/population-modal";
import { MedicalModal } from "../modals/medical-modal";
import { SchoolModal } from "../modals/school-modal";
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
  climate: ClimateInfo | null;
  hasFallback: boolean;
  // 모달 데이터 페칭용 코드
  sgisCode: string;
  hiraSidoCd: string;
  hiraSgguCd: string;
  eduCode: string;
  sigunguNameForNeis: string;
}

type ModalType = "area" | "population" | "medical" | "school" | null;

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
  climate,
  hasFallback,
  sgisCode,
  hiraSidoCd,
  hiraSgguCd,
  eduCode,
  sigunguNameForNeis,
}: SigunguStatsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = () => setActiveModal(null);

  const seoulRatio = (area / SEOUL_AREA_KM2).toFixed(1);
  const density = population ? Math.round(population.population / area) : null;

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
          <div className={s.statIcon}><Ruler size={18} /></div>
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
            <div className={s.statIcon}><Users size={18} /></div>
            <div className={s.statBody}>
              <span className={s.statLabel}>인구</span>
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
            <div className={s.statIcon}><Building2 size={18} /></div>
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
            <div className={s.statIcon}><GraduationCap size={18} /></div>
            <div className={s.statBody}>
              <span className={s.statLabel}>학교</span>
              <span className={s.statValue}>{school.totalCount.toLocaleString()}개</span>
              <span className={s.statSub}>
                {isSchoolFallback ? `${provinceShortName} 기준 ·` : ""} 상세 보기 →
              </span>
            </div>
          </button>
        )}
      </section>

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
          일부 데이터는 시군구 수준 제공이 불가하여 {provinceShortName} 기준으로 표시됩니다.
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
    </>
  );
}
