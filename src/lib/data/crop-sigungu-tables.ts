/**
 * 작물 → 2025 농림어업총조사 시·군·구 재배면적 항목 (2026-10-10, KOSIS getMeta 로 항목 ID·이름 확인)
 *
 * 작물 상세 '주요 산지 (시·군·구)' 칩의 순서 근거. 10/10 전까지 칩은 SIGUNGUS.mainCrops 에 그 작물이 든 곳을
 * 목록 순서대로 잘라 보여 줬다 — 쌀 상세가 목포·여수·순천으로 시작한 이유(주산지 순이 아니었다).
 * 수집: scripts/collect-crop-sigungu-areas.ts → crop-sigungu-areas.ts. 항목 이름이 어긋나면 수집이 멈춘다.
 *
 * 여러 항목은 더한다(노지 + 시설, 단감 + 떫은감). 표: 국가데이터처 KOSIS orgId 101, prdSe F, 2025-12-01 기준.
 *   DT_1AG25401 논벼 재배 면적 규모별 농가 · DT_1AG25402 식량 작물 · DT_1AG25403 채소·특용 작물(노지)
 *   DT_1AG25407 시설 작물 · DT_1AG25411 과수
 * 여기 없는 작물(메밀·깻잎·도라지·더덕·오미자·체리·망고·아스파라거스·브로콜리·루꼴라·표고·샤인머스캣·화훼)은
 * 총조사에 그 작물 하나의 항목이 없어 종전처럼 mainCrops 칩을 쓴다. 느타리·새송이는 항목이 있지만 시·군·구 값이
 * 1~6ha 정수라 순서를 가를 수 없어 뺐다.
 */

export interface CropSigunguItem {
  tblId: string;
  itmId: string;
  /** 원천 항목 이름 — 수집 때 응답과 정확히 같아야 한다 */
  itemName: string;
}

const T = (tblId: string, itmId: string, itemName: string): CropSigunguItem => ({ tblId, itmId, itemName });
const FOOD = "DT_1AG25402";
const OPEN = "DT_1AG25403";
const HOUSE = "DT_1AG25407";
const FRUIT = "DT_1AG25411";

export const CROP_SIGUNGU_TABLES: Record<string, CropSigunguItem[]> = {
  rice: [T("DT_1AG25401", "T17", "재배 면적")],
  corn: [T(FOOD, "T05", "옥수수_면적")],
  soybean: [T(FOOD, "T07", "콩_면적")],
  potato: [T(FOOD, "T11", "감자_면적")],
  "sweet-potato": [T(FOOD, "T13", "고구마_면적")],
  "napa-cabbage": [T(OPEN, "T01", "배추_면적"), T(HOUSE, "T01", "배추_면적")],
  radish: [T(OPEN, "T03", "무_면적"), T(HOUSE, "T03", "무_면적")],
  "chili-pepper": [T(OPEN, "T05", "고추_면적"), T(HOUSE, "T05", "고추_면적")],
  onion: [T(OPEN, "T07", "양파_면적")],
  "green-onion": [T(OPEN, "T09", "대파_면적")],
  garlic: [T(OPEN, "T11", "마늘_면적")],
  spinach: [T(OPEN, "T13", "시금치_면적"), T(HOUSE, "T07", "시금치_면적")],
  lettuce: [T(OPEN, "T15", "상추_면적"), T(HOUSE, "T09", "상추_면적")],
  zucchini: [T(OPEN, "T17", "호박_면적"), T(HOUSE, "T11", "호박_면적")],
  cucumber: [T(OPEN, "T21", "오이_면적"), T(HOUSE, "T13", "오이_면적")],
  eggplant: [T(OPEN, "T23", "가지_면적")],
  watermelon: [T(OPEN, "T25", "수박_면적"), T(HOUSE, "T15", "수박_면적")],
  carrot: [T(OPEN, "T27", "당근_면적")],
  ginseng: [T(OPEN, "T29", "인삼_면적")],
  sesame: [T(OPEN, "T31", "참깨_면적")],
  "perilla-seed": [T(OPEN, "T33", "들깨_면적")],
  melon: [T(HOUSE, "T25", "참외_면적")],
  tomato: [T(HOUSE, "T19", "토마토(일반)_면적")],
  "cherry-tomato": [T(HOUSE, "T21", "토마토(방울)_면적")],
  strawberry: [T(HOUSE, "T23", "딸기_면적")],
  paprika: [T(HOUSE, "T27", "파프리카_면적")],
  apple: [T(FRUIT, "T03", "사과_면적")],
  pear: [T(FRUIT, "T07", "배_면적")],
  peach: [T(FRUIT, "T11", "복숭아_면적")],
  persimmon: [T(FRUIT, "T15", "단감_면적"), T(FRUIT, "T43", "떫은감_면적")],
  grape: [T(FRUIT, "T19", "노지 포도_면적"), T(FRUIT, "T21", "시설 포도_면적")],
  citrus: [T(FRUIT, "T23", "노지 감귤_면적"), T(FRUIT, "T25", "시설 감귤_면적")],
  plum: [T(FRUIT, "T27", "자두_면적")],
  maesil: [T(FRUIT, "T29", "매실_면적")],
  blueberry: [T(FRUIT, "T33", "블루베리_면적")],
  chestnut: [T(FRUIT, "T37", "밤_면적")],
  walnut: [T(FRUIT, "T39", "호두_면적")],
};
