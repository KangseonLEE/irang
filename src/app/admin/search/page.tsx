/**
 * 어드민 — 검색 분석
 *
 * 인기 검색어 + 결과 없음 키워드 + 일별 검색량
 */

import {
  fetchTopKeywords,
  fetchZeroResultQueries,
  fetchDailySearchCounts,
  fetchTrendingDataSourceStatus,
} from "@/lib/admin/queries";
import s from "./page.module.css";

export const revalidate = 300;

export default async function AdminSearchPage() {
  const [topKeywords, zeroResults, dailyCounts, trendingStatus] = await Promise.all([
    fetchTopKeywords(14, 20),
    fetchZeroResultQueries(14, 15),
    fetchDailySearchCounts(14),
    fetchTrendingDataSourceStatus(),
  ]);

  const maxDaily = Math.max(...dailyCounts.map((d) => d.count), 1);

  return (
    <div className={s.page}>
      <h1 className={s.heading}>검색 분석</h1>

      {/* ── 랜딩 인기 검색어 데이터 소스 상태 ── */}
      <section
        className={`${s.section} ${trendingStatus.isFallback ? s.sectionWarn : s.sectionOk}`}
      >
        <h2 className={s.sectionTitle}>랜딩 인기 검색어 데이터 소스</h2>
        <div className={s.statusRow}>
          <div className={s.statusBadge}>
            {trendingStatus.isFallback ? "🟡 정적 폴백 사용 중" : "✅ 실데이터 사용 중"}
          </div>
          <div className={s.statusDetail}>
            최근 7일 실데이터{" "}
            <strong>{trendingStatus.realDataCount}건</strong> · 노출 임계치{" "}
            <strong>{trendingStatus.threshold}건</strong>
          </div>
        </div>
        <p className={s.statusHelp}>
          {trendingStatus.isFallback
            ? `실데이터가 ${trendingStatus.threshold}건 미만이라 큐레이션 폴백 ${trendingStatus.fallbackCount}건이 노출되고 있어요. ${trendingStatus.threshold}건 이상부터 실데이터로 전환돼요.`
            : `Supabase search_logs 기준 실데이터가 노출되고 있어요.`}
        </p>
      </section>

      {/* ── 일별 검색량 바 차트 ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>일별 검색량 (14일)</h2>
        {dailyCounts.length === 0 ? (
          <p className={s.empty}>데이터가 없어요</p>
        ) : (
          <div className={s.barChart}>
            {dailyCounts.map((d) => (
              <div key={d.date} className={s.barCol}>
                <span className={s.barValue}>{d.count || ""}</span>
                <div
                  className={s.bar}
                  style={{ height: `${(d.count / maxDaily) * 100}%` }}
                />
                <span className={s.barLabel}>
                  {d.date.slice(5).replace("-", "/")}
                </span>
                {d.keywords.length > 0 && (
                  <div className={s.barTooltip} role="tooltip">
                    <div className={s.barTooltipHead}>
                      {d.date.slice(5).replace("-", "/")} · {d.count}건
                    </div>
                    <ul className={s.barTooltipList}>
                      {d.keywords.slice(0, 8).map((k) => (
                        <li key={k.query}>
                          <span className={s.barTooltipKw}>{k.query}</span>
                          <span className={s.barTooltipCount}>{k.count}회</span>
                        </li>
                      ))}
                    </ul>
                    {d.keywords.length > 8 && (
                      <div className={s.barTooltipMore}>
                        외 {d.keywords.length - 8}개
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={s.twoCol}>
        {/* ── 인기 검색어 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>인기 검색어 (14일)</h2>
          {topKeywords.length === 0 ? (
            <p className={s.empty}>검색 데이터가 없어요</p>
          ) : (
            <ol className={s.kwList}>
              {topKeywords.map((kw, i) => (
                <li key={kw.query} className={s.kwItem}>
                  <span className={s.rank}>{i + 1}</span>
                  <span className={s.kwText}>{kw.query}</span>
                  <span className={s.kwCount}>{kw.count}회</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ── 결과 없는 검색어 ── */}
        <section className={`${s.section} ${zeroResults.length > 0 ? s.sectionWarn : ""}`}>
          <h2 className={s.sectionTitle}>결과 없는 검색어 (14일)</h2>
          {zeroResults.length === 0 ? (
            <p className={s.empty}>모든 검색어에 결과가 있어요</p>
          ) : (
            <ol className={s.kwList}>
              {zeroResults.map((kw, i) => (
                <li key={kw.query} className={s.kwItem}>
                  <span className={s.rank}>{i + 1}</span>
                  <span className={s.kwText}>{kw.query}</span>
                  <span className={s.kwCount}>{kw.count}회</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
