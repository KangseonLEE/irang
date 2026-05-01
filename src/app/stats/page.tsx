import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { StatsClient } from "./stats-client";
import { STATS_TABS, type StatsTabId } from "./stats-tabs";
import shared from "./stats.module.css";

export const metadata: Metadata = {
  title: "귀농·귀촌 통계 — 인구·청년·귀산촌·스마트팜·만족도",
  description:
    "연도별 귀농·귀촌 인구, 청년농 비율, 귀산촌 가구, 스마트팜 도입, 귀농 만족도까지 — 공공데이터 기반 통계를 한곳에서 확인하세요.",
  keywords: [
    "귀농 통계",
    "귀촌 통계",
    "청년농 통계",
    "귀산촌 통계",
    "스마트팜 통계",
    "귀농 만족도",
  ],
  alternates: { canonical: "/stats" },
  openGraph: {
    title: "귀농·귀촌 통계 한눈에 보기 | 이랑",
    description:
      "공공데이터 기반 귀농·귀촌·청년·귀산촌·스마트팜 5대 통계와 만족도 분석.",
  },
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function StatsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const validTab = STATS_TABS.find((t) => t.id === params.tab);
  const initialTab: StatsTabId = validTab ? validTab.id : "farming";

  return (
    <div className={shared.page}>
      <BreadcrumbJsonLd
        items={[{ name: "귀농·귀촌 통계", href: "/stats" }]}
      />

      {/* 뒤로가기 */}
      <Link href="/" className={shared.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        메인으로
      </Link>

      {/* 히어로 */}
      <SubPageHero
        overline="Stats Dashboard"
        icon={BarChart3}
        title="귀농, 숫자로 보면 명확해져요"
        titleAccent="명확"
        description="공공데이터 기반 귀농·귀촌·청년·귀산촌·스마트팜 5대 통계와 만족도까지 한곳에 모았어요."
      />

      {/* 5탭 SPA */}
      <StatsClient initialTab={initialTab} />
    </div>
  );
}
