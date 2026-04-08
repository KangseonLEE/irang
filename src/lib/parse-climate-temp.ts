/**
 * 작물 재배 기후 텍스트에서 온도 범위를 파싱하고,
 * 실측 연평균 기온과 비교하여 적합성을 판정합니다.
 *
 * 지원 패턴:
 *   "생육적온 25~30℃"          → growingOptimal
 *   "연평균 8~12℃"             → annualAvgRange
 *   "연평균 15℃ 이상"          → annualAvgMin
 *   "야간 5~8℃, 주간 20~25℃"  → facilityControlled
 */

export interface ParsedClimateTemp {
  type:
    | "growingOptimal"
    | "annualAvgRange"
    | "annualAvgMin"
    | "facilityControlled";
  min: number | null;
  max: number | null;
  raw: string;
}

/**
 * 재배 기후 텍스트에서 핵심 온도 범위를 추출합니다.
 */
export function parseClimateTemp(climateText: string): ParsedClimateTemp {
  // 1. 시설재배 (야간/주간 분리)
  if (/야간/.test(climateText) && /주간/.test(climateText)) {
    return { type: "facilityControlled", min: null, max: null, raw: climateText };
  }

  // 2. 연평균 N℃ 이상
  const annualMinMatch = climateText.match(/연평균\s*(\d+)℃\s*이상/);
  if (annualMinMatch) {
    return {
      type: "annualAvgMin",
      min: Number(annualMinMatch[1]),
      max: null,
      raw: climateText,
    };
  }

  // 3. 연평균 N~M℃
  const annualRangeMatch = climateText.match(/연평균\s*(\d+)~(\d+)℃/);
  if (annualRangeMatch) {
    return {
      type: "annualAvgRange",
      min: Number(annualRangeMatch[1]),
      max: Number(annualRangeMatch[2]),
      raw: climateText,
    };
  }

  // 4. 생육적온 N~M℃ (가장 흔한 패턴, fallback)
  const growingMatch = climateText.match(/생육적온\s*(\d+)~(\d+)℃/);
  if (growingMatch) {
    return {
      type: "growingOptimal",
      min: Number(growingMatch[1]),
      max: Number(growingMatch[2]),
      raw: climateText,
    };
  }

  // 파싱 실패 시 기본값
  return { type: "growingOptimal", min: null, max: null, raw: climateText };
}

export type TempFit = "good" | "marginal" | "poor";

/**
 * 파싱된 작물 기후 조건 vs 실측 연평균 기온으로 적합성 판정.
 *
 * - annualAvgRange / annualAvgMin: 직접 비교 가능
 * - growingOptimal: 생육적온은 연평균보다 높으므로 (적온 - 10~12℃) 보정
 * - facilityControlled: 시설재배이므로 지역 무관 → 항상 "good"
 */
export function evaluateTemperatureFit(
  parsed: ParsedClimateTemp,
  avgTemp: number,
): TempFit {
  if (parsed.type === "facilityControlled") return "good";

  if (parsed.min === null && parsed.max === null) return "marginal";

  if (parsed.type === "annualAvgMin") {
    // 연평균 N℃ 이상
    const threshold = parsed.min!;
    if (avgTemp >= threshold) return "good";
    if (avgTemp >= threshold - 3) return "marginal";
    return "poor";
  }

  if (parsed.type === "annualAvgRange") {
    // 연평균 N~M℃
    const lo = parsed.min!;
    const hi = parsed.max!;
    if (avgTemp >= lo && avgTemp <= hi) return "good";
    if (avgTemp >= lo - 3 && avgTemp <= hi + 3) return "marginal";
    return "poor";
  }

  // growingOptimal: 생육적온은 여름철 기준이므로
  // 연평균에 약 +11℃ 보정해서 비교 (한국 여름-연평균 차이 평균)
  const OFFSET = 11;
  const lo = parsed.min! - OFFSET;
  const hi = parsed.max! - OFFSET;
  if (avgTemp >= lo && avgTemp <= hi) return "good";
  if (avgTemp >= lo - 3 && avgTemp <= hi + 3) return "marginal";
  return "poor";
}
