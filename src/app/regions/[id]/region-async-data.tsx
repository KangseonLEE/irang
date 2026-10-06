/**
 * 도 상세 페이지 — API 의존 비동기 데이터 섹션
 *
 * page.tsx의 정적 콘텐츠(Hero, 작물, 사이드바)와 분리하여
 * <Suspense>로 감싸면 정적 부분이 먼저 스트리밍되고,
 * 이 컴포넌트는 API 응답 후 채워집니다.
 *
 * 외부 API 6종(기후 · 인구 · 의료 · 학교 · 시군구 인구 · 시군구 농가)을 병렬 호출합니다.
 * 지원사업 · 교육 · 체험·행사 목록은 page.tsx 가 먼저 불러 props 로 넘긴다 — 섹션 탭이
 * "실제로 있는 섹션"만 가리키려면 탭을 그리는 쪽이 목록 개수를 알아야 해서다 (10/6 QA1).
 */

import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Calendar,
  MapPin,
  LandPlot,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { programStatusLabel } from "@/lib/program-status";
import { RegionStats } from "./region-stats";
import { LandCheckBox } from "@/components/region/land-check-box";
import { DataSource } from "@/components/ui/data-source";
import { SigunguExplorer } from "@/components/region/sigungu-explorer";
import type { Province } from "@/lib/data/regions";
import type { Sigungu } from "@/lib/data/sigungus";
import type { SupportProgram } from "@/lib/data/programs";
import type { EducationCourse } from "@/lib/data/education";
import type { FarmEvent } from "@/lib/data/events";
import { loadProvinceMap } from "@/lib/data/province-maps";
import { listRegionHref } from "./list-region-href";
import { fetchMultipleClimateData } from "@/lib/api/weather";
import {
  fetchPopulationData,
  fetchSubRegionPopulations,
  fetchSubRegionFarms,
} from "@/lib/api/sgis";
import { fetchMedicalFacilities } from "@/lib/api/hira";
import { fetchSchoolCounts } from "@/lib/api/education";
import s from "./page.module.css";

interface RegionAsyncDataProps {
  province: Province;
  sigungus: Sigungu[];
  /** 마감 제외·날짜 파생 상태·가까운 지역 순으로 정리된 목록 (region-listings.ts) */
  programs: SupportProgram[];
  education: EducationCourse[];
  events: FarmEvent[];
}

export async function RegionAsyncData({
  province,
  sigungus,
  programs: matchedPrograms,
  education: matchedEducation,
  events: matchedEvents,
}: RegionAsyncDataProps) {
  const stationIds = province.stationIds;

  // 외부 API 6종 병렬 호출
  const [
    climateResult,
    populationResult,
    medicalResult,
    schoolResult,
    subRegionPopResult,
    subRegionFarmResult,
  ] = await Promise.allSettled([
    fetchMultipleClimateData(stationIds),
    fetchPopulationData([province.sgisCode]),
    fetchMedicalFacilities([province.hiraSidoCd]),
    fetchSchoolCounts([province.eduCode]),
    fetchSubRegionPopulations(province.sgisCode),
    fetchSubRegionFarms(province.sgisCode),
  ]);

  const climateData =
    climateResult.status === "fulfilled" ? climateResult.value : [];
  const population =
    populationResult.status === "fulfilled"
      ? populationResult.value[0] ?? null
      : null;
  const medical =
    medicalResult.status === "fulfilled"
      ? medicalResult.value[0] ?? null
      : null;
  const school =
    schoolResult.status === "fulfilled"
      ? schoolResult.value[0] ?? null
      : null;
  const mainClimate =
    climateData.find((d) => d.stnId === province.representativeStationId) ??
    climateData[0] ??
    null;

  // 시군구 인구밀도 지도 데이터
  const subRegionPop =
    subRegionPopResult.status === "fulfilled" ? subRegionPopResult.value : {};
  const sigunguDensityMap: Record<string, number> = {};
  for (const sg of sigungus) {
    const pop = subRegionPop[sg.sgisCode];
    if (pop && sg.area > 0) {
      sigunguDensityMap[sg.id] = pop.population / sg.area;
    }
  }

  // 시군구 농가밀도 (호/km²) — Phase 1 트랙 A
  const subRegionFarm =
    subRegionFarmResult.status === "fulfilled" ? subRegionFarmResult.value : {};
  const sigunguFarmDensityMap: Record<string, number> = {};
  for (const sg of sigungus) {
    const f = subRegionFarm[sg.sgisCode];
    if (f && sg.area > 0) {
      sigunguFarmDensityMap[sg.id] = f.farmCount / sg.area;
    }
  }

  // 시군구 지도 데이터 로드
  let mapData: {
    viewBox: string;
    sigungus: { sigunguId: string; name: string; path: string; labelX: number; labelY: number }[];
  } | null = null;
  try {
    mapData = await loadProvinceMap(province.id);
  } catch {
    console.warn(`Province map data not found for ${province.id}`);
  }

  const year = new Date().getFullYear();

  return (
    <>
      {/* Hero Banner는 page.tsx에서 정적으로 표시 (5/10 리팩터링) — Suspense 안에서 제거 */}

      {/* Stats + Climate */}
      <div id="region-stats" className={s.statsAsyncWrapper}>
      <RegionStats
        provinceShortName={province.shortName}
        provinceName={province.name}
        area={province.area}
        population={population}
        medical={medical}
        school={school}
        climate={
          mainClimate
            ? {
                stnName: mainClimate.stnName,
                period: mainClimate.period,
                avgTemp: mainClimate.avgTemp,
                maxTemp: mainClimate.maxTemp,
                minTemp: mainClimate.minTemp,
                totalPrecipitation: mainClimate.totalPrecipitation,
                totalSunshine: mainClimate.totalSunshine,
              }
            : null
        }
        allStationNames={climateData.map((d) => d.stnName)}
        sgisCode={province.sgisCode}
        hiraSidoCd={province.hiraSidoCd}
        eduCode={province.eduCode}
        apiFailures={{
          population: populationResult.status === "rejected",
          medical: medicalResult.status === "rejected",
          school: schoolResult.status === "rejected",
          climate: climateResult.status === "rejected",
        }}
      />
      </div>

      {/* 지원사업 */}
      {matchedPrograms.length > 0 && (
        <section className={s.section} id="region-programs">
          <div className={s.sectionHeader}>
            <Icon icon={FileText} size="lg"  />
            <div>
              <h2 className={s.sectionTitle}>추천 지원사업</h2>
              <p className={s.sectionDesc}>
                {province.shortName} 지역에서 신청 가능한 지원사업이에요.
              </p>
            </div>
          </div>
          <div className={s.programList}>
            {matchedPrograms.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className={s.programCard}
              >
                <div>
                  <span className={s.programTitle}>{program.title}</span>
                  <span className={s.programMeta}>
                    {program.organization} ·{" "}
                    {program.region === "전국"
                      ? "전국"
                      : province.shortName}
                  </span>
                </div>
                <StatusBadge status={programStatusLabel(program)} />
              </Link>
            ))}
          </div>
          <Link
            href={listRegionHref("/programs", province.name)}
            className={s.viewMore}
          >
            전체 지원사업 보기 →
          </Link>
        </section>
      )}

      {/* 필지·임지 확인 — 외부 포털 허브 */}
      <section className={s.section} id="region-land">
        <div className={s.sectionHeader}>
          <Icon icon={LandPlot} size="lg" />
          <div>
            <h2 className={s.sectionTitle}>필지·임지 확인</h2>
            <p className={s.sectionDesc}>
              규제 상세는 공식 포털에서 바로 확인해 보세요.
            </p>
          </div>
        </div>
        <LandCheckBox />
      </section>

      {/* 교육 과정 */}
      {matchedEducation.length > 0 && (
        <section className={s.section} id="region-education">
          <div className={s.sectionHeader}>
            <Icon icon={GraduationCap} size="lg"  />
            <div>
              <h2 className={s.sectionTitle}>정착 교육</h2>
              <p className={s.sectionDesc}>
                {province.shortName} 지역에서 수강 가능한 교육 과정이에요.
              </p>
            </div>
          </div>
          <div className={s.programList}>
            {matchedEducation.map((course) => (
              <Link key={course.id} href={`/education/${course.id}`} className={s.eduCard}>
                <div className={s.eduCardMain}>
                  <span className={s.programTitle}>{course.title}</span>
                  <span className={s.programMeta}>
                    {course.organization} · {course.schedule}
                  </span>
                </div>
                <div className={s.eduCardBadges}>
                  <span className={s.eduTypeBadge}>{course.type}</span>
                  <span className={s.eduLevelBadge}>{course.level}</span>
                  <StatusBadge status={course.status} />
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={listRegionHref("/education", province.name)}
            className={s.viewMore}
          >
            전체 교육 보기 →
          </Link>
        </section>
      )}

      {/* 체험·행사 */}
      {matchedEvents.length > 0 && (
        <section className={s.section} id="region-events">
          <div className={s.sectionHeader}>
            <Icon icon={Calendar} size="lg"  />
            <div>
              <h2 className={s.sectionTitle}>체험·행사</h2>
              <p className={s.sectionDesc}>
                {province.shortName} 지역에서 참여할 수 있는 행사예요.
              </p>
            </div>
          </div>
          <div className={s.programList}>
            {matchedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className={s.eduCard}>
                <div className={s.eduCardMain}>
                  <span className={s.programTitle}>{event.title}</span>
                  <span className={s.programMeta}>
                    {event.location} ·{" "}
                    {event.date}
                    {event.dateEnd ? ` ~ ${event.dateEnd}` : ""}
                  </span>
                </div>
                <div className={s.eduCardBadges}>
                  <span className={s.eventTypeBadge} data-type={event.type}>
                    {event.type}
                  </span>
                  <StatusBadge status={event.status} />
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={listRegionHref("/events", province.name)}
            className={s.viewMore}
          >
            전체 행사 보기 →
          </Link>
        </section>
      )}

      {/* 시·군·구 탐색 — 지도 ↔ 카드 토글 */}
      {sigungus.length > 0 && (
        <section className={s.section} id="region-sigungu">
          <div className={s.sectionHeader}>
            <Icon icon={MapPin} size="lg"  />
            <div className={s.sectionHeaderBody}>
              <h2 className={s.sectionTitle}>시·군·구 탐색</h2>
              <p className={s.sectionDesc}>
                지도와 카드, 편한 방식으로 둘러보세요.
              </p>
            </div>
          </div>
          <SigunguExplorer
            provinceId={province.id}
            sigungus={sigungus.map((sg) => ({
              id: sg.id,
              name: sg.name,
              shortName: sg.shortName,
              description: sg.description,
              mainCrops: sg.mainCrops,
            }))}
            mapData={mapData}
            populationDensityMap={sigunguDensityMap}
            farmDensityMap={sigunguFarmDensityMap}
          />
        </section>
      )}

      {/* 데이터 출처 */}
      <div className={s.sourceNotice}>
        <DataSource source={`${year}년 기준 · 기상청 ASOS · SGIS · 심평원 · 교육부 NEIS`} />
      </div>
    </>
  );
}
