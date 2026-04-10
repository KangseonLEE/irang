import { ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./loading.module.css";

export default function InterviewDetailLoading() {
  return (
    <div className={s.container}>
      {/* Back link */}
      <div className={s.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        <span>인터뷰 목록으로</span>
      </div>

      {/* Title + Profile */}
      <div className={s.titleSection}>
        <div className={s.profileRow}>
          <div className={s.skeletonAvatar} />
          <div>
            <div className={s.skeletonName} />
            <div className={s.skeletonMeta} />
          </div>
        </div>
        <div className={s.skeletonTitle} />
      </div>

      <div className={s.contentGrid}>
        {/* Main content */}
        <div className={s.mainContent}>
          {/* Quote Card */}
          <div className={s.card}>
            <div className={s.skeletonBlock} />
          </div>

          {/* Story Card */}
          <div className={s.card}>
            <div className={s.skeletonLabel} style={{ width: "4rem", marginBottom: "1rem" }} />
            <div className={s.skeletonBlockLg} />
          </div>

          {/* Tips Card */}
          <div className={s.card}>
            <div className={s.skeletonLabel} style={{ width: "4rem", marginBottom: "1rem" }} />
            <div className={s.skeletonBlock} />
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          <div className={s.card}>
            <div className={s.skeletonLabel} style={{ width: "6rem", marginBottom: "1rem" }} />
            <div className={s.skeletonButton} />
          </div>
        </div>
      </div>
    </div>
  );
}
