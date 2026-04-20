/**
 * 맞춤 추천 위저드 — 질문 정의 + 귀농 유형 분류
 *
 * match-wizard.tsx에서 분리한 순수 데이터 모듈.
 * UI 의존성 없이 질문 구조와 귀농 유형(FarmType)만 정의합니다.
 */

import {
  Sun,
  Snowflake,
  CloudSun,
  Building2,
  Trees,
  Truck,
  Heart,
  ShoppingBag,
  Leaf,
  Apple,
  Wheat,
  Flower2,
  Home,
  Users,
  Mountain,
  Tractor,
  Laptop,
  TreePine,
  Cpu,
  Briefcase,
  Tent,
  Warehouse,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";

/* ── 질문 인터페이스 ── */

export interface Option {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description?: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: Option[];
  multiple?: boolean; // 복수 선택 허용
}

/* ── 질문 데이터 ── */

export const QUESTIONS: Question[] = [
  {
    id: "climate",
    title: "어떤 기후를 선호하시나요?",
    subtitle: "귀농 후 생활할 지역의 기후 조건",
    options: [
      {
        id: "warm",
        label: "온화한 기후",
        icon: Sun,
        description: "겨울이 짧고 따뜻한 남해안·제주 지역",
      },
      {
        id: "four-season",
        label: "사계절 뚜렷",
        icon: CloudSun,
        description: "봄·여름·가을·겨울이 확실한 중부 지역",
      },
      {
        id: "cool",
        label: "서늘한 기후",
        icon: Snowflake,
        description: "여름이 시원하고 겨울이 긴 산간·고랭지",
      },
    ],
  },
  {
    id: "priority",
    title: "가장 중요하게 생각하는 것은?",
    subtitle: "우선순위에 따라 추천 지역이 달라집니다",
    multiple: true,
    options: [
      {
        id: "nature",
        label: "자연환경",
        icon: Trees,
        description: "깨끗한 공기와 아름다운 자연",
      },
      {
        id: "access",
        label: "교통 접근성",
        icon: Truck,
        description: "도시와의 거리, 교통 편리성",
      },
      {
        id: "support",
        label: "지원 혜택",
        icon: Heart,
        description: "귀농 보조금, 주택·교육 지원",
      },
      {
        id: "market",
        label: "소비 시장",
        icon: ShoppingBag,
        description: "농산물 판로와 직거래 기회",
      },
    ],
  },
  {
    id: "crop-type",
    title: "관심 있는 작물 유형은?",
    subtitle: "재배하고 싶은 작물 카테고리를 골라주세요",
    multiple: true,
    options: [
      {
        id: "grain",
        label: "식량작물",
        icon: Wheat,
        description: "쌀, 콩, 감자 등 기본 식량",
      },
      {
        id: "vegetable",
        label: "채소",
        icon: Leaf,
        description: "고추, 마늘, 배추, 양파 등",
      },
      {
        id: "fruit",
        label: "과수",
        icon: Apple,
        description: "사과, 딸기, 포도, 감귤 등",
      },
      {
        id: "special",
        label: "특용작물",
        icon: Flower2,
        description: "인삼, 약용작물, 녹차 등",
      },
    ],
  },
  {
    id: "lifestyle",
    title: "선호하는 생활 환경은?",
    subtitle: "귀농 후의 일상을 떠올려 보세요",
    options: [
      {
        id: "near-city",
        label: "도시 근교",
        icon: Building2,
        description: "도시 인프라를 유지하며 주말 농업",
      },
      {
        id: "moderate",
        label: "적당한 거리",
        icon: Home,
        description: "읍·면 단위, 생활 인프라 기본 보유",
      },
      {
        id: "rural",
        label: "완전한 농촌",
        icon: Mountain,
        description: "인구 밀도 낮은 조용한 산촌·어촌",
      },
    ],
  },
  {
    id: "experience",
    title: "농업 경험이 있으신가요?",
    subtitle: "경험 수준에 따라 적합한 작물 난이도가 달라집니다",
    options: [
      {
        id: "none",
        label: "경험 없음",
        icon: Users,
        description: "농업은 처음이에요",
      },
      {
        id: "some",
        label: "조금 있음",
        icon: Sprout,
        description: "텃밭·주말농장 경험이 있어요",
      },
      {
        id: "experienced",
        label: "경험 많음",
        icon: Trees,
        description: "본격적인 영농 경험이 있어요",
      },
    ],
  },
  {
    id: "income-goal",
    title: "귀농 후 주된 소득원은 무엇이면 좋겠어요?",
    subtitle: "소득 계획에 따라 추천 트랙이 달라집니다",
    options: [
      {
        id: "farming",
        label: "직접 농사",
        icon: Tractor,
        description: "농산물 재배·판매가 주 수입원",
      },
      {
        id: "remote-work",
        label: "기존 직업 유지",
        icon: Laptop,
        description: "원격근무·프리랜서로 소득 유지",
      },
      {
        id: "forestry",
        label: "임산물·산림 활동",
        icon: TreePine,
        description: "산나물, 약초, 산림 체험 등",
      },
      {
        id: "smart-agri",
        label: "스마트 농업",
        icon: Cpu,
        description: "ICT 기반 시설원예·첨단 농업",
      },
    ],
  },
  {
    id: "settlement-type",
    title: "가장 끌리는 정착 환경은?",
    subtitle: "정착 유형에 따라 맞춤 지원사업이 달라져요",
    options: [
      {
        id: "farmland",
        label: "넓은 농경지",
        icon: Wheat,
        description: "논밭에서 본격적으로 농사짓기",
      },
      {
        id: "town",
        label: "읍·면 소도시",
        icon: Briefcase,
        description: "생활 편의시설 갖춘 농촌 마을",
      },
      {
        id: "mountain",
        label: "산간 마을",
        icon: Tent,
        description: "숲과 산이 가까운 조용한 산촌",
      },
      {
        id: "smart-complex",
        label: "스마트팜 단지",
        icon: Warehouse,
        description: "첨단 농업시설이 집적된 단지",
      },
    ],
  },
];

/* ── 귀농 유형 분류 ── */

export type FarmTypeId =
  | "guinong"
  | "guichon"
  | "guisanchon"
  | "smartfarm"
  | "cheongnyeon";

export interface FarmType {
  id: FarmTypeId;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  traits: string[];
  /** 추천 지원사업 ID 목록 (우선순위순) */
  programIds: string[];
}

export const FARM_TYPES: FarmType[] = [
  {
    id: "guinong",
    label: "귀농형",
    emoji: "🌾",
    tagline: "농업을 본업으로, 새 삶을 시작하는 당신",
    description:
      "도시를 떠나 농촌에 정착하여 직접 농사를 짓고, 농산물 판매를 주된 소득으로 삼는 전통적인 귀농 경로예요. 농지 확보, 작물 선정, 영농 기술 습득이 핵심이며, 정부의 귀농 정착 지원금과 농지 임대 사업을 적극 활용할 수 있어요.",
    traits: ["전업 농업", "농산물 판매", "농지 기반"],
    programIds: ["SP-001", "SP-003", "SP-005", "SP-011", "SP-014"],
  },
  {
    id: "guichon",
    label: "귀촌형",
    emoji: "🏡",
    tagline: "농촌에서 살며 나만의 일을 이어가는 당신",
    description:
      "농촌 지역으로 이주하되 기존 직업(원격근무·프리랜서)을 유지하거나 농업 외 활동으로 생계를 꾸리는 유형이에요. 전원생활의 여유를 누리면서도 도시 소득을 유지할 수 있어, 초기 정착 부담이 상대적으로 적어요.",
    traits: ["농촌 거주", "기존 직업 유지", "전원생활"],
    programIds: ["SP-009", "SP-010", "SP-011", "SP-008", "SP-014"],
  },
  {
    id: "guisanchon",
    label: "귀산촌형",
    emoji: "🏔️",
    tagline: "산과 숲에서 새로운 가치를 찾는 당신",
    description:
      "산간 지역으로 이주하여 임산물 채취, 산림 체험 관광, 약초 재배 등 산림 자원을 활용한 생활을 꿈꾸는 유형이에요. 산촌 특화 지원사업과 산림청 프로그램을 통해 정착 비용을 줄일 수 있어요.",
    traits: ["산촌 정착", "임산물·산림", "자연 밀착"],
    programIds: ["SP-005", "SP-010", "SP-009", "SP-011", "SP-014"],
  },
  {
    id: "smartfarm",
    label: "스마트팜형",
    emoji: "📊",
    tagline: "기술로 농업의 미래를 열어가는 당신",
    description:
      "ICT 기술과 데이터를 활용한 스마트 농업에 관심이 많은 유형이에요. 스마트팜 청년창업 보육센터, 혁신밸리 임대형 스마트팜 등 정부 인프라를 활용해 초기 시설 투자 부담을 크게 줄일 수 있어요.",
    traits: ["ICT 기반", "시설원예", "데이터 농업"],
    programIds: ["SP-012", "SP-003", "SP-004", "SP-002", "SP-011"],
  },
  {
    id: "cheongnyeon",
    label: "청년농형",
    emoji: "🚀",
    tagline: "청년의 에너지로 농업에 도전하는 당신",
    description:
      "만 39세 이하 청년이 농업을 창업으로 접근하는 유형이에요. 청년 귀농 정착지원금(월 최대 110만 원, 최장 3년), 청년 창업농 영농정착 지원, 스마트팜 청년창업 보육 등 청년 전용 지원사업이 풍부해요.",
    traits: ["청년 전용 지원", "창업 마인드", "빠른 정착"],
    programIds: ["SP-012", "SP-002", "SP-003", "SP-001", "SP-004"],
  },
];

/* ── 구 ID → 신 ID 마이그레이션 매핑 (하위 호환) ── */

const LEGACY_ID_MAP: Record<string, FarmTypeId> = {
  weekend: "guichon",
  "rural-life": "guinong",
  "young-entrepreneur": "cheongnyeon",
  // "smartfarm"은 동일하므로 매핑 불필요
};

/** 구 FarmTypeId를 신 FarmTypeId로 변환. 이미 신 ID면 그대로 반환. */
export function migrateFarmTypeId(id: string): FarmTypeId {
  if (FARM_TYPES.some((t) => t.id === id)) return id as FarmTypeId;
  return LEGACY_ID_MAP[id] ?? "guinong";
}

/** 국가지원 트랙 분류용 질문 2개 (assessment-wizard에서도 재사용) */
export const TRACK_QUESTIONS = QUESTIONS.filter(
  (q) => q.id === "income-goal" || q.id === "settlement-type",
);

/* ── 공통 타입 ── */

export type Answers = Record<string, string[]>;

/** 유효한 옵션 ID인지 확인 */
export function isValidOptionId(questionId: string, optionId: string): boolean {
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q ? q.options.some((o) => o.id === optionId) : false;
}
