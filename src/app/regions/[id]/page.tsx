import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import {
  Sprout,
  FileText,
  GraduationCap,
  GitCompareArrows,
  ArrowRight,
  UserCheck,
  Calendar,
  MapPin,
} from "lucide-react";
import { RegionStats } from "./region-stats";
import { PROVINCES } from "@/lib/data/regions";
import { getSigungusBySidoId } from "@/lib/data/sigungus";
import { loadProvinceMap } from "@/lib/data/province-maps";
import { ProvinceMap } from "@/components/map/province-map";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { filterProgramsAsync } from "@/lib/data/programs";
import { filterEducationAsync } from "@/lib/data/education";
import { filterEvents } from "@/lib/data/events";
import { fetchMultipleClimateData } from "@/lib/api/weather";
import { fetchPopulationData, fetchSubRegionPopulations } from "@/lib/api/sgis";
import { fetchMedicalFacilities } from "@/lib/api/hira";
import { fetchSchoolCounts } from "@/lib/api/education";
import { fetchUnsplashPhoto } from "@/lib/api/unsplash";
import s from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PROVINCES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) return { title: "지역 정보" };
  return {
    title: `${province.shortName} — 지역 정보`,
    description: province.description,
  };
}

export default async function RegionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();

  // 해당 도의 관측소 목록
  const stationIds = province.stationIds;

  // 6개 API 병렬 호출 (시군구 인구 밀도 지도용 추가)
  const [climateResult, populationResult, medicalResult, schoolResult, photoResult, subRegionPopResult] =
    await Promise.allSettled([
      fetchMultipleClimateData(stationIds),
      fetchPopulationData([province.sgisCode]),
      fetchMedicalFacilities([province.hiraSidoCd]),
      fetchSchoolCounts([province.eduCode]),
      fetchUnsplashPhoto(province.unsplashQuery),
      fetchSubRegionPopulations(province.sgisCode),
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

  // 대표 관측소의 기후 데이터
  const mainClimate =
    climateData.find((d) => d.stnId === province.representativeStationId) ??
    climateData[0] ??
    null;

  // 이 도에 맞는 작물 필터
  const matchedCrops = CROPS.filter((crop) => {
    const detail = CROP_DETAILS.find((d) => d.id === crop.id);
    return detail?.majorRegions?.includes(province.name);
  });

  // 이 도에 맞는 지원사업 필터 (해당 지역 + 전국) — API → 폴백
  const { programs: matchedPrograms } = await filterProgramsAsync({
    region: province.name,
    includeClosed: false,
  }).then(({ programs, source }) => ({
    programs: programs.slice(0, 6),
    source,
  }));

  // 이 도에 맞는 교육 과정 (해당 지역 + 전국, 마감 제외) — API → 폴백
  const { courses: matchedEducation } = await filterEducationAsync({
    region: province.name,
    includeClosed: false,
  }).then(({ courses, source }) => ({
    courses: courses.slice(0, 4),
    source,
  }));

  // 이 도에 맞는 체험·행사 (해당 지역 + 전국, 마감 제외)
  const matchedEvents = filterEvents({
    region: province.name,
    includeClosed: false,
  }).slice(0, 4);

  // 해당 시/도의 시/군/구 목록
  const sigungus = getSigungusBySidoId(province.id);

  // 시군구 지도 데이터 로드 (code-splitting: 해당 시/도만 로드)
  let mapData: { viewBox: string; sigungus: { sigunguId: string; name: string; path: string; labelX: number; labelY: number }[] } | null = null;
  try {
    mapData = await loadProvinceMap(province.id);
  } catch {
    // 지도 데이터 로드 실패 시 카드 그리드만 표시
    console.warn(`Province map data not found for ${province.id}`);
  }

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

  const year = new Date().getFullYear();

  return (
    <div className={s.page}>
      {/* Back Link */}
      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      {/* Hero Banner */}
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

      {/* Hero Info */}
      <header className={s.heroInfo}>
        <div className={s.heroInfoMain}>
          <span className={s.heroOverline}>{province.name}</span>
          <div className={s.heroTitleRow}>
            <h1 className={s.heroTitle}>{province.shortName}</h1>
            <div className={s.heroActions}>
              <ShareButton
                title={`${province.shortName} — 귀농 지역 정보 | 이랑`}
                text={`${province.name} 귀농 정보: ${province.description}`}
                contentType="region"
                variant="ghost"
                size="sm"
                showLabel={false}
              />
              <BookmarkButton
                id={province.id}
                type="region"
                title={province.name}
                subtitle={province.description}
              />
            </div>
          </div>
          <p className={s.heroDesc}>{province.description}</p>
          <div className={s.heroTags}>
            {province.highlights.map((tag) => (
              <span key={tag} className={s.heroTag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Stats + Climate (클릭 가능 — 모달 지원) */}
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

      {/* Main Content Grid */}
      <div className={s.contentGrid}>
        {/* Left Column */}
        <div className={s.mainContent}>
          {/* 추천 작물 */}
          {matchedCrops.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <Sprout size={20} className={s.sectionIcon} />
                <div>
                  <h2 className={s.sectionTitle}>추천 작물</h2>
                  <p className={s.sectionDesc}>
                    {province.shortName} 지역에서 재배하기 좋은 작물입니다.
                  </p>
                </div>
              </div>
              <div className={s.cropGrid}>
                {matchedCrops.map((crop) => (
                  <Link
                    key={crop.id}
                    href={`/crops/${crop.id}`}
                    className={s.cropCard}
                  >
                    <span className={s.cropEmoji}>{crop.emoji}</span>
                    <div>
                      <span className={s.cropName}>{crop.name}</span>
                      <span className={s.cropMeta}>
                        {crop.category} · {crop.difficulty}
                      </span>
                    </div>
                    <ArrowRight size={14} className={s.cropArrow} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 지원사업 */}
          {matchedPrograms.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <FileText size={20} className={s.sectionIcon} />
                <div>
                  <h2 className={s.sectionTitle}>관련 지원사업</h2>
                  <p className={s.sectionDesc}>
                    {province.shortName} 지역에서 신청 가능한 지원사업입니다.
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

          {/* 교육 과정 */}
          {matchedEducation.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <GraduationCap size={20} className={s.sectionIcon} />
                <div>
                  <h2 className={s.sectionTitle}>귀농 교육</h2>
                  <p className={s.sectionDesc}>
                    {province.shortName} 지역에서 수강 가능한 교육 과정입니다.
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
                <Calendar size={20} className={s.sectionIcon} />
                <div>
                  <h2 className={s.sectionTitle}>체험·행사</h2>
                  <p className={s.sectionDesc}>
                    {province.shortName} 지역에서 참여할 수 있는 행사입니다.
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

          {/* 시/군/구 둘러보기 */}
          {sigungus.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <MapPin size={20} className={s.sectionIcon} />
                <div>
                  <h2 className={s.sectionTitle}>시/군/구 둘러보기</h2>
                  <p className={s.sectionDesc}>
                    지도에서 시/군/구를 클릭하면 상세 페이지로 이동합니다.
                  </p>
                </div>
              </div>

              {/* 시군구 지도 */}
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
        </div>

        {/* Right Sidebar */}
        <aside className={s.sidebar}>
          {/* 이런 분에게 추천 */}
          <section className={s.sideSection}>
            <div className={s.sideSectionHeader}>
              <UserCheck size={18} />
              <h3 className={s.sideSectionTitle}>이런 분에게 추천</h3>
            </div>
            <div className={s.personaList}>
              {province.personas.map((persona, i) => (
                <div key={i} className={s.personaCard}>
                  <h4 className={s.personaTitle}>{persona.title}</h4>
                  <p className={s.personaDesc}>{persona.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 비교 CTA */}
          <section className={s.sideSection}>
            <div className={s.sideSectionHeader}>
              <GitCompareArrows size={18} />
              <h3 className={s.sideSectionTitle}>다른 지역과 비교</h3>
            </div>
            <p className={s.sideDesc}>
              {province.shortName}과 다른 지역의 기후·인구·인프라를 비교해
              보세요.
            </p>
            <Link
              href={`/regions/compare?stations=${province.representativeStationId}`}
              className={s.compareCta}
            >
              비교 페이지로 이동
              <ArrowRight size={14} />
            </Link>
          </section>

          {/* 데이터 출처 */}
          <div className={s.sourceNotice}>
            <p>
              {year}년 기준 · 기상청 ASOS · SGIS · 심평원 · 교육부 NEIS
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

