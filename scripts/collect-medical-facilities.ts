/**
 * HIRA 시군구 의료기관 통계 일괄 수집 스크립트 (Phase 4)
 *
 * - 229개 시군구 + 12개 통합시(구 합산) = 241개 항목
 * - 시군구당 totalCount 1회 호출 (numOfRows=1) — 약 241회
 * - 통합시는 구별로 각각 호출 후 합산 (실제 호출 ~270회)
 * - throttle: 동시 5개, 200ms delay → 약 11분 예상
 *
 * 결과: src/lib/data/medical-facilities.ts 자동 생성
 *
 * 실행:
 *   npx tsx scripts/collect-medical-facilities.ts
 *
 * 환경:
 *   .env.local 의 DATA_GO_KR_API_KEY 사용
 *
 * 데이터 소스: 건강보험심사평가원 의료기관 정보 v2
 *   https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList
 *
 * 회장 원칙: 100% 시군구 커버 못하면 차원 제거 검토 (부분 폴백 금지).
 *   → 누락 시군구가 발생하면 최종 보고에 명시.
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

import { SIGUNGUS } from "../src/lib/data/sigungus";
import { PROVINCES } from "../src/lib/data/regions";

const API_BASE =
  "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";
const TIMEOUT_MS = 8000;
const RETRY = 2;
const CONCURRENCY = 5;
const DELAY_MS = 200;

/**
 * 통합시 hiraSgguCd → 산하 구 코드 배열 매핑.
 * sigungus.ts 의 통합시는 대표 구 코드(예: 수원 영통구 310604)를 사용 중이므로,
 * 시 전체 의료기관 수를 얻으려면 모든 구를 합산해야 한다.
 *
 * (src/lib/api/hira.ts 의 GU_HIRA_CODES_MAP 과 동일 — SSOT는 hira.ts)
 */
const HIRA_GU_MAP: Record<string, string[]> = {
  "310604": ["310601", "310602", "310603", "310604"], // 수원시
  "310403": ["310401", "310402", "310403"],           // 성남시
  "310702": ["310701", "310702"],                     // 안양시
  "310303": ["310301", "310302", "310303"],           // 부천시
  "311102": ["311101", "311102"],                     // 안산시
  "311903": ["311901", "311902", "311903"],           // 고양시
  "312003": ["312001", "312002", "312003"],           // 용인시
  "330104": ["330101", "330102", "330103", "330104"], // 청주시
  "340202": ["340201", "340202"],                     // 천안시
  "350402": ["350401", "350402"],                     // 전주시
  "370702": ["370701", "370702"],                     // 포항시
  "380705": ["380701", "380702", "380703", "380704", "380705"], // 창원시
};

interface MedicalCount {
  /** 시군구 sgisCode (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 의료기관 총 수 */
  totalCount: number;
}

/** API 응답 totalCount 1회 조회 */
async function fetchSigunguTotal(
  apiKey: string,
  sidoCd: string,
  sgguCd: string,
): Promise<number | null> {
  const url = new URL(API_BASE);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("sidoCd", sidoCd);
  url.searchParams.set("sgguCd", sgguCd);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1");
  url.searchParams.set("_type", "json");

  for (let attempt = 0; attempt <= RETRY; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const total = json?.response?.body?.totalCount;
      if (total == null) throw new Error("no totalCount");

      return Number(total);
    } catch (err) {
      if (attempt === RETRY) {
        console.warn(
          `  [fail] sido=${sidoCd}/sggu=${sgguCd}: ${(err as Error).message}`,
        );
        return null;
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}

/** 단일 시군구 합계 (통합시면 구 합산) */
async function fetchOne(
  apiKey: string,
  sigungu: { sgisCode: string; name: string; sidoId: string; hiraSgguCd: string },
  sidoCd: string,
): Promise<MedicalCount | null> {
  const guCodes = HIRA_GU_MAP[sigungu.hiraSgguCd] ?? [sigungu.hiraSgguCd];

  let total = 0;
  let anyOk = false;
  for (const code of guCodes) {
    const count = await fetchSigunguTotal(apiKey, sidoCd, code);
    if (count !== null) {
      total += count;
      anyOk = true;
    }
    if (guCodes.length > 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  if (!anyOk) return null;

  return {
    sgisCode: sigungu.sgisCode,
    name: sigungu.name,
    totalCount: total,
  };
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

async function main() {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) throw new Error("DATA_GO_KR_API_KEY missing in .env.local");

  console.log(`[collect-medical] sigungu=${SIGUNGUS.length}`);
  console.log(
    `[collect-medical] concurrency=${CONCURRENCY}, delay=${DELAY_MS}ms`,
  );

  // sidoId → hiraSidoCd 매핑
  const provinceIndex = new Map(PROVINCES.map((p) => [p.id, p]));

  const targets = SIGUNGUS.map((sg) => {
    const province = provinceIndex.get(sg.sidoId);
    if (!province) {
      console.warn(`[skip] no province for ${sg.id} (sidoId=${sg.sidoId})`);
      return null;
    }
    return { sg, hiraSidoCd: province.hiraSidoCd };
  }).filter(
    (t): t is { sg: typeof SIGUNGUS[number]; hiraSidoCd: string } => t !== null,
  );

  let processed = 0;
  const startTime = Date.now();

  const results = await batchProcess(
    targets,
    async ({ sg, hiraSidoCd }) => {
      const result = await fetchOne(apiKey, sg, hiraSidoCd);
      processed++;
      if (processed % 20 === 0) {
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(
          `  [${processed}/${targets.length}] elapsed=${elapsedSec}s`,
        );
      }
      return result;
    },
    CONCURRENCY,
    DELAY_MS,
  );

  const successList: MedicalCount[] = results.filter(
    (r): r is MedicalCount => r !== null,
  );
  const failList: string[] = [];
  results.forEach((r, idx) => {
    if (r === null) failList.push(targets[idx].sg.name);
  });

  console.log(`\n[done] success=${successList.length}/${targets.length}`);
  if (failList.length > 0) {
    console.log(`[failed] ${failList.length}개: ${failList.join(", ")}`);
  }

  // 시도 합산
  const sidoTotals = new Map<string, { sgisCode: string; name: string; totalCount: number }>();
  for (const p of PROVINCES) {
    sidoTotals.set(p.sgisCode, { sgisCode: p.sgisCode, name: p.shortName, totalCount: 0 });
  }
  for (const item of successList) {
    const sidoCode = item.sgisCode.slice(0, 2);
    const t = sidoTotals.get(sidoCode);
    if (t) t.totalCount += item.totalCount;
  }
  const sidoArr = Array.from(sidoTotals.values()).filter((t) => t.totalCount > 0);

  // ─────────────────────────────────────────────────────────────────
  // 직렬화
  // ─────────────────────────────────────────────────────────────────
  const filePath = resolve(__dirname, "../src/lib/data/medical-facilities.ts");
  const body = `/**
 * 의료기관 통계 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-medical-facilities.ts
 * 데이터 소스: 건강보험심사평가원 의료기관 정보 v2
 *   https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList
 * 마지막 수집: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/collect-medical-facilities.ts\`
 *
 * Phase 4 — 빌드 시 시군구별 HIRA API 호출을 제거하기 위한 정적 폴백.
 * 통합시는 산하 구 totalCount 합산.
 *
 * 커버리지: ${successList.length}/${targets.length} 시군구 (수집일 기준)
${failList.length > 0 ? ` * 미수집: ${failList.join(", ")}\n` : ""} */

export interface MedicalFacilityStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 의료기관 총 수 */
  totalCount: number;
}

/** 시군구 의료기관 수 (SGIS 5자리) */
export const MEDICAL_FALLBACK_SIGUNGU: MedicalFacilityStat[] = ${JSON.stringify(
    successList,
    null,
    2,
  )};

/** 시도 합산 의료기관 수 (SGIS 2자리) */
export const MEDICAL_FALLBACK_SIDO: MedicalFacilityStat[] = ${JSON.stringify(
    sidoArr,
    null,
    2,
  )};

const SIGUNGU_INDEX = new Map(
  MEDICAL_FALLBACK_SIGUNGU.map((m) => [m.sgisCode, m]),
);
const SIDO_INDEX = new Map(MEDICAL_FALLBACK_SIDO.map((m) => [m.sgisCode, m]));

export function getMedicalFallback(sgisCode: string): MedicalFacilityStat | null {
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
