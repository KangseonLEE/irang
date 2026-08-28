/**
 * ═══════════════════════════════════════════
 *  write endpoint 활성도(§11) · API fallback 응답 비율(§12) 점검
 *
 *  사용: npx tsx scripts/watchman/check-write-activity.ts
 *  CI:   npx tsx scripts/watchman/check-write-activity.ts --ci
 *
 *  배경: 두 항목은 reminder-watchman이 화·금 세션에서 수동 실행하는 구조였다.
 *        8/4 www 인증서 갱신 실패가 세션 부재로 13일 방치된 사고 이후,
 *        세션 의존 감시 항목을 CI로 승격하는 중이다.
 *
 *  §11 (2026-05-11 추가) — 5/10 검색 로깅 incident. `search_logs`가 8일째
 *        0건이었는데 감시 목록에 "write endpoint 활성도"가 없어 발견 못 함.
 *  §12 (2026-05-26 추가) — quick_feedback 33일 silent 202 사고. fallback 분기가
 *        조용히 성공 응답을 돌려주면서 33일 잠복. fallback 적재 추세로 조기 감지.
 *  §11 임계 조정 (2026-08-29) — quick_feedback는 저트래픽(테이블 전체 1건, 7/26)이라
 *        7일 창으로는 8/17~28 매일 🟡가 뜨는 만성 경보였다. 테이블별 창(quick_feedback 30일)으로
 *        완화하고, 🔴 승격 조건이던 "배포 동반"은 git log(관련 경로 최근 7일 commit)로 CI가
 *        직접 판정한다 (watchman-ci.yml fetch-depth: 0).
 *
 *  ★ read-only 전용 (data-engineer 2026-05-11 1on1 가드 #1)
 *    이 스크립트는 count 조회만 한다. prod 데이터에 쓰는 코드는 한 줄도 없다.
 *    5/10 `진단테스트20260510` row cleanup 누락 → admin 인기 검색어 1위 노출 사고 이후,
 *    진단·검증 컨텍스트에서도 read-only가 default다.
 *    자기 증명: 쓰기 계열 Supabase 호출(적재·수정·삭제·병합) grep 결과가 0건이어야 한다.
 *    영문 키워드 grep으로 검증되도록 이 파일은 §11 용어를 "적재"로만 표기한다.
 *
 *  출력 계약: 발견 사항은 WATCHMAN_FINDINGS 파일에 `등급|항목|근거` 1행씩 append.
 *            GitHub Issue는 만들지 않는다(aggregator 담당).
 *            exit code — 🔴 있으면 1, 그 외 0.
 * ═══════════════════════════════════════════
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";

const CI_MODE = process.argv.includes("--ci");

// 로컬은 .env.local 로드, CI는 env를 그대로 사용 (동작 차이는 이것뿐)
if (!CI_MODE) {
  config({ path: resolve(__dirname, "../../.env.local") });
}

// ── 설정 ──────────────────────────────────────

/**
 * §11 점검 대상.
 *  - diagColumn:   `__diag_%` 진단 row 제외용 식별자 컬럼
 *  - windowDays:   0건 판정 창. quick_feedback는 저트래픽이라 30일 (8/29 회장 결재)
 *  - zeroGrade:    창 안 0건일 때 등급. quick_feedback는 8/29 기준 테이블 전체 1건(7/26)이라
 *                  카운트만으로는 정상/이상을 가를 수 없다 → ⚪ 참고(이슈 미발행). silent fail은
 *                  §12 fallback log(migration-pending 등)가 담당한다. 배포 동반 시 🔴 승격은 동일.
 *  - relatedPaths: 🔴 승격용 "배포 동반" 판정 경로 — 최근 7일 내 이 경로를 건드린 commit이 있으면
 *                  0건은 트래픽 정체가 아니라 회귀 가능성으로 본다
 */
const WRITE_TABLES = [
  {
    table: "search_logs",
    label: "사용자 검색 활동",
    diagColumn: "query",
    windowDays: 7,
    zeroGrade: "🟡" as const,
    relatedPaths: ["src/app/api/search-log", "src/components/search/search-bar.tsx"],
  },
  {
    table: "quick_feedback",
    label: "빠른 피드백 응답",
    diagColumn: "recommendation_id",
    windowDays: 30,
    zeroGrade: "⚪" as const,
    relatedPaths: [
      "src/app/api/quick-feedback",
      "src/components/feedback",
      "src/components/match/recommendation-thumbs.tsx",
      "src/app/crops/crop-request-button.tsx",
    ],
  },
  // ⚠️ watchman.md §11-1에는 `assessments`로 적혀 있으나 실제 테이블은 `assessment_results`다.
  //    근거: supabase/migrations/20260508_assessment_age_group.sql·20260517_·20260518_
  //    모두 `ALTER TABLE assessment_results`. 5/14 admin 테이블명 mismatch로
  //    1주+ silent fail 났던 사고가 이 오기재에서 비롯됐다.
  {
    table: "assessment_results",
    label: "유형 진단 응답",
    diagColumn: "id",
    windowDays: 7,
    zeroGrade: "🟡" as const,
    relatedPaths: ["src/app/api/assess", "src/app/assess", "src/lib/assess-result.ts"],
  },
] as const;

/** §12-2 등급표 (fallback_reason별 24h 임계) */
const FALLBACK_REASONS = [
  { name: "not-configured", threshold: 0, grade: "🔴" as const, note: "환경변수 손상 의심" },
  { name: "no-supabase", threshold: 0, grade: "🔴" as const, note: "환경변수 손상 의심" },
  { name: "migration-pending", threshold: 0, grade: "🟡" as const, note: "마이그레이션 누락 신호" },
  { name: "rate-limit", threshold: 100, grade: "🟡" as const, note: "트래픽 폭주·봇 우회 의심" },
  { name: "legacy-columns-only", threshold: 0, grade: "⚪" as const, note: "옛 schema 호환 정상" },
  { name: "natural-language", threshold: 0, grade: "⚪" as const, note: "정상 입력 거부" },
];

const FALLBACK_TABLE = "api_fallback_log";
/** 🔴 승격 판정 창 — "최근 7일 0건 + 최근 7일 내 관련 배포" (§11-3) */
const DEPLOY_WINDOW_DAYS = 7;

// ── 발견 사항 수집 ─────────────────────────────

type Grade = "🔴" | "🟡" | "⚪";

const findings: { grade: Grade; item: string; evidence: string }[] = [];
let tablesChecked = 0;

function addFinding(grade: Grade, item: string, evidence: string) {
  findings.push({ grade, item, evidence });
}

/** 조회 결과 3분류 — 5/14 Supabase silent fail 박제 (미존재/권한/실제 0건) */
type CountResult =
  | { ok: true; count: number }
  | { ok: false; reason: string };

/**
 * 특정 기간 row 수 조회 (head count만 — 본문 미전송).
 * `error:null + count:null`을 "0건"으로 오독하지 않는다.
 */
async function countRows(
  sb: SupabaseClient,
  table: string,
  sinceIso: string,
  like?: { column: string; pattern: string },
): Promise<CountResult> {
  let q = sb.from(table).select("*", { count: "exact", head: true }).gte("created_at", sinceIso);
  if (like) q = q.like(like.column, like.pattern);

  const { count, error } = await q;

  if (error) {
    // 테이블·컬럼 미존재(42P01·42703·PGRST205) / 권한(42501) 모두 여기로 온다
    const code = error.code ?? "unknown";
    return { ok: false, reason: `조회 실패 (code ${code})` };
  }
  if (count === null || count === undefined) {
    // error도 없고 count도 없는 상태 = 실제 0건이 아니다 (5/14 박제 패턴)
    return { ok: false, reason: "조회 결과 null (테이블 미존재·권한 부족 의심)" };
  }
  return { ok: true, count };
}

/**
 * eq 필터 기반 count (fallback_reason별 24h).
 */
async function countByReason(
  sb: SupabaseClient,
  reason: string,
  sinceIso: string,
): Promise<CountResult> {
  const { count, error } = await sb
    .from(FALLBACK_TABLE)
    .select("*", { count: "exact", head: true })
    .eq("fallback_reason", reason)
    .gte("created_at", sinceIso);

  if (error) return { ok: false, reason: `조회 실패 (code ${error.code ?? "unknown"})` };
  if (count === null || count === undefined) {
    return { ok: false, reason: "조회 결과 null (테이블 미존재·권한 부족 의심)" };
  }
  return { ok: true, count };
}

// ── §11 write endpoint 활성도 ──────────────────

interface TableOutcome {
  table: string;
  windowDays: number;
  zeroGrade: Grade;
  /** 판정 창(windowDays) 실측 카운트(진단 row 제외). null이면 조회 자체가 실패 */
  effective: number | null;
  /** 최근 7일 실측 카운트. windowDays가 7이면 effective와 동일 */
  effectiveShort: number | null;
  /** 최근 7일 관련 경로 commit. null이면 git 판정 불가 */
  deploys: string[] | null;
  error?: string;
}

/**
 * 판정 창 안의 실측 카운트 (전체 − `__diag_%` 진단 row).
 * §11-5 false positive 방지: `.not(col,'like',...)`은 해당 컬럼이 NULL인 row까지
 * 함께 떨어뜨려(NOT NULL LIKE → NULL) 실카운트를 0으로 만들 위험이 있어 "전체 − 진단"으로 센다.
 * (quick_feedback.recommendation_id는 thumbs 응답에만 채워지는 nullable 컬럼)
 */
async function countEffective(
  sb: SupabaseClient,
  table: string,
  diagColumn: string,
  days: number,
): Promise<{ ok: true; effective: number; diag: number } | { ok: false; reason: string }> {
  const sinceIso = new Date(Date.now() - days * 86_400_000).toISOString();
  const total = await countRows(sb, table, sinceIso);
  if (!total.ok) return total;
  const diag = await countRows(sb, table, sinceIso, { column: diagColumn, pattern: "__diag_%" });
  const diagCount = diag.ok ? diag.count : 0;
  return { ok: true, effective: Math.max(0, total.count - diagCount), diag: diagCount };
}

/**
 * 최근 N일 내 관련 경로를 건드린 commit (배포 동반 판정, read-only).
 * CI는 watchman-ci.yml `fetch-depth: 0`이라 전체 히스토리를 본다.
 * git 부재·비-repo 환경이면 null — "판정 불가"로 취급하고 🔴 승격하지 않는다.
 */
function recentRelatedCommits(paths: readonly string[], days: number): string[] | null {
  try {
    const out = execFileSync(
      "git",
      ["log", `--since=${days}.days`, "--format=%h %s", "--", ...paths],
      { encoding: "utf8", cwd: resolve(__dirname, "../.."), stdio: ["ignore", "pipe", "ignore"] },
    );
    return out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

async function checkWriteActivity(sb: SupabaseClient): Promise<void> {
  console.log("▸ §11 write endpoint 활성도 — 판정 창 내 신규 적재 (테이블별 창)");
  console.log("");

  const outcomes: TableOutcome[] = [];

  for (const { table, label, diagColumn, windowDays, zeroGrade, relatedPaths } of WRITE_TABLES) {
    tablesChecked += 1;

    const long = await countEffective(sb, table, diagColumn, windowDays);
    if (!long.ok) {
      console.log(`  ✗ ${table.padEnd(20)} | ${long.reason}`);
      outcomes.push({
        table,
        windowDays,
        zeroGrade,
        effective: null,
        effectiveShort: null,
        deploys: null,
        error: long.reason,
      });
      continue;
    }

    let effectiveShort = long.effective;
    if (windowDays !== DEPLOY_WINDOW_DAYS) {
      const short = await countEffective(sb, table, diagColumn, DEPLOY_WINDOW_DAYS);
      effectiveShort = short.ok ? short.effective : long.effective;
    }

    // 배포 동반 판정은 0건일 때만 (git 호출 최소화)
    const deploys =
      long.effective === 0 || effectiveShort === 0
        ? recentRelatedCommits(relatedPaths, DEPLOY_WINDOW_DAYS)
        : [];

    const diagSuffix = long.diag > 0 ? ` (진단 row ${long.diag}건 제외)` : "";
    const windowLabel = `최근 ${windowDays}일`;
    if (long.effective === 0) {
      console.log(`  ⚠ ${table.padEnd(20)} | ${windowLabel} 0건 — ${label}${diagSuffix}`);
    } else if (effectiveShort === 0) {
      console.log(
        `  ⚪ ${table.padEnd(20)} | ${windowLabel} ${long.effective}건 · 최근 ${DEPLOY_WINDOW_DAYS}일 0건 — ${label} (저트래픽 정상 범위)${diagSuffix}`,
      );
    } else {
      console.log(`  ✓ ${table.padEnd(20)} | ${windowLabel} ${long.effective}건 — ${label}${diagSuffix}`);
    }
    if (deploys && deploys.length > 0) {
      console.log(`      ↳ 최근 ${DEPLOY_WINDOW_DAYS}일 관련 배포 ${deploys.length}건: ${deploys.slice(0, 3).join(" / ")}`);
    }

    outcomes.push({ table, windowDays, zeroGrade, effective: long.effective, effectiveShort, deploys });
  }

  console.log("");

  const errored = outcomes.filter((o) => o.effective === null);
  const alive = outcomes.filter((o) => (o.effective ?? 0) > 0);
  const alivePart =
    alive.length > 0
      ? ` (${alive.map((o) => `${o.table} ${o.effective}건/${o.windowDays}일`).join("·")}은 정상)`
      : " (3개 테이블 전부 0건)";

  if (errored.length > 0) {
    addFinding("🟡", "§11 write 활성도", errored.map((o) => `${o.table} ${o.error}`).join(" · ") + alivePart);
  }

  // §11-3 🔴: 최근 7일 0건 + 최근 7일 내 관련 경로 배포 동반 → 회귀 가능성
  const regressed = outcomes.filter(
    (o) => o.effectiveShort === 0 && o.deploys !== null && o.deploys.length > 0,
  );
  if (regressed.length > 0) {
    const detail = regressed
      .map((o) => `${o.table} 최근 ${DEPLOY_WINDOW_DAYS}일 0건 + 관련 배포 ${o.deploys!.length}건(${o.deploys![0]})`)
      .join(" · ");
    addFinding("🔴", "§11 write 활성도", `${detail}${alivePart} — 배포 후 적재 중단, 회귀 의심(frontend-engineer 진단)`);
  }

  // §11-3: 판정 창(테이블별) 안에서 0건, 배포 동반은 없음 → 테이블별 zeroGrade로 보고
  //   🟡 (search_logs·assessment_results) — 트래픽 정체·클라이언트 진입점 누락 의심
  //   ⚪ (quick_feedback)                  — 저트래픽 기능, 추세 관찰만 (이슈 미발행)
  const zeros = outcomes.filter((o) => o.effective === 0 && !regressed.includes(o));
  for (const grade of ["🟡", "⚪"] as const) {
    const group = zeros.filter((o) => o.zeroGrade === grade);
    if (group.length === 0) continue;
    const detail = group
      .map((o) => {
        const deployNote =
          o.deploys === null ? "배포 동반 판정 불가(git 없음)" : `최근 ${DEPLOY_WINDOW_DAYS}일 관련 배포 없음`;
        return `${o.table} 최근 ${o.windowDays}일 0건(${deployNote})`;
      })
      .join(" · ");
    const note =
      grade === "🟡"
        ? "트래픽 정체 또는 클라이언트 진입점 누락 의심"
        : "저트래픽 기능 — 추세 관찰만 (silent fail은 §12 fallback log가 감시)";
    addFinding(grade, "§11 write 활성도", `${detail}${alivePart} — ${note}`);
  }
}

// ── §12 API fallback 응답 비율 ─────────────────

async function checkFallbackLog(sb: SupabaseClient): Promise<void> {
  const sinceIso = new Date(Date.now() - 86_400_000).toISOString();
  tablesChecked += 1;

  console.log(`▸ §12 API fallback 응답 — ${FALLBACK_TABLE} 최근 24h`);
  console.log("");

  const hits: Record<Grade, string[]> = { "🔴": [], "🟡": [], "⚪": [] };
  const errors: string[] = [];

  for (const reason of FALLBACK_REASONS) {
    const res = await countByReason(sb, reason.name, sinceIso);

    if (!res.ok) {
      console.log(`  ✗ ${reason.name.padEnd(22)} | ${res.reason}`);
      errors.push(`${reason.name} ${res.reason}`);
      continue;
    }

    const over = res.count > reason.threshold;
    const mark = over ? reason.grade : "✓";
    console.log(
      `  ${mark} ${reason.name.padEnd(22)} | ${res.count}건` +
        (over ? ` (임계 ${reason.threshold}건 초과 — ${reason.note})` : ""),
    );

    if (over) {
      hits[reason.grade].push(`${reason.name} ${res.count}건`);
    }
  }

  console.log("");

  if (errors.length > 0) {
    // 테이블 미존재(마이그레이션 미apply) 자체가 감시 공백이라 🟡로 보고
    addFinding("🟡", "§12 API fallback", `${errors.join(" · ")} — ${FALLBACK_TABLE} apply 여부 확인 필요`);
    return;
  }

  if (hits["🔴"].length > 0) {
    addFinding(
      "🔴",
      "§12 API fallback",
      `${hits["🔴"].join(" · ")} (24h) — 환경변수 손상 의심, 5/22 NAVER sensitive 손상 동형 패턴`,
    );
  }
  if (hits["🟡"].length > 0) {
    addFinding("🟡", "§12 API fallback", `${hits["🟡"].join(" · ")} (24h) — 마이그레이션 누락·트래픽 폭주 점검`);
  }
  if (hits["⚪"].length > 0) {
    addFinding("⚪", "§12 API fallback", `${hits["⚪"].join(" · ")} (24h) — 정상 동작 신호, 추세만 관찰`);
  }
}

// ── findings 파일 append ───────────────────────

function flushFindings(): void {
  const path = process.env.WATCHMAN_FINDINGS;
  if (!path) return; // 미설정이면 stdout만
  if (findings.length === 0) return;

  const lines = findings
    .map((f) => `${f.grade}|${f.item}|${f.evidence.replace(/[|\r\n]+/g, " ")}`)
    .join("\n");
  appendFileSync(path, `${lines}\n`, "utf8");
}

// ── main ──────────────────────────────────────

async function main(): Promise<void> {
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  이랑 — write 활성도(§11) · API fallback(§12) 점검");
  console.log(`  ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`);
  console.log("═══════════════════════════════════════════");
  console.log("");

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  // 키 값은 절대 출력하지 않는다 — 존재 여부만
  console.log(`  SUPABASE_URL: ${url ? "설정됨" : "미설정"}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? "설정됨" : "미설정"}`);
  console.log("");

  if (!url || !serviceRoleKey) {
    const missing = [
      !url ? "SUPABASE_URL(또는 NEXT_PUBLIC_SUPABASE_URL)" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ]
      .filter(Boolean)
      .join(" · ");

    console.log(`▸ ${missing} 가 없어서 점검을 건너뛰었어요.`);
    console.log("  로컬이면 .env.local에, CI면 GitHub secrets에 등록해 주세요.");
    console.log("  (점검 대상 테이블이 RLS service_role 전용이라 anon key로는 조회할 수 없어요)");
    console.log("");
    console.log("───────────────────────────────────────────");
    console.log("  테이블 0개 | 위험 0 | 경고 0");
    console.log("───────────────────────────────────────────");

    addFinding("⚪", "§11·§12 write 감시", `${missing} 미설정 — 점검 skip(키 부재는 위험 신호 아님)`);
    flushFindings();
    process.exit(0);
  }

  const sb = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await checkWriteActivity(sb);
  await checkFallbackLog(sb);

  const crit = findings.filter((f) => f.grade === "🔴").length;
  const warn = findings.filter((f) => f.grade === "🟡").length;

  console.log("───────────────────────────────────────────");
  console.log(`  테이블 ${tablesChecked}개 | 위험 ${crit} | 경고 ${warn}`);
  console.log("───────────────────────────────────────────");
  console.log("");

  if (findings.length === 0) {
    console.log("▸ write endpoint·API fallback 모두 정상이에요.");
  } else {
    console.log("▸ 발견 사항:");
    for (const f of findings) {
      console.log(`  ${f.grade} ${f.item} — ${f.evidence}`);
    }
  }
  console.log("");

  flushFindings();

  // 🔴만 exit 1 — 🟡·⚪는 보고만 (aggregator가 이슈로 묶음)
  process.exit(crit > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  // 예외(네트워크 단절 등)는 🟡로 보고하고 exit 0. 여기서 exit 1을 내면 CI step이
  // 죽어 aggregator가 다른 검사 결과까지 못 묶는다 — 🔴만 exit 1이라는 계약 유지.
  const message = err instanceof Error ? err.message : String(err);
  console.error(`✗ 점검 중 예외가 발생했어요: ${message}`);
  addFinding("🟡", "§11·§12 write 감시", `스크립트 예외 — ${message}`);
  flushFindings();
  process.exit(0);
});
