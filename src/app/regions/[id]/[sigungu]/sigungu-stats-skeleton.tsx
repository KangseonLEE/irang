import s from "./sigungu-stats-skeleton.module.css";

/**
 * SigunguData (API 의존 통계 섹션)의 Suspense fallback 스켈레톤.
 * 정적 콘텐츠(Hero, 작물, 지원사업 등)는 먼저 보여주고,
 * 이 스켈레톤이 API 응답을 기다리는 동안 표시됩니다.
 */
export function SigunguStatsSkeleton() {
  return (
    <div className={s.wrapper}>
      {/* Stats Grid */}
      <div className={s.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={s.statCard}>
            <div className={s.statIcon} />
            <div className={s.statBody}>
              <div className={s.statLabel} />
              <div className={s.statValue} />
              <div className={s.statSub} />
            </div>
          </div>
        ))}
      </div>

      {/* Climate Section Skeleton */}
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
    </div>
  );
}
