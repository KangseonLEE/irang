/**
 * 정책 사실 단일 출처 계약 테스트 (2026-10-10)
 *
 * 왜: 귀농 창업·주택자금 금리가 한 화면엔 '연 2%', 다른 화면엔 '연 1.5%'로 적혀 있었고(치유농업 페이지),
 * 9/28 정정(청년창업농 '연간 2,000명' 삭제·Agrix 온라인 전용)이 신청 가이드에는 전파되지 않았다.
 * 같은 숫자를 문자열로 여러 곳에 적으면 정정이 한 곳에만 들어간다 — 그래서 아래 정책 숫자는
 * src/lib/data/policy-facts.ts 를 거쳐서만 화면에 나가야 한다.
 *
 * 범위: 지원사업·교육·행사·가이드 + 비용·통계·랜딩·진단·용어 화면(10/10 2차 QA — 처음엔 트랙 C 파일만 봐서
 * landing·stats·cost-by-type 의 하드코딩과 '연리 2%'·'1.5%' 표기를 놓쳤다).
 * 허용 목록: 같은 숫자지만 '다른 사업의 사실'이거나 '원문 키워드 검사용 문자열'인 줄만, 이유와 함께.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXCELLENT_SUCCESSOR,
  FOREST_VILLAGE_LOAN,
  POLICY_TEXT,
  RETURN_FARM_LOAN,
  YOUTH_SETTLEMENT,
  formatManwon,
} from "@/lib/data/policy-facts";
import { PROGRAMS } from "@/lib/data/programs";

const ROOT = join(__dirname, "..", "..");

const DATA_FILES = [
  "programs",
  "education",
  "events",
  "therapy",
  "gov-roadmap",
  "shelter",
  "guide-steps",
  "roadmap-steps",
  "track-compare",
  "persona-fit",
  "plan",
  "landing",
  "stats",
  "cost-by-type",
  "glossary",
  "search-faq",
  "entity-panel",
  "assessment",
  "match-questions",
  "journey-lanes",
  "journey-lanes-hub",
  "journey-lanes-stats",
  "quick-check",
  "personas",
].map((n) => `src/lib/data/${n}.ts`);

function walk(dir: string): string[] {
  const abs = join(ROOT, dir);
  let out: string[] = [];
  for (const name of readdirSync(abs)) {
    const rel = `${dir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) out = out.concat(walk(rel));
    else if (/\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

const SCOPED_FILES = [
  ...DATA_FILES,
  "src/lib/data/program-guides.tsx",
  ...["programs", "education", "events", "guide", "guides", "interviews", "costs", "stats", "start", "match", "about"].flatMap((d) =>
    walk(`src/app/${d}`),
  ),
  ...walk("src/lib/programs"),
  ...walk("src/components/landing"),
  ...walk("src/components/start"),
];

/** 정책 숫자 — 이 문자열이 소스에 그대로 있으면 policy-facts 를 안 거친 것 */
const POLICY_NUMBER_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "창업자금 한도 3억", re: /(?<![\d.~])3\s?억/ },
  { name: "주택자금 한도 7,500만", re: /7,?500\s?만/ },
  { name: "융자 금리 연 2%", re: /연\s?리?\s?2(\.0)?\s?%/ },
  { name: "금리 1.5% (10/10 사고 값)", re: /(?<![\d.])1\.5\s?%/ },
  { name: "주택자금 한도 7.5천만·75백만 표기", re: /7\.5\s?천만|75\s?백만/ },
  { name: "영농정착지원금 110만", re: /(?<![\d,])110\s?만/ },
  { name: "교육 자격 8시간", re: /(?<![\d,])8\s?시간/ },
  { name: "교육 심사 기준 100시간", re: /(?<![\d,])100\s?시간/ },
];

/**
 * 허용 목록 — [파일, 줄에 들어 있는 고유 문자열, 이유]. 줄 내용으로 찾으므로 줄 번호가 밀려도 유지된다.
 * 새 항목은 "정말 다른 사실인가"를 확인하고 이유를 적는다.
 */
const ALLOWED: { file: string; contains: string; reason: string }[] = [
  { file: "src/lib/data/gov-roadmap.ts", contains: 'mustContain: ["농업창업자금", "3억원"', reason: "원문 페이지 키워드 검사용 문자열(check-policy) — 화면에 나가지 않음" },
  { file: "src/lib/data/gov-roadmap.ts", contains: 'mustContain: ["청년농업인", "영농정착", "3억"]', reason: "원문 키워드 검사용" },
  { file: "src/lib/data/gov-roadmap.ts", contains: 'mustContain: ["청년후계농", "영농정착", "110만원"]', reason: "원문 키워드 검사용" },
  { file: "src/lib/data/gov-roadmap.ts", contains: 'mustContain: ["귀산촌", "3억원 이내"', reason: "원문 키워드 검사용" },
  { file: "src/lib/data/gov-roadmap.ts", contains: "경영회생 환매 고정요율이 연 2.0%", reason: "농지은행 경영회생 환매요율 — 다른 사업의 사실" },
  { file: "src/lib/data/programs.ts", contains: "과수원을 살 때 ㎡당 2만 원까지 연 2% 융자", reason: "SP-050 농지은행 과원 매매 금리 — 다른 사업의 사실" },
  { file: "src/lib/data/persona-fit.ts", contains: '"SP-050": "과수원 구입비를 ㎡당 2만 원까지 연 2%', reason: "SP-050 과원 매매 — 다른 사업의 사실" },
  { file: "src/lib/data/programs.ts", contains: "농지·시설 자금 최대 5억원을 1.5% 저금리로", reason: "후계농업경영인 육성자금(5억·1.5%) — 다른 사업의 사실" },
  { file: "src/lib/data/programs.ts", contains: "세대당 최대 5억원, 연 1.5% 저금리로 융자해 주는 핵심", reason: "후계농업경영인 육성자금 — 다른 사업" },
  { file: "src/lib/data/programs.ts", contains: 'supportAmount: "세대당 최대 5억원, 연 1.5% (5년 거치 20년 분할 상환)"', reason: "후계농업경영인 육성자금 — 다른 사업" },
  { file: "src/lib/data/programs.ts", contains: "㎡당 2만 원이고 연리 2%에", reason: "SP-050 농지은행 과원 매매 금리 — 다른 사업의 사실" },
  { file: "src/lib/data/programs.ts", contains: 'supportAmount: "㎡당 2만 원 한도(과수목 포함) · 연리 2%', reason: "SP-050 과원 매매 — 다른 사업" },
  { file: "src/lib/data/gov-roadmap.ts", contains: "시설 연 1.0%·운전 연 1.5% 고정", reason: "스마트팜 종합자금 운전자금 금리 — 다른 사업" },
  { file: "src/lib/data/gov-roadmap.ts", contains: "운전자금 연 1.5% 고정, NH농협은행 취급", reason: "스마트팜 종합자금 — 다른 사업" },
  { file: "src/lib/data/gov-roadmap.ts", contains: "시설·개보수자금 연 1.0%·운전자금 연 1.5% 고정", reason: "스마트팜 종합자금 — 다른 사업" },
  { file: "src/lib/data/glossary.ts", contains: "후계농업경영인은 「후계농어업인 및 청년농어업인 육성", reason: "후계농업경영인 용어 정의(1.5%) — 다른 사업" },
  { file: "src/lib/data/landing.ts", contains: "2026년 농림축산식품사업 시행지침서. 귀농 농업창업 자금은 최대 3억원 한도", reason: "외부 뉴스 기사 요약(폴백 카드) — 기사 문장 인용, 값은 policy-facts 와 같음" },
  { file: "src/lib/data/landing.ts", contains: "'정착 교육 100시간+' — 은 지웠다", reason: "주석 안 문장(블록 주석 끝 줄)" },
  { file: "src/lib/data/assessment.ts", contains: 'label: "3억 원 이상 확보했고, 자금 계획도 세워두었어요"', reason: "진단 보유 자금 선택지 — 정책 한도가 아님" },
  { file: "src/lib/data/match-questions.ts", contains: 'label: "3억 원 이상",', reason: "진단 보유 자금 선택지" },
  { file: "src/lib/data/quick-check.ts", contains: 'label: "3억 이상", icon: PiggyBank', reason: "빠른 진단 보유 자금 선택지" },
];

function isComment(line: string): boolean {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

function findHardcoded(files: { file: string; text: string }[]) {
  const hits: string[] = [];
  for (const { file, text } of files) {
    text.split("\n").forEach((line, i) => {
      if (isComment(line)) return;
      for (const { name, re } of POLICY_NUMBER_PATTERNS) {
        if (!re.test(line)) continue;
        if (ALLOWED.some((a) => a.file === file && line.includes(a.contains))) continue;
        hits.push(`${file}:${i + 1} [${name}] ${line.trim().slice(0, 120)}`);
      }
    });
  }
  return hits;
}

describe("정책 숫자는 policy-facts 를 거친다", () => {
  const files = SCOPED_FILES.map((file) => ({ file, text: readFileSync(join(ROOT, file), "utf8") }));

  it("범위 파일이 실제로 스캔된다", () => {
    expect(files.length).toBeGreaterThan(20);
    expect(files.some((f) => f.file === "src/lib/data/program-guides.tsx")).toBe(true);
  });

  it("하드코딩된 정책 숫자 0건", () => {
    expect(findHardcoded(files)).toEqual([]);
  });

  it("자기 검증 — 하드코딩을 넣으면 잡힌다", () => {
    const bad = [
      { file: "src/lib/data/therapy.ts", text: '  value: "최대 3억원 (연 1.5%)",' },
      { file: "src/lib/data/program-guides.tsx", text: '  "월 최대 110만 원, 3년간",' },
      { file: "src/app/programs/page.tsx", text: '  text: "교육 100시간 이상",' },
    ];
    // therapy 줄은 '3억'과 '1.5%' 두 패턴에 걸린다
    expect(findHardcoded(bad)).toHaveLength(4);
  });

  it("허용 목록 항목은 지금도 그 파일에 있다(죽은 허용 금지)", () => {
    for (const a of ALLOWED) {
      const text = files.find((f) => f.file === a.file)?.text ?? "";
      expect(text.includes(a.contains), `${a.file}: ${a.contains}`).toBe(true);
    }
  });
});

describe("policy-facts 값과 파생 문장", () => {
  it("원문 대조값 (2026-10-10)", () => {
    expect(RETURN_FARM_LOAN.startupMaxManwon.value).toBe(30000);
    expect(RETURN_FARM_LOAN.housingMaxManwon.value).toBe(7500);
    expect(RETURN_FARM_LOAN.interestRate.value).toBe("연 2.0%");
    expect(YOUTH_SETTLEMENT.ageRange.value).toEqual([18, 39]);
    expect(YOUTH_SETTLEMENT.applyChannel.value).toContain("농업e지");
    expect(EXCELLENT_SUCCESSOR.maxManwon.value).toBe(20000);
    expect(FOREST_VILLAGE_LOAN.educationHours.value).toBe(60);
  });

  it("formatManwon", () => {
    expect(formatManwon(30000)).toBe("3억 원");
    expect(formatManwon(7500)).toBe("7,500만 원");
    expect(formatManwon(37500)).toBe("3억 7,500만 원");
  });

  it("모든 사실에 출처와 YYYY-MM-DD 대조일", () => {
    for (const group of [RETURN_FARM_LOAN, YOUTH_SETTLEMENT, EXCELLENT_SUCCESSOR, FOREST_VILLAGE_LOAN]) {
      for (const f of Object.values(group)) {
        expect(f.source.length).toBeGreaterThan(0);
        expect(f.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("SP-001·002·013 행 문장이 policy-facts 값을 담는다", () => {
    const byId = new Map(PROGRAMS.map((p) => [p.id, p]));
    expect(byId.get("SP-001")?.supportAmount).toContain(POLICY_TEXT.returnFarmStartupMax);
    expect(byId.get("SP-001")?.description).toContain(RETURN_FARM_LOAN.interestRate.value);
    expect(byId.get("SP-002")?.eligibilityDetail).toContain(YOUTH_SETTLEMENT.applyChannel.value);
    expect(byId.get("SP-013")?.supportAmount).toBe(POLICY_TEXT.excellentSuccessorLoan);
  });

  it("verifiedAt 은 비었거나 YYYY-MM-DD 이고 오늘 이후가 아니다", () => {
    for (const p of PROGRAMS) {
      if (p.verifiedAt === undefined) continue;
      expect(p.verifiedAt, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const todayKst = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
      expect(p.verifiedAt <= todayKst, p.id).toBe(true);
    }
  });
});
