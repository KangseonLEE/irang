/**
 * 히어로 슬라이드 정의 (2026-09-28 시안 — 데스크탑 1024+ 전용).
 *
 * - `"use client"` 모듈이 아니라 별도 .ts 로 둔다: 클라이언트 모듈에서 상수를 export 하면
 *   서버 컴포넌트가 import 할 때 조용히 프록시가 온다 (9/17 sidebar-tabs 사고).
 * - 이미지는 `public/landing/hero/hero-{n}.webp`. 파일이 없으면 슬라이더가 onError 로
 *   레이어를 접고 브랜드 그린 그라데이션(플레이스홀더)만 남긴다.
 * - 9/29 S3 에서 슬라이드별 카피(말머리·설명·CTA·링크)를 걷어냈다 — 히어로의 주인공은 여정 카드이고
 *   배경은 분위기 레이어만 맡는다. 소비처가 id·image 뿐이라 죽은 필드를 지웠다(RSC 페이로드 절감).
 */

export interface HeroSlide {
  /** GA 라벨·key */
  id: string;
  image: string;
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "compare",
    image: "/landing/hero/hero-1.webp",
  },
  {
    id: "programs",
    image: "/landing/hero/hero-2.webp",
  },
  {
    id: "crops",
    image: "/landing/hero/hero-3.webp",
  },
  {
    id: "assess",
    image: "/landing/hero/hero-4.webp",
  },
] as const;

/** 자동 전환 간격 (ms) */
export const HERO_SLIDE_INTERVAL_MS = 6000;
