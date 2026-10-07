import s from "./loading.module.css";

/**
 * /match 로딩 스켈레톤 — 제목은 h1 이 아니다 (2026-10-06).
 * 페이지가 동적 렌더가 되면서 이 스켈레톤이 스트리밍 첫 조각으로 HTML 에 함께 실린다 — 여기 h1 이 있으면
 * 실제 화면의 h1 과 겹쳐 한 문서에 h1 이 둘이 된다.
 */
export default function MatchLoading() {
  return (
    <div className={s.container} role="status" aria-label="맞춤 추천 화면을 준비하는 중">
      {/* Header */}
      <div className={s.header}>
        <p className={s.title}>맞춤 추천</p>
        <p className={s.description}>
          서비스를 준비하는 중이에요
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
