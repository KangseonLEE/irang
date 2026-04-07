"use client";

import { usePathname } from "next/navigation";
import { SectionNav } from "@/components/layout/section-nav";

const regionsNav = [
  { href: "/regions", label: "지역 탐색" },
  { href: "/regions/compare", label: "지역 비교" },
];

/** LNB는 목록(/regions)과 비교(/regions/compare) 페이지에서만 표시 */
const showNavPaths = ["/regions", "/regions/compare"];

export default function RegionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = showNavPaths.includes(pathname);

  return (
    <>
      {showNav && <SectionNav items={regionsNav} />}
      {children}
    </>
  );
}
