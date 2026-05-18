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
  /**
   * 짧은 요약(원문 OG description 인용 또는 자체 카피).
   * 200자 이내. 빌드/네이버 API 빈 응답 대비 정적 폴백.
   */
  description?: string;
  /** OG 이미지 URL. 깨지면 UI에서 Sprout 폴백 자동 적용. */
  thumbnail?: string;
}

export const trendNews: NewsItem[] = [
  {
    title: "[농업전망 2026] 청년·지역사회 잇고…공동체 힘으로 서비스 공백 메워야",
    source: "농민신문",
    date: "2026.01",
    url: "https://www.nongmin.com/article/20260123500540",
    description:
      "한국농촌경제연구원에 따르면 2025년 기준 우리나라 고령화율은 21.2%다. 전형적인 농촌에 해당하는 읍·면 지역은 29.7%에 달한다. 청년농의 농촌 정착 가능성을 높이려면 도시·농촌 청년 간 비즈니스 협력을 설계해야 한다는 제언이 나왔다.",
    thumbnail:
      "https://www.nongmin.com/-/raw/srv-nongmin/data2/content/image/2026/01/23/.cache/512/20260123500602.jpg",
  },
  {
    title: "귀농 자금 가구당 평균 6000만원…농지 구입·임차에 90% 이상 사용",
    source: "농민신문",
    date: "2026.02",
    url: "https://www.nongmin.com/article/20260225500580",
    description:
      "2025년 귀농 가구가 들인 투자금은 평균 6219만원으로 전년(5464만원) 대비 13.8% 증가하며 처음으로 6000만원을 돌파했다. 농지 마련에 5260만원이 쓰여 가장 많은 비중을 차지했다.",
    thumbnail:
      "https://www.nongmin.com/-/raw/srv-nongmin/data2/content/image/2026/02/26/.cache/512/20260226500235.jpg",
  },
  {
    title: "[농업전망 2026] 농지·농가인구 마지노선 무너졌다",
    source: "농민신문",
    date: "2026.01",
    url: "https://www.nongmin.com/article/20260123500578",
    description:
      "농업기반 유지의 최소 기준선으로 여겨지던 ‘경지면적 150만㏊’와 ‘농가인구 200만명’이 모두 무너졌다. 2026년 농가인구는 194만4820명으로 전망되며 전년 대비 감소율(1.9%)이 가팔라지고 있다.",
    thumbnail:
      "https://www.nongmin.com/-/raw/srv-nongmin/data2/content/image/2026/01/23/.cache/512/20260123500609.jpg",
  },
  {
    title: "[농림어업총조사] 농가인구 늘었지만…40세 미만 경영주 1.1%뿐",
    source: "농민신문",
    date: "2026.04",
    url: "https://www.nongmin.com/article/20260429500676",
    description:
      "2025년 농림어업총조사(잠정) 결과 농가인구가 5년 전보다 늘었으나, 40세 미만 청년 경영주 비중은 1.1%에 그쳤다. 고령인구는 크게 늘어 청년농 유입과 정착 지원이 절실한 상황이다.",
    thumbnail:
      "https://www.nongmin.com/-/raw/srv-nongmin/data2/content/image/2026/04/29/.cache/512/20260429500685.jpg",
  },
];

/** 교육·연수 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
// 교육 카테고리 — 모집 공고는 신청 기간이 짧아 마감 리스크가 높음.
// 상시 운영되는 통합 안내 포털·종합지원센터 위주로 안전 구성.
// 활성 모집 공고는 /education 페이지에서 신청 기간 기반으로 동적 처리.
export const trendEduNews: NewsItem[] = [
  {
    title: "농업교육포털 — 전국 농업·귀농 교육 통합 안내",
    source: "농업교육포털",
    date: "상시",
    url: "https://agriedu.net/",
    description:
      "농촌진흥청·교육기관·지자체에서 운영하는 전국 농업 교육 과정을 통합 검색하고 신청할 수 있어요. 귀농 입문부터 작목별 전문교육·온라인 화상교육까지 한곳에서 살펴볼 수 있어요.",
  },
  {
    title: "전라남도 귀농산어촌 종합지원센터",
    source: "전라남도",
    date: "상시",
    url: "https://jnfarm.jeonnam.go.kr/",
    description:
      "전남 귀농·귀촌 희망자를 위한 종합 안내 포털. 지원사업·농가주택·농지 정보·체류형 프로그램까지 정착 단계별로 필요한 정보를 묶어서 제공해요.",
  },
  {
    title: "밀양시 귀농귀촌종합지원센터",
    source: "밀양시",
    date: "상시",
    url: "https://www.miryang.go.kr/myreturn/main/",
    description:
      "귀농·귀촌 상담, 지원 정책, 교육 안내, 청년농업인 지원 등 밀양시 정착 지원 전반을 안내하는 종합 포털이에요.",
  },
];

// 행사·박람회 카테고리 — 단발 행사는 사후 보도가 되기 쉬우므로
// 상시 진행되는 박람회 포털 + 다회차 정보 페이지 위주로 안전 구성.
export const trendEventNews: NewsItem[] = [
  {
    title: "KFARM — 농업·축산·귀농귀촌 박람회",
    source: "케이팜",
    date: "상시",
    url: "https://www.kfarm.co.kr/",
    description:
      "수도권 최대 규모의 농업·축산업·스마트팜·귀농귀촌 박람회. 청주 오스코·수원메쎄에서 연 단위로 개최돼요. 지속 가능한 농업의 첫걸음으로 추천돼요.",
    thumbnail:
      "https://d3hjmc9lw655td.cloudfront.net/wp-content/uploads/2026/03/10232734/Yoast-Seo_%EC%BC%80%EC%9D%B4%ED%8C%9C_1200X675-1.png",
  },
  {
    title: "Y-FARM EXPO — 귀농귀촌 지역살리기 박람회",
    source: "와이팜엑스포",
    date: "상시",
    url: "https://www.yfarmexpo.co.kr/fairDash.do?hl=KOR",
    description:
      "연합뉴스와 농협중앙회가 공동 주최하는 대한민국 대표 귀농귀촌 박람회. 매년 4월 수원컨벤션센터에서 열리며 청년농업인 육성·귀농 정책·창업 교육을 한 자리에 모아요.",
    thumbnail:
      "https://cdn2.micehub.com/home/2016/micehub/Files/20260225_151211_1844335168.png",
  },
  {
    title: "2026 서울국제정원박람회",
    source: "서울특별시",
    date: "상시",
    url: "https://www.seoul.go.kr/festa/garden/y2026",
    description:
      "서울에서 열리는 국제 규모 정원박람회. 도시농업·치유농업·정원 디자인까지 농촌 라이프스타일을 도시에서 미리 경험할 수 있는 자리예요.",
  },
];

/** 지원사업 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
// 지원사업 카테고리 — 정보형(시행지침·통합 안내) 위주로 안전 구성.
// 모집 공고는 게재일이 최신이라도 신청 기간이 자주 짧아 마감 리스크가 높음.
// 활성 모집 공고는 /programs 페이지(programs.ts)에서 신청 기간 기반으로 동적 처리.
export const trendProgramNews: NewsItem[] = [
  {
    title: "2026 청년농업인 영농정착지원사업 시행지침",
    source: "농림축산식품부",
    date: "2026.01",
    url: "https://www.mafra.go.kr/home/5108/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGaG9tZSUyRjc5MSUyRjU3NTgxOSUyRmFydGNsVmlldy5kbyUzRnNyY2hDb2x1bW4lM0QlMjZwYXNzd29yZCUzRCUyNmlzVmlld01pbmUlM0RmYWxzZSUyNnJvdyUzRDEwJTI2YmJzT3BlbldyZFNlcSUzRCUyNnNyY2hXcmQlM0QlMjZyZ3NFbmRkZVN0ciUzRCUyNnJnc0JnbmRlU3RyJTNEJTI2YmJzQ2xTZXElM0QlMjZwYWdlJTNEMSUyNg%3D%3D",
    description:
      "농림축산식품부가 발표한 2026년도 청년농업인 영농정착지원사업 시행지침 전문. 신청 자격, 지원 항목, 선정 절차, 사후 관리 기준이 모두 정리되어 있어요.",
  },
  {
    title: "2026년 농림축산식품사업 시행지침서 — 농업창업자금 안내",
    source: "농림축산식품부",
    date: "2026.02",
    url: "https://www.mafra.go.kr/bbs/home/795/576799/artclView.do",
    description:
      "2026년 농림축산식품사업 시행지침서. 귀농 농업창업 자금은 최대 3억원 한도, 연 2.0% 저금리 융자, 5년 거치 10년 분할 상환 조건이에요. 주택구입자금은 7,500만원 한도로 별도 지원돼요.",
  },
  {
    title: "똑똑! 청년농부 — 청년농업인 종합 지원 정보",
    source: "농촌진흥청",
    date: "2026.03",
    url: "https://www.rda.go.kr/young/content/custom0201.do",
    description:
      "농촌진흥청이 운영하는 청년농업인 통합 안내 포털. 영농정착·창업자금·교육·멘토링·주거 지원까지 청년 귀농에 필요한 정책을 한곳에서 살펴볼 수 있어요.",
  },
];

/** 정부·정책 폴백 뉴스 — API 장애 시 표시 (실제 기사 URL, HTTP 200 검증 완료) */
export const trendPolicyNews: NewsItem[] = [
  {
    title: "月15만원의 힘…농어촌 인구 반등 물꼬텄다",
    source: "서울경제",
    date: "2026.03",
    url: "https://www.sedaily.com/article/20014738",
    description:
      "전국 10개 인구 소멸 위기 농어촌 지역에 ‘농어촌 기본소득’이 처음 지급되면서 인구 반등과 지역경제 활성화의 신호가 나타나고 있어요. 69개 군 중 6개 군 24만 명이 지역화폐로 월 15만원을 받습니다.",
    thumbnail:
      "https://wimg.sedaily.com/news/cms/2026/03/03/news-p.v1.20260226.28525aca14674a58a42a61531172a434_R.jpg",
  },
  {
    title: "농식품부, 귀농시 6219만원·귀촌시 4563만원 필요",
    source: "농수축산신문",
    date: "2026.03",
    url: "http://www.aflnews.co.kr/news/articleView.html?idxno=315465",
    description:
      "귀농 시 평균 6219만원, 귀촌 시 4563만원의 투자가 필요한 것으로 조사됐어요. 젊은층의 귀농 투자액이 상대적으로 높았고, 농지 마련에 가장 많은 비용이 들어갔습니다.",
  },
  {
    title: "농촌출신은 귀농, 도시출신은 귀촌",
    source: "내일신문",
    date: "2026.02",
    url: "https://www.naeil.com/news/read/579260",
    description:
      "귀농·귀촌 6000가구 조사 결과 귀농은 ‘U자형(농촌→도시→농촌)’이 73.0%로 다수였고, 귀촌은 도시 출신 비중이 더 높은 것으로 나타났어요. 출신 배경이 정착 패턴을 가르는 흐름이에요.",
    thumbnail:
      "https://wimg.naeil.com/paper/2026/02/26/20260226_01100116000010_L01.jpg",
  },
  {
    title: "송미령 농림축산식품부 장관, 전방위 농정 대응 강화",
    source: "CBC뉴스",
    date: "2026.04",
    url: "https://www.cbci.co.kr/news/articleView.html?idxno=566385",
    description:
      "송미령 장관이 비료 원료 수급, 농산물 물가, 가축 방역 현장을 잇따라 점검하며 전방위 농정 대응에 나섰어요. 청년 영농정착지원·시설 현대화 등 핵심 정책의 연속 가동을 강조했습니다.",
    thumbnail:
      "https://www.cbci.co.kr/news/thumbnail/202604/566385_382997_613_v150.jpg",
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

/**
 * 인터뷰 카테고리 ID — TrendTypeId 5종 + healing 1종.
 *
 * TrendTypeId와 분리한 이유: TREND_BENTO_PROFILES는 5탭(귀농·귀촌·청년농·귀산촌·스마트팜)
 * bento 카드만 정의. healing 카테고리는 인터뷰 분류에만 사용하며
 * 별도 통계 bento는 D6+ 큐레이션 후 필요 시 추가 결정.
 *
 * (2026-05-14 D1: 회장 결재 옵션 B — 외부 큐레이션 15건 확장 대비)
 */
export type InterviewCategoryId =
  | "farming"
  | "rural"
  | "youth"
  | "mountain"
  | "smartfarm"
  | "healing";

export const INTERVIEW_CATEGORIES: { id: InterviewCategoryId; label: string }[] = [
  { id: "farming", label: "귀농" },
  { id: "rural", label: "귀촌" },
  { id: "youth", label: "청년농" },
  { id: "mountain", label: "귀산촌" },
  { id: "smartfarm", label: "스마트팜" },
  { id: "healing", label: "치유농업" },
];

export const INTERVIEW_CATEGORY_LABEL: Record<InterviewCategoryId, string> =
  Object.fromEntries(INTERVIEW_CATEGORIES.map((c) => [c.id, c.label])) as Record<
    InterviewCategoryId,
    string
  >;

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
    href: "/stats?tab=farming",
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
    href: "/stats?tab=village",
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
    href: "/stats?tab=youth",
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
    href: "/stats?tab=mountain",
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
    href: "/stats?tab=smartfarm",
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
  /**
   * 인터뷰 카테고리 (대표 분류 1종 필수).
   * 6종: farming · rural · youth · mountain · smartfarm · healing
   * (2026-05-14 D1: 카테고리 필터 + ?type= deep link)
   */
  category: InterviewCategoryId;
  /** 보조 태그 (다중 분류 선택). 검색·관련 인터뷰 추천용. */
  tags?: InterviewCategoryId[];
  /** 원문 기사 URL */
  sourceUrl: string;
  sourceName: string;
  sourceDate: string;
  /**
   * 인터뷰 상세 페이지 본문. 본인이 게재 동의한 분만 채움.
   * 미동의자는 비움 → 카드 클릭 시 원문 기사로 직결, 상세 페이지는 외부 redirect.
   */
  story?: string;
  motivation?: string;
  challenge?: string;
  advice?: string;
  /**
   * 본문 풀 게재 동의를 받은 일자 (YYYY-MM-DD).
   * 분쟁 시 동의 시점 증빙용. 동의 메일 등 원본 증거는 별도 안전 저장소에 보관.
   * UI에는 노출하지 않음.
   */
  consentDate?: string;
  /** 동의 채널 (예: "메일 회신", "직접 전화") — 감사용 메모 */
  consentNote?: string;
  /** 지역 데이터 페이지 링크 */
  regionUrl: string;
  /** 작물 데이터 페이지 링크 (매칭되는 작물만) */
  cropLinks: CropLink[];
}

/** 본문 4종을 모두 보유한 (게재 동의 받은) 인터뷰 */
export type FullInterview = InterviewCard & {
  story: string;
  motivation: string;
  challenge: string;
  advice: string;
};

/** 본문 풀 게재 동의 여부 */
export function hasFullStory(p: InterviewCard): p is FullInterview {
  return Boolean(p.story && p.motivation && p.challenge && p.advice);
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
    category: "youth",
    tags: ["farming"],
    sourceUrl: "https://news.ikbc.co.kr/article/view/kbc202403290022",
    sourceName: "KBC광주방송",
    sourceDate: "2024.03",
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
    category: "youth",
    tags: ["farming"],
    sourceUrl: "https://www.seoul.co.kr/news/plan/youngman_area_future/2025/09/19/20250919008002",
    sourceName: "서울신문",
    sourceDate: "2025.09",
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
    category: "smartfarm",
    tags: ["farming"],
    sourceUrl: "https://www.farmnmarket.com/news/article.html?no=22960",
    sourceName: "팜앤마켓매거진",
    sourceDate: "2024.12",
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
    category: "farming",
    tags: ["mountain"],
    sourceUrl: "https://bravo.etoday.co.kr/view/atc_view/2723",
    sourceName: "브라보마이라이프",
    sourceDate: "2024",
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
    category: "smartfarm",
    tags: ["youth"],
    sourceUrl: "https://www.nongmin.com/article/20240105500453",
    sourceName: "농민신문",
    sourceDate: "2024.01",
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
    category: "farming",
    sourceUrl: "https://www.nongmin.com/article/20240207500761",
    sourceName: "농민신문",
    sourceDate: "2024.02",
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
    category: "smartfarm",
    tags: ["farming"],
    sourceUrl: "https://www.nongmin.com/article/20260304500386",
    sourceName: "농민신문",
    sourceDate: "2026.03",
    story: "KCC중앙연구소에서 자동차 페인트 색상을 개발하던 연구원이었어요. 2021년 귀농 후 충주시농업기술센터에서 6개월간 교육을 받고, 1,490㎡ 규모의 딸기 스마트팜을 운영하고 있어요.",
    motivation: "대기업의 톱니바퀴 같은 삶에 회의감을 느꼈어요. 온전히 '내 것'이 될 수 있는 일, 주체적인 삶을 찾고 싶었어요.",
    challenge: "처음에 일본 신품종을 시도했다가 흰가루병에 취약해서 실패했어요. 품종 선택의 중요성을 뼈저리게 느꼈어요.",
    advice: "스마트팜이 농사를 대신 지어주진 않아요. 작물 지식과 스마트팜 이해를 바탕으로 자신만의 농법을 찾아야 해요. 무리한 시설 투자보다 감당할 수 있는 규모로 시작하세요.",
    consentDate: "2026-05-09",
    consentNote: "본인 메일 회신 — 게재 유지 동의 확인",
    regionUrl: "/regions/chungbuk/chungju",
    cropLinks: [{ name: "딸기", href: "/crops/strawberry" }],
  },
  // ── 2026-05-14 D2 외부 큐레이션 (회장 결재 옵션 B, 가드 3종 100% 통과 7건) ──
  // 미동의자 카드 + 외부 직결 (5/9 인터뷰 동의 정책 준수, hasFullStory 가드)
  {
    id: "lee-geonhee",
    name: "이건희",
    age: "34세",
    prevJob: "빅데이터 전공자",
    currentJob: "딸기 농부 (스마트팜)",
    region: "경남 거창",
    crop: "딸기 (스마트팜)",
    quote: "더 많은 청년이 농촌에 정착하고 스마트팜이 발전하길 바라요.",
    category: "smartfarm",
    tags: ["youth", "farming"],
    sourceUrl: "https://www.seoul.co.kr/news/plan/youngman_area_future/2025/09/19/20250919008001",
    sourceName: "서울신문",
    sourceDate: "2025.09",
    regionUrl: "/regions/gyeongnam/geochang",
    cropLinks: [{ name: "딸기", href: "/crops/strawberry" }],
  },
  {
    id: "kim-hyeon",
    name: "김현",
    age: "28세",
    prevJob: "패션잡화 브랜드 운영자",
    currentJob: "오이 농부 (스마트팜)",
    region: "경북 상주",
    crop: "오이 (스마트팜)",
    quote: "데이터 기반으로 작물을 키우고 환경을 제어할 수 있다는 점이 매력적이에요.",
    category: "youth",
    tags: ["smartfarm", "farming"],
    sourceUrl: "https://www.seoul.co.kr/news/plan/youngman_area_future/2025/09/19/20250919008001",
    sourceName: "서울신문",
    sourceDate: "2025.09",
    regionUrl: "/regions/gyeongbuk/sangju",
    cropLinks: [{ name: "오이", href: "/crops/cucumber" }],
  },
  {
    id: "choi-hongjun",
    name: "최홍준",
    age: "44세",
    prevJob: "낙농업 종사자 (가업)",
    currentJob: "젖소 낙농 (데이터 활용)",
    region: "경기 평택",
    crop: "젖소 낙농",
    quote: "데이터를 활용하면서 젖소당 유량이 10% 늘었어요.",
    category: "smartfarm",
    tags: ["farming"],
    sourceUrl: "https://www.seoul.co.kr/news/plan/2025/12/01/20251201010002",
    sourceName: "서울신문",
    sourceDate: "2025.12",
    regionUrl: "/regions/gyeonggi/pyeongtaek",
    cropLinks: [],
  },
  {
    id: "lee-jihoon",
    name: "이지훈",
    age: "30대",
    prevJob: "도시 직장인 (평택 거주)",
    currentJob: "스마트팜 상추 농부 (이지팜 대표)",
    region: "전남 신안",
    crop: "상추 (분무수경)",
    quote: "청년농업인 스마트팜 자립기반 지원사업이 첨단 시설 구축에 결정적이었어요.",
    category: "smartfarm",
    tags: ["farming", "youth"],
    sourceUrl: "https://www.koreatimenews.com/news/article.html?no=1011609",
    sourceName: "코리아타임뉴스",
    sourceDate: "2025.12",
    regionUrl: "/regions/jeonnam/sinan",
    cropLinks: [{ name: "상추", href: "/crops/lettuce" }],
  },
  {
    id: "bae-munyeol",
    name: "배문열",
    age: "(미상)",
    prevJob: "섬유업 경영자",
    currentJob: "홍화농원 대표",
    region: "경북 칠곡",
    crop: "홍화 (약용작물)",
    quote: "너무 큰 환상, 너무 큰 꿈을 갖고 귀농하면 안 돼요.",
    category: "farming",
    sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148732769",
    sourceName: "대한민국 정책브리핑",
    sourceDate: "2023",
    regionUrl: "/regions/gyeongbuk/chilgok",
    cropLinks: [],
  },
  {
    id: "park-jaeyoung",
    name: "박재영",
    age: "44세",
    prevJob: "경기도 직장 근로자",
    currentJob: "통발 어업인 (낙지·돌게·꽃게)",
    region: "전남 신안",
    crop: "통발 어업 (낙지·돌게·꽃게)",
    quote: "직장 다닐 때는 출장이 잦았는데 지금은 가정에 충실해요.",
    category: "rural",
    tags: ["farming"],
    sourceUrl: "https://www.seoul.co.kr/news/plan/population-crisis/2024/09/25/20240925010001",
    sourceName: "서울신문",
    sourceDate: "2024.09",
    regionUrl: "/regions/jeonnam/sinan",
    cropLinks: [],
  },
  {
    id: "jung-changgyun",
    name: "정창균·이말영 부부",
    age: "53·47세",
    prevJob: "우체국 집배원",
    currentJob: "시골 떡방앗간 운영",
    region: "경남 함양",
    crop: "떡방앗간 (지역 가공업)",
    quote: "처음에는 전혀 생각해 보지 않아 걱정스럽고 망설였어요.",
    category: "rural",
    sourceUrl: "https://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=A0002634641",
    sourceName: "오마이뉴스",
    sourceDate: "2020",
    regionUrl: "/regions/gyeongnam/hamyang",
    cropLinks: [],
  },
  // ── 2026-05-18 D6+ 통합 큐레이션 (회장 직접 호출, mountain·healing 보강) ──
  // 가드 3종(URL·본문·중복) 100% 통과 5건 — 5/9 동의 정책 준수 (hasFullStory: false)
  // 발굴 후보 8건 → 가드 1 통과 8건 → 가드 2 통과 5건 → 가드 3 통과 5건
  {
    id: "lee-chunbok",
    name: "이춘복",
    age: "66세",
    prevJob: "순천 IT업계 종사자",
    currentJob: "대한두릅농업회사법인 회장",
    region: "전남 보성",
    crop: "두릅 (산림 임산물)",
    quote: "도시의 치열한 경쟁을 통해서만 경제적 성공을 이룰 수 있는 건 아니에요.",
    category: "mountain",
    tags: ["farming"],
    sourceUrl: "https://www.seoul.co.kr/news/society/2024/09/18/20240918500099",
    sourceName: "서울신문",
    sourceDate: "2024.09",
    regionUrl: "/regions/jeonnam/boseong",
    cropLinks: [],
  },
  {
    id: "kim-youngsook",
    name: "김영숙",
    age: "(미상)",
    prevJob: "기간제 교사·버섯농장 경영",
    currentJob: "고은원예치료센터 운영 (1세대 치유농업사)",
    region: "강원 춘천",
    crop: "원예치유·치유농장",
    quote: "치유농업사란 제 집 앞마당을 기꺼이 내어주는 사람이에요.",
    category: "healing",
    tags: ["farming"],
    sourceUrl: "https://rda.go.kr/webzine/2024/07/sub1-5.html",
    sourceName: "농촌진흥청 그린매거진",
    sourceDate: "2024.07",
    regionUrl: "/regions/gangwon/chuncheon",
    cropLinks: [],
  },
  {
    id: "oh-geumok",
    name: "오금옥",
    age: "61세",
    prevJob: "중·고등학교 영어 교사 (32년)",
    currentJob: "봄과 로라의 치유농장 대표",
    region: "전북 익산",
    crop: "치유농장 (텃밭·숲산책·치유차)",
    quote: "치유농업은 사람 마음을 어루만지는 일이잖아요.",
    category: "healing",
    tags: ["rural", "farming"],
    sourceUrl: "https://www.nongmin.com/article/20250728500331",
    sourceName: "농민신문",
    sourceDate: "2025.07",
    regionUrl: "/regions/jeonbuk/iksan",
    cropLinks: [],
  },
  {
    id: "so-hyangmi",
    name: "소향미",
    age: "55세",
    prevJob: "놀이심리치료사",
    currentJob: "아그데팜 대표 (치유농장)",
    region: "경기 용인",
    crop: "허브·식용 꽃 (치유농장)",
    quote: "치유농업은 땅을 일구는 일이 아니라 사람의 마음을 일구는 일이에요.",
    category: "healing",
    tags: ["farming"],
    sourceUrl: "https://www.nongmin.com/article/20251121500506",
    sourceName: "농민신문",
    sourceDate: "2025.11",
    regionUrl: "/regions/gyeonggi/yongin",
    cropLinks: [],
  },
  {
    id: "kim-seongtaek",
    name: "김성택",
    age: "(미상)",
    prevJob: "신학도",
    currentJob: "천의바람농장 대표",
    region: "경기 포천",
    crop: "치유농업 (생명역동·복합영농)",
    quote: "농업은 그 자체로 치유의 힘을 지닌 활동이에요.",
    category: "healing",
    tags: ["farming"],
    sourceUrl: "https://rda.go.kr/webzine/2025/05/sub_31.html",
    sourceName: "농촌진흥청 그린매거진",
    sourceDate: "2025.05",
    regionUrl: "/regions/gyeonggi/pocheon",
    cropLinks: [],
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
