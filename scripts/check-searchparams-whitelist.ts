/**
 * searchParams 화이트리스트 정합성 검증 스크립트
 *
 * 배경: list 페이지에 새 searchParam 키(view·page·sort 등)나 enum 값(sort=income 등)을
 *   추가하면서 `src/lib/search-params/normalize.ts`의 화이트리스트 갱신을 누락하면,
 *   middleware가 라이브에서 그 param을 308 strip → deep link가 무력화된다.
 *   로컬 build·test는 전부 통과하고 라이브에서만 발견되는 silent 사고.
 *
 *   실제 3회 재발:
 *     - 5/29: /crops에 `view` 추가했으나 allowedKeys 누락 → table view 308 strip
 *     - 5/30: /crops에 `page` 추가했으나 allowedKeys 누락 → ?page=2 308 strip
 *     - 6/16: CROP_SORT_OPTIONS에 `income` 추가했으나 sort enum 누락 → ?sort=income P0 딥링크 strip
 *
 * 검증 2종 (모두 소스 오브 트루스 import/파싱 기반 — grep 휴리스틱 아님):
 *
 *   [C1] allowedKeys 커버리지
 *     각 normalize 라우트의 page.tsx `searchParams: Promise<{...}>` 타입 선언에서
 *     페이지가 실제 읽는 키를 파싱 → 그 키가 전부 normalize allowedKeys에 있는지 대조.
 *     누락 시 middleware가 308 strip → FAIL. (5/29·5/30 패턴)
 *
 *   [C2] sort enum 동기화
 *     sort 컨트롤이 있는 라우트는 `*_SORT_OPTIONS` 상수를 직접 import →
 *     그 value 집합이 normalize `enumValidators.sort`와 양방향 일치하는지 대조.
 *     - SORT_OPTIONS 값이 화이트리스트에 없음 → 라이브 strip → FAIL (6/16 패턴)
 *     - 화이트리스트에 SORT_OPTIONS에 없는 값 → 정렬 옵션 삭제 후 잔존한 stale drift → FAIL
 *
 * 사용법:
 *   npx tsx scripts/check-searchparams-whitelist.ts            # 실검증 (CI)
 *   npx tsx scripts/check-searchparams-whitelist.ts --self-test # 과거 3사고 시뮬레이션 (검증용)
 *
 * exit 0 = 정합 / exit 1 = 불일치 발견 (누락 항목 명시)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { LIST_PAGE_NORMALIZE_OPTIONS } from "../src/lib/search-params/normalize";
import { CROP_SORT_OPTIONS } from "../src/lib/data/crops";
import { PROGRAM_SORT_OPTIONS } from "../src/lib/data/programs";
import { EVENT_SORT_OPTIONS } from "../src/lib/data/events";
import { EDUCATION_SORT_OPTIONS } from "../src/lib/data/education";
import { INTERVIEW_SORT_OPTIONS } from "../src/lib/data/landing";

const REPO_ROOT = resolve(import.meta.dirname, "..");

// normalize.ts 옵션 맵/단일 라우트 옵션 타입 — 인터페이스가 export되지 않아 typeof로 추출.
type OptionsMap = typeof LIST_PAGE_NORMALIZE_OPTIONS;
type RouteOptions = OptionsMap[string];

/**
 * sort 컨트롤 SORT_OPTIONS 매핑 — 라우트별 정렬 값 소스 오브 트루스.
 * 여기 없는 normalize 라우트는 sort enum 검증(C2) 대상이 아님.
 */
const SORT_OPTIONS_BY_ROUTE: Record<string, readonly { value: string }[]> = {
  "/crops": CROP_SORT_OPTIONS,
  "/programs": PROGRAM_SORT_OPTIONS,
  "/events": EVENT_SORT_OPTIONS,
  "/education": EDUCATION_SORT_OPTIONS,
  "/interviews": INTERVIEW_SORT_OPTIONS,
};

/** route "/x/y" → "src/app/x/y/page.tsx" */
function pageFileForRoute(route: string): string {
  return resolve(REPO_ROOT, `src/app${route}/page.tsx`);
}

/**
 * page.tsx에서 `searchParams: Promise<{...}>` 타입 블록의 키 목록 추출.
 * - 단일 라인 `Promise<{ active?: string }>` / 멀티 라인 둘 다 처리.
 * - 블록/라인 주석 제거 후 `key?:` 패턴만 수집 (모든 page 키는 optional `?:` 사용).
 * 반환: 선언된 searchParam 키 배열. 블록을 못 찾으면 null.
 */
function extractDeclaredKeys(pageSource: string): string[] | null {
  const blockMatch = pageSource.match(/searchParams\s*:\s*Promise<\{([\s\S]*?)\}>/);
  if (!blockMatch) return null;
  const inner = blockMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, "") // 블록 주석 제거
    .replace(/\/\/[^\n]*/g, ""); // 라인 주석 제거
  const keys: string[] = [];
  for (const m of inner.matchAll(/([A-Za-z_$][\w$]*)\s*\?\s*:/g)) {
    keys.push(m[1]);
  }
  return keys;
}

interface Failure {
  route: string;
  kind: "MISSING_PAGE" | "NO_SEARCHPARAMS_TYPE" | "KEY_NOT_ALLOWED" | "SORT_ENUM_DRIFT";
  message: string;
}

/**
 * 핵심 검증 — 옵션 맵을 인자로 받아 순수하게 실패 목록을 반환.
 * main()은 실제 normalize 옵션으로, --self-test는 변조한 클론으로 호출한다.
 */
function collectFailures(options: OptionsMap): Failure[] {
  const failures: Failure[] = [];

  for (const route of Object.keys(options)) {
    const routeOpt: RouteOptions = options[route];
    const pageFile = pageFileForRoute(route);

    // ── C1: allowedKeys 커버리지 ──
    if (!existsSync(pageFile)) {
      failures.push({
        route,
        kind: "MISSING_PAGE",
        message: `normalize 라우트인데 page 파일 없음: ${pageFile}`,
      });
    } else {
      const source = readFileSync(pageFile, "utf8");
      const declaredKeys = extractDeclaredKeys(source);
      if (declaredKeys === null) {
        failures.push({
          route,
          kind: "NO_SEARCHPARAMS_TYPE",
          message: `page.tsx에서 'searchParams: Promise<{...}>' 타입 블록을 찾지 못함 (파싱 실패 — 키 검증 불가)`,
        });
      } else {
        const allowed = new Set(routeOpt.allowedKeys);
        for (const key of declaredKeys) {
          if (!allowed.has(key)) {
            failures.push({
              route,
              kind: "KEY_NOT_ALLOWED",
              message: `page가 '${key}' searchParam을 읽지만 normalize allowedKeys에 없음 → middleware 308 strip. normalize.ts "${route}".allowedKeys에 "${key}" 추가 필요.`,
            });
          }
        }
      }
    }

    // ── C2: sort enum 동기화 ──
    const sortOptions = SORT_OPTIONS_BY_ROUTE[route];
    if (sortOptions) {
      const optionValues = new Set(sortOptions.map((o) => o.value));
      const whitelistSort = new Set(routeOpt.enumValidators?.sort ?? []);

      // SORT_OPTIONS에 있으나 화이트리스트에 없음 → 라이브 strip (6/16 sort=income)
      for (const v of optionValues) {
        if (!whitelistSort.has(v)) {
          failures.push({
            route,
            kind: "SORT_ENUM_DRIFT",
            message: `SORT_OPTIONS에 sort='${v}'가 있으나 normalize enumValidators.sort에 없음 → ?sort=${v} 308 strip. normalize.ts "${route}".enumValidators.sort에 "${v}" 추가 필요.`,
          });
        }
      }
      // 화이트리스트에 있으나 SORT_OPTIONS에 없음 → 정렬 옵션 삭제 후 남은 stale drift
      for (const v of whitelistSort) {
        if (!optionValues.has(v)) {
          failures.push({
            route,
            kind: "SORT_ENUM_DRIFT",
            message: `normalize enumValidators.sort에 '${v}'가 있으나 SORT_OPTIONS에 없음 (stale drift) → normalize.ts "${route}".enumValidators.sort에서 "${v}" 제거 필요.`,
          });
        }
      }
    }
  }

  return failures;
}

/** 옵션 맵에서 특정 라우트만 변조한 클론 생성 (source 파일 무변경 — 시뮬레이션용). */
function cloneWithMutation(
  route: string,
  mutate: (opt: {
    allowedKeys: string[];
    enumValidators: Record<string, readonly string[]>;
  }) => void,
): OptionsMap {
  const orig = LIST_PAGE_NORMALIZE_OPTIONS[route];
  const modified = {
    ...orig,
    allowedKeys: [...orig.allowedKeys],
    enumValidators: { ...(orig.enumValidators ?? {}) },
  };
  mutate(modified as never);
  return { ...LIST_PAGE_NORMALIZE_OPTIONS, [route]: modified } as OptionsMap;
}

/**
 * --self-test: 과거 3사고를 in-memory 클론에 재현해 checker가 실제로 잡는지 확인.
 * source 파일을 전혀 건드리지 않으므로 잔존 0 (프로세스 종료 시 클론 소멸).
 */
function runSelfTest(): number {
  console.log("");
  console.log("=== self-test: 과거 3사고 시뮬레이션 (in-memory 클론, source 무변경) ===");
  console.log("");

  const scenarios: Array<{ label: string; options: OptionsMap; expectRoute: string }> = [
    {
      label: "5/29 재현 — /crops allowedKeys에서 'view' 제거",
      options: cloneWithMutation("/crops", (o) => {
        o.allowedKeys = o.allowedKeys.filter((k) => k !== "view");
      }),
      expectRoute: "/crops",
    },
    {
      label: "5/30 재현 — /crops allowedKeys에서 'page' 제거",
      options: cloneWithMutation("/crops", (o) => {
        o.allowedKeys = o.allowedKeys.filter((k) => k !== "page");
      }),
      expectRoute: "/crops",
    },
    {
      label: "6/16 재현 — /crops sort enum에서 'income' 제거",
      options: cloneWithMutation("/crops", (o) => {
        o.enumValidators = {
          ...o.enumValidators,
          sort: (o.enumValidators.sort ?? []).filter((v) => v !== "income"),
        };
      }),
      expectRoute: "/crops",
    },
  ];

  let allCaught = true;
  for (const s of scenarios) {
    const failures = collectFailures(s.options).filter((f) => f.route === s.expectRoute);
    const caught = failures.length > 0;
    console.log(`  [${caught ? "✅ 탐지" : "❌ 미탐지"}] ${s.label}`);
    for (const f of failures) console.log(`        └ ${f.message}`);
    if (!caught) allCaught = false;
  }

  console.log("");
  // 시뮬레이션은 클론에만 적용 — 실제 옵션은 그대로여야 함 (잔존 0 검증).
  const liveFailures = collectFailures(LIST_PAGE_NORMALIZE_OPTIONS);
  console.log(`  실제 normalize 옵션 잔존 변경 검증: 실검증 실패 ${liveFailures.length}건`);
  console.log(`  결과: ${liveFailures.length === 0 ? "0건 ✅ (클론만 변조, source 무변경)" : "⚠️ 실검증 실패 존재"}`);
  console.log("");

  if (allCaught && liveFailures.length === 0) {
    console.log("self-test 통과 — checker가 과거 3사고를 모두 탐지하며 실옵션은 무변경.");
    return 0;
  }
  console.log("self-test 실패 — checker가 일부 사고를 탐지 못 하거나 실옵션에 잔여 오염.");
  return 1;
}

function runCheck(): number {
  const failures = collectFailures(LIST_PAGE_NORMALIZE_OPTIONS);
  const routeCount = Object.keys(LIST_PAGE_NORMALIZE_OPTIONS).length;

  console.log("");
  console.log("=== searchParams 화이트리스트 정합성 점검 ===");
  console.log(`normalize 라우트 : ${routeCount}개`);
  console.log(`sort enum 검증 대상 : ${Object.keys(SORT_OPTIONS_BY_ROUTE).length}개`);
  console.log("");

  if (failures.length === 0) {
    console.log("정합 — 모든 페이지 searchParam 키가 allowedKeys에 있고 sort enum 동기화됨. ✅");
    console.log("");
    return 0;
  }

  console.log(`불일치 ${failures.length}건 발견:`);
  console.log("");
  for (const f of failures) {
    console.log(`  [${f.kind}] ${f.route}`);
    console.log(`      ${f.message}`);
  }
  console.log("");
  console.log("→ normalize.ts 화이트리스트를 페이지 실제 사용과 동기화하세요.");
  console.log("");
  return 1;
}

function main(): number {
  if (process.argv.includes("--self-test")) return runSelfTest();
  return runCheck();
}

process.exit(main());
