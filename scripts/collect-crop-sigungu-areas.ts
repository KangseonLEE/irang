/**
 * 작물 상세 '주요 산지 (시·군·구)' 칩 순서 — 2025 농림어업총조사 시·군·구 재배면적 (2026-10-10).
 *
 * 왜: 칩이 SIGUNGUS.mainCrops 에 그 작물이 든 곳을 목록 순서대로 잘라 보여 줘, 쌀 상세가 목포·여수·순천으로 시작했다.
 * 이제 작물마다 총조사 재배면적이 큰 시·군·구 순(crop-sigungu-tables.ts 의 항목을 더한 값)으로 고정한다.
 *
 * 짝 맞추기(collect-farms 와 같은 방식): 우리 SIGUNGUS ↔ KOSIS 5자리 행을 시·도 코드 앞자리 안에서 **이름**으로 맞춘다.
 *   통합시(수원시 등)는 시 행을 그대로 쓴다. 행정동 묶음 신설 구(인천 2026)는 2025 표에 없어 건너뛴다.
 * 가드 — 하나라도 어긋나면 아무것도 쓰지 않는다:
 *   - 응답 항목 이름이 지정한 이름과 같고 단위가 작물 안에서 한 가지
 *   - 우리 시·군·구가 원천 행과 하나씩 짝지어진다
 *   - 원천 안에서 시·도 = 그 아래 최상위 시·군·구 합(행마다 정수 반올림 몫 + 0.5%) — 항목을 잘못 읽으면 여기서 어긋난다
 *
 * 실행: npx tsx scripts/collect-crop-sigungu-areas.ts   (.env.local 의 KOSIS_API_KEY, 키 값은 출력하지 않는다)
 */

import { config } from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local"), quiet: true });
import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { CROPS } from "../src/lib/data/crops";
import { getSgisComposite } from "../src/lib/data/region-composites";
import { CROP_SIGUNGU_TABLES } from "../src/lib/data/crop-sigungu-tables";
import { judgeResidenceSkew, RICE_SKEW_MAX, ALL_SKEW_MAX, LAND_TABLE, type SkewJudgment } from "./lib/residence-skew";

const YEAR = 2025;
const TOP_N = 10;
const KOSIS_URL = "https://kosis.kr/openapi/Param/statisticsParameterData.do";

interface KosisRow {
  C1: string;
  C1_NM: string;
  ITM_ID: string;
  ITM_NM: string;
  UNIT_NM: string;
  DT: string;
}

const cache = new Map<string, KosisRow[]>();
/** KOSIS_RAW_CACHE=<json> 이 있으면 그 파일(표/항목 → 응답 배열)을 먼저 읽는다 — collect-sigungu-main-crops 와 같은 형식 */
const rawCache: Record<string, KosisRow[]> = process.env.KOSIS_RAW_CACHE && existsSync(process.env.KOSIS_RAW_CACHE)
  ? JSON.parse(readFileSync(process.env.KOSIS_RAW_CACHE, "utf8"))
  : {};
async function fetchItem(tblId: string, itmId: string): Promise<KosisRow[]> {
  const ck = `${tblId}/${itmId}`;
  const hit = cache.get(ck) ?? rawCache[ck];
  if (hit) return hit;
  const key = (process.env.KOSIS_API_KEY ?? "").trim();
  if (!key) throw new Error("KOSIS_API_KEY 없음");
  const url = new URL(KOSIS_URL);
  for (const [k, v] of Object.entries({
    method: "getList", apiKey: key, itmId, objL1: "ALL", objL2: "000", format: "json", jsonVD: "Y",
    prdSe: "F", startPrdDe: String(YEAR), endPrdDe: String(YEAR), orgId: "101", tblId,
  })) url.searchParams.set(k, v);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const json = (await res.json()) as KosisRow[] | { err?: string; errMsg?: string };
      if (!Array.isArray(json)) throw new Error(`KOSIS ${ck}: ${JSON.stringify(json).slice(0, 100)}`);
      cache.set(ck, json);
      return json;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

const num = (dt: string) => (dt === "-" || dt === "X" ? 0 : Number(dt));

async function main() {
  const cropIds = new Set(CROPS.map((c) => c.id));
  const provinceById = new Map(PROVINCES.map((p) => [p.id, p]));
  const problems: string[] = [];
  const skewNotes: string[] = [];
  const out: Record<string, {
    items: string[];
    unit: string;
    totalArea: number;
    provinces: { provinceId: string; area: number }[];
    top: { sigunguId: string; area: number }[];
  }> = {};

  // ── 주소지 쏠림 판정(시·군·구 단위) — 37개 작물 합·벼를 최상위 시·군·구마다 모아 실제 경지면적과 견준다 ──
  const census = new Map<string, { name: string; rice: number; all: number }>();
  for (const [cropId, items] of Object.entries(CROP_SIGUNGU_TABLES)) {
    for (const it of items) {
      for (const r of await fetchItem(it.tblId, it.itmId)) {
        if (r.C1.length !== 5 || /^\d{2}00[345]$/.test(r.C1)) continue;
        const u = census.get(r.C1) ?? { name: r.C1_NM, rice: 0, all: 0 };
        const v = num(r.DT);
        if (Number.isFinite(v)) { u.all += v; if (cropId === "rice") u.rice += v; }
        census.set(r.C1, u);
      }
    }
  }
  const censusCodes = [...census.keys()];
  const cityCodes = new Set(censusCodes.filter((c) => c.endsWith("0") && censusCodes.some((g) => g !== c && g.slice(0, 4) === c.slice(0, 4))));
  const censusTop = new Map([...census].filter(([c]) => cityCodes.has(c) || ![...cityCodes].some((x) => x !== c && x.slice(0, 4) === c.slice(0, 4))));
  const skew = await judgeResidenceSkew(censusTop, rawCache as Record<string, unknown[]>);
  problems.push(...skew.problems);
  for (const l of skew.lines) console.log(l);
  /** 우리 시·군·구 id → 판정 */
  const skewBySigungu = new Map<string, SkewJudgment>();
  const skewOut: Record<string, { rice: boolean; all: boolean }> = {};

  for (const [cropId, items] of Object.entries(CROP_SIGUNGU_TABLES)) {
    if (!cropIds.has(cropId)) { problems.push(`${cropId}: CROPS 에 없는 작물`); continue; }
    const byCode = new Map<string, { name: string; area: number }>();
    const units = new Set<string>();
    let itemOk = true;
    for (const it of items) {
      const rows = await fetchItem(it.tblId, it.itmId);
      for (const r of rows) {
        if (r.ITM_NM !== it.itemName) { problems.push(`${cropId}: ${it.tblId} ${it.itmId} 항목 ${r.ITM_NM} ≠ ${it.itemName}`); itemOk = false; break; }
        units.add(r.UNIT_NM);
        const v = num(r.DT);
        if (!Number.isFinite(v)) { problems.push(`${cropId}: ${r.C1_NM} 값 ${r.DT}`); itemOk = false; break; }
        const cur = byCode.get(r.C1) ?? { name: r.C1_NM, area: 0 };
        cur.area += v;
        byCode.set(r.C1, cur);
      }
    }
    if (!itemOk) continue;
    if (units.size !== 1) { problems.push(`${cropId}: 단위 여럿 ${[...units].join(",")}`); continue; }

    // 원천 안 가드: 시·도 = 최상위 시·군·구 합 (통합시는 시 행만 센다)
    const codes = [...byCode.keys()];
    for (const p of PROVINCES) {
      const sido = byCode.get(p.sgisCode);
      if (!sido) { problems.push(`${cropId}: 시·도 행 없음 ${p.name}`); continue; }
      const subs = codes.filter((c) => c.length === 5 && c.startsWith(p.sgisCode) && !/^\d{2}00[345]$/.test(c));
      const cities = new Set(subs.filter((c) => c.endsWith("0") && subs.some((g) => g !== c && g.slice(0, 4) === c.slice(0, 4))));
      const top = subs.filter((c) => cities.has(c) || ![...cities].some((x) => x !== c && x.slice(0, 4) === c.slice(0, 4)));
      const sum = top.reduce((a, c) => a + byCode.get(c)!.area, 0);
      // 원천 값은 행마다 ha 정수 반올림이라 합에 행 수 × 0.5 까지 차이가 난다
      if (Math.abs(sum - sido.area) > top.length * 0.5 + sido.area * 0.005) {
        problems.push(`${cropId}: 원천 ${p.name} ${sido.area} ≠ 시·군·구 합 ${sum.toFixed(1)}`);
      }
    }

    // 시·도 행(원천 2자리 코드) — 주산지(majorRegions) 근거. 전국 행이 있으면 시·도 합 = 전국도 본다
    const provinces = PROVINCES.map((p) => ({ provinceId: p.id, area: Math.round((byCode.get(p.sgisCode)?.area ?? 0) * 10) / 10 }))
      .sort((a, b) => b.area - a.area);
    const totalArea = Math.round(provinces.reduce((a, p) => a + p.area, 0) * 10) / 10;
    const nation = byCode.get("00");
    if (nation && Math.abs(nation.area - totalArea) > PROVINCES.length * 0.5 + nation.area * 0.005) {
      problems.push(`${cropId}: 원천 전국 ${nation.area} ≠ 시·도 합 ${totalArea}`);
    }
    if (totalArea <= 0) problems.push(`${cropId}: 시·도 합 0`);

    // 우리 시·군·구 ↔ 원천 행 (이름)
    const rows: { sigunguId: string; area: number }[] = [];
    for (const sg of SIGUNGUS) {
      if (getSgisComposite(sg.sgisCode)) continue; // 인천 2026 신설 구 — 2025 표에 없다
      const p = provinceById.get(sg.sidoId)!;
      const cands = codes.filter((c) => c.length === 5 && c.startsWith(p.sgisCode) && byCode.get(c)!.name === sg.name);
      // 같은 이름의 구가 시 아래에 있을 수 있다(창원 의창구 등) — 시·군·구 단위는 끝자리 0 이거나 유일한 행
      const pick = cands.length === 1 ? cands[0] : cands.filter((c) => !codes.some((x) => x !== c && x.slice(0, 4) === c.slice(0, 4) && x.endsWith("0") && x < c));
      const code = Array.isArray(pick) ? (pick.length === 1 ? pick[0] : null) : pick;
      if (!code) { problems.push(`${cropId}: 짝 없음/여럿 ${p.shortName} ${sg.name} (${cands.length})`); continue; }
      const j = skew.byCode.get(code);
      if (!j) { problems.push(`쏠림 판정 없음: ${p.shortName} ${sg.name}`); continue; }
      skewBySigungu.set(sg.id, j);
      if (j.rice || j.all) skewOut[sg.id] = { rice: j.rice, all: j.all };
      rows.push({ sigunguId: sg.id, area: Math.round(byCode.get(code)!.area * 10) / 10 });
    }
    // 주산지로 보이기 위한 하한(10/10): 총조사 재배면적은 농가 **주소지** 기준이라 도시 시·구에 논·과수가 쏠려 잡힌다
    // (안양 벼 262ha vs 실제 논 0ha) → 주소지 쏠림 단위(벼는 벼 판정, 그 밖의 작물은 전체 판정)는 빼고,
    // 1위의 5% 미만이거나 10ha 미만은 뺀다(감귤 서귀포 8,911ha 옆의 나주 27ha 같은 값이 '주요 산지'로 보이지 않게).
    const sorted = rows.filter((r) => r.area > 0 && !r.sigunguId.startsWith("__")).sort((a, b) => b.area - a.area);
    const kept = sorted.filter((r) => {
      const j = skewBySigungu.get(r.sigunguId)!;
      return !(j.all || (cropId === "rice" && j.rice));
    });
    const floor = Math.max(10, (kept[0]?.area ?? 0) * 0.05);
    const top = kept.filter((r) => r.area >= floor).slice(0, TOP_N);
    // 시·도 합(provinces)도 쏠림 단위 몫을 뺀 값으로 낸다(10/10 3차 — 시·군·구 칩과 같은 판정이어야 주산지와 칩이 어긋나지 않는다).
    // 원천 대조(시·도 = 시·군·구 합, 전국 = 시·도 합)는 위에서 원래 값으로 이미 했다.
    const skewShare = new Map<string, number>();
    for (const r of sorted) {
      const j = skewBySigungu.get(r.sigunguId)!;
      if (j.all || (cropId === "rice" && j.rice)) {
        const sid = SIGUNGUS.find((s) => s.id === r.sigunguId)!.sidoId;
        skewShare.set(sid, (skewShare.get(sid) ?? 0) + r.area);
      }
    }
    if (skewShare.size) {
      const provArea = (pid: string) => byCode.get(provinceById.get(pid)!.sgisCode)?.area ?? 0;
      const rank = (adj: boolean) => PROVINCES.map((p) => ({ id: p.id, a: provArea(p.id) - (adj ? skewShare.get(p.id) ?? 0 : 0) }))
        .sort((a, b) => b.a - a.a).slice(0, 5).map((x) => x.id).join(",");
      if (rank(false) !== rank(true)) skewNotes.push(`${cropId}: 시·도 상위 5 ${rank(false)} → 쏠림 단위 빼면 ${rank(true)}`);
    }
    const adjProvinces = provinces
      .map((p) => ({ provinceId: p.provinceId, area: Math.round(Math.max(0, p.area - (skewShare.get(p.provinceId) ?? 0)) * 10) / 10 }))
      .sort((x, y) => y.area - x.area);
    const adjTotal = Math.round(adjProvinces.reduce((acc, p) => acc + p.area, 0) * 10) / 10;
    out[cropId] = { items: items.map((i) => `${i.tblId} ${i.itemName}`), unit: [...units][0], totalArea: adjTotal, provinces: adjProvinces, top };
    const name = (id: string) => SIGUNGUS.find((s) => s.id === id)!;
    console.log(`✓ ${cropId.padEnd(20)} ${top.slice(0, 4).map((t) => `${name(t.sigunguId).shortName} ${Math.round(t.area)}`).join(" | ")} (${[...units][0]})`);
  }

  if (skewNotes.length) console.log(`\n시·도 합 쏠림 영향(provinces 는 쏠림 몫을 뺀 값으로 씀):\n  ${skewNotes.join("\n  ")}`);
  else console.log("\n시·도 합 쏠림 영향: 상위 5 시·도 순서가 바뀌는 작물 없음");

  if (problems.length) {
    console.error(`\n✗ 문제 ${problems.length}건 — 아무것도 쓰지 않았어요`);
    for (const p of [...new Set(problems)].slice(0, 40)) console.error("  - " + p);
    process.exit(1);
  }

  const body = `/**
 * 작물별 재배면적 상위 시·군·구 — 2025 농림어업총조사 (scripts/collect-crop-sigungu-areas.ts 가 생성, 손으로 고치지 않는다)
 *
 * 항목: crop-sigungu-tables.ts. 수집 때 항목 이름·단위·시·군·구 짝·원천 시·도 = 시·군·구 합을 확인했다.
 * 작물 상세 '주요 산지 (시·군·구)' 칩이 이 순서를 쓴다. 시·도 행(provinces)은 CROP_AREAS(농작물생산조사)가 없는 작물의
 * 주산지(majorRegions) 근거다 — 원천 시·도 행 값, 큰 순. 수집일: ${new Date().toISOString().slice(0, 10)}
 * 상위 목록(top)은 주소지 쏠림 단위를 뺐다 — 실제 경지면적(${LAND_TABLE.tblId} ${LAND_TABLE.year}) 대비 벼 > ${RICE_SKEW_MAX}배면 벼, 37개 작물 합 > ${ALL_SKEW_MAX}배면
 * 모든 작물(CROP_SIGUNGU_RESIDENCE_SKEW, scripts/lib/residence-skew.ts).
 */

export interface CropSigunguArea {
  /** 더한 원천 항목 (표 ID + 항목 이름) */
  items: string[];
  /** 원천 단위 */
  unit: string;
  /** 시·도 행 합 */
  totalArea: number;
  /** 시·도별 재배면적(원천 시·도 행), 큰 순 */
  provinces: { provinceId: string; area: number }[];
  /** 재배면적 큰 순 상위 시·군·구 */
  top: { sigunguId: string; area: number }[];
}

export const CROP_SIGUNGU_YEAR = ${YEAR};

export const CROP_SIGUNGU_AREAS: Record<string, CropSigunguArea> = ${JSON.stringify(out, null, 2)};

/** 주소지 쏠림으로 상위 목록에서 뺀 시·군·구 id → { rice: 벼만, all: 전부 } */
export const CROP_SIGUNGU_RESIDENCE_SKEW: Record<string, { rice: boolean; all: boolean }> = ${JSON.stringify(skewOut, null, 2)};
`;
  writeFileSync(resolve(__dirname, "../src/lib/data/crop-sigungu-areas.ts"), body);
  console.log(`\n${Object.keys(out).length}종 → src/lib/data/crop-sigungu-areas.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
