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
  href: string;
}

export const trendStats: TrendStat[] = [
  {
    value: "1.2만",
    label: "2024 귀농 인구",
    sub: "귀촌 42.2만 포함 시 +5.7%",
    href: "/stats/population",
  },
  {
    value: "13.1%",
    label: "청년 귀농 비율",
    sub: "역대 최고 기록",
    href: "/stats/youth",
  },
  {
    value: "70%",
    label: "귀농 만족도",
    sub: "도시 대비 생활비 25%↓",
    href: "/stats/satisfaction",
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
  { label: "건강·여유로운 생활", pct: 8 },
];

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
    id: "prg-001",
    title: "귀농인 정착지원금",
    region: "순천시",
    type: "보조금",
    amount: "월 80만원 (최대 24개월)",
    tag: "귀농 초기 정착",
  },
  {
    id: "prg-002",
    title: "청년 귀농 창업지원",
    region: "전국",
    type: "보조금",
    amount: "최대 3,000만원 (보조 70%)",
    tag: "만 40세 이하 청년",
  },
  {
    id: "prg-004",
    title: "귀촌 주택 수리비 지원",
    region: "전남",
    type: "보조금",
    amount: "최대 2,000만원",
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
}

export const cityVsRural: CompareRow[] = [
  {
    label: "월 생활비",
    city: "239만 원",
    rural: "173만 원",
    change: "-25.1%",
  },
  {
    label: "주거비 (3.3㎡당)",
    city: "1,800만 원",
    rural: "350만 원",
    change: "-80%",
  },
  {
    label: "주거 형태",
    city: "아파트 58㎡",
    rural: "단독주택 130㎡",
    change: "2.2배 넓게",
  },
  {
    label: "출퇴근",
    city: "평균 58분",
    rural: "차로 10분",
    change: "-48분",
  },
  {
    label: "미세먼지 (PM2.5)",
    city: "24㎍/㎥",
    rural: "17㎍/㎥",
    change: "-29%",
  },
  {
    label: "5년차 소득",
    city: "3,800만 원",
    rural: "3,300만 원",
    change: "격차 ↓ 추세",
  },
  {
    label: "생활 만족도",
    city: "52%",
    rural: "70%",
    change: "+18%p",
  },
];

/* ── 귀농인 인터뷰 카드 (공개 보도 기반, 실명) ── */

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
    story: "산업안전 분야를 전공하고 도시에서 1년간 직장 생활을 한 뒤, 부모님이 계신 순천으로 돌아왔습니다. 겨울부터 봄까지는 딸기를, 봄부터 가을까지는 콩과 고구마를 재배하며 4계절 농사를 짓고 있어요.",
    motivation: "부모님이 순천에서 농사를 짓고 계셨는데, 도시 생활을 하면서 '결국 돌아가게 되지 않을까' 싶었어요. 막상 시작해보니 생각보다 가능성이 많더라고요.",
    challenge: "처음에는 체력적으로 많이 힘들었어요. 딸기 수확 시즌에는 새벽부터 움직여야 하니까요. 그래도 직접 키운 작물이 시장에 나가는 걸 보면 뿌듯합니다.",
    advice: "재배만 하지 말고, 본인이 할 수 있는 다른 것을 새로 생각해내기만 한다면 농업은 정말 유망해요. 젊을 때 시작할수록 유리합니다.",
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
    story: "부친의 농업을 보조하다 독립 경영으로 전환했습니다. 지금은 친환경 농산물로 아이스크림, 소스, 빵을 만들어 판매하고, 비영리단체 '농유피' 대표로 청년 귀농인을 돕고 있어요.",
    motivation: "농업의 가치를 알리고 싶었어요. 단순 재배가 아니라 가공까지 해야 부가가치가 생긴다는 걸 일찍 깨달았죠.",
    challenge: "농산물 가공은 위생 기준, 인증 절차가 까다로워요. 혼자 다 해야 하니까 행정 업무량이 상당했습니다.",
    advice: "귀농 전에 체류형 프로그램부터 참여해보세요. 막연히 '농촌이 좋겠다'가 아니라, 실제로 살아보고 결정하는 게 중요합니다.",
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
    story: "서울에서 가게를 운영하다 코로나 시기에 부친의 농장 일손을 돕기 위해 강진으로 왔어요. 스마트팜 자립기반 사업에 선정되면서 본격적으로 딸기 재배를 시작했고, 지금은 수출까지 하고 있습니다.",
    motivation: "코로나로 가게 운영이 어려워졌을 때 아버지가 '한번 와봐라' 하셔서요. 와보니 스마트팜이 생각보다 체계적이더라고요.",
    challenge: "농업을 전혀 몰랐기 때문에 처음 1년은 배우기만 했어요. 스마트팜 교육이 정말 도움이 많이 됐습니다.",
    advice: "스마트팜은 데이터로 관리하니까 IT 감각이 있는 분들에게 정말 잘 맞아요. 정부 지원사업도 적극 활용하세요.",
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
    story: "생산관리직으로 오래 근무하다 퇴직 후 귀농을 결심했습니다. 벼, 무, 배추, 감자를 기본으로 하면서 표고버섯 전업농을 목표로 준비하고 있어요. 통나무를 자르고 나르는 건 중노동이지만, 표고가 자라는 걸 보면 행복합니다.",
    motivation: "퇴직하고 뭘 할까 고민하다, 어릴 때 시골에서 자란 기억이 떠올랐어요. '다시 흙을 만져보자'는 마음으로 시작했죠.",
    challenge: "중장비 없이 하려면 체력이 관건이에요. 처음엔 통나무 하나 옮기기도 힘들었는데, 1년 지나니 몸이 적응하더라고요.",
    advice: "50대도 전혀 늦지 않아요. 오히려 인생 경험이 농사에 도움이 됩니다. 다만 체력은 미리미리 만들어두세요.",
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
    story: "전북에서 은행과 대기업에 다니던 부부가 함께 퇴사하고 경기 여주로 귀농했습니다. 2,644㎡ 규모의 스마트팜에서 대추형 방울토마토를 재배하며, 첫 시즌(11개월)에 1억 6천만 원의 판매 실적을 올렸어요.",
    motivation: "각자 안정적인 직장이 있었지만, 누군가의 지시가 아니라 '우리 의지대로 일하자'는 마음이 컸어요. 농업이라면 가능하겠다 싶었죠.",
    challenge: "잘할 수 있을까 겁이 나기도 했지만, 둘이 함께라 든든했어요. 밤낮없이 하우스에 붙어 살다시피 한 첫해가 가장 힘들었습니다.",
    advice: "부부가 함께 한다면 정말 든든합니다. 재배기술을 정교하게 다듬으면서 규모를 점차 늘려가는 전략이 중요해요.",
  },
  {
    id: "yeom-sujeong",
    name: "염수정",
    age: "43세",
    prevJob: "반도체 회사 직장인",
    currentJob: "사과대추·딸기 농부 (6차산업)",
    region: "충남 천안",
    crop: "사과대추·딸기·가공식품",
    quote: "귀농으로 성공하려면 고3 수험생처럼 공부해야 합니다.",
    sourceUrl: "https://www.nongmin.com/article/20240207500761",
    sourceName: "농민신문",
    sourceDate: "2024.02",
    story: "서울의 반도체 회사에서 일하다 2021년 충남 천안으로 귀농했습니다. 사과대추와 딸기를 재배하면서 건대추, 진액 등 가공식품까지 직접 만들어 온·오프라인에서 판매하며 연간 1억 원 매출을 올리고 있어요.",
    motivation: "남편 퇴직이 얼마 남지 않기도 했고, 인생 2모작을 고민하다 정년 없이 오래 종사할 수 있는 농업을 택했어요.",
    challenge: "자연재해 대응이 가장 어려웠어요. 투자비용을 최소화하면서도 재해를 이겨낼 수 있는 시설을 갖추는 게 관건이었습니다.",
    advice: "인터넷으로 선도농가를 찾아 주말마다 방문해서 배웠어요. 철저한 계획과 공부가 성공의 열쇠입니다.",
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
    story: "KCC중앙연구소에서 자동차 페인트 색상을 개발하던 연구원이었습니다. 2021년 귀농 후 충주시농업기술센터에서 6개월간 교육을 받고, 1,490㎡ 규모의 딸기 스마트팜을 운영하고 있어요.",
    motivation: "대기업의 톱니바퀴 같은 삶에 회의감을 느꼈어요. 온전히 '내 것'이 될 수 있는 일, 주체적인 삶을 찾고 싶었습니다.",
    challenge: "처음에 일본 신품종을 시도했다가 흰가루병에 취약해서 실패했어요. 품종 선택의 중요성을 뼈저리게 느꼈습니다.",
    advice: "스마트팜이 농사를 대신 지어주진 않아요. 작물 지식과 스마트팜 이해를 바탕으로 자신만의 농법을 찾아야 합니다. 무리한 시설 투자보다 감당할 수 있는 규모로 시작하세요.",
  },
];

/* ── 귀농 5단계 로드맵 ── */

export interface RoadmapStep {
  step: number;
  title: string;
  period: string;
  desc: string;
  link?: { label: string; href: string };
}

export const roadmapSteps: RoadmapStep[] = [
  {
    step: 1,
    title: "정보 탐색",
    period: "1~3개월",
    desc: "귀농 결심, 지역·작물 탐색",
    link: { label: "지역 비교하기", href: "/regions?step=1" },
  },
  {
    step: 2,
    title: "교육 이수",
    period: "3~6개월",
    desc: "귀농 교육 100시간 이상 이수",
    link: { label: "교육 찾기", href: "/education?step=2" },
  },
  {
    step: 3,
    title: "지역 선정",
    period: "6~12개월",
    desc: "체류형 귀농, 현장 답사",
    link: { label: "지역 비교하기", href: "/regions/compare?step=3" },
  },
  {
    step: 4,
    title: "영농 시작",
    period: "12~18개월",
    desc: "농지 확보, 작물 결정, 창업",
    link: { label: "지원사업 찾기", href: "/programs?step=4" },
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
    a: "나이 제한은 없습니다. 다만 지원사업별로 연령 조건이 다르고, 만 40세 이하 '청년 귀농' 지원이 가장 많습니다. 60대 이후에도 충분히 시작할 수 있어요.",
  },
  {
    q: "자금이 없어도 시작할 수 있나요?",
    a: "네. 농업창업자금 최대 3억 원(연 1.5~2% 저금리 융자), 주택자금 최대 7,500만 원까지 정부 지원을 받을 수 있습니다.",
  },
  {
    q: "농사 경험이 전혀 없는데 괜찮을까요?",
    a: "귀농 교육(100시간 이상)을 이수하면 지원사업 신청 시 가점을 받습니다. 체류형 귀농으로 1~6개월 살아보면서 시작하는 것도 방법이에요.",
  },
  {
    q: "가족과 함께 가야 하나요?",
    a: "아니요. 1인 가구 귀농도 꾸준히 늘고 있어요. 실태조사 기준 평균 귀농인 프로필은 '50대 중반 남성 1인 가구'입니다.",
  },
  {
    q: "귀농하면 실제로 얼마나 버나요?",
    a: "5년차 평균 가구소득 3,300만 원입니다. 첫해 2,534만 원에서 매년 늘어나고, 절반 이상이 농업 외 부수입(투잡)을 병행해요.",
  },
  {
    q: "실패하면 어떻게 되나요?",
    a: "귀농 5년 이내 이탈률은 약 20%입니다. 리스크를 줄이려면 체류형 귀농(1~6개월 살아보기)부터 시작하는 걸 추천해요.",
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
  { label: "충남 인삼", query: "충남 인삼" },
  { label: "강원 감자", query: "강원 감자" },
  { label: "제주 감귤", query: "제주 감귤" },
  { label: "귀농 지원금", query: "귀농 지원금" },
  { label: "경북 포도", query: "경북 포도" },
  { label: "귀농 융자", query: "귀농 융자" },
  { label: "순천 보조금", query: "순천 보조금" },
  { label: "귀농 교육", query: "귀농 교육" },
  { label: "충북 유기농", query: "충북 유기농" },
  { label: "고구마", query: "고구마" },
];
