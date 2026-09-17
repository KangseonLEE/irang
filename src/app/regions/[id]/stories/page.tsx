import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROVINCES } from "@/lib/data/regions";
import { StoriesPage, storiesMetadata } from "@/components/community/stories-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return PROVINCES.map((p) => ({ id: p.id }));
}
export const dynamicParams = false;
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();
  return storiesMetadata(province.name, `/regions/${province.id}`);
}

export default async function RegionStoriesPage({ params }: PageProps) {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);
  if (!province) notFound();
  return (
    <StoriesPage
      targetType="region"
      targetId={province.id}
      label={province.name}
      backHref={`/regions/${province.id}`}
      backLabel={`${province.shortName} 상세로 돌아가기`}
      breadcrumbs={[
        { name: "지역 탐색", href: "/regions" },
        { name: province.shortName, href: `/regions/${province.id}` },
        { name: "현장 이야기", href: `/regions/${province.id}/stories` },
      ]}
    />
  );
}
