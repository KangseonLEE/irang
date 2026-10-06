import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Scale } from "lucide-react";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import { CROPS, DEFAULT_CROP_SORT, type CropSortKey } from "@/lib/data/crops";
import { CropSortControl } from "./crop-sort-control";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import { getCropPersonaFitTrace, type FitTrace } from "@/lib/data/persona-fit";
import { shareMetadata } from "@/lib/seo/share-metadata";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  cropListEmptyMessage,
  filterCropList,
  scoringPersonaOf,
  selectedOptions,
} from "./crop-list-filter";
import { CropPageCard } from "@/components/crops/crop-page-card";
import { PageHeader } from "@/components/ui/page-header";
import { PersonaCta } from "@/components/persona/persona-cta";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterActions } from "@/components/filter/filter-bar";
import { FilterShell } from "@/components/filter/filter-shell";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { Pagination } from "@/components/ui/pagination";
import { CalendarModal } from "./calendar-modal";
import { CropRequestButton } from "./crop-request-button";
import { CropList } from "./crop-list";
import { CropDashboard } from "./crop-dashboard";
import {
  buildCropRows,
  buildCropFacts,
  buildIncomeFacts,
} from "./crop-aggregate";
import s from "./page.module.css";

const FarmingCalendar = dynamic(
  () =>
    import("@/components/crops/farming-calendar").then(
      (mod) => mod.FarmingCalendar
    )
);

const DESCRIPTION =
  "딸기, 블루베리, 감귤 등 귀농 인기 작물의 수익성, 난이도, 기후 조건을 비교하세요. 초보자 추천 작물부터 고소득 작물까지 한눈에 확인할 수 있어요.";

export const metadata: Metadata = {
  title: "귀농 작물 목록 — 수익·난이도·재배환경 비교",
  description: DESCRIPTION,
  keywords: ["귀농 작물", "귀농 작물 추천", "정착 작물", "정착 작물 추천", "작물 수익", "작물 재배", "정착 초보 작물", "고소득 작물"],
  alternates: { canonical: "/crops" },
  // 공유 카드도 페이지 제목·설명으로 — 안 정하면 레이아웃의 사이트 기본 카드가 나갔다(10/6 QA Q2-W3).
  // 제목은 위 title + " | 이랑"(공유 카드는 레이아웃 제목 템플릿을 안 거친다) — 일치는 qa1006-feb-crops 테스트가 지킨다
  ...shareMetadata({
    title: "귀농 작물 목록 — 수익·난이도·재배환경 비교 | 이랑",
    description: DESCRIPTION,
    path: "/crops",
  }),
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    q?: string;
    persona?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

/** 한 페이지에 보여주는 작물 수 (카드·테이블 공통) */
const PER_PAGE = 20;

export default async function CropsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // 카테고리·난이도는 복수 선택(CSV) — 그룹 안은 합집합, 그룹 사이는 교집합 (10/6 QA Q4-F1)
  const selectedCategories = selectedOptions(CATEGORY_OPTIONS, params.category);
  const selectedDifficulties = selectedOptions(DIFFICULTY_OPTIONS, params.difficulty);
  const categoryValue = selectedCategories.length > 0 ? selectedCategories.join(",") : undefined;
  const difficultyValue = selectedDifficulties.length > 0 ? selectedDifficulties.join(",") : undefined;
  const searchQuery = params.q?.trim() ?? "";
  const currentPersona =
    params.persona && PERSONA_INDEX.has(params.persona as PersonaId)
      ? (params.persona as PersonaId)
      : undefined;
  // 적합도로 거르고 줄 세우는 페르소나 — "기본 균등"(balanced)은 제외(모두 3점이라 거르면 빈 목록, 10/6 QA Q4-W3)
  const scoringPersona = scoringPersonaOf(currentPersona);
  const currentSort: CropSortKey =
    params.sort === "difficulty" || params.sort === "income"
      ? params.sort
      : DEFAULT_CROP_SORT;
  const viewMode: ViewMode = params.view === "table" ? "table" : "card";

  // 카테고리·난이도·검색어(이름 + 설명, 1글자는 낱말 단위) → 적합도 페르소나면 4점 이상 점수순, 아니면 고른 정렬
  const filteredCrops = filterCropList(CROPS, {
    categories: selectedCategories,
    difficulties: selectedDifficulties,
    query: searchQuery,
    persona: currentPersona,
    sort: currentSort,
  });

  // 페이지네이션 — 카드·테이블 공통 20개/페이지. 범위 밖 page는 clamp.
  const totalPages = Math.max(1, Math.ceil(filteredCrops.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), totalPages);
  const pagedCrops = filteredCrops.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Phase 6 B3 D2 — 페르소나 모드일 때만 카드별 trace 사전 계산 (현재 페이지만, 균등은 근거가 없어 생략)
  const cropTraces: Map<string, FitTrace> = scoringPersona
    ? new Map(
        pagedCrops.map((c) => [c.id, getCropPersonaFitTrace(c, scoringPersona)]),
      )
    : new Map();

  // 현재 활성 필터 (URL 빌딩용) — 필터/정렬 변경 시 page 리셋 (events·programs 준용: page 미포함)
  const currentFilters: Record<string, string | undefined> = {
    category: categoryValue,
    difficulty: difficultyValue,
    q: params.q,
    persona: params.persona,
    sort: currentSort === DEFAULT_CROP_SORT ? undefined : currentSort,
    view: params.view,
  };

  // 목록(table) 뷰용 행 — CROPS + CROP_DETAILS 조인 (현재 페이지 행만)
  const cropRows = viewMode === "table" ? buildCropRows(pagedCrops) : [];

  // 대시보드 차트 집계 — 전체 CROPS 기준 (필터 무관 전체 통계)
  const { facts: cropFacts, totalProvinceCount } = buildCropFacts();
  // 10a당 연소득 비교 — 파싱 가능한 작물만 + 제외 목록(각주용)
  const { incomeFacts, excludedNames } = buildIncomeFacts();

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
                text: "농촌진흥청 2025년도 조사 기준, 10a당 딸기(수경) 약 1,642만 원, 사과 약 570만 원, 고구마 약 180만 원 수준이에요. 작물별 상세 소득은 이랑에서 비교할 수 있어요.",
              },
            },
          ],
        }}
      />
      <BreadcrumbJsonLd items={[{ name: "작물 목록", href: "/crops" }]} />
      {/* Page Header */}
      <PageHeader
        icon={<Sprout size={20} strokeWidth={1.75} />}
        label="Crop List"
        title="작물 목록"
        description="주요 작물의 재배 환경, 예상 수익, 재배 난이도를 한눈에 비교하세요."
        count={filteredCrops.length}
      />

      <PersonaCta persona={currentPersona} from="crops_list" />

      {/* Filter Bar — 데스크탑(>= 640) FilterBar + 모바일(< 640) BottomSheet */}
      <FilterShell
        basePath="/crops"
        currentFilters={currentFilters}
        params={[
          {
            paramKey: "category",
            label: "카테고리",
            options: CATEGORY_OPTIONS,
            currentValue: categoryValue,
          },
          {
            paramKey: "difficulty",
            label: "난이도",
            options: DIFFICULTY_OPTIONS,
            currentValue: difficultyValue,
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
                      category: c.category,
                      growingSeason: c.growingSeason,
                    }))}
                  />
                </CalendarModal>
              }
            />
          </FilterBar>
        }
      />

      {/* 결과 영역 제목 — 화면엔 툴바가 같은 정보를 보여 주므로 보조기기용. h1 다음 카드 이름(h3)이 바로 오면
          제목 단계가 건너뛰어진다(10/6 QA axe heading-order, 가나다순 첫 카드 '가지'에서 검출) */}
      {filteredCrops.length > 0 && (
        <h2 className={s.srOnly}>작물 {filteredCrops.length}종</h2>
      )}

      {/* 결과 수 + 정렬 + 보기 토글 */}
      {filteredCrops.length > 0 && (
        <ListToolbar count={filteredCrops.length} unit="종" label="작물">
          {/* 페르소나 모드에선 점수순이 본질이라 sort selector 숨김 (균등은 일반 정렬이라 노출) */}
          {!scoringPersona && (
            <CropSortControl
              currentSort={currentSort}
              currentFilters={currentFilters}
              basePath="/crops"
            />
          )}
          <Suspense>
            <ViewToggle current={viewMode} />
          </Suspense>
        </ListToolbar>
      )}

      {/* 목록(table) 뷰 / 카드 그리드 — 페이지당 20개 */}
      {filteredCrops.length > 0 &&
        (viewMode === "table" ? (
          <CropList rows={cropRows} />
        ) : (
          /* Crop Card Grid — 정렬 변경 시 stagger fade-in */
          <div key={`${currentSort}-${page}`} className={s.cropGrid}>
            {pagedCrops.map((crop, i) => (
              <div
                key={crop.id}
                className={s.cardAnim}
                style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}
              >
                <CropPageCard crop={crop} trace={cropTraces.get(crop.id)} />
              </div>
            ))}
          </div>
        ))}

      {/* 페이지네이션 — 카드·테이블 공통 */}
      {filteredCrops.length > 0 && totalPages > 1 && (
        <Suspense>
          <Pagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      )}

      {filteredCrops.length === 0 && (
        <>
          <EmptyState
            icon={<Sprout size={32} strokeWidth={1.75} />}
            message={cropListEmptyMessage({
              query: searchQuery,
              categories: selectedCategories,
              difficulties: selectedDifficulties,
              personaLabel: scoringPersona ? PERSONA_INDEX.get(scoringPersona)?.label : undefined,
            })}
            linkHref="/crops"
            linkText="전체 작물 보기"
          />
          {searchQuery && <CropRequestButton query={searchQuery} />}
        </>
      )}

      {/* 작물 데이터 대시보드 — 전체 작물 기준 5종 차트 + 인터랙티브 필터 */}
      <CropDashboard
        facts={cropFacts}
        totalProvinceCount={totalProvinceCount}
        incomeFacts={incomeFacts}
        excludedIncomeNames={excludedNames}
      />

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

