/* ════════════════════════════════════════════
   통계 서브페이지 데이터
   /stats/population, /stats/youth, /stats/satisfaction
   출처: 통계청 귀농귀촌인통계, 농림축산식품부 귀농귀촌 실태조사
   ════════════════════════════════════════════ */

/* ── 공통 타입 ── */

export interface YearlyPopulation {
  year: number;
  /** 귀농 인구 (만 명) */
  farming: number;
  /** 귀촌 인구 (만 명) */
  rural: number;
}

export interface YouthRatio {
  year: number;
  /** 청년(40세 미만) 귀농 비율 (%) */
  ratio: number;
}

export interface SatisfactionSegment {
  label: string;
  pct: number;
}

export interface Factor {
  label: string;
  pct: number;
}

/* ── 1. 귀농·귀촌 인구 추이 (2015~2024) ── */

export const populationData: YearlyPopulation[] = [
  { year: 2015, farming: 1.18, rural: 31.7 },
  { year: 2016, farming: 1.2, rural: 32.3 },
  { year: 2017, farming: 1.2, rural: 33.4 },
  { year: 2018, farming: 1.18, rural: 32.8 },
  { year: 2019, farming: 1.15, rural: 33.0 },
  { year: 2020, farming: 1.29, rural: 35.5 },
  { year: 2021, farming: 1.28, rural: 38.0 },
  { year: 2022, farming: 1.19, rural: 40.0 },
  { year: 2023, farming: 1.16, rural: 39.8 },
  { year: 2024, farming: 1.2, rural: 42.2 },
];

export const populationSummary = {
  title: "귀농·귀촌 인구 추이",
  description:
    "귀농 인구는 연 1.2만 명 수준을 꾸준히 유지하고 있으며, 2020년 코로나19를 계기로 귀촌 인구가 급증해 2024년에는 42.2만 명을 기록했습니다. 귀농과 귀촌을 합산하면 전년 대비 5.7% 증가한 수치로, 농촌 이주에 대한 관심이 지속적으로 높아지고 있음을 보여줍니다.",
  source: "통계청 귀농귀촌인통계 (2024)",
};

/* ── 2. 청년 귀농 트렌드 ── */

export const youthData: YouthRatio[] = [
  { year: 2015, ratio: 8.2 },
  { year: 2016, ratio: 8.5 },
  { year: 2017, ratio: 9.0 },
  { year: 2018, ratio: 9.3 },
  { year: 2019, ratio: 9.8 },
  { year: 2020, ratio: 10.5 },
  { year: 2021, ratio: 11.2 },
  { year: 2022, ratio: 11.8 },
  { year: 2023, ratio: 12.4 },
  { year: 2024, ratio: 13.1 },
];

/** 귀농 사유 Top 5 (landing.ts trendReasons와 동일 출처이나 stats 전용) */
export const farmingReasons: Factor[] = [
  { label: "자연환경이 좋아서", pct: 30 },
  { label: "농업의 비전·발전 가능성", pct: 22 },
  { label: "가업승계", pct: 19 },
  { label: "가족·친지 근처 거주", pct: 15 },
  { label: "건강·여유로운 생활", pct: 8 },
];

export const youthSummary = {
  title: "청년 귀농 트렌드",
  description:
    "전체 귀농인 중 40세 미만 청년 비율은 2015년 8.2%에서 2024년 13.1%로, 10년간 꾸준히 상승하며 역대 최고치를 기록했습니다. 스마트팜, 6차 산업 등 기술 기반 농업의 확산과 정부의 청년 귀농 지원 강화가 주요 요인입니다. 도시의 높은 주거비·경쟁에 대한 피로감도 청년층의 농촌 이주를 촉진하고 있습니다.",
  source: "농림축산식품부 귀농귀촌 실태조사 (2024)",
};

/* ── 3. 귀농 만족도 조사 ── */

export const satisfactionSegments: SatisfactionSegment[] = [
  { label: "매우 만족", pct: 18 },
  { label: "만족", pct: 52 },
  { label: "보통", pct: 22 },
  { label: "불만족", pct: 8 },
];

export const satisfactionFactors: Factor[] = [
  { label: "자연환경", pct: 45 },
  { label: "여유로운 삶", pct: 28 },
  { label: "건강 개선", pct: 15 },
  { label: "주거비 절감", pct: 8 },
  { label: "공동체 문화", pct: 4 },
];

export const dissatisfactionFactors: Factor[] = [
  { label: "의료 접근성", pct: 35 },
  { label: "문화생활 부족", pct: 30 },
  { label: "소득 불안정", pct: 25 },
  { label: "기타", pct: 10 },
];

export const satisfactionSummary = {
  title: "귀농 만족도 조사",
  description:
    "귀농인의 70%가 현재 생활에 만족한다고 응답했으며, 자연환경과 여유로운 삶이 가장 큰 만족 요인으로 꼽혔습니다. 반면 의료 접근성, 문화생활 부족, 소득 불안정이 주요 불만 요인입니다. 도시 대비 월 생활비가 25% 낮아 경제적 여유가 만족도에 기여하고 있습니다.",
  source: "농림축산식품부 귀농귀촌 실태조사 (2024)",
};
