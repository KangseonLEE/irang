import s from "./loading.module.css";

export default function InterviewDetailLoading() {
  return (
    <div className={s.container}>
      {/* 히어로: 프로필 + 인용문 */}
      <div className={s.hero}>
        <div className={s.profileRow}>
          <div className={s.skeletonAvatar} />
          <div className={s.profileInfo}>
            <div className={s.skeletonName} />
            <div className={s.skeletonMeta} />
            <div className={s.skeletonTags} />
          </div>
        </div>
        <div className={s.skeletonQuote} />
        <div className={s.badgeRow}>
          <div className={s.skeletonBadge} />
          <div className={s.skeletonBadge} />
        </div>
      </div>

      {/* 브레드크럼 — 히어로 아래 (2026-10-02) */}
      <div className={s.breadcrumb} />

      {/* 이야기 */}
      <div className={s.section}>
        <div className={s.skeletonLabel} style={{ width: "5rem" }} />
        <div className={s.skeletonBlockLg} />
      </div>

      {/* 인사이트 2열 */}
      <div className={s.insightGrid}>
        <div className={s.card}>
          <div className={s.skeletonLabel} style={{ width: "8rem" }} />
          <div className={s.skeletonBlock} />
        </div>
        <div className={s.card}>
          <div className={s.skeletonLabel} style={{ width: "7rem" }} />
          <div className={s.skeletonBlock} />
        </div>
      </div>

      {/* 조언 */}
      <div className={s.adviceCard}>
        <div className={s.skeletonLabel} style={{ width: "10rem" }} />
        <div className={s.skeletonBlock} />
      </div>
    </div>
  );
}
