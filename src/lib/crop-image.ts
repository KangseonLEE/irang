/**
 * 작물 이미지 경로 헬퍼
 *
 * 2026-05-07: codex-image로 생성한 일러스트 (PNG)가 있는 작물은 일러 우선.
 * 그 외는 기존 사진(JPG) fallback.
 *
 * 점진 확장: ILLUSTRATED_CROPS Set에 ID 추가하면 자동 적용.
 */

/** codex-image로 일러 생성 완료된 작물 ID (39종, 2026-05-07) */
const ILLUSTRATED_CROPS = new Set<string>([
  "apple",
  "arugula",
  "bellflower",
  "blueberry",
  "cherry",
  "chili-pepper",
  "citrus",
  "corn",
  "cucumber",
  "garlic",
  "ginger",
  "ginseng",
  "grape",
  "green-onion",
  "lettuce",
  "mango",
  "melon",
  "napa-cabbage",
  "onion",
  "oyster-mushroom",
  "peach",
  "pear",
  "perilla-leaf",
  "perilla-seed",
  "persimmon",
  "plum",
  "potato",
  "radish",
  "rice",
  "sesame",
  "shiitake",
  "shine-muscat",
  "soybean",
  "spinach",
  "strawberry",
  "sweet-potato",
  "tomato",
  "watermelon",
  "zucchini",
]);

/**
 * 작물 ID로 이미지 경로 반환.
 * - 일러 있으면 `/crops/illustrations/{id}.png`
 * - 없으면 `/crops/{id}.jpg` (사진 fallback)
 */
export function getCropImageSrc(cropId: string): string {
  if (ILLUSTRATED_CROPS.has(cropId)) {
    return `/crops/illustrations/${cropId}.png`;
  }
  return `/crops/${cropId}.jpg`;
}

/**
 * 절대 URL 버전 (OG 이미지·메타데이터 등에서 필요 시).
 */
export function getCropImageAbsoluteUrl(cropId: string): string {
  return `https://irangfarm.com${getCropImageSrc(cropId)}`;
}
