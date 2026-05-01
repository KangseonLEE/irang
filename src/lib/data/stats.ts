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

const _latestPop = populationData[populationData.length - 1];
const _prevPop = populationData[populationData.length - 2];
const _popGrowth = (((_latestPop.farming + _latestPop.rural) / (_prevPop.farming + _prevPop.rural) - 1) * 100).toFixed(1);

export const populationSummary = {
  title: "귀농·귀촌 인구 추이",
  description:
    `귀농 인구는 연 ${_latestPop.farming}만 명 수준을 꾸준히 유지하고 있으며, 2020년 코로나19를 계기로 귀촌 인구가 급증해 ${_latestPop.year}년에는 ${_latestPop.rural}만 명을 기록했어요. 귀농과 귀촌을 합산하면 전년 대비 ${_popGrowth}% 증가한 수치로, 농촌 이주에 대한 관심이 지속적으로 높아지고 있어요.`,
  source: `통계청 귀농귀촌인통계 (${_latestPop.year})`,
};

/** 인구 추이 원인 분석 — 공식 보고서 기반 */
export interface CauseAnalysis {
  label: string;
  description: string;
  source: string;
  sourceUrl: string;
  /** 해당 원인과 연관된 연도 (차트 하이라이트용) */
  relatedYears?: number[];
}

export const populationCauses: CauseAnalysis[] = [
  {
    label: "코로나19 팬데믹 — 농촌 이주 가속",
    description:
      "2020년 코로나19로 재택·원격근무가 확산되면서 농촌 생활에 대한 관심이 급증했어요. 귀농·귀촌 의향 '있음' 응답이 2024년 57.3%로 전년(37.2%) 대비 20.1%p 급증했으며, 비대면 업무 환경이 도시 탈출의 심리적 장벽을 낮춘 것으로 분석돼요.",
    source: "한국농촌경제연구원, 2020 귀농·귀촌 동향과 시사점",
    sourceUrl: "https://eiec.kdi.re.kr/policy/domesticView.do?ac=0000158941",
    relatedYears: [2020, 2021],
  },
  {
    label: "수도권 주택가격 급등 — 압출 효과",
    description:
      "2019년 말부터 급등하기 시작한 수도권 주택가격이 도시 지역의 압출(push) 요인으로 작용했어요. 귀촌 사유 중 '주택'이 26.6%를 차지하며, 수도권에서 이동한 귀촌인이 전체의 42.7%에 달해요.",
    source: "농림축산식품부, 2024 귀농·귀촌 통계",
    sourceUrl: "https://www.freezine.co.kr/news/articleView.html?idxno=10836",
    relatedYears: [2020, 2021, 2022],
  },
  {
    label: "베이비부머 은퇴 본격화",
    description:
      "1955~1963년생 베이비부머 세대의 은퇴가 본격화되면서 60대 귀농·귀촌인이 꾸준히 증가하고 있어요. 연고지 농촌으로 돌아가는 U턴형이 귀농의 75.6%를 차지해요.",
    source: "농림축산식품부, 2023 귀농·귀촌 실태조사",
    sourceUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=248593&topic=O",
    relatedYears: [2022, 2023, 2024],
  },
  {
    label: "2024년 역대 최대 — 3년 만의 반등",
    description:
      "2024년 귀촌 인구 42.2만 명은 역대 최대치로, 2021년 이후 3년 만의 반등이에요. 30대가 전체 귀촌인의 23.4%로 최대 비중을 차지했으며, 직업(32.0%), 주택(26.6%), 가족(24.2%) 순으로 귀촌 사유가 집계됐어요.",
    source: "통계청 귀농귀촌인통계 (2024)",
    sourceUrl: "https://www.freezine.co.kr/news/articleView.html?idxno=10836",
    relatedYears: [2024],
  },
];

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

const _firstYouth = youthData[0];
const _latestYouth = youthData[youthData.length - 1];

export const youthSummary = {
  title: "청년 귀농 트렌드",
  description:
    `전체 귀농인 중 40세 미만 청년 비율은 ${_firstYouth.year}년 ${_firstYouth.ratio}%에서 ${_latestYouth.year}년 ${_latestYouth.ratio}%로, ${_latestYouth.year - _firstYouth.year}년간 꾸준히 상승하며 역대 최고치를 기록했어요. 스마트팜, 6차 산업 등 기술 기반 농업의 확산과 정부의 청년 귀농 지원 강화가 주요 요인이에요. 도시의 높은 주거비·경쟁에 대한 피로감도 청년층의 농촌 이주를 촉진하고 있어요.`,
  source: `농림축산식품부 귀농귀촌 실태조사 (${_latestYouth.year})`,
};

export const youthCauses: CauseAnalysis[] = [
  {
    label: "스마트팜 확산 — 기술 기반 농업 진입 장벽 하락",
    description:
      "센서·자동화 시스템을 활용한 스마트팜 도입으로 노동 강도가 줄고 경험 없이도 생산성을 유지할 수 있게 됐어요. 스마트팜 딸기 재배 시 생산량 30~50% 증가가 가능하며, 이는 IT에 익숙한 청년층에게 매력적인 진입 경로가 되고 있어요.",
    source: "농림축산식품부, 스마트팜 산업 활성화 동향",
    sourceUrl: "https://www.narasallim.net/project/1378",
    relatedYears: [2020, 2021, 2022, 2023, 2024],
  },
  {
    label: "정부 청년 귀농 지원 정책 강화",
    description:
      "2023년부터 「제1차 후계·청년농 육성 기본계획('23~'27)」이 추진 중이며, 2024년에는 지원 대상을 농촌 거주·관련 산업 청년으로 확대했어요. 청년창업 스마트팜 종합자금 30억 한도(연리 1%, 5년 거치), 교육비 무료, 임대형 스마트팜 우선 입주 등의 혜택이 제공돼요.",
    source: "농림축산식품부, 농업·농촌 청년정책 추진방향 (2024.08)",
    sourceUrl: "https://www.gov.kr/portal/ntnadmNews/3734523",
    relatedYears: [2023, 2024],
  },
  {
    label: "'농업의 비전' — 청년 귀농 사유 7년 연속 최고",
    description:
      "30대 이하 청년층이 '농업의 비전 및 발전 가능성'을 귀농 사유로 꼽은 비율이 27.3%로 7년 연속 최고치를 기록했어요. 6차 산업, 체험 농업, 로컬 브랜딩 등 새로운 농업 모델이 청년들에게 창업 기회로 인식되고 있어요.",
    source: "대한민국 정책브리핑, 청년층 귀농 이유 분석",
    sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148940202",
    relatedYears: [2022, 2023, 2024],
  },
];

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
    "귀농인의 70%가 현재 생활에 만족한다고 응답했으며, 자연환경과 여유로운 삶이 가장 큰 만족 요인으로 꼽혔어요. 반면 의료 접근성, 문화생활 부족, 소득 불안정이 주요 불만 요인이에요. 도시 대비 월 생활비가 25% 낮아 경제적 여유가 만족도에 기여하고 있어요.",
  source: `농림축산식품부 귀농귀촌 실태조사 (${_latestPop.year})`,
};

export const satisfactionCauses: CauseAnalysis[] = [
  {
    label: "자연환경 + 여유 — 만족도 핵심 드라이버",
    description:
      "귀농 사유 1위가 '자연환경'(30.3%)이고 만족 요인 1위도 '자연환경'(45%)으로, 기대와 현실이 일치하는 유일한 영역이에요. 귀농·귀촌 10가구 중 7가구(71.9%)가 생활에 만족하며, 지역주민과의 관계가 좋다는 응답도 75.5%에 달해요.",
    source: "농림축산식품부, 2023 귀농·귀촌 실태조사",
    sourceUrl: "https://www.mafra.go.kr/bbs/home/792/569593/artclView.do",
  },
  {
    label: "생활비 25% 절감 — 그러나 소득도 감소",
    description:
      "귀농 가구의 월평균 생활비는 도시 239만원에서 173만원으로 25.1% 감소했어요. 하지만 이는 자발적 절약이 아닌 소득 감소에 따른 강제적 지출 축소로 해석돼요. 5년차 귀농가구 연평균 소득은 3,300만원 수준이에요.",
    source: "서울신문, 5년차 귀농가구 연평균 소득 3300만원",
    sourceUrl: "https://www.seoul.co.kr/news/society/2026/02/25/20260225500116",
  },
  {
    label: "의료 접근성 — 불만족 1위 요인의 구조적 원인",
    description:
      "농촌 지역은 도시 대비 의료서비스 접근성, 이용 가능 범위, 응급의료 모두 낮은 수준이에요. 한국보건사회연구원 연구에 따르면 농촌 1인 가구 비율이 높아질수록 미충족 의료 수요가 증가하며, 이는 귀농인의 장기 정착을 저해하는 핵심 요인이에요.",
    source: "한국농촌경제연구원, 농촌·도시 건강실태 및 의료비용 효과 비교",
    sourceUrl: "https://repository.krei.re.kr/bitstream/2018.oak/24943/1/P257.pdf",
  },
  {
    label: "초기 3년 — 정착 성패의 분기점",
    description:
      "귀촌인의 최대 고민은 경제 문제이며, 초기 3년간 집중 관리가 필요해요. 농외소득이 200만원 이상 급감하면서 전체 소득을 끌어내리는 구조가 확인되었으며, 이 시기를 넘기면 만족도가 안정화되는 경향이 있어요.",
    source: "농림축산식품부, 2024 귀농·귀촌 실태조사 (소득·정착 분석)",
    sourceUrl: "https://www.mafra.go.kr/bbs/home/792/569593/artclView.do",
  },
];

/* ── 4. 귀산촌 트렌드 (출처: 통계청 귀농귀촌인통계, 산림청) ── */

export interface YearlyMountain {
  year: number;
  /** 귀산촌 가구 수 */
  households: number;
}

export const mountainData: YearlyMountain[] = [
  { year: 2018, households: 1542 },
  { year: 2019, households: 1685 },
  { year: 2020, households: 1967 },
  { year: 2021, households: 2106 },
  { year: 2022, households: 2283 },
  { year: 2023, households: 2461 },
  { year: 2024, households: 2685 },
];

const _latestMtn = mountainData[mountainData.length - 1];
const _prevMtn = mountainData[mountainData.length - 2];
const _mtnGrowth = (((_latestMtn.households / _prevMtn.households) - 1) * 100).toFixed(1);

export const mountainSummary = {
  title: "귀산촌 트렌드",
  description:
    `산촌으로 이주하는 귀산촌 가구는 ${_latestMtn.year}년 ${_latestMtn.households.toLocaleString()}가구로 전년 대비 ${_mtnGrowth}% 증가했어요. 자연환경과 건강한 삶을 추구하는 은퇴 세대가 중심이며, 산림청의 귀산촌 창업 지원자금과 교육 프로그램이 정착을 돕고 있어요.`,
  source: `통계청 귀농귀촌인통계 · 산림청 (${_latestMtn.year})`,
};

export const mountainReasons: Factor[] = [
  { label: "자연환경·공기 질", pct: 38 },
  { label: "건강·여유로운 생활", pct: 26 },
  { label: "은퇴 후 전원생활", pct: 18 },
  { label: "가업 승계·연고지", pct: 12 },
  { label: "임업·임산물 사업", pct: 6 },
];

export const mountainCauses: CauseAnalysis[] = [
  {
    label: "은퇴 세대의 산촌 이주 증가",
    description:
      "귀산촌 가구주의 60%가 50~60대로, 도시 은퇴자의 제2인생 선택지로 산촌이 부상하고 있어요. 산림치유, 임산물 채취 등 저강도 활동으로도 소득과 건강을 동시에 챙길 수 있다는 점이 매력이에요.",
    source: "산림청 산림임업통계플랫폼 — 산촌·귀산촌 통계",
    sourceUrl: "https://kfss.forest.go.kr/stat/",
    relatedYears: [2022, 2023, 2024],
  },
  {
    label: "산림청 지원 정책 확대",
    description:
      "산림청은 귀산촌 창업 지원자금(최대 3억 원 융자), 귀산촌 교육(40시간 이수), 산촌진흥지역 정착 지원(주택 최대 7,500만 원) 등의 정책을 운영 중이에요. 2023년부터 산촌유학, 산촌생활 체험 프로그램도 확대됐어요.",
    source: "산림청 귀산촌 길라잡이",
    sourceUrl: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_000434&mn=AR02_06_02_02",
    relatedYears: [2023, 2024],
  },
  {
    label: "산촌진흥지역 지정 확대",
    description:
      "산촌진흥지역으로 지정된 읍·면이 전국 120여 개로 늘어나면서 지원 대상 지역이 확대됐어요. 강원, 경북, 전남, 충북 산간 지역이 주요 목적지이며, 지자체별 추가 지원도 활발해요.",
    source: "산림청 산림임업통계플랫폼",
    sourceUrl: "https://kfss.forest.go.kr/stat/",
    relatedYears: [2020, 2021, 2022, 2023, 2024],
  },
];

/* ── 5. 스마트팜 현황 (출처: 농림축산식품부, 스마트팜코리아) ── */

export interface YearlySmartfarm {
  year: number;
  /** 스마트팜 도입 농가 수 */
  farms: number;
  /** 시설면적 (ha) */
  area: number;
}

export const smartfarmData: YearlySmartfarm[] = [
  { year: 2018, farms: 4010, area: 4012 },
  { year: 2019, farms: 4615, area: 4386 },
  { year: 2020, farms: 5228, area: 4890 },
  { year: 2021, farms: 6039, area: 5320 },
  { year: 2022, farms: 7012, area: 5740 },
  { year: 2023, farms: 7847, area: 6050 },
  { year: 2024, farms: 8534, area: 6370 },
];

const _latestSf = smartfarmData[smartfarmData.length - 1];
const _firstSf = smartfarmData[0];
const _sfGrowthTotal = (((_latestSf.farms / _firstSf.farms) - 1) * 100).toFixed(0);

export const smartfarmSummary = {
  title: "스마트팜 현황",
  description:
    `스마트팜 도입 농가는 ${_firstSf.year}년 ${_firstSf.farms.toLocaleString()}곳에서 ${_latestSf.year}년 ${_latestSf.farms.toLocaleString()}곳으로 ${_sfGrowthTotal}% 증가했어요. IoT·AI 기반 자동 제어로 노동 강도를 줄이면서도 생산량 30~50% 향상이 가능해, 청년층과 귀농 초보자의 진입 장벽을 낮추고 있어요.`,
  source: `농림축산식품부 · 스마트팜코리아 (${_latestSf.year})`,
};

export const smartfarmCrops: Factor[] = [
  { label: "딸기", pct: 28 },
  { label: "토마토", pct: 22 },
  { label: "파프리카", pct: 16 },
  { label: "상추·엽채류", pct: 14 },
  { label: "화훼", pct: 10 },
  { label: "기타", pct: 10 },
];

export const smartfarmCauses: CauseAnalysis[] = [
  {
    label: "정부 스마트팜 확산 정책",
    description:
      "농식품부는 '스마트농업 확산·고도화' 전략으로 2027년까지 스마트팜 1만 호 달성을 목표로 하고 있어요. 시설비 30~50% 보조, 청년창업보육센터 4개소(김제·고흥·상주·밀양), 스마트팜 종합자금 융자(3억 한도, 연리 1%) 등을 지원해요.",
    source: "농림축산식품부, 스마트농업 확산·고도화 방안",
    sourceUrl: "https://www.smartfarmkorea.net",
    relatedYears: [2022, 2023, 2024],
  },
  {
    label: "청년창업보육센터 — 20개월 무료 교육",
    description:
      "전국 4개 스마트팜 혁신밸리에서 20개월 장기 교육(입문 → 교육형실습 → 경영형실습)을 국비 무료로 제공해요. 실습비 월 최대 70만 원, 실습재료비 연 최대 360만 원이 지원되며, 수료 후 임대형 스마트팜 입주도 가능해요.",
    source: "한국농업기술진흥원, 스마트팜 청년창업보육센터",
    sourceUrl: "https://www.smartfarmkorea.net",
    relatedYears: [2023, 2024],
  },
  {
    label: "생산성 향상 효과 입증",
    description:
      "스마트팜 도입 시 딸기 기준 생산량 30~50% 증가, 노동시간 20~30% 절감 효과가 확인됐어요. 데이터 기반 정밀 관리로 품질 균일성도 높아져 수출·프리미엄 시장 진입이 용이해지고 있어요.",
    source: "농촌진흥청, 스마트팜 성과분석",
    sourceUrl: "https://www.smartfarmkorea.net",
    relatedYears: [2020, 2021, 2022, 2023, 2024],
  },
];
