import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "농촌 정착 정보 통합검색",
  description:
    "농촌 정착 지역, 작물, 지원사업, 교육, 체험행사를 한번에 검색하세요. 정착 비용부터 지원금까지 필요한 정보를 통합 검색으로 찾을 수 있어요.",
  alternates: { canonical: "/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
