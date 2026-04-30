/* ────────────────────────────────────────────
   랜딩페이지 데이터
   page.tsx 에서 분리 — Tailwind 의존 없음
   ──────────────────────────────────────────── */

export type ColorKey = "brand" | "blue" | "green" | "amber" | "red";

/* ── 데이터 출처 ── */

export interface DataSourceItem {
  iconKey: "cloudSun" | "barChart" | "trendingUp" | "hospital" | "graduationCap";
  colorKey: ColorKey;
  tagLabel: string;
  name: string;
  code: string;
  description: string;
  /** 내부 링크 — 해당 데이터가 활용되는 서비스 페이지 */
  link: string;
}

export const dataSources: DataSourceItem[] = [
  {
    iconKey: "cloudSun",
    colorKey: "amber",
    tagLabel: "기후",
    name: "기상청",
    code: "KMA",
    description: "ASOS 종관기상 관측 데이터",
    link: "/regions",
  },
  {
    iconKey: "barChart",
    colorKey: "blue",
    tagLabel: "인구·통계",
    name: "통계청 SGIS",
    code: "SGIS",
    description: "지역별 인구·고령화 데이터",
    link: "/regions",
  },
  {
    iconKey: "trendingUp",
    colorKey: "green",
    tagLabel: "농업 통계",
    name: "통계청 KOSIS",
    code: "KOSIS",
    description: "농업 생산량·재배면적 통계",
    link: "/crops",
  },
  {
    iconKey: "hospital",
    colorKey: "red",
    tagLabel: "의료",
    name: "심평원",
    code: "HIRA",
    description: "지역별 의료기관 분포",
    link: "/regions",
  },
  {
    iconKey: "graduationCap",
    colorKey: "brand",
    tagLabel: "교육",
    name: "교육부",
    code: "NEIS",
    description: "지역별 학교 수 데이터",
    link: "/regions",
  },
];

/* ── (구) 귀농 트렌드 데이터: TREND_BENTO_PROFILES로 이전 완료 ── */

/**
 * 뉴스 아이템 (폴백 전용 — 네이버 API 미설정/장애 시 표시)
 * 실서비스에서는 lib/api/news.ts의 fetchLatestNews()가 매일 자동 갱신
 */
export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
}

export const trendNews: NewsItem[] = [
  {
    title: "월 110만원씩의 지원금…청년농 미래 비전 키운 '안전 소득망'",
    source: "세계일보",
    date: "2026.04",
    url: "https://v.daum.net/v/20260403060340434",
  },
  {
    title: "\u201C70%가 만족한다\u201D…도시 떠나 농촌으로 간 결정적 이유 1위는?",
    source: "경기일보",
    date: "2026.02",
    url: "https://www.kyeonggi.com/article/20260225580298",
  },
  {
    title: "귀농인은 누구?…'50대 중반 남성 1인 가구'가 평균",
    source: "연합뉴스",
    date: "2026.02",
    url: "https://v.daum.net/v/20260209063131293",
  },
  {
    title: "충남 귀농 청년, 스마트팜으로 1년만에 1.5억원 벌어",
    source: "아시아경제",
    date: "2025.06",
    url: "https://www.asiae.co.kr/article/2025061615310943792",
  },
  {
    title: "농촌에 터 잡은 인구 3년 만에 늘었다…귀농 청년 비중 역대 최고",
    source: "뉴시스",
    date: "2025.06",
    url: "https://www.newsis.com/view/NISX20250624_0003225143",
  },
];

/** 교육·연수 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
export const trendEduNews: NewsItem[] = [
  {
    title: "2025년 스마트팜 실용교육 교육생 모집 공고",
    source: "서울농업기술센터",
    date: "2025.04",
    url: "https://agro.seoul.go.kr/archives/53250",
  },
  {
    title: "농식품부, 스마트농업 전문인력 교육기관 모집",
    source: "정책브리핑",
    date: "2025.03",
    url: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156639853",
  },
  {
    title: "화순군, 2025 현장실습교육 연수 약정 체결",
    source: "뉴스로",
    date: "2025.03",
    url: "https://www.newsro.kr/article243/800869/",
  },
  {
    title: "함양군, '2025년 귀농귀촌 전문교육' 수료식 개최",
    source: "뉴스로",
    date: "2025.05",
    url: "https://www.newsro.kr/article243/970952/",
  },
];

/** 축제·체험 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
export const trendEventNews: NewsItem[] = [
  {
    title: "'농업·농촌 혁신이 만드는 성장과 행복', 2025 대한민국 농업박람회 개최",
    source: "정책브리핑",
    date: "2025.09",
    url: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156711948",
  },
  {
    title: "세 명의 기자와 '2025 농업박람회' 현장을 가다",
    source: "정책브리핑",
    date: "2025.10",
    url: "https://www.korea.kr/news/reporterView.do?newsId=148950726",
  },
  {
    title: "'Y-FARM EXPO 2025'에서 안성시 청년·귀농 정책 알린다!",
    source: "뉴스로",
    date: "2025.04",
    url: "https://www.newsro.kr/article243/894544",
  },
  {
    title: "부안군귀농귀촌센터, 2025 A FARM SHOW 창농·귀농 박람회 참가",
    source: "내외일보",
    date: "2025.08",
    url: "https://www.naewoeilbo.com/news/articleView.html?idxno=2171314",
  },
];

/** 지원사업 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
export const trendProgramNews: NewsItem[] = [
  {
    title: "2026년 청년농업인 영농정착지원사업 모집 개시",
    source: "농림축산식품부",
    date: "2025.11",
    url: "https://www.mafra.go.kr/home/5109/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGaG9tZSUyRjc5MiUyRjU3NTgxMCUyRmFydGNsVmlldy5kbyUzRg%3D%3D",
  },
  {
    title: "귀농인 대상 농업창업·주택구입 자금 지원",
    source: "정책브리핑",
    date: "2024.07",
    url: "https://www.korea.kr/news/policyNewsView.do?newsId=148931163",
  },
  {
    title: "곡성군, 귀농인 성공 정착 돕는 '귀농닥터 지원사업' 협약식 개최",
    source: "한국연합신문",
    date: "2026.04",
    url: "https://www.koreaunionnews.com/2100423",
  },
  {
    title: "함평군, 귀농인 농업 창업 및 주택 구매 융자 지원 접수",
    source: "뉴스로",
    date: "2025.06",
    url: "https://www.newsro.kr/article243/1008700/",
  },
];

/** 정부·정책 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
export const trendPolicyNews: NewsItem[] = [
  {
    title: "月15만원의 힘…농어촌 인구 반등 물꼬텄다",
    source: "서울경제",
    date: "2026.03",
    url: "https://www.sedaily.com/article/20014738",
  },
  {
    title: "농식품부, 귀농시 6219만원·귀촌시 4563만 원 필요",
    source: "농수축산신문",
    date: "2026.03",
    url: "http://www.aflnews.co.kr/news/articleView.html?idxno=315465",
  },
  {
    title: "농촌출신은 귀농, 도시출신은 귀촌",
    source: "내일신문",
    date: "2026.02",
    url: "https://www.naeil.com/news/read/579260",
  },
  {
    title: "송미령 농림축산식품부 장관, 전방위 농정 대응 강화",
    source: "CBC뉴스",
    date: "2026.04",
    url: "https://www.cbci.co.kr/news/articleView.html?idxno=566385",
  },
];

/* ── 벤토 미리보기 데이터 ── */

export const popularRegions = [
  {
    name: "순천",
    provinceId: "jeonnam",
    climate: "연평균 13.5°C",
    highlight: "귀농 정착금 최대 3천만 원",
  },
  {
    name: "제주",
    provinceId: "jeju",
    climate: "연평균 16.2°C",
    highlight: "감귤·아열대 작물 특화",
  },
  {
    name: "영주",
    provinceId: "gyeongbuk",
    climate: "연평균 11.3°C",
    highlight: "사과·인삼 전국 최고 품질",
  },
  {
    name: "수원",
    provinceId: "gyeonggi",
    climate: "연평균 12.8°C",
    highlight: "수도권 직거래 최적 입지",
  },
];

export const popularCrops = [
  {
    id: "strawberry",
    name: "딸기",
    badge: "과수",
    difficulty: "보통",
    season: "11월~5월",
  },
  {
    id: "chili-pepper",
    name: "고추",
    badge: "채소",
    difficulty: "보통",
    season: "3월~10월",
  },
  {
    id: "apple",
    name: "사과",
    badge: "과수",
    difficulty: "어려움",
    season: "3월~11월",
  },
  {
    id: "rice",
    name: "쌀",
    badge: "식량",
    difficulty: "쉬움",
    season: "4월~10월",
  },
];

export const hotPrograms = [
  {
    id: "SP-001",
    title: "귀농 농업창업 및 주택구입 지원",
    region: "전국",
    type: "융자",
    amount: "창업 최대 3억 / 주택 7,500만원",
    tag: "대표 정착지원",
  },
  {
    id: "SP-002",
    title: "청년농업인 영농정착지원",
    region: "전국",
    type: "보조금",
    amount: "월 최대 110만원 (3년간)",
    tag: "만 39세 이하 청년",
  },
  {
    id: "SP-011",
    title: "귀농닥터 멘토링",
    region: "전국",
    type: "컨설팅",
    amount: "무료 1:1 현장 컨설팅",
    tag: "상시 모집 · 초보 추천",
  },
  {
    id: "SP-005",
    title: "함평 체류형 귀농 지원센터",
    region: "전남 함평",
    type: "현물",
    amount: "주거+농지+시설 제공",
    tag: "체류형 귀농 체험",
  },
];

/* ── 귀농 트렌드 벤토 데이터 ── */

export type TrendTypeId = "farming" | "rural" | "youth" | "mountain" | "smartfarm";

export const TREND_TYPES: { id: TrendTypeId; label: string }[] = [
  { id: "farming", label: "귀농" },
  { id: "rural", label: "귀촌" },
  { id: "youth", label: "청년농" },
  { id: "mountain", label: "귀산촌" },
  { id: "smartfarm", label: "스마트팜" },
];

export interface TrendBentoStat {
  value: string;
  label: string;
  sub: string;
  desc: string;
}

export interface TrendBentoProfile {
  id: TrendTypeId;
  label: string;
  title: string;
  titleEm: string;
  subtitle: string;
  href: string;
  source: string;
  hero: { value: string; label: string; sub: string; desc: string };
  stats: [TrendBentoStat, TrendBentoStat];
  chart: { title: string; surveyLabel: string; items: { label: string; pct: number }[] };
  compare: { title: string; items: { label: string; change: string; detail: string }[] };
}

export const TREND_BENTO_PROFILES: Record<TrendTypeId, TrendBentoProfile> = {
  farming: {
    id: "farming",
    label: "귀농",
    title: "왜 귀농을 할까?",
    titleEm: "귀농",
    subtitle: "매년 1.2만 명이 도시를 떠나 농촌을 선택하고 있어요",
    href: "/stats/population",
    source: "통계청 · 농림축산식품부 2025 귀농귀촌 실태조사",
    hero: {
      value: "1.2만",
      label: "2024 귀농 인구",
      sub: "귀촌 42.2만 포함 시 +5.7%",
      desc: "매년 꾸준히 도시를 떠나 농촌에 정착하는 사람들이 늘고 있어요",
    },
    stats: [
      { value: "13.1%", label: "청년 귀농 비율", sub: "역대 최고 기록", desc: "2030 세대의 귀농이 빠르게 늘며 농촌의 평균 연령이 낮아지고 있어요" },
      { value: "70%", label: "귀농 만족도", sub: "도시 대비 생활비 25%↓", desc: "귀농 후 삶의 질이 높아졌다고 응답한 비율이에요" },
    ],
    chart: {
      title: "어떤 이유로 떠났을까?",
      surveyLabel: "귀농인 3,092명 응답",
      items: [
        { label: "자연환경이 좋아서", pct: 30 },
        { label: "농업의 비전·발전 가능성", pct: 22 },
        { label: "가업승계", pct: 19 },
        { label: "가족·친지 근처 거주", pct: 15 },
        { label: "건강·여유로운 생활", pct: 8 },
      ],
    },
    compare: {
      title: "농촌으로 가면 뭐가 달라질까?",
      items: [
        { label: "월 생활비", change: "-25.1%", detail: "239만 원 → 173만 원" },
        { label: "주거비 (3.3㎡당)", change: "-80%", detail: "1,800만 원 → 350만 원" },
        { label: "출퇴근", change: "-48분", detail: "평균 58분 → 차로 10분" },
        { label: "생활 만족도", change: "+18%p", detail: "52% → 70%" },
      ],
    },
  },
  rural: {
    id: "rural",
    label: "귀촌",
    title: "왜 귀촌을 할까?",
    titleEm: "귀촌",
    subtitle: "42.2만 명이 농업 없이도 농촌에서 새 삶을 시작했어요",
    href: "/stats/population",
    source: "통계청 2025 귀농귀촌인통계",
    hero: {
      value: "42.2만",
      label: "2024 귀촌 인구",
      sub: "역대 최대 · 전년 대비 +5.7%",
      desc: "농업 없이 농촌에 정착하는 귀촌 인구가 역대 최대를 기록했어요",
    },
    stats: [
      { value: "23.4%", label: "30대 비중", sub: "가장 많은 연령대", desc: "30대가 귀촌 인구 중 가장 높은 비율을 차지하고 있어요" },
      { value: "42.7%", label: "수도권 출발", sub: "서울·경기·인천", desc: "수도권에서 출발하는 귀촌이 절반에 가까워요" },
    ],
    chart: {
      title: "왜 농촌을 선택했을까?",
      surveyLabel: "귀촌인 실태조사",
      items: [
        { label: "전원생활 선호", pct: 35 },
        { label: "직장 이전·통근", pct: 22 },
        { label: "가족과 동거", pct: 18 },
        { label: "주거비 절감", pct: 15 },
        { label: "건강·여가 활동", pct: 10 },
      ],
    },
    compare: {
      title: "귀촌하면 뭐가 달라질까?",
      items: [
        { label: "주거 면적", change: "2.2배", detail: "58㎡ → 130㎡ 단독주택" },
        { label: "월 생활비", change: "-25.1%", detail: "239만 원 → 173만 원" },
        { label: "미세먼지", change: "-29%", detail: "24㎍/㎥ → 17㎍/㎥" },
        { label: "출퇴근", change: "-48분", detail: "평균 58분 → 차로 10분" },
      ],
    },
  },
  youth: {
    id: "youth",
    label: "청년농",
    title: "청년, 왜 농업을 택할까?",
    titleEm: "농업",
    subtitle: "40세 미만 청년농 비율 13.1%로 역대 최고를 기록했어요",
    href: "/stats/youth",
    source: "농림축산식품부 2025 귀농귀촌 실태조사",
    hero: {
      value: "13.1%",
      label: "청년농 비율",
      sub: "40세 미만 · 역대 최고",
      desc: "스마트팜과 6차 산업으로 청년 귀농이 빠르게 늘고 있어요",
    },
    stats: [
      { value: "3,600만원", label: "영농정착지원금", sub: "월 110·100·90만원 × 3년 (매년 감액)", desc: "만 18~39세 청년 창업농에게 지급되는 정부 보조금이에요" },
      { value: "33세", label: "평균 나이", sub: "2024년 기준", desc: "점점 더 젊은 세대가 농업을 선택하고 있어요" },
    ],
    chart: {
      title: "청년이 농업을 택한 이유",
      surveyLabel: "청년 귀농인 설문",
      items: [
        { label: "비전·발전 가능성", pct: 27 },
        { label: "자연환경이 좋아서", pct: 22 },
        { label: "자유로운 생활", pct: 19 },
        { label: "가업승계", pct: 17 },
        { label: "IT·스마트팜 관심", pct: 15 },
      ],
    },
    compare: {
      title: "청년농 지원, 얼마나 받을까?",
      items: [
        { label: "정착지원금", change: "월 110만원", detail: "보조금 · 최대 3년" },
        { label: "창업자금", change: "최대 3억원", detail: "저금리 융자 지원" },
        { label: "농지임차 보조", change: "연 300만원", detail: "임차료 50~80% 지원" },
        { label: "교육비", change: "전액 무료", detail: "귀농 교육 100시간+" },
      ],
    },
  },
  mountain: {
    id: "mountain",
    label: "귀산촌",
    title: "왜 산촌으로 떠날까?",
    titleEm: "산촌",
    subtitle: "산촌진흥지역으로 이주하는 가구가 꾸준히 늘고 있어요",
    href: "/stats/mountain",
    source: "통계청 · 산림청 귀산촌 동향",
    hero: {
      value: "2,685",
      label: "2024 귀산촌 가구",
      sub: "전년 대비 +9.1%",
      desc: "자연환경과 건강한 삶을 찾아 산촌으로 이주하는 흐름이에요",
    },
    stats: [
      { value: "74%", label: "7년간 증가율", sub: "2018 → 2024", desc: "2018년 1,542가구에서 7년 만에 74% 증가했어요" },
      { value: "120+", label: "산촌진흥지역", sub: "전국 지정", desc: "산림청이 지정한 귀산촌 대상 지역이에요" },
    ],
    chart: {
      title: "산촌으로 떠난 이유",
      surveyLabel: "귀산촌 가구 조사",
      items: [
        { label: "자연환경·건강", pct: 38 },
        { label: "전원생활 선호", pct: 25 },
        { label: "가족 이유", pct: 15 },
        { label: "경제적 이유", pct: 12 },
        { label: "귀농 연계", pct: 10 },
      ],
    },
    compare: {
      title: "산촌 생활, 뭐가 달라질까?",
      items: [
        { label: "주거비", change: "-65%", detail: "도시 대비 크게 절감" },
        { label: "공기질", change: "PM2.5 -35%", detail: "도시 대비 맑은 공기" },
        { label: "주거 면적", change: "2배+", detail: "단독주택 130㎡ 이상" },
        { label: "산림소득", change: "연 500만원+", detail: "임산물·체험 수익" },
      ],
    },
  },
  smartfarm: {
    id: "smartfarm",
    label: "스마트팜",
    title: "스마트팜, 얼마나 늘었을까?",
    titleEm: "스마트팜",
    subtitle: "IoT·AI 기반 스마트팜이 빠르게 확산되고 있어요",
    href: "/stats/smartfarm",
    source: "농림축산식품부 · 스마트팜코리아",
    hero: {
      value: "8,534",
      label: "2024 스마트팜 농가",
      sub: "7년간 +113%",
      desc: "IoT·AI 기반 정밀 농업이 전국으로 확산되고 있어요",
    },
    stats: [
      { value: "6,370ha", label: "시설면적", sub: "전국 기준", desc: "스마트팜이 설치된 전체 시설면적이에요" },
      { value: "1만호", label: "2027 목표", sub: "정부 확산 목표", desc: "정부가 추진 중인 스마트팜 확산 목표예요" },
    ],
    chart: {
      title: "주요 재배 작물",
      surveyLabel: "스마트팜 농가 기준",
      items: [
        { label: "딸기", pct: 25 },
        { label: "토마토", pct: 20 },
        { label: "파프리카", pct: 15 },
        { label: "화훼류", pct: 12 },
        { label: "엽채류", pct: 10 },
      ],
    },
    compare: {
      title: "스마트팜 도입 효과",
      items: [
        { label: "생산량", change: "30~50%↑", detail: "정밀 환경 제어" },
        { label: "인건비", change: "-30%", detail: "자동화 효과" },
        { label: "품질 균일도", change: "+40%", detail: "데이터 기반 관리" },
        { label: "병충해", change: "-20%", detail: "조기 감지·대응" },
      ],
    },
  },
};

/* ── 비용 유형별 데이터 ── */

export type CostTypeId = "farming" | "village" | "youth" | "forestry" | "smartfarm";

export const COST_TYPES: { id: CostTypeId; label: string }[] = [
  { id: "farming", label: "귀농" },
  { id: "village", label: "귀촌" },
  { id: "youth", label: "청년농" },
  { id: "forestry", label: "귀산촌" },
  { id: "smartfarm", label: "스마트팜" },
];

export interface CostHighlightCard {
  label: string;
  desc: string;
  value: number;
  /** "integer" → toLocaleString, "decimal1" → toFixed(1), "plain" → toString */
  format: "integer" | "decimal1" | "plain";
  unit: string;
  note?: string;
  source?: string;
  color: "primary" | "amber" | "muted";
}

export interface CostTypeProfile {
  id: CostTypeId;
  label: string;
  headline: string;
  em: string;
  desc: string;
  source: string;
  confidence: "official" | "estimated" | "range-only";
  confidenceNote?: string;
  hero: CostHighlightCard;
  cards: CostHighlightCard[];
  /** /costs 페이지 요약 */
  snapshot: {
    totalLabel: string;
    totalValue: string;
    totalRaw: number;
    totalUnit: string;
    totalSub: string;
    items: { label: string; value: string; sub: string }[];
  };
  /** 이 유형에서 표시할 섹션 목록 */
  visibleSections: ("age" | "crop" | "phase" | "compare" | "strategy" | "support" | "simulator")[];
}

export const COST_TYPE_PROFILES: Record<CostTypeId, CostTypeProfile> = {
  farming: {
    id: "farming",
    label: "귀농",
    headline: "귀농 정착까지,",
    em: "얼마가 들까?",
    desc: "평균 6,219만 원의 초기 비용 중 대부분은 영농 준비에 쓰여요. 정부 융자를 활용하면 부담을 크게 줄일 수 있어요.",
    source: "농림축산식품부 2025 귀농귀촌 실태조사",
    confidence: "official",
    hero: { label: "평균 초기 투자금", desc: "농지·시설·장비·종자 등 영농 시작에 필요한 총비용이에요", value: 6219, format: "integer", unit: "만원", color: "primary" },
    cards: [
      { label: "영농 준비비 비중", desc: "초기 비용의 대부분이 농지 구입과 시설 투자에 집중돼요", value: 84.6, format: "decimal1", unit: "%", note: "약 5,261만원", color: "primary" },
      { label: "평균 준비 기간", desc: "탐색부터 정착까지 평균 소요 기간이에요", value: 27.4, format: "decimal1", unit: "개월", color: "amber" },
      { label: "정부 주택자금 융자", desc: "귀농인 주거 안정을 위한 정부 지원 한도예요", value: 7500, format: "integer", unit: "만원", source: "귀농귀촌 정착지원사업", color: "muted" },
      { label: "농업창업자금 융자", desc: "영농 정착에 필요한 농지·시설·장비 구입 지원 한도예요", value: 3, format: "plain", unit: "억원", source: "농림축산식품부 융자사업", color: "primary" },
    ],
    snapshot: {
      totalLabel: "귀농 평균 총 비용",
      totalValue: "6,219",
      totalRaw: 6219,
      totalUnit: "만 원",
      totalSub: "이 중 <strong>84.6%</strong>가 영농 준비에 집중",
      items: [
        { label: "영농 준비 비용", value: "5,260만 원", sub: "농지·시설·장비" },
        { label: "평균 준비 기간", value: "27.4개월", sub: "탐색부터 정착까지" },
        { label: "정부 창업자금", value: "최대 3억 원", sub: "저금리 융자 지원" },
        { label: "주택자금 지원", value: "최대 7,500만 원", sub: "정부 융자 지원" },
      ],
    },
    visibleSections: ["age", "crop", "phase", "compare", "strategy", "support", "simulator"],
  },
  village: {
    id: "village",
    label: "귀촌",
    headline: "귀촌 정착까지,",
    em: "비용이 달라요",
    desc: "농업 없이 농촌에 정착하는 귀촌은 주거비가 비용의 대부분이에요. 임차로 시작하면 초기 부담을 크게 줄일 수 있어요.",
    source: "귀농귀촌 실태조사 + KB부동산 시세 기반 추정",
    confidence: "estimated",
    confidenceNote: "귀촌 단독 공식 실태조사가 없어 주거 시세 기반 추정값이에요",
    hero: { label: "임차 시작 기준 정착 비용", desc: "농업 없이 농촌에 정착할 때 필요한 주거·생활 비용이에요", value: 2800, format: "integer", unit: "만원", color: "primary" },
    cards: [
      { label: "주거비 비중", desc: "귀촌 비용의 대부분이 주택 임차나 구입에 집중돼요", value: 85, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "주거지 탐색과 이주 준비에 걸리는 기간이에요", value: 14, format: "decimal1", unit: "개월", color: "amber" },
      { label: "주택구입 융자", desc: "귀촌인 주거 안정을 위한 정부 융자 한도예요", value: 7500, format: "integer", unit: "만원", source: "귀농귀촌 정착지원사업", color: "muted" },
      { label: "지자체 정착 지원금", desc: "시·군별로 귀촌인에게 정착금을 지급해요", value: 1000, format: "integer", unit: "만원", source: "지자체별 300~2,000만 원", color: "primary" },
    ],
    snapshot: {
      totalLabel: "귀촌 정착 비용 (임차 기준)",
      totalValue: "2,800",
      totalRaw: 2800,
      totalUnit: "만 원",
      totalSub: "주택 구입 시 <strong>1억~1.5억 원</strong>으로 증가",
      items: [
        { label: "주거비 (임차)", value: "2,000만~8,000만 원", sub: "전세·월세 보증금" },
        { label: "이사·정착비", value: "300만~700만 원", sub: "이사비·인테리어" },
        { label: "주택구입 융자", value: "최대 7,500만 원", sub: "정부 융자 지원" },
        { label: "정착 지원금", value: "300만~2,000만 원", sub: "지자체별 상이" },
      ],
    },
    visibleSections: ["compare", "strategy"],
  },
  youth: {
    id: "youth",
    label: "청년농",
    headline: "청년농 창업,",
    em: "얼마면 시작할까?",
    desc: "30대 이하 귀농인의 평균 투자금은 8,209만 원이에요. 영농정착지원금과 창업자금을 합치면 실질 부담을 크게 줄일 수 있어요.",
    source: "농림축산식품부 2025 실태조사 + 청년창업농 시행지침",
    confidence: "estimated",
    confidenceNote: "실태조사 30대 이하 수치를 활용한 추정이에요",
    hero: { label: "30대 이하 평균 투자금", desc: "청년 귀농인의 평균 초기 투자 비용이에요", value: 8209, format: "integer", unit: "만원", color: "primary" },
    cards: [
      { label: "영농 준비비 비중", desc: "농지·시설·장비 투자가 전체의 대부분을 차지해요", value: 80, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "교육과 현장 실습을 거쳐 창업하는 기간이에요", value: 21, format: "decimal1", unit: "개월", color: "amber" },
      { label: "영농정착지원금", desc: "만 18~39세 창업농에게 월 110·100·90만 원을 3년 지급해요 (매년 감액)", value: 3600, format: "integer", unit: "만원", source: "보조금 · 농림축산식품부", color: "primary" },
      { label: "농업창업자금 융자", desc: "영농에 필요한 농지·시설·장비 구입 지원 한도예요", value: 3, format: "plain", unit: "억원", source: "농림축산식품부 융자사업", color: "muted" },
    ],
    snapshot: {
      totalLabel: "청년농 평균 총 비용",
      totalValue: "8,209",
      totalRaw: 8209,
      totalUnit: "만 원",
      totalSub: "영농정착지원금 <strong>최대 3,600만 원</strong> 별도 지원",
      items: [
        { label: "영농 준비 비용", value: "약 6,567만 원", sub: "농지·시설·장비" },
        { label: "영농정착지원금", value: "최대 3,600만 원", sub: "보조금 (만 18~39세)" },
        { label: "농업창업자금", value: "최대 3억 원", sub: "저금리 융자 지원" },
        { label: "농지임차 지원", value: "연 최대 300만 원", sub: "임차료 50~80% 보조" },
      ],
    },
    visibleSections: ["crop", "phase", "compare", "strategy", "support", "simulator"],
  },
  forestry: {
    id: "forestry",
    label: "귀산촌",
    headline: "귀산촌 정착,",
    em: "비용 구조가 달라요",
    desc: "임야 확보와 임산물 시설에 투자가 집중돼요. 산림청이 별도 창업자금을 지원하며, 농림부와 지원 체계가 달라요.",
    source: "산림청 귀산촌 지원사업 안내",
    confidence: "range-only",
    confidenceNote: "공식 실태조사가 없어 품목별 단가 기반 참고값이에요",
    hero: { label: "평균 창업 비용 (추정)", desc: "임야·시설·종묘 등 귀산촌 창업에 필요한 예상 비용이에요", value: 5000, format: "integer", unit: "만원", color: "primary" },
    cards: [
      { label: "시설 투자비 비중", desc: "차광망·재배사 등 임산물 시설에 투자가 집중돼요", value: 60, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "교육이수와 임야 확보에 귀농보다 시간이 더 걸려요", value: 30, format: "decimal1", unit: "개월", color: "amber" },
      { label: "산림청 창업자금", desc: "임산물 생산·임야 매입·시설 투자 융자 한도예요", value: 3, format: "plain", unit: "억원", source: "산림청 귀산촌 지원사업", color: "muted" },
      { label: "정착지원(주택)", desc: "귀산촌 정착에 필요한 주택 구입·신축 지원이에요", value: 7500, format: "integer", unit: "만원", source: "산림청 귀산촌 지원사업", color: "primary" },
    ],
    snapshot: {
      totalLabel: "귀산촌 창업 비용 (추정)",
      totalValue: "3,000~8,000",
      totalRaw: 5000,
      totalUnit: "만 원",
      totalSub: "품목(표고·산양삼·밤 등)에 따라 <strong>편차가 커요</strong>",
      items: [
        { label: "임야·시설 투자", value: "2,000~5,000만 원", sub: "차광망·재배사·종묘" },
        { label: "준비 기간", value: "24~36개월", sub: "교육이수 60~120시간" },
        { label: "산림청 창업자금", value: "최대 3억 원", sub: "금리 2% 융자 지원" },
        { label: "정착지원(주택)", value: "최대 7,500만 원", sub: "주택 구입·신축" },
      ],
    },
    visibleSections: ["compare", "strategy"],
  },
  smartfarm: {
    id: "smartfarm",
    label: "스마트팜",
    headline: "스마트팜 창업,",
    em: "초기 투자가 달라요",
    desc: "비닐하우스 ICT 기준 4,000만 원부터, 유리온실은 2억 원 이상이에요. 정부 시설 보조와 혁신밸리 프로그램을 활용할 수 있어요.",
    source: "농진청 스마트팜 시설 단가 · 농식품부 혁신밸리 사업",
    confidence: "range-only",
    confidenceNote: "시설 유형(비닐하우스·유리온실)에 따라 편차가 커요",
    hero: { label: "비닐하우스 ICT 기준", desc: "1,000㎡ 비닐하우스에 ICT 기초 장비를 갖추는 비용이에요", value: 4000, format: "integer", unit: "만원", color: "primary" },
    cards: [
      { label: "ICT·시설 비중", desc: "하우스 구조물과 환경 제어 장비에 비용이 집중돼요", value: 85, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "혁신밸리 교육 포함, 창업까지 걸리는 기간이에요", value: 12, format: "decimal1", unit: "개월", color: "amber" },
      { label: "정부 시설 보조", desc: "스마트팜 확산 사업으로 시설비의 일부를 보조받아요", value: 50, format: "plain", unit: "%", source: "농진청 스마트팜 확산사업", color: "primary" },
      { label: "농업창업자금 융자", desc: "스마트팜 설비와 농지 확보를 위한 융자 한도예요", value: 3, format: "plain", unit: "억원", source: "농림축산식품부 융자사업", color: "muted" },
    ],
    snapshot: {
      totalLabel: "스마트팜 초기 투자 (시설별)",
      totalValue: "4,000~2억",
      totalRaw: 4000,
      totalUnit: "만 원+",
      totalSub: "유리온실은 <strong>1억~2억 원</strong>, 식물공장은 <strong>5억 원+</strong>",
      items: [
        { label: "비닐하우스 + ICT", value: "3,000만~5,000만 원", sub: "1,000㎡ 기준" },
        { label: "유리온실 + ICT", value: "1억~2억 원", sub: "1,000㎡ 기준" },
        { label: "정부 시설 보조", value: "시설비 최대 50%", sub: "스마트팜 확산사업" },
        { label: "혁신밸리 임대형", value: "보증금 1,000만~3,000만", sub: "청년 창업 지원" },
      ],
    },
    visibleSections: ["crop", "compare", "strategy", "simulator"],
  },
};

/* ── 귀농 비용 데이터 (출처: 2025 귀농귀촌 실태조사) ── */

export interface CostByAge {
  age: string;
  amount: string;
  raw: number; // 만원 단위 — 차트 비율 계산용
}

export const costSummary = {
  totalAvg: "6,219만 원",
  farmlandPct: "84.6%",
  farmlandAmount: "5,260만 원",
  prepMonths: "27.4개월",
  govLoanMax: "최대 3억 원",
  housingMax: "최대 7,500만 원",
};

export const costByAge: CostByAge[] = [
  { age: "30대 이하", amount: "8,209만 원", raw: 8209 },
  { age: "40대", amount: "9,547만 원", raw: 9547 },
  { age: "50대", amount: "6,485만 원", raw: 6485 },
  { age: "60대", amount: "5,512만 원", raw: 5512 },
];

/* ── 준비 단계별 비용 집중도 (로드맵 연계) ── */

export interface CostPhase {
  steps: string;       // 로드맵 단계 번호 (예: "1·2")
  label: string;       // 단계 이름
  period: string;      // 소요 기간 (roadmapSteps와 일치)
  amount: string;      // 표시용 금액 / 태그
  raw: number;         // 비율 계산용 (만 원 단위, 0이면 소규모)
  desc: string;        // 비용 항목 설명
  peak?: boolean;      // 비용 집중 하이라이트
}

export const costByPhase: CostPhase[] = [
  { steps: "1·2", label: "탐색·교육", period: "1~6개월", amount: "소규모", raw: 0, desc: "교육비, 교통·체류비" },
  { steps: "3", label: "현장 답사", period: "6~12개월", amount: "소규모", raw: 0, desc: "답사 교통비, 임시 체류비" },
  { steps: "4", label: "영농 준비", period: "12~18개월", amount: "~5,260만 원", raw: 5260, desc: "농지, 농기계, 시설 투자", peak: true },
  { steps: "5", label: "정착", period: "18~27개월", amount: "~960만 원", raw: 960, desc: "주택 마련, 초기 생활 안정" },
];

/* ── 도시 vs 농촌 비교 데이터 ── */

export interface CompareRow {
  label: string;
  city: string;
  rural: string;
  change: string;
  /** 변화 방향의 의미: positive=농촌 유리, caution=아직 불리하나 개선 추세, neutral=중립 */
  sentiment: "positive" | "caution" | "neutral";
}

export const cityVsRural: CompareRow[] = [
  {
    label: "월 생활비",
    city: "239만 원",
    rural: "173만 원",
    change: "-25.1%",
    sentiment: "positive",
  },
  {
    label: "주거비 (3.3㎡당)",
    city: "1,800만 원",
    rural: "350만 원",
    change: "-80%",
    sentiment: "positive",
  },
  {
    label: "주거 형태",
    city: "아파트 58㎡",
    rural: "단독주택 130㎡",
    change: "2.2배 넓게",
    sentiment: "positive",
  },
  {
    label: "출퇴근",
    city: "평균 58분",
    rural: "차로 10분",
    change: "-48분",
    sentiment: "positive",
  },
  {
    label: "미세먼지 (PM2.5)",
    city: "24㎍/㎥",
    rural: "17㎍/㎥",
    change: "-29%",
    sentiment: "positive",
  },
  {
    label: "5년차 소득",
    city: "3,800만 원",
    rural: "3,300만 원",
    change: "격차 ↓ 추세",
    sentiment: "caution",
  },
  {
    label: "생활 만족도",
    city: "52%",
    rural: "70%",
    change: "+18%p",
    sentiment: "positive",
  },
  {
    label: "산림소득",
    city: "—",
    rural: "연 500만~1,500만 원",
    change: "+α",
    sentiment: "positive",
  },
  {
    label: "시설농 매출",
    city: "—",
    rural: "1.5억~2억 원 (1,000㎡)",
    change: "+α",
    sentiment: "positive",
  },
];

/* ── 귀농인 인터뷰 카드 (공개 보도 기반, 실명) ── */

export interface CropLink {
  name: string;
  href: string;
}

export interface InterviewCard {
  id: string;
  name: string;
  age: string;
  prevJob: string;
  currentJob: string;
  region: string;
  crop: string;
  quote: string;
  /** 원문 기사 URL */
  sourceUrl: string;
  sourceName: string;
  sourceDate: string;
  /** 인터뷰 상세 페이지용 */
  story: string;
  motivation: string;
  challenge: string;
  advice: string;
  /** 지역 데이터 페이지 링크 */
  regionUrl: string;
  /** 작물 데이터 페이지 링크 (매칭되는 작물만) */
  cropLinks: CropLink[];
}

export const interviews: InterviewCard[] = [
  {
    id: "jo-sungsu",
    name: "조성수",
    age: "28세",
    prevJob: "산업안전 분야 직장인",
    currentJob: "청년 농부",
    region: "전남 순천",
    crop: "딸기·콩·고구마",
    quote: "농사 짓는 일이 쉽지는 않지만, 도시 직업보다 훨씬 유망한 업종이에요.",
    sourceUrl: "https://news.ikbc.co.kr/article/view/kbc202403290022",
    sourceName: "KBC광주방송",
    sourceDate: "2024.03",
    story: "산업안전 분야를 전공하고 도시에서 1년간 직장 생활을 한 뒤, 부모님이 계신 순천으로 돌아왔어요. 겨울부터 봄까지는 딸기를, 봄부터 가을까지는 콩과 고구마를 재배하며 4계절 농사를 짓고 있어요.",
    motivation: "부모님이 순천에서 농사를 짓고 계셨는데, 도시 생활을 하면서 '결국 돌아가게 되지 않을까' 싶었어요. 막상 시작해보니 생각보다 가능성이 많더라고요.",
    challenge: "처음에는 체력적으로 많이 힘들었어요. 딸기 수확 시즌에는 새벽부터 움직여야 하니까요. 그래도 직접 키운 작물이 시장에 나가는 걸 보면 뿌듯해요.",
    advice: "재배만 하지 말고, 본인이 할 수 있는 다른 것을 새로 생각해내기만 한다면 농업은 정말 유망해요. 젊을 때 시작할수록 유리해요.",
    regionUrl: "/regions/jeonnam/suncheon",
    cropLinks: [
      { name: "딸기", href: "/crops/strawberry" },
      { name: "콩", href: "/crops/soybean" },
      { name: "고구마", href: "/crops/sweet-potato" },
    ],
  },
  {
    id: "bae-dongju",
    name: "배동주",
    age: "42세",
    prevJob: "청년 후계농 → 독립 경영",
    currentJob: "친환경 농산물 가공 대표",
    region: "충남 공주",
    crop: "친환경 농산물 가공",
    quote: "연고 없는 곳에서 시작하는 청년들에게 가장 큰 장벽은 경험과 정보 부족이에요.",
    sourceUrl: "https://www.seoul.co.kr/news/plan/youngman_area_future/2025/09/19/20250919008002",
    sourceName: "서울신문",
    sourceDate: "2025.09",
    story: "부친의 농업을 보조하다 독립 경영으로 전환했어요. 지금은 친환경 농산물로 아이스크림, 소스, 빵을 만들어 판매하고, 비영리단체 '농유피' 대표로 청년 귀농인을 돕고 있어요.",
    motivation: "농업의 가치를 알리고 싶었어요. 단순 재배가 아니라 가공까지 해야 부가가치가 생긴다는 걸 일찍 깨달았죠.",
    challenge: "농산물 가공은 위생 기준, 인증 절차가 까다로워요. 혼자 다 해야 하니까 행정 업무량이 상당했어요.",
    advice: "귀농 전에 체류형 프로그램부터 참여해보세요. 막연히 '농촌이 좋겠다'가 아니라, 실제로 살아보고 결정하는 게 중요해요.",
    regionUrl: "/regions/chungnam/gongju",
    cropLinks: [],
  },
  {
    id: "kang-namwook",
    name: "강남욱",
    age: "30대",
    prevJob: "자영업 (가게 운영)",
    currentJob: "스마트팜 딸기 농부",
    region: "전남 강진",
    crop: "딸기 (스마트팜·수출)",
    quote: "스마트팜 시설을 갖추니 걱정보다 덜 부지런해도 되더라고요.",
    sourceUrl: "https://www.farmnmarket.com/news/article.html?no=22960",
    sourceName: "팜앤마켓매거진",
    sourceDate: "2024.12",
    story: "서울에서 가게를 운영하다 코로나 시기에 부친의 농장 일손을 돕기 위해 강진으로 왔어요. 스마트팜 자립기반 사업에 선정되면서 본격적으로 딸기 재배를 시작했고, 지금은 수출까지 하고 있어요.",
    motivation: "코로나로 가게 운영이 어려워졌을 때 아버지가 '한번 와봐라' 하셔서요. 와보니 스마트팜이 생각보다 체계적이더라고요.",
    challenge: "농업을 전혀 몰랐기 때문에 처음 1년은 배우기만 했어요. 스마트팜 교육이 정말 도움이 많이 됐어요.",
    advice: "스마트팜은 데이터로 관리하니까 IT 감각이 있는 분들에게 정말 잘 맞아요. 정부 지원사업도 적극 활용하세요.",
    regionUrl: "/regions/jeonnam/gangjin",
    cropLinks: [{ name: "딸기", href: "/crops/strawberry" }],
  },
  {
    id: "lee-gyuho",
    name: "이규호",
    age: "52세",
    prevJob: "생산관리직 직장인",
    currentJob: "표고버섯 전업농",
    region: "충남 당진",
    crop: "표고버섯·벼·채소",
    quote: "표고 수확할 때의 뿌듯함은 직장 다닐 때 느껴본 적 없는 감정이에요.",
    sourceUrl: "https://bravo.etoday.co.kr/view/atc_view/2723",
    sourceName: "브라보마이라이프",
    sourceDate: "2024",
    story: "생산관리직으로 오래 근무하다 퇴직 후 귀농을 결심했어요. 벼, 무, 배추, 감자를 기본으로 하면서 표고버섯 전업농을 목표로 준비하고 있어요. 통나무를 자르고 나르는 건 중노동이지만, 표고가 자라는 걸 보면 행복해요.",
    motivation: "퇴직하고 뭘 할까 고민하다, 어릴 때 시골에서 자란 기억이 떠올랐어요. '다시 흙을 만져보자'는 마음으로 시작했죠.",
    challenge: "중장비 없이 하려면 체력이 관건이에요. 처음엔 통나무 하나 옮기기도 힘들었는데, 1년 지나니 몸이 적응하더라고요.",
    advice: "50대도 전혀 늦지 않아요. 오히려 인생 경험이 농사에 도움이 돼요. 다만 체력은 미리미리 만들어두세요.",
    regionUrl: "/regions/chungnam/dangjin",
    cropLinks: [{ name: "벼", href: "/crops/rice" }],
  },
  {
    id: "lee-jonghyun",
    name: "이종현·오한솔 부부",
    age: "31·30세",
    prevJob: "은행·대기업 직장인",
    currentJob: "방울토마토 농부 (부부 공동경영)",
    region: "경기 여주",
    crop: "방울토마토 (스마트팜)",
    quote: "우리 의지대로 우리만의 일을 하고 싶었고, 그러려면 농사가 최선이라는 데 의견이 모아졌어요.",
    sourceUrl: "https://www.nongmin.com/article/20240105500453",
    sourceName: "농민신문",
    sourceDate: "2024.01",
    story: "전북에서 은행과 대기업에 다니던 부부가 함께 퇴사하고 경기 여주로 귀농했어요. 2,644㎡ 규모의 스마트팜에서 대추형 방울토마토를 재배하며, 첫 시즌(11개월)에 1억 6천만 원의 판매 실적을 올렸어요.",
    motivation: "각자 안정적인 직장이 있었지만, 누군가의 지시가 아니라 '우리 의지대로 일하자'는 마음이 컸어요. 농업이라면 가능하겠다 싶었죠.",
    challenge: "잘할 수 있을까 겁이 나기도 했지만, 둘이 함께라 든든했어요. 밤낮없이 하우스에 붙어 살다시피 한 첫해가 가장 힘들었어요.",
    advice: "부부가 함께 한다면 정말 든든해요. 재배기술을 정교하게 다듬으면서 규모를 점차 늘려가는 전략이 중요해요.",
    regionUrl: "/regions/gyeonggi/yeoju",
    cropLinks: [],
  },
  {
    id: "yeom-sujeong",
    name: "염수정",
    age: "43세",
    prevJob: "반도체 회사 직장인",
    currentJob: "사과대추·딸기 농부 (6차산업)",
    region: "충남 천안",
    crop: "사과대추·딸기·가공식품",
    quote: "귀농으로 성공하려면 고3 수험생처럼 공부해야 해요.",
    sourceUrl: "https://www.nongmin.com/article/20240207500761",
    sourceName: "농민신문",
    sourceDate: "2024.02",
    story: "서울의 반도체 회사에서 일하다 2021년 충남 천안으로 귀농했어요. 사과대추와 딸기를 재배하면서 건대추, 진액 등 가공식품까지 직접 만들어 온·오프라인에서 판매하며 연간 1억 원 매출을 올리고 있어요.",
    motivation: "남편 퇴직이 얼마 남지 않기도 했고, 인생 2모작을 고민하다 정년 없이 오래 종사할 수 있는 농업을 택했어요.",
    challenge: "자연재해 대응이 가장 어려웠어요. 투자비용을 최소화하면서도 재해를 이겨낼 수 있는 시설을 갖추는 게 관건이었어요.",
    advice: "인터넷으로 선도농가를 찾아 주말마다 방문해서 배웠어요. 철저한 계획과 공부가 성공의 열쇠이에요.",
    regionUrl: "/regions/chungnam/cheonan",
    cropLinks: [{ name: "딸기", href: "/crops/strawberry" }],
  },
  {
    id: "kim-gwanghun",
    name: "김광훈",
    age: "36세",
    prevJob: "KCC중앙연구소 연구원",
    currentJob: "일품딸기농원 대표",
    region: "충북 충주",
    crop: "딸기 (스마트팜·설향)",
    quote: "거대한 회사의 톱니바퀴처럼 살아가는 삶에 깊은 회의감을 느꼈어요.",
    sourceUrl: "https://www.nongmin.com/article/20260304500386",
    sourceName: "농민신문",
    sourceDate: "2026.03",
    story: "KCC중앙연구소에서 자동차 페인트 색상을 개발하던 연구원이었어요. 2021년 귀농 후 충주시농업기술센터에서 6개월간 교육을 받고, 1,490㎡ 규모의 딸기 스마트팜을 운영하고 있어요.",
    motivation: "대기업의 톱니바퀴 같은 삶에 회의감을 느꼈어요. 온전히 '내 것'이 될 수 있는 일, 주체적인 삶을 찾고 싶었어요.",
    challenge: "처음에 일본 신품종을 시도했다가 흰가루병에 취약해서 실패했어요. 품종 선택의 중요성을 뼈저리게 느꼈어요.",
    advice: "스마트팜이 농사를 대신 지어주진 않아요. 작물 지식과 스마트팜 이해를 바탕으로 자신만의 농법을 찾아야 해요. 무리한 시설 투자보다 감당할 수 있는 규모로 시작하세요.",
    regionUrl: "/regions/chungbuk/chungju",
    cropLinks: [{ name: "딸기", href: "/crops/strawberry" }],
  },
];

/* ── 귀농 5단계 로드맵 ── */

export interface RoadmapStep {
  step: number;
  title: string;
  period: string;
  desc: string;
}

export const roadmapSteps: RoadmapStep[] = [
  {
    step: 1,
    title: "정보 탐색",
    period: "1~3개월",
    desc: "귀농 결심, 지역·작물 탐색",
  },
  {
    step: 2,
    title: "교육 이수",
    period: "3~6개월",
    desc: "귀농 교육 100시간 이상 이수",
  },
  {
    step: 3,
    title: "지역 선정",
    period: "6~12개월",
    desc: "체류형 귀농, 현장 답사",
  },
  {
    step: 4,
    title: "영농 시작",
    period: "12~18개월",
    desc: "농지 확보, 작물 결정, 창업",
  },
  {
    step: 5,
    title: "정착",
    period: "18~27개월",
    desc: "주거 안정, 지역 커뮤니티 합류",
  },
];

/* ── 자주 묻는 질문 (FAQ) ── */

export interface FaqItem {
  q: string;
  a: string;
}

export const faqItems: FaqItem[] = [
  {
    q: "몇 살까지 귀농할 수 있나요?",
    a: "나이 제한은 없어요. 다만 지원사업별로 연령 조건이 다르고, 만 40세 이하 '청년 귀농' 지원이 가장 많아요. 60대 이후에도 충분히 시작할 수 있어요.",
  },
  {
    q: "자금이 없어도 시작할 수 있나요?",
    a: "네. 농업창업자금 최대 3억 원(연 1.5~2% 저금리 융자), 주택자금 최대 7,500만 원까지 정부 지원을 받을 수 있어요.",
  },
  {
    q: "농사 경험이 전혀 없는데 괜찮을까요?",
    a: "귀농 교육(100시간 이상)을 이수하면 지원사업 신청 시 가점을 받아요. 체류형 귀농으로 1~6개월 살아보면서 시작하는 것도 방법이에요.",
  },
  {
    q: "가족과 함께 가야 하나요?",
    a: "아니요. 1인 가구 귀농도 꾸준히 늘고 있어요. 실태조사 기준 평균 귀농인 프로필은 '50대 중반 남성 1인 가구'이에요.",
  },
  {
    q: "귀농하면 실제로 얼마나 버나요?",
    a: "5년차 평균 가구소득 3,300만 원이에요. 첫해 2,534만 원에서 매년 늘어나고, 절반 이상이 농업 외 부수입(투잡)을 병행해요.",
  },
  {
    q: "실패하면 어떻게 되나요?",
    a: "귀농 5년 이내 이탈률은 약 20%이에요. 리스크를 줄이려면 체류형 귀농(1~6개월 살아보기)부터 시작하는 걸 추천해요.",
  },
];

/* ── 인기 검색어 (히어로 슬라이더) ── */

export interface TrendingSearch {
  label: string;
  query: string;
}

/**
 * 모든 키워드는 SEARCH_INDEX 실제 데이터와 매칭 검증 완료.
 * - 지역명: STATIONS province 키워드 부분매칭 (전남→전라남도 등)
 * - 작물명: CROPS name 정확매칭
 * - 사업유형: PROGRAMS supportType / title 부분매칭
 */
export const trendingSearches: TrendingSearch[] = [
  { label: "전남 딸기", query: "전남 딸기" },
  { label: "경북 사과", query: "경북 사과" },
  { label: "충남 스마트팜", query: "충남 스마트팜" },
  { label: "강원 감자", query: "강원 감자" },
  { label: "제주 감귤", query: "제주 감귤" },
  { label: "귀농 융자", query: "귀농 융자" },
  { label: "청년농업인", query: "청년농업인" },
  { label: "체류형 귀농", query: "체류형" },
  { label: "귀농 멘토링", query: "멘토링" },
  { label: "귀농 교육", query: "귀농 교육" },
  { label: "박람회", query: "박람회" },
  { label: "살아보기", query: "살아보기" },
];
