/**
 * 시도 단위 차원별 evidence 집계 helper.
 *
 * 시군구는 자체 evidence(raw 수치 + 해석)를 갖지만, 시도는 산하 시군구 평균
 * 점수만 있다. 사용자가 시도 페이지에서 "왜 이 점수인지" 솔직하게 알 수 있도록
 * 산하 시군구의 raw 수치를 평균 내 evidence를 합성한다.
 *
 * 원칙:
 * - 평균은 산하 시군구 중 raw 수치가 있는 것만 집계 (도시 자치구는 농가/귀농 부재).
 * - 단위가 통일된 차원만 평균 가능 (모두 비율·밀도 기준이라 합산이 의미있음).
 * - 해석 카피는 시도 평균 점수의 분위/방향에 맞춰 시군구와 같은 톤으로.
 * - 데이터 원본이 갱신되어도 코드 1곳만 수정하면 끝나도록 시군구 evidence 카피와
 *   동일한 임계값/문구를 따른다.
 */

import type {
  DimensionEvidence,
  DimensionEvidenceMap,
  DimensionScores,
} from "./dimension-scores";
import { getDimensionScores } from "./dimension-scores";

interface SigunguRef {
  /** SGIS 시군구 코드 */
  sgisCode: string;
  /** 시군구명 (Top 시군구 카피용) */
  name: string;
  /** 라우팅용 id (Top 시군구 link href) */
  id: string;
}

export interface TopSigungu {
  id: string;
  name: string;
  /** 0~100 차원 점수 */
  score: number;
}

export interface SidoDimensionEvidence extends DimensionEvidence {
  /** 평균에 포함된 산하 시군구 수 */
  includedCount: number;
  /** 차원 점수 상위 1~2 시군구 (점수 내림차순). 데이터 가용 시군구만. */
  topSigungus: TopSigungu[];
}

export interface SidoDimensionEvidenceMap {
  populationTrend: SidoDimensionEvidence | null;
  farmActivity: SidoDimensionEvidence | null;
  medical: SidoDimensionEvidence | null;
  school: SidoDimensionEvidence | null;
  returnFarm: SidoDimensionEvidence | null;
}

type DimensionKey = keyof Pick<
  DimensionScores,
  "populationTrend" | "farmActivity" | "medical" | "school" | "returnFarm"
>;

/** 평균 점수 → 분위 카피용 라벨 (시군구 evidence와 동일 임계값). */
function rangeLabel(avgScore: number): {
  rank: "high" | "midHigh" | "mid" | "midLow" | "low";
  rankCopy: string;
} {
  if (avgScore >= 70)
    return { rank: "high", rankCopy: "전국 상위권이에요" };
  if (avgScore >= 55)
    return { rank: "midHigh", rankCopy: "전국 평균 이상이에요" };
  if (avgScore >= 45) return { rank: "mid", rankCopy: "전국 평균 수준이에요" };
  if (avgScore >= 30)
    return { rank: "midLow", rankCopy: "전국 평균에 못 미쳐요" };
  return { rank: "low", rankCopy: "전국 하위권이에요" };
}

/** 인구 추세 평균값 → 방향성 카피 */
function populationTrendCopy(avgPct: number): string {
  if (avgPct >= 3) return "산하 시군구가 평균 +" + avgPct.toFixed(1) + "% 늘었어요";
  if (avgPct >= 0)
    return "산하 시군구가 평균 +" + avgPct.toFixed(1) + "%로 안정세예요";
  if (avgPct >= -3)
    return "산하 시군구가 평균 " + avgPct.toFixed(1) + "%로 안정 추세예요";
  if (avgPct >= -7)
    return "산하 시군구가 평균 " + avgPct.toFixed(1) + "%로 감소세예요";
  return "산하 시군구가 평균 " + avgPct.toFixed(1) + "%로 감소 폭이 커요";
}

/** 차원별 raw 평균값 → 라벨 ("산하 평균 1만 명당 농가 4.2호" 등) */
function rawAverageLabel(
  key: DimensionKey,
  avgRaw: number,
): { rawLabel: string; rawUnit: string } {
  switch (key) {
    case "populationTrend":
      return {
        rawLabel: "산하 5년 인구 " + (avgRaw >= 0 ? "+" : "") + avgRaw.toFixed(1) + "%",
        rawUnit: "%",
      };
    case "farmActivity":
      return {
        rawLabel: "산하 평균 1만 명당 농가 " + avgRaw.toFixed(1) + "호",
        rawUnit: "호",
      };
    case "medical":
      return {
        rawLabel: "산하 평균 1만 명당 의료기관 " + avgRaw.toFixed(1) + "곳",
        rawUnit: "곳",
      };
    case "school":
      return {
        rawLabel: "산하 평균 1만 명당 학교 " + avgRaw.toFixed(1) + "곳",
        rawUnit: "곳",
      };
    case "returnFarm":
      return {
        rawLabel: "산하 평균 인구 대비 귀농 " + avgRaw.toFixed(2) + "%",
        rawUnit: "%",
      };
  }
}

/** 차원별 시도 해석 카피 — 시군구 톤 그대로, "산하" 명시 */
function sidoInterpretation(
  key: DimensionKey,
  avgScore: number,
  avgRaw: number,
  includedCount: number,
): string {
  if (key === "populationTrend") {
    // 인구 추세는 분위가 아니라 변화율이므로 방향성으로 카피.
    return populationTrendCopy(avgRaw);
  }
  const { rankCopy } = rangeLabel(avgScore);
  switch (key) {
    case "farmActivity":
      return (
        "산하 " + includedCount + "개 시군구 농가 활성도가 " + rankCopy
      );
    case "medical":
      return (
        "산하 " + includedCount + "개 시군구 의료 접근성이 " + rankCopy
      );
    case "school":
      return (
        "산하 " + includedCount + "개 시군구 학교 인프라가 " + rankCopy
      );
    case "returnFarm":
      return (
        "산하 " + includedCount + "개 시군구 농촌 정착 활성도가 " + rankCopy
      );
  }
}

/**
 * 시도 산하 시군구의 차원별 raw + score를 모아 evidence를 만든다.
 * 산하 시군구가 0개거나 해당 차원이 모두 null이면 null을 반환.
 */
function buildOne(
  sigungus: SigunguRef[],
  key: DimensionKey,
): SidoDimensionEvidence | null {
  const samples: { ref: SigunguRef; raw: number; score: number }[] = [];
  for (const sg of sigungus) {
    const ds = getDimensionScores(sg.sgisCode);
    if (!ds) continue;
    const ev = ds.evidence[key];
    const score = ds[key];
    if (!ev || score === null) continue;
    samples.push({ ref: sg, raw: ev.rawValue, score });
  }
  if (samples.length === 0) return null;

  const avgRaw =
    samples.reduce((sum, s) => sum + s.raw, 0) / samples.length;
  const avgScore =
    samples.reduce((sum, s) => sum + s.score, 0) / samples.length;
  const { rawLabel, rawUnit } = rawAverageLabel(key, avgRaw);

  // Top 1~2 시군구 (점수 내림차순). 차원 점수 50 이상만 노출 (자랑할 만한 곳).
  const topSigungus: TopSigungu[] = [...samples]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .filter((s) => s.score >= 50)
    .map((s) => ({
      id: s.ref.id,
      name: s.ref.name,
      score: Math.round(s.score),
    }));

  return {
    rawValue: avgRaw,
    rawUnit,
    rawLabel,
    interpretation: sidoInterpretation(
      key,
      avgScore,
      avgRaw,
      samples.length,
    ),
    includedCount: samples.length,
    topSigungus,
  };
}

/** 시도 5차원 evidence를 한 번에 빌드 */
export function buildSidoEvidence(
  sigungus: SigunguRef[],
): SidoDimensionEvidenceMap {
  return {
    populationTrend: buildOne(sigungus, "populationTrend"),
    farmActivity: buildOne(sigungus, "farmActivity"),
    medical: buildOne(sigungus, "medical"),
    school: buildOne(sigungus, "school"),
    returnFarm: buildOne(sigungus, "returnFarm"),
  };
}

// 시군구 evidence와의 호환을 위한 dimension-scores re-export.
export type { DimensionEvidenceMap };
