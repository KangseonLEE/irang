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

/* ── 귀농 트렌드 데이터 (출처: 통계청·농림축산식품부, 2024년 귀농귀촌인통계) ── */

export interface TrendStat {
  value: string;
  label: string;
  sub: string;
  emoji: string;
}

export const trendStats: TrendStat[] = [
  {
    value: "42.2만",
    label: "2024 귀촌 인구",
    sub: "전년 대비 +5.7%",
    emoji: "\u{1F3E1}",
  },
  {
    value: "13.1%",
    label: "청년 귀농 비율",
    sub: "역대 최고 기록",
    emoji: "\u{1F469}\u{200D}\u{1F33E}",
  },
  {
    value: "70%",
    label: "귀농 만족도",
    sub: "도시 대비 생활비 25%↓",
    emoji: "\u{1F44D}",
  },
];

export interface TrendReason {
  label: string;
  pct: number;
}

export const trendReasons: TrendReason[] = [
  { label: "자연환경이 좋아서", pct: 30 },
  { label: "농업의 비전·발전 가능성", pct: 22 },
  { label: "가업승계", pct: 19 },
  { label: "가족·친지 근처 거주", pct: 15 },
];

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
}

export const trendNews: NewsItem[] = [
  {
    title: "귀농·귀촌 지원사업 올해 대폭 확대…청년 농업인 육성 본격화",
    source: "한국농어민신문",
    date: "2026.03",
    url: "https://www.agrinet.co.kr/news/articleView.html?idxno=325410",
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
    title: "스마트팜으로 연 매출 1억…귀농 성공 사례가 늘고 있다",
    source: "농민신문",
    date: "2025.11",
    url: "https://www.nongmin.com/article/20251115500001",
  },
  {
    title: "농촌에 터 잡은 인구 3년 만에 늘었다…귀농 청년 비중 역대 최고",
    source: "뉴시스",
    date: "2025.06",
    url: "https://www.newsis.com/view/NISX20250624_0003225143",
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
    emoji: "\u{1F353}",
    badge: "과수",
    difficulty: "보통",
    season: "11월~5월",
  },
  {
    id: "chili-pepper",
    name: "고추",
    emoji: "\u{1F336}\u{FE0F}",
    badge: "채소",
    difficulty: "보통",
    season: "3월~10월",
  },
  {
    id: "apple",
    name: "사과",
    emoji: "\u{1F34E}",
    badge: "과수",
    difficulty: "어려움",
    season: "3월~11월",
  },
  {
    id: "rice",
    name: "쌀",
    emoji: "\u{1F33E}",
    badge: "식량",
    difficulty: "쉬움",
    season: "4월~10월",
  },
];

export const hotPrograms = [
  {
    id: "prg-001",
    title: "귀농인 정착지원금",
    region: "순천시",
    type: "보조금",
    amount: "최대 3,000만 원",
    tag: "귀농 초기 정착",
  },
  {
    id: "prg-002",
    title: "청년 귀농 창업지원",
    region: "전국",
    type: "보조금",
    amount: "최대 3억 원 융자",
    tag: "만 40세 이하 청년",
  },
  {
    id: "prg-004",
    title: "귀촌 주택 수리비 지원",
    region: "전남",
    type: "보조금",
    amount: "최대 5,000만 원",
    tag: "농촌 주거 안정",
  },
  {
    id: "prg-003",
    title: "귀농 농업창업 지원",
    region: "전국",
    type: "융자",
    amount: "최대 3억 원",
    tag: "영농 경력 없는 분",
  },
];
