#!/usr/bin/env npx tsx
/* ==========================================================================
   CoS 인수 체크리스트 자동 grep 검증
   - chief-of-staff.md 5/11 1on1 "분야별 보고서 인수 체크리스트 8종" 자동화
   - 보고서 텍스트를 stdin으로 받거나 --file 인자로 받음
   - 보고 유형(--type)에 따라 필수 라인 grep
   - exit 0: 통과, exit 1: 누락 있음

   사용법:
     # stdin
     cat report.md | npx tsx scripts/cos-inbox-check.ts --type frontend-mobile
     # file
     npx tsx scripts/cos-inbox-check.ts --file report.md --type data-diag
     # 유형 자동 추정 (안 넘기면 키워드로 추정 시도)
     cat report.md | npx tsx scripts/cos-inbox-check.ts

   유형:
     data-diag         data-engineer 진단·검증 (prod write 동반)
     data-api          data-engineer API·정적 데이터 갱신
     data-migration    data-engineer Supabase 마이그레이션
     frontend-mobile   frontend-engineer 모바일 변경
     frontend-all      frontend-engineer 모든 코드 변경 (모바일 미포함)
     qa-deploy         qa-reviewer 배포 전 검증
     qa-infra          qa-reviewer infra 변경 (robots/middleware/headers)
     watchman-alert    reminder-watchman 이상 보고
   ========================================================================== */

import { readFileSync } from "node:fs";

/* ── 타입 정의 ── */
type ReportType =
  | "data-diag"
  | "data-api"
  | "data-migration"
  | "frontend-mobile"
  | "frontend-all"
  | "qa-deploy"
  | "qa-infra"
  | "watchman-alert";

interface Rule {
  /** 사람이 읽는 라벨 (실패 시 출력) */
  label: string;
  /** 보고서에 존재해야 할 패턴 (모든 RegExp가 match해야 통과) */
  patterns: RegExp[];
  /** 누락 시 재작업 요청할 대상 에이전트 */
  reworkTarget: string;
  /** 근거 문서 (재작업 메시지에 포함) */
  source: string;
}

/* ── 체크리스트 정의 ── */
/* chief-of-staff.md 5/11 1on1 섹션과 1:1 매핑. 새 incident 발견 시 행 추가. */

const RULES: Record<ReportType, Rule[]> = {
  "data-diag": [
    {
      label: "잔존 row 0건 SELECT 결과",
      patterns: [/잔존\s*row\s*0\s*건/, /SELECT\s*결과.*0\s*건/i],
      reworkTarget: "data-engineer",
      source: "data-engineer.md 5/11 1on1 가드 #5",
    },
  ],
  "data-api": [
    {
      label: "출처 URL 삼중 검증 (HTTP 200 + 정상 타이틀 + 비정상 키워드 0건)",
      patterns: [
        /삼중\s*검증|삼중\s*체크/,
        /HTTP\s*200/,
        /(정상\s*타이틀|타이틀\s*확인)/,
        /(비정상\s*키워드\s*0|키워드\s*0\s*건)/,
      ],
      reworkTarget: "data-engineer",
      source: "CLAUDE.md David 철학 #8 (외부 URL 삼중 체크)",
    },
  ],
  "data-migration": [
    {
      label: "마이그레이션 파일 생성 완료 (apply 안 함) + 파일 경로",
      patterns: [
        /마이그레이션\s*파일\s*생성/,
        /(apply\s*안\s*함|미\s*apply|적용\s*하지\s*않음)/,
        /supabase\/migrations\/[\w\-_/.]+\.sql/i,
      ],
      reworkTarget: "data-engineer",
      source: "CLAUDE.md 회장 결재 사항 (DB 변경)",
    },
  ],
  "frontend-mobile": [
    {
      label: "모바일 5종 사전 점검 통과 (vh/sticky/hover/viewport/safe-area)",
      patterns: [/모바일\s*5종/, /vh/i, /sticky/i, /hover/i, /viewport/i, /safe-?area/i],
      reworkTarget: "frontend-engineer",
      source: "frontend-engineer.md 5/6 1on1",
    },
    {
      label: "360/390/430/768 4단계 검증",
      patterns: [/360/, /390/, /430/, /768/],
      reworkTarget: "frontend-engineer",
      source: "frontend-engineer.md 5/6 1on1",
    },
    {
      label: "tsc / eslint / build 0 에러",
      patterns: [/tsc|타입/i, /eslint|lint/i, /build|빌드/i, /0\s*에러|에러\s*0/],
      reworkTarget: "frontend-engineer",
      source: "CLAUDE.md 빌드 SOP",
    },
    {
      label: "카피 톤 ~예요/세요 준수",
      patterns: [/카피\s*톤|copywriting/i, /(예요|세요|준수)/],
      reworkTarget: "frontend-engineer",
      source: "copywriting.md",
    },
  ],
  "frontend-all": [
    {
      label: "tsc / eslint / build 0 에러",
      patterns: [/tsc|타입/i, /eslint|lint/i, /build|빌드/i, /0\s*에러|에러\s*0/],
      reworkTarget: "frontend-engineer",
      source: "CLAUDE.md 빌드 SOP",
    },
    {
      label: "카피 톤 ~예요/세요 준수",
      patterns: [/카피\s*톤|copywriting/i, /(예요|세요|준수)/],
      reworkTarget: "frontend-engineer",
      source: "copywriting.md",
    },
  ],
  "qa-deploy": [
    {
      label: "빌드 / 타입 / lint / Lighthouse 4종",
      patterns: [/빌드|build/i, /타입|tsc/i, /lint|eslint/i, /lighthouse/i],
      reworkTarget: "qa-reviewer",
      source: "qa-reviewer.md 정의",
    },
    {
      label: "체크리스트 A~H",
      patterns: [/체크리스트\s*A.*H|checklist\s*A.*H/i],
      reworkTarget: "qa-reviewer",
      source: ".claude/rules/checklist.md",
    },
    {
      label: "모바일 4단계 + 데스크탑 회귀",
      patterns: [/(모바일\s*4\s*단계|360.*390.*430.*768)/, /데스크탑\s*회귀|desktop\s*회귀/i],
      reworkTarget: "qa-reviewer",
      source: "qa-reviewer.md 정의",
    },
  ],
  "qa-infra": [
    {
      label: "infra 검증 4종 통과 (robots / middleware / headers / 영향 범위)",
      patterns: [/infra\s*검증\s*4종|infra\s*4\s*종/i],
      reworkTarget: "qa-reviewer",
      source: "qa-reviewer.md 5/6 1on1",
    },
  ],
  "watchman-alert": [
    {
      label: "🔴/🟡/⚪ 분류 + 근거 데이터 라인",
      patterns: [/(🔴|🟡|⚪)/, /(근거|데이터|출처|로그)/],
      reworkTarget: "reminder-watchman",
      source: "reminder-watchman.md 정의",
    },
  ],
};

/* ── 유형 추정 (--type 미지정 시 키워드 기반) ── */
function inferType(report: string): ReportType | null {
  // 순서 중요: 더 구체적인 것부터 매칭
  if (/마이그레이션|migration.*\.sql/i.test(report)) return "data-migration";
  if (/잔존\s*row|진단\s*테스트|prod\s*write/i.test(report)) return "data-diag";
  if (/삼중\s*검증|출처\s*URL|API\s*갱신|정적\s*데이터/i.test(report)) return "data-api";
  if (/(🔴|🟡|⚪).*watchman|reminder-watchman/i.test(report)) return "watchman-alert";
  if (/robots|middleware|headers.*infra|infra\s*변경/i.test(report)) return "qa-infra";
  if (/lighthouse|배포\s*전\s*검증|deploy.*preflight/i.test(report)) return "qa-deploy";
  if (/모바일\s*5종|safe-?area|vh.*sticky|360.*390.*430/i.test(report)) return "frontend-mobile";
  if (/tsc|eslint|build|컴포넌트|page\.tsx|module\.css/i.test(report)) return "frontend-all";
  return null;
}

/* ── 검증 실행 ── */
interface CheckResult {
  passed: boolean;
  missingRules: Rule[];
}

function runCheck(report: string, type: ReportType): CheckResult {
  const rules = RULES[type];
  const missing: Rule[] = [];
  for (const rule of rules) {
    const allMatch = rule.patterns.every((pat) => pat.test(report));
    if (!allMatch) missing.push(rule);
  }
  return { passed: missing.length === 0, missingRules: missing };
}

/* ── 출력 포맷 ── */
function formatResult(type: ReportType, result: CheckResult): string {
  const lines: string[] = [];
  lines.push(`# CoS 인수 체크 (${type})`);
  lines.push("");

  if (result.passed) {
    lines.push("✅ CoS 인수 통과 — 회장 보고 가능");
    return lines.join("\n");
  }

  lines.push(`❌ 인수 실패 — 누락 라인 ${result.missingRules.length}건`);
  lines.push("");

  // 누락 라인 list
  for (const rule of result.missingRules) {
    lines.push(`- [누락] ${rule.label}`);
    lines.push(`  - 재작업 대상: ${rule.reworkTarget}`);
    lines.push(`  - 근거: ${rule.source}`);
  }
  lines.push("");

  // 재작업 요청 메시지 템플릿 (담당 에이전트별 묶음)
  const byTarget = new Map<string, Rule[]>();
  for (const rule of result.missingRules) {
    const arr = byTarget.get(rule.reworkTarget) ?? [];
    arr.push(rule);
    byTarget.set(rule.reworkTarget, arr);
  }

  lines.push("## 재작업 요청 메시지");
  for (const [target, rules] of Array.from(byTarget.entries())) {
    lines.push("");
    lines.push(`### → ${target}`);
    lines.push("```");
    lines.push(`보고서에 아래 라인이 누락됐어요. 확인 후 다시 보고 부탁드려요.`);
    lines.push("");
    for (const r of rules) {
      lines.push(`- ${r.label}  (근거: ${r.source})`);
    }
    lines.push("```");
  }

  return lines.join("\n");
}

/* ── CLI 인자 파싱 ── */
function parseArgs(argv: string[]): { type: ReportType | null; file: string | null } {
  let type: ReportType | null = null;
  let file: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--type" && argv[i + 1]) {
      type = argv[i + 1] as ReportType;
      i++;
    } else if (a === "--file" && argv[i + 1]) {
      file = argv[i + 1];
      i++;
    }
  }
  return { type, file };
}

/* ── 입력 읽기 ── */
async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
  });
}

/* ── main ── */
async function main() {
  const { type: argType, file } = parseArgs(process.argv.slice(2));

  const report = file ? readFileSync(file, "utf8") : await readStdin();

  if (!report.trim()) {
    console.error("입력이 비어 있어요. stdin 또는 --file 인자로 보고서를 넘겨 주세요.");
    process.exit(2);
  }

  const validTypes = Object.keys(RULES) as ReportType[];
  let type: ReportType | null = argType;
  if (type && !validTypes.includes(type)) {
    console.error(`알 수 없는 --type: ${type}`);
    console.error(`사용 가능: ${validTypes.join(", ")}`);
    process.exit(2);
  }
  if (!type) {
    type = inferType(report);
    if (!type) {
      console.error("보고 유형을 추정하지 못했어요. --type 인자로 명시해 주세요.");
      console.error(`사용 가능: ${validTypes.join(", ")}`);
      process.exit(2);
    }
    console.error(`# 유형 자동 추정: ${type}`);
  }

  const result = runCheck(report, type);
  console.log(formatResult(type, result));
  process.exit(result.passed ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
