import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  FileText,
  GraduationCap,
  Calendar,
  Building2,
  LandPlot,
} from "lucide-react";
import { LandCheckBox } from "@/components/region/land-check-box";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { PROVINCES } from "@/lib/data/regions";
import { getSigunguBySidoAndId } from "@/lib/data/sigungus";
import { getGuByIds, GUS } from "@/lib/data/gus";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { Icon } from "@/components/ui/icon";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { getSigunguCenter } from "@/lib/data/centers";
import { CenterCard } from "@/components/region/center-card";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import { GuData } from "./gu-data";
import { SigunguStatsSkeleton } from "../sigungu-stats-skeleton";
import { DataSource } from "@/components/ui/data-source";
import s from "../page.module.css";

interface PageProps {
  params: Promise<{ id: string; sigungu: string; gu: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return GUS.map((g) => ({
    id: g.sidoId,
    sigungu: g.parentSigunguId,
    gu: g.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, sigungu: sigunguId, gu: guId } = await params;
  const gu = getGuByIds(id, sigunguId, guId);
  if (!gu) return { title: "지역 정보 | 이랑" };

  const province = PROVINCES.find((p) => p.id === id);
  const sigungu = getSigunguBySidoAndId(id, sigunguId);
  const sidoName = province?.shortName ?? "";
  const sigunguName = sigungu?.name ?? "";

  return {
    title: `${sigunguName} ${gu.name} 귀농 정보 | 이랑`,
    description: `${sidoName} ${sigunguName} ${gu.name}의 귀농 정보 — ${gu.description}`,
  };
}

export default async function GuDetailPage({ params }: PageProps) {
  const { id, sigungu: sigunguId, gu: guId } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();

  const sigungu = getSigunguBySidoAndId(id, sigunguId);
  if (!sigungu) notFound();

  const gu = getGuByIds(id, sigunguId, guId);
  if (!gu) notFound();

  // 시군구 귀농지원센터 (구가 아닌 상위 시 기준)
  const sigunguCenter = getSigunguCenter(sigungu.id);

  // 대표 작물 매칭 (정적 데이터)
  const matchedCrops = CROPS.filter((crop) => {
    const detail = CROP_DETAILS.find((d) => d.id === crop.id);
    return (
      gu.mainCrops.some(
        (mc) => crop.name === mc || crop.name.includes(mc)
      ) ||
      (detail?.majorRegions?.includes(province.name) &&
        gu.mainCrops.some(
          (mc) =>
            detail.majorRegions?.some((r) => r.includes(mc)) ||
            crop.name.includes(mc)
        ))
    );
  });

  const year = new Date().getFullYear();

  // 지역 관련 지원사업 / 교육 / 행사 (시/도 + 전국, 마감 제외)
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
      {/* -- 브레드크럼 -- */}
      <nav className={s.breadcrumb} aria-label="경로">
        <Link href="/regions" className={s.breadcrumbLink}>
          지역 탐색
        </Link>
        <Icon icon={ChevronRight} size="sm" className={s.breadcrumbSep} />
        <Link href={`/regions/${province.id}`} className={s.breadcrumbLink}>
          {province.shortName}
        </Link>
        <Icon icon={ChevronRight} size="sm" className={s.breadcrumbSep} />
        <Link
          href={`/regions/${province.id}/${sigungu.id}`}
          className={s.breadcrumbLink}
        >
          {sigungu.name}
        </Link>
        <Icon icon={ChevronRight} size="sm" className={s.breadcrumbSep} />
        <span className={s.breadcrumbCurrent} aria-current="page">
          {gu.name}
        </span>
      </nav>

      {/* -- Hero -- */}
      <header className={s.hero}>
        <span className={s.heroOverline}>
          {province.name} {sigungu.name}
        </span>
        <h1 className={s.heroTitle}>{gu.name}</h1>
        <p className={s.heroDesc}>{gu.description}</p>
        <div className={s.heroTags}>
          {gu.highlights.map((tag) => (
            <span key={tag} className={s.heroTag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* -- API 데이터 섹션: 통계 + 기후 -- */}
      <Suspense fallback={<SigunguStatsSkeleton />}>
        <GuData province={province} sigungu={sigungu} gu={gu} />
      </Suspense>

      {/* -- 대표 작물 -- */}
      <section className={s.section} aria-label="대표 작물">
        <div className={s.sectionHeader}>
          <Icon icon={Sprout} size="lg" />
          <div>
            <h2 className={s.sectionTitle}>대표 작물</h2>
            <p className={s.sectionDesc}>
              {gu.name}에서 주로 재배되는 작물이에요.
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
            {gu.mainCrops.map((crop) => (
              <span key={crop} className={s.mainCropBadge}>
                {crop}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* -- 이 지역 귀농지원센터 (상위 시 기준) -- */}
      {sigunguCenter && (
        <section className={s.section} aria-label="이 지역 귀농지원센터">
          <div className={s.sectionHeader}>
            <Icon icon={Building2} size="lg" />
            <div>
              <h2 className={s.sectionTitle}>이 지역 귀농지원센터</h2>
              <p className={s.sectionDesc}>
                상담·교육·정착 지원은 여기서 시작해요.
              </p>
            </div>
          </div>
          <CenterCard center={sigunguCenter} />
        </section>
      )}

      {/* -- 관련 지원사업 -- */}
      <section className={s.section} aria-label="관련 지원사업">
        <div className={s.sectionHeader}>
          <Icon icon={FileText} size="lg" />
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
            현재 모집 중인 지원사업이 없어요. 새로운 사업이 등록되면 업데이트돼요.
          </p>
        )}
        <Link
          href={`/programs?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 지원사업 보기 →
        </Link>
      </section>

      {/* -- 필지·임지 확인 -- */}
      <section className={s.section} aria-label="필지·임지 확인">
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

      {/* -- 귀농 교육 -- */}
      <section className={s.section} aria-label="귀농 교육">
        <div className={s.sectionHeader}>
          <Icon icon={GraduationCap} size="lg" />
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
            현재 모집 중인 교육과정이 없어요. 새로운 과정이 개설되면 업데이트돼요.
          </p>
        )}
        <Link
          href={`/education?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 교육 보기 →
        </Link>
      </section>

      {/* -- 체험·행사 -- */}
      <section className={s.section} aria-label="체험·행사">
        <div className={s.sectionHeader}>
          <Icon icon={Calendar} size="lg" />
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
            현재 접수 중인 행사가 없어요.
            <br />
            새로운 행사가 등록되면 업데이트돼요.
          </p>
        )}
        <Link
          href={`/events?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 행사 보기 →
        </Link>
      </section>

      {/* -- 돌아가기 링크 -- */}
      <Link
        href={`/regions/${province.id}/${sigungu.id}`}
        className={s.backLink}
      >
        <Icon icon={ArrowLeft} size="md" />
        {sigungu.name} 상세로 돌아가기
      </Link>

      {/* -- 데이터 출처 -- */}
      <footer className={s.sourceNotice}>
        <DataSource source={`${year}년 기준 · 기상청 ASOS · SGIS 통계지리정보 · 건강보험심사평가원 · 교육부 NEIS`} />
      </footer>
    </div>
  );
}
