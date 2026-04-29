import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  MapPin,
  Landmark,
  FileText,
  Thermometer,
  Users,
  HeartHandshake,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { POPULATION_FALLBACK } from "@/lib/data/population";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import dynamic from "next/dynamic";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";

const KoreaMap = dynamic(
  () =>
    import("@/components/map/korea-map").then((mod) => ({
      default: mod.KoreaMap,
    })),
  {
    loading: () => (
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "0 auto",
          aspectRatio: "450 / 760",
          background: "var(--muted, #f4f4f5)",
          borderRadius: "var(--radius-lg, 12px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
        aria-label="지도 불러오는 중"
        role="img"
      />
    ),
  },
);
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 지역 탐색 — 17개 시·도 기후·인프라·지원사업 비교",
  description:
    "전국 17개 시·도의 기후, 인구, 의료·교육 인프라, 추천 작물, 귀농 지원사업을 비교하세요. 인구밀도 지도로 한눈에 파악할 수 있어요.",
  alternates: { canonical: "/regions" },
};

export default async function RegionsPage() {
  // 시/도별 인구밀도 계산 (정적 fallback 데이터 사용 — API 호출 불필요)
  const provinceDensityMap: Record<string, number> = {};
  for (const prov of PROVINCES) {
    const popData = POPULATION_FALLBACK.find((p) => p.sgisCode === prov.sgisCode);
    if (popData && prov.area > 0) {
      provinceDensityMap[prov.id] = popData.population / prov.area;
    }
  }

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "지역 탐색", href: "/regions" }]} />
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* Page Header */}
      <PageHeader
        icon={<MapPin size={20} strokeWidth={1.75} />}
        label="Regions"
        title="지역 탐색"
        description="귀농을 고려 중인 지역을 선택해 기후, 인구, 추천 작물, 지원사업 정보를 확인하세요."
      />

      {/* ── Quick Stats ── */}
      <section className={s.statsSection}>
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <Icon icon={Landmark} size="lg" className={s.statIcon} />
            <div className={s.statText}>
              <span className={s.statValue}>{PROVINCES.length}개</span>
              <span className={s.statLabel}>도·광역시</span>
            </div>
          </div>
          <Link href="/crops" className={`${s.statCard} ${s.statCardLink}`}>
            <Icon icon={Sprout} size="lg" className={s.statIcon} />
            <div className={s.statText}>
              <span className={s.statValue}>{CROPS.length}종</span>
              <span className={s.statLabel}>추천 작물</span>
            </div>
          </Link>
          <Link href="/programs" className={`${s.statCard} ${s.statCardLink}`}>
            <Icon icon={FileText} size="lg" className={s.statIcon} />
            <div className={s.statText}>
              <span className={s.statValue}>{PROGRAMS.length}건</span>
              <span className={s.statLabel}>지원사업</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 지역별 확인 가능 정보 (4단 카드) ── */}
      <section className={s.infoSection}>
        <h2 className={s.infoSectionTitle}>지역별 확인 가능 정보</h2>
        <div className={s.infoGrid}>
          <div className={s.infoCard}>
            <Icon icon={Thermometer} size="lg" className={s.infoIcon} />
            <span className={s.infoCardTitle}>기후 데이터</span>
            <span className={s.infoCardDesc}><AutoGlossary text="월별 기온·강수량·일조시간" /></span>
          </div>
          <div className={s.infoCard}>
            <Icon icon={Users} size="lg" className={s.infoIcon} />
            <span className={s.infoCardTitle}>인구·인프라</span>
            <span className={s.infoCardDesc}><AutoGlossary text="인구 추이, 의료·교육 시설" /></span>
          </div>
          <Link href="/crops" className={`${s.infoCard} ${s.infoCardLink}`}>
            <Icon icon={Sprout} size="lg" className={s.infoIcon} />
            <span className={s.infoCardTitle}>추천 작물</span>
            <span className={s.infoCardDesc}><AutoGlossary text="적합 작물, 예상 수익, 난이도" /></span>
          </Link>
          <Link href="/programs" className={`${s.infoCard} ${s.infoCardLink}`}>
            <Icon icon={HeartHandshake} size="lg" className={s.infoIcon} />
            <span className={s.infoCardTitle}>지원사업</span>
            <span className={s.infoCardDesc}><AutoGlossary text="정착금, 농지 임대, 교육 프로그램" /></span>
          </Link>
        </div>
      </section>

      {/* ── 지도 섹션 ── */}
      <section className={s.mapSection}>
        <div className={s.mapHeader}>
          <h2 className={s.mapTitle}>
            지도에서 <span className={s.mapTitleAccent}>관심 지역</span>을 선택하세요
          </h2>
          <div className={s.densityLegend}>
            <span className={s.densityLegendTitle}>인구밀도</span>
            <div className={s.densityLegendRow}>
              <span className={s.densityLegendLabel}>낮음</span>
              <div className={s.densityLegendBar} />
              <span className={s.densityLegendLabel}>높음</span>
            </div>
          </div>
        </div>
        <div className={s.mapWrap}>
          <KoreaMap densityMap={provinceDensityMap} showLegend={false} />
        </div>
      </section>
    </div>
  );
}
