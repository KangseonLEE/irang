import { IrangSearch as Search } from "@/components/ui/irang-search";
import s from "./loading.module.css";

export default function SearchLoading() {
  return (
    <div className={s.container}>
      {/* Search Bar */}
      <div className={s.searchWrap}>
        <div className={s.skeletonSearchBar} />
      </div>

      {/* Empty State */}
      <div className={s.emptyState}>
        <Search size={40} style={{ color: "var(--muted-foreground)", opacity: 0.4, margin: "0 auto 1rem" }} />
        <h1 className={s.emptyTitle}>통합 검색</h1>
        <p className={s.emptyDesc}>
          검색 페이지를 준비하고 있습니다...
        </p>

        {/* Quick Links */}
        <div className={s.quickLinks}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={s.skeletonLink} />
          ))}
        </div>
      </div>
    </div>
  );
}
