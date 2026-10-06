import type { CropDetailInfo, CropInfo } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { parseIncome10a, withJosa } from "@/lib/format";

/**
 * 작물 상세의 검색 결과 제목·설명 (2026-10-06, GSC 9월 근거 — 회장 "1번 진행, 귀농은 다시 넣어").
 *
 * - 검색어: "블루베리 농사 난이도"·"고추농사 난이도"·"루꼴라 키우기 난이도"·"블루베리 농사 수익"·"체리 수확시기" —
 *   농사·난이도·수익·시기가 반복된다. 종전 제목은 산지 세 곳을 붙여 45자 남짓이라 검색 결과에서 뒤가 잘렸다.
 * - 설명: 작물 47개가 같은 틀 문장("…확인하세요. 주요 산지: …")이라 숫자가 하나도 없었다(9월 작물 상세 노출 2,756회·클릭률 1.45%).
 *   → 실제 난이도·10a당 소득·재배 시기·주산지. 소득은 공공기관 출처일 때만 숫자로 싣는다(블로그·종묘사 출처 값은 본문에만).
 * - "귀농"을 다시 넣는다 — 사람들은 "귀농"으로 검색한다(5/19 "농촌 정착" 일괄 변경은 본문 표현이고, 검색 결과 문구는 되돌린다).
 */

type CropForSeo = Pick<CropInfo, "name" | "difficulty" | "growingSeason"> & {
  detail: Pick<CropDetailInfo, "majorRegions"> & {
    income: Pick<CropDetailInfo["income"], "revenueRange" | "source">;
  };
};

/** 검색 결과 설명에 소득 숫자를 실어도 되는 출처 — 정부·공공기관 */
const PUBLIC_INCOME_SOURCES = ["농촌진흥청", "통계청", "산림청", "농림축산식품부", "한국농촌경제연구원"];

const DIFFICULTY_AND: Record<CropInfo["difficulty"], string> = {
  쉬움: "쉽고",
  보통: "보통이고",
  어려움: "어렵고",
};

const DIFFICULTY_ADJ: Record<CropInfo["difficulty"], string> = {
  쉬움: "쉬운",
  보통: "보통인",
  어려움: "어려운",
};

export function cropSeoTitle(crop: Pick<CropInfo, "name">): string {
  return `${crop.name} 농사 난이도·수익 — 재배 시기·주산지 | 귀농 작물`;
}

/** 소득 출처가 공공기관이면 그 기관 이름("농촌진흥청 「2025년도 …」" → "농촌진흥청"), 아니면 null */
function publicIncomeAgency(source?: string): string | null {
  if (!source) return null;
  return PUBLIC_INCOME_SOURCES.find((agency) => source.trim().startsWith(agency)) ?? null;
}

export function cropSeoDescription(crop: CropForSeo): string {
  const agency = publicIncomeAgency(crop.detail.income.source);
  const income = agency ? parseIncome10a(crop.detail.income.revenueRange) : null;
  const subject = withJosa(crop.name, "은");
  const first =
    income !== null
      ? `${subject} 재배 난이도가 ${DIFFICULTY_AND[crop.difficulty]}, 10a당 소득은 약 ${income.toLocaleString("ko-KR")}만 원이에요(${agency}).`
      : `${subject} 재배 난이도가 ${DIFFICULTY_ADJ[crop.difficulty]} 작물이에요.`;
  const regions = crop.detail.majorRegions
    .slice(0, 3)
    .map((name) => PROVINCES.find((p) => p.name === name)?.shortName ?? name)
    .join("·");
  // "경기예요"·"충남이에요" — 끝 글자 받침에 맞춘다
  const second = regions
    ? `재배 시기는 ${crop.growingSeason}, 주산지는 ${withJosa(regions, "이에요")}.`
    : `재배 시기는 ${withJosa(crop.growingSeason, "이에요")}.`;
  return `${first} ${second} 귀농 전에 수익과 재배 환경을 확인하세요.`;
}
