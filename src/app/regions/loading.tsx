import { GlobalLoading } from "@/components/loading/global-loading";

/**
 * 요청 때 데이터를 읽는 라우트의 로딩 화면 — 루트 `app/loading.tsx` 에서 옮겨 왔다(2026-10-16).
 * 루트에 두면 랜딩까지 Suspense 경계 안에 들어가 첫 화면이 늦게 보인다(`app-loading-boundary.test.ts`).
 */
export default function Loading() {
  return <GlobalLoading />;
}
