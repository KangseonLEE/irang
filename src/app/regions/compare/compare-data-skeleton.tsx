import s from "./page.module.css";

/**
 * CompareDataSection Suspense fallback — 4 API 응답 대기 동안 사용자에 표시.
 *
 * 카드·차트·테이블 자리에 placeholder 박스를 보여주어 첫 페인트 직후 사용자가
 * "데이터가 곧 채워질 자리"를 인지할 수 있도록 한다. 빈 흰 화면 차단.
 */
export function CompareDataSkeleton() {
  return (
    <div
      className={s.dataSkeleton}
      aria-busy="true"
      aria-label="비교 데이터 불러오는 중"
    >
      <div className={s.skeletonCardGrid}>
        <div className={s.skeletonCard} />
        <div className={s.skeletonCard} />
        <div className={s.skeletonCard} />
      </div>
      <div className={s.skeletonChart} />
      <div className={s.skeletonChart} />
      <div className={s.skeletonTable} />
    </div>
  );
}
