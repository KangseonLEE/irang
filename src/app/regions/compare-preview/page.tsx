import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { CompareDataSection } from "../compare/compare-data-section";
import { CompareDataSkeleton } from "../compare/compare-data-skeleton";
import { parseRegions } from "../compare/region-item";
import { RegionSelectorV2 } from "./region-selector-v2";
import { CompareTabs } from "./compare-tabs";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "[미리보기] 지역 비교 — 슬롯 + 탭 UI",
  description: "지역 비교 페이지 미리보기 (검색 + 시도 chip + 슬롯 + 탭).",
  alternates: { canonical: "/regions/compare-preview" },
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    regions?: string;
    stations?: string;
    crop?: string;
  }>;
}

export default async function ComparePreviewPage({ searchParams }: PageProps) {
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
          { name: "지역 비교 (미리보기)", href: "/regions/compare-preview" },
        ]}
      />
      <DesktopHint message="지역 비교는 넓은 화면에서 더 잘 보여요" />

      <div className={s.previewBanner}>
        <span className={s.previewBadge}>미리보기</span>
        <span>슬롯 + 검색 + 시도 chip + 탭 UI 시안이에요. 정식 페이지는 <Link href="/regions/compare" className={s.previewLink}>/regions/compare</Link>.</span>
      </div>

      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      <PageHeader
        icon={<Icon icon={MapPin} size="md" />}
        label="Region Compare · Preview"
        title="지역 비교 (미리보기)"
        description={`${year}년 데이터로 지역 3곳을 나란히 비교해요. 큰 지역은 chip으로, 작은 시·군·구는 검색으로 찾으세요.`}
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
        <RegionSelectorV2 selectedRegionIds={selectedRegionIds} />
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
            위에서 비교할 지역을 골라 주세요. 검색 또는 시·도 칩에서 시작할 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
}
