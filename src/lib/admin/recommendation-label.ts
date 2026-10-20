/**
 * 추천 평가의 recommendation_id("crop:apple"·"program:SP-001") → 사람이 읽는 이름 (2026-10-20)
 *
 * 어드민이 원래 id 를 그대로 보여줘 무엇에 대한 평가인지 읽기 어려웠다. 정적 데이터에 없는 id
 * (DB 전용 지원사업 등)는 id 를 그대로 둔다 — 이름을 지어내지 않는다.
 */

import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { PROVINCES } from "@/lib/data/regions";

export interface RecommendationLabel {
  kind: string;
  name: string;
  href: string | null;
}

const CROP_NAME = new Map(CROPS.map((c) => [c.id, c.name]));
const PROGRAM_TITLE = new Map(PROGRAMS.map((p) => [p.id, p.title]));
const PROVINCE_NAME = new Map(PROVINCES.map((p) => [p.id, p.name]));

export function describeRecommendation(recommendationId: string): RecommendationLabel {
  const [prefix, ...rest] = recommendationId.split(":");
  const id = rest.join(":");
  switch (prefix) {
    case "crop":
      return { kind: "작물", name: CROP_NAME.get(id) ?? id, href: CROP_NAME.has(id) ? `/crops/${id}` : null };
    case "program":
      return {
        kind: "지원사업",
        name: PROGRAM_TITLE.get(id) ?? id,
        href: PROGRAM_TITLE.has(id) ? `/programs/${id}` : null,
      };
    case "region":
      return {
        kind: "지역",
        name: PROVINCE_NAME.get(id) ?? id,
        href: PROVINCE_NAME.has(id) ? `/regions/${id}` : null,
      };
    default:
      return { kind: "기타", name: recommendationId, href: null };
  }
}
