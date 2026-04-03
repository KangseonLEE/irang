import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Sprout, TrendingUp, ArrowRight } from "lucide-react";
import { fetchCropStats, KOSIS_TABLE, type CropStatItem } from "@/lib/api/kosis";
import { CROPS, type CropCategory } from "@/lib/data/crops";
import { CropFilter } from "./crop-filter";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "작물 정보",
  description:
    "귀농 시 재배 가능한 주요 작물의 환경 조건, 수익성, 난이도를 확인하세요.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CropsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = (params.category ?? "전체") as CropCategory;

  // KOSIS 데이터 조회 (실패해도 페이지 자체는 정상 렌더링)
  const riceStats = await fetchCropStats(KOSIS_TABLE.RICE_PRODUCTION).catch(
    () => [] as CropStatItem[]
  );

  // 전국 데이터 추출
  const nationalRice = riceStats.find((s) => s.regionName === "전국");

  // TOP 10 재배면적 (전국 제외, 재배면적 기준 내림차순)
  const top10 = riceStats
    .filter((s) => s.regionName !== "전국" && s.cultivationArea > 0)
    .sort((a, b) => b.cultivationArea - a.cultivationArea)
    .slice(0, 10);

  // 카테고리 필터링
  const filteredCrops =
    currentCategory === "전체"
      ? CROPS
      : CROPS.filter((c) => c.category === currentCategory);

  const dataYear = nationalRice?.year ?? new Date().getFullYear() - 1;

  return (
    <div className={s.page}>
      {/* Page Header */}
      <header className={s.pageHeader}>
        <div className={s.pageHeaderOverline}>
          <Sprout size={16} />
          <span>Crop Info</span>
        </div>
        <h1 className={s.pageTitle}>작물 정보</h1>
        <p className={s.pageDescription}>
          주요 작물의 재배 환경, 예상 수익, 재배 난이도를 한눈에 비교하세요.
        </p>
      </header>

      {/* Category Filter */}
      <Suspense fallback={<div className={s.filterSkeleton} />}>
        <CropFilter currentCategory={currentCategory} />
      </Suspense>

      {/* Crop Card Grid */}
      <div className={s.cropGrid}>
        {filteredCrops.map((crop) => (
          <CropCard
            key={crop.id}
            crop={crop}
            nationalArea={
              crop.id === "rice" ? nationalRice?.cultivationArea : undefined
            }
            nationalProduction={
              crop.id === "rice" ? nationalRice?.production : undefined
            }
            dataYear={dataYear}
          />
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className={s.emptyState}>
          <p className={s.emptyStateText}>
            해당 카테고리에 등록된 작물이 없습니다.
          </p>
        </div>
      )}

      {/* TOP 10 Table */}
      {top10.length > 0 && (
        <div className={s.statsSection}>
          <div className={s.statsCard}>
            <div className={s.statsCardHeader}>
              <h2 className={s.statsCardTitle}>
                <TrendingUp size={20} className={s.statsCardTitleIcon} />
                전국 논벼 재배면적 TOP 10
              </h2>
              <p className={s.statsCardDescription}>
                {dataYear}년 KOSIS 통계 기준
              </p>
            </div>
            <div className={s.statsCardBody}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.thCenter}>순위</th>
                    <th>지역</th>
                    <th className={s.thRight}>재배면적 (ha)</th>
                    <th className={s.thRight}>생산량 (톤)</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map((item, idx) => (
                    <tr key={item.regionName}>
                      <td className={s.tdCenter}>{idx + 1}</td>
                      <td>{item.regionName}</td>
                      <td className={s.tdRight}>
                        {item.cultivationArea.toLocaleString()}
                      </td>
                      <td className={s.tdRight}>
                        {item.production > 0
                          ? item.production.toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Source Notice */}
          <p className={s.dataSource}>
            출처: KOSIS 국가통계포털 (kosis.kr) | 통계청 | 공공누리 제1유형
          </p>
        </div>
      )}

      {/* Cross-link CTA */}
      <div>
        <Link href="/programs" className={s.crossLink}>
          관련 지원사업 찾기
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// --- 서브 컴포넌트 ---

function CropCard({
  crop,
  nationalArea,
  nationalProduction,
  dataYear,
}: {
  crop: (typeof CROPS)[number];
  nationalArea?: number;
  nationalProduction?: number;
  dataYear: number;
}) {
  return (
    <Link href={`/crops/${crop.id}`} className={s.cropCard}>
      {/* 배경 작물 이미지 */}
      <Image
        src={`/crops/${crop.id}.jpg`}
        alt={crop.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={s.cropCardImage}
        style={{ objectFit: "cover" }}
      />

      {/* 다크 오버레이 */}
      <div className={s.cropCardOverlay} />

      {/* 콘텐츠 */}
      <div className={s.cropCardContent}>
        {/* 상단: 카테고리 */}
        <span className={s.cropCardCategory}>{crop.category}</span>

        {/* 작물명 */}
        <h3 className={s.cropCardName}>{crop.name}</h3>

        {/* 구분선 */}
        <hr className={s.cropCardDivider} />

        {/* 메타 데이터 */}
        <div className={s.cropCardMeta}>
          <div className={s.cropCardMetaRow}>
            <span className={s.cropCardMetaLabel}>재배 시기</span>
            <span className={s.cropCardMetaValue}>{crop.growingSeason}</span>
          </div>
          <div className={s.cropCardMetaRow}>
            <span className={s.cropCardMetaLabel}>재배 난이도</span>
            <span className={s.cropCardMetaValue}>{crop.difficulty}</span>
          </div>
        </div>

        {/* KOSIS 전국 재배면적 (있을 때만) */}
        {nationalArea != null && nationalArea > 0 && (
          <div className={s.cropCardKosis}>
            <div className={s.cropCardKosisRow}>
              <span className={s.cropCardKosisLabel}>
                {dataYear}년 재배면적
              </span>
              <span className={s.cropCardKosisValue}>
                {nationalArea.toLocaleString()} ha
              </span>
            </div>
            {nationalProduction != null && nationalProduction > 0 && (
              <div className={s.cropCardKosisRow}>
                <span className={s.cropCardKosisLabel}>생산량</span>
                <span className={s.cropCardKosisValue}>
                  {nationalProduction.toLocaleString()} 톤
                </span>
              </div>
            )}
          </div>
        )}

        {/* 설명 */}
        <p className={s.cropCardDesc}>{crop.description}</p>
      </div>
    </Link>
  );
}
