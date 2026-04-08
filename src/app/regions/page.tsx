import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  MapPin,
  GitCompareArrows,
  Sprout,
  Landmark,
  FileText,
  Thermometer,
  Users,
  HeartHandshake,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { POPULATION_FALLBACK } from "@/lib/data/population";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { KoreaMap } from "@/components/map/korea-map";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "지역 탐색",
  description:
    "귀농 후보 지역을 탐색하고, 기후·작물·지원사업 정보를 확인하세요.",
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
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* Page Header */}
      <PageHeader
        icon={<MapPin size={20} />}
        label="Regions"
        title="지역 탐색"
        description="귀농을 고려 중인 지역을 선택해 기후, 인구, 추천 작물, 지원사업 정보를 확인하세요."
      />

      {/* ── 메인 섹션: 모바일 1단 / 데스크톱 2단 ── */}
      <section className={s.mainSection}>
        {/* 타이틀 (2단 레이아웃 위, full-width) */}
        <div className={s.mainHeader}>
          <h2 className={s.mainTitle}>
            지도에서 <span className={s.mainTitleAccent}>관심 지역</span>을 선택하세요
          </h2>
          <p className={s.mainDesc}>
            <AutoGlossary text="지역을 클릭하면 기후·인구·추천 작물·지원사업 등 상세 정보를 확인할 수 있습니다." />
          </p>
          <div className={s.densityLegend}>
            <span className={s.densityLegendTitle}>인구밀도</span>
            <div className={s.densityLegendRow}>
              <span className={s.densityLegendLabel}>낮음</span>
              <div className={s.densityLegendBar} />
              <span className={s.densityLegendLabel}>높음</span>
            </div>
          </div>
        </div>

        {/* 2단 컨테이너 */}
        <div className={s.mainGrid}>
          {/* 왼쪽: 지도 */}
          <div className={s.mapPane}>
            <KoreaMap densityMap={provinceDensityMap} showLegend={false} />
          </div>

          {/* 오른쪽: 대시보드 패널 (모바일에서는 지도 아래) */}
          <div className={s.dashPane}>
            {/* Quick Stats */}
            <div className={s.statsGrid}>
              <div className={s.statCard}>
                <Landmark size={18} className={s.statIcon} aria-hidden="true" />
                <div className={s.statText}>
                  <span className={s.statValue}>{PROVINCES.length}개</span>
                  <span className={s.statLabel}>도·광역시</span>
                </div>
              </div>
              <div className={s.statCard}>
                <Sprout size={18} className={s.statIcon} aria-hidden="true" />
                <div className={s.statText}>
                  <span className={s.statValue}>{CROPS.length}종</span>
                  <span className={s.statLabel}>추천 작물</span>
                </div>
              </div>
              <div className={s.statCard}>
                <FileText size={18} className={s.statIcon} aria-hidden="true" />
                <div className={s.statText}>
                  <span className={s.statValue}>{PROGRAMS.length}건</span>
                  <span className={s.statLabel}>지원사업</span>
                </div>
              </div>
            </div>

            {/* 확인 가능 정보 */}
            <div className={s.infoList}>
              <h3 className={s.infoListTitle}>지역별 확인 가능 정보</h3>
              <div className={s.infoItem}>
                <Thermometer size={18} className={s.infoIcon} aria-hidden="true" />
                <div>
                  <span className={s.infoItemTitle}>기후 데이터</span>
                  <span className={s.infoItemDesc}><AutoGlossary text="월별 기온·강수량·일조시간" /></span>
                </div>
              </div>
              <div className={s.infoItem}>
                <Users size={18} className={s.infoIcon} aria-hidden="true" />
                <div>
                  <span className={s.infoItemTitle}>인구·인프라</span>
                  <span className={s.infoItemDesc}><AutoGlossary text="인구 추이, 의료·교육 시설" /></span>
                </div>
              </div>
              <div className={s.infoItem}>
                <Sprout size={18} className={s.infoIcon} aria-hidden="true" />
                <div>
                  <span className={s.infoItemTitle}>추천 작물</span>
                  <span className={s.infoItemDesc}><AutoGlossary text="적합 작물, 예상 수익, 난이도" /></span>
                </div>
              </div>
              <div className={s.infoItem}>
                <HeartHandshake size={18} className={s.infoIcon} aria-hidden="true" />
                <div>
                  <span className={s.infoItemTitle}>지원사업</span>
                  <span className={s.infoItemDesc}><AutoGlossary text="정착금, 농지 임대, 교육 프로그램" /></span>
                </div>
              </div>
            </div>

            {/* 비교 CTA */}
            <Link href="/regions/compare" className={s.compareCta}>
              <div className={s.compareCtaContent}>
                <GitCompareArrows size={18} aria-hidden="true" />
                <div>
                  <span className={s.compareCtaTitle}>지역 비교하기</span>
                  <span className={s.compareCtaDesc}>최대 3개 지역을 한눈에 비교</span>
                </div>
              </div>
              <span className={s.compareCtaArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
