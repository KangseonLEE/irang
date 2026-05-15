// Phase B Sprint 1 (2026-05-15) — 옵션 β 강점·약점 그룹화 (Server Component)
//
// 사용 시점: /regions/ranking 페르소나 모드에서 각 시군구 항목 하단.
// 데이터: DimensionScores + Persona.weights → 5차원을 강점/약점으로 분류.
// 분류 기준 (ADR §4-4):
//   - 점수 60 이상 = 강점 (최대 2개, 가중 기여 내림차순)
//   - 점수 40 미만 = 약점 (최대 2개, 가중 기여 내림차순)
//   - 그 사이 = 보통 (미노출)
// 가중치(%)는 chip에서 제거 — persona description에서 이미 노출.

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
  /**
   * Phase 6 B1 D2: 사용자가 직접 가중치 조정한 상태인지.
   * balanced 페르소나여도 isCustom이면 강·약점 노출 (가중치가 더 이상 균등 아님).
   */
  isCustom?: boolean;
}

const DIMENSION_LABEL_MAP: Record<keyof DimensionScoresInput, string> = {
  populationTrend: "인구 추세",
  farmActivity: "농가",
  medical: "의료",
  school: "학교",
  returnFarm: "귀농",
};

const STRENGTH_THRESHOLD = 60;
const WEAKNESS_THRESHOLD = 40;

interface Entry {
  key: keyof DimensionScoresInput;
  value: number;
  contribution: number;
}

/**
 * 5차원을 강점·약점으로 분류.
 * - 가용 차원(null 아님)만 대상
 * - 가중치 0인 차원은 제외 (사용자에게 무의미)
 * - 강점: 점수 ≥ 60, 가중 기여 내림차순 top 2
 * - 약점: 점수 < 40, 가중 기여 내림차순 top 2 (낮은 점수일수록 더 약함이라 contribution 역순도 검토했으나,
 *         "사용자 페르소나가 중시하는 차원의 약점이 더 중요" → 가중 기여 내림차순 유지)
 */
function splitStrengthsWeaknesses(
  scores: DimensionScoresInput,
  persona: Persona,
): { strengths: Entry[]; weaknesses: Entry[] } {
  const w = persona.weights;
  const all: Entry[] = [];
  (Object.keys(scores) as Array<keyof DimensionScoresInput>).forEach((k) => {
    const v = scores[k];
    if (v === null) return;
    const weight = w[k as keyof typeof w];
    if (weight === 0) return;
    all.push({ key: k, value: v, contribution: v * weight });
  });

  const strengths = all
    .filter((e) => e.value >= STRENGTH_THRESHOLD)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 2);
  const weaknesses = all
    .filter((e) => e.value < WEAKNESS_THRESHOLD)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 2);

  return { strengths, weaknesses };
}

export function RegionPersonaExplain({
  scores,
  persona,
  total,
  isCustom = false,
}: RegionPersonaExplainProps) {
  // balanced: 5차원 균등이라 강·약 차이가 작음 → 노출 생략
  // 단, isCustom=true(직접 조정)이면 균등 아니므로 노출
  if (persona.id === "balanced" && !isCustom) return null;

  const { strengths, weaknesses } = splitStrengthsWeaknesses(scores, persona);
  // 강·약점 모두 없으면 표시 정보 없음 — row 생략
  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className={s.row} role="note" aria-label="이 시군구 강점과 약점">
      <div className={s.scoreBox}>
        <span className={s.score} aria-label={`종합 ${total}점`}>
          {total}
          <span className={s.scoreMax}>/100</span>
        </span>
        <span className={s.scoreLabel}>종합 점수</span>
      </div>
      <div className={s.groups}>
        {strengths.length > 0 && (
          <div className={s.group}>
            <span className={s.groupLabel}>강점</span>
            <ul className={s.reasons}>
              {strengths.map((e) => (
                <li key={e.key} className={`${s.reason} ${s.reasonStrength}`}>
                  {DIMENSION_LABEL_MAP[e.key]}
                </li>
              ))}
            </ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div className={s.group}>
            <span className={s.groupLabel}>약점</span>
            <ul className={s.reasons}>
              {weaknesses.map((e) => (
                <li key={e.key} className={`${s.reason} ${s.reasonWeakness}`}>
                  {DIMENSION_LABEL_MAP[e.key]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// 내부 함수 테스트용 export (vitest 회귀)
export { splitStrengthsWeaknesses, STRENGTH_THRESHOLD, WEAKNESS_THRESHOLD };
