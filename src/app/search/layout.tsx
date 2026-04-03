import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통합검색",
  description:
    "지역, 작물, 지원사업 정보를 한번에 검색하세요. 귀농에 필요한 모든 정보를 통합 검색으로 찾아보세요.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
