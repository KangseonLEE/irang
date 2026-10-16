import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "./auth";

/**
 * 관리자 **화면**(page) 자체 인가 (2026-10-16 보안 QA 🟡5).
 *
 * 관리자 화면은 service role 로 진단 결과·피드백·승인 대기 글을 그대로 렌더하는데, 인가가
 * 미들웨어 한 겹뿐이었다(API 는 9/16 `requireAdmin` 으로 2차 방어가 있었다).
 *
 * 레이아웃이 아니라 **각 page 첫 줄**에서 부른다 — Next 16 문서(guides/authentication.md
 * "Layouts and auth checks"): 레이아웃은 클라이언트 이동 때 다시 렌더되지 않고, 레이아웃이
 * redirect 해도 하위 page 는 병렬로 실행돼 RSC payload 에 실릴 수 있다. 데이터에 가까운 곳에서 확인한다.
 * 빠뜨리면 `src/__tests__/admin-page-guard.test.ts` 가 실패한다.
 */
export async function requireAdminPage(): Promise<void> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    redirect("/admin/login");
  }
}
