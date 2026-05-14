import s from "./loading.module.css";

export default function AssessLoading() {
  return (
    <div className={s.container}>
      <div className={s.spinner} />
      <h2 className={s.title}>진단 페이지 이동 중</h2>
      <p className={s.description}>
        잠시만 기다려 주세요...
      </p>
    </div>
  );
}
