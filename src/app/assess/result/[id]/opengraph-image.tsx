/**
 * /assess/result/[id] — 동적 OG 이미지
 *
 * Supabase에서 결과를 조회해 귀농 유형·추천 지역을 포함한
 * 커스텀 OG 카드를 생성합니다.
 * 조회 실패 시 기본 brandCard로 폴백합니다.
 */

import { ImageResponse } from "next/og";
import { getOGFontsWithBody, getOGFonts } from "@/lib/og/fonts";
import { OG_SIZE } from "@/lib/og/constants";
import { brandCard, resultCard } from "@/lib/og/brand-card";
import { isValidResultId } from "@/lib/assess-result";
import { getSupabase } from "@/lib/supabase";
import { FARM_TYPES, type FarmTypeId } from "@/lib/data/match-questions";
import { PROVINCES } from "@/lib/data/regions";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이랑 — 귀농 적합도 진단 결과";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ── 결과 조회 ──
  let data: Record<string, unknown> | null = null;

  if (isValidResultId(id)) {
    const sb = getSupabase();
    if (sb) {
      const { data: row } = await sb
        .from("assessment_results")
        .select("farm_type_id, top_regions")
        .eq("id", id)
        .single();
      data = row;
    }
  }

  // ── 조회 성공 → 동적 resultCard ──
  if (data) {
    const farmType = FARM_TYPES.find(
      (t) => t.id === (data!.farm_type_id as FarmTypeId)
    );

    if (farmType) {
      const regions = (data.top_regions as string[])
        .slice(0, 3)
        .map((rid: string) => {
          const p = PROVINCES.find((prov) => prov.id === rid);
          return p?.shortName ?? rid;
        });

      const fonts = await getOGFontsWithBody();

      return new ImageResponse(
        resultCard({
          emoji: farmType.emoji,
          label: farmType.label,
          tagline: farmType.tagline,
          regions,
        }),
        { ...size, fonts },
      );
    }
  }

  // ── 폴백: 기본 brandCard ──
  const fonts = await getOGFonts();
  return new ImageResponse(brandCard(), { ...size, fonts });
}
