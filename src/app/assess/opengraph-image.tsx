import { ImageResponse } from "next/og";
import { getOGFonts } from "@/lib/og/fonts";
import { OG_SIZE } from "@/lib/og/constants";
import { brandCard } from "@/lib/og/brand-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이랑 — 귀농 적합도 진단";

export default async function OGImage() {
  const fonts = await getOGFonts();

  return new ImageResponse(brandCard(), { ...size, fonts });
}
