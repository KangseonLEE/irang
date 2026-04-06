import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, GitCompareArrows, Sprout, Landmark, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { fetchUnsplashPhoto, type UnsplashPhoto } from "@/lib/api/unsplash";
import { KoreaMap } from "@/components/map/korea-map";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "지역 탐색",
  description:
    "귀농 후보 지역을 탐색하고, 기후·작물·지원사업 정보를 확인하세요.",
};

/** 전체 도의 highlights에서 상위 인기 키워드를 추출 */
function getPopularKeywords(limit = 8): string[] {
  const freq = new Map<string, number>();
  for (const p of PROVINCES) {
    for (const h of p.highlights) {
      freq.set(h, (freq.get(h) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword]) => keyword);
}

export default async function RegionsPage() {
  const popularKeywords = getPopularKeywords(8);

  // 모든 도의 대표 이미지를 병렬로 가져오기
  const photoResults = await Promise.allSettled(
    PROVINCES.map((p) => fetchUnsplashPhoto(p.unsplashQuery))
  );

  const photoMap = new Map<string, UnsplashPhoto>();
  for (let i = 0; i < PROVINCES.length; i++) {
    const result = photoResults[i];
    if (result.status === "fulfilled" && result.value) {
      photoMap.set(PROVINCES[i].id, result.value);
    }
  }

  return (
    <div className={s.page}>
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* Page Header */}
      <PageHeader
        icon={<MapPin size={20} />}
        label="Regions"
        title="지역 탐색"
        description="귀농을 고려 중인 지역을 선택해 기후, 인구, 추천 작물, 지원사업 정보를 확인하세요."
      />

      {/* 인터랙티브 지도 */}
      <section className={s.mapSection}>
        <div className={s.mapWrapper}>
          <KoreaMap />
        </div>
        <div className={s.mapGuide}>
          <h2 className={s.mapGuideTitle}>지도에서 지역을 선택하세요</h2>
          <p className={s.mapGuideDesc}>
            관심 있는 지역을 클릭하면 기후, 인구, 추천 작물, 지원사업 등
            상세 정보를 확인할 수 있습니다.
          </p>
          <div className={s.mapQuickLinks}>
            {PROVINCES.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/regions/${p.id}`}
                className={s.mapQuickLink}
              >
                {p.shortName}
              </Link>
            ))}
            <span className={s.mapQuickMore}>+{PROVINCES.length - 6}</span>
          </div>

          {/* Quick Stats */}
          <div className={s.mapStats}>
            <div className={s.mapStat}>
              <Landmark size={14} aria-hidden="true" />
              <span className={s.mapStatValue}>{PROVINCES.length}개</span>
              <span className={s.mapStatLabel}>도·광역시</span>
            </div>
            <span className={s.mapStatDivider} aria-hidden="true" />
            <div className={s.mapStat}>
              <Sprout size={14} aria-hidden="true" />
              <span className={s.mapStatValue}>{CROPS.length}종</span>
              <span className={s.mapStatLabel}>추천 작물</span>
            </div>
            <span className={s.mapStatDivider} aria-hidden="true" />
            <div className={s.mapStat}>
              <FileText size={14} aria-hidden="true" />
              <span className={s.mapStatValue}>{PROGRAMS.length}건</span>
              <span className={s.mapStatLabel}>지원사업</span>
            </div>
          </div>

          {/* 인기 키워드 */}
          <div className={s.mapKeywords}>
            <span className={s.mapKeywordsLabel}>인기 키워드</span>
            <div className={s.mapKeywordsList}>
              {popularKeywords.map((keyword) => (
                <span key={keyword} className={s.mapKeyword}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compare CTA */}
      <section className={s.compareCta}>
        <div className={s.compareCtaInner}>
          <div>
            <h2 className={s.compareCtaTitle}>지역을 비교해 보세요</h2>
            <p className={s.compareCtaDesc}>
              최대 4개 지역의 기후, 인구, 인프라를 한눈에 비교할 수 있습니다.
            </p>
          </div>
          <Link href="/regions/compare" className={s.compareCtaButton}>
            <GitCompareArrows size={16} aria-hidden="true" />
            비교하기
          </Link>
        </div>
      </section>

      {/* Region Cards Grid */}
      <section className={s.grid}>
        {PROVINCES.map((province) => {
          const photo = photoMap.get(province.id);
          return (
            <Link
              key={province.id}
              href={`/regions/${province.id}`}
              className={s.card}
            >
              <div className={s.cardImage}>
                {photo ? (
                  <Image
                    src={photo.smallUrl}
                    alt={`${province.name} 풍경`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className={s.cardImageFallback}>
                    <MapPin size={32} />
                  </div>
                )}
              </div>
              <div className={s.cardBody}>
                <h2 className={s.cardTitle}>{province.shortName}</h2>
                <p className={s.cardDesc}>{province.description}</p>
                <div className={s.cardTags}>
                  {province.highlights.slice(0, 3).map((tag) => (
                    <span key={tag} className={s.cardTag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span className={s.cardArrow}>
                  자세히 보기 <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
