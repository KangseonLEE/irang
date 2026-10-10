/**
 * 작물 상세 '재배면적 상위 (시·도)' 차트 자료 수집 — 국가데이터처 KOSIS 농작물생산조사 (2026-10-09).
 *
 * 왜 정적 자료인가: 10/8 까지는 상세 페이지가 요청·빌드 때마다 KOSIS 를 불렀다.
 *   - 17종 중 16종이 그 작물이 아닌 표를 보고 있었다(DT_1ET0292 과실생산량을 항목 필터 없이 읽어 콩·마늘 상세에
 *     지역마다 마지막 과일 면적이 그려질 상태 — 10/8 0b4e472a 빌드에서 5쪽 약 30분 노출)
 *   - 빌드는 미국 리전이라 KOSIS 시간 초과로 대개 비어 있었다
 *   연 1회 갱신되는 숫자라 수집 때 원천과 대조해 고정하고, 화면은 이 파일만 읽는다(실행 중 외부 호출 0).
 *
 * 작물마다 **표 하나 + 항목 하나(면적)** 를 지정하고(CROP_TABLES), 수집 때 아래를 확인한다 — 하나라도 어긋나면
 * 아무것도 쓰지 않는다(collect-areas·collect-farms 와 같은 원칙):
 *   - 응답 행의 항목 이름이 지정한 이름과 정확히 같다(`콩:면적` — 다른 작물 항목이 섞이지 않는다)
 *   - 단위가 ha
 *   - 시·도 행이 PROVINCES 코드(sgisCode)와 이름으로 짝지어진다(2026 표의 '전남광주통합특별시'(12)는 쓰지 않는다,
 *     재배가 없는 시·도는 행이 없어 0)
 *   - 시·도 합 = 전국(계) 행 (반올림 차 0.5% 이내)
 * 연도는 올해부터 3년 전까지 내려가며 전국 값이 숫자로 있는 첫 해(표마다 공표 시점이 다르다 — 과채류는 2024 가 최신).
 *
 * 실행: npx tsx scripts/collect-crop-areas.ts   (.env.local 의 KOSIS_API_KEY, 키 값은 출력하지 않는다)
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });
import { PROVINCES } from "../src/lib/data/regions";
import { CROPS } from "../src/lib/data/crops";
import { CROP_TABLES } from "../src/lib/data/crop-area-tables";

const KOSIS_URL = "https://kosis.kr/openapi/Param/statisticsParameterData.do";

interface KosisRow {
  C1: string;
  C1_NM: string;
  ITM_ID: string;
  ITM_NM: string;
  UNIT_NM: string;
  DT: string;
  PRD_DE: string;
  TBL_NM: string;
}

/** '강원특별자치도'·'제주도' 등 표기 차이를 지우고 비교한다 */
function normSido(name: string): string {
  return name
    .replace(/특별자치도|특별자치시|특별시|광역시|도$/g, "")
    .replace(/^(전라|경상|충청)(남|북)$/, (_, a: string, b: string) => a[0] + b)
    .trim();
}

async function fetchYear(tblId: string, itmId: string, year: number): Promise<KosisRow[] | null> {
  const key = process.env.KOSIS_API_KEY;
  if (!key) throw new Error("KOSIS_API_KEY 없음");
  const url = new URL(KOSIS_URL);
  for (const [k, v] of Object.entries({
    method: "getList", apiKey: key, itmId, objL1: "ALL", format: "json", jsonVD: "Y",
    prdSe: "Y", startPrdDe: String(year), endPrdDe: String(year), orgId: "101", tblId,
  })) url.searchParams.set(k, v);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      const json: unknown = await res.json();
      if (Array.isArray(json)) return json as KosisRow[];
      const err = (json as { err?: string }).err;
      if (err === "30") return null; // 그 해 데이터 없음
      throw new Error(`KOSIS err ${err} (${tblId} ${itmId} ${year})`);
    } catch (e) {
      if (attempt === 3) throw e;
    }
  }
  return null;
}

async function main() {
  const cropById = new Map(CROPS.map((c) => [c.id, c]));
  const thisYear = new Date().getFullYear();
  const out: Record<string, unknown> = {};
  const problems: string[] = [];

  for (const t of CROP_TABLES) {
    if (!cropById.has(t.cropId)) { problems.push(`${t.cropId}: CROPS 에 없는 작물`); continue; }
    let rows: KosisRow[] | null = null;
    let year = 0;
    for (let y = thisYear; y >= thisYear - 3 && !rows; y--) {
      const r = await fetchYear(t.tblId, t.itmId, y);
      // 조사 전인 해는 행이 있어도 값이 '-' 다(2026 표에 고추·배추 등) — 전국 값이 숫자인 해만 쓴다
      const tot = r?.find((x) => x.C1 === "00");
      if (r && tot && Number.isFinite(Number(tot.DT))) { rows = r; year = y; }
    }
    if (!rows) { problems.push(`${t.cropId}: ${t.tblId} ${t.itmId} 최근 4년 값 없음`); continue; }

    const bad = rows.filter((r) => r.ITM_NM !== t.itemName || r.UNIT_NM !== "ha");
    if (bad.length) { problems.push(`${t.cropId}: 항목·단위 불일치 ${bad[0].ITM_NM}(${bad[0].UNIT_NM}) ≠ ${t.itemName}(ha)`); continue; }

    const total = rows.find((r) => r.C1 === "00");
    const provinces: { provinceId: string; areaHa: number }[] = [];
    for (const p of PROVINCES) {
      const r = rows.filter((x) => x.C1 === p.sgisCode);
      // 재배가 없는 시·도는 행 자체가 없다(메밀 2024 — 서울·부산·인천·세종). 0 으로 두고 아래 합계 대조가 지킨다
      if (r.length === 0) { provinces.push({ provinceId: p.id, areaHa: 0 }); continue; }
      if (r.length !== 1) { problems.push(`${t.cropId}: ${p.name}(${p.sgisCode}) 행 ${r.length}개`); continue; }
      if (normSido(r[0].C1_NM) !== normSido(p.name)) { problems.push(`${t.cropId}: 코드 ${p.sgisCode} 이름 ${r[0].C1_NM} ≠ ${p.name}`); continue; }
      const v = r[0].DT === "-" ? 0 : Number(r[0].DT);
      if (!Number.isFinite(v)) { problems.push(`${t.cropId}: ${p.name} 값 ${r[0].DT}`); continue; }
      provinces.push({ provinceId: p.id, areaHa: Math.round(v * 10) / 10 });
    }
    const sum = provinces.reduce((a, b) => a + b.areaHa, 0);
    const totalHa = total ? Number(total.DT) : NaN;
    if (!Number.isFinite(totalHa) || Math.abs(sum - totalHa) > totalHa * 0.005 + 1) {
      problems.push(`${t.cropId}: 시·도 합 ${sum.toFixed(1)} ≠ 전국 ${total?.DT}`);
      continue;
    }
    out[t.cropId] = {
      year,
      tblId: t.tblId,
      tableName: rows[0].TBL_NM,
      itemName: t.itemName,
      totalHa: Math.round(totalHa * 10) / 10,
      provinces: provinces.sort((a, b) => b.areaHa - a.areaHa),
    };
    console.log(`✓ ${t.cropId.padEnd(14)} ${t.tblId} ${t.itemName.padEnd(10)} ${year}  전국 ${Math.round(totalHa).toLocaleString()}ha  1위 ${provinces[0]?.provinceId}`);
  }

  if (problems.length) {
    console.error(`\n✗ 문제 ${problems.length}건 — 아무것도 쓰지 않았어요`);
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }

  const body = `/**
 * 작물별 시·도 재배면적 — 국가데이터처 KOSIS 농작물생산조사 (scripts/collect-crop-areas.ts 가 생성, 손으로 고치지 않는다)
 *
 * 작물마다 표 하나·면적 항목 하나(crop-area-tables.ts), 수집 때 항목 이름·단위(ha)·시·도 코드↔이름·시·도 합 = 전국을 확인했다.
 * 수집일: ${new Date().toISOString().slice(0, 10)}
 */

export interface CropAreaStat {
  /** 조사 연도 */
  year: number;
  /** KOSIS 통계표 ID (orgId 101) */
  tblId: string;
  /** KOSIS 통계표 이름 */
  tableName: string;
  /** KOSIS 항목 이름 (예: "콩:면적") */
  itemName: string;
  /** 전국 재배면적 (ha) */
  totalHa: number;
  /** 시·도별 재배면적 (ha), 큰 순 */
  provinces: { provinceId: string; areaHa: number }[];
}

export const CROP_AREAS: Record<string, CropAreaStat> = ${JSON.stringify(out, null, 2)};
`;
  writeFileSync(resolve(__dirname, "../src/lib/data/crop-areas.ts"), body);
  console.log(`\n${Object.keys(out).length}종 → src/lib/data/crop-areas.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
