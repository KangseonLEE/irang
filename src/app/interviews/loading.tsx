import s from "./loading.module.css";

export default function InterviewsLoading() {
  return (
    <div className={s.container}>
      {/* Hero Header */}
      <div className={s.hero}>
        <p className={s.heroOverline}>귀농인 이야기</p>
        <h1 className={s.heroTitle}>귀농인 인터뷰</h1>
        <p className={s.heroDesc}>
          인터뷰 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Skeleton Cards */}
      <div className={s.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={s.card}>
            {/* Profile */}
            <div className={s.cardHeader}>
              <div className={s.skeletonAvatar} />
              <div>
                <div className={s.skeletonName} />
                <div className={s.skeletonMeta} style={{ marginTop: 4 }} />
              </div>
            </div>
            {/* Tags */}
            <div className={s.skeletonTags}>
              <div className={s.skeletonTag} />
              <div className={s.skeletonTag} />
            </div>
            {/* Quote */}
            <div className={s.skeletonQuote} />
            {/* Footer */}
            <div className={s.skeletonFooter}>
              <div className={s.skeletonBadge} />
              <div className={s.skeletonCta} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
