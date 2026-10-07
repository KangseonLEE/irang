/**
 * HIRA 시군구 의료기관 통계 일괄 수집 스크립트 (Phase 4)
 *
 * - 시·군·구마다 lib/api/hira fetchSigunguMedicalFacilities — 구가 있는 시는 구 합(하나라도 실패하면 미수집),
 *   광주·세종 심평원 코드 변환까지 상세 화면과 같다
 * - throttle: 동시 5개, 200ms delay
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

import { SIGUNGUS, type Sigungu } from "../src/lib/data/sigungus";
import { PROVINCES } from "../src/lib/data/regions";
import { fetchSigunguMedicalFacilities } from "../src/lib/api/hira";

const CONCURRENCY = 5;
const DELAY_MS = 200;

interface MedicalCount {
  /** 시군구 sgisCode (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 의료기관 총 수 */
  totalCount: number;
}

/**
 * 시·군·구 하나 — 상세 화면과 같은 lib/api/hira 함수로 센다 (10/7).
 * 예전엔 이 스크립트가 구 코드표·시·도 코드를 따로 들고 있어 세종·군위 0곳, 화성 절반(동탄구만),
 * 구 하나가 실패해도 나머지만 더한 숫자가 정적 자료(순위 점수)에 남았다.
 */
async function fetchOne(sg: Sigungu, hiraSidoCd: string): Promise<MedicalCount | null> {
  const result = await fetchSigunguMedicalFacilities(hiraSidoCd, sg.hiraSgguCd);
  if (!result) return null;
  return { sgisCode: sg.sgisCode, name: sg.name, totalCount: result.totalCount };
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
  if (!process.env.DATA_GO_KR_API_KEY) throw new Error("DATA_GO_KR_API_KEY missing in .env.local");

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
      const result = await fetchOne(sg, hiraSidoCd);
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
