/* ────────────────────────────────────────────
   랜딩페이지 데이터
   page.tsx 에서 분리 — Tailwind 의존 없음
   ──────────────────────────────────────────── */

export type ColorKey = "brand" | "blue" | "green" | "amber" | "red";

/* ── 질문형 네비게이션 ── */

export interface QuestionItem {
  iconKey: "mapPin" | "fileText" | "sprout";
  colorKey: ColorKey;
  question: string;
  sub: string;
  href: string;
}

export const questions: QuestionItem[] = [
  {
    iconKey: "mapPin",
    colorKey: "brand",
    question: "어디에서 시작해야 할지 모르겠어요",
    sub: "기후, 인프라, 인구 데이터로 19개 지역을 비교해보세요.",
    href: "/regions",
  },
  {
    iconKey: "fileText",
    colorKey: "blue",
    question: "어떤 지원을 받을 수 있는지 궁금해요",
    sub: "나이, 지역, 작물 조건으로 맞춤 지원사업을 찾아보세요.",
    href: "/programs",
  },
  {
    iconKey: "sprout",
    colorKey: "green",
    question: "어떤 작물이 나에게 맞을까요?",
    sub: "17종 작물의 재배 환경, 수익성, 난이도를 확인하세요.",
    href: "/crops",
  },
];

/* ── 서비스 카드 (Feature) ── */

export interface FeatureItem {
  iconKey: "mapPin" | "fileText" | "sprout";
  title: string;
  description: string;
  href: string;
  badge: string;
  highlight: string;
}

export const features: FeatureItem[] = [
  {
    iconKey: "mapPin",
    title: "지역 비교",
    description:
      "기후, 인프라, 인구 데이터로 나에게 맞는 귀농 지역을 비교하세요.",
    href: "/regions",
    badge: "19개 관측소",
    highlight: "기상청 ASOS 실시간",
  },
  {
    iconKey: "fileText",
    title: "지원사업 검색",
    description:
      "나이, 지역, 희망 작물 조건으로 받을 수 있는 지원사업을 찾아보세요.",
    href: "/programs",
    badge: "18건 등록",
    highlight: "현재 8건 모집중",
  },
  {
    iconKey: "sprout",
    title: "작물 정보",
    description:
      "주요 작물의 재배 환경, 수익성, 난이도를 한눈에 확인하세요.",
    href: "/crops",
    badge: "17종",
    highlight: "4개 카테고리",
  },
];

/* ── 통계 숫자 ── */

export interface StatItem {
  iconKey: "thermometer" | "sprout" | "fileText" | "wifi";
  colorKey: ColorKey;
  value: string;
  suffix: string;
  label: string;
  sub: string;
}

export const stats: StatItem[] = [
  {
    iconKey: "thermometer",
    colorKey: "amber",
    value: "19",
    suffix: "개",
    label: "기후 관측소",
    sub: "기상청 ASOS 지점",
  },
  {
    iconKey: "sprout",
    colorKey: "green",
    value: "17",
    suffix: "종",
    label: "재배 작물",
    sub: "식량·채소·과수·특용",
  },
  {
    iconKey: "fileText",
    colorKey: "blue",
    value: "18",
    suffix: "건",
    label: "지원사업",
    sub: "보조금·융자·교육·현물",
  },
  {
    iconKey: "wifi",
    colorKey: "brand",
    value: "5",
    suffix: "개",
    label: "공공 API",
    sub: "실시간 연동",
  },
];

/* ── 데이터 출처 ── */

export interface DataSourceItem {
  iconKey: "cloudSun" | "barChart" | "trendingUp" | "hospital" | "graduationCap";
  colorKey: ColorKey;
  tagLabel: string;
  name: string;
  code: string;
  description: string;
}

export const dataSources: DataSourceItem[] = [
  {
    iconKey: "cloudSun",
    colorKey: "amber",
    tagLabel: "기후",
    name: "기상청",
    code: "KMA",
    description: "ASOS 종관기상 관측 데이터",
  },
  {
    iconKey: "barChart",
    colorKey: "blue",
    tagLabel: "인구·통계",
    name: "통계청 SGIS",
    code: "SGIS",
    description: "지역별 인구·고령화 데이터",
  },
  {
    iconKey: "trendingUp",
    colorKey: "green",
    tagLabel: "농업 통계",
    name: "통계청 KOSIS",
    code: "KOSIS",
    description: "농업 생산량·재배면적 통계",
  },
  {
    iconKey: "hospital",
    colorKey: "red",
    tagLabel: "의료",
    name: "심평원",
    code: "HIRA",
    description: "지역별 의료기관 분포",
  },
  {
    iconKey: "graduationCap",
    colorKey: "brand",
    tagLabel: "교육",
    name: "교육부",
    code: "NEIS",
    description: "지역별 학교 수 데이터",
  },
];

/* ── 히어로 대시보드 Mock 데이터 ── */

export const mockBarData = [
  { name: "순천", value: 85 },
  { name: "영주", value: 68 },
  { name: "제주", value: 78 },
  { name: "정선", value: 52 },
];

export const mockCropChips = ["매실", "고추", "블루베리"];
