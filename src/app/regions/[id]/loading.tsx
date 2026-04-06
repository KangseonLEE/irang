import s from "./loading.module.css";

export default function RegionDetailLoading() {
  return (
    <div className={s.page}>
      {/* Back Link */}
      <div className={s.backLink} />

      {/* Hero Skeleton */}
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

      {/* Stats Grid Skeleton */}
      <div className={s.statsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={s.statCard}>
            <div className={s.statIcon} />
            <div className={s.statLabel} />
            <div className={s.statValue} />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className={s.contentGrid}>
        {/* Main Content */}
        <div className={s.mainContent}>
          {/* 추천 작물 섹션 */}
          <div className={s.section}>
            <div className={s.sectionTitle} />
            <div className={s.sectionDesc} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={s.itemRow}>
                <div className={s.itemEmoji} />
                <div className={s.itemText}>
                  <div className={s.itemTitle} />
                  <div className={s.itemMeta} />
                </div>
              </div>
            ))}
          </div>

          {/* 지원사업 섹션 */}
          <div className={s.section}>
            <div className={s.sectionTitle} />
            <div className={s.sectionDesc} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={s.itemRow}>
                <div className={s.itemText}>
                  <div className={s.itemTitle} />
                  <div className={s.itemMeta} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          <div className={s.sideSection}>
            <div className={s.sideSectionTitle} />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={s.personaCard}>
                <div className={s.personaTitle} />
                <div className={s.personaDesc} />
              </div>
            ))}
          </div>
          <div className={s.sideSection}>
            <div className={s.sideSectionTitle} />
            <div className={s.personaDesc} />
          </div>
        </div>
      </div>
    </div>
  );
}
