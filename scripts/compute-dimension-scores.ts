/**
 * 시군구 차원별 5점수 정적 계산 스크립트 (Phase 4)
 *
 * 5차원 (각 0~100 또는 null):
 * 1. populationTrend: 5년 인구 변화율 → 선형 (-10% ~ +5% → 0~100)
 * 2. farmActivity: 인구 1만명당 농가 수 → 전국 분위 (1~100). 도시 자치구는 null
 * 3. medical: 인구 1만명당 의료기관 수 → 전국 분위 (1~100)
 * 4. school: 인구 1만명당 학교 수 → 전국 분위 (1~100). 군위는 null (NEIS 미등록)
 * 5. returnFarm: 귀농 인구 비율 → 전국 분위 (1~100). 도시 자치구는 null
 *
 * 도시 자치구 hide 기준: KOSIS 귀농 데이터 부재 → 농가·귀농 두 차원 동시 null
 *
 * 출력: src/lib/data/dimension-scores.ts (자동 생성)
 *
 * 실행:
 *   npx tsx scripts/compute-dimension-scores.ts
 *
 * 회장 결재 사항 (A'안, 2026-05-04):
 *   - 농가·의료·학교·귀농 모두 전국 분위 통일 (어르신 친화 카피 일관)
 *   - 인구 추세만 선형 (변화율 자체가 직관적이라 분위 변환 불필요)
 *   - 도시 자치구: 농가·귀농 두 차원 hide
 *   - 군위: 학교 차원 hide (NEIS 자체 미등록)
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import {
  POPULATION_TREND_SIGUNGU,
  POPULATION_TREND_YEARS,
} from "../src/lib/data/population-trend";
import { FARM_FALLBACK_SIGUNGU, getFarmFallback } from "../src/lib/data/farms";
import { MEDICAL_FALLBACK_SIGUNGU } from "../src/lib/data/medical-facilities";
import { SCHOOL_FALLBACK_SIGUNGU } from "../src/lib/data/school-counts";
import { RETURN_FARM_RATE_SIGUNGU } from "../src/lib/data/return-farm-rate";

const LATEST_YEAR = POPULATION_TREND_YEARS[POPULATION_TREND_YEARS.length - 1];

// ── 인덱스 ──
const populationByCode = new Map<string, number>();
for (const p of POPULATION_TREND_SIGUNGU) {
  if (p.year === LATEST_YEAR) {
    populationByCode.set(p.sgisCode, p.population);
  }
}

// 통합시 합산 포함 — farms.ts의 getFarmFallback 함수 사용
// FARM_FALLBACK_SIGUNGU import는 type 안정화 위해 유지 (런타임은 getFarmFallback)
void FARM_FALLBACK_SIGUNGU;
const medicalByCode = new Map(
  MEDICAL_FALLBACK_SIGUNGU.map((m) => [m.sgisCode, m]),
);
const schoolByCode = new Map(
  SCHOOL_FALLBACK_SIGUNGU.map((s) => [s.sgisCode, s]),
);
const returnFarmByCode = new Map(
  RETURN_FARM_RATE_SIGUNGU.map((r) => [r.sgisCode, r]),
);

// ── 도시 자치구 판정 ──
// KOSIS 귀농 데이터에 없는 시군구 = 도시 자치구
// (농가·귀농 차원 동시 hide 정책)
function isUrbanDistrict(sgisCode: string): boolean {
  return !returnFarmByCode.has(sgisCode);
}

// ── 1) 인구 추세 (선형) ──
function computePopulationTrend(sgisCode: string): number | null {
  const records = POPULATION_TREND_SIGUNGU.filter((p) => p.sgisCode === sgisCode);
  if (records.length < 2) return null;
  records.sort((a, b) => a.year - b.year);
  const earliest = records[0].population;
  const latest = records[records.length - 1].population;
  if (earliest === 0) return null;
  const changePct = ((latest - earliest) / earliest) * 100;
  if (changePct <= -10) return 0;
  if (changePct >= 5) return 100;
  return Math.round(((changePct - -10) / (5 - -10)) * 100);
}

// ── 2~5) raw 값 추출 ──
function getFarmActivityRaw(sgisCode: string): number | null {
  if (isUrbanDistrict(sgisCode)) return null;
  const farm = getFarmFallback(sgisCode); // 통합시는 GU_CODES_MAP 합산
  if (!farm) return null;
  const pop = populationByCode.get(sgisCode);
  if (!pop || pop === 0) return null;
  return farm.farmCount / (pop / 10000);
}

function getMedicalRaw(sgisCode: string): number | null {
  const med = medicalByCode.get(sgisCode);
  if (!med) return null;
  const pop = populationByCode.get(sgisCode);
  if (!pop || pop === 0) return null;
  return med.totalCount / (pop / 10000);
}

function getSchoolRaw(sgisCode: string): number | null {
  const sch = schoolByCode.get(sgisCode);
  if (!sch || sch.totalCount === 0) return null; // 군위 = 0 → null
  const pop = populationByCode.get(sgisCode);
  if (!pop || pop === 0) return null;
  return sch.totalCount / (pop / 10000);
}

function getReturnFarmRaw(sgisCode: string): number | null {
  const rec = returnFarmByCode.get(sgisCode);
  if (!rec) return null;
  return rec.returnFarmRate;
}

// ── 분위(percentile) 계산 ──
// 1~100 분위 (소수점 절삭). 동일 값은 동일 분위.
function computePercentile(rawMap: Map<string, number>): Map<string, number> {
  const sorted = Array.from(rawMap.entries()).sort((a, b) => a[1] - b[1]);
  const total = sorted.length;
  const result = new Map<string, number>();
  for (let i = 0; i < total; i++) {
    const [code] = sorted[i];
    // 1~100 정수 분위
    const percentile = Math.max(1, Math.round(((i + 1) / total) * 100));
    result.set(code, percentile);
  }
  return result;
}

// ── 인구 변화율 raw 추출 (evidence용) ──
function getPopulationChangePct(sgisCode: string): {
  earliest: number;
  latest: number;
  earliestYear: number;
  latestYear: number;
  changePct: number;
} | null {
  const records = POPULATION_TREND_SIGUNGU.filter((p) => p.sgisCode === sgisCode);
  if (records.length < 2) return null;
  records.sort((a, b) => a.year - b.year);
  const first = records[0];
  const last = records[records.length - 1];
  if (first.population === 0) return null;
  const changePct = ((last.population - first.population) / first.population) * 100;
  return {
    earliest: first.population,
    latest: last.population,
    earliestYear: first.year,
    latestYear: last.year,
    changePct,
  };
}

// ── evidence 카피 빌더 ──
function buildPopulationEvidence(sgisCode: string, score: number | null) {
  if (score === null) return null;
  const ch = getPopulationChangePct(sgisCode);
  if (!ch) return null;
  const sign = ch.changePct >= 0 ? "+" : "";
  const tone =
    ch.changePct >= 0
      ? `${ch.earliestYear}~${ch.latestYear}년 인구 ${sign}${ch.changePct.toFixed(1)}% 변화로 회복세예요`
      : ch.changePct >= -5
        ? `${ch.earliestYear}~${ch.latestYear}년 인구 ${ch.changePct.toFixed(1)}% 변화로 안정 추세예요`
        : `${ch.earliestYear}~${ch.latestYear}년 인구 ${ch.changePct.toFixed(1)}% 변화로 감소 폭이 커요`;
  return {
    rawValue: Number(ch.changePct.toFixed(1)),
    rawUnit: "%",
    rawLabel: `5년 인구 ${sign}${ch.changePct.toFixed(1)}%`,
    interpretation: tone,
  };
}

function buildPercentileEvidence(opts: {
  rawValue: number | null;
  rawUnit: string;
  rawLabelPrefix: string;
  percentile: number | null;
  highTone: string;
  midTone: string;
  lowTone: string;
}) {
  if (opts.rawValue === null || opts.percentile === null) return null;
  // percentile = 차원 점수 자체 (1~100). 높을수록 잘하는 방향.
  // 점수 100 → 전국 1등, 점수 50 → 전국 중간, 점수 1 → 전국 꼴찌.
  // "상위 N%"는 좋은 방향 위치 표시이므로 percentile이 50 이상일 때만 자연스럽다.
  // percentile 50 미만은 "하위 N%"로 표기 — 사용자에게 솔직.
  const topPct = Math.max(1, 100 - opts.percentile);
  const bottomPct = Math.max(1, opts.percentile);
  const rankCopy =
    opts.percentile >= 50
      ? `전국 상위 ${topPct}%`
      : `전국 하위 ${bottomPct}%`;
  const tone =
    opts.percentile >= 67
      ? opts.highTone
      : opts.percentile >= 34
        ? opts.midTone
        : opts.lowTone;
  const rawDisplay =
    opts.rawValue >= 100
      ? Math.round(opts.rawValue).toLocaleString()
      : opts.rawValue.toFixed(1);
  return {
    rawValue: Number(opts.rawValue.toFixed(2)),
    rawUnit: opts.rawUnit,
    rawLabel: `${opts.rawLabelPrefix} ${rawDisplay}${opts.rawUnit}`,
    rankPercent: topPct,
    interpretation: `${tone} (${rankCopy})`,
  };
}

// ── 메인 ──
function main() {
  // raw 값 수집
  const farmRaws = new Map<string, number>();
  const medicalRaws = new Map<string, number>();
  const schoolRaws = new Map<string, number>();
  const returnFarmRaws = new Map<string, number>();

  for (const sg of SIGUNGUS) {
    const f = getFarmActivityRaw(sg.sgisCode);
    if (f !== null) farmRaws.set(sg.sgisCode, f);
    const m = getMedicalRaw(sg.sgisCode);
    if (m !== null) medicalRaws.set(sg.sgisCode, m);
    const s = getSchoolRaw(sg.sgisCode);
    if (s !== null) schoolRaws.set(sg.sgisCode, s);
    const r = getReturnFarmRaw(sg.sgisCode);
    if (r !== null) returnFarmRaws.set(sg.sgisCode, r);
  }

  // 분위 변환
  const farmPct = computePercentile(farmRaws);
  const medPct = computePercentile(medicalRaws);
  const schPct = computePercentile(schoolRaws);
  const rfPct = computePercentile(returnFarmRaws);

  // 결과 매핑 (evidence 메타 포함)
  const scores = SIGUNGUS.map((sg) => {
    const populationTrend = computePopulationTrend(sg.sgisCode);
    const farmRaw = farmRaws.get(sg.sgisCode) ?? null;
    const medRaw = medicalRaws.get(sg.sgisCode) ?? null;
    const schRaw = schoolRaws.get(sg.sgisCode) ?? null;
    const rfRaw = returnFarmRaws.get(sg.sgisCode) ?? null;

    const farmActivity = farmPct.get(sg.sgisCode) ?? null;
    const medical = medPct.get(sg.sgisCode) ?? null;
    const school = schPct.get(sg.sgisCode) ?? null;
    const returnFarm = rfPct.get(sg.sgisCode) ?? null;

    return {
      sgisCode: sg.sgisCode,
      name: sg.name,
      populationTrend,
      farmActivity,
      medical,
      school,
      returnFarm,
      evidence: {
        populationTrend: buildPopulationEvidence(sg.sgisCode, populationTrend),
        farmActivity: buildPercentileEvidence({
          rawValue: farmRaw,
          rawUnit: "호",
          rawLabelPrefix: "1만 명당 농가",
          percentile: farmActivity,
          highTone: "1만 명당 농가가 많아 농업 활동이 활발해요",
          midTone: "1만 명당 농가가 평균 수준이에요",
          lowTone: "1만 명당 농가가 적은 편이에요",
        }),
        medical: buildPercentileEvidence({
          rawValue: medRaw,
          rawUnit: "곳",
          rawLabelPrefix: "1만 명당 의료기관",
          percentile: medical,
          highTone: "1만 명당 의료기관이 많아 접근성이 좋아요",
          midTone: "1만 명당 의료기관이 평균 수준이에요",
          lowTone: "1만 명당 의료기관이 적은 편이에요",
        }),
        school: buildPercentileEvidence({
          rawValue: schRaw,
          rawUnit: "곳",
          rawLabelPrefix: "1만 명당 학교",
          percentile: school,
          highTone: "1만 명당 학교가 많아 자녀 교육 환경이 좋아요",
          midTone: "1만 명당 학교가 평균 수준이에요",
          lowTone: "1만 명당 학교가 적은 편이에요",
        }),
        returnFarm: buildPercentileEvidence({
          rawValue: rfRaw,
          rawUnit: "%",
          rawLabelPrefix: "전체 인구 대비 귀농",
          percentile: returnFarm,
          highTone: "귀농 비율이 높아 정착 사례가 많은 곳이에요",
          midTone: "귀농 비율이 평균 수준이에요",
          lowTone: "귀농 비율이 낮은 편이에요",
        }),
      },
    };
  });

  // 커버리지 보고
  const coverage = {
    populationTrend: scores.filter((s) => s.populationTrend !== null).length,
    farmActivity: scores.filter((s) => s.farmActivity !== null).length,
    medical: scores.filter((s) => s.medical !== null).length,
    school: scores.filter((s) => s.school !== null).length,
    returnFarm: scores.filter((s) => s.returnFarm !== null).length,
  };
  console.log(`총 시군구: ${scores.length}`);
  console.log(`커버리지:`, coverage);

  // 파일 작성
  const today = new Date().toISOString().split("T")[0];
  const header = `/**
 * 시군구 차원별 5점수 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-dimension-scores.ts
 * 마지막 갱신: ${today}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/compute-dimension-scores.ts\`
 *
 * 5차원 (각 0~100 또는 null):
 * 1. populationTrend: 5년 인구 변화율 선형 (-10% → 0, +5% → 100)
 * 2. farmActivity: 인구 1만명당 농가 수 전국 분위 (1~100). 도시 자치구 null
 * 3. medical: 인구 1만명당 의료기관 수 전국 분위 (1~100)
 * 4. school: 인구 1만명당 학교 수 전국 분위 (1~100). 군위 null
 * 5. returnFarm: 귀농 인구 비율 전국 분위 (1~100). 도시 자치구 null
 *
 * 회장 결재 사항 (A'안):
 *   - 농가/의료/학교/귀농 전국 분위 통일 (어르신 친화 카피 일관)
 *   - 도시 자치구는 농가·귀농 동시 hide (KOSIS 귀농 부재 기준)
 */

export interface DimensionEvidence {
  /** 원시 수치 (분위 환산 전) */
  rawValue: number;
  /** 원시 단위 (%, 호, 곳 등) */
  rawUnit: string;
  /** UI 노출용 짧은 라벨 (예: "1만 명당 농가 4.2호") */
  rawLabel: string;
  /** 전국 상위 N% (인구 추세는 null) */
  rankPercent?: number;
  /** 한 줄 해석 카피 (UI 노출용) */
  interpretation: string;
}

export interface DimensionEvidenceMap {
  populationTrend: DimensionEvidence | null;
  farmActivity: DimensionEvidence | null;
  medical: DimensionEvidence | null;
  school: DimensionEvidence | null;
  returnFarm: DimensionEvidence | null;
}

export interface DimensionScores {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 인구 추세 점수 (0~100). 선형 정규화 */
  populationTrend: number | null;
  /** 농가 활성도 분위 (1~100). 도시 자치구 null */
  farmActivity: number | null;
  /** 의료 인프라 분위 (1~100) */
  medical: number | null;
  /** 학교 인프라 분위 (1~100). 군위 null */
  school: number | null;
  /** 귀농 인구 비율 분위 (1~100). 도시 자치구 null */
  returnFarm: number | null;
  /** 차원별 evidence (raw 수치 + 해석 카피) */
  evidence: DimensionEvidenceMap;
}

/** 시군구 5차원 점수 (SGIS sgisCode 키) */
export const DIMENSION_SCORES: DimensionScores[] = ${JSON.stringify(scores, null, 2)};

const SCORE_INDEX = new Map(DIMENSION_SCORES.map((s) => [s.sgisCode, s]));

/** sgisCode로 차원별 점수 조회 (없으면 null) */
export function getDimensionScores(
  sgisCode: string,
): DimensionScores | null {
  return SCORE_INDEX.get(sgisCode) ?? null;
}

/** 차원별 라벨 (UI/methodology 공용) */
export const DIMENSION_LABELS = {
  populationTrend: "인구 추세",
  farmActivity: "농가 활성도",
  medical: "의료 인프라",
  school: "학교 인프라",
  returnFarm: "귀농 활성도",
} as const;

export type DimensionId = keyof typeof DIMENSION_LABELS;

export const DIMENSION_IDS: DimensionId[] = [
  "populationTrend",
  "farmActivity",
  "medical",
  "school",
  "returnFarm",
];
`;

  const outPath = resolve(__dirname, "../src/lib/data/dimension-scores.ts");
  writeFileSync(outPath, header);
  console.log(`[wrote] ${outPath}`);
}

main();
