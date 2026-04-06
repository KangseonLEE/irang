import { ImageResponse } from "next/og";
import { getOGFonts } from "@/lib/og/fonts";
import { OG_SIZE } from "@/lib/og/constants";
import { brandCard } from "@/lib/og/brand-card";
import { PROVINCES } from "@/lib/data/regions";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이랑 — 지역 귀농 정보";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // keep import so Next.js generates routes
  void PROVINCES.find((p) => p.id === id);
  const fonts = await getOGFonts();

  return new ImageResponse(brandCard(), { ...size, fonts });
}
