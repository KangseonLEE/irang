"use client";

import { usePathname } from "next/navigation";
import { SectionNav } from "@/components/layout/section-nav";

const cropsNav = [
  { href: "/crops", label: "작물 정보" },
  { href: "/crops/compare", label: "작물 비교" },
];

/** LNB는 목록(/crops)과 비교(/crops/compare) 페이지에서만 표시 */
const showNavPaths = ["/crops", "/crops/compare"];

export default function CropsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = showNavPaths.includes(pathname);

  return (
    <>
      {showNav && <SectionNav items={cropsNav} />}
      {children}
    </>
  );
}
