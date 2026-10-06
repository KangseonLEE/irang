import s from "./loading.module.css";

/**
 * /assess 하위 로딩 — 제목은 h1 이 아니다 (10/6 2차 QA R2-Q2).
 * 공유 결과 화면(/a/{code}·/assess/r/*·/r/*)은 이 스켈레톤이 스트리밍 첫 조각으로 HTML 에 함께 실려,
 * 여기 h1 이 있으면 결과 제목 h1 과 한 문서에 둘이 됐다. /match/loading 과 같은 처리.
 */
export default function AssessLoading() {
  return (
    <div className={s.container} role="status" aria-label="진단 화면을 준비하는 중">
      <div className={s.spinner} aria-hidden="true" />
      <p className={s.title}>진단 페이지 이동 중</p>
      <p className={s.description}>
        잠시만 기다려 주세요...
      </p>
    </div>
  );
}
