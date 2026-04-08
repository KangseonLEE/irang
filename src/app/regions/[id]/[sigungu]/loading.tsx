import s from "./loading.module.css";

/**
 * 시군구 상세 페이지 — 전용 스켈레톤 로딩.
 * ISR on-demand 첫 방문이나 라우트 전환 시 전체 페이지 대신 표시됩니다.
 * GlobalLoading(오버레이) 대신 레이아웃을 미리 보여줘 체감 속도를 높입니다.
 */
export default function SigunguDetailLoading() {
  return (
    <div className={s.page}>
      {/* 브레드크럼 */}
      <div className={s.breadcrumb}>
        <div className={s.breadcrumbItem} />
        <div className={s.breadcrumbSep} />
        <div className={s.breadcrumbItem} />
        <div className={s.breadcrumbSep} />
        <div className={s.breadcrumbItemLong} />
      </div>

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroOverline} />
        <div className={s.heroTitle} />
        <div className={s.heroDesc} />
        <div className={s.heroTags}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={s.heroTag} />
          ))}
        </div>
      </div>

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

      {/* Section skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
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
