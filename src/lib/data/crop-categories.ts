/**
 * 작물 카테고리 SSOT
 *
 * 클라이언트 컴포넌트가 crops.ts(대형 데이터 모듈) 전체를 번들에 끌어오지 않도록
 * 카테고리 이름만 경량 분리 (dimension-meta 분리 패턴, 0eb5c4e).
 *
 * 새 카테고리 추가 시 이 배열만 수정하면 타입·필터 UI·normalize 화이트리스트가
 * 함께 확장된다. (2026-07-30 화훼 신설 때 6개 파일 중복 정의를 통합)
 */
export const CROP_CATEGORY_NAMES = [
  "식량",
  "채소",
  "과수",
  "특용",
  "화훼",
] as const;

export type CropCategoryName = (typeof CROP_CATEGORY_NAMES)[number];
