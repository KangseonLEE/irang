import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Scale } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import {
  CROPS,
  CROP_CATEGORIES,
  CROP_DIFFICULTIES,
  sortCrops,
  DEFAULT_CROP_SORT,
  type CropCategory,
  type CropDifficulty,
  type CropSortKey,
} from "@/lib/data/crops";
import { CropSortControl } from "./crop-sort-control";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import { rankCropsForPersona, getCropPersonaFitTrace, type FitTrace } from "@/lib/data/persona-fit";
import { CropPageCard } from "@/components/crop/crop-page-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterActions } from "@/components/filter/filter-bar";
import { FilterShell } from "@/components/filter/filter-shell";
import { CalendarModal } from "./calendar-modal";
import { CropRequestButton } from "./crop-request-button";
import s from "./page.module.css";

const FarmingCalendar = dynamic(
  () =>
    import("@/components/crops/farming-calendar").then(
      (mod) => mod.FarmingCalendar
    )
);

export const metadata: Metadata = {
  title: "정착 작물 정보 — 수익·난이도·재배환경 비교",
  description:
    "딸기, 블루베리, 감귤 등 귀농 인기 작물의 수익성, 난이도, 기후 조건을 비교하세요. 초보자 추천 작물부터 고소득 작물까지 한눈에 확인할 수 있어요.",
  keywords: ["정착 작물", "정착 작물 추천", "작물 수익", "작물 재배", "정착 초보 작물", "고소득 작물"],
  alternates: { canonical: "/crops" },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    q?: string;
    persona?: string;
    sort?: string;
  }>;
}

export default async function CropsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = (params.category ?? "전체") as CropCategory;
  const currentDifficulty = (params.difficulty ?? "전체") as CropDifficulty;
  const searchQuery = params.q?.trim() ?? "";
  const currentPersona =
    params.persona && PERSONA_INDEX.has(params.persona as PersonaId)
      ? (params.persona as PersonaId)
      : undefined;
  const currentSort: CropSortKey =
    params.sort === "difficulty" ? "difficulty" : DEFAULT_CROP_SORT;

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

  // 페르소나 필터링: 점수 4+ 작물만 + 점수 내림차순 정렬 (페르소나 모드 시 sort param 무시)
  // 일반 모드: sortCrops 적용 (name | difficulty)
  if (currentPersona) {
    filteredCrops = rankCropsForPersona(filteredCrops, currentPersona)
      .filter((r) => r.score >= 4)
      .map((r) => r.crop);
  } else {
    filteredCrops = sortCrops(filteredCrops, currentSort);
  }

  // Phase 6 B3 D2 — 페르소나 모드일 때만 카드별 trace 사전 계산
  const cropTraces: Map<string, FitTrace> = currentPersona
    ? new Map(
        filteredCrops.map((c) => [c.id, getCropPersonaFitTrace(c, currentPersona)]),
      )
    : new Map();

  // 현재 활성 필터 (URL 빌딩용)
  const currentFilters: Record<string, string | undefined> = {
    category: params.category,
    difficulty: params.difficulty,
    q: params.q,
    persona: params.persona,
    sort: currentSort === DEFAULT_CROP_SORT ? undefined : currentSort,
  };

  return (
    <div className={s.page}>
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "초보자에게 추천하는 정착 작물은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "쌀, 고구마, 감자 등 밭작물이 난이도가 낮아 초보자에게 적합해요. 시설 투자가 적고 재배 기술이 비교적 간단해요.",
              },
            },
            {
              "@type": "Question",
              name: "정착 작물별 예상 소득은 어떻게 되나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "농촌진흥청 자료 기준, 딸기는 10a당 약 171만 원, 사과 약 114만 원, 쌀 약 57만 원 수준이에요. 작물별 상세 소득은 이랑에서 비교할 수 있어요.",
              },
            },
          ],
        }}
      />
      <BreadcrumbJsonLd items={[{ name: "작물 정보", href: "/crops" }]} />
      {/* Page Header */}
      <PageHeader
        icon={<Sprout size={20} strokeWidth={1.75} />}
        label="Crop Info"
        title="작물 정보"
        description="주요 작물의 재배 환경, 예상 수익, 재배 난이도를 한눈에 비교하세요."
        count={filteredCrops.length}
      />

      {/* Filter Bar — 데스크탑(>= 640) FilterBar + 모바일(< 640) BottomSheet */}
      <FilterShell
        basePath="/crops"
        currentFilters={currentFilters}
        params={[
          {
            paramKey: "category",
            label: "카테고리",
            options: CROP_CATEGORIES.filter((c) => c !== "전체"),
            currentValue: params.category,
          },
          {
            paramKey: "difficulty",
            label: "난이도",
            options: CROP_DIFFICULTIES.filter((d) => d !== "전체"),
            currentValue: params.difficulty,
          },
        ]}
        mobileActions={
          <FilterBar>
            <FilterActions
              basePath="/crops"
              currentFilters={currentFilters}
              searchPlaceholder="작물명, 설명으로 검색..."
              extraAction={
                <CalendarModal>
                  <FarmingCalendar
                    crops={filteredCrops.map((c) => ({
                      id: c.id,
                      name: c.name,
                      emoji: c.emoji,
                      growingSeason: c.growingSeason,
                    }))}
                  />
                </CalendarModal>
              }
            />
          </FilterBar>
        }
      />

      {/* 정렬 — 페르소나 모드에선 점수순이 본질이라 selector 숨김 */}
      {!currentPersona && filteredCrops.length > 0 && (
        <div className={s.sortRow}>
          <CropSortControl
            currentSort={currentSort}
            currentFilters={currentFilters}
            basePath="/crops"
          />
        </div>
      )}

      {/* Crop Card Grid — 정렬 변경 시 stagger fade-in */}
      <div key={currentSort} className={s.cropGrid}>
        {filteredCrops.map((crop, i) => (
          <div
            key={crop.id}
            className={s.cardAnim}
            style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}
          >
            <CropPageCard crop={crop} trace={cropTraces.get(crop.id)} />
          </div>
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <>
          <EmptyState
            icon={<Sprout size={32} strokeWidth={1.75} />}
            message={
              searchQuery
                ? `'${searchQuery}' 검색 결과가 없어요`
                : currentDifficulty !== "전체"
                  ? `'${currentCategory}' 카테고리의 '${currentDifficulty}' 난이도 작물이 없어요`
                  : `'${currentCategory}' 카테고리에 등록된 작물이 없어요`
            }
            linkHref="/crops"
            linkText="전체 작물 보기"
          />
          {searchQuery && <CropRequestButton query={searchQuery} />}
        </>
      )}

      {/* Cross-link CTAs */}
      <div className={s.crossLinks}>
        <Link href="/crops/compare" className={s.compareLink}>
          <Icon icon={Scale} size="md" />
          작물 비교하기
          <Icon icon={ArrowRight} size="sm" />
        </Link>
        <Link href="/programs" className={s.crossLink}>
          추천 지원사업 찾기
          <Icon icon={ArrowRight} size="md" />
        </Link>
      </div>
    </div>
  );
}

