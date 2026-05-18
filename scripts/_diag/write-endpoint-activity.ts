/**
 * write endpoint INSERT 카운트 측정 (watchman 영역 10).
 * 3 테이블 (search_logs · quick_feedback · assessment_results) read-only count.
 *
 * 5/18 첫 시행 — silent fail 종결 후 정상 적재 추세 baseline 박제.
 * 화·금 사이클에 재실행으로 추세 비교 가능.
 *
 * 실행:
 *   npx tsx scripts/_diag/write-endpoint-activity.ts
 *
 * 5/11 가드 #1 (read-only) + #5 (CoS 보고 라인) 적용.
 */

import { config } from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
if (!url || !serviceKey) {
  console.error("[fail] env 미설정 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const now = new Date();
const since7d = new Date(now.getTime() - 7 * 86400000).toISOString();
const since30d = new Date(now.getTime() - 30 * 86400000).toISOString();

interface TableSpec {
  table: string;
  col: string;
  /** silent fail 회복 시점 — 그 이후 INSERT만 유효. null이면 무관 */
  recoveredSince?: string;
  recoveredNote?: string;
}

const TABLES: TableSpec[] = [
  { table: "search_logs", col: "created_at" },
  {
    table: "quick_feedback",
    col: "created_at",
    recoveredSince: "2026-05-16",
    recoveredNote: "5/16 commit 1e2d748 RLS service_role API Route 우회 후 정상 적재",
  },
  { table: "assessment_results", col: "created_at" },
];

async function countSince(table: string, col: string, sinceISO: string): Promise<number | null> {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(col, sinceISO);
  if (error) {
    console.error(`  [error ${table}] ${error.message}`);
    return null;
  }
  return count ?? null;
}

async function countTotal(table: string): Promise<number | null> {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error(`  [error ${table}] ${error.message}`);
    return null;
  }
  return count ?? null;
}

async function main(): Promise<void> {
  console.log(`=== write endpoint INSERT 카운트 (read-only) ===`);
  console.log(`기준 시각: ${now.toISOString()}`);
  console.log(`7일 컷: ${since7d}`);
  console.log(`30일 컷: ${since30d}\n`);

  for (const spec of TABLES) {
    const total = await countTotal(spec.table);
    const d30 = await countSince(spec.table, spec.col, since30d);
    const d7 = await countSince(spec.table, spec.col, since7d);

    const recoveredCount = spec.recoveredSince
      ? await countSince(spec.table, spec.col, `${spec.recoveredSince}T00:00:00Z`)
      : null;

    console.log(`[${spec.table}]`);
    console.log(`  누적 전체: ${total ?? "n/a"}건`);
    console.log(`  최근 30일: ${d30 ?? "n/a"}건`);
    console.log(`  최근 7일:  ${d7 ?? "n/a"}건`);
    if (spec.recoveredSince && recoveredCount !== null) {
      console.log(
        `  ${spec.recoveredSince}~ 복구 후: ${recoveredCount}건 (${spec.recoveredNote})`,
      );
    }

    // 판정
    if (d7 === null) {
      console.log(`  ⚪ 판정 불가\n`);
      continue;
    }
    if (d7 === 0) {
      const isRecoveredRecent =
        spec.recoveredSince &&
        new Date(spec.recoveredSince).getTime() > now.getTime() - 7 * 86400000;
      if (isRecoveredRecent) {
        console.log(
          `  🟡 7일 INSERT 0건 (복구 직후 ${spec.recoveredSince}, low traffic 가능)\n`,
        );
      } else {
        console.log(`  🔴 7일 INSERT 0건 — silent fail 의심\n`);
      }
    } else if (d7 < 5) {
      console.log(`  🟡 7일 INSERT ${d7}건 — low traffic\n`);
    } else {
      console.log(`  ⚪ 정상 적재\n`);
    }
  }

  console.log(`=== 진단 완료 — INSERT 수행 0건 (read-only 가드 준수) ===`);
}

main().catch((err) => {
  console.error("[fail]", err);
  process.exit(1);
});
