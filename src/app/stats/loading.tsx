import s from "./loading.module.css";

export default function StatsLoading() {
  return (
    <div className={s.container}>
      {/* Header */}
      <div className={s.header}>
        <h1 className={s.headerTitle}>귀농 통계</h1>
        <p className={s.headerDesc}>
          통계 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Summary Cards */}
      <div className={s.summaryGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={s.summaryCard}>
            <div className={s.skeletonLabel} />
            <div className={s.skeletonValue} />
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className={s.chartPlaceholder}>
        <div className={s.skeletonChartTitle} />
        <div className={s.skeletonChart} />
      </div>

      {/* Second Chart */}
      <div className={s.chartPlaceholder}>
        <div className={s.skeletonChartTitle} />
        <div className={s.skeletonChartSmall} />
      </div>
    </div>
  );
}
