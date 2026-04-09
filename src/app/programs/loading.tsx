import { FileText } from "lucide-react";
import s from "./loading.module.css";

export default function ProgramsLoading() {
  return (
    <div className={s.container}>
      {/* Page Header */}
      <div className={s.header}>
        <div className={s.overline}>
          <FileText size={20} />
          <span className={s.overlineText}>Programs</span>
        </div>
        <h1 className={s.title}>지원사업 검색</h1>
        <p className={s.description}>
          지원사업 정보를 불러오고 있습니다...
        </p>
      </div>

      {/* Filter Skeleton */}
      <div className={s.filterSkeleton}>
        <div className={s.filterRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={s.skeletonPill} />
          ))}
        </div>
        <div className={s.filterRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s.skeletonPill} />
          ))}
        </div>
        <div className={s.filterRow}>
          <div className={s.skeletonSearch} />
        </div>
      </div>

      {/* Skeleton Cards */}
      <div className={s.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={s.card}>
            <div className={s.filterRow}>
              <div className={s.skeletonBadge} />
              <div className={s.skeletonBadge} />
            </div>
            <div className={s.skeletonTitle} />
            <div className={s.skeletonMeta} />
            <div className={s.skeletonBlock} />
            <div className={s.skeletonSmall} />
          </div>
        ))}
      </div>
    </div>
  );
}
