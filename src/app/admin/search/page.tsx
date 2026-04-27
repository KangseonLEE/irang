/**
 * 어드민 — 검색 분석
 *
 * 인기 검색어 + 결과 없음 키워드 + 일별 검색량
 */

import {
  fetchTopKeywords,
  fetchZeroResultQueries,
  fetchDailySearchCounts,
} from "@/lib/admin/queries";
import s from "./page.module.css";

export const revalidate = 300;

export default async function AdminSearchPage() {
  const [topKeywords, zeroResults, dailyCounts] = await Promise.all([
    fetchTopKeywords(7, 20),
    fetchZeroResultQueries(7, 15),
    fetchDailySearchCounts(14),
  ]);

  const maxDaily = Math.max(...dailyCounts.map((d) => d.count), 1);

  return (
    <div className={s.page}>
      <h1 className={s.heading}>검색 분석</h1>

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
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={s.twoCol}>
        {/* ── 인기 검색어 ── */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>인기 검색어 (7일)</h2>
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
          <h2 className={s.sectionTitle}>결과 없는 검색어 (7일)</h2>
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
