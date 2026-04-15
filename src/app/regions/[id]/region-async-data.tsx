/**
 * 도 상세 페이지 — API 의존 비동기 데이터 섹션
 *
 * page.tsx의 정적 콘텐츠(Hero, 작물, 사이드바)와 분리하여
 * <Suspense>로 감싸면 정적 부분이 먼저 스트리밍되고,
 * 이 컴포넌트는 API 응답 후 채워집니다.
 *
 * 8개 비동기 작업을 전부 병렬 호출합니다:
 *   기후 · 인구 · 의료 · 학교 · 사진 · 시군구인구 · 프로그램 · 교육
 */

import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Calendar,
  MapPin,
  LandPlot,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { RegionStats } from "./region-stats";
import { LandCheckBox } from "@/components/region/land-check-box";
import { DataSource } from "@/components/ui/data-source";
import { ProvinceMap } from "@/components/map/province-map";
import type { Province } from "@/lib/data/regions";
import type { Sigungu } from "@/lib/data/sigungus";
import { loadProvinceMap } from "@/lib/data/province-maps";
import { filterProgramsAsync } from "@/lib/data/programs";
import { filterEducationAsync } from "@/lib/data/education";
import { filterEvents } from "@/lib/data/events";
import { fetchMultipleClimateData } from "@/lib/api/weather";
import { fetchPopulationData, fetchSubRegionPopulations } from "@/lib/api/sgis";
import { fetchMedicalFacilities } from "@/lib/api/hira";
import { fetchSchoolCounts } from "@/lib/api/education";
import { fetchUnsplashPhoto } from "@/lib/api/unsplash";
import s from "./page.module.css";

interface RegionAsyncDataProps {
  province: Province;
  sigungus: Sigungu[];
}

export async function RegionAsyncData({ province, sigungus }: RegionAsyncDataProps) {
  const stationIds = province.stationIds;

  // 8개 비동기 작업 전부 병렬 호출
  const [
    climateResult,
    populationResult,
    medicalResult,
    schoolResult,
    photoResult,
    subRegionPopResult,
    programsResult,
    educationResult,
  ] = await Promise.allSettled([
    fetchMultipleClimateData(stationIds),
    fetchPopulationData([province.sgisCode]),
    fetchMedicalFacilities([province.hiraSidoCd]),
    fetchSchoolCounts([province.eduCode]),
    fetchUnsplashPhoto(province.unsplashQuery),
    fetchSubRegionPopulations(province.sgisCode),
    filterProgramsAsync({ region: province.name, includeClosed: false }),
    filterEducationAsync({ region: province.name, includeClosed: false }),
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
  const photo =
    photoResult.status === "fulfilled" ? photoResult.value : null;

  const mainClimate =
    climateData.find((d) => d.stnId === province.representativeStationId) ??
    climateData[0] ??
    null;

  const matchedPrograms =
    programsResult.status === "fulfilled"
      ? programsResult.value.programs.slice(0, 6)
      : [];
  const matchedEducation =
    educationResult.status === "fulfilled"
      ? educationResult.value.courses.slice(0, 4)
      : [];

  const matchedEvents = filterEvents({
    region: province.name,
    includeClosed: false,
  }).slice(0, 4);

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
      {/* Hero Banner (API: Unsplash) */}
      {photo && (
        <div className={s.heroBanner}>
          <Image
            src={photo.url}
            alt={`${province.name} 풍경`}
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      )}

      {/* Stats + Climate */}
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
      />

      {/* 지원사업 */}
      {matchedPrograms.length > 0 && (
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <Icon icon={FileText} size="lg"  />
            <div>
              <h2 className={s.sectionTitle}>관련 지원사업</h2>
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
                <span
                  className={`${s.programStatus} ${program.status === "모집중" ? s.statusActive : ""}`}
                >
                  {program.status}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href={`/programs?region=${encodeURIComponent(province.name)}`}
            className={s.viewMore}
          >
            전체 지원사업 보기 →
          </Link>
        </section>
      )}

      {/* 필지·임지 확인 — 외부 포털 허브 */}
      <section className={s.section}>
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
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <Icon icon={GraduationCap} size="lg"  />
            <div>
              <h2 className={s.sectionTitle}>귀농 교육</h2>
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
                  <span
                    className={`${s.programStatus} ${course.status === "모집중" ? s.statusActive : ""}`}
                  >
                    {course.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={`/education?region=${encodeURIComponent(province.name)}`}
            className={s.viewMore}
          >
            전체 교육 보기 →
          </Link>
        </section>
      )}

      {/* 체험·행사 */}
      {matchedEvents.length > 0 && (
        <section className={s.section}>
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
                  <span
                    className={`${s.programStatus} ${event.status === "접수중" ? s.statusActive : ""}`}
                  >
                    {event.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href={`/events?region=${encodeURIComponent(province.name)}`}
            className={s.viewMore}
          >
            전체 행사 보기 →
          </Link>
        </section>
      )}

      {/* 시/군/구 지도 */}
      {sigungus.length > 0 && (
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <Icon icon={MapPin} size="lg"  />
            <div>
              <h2 className={s.sectionTitle}>시/군/구 둘러보기</h2>
              <p className={s.sectionDesc}>
                지도에서 시/군/구를 클릭하면 상세 페이지로 이동해요.
              </p>
            </div>
          </div>
          {mapData && (
            <ProvinceMap
              provinceId={province.id}
              sigungus={mapData.sigungus}
              viewBox={mapData.viewBox}
              densityMap={sigunguDensityMap}
            />
          )}
        </section>
      )}

      {/* 데이터 출처 */}
      <div className={s.sourceNotice}>
        <DataSource source={`${year}년 기준 · 기상청 ASOS · SGIS · 심평원 · 교육부 NEIS`} />
      </div>
    </>
  );
}
