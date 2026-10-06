import type { SupportProgram } from "@/lib/data/programs";

/**
 * 지원사업 상세의 검색 결과 제목·설명 (2026-10-06, GSC 9월 근거 — 회장 "1번 진행, 귀농은 다시 넣어").
 *
 * - 사업 상세는 "○○ 조건"·"○○ 신청"으로 검색된다 → 제목에 "조건·신청 방법".
 * - 끝은 "귀농 지원사업" — 5/19 "농촌 정착 지원사업"으로 바꿨던 자리를 되돌린다(사람들은 "귀농"으로 검색한다).
 * - 노출이 큰 사업은 실제 검색어로 따로 쓴다. 본문에 그 내용이 있는 것만(검색 결과가 약속한 걸 화면이 보여 줘야 한다).
 */

type ProgramForSeo = Pick<SupportProgram, "id" | "title" | "region">;

interface SeoOverride {
  title: string;
  /** 설명 첫 문장 — 뒤에 사업 요약이 붙는다 */
  lead: string;
}

const OVERRIDES: Record<string, SeoOverride> = {
  // 9월 노출 669회(사이트 단일 페이지 최다)·클릭률 0.6%·평균 8.4위. 검색어 "농지은행 임대 조건"·"위탁 조건"·"임대수탁"이
  // 197회인데 제목에 조건이 없었다. 본문(위탁자·임차인 대상, 농업인 위탁자 수수료 면제·그 외 연 임대차료 5%)이 이를 다룬다
  "SP-018": {
    title: "농지은행 농지임대수탁사업 — 임대·위탁 조건과 수수료",
    lead: "농지은행 농지임대수탁사업의 임대 조건·위탁 조건·수수료를 확인하세요.",
  },
};

function regionPrefix(program: ProgramForSeo): string {
  const region = program.region?.trim();
  return region ? `${region} ` : "";
}

export function programSeoTitle(program: ProgramForSeo): string {
  return OVERRIDES[program.id]?.title ?? `${program.title} — 조건·신청 방법 | ${regionPrefix(program)}귀농 지원사업`;
}

/** @param summary 화면용으로 다듬은 사업 요약(수집 행의 출처 문장 제외) — 앞 100자만 싣는다 */
export function programSeoDescription(program: ProgramForSeo, summary?: string | null): string {
  const lead =
    OVERRIDES[program.id]?.lead ??
    `${regionPrefix(program)}${program.title}의 자격 조건, 지원 금액, 신청 방법을 확인하세요.`;
  return summary ? `${lead} ${summary.slice(0, 100)}` : lead;
}
