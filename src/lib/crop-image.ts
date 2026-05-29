/**
 * 작물 이미지 경로 헬퍼
 *
 * 2026-05-07: codex-image로 생성한 일러스트가 있는 작물은 일러 우선.
 * 2026-05-08: PNG → WebP 변환 (20배 압축, 동일 품질).
 * 2026-05-21: D4 신규 10종 일러스트 등재 (Phase 7 B 콘텐츠 확장).
 *
 * 작물 이미지는 반드시 일러스트 webp (메모리 박제 feedback_crop_image_illustration_rule_2026-05-21).
 * 점진 확장: ILLUSTRATED_CROPS Set에 ID 추가하면 자동 적용.
 */

/** codex-image로 일러 생성 완료된 작물 ID (52종, 2026-05-29 임산물 +3: omija·chestnut·walnut) */
const ILLUSTRATED_CROPS = new Set<string>([
  "apple",
  "arugula",
  "asparagus",
  "bellflower",
  "blueberry",
  "broccoli",
  "buckwheat",
  "carrot",
  "cherry",
  "cherry-tomato",
  "chestnut",
  "chili-pepper",
  "citrus",
  "corn",
  "cucumber",
  "deodeok",
  "eggplant",
  "garlic",
  "ginger",
  "ginseng",
  "grape",
  "green-onion",
  "king-oyster-mushroom",
  "lettuce",
  "maesil",
  "mango",
  "melon",
  "napa-cabbage",
  "omija",
  "onion",
  "oyster-mushroom",
  "paprika",
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
  "walnut",
  "watermelon",
  "zucchini",
]);

/**
 * 작물 ID로 이미지 경로 반환.
 * - 일러 있으면 `/crops/illustrations/{id}.webp`
 * - 없으면 `/crops/{id}.jpg` (사진 fallback)
 */
export function getCropImageSrc(cropId: string): string {
  if (ILLUSTRATED_CROPS.has(cropId)) {
    return `/crops/illustrations/${cropId}.webp`;
  }
  return `/crops/${cropId}.jpg`;
}

/**
 * 절대 URL 버전 (OG 이미지·메타데이터 등에서 필요 시).
 */
export function getCropImageAbsoluteUrl(cropId: string): string {
  return `https://irangfarm.com${getCropImageSrc(cropId)}`;
}
