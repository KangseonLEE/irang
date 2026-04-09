import { Coins } from "lucide-react";
import s from "./loading.module.css";

export default function CostsLoading() {
  return (
    <div className={s.container}>
      {/* Page Header */}
      <div className={s.header}>
        <div className={s.overline}>
          <Coins size={20} />
          <span className={s.overlineText}>Cost Guide</span>
        </div>
        <h1 className={s.title}>귀농 비용 가이드</h1>
        <p className={s.description}>
          비용 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className={s.snapshotGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={s.snapshotCard}>
            <div className={s.skeletonLabel} />
            <div className={s.skeletonValue} />
          </div>
        ))}
      </div>

      {/* Section Placeholders */}
      <div className={s.section}>
        <div className={s.skeletonSectionTitle} />
        <div className={s.skeletonBlock} />
      </div>
      <div className={s.section}>
        <div className={s.skeletonSectionTitle} />
        <div className={s.skeletonBlock} />
      </div>
    </div>
  );
}
