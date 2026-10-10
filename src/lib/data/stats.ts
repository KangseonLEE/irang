/* ════════════════════════════════════════════
   통계 데이터 — /stats 5탭 · 랜딩 추세 카드 · 정착 유형 레인이 함께 쓴다
   출처: 국가데이터처·농림축산식품부·해양수산부 「귀농어·귀촌인통계」(KOSIS orgId 101)
        농림축산식품부 「귀농·귀촌 실태조사」(KOSIS orgId 114)
        국회예산정책처 「스마트농업 육성사업 추진현황과 개선과제」(2022, 농식품부 제출자료)
   2026-10-03 전면 정정 — 연도별 수치를 KOSIS 통계표·보도자료 원문과 1:1 대조해 바꿨다(corrections.ts).
   수치는 배열에서 계산해 문구를 만든다. 문구 안에 숫자를 손으로 적지 않는다.
   ════════════════════════════════════════════ */
import { FOREST_VILLAGE_LOAN, formatManwon } from "./policy-facts";

/* ── 공통 타입 ── */

export interface YearlyPopulation {
  year: number;
  /**
   * 귀농인 (만 명) — KOSIS DT_1A02004 귀농인수.
   * 농업경영체·농지대장·축산업 명부에 등록한 **본인만** 센다(함께 이사한 가족 제외).
   * 정수 ÷ 10,000 그대로 둔다 — 소수 둘째 자리로 줄이면 10년 중 9년의 증감률이 공표치와 어긋난다(10/3 실측).
   */
  farming: number;
  /** 귀농가구원 (만 명) — 귀농인 + 동반가구원, KOSIS DT_1A02001. 농식품부 "귀농귀촌 인구"는 이 값 + 귀촌인 */
  farmingMembers: number;
  /** 귀농가구 (만 가구) — KOSIS DT_1A02008 */
  farmingHouseholds: number;
  /** 귀촌인 (만 명) — 귀촌가구주 + 동반가구원, KOSIS DT_1A02014. 귀농인과 달리 함께 온 가족까지 센다 */
  rural: number;
}

export interface YouthRatio {
  year: number;
  /** 귀농가구주 중 30대 이하(만 39세 이하) 비중 (%) — KOSIS DT_1A02007 연령대별 귀농가구주에서 계산 */
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

/* ── 표기 도우미 — 서버·브라우저 글자가 같도록 ko-KR 고정(10/3 #418 교훈) ── */

/** 만 단위 값 → 공표 정수 (정수 ÷ 10,000 으로 저장했으므로 반올림하면 원 수치 그대로) */
export function toCount(man: number): number {
  return Math.round(man * 10_000);
}

/** 413464 → "41만 3,464", 9134 → "9,134" */
export function formatKoreanCount(n: number): string {
  if (n < 10_000) return n.toLocaleString("ko-KR");
  const man = Math.floor(n / 10_000);
  const rest = n % 10_000;
  return rest > 0 ? `${man}만 ${rest.toLocaleString("ko-KR")}` : `${man}만`;
}

/** 증감률(%) — 소수 첫째 자리 */
export function changePct(now: number, before: number): number {
  return Number(((now / before - 1) * 100).toFixed(1));
}

/** 8.7 → "+8.7%", -2.2 → "-2.2%" (부호를 값에서 정한다 — "+" 고정 금지) */
export function signedPct(v: number, digits = 1): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

/** 늘었으면 "늘었어요", 줄었으면 "줄었어요" */
function changeVerb(v: number): string {
  return v >= 0 ? "늘었어요" : "줄었어요";
}

/**
 * 최신 해의 증감을 흐름으로 — "3년 연속 감소", "4년 만에 증가", 그 밖엔 "증가"/"감소".
 * 직전과 방향이 바뀐 지 2년뿐이면 "2년 만에"는 어색해서 그냥 "증가/감소"로 둔다.
 */
export function trendOf(values: readonly number[], years: readonly number[]): string | null {
  const n = values.length;
  if (n < 2) return null;
  const dir = (i: number) => Math.sign(values[i] - values[i - 1]);
  const d = dir(n - 1);
  if (d === 0) return null;
  const word = d > 0 ? "증가" : "감소";
  let run = 1;
  while (n - 1 - run >= 1 && dir(n - 1 - run) === d) run += 1;
  if (run >= 2) return `${run}년 연속 ${word}`;
  for (let i = n - 2; i >= 1; i -= 1) {
    if (dir(i) === d) {
      const gap = years[n - 1] - years[i];
      return gap >= 3 ? `${gap}년 만에 ${word}` : word;
    }
  }
  return word;
}

const maxBy = <T,>(arr: readonly T[], pick: (d: T) => number): T =>
  arr.reduce((a, b) => (pick(b) > pick(a) ? b : a));
const minBy = <T,>(arr: readonly T[], pick: (d: T) => number): T =>
  arr.reduce((a, b) => (pick(b) < pick(a) ? b : a));

/* ── 1. 귀농·귀촌 인구 추이 (최근 10년) ──
   국가데이터처 2025년 귀농어·귀촌인통계(2026-06-25 발표)까지. 2015년 기준으로 개념이 바뀌며 2013년까지 소급
   재작성됐고(통계정보보고서 2020.11), 그 뒤 귀농인·귀촌인 정의 변경은 없다(2025 고시 제2025-372호는 표 추가만).
   2022년부터 귀농인 판정 명부가 농지원부 → 농지대장으로 바뀌었지만 시계열 단절 공지는 없다. */

export const populationData: YearlyPopulation[] = [
  { year: 2016, farming: 1.3019, farmingMembers: 2.0559, farmingHouseholds: 1.2875, rural: 47.5489 },
  { year: 2017, farming: 1.2763, farmingMembers: 1.963, farmingHouseholds: 1.263, rural: 49.7187 },
  { year: 2018, farming: 1.2055, farmingMembers: 1.7856, farmingHouseholds: 1.1961, rural: 47.2474 },
  { year: 2019, farming: 1.1504, farmingMembers: 1.6181, farmingHouseholds: 1.1422, rural: 44.4464 },
  { year: 2020, farming: 1.257, farmingMembers: 1.7447, farmingHouseholds: 1.2489, rural: 47.7122 },
  { year: 2021, farming: 1.4461, farmingMembers: 1.9776, farmingHouseholds: 1.4347, rural: 49.5658 },
  { year: 2022, farming: 1.266, farmingMembers: 1.6906, farmingHouseholds: 1.2411, rural: 42.1106 },
  { year: 2023, farming: 1.054, farmingMembers: 1.368, farmingHouseholds: 1.0307, rural: 40.0093 },
  { year: 2024, farming: 0.8403, farmingMembers: 1.071, farmingHouseholds: 0.8243, rural: 42.2789 },
  { year: 2025, farming: 0.9134, farmingMembers: 1.1617, farmingHouseholds: 0.8735, rural: 41.3464 },
];

const _popYears = populationData.map((d) => d.year);
const _latestPop = populationData[populationData.length - 1];
const _prevPop = populationData[populationData.length - 2];
const _peakFarm = maxBy(populationData, (d) => d.farming);
const _peakRural = maxBy(populationData, (d) => d.rural);
const _farmChg = changePct(_latestPop.farming, _prevPop.farming);
const _ruralChg = changePct(_latestPop.rural, _prevPop.rural);
const _farmTrend = trendOf(populationData.map((d) => d.farming), _popYears);
/* 농식품부가 쓰는 "귀농귀촌 인구" 합계 = 귀농가구원 + 귀촌인 (2021년 515,434명 = 19,776 + 495,658) */
const _totalNow = _latestPop.farmingMembers + _latestPop.rural;
const _totalChg = changePct(_totalNow, _prevPop.farmingMembers + _prevPop.rural);
const _ruralGap = toCount(_peakRural.rural) - toCount(_latestPop.rural);

const _farmSentence =
  _peakFarm.year === _latestPop.year
    ? `귀농인은 ${_latestPop.year}년 ${formatKoreanCount(toCount(_latestPop.farming))}명으로 최근 ${populationData.length}년 중 가장 많았어요(전년 대비 ${signedPct(_farmChg)}).`
    : `귀농인은 ${_peakFarm.year}년 ${formatKoreanCount(toCount(_peakFarm.farming))}명으로 가장 많았고, ${_latestPop.year}년에는 ${formatKoreanCount(toCount(_latestPop.farming))}명으로 전년보다 ${Math.abs(_farmChg)}% ${changeVerb(_farmChg)}${_farmTrend && _farmTrend.includes("만에") ? `(${_farmTrend})` : ""}.`;

const _ruralSentence =
  `귀촌인은 ${_latestPop.year}년 ${formatKoreanCount(toCount(_latestPop.rural))}명으로 전년보다 ${Math.abs(_ruralChg)}% ${changeVerb(_ruralChg)}.` +
  (_ruralGap > 0
    ? ` 최근 ${populationData.length}년 중 가장 많았던 ${_peakRural.year}년(${formatKoreanCount(toCount(_peakRural.rural))}명)보다 ${_ruralGap >= 10_000 ? `${Math.floor(_ruralGap / 10_000)}만 명 넘게` : `${_ruralGap.toLocaleString("ko-KR")}명`} 적어요.`
    : "");

export const populationSummary = {
  title: "귀농·귀촌 인구 추이",
  description: [
    _farmSentence,
    _ruralSentence,
    `귀농가구원과 귀촌인을 더한 귀농·귀촌 인구는 ${formatKoreanCount(toCount(_totalNow))}명으로 전년보다 ${Math.abs(_totalChg)}% ${changeVerb(_totalChg)}.`,
  ].join(" "),
  source: `국가데이터처 귀농어·귀촌인통계 (${_latestPop.year})`,
};

/** 귀촌 가구주 연령·출발지 — 2025 귀농어·귀촌인통계 ("귀촌 가구주 중 30대가 23.2%", "수도권이 43.2%를 차지") */
export const ruralProfile = { year: 2025, age30sShare: 23.2, capitalAreaShare: 43.2 } as const;

/** 시설원예 스마트팜 도입 농가 성과 — 농식품부(나라경제 2022.2) */
export const smartfarmEffect = { output: 33.3, premiumOutput: 35.9, income: 36.9, labor: -9.8 } as const;


/** 원인 분석 문장용 — 해당 연도 행과 전년 대비 증감률 */
const _popRow = (y: number) => populationData.find((d) => d.year === y)!;
const _popChg = (y: number, key: "farming" | "rural") => changePct(_popRow(y)[key], _popRow(y - 1)[key]);

/* 위 두 상수는 아래 원인 분석 문장이 값에서 계산하도록 앞으로 옮겼다(10/10 — 모듈 평가 순서) */

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
    label: "코로나19 시기 — 농촌 순유입 증가",
    description:
      `2020년 귀촌인은 ${formatKoreanCount(toCount(_popRow(2020).rural))}명으로 전년보다 ${_popChg(2020, "rural")}% 늘었고, 귀농인도 ${formatKoreanCount(toCount(_popRow(2020).farming))}명으로 ${_popChg(2020, "farming")}% 늘었어요. 한국농촌경제연구원은 코로나19 팬데믹과 수도권·광역시 주택가격 급등 같은 사회·경제적 충격, 농촌 생활에 대한 관심 증가로 농촌 순유입이 늘었다고 분석했어요.`,
    source: "한국농촌경제연구원, 2020년 귀농·귀촌 동향과 시사점",
    sourceUrl: "https://eiec.kdi.re.kr/policy/domesticView.do?ac=0000158941",
    relatedYears: [2020, 2021],
  },
  {
    label: "수도권 주택가격 — 밀어내는 요인",
    description:
      "귀촌가구가 꼽은 전입 사유에서 ‘주택’은 26.1%로 직업(32.1%) 다음으로 많아요(2025년). 귀촌인의 43.2%가 수도권(서울·인천·경기)에서 왔고, 수도권·광역시 집값 급등은 2020년 농촌 순유입이 늘어난 배경으로도 꼽혀요.",
    source: "국가데이터처·농림축산식품부, 2025년 귀농어·귀촌인통계",
    sourceUrl: "https://www.mafra.go.kr/bbs/home/792/578248/artclView.do",
    relatedYears: [2020, 2021, 2025],
  },
  {
    label: "베이비부머 은퇴 본격화",
    description:
      "1955~1963년생 1차 베이비부머에 이어 1964~1974년생 2차 베이비부머의 은퇴가 시작되면서 고령층 귀농이 늘고 있어요. 2025년 70대 이상 귀농인은 전년보다 17.3% 늘어 전체의 8.5%로 가장 큰 비중이었고, 귀농가구주 중 60대 비중은 2015년 24.4%에서 2025년 37.3%로 커졌어요. 연고가 있는 농촌으로 돌아가는 U형 귀농은 75.6%예요(2023년 실태조사).",
    source: "농림축산식품부, 2025년 귀농어·귀촌인통계 보도자료",
    sourceUrl: "https://www.mafra.go.kr/bbs/home/792/578248/artclView.do",
    relatedYears: [2023, 2024, 2025],
  },
  {
    label: "2025년 귀농, 4년 만의 반등",
    description:
      `2025년 귀농인은 ${formatKoreanCount(toCount(_popRow(2025).farming))}명으로 전년보다 ${_popChg(2025, "farming")}% 늘어 2021년 이후 4년 만에 증가했어요. 국내 이동 인구가 2.6% 줄어든 가운데 귀촌인은 ${formatKoreanCount(toCount(_popRow(2025).rural))}명으로 ${Math.abs(_popChg(2025, "rural"))}% 줄었고, 귀촌 가구주는 30대가 ${ruralProfile.age30sShare}%로 가장 많았어요. 2024년에는 반대로 귀촌인이 3년 만에 늘고(${_popChg(2024, "rural")}% 증가) 귀농인은 ${Math.abs(_popChg(2024, "farming"))}% 줄었어요.`,
    source: "국가데이터처, 2025년 귀농어·귀촌인통계",
    sourceUrl: "https://mods.go.kr/board.es?act=view&bid=11321&list_no=445590&mid=a10301010000",
    relatedYears: [2024, 2025],
  },
];

/* ── 2. 청년 귀농 비중 (귀농가구주 중 30대 이하) ──
   KOSIS DT_1A02007 연령대별 귀농가구주 수로 계산. 농식품부 2024 보도자료 "(9.4% → 10.8 → 13.1) … 역대 최고치
   (기존은 ’18년 11.3%)"와 일치. */

export const youthData: YouthRatio[] = [
  { year: 2015, ratio: 9.6 },
  { year: 2016, ratio: 10.4 },
  { year: 2017, ratio: 10.5 },
  { year: 2018, ratio: 11.3 },
  { year: 2019, ratio: 10.6 },
  { year: 2020, ratio: 10.9 },
  { year: 2021, ratio: 10.5 },
  { year: 2022, ratio: 9.4 },
  { year: 2023, ratio: 10.8 },
  { year: 2024, ratio: 13.1 },
  { year: 2025, ratio: 12.8 },
];

/** 귀농 이유 1순위 상위 5개 — 2025 귀농·귀촌 실태조사, 귀농 3,000가구 (KOSIS DT_114055_A003) */
export const farmingReasons: Factor[] = [
  { label: "자연환경이 좋아서", pct: 33.3 },
  { label: "가업 승계", pct: 21.7 },
  { label: "비전·발전 가능성", pct: 13.5 },
  { label: "가족·친지 가까이", pct: 13.2 },
  { label: "본인·가족 건강", pct: 8.1 },
];

export const farmingReasonsSource = "농림축산식품부 2025 귀농·귀촌 실태조사";

/** 30대 이하 귀농인의 귀농 이유 — 같은 조사 보도자료(2026-02-25, "최근 7년 연속 … 27.3%") */
export const youthFarmingReasons: Factor[] = [
  { label: "비전·발전 가능성", pct: 27.3 },
  { label: "가업 승계", pct: 26.1 },
  { label: "자연환경이 좋아서", pct: 21.6 },
  { label: "가족·친지 가까이", pct: 11.6 },
  { label: "기타", pct: 13.4 },
];

const _firstYouth = youthData[0];
const _latestYouth = youthData[youthData.length - 1];
const _maxYouth = maxBy(youthData, (d) => d.ratio);
const _minYouth = minBy(youthData, (d) => d.ratio);
const _youthPp = Number((_latestYouth.ratio - _firstYouth.ratio).toFixed(1));

export const youthSummary = {
  title: "청년 정착 트렌드",
  description: [
    `귀농가구주 중 30대 이하 비중은 ${_firstYouth.year}년 ${_firstYouth.ratio}%에서 ${_latestYouth.year}년 ${_latestYouth.ratio}%로 ${Math.abs(_youthPp)}%p ${_youthPp >= 0 ? "높아졌어요" : "낮아졌어요"}.`,
    _minYouth.year < _maxYouth.year
      ? `해마다 오르기만 한 건 아니에요. ${_minYouth.year}년 ${_minYouth.ratio}%까지 내려갔다가 ${_maxYouth.year}년 ${_maxYouth.ratio}%로 가장 높았어요.`
      : `${_maxYouth.year}년 ${_maxYouth.ratio}%로 가장 높았고, ${_minYouth.year}년에는 ${_minYouth.ratio}%였어요.`,
    _maxYouth.year === 2024 ? "농림축산식품부는 2024년 최고치를 청년농 지원 정책의 효과로 판단했어요." : "",
  ]
    .filter(Boolean)
    .join(" "),
  source: `국가데이터처 귀농어·귀촌인통계 (${_latestYouth.year})`,
};

export const youthCauses: CauseAnalysis[] = [
  {
    label: "스마트팜 확산 — 기술 기반 농업 진입 장벽 하락",
    description:
      `센서·자동화 시스템으로 생육 환경을 원격 제어하는 스마트팜은 노동 부담을 줄여요. 시설원예 스마트팜 도입 농가는 생산량이 평균 ${smartfarmEffect.output}% 늘고 자가 노동시간이 ${Math.abs(smartfarmEffect.labor)}% 줄었다는 농림축산식품부 분석이 있어, IT에 익숙한 청년층에게 매력적인 진입 경로가 되고 있어요.`,
    source: "농림축산식품부, 스마트농업 고도화 통해 농업혁신 가속화 (나라경제 2022.2)",
    sourceUrl: "https://eiec.kdi.re.kr/publish/naraView.do?fcode=00002000040000100005&cidx=13662",
    relatedYears: [2020, 2021, 2022, 2023, 2024],
  },
  {
    label: "정부 청년 농촌 정착 지원 정책 강화",
    description:
      "2023년부터 「제1차 후계·청년농 육성 기본계획('23~'27)」이 추진 중이며, 2024년에는 지원 대상을 농촌 거주·관련 산업 청년으로 확대했어요. 청년창업 스마트팜 종합자금 30억 한도(연리 1%, 5년 거치), 교육비 무료, 임대형 스마트팜 우선 입주 등의 혜택이 제공돼요.",
    source: "농림축산식품부, 농업·농촌 청년정책 추진방향 (2024.08)",
    sourceUrl: "https://www.gov.kr/portal/ntnadmNews/3734523",
    relatedYears: [2023, 2024],
  },
  {
    label: "'농업의 비전' — 청년 정착 사유 7년 연속 최고",
    description:
      `30대 이하 청년층이 '농업의 비전 및 발전 가능성'을 정착 사유로 꼽은 비율이 ${youthFarmingReasons[0].pct}%로 7년 연속 최고치를 기록했어요. 6차 산업, 체험 농업, 로컬 브랜딩 등 새로운 농업 모델이 청년들에게 창업 기회로 인식되고 있어요.`,
    source: "대한민국 정책브리핑, 청년층 귀농 이유 분석",
    sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148940202",
    relatedYears: [2022, 2023, 2024],
  },
];

/* ── 3. 정착 만족도 조사 ──
   만족도 분포는 2025 귀농·귀촌 실태조사 "전반적인 귀농 생활 만족도"(귀농 3,000가구, KOSIS DT_114055_A051).
   불만족은 '매우 불만족' 0.1%를 더한 값, '모름/무응답' 0.1%는 뺐다. */

export const satisfactionSegments: SatisfactionSegment[] = [
  { label: "매우 만족", pct: 6.4 },
  { label: "만족", pct: 65.5 },
  { label: "보통", pct: 26.6 },
  { label: "불만족", pct: 1.4 },
];

/* ── 분야별 귀농 생활 만족도 ──
   2025 귀농·귀촌 실태조사 "분야별 귀농 생활 만족도"(귀농 3,000가구, KOSIS DT_114055_A052).
   분야마다 따로 물은 5점 척도라 분야끼리 더해 100%가 되지 않는다.
   10/3 정정(DE-B): 이전 '만족 요인'(자연환경 45·여유로운 삶 28·건강 개선 15·주거비 절감 8·공동체 문화 4)과
   '불만족 요인'(의료 접근성 35·문화생활 부족 30·소득 불안정 25·기타 10)은 어느 조사와도 대응되지 않아
   이 표의 원 값으로 바꿨다. 라벨은 차트 축(100px)에 맞춘 약칭, 원 항목명은 주석. */

interface AreaSatisfaction {
  label: string;
  /** [매우 불만족, 불만족, 보통, 만족, 매우 만족] (%) — KOSIS 원 값 그대로 */
  dist: readonly [number, number, number, number, number];
}

const areaSatisfaction: readonly AreaSatisfaction[] = [
  { label: "자연환경", dist: [0, 1.8, 25.1, 56.9, 16.3] },
  { label: "주거환경", dist: [0.2, 3.4, 37.6, 52.3, 6.6] },
  { label: "건강증진", dist: [0.2, 6.1, 37.6, 48.2, 7.9] },
  { label: "이웃 관계", dist: [0.1, 3.2, 52.5, 40.9, 3.4] }, // 이웃과의 관계
  { label: "직업", dist: [0.3, 10.5, 58.8, 29, 1.4] },
  { label: "가구소득", dist: [1.3, 17.1, 52.7, 28.1, 0.8] },
  { label: "행정·금융", dist: [0.9, 22.1, 57.7, 18, 1.2] }, // 행정·금융시설 이용 여건
  { label: "생활·편의", dist: [3.2, 32, 48.2, 15.4, 1.2] }, // 생활·편의시설 이용 여건
  { label: "병원·의료", dist: [2.5, 32.8, 48.6, 14.9, 1.3] }, // 병원·보건의료 이용 여건
  { label: "문화·여가", dist: [3.7, 35.6, 46.3, 13.1, 1.3] }, // 문화·여가시설 이용 여건
];

const _pctSum = (xs: readonly number[]) => Number(xs.reduce((a, b) => a + b, 0).toFixed(1));
const _areaRates = areaSatisfaction.map((a) => ({
  label: a.label,
  /** 만족 + 매우 만족 */
  satisfied: _pctSum(a.dist.slice(3)),
  /** 불만족 + 매우 불만족 */
  dissatisfied: _pctSum(a.dist.slice(0, 2)),
}));

/** 차트에 보여 줄 분야 수 (분야가 많아 상위만) */
const AREA_TOP = 5;

/** 분야별 '만족'(만족 + 매우 만족) 비율 상위 — 2025 실태조사 */
export const satisfactionFactors: Factor[] = [..._areaRates]
  .sort((a, b) => b.satisfied - a.satisfied)
  .slice(0, AREA_TOP)
  .map((a) => ({ label: a.label, pct: a.satisfied }));

/** 분야별 '불만족'(불만족 + 매우 불만족) 비율 상위 — 2025 실태조사 */
export const dissatisfactionFactors: Factor[] = [..._areaRates]
  .sort((a, b) => b.dissatisfied - a.dissatisfied)
  .slice(0, AREA_TOP)
  .map((a) => ({ label: a.label, pct: a.dissatisfied }));

/** 분야별 만족도 차트의 출처 보조 문구·원 통계표 — "10개 분야별 ‘만족·매우 만족’ 비율 상위 5개" */
export const areaSatisfactionMeta = {
  note: (answer: string) => `${areaSatisfaction.length}개 분야별 ‘${answer}’ 비율 상위 ${AREA_TOP}개`,
  href: "https://kosis.kr/statHtml/statHtml.do?orgId=114&tblId=DT_114055_A052",
} as const;

/** 2025 귀농·귀촌 실태조사 — 귀농 전후 월평균 생활비·5년차 소득 (농식품부 2026-02-25 보도자료) */
export const settlementSurvey = {
  year: 2025,
  livingCostBefore: 239,
  livingCostAfter: 173,
  livingCostChange: -27.6,
  ruralLivingCostBefore: 231,
  ruralLivingCostAfter: 204,
  ruralLivingCostChange: -11.7,
  incomeFirstYear: 2534,
  incomeFifthYear: 3300,
  incomeChange: 30.2,
  /** 귀촌 첫해 → 5년차 가구소득 — 같은 보도자료 "귀촌 … 4,215만원 … 첫해 3,853만원 … 9.4% 증가" */
  ruralIncomeFirstYear: 3853,
  ruralIncomeFifthYear: 4215,
  ruralIncomeChange: 9.4,
  /** 지역주민과 '관계가 좋다'(매우 좋음 + 좋음), KOSIS DT_114055_A035 */
  goodRelations: 75.5,
  /** 현재 거주 지역에 '계속 거주할 계획' — KOSIS DT_114055_A054, 보도자료 "귀농가구 97.0%" */
  stayIntent: 97.0,
  /** 평균 농가 가구소득 (만 원, 2024) — 같은 보도자료 "평균 농가(5,060만원, ‘24)". 원 통계는 국가데이터처 농가경제조사 */
  avgFarmHouseholdIncome: 5060,
  avgFarmHouseholdIncomeYear: 2024,
  /** 같은 표의 평균 농가 소득 구성 (만 원) — 농업소득 958·농외소득 2,015·이전소득 1,824·비경상소득 263 */
  avgFarmIncomeParts: { agri: 958, offFarm: 2015, transfer: 1824, irregular: 263 },
  /** 준비 기간 (개월) — 보도자료 "귀농 준비기간은 평균 27.4개월, 귀촌은 15.5개월" */
  prepMonths: 27.4,
  ruralPrepMonths: 15.5,
  /**
   * 농지·가축·시설 투자액 (만 원) — 보도자료 별첨 "투자 농지·가축·시설에 대한 투자액은 귀농가구 6,219만원, 귀촌가구 4,563만원".
   * 생활비·주거비를 더한 '총 정착 비용'이 아니다. 10/10 정정: 예전 화면은 이 값을 영농 준비 84.6% + 생활 정착비로 나눴는데
   * 84.6%·생활 정착비는 원문에 없었다.
   */
  investment: 6219,
  ruralInvestment: 4563,
  /** 투자 시기 — "(귀농) 초기 투자 89.6%, 추가 투자 10.4% / (귀촌) 78.4, 21.6" */
  initialInvestmentShare: 89.6,
  ruralInitialInvestmentShare: 78.4,
} as const;

/** 2025 실태조사 귀농가구 연령별 투자액 (만 원) — 보도자료 별첨 "(30대 이하) 8,209만원, (40대) 9,547, (50대) 6,485, (60대) 5,512, (70대 이상) 4,413" */
export const investmentByAge: readonly { age: string; amount: number }[] = [
  { age: "30대 이하", amount: 8209 },
  { age: "40대", amount: 9547 },
  { age: "50대", amount: 6485 },
  { age: "60대", amount: 5512 },
  { age: "70대 이상", amount: 4413 },
];

/** 실태조사 투자액 원문(보도자료 별첨) — 출처 링크 */
export const settlementSurveyUrl = "https://www.mafra.go.kr/bbs/home/792/577092/artclView.do";

const _satisfied = Number(
  satisfactionSegments
    .filter((seg) => seg.label === "매우 만족" || seg.label === "만족")
    .reduce((sum, seg) => sum + seg.pct, 0)
    .toFixed(1),
);

/** "문화·여가(39.3%), 병원·의료(35.3%), 생활·편의(35.2%)" — 분야 라벨에 가운뎃점이 있어 쉼표로 잇는다 */
const _topDissatisfied = dissatisfactionFactors
  .slice(0, 3)
  .map((f) => `${f.label}(${f.pct}%)`)
  .join(", ");
const _topSatisfied = satisfactionFactors[0];
/** 귀농 5년차 가구소득 ÷ 평균 농가 가구소득 (%) — 보도자료 "65.2% 수준" 과 같은 값이 나온다 */
const _incomeVsFarm = (settlementSurvey.incomeFifthYear / settlementSurvey.avgFarmHouseholdIncome) * 100;

export const satisfactionSummary = {
  title: "정착 만족도 조사",
  description: `귀농가구의 ${_satisfied}%가 귀농 생활에 만족한다고 답했고, 귀농 이유는 자연환경이 1위예요. 분야별로는 ${_topSatisfied.label}(${_topSatisfied.pct}%)에 만족한다는 답이 가장 많았고, ${_topDissatisfied} 시설 이용 여건에는 불만족한다는 답이 많았어요. 월평균 생활비는 귀농 전 ${settlementSurvey.livingCostBefore}만 원에서 ${settlementSurvey.livingCostAfter}만 원으로 ${Math.abs(settlementSurvey.livingCostChange)}% 줄었어요.`,
  /** 조사 연도 고정 — 인구 통계 연도를 따라가지 않는다(10/3 정정) */
  source: `농림축산식품부 ${settlementSurvey.year} 귀농·귀촌 실태조사`,
};

export const satisfactionCauses: CauseAnalysis[] = [
  {
    label: "자연환경 — 귀농 이유 1위",
    description:
      `귀농 이유 1순위는 '${farmingReasons[0].label}'(${farmingReasons[0].pct}%)이고, 귀농가구의 ${_satisfied}%가 귀농 생활에 만족한다고 답했어요. 지역주민과 관계가 좋다는 응답도 ${settlementSurvey.goodRelations}%예요(${settlementSurvey.year}년 실태조사).`,
    // 관계 75.5% 는 A035(지역주민들과의 관계) — 링크는 귀농 이유·만족도 표(A051) 하나라 출처 줄에 두 표를 다 적는다 (10/4 QA)
    source: "농림축산식품부, 2025 귀농·귀촌 실태조사 (KOSIS DT_114055_A051·A035)",
    sourceUrl: "https://kosis.kr/statHtml/statHtml.do?orgId=114&tblId=DT_114055_A051",
  },
  {
    label: `생활비는 줄고 — 소득은 평균 농가의 ${Math.round(_incomeVsFarm)}%`,
    description:
      `귀농 가구의 월평균 생활비는 귀농 전 ${settlementSurvey.livingCostBefore}만 원에서 ${settlementSurvey.livingCostAfter}만 원으로 ${Math.abs(settlementSurvey.livingCostChange)}% 줄었어요. 귀농 5년차 가구소득은 ${settlementSurvey.incomeFifthYear.toLocaleString("ko-KR")}만 원으로 첫해(${settlementSurvey.incomeFirstYear.toLocaleString("ko-KR")}만 원)보다 ${settlementSurvey.incomeChange}% 늘었지만, 전체 농가 평균(${settlementSurvey.avgFarmHouseholdIncome.toLocaleString("ko-KR")}만 원, ${settlementSurvey.avgFarmHouseholdIncomeYear}년)의 ${_incomeVsFarm.toFixed(1)}% 수준이에요.`,
    source: "농림축산식품부, 2025 귀농·귀촌 실태조사",
    sourceUrl: "https://www.mafra.go.kr/bbs/home/792/577092/artclView.do",
  },
  /* 10/3 정정(DE-B): "불만족 1위 = 의료"는 근거 없던 불만족 요인 차트(의료 35%)에 기댄 표현이었다 — 공식 분야별
     만족도에서는 문화·여가가 1위라 바꿨다. "농촌 1인 가구가 늘수록 미충족 의료 증가"는 출처 보고서(P257)에 없어 지웠다.
     이어지던 "초기 3년 — 정착 성패의 분기점(농외소득 200만 원 급감)"은 출처로 적은 실태조사 발표에 없는 내용이라 지웠다. */
  {
    label: "생활 인프라 — 불만족이 가장 많은 분야",
    description: `분야별로 물으면 ${_topDissatisfied} 시설 이용 여건에 불만족한다는 답이 가장 많았어요(${settlementSurvey.year}년 실태조사). 한국농촌경제연구원 보고서도 농촌 정주만족도 조사에서 필요할 때 의료서비스를 이용하기 쉬운 정도, 지역에서 받을 수 있는 의료서비스의 범위와 수준, 응급의료 접근성이 모두 도시보다 낮게 나왔다고 정리했어요.`,
    source: "한국농촌경제연구원, 농촌·도시 건강실태 및 의료비용 효과 비교와 정책과제 (2019)",
    sourceUrl: "https://repository.krei.re.kr/bitstream/2018.oak/24943/1/P257.pdf",
  },
];

/* ── 4. 귀산촌 (출처: 국가데이터처 귀농어·귀촌인통계, 산림청) ──
   귀산촌 가구 = 귀촌 가구 중 산림기본법 제3조의 '산촌'으로 옮긴 가구 (KOSIS DT_1A02040).
   산촌은 2024년 산촌기초조사로 109개 시·군 466개 읍·면 → 108개 시·군 468개 읍·면으로 바뀌었다. */

export interface YearlyMountain {
  year: number;
  /** 귀산촌 가구 수 */
  households: number;
}

export const mountainData: YearlyMountain[] = [
  { year: 2018, households: 43155 },
  { year: 2019, households: 43665 },
  { year: 2020, households: 46212 },
  { year: 2021, households: 46347 },
  { year: 2022, households: 43587 },
  { year: 2023, households: 40016 },
  { year: 2024, households: 40895 },
  { year: 2025, households: 40350 },
];

/** 산림기본법상 산촌 — 2024년 산촌기초조사 기준 (산림청 「산촌이란?」, 2025 귀농어·귀촌인통계 부록3) */
export const mountainVillageArea = { year: 2024, sigungu: 108, eupmyeon: 468 } as const;

/** 귀산촌 가구 전입 사유 — 2025년, KOSIS DT_1A02042 (기타는 맨 끝) */
export const mountainReasons: Factor[] = [
  { label: "직업", pct: 32.1 },
  { label: "가족", pct: 27.7 },
  { label: "주택", pct: 17.8 },
  { label: "자연환경", pct: 10.2 },
  { label: "주거환경", pct: 3.9 },
  { label: "교육", pct: 1.5 },
  { label: "기타", pct: 6.9 },
];

/** 귀촌 가구 전입 사유 — 2025년, KOSIS DT_1A02032 (기타는 맨 끝) */
export const villageReasons: Factor[] = [
  { label: "직업", pct: 32.1 },
  { label: "주택", pct: 26.1 },
  { label: "가족", pct: 25.4 },
  { label: "자연환경", pct: 4.5 },
  { label: "주거환경", pct: 3.5 },
  { label: "교육", pct: 1.9 },
  { label: "기타", pct: 6.6 },
];

/** 전입 사유 표의 기준 연도 — 인구 배열 연도를 따라가지 않게 따로 둔다 */
export const reasonsYear = 2025;
export const reasonsSource = `국가데이터처 귀농어·귀촌인통계 (${reasonsYear}, 전입 사유)`;


const _latestMtn = mountainData[mountainData.length - 1];
const _prevMtn = mountainData[mountainData.length - 2];
const _maxMtn = maxBy(mountainData, (d) => d.households);
const _minMtn = minBy(mountainData, (d) => d.households);
const _mtnChg = changePct(_latestMtn.households, _prevMtn.households);
const _mtnTopReasons = mountainReasons
  .filter((r) => r.label !== "기타")
  .slice(0, 3)
  .map((r) => r.label)
  .join("·");

export const mountainSummary = {
  title: "귀산촌 트렌드",
  description: `산림기본법상 산촌으로 옮긴 귀산촌 가구는 ${_latestMtn.year}년 ${_latestMtn.households.toLocaleString("ko-KR")}가구로 전년보다 ${Math.abs(_mtnChg)}% ${changeVerb(_mtnChg)}. ${_maxMtn.year}년 ${_maxMtn.households.toLocaleString("ko-KR")}가구가 가장 많았고, 최근 ${mountainData.length}년 동안 해마다 ${Math.floor(_minMtn.households / 10_000)}만 가구 넘게 산촌으로 옮겼어요. 전입 사유는 ${_mtnTopReasons} 순이에요.`,
  source: `국가데이터처 귀농어·귀촌인통계 (${_latestMtn.year})`,
};

export const mountainCauses: CauseAnalysis[] = [
  {
    label: "귀산촌 가구는 누가, 왜 옮길까",
    description:
      `2025년 귀산촌 가구주는 60대(23.4%)가 가장 많고 50대(20.5%)가 뒤를 이어 50~60대가 43.9%예요. 30대 이하도 31.7%를 차지해요. 전입 사유는 ${mountainReasons.filter((r) => r.label !== "기타").slice(0, 4).map((r) => `${r.label}(${r.pct}%)`).join(", ")} 순이에요.`,
    source: "국가데이터처, 2025년 귀농어·귀촌인통계",
    sourceUrl: "https://mods.go.kr/board.es?act=view&bid=11321&list_no=445590&mid=a10301010000",
    relatedYears: [2024, 2025],
  },
  {
    label: `산림청 귀산촌 자금 — 창업 ${formatManwon(FOREST_VILLAGE_LOAN.startupMaxManwon.value).replace(" 원", "")}·주택 ${formatManwon(FOREST_VILLAGE_LOAN.housingMaxManwon.value)}`,
    description:
      `산림청은 귀산촌인에게 창업자금 세대당 최대 ${formatManwon(FOREST_VILLAGE_LOAN.startupMaxManwon.value)}, 주택 구입·신축 세대당 최대 ${formatManwon(FOREST_VILLAGE_LOAN.housingMaxManwon.value)}을 ${FOREST_VILLAGE_LOAN.interestRate.value}(${FOREST_VILLAGE_LOAN.repayment.value})로 융자해요. 창업자금은 인정 교육을 5년 이내 ${FOREST_VILLAGE_LOAN.educationHours.value}시간 이상 이수해야 하고(주택 자금은 교육 불필요), 신청은 ${FOREST_VILLAGE_LOAN.applyOffice.value}에서 해요.`,
    source: "산림청, 귀산촌 길라잡이",
    sourceUrl: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_000434&mn=AR02_06_02_02",
    relatedYears: [2024, 2025],
  },
  {
    label: "산촌 — 108개 시·군 468개 읍·면",
    description:
      "귀산촌 통계와 산림청 지원 대상의 ‘산촌’은 산림기본법상 산촌이에요. 2024년 산촌기초조사로 109개 시·군 466개 읍·면에서 108개 시·군 468개 읍·면으로 바뀌었고, 경북(112곳)·강원(93곳)·경남(70곳)·전남(53곳) 순으로 많아요. 시·도지사가 따로 지정하는 ‘산촌진흥지역’과는 다른 개념이에요.",
    source: "산림청, 산촌이란?",
    sourceUrl: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_001180&mn=AR02_06_01_01",
    relatedYears: [2024],
  },
];

/* ── 5. 스마트팜 현황 (출처: 국회예산정책처·농림축산식품부) ──
   10/3 정정: 근거를 찾지 못한 '스마트팜 도입 농가 수' 시계열(smartfarmData, 2018 4,010곳 → 2024 8,534곳)을 지웠다.
   2018 "4,010"은 실제로는 2017년 보급 면적(4,010ha)이었다. 통계·랜딩·정착 유형 화면은 공식 보급 면적만 쓴다. */

export interface SmartfarmArea {
  year: number;
  /** 시설원예 스마트팜(스마트온실) 보급 면적 — ha, 누적, 정책사업 보급 기준 */
  area: number;
  /** 잠정치 */
  provisional?: boolean;
}

/**
 * 2017~2021: 국회예산정책처 「스마트농업 육성사업 추진현황과 개선과제」(2022.6) [스마트농업 연도별 보급 실적],
 *            농식품부 제출자료, 2021년은 잠정
 * 2023:      농림축산식품부 설명자료(2024.11.25) "2023년 말 기준 … 도입한 면적은 7,716ha"
 * 2022·2024 는 공식 수치를 찾지 못해 넣지 않는다(빈 해를 지어내지 않는다).
 */
export const smartfarmAreaData: SmartfarmArea[] = [
  { year: 2017, area: 4010 },
  { year: 2018, area: 4900 },
  { year: 2019, area: 5383 },
  { year: 2020, area: 5985 },
  { year: 2021, area: 6485, provisional: true },
  { year: 2023, area: 7716 },
];

/** 스마트온실 도입률 — 농식품부 「2026년 스마트농업 육성 시행계획」 "[’24] 스마트온실 16% → [’30] 35%"(온실 55천 ha 기준) */
export const smartfarmAdoption = { year: 2024, pct: 16, targetYear: 2030, targetPct: 35 } as const;


const _firstSfa = smartfarmAreaData[0];
const _latestSfa = smartfarmAreaData[smartfarmAreaData.length - 1];
const _sfaGrowth = Math.round((_latestSfa.area / _firstSfa.area - 1) * 100);

export const smartfarmSummary = {
  title: "스마트팜 현황",
  description: `시설원예 스마트팜(스마트온실) 보급 면적은 ${_firstSfa.year}년 ${_firstSfa.area.toLocaleString("ko-KR")}ha에서 ${_latestSfa.year}년 ${_latestSfa.area.toLocaleString("ko-KR")}ha로 ${_sfaGrowth}% 늘었어요. ${smartfarmAdoption.year}년 스마트온실 도입률은 ${smartfarmAdoption.pct}%이고, 정부는 ${smartfarmAdoption.targetYear}년까지 ${smartfarmAdoption.targetPct}%를 목표로 해요. 도입 농가는 생산량이 평균 ${smartfarmEffect.output}% 늘고 자가 노동시간이 ${Math.abs(smartfarmEffect.labor)}% 줄었다는 분석이 있어요.`,
  /* 정착 유형 타일 폭(약칭 후 30자) 안에 들어가야 한다 — 2017~2021 국회예산정책처(2022), 2023 농식품부(2024.11) */
  source: "국회예산정책처 2022 · 농림축산식품부 2024",
};

/** 시설원예 스마트팜 품목별 보급 면적 비중 — 2020년 누적. 기타는 가지·고추·멜론·버섯·포도·새싹인삼 등 */
export const smartfarmCrops: Factor[] = [
  { label: "딸기", pct: 33.8 },
  { label: "참외", pct: 21.8 },
  { label: "토마토", pct: 14.1 },
  { label: "파프리카", pct: 11.4 },
  { label: "장미", pct: 2.4 },
  { label: "기타", pct: 16.5 },
];

export const smartfarmCropsSource = "국회예산정책처 스마트농업 육성사업 추진현황과 개선과제 (2022, 2020년 누적 보급 면적)";

export const smartfarmCauses: CauseAnalysis[] = [
  {
    label: "정부 스마트농업 확산 정책",
    description:
      "농림축산식품부는 「제1차 스마트농업 육성 기본계획(2025~2029)」에서 스마트온실 도입률을 2024년 16%에서 2030년 35%로 높이는 목표를 세웠어요. 스마트팜 종합자금은 보조가 아닌 융자예요(일반 시설자금 1인 50억 원·청년 30억 원 한도, 연 1.0% 고정, 5년 거치 20년 상환). 온실 ICT 장비·신축 보조는 지자체가 공모하는 ICT 융복합 확산사업으로 따로 운영되고, 2026년 계획 기준 국비 25%·지방비 30%·융자 25%·자부담 20%예요. 청년창업보육센터는 김제·고흥·상주·밀양 4곳에서 운영돼요.",
    source: "농림축산식품부, 2026년 스마트농업 육성 시행계획 (2025.11)",
    sourceUrl: "https://www.mafra.go.kr/bbs/home/791/594105/download.do",
    relatedYears: [2022, 2023, 2024],
  },
  {
    label: "청년창업보육센터 — 20개월 무료 교육",
    description:
      "전국 4개 스마트팜 혁신밸리에서 20개월 장기 교육(입문 → 교육형실습 → 경영형실습)을 국비 무료로 제공해요. 실습비 월 최대 70만 원, 실습재료비 연 최대 360만 원이 지원되며, 수료 후 임대형 스마트팜 입주도 가능해요.",
    source: "한국농업기술진흥원, 스마트팜 청년창업보육센터",
    sourceUrl: "https://www.smartfarmkorea.net/edu/pnbsns/all.do?menuId=M11020201",
    relatedYears: [2023, 2024],
  },
  {
    label: "도입 농가 생산성 효과",
    description:
      `시설원예 스마트팜 도입 농가는 생산량이 ${smartfarmEffect.output}%, 고품질 생산량이 ${smartfarmEffect.premiumOutput}%, 농업소득이 ${smartfarmEffect.income}% 늘고 자가 노동시간은 ${Math.abs(smartfarmEffect.labor)}% 줄었다는 농림축산식품부 분석이 있어요. 조사마다 수치는 달라서, 2016년 분석에서는 생산량 27.9% 증가로 나왔어요.`,
    source: "농림축산식품부, 스마트농업 고도화 통해 농업혁신 가속화 (나라경제 2022.2)",
    sourceUrl: "https://eiec.kdi.re.kr/publish/naraView.do?fcode=00002000040000100005&cidx=13662",
    relatedYears: [2020, 2021, 2022, 2023, 2024],
  },
];
