/**
 * compute 스크립트 재현성 검증 게이트
 *
 * 배경: `src/lib/data/dimension-scores.ts`·`settlement-score.ts`는 각각
 *   `scripts/compute-dimension-scores.ts`·`compute-settlement-score.ts`가
 *   정적 데이터(population-trend·farms·medical·school·return-farm·sigungus 등)만
 *   입력으로 계산해 생성하는 산출물이다. 두 스크립트 모두 외부 API·Date.now·
 *   Math.random·process.env를 데이터 계산에 쓰지 않으므로 완전 결정적이다.
 *
 *   위험: 생성 파일을 손으로 편집하거나(예: 2026-05-19 "귀농"→"농촌 정착" site-wide
 *   sed가 생성 파일에도 적용됨), 입력 데이터만 갱신하고 재계산을 누락하면
 *   "커밋된 산출물 ≠ 스크립트가 만드는 산출물"로 drift가 생긴다. 이 상태에서
 *   누군가 스크립트를 재실행하면 카피/수치가 조용히 회귀한다. 로컬 build·test는
 *   통과하고 라이브에서만 드러나는 silent 사고다.
 *
 * 검증: 각 스크립트를 IRANG_COMPUTE_OUT=<tmp>로 재실행(커밋본 무변경) →
 *   fresh 산출물과 커밋본을 대조. 헤더의 날짜 라인("마지막 갱신/계산: YYYY-MM-DD")은
 *   재생성 시각이라 정규화 후 비교. 그 외 1 byte라도 다르면 FAIL.
 *
 * 사용법:
 *   npx tsx scripts/check-compute-reproducibility.ts             # 실검증 (CI)
 *   npx tsx scripts/check-compute-reproducibility.ts --self-test # 커밋본 1줄 변조 탐지 검증
 *
 * exit 0 = 재현 일치 / exit 1 = drift 발견 (스크립트 또는 커밋본 재계산 필요)
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");

interface Target {
  label: string;
  script: string; // repo 기준 상대 경로
  committed: string; // repo 기준 상대 경로 (생성 산출물)
}

const TARGETS: Target[] = [
  {
    label: "dimension-scores",
    script: "scripts/compute-dimension-scores.ts",
    committed: "src/lib/data/dimension-scores.ts",
  },
  {
    label: "settlement-score",
    script: "scripts/compute-settlement-score.ts",
    committed: "src/lib/data/settlement-score.ts",
  },
];

/**
 * 헤더의 생성 시각 라인만 정규화 — 데이터/카피가 아닌 재생성 타임스탬프이므로
 * 비교에서 제외. "마지막 갱신: 2026-05-10" / "마지막 계산: 2026-07-24" 형태.
 */
function normalize(text: string): string {
  return text.replace(
    /(마지막 (?:갱신|계산):)\s*\d{4}-\d{2}-\d{2}/g,
    "$1 <NORMALIZED-DATE>",
  );
}

interface DiffResult {
  equal: boolean;
  firstDiffLine?: number;
  committedLine?: string;
  freshLine?: string;
}

/**
 * 순수 비교 함수 — 두 산출물 텍스트를 정규화 후 라인 단위 대조.
 * main()은 fresh(재실행)·committed(디스크)로, --self-test는 변조본으로 호출한다.
 */
function compareOutputs(freshText: string, committedText: string): DiffResult {
  const fresh = normalize(freshText).split("\n");
  const committed = normalize(committedText).split("\n");
  const max = Math.max(fresh.length, committed.length);
  for (let i = 0; i < max; i++) {
    if (fresh[i] !== committed[i]) {
      return {
        equal: false,
        firstDiffLine: i + 1,
        committedLine: committed[i] ?? "(EOF)",
        freshLine: fresh[i] ?? "(EOF)",
      };
    }
  }
  return { equal: true };
}

/** 스크립트를 임시 파일로 재실행하고 fresh 산출물 텍스트를 반환 (커밋본 무변경). */
function runFresh(target: Target): string {
  const tmpDir = mkdtempSync(join(tmpdir(), "irang-compute-"));
  const outFile = join(tmpDir, `${target.label}.ts`);
  execFileSync("npx", ["tsx", target.script], {
    cwd: REPO_ROOT,
    env: { ...process.env, IRANG_COMPUTE_OUT: outFile },
    stdio: ["ignore", "ignore", "inherit"],
  });
  return readFileSync(outFile, "utf8");
}

function runCheck(): number {
  console.log("");
  console.log("=== compute 스크립트 재현성 점검 ===");
  console.log(`대상: ${TARGETS.length}개 (커밋본 무변경 — IRANG_COMPUTE_OUT tmp 출력)`);
  console.log("");

  let failed = 0;
  for (const target of TARGETS) {
    const committedText = readFileSync(resolve(REPO_ROOT, target.committed), "utf8");
    let freshText: string;
    try {
      freshText = runFresh(target);
    } catch (err) {
      failed++;
      console.log(`  [❌ 실행실패] ${target.label} — ${target.script}`);
      console.log(`      ${(err as Error).message}`);
      continue;
    }
    const result = compareOutputs(freshText, committedText);
    if (result.equal) {
      console.log(`  [✅ 재현일치] ${target.label} → ${target.committed}`);
    } else {
      failed++;
      console.log(`  [❌ DRIFT] ${target.label} → ${target.committed}`);
      console.log(`      최초 불일치 라인 ${result.firstDiffLine}:`);
      console.log(`      커밋본: ${result.committedLine}`);
      console.log(`      재계산: ${result.freshLine}`);
    }
  }

  console.log("");
  if (failed === 0) {
    console.log("재현 일치 — 모든 compute 산출물이 스크립트 재실행과 byte-identical (날짜 라인 제외). ✅");
    console.log("");
    return 0;
  }
  console.log(`drift ${failed}건 — 입력 갱신 후 재계산 누락이거나 산출물 수동 편집.`);
  console.log("→ 해당 compute 스크립트를 재실행해 커밋본을 갱신하거나, 스크립트를 산출물에 맞게 정정하세요.");
  console.log("");
  return 1;
}

/**
 * --self-test: 실 파이프라인으로 재현성이 성립함을 확인한 뒤,
 * 커밋본을 임의 1줄 변조한 사본을 만들어 comparator가 실제로 drift를 잡는지 검증.
 * 디스크의 커밋본은 건드리지 않는다 (in-memory 변조).
 */
function runSelfTest(): number {
  console.log("");
  console.log("=== self-test: 커밋본 1줄 변조 탐지 검증 (in-memory, 디스크 무변경) ===");
  console.log("");

  let ok = true;
  for (const target of TARGETS) {
    const committedText = readFileSync(resolve(REPO_ROOT, target.committed), "utf8");
    const freshText = runFresh(target);

    // 1) 현재 재현성 성립 확인 (날짜 정규화 후 일치)
    const baseline = compareOutputs(freshText, committedText);
    console.log(
      `  [${baseline.equal ? "✅" : "❌"}] ${target.label}: 현재 재현 일치 = ${baseline.equal}`,
    );
    if (!baseline.equal) {
      console.log(`        최초 불일치 라인 ${baseline.firstDiffLine}: 커밋본="${baseline.committedLine}" / 재계산="${baseline.freshLine}"`);
      ok = false;
    }

    // 2) 커밋본을 데이터 라인 1줄 변조 → comparator가 drift로 잡아야 함
    const lines = committedText.split("\n");
    const targetIdx = lines.findIndex((l) => l.includes('"sgisCode"') || l.includes('"populationTrend"') || l.includes("sgisCode:"));
    const idx = targetIdx >= 0 ? targetIdx : Math.floor(lines.length / 2);
    const tampered = [...lines];
    tampered[idx] = tampered[idx] + " /* TAMPERED */";
    const tamperedResult = compareOutputs(freshText, tampered.join("\n"));
    const caught = !tamperedResult.equal;
    console.log(
      `  [${caught ? "✅ 탐지" : "❌ 미탐지"}] ${target.label}: ${idx + 1}번 라인 변조 → drift 탐지 = ${caught}`,
    );
    if (!caught) ok = false;

    // 3) 날짜 라인만 변조 → 정규화로 무시되어 일치로 판정해야 함 (false positive 방지)
    const dateIdx = lines.findIndex((l) => /마지막 (?:갱신|계산):/.test(l));
    if (dateIdx >= 0) {
      const dateTampered = [...lines];
      dateTampered[dateIdx] = dateTampered[dateIdx].replace(/\d{4}-\d{2}-\d{2}/, "1999-01-01");
      const dateResult = compareOutputs(freshText, dateTampered.join("\n"));
      const ignored = dateResult.equal;
      console.log(
        `  [${ignored ? "✅ 무시" : "❌ 오탐"}] ${target.label}: 날짜 라인 변조 → 정규화로 무시 = ${ignored}`,
      );
      if (!ignored) ok = false;
    }
    console.log("");
  }

  if (ok) {
    console.log("self-test 통과 — comparator가 데이터 1줄 변조를 탐지하고 날짜 라인은 무시하며 실 재현성이 성립. ✅");
    console.log("");
    return 0;
  }
  console.log("self-test 실패 — 재현성 미성립이거나 comparator가 변조를 못 잡음.");
  console.log("");
  return 1;
}

function main(): number {
  if (process.argv.includes("--self-test")) return runSelfTest();
  return runCheck();
}

process.exit(main());
