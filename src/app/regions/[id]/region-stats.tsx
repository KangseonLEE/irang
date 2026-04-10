"use client";

import { useState } from "react";
import { Ruler, Users, Building2, GraduationCap } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { ClimateSection } from "@/components/stats/climate-section";
import type { ClimateInfo } from "@/components/stats/climate-section";
import { formatPopulation, SEOUL_AREA_KM2 } from "@/lib/format";
import { AreaModal } from "./modals/area-modal";
import { PopulationModal } from "./modals/population-modal";
import { MedicalModal } from "./modals/medical-modal";
import { SchoolModal } from "./modals/school-modal";
import s from "./page.module.css";

// re-export for sigungu-stats etc.
export type { ClimateInfo };

// ── Props 타입 (서버에서 전달) ──

export interface RegionStatsProps {
  provinceShortName: string;
  provinceName: string;
  area: number;
  population: {
    population: number;
    householdCount: number;
    agingRate: number;
  } | null;
  medical: { totalCount: number } | null;
  school: { totalCount: number } | null;
  climate: ClimateInfo | null;
  allStationNames: string[];
  // 모달 데이터 페칭에 필요한 코드
  sgisCode: string;
  hiraSidoCd: string;
  eduCode: string;
}

type ModalType = "area" | "population" | "medical" | "school" | null;

export function RegionStats({
  provinceShortName,
  provinceName,
  area,
  population,
  medical,
  school,
  climate,
  allStationNames,
  sgisCode,
  hiraSidoCd,
  eduCode,
}: RegionStatsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const closeModal = () => setActiveModal(null);

  // 서울 대비 면적 비교
  const seoulRatio = (area / SEOUL_AREA_KM2).toFixed(1);
  const density = population
    ? Math.round(population.population / area)
    : null;

  return (
    <>
      {/* ── 통계 그리드 (클릭 가능) ── */}
      <section className={s.statsGrid} aria-label="주요 통계">
        {/* 면적 */}
        <button
          type="button"
          className={s.statCard}
          onClick={() => setActiveModal("area")}
          aria-haspopup="dialog"
        >
          <Icon icon={Ruler} size="lg" variant="soft" box="lg" />
          <div className={s.statBody}>
            <span className={s.statLabel}>면적</span>
            <span className={s.statValue}>
              {area.toLocaleString()} km²
            </span>
            <span className={s.statSub}>서울의 약 {seoulRatio}배</span>
          </div>
        </button>

        {/* 인구 */}
        {population && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("population")}
            aria-haspopup="dialog"
          >
            <Icon icon={Users} size="lg" variant="soft" box="lg" />
            <div className={s.statBody}>
              <span className={s.statLabel}>인구</span>
              <span className={s.statValue}>
                {formatPopulation(population.population)}
              </span>
              <span className={s.statSub}>
                고령화율 {population.agingRate}%
              </span>
            </div>
          </button>
        )}

        {/* 의료기관 */}
        {medical && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("medical")}
            aria-haspopup="dialog"
          >
            <Icon icon={Building2} size="lg" variant="soft" box="lg" />
            <div className={s.statBody}>
              <span className={s.statLabel}>의료기관</span>
              <span className={s.statValue}>
                {medical.totalCount.toLocaleString()}개
              </span>
              <span className={s.statSub}>상세 보기 →</span>
            </div>
          </button>
        )}

        {/* 학교 */}
        {school && (
          <button
            type="button"
            className={s.statCard}
            onClick={() => setActiveModal("school")}
            aria-haspopup="dialog"
          >
            <Icon icon={GraduationCap} size="lg" variant="soft" box="lg" />
            <div className={s.statBody}>
              <span className={s.statLabel}>학교</span>
              <span className={s.statValue}>
                {school.totalCount.toLocaleString()}개
              </span>
              <span className={s.statSub}>상세 보기 →</span>
            </div>
          </button>
        )}
      </section>

      {/* ── 기후 정보 (공용 컴포넌트) ── */}
      {climate && (
        <ClimateSection
          climate={climate}
          provinceShortName={provinceShortName}
          notice={
            allStationNames.length > 1
              ? `${provinceShortName}에는 ${allStationNames.join(", ")} 관측소가 있어요. 위 수치는 ${climate.stnName} 기준이에요.`
              : undefined
          }
        />
      )}

      {/* ── 모달 ── */}
      <Modal
        open={activeModal === "area"}
        onClose={closeModal}
        title={`${provinceShortName} 면적 정보`}
      >
        <AreaModal
          provinceName={provinceName}
          provinceShortName={provinceShortName}
          area={area}
          population={population?.population ?? null}
        />
      </Modal>

      <Modal
        open={activeModal === "population"}
        onClose={closeModal}
        title={`${provinceShortName} 인구 통계`}
      >
        <PopulationModal
          provinceShortName={provinceShortName}
          population={population}
          sgisCode={sgisCode}
          density={density}
        />
      </Modal>

      <Modal
        open={activeModal === "medical"}
        onClose={closeModal}
        title={`${provinceShortName} 의료기관`}
      >
        <MedicalModal
          provinceShortName={provinceShortName}
          totalCount={medical?.totalCount ?? 0}
          hiraSidoCd={hiraSidoCd}
        />
      </Modal>

      <Modal
        open={activeModal === "school"}
        onClose={closeModal}
        title={`${provinceShortName} 학교`}
      >
        <SchoolModal
          provinceShortName={provinceShortName}
          totalCount={school?.totalCount ?? 0}
          eduCode={eduCode}
        />
      </Modal>
    </>
  );
}
