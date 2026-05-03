/**
 * SGIS farmhousehold.json 일괄 수집 스크립트.
 *
 * - 17개 시/도(sgisCode 2자리)에 대해 low_search=1로 시군구 농가 데이터 일괄 조회
 * - 결과를 src/lib/data/farms.ts 의 FARM_FALLBACK 으로 자동 직렬화
 *
 * 실행:
 *   npx tsx scripts/collect-farms.ts
 *
 * 환경:
 *   .env.local 의 SGIS_KEY / SGIS_SECRET 사용
 *
 * 데이터 소스:
 *   통계청 SGIS 농림어업총조사 (5년 주기, 최신: 2020)
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// .env.local 우선 로드 (Next.js 컨벤션)
config({ path: resolve(__dirname, "../.env.local") });
import { PROVINCES } from "../src/lib/data/regions";

const AUTH_URL =
  "https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json";
const FARM_URL =
  "https://sgisapi.mods.go.kr/OpenAPI3/stats/farmhousehold.json";
const YEAR = 2020; // 5년 주기, 다음 갱신 ~2026 발표 예정

interface FarmApiItem {
  adm_cd: string;
  adm_nm: string;
  farm_cnt: string;
  population: string;
  avg_population: string;
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

async function fetchProvinceSubFarms(
  token: string,
  provinceSgisCode: string,
): Promise<FarmApiItem[]> {
  const url = new URL(FARM_URL);
  url.searchParams.set("accessToken", token);
  url.searchParams.set("year", String(YEAR));
  url.searchParams.set("adm_cd", provinceSgisCode);
  url.searchParams.set("low_search", "1");

  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.errCd !== 0 && json.errCd !== "0") {
    console.warn(
      `[skip] sgis=${provinceSgisCode}: ${json.errMsg ?? json.errCd}`,
    );
    return [];
  }
  return (json.result as FarmApiItem[]) ?? [];
}

async function main() {
  console.log(`[collect-farms] year=${YEAR}, sido=${PROVINCES.length}`);
  const token = await getToken();
  console.log(`[collect-farms] token ok (len=${token.length})`);

  const all: Array<{
    sgisCode: string;
    name: string;
    farmCount: number;
    farmPopulation: number;
    avgPopulation: number;
  }> = [];

  for (const p of PROVINCES) {
    const items = await fetchProvinceSubFarms(token, p.sgisCode);
    for (const it of items) {
      all.push({
        sgisCode: it.adm_cd,
        name: it.adm_nm,
        farmCount: parseInt(it.farm_cnt, 10) || 0,
        farmPopulation: parseInt(it.population, 10) || 0,
        avgPopulation: parseFloat(it.avg_population) || 0,
      });
    }
    console.log(
      `[ok] ${p.shortName}(${p.sgisCode}) → ${items.length}개 시군구`,
    );
    // SGIS 부담 완화 (rate limit 회피)
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`[collect-farms] total=${all.length}`);

  // 시도 합산도 함께 — 시도 페이지에서 사용
  const sidoTotals = new Map<
    string,
    { sgisCode: string; name: string; farmCount: number; farmPopulation: number }
  >();
  for (const p of PROVINCES) {
    sidoTotals.set(p.sgisCode, {
      sgisCode: p.sgisCode,
      name: p.shortName,
      farmCount: 0,
      farmPopulation: 0,
    });
  }
  for (const item of all) {
    const sidoCode = item.sgisCode.slice(0, 2);
    const t = sidoTotals.get(sidoCode);
    if (t) {
      t.farmCount += item.farmCount;
      t.farmPopulation += item.farmPopulation;
    }
  }

  const sidoArr = Array.from(sidoTotals.values()).map((t) => ({
    ...t,
    avgPopulation:
      t.farmCount > 0
        ? Math.round((t.farmPopulation / t.farmCount) * 10) / 10
        : 0,
  }));

  // 직렬화: src/lib/data/farms.ts
  const filePath = resolve(__dirname, "../src/lib/data/farms.ts");
  const body = `/**
 * 농가 통계 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-farms.ts
 * 데이터 소스: 통계청 SGIS 농림어업총조사 ${YEAR}년 (5년 주기)
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-farms.ts\`
 *
 * 빌드 안정성을 위해 SGIS API farmhousehold.json은 빌드 시점에 호출하지 않고
 * 이 정적 폴백만 사용한다. 시군구 단건 호출은 ISR on-demand에서만.
 */

export interface FarmStat {
  /** SGIS 코드 (시도 2자리 또는 시군구 5자리) */
  sgisCode: string;
  /** 행정구역명 */
  name: string;
  /** 농가 수 (가구) */
  farmCount: number;
  /** 농가 인구 (명) */
  farmPopulation: number;
  /** 가구당 평균 농가 인구 (명) — population/farm_cnt */
  avgPopulation: number;
}

/** 시군구 농가 통계 (SGIS 5자리) */
export const FARM_FALLBACK_SIGUNGU: FarmStat[] = ${JSON.stringify(all, null, 2)};

/** 시도 합산 농가 통계 (SGIS 2자리) */
export const FARM_FALLBACK_SIDO: FarmStat[] = ${JSON.stringify(sidoArr, null, 2)};

/** 시군구 sgisCode → FarmStat 빠른 조회 */
const SIGUNGU_INDEX = new Map(FARM_FALLBACK_SIGUNGU.map((f) => [f.sgisCode, f]));

/** 시도 sgisCode → FarmStat 빠른 조회 */
const SIDO_INDEX = new Map(FARM_FALLBACK_SIDO.map((f) => [f.sgisCode, f]));

export function getFarmFallback(sgisCode: string): FarmStat | null {
  return SIGUNGU_INDEX.get(sgisCode) ?? SIDO_INDEX.get(sgisCode) ?? null;
}

/** 특정 시도(2자리) 하위 시군구 농가 통계 일괄 조회 */
export function getFarmsBySido(sidoSgisCode: string): FarmStat[] {
  return FARM_FALLBACK_SIGUNGU.filter((f) =>
    f.sgisCode.startsWith(sidoSgisCode),
  );
}
`;

  writeFileSync(filePath, body, "utf-8");
  console.log(`[collect-farms] wrote ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
