import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  Calendar,
  Building2,
  LandPlot, ArrowRight } from "lucide-react";
import { LandCheckBox } from "@/components/region/land-check-box";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { RegionShareMenu } from "@/components/region/region-share-menu";
import { PROVINCES } from "@/lib/data/regions";
import {
  SIGUNGUS,
  getMainCropEntries,
  getSigunguBySidoAndId,
  mainCropsEmptyMessage,
  mainCropsEmptyReason,
} from "@/lib/data/sigungus";
import { MAIN_CROPS_SOURCE } from "@/lib/data/sigungu-main-crops";
import { hasGuDistricts } from "@/lib/data/gus";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { programStatusLabel } from "@/lib/program-status";
import { CropRichCard } from "@/components/crops/crop-rich-card";
import { CropLinkCard } from "@/components/crops/crop-link-card";
import { SidebarTabs } from "@/components/ui/sidebar-tabs";
import st from "@/components/ui/sidebar-tabs.module.css";
import { RegionProfileCard } from "@/components/region/region-profile-card";
import { AnchorTabNav } from "@/components/ui/anchor-tab-nav";
import { convertToPyeongLabel } from "@/lib/format";
import { getSigunguCenter } from "@/lib/data/centers";
import { getRegionReorganization, getSidoReorganization, reorgNoticeText, sidoReorgNoticeText } from "@/lib/data/region-reorganizations";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { CenterCard } from "@/components/region/center-card";
import { loadRegionListings } from "../region-listings";
import { listRegionHref } from "../list-region-href";
import { educationCardFields } from "../education-card";
import { SigunguData } from "./sigungu-data";
import { SigunguStatsSkeleton } from "./sigungu-stats-skeleton";
import { DistrictMapSection } from "./district-map-section";
import { DataSource } from "@/components/ui/data-source";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CommunityNotes } from "@/components/community/community-notes";
import { CommunityJumpLink } from "@/components/community/community-jump-link";
import { InterviewContextSection } from "@/components/interview/interview-context-section";
import { PersonaCta } from "@/components/persona/persona-cta";
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
  if (!sigungu) notFound();

  const province = PROVINCES.find((p) => p.id === id);
  const sidoName = province?.shortName ?? "";

  const mainCropsLabel = sigungu.mainCrops.slice(0, 3).join("·");
  const title = `${sidoName} ${sigungu.name} 귀농 — 지원사업·작물·인프라`;
  // 주요 작물(2025 농림어업총조사 재배면적 상위)이 없는 곳은 '주요 작물: .' 이 되지 않게 그 구절을 뺀다
  const cropsClause = mainCropsLabel ? ` 주요 작물: ${mainCropsLabel}.` : "";
  const description = `${sidoName} ${sigungu.name} 농촌 정착 정보.${cropsClause} 인구, 의료·교육 인프라, 농촌 정착 지원사업을 확인하세요. ${sigungu.description}`;
  return {
    // 공유 카드까지 같은 값에서 — 종전엔 사이트 기본 제목·설명을 물려받고 og:url 도 없었다(10/6 QA1 Q2-W3).
    // 이미지는 상위 시·도 OG(종전에도 물려받던 그림)를 그대로 쓴다.
    ...pageMetadata({
      title,
      description,
      path: `/regions/${id}/${sigunguId}`,
      image: {
        url: `/regions/${id}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${sidoName} ${sigungu.name} 귀농 정보`,
      },
    }),
    keywords: [`${sigungu.name} 귀농`, `${sidoName} 귀농`, `${sigungu.name} 지원사업`, ...sigungu.mainCrops.slice(0, 3)],
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
  // 행정구역 개편을 겪은 곳(인천 신설 4개 구·대구 군위) — 상단 안내. 셀 수 없는 곳이면 의료기관·학교 '확인 불가'
  const reorg = getRegionReorganization(sigungu.id);
  // 시·군·구 자체 개편 안내가 없을 때만 시·도 단위 안내(10/7 전남광주통합특별시)
  const sidoReorg = reorg ? null : getSidoReorganization(province.id);

  // 주요 작물 — 2025 농림어업총조사 재배면적 큰 순(최대 3, sigungu-main-crops.ts). 예전엔 손 입력 mainCrops 를
  // 이름 부분 일치·시·도 주산지까지 섞어 넓게 맞추고 수익 순으로 정렬했다(10/10 정정 — 순서도 면적 순).
  const mainCropEntries = getMainCropEntries(sigungu.id);
  const mainCropsEmpty = mainCropsEmptyReason(sigungu.id, sigungu.sidoId);
  const allMatchedCrops = mainCropEntries.flatMap((entry) => {
    const crop = CROPS.find((c) => c.id === entry.cropId);
    const detail = CROP_DETAILS.find((d) => d.id === entry.cropId);
    if (!crop || !detail) return [];
    const { value, label } = convertToPyeongLabel(detail.income.revenueRange);
    return [{ crop, detail, revenueValue: value, revenueLabel: label, areaHa: entry.areaHa }];
  });

  const topCrops = allMatchedCrops.slice(0, 6);
  const remainingCount = allMatchedCrops.length - topCrops.length;
  // 상위 3개만 근거 카드, 나머지는 압축 목록 — 시도 페이지와 동일 (2026-09-17)
  const featuredCrops = topCrops.slice(0, 3);
  const compactCrops = topCrops.slice(3);
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
      label: `주요 작물 ${allMatchedCrops.length}종`,
      href: "#sigungu-crops",
    });
  }

  const year = new Date().getFullYear();

  // 지역 관련 지원사업 · 교육 · 행사 — DB ∪ 정적, 상태는 날짜에서 파생, 마감 제외,
  // 이 시·군·구 → 시·도 → 전국 순 (10/6 QA1: 정적 status 로 지난 행사가 "접수중"이던 것 교정).
  // 다른 시·군 전용 지원사업은 뺀다 — 판정은 검색 패널과 같은 localSigunguIdsOf (10/6 QA2 F1)
  const listings = await loadRegionListings({
    provinceName: province.name,
    local: { id: sigungu.id, name: sigungu.name, shortName: sigungu.shortName },
  });
  const regionPrograms = listings.programs.slice(0, 3);
  const regionEducation = listings.education.slice(0, 3);
  const regionEvents = listings.events.slice(0, 3);

  // 섹션 탭은 실제로 그려지는 섹션만 (10/6 QA1 Q3-🟡7 — 없는 섹션을 가리키는 탭은 눌러도 반응이 없었다),
  // 순서는 화면(DOM) 순서 (10/6 QA2 R2-Q3 F3 — 지원센터·필지·임지 탭이 섹션 순서와 달라 활성 탭이 튀었다)
  const tabSections = [
    ...(sigunguSettlementScore !== null && dimScores
      ? [{ id: "settlement-score", label: "정착 점수" }]
      : []),
    { id: "sigungu-crops", label: "주요 작물" },
    ...(sigunguCenter ? [{ id: "sigungu-center", label: "지원센터" }] : []),
    { id: "sigungu-programs", label: "지원사업" },
    { id: "sigungu-land", label: "필지·임지" },
    { id: "sigungu-education", label: "정착 교육" },
    { id: "sigungu-events", label: "체험·행사" },
    { id: "community-notes", label: "현장 이야기", track: "sigungu_tab" },
  ];

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
          </div>
          {/* 모바일 ⋯ 메뉴 — 데스크탑에선 CSS로 숨김. */}
          <div className={s.heroMobileMenu}>
            <RegionShareMenu
              shareTitle={`${sigungu.name} — 농촌 정착 지역 정보 | 이랑`}
              shareDescription={`${province.shortName} ${sigungu.name} 농촌 정착 정보: ${sigungu.description}`}
              contentType="region"
              triggerVariant="plain"
            />
          </div>
        </div>
        <p className={s.heroDesc}>{sigungu.description}</p>
        {reorg && (
          <ReferenceNotice
            text={reorgNoticeText(reorg, sigungu.name)}
            className={s.heroReorgNotice}
          />
        )}
        {sidoReorg && <ReferenceNotice text={sidoReorgNoticeText(sidoReorg)} className={s.heroReorgNotice} />}
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
          {sigungu.highlights.map(
            (tag) => (
              <span key={tag} className={s.heroTag}>
                {tag}
              </span>
            ),
          )}
        </div>
      </header>

      {/* 브레드크럼 — 히어로 아래·탭 위 공통 위치 (2026-10-02 회장). 의견 바로가기는 같은 줄 끝 (9/17) */}
      <div className={s.topBar}>
        <Breadcrumb
          items={[
            { name: "지역 탐색", href: "/regions" },
            { name: province.shortName, href: `/regions/${province.id}` },
            { name: sigungu.name },
          ]}
        />
        <CommunityJumpLink from="sigungu_detail" />
      </div>

      {/* 섹션 탐색 탭 — 작물·시도 상세와 같은 패턴 (2026-09-17) */}
      <AnchorTabNav sections={tabSections} />

      {/* ── 본문 2컬럼 (2026-09-17, 작물 상세와 동일 패턴) ── */}
      <div className={s.mainGrid}>
        {/* 사이드 탭 — 모바일에선 본문 위, 1024+ 에선 오른쪽 컬럼 첫 요소(grid-template-areas). 회장 9/28 */}
        <div className={s.tabsSlot}>
            <SidebarTabs
              tabs={[
                ...(topCrops.length > 0
                  ? [
                      {
                        id: "crops",
                        label: "주요 작물",
                        content: (
                          <>
                            <div className={st.sideTabCropList}>
                              {topCrops.map(({ crop, revenueLabel }) => (
                                <CropLinkCard
                                  key={crop.id}
                                  cropId={crop.id}
                                  name={crop.name}
                                  href={`/crops/${crop.id}`}
                                  meta={revenueLabel}
                                />
                              ))}
                            </div>
                            <a href="#sigungu-crops" className={st.sideTabMore}>
                              수익·난이도 근거 보기
                              <Icon icon={ArrowRight} size="sm" />
                            </a>
                          </>
                        ),
                      },
                    ]
                  : []),
                {
                  id: "stories",
                  label: "현장 이야기",
                  content: (
                    <div className={st.sideTabNotes}>
                      <p className={st.sideTabNotesText}>
                        {sigungu.name}에 대해 겪은 것, 궁금한 것을 한마디 남겨 주세요. 검토 후 게시돼요.
                      </p>
                      <a href="#community-notes" className={st.sideTabMore} data-community-jump="sigungu_side">
                        한마디 남기기
                        <Icon icon={ArrowRight} size="sm" />
                      </a>
                      <Link href={`/regions/${province.id}/${sigungu.id}/stories`} className={st.sideTabMore} data-community-jump="sigungu_side_more">
                        이야기 전체 보기
                        <Icon icon={ArrowRight} size="sm" />
                      </Link>
                    </div>
                  ),
                },
              ]}
            />
        </div>

        <div className={s.mainContent}>
          {/* ── API 데이터 섹션: 통계 + 기후 (스트리밍) — 탭 내비 바로 아래 2열 안 (2026-09-17) ── */}
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

          {/* ── 주요 작물 — 2025 농림어업총조사 재배면적 큰 순 (10/10, 시도 페이지와 같은 CropRichCard) ── */}
          <section
            className={s.section}
            aria-label="주요 작물"
            id="sigungu-crops"
          >
            <div className={s.sectionHeader}>
              <Icon icon={Sprout} size="lg" />
              <div className={s.sectionHeaderBody}>
                <h2 className={s.sectionTitle}>주요 작물</h2>
                {mainCropEntries.length > 0 && (
                  <p className={s.sectionDesc}>
                    {sigungu.name} 농가가 가장 넓게 재배하는 작물이에요.
                  </p>
                )}
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
                  {featuredCrops.map(({ crop, detail, revenueValue, revenueLabel, areaHa }) => (
                    <CropRichCard
                      key={crop.id}
                      cropId={crop.id}
                      name={crop.name}
                      href={`/crops/${crop.id}`}
                      meta={`재배면적 ${Math.round(areaHa).toLocaleString("ko-KR")}ha`}
                      revenueLabel={revenueLabel}
                      revenueValue={revenueValue}
                      revenueMax={cropRevenueMax > 0 ? cropRevenueMax : null}
                      laborIntensity={detail.income.laborIntensity}
                      difficulty={crop.difficulty}
                      source={detail.income.source}
                    />
                  ))}
                </div>
                {compactCrops.length > 0 && (
                  <div className={s.cropCompactList}>
                    {compactCrops.map(({ crop, revenueLabel }) => (
                      <CropLinkCard
                        key={crop.id}
                        cropId={crop.id}
                        name={crop.name}
                        href={`/crops/${crop.id}`}
                        meta={revenueLabel}
                      />
                    ))}
                  </div>
                )}
                {remainingCount > 0 && (
                  <Link href="/crops" className={s.cropMoreLink}>
                    {sigungu.name}의 다른 작물 {remainingCount}개 더 보기 →
                  </Link>
                )}
                <DataSource
                  source={MAIN_CROPS_SOURCE}
                  note="농가 주소지 기준 재배면적이라 논밭이 다른 지역에 있을 수 있어요. 버섯·약초·화훼·축산은 이 표에 없어요."
                />
              </>
            ) : (
              <EmptyState
                icon={<Icon icon={Sprout} size="lg" />}
                message={mainCropsEmptyMessage(mainCropsEmpty)}
              />
            )}
          </section>

          {/* ── 이 지역 귀농지원센터 (정적) ── */}
          {sigunguCenter && (
            <section className={s.section} aria-label="이 지역 귀농지원센터" id="sigungu-center">
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
          <section className={s.section} aria-label="추천 지원사업" id="sigungu-programs">
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
                현재 모집 중인 지원사업이 없어요. 새로운 사업이 등록되면 업데이트할게요.
              </p>
            )}
            <Link
              href={listRegionHref("/programs", province.name)}
              className={s.viewMore}
            >
              전체 지원사업 보기 →
            </Link>
          </section>

          {/* ── 필지·임지 확인 (외부 포털 허브) ── */}
          <section className={s.section} aria-label="필지·임지 확인" id="sigungu-land">
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
          <section className={s.section} aria-label="정착 교육" id="sigungu-education">
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
                현재 모집 중인 교육과정이 없어요. 새로운 과정이 개설되면 업데이트할게요.
              </p>
            )}
            <Link
              href={listRegionHref("/education", province.name)}
              className={s.viewMore}
            >
              전체 교육 보기 →
            </Link>
          </section>

          {/* ── 체험·행사 ── */}
          <section className={s.section} aria-label="체험·행사" id="sigungu-events">
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
                새로운 행사가 등록되면 업데이트할게요.
              </p>
            )}
            <Link
              href={listRegionHref("/events", province.name)}
              className={s.viewMore}
            >
              전체 행사 보기 →
            </Link>
          </section>

          {/* ── 이 지역에 정착한 사람 — 이 시·군·구와 정확히 일치하는 언론 인터뷰만 (10/5 B안). 0명이면 렌더 안 함 ── */}
          <InterviewContextSection
            context={{ kind: "sigungu", sidoId: province.id, sigunguId: sigungu.id }}
          />

          {/* ── 커뮤니티 1단계 — 한 줄 의견 (사전 승인제, 2026-09-02) ── */}
          <PersonaCta from="sigungu_detail" copy="이 지역이 내 조건에 맞을까요?" />
          <CommunityNotes
            targetType="region"
            targetId={`${province.id}/${sigungu.id}`}
            targetLabel={`${province.shortName} ${sigungu.name}`}
            moreHref={`/regions/${province.id}/${sigungu.id}/stories`}
          />
        </div>

        {/* 사이드바 — 작물·시도 상세와 같은 구성 (2026-09-17). 시군구는 단일 컬럼이라
            스크롤해도 요약·다음 행동이 따라오지 않았다. 1024px+ 에서 sticky. */}
        <aside className={s.sidebar}>

          <RegionProfileCard
            overline={`${province.name}`}
            title={sigungu.name}
            rows={[
              ...(sigunguSettlementScore !== null
                ? [{ label: "정착 점수", value: `${sigunguSettlementScore}점` }]
                : []),
              ...(typeof sigungu.area === "number" && sigungu.area > 0
                ? [{ label: "면적", value: `${sigungu.area.toLocaleString()} km²` }]
                : []),
              { label: "주요 작물", value: sigungu.mainCrops.slice(0, 3).join("·") || "—" },
            ]}
            chips={sigungu.highlights?.slice(0, 4)}
            ctas={[
              { href: `/regions/compare?regions=${province.id}:${sigungu.id}`, label: "다른 지역과 비교", primary: true },
              { href: `/regions/${province.id}`, label: `${province.shortName} 전체 보기` },
            ]}
          />

        </aside>
      </div>

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
