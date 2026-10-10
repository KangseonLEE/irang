/**
 * 작물 소득 원표 — 농촌진흥청 「2025년도 농산물 소득 조사」 결과 (2026-10-10 고정, 손으로 고치지 않는다)
 *
 * 원문: 보도자료 "농촌진흥청, 2025년도 농산물 소득 조사 결과 발표"(2026-09-29, 정책브리핑 newsId=156783816) 첨부 PDF
 *   「붙임1 2025년도 농산물소득조사 결과」 3~5쪽 표(국가승인통계 제143002호, 51작목). 단위 천원/10a, 1년 1기작
 *   (인삼은 4년 1기작 경영성과). PDF sha256 d12bfc970ddaef8419f59145387664eb05bbd52fdc0dc3e0effd23b2d91ee04c
 * 추출: pdftotext -layout 로 51행을 읽어 그대로 옮겼다(총수입·경영비·소득·소득률). 수량·가격 열은 쓰지 않는다.
 *
 * 쓰임: 작물 상세 income.revenueRange·varieties 의 숫자가 이 표에서 나왔는지 src/__tests__/crop-income-source.test.ts 가
 * 대조한다(만 원 = 천원 ÷ 10 반올림, "3,000평 재배 시 연 약 N만 원" = 천원 값). 다음 해 조사가 나오면 이 파일을 통째로
 * 바꾸고 테스트가 가리키는 작물 값을 고친다.
 * 이 표에 없는 작물(깻잎·체리·표고 등)은 공식 소득이 없다 — 작물 상세에 '추정'으로 적고 정렬·검색 결과 설명에서 뺀다.
 */

export const CROP_INCOME_SURVEY = {
  /** income.source 가 이 문자열로 시작하면 이 표를 근거로 삼는다는 뜻 */
  source: "농촌진흥청 「2025년도 농산물 소득 조사」 (2026.9.29 발표, 국가승인통계 제143002호)",
  surveyYear: 2025,
  released: "2026-09-29",
  url: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156783816",
  pdfSha256: "d12bfc970ddaef8419f59145387664eb05bbd52fdc0dc3e0effd23b2d91ee04c",
} as const;

export interface IncomeSurveyRow {
  /** 원표 품목 이름 그대로 */
  item: string;
  /** 원표 구분 */
  group: "식량작물" | "노지채소" | "시설채소" | "노지과수" | "시설과수" | "화훼" | "특용작물";
  /** PDF 쪽 */
  page: number;
  /** 10a당 천원 */
  totalRevenue: number;
  operatingCost: number;
  income: number;
  /** 소득률(%) */
  incomeRate: number;
}

export const CROP_INCOME_SURVEY_ROWS: IncomeSurveyRow[] = [
  { item: "겉보리", group: "식량작물", page: 3, totalRevenue: 698, operatingCost: 401, income: 298, incomeRate: 42.6 },
  { item: "쌀보리", group: "식량작물", page: 3, totalRevenue: 858, operatingCost: 385, income: 472, incomeRate: 55.1 },
  { item: "밀", group: "식량작물", page: 3, totalRevenue: 443, operatingCost: 322, income: 121, incomeRate: 27.3 },
  { item: "노지풋옥수수", group: "식량작물", page: 3, totalRevenue: 1853, operatingCost: 921, income: 932, incomeRate: 50.3 },
  { item: "고구마", group: "식량작물", page: 3, totalRevenue: 3934, operatingCost: 2137, income: 1797, incomeRate: 45.7 },
  { item: "봄감자", group: "식량작물", page: 3, totalRevenue: 2641, operatingCost: 1511, income: 1129, incomeRate: 42.8 },
  { item: "가을감자", group: "식량작물", page: 3, totalRevenue: 2279, operatingCost: 1716, income: 563, incomeRate: 24.7 },
  { item: "수박", group: "노지채소", page: 3, totalRevenue: 5394, operatingCost: 2550, income: 2844, incomeRate: 52.7 },
  { item: "가을무", group: "노지채소", page: 3, totalRevenue: 2679, operatingCost: 1248, income: 1430, incomeRate: 53.4 },
  { item: "고랭지무", group: "노지채소", page: 3, totalRevenue: 3138, operatingCost: 1927, income: 1211, incomeRate: 38.6 },
  { item: "당근", group: "노지채소", page: 3, totalRevenue: 3550, operatingCost: 2388, income: 1161, incomeRate: 32.7 },
  { item: "봄배추", group: "노지채소", page: 3, totalRevenue: 2394, operatingCost: 1376, income: 1018, incomeRate: 42.5 },
  { item: "가을배추", group: "노지채소", page: 3, totalRevenue: 3540, operatingCost: 1522, income: 2018, incomeRate: 57.0 },
  { item: "고랭지배추", group: "노지채소", page: 3, totalRevenue: 3175, operatingCost: 1883, income: 1292, incomeRate: 40.7 },
  { item: "노지시금치", group: "노지채소", page: 3, totalRevenue: 3820, operatingCost: 1381, income: 2440, incomeRate: 63.9 },
  { item: "양배추", group: "노지채소", page: 3, totalRevenue: 2373, operatingCost: 1475, income: 899, incomeRate: 37.9 },
  { item: "대파", group: "노지채소", page: 3, totalRevenue: 3863, operatingCost: 2046, income: 1817, incomeRate: 47.0 },
  { item: "쪽파", group: "노지채소", page: 3, totalRevenue: 4928, operatingCost: 2757, income: 2171, incomeRate: 44.1 },
  { item: "생강", group: "노지채소", page: 3, totalRevenue: 8140, operatingCost: 4772, income: 3367, incomeRate: 41.4 },
  { item: "시설수박", group: "시설채소", page: 4, totalRevenue: 7770, operatingCost: 3529, income: 4241, incomeRate: 54.6 },
  { item: "시설멜론", group: "시설채소", page: 4, totalRevenue: 9969, operatingCost: 5635, income: 4334, incomeRate: 43.5 },
  { item: "시설참외", group: "시설채소", page: 4, totalRevenue: 13526, operatingCost: 7056, income: 6471, incomeRate: 47.8 },
  { item: "딸기(토경)", group: "시설채소", page: 4, totalRevenue: 30820, operatingCost: 18226, income: 12595, incomeRate: 40.9 },
  { item: "딸기(수경)", group: "시설채소", page: 4, totalRevenue: 40831, operatingCost: 24414, income: 16417, incomeRate: 40.2 },
  { item: "시설오이", group: "시설채소", page: 4, totalRevenue: 25298, operatingCost: 13422, income: 11876, incomeRate: 46.9 },
  { item: "시설호박", group: "시설채소", page: 4, totalRevenue: 18066, operatingCost: 8647, income: 9419, incomeRate: 52.1 },
  { item: "토마토(토경)", group: "시설채소", page: 4, totalRevenue: 21282, operatingCost: 10964, income: 10318, incomeRate: 48.5 },
  { item: "토마토(수경)", group: "시설채소", page: 4, totalRevenue: 35890, operatingCost: 25846, income: 10044, incomeRate: 28.0 },
  { item: "방울토마토(토경)", group: "시설채소", page: 4, totalRevenue: 20081, operatingCost: 10078, income: 10003, incomeRate: 49.8 },
  { item: "방울토마토(수경)", group: "시설채소", page: 4, totalRevenue: 31468, operatingCost: 19329, income: 12139, incomeRate: 38.6 },
  { item: "시설가지", group: "시설채소", page: 4, totalRevenue: 28811, operatingCost: 15559, income: 13252, incomeRate: 46.0 },
  { item: "시설파프리카", group: "시설채소", page: 4, totalRevenue: 44217, operatingCost: 32233, income: 11984, incomeRate: 27.1 },
  { item: "시설시금치", group: "시설채소", page: 4, totalRevenue: 4897, operatingCost: 2609, income: 2288, incomeRate: 46.7 },
  { item: "시설상추", group: "시설채소", page: 4, totalRevenue: 14348, operatingCost: 8717, income: 5630, incomeRate: 39.2 },
  { item: "시설부추", group: "시설채소", page: 4, totalRevenue: 12888, operatingCost: 7519, income: 5369, incomeRate: 41.7 },
  { item: "시설고추", group: "시설채소", page: 4, totalRevenue: 17017, operatingCost: 10502, income: 6515, incomeRate: 38.3 },
  { item: "사과", group: "노지과수", page: 4, totalRevenue: 9799, operatingCost: 4096, income: 5703, incomeRate: 58.2 },
  { item: "배", group: "노지과수", page: 4, totalRevenue: 8542, operatingCost: 4117, income: 4426, incomeRate: 51.8 },
  { item: "복숭아", group: "노지과수", page: 4, totalRevenue: 5881, operatingCost: 2850, income: 3030, incomeRate: 51.5 },
  { item: "노지포도", group: "노지과수", page: 4, totalRevenue: 8969, operatingCost: 4171, income: 4799, incomeRate: 53.5 },
  { item: "노지감귤", group: "노지과수", page: 4, totalRevenue: 3996, operatingCost: 1591, income: 2405, incomeRate: 60.2 },
  { item: "단감", group: "노지과수", page: 4, totalRevenue: 3814, operatingCost: 1982, income: 1832, incomeRate: 48.0 },
  { item: "참다래(키위)", group: "노지과수", page: 4, totalRevenue: 6835, operatingCost: 3208, income: 3627, incomeRate: 53.1 },
  { item: "블루베리", group: "노지과수", page: 4, totalRevenue: 12837, operatingCost: 5431, income: 7406, incomeRate: 57.7 },
  { item: "자두", group: "노지과수", page: 4, totalRevenue: 5100, operatingCost: 2001, income: 3100, incomeRate: 60.8 },
  { item: "시설포도", group: "시설과수", page: 5, totalRevenue: 12564, operatingCost: 6743, income: 5821, incomeRate: 46.3 },
  { item: "시설장미", group: "화훼", page: 5, totalRevenue: 38177, operatingCost: 28928, income: 9249, incomeRate: 24.2 },
  { item: "참깨", group: "특용작물", page: 5, totalRevenue: 2267, operatingCost: 709, income: 1558, incomeRate: 68.7 },
  { item: "인삼(4년근)", group: "특용작물", page: 5, totalRevenue: 16767, operatingCost: 9327, income: 7441, incomeRate: 44.4 },
  { item: "오미자", group: "특용작물", page: 5, totalRevenue: 4854, operatingCost: 2090, income: 2764, incomeRate: 57.0 },
  { item: "들깨", group: "특용작물", page: 5, totalRevenue: 1104, operatingCost: 508, income: 595, incomeRate: 53.9 },
];

/**
 * 작물 id → 원표 품목. 작물 상세 소득 머리 숫자("10a당 약 A~B만 원")는 이 품목들 소득의 최솟값~최댓값(하나면 단일값).
 * 여기 없는 작물은 이 조사에 없다. 쌀·콩·마늘·양파는 국가데이터처 농축산물생산비조사(KOSIS)라 따로 둔다.
 */
export const CROP_INCOME_ITEMS: Record<string, string[]> = {
  "sweet-potato": ["고구마"],
  potato: ["가을감자", "봄감자"],
  corn: ["노지풋옥수수"],
  "chili-pepper": ["시설고추"],
  "napa-cabbage": ["봄배추", "가을배추", "고랭지배추"],
  lettuce: ["시설상추"],
  apple: ["사과"],
  pear: ["배"],
  grape: ["노지포도", "시설포도"],
  citrus: ["노지감귤"],
  strawberry: ["딸기(토경)", "딸기(수경)"],
  ginseng: ["인삼(4년근)"],
  sesame: ["참깨"],
  radish: ["가을무", "고랭지무"],
  tomato: ["토마토(토경)", "토마토(수경)"],
  cucumber: ["시설오이"],
  zucchini: ["시설호박"],
  "green-onion": ["대파"],
  spinach: ["시설시금치", "노지시금치"],
  watermelon: ["수박", "시설수박"],
  peach: ["복숭아"],
  plum: ["자두"],
  persimmon: ["단감"],
  blueberry: ["블루베리"],
  melon: ["시설참외"],
  ginger: ["생강"],
  "perilla-seed": ["들깨"],
  "cherry-tomato": ["방울토마토(토경)", "방울토마토(수경)"],
  eggplant: ["시설가지"],
  paprika: ["시설파프리카"],
  carrot: ["당근"],
  rose: ["시설장미"],
  omija: ["오미자"],
};

/** 작물 id → 품종·재배방식 이름 → 원표 품목 (income.varieties 중 금액이 있는 것) */
export const CROP_INCOME_VARIETY_ITEMS: Record<string, Record<string, string[]>> = {
  potato: { 봄감자: ["봄감자"], 가을감자: ["가을감자"] },
  "napa-cabbage": { 봄배추: ["봄배추"], "가을배추(김장)": ["가을배추"], "고랭지 여름배추": ["고랭지배추"] },
  grape: { 노지포도: ["노지포도"], 시설포도: ["시설포도"] },
  strawberry: { 토경재배: ["딸기(토경)"], "수경재배(고설)": ["딸기(수경)"] },
  watermelon: { "노지 수박": ["수박"], "시설 수박": ["시설수박"] },
  tomato: {
    "완숙토마토 (토경)": ["토마토(토경)"],
    "완숙토마토 (수경)": ["토마토(수경)"],
    방울토마토: ["방울토마토(토경)", "방울토마토(수경)"],
  },
  "cherry-tomato": { "시설 토경": ["방울토마토(토경)"], "시설 수경": ["방울토마토(수경)"] },
  persimmon: { "단감 (부유·차랑 등)": ["단감"] },
};

/** 원표 소득(천원/10a) → 화면 만 원 */
export function incomeManwon(item: string): number {
  const row = CROP_INCOME_SURVEY_ROWS.find((r) => r.item === item);
  if (!row) throw new Error(`소득 원표에 없는 품목: ${item}`);
  return Math.round(row.income / 10);
}
