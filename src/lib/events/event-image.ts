/**
 * 체험·살아보기 카드 이미지 해석 (2026-09-30)
 *
 * 우선순위: ① 수집된 마을 사진(`imageUrl`, 그린대로 원본 — 반드시 next/image 최적화 경유, 원본 7MB)
 *          ② 시·도 배경 일러스트(`public/images/regions/<id>.webp`, 17장) ③ 공용 기본 이미지.
 * 폴백은 "사진 없음"을 숨기는 가리개가 아니라 지역 맥락을 주는 배경이다 — 카드에서 사진/일러스트 구분은
 * `isPhoto` 로 알 수 있으니 사진일 때만 "사진: 그린대로" 출처를 붙인다.
 */
import { PROVINCES } from "@/lib/data/regions";
import type { FarmEvent } from "@/lib/data/events";

export interface EventImage {
  src: string;
  alt: string;
  /** true = 실제 마을 사진(외부 원본) / false = 시·도 배경 일러스트 폴백 */
  isPhoto: boolean;
  /** 사진일 때만 출처 표기 */
  credit?: string;
}

const REGION_ID_BY_NAME = new Map(PROVINCES.map((p) => [p.name, p.id]));
const DEFAULT_FALLBACK = "/images/regions/gangwon.webp";

/** 시·도 이름(SSOT) → 배경 일러스트 경로. 전국·미상은 기본값 */
export function regionFallbackImage(region: string | undefined): string {
  const id = region ? REGION_ID_BY_NAME.get(region) : undefined;
  return id ? `/images/regions/${id}.webp` : DEFAULT_FALLBACK;
}

export function getEventImage(event: Pick<FarmEvent, "imageUrl" | "region" | "title">): EventImage {
  if (event.imageUrl && /^https:\/\/www\.greendaero\.go\.kr\/svc\/common\/board\/img\//.test(event.imageUrl)) {
    return { src: event.imageUrl, alt: `${event.title} 마을 사진`, isPhoto: true, credit: "사진: 그린대로" };
  }
  return { src: regionFallbackImage(event.region), alt: "", isPhoto: false };
}
