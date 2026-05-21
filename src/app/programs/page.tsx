import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText, ArrowRight, Map, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { SectionNav } from "@/components/layout/section-nav";
import {
  filterProgramsAsync,
  getCurrentPeriod,
  PAGE_SIZE,
  REGIONS,
  SUPPORT_TYPES,
  AGE_RANGES,
  PROGRAM_CATEGORIES,
  PROGRAM_CATEGORY_LABELS,
  type ProgramFilters,
} from "@/lib/data/programs";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import { rankProgramsForPersona } from "@/lib/data/persona-fit";
import { loadSyncMeta, buildPeriodLabel, getDataYear } from "@/lib/data/loader";
import Link from "next/link";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { ProgramList } from "./program-list";
import { ProgramRequestCta } from "./program-request-cta";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import { FilterBar, FilterActions } from "@/components/filter/filter-bar";
import { ProgramsFilter } from "./programs-filter";
import s from "./page.module.css";

/** 5/22 Sprint — status 필터 기본 선택 (마감 제외 = 기존 includeClosed=false 동작 보존). */
const DEFAULT_STATUS_VALUES = ["모집중", "모집예정"] as const;
const STATUS_OPTIONS = ["모집중", "모집예정", "마감"] as const;

const sectionNavItems = [
  { href: "/programs", label: "지원사업" },
  { href: "/education", label: "교육" },
  { href: "/events", label: "체험·행사" },
];

export const metadata: Metadata = {
  title: "농촌 정착 지원사업 — 정착금·주택·영농자금 검색",
  description:
    "전국 귀농·귀촌 지원사업을 지역별로 검색하세요. 정착금 최대 3억, 주택 지원, 영농 자금 등 자격 조건과 신청 방법을 비교해요.",
  alternates: { canonical: "/programs" },
};

/* ── /programs는 searchParams 의존 → 자동 dynamic SSR ──
   2026-05-11 dcdf3d2: revalidate 300 추가 시도했다가 prerender NOT FOUND + 308 무한 redirect 발생.
   ISR과 dynamic SSR 충돌로 빌드 산출물이 깨짐. revalidate 제거 + next.config.ts s-maxage 600만 유지.
   신규 데이터 push 후 cf 캐시 stale 대응: Cloudflare 수동 purge 또는 자연 만료(10분). */

interface PageProps {
  searchParams: Promise<{
    region?: string;
    age?: string;
    supportType?: string;
    category?: string;
    status?: string;
    q?: string;
    /** @deprecated 5/22 status 필터로 일원화. URL 들어와도 무시. */
    includeClosed?: string;
    period?: string;
    view?: string;
    persona?: string;
  }>;
}


export default async function ProgramsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 5/22 Sprint — status 필터로 일원화. includeClosed param은 deprecated (URL 들어와도 무시).
  // status에 "마감" 포함 → 마감 사업 자동 표시 (filterPrograms 내부 includeClosed 분기 대체).
  const rawStatuses = params.status
    ? params.status.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const validStatuses = rawStatuses.filter((v): v is (typeof STATUS_OPTIONS)[number] =>
    (STATUS_OPTIONS as readonly string[]).includes(v),
  );
  const statusValues =
    validStatuses.length > 0 ? validStatuses : [...DEFAULT_STATUS_VALUES];
  const includesClosed = statusValues.includes("마감");
  const statusCsv = statusValues.join(",");

  const viewMode: ViewMode = params.view === "table" ? "table" : "card";
  // 기본값: 현재 연월
  const period = params.period || getCurrentPeriod();
  const currentPersona =
    params.persona && PERSONA_INDEX.has(params.persona as PersonaId)
      ? (params.persona as PersonaId)
      : undefined;

  // category 값 검증 — CSV 입력 허용 (5/20 Sprint P 복수 선택). 유효한 값만 dedup CSV로 재조립.
  // middleware normalize가 1차 차단하지만, dev mode·CF cache hit 우회 케이스 대비 page 단 가드 유지.
  const validCategory = (() => {
    if (!params.category) return undefined;
    const set = new Set<string>();
    const valid: string[] = [];
    for (const p of params.category.split(",")) {
      const t = p.trim();
      if (!t || set.has(t)) continue;
      if ((PROGRAM_CATEGORIES as readonly string[]).includes(t)) {
        valid.push(t);
        set.add(t);
      }
    }
    return valid.length > 0 ? valid.join(",") : undefined;
  })();

  const filters: ProgramFilters = {
    region: params.region,
    age: params.age,
    supportType: params.supportType,
    category: validCategory,
    status: statusCsv,
    query: params.q,
    // status에 "마감" 포함 시 자동 활성화 — 마감 사업이 filter 단계에서 걸러지지 않도록.
    includeClosed: includesClosed,
    period,
  };

  // SSR: API → 폴백 자동 전환, 첫 페이지 데이터만 렌더
  const [{ programs: rawFiltered }, lastSyncAt] = await Promise.all([
    filterProgramsAsync(filters),
    loadSyncMeta("support_programs"),
  ]);

  // 페르소나 필터링: 점수 4+ 사업만 + 점수 내림차순 정렬
  const allFiltered = currentPersona
    ? rankProgramsForPersona(rawFiltered, currentPersona)
        .filter((r) => r.score >= 4)
        .map((r) => r.program)
    : rawFiltered;

  const total = allFiltered.length;
  const programs = allFiltered.slice(0, PAGE_SIZE);
  const hasMore = PAGE_SIZE < total;

  // 기준일 표시 텍스트 (sync 시각 기반 자동 생성, 폴백: 현재 연월)
  const periodLabel = buildPeriodLabel(lastSyncAt, period);
  const dataYear = getDataYear(lastSyncAt);

  // 현재 활성 필터 (URL 빌딩용)
  // 5/22 — includeClosed 제거. status param으로 일원화. UI 표시용 URL value는 default 적용분 포함.
  const statusUrlValue =
    validStatuses.length > 0 ? validStatuses.join(",") : undefined;
  const currentFilters: Record<string, string | undefined> = {
    region: params.region,
    supportType: params.supportType,
    category: validCategory,
    status: statusUrlValue,
    q: params.q,
    age: params.age,
    period: params.period,
    view: params.view,
    persona: params.persona,
  };

  return (
    <>
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "농촌 정착 지원금 자격 조건은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "지자체마다 다르지만 일반적으로 농촌 지역 전입, 일정 기간 거주, 영농 계획서 제출이 기본 조건이에요. 청년(만 39세 이하)은 별도 우대 조건이 있어요.",
              },
            },
            {
              "@type": "Question",
              name: "농촌 정착금은 얼마나 받을 수 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "지자체별로 월 50만~100만 원 수준의 정착 지원금을 최대 3년간 받을 수 있어요. 영농 정착 자금은 최대 3억 원까지 장기 저리 대출도 가능해요.",
              },
            },
          ],
        }}
      />
      <BreadcrumbJsonLd items={[{ name: "지원사업 검색", href: "/programs" }]} />
      {/* 섹션 내비게이션 — .page 바깥에서 full-width sticky */}
      <Suspense>
        <SectionNav items={sectionNavItems} />
      </Suspense>

    <div className={s.page}>
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* 정부사업 진입 가이드 배너 */}
      <Link href="/programs/roadmap" className={s.guideBanner}>
        <div className={s.guideBannerIcon} aria-hidden="true">
          <Map size={18} />
        </div>
        <div className={s.guideBannerBody}>
          <span className={s.guideBannerTitle}>정부사업 신청법</span>
          <span className={s.guideBannerDesc}><AutoGlossary text="5대 핵심 사업의 자격 요건·신청 절차 안내" /></span>
        </div>
        <ArrowRight size={16} className={s.guideBannerArrow} />
      </Link>

      {/* Page Header */}
      <PageHeader
        icon={<FileText size={20} />}
        label="Support Programs"
        title="지원사업 검색"
        description="나이, 지역, 희망 작물에 맞는 귀농 · 귀촌 지원사업을 찾아보세요."
        periodLabel={periodLabel}
        dataNote={`${dataYear}년 데이터만 제공되며, 연도 변경은 지원되지 않습니다.`}
      />

      {/* 모집 시즌 안내 — 5월 같은 비수기에 활성 공고가 적은 이유 설명 */}
      <div className={s.seasonNotice} role="note">
        <Info size={16} aria-hidden="true" className={s.seasonNoticeIcon} />
        <p className={s.seasonNoticeText}>
          농촌 정착 지원사업은 보통 <strong>1~3월(상반기) · 7~9월(하반기)</strong>에 모집을 집중해요.
          그 외 시기에는 활성 공고가 적을 수 있어요. 지난 모집 사례까지 참고하려면 <strong>모집 상태</strong>에서 <strong>마감</strong>을 추가하세요.
        </p>
      </div>

      {/* Filter Bar — 데스크탑(>= 640) FilterBar + 모바일(< 640) BottomSheet */}
      {/* 5/22 Sprint — status 필터 일원화. includeClosed 토글·IncludeClosedHint 제거. */}
      <ProgramsFilter
        basePath="/programs"
        currentFilters={currentFilters}
        params={[
          {
            paramKey: "region",
            label: "지역",
            options: REGIONS,
            currentValue: params.region,
          },
          {
            paramKey: "supportType",
            label: "지원 유형",
            options: SUPPORT_TYPES,
            currentValue: params.supportType,
          },
          {
            paramKey: "category",
            label: "카테고리",
            options: PROGRAM_CATEGORIES,
            optionLabels: PROGRAM_CATEGORY_LABELS,
            currentValue: validCategory,
          },
          {
            paramKey: "age",
            label: "연령대",
            options: AGE_RANGES,
            currentValue: params.age,
          },
          {
            paramKey: "status",
            label: "모집 상태",
            options: STATUS_OPTIONS,
            currentValue: statusUrlValue,
          },
        ]}
        mobileActions={
          <FilterBar>
            <FilterActions
              basePath="/programs"
              currentFilters={currentFilters}
              searchPlaceholder="지원사업명, 지역, 기관명으로 검색"
            />
          </FilterBar>
        }
      />

      <ListToolbar count={total}>
        <Suspense>
          <ViewToggle current={viewMode} />
        </Suspense>
      </ListToolbar>

      <ProgramList
        initialPrograms={programs}
        initialHasMore={hasMore}
        total={total}
        filters={filters}
        viewMode={viewMode}
        allPrograms={viewMode === "table" ? allFiltered : undefined}
        currentPersona={currentPersona}
      />

      {/* ═══ 피드백 CTA ═══ */}
      <ProgramRequestCta />
    </div>
    </>
  );
}

// 2026-05-11: Vercel ISR cache invalidate trigger commit
