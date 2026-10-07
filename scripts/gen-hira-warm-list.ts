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
import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { GUS } from "../src/lib/data/gus";
import { hiraCountRequests } from "../src/lib/api/hira";

// 시·도 코드는 PROVINCES(상세·비교 화면이 쓰는 SSOT) — 10/7 이전엔 관측소 표 코드를 써 대구가 인천 코드(220000)였다
const sidoOf = new Map(PROVINCES.map((p) => [p.id, p.hiraSidoCd] as const));
const entries = new Map<string, { sidoCd: string; sgguCd?: string }>();
// 앱이 심평원에 실제로 보내는 묶음 그대로(광주·전남·세종 코드 변환, 구 전개) — hira.ts hiraCountRequests 하나로 (10/7)
const add = (reqs: { sidoCd: string; sgguCd?: string }[]) => {
  for (const r of reqs) entries.set(r.sgguCd ? `${r.sidoCd}:${r.sgguCd}` : r.sidoCd, r);
};

// 시도 단위 (fetchMedicalFacilities → fetchSidoMedicalCount)
for (const p of PROVINCES) add(hiraCountRequests(p.hiraSidoCd));

// 시군구 단위 (fetchSigunguMedicalFacilities → GU 전개 또는 단일)
for (const sg of SIGUNGUS) {
  const sidoCd = sidoOf.get(sg.sidoId);
  if (sidoCd) add(hiraCountRequests(sidoCd, sg.hiraSgguCd));
}
// 구 단위 페이지 (gu-data.tsx → fetchGuMedicalFacilities, 구 코드 하나)
for (const g of GUS) {
  const sidoCd = sidoOf.get(g.sidoId);
  if (sidoCd) add(hiraCountRequests(sidoCd, g.hiraSgguCd, { single: true }));
}

const list = [...entries.values()];
const out = resolve(__dirname, "../workers/datagokr-proxy/src/hira-warm-list.json");
writeFileSync(out, JSON.stringify(list, null, 0) + "\n");
console.log(`hira warm list: ${list.length}건 (시도 ${PROVINCES.length}) → ${out}`);
