import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import {
  GitCompareArrows,
  ArrowRight,
  UserCheck,
  Building2,
  MapPin,
} from "lucide-react";
import { getSidoCenter } from "@/lib/data/centers";
import { CenterCard } from "@/components/region/center-card";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { PROVINCES } from "@/lib/data/regions";
import { getSigungusBySidoId } from "@/lib/data/sigungus";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { Icon } from "@/components/ui/icon";
import { CropRichCard } from "@/components/crop/crop-rich-card";
import { convertToPyeongLabel } from "@/lib/format";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { RegionAsyncData } from "./region-async-data";
import { RegionAsyncSkeleton } from "./region-async-skeleton";
import { SigunguList } from "./sigungu-list";
import s from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PROVINCES.map((p) => ({ id: p.id }));
}

/** 기후·인구·의료 등 외부 API 데이터를 24h마다 재검증 (봇 트래픽 절감) */
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) return { title: "지역 정보" };
  return {
    title: `${province.shortName} 귀농 — 지원사업·정착금·기후·작물 정보`,
    description: `${province.shortName} 귀농 준비에 필요한 청년·40대·50대 맞춤 지원사업, 정착금, 기후 환경, 추천 작물을 한눈에 확인하세요.`,
    alternates: { canonical: `/regions/${id}` },
    openGraph: {
      title: `${province.shortName} 귀농 정보 | 이랑`,
      description: `${province.shortName} 귀농 지원사업·기후·작물 정보를 한눈에 확인하세요.`,
      images: [{ url: `/regions/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default async function RegionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();

  // 정적 데이터 — API 호출 없이 즉시 사용 가능
  const sigungus = getSigungusBySidoId(province.id);
  const sidoCenter = getSidoCenter(province.id);

  // 작물 + 상세 + 평수 환산값을 한 번에 계산 → 수익 내림차순 정렬
  const allMatchedCrops = CROPS.flatMap((crop) => {
    const detail = CROP_DETAILS.find((d) => d.id === crop.id);
    if (!detail?.majorRegions?.includes(province.name)) return [];
    const { value, label } = convertToPyeongLabel(detail.income.revenueRange);
    return [{ crop, detail, revenueValue: value, revenueLabel: label }];
  }).sort((a, b) => (b.revenueValue ?? 0) - (a.revenueValue ?? 0));

  const topCrops = allMatchedCrops.slice(0, 6);
  const remainingCount = allMatchedCrops.length - topCrops.length;
  // 바 길이 정규화 기준 (이 섹션 내 최대 수익값)
  const revenueMax = topCrops.reduce(
    (max, c) => (c.revenueValue !== null ? Math.max(max, c.revenueValue) : max),
    0
  );

  // 도시(매칭 작물 0종)일 때 친화 메시지용 근교 시군구 후보 (상위 3개)
  const nearbyRuralSigungus = allMatchedCrops.length === 0 ? sigungus.slice(0, 3) : [];

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "지역 탐색", href: "/regions" },
        { name: province.name, href: `/regions/${id}` },
      ]} />
      {/* Back Link — 정적 */}
      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      {/* Hero — 정적 이미지 + 텍스트 정보. 모바일에서 텍스트는 이미지 위 absolute. */}
      <section className={s.hero}>
        <div className={s.heroBanner}>
          <Image
            src={`/images/regions/${province.id}.png`}
            alt={`${province.name} 풍경 일러스트`}
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        <header className={s.heroInfo}>
          <div className={s.heroInfoMain}>
            <span className={s.heroOverline}>{province.name}</span>
            <div className={s.heroTitleRow}>
              <h1 className={s.heroTitle}>{province.shortName}</h1>
              <div className={s.heroActions}>
                <KakaoShareButton
                  title={`${province.shortName} — 귀농 지역 정보 | 이랑`}
                  description={`${province.name} 귀농 정보: ${province.description}`}
                  imageUrl={`https://irangfarm.com/regions/${province.id}/opengraph-image`}
                  contentType="region"
                />
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
            <p className={s.heroDesc}><AutoGlossary text={province.description} /></p>
            <div className={s.heroTags}>
              {province.highlights.map((tag) => (
                <span key={tag} className={s.heroTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>
      </section>

      <ReferenceNotice />

      {/* ═══ API 의존 데이터 — 스트리밍 (Suspense) ═══
          사진 배너, 통계, 기후, 지원사업, 교육, 행사, 지도를 포함.
          정적 부분(Hero, 작물, 사이드바)이 먼저 렌더되고,
          API 응답이 완료되면 이 영역이 채워집니다. */}
      <Suspense fallback={<RegionAsyncSkeleton />}>
        <RegionAsyncData province={province} sigungus={sigungus} />
      </Suspense>

      {/* Main Content Grid — 정적 부분 */}
      <div className={s.contentGrid}>
        {/* Left Column */}
        <div className={s.mainContent}>
          {/* 추천 작물 — 정적 데이터 */}
          <section className={s.section}>
            <div className={s.sectionHeader}>
              <Icon icon={Sprout} size="lg" />
              <div className={s.sectionHeaderBody}>
                <h2 className={s.sectionTitle}>추천 작물</h2>
                <p className={s.sectionDesc}>
                  {province.shortName}에서 재배하기 좋은 작물이에요.
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
                      revenueMax={revenueMax > 0 ? revenueMax : null}
                      laborIntensity={detail.income.laborIntensity}
                      difficulty={crop.difficulty}
                      source={detail.income.source}
                    />
                  ))}
                </div>
                {remainingCount > 0 && (
                  <Link href="/crops" className={s.cropMoreLink}>
                    {province.shortName}의 다른 작물 {remainingCount}개 더 보기 →
                  </Link>
                )}
              </>
            ) : (
              <div className={s.urbanNotice}>
                <p className={s.urbanNoticeText}>
                  {province.shortName}은 도시 인프라 중심이라 매칭된 추천 작물이
                  없어요. 근교 시군구도 둘러보세요.
                </p>
                {nearbyRuralSigungus.length > 0 && (
                  <ul className={s.urbanNoticeList}>
                    {nearbyRuralSigungus.map((sg) => (
                      <li key={sg.id}>
                        <Link
                          href={`/regions/${province.id}/${sg.id}`}
                          className={s.urbanNoticeLink}
                        >
                          {sg.name} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* 이 지역 귀농지원센터 — 정적 */}
          {sidoCenter && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <Icon icon={Building2} size="lg" />
                <div>
                  <h2 className={s.sectionTitle}>이 지역 귀농지원센터</h2>
                  <p className={s.sectionDesc}>
                    상담·교육·정착 지원은 여기서 시작해요.
                  </p>
                </div>
              </div>
              <CenterCard center={sidoCenter} />
            </section>
          )}

          {/* 시군구 목록 — 모든 시군구 link (SEO + 사용자 navigation) */}
          {sigungus.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <Icon icon={MapPin} size="lg" />
                <div className={s.sectionHeaderBody}>
                  <h2 className={s.sectionTitle}>시군구별 정보</h2>
                  <p className={s.sectionDesc}>
                    {province.shortName}의 {sigungus.length}개 시군구 — 작물·기후·인프라
                    상세를 확인하세요.
                  </p>
                </div>
              </div>
              <SigunguList
                provinceId={province.id}
                sigungus={sigungus.map((sg) => ({
                  id: sg.id,
                  name: sg.name,
                  shortName: sg.shortName,
                  description: sg.description,
                  mainCrops: sg.mainCrops,
                }))}
              />
            </section>
          )}
        </div>

        {/* Right Sidebar — 정적 */}
        <aside className={s.sidebar}>
          {/* 이런 분에게 추천 */}
          <section className={s.sideSection}>
            <div className={s.sideSectionHeader}>
              <Icon icon={UserCheck} size="lg" />
              <h3 className={s.sideSectionTitle}>이런 분에게 추천</h3>
            </div>
            <div className={s.personaList}>
              {province.personas.map((persona, i) => (
                <div key={i} className={s.personaCard}>
                  <h4 className={s.personaTitle}>{persona.title}</h4>
                  <p className={s.personaDesc}><AutoGlossary text={persona.description} /></p>
                </div>
              ))}
            </div>
          </section>

          {/* 비교 CTA */}
          <section className={s.sideSection}>
            <div className={s.sideSectionHeader}>
              <Icon icon={GitCompareArrows} size="lg" />
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
              <Icon icon={ArrowRight} size="sm" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
