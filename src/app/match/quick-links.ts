/**
 * 빠른 점검 결과의 추천 링크 3종 (2026-10-06 QA Q4-W3).
 *
 * '기본 균등'(balanced)은 "아직 한쪽으로 기울지 않았다"는 결과라 작물·지원사업 목록의 맞춤 정렬 기준이 되지 못한다 —
 * persona 를 실으면 빈 작물 목록·지원사업 0건이 나왔다(4문항 135조합 중 24개, 18%). 그 둘은 persona 없이 전체 목록으로 보낸다.
 * 지역 순위는 '기본 균등' 가중치(5차원 고르게)가 실제로 있어 그대로 싣는다 — 빼면 순위 대신 조건 선택 화면이 나온다.
 */
import type { PersonaId } from "@/lib/data/personas";
import { buildRecommendations, type QuickRecommendation } from "@/lib/data/quick-check";

export function quickRecommendationLinks(persona: PersonaId): QuickRecommendation {
  const links = buildRecommendations(persona);
  if (persona !== "balanced") return links;
  return { ...links, cropsUrl: "/crops", programsUrl: "/programs" };
}
