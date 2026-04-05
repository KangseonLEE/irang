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
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function CropsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = (params.category ?? "전체") as CropCategory;
  const searchQuery = params.q?.trim() ?? "";

  // 카테고리 필터링
  let filteredCrops =
    currentCategory === "전체"
      ? CROPS
      : CROPS.filter((c) => c.category === currentCategory);

  // 텍스트 검색 필터링 (이름 + 설명, 대소문자 무시)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredCrops = filteredCrops.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

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
            {searchQuery
              ? `'${searchQuery}' 검색 결과가 없습니다.`
              : `'${currentCategory}' 카테고리에 등록된 작물이 없습니다.`}
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

// 난이도 → CSS class 매핑
const DIFFICULTY_CLASS: Record<string, string> = {
  쉬움: s.difficultyEasy,
  보통: s.difficultyMedium,
  어려움: s.difficultyHard,
};

function CropCard({
  crop,
}: {
  crop: (typeof CROPS)[number];
}) {
  return (
    <Link href={`/crops/${crop.id}`} className={s.cropCard}>
      {/* 이미지 영역 — aspect-ratio 기반 */}
      <div className={s.cropCardImageWrap}>
        <Image
          src={`/crops/${crop.id}.jpg`}
          alt={`${crop.name} 작물 사진`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={s.cropCardImage}
          style={{ objectFit: "cover" }}
        />
        <span className={s.cropCardCategory}>{crop.category}</span>
      </div>

      {/* 텍스트 정보 영역 */}
      <div className={s.cropCardContent}>
        {/* L1: 이모지 + 작물명 + 난이도 */}
        <div className={s.cropCardNameRow}>
          <div className={s.cropCardNameGroup}>
            <span className={s.cropCardEmoji} aria-hidden="true">
              {crop.emoji}
            </span>
            <h3 className={s.cropCardName}>{crop.name}</h3>
          </div>
          <span
            className={`${s.difficultyBadge} ${DIFFICULTY_CLASS[crop.difficulty] ?? s.difficultyMedium}`}
          >
            {crop.difficulty}
          </span>
        </div>

        {/* L2: 재배시기 */}
        <p className={s.cropCardSeason}>{crop.growingSeason}</p>

        {/* L3: 설명 */}
        <p className={s.cropCardDesc}>{crop.description}</p>
      </div>
    </Link>
  );
}
