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
 *
 * 코드 매핑 주의 — 회장 메모(SGIS 코드 체계 vs 행안부 코드):
 *   - KOSIS C1 코드 = sigungus.ts admCode (옛 행정구역분류 체계, 예: 전남 순천 = 36030 — 행안부 코드 아님)
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
import { fetchReturnFarmStats, fetchReturnFarmStatsOfYear, isSameRegionName } from "../src/lib/api/kosis";
import { POPULATION_TREND_SIGUNGU, POPULATION_TREND_YEARS } from "../src/lib/data/population-trend";

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
  // 최신 연도에 비공개('X')로 빠진 곳(2025 울릉 등)은 전년도 값 — 없으면 순위 계산이 그곳을 도시 자치구로 본다
  const prevMap = new Map(
    (await fetchReturnFarmStatsOfYear(dataYear - 1)).map((d) => [d.regionCode, d]),
  );
  const prevYearUsed: string[] = [];

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
    const latestRow = kosisMap.get(sg.admCode);
    const kosisRow = latestRow ?? prevMap.get(sg.admCode);
    if (!kosisRow) {
      failList.push(`${sg.name} (admCode=${sg.admCode}, KOSIS 미발견)`);
      continue;
    }
    // 코드가 이웃 지역을 가리키면 쓰지 않는다 — 10/7 15건이 한 칸씩 밀려 옥천에 보은 값이 들어가 있었다
    if (!isSameRegionName(kosisRow.regionName, sg.name)) {
      failList.push(`${sg.name} (admCode=${sg.admCode} → KOSIS '${kosisRow.regionName}', 이름 다름)`);
      continue;
    }
    const population = populationMap.get(sg.sgisCode);
    if (!population || population <= 0) {
      failList.push(`${sg.name} (sgisCode=${sg.sgisCode}, 인구 데이터 없음)`);
      continue;
    }
    const rate = (kosisRow.returnFarmPerson / population) * 100;
    if (!latestRow) prevYearUsed.push(`${sg.name}(${kosisRow.year})`);
    successList.push({
      sgisCode: sg.sgisCode,
      name: sg.name,
      returnFarmCount: kosisRow.returnFarmPerson,
      returnFarmRate: Number(rate.toFixed(4)),
      year: kosisRow.year,
    });
  }

  console.log(`\n[done] success=${successList.length}/${SIGUNGUS.length}`);
  if (failList.length > 0) {
    console.log(
      `[failed] ${failList.length}개: ${failList.slice(0, 20).join(", ")}${failList.length > 20 ? " …" : ""}`,
    );
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
 * 통계 연도: ${dataYear}${prevYearUsed.length ? ` (비공개로 빠진 곳은 전년도 값: ${prevYearUsed.join(", ")})` : ""}
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-return-farm-rate.ts\`
 *
 * Phase 4 — 정착 점수 산출용 추가 차원 (귀농 활성도).
 * 비율 = (해당 지역 귀농인 수 / 해당 지역 전체 인구) × 100
 *
 * ⚠ 코드 체계 주의:
 *   - KOSIS C1 코드 = sigungus.ts admCode (옛 행정구역분류 체계, 예: 전남 순천 = 36030 — 행안부 코드 아님)
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
