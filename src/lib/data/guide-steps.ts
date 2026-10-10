import { settlementSurvey } from "./stats";
/**
 * 귀농 5단계 공용 요약 데이터
 *
 * - /guide 페이지: 상세 아코디언의 기초 데이터로 활용
 * - /costs 페이지: 단계별 비용 카드에 활용
 * - 기타 페이지: 5단계 요약 표시 시 재사용
 */

export interface GuideStepSummary {
  step: number;
  title: string;
  period: string;
  cost: {
    /** 공식 통계로 확인된 금액만 (10/10 — 근거 없던 30~50만·50~100만·960만 원 제거). 없으면 항목 설명만 보인다 */
    amount?: string;
    desc: string;
    /** 비용이 집중되는 단계 */
    highlight?: boolean;
  };
}

export const GUIDE_STEP_SUMMARIES: GuideStepSummary[] = [
  {
    step: 1,
    title: "정보 탐색",
    period: "1~3개월",
    cost: { desc: "서적·자료비, 교통비, 온라인 강의" },
  },
  {
    step: 2,
    title: "교육 이수",
    period: "3~6개월",
    cost: { desc: "교육비, 체류형 숙박비, 교통비" },
  },
  {
    step: 3,
    title: "지역 선정",
    period: "6~12개월",
    cost: { desc: "답사 교통비, 임시 숙박비" },
  },
  {
    step: 4,
    title: "영농 시작",
    period: "12~18개월",
    cost: { amount: `약 ${settlementSurvey.investment.toLocaleString("ko-KR")}만 원`, desc: `농지·가축·시설 투자 (${settlementSurvey.year} 실태조사 평균)`, highlight: true },
  },
  {
    step: 5,
    title: "정착",
    period: "18~27개월",
    cost: { desc: "주택 마련, 초기 생활 안정" },
  },
];
