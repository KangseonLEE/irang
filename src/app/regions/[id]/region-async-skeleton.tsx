import s from "./region-async-skeleton.module.css";

/**
 * RegionAsyncData의 Suspense fallback 스켈레톤.
 * 도 페이지에서 Hero + 작물 + 사이드바가 먼저 보이고,
 * 이 스켈레톤이 API 대기 중 표시됩니다.
 */
export function RegionAsyncSkeleton() {
  return (
    <div className={s.wrapper}>
      {/* Hero Banner placeholder */}
      <div className={s.banner} />

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={s.statCard}>
            <div className={s.statIcon} />
            <div className={s.statLabel} />
            <div className={s.statValue} />
          </div>
        ))}
      </div>

      {/* Climate */}
      <div className={s.climateCard}>
        <div className={s.climateTitle} />
        <div className={s.climateGrid}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={s.climateItem}>
              <div className={s.climateLabel} />
              <div className={s.climateValue} />
            </div>
          ))}
        </div>
      </div>

      {/* Section placeholders (지원사업, 교육, 행사) */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className={s.section}>
          <div className={s.sectionTitle} />
          <div className={s.sectionDesc} />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className={s.itemRow}>
              <div className={s.itemText}>
                <div className={s.itemTitle} />
                <div className={s.itemMeta} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
