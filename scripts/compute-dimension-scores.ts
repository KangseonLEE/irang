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

  // 결과 매핑
  const scores = SIGUNGUS.map((sg) => ({
    sgisCode: sg.sgisCode,
    name: sg.name,
    populationTrend: computePopulationTrend(sg.sgisCode),
    farmActivity: farmPct.get(sg.sgisCode) ?? null,
    medical: medPct.get(sg.sgisCode) ?? null,
    school: schPct.get(sg.sgisCode) ?? null,
    returnFarm: rfPct.get(sg.sgisCode) ?? null,
  }));

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
