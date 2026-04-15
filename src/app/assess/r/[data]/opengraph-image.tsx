/**
 * /assess/r/[data] — 진단 결과 동적 OG 이미지
 *
 * URL에 인코딩된 결과 데이터를 디코딩하여
 * 티어·차원별 점수가 포함된 OG 카드를 생성합니다.
 */

import { ImageResponse } from "next/og";
import { getOGFontsForAssess, getOGFonts } from "@/lib/og/fonts";
import { OG_SIZE } from "@/lib/og/constants";
import { brandCard, assessScoreCard } from "@/lib/og/brand-card";
import { decodeAssessScore } from "@/lib/assess-share";
import { DIMENSIONS } from "@/lib/data/assessment";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이랑 — 귀농 준비도 진단 결과";

export default async function OGImage({
  params,
}: {
  params: Promise<{ data: string }>;
}) {
  const { data } = await params;
  const result = decodeAssessScore(data);

  if (result) {
    const fonts = await getOGFontsForAssess();
    const dimensions = result.dimensions.map((dim) => {
      const meta = DIMENSIONS.find((d) => d.id === dim.id);
      return {
        label: dim.label,
        icon: meta?.icon ?? "",
        percent: dim.percent,
      };
    });

    return new ImageResponse(
      assessScoreCard({
        emoji: result.tier.emoji,
        tierTitle: result.tier.title,
        totalScore: result.totalScore,
        dimensions,
      }),
      { ...size, fonts },
    );
  }

  // 폴백: 기본 브랜드 카드
  const fonts = await getOGFonts();
  return new ImageResponse(brandCard(), { ...size, fonts });
}
