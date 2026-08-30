/**
 * HIRA(심평원) 사전 예열 목록 생성 — workers/datagokr-proxy/src/hira-warm-list.json
 *
 * 배경(2026-08-30): HIRA 시군구 1건 조회가 콜드 7~13초라 /regions/compare 인프라 탭이 15~29초.
 * Worker KV 전역 캐시를 매일 cron으로 예열하려면 앱이 실제로 호출하는 (sidoCd, sgguCd) 조합이 필요하다.
 * hira.ts의 호출 조립(시도 = sidoCd만 / 시군구 = sidoCd+sgguCd / 구 분할 시 = GU_HIRA_CODES_MAP 전개)과 1:1.
 *
 * 사용: npx tsx scripts/gen-hira-warm-list.ts   (stations·sigungus·gus 변경 시 재생성 후 Worker 재배포)
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { STATIONS } from "../src/lib/data/stations";
import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { GUS } from "../src/lib/data/gus";
import { GU_HIRA_CODES_MAP } from "../src/lib/api/hira";

// 시군구·구는 소속 시도의 대표 관측소(PROVINCES.representativeStationId → STATIONS.stnId)로 hiraSidoCd를 얻는다 (region-item.ts와 동일)
const sidoOf = new Map(
  PROVINCES.map((p) => [p.id, STATIONS.find((st) => st.stnId === p.representativeStationId)?.hiraSidoCd] as const),
);
const entries = new Map<string, { sidoCd: string; sgguCd?: string }>();

// 시도 단위 (fetchMedicalFacilities → fetchSidoMedicalCount)
for (const s of STATIONS) entries.set(s.hiraSidoCd, { sidoCd: s.hiraSidoCd });

// 시군구 단위 (fetchSigunguMedicalFacilities → GU 전개 또는 단일)
for (const sg of SIGUNGUS) {
  const sidoCd = sidoOf.get(sg.sidoId);
  if (!sidoCd) continue;
  const codes = GU_HIRA_CODES_MAP[sg.hiraSgguCd] ?? [sg.hiraSgguCd];
  for (const c of codes) entries.set(`${sidoCd}:${c}`, { sidoCd, sgguCd: c });
}
// 구 단위 페이지 (gu-data.tsx)
for (const g of GUS) {
  const sidoCd = sidoOf.get(g.sidoId);
  if (!sidoCd) continue;
  entries.set(`${sidoCd}:${g.hiraSgguCd}`, { sidoCd, sgguCd: g.hiraSgguCd });
}

const list = [...entries.values()];
const out = resolve(__dirname, "../workers/datagokr-proxy/src/hira-warm-list.json");
writeFileSync(out, JSON.stringify(list, null, 0) + "\n");
console.log(`hira warm list: ${list.length}건 (시도 ${STATIONS.length} · 시군구/구 ${list.length - new Set(STATIONS.map((s) => s.hiraSidoCd)).size}) → ${out}`);
