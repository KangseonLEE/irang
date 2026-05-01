import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  TrendingUp,
  BarChart3,
  Target,
  Sprout,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  smartfarmData,
  smartfarmSummary,
  smartfarmCrops,
  smartfarmCauses,
} from "@/lib/data/stats";
import { SmartfarmTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "@/app/stats/stats.module.css";

export function SmartfarmStats() {
  const latest = smartfarmData[smartfarmData.length - 1];
  const prev = smartfarmData[smartfarmData.length - 2];
  const first = smartfarmData[0];
  const growthPct = (((latest.farms / prev.farms) - 1) * 100).toFixed(1);
  const totalGrowth = (((latest.farms / first.farms) - 1) * 100).toFixed(0);

  return (
    <section
      id="summary-smartfarm"
      className={s.dashboard}
      aria-labelledby="tabpanel-smartfarm-title"
    >
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Cpu} size="sm" />
            Smart Farm
          </span>
          <h2 className={s.title} id="tabpanel-smartfarm-title">
            {smartfarmSummary.title}
          </h2>
          <p className={s.desc}>
            IoT·AI 기반 스마트팜 도입 농가와 시설면적 추이를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.farms.toLocaleString()}</span>
            <span className={s.kpiLabel}>2024 도입 농가</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.area.toLocaleString()}ha</span>
            <span className={s.kpiLabel}>시설면적</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={TrendingUp} size="lg" className={s.kpiIcon} />
              +{growthPct}%
            </span>
            <span className={s.kpiLabel}>전년 대비 증가</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Target} size="lg" className={s.kpiIcon} />
              +{totalGrowth}%
            </span>
            <span className={s.kpiLabel}>누적 증가율</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="스마트팜 통계는 농림축산식품부·스마트팜코리아 공공데이터를 가공한 참고 자료예요." />

      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="smartfarm-chart-title">
          <h3 className={s.cardTitle} id="smartfarm-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            농가 수 · 시설면적 추이
          </h3>
          <SmartfarmTrendChart data={smartfarmData} />
          <DataSource source={smartfarmSummary.source} />
        </section>

        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="smartfarm-crops-title">
            <h3 className={s.cardTitle} id="smartfarm-crops-title">
              <Icon icon={Sprout} size="lg" className={s.cardIcon} />
              주요 재배 작물
            </h3>
            <FactorBarChart
              data={smartfarmCrops}
              variant="positive"
              highlightTop={3}
            />
            <DataSource source={smartfarmSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="smartfarm-table-title">
            <h3 className={s.cardTitle} id="smartfarm-table-title">
              <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
              연도별 상세 데이터
            </h3>
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">연도</th>
                    <th scope="col">농가 수</th>
                    <th scope="col">면적(ha)</th>
                    <th scope="col">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...smartfarmData].reverse().map((d) => {
                    const prevEntry = smartfarmData.find(
                      (e) => e.year === d.year - 1,
                    );
                    const diff =
                      prevEntry !== undefined
                        ? (((d.farms / prevEntry.farms) - 1) * 100).toFixed(1)
                        : "—";
                    return (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td>{d.farms.toLocaleString()}</td>
                        <td>{d.area.toLocaleString()}</td>
                        <td>
                          {diff === "—"
                            ? diff
                            : `${Number(diff) >= 0 ? "+" : ""}${diff}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <DataSource source={smartfarmSummary.source} />
          </section>
        </div>
      </div>

      <section className={s.card}>
        <CauseAnalysisSection
          title="스마트팜이 왜 늘어날까?"
          causes={smartfarmCauses}
        />
      </section>

      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {smartfarmSummary.description}
        </blockquote>
        <Link
          href="/programs/roadmap?tab=smartfarm-support"
          className={s.interviewCta}
        >
          <Icon icon={Cpu} size="md" />
          <span>스마트팜 지원사업 보기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <footer className={s.footer}>
        <DataSource source={smartfarmSummary.source} />
      </footer>
    </section>
  );
}
