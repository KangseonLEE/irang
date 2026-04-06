import { ImageResponse } from "next/og";
import { getOGFonts } from "@/lib/og/fonts";
import { OG_SIZE } from "@/lib/og/constants";
import { brandCard } from "@/lib/og/brand-card";
import { CROPS } from "@/lib/data/crops";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이랑 — 작물 정보";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // keep import so Next.js generates routes
  void CROPS.find((c) => c.id === id);
  const fonts = await getOGFonts();

  return new ImageResponse(brandCard(), { ...size, fonts });
}
