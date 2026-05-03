/**
 * SGIS population.json 5년치 일괄 수집 스크립트.
 *
 * - 17개 시도(sgisCode 2자리) × 5년치 → low_search=1 한 번씩 호출 (총 85회)
 * - 결과를 src/lib/data/population-trend.ts 의 정적 폴백으로 자동 직렬화
 *
 * 실행:
 *   npx tsx scripts/collect-population-trend.ts
 *
 * 환경:
 *   .env.local 의 SGIS_KEY / SGIS_SECRET 사용
 *
 * 데이터 소스:
 *   통계청 SGIS 인구통계 (매년 갱신, 1~2년 지연)
 *
 * ⚠ 빌드 시 SGIS 호출 X — 항상 이 스크립트로 미리 수집한 정적 데이터만 사용한다.
 *   (feedback_static_params_rate_limit.md — 빌드 시 호출 폭증 방지)
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// .env.local 우선 로드 (Next.js 컨벤션)
config({ path: resolve(__dirname, "../.env.local") });
import { PROVINCES } from "../src/lib/data/regions";

const AUTH_URL =
  "https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json";
const POPULATION_URL =
  "https://sgisapi.mods.go.kr/OpenAPI3/stats/population.json";

/** 수집 대상 연도 (5년치). SGIS 인구통계는 1~2년 지연. */
const YEARS = [2018, 2019, 2020, 2021, 2022];

/**
 * 구 분할 시(통합시) 매핑 — sgis.ts 의 GU_CODES_MAP 과 동일.
 * SGIS는 통합시 코드(예: 성남시 31020)를 인식하지 못하므로,
 * 하위 구 코드(31021/31022/31023)를 합산해 통합시 시계열을 만든다.
 */
const GU_CODES_MAP: Record<string, string[]> = {
  "31010": ["31011", "31012", "31013", "31014"], // 수원시
  "31020": ["31021", "31022", "31023"],          // 성남시
  "31040": ["31041", "31042"],                   // 안양시
  "31050": ["31051", "31052", "31053"],          // 부천시
  "31090": ["31091", "31092"],                   // 안산시
  "31100": ["31101", "31103", "31104"],          // 고양시
  "31190": ["31191", "31192", "31193"],          // 용인시
  "33010": ["33041", "33042", "33043", "33044"], // 청주시
  "34010": ["34011", "34012"],                   // 천안시
  "35010": ["35011", "35012"],                   // 전주시
  "37010": ["37011", "37012"],                   // 포항시
  "38010": ["38111", "38112", "38113", "38114", "38115"], // 창원시
};

/** 통합시 이름 (행정구역명에서 첫 단어 사용 — "성남시 수정구" → "성남시") */
const INTEGRATED_CITY_NAMES: Record<string, string> = {
  "31010": "수원시",
  "31020": "성남시",
  "31040": "안양시",
  "31050": "부천시",
  "31090": "안산시",
  "31100": "고양시",
  "31190": "용인시",
  "33010": "청주시",
  "34010": "천안시",
  "35010": "전주시",
  "37010": "포항시",
  "38010": "창원시",
};

interface PopulationApiItem {
  adm_cd: string;
  adm_nm: string;
  tot_ppltn: string;
  tot_family: string;
  oldage_suprt_per?: string;
  juv_suprt_per?: string;
}

async function getToken(): Promise<string> {
  const key = process.env.SGIS_KEY;
  const secret = process.env.SGIS_SECRET;
  if (!key || !secret) throw new Error("SGIS_KEY/SGIS_SECRET missing");

  const url = new URL(AUTH_URL);
  url.searchParams.set("consumer_key", key);
  url.searchParams.set("consumer_secret", secret);

  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.result?.accessToken) {
    throw new Error(`auth failed: ${JSON.stringify(json)}`);
  }
  return json.result.accessToken as string;
}

async function fetchProvinceSubPopulation(
  token: string,
  provinceSgisCode: string,
  year: number,
): Promise<PopulationApiItem[]> {
  const url = new URL(POPULATION_URL);
  url.searchParams.set("accessToken", token);
  url.searchParams.set("adm_cd", provinceSgisCode);
  url.searchParams.set("year", String(year));
  url.searchParams.set("low_search", "1");

  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.errCd !== 0 && json.errCd !== "0") {
    console.warn(
      `[skip] sgis=${provinceSgisCode} year=${year}: ${json.errMsg ?? json.errCd}`,
    );
    return [];
  }
  return (json.result as PopulationApiItem[]) ?? [];
}

function calcAgingRate(item: PopulationApiItem): number {
  // SGIS population.json은 65세 이상 비율을 직접 제공하지 않으므로
  // 부양비로 역산: agingRate = oldage / (100 + oldage + juv) × 100
  const oldageDep = parseFloat(item.oldage_suprt_per || "0");
  const juvDep = parseFloat(item.juv_suprt_per || "0");
  return oldageDep + juvDep > 0
    ? Math.round((oldageDep / (100 + oldageDep + juvDep)) * 1000) / 10
    : 0;
}

interface Point {
  sgisCode: string;
  name: string;
  year: number;
  population: number;
  householdCount: number;
  agingRate: number;
}

async function main() {
  console.log(
    `[collect-population-trend] sido=${PROVINCES.length} × years=[${YEARS.join(",")}]`,
  );
  const token = await getToken();
  console.log(`[collect-population-trend] token ok (len=${token.length})`);

  const all: Point[] = [];

  for (const p of PROVINCES) {
    for (const year of YEARS) {
      const items = await fetchProvinceSubPopulation(token, p.sgisCode, year);
      for (const it of items) {
        all.push({
          sgisCode: it.adm_cd,
          name: it.adm_nm,
          year,
          population: parseInt(it.tot_ppltn, 10) || 0,
          householdCount: parseInt(it.tot_family, 10) || 0,
          agingRate: calcAgingRate(it),
        });
      }
      // SGIS 부담 완화 (rate limit 회피)
      await new Promise((r) => setTimeout(r, 200));
    }
    console.log(
      `[ok] ${p.shortName}(${p.sgisCode}) — ${YEARS.length}년치 수집 완료`,
    );
  }

  console.log(`[collect-population-trend] total points=${all.length}`);

  // ── 통합시 합산 (구 분할 시: 성남/수원 등) ──
  // 시도별로 수집된 구 단위 데이터를 합산해 통합시 시계열을 추가한다.
  const integratedPoints: Point[] = [];
  for (const [cityCode, guCodes] of Object.entries(GU_CODES_MAP)) {
    const guSet = new Set(guCodes);
    for (const year of YEARS) {
      const matched = all.filter(
        (p) => p.year === year && guSet.has(p.sgisCode),
      );
      if (matched.length === 0) continue;
      const totalPop = matched.reduce((s, p) => s + p.population, 0);
      const totalHousehold = matched.reduce(
        (s, p) => s + p.householdCount,
        0,
      );
      const weightedAging = matched.reduce(
        (s, p) => s + p.agingRate * p.population,
        0,
      );
      integratedPoints.push({
        sgisCode: cityCode,
        name: INTEGRATED_CITY_NAMES[cityCode] ?? cityCode,
        year,
        population: totalPop,
        householdCount: totalHousehold,
        agingRate:
          totalPop > 0
            ? Math.round((weightedAging / totalPop) * 10) / 10
            : 0,
      });
    }
  }
  console.log(
    `[collect-population-trend] integrated cities=${integratedPoints.length} points`,
  );

  // ── 시도 합산 (시군구 합산 — 통합시 더하기 전 원본 데이터만 사용) ──
  const sidoTotals = new Map<string, Map<number, Point>>();
  for (const p of PROVINCES) {
    sidoTotals.set(
      p.sgisCode,
      new Map(
        YEARS.map((y) => [
          y,
          {
            sgisCode: p.sgisCode,
            name: p.shortName,
            year: y,
            population: 0,
            householdCount: 0,
            agingRate: 0,
          },
        ]),
      ),
    );
  }
  // 시군구별 인구를 시도 단위로 합산 + 인구 가중 평균 고령화율
  const sidoAgingWeighted: Record<string, Record<number, number>> = {};
  for (const item of all) {
    const sidoCode = item.sgisCode.slice(0, 2);
    const yearMap = sidoTotals.get(sidoCode);
    const t = yearMap?.get(item.year);
    if (!t) continue;
    t.population += item.population;
    t.householdCount += item.householdCount;
    sidoAgingWeighted[sidoCode] ??= {};
    sidoAgingWeighted[sidoCode][item.year] =
      (sidoAgingWeighted[sidoCode][item.year] ?? 0) +
      item.agingRate * item.population;
  }
  const sidoArr: Point[] = [];
  for (const [sidoCode, yearMap] of sidoTotals.entries()) {
    for (const t of yearMap.values()) {
      const weighted = sidoAgingWeighted[sidoCode]?.[t.year] ?? 0;
      t.agingRate = t.population > 0
        ? Math.round((weighted / t.population) * 10) / 10
        : 0;
      sidoArr.push(t);
    }
  }

  // 시도 합산이 끝났으니 통합시 데이터를 시군구 시계열에 합쳐 직렬화한다
  all.push(...integratedPoints);

  // 직렬화
  const filePath = resolve(__dirname, "../src/lib/data/population-trend.ts");
  const body = `/**
 * 인구 추이 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-population-trend.ts
 * 데이터 소스: 통계청 SGIS 인구통계 (1~2년 지연)
 * 수집 연도: ${YEARS.join(", ")}
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-population-trend.ts\`
 *
 * 빌드 안정성을 위해 SGIS API population.json 시계열 호출은 빌드 시점에 하지 않고
 * 이 정적 폴백만 사용한다 (시도×연도 = 85회 호출이 빌드 폭증을 일으킴).
 */

export interface PopulationTrendPoint {
  /** SGIS 코드 (시도 2자리 또는 시군구 5자리) */
  sgisCode: string;
  /** 행정구역명 */
  name: string;
  /** 통계 연도 */
  year: number;
  /** 총 인구 */
  population: number;
  /** 총 세대수 */
  householdCount: number;
  /** 65세 이상 비율 (%) — 부양비 역산 */
  agingRate: number;
}

/** 수집 대상 연도 */
export const POPULATION_TREND_YEARS = ${JSON.stringify(YEARS)} as const;

/** 시군구 인구 시계열 (SGIS 5자리 × 연도) */
export const POPULATION_TREND_SIGUNGU: PopulationTrendPoint[] = ${JSON.stringify(all, null, 2)};

/** 시도 인구 시계열 (SGIS 2자리 × 연도, 시군구 합산) */
export const POPULATION_TREND_SIDO: PopulationTrendPoint[] = ${JSON.stringify(sidoArr, null, 2)};

/**
 * 특정 SGIS 코드의 연도별 시계열을 반환한다.
 * 시군구·시도 모두 지원. 연도 오름차순.
 */
export function getPopulationTrend(
  sgisCode: string,
): PopulationTrendPoint[] {
  const source = sgisCode.length === 2
    ? POPULATION_TREND_SIDO
    : POPULATION_TREND_SIGUNGU;
  return source
    .filter((p) => p.sgisCode === sgisCode)
    .sort((a, b) => a.year - b.year);
}
`;

  writeFileSync(filePath, body, "utf-8");
  console.log(`[collect-population-trend] wrote ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
