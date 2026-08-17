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
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";

const CI_MODE = process.argv.includes("--ci");

// 로컬은 .env.local 로드, CI는 env를 그대로 사용 (동작 차이는 이것뿐)
if (!CI_MODE) {
  config({ path: resolve(__dirname, "../../.env.local") });
}

// ── 설정 ──────────────────────────────────────

/** §11 점검 대상. diagColumn은 `__diag_%` 진단 row 제외용 식별자 컬럼. */
const WRITE_TABLES = [
  { table: "search_logs", label: "사용자 검색 활동", diagColumn: "query" },
  { table: "quick_feedback", label: "빠른 피드백 응답", diagColumn: "recommendation_id" },
  // ⚠️ watchman.md §11-1에는 `assessments`로 적혀 있으나 실제 테이블은 `assessment_results`다.
  //    근거: supabase/migrations/20260508_assessment_age_group.sql·20260517_·20260518_
  //    모두 `ALTER TABLE assessment_results`. 5/14 admin 테이블명 mismatch로
  //    1주+ silent fail 났던 사고가 이 오기재에서 비롯됐다.
  { table: "assessment_results", label: "유형 진단 응답", diagColumn: "id" },
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
const WINDOW_DAYS = 7;

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
  /** 진단 row를 뺀 실측 카운트. null이면 조회 자체가 실패한 경우 */
  effective: number | null;
  diag: number;
  error?: string;
}

async function checkWriteActivity(sb: SupabaseClient): Promise<void> {
  const sinceIso = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();

  console.log(`▸ §11 write endpoint 활성도 — 최근 ${WINDOW_DAYS}일 신규 적재`);
  console.log("");

  const outcomes: TableOutcome[] = [];

  for (const { table, label, diagColumn } of WRITE_TABLES) {
    tablesChecked += 1;

    const total = await countRows(sb, table, sinceIso);
    if (!total.ok) {
      console.log(`  ✗ ${table.padEnd(20)} | ${total.reason}`);
      outcomes.push({ table, effective: null, diag: 0, error: total.reason });
      continue;
    }

    // §11-5 false positive 방지: `__diag_%` prefix 진단 row는 카운트 제외.
    // 전체 - 진단 방식을 쓴다. `.not(col,'like',...)`은 해당 컬럼이 NULL인 row까지
    // 함께 떨어뜨려(NOT NULL LIKE → NULL) 실카운트를 0으로 만들 위험이 있다.
    // (quick_feedback.recommendation_id는 thumbs 응답에만 채워지는 nullable 컬럼)
    const diag = await countRows(sb, table, sinceIso, {
      column: diagColumn,
      pattern: "__diag_%",
    });
    const diagCount = diag.ok ? diag.count : 0;
    const effective = Math.max(0, total.count - diagCount);

    const diagSuffix = diagCount > 0 ? ` (진단 row ${diagCount}건 제외)` : "";
    if (effective === 0) {
      console.log(`  ⚠ ${table.padEnd(20)} | 0건 — ${label}${diagSuffix}`);
    } else {
      console.log(`  ✓ ${table.padEnd(20)} | ${effective}건 — ${label}${diagSuffix}`);
    }

    outcomes.push({ table, effective, diag: diagCount });
  }

  console.log("");

  const errored = outcomes.filter((o) => o.effective === null);
  const zeros = outcomes.filter((o) => o.effective === 0);
  const alive = outcomes.filter((o) => (o.effective ?? 0) > 0);

  if (errored.length > 0) {
    const evidence =
      errored.map((o) => `${o.table} ${o.error}`).join(" · ") +
      (alive.length > 0
        ? ` (${alive.map((o) => `${o.table} ${o.effective}건`).join("·")}은 정상)`
        : "");
    addFinding("🟡", "§11 write 활성도", evidence);
  }

  if (zeros.length > 0) {
    const zeroPart = zeros.map((o) => `${o.table} 최근 ${WINDOW_DAYS}일 0건`).join(" · ");
    const alivePart =
      alive.length > 0
        ? ` (${alive.map((o) => `${o.table} ${o.effective}건`).join("·")}은 정상)`
        : " (3개 테이블 전부 0건)";
    // §11-3 🔴 조건은 "0건 + 최근 7일 내 관련 배포 동반". CI 러너는 shallow clone
    // (fetch-depth 1)이라 git log 기반 배포 동반 판정이 신뢰할 수 없다 → 과잉 구현 대신
    // 🟡로 올리고 배포 동반 여부는 CoS·watchman 수동 확인에 맡긴다.
    addFinding(
      "🟡",
      "§11 write 활성도",
      `${zeroPart}${alivePart} — 관련 배포 동반 여부 수동 확인 필요(동반 시 🔴 승격)`,
    );
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
