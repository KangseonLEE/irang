import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { StoriesPage, storiesMetadata } from "@/components/community/stories-page";

interface PageProps {
  params: Promise<{ id: string; sigungu: string }>;
}

export const revalidate = 86400;

function lookup(id: string, sigunguId: string) {
  const province = PROVINCES.find((p) => p.id === id);
  const sigungu = SIGUNGUS.find((g) => g.sidoId === id && g.id === sigunguId);
  return province && sigungu ? { province, sigungu } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, sigungu } = await params;
  const hit = lookup(id, sigungu);
  if (!hit) notFound();
  const label = `${hit.province.shortName} ${hit.sigungu.name}`;
  return storiesMetadata(label, `/regions/${id}/${sigungu}`);
}

export default async function SigunguStoriesPage({ params }: PageProps) {
  const { id, sigungu } = await params;
  const hit = lookup(id, sigungu);
  if (!hit) notFound();
  const label = `${hit.province.shortName} ${hit.sigungu.name}`;
  return (
    <StoriesPage
      targetType="region"
      targetId={`${id}/${sigungu}`}
      label={label}
      backHref={`/regions/${id}/${sigungu}`}
      backLabel={`${hit.sigungu.name} 상세로 돌아가기`}
      breadcrumbs={[
        { name: "지역 탐색", href: "/regions" },
        { name: hit.province.shortName, href: `/regions/${id}` },
        { name: hit.sigungu.name, href: `/regions/${id}/${sigungu}` },
        { name: "현장 이야기", href: `/regions/${id}/${sigungu}/stories` },
      ]}
    />
  );
}
