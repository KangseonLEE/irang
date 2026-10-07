/**
 * 지역 면적 갱신 — 국토교통부 지적통계 「행정구역별·지목별 국토이용현황_시군구」(KOSIS 116/DT_MLTM_2300) (2026-10-07)
 *
 * 시·도(regions.ts PROVINCES)·시·군·구(sigungus.ts)·시 아래 구(gus.ts)의 `area`(㎢, 소수 둘째 자리)를 한 출처·한 해로 맞춘다.
 * 10/7 전엔 해마다 다른 옛 값이 섞여 있었고 틀린 값도 많았다 — 청주 상당구 276 → 404㎢, 천안 동남·서북구, 포항 남·북구,
 * 창원 진해·마산합포, 전주 완산·덕진, 안양 만안·동안이 크게 어긋났고, 대구는 군위 편입(2023)이 빠진 883㎢(실제 1,499.68),
 * 시·군·구 230곳 중 74곳이 0.5㎢ 넘게 달랐다(양구 −39, 보령 +18, 연천 −17).
 *
 * 그 해 통계에 아직 없는 단위는 지금 값을 그대로 둔다(아래 NOT_YET 사유) — 그 밖에 하나라도 못 찾으면 아무것도 쓰지 않고 멈춘다.
 * 지적공부에 등록된 면적이라 지자체 누리집의 '간척지 포함' 면적과 다를 수 있다(화성은 둘 다 706.50).
 *
 * 실행(.env.local 의 KOSIS_API_KEY): npx tsx scripts/collect-areas.ts [연도 — 없으면 공표된 최신 연도]
 * 새 해 통계가 나오면(보통 이듬해 상반기) 다시 실행 — 주간 정합성 대조(check-region-stats-integrity)가 차이를 알린다.
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { GUS } from "../src/lib/data/gus";
import { AREA_NOT_YET_IN_CADASTRE, fetchCadastreAreas, matchCadastreArea } from "../src/lib/data/cadastre-area";

async function main() {
  const key = process.env.KOSIS_API_KEY;
  if (!key) throw new Error("KOSIS_API_KEY 없음 (.env.local)");
  const { year, rows } = await fetchCadastreAreas(key, process.argv[2]);
  console.log(`[collect-areas] 지적통계 ${year}년 ${rows.length}행`);

  const missing: string[] = [];
  const updates = { regions: new Map<string, number>(), sigungus: new Map<string, number>(), gus: new Map<string, number>() };
  for (const p of PROVINCES) {
    const v = matchCadastreArea(rows, { kind: "sido", sido: p });
    if (v === null) missing.push(`시·도 ${p.name}`);
    else updates.regions.set(p.id, v);
  }
  for (const sg of SIGUNGUS) {
    if (AREA_NOT_YET_IN_CADASTRE[sg.id]) continue;
    const p = PROVINCES.find((x) => x.id === sg.sidoId)!;
    const v = matchCadastreArea(rows, { kind: "sigungu", sido: p, name: sg.name });
    if (v === null) missing.push(`시·군·구 ${p.shortName} ${sg.name}`);
    else updates.sigungus.set(sg.id, v);
  }
  for (const g of GUS) {
    if (AREA_NOT_YET_IN_CADASTRE[g.id]) continue;
    const p = PROVINCES.find((x) => x.id === g.sidoId)!;
    const city = SIGUNGUS.find((s) => s.id === g.parentSigunguId)!;
    const v = matchCadastreArea(rows, { kind: "sigungu", sido: p, name: `${city.name}${g.name}` });
    if (v === null) missing.push(`구 ${city.name} ${g.name}`);
    else updates.gus.set(g.id, v);
  }
  if (missing.length) throw new Error(`지적통계 ${year}년에 없는 단위 ${missing.length}곳 — 아무것도 쓰지 않음: ${missing.join(", ")}`);

  // 파일 고치기 — 한 줄짜리 항목(시·군·구·구)은 그 id 줄의 area 를, 여러 줄 항목(시·도)은 id 다음 첫 area 를
  const patchLine = (file: string, map: Map<string, number>) => {
    const path = resolve(__dirname, "..", file);
    const lines = readFileSync(path, "utf8").split("\n");
    let changed = 0;
    for (const [id, v] of map) {
      const i = lines.findIndex((l) => l.includes(`id: "${id}"`));
      if (i < 0) throw new Error(`${file}: id ${id} 줄 없음`);
      const before = lines[i];
      lines[i] = before.replace(/area: [0-9.]+/, `area: ${v}`);
      if (lines[i] === before && !before.includes(`area: ${v}`)) throw new Error(`${file}: ${id} 줄에 area 없음`);
      if (lines[i] !== before) changed++;
    }
    writeFileSync(path, lines.join("\n"));
    return changed;
  };
  const patchBlock = (file: string, map: Map<string, number>) => {
    const path = resolve(__dirname, "..", file);
    const lines = readFileSync(path, "utf8").split("\n");
    let changed = 0;
    for (const [id, v] of map) {
      const i = lines.findIndex((l) => l.trim() === `id: "${id}",`);
      if (i < 0) throw new Error(`${file}: id ${id} 없음`);
      const j = lines.findIndex((l, k) => k > i && /^\s*area: [0-9.]+,/.test(l));
      if (j < 0 || j - i > 8) throw new Error(`${file}: ${id} 의 area 줄 없음`);
      const next = lines[j].replace(/area: [0-9.]+/, `area: ${v}`);
      if (next !== lines[j]) changed++;
      lines[j] = next;
    }
    writeFileSync(path, lines.join("\n"));
    return changed;
  };
  const c1 = patchBlock("src/lib/data/regions.ts", updates.regions);
  const c2 = patchLine("src/lib/data/sigungus.ts", updates.sigungus);
  const c3 = patchLine("src/lib/data/gus.ts", updates.gus);
  console.log(`[collect-areas] 바뀐 값 — 시·도 ${c1}/${updates.regions.size} · 시·군·구 ${c2}/${updates.sigungus.size} · 구 ${c3}/${updates.gus.size}`);
  console.log(`[collect-areas] 그대로 둔 단위: ${Object.keys(AREA_NOT_YET_IN_CADASTRE).join(", ")}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
