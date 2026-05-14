/**
 * 전국 읍·면·동 안내 카드 자동 생성 스크립트
 *
 * - 통계청 SGIS Stage API로 233개 시·군·구 하위 읍·면·동 트리를 일괄 수집한다.
 * - 결과를 src/lib/data/sub-regions.generated.ts 의 정적 데이터로 직렬화한다.
 * - search-index.ts 의 matchSubRegionHint()가 이 데이터를 키로 hint를 노출한다.
 *
 * 실행:
 *   npx tsx scripts/generate-sub-regions.ts
 *
 * 환경:
 *   .env.local 의 SGIS_KEY / SGIS_SECRET 사용
 *
 * 데이터 소스:
 *   통계청 SGIS Open API stage.json
 *   - 라이선스: 공공데이터 OPEN API 이용약관 (출처 표시)
 *   - sgisCode 8자리: 시도(2) + 시군구(3) + 읍면동(3)
 *
 * 매핑 키:
 *   - "{읍면동 풀네임}"        (예: "서생면")
 *   - "{읍면동 풀네임 - 접미사}" (예: "서생" — 면/읍/동 제거)
 *   동음이의어 면 이름은 배열로 여러 hint 저장.
 *
 * ⚠ 빌드 시 호출 X — 항상 이 스크립트로 미리 수집한 정적 데이터만 사용.
 */

import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

import { SIGUNGUS } from "../src/lib/data/sigungus";
import { GUS } from "../src/lib/data/gus";

// ---------------------------------------------------------------------------
// SGIS API
// ---------------------------------------------------------------------------

const AUTH_URL =
  "https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json";
const STAGE_URL =
  "https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json";

async function getAccessToken(): Promise<string> {
  const key = process.env.SGIS_KEY;
  const secret = process.env.SGIS_SECRET;
  if (!key || !secret) {
    throw new Error("SGIS_KEY/SGIS_SECRET 환경변수가 없음. .env.local 확인.");
  }
  const url = `${AUTH_URL}?consumer_key=${key}&consumer_secret=${secret}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`SGIS auth HTTP ${res.status}`);
  const json = await res.json();
  const token = json?.result?.accessToken;
  if (!token) throw new Error(`SGIS auth 실패: ${JSON.stringify(json)}`);
  return token;
}

interface SgisStageItem {
  cd: string;
  addr_name: string;
  full_addr: string;
}

async function fetchSubRegions(
  token: string,
  sgisCode: string,
  expectNonEmpty = true,
): Promise<SgisStageItem[]> {
  const url = `${STAGE_URL}?accessToken=${token}&cd=${sgisCode}`;
  // 1차 시도
  let items = await fetchOnce(url);
  if (items.length === 0 && expectNonEmpty) {
    // 0건은 SGIS 일시 응답 불안정 가능성 — 1회 재시도 (500ms 대기)
    await new Promise((r) => setTimeout(r, 500));
    items = await fetchOnce(url);
  }
  return items;
}

async function fetchOnce(url: string): Promise<SgisStageItem[]> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const json = await res.json();
    const result = json?.result;
    if (!Array.isArray(result)) return [];
    return result as SgisStageItem[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 데이터 모델
// ---------------------------------------------------------------------------

interface SubRegionRecord {
  /** SGIS 8자리 코드 — 정렬·역추적용 */
  sgisCode: string;
  /** 풀네임 (예: "서생면") */
  fullName: string;
  /** 상위 시·군·구 ID (Sigungu.id) */
  sigunguId: string;
  /** 상위 구 ID (있을 때만, GuDistrict.id) */
  guId?: string;
  /** 상위 시·도 ID (Province.id) */
  sidoId: string;
}

// ---------------------------------------------------------------------------
// 시·군·구 ↔ 상위 lookup
// ---------------------------------------------------------------------------

/**
 * 통합시 처리 — sigunguId 가 같은 GuDistrict가 있으면 통합시로 판정.
 * 통합시의 sgisCode (예: 수원 31010) 는 SGIS stage에서 0건이므로,
 * 하위 구별로 stage 호출 후 sigunguId로 묶는다.
 */
const INTEGRATED_SIGUNGU_IDS = new Set<string>(
  GUS.map((g) => g.parentSigunguId),
);

/**
 * 폐지된 구 코드 매핑 — GuDistrict에는 없지만 SGIS는 구 코드 유지.
 * 부천시: 2016년 구 폐지(원미·소사·오정) 후에도 SGIS는 31051/31052/31053 유지.
 */
const LEGACY_GU_TO_SIGUNGU: Record<string, string> = {
  "31051": "bucheon", // 원미
  "31052": "bucheon", // 소사
  "31053": "bucheon", // 오정
};

// ---------------------------------------------------------------------------
// Suffix 처리
// ---------------------------------------------------------------------------

const SUFFIX_PATTERN = /(읍|면|동|가|로|길)$/;

/**
 * 풀네임에서 접미사를 제거한 별칭을 생성.
 * - "서생면" → "서생"
 * - "1동" / "2동" 같은 단순 동은 "가흥1동" → "가흥1" 도 생성 (의미 약함)
 * - 한 글자 짧은 별칭(예: "가", "동") 은 생성 안 함 (noise 방지)
 */
function shortAliasOf(fullName: string): string | null {
  const alias = fullName.replace(SUFFIX_PATTERN, "");
  if (alias.length < 2) return null; // 한 글자 별칭 제외
  if (alias === fullName) return null;
  return alias;
}

// ---------------------------------------------------------------------------
// 메인
// ---------------------------------------------------------------------------

async function main() {
  console.log("[1/4] SGIS 인증...");
  const token = await getAccessToken();
  console.log("       ✅ token 발급");

  console.log("[2/4] 233개 시·군·구 stage API 호출 (통합시 11곳은 하위 구로 분할)...");

  const records: SubRegionRecord[] = [];
  let processedSigungu = 0;
  let zeroCountSigungu = 0;
  let processedGu = 0;

  // 통합시가 아닌 시·군·구는 sgisCode로 직접 stage 조회
  for (const sg of SIGUNGUS) {
    if (INTEGRATED_SIGUNGU_IDS.has(sg.id)) continue;

    const items = await fetchSubRegions(token, sg.sgisCode);
    if (items.length === 0) {
      zeroCountSigungu++;
      console.log(`       ⚠ 0건 — ${sg.name} (sgisCode ${sg.sgisCode}) — 광역구 가능성`);
      continue;
    }
    for (const item of items) {
      records.push({
        sgisCode: item.cd,
        fullName: item.addr_name,
        sigunguId: sg.id,
        sidoId: sg.sidoId,
      });
    }
    processedSigungu++;
  }

  // 통합시 (수원·성남·…·창원) 는 하위 구별로 stage 조회 후 sigunguId로 묶음
  for (const g of GUS) {
    const items = await fetchSubRegions(token, g.sgisCode);
    if (items.length === 0) {
      console.log(`       ⚠ 0건 — ${g.name} (sgisCode ${g.sgisCode})`);
      continue;
    }
    for (const item of items) {
      records.push({
        sgisCode: item.cd,
        fullName: item.addr_name,
        sigunguId: g.parentSigunguId,
        guId: g.id,
        sidoId: g.sidoId,
      });
    }
    processedGu++;
  }

  // 폐지된 구 코드 (부천 등) — SGIS는 유지하지만 GUS 테이블에 없음.
  // sigunguId로 직접 매핑.
  let processedLegacyGu = 0;
  for (const [legacySgisCode, sigunguId] of Object.entries(LEGACY_GU_TO_SIGUNGU)) {
    const items = await fetchSubRegions(token, legacySgisCode);
    if (items.length === 0) continue;
    const sigungu = SIGUNGUS.find((s) => s.id === sigunguId);
    if (!sigungu) continue;
    for (const item of items) {
      records.push({
        sgisCode: item.cd,
        fullName: item.addr_name,
        sigunguId,
        sidoId: sigungu.sidoId,
      });
    }
    processedLegacyGu++;
  }
  if (processedLegacyGu > 0) {
    console.log(`       ✅ 폐지된 구 코드 ${processedLegacyGu}건 추가 매핑`);
  }

  console.log(
    `       ✅ ${processedSigungu}개 시·군·구 + ${processedGu}개 구 처리. 0건 ${zeroCountSigungu}개. 수집 row ${records.length}건`,
  );

  // ── 데이터 무결성: 0건 stage가 너무 많거나 records가 비정상이면 abort
  if (records.length < 2000) {
    throw new Error(
      `수집 row가 너무 적음 (${records.length} < 2000). 실패로 판정. 정적 데이터 갱신 중단.`,
    );
  }
  if (zeroCountSigungu > 30) {
    throw new Error(
      `0건 시군구가 비정상적으로 많음 (${zeroCountSigungu} > 30). SGIS API 변경 가능성. 중단.`,
    );
  }

  console.log("[3/4] 검색 키 빌드 (풀네임 + 별칭 + 동음이의어)...");

  // hint map: 풀네임/별칭 → SubRegionRecord[]
  const hintMap = new Map<string, SubRegionRecord[]>();
  for (const r of records) {
    const keys = [r.fullName];
    const alias = shortAliasOf(r.fullName);
    if (alias) keys.push(alias);

    for (const key of keys) {
      const existing = hintMap.get(key);
      if (existing) {
        existing.push(r);
      } else {
        hintMap.set(key, [r]);
      }
    }
  }

  const dupCount = Array.from(hintMap.values()).filter((arr) => arr.length > 1).length;
  console.log(
    `       ✅ 키 ${hintMap.size}개. 동음이의어 키 ${dupCount}개 (배열 처리).`,
  );

  console.log("[4/4] sub-regions.generated.ts 직렬화 (압축 포맷: tuple [fullName, sigunguId, sidoId])...");

  // 결정적(deterministic) 직렬화: 키 알파벳 정렬 + record sgisCode 정렬
  // 압축 포맷: SubRegionRecord 객체 대신 tuple [fullName, sigunguId, sidoId]
  // sgisCode·guId 는 안내 카드에 불필요 — 추후 필요 시 별도 generate 추가.
  // 평균 row 당 ~70 byte → ~30 byte 절감 (file size ~50% 감소 예상)
  const sortedKeys = Array.from(hintMap.keys()).sort();
  const out: Record<string, [string, string, string][]> = {};
  for (const key of sortedKeys) {
    const arr = hintMap
      .get(key)!
      .slice()
      .sort((a, b) => a.sgisCode.localeCompare(b.sgisCode));
    // dedup: 동음이의어 중 (fullName + sigunguId) 가 같으면 1건만 유지
    const seen = new Set<string>();
    const compact: [string, string, string][] = [];
    for (const r of arr) {
      const sig = `${r.fullName}|${r.sigunguId}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      compact.push([r.fullName, r.sigunguId, r.sidoId]);
    }
    out[key] = compact;
  }

  // 압축 후 통계
  const compactRowCount = Object.values(out).reduce((sum, arr) => sum + arr.length, 0);

  const TS = `/**
 * AUTO-GENERATED — DO NOT EDIT
 *
 * 출처: 통계청 SGIS Open API stage.json (${new Date().toISOString().slice(0, 10)} 수집)
 * 라이선스: 공공데이터 OPEN API 이용약관 (출처 표시)
 * 갱신: 행정구역 통폐합 시 scripts/generate-sub-regions.ts 재실행
 *
 * 수집 row: ${records.length}건
 * 검색 키: ${hintMap.size}개 (풀네임 + 접미사 제거 별칭)
 * 동음이의어 키: ${dupCount}개 (배열 처리 — 여러 시·군·구의 동명 면 동시 노출)
 * 압축 후 row: ${compactRowCount}건 (sigunguId 중복 dedup)
 *
 * 포맷: tuple [fullName, sigunguId, sidoId]
 *   - sgisCode·guId는 안내 카드 노출에 불필요하므로 생략 (번들 절감)
 *   - 추후 필요 시 별도 generated 파일로 분리
 */

/** [fullName, sigunguId, sidoId] */
export type SubRegionTuple = readonly [string, string, string];

export const SUB_REGIONS: Record<string, readonly SubRegionTuple[]> = ${JSON.stringify(out)};

export const SUB_REGIONS_META = {
  generatedAt: ${JSON.stringify(new Date().toISOString())},
  rowCount: ${records.length},
  compactRowCount: ${compactRowCount},
  keyCount: ${hintMap.size},
  duplicateKeyCount: ${dupCount},
  source: "통계청 SGIS Open API stage.json",
} as const;
`;

  const outPath = resolve(__dirname, "../src/lib/data/sub-regions.generated.ts");
  writeFileSync(outPath, TS);
  console.log(`       ✅ ${outPath} (${Math.round(TS.length / 1024)}KB)`);

  console.log("\n✅ 전체 완료");
  console.log(`   row: ${records.length} / 키: ${hintMap.size} / 동음이의어 키: ${dupCount}`);
}

main().catch((err) => {
  console.error("❌ FAIL:", err);
  process.exit(1);
});
