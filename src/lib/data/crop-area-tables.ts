/**
 * 작물 → KOSIS 재배면적 표·항목 (2026-10-09, 원천 메타데이터 조회로 확인)
 *
 * 작물 하나 = 표 하나 + 그 작물의 '면적' 항목 하나. 여러 작물이 들어 있는 표(과실·채소·두류…)는 항목 ID 로만 읽는다 —
 * 10/8 사고(과실생산량 표를 항목 필터 없이 읽어 콩·마늘 상세에 과일 면적)가 그 반대였다.
 * 수집: scripts/collect-crop-areas.ts → crop-areas.ts. 항목 이름이 어긋나면 수집이 멈춘다.
 *
 * 여기 없는 작물(차트 대신 주산지 칩만 보인다):
 * - 시·도별 단일 항목 표가 KOSIS 농작물생산조사에 없음: 인삼·버섯 3종·블루베리·체리·망고·아스파라거스·브로콜리·파프리카·
 *   깻잎·루꼴라·도라지·더덕·오미자·밤·호두·화훼 3종
 * - 표 메타에는 항목이 있지만 값이 없음: 가지(DT_1ET0027 T63, 2022~2024 빈 응답)
 * - 상위 항목에 섞여 있어 그 작물만의 면적이 아님: 샤인머스캣(포도)·방울토마토(토마토)
 */

export interface CropAreaTable {
  cropId: string;
  /** KOSIS 통계표 ID (orgId 101 농작물생산조사) */
  tblId: string;
  /** 면적 항목 ID */
  itmId: string;
  /** 원천 항목 이름 — 수집 때 응답과 정확히 같아야 한다 */
  itemName: string;
}

export const CROP_TABLES: CropAreaTable[] = [
  // 식량작물
  { cropId: "rice", tblId: "DT_1ET0034", itmId: "T10", itemName: "논벼:재배면적" }, // 시군별 논벼 생산량 — 시·도 행만 쓴다
  { cropId: "soybean", tblId: "DT_1ET0025", itmId: "T07", itemName: "콩:면적" }, // 두류생산량
  { cropId: "sweet-potato", tblId: "DT_1ET0026", itmId: "T09", itemName: "고구마:면적" }, // 서류생산량(생서)
  { cropId: "potato", tblId: "DT_1ET0026", itmId: "T19", itemName: "감자:면적" },
  { cropId: "corn", tblId: "DT_1ET0024", itmId: "T19", itemName: "옥수수:면적" }, // 잡곡생산량
  { cropId: "buckwheat", tblId: "DT_1ET0024", itmId: "T25", itemName: "메밀:면적" },
  // 특용작물
  { cropId: "sesame", tblId: "DT_1ET0293", itmId: "T08", itemName: "참깨:면적" }, // 특용작물생산량
  { cropId: "perilla-seed", tblId: "DT_1ET0293", itmId: "T14", itemName: "들깨:면적" },
  // 조미채소
  { cropId: "chili-pepper", tblId: "DT_1ET0291", itmId: "T06", itemName: "고추:면적" }, // 채소생산량(조미채소)
  { cropId: "green-onion", tblId: "DT_1ET0291", itmId: "T40", itemName: "대파:면적" },
  { cropId: "onion", tblId: "DT_1ET0291", itmId: "T76", itemName: "양파:면적" },
  { cropId: "ginger", tblId: "DT_1ET0291", itmId: "T82", itemName: "생강:면적" },
  { cropId: "garlic", tblId: "DT_1ET0291", itmId: "T88", itemName: "마늘:면적" },
  // 엽채류
  { cropId: "napa-cabbage", tblId: "DT_1ET0028", itmId: "T06", itemName: "배추:면적" }, // 채소생산량(엽채류)
  { cropId: "spinach", tblId: "DT_1ET0028", itmId: "T48", itemName: "시금치:면적" },
  { cropId: "lettuce", tblId: "DT_1ET0028", itmId: "T66", itemName: "상추:면적" },
  // 근채류
  { cropId: "radish", tblId: "DT_1ET0029", itmId: "T06", itemName: "무:면적" }, // 채소생산량(근채류)
  { cropId: "carrot", tblId: "DT_1ET0029", itmId: "T60", itemName: "당근:면적" },
  // 과채류
  { cropId: "watermelon", tblId: "DT_1ET0027", itmId: "T03", itemName: "수박:면적" }, // 채소생산량(과채류)
  { cropId: "melon", tblId: "DT_1ET0027", itmId: "T12", itemName: "참외:면적" },
  { cropId: "strawberry", tblId: "DT_1ET0027", itmId: "T21", itemName: "딸기:면적" },
  { cropId: "cucumber", tblId: "DT_1ET0027", itmId: "T30", itemName: "오이:면적" },
  { cropId: "zucchini", tblId: "DT_1ET0027", itmId: "T39", itemName: "호박:면적" },
  { cropId: "tomato", tblId: "DT_1ET0027", itmId: "T48", itemName: "토마토:면적" },
  // 과수
  { cropId: "apple", tblId: "DT_1ET0292", itmId: "T06", itemName: "사과:면적" }, // 과실생산량(성과수+미과수)
  { cropId: "pear", tblId: "DT_1ET0292", itmId: "T12", itemName: "배:면적" },
  { cropId: "peach", tblId: "DT_1ET0292", itmId: "T18", itemName: "복숭아:면적" },
  { cropId: "grape", tblId: "DT_1ET0292", itmId: "T24", itemName: "포도:면적" },
  { cropId: "citrus", tblId: "DT_1ET0292", itmId: "T30", itemName: "감귤:면적" },
  { cropId: "persimmon", tblId: "DT_1ET0292", itmId: "T36", itemName: "감:면적" },
  { cropId: "plum", tblId: "DT_1ET0292", itmId: "T54", itemName: "자두:면적" },
  { cropId: "maesil", tblId: "DT_1ET0292", itmId: "T66", itemName: "매실:면적" },
];
