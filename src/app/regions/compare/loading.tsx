import { MapPin } from "lucide-react";
import s from "./loading.module.css";

export default function RegionsLoading() {
  return (
    <div className={s.container}>
      {/* Page Header */}
      <div className={s.header}>
        <div className={s.overline}>
          <MapPin size={20} />
          <span className={s.overlineText}>
            Region Compare
          </span>
        </div>
        <h1 className={s.title}>지역 비교</h1>
        <p className={s.description}>
          기상 관측 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Skeleton Cards */}
      <div className={s.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.cardHeaderRow}>
                <div className={s.skeletonTitle} />
                <div className={s.skeletonBadge} />
              </div>
              <div className={s.cardSubtext}>
                <div className={s.skeletonSubtext} />
              </div>
            </div>
            <div className={s.cardContent}>
              <div className={s.statsGrid}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className={s.statItem}>
                    <div className={s.skeletonIcon} />
                    <div className={s.statText}>
                      <div className={s.skeletonLabel} />
                      <div className={s.skeletonValue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
