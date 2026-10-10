/**
 * 시·군·구·구 '주요 작물' — 2025 농림어업총조사 시·군·구 재배면적 (2026-10-10).
 *
 * 왜: SIGUNGUS·GUS.mainCrops 600여 값은 2026-04 무렵 손으로 넣은 값이라 근거가 없었고, 작물별 총조사 재배면적
 *   상위 10 시·군·구와 맞는 것은 19%뿐이었다(서울 25구 '상추·허브' 등). 그 값이 "○○에서 주로 재배되는 작물이에요"·
 *   검색 설명·순위 카드·시·도 작물 적합도에 그대로 나갔다.
 *
 * 규칙(MAIN_CROP_RULE): 그 단위 안에서 재배면적이 큰 순으로 최대 3개, 각 작물 면적 ≥ 10ha.
 *   - 대상 작물은 우리 CROPS 중 총조사에 항목이 있는 37종(crop-sigungu-tables.ts — 작물 상세 '주요 산지' 칩과 같은 항목).
 *     메밀·표고·화훼처럼 항목이 없는 작물과 축산·수산(한우·전복·김·천일염 등)은 '주요 작물'이 될 수 없다.
 *   - 10ha: 원천 값은 행마다 ha 정수라 아주 작은 값끼리는 순서를 가를 수 없고, 도시 구의 1~9ha 는 '주로 재배'라 부르기
 *     어렵다. 이 기준을 넘는 작물이 없으면 빈 배열 — 화면은 '자료 없음'으로 안내한다.
 *
 * 짝 맞추기(collect-farms·collect-crop-sigungu-areas 와 같은 방식): 시·도 코드 앞자리 안에서 **이름**, 구는 부모 시 코드
 *   앞 4자리로 한 번 더 좁힌다. 행정동 묶음 신설 구(인천 2026·화성 2026 — region-composites)는 2025 표에 없어 값을 만들지 않는다
 *   (논벼·식량·노지 표엔 읍·면·동 행이 없어 동 합산도 불가).
 * 가드 — 하나라도 어긋나면 아무것도 쓰지 않는다: 항목 이름·단위(ha), 짝 0개·2개 이상, 원천 시·도 = 최상위 시·군·구 합,
 *   원천 시 = 구 합(행마다 정수 반올림 몫 + 0.5% 허용).
 *
 * 실행: npx tsx scripts/collect-sigungu-main-crops.ts   (.env.local 의 KOSIS_API_KEY, 키 값은 출력하지 않는다)
 *       KOSIS_RAW_CACHE=<json> 이 있으면 그 파일(표/항목 → 응답 배열)을 먼저 읽는다 — 같은 날 반복 실행용
 */

import { config } from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local"), quiet: true });
import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { GUS } from "../src/lib/data/gus";
import { CROPS } from "../src/lib/data/crops";
import { getSgisComposite } from "../src/lib/data/region-composites";
import { CROP_SIGUNGU_TABLES } from "../src/lib/data/crop-sigungu-tables";
import { CROP_AREAS } from "../src/lib/data/crop-areas";

const YEAR = 2025;
const MAX_CROPS = 3;
const MIN_AREA_HA = 10;
/**
 * 총조사 재배면적은 **농가 주소지** 기준이다 — 서울 농가가 경기·강원에 논을 두면 서울 구의 값이 된다.
 * 경작지 기준인 농작물생산조사(crop-areas.ts, 같은 해 논벼)와 시·도 논벼 면적을 견줘, 전국 비율 대비 이 배수를 넘는
 * 시·도는 그 아래 단위의 '주요 작물'을 만들지 않는다(빈 배열). 2025: 서울 2,003ha vs 175.6ha → 전국 대비 약 14배.
 * 논이 거의 없는 시·도(제주 4.4ha)는 비율이 흔들려 판정하지 않는다(경작지 논벼 < SKEW_MIN_LAND_HA).
 */
const RESIDENCE_SKEW_MAX = 3;
const SKEW_MIN_LAND_HA = 100;
const KOSIS_URL = "https://kosis.kr/openapi/Param/statisticsParameterData.do";

interface KosisRow {
  C1: string;
  C1_NM: string;
  ITM_NM: string;
  UNIT_NM: string;
  DT: string;
}

const rawCache: Record<string, KosisRow[]> = process.env.KOSIS_RAW_CACHE && existsSync(process.env.KOSIS_RAW_CACHE)
  ? JSON.parse(readFileSync(process.env.KOSIS_RAW_CACHE, "utf8"))
  : {};

async function fetchItem(tblId: string, itmId: string): Promise<KosisRow[]> {
  const ck = `${tblId}/${itmId}`;
  if (rawCache[ck]) return rawCache[ck];
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
      const json = (await res.json()) as KosisRow[] | { err?: string };
      if (!Array.isArray(json)) throw new Error(`KOSIS ${ck}: ${JSON.stringify(json).slice(0, 100)}`);
      rawCache[ck] = json;
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
  const problems: string[] = [];
  const cropById = new Map(CROPS.map((c) => [c.id, c]));
  /** 원천 5자리 코드 → { 이름, 작물 id → ha } */
  const units = new Map<string, { name: string; areas: Map<string, number> }>();

  for (const [cropId, items] of Object.entries(CROP_SIGUNGU_TABLES)) {
    if (!cropById.has(cropId)) { problems.push(`${cropId}: CROPS 에 없는 작물`); continue; }
    for (const it of items) {
      const rows = await fetchItem(it.tblId, it.itmId);
      for (const r of rows) {
        if (r.C1.length !== 5) continue; // 전국(2)·읍면동(8) 행은 쓰지 않는다
        if (r.ITM_NM !== it.itemName) { problems.push(`${cropId}: ${it.tblId} ${it.itmId} 항목 ${r.ITM_NM} ≠ ${it.itemName}`); break; }
        if (r.UNIT_NM !== "ha") { problems.push(`${cropId}: ${it.tblId} 단위 ${r.UNIT_NM}`); break; }
        const v = num(r.DT);
        if (!Number.isFinite(v)) { problems.push(`${cropId}: ${r.C1_NM} 값 ${r.DT}`); break; }
        const u = units.get(r.C1) ?? { name: r.C1_NM, areas: new Map<string, number>() };
        u.areas.set(cropId, (u.areas.get(cropId) ?? 0) + v);
        units.set(r.C1, u);
      }
    }
  }
  const area = (code: string, cropId: string) => units.get(code)?.areas.get(cropId) ?? 0;
  const codes = [...units.keys()];
  const subs = (sidoCode: string) => codes.filter((c) => c.startsWith(sidoCode) && !/^\d{2}00[345]$/.test(c) && c !== sidoCode);

  // ── 원천 안 가드: 시·도 = 최상위 시·군·구 합, 시 = 구 합 ──
  // 시·도 행은 2자리라 위에서 걸렀다 — 시·도 합은 다시 읽어 비교한다
  const sidoArea = new Map<string, number>();
  for (const [cropId, items] of Object.entries(CROP_SIGUNGU_TABLES)) {
    for (const it of items) {
      for (const r of await fetchItem(it.tblId, it.itmId)) {
        if (r.C1.length !== 2) continue;
        const k = `${r.C1}/${cropId}`;
        sidoArea.set(k, (sidoArea.get(k) ?? 0) + num(r.DT));
      }
    }
  }
  for (const p of PROVINCES) {
    const ss = subs(p.sgisCode);
    const cities = new Set(ss.filter((c) => c.endsWith("0") && ss.some((g) => g !== c && g.slice(0, 4) === c.slice(0, 4))));
    const top = ss.filter((c) => cities.has(c) || ![...cities].some((x) => x !== c && x.slice(0, 4) === c.slice(0, 4)));
    for (const cropId of Object.keys(CROP_SIGUNGU_TABLES)) {
      const want = sidoArea.get(`${p.sgisCode}/${cropId}`);
      if (want === undefined) { problems.push(`${cropId}: 시·도 행 없음 ${p.name}`); continue; }
      const sum = top.reduce((a, c) => a + area(c, cropId), 0);
      if (Math.abs(sum - want) > top.length * 0.5 * CROP_SIGUNGU_TABLES[cropId].length + want * 0.005) {
        problems.push(`${cropId}: 원천 ${p.name} ${want} ≠ 시·군·구 합 ${sum}`);
      }
      for (const c of cities) {
        const gus = ss.filter((g) => g !== c && g.slice(0, 4) === c.slice(0, 4));
        const gsum = gus.reduce((a, g) => a + area(g, cropId), 0);
        const cv = area(c, cropId);
        if (Math.abs(gsum - cv) > gus.length * 0.5 * CROP_SIGUNGU_TABLES[cropId].length + cv * 0.005) {
          problems.push(`${cropId}: 원천 ${units.get(c)!.name} ${cv} ≠ 구 합 ${gsum}`);
        }
      }
    }
  }

  // ── 주소지 기준 쏠림: 총조사 논벼 ÷ 농작물생산조사 논벼 (시·도), 전국 비율로 나눈 배수 ──
  const landRice = CROP_AREAS.rice;
  if (!landRice || landRice.year !== YEAR) problems.push(`crop-areas.ts 논벼가 ${YEAR}년이 아님 — 쏠림 판정 불가`);
  const censusNational = sidoArea.get("00/rice");
  if (censusNational === undefined) problems.push("총조사 전국 논벼 행 없음");
  const skewed = new Set<string>();
  if (landRice && censusNational) {
    const base = censusNational / landRice.totalHa;
    const ratios: string[] = [];
    for (const p of PROVINCES) {
      const land = landRice.provinces.find((x) => x.provinceId === p.id)?.areaHa;
      const cen = sidoArea.get(`${p.sgisCode}/rice`);
      if (!land || cen === undefined) { problems.push(`쏠림 판정 값 없음 ${p.name}`); continue; }
      if (land < SKEW_MIN_LAND_HA) { ratios.push(`${p.shortName} 판정 안 함(논 ${land}ha)`); continue; }
      const r = cen / land / base;
      ratios.push(`${p.shortName} ${r.toFixed(2)}`);
      if (r > RESIDENCE_SKEW_MAX) skewed.add(p.id);
    }
    console.log(`주소지 쏠림 배수(전국=1): ${ratios.join(" · ")} → 제외 ${[...skewed].join(",") || "없음"}`);
  }

  // ── 우리 단위 ↔ 원천 행 (이름) ──
  const provinceById = new Map(PROVINCES.map((p) => [p.id, p]));
  const findCode = (sidoCode: string, name: string, parentCode?: string): string | null => {
    let cands = subs(sidoCode).filter((c) => units.get(c)!.name === name);
    if (parentCode) cands = cands.filter((c) => c !== parentCode && c.slice(0, 4) === parentCode.slice(0, 4));
    else if (cands.length > 1) {
      // 같은 이름의 구가 시 아래에 있을 수 있다 — 시·군·구 단위는 상위 시 행이 없는 쪽
      cands = cands.filter((c) => !codes.some((x) => x !== c && x.slice(0, 4) === c.slice(0, 4) && x.endsWith("0") && x < c));
    }
    return cands.length === 1 ? cands[0] : null;
  };
  const pick = (code: string) =>
    [...units.get(code)!.areas.entries()]
      .filter(([, ha]) => ha >= MIN_AREA_HA)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_CROPS)
      .map(([cropId, ha]) => ({ cropId, crop: cropById.get(cropId)!.name, areaHa: Math.round(ha * 10) / 10 }));

  type Entry = { cropId: string; crop: string; areaHa: number };
  const sigunguOut: Record<string, Entry[]> = {};
  const codeBySigunguId = new Map<string, string>();
  const skipped: string[] = [];
  for (const sg of SIGUNGUS) {
    if (getSgisComposite(sg.sgisCode)) { skipped.push(`${sg.name}(${sg.id})`); continue; }
    const p = provinceById.get(sg.sidoId)!;
    const code = findCode(p.sgisCode, sg.name);
    if (!code) { problems.push(`시·군·구 짝 없음/여럿: ${p.shortName} ${sg.name}`); continue; }
    codeBySigunguId.set(sg.id, code);
    sigunguOut[sg.id] = skewed.has(sg.sidoId) ? [] : pick(code);
  }
  const guOut: Record<string, Entry[]> = {};
  for (const g of GUS) {
    if (getSgisComposite(g.sgisCode)) { skipped.push(`${g.name}(${g.id})`); continue; }
    const p = provinceById.get(g.sidoId)!;
    const parent = codeBySigunguId.get(g.parentSigunguId);
    const code = parent ? findCode(p.sgisCode, g.name, parent) : null;
    if (!code) { problems.push(`구 짝 없음/여럿: ${p.shortName} ${g.name}`); continue; }
    guOut[g.id] = skewed.has(g.sidoId) ? [] : pick(code);
  }

  if (problems.length) {
    console.error(`\n✗ 문제 ${problems.length}건 — 아무것도 쓰지 않았어요`);
    for (const p of [...new Set(problems)].slice(0, 40)) console.error("  - " + p);
    process.exit(1);
  }

  const count = (o: Record<string, Entry[]>) => Object.values(o).reduce((a, v) => a + v.length, 0);
  const empty = (o: Record<string, Entry[]>) => Object.values(o).filter((v) => v.length === 0).length;
  console.log(`시·군·구 ${Object.keys(sigunguOut).length}곳 값 ${count(sigunguOut)}개(빈 곳 ${empty(sigunguOut)}) · 구 ${Object.keys(guOut).length}곳 값 ${count(guOut)}개(빈 곳 ${empty(guOut)})`);
  console.log(`원천에 없어 건너뜀: ${skipped.join(", ")}`);

  const body = `/**
 * 시·군·구·구 '주요 작물' — ${YEAR} 농림어업총조사 재배면적 (scripts/collect-sigungu-main-crops.ts 가 생성, 손으로 고치지 않는다)
 *
 * 규칙: 그 단위 안에서 재배면적 큰 순 최대 ${MAX_CROPS}개, 각 ${MIN_AREA_HA}ha 이상. 대상은 총조사에 항목이 있는 우리 작물
 * ${Object.keys(CROP_SIGUNGU_TABLES).length}종(crop-sigungu-tables.ts). 원천: 국가데이터처 KOSIS orgId 101 DT_1AG25401·25402·25403·25407·25411,
 * ${YEAR}-12-01 기준. 수집 때 항목 이름·단위·짝·원천 시·도 = 시·군·구 합·시 = 구 합을 확인했다. 수집일: ${new Date().toISOString().slice(0, 10)}
 * 값은 농가 주소지 기준(경작지가 다른 시·군·구에 있을 수 있다). 주소지 쏠림이 큰 시·도(${[...skewed].join(", ") || "없음"})와
 * 표에 없는 단위(인천·화성 2026 신설 구)는 키가 없거나 빈 배열 — 화면은 '자료 없음'.
 */

export interface MainCropEntry {
  cropId: string;
  /** CROPS.name */
  crop: string;
  /** ${YEAR} 재배면적 (ha) */
  areaHa: number;
}

export const MAIN_CROPS_SOURCE = "${YEAR} 농림어업총조사(국가데이터처)";
export const MAIN_CROP_RULE = { maxCrops: ${MAX_CROPS}, minAreaHa: ${MIN_AREA_HA}, residenceSkewMax: ${RESIDENCE_SKEW_MAX}, cropCount: ${Object.keys(CROP_SIGUNGU_TABLES).length} } as const;
/** 주소지 쏠림으로 제외한 시·도 id */
export const MAIN_CROPS_SKEWED_PROVINCES: readonly string[] = ${JSON.stringify([...skewed])};

/** SIGUNGUS.id → 주요 작물 */
export const SIGUNGU_MAIN_CROPS: Record<string, MainCropEntry[]> = ${JSON.stringify(sigunguOut, null, 2)};

/** GUS.id → 주요 작물 */
export const GU_MAIN_CROPS: Record<string, MainCropEntry[]> = ${JSON.stringify(guOut, null, 2)};
`;
  writeFileSync(resolve(__dirname, "../src/lib/data/sigungu-main-crops.ts"), body);
  if (process.env.KOSIS_RAW_DUMP) writeFileSync(process.env.KOSIS_RAW_DUMP, JSON.stringify(rawCache));
  console.log("→ src/lib/data/sigungu-main-crops.ts");
}

main().catch((e) => { console.error(e); process.exit(1); });
