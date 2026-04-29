import { ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./loading.module.css";

export default function InterviewDetailLoading() {
  return (
    <div className={s.container}>
      {/* Back link */}
      <div className={s.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        <span>귀농인 이야기</span>
      </div>

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
