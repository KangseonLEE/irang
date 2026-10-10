import type { CropDetailInfo, CropInfo } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { withJosa } from "@/lib/format";
import { officialIncomeAgency, officialIncomeFigure } from "@/lib/crops/income";
import { majorRegionBasis } from "@/lib/crops/major-regions";

/**
 * 작물 상세의 검색 결과 제목·설명 (2026-10-06, GSC 9월 근거 — 회장 "1번 진행, 귀농은 다시 넣어").
 *
 * - 검색어: "블루베리 농사 난이도"·"고추농사 난이도"·"루꼴라 키우기 난이도"·"블루베리 농사 수익"·"체리 수확시기" —
 *   농사·난이도·수익·시기가 반복된다. 종전 제목은 산지 세 곳을 붙여 45자 남짓이라 검색 결과에서 뒤가 잘렸다.
 * - 설명: 작물 47개가 같은 틀 문장("…확인하세요. 주요 산지: …")이라 숫자가 하나도 없었다(9월 작물 상세 노출 2,756회·클릭률 1.45%).
 *   → 실제 난이도·10a당 소득·재배 시기·주산지. 소득은 공식 통계(농진청 2025 소득 조사·통계청 생산비조사)일 때만 숫자로,
 *   주산지는 재배면적 통계가 근거일 때만 싣는다(10/10 — 공공기관 이름만 단 범위 추정값 15종이 "(농촌진흥청)"으로 나가던 것).
 * - "귀농"을 다시 넣는다 — 사람들은 "귀농"으로 검색한다(5/19 "농촌 정착" 일괄 변경은 본문 표현이고, 검색 결과 문구는 되돌린다).
 */

type CropForSeo = Pick<CropInfo, "id" | "name" | "difficulty" | "growingSeason"> & {
  detail: Pick<CropDetailInfo, "majorRegions"> & {
    income: Pick<CropDetailInfo["income"], "revenueRange" | "source">;
  };
};

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

export function cropSeoDescription(crop: CropForSeo): string {
  const agency = officialIncomeAgency(crop.detail.income.source);
  const income = officialIncomeFigure(crop.detail.income);
  const subject = withJosa(crop.name, "은");
  const first =
    income !== null
      ? `${subject} 재배 난이도가 ${DIFFICULTY_AND[crop.difficulty]}, 10a당 소득은 약 ${income}만 원이에요(${agency}).`
      : `${subject} 재배 난이도가 ${DIFFICULTY_ADJ[crop.difficulty]} 작물이에요.`;
  // 손 입력 주산지(재배면적 통계 없음)는 검색 결과에 '주산지'로 단정하지 않는다
  const regions = (majorRegionBasis(crop.id) ? crop.detail.majorRegions : [])
    .slice(0, 3)
    .map((name) => PROVINCES.find((p) => p.name === name)?.shortName ?? name)
    .join("·");
  // "경기예요"·"충남이에요" — 끝 글자 받침에 맞춘다
  const second = regions
    ? `재배 시기는 ${crop.growingSeason}, 주산지는 ${withJosa(regions, "이에요")}.`
    : `재배 시기는 ${withJosa(crop.growingSeason, "이에요")}.`;
  return `${first} ${second} 귀농 전에 수익과 재배 환경을 확인하세요.`;
}
