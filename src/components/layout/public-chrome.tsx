"use client";

import { usePathname } from "next/navigation";

/**
 * 공개 사이트 크롬(헤더·푸터·모바일 탭바·피드백 위젯·인앱 배너·맨 위로) 게이트.
 * `/admin/*` 는 AdminShell 이 자체 사이드바·하단 탭을 갖고 있고 로그인 페이지는 독립 카드라
 * 공용 크롬을 렌더하지 않는다 (2026-09-02 회장 리포트 — 어드민 로그인에 공용 하단 탭바·푸터 노출).
 *
 * children 은 서버 컴포넌트(Footer 등)여도 ReactNode 로 넘기면 된다(체크리스트 H).
 * usePathname 은 Suspense 경계가 필요 없다 — bailout 을 일으키는 건 useSearchParams 뿐(6/1 교훈).
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
