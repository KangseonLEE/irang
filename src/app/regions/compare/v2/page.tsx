import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { CompareDataSection } from "../compare-data-section";
import { CompareDataSkeleton } from "../compare-data-skeleton";
import { parseRegions } from "../region-item";
import { RegionCardsSelector } from "./region-cards-selector";
import { CompareTabs } from "./compare-tabs";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "[미리보기 v2] 지역 비교 — 카드 + 검색 + 탭",
  description: "지역 비교 v2 시안 (검색 1개 + 카드 통합 + 탭).",
  alternates: { canonical: "/regions/compare/v2" },
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    regions?: string;
    stations?: string;
    crop?: string;
  }>;
}

export default async function CompareV2Page({ searchParams }: PageProps) {
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
          { name: "지역 비교 v2", href: "/regions/compare/v2" },
        ]}
      />
      <DesktopHint message="지역 비교는 넓은 화면에서 더 잘 보여요" />

      <div className={s.previewBanner}>
        <span className={s.previewBadge}>v2 미리보기</span>
        <span>
          검색 1개 + 카드 통합 + 탭 시안이에요. 정식 페이지는{" "}
          <Link href="/regions/compare" className={s.previewLink}>/regions/compare</Link>.
        </span>
      </div>

      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      <PageHeader
        icon={<Icon icon={MapPin} size="md" />}
        label="Region Compare · v2"
        title="지역 비교 (v2)"
        description={`${year}년 데이터로 지역 3곳을 카드로 비교해요. 위에서 검색하거나, 카드에서 시·군·구를 좁혀보세요.`}
      />

      <Suspense
        fallback={<div className={s.selectorSkeleton} aria-busy="true" />}
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
            위에서 지역을 검색하거나, 카드의 + 버튼을 눌러 추가해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
