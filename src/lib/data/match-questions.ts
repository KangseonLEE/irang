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
];

/* ── 귀농 유형 분류 ── */

export type FarmTypeId =
  | "weekend"
  | "smartfarm"
  | "rural-life"
  | "young-entrepreneur";

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
    id: "weekend",
    label: "주말농부형",
    emoji: "🌱",
    tagline: "도시와 농촌의 균형을 찾는 당신",
    description:
      "평일에는 도시 생활을 유지하면서 주말에 텃밭이나 소규모 농장을 운영하는 스타일이에요. 도시 근교에서 시작하기에 적합하며, 초기 부담이 적습니다.",
    traits: ["도시 근교 선호", "초보 친화", "소규모 시작"],
    programIds: ["SP-001", "SP-011", "SP-014", "SP-008"],
  },
  {
    id: "smartfarm",
    label: "스마트팜형",
    emoji: "📊",
    tagline: "기술로 농업의 미래를 열어가는 당신",
    description:
      "ICT 기술과 데이터를 활용한 스마트 농업에 관심이 많은 스타일이에요. 생산성과 시장성을 중시하며, 체계적인 농업 경영을 지향합니다.",
    traits: ["기술 기반", "시장 지향", "효율 중시"],
    programIds: ["SP-012", "SP-003", "SP-004", "SP-002", "SP-011"],
  },
  {
    id: "rural-life",
    label: "전원생활형",
    emoji: "🏡",
    tagline: "자연 속에서 새로운 삶을 꿈꾸는 당신",
    description:
      "맑은 공기와 여유로운 환경에서 자급자족하며 살고 싶은 스타일이에요. 농촌 공동체에 자연스럽게 녹아들어 풍요로운 전원생활을 즐길 수 있습니다.",
    traits: ["자연환경 중시", "자급자족", "공동체 생활"],
    programIds: ["SP-005", "SP-009", "SP-010", "SP-011"],
  },
  {
    id: "young-entrepreneur",
    label: "청년창농형",
    emoji: "🚀",
    tagline: "농업으로 새로운 가치를 창출하는 당신",
    description:
      "농업을 하나의 사업으로 바라보고, 적극적으로 경영 역량을 키워가는 스타일이에요. 정부 지원사업과 교육을 적극 활용하여 빠르게 정착할 수 있습니다.",
    traits: ["사업 마인드", "적극적 성장", "지원사업 활용"],
    programIds: ["SP-012", "SP-002", "SP-003", "SP-001", "SP-011"],
  },
];

/* ── 공통 타입 ── */

export type Answers = Record<string, string[]>;

/** 유효한 옵션 ID인지 확인 */
export function isValidOptionId(questionId: string, optionId: string): boolean {
  const q = QUESTIONS.find((q) => q.id === questionId);
  return q ? q.options.some((o) => o.id === optionId) : false;
}
