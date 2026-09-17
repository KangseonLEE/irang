import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CROPS } from "@/lib/data/crops";
import { StoriesPage, storiesMetadata } from "@/components/community/stories-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return CROPS.map((c) => ({ id: c.id }));
}
export const dynamicParams = false;
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const crop = CROPS.find((c) => c.id === id);
  if (!crop) notFound();
  return storiesMetadata(crop.name, `/crops/${crop.id}`);
}

export default async function CropStoriesPage({ params }: PageProps) {
  const { id } = await params;
  const crop = CROPS.find((c) => c.id === id);
  if (!crop) notFound();
  return (
    <StoriesPage
      targetType="crop"
      targetId={crop.id}
      label={crop.name}
      backHref={`/crops/${crop.id}`}
      backLabel={`${crop.name} 상세로 돌아가기`}
      breadcrumbs={[
        { name: "작물 목록", href: "/crops" },
        { name: crop.name, href: `/crops/${crop.id}` },
        { name: "현장 이야기", href: `/crops/${crop.id}/stories` },
      ]}
    />
  );
}
