/**
 * 재배면적 통계 교체 안내의 기준값 (2026-11-05, #200)
 *
 * 농작물생산조사 2025 공표로 값이 바뀐 작물의 '바뀌기 전' 값. 커밋 4441e229 직전의 crop-areas.ts·crops.ts 에서 그대로 옮겼고,
 * 화면 문구(lib/crops/area-update.ts)는 이 값과 현재 CROP_AREAS 의 차이로 만든다 — 문구에 숫자를 손으로 쓰지 않는다.
 *
 * releasedAt = 운영 배포일. 표시 기간을 여기서부터 센다(배지 7일 · 안내 30일, 회장 11/5).
 * 배포일이 바뀌면 이 값을 그날로 고친다. 기간이 끝난 뒤 지워도 화면은 그대로다(지울 때 호출처도 함께).
 */
export const CROP_AREA_UPDATE = {
  releasedAt: "2026-11-08",
  badgeDays: 7,
  noticeDays: 30,
} as const;

export interface CropAreaPrevious {
  year: number;
  totalHa: number;
  majorRegions: string[];
}

export const CROP_AREA_PREVIOUS: Record<string, CropAreaPrevious> = {
  "sweet-potato": { year: 2024, totalHa: 17732, majorRegions: ["전라남도", "전라북도", "경기도", "충청남도", "경상북도"] },
  "potato": { year: 2024, totalHa: 23968.9, majorRegions: ["강원도", "전라남도", "경상북도", "충청남도", "전라북도"] },
  "corn": { year: 2024, totalHa: 15566.8, majorRegions: ["강원도", "충청북도", "전라남도", "경기도", "경상북도"] },
  "buckwheat": { year: 2024, totalHa: 3721.2, majorRegions: ["제주특별자치도", "강원도"] },
  "perilla-seed": { year: 2024, totalHa: 38389.6, majorRegions: ["경기도", "충청남도", "강원도", "충청북도", "경상북도"] },
  "chili-pepper": { year: 2024, totalHa: 30147.3, majorRegions: ["경상북도", "전라남도", "경상남도", "전라북도", "강원도"] },
  "green-onion": { year: 2024, totalHa: 13516.8, majorRegions: ["전라남도", "경기도", "강원도", "전라북도", "경상북도"] },
  "ginger": { year: 2024, totalHa: 2491, majorRegions: ["경상북도", "충청남도", "전라북도", "전라남도"] },
  "napa-cabbage": { year: 2024, totalHa: 28637.4, majorRegions: ["전라남도", "강원도", "경상북도", "충청북도", "경기도"] },
  "spinach": { year: 2024, totalHa: 4421.3, majorRegions: ["경상남도", "경기도", "전라남도", "경상북도", "충청남도"] },
  "lettuce": { year: 2024, totalHa: 4458.1, majorRegions: ["전라북도", "충청남도", "경기도", "경상북도"] },
  "radish": { year: 2024, totalHa: 18497.3, majorRegions: ["제주특별자치도", "강원도", "경기도", "전라북도", "전라남도"] },
  "carrot": { year: 2024, totalHa: 3054.1, majorRegions: ["제주특별자치도", "경상남도", "강원도", "경상북도"] },
  "watermelon": { year: 2024, totalHa: 10673.5, majorRegions: ["충청남도", "전라북도", "충청북도", "경상남도", "경상북도"] },
  "melon": { year: 2024, totalHa: 4503.7, majorRegions: ["경상북도"] },
  "strawberry": { year: 2024, totalHa: 5612.1, majorRegions: ["경상남도", "충청남도", "전라남도", "경상북도", "전라북도"] },
  "cucumber": { year: 2024, totalHa: 4154.4, majorRegions: ["강원도", "충청남도", "경기도", "경상북도", "충청북도"] },
  "zucchini": { year: 2024, totalHa: 10359.9, majorRegions: ["전라남도", "경상북도", "제주특별자치도", "강원도", "경상남도"] },
  "tomato": { year: 2024, totalHa: 6085.9, majorRegions: ["강원도", "충청남도", "전라북도", "경상남도", "전라남도"] },
  "peach": { year: 2024, totalHa: 20294.1, majorRegions: ["경상북도", "충청북도", "전라북도"] },
  "grape": { year: 2024, totalHa: 14648.7, majorRegions: ["경상북도", "충청북도", "경기도", "충청남도", "전라북도"] },
  "citrus": { year: 2024, totalHa: 21950.9, majorRegions: ["제주특별자치도"] },
  "persimmon": { year: 2024, totalHa: 21961.8, majorRegions: ["경상남도", "경상북도", "전라남도"] },
  "plum": { year: 2024, totalHa: 6220.5, majorRegions: ["경상북도", "대구광역시", "충청북도", "경상남도"] },
  "maesil": { year: 2024, totalHa: 5566.4, majorRegions: ["전라남도", "경상남도", "경기도", "경상북도"] },
};
