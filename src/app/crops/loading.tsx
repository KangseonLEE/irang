import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import s from "./loading.module.css";

export default function CropsLoading() {
  return (
    <div className={s.container}>
      {/* Page Header */}
      <div className={s.header}>
        <div className={s.overline}>
          <Icon icon={Sprout} size="lg" />
          <span className={s.overlineText}>
            Crop Info
          </span>
        </div>
        <h1 className={s.title}>작물 정보</h1>
        <p className={s.description}>
          작물 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Skeleton Cards */}
      <div className={s.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={s.card}>
            <div className={s.cardHeader}>
              <div className={s.cardHeaderRow}>
                <div className={s.cardHeaderLeft}>
                  <div className={s.skeletonIcon} />
                  <div className={s.skeletonTag} />
                </div>
                <div className={s.skeletonBadge} />
              </div>
            </div>
            <div className={s.cardContent}>
              <div className={s.cardContentInner}>
                <div className={s.cardRow}>
                  <div className={s.skeletonLabel} />
                  <div className={s.skeletonValue} />
                </div>
                <div className={s.cardRow}>
                  <div className={s.skeletonLabel} />
                  <div className={s.skeletonSmallBadge} />
                </div>
                <div className={s.skeletonBlock} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
