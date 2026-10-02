import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  TrendingUp,
  BarChart3,
  Target,
  Sprout,
  Gauge,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  smartfarmAreaData,
  smartfarmAdoption,
  smartfarmSummary,
  smartfarmCrops,
  smartfarmCropsSource,
  smartfarmCauses,
  changePct,
  signedPct,
} from "@/lib/data/stats";
import { SmartfarmTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "./stats-shared.module.css";

/**
 * 스마트팜 탭 — 시설원예 스마트팜(스마트온실) 보급 면적(ha). 근거를 찾지 못한 '도입 농가 수'는 10/3 에 걷어냈다.
 * 공식 수치가 없는 해(2022·2024)는 넣지 않아서 표의 "전년 대비"는 바로 앞 해가 있을 때만 계산한다.
 */
export function SmartfarmStats() {
  const latest = smartfarmAreaData[smartfarmAreaData.length - 1];
  const first = smartfarmAreaData[0];
  const totalGrowth = changePct(latest.area, first.area);
  const missingYears: number[] = [];
  for (let y = first.year; y <= latest.year; y += 1) {
    if (!smartfarmAreaData.some((d) => d.year === y)) missingYears.push(y);
  }

  return (
    <section
      id="summary-smartfarm"
      className={s.dashboard}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby="tab-smartfarm"
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
            시설원예 스마트팜(스마트온실) 보급 면적과 품목 비중을 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.area.toLocaleString("ko-KR")}ha</span>
            <span className={s.kpiLabel}>{latest.year} 보급 면적</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={TrendingUp} size="lg" className={s.kpiIcon} />
              {signedPct(totalGrowth, 0)}
            </span>
            <span className={s.kpiLabel}>{first.year}년 대비</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Gauge} size="lg" className={s.kpiIcon} />
              {smartfarmAdoption.pct}%
            </span>
            <span className={s.kpiLabel}>{smartfarmAdoption.year} 스마트온실 도입률</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Target} size="lg" className={s.kpiIcon} />
              {smartfarmAdoption.targetPct}%
            </span>
            <span className={s.kpiLabel}>{smartfarmAdoption.targetYear} 목표 도입률</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="스마트팜 통계는 농림축산식품부·국회예산정책처 공식 자료를 가공한 참고 자료예요." />

      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="smartfarm-chart-title">
          <h3 className={s.cardTitle} id="smartfarm-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            보급 면적 추이
          </h3>
          <SmartfarmTrendChart data={smartfarmAreaData} />
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
              highlightTop={2}
            />
            <DataSource source={smartfarmCropsSource} />
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
                    <th scope="col">면적(ha)</th>
                    <th scope="col">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...smartfarmAreaData].reverse().map((d) => {
                    const prevEntry = smartfarmAreaData.find(
                      (e) => e.year === d.year - 1,
                    );
                    return (
                      <tr key={d.year}>
                        <td>
                          {d.year}
                          {d.provisional ? " (잠정)" : ""}
                        </td>
                        <td>{d.area.toLocaleString("ko-KR")}</td>
                        <td>{prevEntry ? signedPct(changePct(d.area, prevEntry.area)) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <DataSource
              source={
                missingYears.length > 0
                  ? `${smartfarmSummary.source} · ${missingYears.join("·")}년은 공식 수치가 없어요`
                  : smartfarmSummary.source
              }
            />
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
        {/* 10/3: tab 값은 normalize 화이트리스트(gov-roadmap id)와 같아야 한다 — "smartfarm-support" 는 308 로 떨어졌다 */}
        <Link
          href="/programs/roadmap?tab=smart-farm"
          className={s.interviewCta}
        >
          <Icon icon={Cpu} size="md" />
          <span>스마트팜 지원사업 보기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <footer className={s.footer}>
        <DataSource source={smartfarmSummary.source} />
        <DataSource source={smartfarmCropsSource} />
      </footer>
    </section>
  );
}
