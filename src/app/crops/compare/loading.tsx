/**
 * 작물 비교(요청 때 렌더)의 로딩 화면 — 예전에 `crops/loading.tsx` 가 이 라우트까지 감싸던 것과 같은 화면이다.
 * 목록 로딩은 `crops/(list)/` 로 옮겼다(2026-10-17, 상세 /crops/[id] 를 Suspense 경계 밖으로 — app-loading-boundary.test.ts).
 */
export { default } from "../(list)/loading";
