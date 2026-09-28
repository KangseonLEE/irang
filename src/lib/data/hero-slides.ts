/**
 * 히어로 슬라이드 정의 (2026-09-28 시안 — 데스크탑 1024+ 전용).
 *
 * - `"use client"` 모듈이 아니라 별도 .ts 로 둔다: 클라이언트 모듈에서 상수를 export 하면
 *   서버 컴포넌트가 import 할 때 조용히 프록시가 온다 (9/17 sidebar-tabs 사고).
 * - 이미지는 `public/landing/hero/hero-{n}.webp`. 파일이 없으면 슬라이더가 onError 로
 *   레이어를 접고 브랜드 그린 그라데이션(플레이스홀더)만 남긴다.
 * - 카피 톤: `.claude/rules/copywriting.md` (~예요/세요).
 */

export interface HeroSlide {
  /** GA 라벨·key */
  id: string;
  image: string;
  /** 슬라이드 주제 (작은 말머리) */
  eyebrow: string;
  /** 한 줄 설명 */
  caption: string;
  ctaLabel: string;
  href: string;
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "compare",
    image: "/landing/hero/hero-1.webp",
    eyebrow: "지역 비교",
    caption: "시·군·구를 나란히 놓고 비교해 보세요",
    ctaLabel: "지역 비교 보기",
    href: "/regions/compare",
  },
  {
    id: "programs",
    image: "/landing/hero/hero-2.webp",
    eyebrow: "지원사업",
    caption: "지금 신청할 수 있는 사업만 모았어요",
    ctaLabel: "지원사업 보기",
    href: "/programs",
  },
  {
    id: "crops",
    image: "/landing/hero/hero-3.webp",
    eyebrow: "작물 정보",
    caption: "소득과 재배 난이도를 함께 확인하세요",
    ctaLabel: "작물 정보 보기",
    href: "/crops",
  },
  {
    id: "assess",
    image: "/landing/hero/hero-4.webp",
    eyebrow: "적합도 진단",
    caption: "3분이면 나에게 맞는 지역이 보여요",
    ctaLabel: "무료 진단하기",
    href: "/match?mode=assess",
  },
] as const;

/** 자동 전환 간격 (ms) */
export const HERO_SLIDE_INTERVAL_MS = 6000;
