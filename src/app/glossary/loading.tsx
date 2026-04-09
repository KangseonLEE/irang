import { BookOpen } from "lucide-react";
import s from "./loading.module.css";

export default function GlossaryLoading() {
  return (
    <div className={s.container}>
      {/* Page Header */}
      <div className={s.header}>
        <span className={s.overline}>
          <BookOpen size={16} />
          Glossary
        </span>
        <h1 className={s.title}>농업 용어집</h1>
        <p className={s.description}>
          용어 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Search */}
      <div className={s.skeletonSearch} />

      {/* Category Tabs */}
      <div className={s.tabs}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={s.skeletonTab} />
        ))}
      </div>

      {/* Term Cards */}
      <div className={s.termList}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={s.termCard}>
            <div className={s.skeletonTerm} />
            <div className={s.skeletonDef} />
          </div>
        ))}
      </div>
    </div>
  );
}
