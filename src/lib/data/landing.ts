/* ────────────────────────────────────────────
   랜딩페이지 데이터
   page.tsx 에서 분리 — Tailwind 의존 없음
   ──────────────────────────────────────────── */

import {
  populationData,
  youthData,
  mountainData,
  mountainVillageArea,
  mountainReasons,
  villageReasons,
  reasonsYear,
  ruralProfile,
  farmingReasons,
  youthFarmingReasons,
  satisfactionSegments,
  settlementSurvey,
  smartfarmAreaData,
  smartfarmAdoption,
  smartfarmEffect,
  smartfarmCrops,
  changePct,
  formatKoreanCount,
  signedPct,
  toCount,
  trendOf,
} from "./stats";


/* ── (구) 정착 트렌드 데이터: TREND_BENTO_PROFILES로 이전 완료 ── */

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
    title: "귀농 자금 가구당 평균 6000만 원…농지 구입·임차에 90% 이상 사용",
    source: "농민신문",
    date: "2026.02",
    url: "https://www.nongmin.com/article/20260225500580",
    description:
      "2025년 귀농 가구가 들인 투자금은 평균 6219만 원으로 전년(5464만 원) 대비 13.8% 증가하며 처음으로 6000만 원을 돌파했다. 농지 마련에 5260만 원이 쓰여 가장 많은 비중을 차지했다.",
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
    title: "농업교육포털 — 전국 농업·정착 교육 통합 안내",
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
      "2026년 농림축산식품사업 시행지침서. 귀농 농업창업 자금은 최대 3억원 한도, 연 2.0% 저금리 융자, 5년 거치 10년 분할 상환 조건이에요. 주택구입자금은 7,500만 원 한도로 별도 지원돼요.",
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
    title: "月15만 원의 힘…농어촌 인구 반등 물꼬텄다",
    source: "서울경제",
    date: "2026.03",
    url: "https://www.sedaily.com/article/20014738",
    description:
      "전국 10개 인구 소멸 위기 농어촌 지역에 ‘농어촌 기본소득’이 처음 지급되면서 인구 반등과 지역경제 활성화의 신호가 나타나고 있어요. 69개 군 중 6개 군 24만 명이 지역화폐로 월 15만 원을 받아요.",
    thumbnail:
      "https://wimg.sedaily.com/news/cms/2026/03/03/news-p.v1.20260226.28525aca14674a58a42a61531172a434_R.jpg",
  },
  {
    title: "농식품부, 귀농시 6219만 원·귀촌시 4563만 원 필요",
    source: "농수축산신문",
    date: "2026.03",
    url: "http://www.aflnews.co.kr/news/articleView.html?idxno=315465",
    description:
      "귀농 시 평균 6219만 원, 귀촌 시 4563만 원의 투자가 필요한 것으로 조사됐어요. 젊은층의 귀농 투자액이 상대적으로 높았고, 농지 마련에 가장 많은 비용이 들어갔어요.",
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
      "송미령 장관이 비료 원료 수급, 농산물 물가, 가축 방역 현장을 잇따라 점검하며 전방위 농정 대응에 나섰어요. 청년 영농정착지원·시설 현대화 등 핵심 정책의 연속 가동을 강조했어요.",
    thumbnail:
      "https://www.cbci.co.kr/news/thumbnail/202604/566385_382997_613_v150.jpg",
  },
];

/* ── 벤토 미리보기 데이터 ── */

/* ── 정착 트렌드 벤토 데이터 ── */

export type TrendTypeId = "farming" | "rural" | "youth" | "mountain" | "smartfarm";

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

interface TrendBentoStat {
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
  /** 공식 근거가 있는 비교만 둔다. 없으면 생략 — 렌더는 비교 타일을 숨긴다(귀산촌) */
  compare?: { title: string; items: { label: string; change: string; detail: string }[] };
}

/* ── 추세 벤토 수치 — stats.ts 배열에서 계산한다 (10/3 정정) ──
   "1.2만"·"42.2만 역대 최대"·"2,685"·"8,534" 같은 손으로 적은 숫자가 공식 통계와 달랐다.
   비교(compare) 항목도 10/3 DE-B 가 원문을 다시 찾았다. 근거를 찾지 못한 것 — 주거비 3.3㎡당 1,800만 → 350만 원,
   출퇴근 58분 → 차로 10분, 주거 면적 58㎡ → 130㎡, 미세먼지 24 → 17㎍/㎥, 귀산촌 4종, 청년 농지임차 연 300만 원
   (충남 금산군 등 일부 지자체 사업), '정착 교육 100시간+' — 은 지웠다. 남은 값은 실태조사 보도자료·정책 원문 값이다. */
const _pop = populationData[populationData.length - 1];
const _popPrev = populationData[populationData.length - 2];
const _popYears = populationData.map((d) => d.year);
const _farmChg = changePct(_pop.farming, _popPrev.farming);
const _ruralChg = changePct(_pop.rural, _popPrev.rural);
const _farmTrend = trendOf(populationData.map((d) => d.farming), _popYears);
const _ruralTrend = trendOf(populationData.map((d) => d.rural), _popYears);
/** "증가"·"감소"만이면 전년 대비 부호와 겹치므로 흐름(연속·만에)일 때만 덧붙인다 */
const _trendSuffix = (t: string | null) => (t && t !== "증가" && t !== "감소" ? ` · ${t}` : "");
const _youth = youthData[youthData.length - 1];
const _youthBest = youthData.reduce((a, b) => (b.ratio > a.ratio ? b : a));
const _mtn = mountainData[mountainData.length - 1];
const _mtnPrev = mountainData[mountainData.length - 2];
const _mtnFirst = mountainData[0];
const _mtnMin = mountainData.reduce((a, b) => (b.households < a.households ? b : a));
const _sfa = smartfarmAreaData[smartfarmAreaData.length - 1];
const _sfaFirst = smartfarmAreaData[0];
const _sfaChg = changePct(_sfa.area, _sfaFirst.area);
// 소수 첫째 자리까지 — /stats·/start 가 71.9% 로 쓰는데 홈만 72% 로 반올림하면 같은 수치가 두 값이 된다(10/3 재검증)
const _satisfied = Number(
  satisfactionSegments
    .filter((seg) => seg.label === "매우 만족" || seg.label === "만족")
    .reduce((sum, seg) => sum + seg.pct, 0)
    .toFixed(1),
);
const _farmers = `${formatKoreanCount(toCount(_pop.farming))}명`;

export const TREND_BENTO_PROFILES: Record<TrendTypeId, TrendBentoProfile> = {
  farming: {
    id: "farming",
    label: "귀농",
    title: "왜 귀농을 할까?",
    titleEm: "귀농",
    subtitle: `${_pop.year}년 ${_farmers}이 농사를 지으러 농촌으로 왔어요`,
    href: "/stats?tab=farming",
    source: `국가데이터처 ${_pop.year} 귀농어·귀촌인통계 · 농림축산식품부 ${settlementSurvey.year} 귀농귀촌 실태조사`,
    hero: {
      value: _farmers,
      label: `${_pop.year} 귀농인`,
      sub: `전년 대비 ${signedPct(_farmChg)}${_trendSuffix(_farmTrend)}`,
      desc: "농업경영체 등에 등록한 귀농 본인 수예요. 함께 이사한 가족은 세지 않아요",
    },
    stats: [
      {
        value: `${_youth.ratio}%`,
        label: "청년 귀농 비중",
        sub: `${_youth.year} · 30대 이하 귀농가구주`,
        desc:
          _youthBest.year === _youth.year
            ? "귀농가구주 중 30대 이하 비중이 가장 높아요"
            : `${_youthBest.year}년 ${_youthBest.ratio}%가 가장 높았어요`,
      },
      {
        value: `${_satisfied}%`,
        label: "정착 만족도",
        sub: `귀농 전보다 생활비 ${Math.abs(settlementSurvey.livingCostChange).toFixed(1)}%↓`,
        desc: `귀농 생활에 만족한다고 답한 비율이에요 (${settlementSurvey.year} 실태조사)`,
      },
    ],
    chart: {
      title: "어떤 이유로 떠났을까?",
      surveyLabel: `귀농 3,000가구 · ${settlementSurvey.year} 실태조사`,
      items: farmingReasons,
    },
    compare: {
      title: "농촌으로 가면 뭐가 달라질까?",
      items: [
        {
          label: "월 생활비",
          change: signedPct(settlementSurvey.livingCostChange),
          detail: `${settlementSurvey.livingCostBefore}만 원 → ${settlementSurvey.livingCostAfter}만 원`,
        },
        {
          label: "가구소득 (5년차)",
          change: signedPct(settlementSurvey.incomeChange),
          detail: `첫해 ${settlementSurvey.incomeFirstYear.toLocaleString("ko-KR")}만 원 → ${settlementSurvey.incomeFifthYear.toLocaleString("ko-KR")}만 원`,
        },
      ],
    },
  },
  rural: {
    id: "rural",
    label: "귀촌",
    title: "왜 귀촌을 할까?",
    titleEm: "귀촌",
    subtitle: `${_pop.year}년 ${Math.floor(toCount(_pop.rural) / 10_000)}만 명이 농업 없이 농촌에서 새 삶을 시작했어요`,
    href: "/stats?tab=village",
    source: `국가데이터처 ${_pop.year} 귀농어·귀촌인통계`,
    hero: {
      value: `${_pop.rural.toFixed(1)}만`,
      label: `${_pop.year} 귀촌인`,
      sub: `전년 대비 ${signedPct(_ruralChg)}${_trendSuffix(_ruralTrend)}`,
      desc: "농업 없이 농촌으로 옮긴 사람이에요. 함께 이사한 가족까지 세요",
    },
    stats: [
      {
        value: `${ruralProfile.age30sShare}%`,
        label: "30대 비중",
        sub: `${ruralProfile.year} · 귀촌 가구주 기준`,
        desc: "귀촌 가구주 연령대 중 30대가 가장 많아요",
      },
      {
        value: `${ruralProfile.capitalAreaShare}%`,
        label: "수도권 출발",
        sub: "서울·인천·경기",
        desc: "귀촌인 열 명 중 네 명 이상이 수도권에서 와요",
      },
    ],
    chart: {
      title: "왜 농촌을 선택했을까?",
      surveyLabel: `귀촌 가구 전입 사유 · ${reasonsYear}`,
      items: villageReasons,
    },
    compare: {
      title: "귀촌하면 뭐가 달라질까?",
      items: [
        {
          label: "월 생활비",
          change: signedPct(settlementSurvey.ruralLivingCostChange),
          detail: `${settlementSurvey.ruralLivingCostBefore}만 원 → ${settlementSurvey.ruralLivingCostAfter}만 원`,
        },
        /* 귀농 카드와 같은 축 — 같은 실태조사 보도자료의 귀촌 5년차 가구소득 */
        {
          label: "가구소득 (5년차)",
          change: signedPct(settlementSurvey.ruralIncomeChange),
          detail: `첫해 ${settlementSurvey.ruralIncomeFirstYear.toLocaleString("ko-KR")}만 원 → ${settlementSurvey.ruralIncomeFifthYear.toLocaleString("ko-KR")}만 원`,
        },
      ],
    },
  },
  youth: {
    id: "youth",
    label: "청년농",
    title: "청년, 왜 농업을 택할까?",
    titleEm: "농업",
    subtitle:
      _youthBest.year === _youth.year
        ? `귀농가구주 중 30대 이하 비중이 ${_youth.ratio}%로 가장 높아요`
        : `귀농가구주 중 30대 이하 비중이 ${_youthBest.year}년 ${_youthBest.ratio}%로 가장 높았어요`,
    href: "/stats?tab=youth",
    source: `국가데이터처 ${_youth.year} 귀농어·귀촌인통계 · 농림축산식품부 ${settlementSurvey.year} 귀농귀촌 실태조사`,
    hero: {
      value: `${_youth.ratio}%`,
      label: "청년 귀농 비중",
      sub: `${_youth.year} · 30대 이하 귀농가구주`,
      desc:
        _youth.ratio >= 10
          ? "귀농가구주 열 명 중 한 명 이상이 30대 이하예요"
          : `귀농가구주 중 30대 이하는 ${_youth.ratio}%예요`,
    },
    stats: [
      { value: "3,600만 원", label: "영농정착지원금", sub: "월 110·100·90만 원 × 3년 (매년 감액)", desc: "만 18~39세 청년 창업농에게 지급되는 정부 보조금이에요" },
      {
        value: `${youthFarmingReasons[0].pct}%`,
        label: "청년 귀농 이유 1위",
        sub: `${youthFarmingReasons[0].label} · ${settlementSurvey.year}`,
        desc: "30대 이하 귀농인이 가장 많이 꼽은 이유예요",
      },
    ],
    chart: {
      title: "청년이 농업을 택한 이유",
      surveyLabel: `30대 이하 귀농인 · ${settlementSurvey.year} 실태조사`,
      items: youthFarmingReasons,
    },
    compare: {
      title: "청년농 지원, 얼마나 받을까?",
      items: [
        { label: "정착지원금", change: "월 110만 원", detail: "보조금 · 최대 3년" },
        { label: "창업자금", change: "최대 3억원", detail: "저금리 융자 지원" },
        /* 국비 무료 장기 교육(만 18~39세) — programs.ts SP-012 원문. "정착 교육 100시간+"는 귀농 창업자금 심사 기준과 섞인 표기였다 */
        { label: "교육비", change: "무료", detail: "청년창업보육센터 20개월" },
      ],
    },
  },
  mountain: {
    id: "mountain",
    label: "귀산촌",
    title: "왜 산촌으로 떠날까?",
    titleEm: "산촌",
    subtitle: `최근 ${mountainData.length}년 동안 해마다 ${Math.floor(_mtnMin.households / 10_000)}만 가구 넘게 산촌으로 옮겼어요`,
    href: "/stats?tab=mountain",
    source: `국가데이터처 ${_mtn.year} 귀농어·귀촌인통계 · 산림청`,
    hero: {
      value: _mtn.households.toLocaleString("ko-KR"),
      label: `${_mtn.year} 귀산촌 가구`,
      sub: `전년 대비 ${signedPct(changePct(_mtn.households, _mtnPrev.households))}`,
      desc: "귀촌 가구 중 산림기본법상 산촌으로 옮긴 가구예요",
    },
    stats: [
      {
        value: signedPct(changePct(_mtn.households, _mtnFirst.households)),
        label: `${mountainData.length}년간 변화`,
        sub: `${_mtnFirst.year} → ${_mtn.year}`,
        desc: `${_mtnFirst.year}년 ${_mtnFirst.households.toLocaleString("ko-KR")}가구에서 ${_mtn.year}년 ${_mtn.households.toLocaleString("ko-KR")}가구가 됐어요`,
      },
      {
        value: `${mountainVillageArea.eupmyeon}곳`,
        label: "산촌 읍·면",
        sub: `${mountainVillageArea.sigungu}개 시·군 · ${mountainVillageArea.year} 기준`,
        desc: "산림기본법상 산촌으로, 귀산촌 통계와 산림청 지원의 기준이에요",
      },
    ],
    chart: {
      title: "산촌으로 떠난 이유",
      surveyLabel: `귀산촌 가구 전입 사유 · ${reasonsYear}`,
      items: mountainReasons,
    },
    /* compare 없음 — 주거비 -65%·PM2.5 -35%·주거 면적 2배+·산림소득 연 500만 원+ 모두 근거를 찾지 못했다(10/3 DE-B).
       귀농·귀촌 실태조사는 귀산촌을 따로 나누지 않고, 임가경제조사(임가 평균)는 귀산촌 가구 값이 아니다. */
  },
  smartfarm: {
    id: "smartfarm",
    label: "스마트팜",
    title: "스마트팜, 얼마나 늘었을까?",
    titleEm: "스마트팜",
    subtitle: `스마트온실 보급 면적이 ${_sfaFirst.year}년보다 ${Math.round(_sfaChg)}% 늘었어요`,
    href: "/stats?tab=smartfarm",
    source: "농림축산식품부 · 국회예산정책처",
    hero: {
      value: `${_sfa.area.toLocaleString("ko-KR")}ha`,
      label: `${_sfa.year} 스마트온실 면적`,
      sub: `${_sfaFirst.year}년 대비 ${signedPct(_sfaChg, 0)}`,
      desc: "정책사업으로 스마트온실 장비·시설을 들인 시설원예 면적(누적)이에요",
    },
    stats: [
      {
        value: `${smartfarmAdoption.pct}%`,
        label: "스마트온실 도입률",
        sub: `${smartfarmAdoption.year} · 온실 5.5만 ha 기준`,
        desc: "전체 온실 면적 중 스마트온실 비중이에요",
      },
      {
        value: `${smartfarmAdoption.targetPct}%`,
        label: `${smartfarmAdoption.targetYear} 목표`,
        sub: "스마트온실 도입률",
        desc: "제1차 스마트농업 육성 기본계획(2025~2029)의 목표예요",
      },
    ],
    chart: {
      title: "주요 재배 작물",
      surveyLabel: "보급 면적 기준 · 2020년 누적",
      items: smartfarmCrops,
    },
    compare: {
      title: "스마트팜 도입 효과",
      items: [
        { label: "생산량", change: signedPct(smartfarmEffect.output), detail: "시설원예 도입 농가 평균" },
        { label: "고품질 생산량", change: signedPct(smartfarmEffect.premiumOutput), detail: "상품성 높은 수확" },
        { label: "농업소득", change: signedPct(smartfarmEffect.income), detail: "도입 전 대비" },
        { label: "자가 노동시간", change: signedPct(smartfarmEffect.labor), detail: "원격·자동 제어" },
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
    headline: "농촌 정착까지,",
    em: "얼마가 들까?",
    desc: "평균 6,219만 원의 초기 비용 중 대부분은 영농 준비에 쓰여요. 정부 융자를 활용하면 부담을 크게 줄일 수 있어요.",
    source: "농림축산식품부 2025 귀농귀촌 실태조사",
    confidence: "official",
    hero: { label: "평균 초기 투자금", desc: "농지·시설·장비·종자 등 영농 시작에 필요한 총비용이에요", value: 6219, format: "integer", unit: "만 원", color: "primary" },
    cards: [
      { label: "영농 준비비 비중", desc: "초기 비용의 대부분이 농지 구입과 시설 투자에 집중돼요", value: 84.6, format: "decimal1", unit: "%", note: "약 5,261만 원", color: "primary" },
      { label: "평균 준비 기간", desc: "탐색부터 정착까지 평균 소요 기간이에요", value: 27.4, format: "decimal1", unit: "개월", color: "amber" },
      { label: "정부 주택자금 융자", desc: "정착자 주거 안정을 위한 정부 지원 한도예요", value: 7500, format: "integer", unit: "만 원", source: "귀농귀촌 정착지원사업", color: "muted" },
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
    hero: { label: "임차 시작 기준 정착 비용", desc: "농업 없이 농촌에 정착할 때 필요한 주거·생활 비용이에요", value: 2800, format: "integer", unit: "만 원", color: "primary" },
    cards: [
      { label: "주거비 비중", desc: "귀촌 비용의 대부분이 주택 임차나 구입에 집중돼요", value: 85, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "주거지 탐색과 이주 준비에 걸리는 기간이에요", value: 14, format: "decimal1", unit: "개월", color: "amber" },
      { label: "주택구입 융자", desc: "귀촌인 주거 안정을 위한 정부 융자 한도예요", value: 7500, format: "integer", unit: "만 원", source: "귀농귀촌 정착지원사업", color: "muted" },
      { label: "지자체 정착 지원금", desc: "시·군별로 귀촌인에게 정착금을 지급해요", value: 1000, format: "integer", unit: "만 원", source: "지자체별 300~2,000만 원", color: "primary" },
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
    /* 10/3 정정(DE-B): 'compare'(도시 vs 농촌) 제외 — 남은 월 생활비 행은 귀농 가구 값이라 귀촌에 맞지 않고,
       나머지 행(주거비·주거 형태·생활 만족도)은 근거가 없어 cityVsRural 에서 지웠다 */
    visibleSections: ["strategy"],
  },
  youth: {
    id: "youth",
    label: "청년농",
    headline: "청년농 창업,",
    em: "얼마면 시작할까?",
    desc: "30대 이하 정착자의 평균 투자금은 8,209만 원이에요. 영농정착지원금과 창업자금을 합치면 실질 부담을 크게 줄일 수 있어요.",
    source: "농림축산식품부 2025 실태조사 + 청년창업농 시행지침",
    confidence: "estimated",
    confidenceNote: "실태조사 30대 이하 수치를 활용한 추정이에요",
    hero: { label: "30대 이하 평균 투자금", desc: "청년 정착자의 평균 초기 투자 비용이에요", value: 8209, format: "integer", unit: "만 원", color: "primary" },
    cards: [
      { label: "영농 준비비 비중", desc: "농지·시설·장비 투자가 전체의 대부분을 차지해요", value: 80, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "교육과 현장 실습을 거쳐 창업하는 기간이에요", value: 21, format: "decimal1", unit: "개월", color: "amber" },
      { label: "영농정착지원금", desc: "만 18~39세 창업농에게 월 110·100·90만 원을 3년 지급해요 (매년 감액)", value: 3600, format: "integer", unit: "만 원", source: "보조금 · 농림축산식품부", color: "primary" },
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
        /* 10/3 정정(DE-B): "농지임차 지원 연 최대 300만 원·임차료 50~80%"는 전국 제도가 아니라 일부 지자체 사업
           (예: 충남 금산군 2026 — 최대 70%·연 300만 원) 조건이라 지우고, 만 18~39세 국비 무료 교육(SP-012 원문)으로 */
        { label: "청년창업보육센터", value: "교육비 무료", sub: "실습비 월 최대 70만 원" },
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
    hero: { label: "평균 창업 비용 (추정)", desc: "임야·시설·종묘 등 귀산촌 창업에 필요한 예상 비용이에요", value: 5000, format: "integer", unit: "만 원", color: "primary" },
    cards: [
      { label: "시설 투자비 비중", desc: "차광망·재배사 등 임산물 시설에 투자가 집중돼요", value: 60, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "교육이수와 임야 확보에 귀농보다 시간이 더 걸려요", value: 30, format: "decimal1", unit: "개월", color: "amber" },
      { label: "산림청 창업자금", desc: "임산물 생산·임야 매입·시설 투자 융자 한도예요", value: 3, format: "plain", unit: "억원", source: "산림청 귀산촌 지원사업", color: "muted" },
      { label: "정착지원(주택)", desc: "귀산촌 정착에 필요한 주택 구입·신축 지원이에요", value: 7500, format: "integer", unit: "만 원", source: "산림청 귀산촌 지원사업", color: "primary" },
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
    /* 10/3 정정(DE-B): 'compare' 제외 — 귀산촌 비교 행(주거비·미세먼지·주거 형태·생활 만족도·산림소득)이 모두 근거가 없었다 */
    visibleSections: ["strategy"],
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
    hero: { label: "비닐하우스 ICT 기준", desc: "1,000㎡ 비닐하우스에 ICT 기초 장비를 갖추는 비용이에요", value: 4000, format: "integer", unit: "만 원", color: "primary" },
    cards: [
      { label: "ICT·시설 비중", desc: "하우스 구조물과 환경 제어 장비에 비용이 집중돼요", value: 85, format: "decimal1", unit: "%", color: "primary" },
      { label: "평균 준비 기간", desc: "혁신밸리 교육 포함, 창업까지 걸리는 기간이에요", value: 12, format: "decimal1", unit: "개월", color: "amber" },
      /* 10/3 정정: 출처가 농진청이 아니라 농식품부 ICT 융복합 확산사업. 보조율은 해마다·세부 사업마다 달라 2026 계획값을 연도와 함께 적는다 */
      { label: "ICT 융복합 보조", desc: "온실 ICT 장비·신축 사업비의 국비 25%·지방비 30%를 보조받아요(지자체 공모)", value: 55, format: "plain", unit: "%", source: "농림축산식품부 2026 스마트농업 육성 시행계획", color: "primary" },
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
        { label: "ICT 융복합 보조", value: "국비 25%·지방비 30%", sub: "2026 계획 · 지자체 공모" },
        { label: "혁신밸리 임대형", value: "보증금 1,000만~3,000만", sub: "청년 창업 지원" },
      ],
    },
    /* 10/3 정정(DE-B): 'compare' 제외 — 스마트팜 비교 행(주거비·5년차 소득의 도시 값·시설농 매출·생활 만족도)이 모두 근거가 없었다 */
    visibleSections: ["crop", "strategy", "simulator"],
  },
};

/* ── 정착 비용 데이터 (출처: 2025 귀농귀촌 실태조사) ── */

export interface CostByAge {
  age: string;
  amount: string;
  raw: number; // 만원 단위 — 차트 비율 계산용
}

export const costByAge: CostByAge[] = [
  { age: "30대 이하", amount: "8,209만 원", raw: 8209 },
  { age: "40대", amount: "9,547만 원", raw: 9547 },
  { age: "50대", amount: "6,485만 원", raw: 6485 },
  { age: "60대", amount: "5,512만 원", raw: 5512 },
];

/* ── 준비 단계별 비용 집중도 (로드맵 연계) ── */

/* ── 도시 vs 농촌 비교 데이터 ── */

export interface CompareRow {
  label: string;
  city: string;
  rural: string;
  change: string;
  /** 변화 방향의 의미: positive=농촌 유리, caution=아직 불리하나 개선 추세, neutral=중립 */
  sentiment: "positive" | "caution" | "neutral";
}

/* /costs 비교 카드(COMPARE_LABELS_BY_TYPE 로 라벨 필터). 10/3 정정(DE-B): 공식 근거가 있는 행만 남긴다.
   지운 행 — 주거비 3.3㎡당 1,800만 → 350만 원·주거 형태 58㎡ → 130㎡·출퇴근 58분 → 차로 10분·미세먼지 24 → 17㎍/㎥·
   5년차 소득의 도시 3,800만 원·생활 만족도 52% → 70%(10/3 정정 이력에서 이미 근거 없음 판정)·산림소득·시설농 매출(1,000㎡ 1.5억~2억 원).
   월 생활비는 실태조사 값에서 계산한다 — 239 → 173만 원은 -25.1%가 아니라 -27.6%였다.
   이 행은 귀농 가구 값이라 귀촌·귀산촌·스마트팜 비용 화면은 비교 섹션을 끈다(COST_TYPE_PROFILES.visibleSections). */
export const cityVsRural: CompareRow[] = [
  {
    label: "월 생활비",
    city: `${settlementSurvey.livingCostBefore}만 원`,
    rural: `${settlementSurvey.livingCostAfter}만 원`,
    change: signedPct(settlementSurvey.livingCostChange),
    sentiment: "positive",
  },
];

/* ── 정착 인터뷰 카드 (공개 보도 기반, 실명) ── */

interface CropLink {
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
    story: "KCC중앙연구소에서 자동차 페인트 색상을 개발하던 연구원이었어요. 2021년 정착 후 충주시농업기술센터에서 6개월간 교육을 받고, 1,490㎡ 규모의 딸기 스마트팜을 운영하고 있어요.",
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
    quote: "너무 큰 환상, 너무 큰 꿈을 갖고 농촌 정착하면 안 돼요.",
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

/* ── 자주 묻는 질문 (FAQ) ── */

// ─── 인터뷰 정렬 (5/25 회장 결재) ──────────────────────────────────────────

/**
 * 정렬 키:
 *  recent: sourceDate desc — 최신 인터뷰 우선 (default)
 *  name:   이름 가나다순
 */
export type InterviewSortKey = "recent" | "name";

export const INTERVIEW_SORT_OPTIONS: readonly {
  value: InterviewSortKey;
  label: string;
}[] = [
  { value: "recent", label: "최신순" },
  { value: "name", label: "가나다순" },
];

export const DEFAULT_INTERVIEW_SORT: InterviewSortKey = "recent";

const KO_COLLATOR_INTERVIEW = new Intl.Collator("ko-KR");

export function sortInterviews(
  list: InterviewCard[],
  sort: InterviewSortKey,
): InterviewCard[] {
  if (sort === "name") {
    const indexed = list.map((p, i) => ({ p, i }));
    indexed.sort((a, b) => {
      const cmp = KO_COLLATOR_INTERVIEW.compare(a.p.name, b.p.name);
      if (cmp !== 0) return cmp;
      return a.i - b.i;
    });
    return indexed.map((x) => x.p);
  }
  // recent (default) — sourceDate desc
  const indexed = list.map((p, i) => ({ p, i }));
  indexed.sort((a, b) => {
    const ad = a.p.sourceDate ?? "";
    const bd = b.p.sourceDate ?? "";
    if (ad === bd) return a.i - b.i;
    if (!ad) return 1;
    if (!bd) return -1;
    return bd.localeCompare(ad);
  });
  return indexed.map((x) => x.p);
}
