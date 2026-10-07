import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  Calendar,
  Building2,
  LandPlot,
} from "lucide-react";
import { LandCheckBox } from "@/components/region/land-check-box";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { PROVINCES } from "@/lib/data/regions";
import { getSigunguBySidoAndId } from "@/lib/data/sigungus";
import { getGuByIds, GUS } from "@/lib/data/gus";
import { getEnrichedHighlights } from "@/lib/data/popular-tags";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { programStatusLabel } from "@/lib/program-status";
import { CropLinkCard } from "@/components/crops/crop-link-card";
import { getSigunguCenter } from "@/lib/data/centers";
import { CenterCard } from "@/components/region/center-card";
import { loadRegionListings } from "../../region-listings";
import { listRegionHref } from "../../list-region-href";
import { educationCardFields } from "../../education-card";
import { GuData } from "./gu-data";
import { SigunguStatsSkeleton } from "../sigungu-stats-skeleton";
import { DataSource } from "@/components/ui/data-source";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
  if (!gu) notFound();

  const province = PROVINCES.find((p) => p.id === id);
  const sigungu = getSigunguBySidoAndId(id, sigunguId);
  const sidoName = province?.shortName ?? "";
  const sigunguName = sigungu?.name ?? "";

  const title = `${sigunguName} ${gu.name} 귀농 — 작물·인프라·지원사업`;
  const description = `${sidoName} ${sigunguName} ${gu.name} 농촌 정착 정보. 인구, 의료·교육 인프라, 추천 작물, 지원사업을 확인하세요. ${gu.description}`;
  return {
    // 공유 카드까지 같은 값에서 — 사이트 기본 제목·설명 상속·og:url 없음 교정 (10/6 QA1 Q2-W3)
    ...pageMetadata({
      title,
      description,
      path: `/regions/${id}/${sigunguId}/${guId}`,
      image: {
        url: `/regions/${id}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${sigunguName} ${gu.name} 귀농 정보`,
      },
    }),
    keywords: [`${sigunguName} ${gu.name} 귀농`, `${sidoName} 귀농`, `${sigunguName} 귀농`],
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

  // 지역 관련 지원사업 / 교육 / 행사 — 시·군·구 상세와 같은 경로(DB ∪ 정적, 날짜 파생 상태, 마감 제외,
  // 다른 시·군 전용 지원사업 제외). 시·군 판정은 구가 아니라 시 단위라 상위 시를 "이 지역"으로 본다 (10/6 QA1·QA2)
  const listings = await loadRegionListings({
    provinceName: province.name,
    local: { id: sigungu.id, name: sigungu.name, shortName: sigungu.shortName },
  });
  const regionPrograms = listings.programs.slice(0, 3);
  const regionEducation = listings.education.slice(0, 3);
  const regionEvents = listings.events.slice(0, 3);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "지역 탐색", href: "/regions" },
        { name: province.shortName, href: `/regions/${province.id}` },
        { name: sigungu.name, href: `/regions/${province.id}/${sigungu.id}` },
        { name: gu.name, href: `/regions/${province.id}/${sigungu.id}/${gu.id}` },
      ]} />
      {/* -- Hero -- */}
      <header className={s.hero}>
        <span className={s.heroOverline}>
          {province.name} {sigungu.name}
        </span>
        <h1 className={s.heroTitle}>{gu.name}</h1>
        <p className={s.heroDesc}>{gu.description}</p>
        <div className={s.heroTags}>
          {getEnrichedHighlights(gu.sgisCode, gu.highlights).map((tag) => (
            <span key={tag} className={s.heroTag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* -- 브레드크럼 — 히어로 아래 공통 위치 (2026-10-02 회장) -- */}
      <div className={s.topBar}>
        <Breadcrumb
          items={[
            { name: "지역 탐색", href: "/regions" },
            { name: province.shortName, href: `/regions/${province.id}` },
            { name: sigungu.name, href: `/regions/${province.id}/${sigungu.id}` },
            { name: gu.name },
          ]}
        />
      </div>

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

      {/* -- 추천 지원사업 -- */}
      <section className={s.section} aria-label="추천 지원사업">
        <div className={s.sectionHeader}>
          <Icon icon={FileText} size="lg" />
          <div>
            <h2 className={s.sectionTitle}>추천 지원사업</h2>
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
                <StatusBadge status={programStatusLabel(prog)} />
              </Link>
            ))}
          </div>
        ) : (
          <p className={s.infoEmpty}>
            현재 모집 중인 지원사업이 없어요. 새로운 사업이 등록되면 업데이트돼요.
          </p>
        )}
        <Link
          href={listRegionHref("/programs", province.name)}
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

      {/* -- 정착 교육 -- */}
      <section className={s.section} aria-label="정착 교육">
        <div className={s.sectionHeader}>
          <Icon icon={GraduationCap} size="lg" />
          <div>
            <h2 className={s.sectionTitle}>정착 교육</h2>
            <p className={s.sectionDesc}>
              {province.shortName} 지역에서 수강 가능한 교육 과정이에요.
            </p>
          </div>
        </div>
        {regionEducation.length > 0 ? (
          <div className={s.programList}>
            {regionEducation.map((edu) => {
              // 수집 행의 기본값(오프라인·초급)·채움값(상세 공고 참조)은 그리지 않는다 (10/6 QA2 W-b)
              const card = educationCardFields(edu);
              return (
                <Link key={edu.id} href={`/education/${edu.id}`} className={s.eduCard}>
                  <div className={s.eduCardMain}>
                    <span className={s.programTitle}>{edu.title}</span>
                    {card.meta && <span className={s.programMeta}>{card.meta}</span>}
                  </div>
                  <div className={s.eduCardBadges}>
                    {card.type && <span className={s.eduTypeBadge}>{card.type}</span>}
                    {card.level && <span className={s.eduLevelBadge}>{card.level}</span>}
                    <StatusBadge status={edu.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className={s.infoEmpty}>
            현재 모집 중인 교육과정이 없어요. 새로운 과정이 개설되면 업데이트돼요.
          </p>
        )}
        <Link
          href={listRegionHref("/education", province.name)}
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
                  <StatusBadge status={evt.status} />
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
          href={listRegionHref("/events", province.name)}
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
