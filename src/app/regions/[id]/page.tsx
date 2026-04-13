import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import {
  GitCompareArrows,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { PROVINCES } from "@/lib/data/regions";
import { getSigungusBySidoId } from "@/lib/data/sigungus";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { Icon } from "@/components/ui/icon";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { RegionAsyncData } from "./region-async-data";
import { RegionAsyncSkeleton } from "./region-async-skeleton";
import s from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PROVINCES.map((p) => ({ id: p.id }));
}

/** 기후·인구·의료 등 외부 API 데이터를 1시간마다 재검증 */
export const revalidate = 3600;

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

  // 정적 데이터 — API 호출 없이 즉시 사용 가능
  const matchedCrops = CROPS.filter((crop) => {
    const detail = CROP_DETAILS.find((d) => d.id === crop.id);
    return detail?.majorRegions?.includes(province.name);
  });
  const sigungus = getSigungusBySidoId(province.id);

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

      {/* Hero Info — 정적 (즉시 표시) */}
      <header className={s.heroInfo}>
        <div className={s.heroInfoMain}>
          <span className={s.heroOverline}>{province.name}</span>
          <div className={s.heroTitleRow}>
            <h1 className={s.heroTitle}>{province.shortName}</h1>
            <div className={s.heroActions}>
              <KakaoShareButton
                title={`${province.shortName} — 귀농 지역 정보 | 이랑`}
                description={`${province.name} 귀농 정보: ${province.description}`}
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
          {matchedCrops.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <Icon icon={Sprout} size="lg" />
                <div>
                  <h2 className={s.sectionTitle}>추천 작물</h2>
                  <p className={s.sectionDesc}>
                    {province.shortName} 지역에서 재배하기 좋은 작물이에요.
                  </p>
                </div>
              </div>
              <div className={s.cropGrid}>
                {matchedCrops.map((crop) => (
                  <div key={crop.id} className={s.cropCardWrap}>
                    <CropLinkCard
                      cropId={crop.id}
                      name={crop.name}
                      href={`/crops/${crop.id}`}
                      meta={`${crop.category} · 재배난이도: ${crop.difficulty}`}
                    />
                    <Link
                      href={`/regions/compare?stations=${province.representativeStationId}&crop=${crop.id}`}
                      className={s.cropCompareLink}
                    >
                      다른 지역과 비교 →
                    </Link>
                  </div>
                ))}
              </div>
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
