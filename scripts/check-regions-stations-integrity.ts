#!/usr/bin/env npx tsx
/* ==========================================================================
   regions.ts ↔ stations.ts 양방향 무결성 검증

   5/12 세종/울산 누락 사고 재발 방지. province.representativeStationId 가
   STATIONS 에 없으면 buildRegionItem null → 모든 view 에서 region 통째 사라짐.

   검증 항목:
   1. PROVINCES.representativeStationId ⊆ STATIONS.stnIds (필수)
   2. DEFAULT_STATION_IDS ⊆ STATIONS.stnIds (필수)
   3. STATIONS.stnId 중복 0건 (필수)
   4. PROVINCES.id 중복 0건 (필수)
   5. orphan stations 보고 (warning) — 어느 province 도 참조 안 하는 station

   exit code: 모든 필수 통과 0 / 하나라도 fail 1
   ========================================================================== */

import { PROVINCES } from "../src/lib/data/regions";
import { STATIONS, DEFAULT_STATION_IDS } from "../src/lib/data/stations";

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

function check(): CheckResult[] {
  const results: CheckResult[] = [];

  const stationIds = new Set(STATIONS.map((s) => s.stnId));
  const provinceIds = new Set(PROVINCES.map((p) => p.id));
  const referencedStationIds = new Set(
    PROVINCES.map((p) => p.representativeStationId),
  );

  // 1. PROVINCES.representativeStationId ⊆ STATIONS.stnIds
  const missingStations = PROVINCES.filter(
    (p) => !stationIds.has(p.representativeStationId),
  );
  results.push({
    name: "PROVINCES.representativeStationId ⊆ STATIONS.stnIds",
    passed: missingStations.length === 0,
    detail:
      missingStations.length === 0
        ? `${PROVINCES.length}/${PROVINCES.length} province → 대응 station 존재`
        : `누락 ${missingStations.length}건: ${missingStations
            .map((p) => `${p.id}(refId=${p.representativeStationId})`)
            .join(", ")}`,
  });

  // 2. DEFAULT_STATION_IDS ⊆ STATIONS.stnIds
  const missingDefaults = DEFAULT_STATION_IDS.filter(
    (id) => !stationIds.has(id),
  );
  results.push({
    name: "DEFAULT_STATION_IDS ⊆ STATIONS.stnIds",
    passed: missingDefaults.length === 0,
    detail:
      missingDefaults.length === 0
        ? `${DEFAULT_STATION_IDS.length}/${DEFAULT_STATION_IDS.length} default → STATIONS 존재`
        : `누락 ${missingDefaults.length}건: ${missingDefaults.join(", ")}`,
  });

  // 3. STATIONS.stnId 중복
  const stnIdCounts = new Map<string, number>();
  for (const s of STATIONS) {
    stnIdCounts.set(s.stnId, (stnIdCounts.get(s.stnId) ?? 0) + 1);
  }
  const dupStationIds = Array.from(stnIdCounts.entries()).filter(
    ([, n]) => n > 1,
  );
  results.push({
    name: "STATIONS.stnId 중복 0건",
    passed: dupStationIds.length === 0,
    detail:
      dupStationIds.length === 0
        ? `${STATIONS.length}개 station 모두 unique`
        : `중복: ${dupStationIds.map(([id, n]) => `${id}×${n}`).join(", ")}`,
  });

  // 4. PROVINCES.id 중복
  const provinceIdCounts = new Map<string, number>();
  for (const p of PROVINCES) {
    provinceIdCounts.set(p.id, (provinceIdCounts.get(p.id) ?? 0) + 1);
  }
  const dupProvinceIds = Array.from(provinceIdCounts.entries()).filter(
    ([, n]) => n > 1,
  );
  results.push({
    name: "PROVINCES.id 중복 0건",
    passed: dupProvinceIds.length === 0,
    detail:
      dupProvinceIds.length === 0
        ? `${PROVINCES.length}개 province 모두 unique`
        : `중복: ${dupProvinceIds.map(([id, n]) => `${id}×${n}`).join(", ")}`,
  });

  // 5. orphan stations (warning — fail 아님)
  const orphans = STATIONS.filter((s) => !referencedStationIds.has(s.stnId));
  results.push({
    name: "(warning) orphan stations",
    passed: true,
    detail:
      orphans.length === 0
        ? "모든 station 이 province 에 참조됨"
        : `orphan ${orphans.length}건 (sub-station OK): ${orphans
            .map((s) => `${s.stnId}(${s.name})`)
            .join(", ")}`,
  });

  void provinceIds;
  return results;
}

function main(): void {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  🔍 regions.ts ↔ stations.ts 무결성 검증                ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const results = check();
  const required = results.filter((r) => !r.name.startsWith("(warning)"));
  const failedRequired = required.filter((r) => !r.passed);

  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`${icon} ${r.name}`);
    console.log(`   ${r.detail}\n`);
  }

  console.log("══════════════════════════════════════════════════════════");
  if (failedRequired.length === 0) {
    console.log("✅ 모든 필수 검증 통과");
    process.exit(0);
  } else {
    console.log(
      `❌ 필수 검증 ${failedRequired.length}건 실패 — buildRegionItem null 위험`,
    );
    console.log("   src/lib/data/regions.ts·stations.ts 양방향 sync 필요");
    process.exit(1);
  }
}

main();
