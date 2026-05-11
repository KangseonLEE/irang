import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { RegionCardsSelector } from "./region-cards-selector";
import { CompareTabs } from "./compare-tabs";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { CompareDataSection } from "./compare-data-section";
import { CompareDataSkeleton } from "./compare-data-skeleton";
import { parseRegions } from "./region-item";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 지역 비교 — 기후·인프라·지원사업 데이터 비교",
  description:
    "귀농 후보 지역 최대 3곳의 기후, 인구, 의료·교육 인프라, 지원사업을 나란히 비교하세요. 시·도 단위 또는 시·군·구 단위까지 골라 데이터로 확인할 수 있어요.",
  keywords: ["귀농 지역 비교", "귀농 지역 추천", "귀농 어디", "귀농 후보지", "시군구 비교"],
  alternates: { canonical: "/regions/compare" },
};

interface PageProps {
  searchParams: Promise<{
    regions?: string;
    stations?: string;
    crop?: string;
  }>;
}

/**
 * 2026-05-12 정식 v2: 검색 1개 + 카드 selector + 탭.
 * - URL `?regions=jeonnam:suncheon-si,seoul,...` (신규)
 * - URL `?stations=108,119,259` (backward 호환)
 * - 첫 페인트는 header·selector만 즉시
 * - 데이터(4 API)는 Suspense streaming
 */
export default async function RegionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const regions = parseRegions(params);
  const selectedCropId = params.crop ?? null;
  const hasSelection = regions.length > 0;
  const year = new Date().getFullYear();

  const selectedRegionIds = regions.map((r) => r.id);

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
        description={`${year}년 기상 관측 데이터 기반으로 지역별 기후를 비교해요. 시·군·구까지 골라서 비교할 수 있어요.`}
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

      {hasSelection ? (
        <>
          <CompareTabs />
          <Suspense fallback={<CompareDataSkeleton />}>
            <CompareDataSection
              regions={regions}
              selectedCropId={selectedCropId}
              year={year}
            />
          </Suspense>
        </>
      ) : (
        <div className={s.emptyState}>
          <p className={s.emptyStateText}>
            비교할 지역을 위에서 선택해 보세요. 최대 3곳까지 고를 수 있어요.
            <br />
            시·군·구까지 좁혀서 비교할 수도 있어요.
          </p>
        </div>
      )}
    </div>
  );
}
