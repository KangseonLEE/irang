import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Sprout,
  ArrowLeft,
  FileText,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS, getSigunguBySidoAndId } from "@/lib/data/sigungus";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import { SigunguData } from "./sigungu-data";
import { SigunguStatsSkeleton } from "./sigungu-stats-skeleton";
import { DataSource } from "@/components/ui/data-source";
import s from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string; sigungu: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  // 귀농인기 키워드 포함 항목 우선으로 상위 100개 사전 빌드
  // 나머지 ~126개는 ISR on-demand (첫 방문 시 생성 → 24시간 캐시)
  // ⚠ 전체 226개를 빌드하면 SGIS API rate limit에 걸릴 수 있어 100개로 제한
  const popular = SIGUNGUS.filter((sg) =>
    sg.highlights.includes("귀농인기")
  );
  const rest = SIGUNGUS.filter(
    (sg) => !sg.highlights.includes("귀농인기")
  );
  const top100 = [...popular, ...rest].slice(0, 100);

  return top100.map((sg) => ({
    id: sg.sidoId,
    sigungu: sg.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, sigungu: sigunguId } = await params;
  const sigungu = getSigunguBySidoAndId(id, sigunguId);
  if (!sigungu) return { title: "지역 정보 | 이랑" };

  const province = PROVINCES.find((p) => p.id === id);
  const sidoName = province?.shortName ?? "";

  return {
    title: `${sigungu.name} 귀농 정보 | 이랑`,
    description: `${sidoName} ${sigungu.name}의 귀농 정보 — ${sigungu.description}`,
  };
}

export default async function SigunguDetailPage({ params }: PageProps) {
  const { id, sigungu: sigunguId } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();

  const sigungu = getSigunguBySidoAndId(id, sigunguId);
  if (!sigungu) notFound();

  // 대표 작물 매칭 (정적 데이터 — API 불필요)
  const matchedCrops = CROPS.filter((crop) => {
    const detail = CROP_DETAILS.find((d) => d.id === crop.id);
    return (
      sigungu.mainCrops.some(
        (mc) => crop.name === mc || crop.name.includes(mc)
      ) ||
      (detail?.majorRegions?.includes(province.name) &&
        sigungu.mainCrops.some(
          (mc) =>
            detail.majorRegions?.some((r) => r.includes(mc)) ||
            crop.name.includes(mc)
        ))
    );
  });

  const year = new Date().getFullYear();

  // 지역 관련 지원사업 · 교육 · 행사 (시/도 + 전국, 마감 제외)
  const regionPrograms = PROGRAMS.filter(
    (p) =>
      (p.region === province.name || p.region === "전국") &&
      p.status !== "마감"
  ).slice(0, 3);

  const regionEducation = EDUCATION_COURSES.filter(
    (e) =>
      (e.region === province.name || e.region === "전국") &&
      e.status !== "마감"
  ).slice(0, 3);

  const regionEvents = EVENTS.filter(
    (e) =>
      (e.region === province.name || e.region === "전국") &&
      e.status !== "마감"
  ).slice(0, 3);

  return (
    <div className={s.page}>
      {/* ── 브레드크럼 (정적) ── */}
      <nav className={s.breadcrumb} aria-label="경로">
        <Link href="/regions" className={s.breadcrumbLink}>
          지역 탐색
        </Link>
        <ChevronRight size={14} className={s.breadcrumbSep} aria-hidden="true" />
        <Link href={`/regions/${province.id}`} className={s.breadcrumbLink}>
          {province.shortName}
        </Link>
        <ChevronRight size={14} className={s.breadcrumbSep} aria-hidden="true" />
        <span className={s.breadcrumbCurrent} aria-current="page">
          {sigungu.name}
        </span>
      </nav>

      {/* ── Hero (정적) ── */}
      <header className={s.hero}>
        <span className={s.heroOverline}>{province.name}</span>
        <h1 className={s.heroTitle}>{sigungu.name}</h1>
        <p className={s.heroDesc}>{sigungu.description}</p>
        <div className={s.heroTags}>
          {sigungu.highlights.map((tag) => (
            <span key={tag} className={s.heroTag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* ── API 데이터 섹션: 통계 + 기후 (스트리밍) ── */}
      <Suspense fallback={<SigunguStatsSkeleton />}>
        <SigunguData province={province} sigungu={sigungu} />
      </Suspense>

      {/* ── 대표 작물 (정적 매칭) ── */}
      <section className={s.section} aria-label="대표 작물">
        <div className={s.sectionHeader}>
          <Sprout size={20} className={s.sectionIcon} />
          <div>
            <h2 className={s.sectionTitle}>대표 작물</h2>
            <p className={s.sectionDesc}>
              {sigungu.name}에서 주로 재배되는 작물이에요.
            </p>
          </div>
        </div>
        {matchedCrops.length > 0 ? (
          <div className={s.cropGrid}>
            {matchedCrops.map((crop) => (
              <CropLinkCard
                key={crop.id}
                cropId={crop.id}
                name={crop.name}
                href={`/crops/${crop.id}`}
                meta={`${crop.category} · 재배난이도: ${crop.difficulty}`}
              />
            ))}
          </div>
        ) : (
          <div className={s.mainCropsList}>
            {sigungu.mainCrops.map((crop) => (
              <span key={crop} className={s.mainCropBadge}>
                {crop}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── 관련 지원사업 ── */}
      <section className={s.section} aria-label="관련 지원사업">
        <div className={s.sectionHeader}>
          <FileText size={20} className={s.sectionIcon} />
          <div>
            <h2 className={s.sectionTitle}>관련 지원사업</h2>
            <p className={s.sectionDesc}>
              {province.shortName} 지역에서 신청 가능한 지원사업이에요.
            </p>
          </div>
        </div>
        {regionPrograms.length > 0 ? (
          <div className={s.programList}>
            {regionPrograms.map((prog) => (
              <Link
                key={prog.id}
                href={`/programs/${prog.id}`}
                className={s.programCard}
              >
                <div>
                  <span className={s.programTitle}>{prog.title}</span>
                  <span className={s.programMeta}>
                    {prog.organization} ·{" "}
                    {prog.region === "전국" ? "전국" : province.shortName}
                  </span>
                </div>
                <span
                  className={`${s.programStatus} ${prog.status === "모집중" ? s.statusActive : ""}`}
                >
                  {prog.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className={s.infoEmpty}>
            현재 모집 중인 지원사업이 없습니다. 새로운 사업이 등록되면 업데이트됩니다.
          </p>
        )}
        <Link
          href={`/programs?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 지원사업 보기 →
        </Link>
      </section>

      {/* ── 귀농 교육 ── */}
      <section className={s.section} aria-label="귀농 교육">
        <div className={s.sectionHeader}>
          <GraduationCap size={20} className={s.sectionIcon} />
          <div>
            <h2 className={s.sectionTitle}>귀농 교육</h2>
            <p className={s.sectionDesc}>
              {province.shortName} 지역에서 수강 가능한 교육 과정이에요.
            </p>
          </div>
        </div>
        {regionEducation.length > 0 ? (
          <div className={s.programList}>
            {regionEducation.map((edu) => (
              <Link key={edu.id} href={`/education/${edu.id}`} className={s.eduCard}>
                <div className={s.eduCardMain}>
                  <span className={s.programTitle}>{edu.title}</span>
                  <span className={s.programMeta}>
                    {edu.organization} · {edu.schedule}
                  </span>
                </div>
                <div className={s.eduCardBadges}>
                  <span className={s.eduTypeBadge}>{edu.type}</span>
                  <span className={s.eduLevelBadge}>{edu.level}</span>
                  <span
                    className={`${s.programStatus} ${edu.status === "모집중" ? s.statusActive : ""}`}
                  >
                    {edu.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={s.infoEmpty}>
            현재 모집 중인 교육과정이 없습니다. 새로운 과정이 개설되면 업데이트됩니다.
          </p>
        )}
        <Link
          href={`/education?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 교육 보기 →
        </Link>
      </section>

      {/* ── 체험·행사 ── */}
      <section className={s.section} aria-label="체험·행사">
        <div className={s.sectionHeader}>
          <Calendar size={20} className={s.sectionIcon} />
          <div>
            <h2 className={s.sectionTitle}>체험·행사</h2>
            <p className={s.sectionDesc}>
              {province.shortName} 지역에서 참여할 수 있는 행사예요.
            </p>
          </div>
        </div>
        {regionEvents.length > 0 ? (
          <div className={s.programList}>
            {regionEvents.map((evt) => (
              <Link key={evt.id} href={`/events/${evt.id}`} className={s.eduCard}>
                <div className={s.eduCardMain}>
                  <span className={s.programTitle}>{evt.title}</span>
                  <span className={s.programMeta}>
                    {evt.location} · {evt.date}
                    {evt.dateEnd ? ` ~ ${evt.dateEnd}` : ""}
                  </span>
                </div>
                <div className={s.eduCardBadges}>
                  <span className={s.eventTypeBadge} data-type={evt.type}>
                    {evt.type}
                  </span>
                  <span
                    className={`${s.programStatus} ${evt.status === "접수중" ? s.statusActive : ""}`}
                  >
                    {evt.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={s.infoEmpty}>
            현재 접수 중인 행사가 없습니다.
            <br />
            새로운 행사가 등록되면 업데이트됩니다.
          </p>
        )}
        <Link
          href={`/events?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 행사 보기 →
        </Link>
      </section>

      {/* ── 돌아가기 링크 ── */}
      <Link href={`/regions/${province.id}`} className={s.backLink}>
        <ArrowLeft size={16} />
        {province.shortName} 상세로 돌아가기
      </Link>

      {/* ── 데이터 출처 ── */}
      <footer className={s.sourceNotice}>
        <DataSource source={`${year}년 기준 · 기상청 ASOS · SGIS 통계지리정보 · 건강보험심사평가원 · 교육부 NEIS`} />
      </footer>
    </div>
  );
}
