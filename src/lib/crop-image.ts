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

/** codex-image로 일러 생성 완료된 작물 ID (55종, 2026-07-30 화훼 +3: rose·chrysanthemum·lily) */
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
  "chrysanthemum",
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
  "lily",
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
  "rose",
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

/** 일러스트(webp)가 있는 작물인지 — 카드에서 이모지 대신 이미지 노출 판정용. */
export function hasCropIllustration(cropId: string): boolean {
  return ILLUSTRATED_CROPS.has(cropId);
}

/**
 * 작물 ID → 일러스트 경로 `/crops/illustrations/{id}.webp`.
 *
 * 2026-09-17: 사진 폴백 `/crops/{id}.jpg` 를 제거했다.
 * 55종 전부 일러스트가 생기면서 이 분기는 한 번도 실행되지 않는 죽은 경로가 됐고,
 * 그 39장(8.5MB)이 배포마다 실려 Vercel Hobby 스토리지를 먹고 있었다.
 * 더 중요한 건 **새 작물을 일러스트 없이 추가해도 그 작물의 jpg 는 어차피 없어서**
 * 폴백이 이미 무용지물이었다는 점 — 가리개만 있고 방어는 없었다.
 *
 * 대신 `scripts/check-cross-reference.ts` H-1 이 CROPS ↔ 일러스트 파일 1:1 을
 * CI 에서 강제한다(빌드 차단). 일러스트 없는 작물은 머지 자체가 안 된다.
 * 작물 이미지는 일러스트만 쓴다는 규칙(CLAUDE.md 5/21 박제)을 코드가 강제하는 셈.
 */
export function getCropImageSrc(cropId: string): string {
  return `/crops/illustrations/${cropId}.webp`;
}

/**
 * 절대 URL 버전 (OG 이미지·메타데이터 등에서 필요 시).
 */
export function getCropImageAbsoluteUrl(cropId: string): string {
  return `https://irangfarm.com${getCropImageSrc(cropId)}`;
}
