/**
 * 지원사업(SupportProgram) 중복 검증 스크립트
 *
 * 사용법 1) 단건 입력 검증 — 신규 추가 전 사전 확인:
 *   npx tsx scripts/check-program-dup.ts <title> <organization> [<sourceUrl>]
 *
 * 사용법 2) 전체 PROGRAMS 셀프 점검 — CI에서 회귀 차단:
 *   npx tsx scripts/check-program-dup.ts --all        # 로컬
 *   npx tsx scripts/check-program-dup.ts --all --ci   # CI 게이팅 (exit code)
 *   → DUPLICATE(허용쌍 제외) 발견 시 exit 1. 허용쌍(KNOWN_DISTINCT_PAIRS)은
 *     "ALLOWLISTED skip" 로그만 남기고 게이팅에서 제외.
 *
 * 판정:
 *   DUPLICATE — 같은 사업으로 강하게 의심됨 (id 추가 금지)
 *   SIMILAR   — 유사 항목 존재. 본문 비교 후 결정
 *   OK        — 중복 의심 없음
 *
 * 검사 룰:
 *   1) 핵심 키워드 추출 (스마트팜, 청년창업, 9기 등 N-gram + 숫자+기수)
 *      → 기존 row의 title/summary에 일정 비율 이상 매치되면 SIMILAR
 *   2) organization 일부 토큰 매치 (시군 단위 기관명 비교)
 *   3) sourceUrl 도메인 + path prefix 매치
 *
 * 가중치:
 *   - title 키워드 ≥ 60% 매치 + organization 매치 → DUPLICATE
 *   - title 키워드 ≥ 60% 매치 OR organization+url 둘 다 매치 → DUPLICATE
 *   - title 키워드 ≥ 40% 매치 → SIMILAR
 *   - 그 외 → OK
 *
 * 2026-05-11: 회장 명령으로 추가. 큐레이션 시 SP-012(스마트팜 청년창업 보육센터 9기)
 *   같은 사업이 다른 ID로 또 들어오는 사고를 사전 차단.
 */

import { PROGRAMS, type SupportProgram } from "../src/lib/data/programs";

// ─── 허용쌍 (allowlist) ───

/**
 * 실중복이 아닌 것으로 사람이 검증한 허용쌍.
 * check가 DUPLICATE/SIMILAR로 플래그하지만 별개 사업으로 판정된 쌍을 등록한다.
 * 여기 등록된 쌍은 게이팅(exit code)에서 제외하되 "allowlisted skip" 로그는 남긴다.
 *
 * - SP-030 ↔ SP-031: 같은 우산사업(농촌돌봄서비스활성화지원사업)이지만 별개 트랙.
 *   · SP-030 = 농촌돌봄농장 23개소 공모
 *   · SP-031 = 농촌주민생활돌봄공동체 27개소 공모
 *   조직·모집대상·사업내용·선정규모가 상이한 독립 트랙. 7/7·7/9 두 차례 검증 완료
 *   (회장 결재). title 67% + org✓ 매치로 DUPLICATE 플래그되나 실중복 아님.
 */
const KNOWN_DISTINCT_PAIRS: readonly (readonly [string, string])[] = [
  ["SP-030", "SP-031"],
];

/** 두 id가 허용쌍인지 (순서 무관). */
function isAllowlistedPair(idA: string, idB: string): boolean {
  return KNOWN_DISTINCT_PAIRS.some(
    ([x, y]) => (x === idA && y === idB) || (x === idB && y === idA),
  );
}

// ─── 키워드 추출 ───

/**
 * 한글/영문/숫자 단위로 토큰화.
 * - 한글: 2자 이상 연속 글자 (예: "스마트팜", "청년창업")
 * - 영문: 알파벳 시퀀스 (예: "ICT")
 * - 숫자+기수: 예 "9기", "6기" (회차 식별 핵심)
 */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  // 1) 숫자+기/차/회/년 패턴 우선 (회차/연차)
  for (const m of text.matchAll(/(\d+)(기|차|회|년|호)/g)) {
    tokens.push(m[0]);
  }
  // 2) 한글 2자 이상 연속
  for (const m of text.matchAll(/[가-힣]{2,}/g)) {
    tokens.push(m[0]);
  }
  // 3) 영문 시퀀스
  for (const m of text.matchAll(/[A-Za-z]{2,}/g)) {
    tokens.push(m[0].toUpperCase());
  }
  // 4) 숫자 단독 (회차 외) — 노이즈가 많아 일단 제외
  return Array.from(new Set(tokens));
}

const STOPWORDS = new Set([
  "지원",
  "사업",
  "지원사업",
  "프로그램",
  "교육",
  "보조금",
  "융자",
  "신청",
  "모집",
  "안내",
  "공고",
  "사업소",
  "업무",
  "관련",
  "참여",
  "기관",
  "운영",
  "추진",
  "통한",
  "위한",
  "통해",
  "관한",
  "대한",
  "대상",
  "사업비",
  "지자체",
]);

function meaningfulTokens(text: string): string[] {
  return tokenize(text).filter((t) => !STOPWORDS.has(t));
}

// ─── 매칭 룰 ───

/**
 * 입력 title이 기존 title과 얼마나 겹치는지 비율 (0~1).
 * meaningful 토큰 기준 교집합 크기 / 입력 토큰 크기.
 */
function titleOverlap(inputTitle: string, existingTitle: string, existingSummary: string): number {
  const inTokens = new Set(meaningfulTokens(inputTitle));
  if (inTokens.size === 0) return 0;
  const existingTokens = new Set([
    ...meaningfulTokens(existingTitle),
    ...meaningfulTokens(existingSummary),
  ]);
  let hit = 0;
  for (const t of inTokens) {
    if (existingTokens.has(t)) hit++;
  }
  return hit / inTokens.size;
}

/**
 * organization 토큰 일부라도 겹치면 true.
 * 예: "농림축산식품부 / 각 시군 농업기술센터" vs "각 시군 농업기술센터"
 */
function orgOverlap(a: string, b: string): boolean {
  const at = new Set(meaningfulTokens(a));
  const bt = new Set(meaningfulTokens(b));
  for (const t of at) {
    if (bt.has(t)) return true;
  }
  return false;
}

/**
 * sourceUrl 도메인 + path prefix(2 segment) 매치.
 */
function urlOverlap(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.host !== ub.host) return false;
    const segA = ua.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
    const segB = ub.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
    return segA === segB && segA.length > 0;
  } catch {
    return a === b;
  }
}

// ─── 판정 ───

interface Suspect {
  row: SupportProgram;
  titleScore: number;
  orgMatch: boolean;
  urlMatch: boolean;
}

type Verdict = "DUPLICATE" | "SIMILAR" | "OK";

function judge(suspects: Suspect[]): Verdict {
  for (const s of suspects) {
    if (s.titleScore >= 0.6 && s.orgMatch) return "DUPLICATE";
    if (s.titleScore >= 0.6 && s.urlMatch) return "DUPLICATE";
    if (s.orgMatch && s.urlMatch && s.titleScore >= 0.3) return "DUPLICATE";
  }
  for (const s of suspects) {
    if (s.titleScore >= 0.4) return "SIMILAR";
    if (s.orgMatch && s.titleScore >= 0.3) return "SIMILAR";
  }
  return "OK";
}

function findSuspects(
  title: string,
  organization: string,
  sourceUrl: string | undefined,
  pool: SupportProgram[],
  selfId?: string,
): Suspect[] {
  const result: Suspect[] = [];
  for (const row of pool) {
    if (selfId && row.id === selfId) continue;
    const score = titleOverlap(title, row.title, row.summary);
    const orgMatch = orgOverlap(organization, row.organization);
    const urlMatch = urlOverlap(sourceUrl, row.sourceUrl);
    if (score >= 0.3 || (orgMatch && urlMatch)) {
      result.push({ row, titleScore: score, orgMatch, urlMatch });
    }
  }
  result.sort((a, b) => b.titleScore - a.titleScore);
  return result.slice(0, 5);
}

// ─── CLI ───

function printSingleResult(
  input: { title: string; organization: string; sourceUrl?: string },
  suspects: Suspect[],
  verdict: Verdict,
): void {
  console.log("");
  console.log("=== 중복 검증 결과 ===");
  console.log(`입력 title : ${input.title}`);
  console.log(`입력 org   : ${input.organization}`);
  if (input.sourceUrl) console.log(`입력 url   : ${input.sourceUrl}`);
  console.log("");

  if (suspects.length === 0) {
    console.log("의심 row 없음.");
  } else {
    console.log(`상위 ${suspects.length}건 의심 row:`);
    for (const s of suspects) {
      const pct = Math.round(s.titleScore * 100);
      const flags = [
        `title ${pct}%`,
        s.orgMatch ? "org✓" : "org✗",
        s.urlMatch ? "url✓" : "url✗",
      ].join(" | ");
      console.log(`  - [${s.row.id}] ${s.row.title}`);
      console.log(`      ${flags}`);
      console.log(`      org: ${s.row.organization}`);
      console.log(`      url: ${s.row.sourceUrl}`);
    }
  }

  console.log("");
  const banner =
    verdict === "DUPLICATE"
      ? "DUPLICATE — 추가 금지. 기존 row 갱신 검토."
      : verdict === "SIMILAR"
      ? "SIMILAR — 본문 확인 필요. 회차/연차 등 변별 요소 확인."
      : "OK — 중복 의심 없음.";
  console.log(`판정: ${banner}`);
  console.log("");
}

function runSingle(args: string[]): number {
  const [title, organization, sourceUrl] = args;
  if (!title || !organization) {
    console.error("사용법: npx tsx scripts/check-program-dup.ts <title> <organization> [<sourceUrl>]");
    console.error("또는:   npx tsx scripts/check-program-dup.ts --all");
    return 2;
  }
  const suspects = findSuspects(title, organization, sourceUrl, PROGRAMS);
  const verdict = judge(suspects);
  printSingleResult({ title, organization, sourceUrl }, suspects, verdict);
  // CI에서 SIMILAR/DUPLICATE는 exit 1로 실패시켜 자동 차단
  if (verdict === "DUPLICATE") return 1;
  if (verdict === "SIMILAR" && process.env.STRICT === "1") return 1;
  return 0;
}

function runAll(opts: { ci: boolean }): number {
  let dupCount = 0;
  let simCount = 0;
  const findings: Array<{
    a: SupportProgram;
    b: SupportProgram;
    score: number;
    orgMatch: boolean;
    urlMatch: boolean;
    verdict: Verdict;
  }> = [];
  const skipped: Array<{ a: SupportProgram; b: SupportProgram; verdict: Verdict }> = [];

  for (let i = 0; i < PROGRAMS.length; i++) {
    const a = PROGRAMS[i];
    for (let j = i + 1; j < PROGRAMS.length; j++) {
      const b = PROGRAMS[j];
      const score = titleOverlap(a.title, b.title, b.summary);
      const orgMatch = orgOverlap(a.organization, b.organization);
      const urlMatch = urlOverlap(a.sourceUrl, b.sourceUrl);
      // 단일 검증 로직과 동일한 임계 적용
      const v = judge([{ row: b, titleScore: score, orgMatch, urlMatch }]);
      if (v === "OK") continue;
      // 허용쌍은 게이팅·카운트에서 제외 (skip 로그만 남김)
      if (isAllowlistedPair(a.id, b.id)) {
        skipped.push({ a, b, verdict: v });
        continue;
      }
      findings.push({ a, b, score, orgMatch, urlMatch, verdict: v });
      if (v === "DUPLICATE") dupCount++;
      else simCount++;
    }
  }

  console.log("");
  console.log(`=== PROGRAMS 셀프 중복 점검${opts.ci ? " (CI)" : ""} ===`);
  console.log(`총 row : ${PROGRAMS.length}`);
  console.log(`발견   : DUPLICATE ${dupCount} / SIMILAR ${simCount}`);
  console.log(`allowlist skip : ${skipped.length}쌍`);
  console.log("");

  for (const s of skipped) {
    console.log(`[ALLOWLISTED skip] ${s.a.id} ↔ ${s.b.id} (원판정 ${s.verdict}) — 별개 사업 검증 완료`);
    console.log(`  - ${s.a.id}: ${s.a.title}`);
    console.log(`  - ${s.b.id}: ${s.b.title}`);
  }
  if (skipped.length > 0) console.log("");

  for (const f of findings) {
    const pct = Math.round(f.score * 100);
    const flags = [
      `title ${pct}%`,
      f.orgMatch ? "org✓" : "org✗",
      f.urlMatch ? "url✓" : "url✗",
    ].join(" | ");
    console.log(`[${f.verdict}] ${f.a.id} ↔ ${f.b.id} (${flags})`);
    console.log(`  - ${f.a.id}: ${f.a.title}`);
    console.log(`  - ${f.b.id}: ${f.b.title}`);
  }

  if (findings.length === 0) {
    console.log("중복 의심 없음 (allowlist 제외).");
  }
  console.log("");

  // CI에서 DUPLICATE는 무조건 실패. SIMILAR는 STRICT=1 환경에서만 실패.
  if (dupCount > 0) return 1;
  if (simCount > 0 && process.env.STRICT === "1") return 1;
  return 0;
}

function main(): number {
  const args = process.argv.slice(2);
  if (args.includes("--all")) return runAll({ ci: args.includes("--ci") });
  // 단건 모드 — 플래그(--*) 제거 후 위치 인자만 전달
  return runSingle(args.filter((a) => !a.startsWith("--")));
}

process.exit(main());
