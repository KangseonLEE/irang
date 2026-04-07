import { SectionNav } from "@/components/layout/section-nav";

const statsNav = [
  { href: "/stats/population", label: "귀농·귀촌 인구" },
  { href: "/stats/youth", label: "청년 귀농 트렌드" },
  { href: "/stats/satisfaction", label: "귀농 만족도" },
];

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionNav items={statsNav} />
      {children}
    </>
  );
}
