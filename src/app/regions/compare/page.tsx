import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { RegionCardsSelector } from "./region-cards-selector";
import { CompareTabs, TAB_IDS, type TabId } from "./compare-tabs";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { CompareDataSkeleton } from "./compare-data-skeleton";
import { ClimateView } from "./climate-view";
import { InfraView } from "./infra-view";
import { SuitabilityView } from "./suitability-view";
import { parseRegions } from "./region-item";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "농촌 정착 지역 비교 — 기후·인프라·지원사업 데이터 비교",
  description:
    "귀농 후보 지역 최대 3곳의 기후, 인구, 의료·교육 인프라, 지원사업을 나란히 비교하세요. 시·도 단위 또는 시·군·구 단위까지 골라 데이터로 확인할 수 있어요.",
  keywords: ["농촌 정착 지역 비교", "농촌 정착 지역 추천", "귀농 어디", "귀농 후보지", "시군구 비교"],
  alternates: { canonical: "/regions/compare" },
};

interface PageProps {
  searchParams: Promise<{
    regions?: string;
    stations?: string;
    crop?: string;
    tab?: string;
  }>;
}

function isTabId(value: string | undefined): value is TabId {
  return !!value && (TAB_IDS as readonly string[]).includes(value);
}

/**
 * 2026-05-12 v3: URL `?tab=climate|infra|suitability` 기반 view switcher.
 * - climate 탭(기본): weather API 3 호출만
 * - infra 탭: sgis + hira + education 9~27 호출 (탭 클릭 시에만)
 * - suitability 탭: weather + client selector
 * 첫 페인트 시 미선택 탭 데이터는 fetch 안 함 → 속도 핵심 개선.
 */
export default async function RegionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const regions = parseRegions(params);
  const selectedCropId = params.crop ?? null;
  const hasSelection = regions.length > 0;
  const year = new Date().getFullYear();
  const tab: TabId = isTabId(params.tab) ? params.tab : "climate";

  const selectedRegionIds = regions.map((r) => r.id);

  // 탭 전환 시 보존할 query string (regions + crop)
  const baseParams = new URLSearchParams();
  if (params.regions) baseParams.set("regions", params.regions);
  else if (selectedRegionIds.length > 0) {
    baseParams.set("regions", selectedRegionIds.join(","));
  }
  if (params.crop) baseParams.set("crop", params.crop);
  const baseQuery = baseParams.toString();

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "지역 탐색", href: "/regions" },
          { name: "지역 비교", href: "/regions/compare" },
        ]}
      />
      <DesktopHint message="지역 비교는 넓은 화면에서 더 잘 보여요" />

      <Suspense>
        <RoadmapBanner />
      </Suspense>

      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      <PageHeader
        icon={<Icon icon={MapPin} size="md" />}
        label="Region Compare"
        title="지역 비교"
        description={`${year}년 기상 관측 데이터로 지역별 기후·인프라를 비교해요. 위에서 최대 3곳까지, 시·군·구 단위로 좁혀서 골라보세요.`}
      />

      <Suspense
        fallback={
          <div
            className={s.selectorSkeleton}
            aria-busy="true"
            aria-label="지역 선택 로딩 중"
          />
        }
      >
        <RegionCardsSelector selectedRegionIds={selectedRegionIds} />
      </Suspense>

      {hasSelection && (
        <>
          <CompareTabs activeTab={tab} baseQuery={baseQuery} />
          <Suspense key={tab} fallback={<CompareDataSkeleton />}>
            {tab === "climate" && (
              <ClimateView regions={regions} year={year} />
            )}
            {tab === "infra" && <InfraView regions={regions} />}
            {tab === "suitability" && (
              <SuitabilityView
                regions={regions}
                selectedCropId={selectedCropId}
              />
            )}
          </Suspense>
        </>
      )}
    </div>
  );
}
