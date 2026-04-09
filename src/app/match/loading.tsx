import s from "./loading.module.css";

export default function MatchLoading() {
  return (
    <div className={s.container}>
      {/* Header */}
      <div className={s.header}>
        <h1 className={s.title}>맞춤 추천</h1>
        <p className={s.description}>
          서비스를 준비하고 있습니다...
        </p>
      </div>

      {/* Option Cards */}
      <div className={s.options}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={s.optionCard}>
            <div className={s.skeletonIcon} />
            <div className={s.skeletonContent}>
              <div className={s.skeletonTitle} />
              <div className={s.skeletonDesc} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
