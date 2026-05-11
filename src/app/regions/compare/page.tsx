import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { STATIONS } from "@/lib/data/stations";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { RegionSelector } from "./region-selector";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { CompareDataSection } from "./compare-data-section";
import { CompareDataSkeleton } from "./compare-data-skeleton";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 지역 비교 — 기후·인프라·지원사업 데이터 비교",
  description:
    "귀농 후보 지역 최대 3곳의 기후, 인구, 의료·교육 인프라, 지원사업을 나란히 비교하세요. 어디가 나에게 맞을지 데이터로 확인할 수 있어요.",
  keywords: ["귀농 지역 비교", "귀농 지역 추천", "귀농 어디", "귀농 후보지"],
  alternates: { canonical: "/regions/compare" },
};

interface PageProps {
  searchParams: Promise<{ stations?: string; crop?: string }>;
}

/**
 * 2026-05-11 Streaming SSR 적용:
 * - 4개 외부 API await을 CompareDataSection으로 분리
 * - page.tsx는 header·selector를 즉시 렌더 (cold start < 0.5s)
 * - 차트·테이블은 Suspense로 streaming 채워짐
 * - 최악 응답 5s에도 첫 페인트 영향 0
 */
export default async function RegionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedIds = params.stations
    ? params.stations.split(",").filter(Boolean).slice(0, 3)
    : [];
  const selectedCropId = params.crop ?? null;
  const selectedStations = selectedIds
    .map((id) => STATIONS.find((st) => st.stnId === id))
    .filter((st): st is NonNullable<typeof st> => st != null);
  const hasSelection = selectedIds.length > 0;
  const year = new Date().getFullYear();

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
        description={`${year}년 기상 관측 데이터 기반으로 지역별 기후를 비교해요.`}
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
        <RegionSelector stations={STATIONS} selectedIds={selectedIds} />
      </Suspense>

      <a href="#suitability-heading" className={s.cropToolHint}>
        <Icon icon={Sprout} size="sm" />
        작물 적합성도 확인하기 ↓
      </a>

      {hasSelection ? (
        <Suspense fallback={<CompareDataSkeleton />}>
          <CompareDataSection
            selectedIds={selectedIds}
            selectedStations={selectedStations}
            selectedCropId={selectedCropId}
            year={year}
          />
        </Suspense>
      ) : (
        <div className={s.emptyState}>
          <p className={s.emptyStateText}>
            비교할 지역을 위에서 선택해 보세요. 최대 3곳까지 고를 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
}
