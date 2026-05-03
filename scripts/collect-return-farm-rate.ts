/**
 * KOSIS 시군구 귀농 인구 비율 일괄 수집 스크립트 (Phase 4)
 *
 * - KOSIS 귀농 통계는 1회 호출(regionCode 미지정)로 전국 시군구가 함께 반환됨
 *   → fetchReturnFarmStats() 1회만 실행하여 ALL 데이터 확보 (3개 테이블 병렬)
 *   → 별도 throttle 불필요 (~5초 내 완료 예상)
 * - 결과: 각 시군구 sgisCode 기준으로 정렬, 비율 계산
 *
 * 비율 계산:
 *   returnFarmRate = (귀농인 수 / 전체 인구) × 100
 *   - 시군구 인구: src/lib/data/population-trend.ts 의 POPULATION_TREND_SIGUNGU 최신 연도(2022)
 *     (POPULATION_FALLBACK은 시도 단위만 보유 — 시군구는 trend 데이터 사용)
 *   - 시도 합산: 시도 = sum(시군구 귀농인수) / sum(시군구 인구) × 100
 *
 * 코드 매핑 주의 — 회장 메모(SGIS 코드 체계 vs 행안부 코드):
 *   - KOSIS C1 코드 = 행안부 admCode (예: 전남 순천 = 46150)
 *   - sigungus.ts: admCode + sgisCode 둘 다 보유
 *   - 결과 직렬화는 sgisCode 5자리로 통일 (다른 폴백 데이터와 일관)
 *
 * 결과 파일: src/lib/data/return-farm-rate.ts 자동 생성
 *
 * 실행:
 *   npx tsx scripts/collect-return-farm-rate.ts
 *
 * 환경:
 *   .env.local 의 KOSIS_API_KEY 사용
 *
 * 데이터 소스: KOSIS 통계청 귀농어·귀촌인 통계
 *   - DT_1A02002 시군구별·성별 귀농인 수
 *   - DT_1A02008 시군구별·가구원수별 귀농가구
 *
 * 회장 원칙: 누락 시군구 발생 시 헤더 주석에 명시. 추정값 사용 금지.
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

import { SIGUNGUS } from "../src/lib/data/sigungus";
import { PROVINCES } from "../src/lib/data/regions";
import { fetchReturnFarmStats } from "../src/lib/api/kosis";
import { POPULATION_TREND_SIGUNGU, POPULATION_TREND_YEARS } from "../src/lib/data/population-trend";
import { POPULATION_FALLBACK } from "../src/lib/data/population";

interface ReturnFarmRate {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 귀농인 수 */
  returnFarmCount: number;
  /** 귀농 인구 비율 (%) — (귀농인 / 전체 인구) × 100 */
  returnFarmRate: number;
  /** 통계 연도 */
  year: number;
}

async function main() {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) throw new Error("KOSIS_API_KEY missing in .env.local");

  console.log(`[collect-return-farm] sigungu=${SIGUNGUS.length}`);
  const startTime = Date.now();

  // 1) KOSIS 전국 시군구 귀농 통계 1회 호출
  console.log(`[collect-return-farm] fetching KOSIS (regionCode=ALL)…`);
  const kosisData = await fetchReturnFarmStats();
  if (kosisData.length === 0) {
    throw new Error(
      "KOSIS returned empty data. Check KOSIS_API_KEY or wait for next year's release (보통 6월).",
    );
  }
  const dataYear = kosisData[0].year;
  console.log(
    `[collect-return-farm] received ${kosisData.length} regions, year=${dataYear}`,
  );

  // 2) admCode → KOSIS 응답 lookup
  const kosisMap = new Map(
    kosisData.map((d) => [d.regionCode, d]),
  );

  // 3) 최신 연도 시군구 인구 lookup (sgisCode 기준)
  const trendLatestYear = Math.max(...POPULATION_TREND_YEARS);
  const populationMap = new Map<string, number>();
  for (const p of POPULATION_TREND_SIGUNGU) {
    if (p.year === trendLatestYear) {
      populationMap.set(p.sgisCode, p.population);
    }
  }
  console.log(
    `[collect-return-farm] population base year=${trendLatestYear}, sigungu coverage=${populationMap.size}`,
  );

  // 4) 시군구 단위 비율 계산
  const successList: ReturnFarmRate[] = [];
  const failList: string[] = [];

  for (const sg of SIGUNGUS) {
    const kosisRow = kosisMap.get(sg.admCode);
    if (!kosisRow) {
      failList.push(`${sg.name} (admCode=${sg.admCode}, KOSIS 미발견)`);
      continue;
    }
    const population = populationMap.get(sg.sgisCode);
    if (!population || population <= 0) {
      failList.push(`${sg.name} (sgisCode=${sg.sgisCode}, 인구 데이터 없음)`);
      continue;
    }
    const rate = (kosisRow.returnFarmPerson / population) * 100;
    successList.push({
      sgisCode: sg.sgisCode,
      name: sg.name,
      returnFarmCount: kosisRow.returnFarmPerson,
      returnFarmRate: Number(rate.toFixed(4)),
      year: dataYear,
    });
  }

  console.log(`\n[done] success=${successList.length}/${SIGUNGUS.length}`);
  if (failList.length > 0) {
    console.log(
      `[failed] ${failList.length}개: ${failList.slice(0, 20).join(", ")}${failList.length > 20 ? " …" : ""}`,
    );
  }

  // 5) 시도 합산 — sum(시군구 귀농인) / sum(시군구 인구) × 100
  //    시도 자체 KOSIS 코드(2자리) 응답이 있으면 우선 사용, 없으면 합산
  interface SidoAcc {
    sgisCode: string;
    name: string;
    returnFarmCount: number;
    population: number;
  }
  const sidoAcc = new Map<string, SidoAcc>();
  for (const p of PROVINCES) {
    sidoAcc.set(p.sgisCode, {
      sgisCode: p.sgisCode,
      name: p.shortName,
      returnFarmCount: 0,
      population: 0,
    });
  }
  for (const item of successList) {
    const sidoCode = item.sgisCode.slice(0, 2);
    const acc = sidoAcc.get(sidoCode);
    if (!acc) continue;
    acc.returnFarmCount += item.returnFarmCount;
    const pop = populationMap.get(item.sgisCode) ?? 0;
    acc.population += pop;
  }
  // 시도 인구가 시군구 합계보다 정확하다 — POPULATION_FALLBACK 보강
  const sidoFallbackMap = new Map(
    POPULATION_FALLBACK.map((p) => [p.sgisCode, p.population]),
  );
  const sidoArr: ReturnFarmRate[] = [];
  for (const acc of sidoAcc.values()) {
    if (acc.returnFarmCount === 0) continue;
    // 시도 인구는 POPULATION_FALLBACK 우선 사용 (가장 최신·정확)
    const sidoPopulation = sidoFallbackMap.get(acc.sgisCode) ?? acc.population;
    if (sidoPopulation <= 0) continue;
    const rate = (acc.returnFarmCount / sidoPopulation) * 100;
    sidoArr.push({
      sgisCode: acc.sgisCode,
      name: acc.name,
      returnFarmCount: acc.returnFarmCount,
      returnFarmRate: Number(rate.toFixed(4)),
      year: dataYear,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 직렬화
  // ─────────────────────────────────────────────────────────────────
  const filePath = resolve(__dirname, "../src/lib/data/return-farm-rate.ts");
  const missingNote =
    failList.length > 0
      ? ` * 미수집 시군구: ${failList.length}건 (스크립트 콘솔 참조)\n`
      : "";

  const body = `/**
 * 귀농 인구 비율 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-return-farm-rate.ts
 * 데이터 소스: KOSIS 통계청 귀농어·귀촌인 통계 (DT_1A02002)
 * 인구 베이스: src/lib/data/population-trend.ts (${trendLatestYear}년)
 * 시도 인구: src/lib/data/population.ts POPULATION_FALLBACK
 * 통계 연도: ${dataYear}
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-return-farm-rate.ts\`
 *
 * Phase 4 — 정착 점수 산출용 추가 차원 (귀농 활성도).
 * 비율 = (해당 지역 귀농인 수 / 해당 지역 전체 인구) × 100
 *
 * ⚠ 코드 체계 주의:
 *   - KOSIS C1 코드 = 행안부 admCode (예: 전남 순천 = 46150)
 *   - 본 파일의 sgisCode = SGIS 5자리 (예: 전남 순천 = 36030)
 *   - 매핑은 sigungus.ts의 admCode + sgisCode 페어를 통해 변환
 *
 * 커버리지: ${successList.length}/${SIGUNGUS.length} 시군구 (수집일 기준)
${missingNote} */

export interface ReturnFarmRateStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 귀농인 수 (명) */
  returnFarmCount: number;
  /** 귀농 인구 비율 (%) */
  returnFarmRate: number;
  /** 통계 연도 */
  year: number;
}

/** 시군구 귀농 인구 비율 (SGIS 5자리) */
export const RETURN_FARM_RATE_SIGUNGU: ReturnFarmRateStat[] = ${JSON.stringify(
    successList,
    null,
    2,
  )};

/** 시도 합산 귀농 인구 비율 (SGIS 2자리) */
export const RETURN_FARM_RATE_SIDO: ReturnFarmRateStat[] = ${JSON.stringify(
    sidoArr,
    null,
    2,
  )};

const SIGUNGU_INDEX = new Map(
  RETURN_FARM_RATE_SIGUNGU.map((r) => [r.sgisCode, r]),
);
const SIDO_INDEX = new Map(RETURN_FARM_RATE_SIDO.map((r) => [r.sgisCode, r]));

export function getReturnFarmRateFallback(sgisCode: string): ReturnFarmRateStat | null {
  return SIGUNGU_INDEX.get(sgisCode) ?? SIDO_INDEX.get(sgisCode) ?? null;
}
`;

  writeFileSync(filePath, body, "utf-8");
  console.log(`\n[wrote] ${filePath}`);

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`[total elapsed] ${totalSec}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
