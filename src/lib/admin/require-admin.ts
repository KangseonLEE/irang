import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "./auth";

/**
 * 관리자 API 라우트 자체 인가 (2026-09-16 보안 점검).
 *
 * 기존에는 `/admin/**` 미들웨어 가드 **한 겹**에만 의존했다. 지금 쓰는 Next 16.3.4 는
 * 미들웨어 우회 취약점(CVE-2025-29927, `x-middleware-subrequest`)이 패치된 버전이지만,
 * 상태를 바꾸는 엔드포인트(커뮤니티 승인·요청 처리)의 인가를 한 겹에만 두면
 * 미들웨어 matcher 수정·라우트 이동·프레임워크 회귀 중 무엇 하나로도 조용히 열린다.
 *
 * 통과하면 null, 막히면 그대로 반환할 응답을 돌려준다.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  return null;
}
