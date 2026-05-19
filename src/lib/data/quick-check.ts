/**
 * 빠른 점검 (Quick Check) — 4문항 자기 점검 모듈
 *
 * Phase 2c (2026-05-15): /match?mode=quick 신규 진입점.
 *
 * 설계 원칙
 *   - 4문항, 단일 선택, 자동 진행 (약 1분)
 *   - 답변 → 페르소나 5종 중 1개 매핑 (PERSONAS 시스템 재사용)
 *   - 결과 화면: 페르소나 카드 1개 + 추천 3장(지역 ranking · 작물 · programs)
 *   - "더 자세히" CTA → /match?mode=assess (14문항 전환)
 *
 * 페르소나 매핑 로직 (computePersona):
 *   - 농업 의향(farming)이 가장 강한 신호
 *     - "main" → farmYouth (자본·연령 무관, 본업 의지 우선)
 *     - "none" → commuter
 *   - 그 외:
 *     - 자녀 동반(family=children) → family
 *     - 60+ 연령 → elderRural
 *     - 기본값 → balanced
 *
 * 인프라
 *   - QuickAnswers는 4문항 ID-값 매핑
 *   - mapToPersona() 순수 함수 (UI 의존성 없음 → 테스트 용이)
 */

import {
  Tractor,
  Wallet,
  User,
  Heart,
  Baby,
  Briefcase,
  Sprout,
  Leaf,
  Coins,
  PiggyBank,
} from "lucide-react";

import type { PersonaId } from "@/lib/data/personas";

/* ── 질문 인터페이스 (match-questions 호환) ── */

export interface QuickOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description?: string;
}

export interface QuickQuestion {
  id: keyof QuickAnswers;
  title: string;
  subtitle: string;
  options: QuickOption[];
}

/* ── 답변 형식 ── */

export interface QuickAnswers {
  ageGroup?: "youth" | "30s" | "40s" | "50s" | "60plus";
  family?: "alone" | "couple" | "children";
  farming?: "main" | "side" | "none";
  capital?: "low" | "mid" | "high";
}

/* ── 질문 데이터 ── */

export const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: "ageGroup",
    title: "연령대를 알려주세요",
    subtitle: "연령에 따라 어울리는 귀농 방향이 달라요",
    options: [
      { id: "youth", label: "20대~34세", icon: Sprout, description: "청년 영농 지원 대상" },
      { id: "30s", label: "35~39세", icon: Leaf },
      { id: "40s", label: "40대", icon: User },
      { id: "50s", label: "50대", icon: User },
      { id: "60plus", label: "60대 이상", icon: User, description: "은퇴 후 귀촌" },
    ],
  },
  {
    id: "family",
    title: "함께 가는 사람이 있나요?",
    subtitle: "정착 지역 선택의 우선순위가 달라져요",
    options: [
      { id: "alone", label: "혼자", icon: User, description: "1인 가구" },
      { id: "couple", label: "부부", icon: Heart, description: "자녀 없음 또는 독립" },
      { id: "children", label: "자녀 동반", icon: Baby, description: "어린 자녀와 함께" },
    ],
  },
  {
    id: "farming",
    title: "농업 비중은 어느 정도일까요?",
    subtitle: "귀농이냐 귀촌이냐의 갈림길이에요",
    options: [
      { id: "main", label: "본업으로", icon: Tractor, description: "전업 농업·소득의 주요 원천" },
      { id: "side", label: "부업·취미", icon: Sprout, description: "주말농장·자급자족" },
      { id: "none", label: "안 함", icon: Briefcase, description: "도시 통근 또는 비농업" },
    ],
  },
  {
    id: "capital",
    title: "준비된 자본 규모는?",
    subtitle: "정착·창업 비용 계획에 참고해요",
    options: [
      { id: "low", label: "1억 미만", icon: Wallet, description: "임차·소규모 시작" },
      { id: "mid", label: "1~3억", icon: Coins, description: "토지 매입·시설 일부" },
      { id: "high", label: "3억 이상", icon: PiggyBank, description: "시설 농업·창업" },
    ],
  },
];

/* ── 페르소나 매핑 ── */

/**
 * 4문항 답변 → 페르소나 5종 중 1개 매핑
 *
 * 우선순위 (위에서 아래로):
 *   1. farming="main" → farmYouth (본업 의지가 가장 강한 신호)
 *   2. farming="none" → commuter (농업 안 함이 명확한 분리)
 *   3. family="children" → family (자녀 양육 우선)
 *   4. ageGroup="60plus" → elderRural (은퇴 귀촌)
 *   5. 기본값 → balanced
 *
 * 매핑 우선순위 근거:
 *   - 농업 의향이 가장 강한 라이프스타일 분기점
 *   - 자녀 동반은 지역 선택 시 학교·의료 가중치 결정적
 *   - 연령은 농업·자녀가 명확하지 않을 때만 분류 기준
 */
export function mapToPersona(answers: QuickAnswers): PersonaId {
  if (answers.farming === "main") return "farmYouth";
  if (answers.farming === "none") return "commuter";
  if (answers.family === "children") return "family";
  if (answers.ageGroup === "60plus") return "elderRural";
  return "balanced";
}

/* ── 추천 deep link 생성 ── */

export interface QuickRecommendation {
  persona: PersonaId;
  rankingUrl: string; // /regions/ranking?persona=...
  cropsUrl: string;   // /crops?persona=...
  programsUrl: string; // /programs?persona=...
}

/**
 * 페르소나 → 3개 추천 deep link 생성
 *
 * 5/13 Phase 6 A안 완료된 persona deep link 시스템 재사용:
 *   - /regions/ranking?persona=family
 *   - /crops?persona=family
 *   - /programs?persona=family
 */
export function buildRecommendations(persona: PersonaId): QuickRecommendation {
  return {
    persona,
    rankingUrl: `/regions/ranking?persona=${persona}`,
    cropsUrl: `/crops?persona=${persona}`,
    programsUrl: `/programs?persona=${persona}`,
  };
}

/* ── 결과 메시지 ── */

export interface QuickResultMessage {
  /** 결과 카드 상단 라벨 */
  eyebrow: string;
  /** 한 줄 요약 */
  title: string;
  /** 한 문단 안내 */
  description: string;
}

const PERSONA_RESULT_MESSAGES: Record<PersonaId, QuickResultMessage> = {
  farmYouth: {
    eyebrow: "추천 방향",
    title: "농업을 본업으로 시작하는 길이 잘 맞아요",
    description:
      "농가 활동과 청년 농촌 정착 지원이 풍부한 지역, 본업으로 도전할 만한 작물, 청년 창업 지원 사업을 우선 보여드릴게요.",
  },
  family: {
    eyebrow: "추천 방향",
    title: "자녀와 함께 정착하는 가족 귀농이에요",
    description:
      "학교·의료 인프라가 좋은 지역, 가족 농장으로 키우기 좋은 작물, 가족 단위 지원 사업을 우선 보여드릴게요.",
  },
  elderRural: {
    eyebrow: "추천 방향",
    title: "은퇴 후 한적한 귀촌이 잘 어울려요",
    description:
      "의료 인프라가 안정적이고 인구가 받쳐주는 지역, 텃밭·소규모 농원으로 즐길 작물, 시니어 지원 사업을 우선 보여드릴게요.",
  },
  commuter: {
    eyebrow: "추천 방향",
    title: "도시 통근하며 시골 거주가 잘 맞아요",
    description:
      "도시 접근성과 의료가 받쳐주는 지역, 부담 적은 작물, 정주 지원 사업을 우선 보여드릴게요.",
  },
  balanced: {
    eyebrow: "추천 방향",
    title: "5가지 차원을 균등하게 보는 게 좋아요",
    description:
      "특정 방향에 치우치지 않는 지역, 무난한 작물, 일반 지원 사업을 보여드릴게요. 더 정교한 추천을 원하시면 14문항 적합도 진단을 추천해요.",
  },
};

export function getResultMessage(persona: PersonaId): QuickResultMessage {
  return PERSONA_RESULT_MESSAGES[persona];
}
