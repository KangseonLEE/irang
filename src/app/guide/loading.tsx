import s from "./loading.module.css";

export default function GuideLoading() {
  return (
    <div className={s.container}>
      {/* Hero */}
      <div className={s.hero}>
        <span className={s.heroOverline}>PROCESS GUIDE</span>
        <h1 className={s.heroTitle}>귀농 5단계 가이드</h1>
        <p className={s.heroDesc}>
          가이드 데이터를 불러오고 있습니다...
        </p>
      </div>

      {/* Step Skeleton Sections */}
      <div className={s.steps}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={s.step}>
            <div className={s.skeletonIcon} />
            <div className={s.skeletonStepContent}>
              <div className={s.skeletonStepLabel} />
              <div className={s.skeletonStepTitle} />
            </div>
            <div className={s.skeletonBadge} />
            <div className={s.skeletonChevron} />
          </div>
        ))}
      </div>
    </div>
  );
}
