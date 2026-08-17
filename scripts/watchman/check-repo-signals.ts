/**
 * ═══════════════════════════════════════════
 *  데이터 정정 이력(§9) · 지원사업 모집 사이클(§10) · 의존성 보안(§6) 점검
 *
 *  사용: npx tsx scripts/watchman/check-repo-signals.ts
 *  CI:   npx tsx scripts/watchman/check-repo-signals.ts --ci
 *
 *  배경: 세 항목 모두 reminder-watchman이 화·금 세션에서 수동 실행하는 구조였다.
 *        8/4 www 인증서 갱신 실패가 세션 부재로 13일 방치된 사고 이후,
 *        세션 의존 감시 항목을 CI로 승격하는 중이다.
 *
 *  §9  (2026-05-09 추가) — 인터뷰 본문 4종 제거 commit 후 `/about/corrections`가
 *        4월에서 멈춰 있었음. 정정을 했는데 정정 이력에 없으면 그 페이지의 가치가 없다.
 *  §10 (2026-05-10 추가) — /programs 14건 중 12건 마감. 1~3월·7~9월이 모집 집중
 *        사이클이라, 시즌 중 활성 SP가 적으면 사이트가 outdated로 보인다.
 *  §6  — `npm audit` 주간 실행 권고. 카운트만 본다(개발 의존성 취약점이 대부분).
 *
 *  ★ read-only 전용 (data-engineer 2026-05-11 1on1 가드 #1)
 *    이 스크립트가 하는 일은 git 조회 · npm audit · 정적 데이터 import 뿐이다.
 *    파일을 고치거나 prod 데이터에 쓰는 코드는 WATCHMAN_FINDINGS append 외에 없다.
 *
 *  출력 계약: 발견 사항은 WATCHMAN_FINDINGS 파일에 `등급|항목|근거` 1행씩 append.
 *            GitHub Issue는 만들지 않는다(aggregator 담당).
 *            exit code — 🔴 있으면 1, 그 외 0. 예외·조회 실패는 exit 0 + 🟡/⚪.
 * ═══════════════════════════════════════════
 */

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";

import { PROGRAMS } from "../../src/lib/data/programs";
import { deriveStatus, isUnannounced } from "../../src/lib/program-status";

const CI_MODE = process.argv.includes("--ci");
const REPO_ROOT = resolve(__dirname, "../..");

// ── 설정 ──────────────────────────────────────

/** §9 점검 창 (일) */
const CORRECTION_WINDOW_DAYS = 7;

/** §9 정정 이력 페이지 (git 경로) */
const CORRECTIONS_PAGE = "src/app/about/corrections/page.tsx";

/** §9·§10 데이터 디렉토리 prefix */
const DATA_DIR = "src/lib/data/";

/**
 * §9-1 "정정 후보" 키워드.
 * "수정"은 §9-1 원문에 있으나 거의 모든 commit 메시지에 등장해 실효 필터가 못 된다
 * (§9-3의 false positive 방지 취지와 정면 충돌) → 의도적으로 제외했다.
 * 사실 정정을 뜻하는 어휘만 남긴다.
 */
const CORRECTION_KEYWORDS = ["정정", "오류", "보정", "오표기", "오기재"];

/** §10 모집 시즌 (KST 월) — 1~3월·7~9월 */
const PEAK_MONTHS = [1, 2, 3, 7, 8, 9];

/** §10 판정 임계 */
const ACTIVE_SP_OFFSEASON_MIN = 3;
const ACTIVE_SP_PEAK_MIN = 5;

/** §10 데이터 파일 stale 임계 (일) */
const DATA_STALE_DAYS = 90;

/** §10 마지막 수정일 점검 대상 (watchman.md §10-2 원문 그대로) */
const CYCLE_DATA_FILES = ["src/lib/data/landing.ts", "src/lib/data/programs.ts"];

/** §6 판정 임계 */
const AUDIT_CRITICAL_MIN = 1;
const AUDIT_HIGH_MIN = 5;

/** npm audit 타임아웃 (ms) — 네트워크 지연이 CI step을 물고 늘어지지 않게 */
const AUDIT_TIMEOUT_MS = 120_000;

/**
 * git log 필드 구분자. commit 제목에 `|`·탭이 들어가도 안전하도록 제어문자(U+0001)를 쓴다.
 * 제목 자체에 이 문자가 들어갈 일은 없다.
 */
const SEP = "\u0001";

// ── 발견 사항 수집 ─────────────────────────────

type Grade = "🔴" | "🟡" | "⚪";

const findings: { grade: Grade; item: string; evidence: string }[] = [];

function addFinding(grade: Grade, item: string, evidence: string) {
  findings.push({ grade, item, evidence });
}

// ── git 헬퍼 ───────────────────────────────────

/** git 명령 1회. 실패하면 null (예외를 밖으로 던지지 않는다) */
function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** KST 기준 오늘 (YYYY-MM-DD). toISOString()은 UTC라 자정~오전 9시에 어제가 나온다 */
function kstToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** KST 기준 현재 월 (1~12) */
function kstMonth(): number {
  return Number(kstToday().slice(5, 7));
}

/** N일 전 날짜 (YYYY-MM-DD) */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * git 히스토리 가용성 판정.
 *
 * ★ CI 함정: actions/checkout 기본값은 shallow clone(fetch-depth 1)이라
 *   커밋이 1개만 보인다. 이때 `git log --since=7days`는 조용히 0건을 돌려주고,
 *   그걸 "정정 후보 0건 = 정상"으로 읽으면 감시가 죽은 걸 아무도 모른다(silent 열화).
 *   그래서 히스토리 부족을 명시적으로 감지해 ⚪ skip으로 정직하게 보고한다.
 */
interface HistoryState {
  usable: boolean;
  reason: string;
  commitCount: number;
  shallow: boolean;
}

function checkHistory(): HistoryState {
  const inRepo = git(["rev-parse", "--is-inside-work-tree"]);
  if (inRepo !== "true") {
    return { usable: false, reason: "git 저장소가 아니거나 git 실행 불가", commitCount: 0, shallow: false };
  }

  const shallow = git(["rev-parse", "--is-shallow-repository"]) === "true";
  const countRaw = git(["rev-list", "--count", "HEAD"]);
  const commitCount = countRaw ? Number(countRaw) : 0;

  if (shallow) {
    return {
      usable: false,
      reason: `shallow clone (커밋 ${commitCount}개) — actions/checkout에 fetch-depth: 0 필요`,
      commitCount,
      shallow,
    };
  }
  if (!Number.isFinite(commitCount) || commitCount <= 1) {
    return {
      usable: false,
      reason: `히스토리 ${commitCount}개 커밋뿐 — ${CORRECTION_WINDOW_DAYS}일 창 비교 불가`,
      commitCount,
      shallow,
    };
  }
  return { usable: true, reason: "", commitCount, shallow };
}

// ── §9 데이터 정정 이력 갱신 누락 ────────────────

interface CorrectionCandidate {
  sha: string;
  date: string;
  ct: number;
  subject: string;
  dataFiles: string[];
  deletions: number;
}

/** commit 1건의 데이터 파일 변경 통계 (added/deleted) */
function dataFileStats(sha: string): { files: string[]; deletions: number } {
  // --no-merges 대상만 넘어오므로 merge diff 걱정은 없다
  const out = git(["show", "--numstat", "--pretty=format:", sha, "--", DATA_DIR]);
  if (!out) return { files: [], deletions: 0 };

  const files: string[] = [];
  let deletions = 0;

  for (const line of out.split("\n")) {
    const cols = line.trim().split("\t");
    if (cols.length < 3) continue;
    const [, del, path] = cols;
    files.push(path);
    // 바이너리는 "-\t-" → 판정 불가라 append-only로 단정하지 않고 삭제 있음으로 본다
    deletions += del === "-" ? 1 : Number(del) || 0;
  }

  return { files, deletions };
}

function isCorrectionCandidate(subject: string): boolean {
  // §9-1 조건 1: fix: / fix(scope): prefix
  if (/^fix(\([^)]*\))?!?:/.test(subject)) return true;
  // §9-1 조건 2: 정정 계열 키워드
  return CORRECTION_KEYWORDS.some((k) => subject.includes(k));
}

function checkCorrectionHistory(history: HistoryState): void {
  console.log(`▸ §9 데이터 정정 이력 — 최근 ${CORRECTION_WINDOW_DAYS}일 정정 후보 commit`);
  console.log("");

  if (!history.usable) {
    console.log(`  ⚪ 점검 skip — ${history.reason}`);
    console.log("     히스토리가 없는 걸 '정정 후보 0건 = 정상'으로 읽으면 감시가 조용히 죽어요.");
    console.log("");
    addFinding(
      "⚪",
      "§9 정정 이력",
      `git 히스토리 부족 — ${history.reason} · §9 점검과 §10 파일 수정일 판정 모두 skip(0건 아님)`,
    );
    return;
  }

  const since = daysAgo(CORRECTION_WINDOW_DAYS);
  const log = git([
    "log",
    "--no-merges",
    `--since=${since}`,
    `--pretty=format:%H${SEP}%cs${SEP}%ct${SEP}%s`,
  ]);

  if (log === null) {
    console.log("  ⚪ git log 조회 실패 — 점검 skip");
    console.log("");
    addFinding("⚪", "§9 정정 이력", `git log 조회 실패 — 최근 ${CORRECTION_WINDOW_DAYS}일 점검 skip`);
    return;
  }

  const commits = log
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => {
      const [sha, date, ct, ...rest] = l.split(SEP);
      return { sha, date, ct: Number(ct), subject: rest.join(SEP) };
    });

  const candidates: CorrectionCandidate[] = [];
  let appendOnlySkipped = 0;
  let nonDataSkipped = 0;

  for (const c of commits) {
    if (!isCorrectionCandidate(c.subject)) continue;

    const { files, deletions } = dataFileStats(c.sha);

    // §9-3: 변경 파일이 src/lib/data/* 외에만 있으면 제외 (typo·CSS·리팩터링 fix)
    if (files.length === 0) {
      nonDataSkipped += 1;
      continue;
    }
    // §9-3: 순수 신규 추가(append-only)는 정정 아님
    if (deletions === 0) {
      appendOnlySkipped += 1;
      continue;
    }

    candidates.push({ ...c, dataFiles: files, deletions });
  }

  const correctionsCtRaw = git(["log", "-1", "--pretty=format:%ct", "--", CORRECTIONS_PAGE]);
  const correctionsDate = git(["log", "-1", "--pretty=format:%cs", "--", CORRECTIONS_PAGE]) || "이력 없음";
  const correctionsCt = correctionsCtRaw ? Number(correctionsCtRaw) : 0;

  console.log(`  검사 commit ${commits.length}건 (since ${since})`);
  console.log(`  정정 후보 ${candidates.length}건` +
    (nonDataSkipped > 0 ? ` · 데이터 파일 무변경 제외 ${nonDataSkipped}건` : "") +
    (appendOnlySkipped > 0 ? ` · append-only 제외 ${appendOnlySkipped}건` : ""));
  console.log(`  ${CORRECTIONS_PAGE} 마지막 수정: ${correctionsDate}`);
  console.log("");

  for (const c of candidates) {
    const reflected = correctionsCt > c.ct;
    const mark = reflected ? "✓" : "⚠";
    console.log(`  ${mark} ${c.sha.slice(0, 7)} ${c.date} ${c.subject}`);
    console.log(`     데이터 파일 ${c.dataFiles.length}개 · 삭제 ${c.deletions}줄`);
  }
  if (candidates.length > 0) console.log("");

  const unreflected = candidates.filter((c) => correctionsCt <= c.ct);
  if (unreflected.length > 0) {
    const shas = unreflected.map((c) => c.sha.slice(0, 7)).join("·");
    addFinding(
      "🟡",
      "§9 정정 이력",
      `최근 ${CORRECTION_WINDOW_DAYS}일 정정 후보 ${unreflected.length}건(${shas}) 이후 ${CORRECTIONS_PAGE} 미수정 (마지막 ${correctionsDate}) — /about/corrections 갱신 권고`,
    );
  }
}

// ── §10 지원사업 모집 사이클 ────────────────────

function checkProgramCycle(history: HistoryState): void {
  const month = kstMonth();
  const isPeak = PEAK_MONTHS.includes(month);
  const seasonLabel = isPeak ? "모집 시즌(1~3월·7~9월)" : "비수기(4~6월·10~12월)";

  console.log(`▸ §10 모집 사이클 — 활성 SP 카운트 (${kstToday()} KST · ${seasonLabel})`);
  console.log("");

  // 하드코딩된 status 필드가 아니라 신청 기간 기반 파생 상태로 센다.
  // deriveStatus는 KST today를 쓰므로 UTC 9시간 함정(5/15 박제)이 이미 막혀 있다.
  const rows = PROGRAMS.map((p) => ({
    id: p.id,
    status: deriveStatus(p.applicationStart, p.applicationEnd),
    unannounced: isUnannounced(p.applicationStart, p.applicationEnd),
  }));

  const open = rows.filter((r) => r.status === "모집중").length;
  const upcoming = rows.filter((r) => r.status === "모집예정" && !r.unannounced).length;
  // 9999 페어는 deriveStatus가 "모집예정"으로 산출하지만 실제론 공고 미발표(일자 미정).
  // 사용자가 지금 신청할 수 있는 사업이 아니므로 활성 카운트에서 뺀다(가드 #3 정합).
  const unannounced = rows.filter((r) => r.unannounced).length;
  const closed = rows.filter((r) => r.status === "마감").length;
  const active = open + upcoming;

  console.log(`  전체 ${PROGRAMS.length}건 | 모집중 ${open} · 모집예정 ${upcoming} · 공고 미발표 ${unannounced} · 마감 ${closed}`);
  console.log(`  활성 SP ${active}건 (모집중 + 모집예정, 9999 페어 제외)`);
  console.log("");

  const threshold = isPeak ? ACTIVE_SP_PEAK_MIN : ACTIVE_SP_OFFSEASON_MIN;
  if (isPeak && active < ACTIVE_SP_PEAK_MIN) {
    console.log(`  🔴 모집 시즌 중 활성 SP ${active}건 < 임계 ${ACTIVE_SP_PEAK_MIN}건`);
    addFinding(
      "🔴",
      "§10 모집 사이클",
      `활성 SP ${active}건 (모집 시즌 ${month}월 중, 임계 ${ACTIVE_SP_PEAK_MIN}건) — 신규 SP 큐레이션 즉시 필요`,
    );
  } else if (!isPeak && active < ACTIVE_SP_OFFSEASON_MIN) {
    console.log(`  🟡 비수기 활성 SP ${active}건 < 임계 ${ACTIVE_SP_OFFSEASON_MIN}건`);
    addFinding(
      "🟡",
      "§10 모집 사이클",
      `활성 SP ${active}건 (비수기 ${month}월, 임계 ${ACTIVE_SP_OFFSEASON_MIN}건) — 신규 SP 큐레이션 권고`,
    );
  } else {
    console.log(`  ✓ 활성 SP ${active}건 ≥ 임계 ${threshold}건 (${seasonLabel})`);
  }

  // 데이터 파일 stale 판정 — git 히스토리 필요
  if (!history.usable) {
    console.log(`  ⚪ 파일 마지막 수정일 판정 skip — ${history.reason}`);
    console.log("");
    return;
  }

  const lastRaw = git(["log", "-1", "--pretty=format:%ct", "--", ...CYCLE_DATA_FILES]);
  const lastDate = git(["log", "-1", "--pretty=format:%cs", "--", ...CYCLE_DATA_FILES]) || "이력 없음";

  if (!lastRaw) {
    console.log(`  ⚪ ${CYCLE_DATA_FILES.join("·")} 수정 이력 조회 실패`);
    console.log("");
    return;
  }

  const ageDays = Math.floor((Date.now() / 1000 - Number(lastRaw)) / 86_400);
  if (ageDays >= DATA_STALE_DAYS) {
    console.log(`  🟡 landing.ts·programs.ts 마지막 수정 ${lastDate} (${ageDays}일 경과)`);
    addFinding(
      "🟡",
      "§10 모집 사이클",
      `landing.ts·programs.ts 마지막 수정 ${lastDate} (${ageDays}일 경과, 임계 ${DATA_STALE_DAYS}일) — trendNews·SP 갱신 점검 권고`,
    );
  } else {
    console.log(`  ✓ landing.ts·programs.ts 마지막 수정 ${lastDate} (${ageDays}일 경과 · 임계 ${DATA_STALE_DAYS}일)`);
  }
  console.log("");
}

// ── §6 의존성 보안 ─────────────────────────────

interface AuditSummary {
  ok: boolean;
  reason?: string;
  critical: number;
  high: number;
  topPackages: string[];
}

interface AuditJson {
  metadata?: { vulnerabilities?: Record<string, number> };
  vulnerabilities?: Record<string, { severity?: string; name?: string }>;
}

function runAudit(): AuditSummary {
  let raw = "";
  try {
    raw = execFileSync("npm", ["audit", "--json"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      timeout: AUDIT_TIMEOUT_MS,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (err: unknown) {
    // 취약점이 있으면 npm audit이 exit 1을 낸다 → stdout에 JSON이 그대로 있다
    const e = err as { stdout?: string | Buffer };
    raw = typeof e.stdout === "string" ? e.stdout : e.stdout?.toString("utf8") ?? "";
    if (!raw.trim()) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, reason: `npm audit 실행 실패 (${message.split("\n")[0]})`, critical: 0, high: 0, topPackages: [] };
    }
  }

  let parsed: AuditJson;
  try {
    parsed = JSON.parse(raw) as AuditJson;
  } catch {
    return { ok: false, reason: "npm audit JSON 파싱 실패 (네트워크·레지스트리 오류 의심)", critical: 0, high: 0, topPackages: [] };
  }

  const counts = parsed.metadata?.vulnerabilities;
  if (!counts) {
    return { ok: false, reason: "npm audit 응답에 metadata.vulnerabilities 없음", critical: 0, high: 0, topPackages: [] };
  }

  // 과잉 구현 금지 — 카운트 + 상위 3개 패키지명까지만
  const topPackages = Object.values(parsed.vulnerabilities ?? {})
    .filter((v) => v.severity === "critical" || v.severity === "high")
    .map((v) => v.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 3);

  return {
    ok: true,
    critical: counts.critical ?? 0,
    high: counts.high ?? 0,
    topPackages,
  };
}

function checkDependencyAudit(): void {
  console.log("▸ §6 의존성 보안 — npm audit critical·high 카운트");
  console.log("");

  const audit = runAudit();

  if (!audit.ok) {
    console.log(`  ⚪ ${audit.reason}`);
    console.log("");
    addFinding("⚪", "§6 의존성 보안", `${audit.reason} — 점검 skip(취약점 0건 아님)`);
    return;
  }

  const pkgSuffix = audit.topPackages.length > 0 ? ` (상위: ${audit.topPackages.join("·")})` : "";
  console.log(`  critical ${audit.critical}건 · high ${audit.high}건${pkgSuffix}`);
  console.log("");

  const hits: string[] = [];
  if (audit.critical >= AUDIT_CRITICAL_MIN) {
    hits.push(`critical ${audit.critical}건 (임계 ${AUDIT_CRITICAL_MIN}건)`);
  }
  if (audit.high >= AUDIT_HIGH_MIN) {
    hits.push(`high ${audit.high}건 (임계 ${AUDIT_HIGH_MIN}건)`);
  }

  if (hits.length === 0) {
    console.log(`  ✓ 임계 미만 (critical ${AUDIT_CRITICAL_MIN}건·high ${AUDIT_HIGH_MIN}건 기준)`);
    console.log("");
    return;
  }

  // 🔴은 내지 않는다 — 대부분 개발 의존성 취약점이라 회장 결재 사안이 아니다
  addFinding(
    "🟡",
    "§6 의존성 보안",
    `${hits.join(" · ")}${pkgSuffix} — npm audit fix 검토 권고`,
  );
}

// ── findings 파일 append ───────────────────────

function flushFindings(): void {
  const path = process.env.WATCHMAN_FINDINGS;
  if (!path) return; // 미설정이면 stdout만
  if (findings.length === 0) return; // 이상 0건이면 파일에 안 씀 (파일 부재 = 정상)

  const lines = findings
    .map((f) => `${f.grade}|${f.item}|${f.evidence.replace(/[|\r\n]+/g, " ")}`)
    .join("\n");
  appendFileSync(path, `${lines}\n`, "utf8");
}

// ── main ──────────────────────────────────────

function main(): void {
  console.log("");
  console.log("═══════════════════════════════════════════");
  console.log("  이랑 — 정정 이력(§9) · 모집 사이클(§10) · 의존성(§6) 점검");
  console.log(`  ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC${CI_MODE ? " · CI" : ""}`);
  console.log("═══════════════════════════════════════════");
  console.log("");

  const history = checkHistory();
  if (history.usable) {
    console.log(`  git 히스토리: 커밋 ${history.commitCount}개 (full clone)`);
  } else {
    console.log(`  git 히스토리: ${history.reason}`);
  }
  console.log("");

  checkCorrectionHistory(history);
  checkProgramCycle(history);
  checkDependencyAudit();

  const crit = findings.filter((f) => f.grade === "🔴").length;
  const warn = findings.filter((f) => f.grade === "🟡").length;

  console.log("───────────────────────────────────────────");
  console.log(`  검사 3종 | 위험 ${crit} | 경고 ${warn}`);
  console.log("───────────────────────────────────────────");
  console.log("");

  if (findings.length === 0) {
    console.log("▸ 정정 이력·모집 사이클·의존성 모두 정상이에요.");
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

try {
  main();
} catch (err: unknown) {
  // 예외로 exit 1을 내면 CI step이 죽어 aggregator가 다른 검사 결과까지 못 묶는다
  const message = err instanceof Error ? err.message : String(err);
  console.error(`✗ 점검 중 예외가 발생했어요: ${message}`);
  addFinding("🟡", "§9·§10·§6 리포 감시", `스크립트 예외 — ${message}`);
  flushFindings();
  process.exit(0);
}
