#!/usr/bin/env npx tsx
/* ==========================================================================
   마이그레이션 신규 컬럼 추가 시 NOT NULL 점검 (CI 게이트)

   5/26 quick_feedback 33일 silent fail 사고(commit edb7b3b Lessons Learned)
   영구 차단. 5/15·5/16 마이그레이션이 신규 컬럼(thumbs/request_kind) 추가하면서
   기존 rating/message NOT NULL DROP을 누락 → thumbs-only POST가 23502
   not-null violation → /api/quick-feedback이 silent 202 → 33일 INSERT 0건.

   CLAUDE.md Lessons Learned 교훈 #1:
     "신규 모드(컬럼) 추가 마이그레이션 체크리스트:
      기존 NOT NULL 컬럼이 신규 모드에서 NULL이어도 되는가?"

   ─────────────────────────────────────────────────────────────────────────
   점검 로직
   ─────────────────────────────────────────────────────────────────────────
   Step 1. supabase/migrations/*.sql 전수 scan
   Step 2. ALTER TABLE <t> ADD COLUMN <c> 패턴 식별. 1건이라도 있으면
           "신규 모드 추가 sprint" 후보 → 동반 조치 4종 중 1개 이상 요구

   동반 조치 4종 (1개 이상 존재 시 pass):
     (a) ALTER COLUMN <existing_col> DROP NOT NULL
         기존 NOT NULL 완화 — 5/26 fix의 핵심 패턴
     (b) ADD CONSTRAINT <name> CHECK (<col_a> IS NOT NULL OR <col_b> IS NOT NULL ...)
         mode-check 안전망. 최소 하나는 NOT NULL 강제
     (c) ALTER COLUMN <existing_col> SET DEFAULT <value>
         기존 컬럼 기본값 채움 — legacy INSERT 통과 보장
         (주의: ADD COLUMN ... DEFAULT는 자기-컬럼 한정이라 동반 조치 아님)
     (d) -- mode-check-ok: <reason>  또는  -- not-null-checked: <reason>
         명시적 ack 코멘트 — false positive 우회용 (grandfathering 포함)

   Step 3. (b) CHECK가 있을 때 신규 ADD COLUMN 컬럼이 CHECK 식에 포함되는지
           확인. 안 포함되면 warning (안전망에 신규 모드 누락 가능성)

   ─────────────────────────────────────────────────────────────────────────
   exit code: 모든 마이그레이션 pass 0 / 하나라도 fail 1
   ========================================================================== */

import * as fs from "node:fs";
import * as path from "node:path";

interface MigrationCheck {
  file: string;
  addColumns: { table: string; column: string }[];
  companions: {
    dropNotNull: string[]; // 기존 컬럼명 리스트
    checkConstraints: { name: string; refColumns: string[] }[];
    setDefault: string[]; // 기존 컬럼명 리스트
    ack: string[]; // ack 코멘트 reason 리스트
  };
  status: "pass" | "warning" | "fail";
  messages: string[];
}

const MIG_DIR = path.join(__dirname, "..", "supabase", "migrations");

function readMigration(file: string): string {
  return fs.readFileSync(path.join(MIG_DIR, file), "utf-8");
}

/** SQL 코멘트(`-- ...`) 제거 — statement 분리 시 false-match 차단 */
function stripSqlComments(sql: string): string {
  return sql
    .split("\n")
    .map((line) => {
      // `--` 이후를 자른다. (문자열 리터럴 안 `--`는 거의 안 쓰니 단순 처리)
      const idx = line.indexOf("--");
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join("\n");
}

// ─────────────────────────────────────────
// 패턴 추출기
// ─────────────────────────────────────────

/** ALTER TABLE <table> ... ADD COLUMN [IF NOT EXISTS] <col> ... */
function extractAddColumns(sql: string): { table: string; column: string }[] {
  const results: { table: string; column: string }[] = [];
  // ALTER TABLE은 여러 ADD/ALTER를 한 statement로 묶을 수 있어 statement 단위로 분리
  // 간단히: 각 ALTER TABLE statement를 ; 까지 grab
  const stmtRegex =
    /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?([A-Za-z_][\w.]*)\s+([\s\S]*?);/gi;
  let m: RegExpExecArray | null;
  while ((m = stmtRegex.exec(sql)) !== null) {
    const table = m[1];
    const body = m[2];
    // body 안의 "ADD COLUMN [IF NOT EXISTS] <col>" 추출
    const colRegex =
      /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_]\w*)/gi;
    let cm: RegExpExecArray | null;
    while ((cm = colRegex.exec(body)) !== null) {
      results.push({ table, column: cm[1] });
    }
  }
  return results;
}

/** ALTER COLUMN <col> DROP NOT NULL */
function extractDropNotNull(sql: string): string[] {
  const results: string[] = [];
  const re = /ALTER\s+COLUMN\s+([A-Za-z_]\w*)\s+DROP\s+NOT\s+NULL/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    results.push(m[1]);
  }
  return results;
}

/** ADD CONSTRAINT <name> CHECK (...) — IS NOT NULL OR 분기를 포함하는 mode-check만 */
function extractCheckConstraints(
  sql: string,
): { name: string; refColumns: string[] }[] {
  const results: { name: string; refColumns: string[] }[] = [];
  // ADD CONSTRAINT <name> CHECK ( ... )
  // CHECK 식 내 균형 괄호 — SQL 마이그레이션은 보통 단순해 1-depth로 충분
  const re =
    /ADD\s+CONSTRAINT\s+([A-Za-z_]\w*)\s+CHECK\s*\(([\s\S]*?)\)\s*[;,]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const name = m[1];
    const body = m[2];
    // IS NOT NULL OR ... 패턴 — mode-check 안전망
    if (/IS\s+NOT\s+NULL\s+OR\s+/i.test(body)) {
      // 식 안 참조 컬럼명 추출 (단순 식별자)
      const refColumns = Array.from(
        body.matchAll(/([A-Za-z_]\w*)\s+IS\s+NOT\s+NULL/gi),
      ).map((cm) => cm[1]);
      results.push({ name, refColumns });
    }
  }
  return results;
}

/** ALTER COLUMN <col> SET DEFAULT <value> — 기존 컬럼에 DEFAULT 부여 */
function extractSetDefault(sql: string): string[] {
  const results: string[] = [];
  const re = /ALTER\s+COLUMN\s+([A-Za-z_]\w*)\s+SET\s+DEFAULT\s+/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    results.push(m[1]);
  }
  return results;
}

/** -- mode-check-ok: <reason>  또는  -- not-null-checked: <reason> */
function extractAck(sql: string): string[] {
  const results: string[] = [];
  const re = /--\s*(?:mode-check-ok|not-null-checked)\s*:\s*(.+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    results.push(m[1].trim());
  }
  return results;
}

// ─────────────────────────────────────────
// 검증
// ─────────────────────────────────────────

function checkMigration(file: string): MigrationCheck {
  const rawSql = readMigration(file);
  // ack 코멘트는 raw에서 추출, 나머지 SQL 분석은 strip된 본문에서
  const sql = stripSqlComments(rawSql);
  const addColumns = extractAddColumns(sql);
  const companions = {
    dropNotNull: extractDropNotNull(sql),
    checkConstraints: extractCheckConstraints(sql),
    setDefault: extractSetDefault(sql),
    ack: extractAck(rawSql),
  };

  const messages: string[] = [];
  let status: MigrationCheck["status"] = "pass";

  // ADD COLUMN이 0건이면 무조건 pass (점검 대상 아님)
  if (addColumns.length === 0) {
    messages.push("no ADD COLUMN");
    return { file, addColumns, companions, status: "pass", messages };
  }

  // 동반 조치 1건 이상 있는지
  const companionCount =
    companions.dropNotNull.length +
    companions.checkConstraints.length +
    companions.setDefault.length +
    companions.ack.length;

  if (companionCount === 0) {
    status = "fail";
    messages.push(
      `ADD COLUMN ${addColumns.length}건 (${addColumns
        .map((c) => `${c.table}.${c.column}`)
        .join(", ")}), 동반 조치 0건`,
    );
    messages.push(
      "Hint: 기존 NOT NULL 컬럼이 신규 모드에서 NULL이어도 되는지 확인",
    );
    messages.push(
      '       (a) `ALTER COLUMN <existing> DROP NOT NULL`  또는' +
        "  (b) `ADD CONSTRAINT ... CHECK (... IS NOT NULL OR ...)`",
    );
    messages.push(
      '       (c) `ALTER COLUMN <existing> SET DEFAULT <v>`  또는' +
        "  (d) `-- mode-check-ok: <reason>` ack 코멘트",
    );
    return { file, addColumns, companions, status, messages };
  }

  // companion 종류별 보고
  const parts: string[] = [];
  if (companions.dropNotNull.length > 0)
    parts.push(`DROP NOT NULL ${companions.dropNotNull.join(",")}`);
  if (companions.checkConstraints.length > 0)
    parts.push(
      `CHECK ${companions.checkConstraints.map((c) => c.name).join(",")}`,
    );
  if (companions.setDefault.length > 0)
    parts.push(`SET DEFAULT ${companions.setDefault.join(",")}`);
  if (companions.ack.length > 0)
    parts.push(`ack ${companions.ack.length}건`);
  messages.push(
    `ADD COLUMN ${addColumns.length}건, 동반 조치 ${companionCount}건 (${parts.join(" / ")})`,
  );

  // Step 3. CHECK가 있을 때 신규 컬럼 포함 여부
  if (companions.checkConstraints.length > 0) {
    for (const cc of companions.checkConstraints) {
      const newCols = addColumns.map((c) => c.column);
      const newColsInCheck = newCols.filter((c) => cc.refColumns.includes(c));
      if (newCols.length > 0 && newColsInCheck.length === 0) {
        // 신규 컬럼 중 하나도 CHECK에 안 들어있음
        // → 다음 modal 추가 sprint 대비 warning
        if (status === "pass") status = "warning";
        messages.push(
          `(warning) CHECK ${cc.name}에 신규 컬럼(${newCols.join(",")}) 미포함 — 후속 sprint에서 신규 모드 누락 가능성`,
        );
      }
    }
  }

  return { file, addColumns, companions, status, messages };
}

function check(): MigrationCheck[] {
  const files = fs
    .readdirSync(MIG_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return files.map(checkMigration);
}

// ─────────────────────────────────────────
// 출력
// ─────────────────────────────────────────

function main(): void {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  🔍 마이그레이션 신규 컬럼 추가 시 NOT NULL 점검        ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const results = check();
  console.log(`[check-migration-not-null]`);
  console.log(
    `Scanning supabase/migrations/*.sql (${results.length} files)...\n`,
  );

  let failCount = 0;
  let warnCount = 0;
  let passCount = 0;

  for (const r of results) {
    const icon =
      r.status === "fail" ? "🔴" : r.status === "warning" ? "🟡" : "✅";
    console.log(`${icon} ${r.file}`);
    for (const m of r.messages) {
      console.log(`   ${m}`);
    }
    console.log("");

    if (r.status === "fail") failCount++;
    else if (r.status === "warning") warnCount++;
    else passCount++;
  }

  console.log("══════════════════════════════════════════════════════════");
  console.log(
    `Summary: ${failCount} fail / ${warnCount} warning / ${passCount} pass`,
  );

  if (failCount === 0) {
    console.log("\n✅ 모든 마이그레이션 통과");
    console.log("DB 직접 write 없음 ✅ (정적 SQL 파일 분석만)");
    process.exit(0);
  } else {
    console.log(
      `\n❌ 마이그레이션 ${failCount}건 실패 — 신규 모드 추가 시 기존 NOT NULL 컬럼 점검 누락`,
    );
    console.log(
      "   CLAUDE.md Lessons Learned (2026-05-26 quick_feedback 33일 silent fail) 참조",
    );
    console.log(
      "   해결: (a) DROP NOT NULL · (b) CHECK 안전망 · (c) SET DEFAULT · (d) ack 코멘트 중 1개 이상 추가",
    );
    process.exit(1);
  }
}

main();
