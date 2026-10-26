/**
 * KOSIS 시군구 귀농 인구 비율 일괄 수집 스크립트 (Phase 4)
 *
 * - KOSIS 귀농 통계는 1회 호출(regionCode 미지정)로 전국 시군구가 함께 반환됨
 *   → fetchReturnFarmStatsStrict() 1회만 실행하여 ALL 데이터 확보 (3개 테이블 병렬)
 *   → 별도 throttle 불필요 (~5초 내 완료 예상)
 * - 결과: 각 시군구 sgisCode 기준으로 정렬, 비율 계산
 *
 * 비율 계산:
 *   returnFarmRate = (귀농인 수 / 전체 인구) × 100
 *   - 시군구 인구: src/lib/data/population-trend.ts 의 POPULATION_TREND_SIGUNGU 마지막 해(= SGIS_POPULATION_YEAR, 2026년 기준 2024)
 *     (POPULATION_FALLBACK은 시도 단위만 보유 — 시군구는 trend 데이터 사용)
 *
 * 코드 매핑 주의 — 회장 메모(SGIS 코드 체계 vs 행안부 코드):
 *   - KOSIS C1 코드 = sigungus.ts admCode (옛 행정구역분류 체계, 예: 전남 순천 = 36030 — 행안부 코드 아님)
 *   - sigungus.ts: admCode + sgisCode 둘 다 보유
 *   - 결과 직렬화는 sgisCode 5자리로 통일 (다른 폴백 데이터와 일관)
 *
 * 결과 파일: src/lib/data/return-farm-rate.ts(순위용 비율)·return-farm-stats.ts(시·군·구 화면 카드) 자동 생성
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
import { fetchReturnFarmStatsStrict, fetchReturnFarmStatsOfYear, isSameRegionName } from "../src/lib/api/kosis";
import { RETURN_FARM_RATE_SIGUNGU } from "../src/lib/data/return-farm-rate";
import { RETURN_FARM_SIGUNGU } from "../src/lib/data/return-farm-stats";
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

interface ReturnFarmCardRow {
  admCode: string;
  name: string;
  returnFarmPerson: number;
  returnFarmHousehold: number;
  returnRuralPerson: number;
  year: number;
}

/** 그 해 귀농인 표(DT_1A02002 T02 계)에서 값이 숫자가 아닌(비공개 'X' 등) 지역 코드 */
async function fetchHiddenPersonCodes(apiKey: string, year: number): Promise<Set<string>> {
  const url = new URL("https://kosis.kr/openapi/Param/statisticsParameterData.do");
  const params: Record<string, string> = {
    method: "getList", apiKey, itmId: "T02", objL1: "ALL", objL2: "0", format: "json", jsonVD: "Y",
    prdSe: "Y", startPrdDe: String(year), endPrdDe: String(year), orgId: "101", tblId: "DT_1A02002",
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const json: unknown = await (await fetch(url, { signal: AbortSignal.timeout(30_000) })).json();
      if (!Array.isArray(json)) throw new Error(`응답 오류 ${JSON.stringify(json).slice(0, 120)}`);
      const rows = json as { C1: string; ITM_ID: string; DT: string }[];
      return new Set(rows.filter((r) => r.ITM_ID === "T02" && !/^\d+$/.test(String(r.DT).trim())).map((r) => r.C1));
    } catch (e) {
      last = e;
    }
  }
  throw new Error(`KOSIS 귀농인 ${year} 원표(비공개 판정) 조회 실패 — ${last instanceof Error ? last.message : last}`);
}

async function main() {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) throw new Error("KOSIS_API_KEY missing in .env.local");

  console.log(`[collect-return-farm] sigungu=${SIGUNGUS.length}`);
  const startTime = Date.now();

  // 1) KOSIS 전국 시군구 귀농 통계 1회 호출
  console.log(`[collect-return-farm] fetching KOSIS (regionCode=ALL)…`);
  // 시간 초과·오류는 재시도(2회) 후에도 실패면 던진다 — 전년도로 조용히 내려가지 않는다 (10/16 QA 🟡-1)
  const KOSIS_OPTS = { timeoutMs: 30_000, retries: 2 };
  const kosisData = await fetchReturnFarmStatsStrict(undefined, undefined, KOSIS_OPTS);
  if (kosisData.length === 0) {
    throw new Error(
      "KOSIS returned empty data. Check KOSIS_API_KEY or wait for next year's release (보통 6월).",
    );
  }
  const dataYear = kosisData[0].year;
  // 지금 파일의 최신 연도보다 이전 해가 나오면 멈춘다 — 공표된 해가 사라질 리 없으니 조회 문제다
  const committedYear = Math.max(...RETURN_FARM_RATE_SIGUNGU.map((r) => r.year));
  if (dataYear < committedYear) {
    throw new Error(`KOSIS 응답 연도 ${dataYear} < 지금 파일 ${committedYear} — 조회 문제로 보고 쓰지 않아요`);
  }
  console.log(
    `[collect-return-farm] received ${kosisData.length} regions, year=${dataYear}`,
  );

  // 2) admCode → KOSIS 응답 lookup
  const kosisMap = new Map(
    kosisData.map((d) => [d.regionCode, d]),
  );
  // 최신 연도에 비공개('X')로 빠진 곳(2025 울릉 등)은 전년도 값 — 없으면 순위 계산이 그곳을 도시 자치구로 본다
  const prevMap = new Map(
    (await fetchReturnFarmStatsOfYear(dataYear - 1, undefined, KOSIS_OPTS)).map((d) => [d.regionCode, d]),
  );
  const prevYearUsed: string[] = [];
  // 전년도는 최신 해 원표에 그 코드가 '비공개(X 등 숫자 아님)'로 있을 때만 — 행이 아예 없는 곳(폐지·코드 변경)은
  // 전년도로 내려가지 않는다(10/16 원칙, 10/26 QA 🟡-1). 병합 결과는 X 행을 버려 구분이 안 되므로 원표를 직접 본다
  const hiddenCodes = await fetchHiddenPersonCodes(apiKey, dataYear);
  console.log(`[collect-return-farm] ${dataYear} 귀농인 비공개 코드 ${hiddenCodes.size}곳`);
  const pickRow = (admCode: string) =>
    kosisMap.get(admCode) ?? (hiddenCodes.has(admCode) ? prevMap.get(admCode) : undefined);

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
    const kosisRow = pickRow(sg.admCode);
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

  // 5) 시·군·구·구 화면 귀농·귀촌 카드 — 인구와 무관하게 이름이 맞는 모든 시·군·구 (10/26)
  // 화면이 빌드·재생성 때 KOSIS 를 부르면 시간 초과로 카드가 숨은 채 하루 굳는다(#184, 12쪽).
  // 연 1회 공표 숫자라 수집 때 고정한다(T16). 세 값 중 하나라도 없으면 넣지 않는다(T17 — 0 으로 채우지 않음).
  const cardList: ReturnFarmCardRow[] = [];
  const cardIncomplete: string[] = [];
  for (const sg of SIGUNGUS) {
    const kosisRow = pickRow(sg.admCode);
    if (!kosisRow || !isSameRegionName(kosisRow.regionName, sg.name)) continue;
    // mergeReturnFarmData 는 가구·귀촌 행이 없으면 0 을 남긴다 — 귀농인이 있는데 0 이면 빠진 값이다
    if (kosisRow.returnFarmPerson > 0 && (kosisRow.returnFarmHousehold <= 0 || kosisRow.returnRuralPerson <= 0)) {
      cardIncomplete.push(`${sg.name}(${kosisRow.year})`);
      continue;
    }
    cardList.push({
      admCode: sg.admCode,
      name: sg.name,
      returnFarmPerson: kosisRow.returnFarmPerson,
      returnFarmHousehold: kosisRow.returnFarmHousehold,
      returnRuralPerson: kosisRow.returnRuralPerson,
      year: kosisRow.year,
    });
  }
  // 원천 세 표의 지역 집합은 같다 — 하나라도 빠졌으면 조회가 덜 된 것이니 아무것도 쓰지 않는다(T17·C1, 10/26 QA 🟡-2)
  if (cardIncomplete.length) {
    throw new Error(`귀농인은 있는데 가구·귀촌 값이 없는 곳 ${cardIncomplete.length}곳: ${cardIncomplete.join(", ")} — 쓰지 않아요`);
  }
  // 지금 파일보다 크게 줄면 조회 문제로 보고 아무것도 쓰지 않는다
  if (RETURN_FARM_SIGUNGU.length && cardList.length < RETURN_FARM_SIGUNGU.length * 0.9) {
    throw new Error(`카드 행 ${cardList.length} < 지금 파일 ${RETURN_FARM_SIGUNGU.length}의 90% — 조회 문제로 보고 쓰지 않아요`);
  }
  console.log(`[card] ${cardList.length}곳`);

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

  const cardPath = resolve(__dirname, "../src/lib/data/return-farm-stats.ts");
  const cardBody = `/**
 * 시·군·구 귀농·귀촌 카드 정적 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-return-farm-rate.ts (return-farm-rate.ts 와 같은 KOSIS 조회 1회)
 * 데이터 소스: KOSIS 국가데이터처 귀농어·귀촌인 통계 — DT_1A02002 귀농인(T02)·DT_1A02008 귀농가구(T01)·DT_1A02015 귀촌인(T01), 전부 '계'
 * 통계 연도: ${dataYear}${prevYearUsed.length ? ` (비공개로 빠진 곳은 전년도 값: ${prevYearUsed.join(", ")})` : ""}
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-return-farm-rate.ts\` (data-sources.yml 주간 재수집)
 *
 * 왜 정적인가(2026-10-26 #184): 화면이 빌드·재생성 때 KOSIS 를 부르면 시간 초과로 카드가 숨은 채 하루 굳었다.
 * 연 1회(6월) 공표 숫자라 수집 때 고정한다. 짝은 admCode + 응답 지역명(10/7 코드 15건 밀림), 세 값이 다 있을 때만.
 * 주간 대조(check-region-stats-integrity.ts)가 이 파일을 거치지 않고 원표와 화면을 맞춘다.
 *
 * 수록: ${cardList.length}/${SIGUNGUS.length} 시·군·구 (없는 곳 = 표에 없는 자치구·신설 구 → 카드 없음)
 */

export interface ReturnFarmCardStat {
  /** KOSIS 지역코드 = sigungus.ts admCode */
  admCode: string;
  /** 시·군·구 이름 */
  name: string;
  /** 귀농인 (명) */
  returnFarmPerson: number;
  /** 귀농 가구 (가구) */
  returnFarmHousehold: number;
  /** 귀촌인 (명) */
  returnRuralPerson: number;
  /** 통계 연도 */
  year: number;
}

export const RETURN_FARM_SIGUNGU: ReturnFarmCardStat[] = ${JSON.stringify(cardList, null, 2)};

const BY_ADM = new Map(RETURN_FARM_SIGUNGU.map((r) => [r.admCode, r]));

/** 시·군·구 귀농·귀촌 카드 값 — 코드와 이름이 둘 다 맞을 때만, 없으면 null(카드 숨김) */
export function getReturnFarmStat(admCode: string, name: string): ReturnFarmCardStat | null {
  const r = BY_ADM.get(admCode);
  return r && r.name === name ? r : null;
}
`;

  writeFileSync(filePath, body, "utf-8");
  writeFileSync(cardPath, cardBody, "utf-8");
  console.log(`\n[wrote] ${filePath}`);
  console.log(`[wrote] ${cardPath}`);

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`[total elapsed] ${totalSec}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
