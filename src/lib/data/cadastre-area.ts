/**
 * 지역 면적의 출처 — 국토교통부 지적통계 「행정구역별·지목별 국토이용현황_시군구」(KOSIS 116/DT_MLTM_2300, 지목 '계') (2026-10-07)
 *
 * regions.ts·sigungus.ts·gus.ts 의 `area` 는 scripts/collect-areas.ts 가 이 통계로 채우고, 주간 정합성 대조
 * (scripts/check-region-stats-integrity.ts)가 같은 함수로 공표된 최신 연도와 맞춰 본다. 앱 화면은 이 파일을 쓰지 않는다.
 */

/** 그 해 지적통계에 아직 없는 단위 — 지금 값을 그대로 두고 대조에서도 뺀다(키 = sigungus.ts·gus.ts id) */
export const AREA_NOT_YET_IN_CADASTRE: Readonly<Record<string, string>> = {
  jemulpo: "인천 2026-07-01 신설 — 구청 공고 면적(지적통계 2025 는 옛 중구·동구)",
  yeongjong: "인천 2026-07-01 신설 — 구청 공고 면적",
  seohae: "인천 2026-07-01 신설 — 옛 서구 지적 면적 − 검단구 공고 면적",
  geomdan: "인천 2026-07-01 신설 — 구청 공고 면적",
  "manse-gu": "화성 2026-02-01 신설 — 화성시 토지정보과 구별 면적(2026.4.30)",
  "hyohaeng-gu": "화성 2026-02-01 신설 — 화성시 토지정보과 구별 면적(2026.4.30)",
  "byeongjeom-gu": "화성 2026-02-01 신설 — 화성시 토지정보과 구별 면적(2026.4.30)",
  "dongtan-gu": "화성 2026-02-01 신설 — 화성시 토지정보과 구별 면적(2026.4.30)",
};

export interface CadastreRow {
  /** 시·도 이름(KOSIS 표기 — '서울'·'세종특별자치시' 등) */
  sido: string;
  /** 시·군·구 이름(KOSIS 표기 — '종로구'·'수원시(계)'·'수원시장안구', 시·도 합계 행은 시·도 이름) */
  name: string;
  /** ㎡ */
  m2: number;
}

const ORG = "116";
const TBL = "DT_MLTM_2300";
const BASE = "https://kosis.kr/openapi";

async function getJson(url: string): Promise<unknown> {
  let last = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 1500 * attempt));
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`KOSIS 지적통계 응답 실패(${last})`);
}

/** 그 해(없으면 공표된 최신 연도)의 시·도·시·군·구 면적 전부 — 덜 받았으면 예외 */
export async function fetchCadastreAreas(apiKey: string, year?: string): Promise<{ year: string; rows: CadastreRow[] }> {
  type Meta = { OBJ_ID: string; OBJ_NM: string; ITM_ID: string; ITM_NM: string };
  const meta = (await getJson(
    `${BASE}/statisticsData.do?method=getMeta&type=ITM&apiKey=${apiKey}&orgId=${ORG}&tblId=${TBL}&format=json&jsonVD=Y`,
  )) as Meta[];
  if (!Array.isArray(meta)) throw new Error(`KOSIS 지적통계 메타 형식 다름: ${JSON.stringify(meta).slice(0, 160)}`);
  const area = meta.find((m) => m.OBJ_ID === "ITEM" && m.ITM_NM === "면적");
  const levelObj = meta.find((m) => m.OBJ_NM === "레벨01")?.OBJ_ID;
  const total = meta.find((m) => m.OBJ_ID === levelObj && m.ITM_NM === "계");
  if (!area || !total) throw new Error("KOSIS 지적통계 메타에 '면적'·'계' 항목 없음 — 표 구조가 바뀌었는지 확인");
  let y = year;
  if (!y) {
    const prd = (await getJson(
      `${BASE}/statisticsData.do?method=getMeta&type=PRD&apiKey=${apiKey}&orgId=${ORG}&tblId=${TBL}&format=json&jsonVD=Y`,
    )) as { END_PRD_DE?: string }[];
    y = prd?.[0]?.END_PRD_DE;
    if (!y) throw new Error("KOSIS 지적통계 최신 연도를 못 읽음");
  }
  const data = (await getJson(
    `${BASE}/Param/statisticsParameterData.do?method=getList&apiKey=${apiKey}&itmId=${area.ITM_ID}&objL1=ALL&objL2=ALL&objL3=${total.ITM_ID}&format=json&jsonVD=Y&prdSe=Y&startPrdDe=${y}&endPrdDe=${y}&orgId=${ORG}&tblId=${TBL}`,
  )) as { C1_NM: string; C2_NM: string; DT: string }[];
  if (!Array.isArray(data) || data.length < 250) {
    throw new Error(`KOSIS 지적통계 ${y}년 ${Array.isArray(data) ? data.length : 0}행만 받음 — 덜 받은 값으로 쓰지 않음`);
  }
  return { year: y, rows: data.map((d) => ({ sido: d.C1_NM, name: d.C2_NM, m2: Number(d.DT) })) };
}

/** ㎡ → ㎢ 소수 둘째 자리 */
const km2 = (m2: number) => Math.round(m2 / 1e4) / 100;

type SidoNames = { name: string; shortName: string };
const sidoMatches = (row: CadastreRow, sido: SidoNames) =>
  row.sido === sido.shortName || row.sido === sido.name || (sido.shortName === "세종" && row.sido.startsWith("세종"));

/** 그 단위의 면적(㎢) — 시·도 합계 행 또는 시·군·구 행('○○시(계)'·'○○시○○구' 포함). 없으면 null */
export function matchCadastreArea(
  rows: readonly CadastreRow[],
  spec: { kind: "sido"; sido: SidoNames } | { kind: "sigungu"; sido: SidoNames; name: string },
): number | null {
  const row =
    spec.kind === "sido"
      ? rows.find((r) => sidoMatches(r, spec.sido) && (r.name === spec.sido.shortName || r.name === spec.sido.name))
      : rows.find((r) => sidoMatches(r, spec.sido) && (r.name === spec.name || r.name === `${spec.name}(계)`));
  return row && Number.isFinite(row.m2) ? km2(row.m2) : null;
}
