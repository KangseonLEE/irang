import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Sprout, ArrowRight } from "lucide-react";
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

  // 카테고리 필터링
  const filteredCrops =
    currentCategory === "전체"
      ? CROPS
      : CROPS.filter((c) => c.category === currentCategory);

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
          <CropCard key={crop.id} crop={crop} />
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className={s.emptyState}>
          <Sprout size={32} className={s.emptyStateIcon} />
          <p className={s.emptyStateText}>
            &lsquo;{currentCategory}&rsquo; 카테고리에 등록된 작물이 없습니다.
          </p>
          <Link href="/crops" className={s.emptyStateLink}>
            전체 작물 보기
          </Link>
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
}: {
  crop: (typeof CROPS)[number];
}) {
  return (
    <Link href={`/crops/${crop.id}`} className={s.cropCard}>
      {/* 배경 작물 이미지 */}
      <Image
        src={`/crops/${crop.id}.jpg`}
        alt={crop.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
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

        {/* 설명 */}
        <p className={s.cropCardDesc}>{crop.description}</p>
      </div>
    </Link>
  );
}
