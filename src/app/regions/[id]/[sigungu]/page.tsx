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
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { RegionShareMenu } from "@/components/region/region-share-menu";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS, getSigunguBySidoAndId } from "@/lib/data/sigungus";
import { hasGuDistricts } from "@/lib/data/gus";
import { getEnrichedHighlights } from "@/lib/data/popular-tags";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { Icon } from "@/components/ui/icon";
import { CropRichCard } from "@/components/crop/crop-rich-card";
import { convertToPyeongLabel } from "@/lib/format";
import { getSigunguCenter } from "@/lib/data/centers";
import { CenterCard } from "@/components/region/center-card";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import { SigunguData } from "./sigungu-data";
import { SigunguStatsSkeleton } from "./sigungu-stats-skeleton";
import { DistrictMapSection } from "./district-map-section";
import { DataSource } from "@/components/ui/data-source";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Place } from "schema-dts";
import {
  StickyRegionHeader,
  type StickyChip,
} from "../sticky-region-header";
import { computePersonaScore, getPersona } from "@/lib/data/personas";
import { getDimensionScores } from "@/lib/data/dimension-scores";
import { SettlementScoreBreakdown } from "@/components/region/settlement-score-breakdown";
import s from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string; sigungu: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  // 정착 인기 키워드 포함 항목 우선으로 상위 20개만 사전 빌드.
  // 나머지 ~209개는 ISR on-demand (첫 방문 시 생성 → 24시간 캐시).
  //
  // ⚠ Phase 2 sprint(2026-05-03): SGIS 인구 추이는 정적 폴백을 사용해
  //   빌드 시 호출이 늘지는 않지만, 시군구 페이지당 런타임 외부 API 호출이
  //   6개(HIRA·NEIS·SGIS·SGIS-farm·기상청·KOSIS)에 달해 빌드 폭증을
  //   피하기 위해 30 → 20으로 추가 축소.
  //   (feedback_static_params_rate_limit.md 참조).
  const popular = SIGUNGUS.filter((sg) =>
    sg.highlights.includes("정착 인기")
  );
  const rest = SIGUNGUS.filter(
    (sg) => !sg.highlights.includes("정착 인기")
  );
  const top20 = [...popular, ...rest].slice(0, 20);

  return top20.map((sg) => ({
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

  const mainCropsLabel = sigungu.mainCrops.slice(0, 3).join("·");
  return {
    title: `${sidoName} ${sigungu.name} 귀농 — 지원사업·작물·인프라`,
    description: `${sidoName} ${sigungu.name} 농촌 정착 정보. 대표 작물: ${mainCropsLabel}. 인구, 의료·교육 인프라, 농촌 정착 지원사업을 확인하세요. ${sigungu.description}`,
    keywords: [`${sigungu.name} 귀농`, `${sidoName} 귀농`, `${sigungu.name} 지원사업`, ...sigungu.mainCrops.slice(0, 3)],
    alternates: { canonical: `/regions/${id}/${sigunguId}` },
  };
}

export default async function SigunguDetailPage({ params }: PageProps) {
  const { id, sigungu: sigunguId } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();

  const sigungu = getSigunguBySidoAndId(id, sigunguId);
  if (!sigungu) notFound();

  // 시군구 귀농지원센터 (정적 — 상위 광역 폴백하지 않음)
  const sigunguCenter = getSigunguCenter(sigungu.id);

  // 대표 작물 매칭 + 평수 환산 + 수익 정렬 (시도 페이지와 동일 패턴)
  const allMatchedCrops = CROPS.flatMap((crop) => {
    const detail = CROP_DETAILS.find((d) => d.id === crop.id);
    if (!detail) return [];
    const matched =
      sigungu.mainCrops.some(
        (mc) => crop.name === mc || crop.name.includes(mc),
      ) ||
      (detail.majorRegions?.includes(province.name) &&
        sigungu.mainCrops.some(
          (mc) =>
            detail.majorRegions?.some((r) => r.includes(mc)) ||
            crop.name.includes(mc),
        ));
    if (!matched) return [];
    const { value, label } = convertToPyeongLabel(detail.income.revenueRange);
    return [{ crop, detail, revenueValue: value, revenueLabel: label }];
  }).sort((a, b) => (b.revenueValue ?? 0) - (a.revenueValue ?? 0));

  const topCrops = allMatchedCrops.slice(0, 6);
  const remainingCount = allMatchedCrops.length - topCrops.length;
  const cropRevenueMax = topCrops.reduce(
    (max, c) => (c.revenueValue !== null ? Math.max(max, c.revenueValue) : max),
    0,
  );

  // 시군구 정착 점수 (balanced 페르소나) — sticky 칩 표시용.
  // 도시 자치구 등 데이터 부재 시 null → 칩 미표시.
  const balancedPersona = getPersona("balanced")!;
  const dimScores = getDimensionScores(sigungu.sgisCode);
  const sigunguSettlementScore = dimScores
    ? computePersonaScore(dimScores, balancedPersona)
    : null;

  const stickyChips: StickyChip[] = [];
  if (sigunguSettlementScore !== null) {
    stickyChips.push({
      label: `정착 점수 ${sigunguSettlementScore}`,
      href: "#settlement-score",
      tone: "primary",
    });
  }
  if (allMatchedCrops.length > 0) {
    stickyChips.push({
      label: `추천 작물 ${allMatchedCrops.length}종`,
      href: "#sigungu-crops",
    });
  }

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
      <BreadcrumbJsonLd items={[
        { name: "지역 탐색", href: "/regions" },
        { name: province.shortName, href: `/regions/${province.id}` },
        { name: sigungu.name, href: `/regions/${province.id}/${sigungu.id}` },
      ]} />
      {/* ── Place schema (시군구 기초행정구역) ── */}
      <JsonLd<Place>
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: `${province.shortName} ${sigungu.name}`,
          alternateName: sigungu.shortName ?? sigungu.name,
          description: sigungu.description,
          address: {
            "@type": "PostalAddress",
            addressCountry: "KR",
            addressRegion: province.name,
            addressLocality: sigungu.name,
          },
          containedInPlace: {
            "@type": "Place",
            name: province.name,
            address: {
              "@type": "PostalAddress",
              addressCountry: "KR",
              addressRegion: province.name,
            },
          },
          ...(typeof sigungu.area === "number" && sigungu.area > 0
            ? {
                additionalProperty: {
                  "@type": "PropertyValue",
                  name: "면적",
                  value: `${sigungu.area} km²`,
                },
              }
            : {}),
          mainEntityOfPage: `https://irangfarm.com/regions/${province.id}/${sigungu.id}`,
          keywords: [
            `${sigungu.name} 귀농`,
            `${province.shortName} 귀농`,
            ...sigungu.mainCrops.slice(0, 5),
            ...sigungu.highlights.slice(0, 3),
          ].join(", "),
        }}
      />
      {/* ── 브레드크럼 (정적) ── */}
      <nav className={s.breadcrumb} aria-label="경로">
        <Link href="/regions" className={s.breadcrumbLink}>
          지역 탐색
        </Link>
        <Icon icon={ChevronRight} size="sm" className={s.breadcrumbSep} />
        <Link href={`/regions/${province.id}`} className={s.breadcrumbLink}>
          {province.shortName}
        </Link>
        <Icon icon={ChevronRight} size="sm" className={s.breadcrumbSep} />
        <span className={s.breadcrumbCurrent} aria-current="page">
          {sigungu.name}
        </span>
      </nav>

      {/* 스크롤 시 노출되는 sticky 헤더 — 모바일 전용 */}
      <StickyRegionHeader
        overline={`${province.shortName} · ${province.name}`}
        shortName={sigungu.name}
        watchTargetId="sigungu-hero"
        chips={stickyChips}
        actions={
          <>
            <KakaoShareButton
              title={`${sigungu.name} — 농촌 정착 지역 정보 | 이랑`}
              description={`${province.shortName} ${sigungu.name} 농촌 정착 정보: ${sigungu.description}`}
              contentType="region"
            />
            <ShareButton
              title={`${sigungu.name} — 농촌 정착 지역 정보 | 이랑`}
              text={`${province.shortName} ${sigungu.name} 농촌 정착 정보: ${sigungu.description}`}
              contentType="region"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <BookmarkButton
              id={`${province.id}-${sigungu.id}`}
              type="region"
              title={`${province.shortName} ${sigungu.name}`}
              subtitle={sigungu.description}
            />
          </>
        }
      />

      {/* ── Hero (정적) ── */}
      <header className={s.hero} id="sigungu-hero">
        <div className={s.heroTopRow}>
          <div className={s.heroTextBlock}>
            <span className={s.heroOverline}>{province.name}</span>
            <h1 className={s.heroTitle}>{sigungu.name}</h1>
          </div>
          {/* 데스크탑 inline 3버튼 — 모바일에선 CSS로 숨김. 데스크탑 변경 없음. */}
          <div className={s.heroActions}>
            <KakaoShareButton
              title={`${sigungu.name} — 농촌 정착 지역 정보 | 이랑`}
              description={`${province.shortName} ${sigungu.name} 농촌 정착 정보: ${sigungu.description}`}
              contentType="region"
            />
            <ShareButton
              title={`${sigungu.name} — 농촌 정착 지역 정보 | 이랑`}
              text={`${province.shortName} ${sigungu.name} 농촌 정착 정보: ${sigungu.description}`}
              contentType="region"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <BookmarkButton
              id={`${province.id}-${sigungu.id}`}
              type="region"
              title={`${province.shortName} ${sigungu.name}`}
              subtitle={sigungu.description}
            />
          </div>
          {/* 모바일 ⋯ 메뉴 — 데스크탑에선 CSS로 숨김. */}
          <div className={s.heroMobileMenu}>
            <RegionShareMenu
              shareTitle={`${sigungu.name} — 농촌 정착 지역 정보 | 이랑`}
              shareDescription={`${province.shortName} ${sigungu.name} 농촌 정착 정보: ${sigungu.description}`}
              contentType="region"
              triggerVariant="plain"
              bookmark={{
                id: `${province.id}-${sigungu.id}`,
                type: "region",
                title: `${province.shortName} ${sigungu.name}`,
                subtitle: sigungu.description,
              }}
            />
          </div>
        </div>
        <p className={s.heroDesc}>{sigungu.description}</p>
        {sigunguSettlementScore !== null && (
          <>
            {/* 모바일: inline 큰 숫자 */}
            <a
              href="#settlement-score"
              className={s.heroScoreInline}
              aria-label={`정착 점수 ${sigunguSettlementScore}점 — 산정 근거 보기`}
            >
              <span className={s.heroScoreInlineLabel}>정착 점수</span>
              <span className={s.heroScoreInlineValue}>
                {sigunguSettlementScore}
              </span>
              <span className={s.heroScoreInlineUnit}>/ 100</span>
              <span className={s.heroScoreInlineArrow} aria-hidden="true">→</span>
            </a>
            {/* 데스크탑: 기존 pill 배지. 모바일에선 CSS로 숨김. */}
            <a
              href="#settlement-score"
              className={s.heroScoreBadge}
              aria-label={`정착 점수 ${sigunguSettlementScore}점 — 산정 근거 보기`}
            >
              <span className={s.heroScoreLabel}>정착 점수</span>
              <span className={s.heroScoreValue}>{sigunguSettlementScore}</span>
              <span className={s.heroScoreUnit}>점</span>
              <span className={s.heroScoreMeta}>· 균등 가중</span>
              <span className={s.heroScoreArrow} aria-hidden="true">→</span>
            </a>
          </>
        )}
        <div className={s.heroTags}>
          {getEnrichedHighlights(sigungu.sgisCode, sigungu.highlights).map(
            (tag) => (
              <span key={tag} className={s.heroTag}>
                {tag}
              </span>
            ),
          )}
        </div>
      </header>

      {/* ── API 데이터 섹션: 통계 + 기후 (스트리밍) ── */}
      <Suspense fallback={<SigunguStatsSkeleton />}>
        <SigunguData province={province} sigungu={sigungu} />
      </Suspense>

      {/* ── 정착 점수 산식 breakdown (sticky 칩의 anchor target) ── */}
      {sigunguSettlementScore !== null && dimScores && (
        <SettlementScoreBreakdown
          mode="sigungu"
          regionName={sigungu.name}
          score={sigunguSettlementScore}
          dimensions={{
            populationTrend: dimScores.populationTrend,
            farmActivity: dimScores.farmActivity,
            medical: dimScores.medical,
            school: dimScores.school,
            returnFarm: dimScores.returnFarm,
          }}
          evidence={dimScores.evidence}
        />
      )}

      {/* ── 구 지도 (구 분할 시만 표시) ── */}
      {hasGuDistricts(sigungu.id) && (
        <DistrictMapSection
          provinceId={province.id}
          sigunguId={sigungu.id}
          sigunguName={sigungu.name}
        />
      )}

      {/* ── 대표 작물 (시도 페이지와 동일한 CropRichCard 패턴) ── */}
      <section
        className={s.section}
        aria-label="대표 작물"
        id="sigungu-crops"
      >
        <div className={s.sectionHeader}>
          <Icon icon={Sprout} size="lg" />
          <div className={s.sectionHeaderBody}>
            <h2 className={s.sectionTitle}>대표 작물</h2>
            <p className={s.sectionDesc}>
              {sigungu.name}에서 주로 재배되는 작물이에요.
            </p>
          </div>
          {topCrops.length > 0 && (
            <Link
              href={`/regions/compare?stations=${province.representativeStationId}`}
              className={s.sectionHeaderCta}
            >
              지역별 작물 비교 →
            </Link>
          )}
        </div>

        {topCrops.length > 0 ? (
          <>
            <div className={s.cropGrid}>
              {topCrops.map(({ crop, detail, revenueValue, revenueLabel }) => (
                <CropRichCard
                  key={crop.id}
                  cropId={crop.id}
                  name={crop.name}
                  href={`/crops/${crop.id}`}
                  meta={`${crop.growingSeason} 재배`}
                  revenueLabel={revenueLabel}
                  revenueValue={revenueValue}
                  revenueMax={cropRevenueMax > 0 ? cropRevenueMax : null}
                  laborIntensity={detail.income.laborIntensity}
                  difficulty={crop.difficulty}
                  source={detail.income.source}
                />
              ))}
            </div>
            {remainingCount > 0 && (
              <Link href="/crops" className={s.cropMoreLink}>
                {sigungu.name}의 다른 작물 {remainingCount}개 더 보기 →
              </Link>
            )}
          </>
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

      {/* ── 이 지역 귀농지원센터 (정적) ── */}
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

      {/* ── 추천 지원사업 ── */}
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
            현재 모집 중인 지원사업이 없어요. 새로운 사업이 등록되면 업데이트할게요.
          </p>
        )}
        <Link
          href={`/programs?region=${encodeURIComponent(province.name)}`}
          className={s.viewMore}
        >
          전체 지원사업 보기 →
        </Link>
      </section>

      {/* ── 필지·임지 확인 (외부 포털 허브) ── */}
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

      {/* ── 정착 교육 ── */}
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
            현재 모집 중인 교육과정이 없어요. 새로운 과정이 개설되면 업데이트할게요.
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
            새로운 행사가 등록되면 업데이트할게요.
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
        <Icon icon={ArrowLeft} size="md" />
        {province.shortName} 상세로 돌아가기
      </Link>

      {/* ── 데이터 출처 ── */}
      <footer className={s.sourceNotice}>
        <DataSource source={`${year}년 기준 · 기상청 ASOS · SGIS 통계지리정보 · 건강보험심사평가원 · 교육부 NEIS`} />
      </footer>
    </div>
  );
}
