/**
 * 통합 stats 레이아웃 — /stats 단일 페이지로 5탭 통합 후 SectionNav 제거.
 * 탭 컨트롤은 StatsClient 내부의 sticky 탭바가 담당한다.
 */
export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
