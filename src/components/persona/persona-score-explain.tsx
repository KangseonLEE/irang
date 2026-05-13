// Phase 6 B3 D2 — 페르소나 fit 점수 산출 근거 inline 설명 (Server Component)
//
// 사용 시점: /crops · /programs 페이지에서 페르소나 모드 활성 시 각 카드 하단에 노출.
// 데이터: getCropPersonaFitTrace / getProgramPersonaFitTrace (D1) → FitTrace
//
// 디자인 원칙:
//   - 카드 link 영역 밖에 별도 row로 노출 (a 태그 nesting 방지)
//   - balanced 페르소나: render null (explain 무의미)
//   - 4점 이하 카드는 노출 안 함 (rankCropsForPersona가 score >= 4 만 통과시킴)
//   - 칩 최대 3개 (D1에서 reasons.length <= 3 보장)
//   - prototype: <details>/<summary> 인터랙션은 미사용 (Server Component 단순화)

import type { FitScore, FitTrace } from "@/lib/data/persona-fit";
import s from "./persona-score-explain.module.css";

interface PersonaScoreExplainProps {
  trace: FitTrace;
  /** 사용자가 보는 도메인 라벨 — "이 작물" / "이 사업" */
  subject?: string;
}

/** 5점 만점 점수 → 한국어 라벨 (페르소나 카피 톤) */
function scoreLabel(score: FitScore): string {
  if (score === 5) return "딱 맞아요";
  if (score === 4) return "잘 맞아요";
  if (score === 3) return "보통이에요";
  if (score === 2) return "조금 약해요";
  return "잘 안 맞아요";
}

export function PersonaScoreExplain({
  trace,
  subject = "이 항목",
}: PersonaScoreExplainProps) {
  // balanced 페르소나는 reasons[0].kind === "balanced" 1건만 있음 → 노출 생략
  if (trace.reasons.length === 1 && trace.reasons[0]?.kind === "balanced") {
    return null;
  }

  return (
    <div className={s.row} role="note" aria-label={`${subject} 추천 사유`}>
      <div className={s.scoreBox}>
        <span className={s.score} aria-label={`${trace.score}점`}>
          {trace.score}
          <span className={s.scoreMax}>/5</span>
        </span>
        <span className={s.scoreLabel}>{scoreLabel(trace.score)}</span>
      </div>
      <ul className={s.reasons}>
        {trace.reasons.map((r, idx) => (
          <li
            key={`${r.kind}-${idx}`}
            className={`${s.reason} ${kindClass(r.kind, s)}`}
          >
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** reason.kind → CSS class 매핑 */
function kindClass(
  kind: FitTrace["reasons"][number]["kind"],
  styles: Record<string, string>,
): string {
  switch (kind) {
    case "override":
      return styles.reasonOverride ?? "";
    case "age":
      return styles.reasonAge ?? "";
    case "difficulty":
      return styles.reasonDifficulty ?? "";
    case "category":
      return styles.reasonCategory ?? "";
    default:
      return "";
  }
}
