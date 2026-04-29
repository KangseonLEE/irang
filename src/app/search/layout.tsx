import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "귀농 정보 통합검색",
  description:
    "귀농 지역, 작물, 지원사업, 교육, 체험행사를 한번에 검색하세요. 귀농 비용부터 지원금까지 필요한 정보를 통합 검색으로 찾을 수 있어요.",
  alternates: { canonical: "/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
