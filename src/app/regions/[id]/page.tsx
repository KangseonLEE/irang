import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Thermometer,
  Droplets,
  Sun,
  Users,
  Building2,
  GraduationCap,
  Sprout,
  FileText,
  GitCompareArrows,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { PROVINCES, type Province } from "@/lib/data/regions";
import { STATIONS } from "@/lib/data/stations";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { filterPrograms } from "@/lib/data/programs";
import { fetchMultipleClimateData } from "@/lib/api/weather";
import { fetchPopulationData } from "@/lib/api/sgis";
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

  // 5개 API 병렬 호출
  const [climateResult, populationResult, medicalResult, schoolResult, photoResult] =
    await Promise.allSettled([
      fetchMultipleClimateData(stationIds),
      fetchPopulationData([province.sgisCode]),
      fetchMedicalFacilities([province.hiraSidoCd]),
      fetchSchoolCounts([province.eduCode]),
      fetchUnsplashPhoto(province.unsplashQuery),
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

  // 이 도에 맞는 지원사업 필터 (해당 지역 + 전국)
  const matchedPrograms = filterPrograms({
    region: province.name,
    includeClosed: false,
  }).slice(0, 6);

  const year = new Date().getFullYear();

  return (
    <div className={s.page}>
      {/* Back Link */}
      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      {/* Hero */}
      <header className={s.hero}>
        {photo && (
          <div className={s.heroImage}>
            <Image
              src={photo.url}
              alt={`${province.name} 풍경`}
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              style={{ objectFit: "cover" }}
              priority
            />
            <div className={s.heroOverlay} />
          </div>
        )}
        <div className={s.heroContent}>
          <span className={s.heroOverline}>{province.name}</span>
          <h1 className={s.heroTitle}>{province.shortName}</h1>
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

      {/* Stats Grid */}
      <section className={s.statsGrid}>
        {mainClimate && (
          <>
            <StatCard
              icon={<Thermometer size={18} />}
              label="평균기온"
              value={`${mainClimate.avgTemp}℃`}
            />
            <StatCard
              icon={<Droplets size={18} />}
              label="누적 강수"
              value={`${mainClimate.totalPrecipitation}mm`}
            />
            <StatCard
              icon={<Sun size={18} />}
              label="일조시간"
              value={`${mainClimate.totalSunshine}hr`}
            />
          </>
        )}
        {population && (
          <StatCard
            icon={<Users size={18} />}
            label="인구"
            value={`${(population.population / 10000).toFixed(0)}만명`}
            sub={`고령화율 ${population.agingRate}%`}
          />
        )}
        {medical && (
          <StatCard
            icon={<Building2 size={18} />}
            label="의료기관"
            value={`${medical.totalCount.toLocaleString()}개`}
          />
        )}
        {school && (
          <StatCard
            icon={<GraduationCap size={18} />}
            label="학교"
            value={`${school.totalCount.toLocaleString()}개`}
          />
        )}
      </section>

      {/* Multi-station climate note */}
      {climateData.length > 1 && (
        <div className={s.multiStationNote}>
          <p>
            {province.shortName}에는{" "}
            {climateData.map((d) => d.stnName).join(", ")} 관측소가 있습니다.
            위 수치는 {mainClimate?.stnName} 기준입니다.
          </p>
        </div>
      )}

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

// --- 서브 컴포넌트 ---

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className={s.statCard}>
      <div className={s.statIcon}>{icon}</div>
      <div>
        <span className={s.statLabel}>{label}</span>
        <span className={s.statValue}>{value}</span>
        {sub && <span className={s.statSub}>{sub}</span>}
      </div>
    </div>
  );
}
