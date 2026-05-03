/**
 * NEIS 시군구 학교 수 일괄 수집 스크립트 (Phase 4)
 *
 * - 17개 시도교육청 × 1회 = 시도별 학교 전체 목록(pSize=1000) 일괄 fetch
 *   → 각 시도교육청 응답을 메모리에서 시군구명 주소 매칭으로 카운트
 * - 결과: 229개 시군구 + 12개 통합시(이미 sigungus.ts에 통합 등록) = 241개 항목
 * - throttle: 시도당 1회 호출이라 동시 5, 200ms delay
 *   (HIRA 대비 호출 횟수가 매우 적어 ~30초 내 완료 예상)
 *
 * 결과 파일: src/lib/data/school-counts.ts 자동 생성
 *
 * 실행:
 *   npx tsx scripts/collect-school-counts.ts
 *
 * 환경:
 *   .env.local 의 NEIS_API_KEY 사용
 *
 * 데이터 소스: 교육부 NEIS 학교정보
 *   https://open.neis.go.kr/hub/schoolInfo
 *
 * 학교급별 분류 필드 (NEIS 응답):
 *   SCHUL_KND_SC_NM — "초등학교" / "중학교" / "고등학교" / "특수학교" 등
 *   ORG_RDNMA       — 도로명주소 (시군구명 포함 여부로 시군구 매칭)
 *
 * 회장 원칙: 100% 시군구 커버 못하면 누락 시군구 헤더 주석에 명시.
 *   주소 문자열 매칭 한계로 일부 시군구가 누락될 수 있다 — 부분 폴백 금지 원칙에 따라 보고.
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

import { SIGUNGUS } from "../src/lib/data/sigungus";
import { PROVINCES } from "../src/lib/data/regions";

const API_BASE = "https://open.neis.go.kr/hub/schoolInfo";
const TIMEOUT_MS = 8000;
const RETRY = 2;
const CONCURRENCY = 5;
const DELAY_MS = 200;
const PAGE_SIZE = 1000;

interface SchoolCount {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 학교 총 수 */
  totalCount: number;
  /** 초등학교 수 */
  elementary: number;
  /** 중학교 수 */
  middle: number;
  /** 고등학교 수 */
  high: number;
}

interface NeisRow {
  ATPT_OFCDC_SC_CODE?: string;
  SCHUL_KND_SC_NM?: string; // 학교급 (초등학교/중학교/고등학교/특수학교 등)
  ORG_RDNMA?: string;       // 도로명주소
  LCTN_SC_NM?: string;       // 시도명
  [k: string]: unknown;
}

/** NEIS 시도교육청 단위 학교 전체 목록 (페이지네이션 포함) */
async function fetchSidoSchools(
  apiKey: string,
  eduCode: string,
): Promise<NeisRow[] | null> {
  // 1단계: 총 개수 조회 (pSize=1)
  const headUrl = new URL(API_BASE);
  headUrl.searchParams.set("KEY", apiKey);
  headUrl.searchParams.set("Type", "json");
  headUrl.searchParams.set("pIndex", "1");
  headUrl.searchParams.set("pSize", "1");
  headUrl.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

  let total = 0;
  for (let attempt = 0; attempt <= RETRY; attempt++) {
    try {
      const res = await fetch(headUrl.toString(), {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // 데이터 없음 (INFO-200) → 0
      if (json?.RESULT?.CODE === "INFO-200") return [];
      if (json?.RESULT) {
        throw new Error(`NEIS error: ${json.RESULT.CODE} - ${json.RESULT.MESSAGE}`);
      }

      total = Number(json?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
      break;
    } catch (err) {
      if (attempt === RETRY) {
        console.warn(`  [head fail] eduCode=${eduCode}: ${(err as Error).message}`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  if (total === 0) return [];

  // 2단계: 페이지네이션 fetch
  const pages = Math.ceil(total / PAGE_SIZE);
  const rows: NeisRow[] = [];
  for (let p = 1; p <= pages; p++) {
    const url = new URL(API_BASE);
    url.searchParams.set("KEY", apiKey);
    url.searchParams.set("Type", "json");
    url.searchParams.set("pIndex", String(p));
    url.searchParams.set("pSize", String(PAGE_SIZE));
    url.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

    let pageOk = false;
    for (let attempt = 0; attempt <= RETRY; attempt++) {
      try {
        const res = await fetch(url.toString(), {
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json?.RESULT) throw new Error(`NEIS error: ${json.RESULT.CODE}`);
        const pageRows = json?.schoolInfo?.[1]?.row ?? [];
        rows.push(...(pageRows as NeisRow[]));
        pageOk = true;
        break;
      } catch (err) {
        if (attempt === RETRY) {
          console.warn(
            `  [page fail] eduCode=${eduCode} page=${p}: ${(err as Error).message}`,
          );
        } else {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    if (!pageOk) return null;

    // 페이지 간 미세 delay (NEIS rate limit 보수적)
    if (p < pages) await new Promise((r) => setTimeout(r, 100));
  }

  return rows;
}

/** throttled batch — concurrency 만큼 병렬 + 배치마다 delay */
async function batchProcess<T, U>(
  items: T[],
  worker: (item: T) => Promise<U>,
  concurrency: number,
  delayMs: number,
): Promise<U[]> {
  const results: U[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    const batch = await Promise.all(slice.map(worker));
    results.push(...batch);
    if (i + concurrency < items.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

/**
 * 시군구명이 도로명주소에 포함되는지 검사.
 * "중구"처럼 짧은 이름은 시도명과 함께 매칭해야 정확하다 (예: 서울 중구 vs 부산 중구).
 *
 * NEIS의 ORG_RDNMA는 "서울특별시 중구 ..." 형식 → 시도 풀네임 + 시군구명으로 검사.
 */
/**
 * 시도 별칭 — 행정구역 명칭 변경 대응.
 * 2024년부터 전북/강원이 "특별자치도"로 변경됐으나 NEIS 일부 학교는 여전히
 * 옛 명칭 사용. 두 표기 모두 매칭하도록 별칭 배열로 처리.
 */
const SIDO_ALIASES: Record<string, string[]> = {
  "전라북도": ["전라북도", "전북특별자치도"],
  "강원도": ["강원도", "강원특별자치도"],
  "제주특별자치도": ["제주특별자치도", "제주도"],
};

function matchSigungu(
  rdnma: string,
  sidoFullName: string,
  sigunguName: string,
): boolean {
  if (!rdnma) return false;
  const aliases = SIDO_ALIASES[sidoFullName] ?? [sidoFullName];
  const sidoOk = aliases.some((alias) => rdnma.startsWith(alias));
  return sidoOk && rdnma.includes(sigunguName);
}

/**
 * 학교급 분류 (SCHUL_KND_SC_NM 기반).
 * 초등학교 / 중학교 / 고등학교만 카운트. 특수학교·각종학교는 totalCount 에만 포함.
 */
function classifyKind(
  kindName: string,
): "elementary" | "middle" | "high" | "other" {
  if (kindName === "초등학교") return "elementary";
  if (kindName === "중학교") return "middle";
  if (kindName === "고등학교") return "high";
  return "other";
}

async function main() {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) throw new Error("NEIS_API_KEY missing in .env.local");

  console.log(`[collect-schools] sigungu=${SIGUNGUS.length}, sido=${PROVINCES.length}`);
  console.log(
    `[collect-schools] concurrency=${CONCURRENCY}, delay=${DELAY_MS}ms`,
  );

  const startTime = Date.now();

  // 1) 시도교육청별 전체 학교 목록 일괄 수집
  const sidoResults = await batchProcess(
    PROVINCES,
    async (province) => {
      const rows = await fetchSidoSchools(apiKey, province.eduCode);
      const status = rows === null ? "FAIL" : `${rows.length} rows`;
      console.log(`  [${province.shortName}] eduCode=${province.eduCode}: ${status}`);
      return { province, rows };
    },
    CONCURRENCY,
    DELAY_MS,
  );

  // 시도교육청 단위 실패 → 해당 시도 내 모든 시군구 누락 처리
  const sidoMap = new Map<string, NeisRow[]>();
  const sidoFails: string[] = [];
  for (const { province, rows } of sidoResults) {
    if (rows === null) {
      sidoFails.push(province.shortName);
    } else {
      sidoMap.set(province.id, rows);
    }
  }

  // 2) 시군구 단위로 매칭 카운트
  const successList: SchoolCount[] = [];
  const failList: string[] = [];

  for (const sg of SIGUNGUS) {
    const province = PROVINCES.find((p) => p.id === sg.sidoId);
    if (!province) {
      failList.push(`${sg.name} (province not found)`);
      continue;
    }
    const rows = sidoMap.get(province.id);
    if (!rows) {
      failList.push(`${sg.name} (${province.shortName} 교육청 fail)`);
      continue;
    }

    let total = 0;
    let elementary = 0;
    let middle = 0;
    let high = 0;

    for (const row of rows) {
      const rdnma = String(row.ORG_RDNMA ?? "");
      if (!matchSigungu(rdnma, province.name, sg.name)) continue;
      total++;
      const kind = classifyKind(String(row.SCHUL_KND_SC_NM ?? ""));
      if (kind === "elementary") elementary++;
      else if (kind === "middle") middle++;
      else if (kind === "high") high++;
    }

    if (total === 0) {
      // 0건이 매칭 누락인지 실제 0인지는 분간 어렵다. 일단 0으로 기록하되 별도 표시.
      failList.push(`${sg.name} (0건 — 주소 매칭 누락 가능)`);
    }

    successList.push({
      sgisCode: sg.sgisCode,
      name: sg.name,
      totalCount: total,
      elementary,
      middle,
      high,
    });
  }

  console.log(`\n[done] sigungu=${successList.length}/${SIGUNGUS.length}`);
  if (sidoFails.length > 0) {
    console.log(`[sido fail] ${sidoFails.length}개: ${sidoFails.join(", ")}`);
  }
  if (failList.length > 0) {
    console.log(`[zero or missing] ${failList.length}건: ${failList.slice(0, 20).join(", ")}${failList.length > 20 ? " …" : ""}`);
  }

  // 시도 합산
  const sidoTotals = new Map<
    string,
    { sgisCode: string; name: string; totalCount: number; elementary: number; middle: number; high: number }
  >();
  for (const p of PROVINCES) {
    sidoTotals.set(p.sgisCode, {
      sgisCode: p.sgisCode,
      name: p.shortName,
      totalCount: 0,
      elementary: 0,
      middle: 0,
      high: 0,
    });
  }
  for (const item of successList) {
    const sidoCode = item.sgisCode.slice(0, 2);
    const t = sidoTotals.get(sidoCode);
    if (t) {
      t.totalCount += item.totalCount;
      t.elementary += item.elementary;
      t.middle += item.middle;
      t.high += item.high;
    }
  }
  const sidoArr = Array.from(sidoTotals.values()).filter((t) => t.totalCount > 0);

  // ─────────────────────────────────────────────────────────────────
  // 직렬화
  // ─────────────────────────────────────────────────────────────────
  const filePath = resolve(__dirname, "../src/lib/data/school-counts.ts");
  const missingNote =
    sidoFails.length > 0
      ? ` * 시도교육청 fail: ${sidoFails.join(", ")}\n`
      : "";
  const zeroNote =
    failList.length > 0
      ? ` * 0건 또는 주소 매칭 누락 의심: ${failList.length}건 (스크립트 콘솔 참조)\n`
      : "";

  const body = `/**
 * 학교 수 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-school-counts.ts
 * 데이터 소스: 교육부 NEIS 학교정보
 *   https://open.neis.go.kr/hub/schoolInfo
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-school-counts.ts\`
 *
 * Phase 4 — 빌드 시 시군구별 NEIS API 호출을 제거하기 위한 정적 폴백.
 * 시도교육청 단위로 전체 학교 목록을 받아 도로명주소 시군구명 매칭으로 분류.
 *
 * 커버리지: ${successList.length}/${SIGUNGUS.length} 시군구 (수집일 기준)
${missingNote}${zeroNote} */

export interface SchoolCountStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 학교 총 수 (초·중·고·특수·각종 포함) */
  totalCount: number;
  /** 초등학교 수 */
  elementary: number;
  /** 중학교 수 */
  middle: number;
  /** 고등학교 수 */
  high: number;
}

/** 시군구 학교 수 (SGIS 5자리) */
export const SCHOOL_FALLBACK_SIGUNGU: SchoolCountStat[] = ${JSON.stringify(
    successList,
    null,
    2,
  )};

/** 시도 합산 학교 수 (SGIS 2자리) */
export const SCHOOL_FALLBACK_SIDO: SchoolCountStat[] = ${JSON.stringify(
    sidoArr,
    null,
    2,
  )};

const SIGUNGU_INDEX = new Map(
  SCHOOL_FALLBACK_SIGUNGU.map((s) => [s.sgisCode, s]),
);
const SIDO_INDEX = new Map(SCHOOL_FALLBACK_SIDO.map((s) => [s.sgisCode, s]));

export function getSchoolFallback(sgisCode: string): SchoolCountStat | null {
  return SIGUNGU_INDEX.get(sgisCode) ?? SIDO_INDEX.get(sgisCode) ?? null;
}
`;

  writeFileSync(filePath, body, "utf-8");
  console.log(`\n[wrote] ${filePath}`);

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`[total elapsed] ${totalSec}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
