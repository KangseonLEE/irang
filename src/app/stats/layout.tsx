import { SectionNav } from "@/components/layout/section-nav";

const statsNav = [
  { href: "/stats/population", label: "귀농·귀촌" },
  { href: "/stats/youth", label: "청년농" },
  { href: "/stats/satisfaction", label: "만족도" },
  { href: "/stats/mountain", label: "귀산촌" },
  { href: "/stats/smartfarm", label: "스마트팜" },
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
