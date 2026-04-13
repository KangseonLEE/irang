import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { CROPS, CROP_CATEGORIES, CROP_DIFFICULTIES, type CropCategory, type CropDifficulty } from "@/lib/data/crops";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FilterBar,
  FilterRow,
  FilterGroup,
  FilterDivider,
  FilterActions,
} from "@/components/filter/filter-bar";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "작물 정보",
  description:
    "귀농 시 재배 가능한 주요 작물의 환경 조건, 수익성, 난이도를 확인하세요.",
};

interface PageProps {
  searchParams: Promise<{ category?: string; difficulty?: string; q?: string }>;
}

export default async function CropsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = (params.category ?? "전체") as CropCategory;
  const currentDifficulty = (params.difficulty ?? "전체") as CropDifficulty;
  const searchQuery = params.q?.trim() ?? "";

  // 카테고리 필터링
  let filteredCrops =
    currentCategory === "전체"
      ? CROPS
      : CROPS.filter((c) => c.category === currentCategory);

  // 난이도 필터링
  if (currentDifficulty !== "전체") {
    filteredCrops = filteredCrops.filter(
      (c) => c.difficulty === currentDifficulty,
    );
  }

  // 텍스트 검색 필터링 (이름 + 설명, 대소문자 무시)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredCrops = filteredCrops.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

  // 현재 활성 필터 (URL 빌딩용)
  const currentFilters: Record<string, string | undefined> = {
    category: params.category,
    difficulty: params.difficulty,
    q: params.q,
  };

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "작물 정보", href: "/crops" }]} />
      {/* Page Header */}
      <PageHeader
        icon={<Sprout size={20} strokeWidth={1.75} />}
        label="Crop Info"
        title="작물 정보"
        description="주요 작물의 재배 환경, 예상 수익, 재배 난이도를 한눈에 비교하세요."
        count={filteredCrops.length}
      />

      {/* Filter Bar */}
      <FilterBar>
        <FilterRow>
          <FilterGroup
            label="카테고리"
            paramKey="category"
            options={CROP_CATEGORIES.filter((c) => c !== "전체")}
            currentValue={params.category}
            currentFilters={currentFilters}
            basePath="/crops"
          />
        </FilterRow>
        <FilterRow>
          <FilterGroup
            label="난이도"
            paramKey="difficulty"
            options={CROP_DIFFICULTIES.filter((d) => d !== "전체")}
            currentValue={params.difficulty}
            currentFilters={currentFilters}
            basePath="/crops"
          />
        </FilterRow>
        <FilterDivider />
        <FilterActions
          basePath="/crops"
          currentFilters={currentFilters}
          searchPlaceholder="작물명, 설명으로 검색..."
        />
      </FilterBar>

      {/* Crop Card Grid */}
      <div className={s.cropGrid}>
        {filteredCrops.map((crop) => (
          <CropCard key={crop.id} crop={crop} />
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <EmptyState
          icon={<Sprout size={32} strokeWidth={1.75} />}
          message={
            searchQuery
              ? `'${searchQuery}' 검색 결과가 없습니다.`
              : currentDifficulty !== "전체"
                ? `'${currentCategory}' 카테고리의 '${currentDifficulty}' 난이도 작물이 없습니다.`
                : `'${currentCategory}' 카테고리에 등록된 작물이 없습니다.`
          }
          linkHref="/crops"
          linkText="전체 작물 보기"
        />
      )}

      {/* Cross-link CTAs */}
      <div className={s.crossLinks}>
        <Link href="/crops/compare" className={s.compareLink}>
          <Icon icon={Scale} size="md" />
          작물 비교하기
          <Icon icon={ArrowRight} size="sm" />
        </Link>
        <Link href="/programs" className={s.crossLink}>
          관련 지원사업 찾기
          <Icon icon={ArrowRight} size="md" />
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
        {/* L1: 작물명 + 난이도 */}
        <div className={s.cropCardNameRow}>
          <h3 className={s.cropCardName}>{crop.name}</h3>
          <span
            className={`${s.difficultyBadge} ${DIFFICULTY_CLASS[crop.difficulty] ?? s.difficultyMedium}`}
          >
            난이도 · {crop.difficulty}
          </span>
        </div>

        {/* L2: 재배시기 */}
        <p className={s.cropCardSeason}>{crop.growingSeason}</p>

        {/* L3: 설명 */}
        <p className={s.cropCardDesc}><AutoGlossary text={crop.description} /></p>
      </div>
    </Link>
  );
}
