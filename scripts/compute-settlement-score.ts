/**
 * 시군구 정착 점수 계산 스크립트 (Phase 3 — 트랙 C)
 *
 * 모델: 4차원 가중 평균 (0~100점) — 농촌 정착 가능성 중심
 *  - 농가 활성도 (35%): farmCount / area (농가밀도) + avgPopulation 보정
 *  - 인구 안정성 (25%): 5년 변화율 (감소 안 함=만점, 도시 유입 과도시 캡)
 *  - 청년성     (25%): 고령화율 역수 (낮을수록 점수 높음)
 *  - 거주 적정성 (15%): 인구밀도 (20~300/km² 적정 구간 — 한적한 농촌)
 *
 * ⚠ 정적 데이터(population-trend.ts, population.ts, farms.ts, sigungus.ts)만
 *    참조하므로 외부 API 호출 없이 빌드 타임에 결과를 1회 계산해 저장한다.
 *
 * 실행: npx tsx scripts/compute-settlement-score.ts
 *  - src/lib/data/settlement-score.ts 가 자동 갱신됨
 *
 * 모델 보정 이력 (2026-05-03):
 *  v1: 인구추세 35% → 수도권 유입 도시(평택·오산·화성)가 상위 → 귀농 본질 어긋남
 *  v2: 농가 35% / 추세 25% / 청년 25% / 밀도 15%, 추세 점수 상한 90 (도시화 캡),
 *      적정 밀도 20~300/km² (귀농 적합 한적함)
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { SIGUNGUS } from "../src/lib/data/sigungus";
import { POPULATION_FALLBACK } from "../src/lib/data/population";
import {
  POPULATION_TREND_SIGUNGU,
  POPULATION_TREND_SIDO,
} from "../src/lib/data/population-trend";
import {
  FARM_FALLBACK_SIGUNGU,
  FARM_FALLBACK_SIDO,
} from "../src/lib/data/farms";
import {
  INTEGRATED_CITY_GU_CODES,
  INTEGRATED_CITY_NAMES,
} from "../src/lib/data/integrated-cities";
import { PROVINCES } from "../src/lib/data/regions";

// ────────────────────────────────────────────────────────────────────────────
// 가중치 모델
// ────────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  farm: 0.35,
  populationTrend: 0.25,
  youth: 0.25,
  density: 0.15,
} as const;

// ────────────────────────────────────────────────────────────────────────────
// 정규화 헬퍼 (모두 0~100 반환)
// ────────────────────────────────────────────────────────────────────────────

/**
 * 5년 인구 변화율 → 안정성 점수
 *  - -10%↓ = 0점 (급격한 인구 감소, 정착 위험)
 *  - -5%   = 50점 (감소세 있으나 완만)
 *  -  0%   = 90점 (안정 — 만점에 근접)
 *  - +3~+5%= 100점 (회복 — 만점)
 *  - +10%↑ = 80점 (도시 유입 과도, 귀농 본질 아님 — 캡 적용)
 */
function scorePopulationTrend(changePct: number | null): number {
  if (changePct === null) return 50;
  const v = changePct;
  if (v <= -10) return 0;
  if (v <= 0) {
    // -10 ~ 0 → 0 ~ 90
    return Math.round(((v + 10) / 10) * 90);
  }
  if (v <= 5) {
    // 0 ~ 5 → 90 ~ 100
    return Math.round(90 + (v / 5) * 10);
  }
  // 5↑ 도시화 캡: 5% = 100, 15% = 80, 30%↑ = 70
  if (v <= 15) {
    return Math.round(100 - ((v - 5) / 10) * 20);
  }
  return Math.max(70, Math.round(80 - ((v - 15) / 15) * 10));
}

/** 고령화율 → 청년성 점수 (역수). 30%↑=0, 10%↓=100 */
function scoreYouth(agingRate: number | null): number {
  if (agingRate === null) return 50;
  const clamped = Math.max(10, Math.min(30, agingRate));
  return Math.round(((30 - clamped) / 20) * 100);
}

/**
 * 농가 활성도 점수 = 50% (농가밀도) + 50% (가구당 농가인구)
 *  - 농가밀도 = farmCount / area, 시도 평균과 비교
 *  - 가구당 농가인구 = avgPopulation, 2.0~3.0 사이 만점
 */
function scoreFarm(
  farmCount: number,
  area: number,
  avgPopulation: number,
  sidoFarmDensity: number,
): number {
  // 농가밀도 (가구/km²) — 시도 평균 대비 비율
  const density = area > 0 ? farmCount / area : 0;
  let densityScore = 50;
  if (sidoFarmDensity > 0) {
    const ratio = density / sidoFarmDensity;
    // 0.5배=0점, 1.0배=50점, 2.0배=100점, 그 이상도 100점
    densityScore = Math.round(Math.max(0, Math.min(100, (ratio - 0.5) * 100 / 1.5)));
  }

  // 가구당 농가인구 (1.5~3.5 정규화)
  const popScore = Math.round(
    Math.max(0, Math.min(100, ((avgPopulation - 1.5) / 2.0) * 100)),
  );

  return Math.round(densityScore * 0.5 + popScore * 0.5);
}

/**
 * 인구밀도(명/km²) → 거주 적정성 점수 (귀농 적합 = 한적함)
 *  - 너무 낮음(20 미만): 인프라 부족 감점
 *  - 적정(20~300): 만점 (한적한 농촌)
 *  - 도시 근접(300~1000): 80~60 (생활 편의 있으나 귀농지로 덜 적합)
 *  - 도시(1000~5000): 60~30
 *  - 대도시(5000↑): 30 이하
 */
function scoreDensity(density: number | null): number {
  if (density === null || density <= 0) return 30;
  if (density < 20) {
    // 0~20 → 50~90 (너무 한적해도 90점, 인프라 우려는 -10점만)
    return Math.round(50 + (density / 20) * 40);
  }
  if (density <= 300) {
    return 100;
  }
  if (density <= 1000) {
    // 300~1000 → 100 ~ 60
    return Math.round(100 - ((density - 300) / 700) * 40);
  }
  if (density <= 5000) {
    // 1000~5000 → 60 ~ 30
    return Math.round(60 - ((density - 1000) / 4000) * 30);
  }
  // 5000↑ → 30 ~ 10
  const over = Math.min(25000, density);
  return Math.max(10, Math.round(30 - ((over - 5000) / 20000) * 20));
}

// ────────────────────────────────────────────────────────────────────────────
// 인덱스 빌드
// ────────────────────────────────────────────────────────────────────────────

const sigunguTrendIndex = new Map<string, typeof POPULATION_TREND_SIGUNGU>();
for (const p of POPULATION_TREND_SIGUNGU) {
  const list = sigunguTrendIndex.get(p.sgisCode) ?? [];
  list.push(p);
  sigunguTrendIndex.set(p.sgisCode, list);
}
const sidoTrendIndex = new Map<string, typeof POPULATION_TREND_SIDO>();
for (const p of POPULATION_TREND_SIDO) {
  const list = sidoTrendIndex.get(p.sgisCode) ?? [];
  list.push(p);
  sidoTrendIndex.set(p.sgisCode, list);
}

const farmSigunguIndex = new Map(
  FARM_FALLBACK_SIGUNGU.map((f) => [f.sgisCode, f]),
);
const farmSidoIndex = new Map(FARM_FALLBACK_SIDO.map((f) => [f.sgisCode, f]));
const populationFallbackIndex = new Map(
  POPULATION_FALLBACK.map((p) => [p.sgisCode, p]),
);
const provinceIndex = new Map(PROVINCES.map((p) => [p.sgisCode, p]));

// ────────────────────────────────────────────────────────────────────────────
// 통합시 합산 헬퍼
// ────────────────────────────────────────────────────────────────────────────

interface AggregatedSigunguData {
  sgisCode: string;
  name: string;
  sidoSgisCode: string;
  area: number;
  /** 최신 인구 (2022 trend) — 시군구는 trend 사용, 시도는 별도 */
  latestPopulation: number | null;
  /** 5년 변화율 */
  populationChangePct: number | null;
  /** 최신 고령화율 */
  agingRate: number | null;
  /** 농가 수 */
  farmCount: number | null;
  /** 가구당 농가인구 */
  avgFarmPopulation: number | null;
}

function aggregateTrend(
  sgisCodes: string[],
): { latest: number; changePct: number; agingRate: number } | null {
  // 통합시: 5년치를 연도별로 합산해 변화율 산출
  const yearMap = new Map<
    number,
    { population: number; agingSum: number; agingCount: number }
  >();
  for (const code of sgisCodes) {
    const list = sigunguTrendIndex.get(code);
    if (!list) continue;
    for (const p of list) {
      const t = yearMap.get(p.year) ?? {
        population: 0,
        agingSum: 0,
        agingCount: 0,
      };
      t.population += p.population;
      t.agingSum += p.agingRate * p.population; // 인구 가중 평균
      t.agingCount += p.population;
      yearMap.set(p.year, t);
    }
  }
  if (yearMap.size < 2) return null;
  const years = [...yearMap.keys()].sort();
  const earliest = yearMap.get(years[0])!.population;
  const latestEntry = yearMap.get(years[years.length - 1])!;
  const latest = latestEntry.population;
  const changePct =
    earliest > 0 ? ((latest - earliest) / earliest) * 100 : 0;
  const agingRate =
    latestEntry.agingCount > 0
      ? latestEntry.agingSum / latestEntry.agingCount
      : 0;
  return {
    latest,
    changePct: Math.round(changePct * 10) / 10,
    agingRate: Math.round(agingRate * 10) / 10,
  };
}

function aggregateFarm(
  sgisCodes: string[],
): { farmCount: number; avgPopulation: number } | null {
  let total = 0;
  let pop = 0;
  for (const code of sgisCodes) {
    const f = farmSigunguIndex.get(code);
    if (!f) continue;
    total += f.farmCount;
    pop += f.farmPopulation;
  }
  if (total === 0) return null;
  return {
    farmCount: total,
    avgPopulation: Math.round((pop / total) * 10) / 10,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 시도별 농가밀도 평균 (정규화 기준)
// ────────────────────────────────────────────────────────────────────────────

const sidoFarmDensityMap = new Map<string, number>();
for (const prov of PROVINCES) {
  const sidoFarm = farmSidoIndex.get(prov.sgisCode);
  if (sidoFarm && prov.area > 0) {
    sidoFarmDensityMap.set(prov.sgisCode, sidoFarm.farmCount / prov.area);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 시군구 데이터 집계
// ────────────────────────────────────────────────────────────────────────────

const aggregatedList: AggregatedSigunguData[] = [];

for (const sg of SIGUNGUS) {
  const sidoSgisCode = sg.sgisCode.slice(0, 2);

  // 통합시 여부 판별
  const guCodes = INTEGRATED_CITY_GU_CODES[sg.sgisCode];

  let trendData: ReturnType<typeof aggregateTrend> = null;
  let farmData: ReturnType<typeof aggregateFarm> = null;

  if (guCodes) {
    // 통합시 → 구 합산
    trendData = aggregateTrend(guCodes);
    farmData = aggregateFarm(guCodes);
  } else {
    // 일반 시군구 → 직접 조회
    trendData = aggregateTrend([sg.sgisCode]);
    farmData = aggregateFarm([sg.sgisCode]);
  }

  aggregatedList.push({
    sgisCode: sg.sgisCode,
    name: sg.name,
    sidoSgisCode,
    area: sg.area,
    latestPopulation: trendData?.latest ?? null,
    populationChangePct: trendData?.changePct ?? null,
    agingRate: trendData?.agingRate ?? null,
    farmCount: farmData?.farmCount ?? null,
    avgFarmPopulation: farmData?.avgPopulation ?? null,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 점수 계산
// ────────────────────────────────────────────────────────────────────────────

interface SettlementScore {
  sgisCode: string;
  name: string;
  sidoSgisCode: string;
  totalScore: number;
  dimensions: {
    populationTrend: number;
    youth: number;
    farm: number;
    density: number;
  };
  /** 점수 산출 근거 (UI 비교용) */
  raw: {
    populationChangePct: number | null;
    agingRate: number | null;
    farmCount: number | null;
    avgFarmPopulation: number | null;
    densityPerKm2: number | null;
  };
}

const scores: SettlementScore[] = [];

for (const agg of aggregatedList) {
  const sidoFarmDensity = sidoFarmDensityMap.get(agg.sidoSgisCode) ?? 0;

  const popTrendScore = scorePopulationTrend(agg.populationChangePct);
  const youthScore = scoreYouth(agg.agingRate);

  let farmScore = 50;
  if (agg.farmCount !== null && agg.avgFarmPopulation !== null) {
    farmScore = scoreFarm(
      agg.farmCount,
      agg.area,
      agg.avgFarmPopulation,
      sidoFarmDensity,
    );
  }

  const density =
    agg.latestPopulation !== null && agg.area > 0
      ? agg.latestPopulation / agg.area
      : null;
  const densityScore = scoreDensity(density);

  const total =
    popTrendScore * WEIGHTS.populationTrend +
    youthScore * WEIGHTS.youth +
    farmScore * WEIGHTS.farm +
    densityScore * WEIGHTS.density;

  scores.push({
    sgisCode: agg.sgisCode,
    name: agg.name,
    sidoSgisCode: agg.sidoSgisCode,
    totalScore: Math.round(total * 10) / 10,
    dimensions: {
      populationTrend: popTrendScore,
      youth: youthScore,
      farm: farmScore,
      density: densityScore,
    },
    raw: {
      populationChangePct: agg.populationChangePct,
      agingRate: agg.agingRate,
      farmCount: agg.farmCount,
      avgFarmPopulation: agg.avgFarmPopulation,
      densityPerKm2:
        density !== null ? Math.round(density * 10) / 10 : null,
    },
  });
}

// 내림차순 정렬
scores.sort((a, b) => b.totalScore - a.totalScore);

// ────────────────────────────────────────────────────────────────────────────
// Spot check 출력
// ────────────────────────────────────────────────────────────────────────────

console.log(`\n총 시군구 수: ${scores.length}`);

const provinceShort = (code: string) =>
  provinceIndex.get(code)?.shortName ?? code;

console.log("\n── 상위 10개 ──");
scores.slice(0, 10).forEach((s, i) => {
  console.log(
    `${i + 1}. ${provinceShort(s.sidoSgisCode)} ${s.name} — ${s.totalScore}점 ` +
      `(추세 ${s.dimensions.populationTrend} · 청년 ${s.dimensions.youth} · ` +
      `농가 ${s.dimensions.farm} · 밀도 ${s.dimensions.density}) | ` +
      `Δ인구 ${s.raw.populationChangePct ?? "-"}% · 고령화 ${s.raw.agingRate ?? "-"}% · ` +
      `농가 ${s.raw.farmCount ?? "-"}가구`,
  );
});

console.log("\n── 하위 10개 ──");
scores.slice(-10).forEach((s, i) => {
  console.log(
    `${scores.length - 9 + i}. ${provinceShort(s.sidoSgisCode)} ${s.name} — ${s.totalScore}점 ` +
      `(추세 ${s.dimensions.populationTrend} · 청년 ${s.dimensions.youth} · ` +
      `농가 ${s.dimensions.farm} · 밀도 ${s.dimensions.density})`,
  );
});

console.log("\n── 점수 분포 ──");
const buckets = [
  { range: "80~100", count: 0 },
  { range: "60~80", count: 0 },
  { range: "40~60", count: 0 },
  { range: "20~40", count: 0 },
  { range: "0~20", count: 0 },
];
for (const s of scores) {
  if (s.totalScore >= 80) buckets[0].count++;
  else if (s.totalScore >= 60) buckets[1].count++;
  else if (s.totalScore >= 40) buckets[2].count++;
  else if (s.totalScore >= 20) buckets[3].count++;
  else buckets[4].count++;
}
for (const b of buckets) {
  console.log(`  ${b.range}: ${b.count}개`);
}

// 귀농인기 시군구가 어디에 분포하는지 검증
const popularIds = new Set([
  "guri",
  "namyangju",
  "hanam",
  "yongin",
  "paju",
  "icheon",
  "yangju",
  "pocheon",
  "yeoju",
  "samcheok",
  "hongcheon",
  "jeungpyeong",
  "jincheon",
  "cheongyang",
  "hongseong",
  "gimje",
  "wanju",
  "yeosu",
  "suncheon",
  "buk-gu-ulsan",
  "ulju",
  "gumi",
  "yeongju",
  "goseong-gn",
  "namhae",
]);
const popularSgisCodes = new Set(
  SIGUNGUS.filter((sg) => popularIds.has(sg.id)).map((sg) => sg.sgisCode),
);
console.log("\n── 귀농인기 시군구 점수 분포 ──");
const popularScores = scores
  .map((s, idx) => ({ ...s, rank: idx + 1 }))
  .filter((s) => popularSgisCodes.has(s.sgisCode));
popularScores.forEach((s) => {
  console.log(
    `  ${s.rank}위 ${provinceShort(s.sidoSgisCode)} ${s.name} — ${s.totalScore}점`,
  );
});

// ────────────────────────────────────────────────────────────────────────────
// 파일 저장
// ────────────────────────────────────────────────────────────────────────────

const fileHeader = `/**
 * 시군구 정착 점수 정적 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-settlement-score.ts
 * 입력 데이터: population-trend.ts, population.ts, farms.ts, sigungus.ts
 * 마지막 계산: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/compute-settlement-score.ts\`
 *
 * 모델 (4차원 가중 평균, 0~100점) — 농촌 정착 가능성 중심:
 *  - 농가 활성도 (35%): 농가밀도 + 가구당 농가인구
 *  - 인구 안정성 (25%): 5년 변화율 (감소↓ 감점, 도시 유입 과도시 캡)
 *  - 청년성     (25%): 고령화율 역수 (낮을수록 점수↑)
 *  - 거주 적정성 (15%): 인구밀도 (20~300/km² 적정 — 한적한 농촌)
 */

export const SETTLEMENT_SCORE_WEIGHTS = {
  populationTrend: ${WEIGHTS.populationTrend},
  youth: ${WEIGHTS.youth},
  farm: ${WEIGHTS.farm},
  density: ${WEIGHTS.density},
} as const;

export interface SettlementScoreDimensions {
  populationTrend: number;
  youth: number;
  farm: number;
  density: number;
}

export interface SettlementScore {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 시도 SGIS 코드 (2자리) */
  sidoSgisCode: string;
  /** 가중 총점 (0~100) */
  totalScore: number;
  /** 차원별 점수 */
  dimensions: SettlementScoreDimensions;
  /** 점수 산출 근거 (UI 표시용) */
  raw: {
    populationChangePct: number | null;
    agingRate: number | null;
    farmCount: number | null;
    avgFarmPopulation: number | null;
    densityPerKm2: number | null;
  };
}

`;

const dataLine = `export const SETTLEMENT_SCORES: SettlementScore[] = ${JSON.stringify(
  scores,
  null,
  2,
)};

const SCORE_INDEX = new Map(SETTLEMENT_SCORES.map((s) => [s.sgisCode, s]));

/** SGIS 코드로 시군구 정착 점수 조회 (없으면 null) */
export function getSettlementScore(sgisCode: string): SettlementScore | null {
  return SCORE_INDEX.get(sgisCode) ?? null;
}

/** 특정 시도의 시군구 점수 목록 (총점 내림차순) */
export function getSettlementScoresBySido(
  sidoSgisCode: string,
): SettlementScore[] {
  return SETTLEMENT_SCORES.filter((s) => s.sidoSgisCode === sidoSgisCode).sort(
    (a, b) => b.totalScore - a.totalScore,
  );
}

/** 전체 점수 분위 (백분위, 0~100). 점수가 같으면 동일 분위 */
export function getScorePercentile(score: number): number {
  const total = SETTLEMENT_SCORES.length;
  if (total === 0) return 0;
  const below = SETTLEMENT_SCORES.filter((s) => s.totalScore < score).length;
  return Math.round((below / total) * 100);
}
`;

const outputPath = join(
  process.cwd(),
  "src/lib/data/settlement-score.ts",
);
writeFileSync(outputPath, fileHeader + dataLine, "utf8");

console.log(`\n✅ 저장 완료: ${outputPath}`);
console.log(`   ${scores.length}개 시군구 점수 (정렬: 총점 내림차순)`);
