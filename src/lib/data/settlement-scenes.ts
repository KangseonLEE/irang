import type { TrendTypeId } from "./landing";

/**
 * 정착 유형별 대표 장면(수채화) — 한 유형은 화면 어디서든 같은 그림으로 보인다 (2026-10-05).
 *
 * 쓰는 곳:
 *  - 히어로 회전 배경 (components/landing/hero-search-hub · hero-rotator)
 *  - 트렌드·비용 섹션의 유형별 인터뷰 띠 (components/landing/type-interview-band) — 탭을 바꾸면 그림도 바뀐다
 *
 * 크기·화질도 여기서 함께 정한다. 두 곳의 `sizes`·`quality` 가 같아야 `/_next/image` 주소가 같아지고,
 * 히어로가 이미 받은 그림을 띠가 브라우저 캐시에서 그대로 쓴다(탭을 바꿀 때마다 새로 받지 않는다).
 * 원본은 1920×1280 — deviceSizes 최대(1920) 이상이라 업스케일 없음(9/28 히어로 이미지 규칙).
 */
export const SETTLEMENT_SCENE_IMAGE: Record<TrendTypeId, string> = {
  farming: "/landing/hero/hero-2.webp", // 사과 과수원
  rural: "/landing/hero/hero-3.webp", // 마을 텃밭
  mountain: "/landing/hero/hero-1.webp", // 안개 낀 산골 계단식 논
  youth: "/landing/hero/hero-youth.webp",
  smartfarm: "/landing/hero/hero-4.webp",
};

/** 두 곳 모두 화면 폭 전체를 덮는 배경이다 */
export const SETTLEMENT_SCENE_SIZES = "100vw";
export const SETTLEMENT_SCENE_QUALITY = 70;
