/**
 * '활발한 지역' 귀농·귀촌 탭 — KOSIS 귀농어·귀촌인 통계 시·군·구 상위 5 (2026-10-10).
 *
 * 왜: active-regions.ts 의 귀농 "147가구"·귀촌 "12,840가구" 등 10개 수치가 2023 이라고만 적혀 원천 대조가 안 됐고,
 *   2025 KOSIS 귀농인(의성 138·상주 125·괴산 87·고흥 153·영암 103명)과 단위·순위가 모두 달랐다.
 *
 * 원천: 국가데이터처 KOSIS orgId 101 — DT_1A02002 귀농인(itmId T02, 성별 계), DT_1A02015 귀촌인(T01, 계).
 *   lib/api/kosis.ts fetchReturnFarmStats() 를 그대로 쓴다(화면 귀농·귀촌 카드와 같은 경로·같은 연도 규칙).
 * 짝: SIGUNGUS.admCode ↔ KOSIS C1, 응답 지역명이 우리 이름과 같을 때만(isSameRegionName — 10/7 admCode 15건 밀림).
 *   이름이 다르거나 행이 없으면 순위에 넣지 않는다. 결과 상위 5 중 하나라도 짝 검사를 못 거치면 멈춘다(구조상 불가).
 *
 * 실행: npx tsx scripts/collect-active-regions-stats.ts   (.env.local 의 KOSIS_API_KEY, 키 값은 출력하지 않는다)
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local"), quiet: true });
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { fetchReturnFarmStats, isSameRegionName } from "../src/lib/api/kosis";

const TOP_N = 5;

async function main() {
  const rows = await fetchReturnFarmStats();
  if (rows.length === 0) throw new Error("KOSIS 귀농·귀촌 응답 없음 — 키 또는 공표 시점 확인");
  const year = rows[0].year;
  if (rows.some((r) => r.year !== year)) throw new Error("응답 연도가 섞였어요");
  const byCode = new Map(rows.map((r) => [r.regionCode, r]));

  const matched: { sigunguId: string; name: string; farm: number; rural: number }[] = [];
  const skipped: string[] = [];
  for (const sg of SIGUNGUS) {
    const r = byCode.get(sg.admCode);
    if (!r) continue; // 자치구 등 표에 없는 단위
    if (!isSameRegionName(r.regionName, sg.name)) {
      skipped.push(`${sg.name}(${sg.admCode}→${r.regionName})`);
      continue;
    }
    matched.push({ sigunguId: sg.id, name: sg.name, farm: r.returnFarmPerson, rural: r.returnRuralPerson });
  }
  if (matched.length < 100) throw new Error(`짝 맞은 시·군·구가 ${matched.length}곳뿐 — 응답 형식 확인`);
  const top = (key: "farm" | "rural") =>
    matched
      .filter((m) => m[key] > 0)
      .sort((a, b) => b[key] - a[key] || a.sigunguId.localeCompare(b.sigunguId))
      .slice(0, TOP_N)
      // 같은 수면 같은 순위(2025 신안·의성 138명)
      .map((m) => ({ sigunguId: m.sigunguId, count: m[key], rank: 1 + matched.filter((x) => x[key] > m[key]).length }));
  const farmTop = top("farm");
  const ruralTop = top("rural");
  if (farmTop.length < TOP_N || ruralTop.length < TOP_N) throw new Error("상위 5를 채우지 못했어요");

  console.log(`${year} 귀농인 상위: ${farmTop.map((t) => `${t.sigunguId} ${t.count}`).join(", ")}`);
  console.log(`${year} 귀촌인 상위: ${ruralTop.map((t) => `${t.sigunguId} ${t.count}`).join(", ")}`);
  if (skipped.length) console.log(`이름이 달라 뺀 곳 ${skipped.length}: ${skipped.join(", ")}`);

  const body = `/**
 * '활발한 지역' 귀농·귀촌 상위 5 — KOSIS 귀농어·귀촌인 통계 ${year} (scripts/collect-active-regions-stats.ts 가 생성, 손으로 고치지 않는다)
 *
 * 귀농인: DT_1A02002(T02) · 귀촌인: DT_1A02015(T01). 응답 지역명이 우리 시·군·구 이름과 같은 행만 썼다.
 * 수집일: ${new Date().toISOString().slice(0, 10)} · 다음 공표: 매년 6월 말(전년 통계)
 */

export interface ActiveRegionStat {
  sigunguId: string;
  /** 사람 수 (명) */
  count: number;
  /** 전국 시·군 순위 (같은 수면 같은 순위) */
  rank: number;
}

export const ACTIVE_RETURN_YEAR = ${year};

/** 귀농인 많은 시·군 상위 ${TOP_N} */
export const RETURN_FARM_TOP: ActiveRegionStat[] = ${JSON.stringify(farmTop, null, 2)};

/** 귀촌인 많은 시·군 상위 ${TOP_N} */
export const RETURN_RURAL_TOP: ActiveRegionStat[] = ${JSON.stringify(ruralTop, null, 2)};
`;
  writeFileSync(resolve(__dirname, "../src/lib/data/active-regions-stats.ts"), body);
  console.log("→ src/lib/data/active-regions-stats.ts");
}

main().catch((e) => { console.error(e); process.exit(1); });
