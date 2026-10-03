/**
 * ═══════════════════════════════════════════
 *  §18 지자체 주관 활성 공고 공급량 점검
 *
 *  사용: npx tsx scripts/watchman/check-local-program-supply.ts
 *  CI:   npx tsx scripts/watchman/check-local-program-supply.ts --ci
 *
 *  배경 (2026-09-29 C안):
 *    수집 경로 3종(RDA 똑똑!청년농부 · agrix · RDA 행사)에는 **지자체
 *    귀농귀촌지원센터·시·군 농업기술센터가 직접 운영하는 프로그램이 0건**이었다.
 *    사용자가 가장 먼저 찾는 것이 "내 시·군에서 뭘 해주나"인데 그 층이 통째로 비어 있었고,
 *    아무 알림도 울리지 않았다 — 크롤이 "성공"으로 끝나기 때문이다.
 *    수집 건수가 아니라 **사용자가 지금 신청할 수 있는 지자체 공고 수**를 센다.
 *
 *  함께 보는 것:
 *    · `rda-events` 타겟이 배포본에 없어 매일 HTTP 400을 받던 사고(2026-09-29 발견)처럼
 *      "워크플로는 초록인데 데이터는 안 들어오는" 상태를 결과 쪽에서 잡는다.
 *
 *  ★ read-only 전용 (data-engineer 2026-05-11 1on1 가드 #1) — SELECT만 한다.
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

if (!CI_MODE) {
  config({ path: resolve(__dirname, "../../.env.local") });
}

// ── 설정 ──────────────────────────────────────

/** 점검 대상 테이블 — 컬럼 이름이 달라 테이블별로 지정 */
const TARGETS = [
  { table: "support_programs", label: "지원사업", endColumn: "application_end" },
  { table: "education_courses", label: "교육과정", endColumn: "application_end" },
  { table: "farm_events", label: "체험·행사", endColumn: "application_end" },
] as const;

/**
 * 지자체 주관 판정 토큰 — `organization`에 하나라도 있으면 지자체 주관으로 본다.
 * 광역·기초 모두 포함한다(도농업기술원도 지자체다).
 */
const LOCAL_ORG_TOKENS = [
  "귀농귀촌지원센터",
  "농업기술센터",
  "농업기술원",
  "시청",
  "군청",
  "구청",
  "도청",
  "귀농지원센터",
  "귀농산어촌",
];

/** 활성으로 보는 상태 어휘 (테이블마다 어휘가 다르다) */
const ACTIVE_STATUSES = ["모집중", "모집예정", "접수중", "접수예정"];

/** 🟡 임계 — 활성 지자체 공고가 이보다 적으면 공급 경로 점검 */
const MIN_ACTIVE_LOCAL = 5;

/** 🔴 임계 — 완전 0건이면 수집 경로가 끊긴 것으로 본다 */
const CRITICAL_ACTIVE_LOCAL = 0;

type Grade = "🔴" | "🟡" | "⚪";

const findings: string[] = [];

function addFinding(grade: Grade, item: string, evidence: string) {
  findings.push(`${grade}|${item}|${evidence}`);
}

function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

interface Row {
  organization: string | null;
  region: string | null;
  sigungu?: string | null;
  status: string | null;
  application_end: string | null;
}

function isLocalOrg(org: string | null): boolean {
  if (!org) return false;
  return LOCAL_ORG_TOKENS.some((token) => org.includes(token));
}

async function countActiveLocal(
  sb: SupabaseClient,
  table: string,
  endColumn: string,
  today: string,
): Promise<{ total: number; local: number; error?: string }> {
  const { data, error } = await sb
    .from(table)
    .select(`organization, region, status, ${endColumn}`)
    .in("status", ACTIVE_STATUSES)
    .limit(5000);

  if (error) return { total: 0, local: 0, error: error.message };

  const rows = (data ?? []) as unknown as Row[];
  // 상태 컬럼이 stale할 수 있으므로 접수 종료일로 한 번 더 거른다.
  // 9999-12-31(공고 미발표)은 "지금 신청 가능"이 아니라 제외한다.
  const active = rows.filter((r) => {
    const end = r.application_end;
    if (!end) return true;
    if (end.startsWith("9999")) return false;
    return end >= today;
  });

  return { total: active.length, local: active.filter((r) => isLocalOrg(r.organization)).length };
}

function flushFindings(): void {
  const file = process.env.WATCHMAN_FINDINGS;
  if (!file || findings.length === 0) return;
  appendFileSync(file, findings.join("\n") + "\n", "utf-8");
}

async function main(): Promise<void> {
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  이랑 — §18 지자체 주관 활성 공고 공급량");
  console.log(`  ${kstToday()} KST`);
  console.log("═══════════════════════════════════════════");
  console.log("");

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!url || !serviceRoleKey) {
    const missing = !url ? "SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY";
    console.log(`  ⚪ ${missing} 미설정 — 점검 skip`);
    addFinding("⚪", "§18 지자체 공급", `${missing} 미설정 — 점검 skip(키 부재는 위험 신호 아님)`);
    flushFindings();
    return;
  }

  const sb = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const today = kstToday();

  let localTotal = 0;
  let activeTotal = 0;
  const errors: string[] = [];
  const perTable: string[] = [];

  for (const target of TARGETS) {
    const { total, local, error } = await countActiveLocal(
      sb,
      target.table,
      target.endColumn,
      today,
    );
    if (error) {
      errors.push(`${target.table}: ${error}`);
      console.log(`  ⚠️  ${target.label}(${target.table}) 조회 실패 — ${error}`);
      continue;
    }
    localTotal += local;
    activeTotal += total;
    perTable.push(`${target.label} ${local}/${total}`);
    console.log(`  ${target.label}(${target.table}): 활성 ${total}건 · 그중 지자체 주관 ${local}건`);
  }

  console.log("");
  console.log(`  합계 — 활성 ${activeTotal}건 · 지자체 주관 ${localTotal}건`);
  console.log("");

  if (errors.length > 0) {
    addFinding("🟡", "§18 지자체 공급", `${errors.join(" · ")} — 테이블·권한 확인 필요`);
  }

  const detail = perTable.join(" · ");

  if (localTotal <= CRITICAL_ACTIVE_LOCAL) {
    console.log(`  🔴 지자체 주관 활성 공고 ${localTotal}건`);
    addFinding(
      "🔴",
      "§18 지자체 공급",
      `지자체 주관 활성 공고 0건 (${detail}) — 그린대로 수집 경로 점검 필요. ` +
        `sync-data.yml greendaero-education·greendaero-live 레그 결과와 Edge Function 배포 상태를 함께 확인하세요.`,
    );
  } else if (localTotal < MIN_ACTIVE_LOCAL) {
    console.log(`  🟡 지자체 주관 활성 공고 ${localTotal}건 < 임계 ${MIN_ACTIVE_LOCAL}건`);
    addFinding(
      "🟡",
      "§18 지자체 공급",
      `지자체 주관 활성 공고 ${localTotal}건 (임계 ${MIN_ACTIVE_LOCAL}건, ${detail}) — 수집 경로 또는 모집 비수기 확인`,
    );
  } else {
    console.log(`  ✓ 지자체 주관 활성 공고 ${localTotal}건 ≥ 임계 ${MIN_ACTIVE_LOCAL}건`);
  }

  flushFindings();

  if (findings.some((f) => f.startsWith("🔴"))) process.exit(1);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("  ⚠️  스크립트 예외:", message);
  addFinding("🟡", "§18 지자체 공급", `스크립트 예외 — ${message}`);
  flushFindings();
});
