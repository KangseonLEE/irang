import { ArrowLeft } from "lucide-react";
import s from "./loading.module.css";

export default function EventDetailLoading() {
  return (
    <div className={s.container}>
      {/* Back link */}
      <div className={s.backLink}>
        <ArrowLeft size={16} />
        <span>행사 목록으로</span>
      </div>

      {/* Title + Badges */}
      <div className={s.titleSection}>
        <div className={s.badgeRow}>
          <div className={s.skeletonBadge} />
          <div className={s.skeletonBadge} />
        </div>
        <div className={s.skeletonTitle} />
      </div>

      <div className={s.contentGrid}>
        {/* Main content */}
        <div className={s.mainContent}>
          {/* Basic Info Card */}
          <div className={s.card}>
            <div className={s.skeletonLabel} style={{ width: "4rem", marginBottom: "1rem" }} />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={s.skeletonRow}>
                <div className={s.skeletonLabel} />
                <div className={s.skeletonValue} />
              </div>
            ))}
          </div>

          {/* Description Card */}
          <div className={s.card}>
            <div className={s.skeletonLabel} style={{ width: "4rem", marginBottom: "1rem" }} />
            <div className={s.skeletonBlock} />
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          <div className={s.card}>
            <div className={s.skeletonLabel} style={{ width: "4rem", marginBottom: "1rem" }} />
            <div className={s.skeletonButton} />
            <div className={s.skeletonSmall} />
          </div>
        </div>
      </div>
    </div>
  );
}
