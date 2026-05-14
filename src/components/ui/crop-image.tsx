import Image from "next/image";
import { getCropImageSrc } from "@/lib/crop-image";
import s from "./crop-image.module.css";

type CropImageSize = "inline" | "md" | "lg";

const SIZE_MAP: Record<CropImageSize, number> = {
  inline: 20,
  md: 24,
  lg: 32,
};

const SIZE_CLASS: Record<CropImageSize, string> = {
  inline: s.thumbInline,
  md: s.thumbMd,
  lg: s.thumbLg,
};

interface CropImageProps {
  cropId: string;
  cropName: string;
  /** inline=20px / md=24px / lg=32px (또는 커스텀 px) */
  size?: CropImageSize | number;
  className?: string;
}

/**
 * 작물 식별용 작은 thumbnail.
 * 이모지 대체 — 작물명 옆에 inline 배치하는 용도.
 *
 * 사이즈 가이드:
 * - "inline" (20px): 본문 텍스트 안 inline / metric row label
 * - "md" (24px): 카드 prefix / table th
 * - "lg" (32px): selector dropdown
 */
export function CropImage({
  cropId,
  cropName,
  size = "inline",
  className,
}: CropImageProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const sizeClass = typeof size === "number" ? s.thumbMd : SIZE_CLASS[size];
  return (
    <Image
      src={getCropImageSrc(cropId)}
      alt={cropName}
      width={px}
      height={px}
      className={[s.thumb, sizeClass, className].filter(Boolean).join(" ")}
      // 이미 100+ thumbnail이 페이지에 깔리므로 lazy 유지
    />
  );
}
