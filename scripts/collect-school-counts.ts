/**
 * NEIS 시군구 학교 수 일괄 수집 스크립트 (Phase 4)
 *
 * - 17개 시도교육청 학교 전체 목록 → 주소 낱말이 시·군·구 이름과 같은 학교만 센다
 * - 조회(fetchEduSchoolRows)·판정(schoolMatcher)은 상세 화면과 같은 lib/api/education 함수 (10/7)
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
// 상세 화면과 같은 조회·판정 — 10/7 정적 자료가 따로 놀아 '동구'에 남동구 학교가 섞였다(인천 동구 98 → 실제 약 20)
import { fetchEduSchoolRows, schoolMatcher, type NeisSchoolRow } from "../src/lib/api/education";

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

  const startTime = Date.now();

  // 1) 시도교육청별 전체 학교 목록 — lib/api/education 그대로(1,000건씩 나눠 받기·쪽마다 재시도)
  const sidoMap = new Map<string, NeisSchoolRow[]>();
  const sidoFails: string[] = [];
  for (const province of PROVINCES) {
    try {
      const rows = await fetchEduSchoolRows(apiKey, province.eduCode, 30_000);
      sidoMap.set(province.id, rows);
      console.log(`  [${province.shortName}] eduCode=${province.eduCode}: ${rows.length} rows`);
    } catch (err) {
      sidoFails.push(province.shortName);
      console.log(`  [${province.shortName}] eduCode=${province.eduCode}: FAIL ${(err as Error).message}`);
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

    // 상세 화면과 같은 판정 — 구가 있는 시는 시 이름 또는 그 구 이름(10/7)
    const inSigungu = schoolMatcher(province.eduCode, sg.name);
    for (const row of rows) {
      if (!inSigungu(row)) continue;
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
 * 시도교육청 학교 목록에서 주소 낱말이 시·군·구 이름과 같은 학교만 센다 (상세 화면과 같은 판정).
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
