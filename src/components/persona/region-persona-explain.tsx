// Phase 6 B3 D2 prototype — 시군구 페르소나 점수 기여도 inline 설명 (Server Component)
//
// 사용 시점: /regions/ranking 페르소나 모드 시 각 시군구 항목 하단에 노출.
// 데이터: DimensionScores + Persona.weights → 5차원 중 가중 기여 top 2개 추출.
// 디자인: prototype 수준 — 작물·사업과 동일한 칩 톤(persona-score-explain.module.css)
// 재사용.

import type {
  DimensionScoresInput,
  Persona,
} from "@/lib/data/personas";
import s from "./persona-score-explain.module.css";

interface RegionPersonaExplainProps {
  scores: DimensionScoresInput;
  persona: Persona;
  /** 시군구 총 점수 (이미 ranking page에서 계산된 값) */
  total: number;
}

const DIMENSION_LABEL_MAP: Record<keyof DimensionScoresInput, string> = {
  populationTrend: "인구 추세",
  farmActivity: "농가",
  medical: "의료",
  school: "학교",
  returnFarm: "귀농",
};

/** 가중 기여(value * weight) top N 차원 추출 (가용 차원만, 내림차순). */
function topContributions(
  scores: DimensionScoresInput,
  persona: Persona,
  n = 2,
): Array<{ key: keyof DimensionScoresInput; value: number; weight: number; contribution: number }> {
  const w = persona.weights;
  const entries: Array<{
    key: keyof DimensionScoresInput;
    value: number;
    weight: number;
    contribution: number;
  }> = [];
  (Object.keys(scores) as Array<keyof DimensionScoresInput>).forEach((k) => {
    const v = scores[k];
    if (v === null) return;
    const weight = w[k as keyof typeof w];
    if (weight === 0) return;
    entries.push({ key: k, value: v, weight, contribution: v * weight });
  });
  entries.sort((a, b) => b.contribution - a.contribution);
  return entries.slice(0, n);
}

/** 0~100 점수 → 한국어 라벨 */
function scoreToLabel(value: number): string {
  if (value >= 70) return "강해요";
  if (value >= 50) return "괜찮아요";
  if (value >= 30) return "조금 약해요";
  return "약해요";
}

export function RegionPersonaExplain({
  scores,
  persona,
  total,
}: RegionPersonaExplainProps) {
  // balanced: 5차원 균등이라 top contribution 차이가 작음 → 노출 생략
  if (persona.id === "balanced") return null;

  const top = topContributions(scores, persona);
  if (top.length === 0) return null;

  return (
    <div className={s.row} role="note" aria-label="이 시군구 추천 사유">
      <div className={s.scoreBox}>
        <span className={s.score} aria-label={`종합 ${total}점`}>
          {total}
          <span className={s.scoreMax}>/100</span>
        </span>
        <span className={s.scoreLabel}>가장 큰 기여</span>
      </div>
      <ul className={s.reasons}>
        {top.map((t) => (
          <li key={t.key} className={`${s.reason} ${s.reasonCategory}`}>
            {DIMENSION_LABEL_MAP[t.key]} {scoreToLabel(t.value)} ({t.weight}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
