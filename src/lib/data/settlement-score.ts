/**
 * 시군구 정착 점수 정적 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-settlement-score.ts
 * 입력 데이터: population-trend.ts, population.ts, farms.ts, sigungus.ts
 * 마지막 계산: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/compute-settlement-score.ts`
 *
 * 모델 (4차원 가중 평균, 0~100점) — 농촌 정착 가능성 중심:
 *  - 농가 활성도 (35%): 농가밀도 + 가구당 농가인구
 *  - 인구 안정성 (25%): 5년 변화율 (감소↓ 감점, 도시 유입 과도시 캡)
 *  - 청년성     (25%): 고령화율 역수 (낮을수록 점수↑)
 *  - 거주 적정성 (15%): 인구밀도 (20~300/km² 적정 — 한적한 농촌)
 */

export const SETTLEMENT_SCORE_WEIGHTS = {
  populationTrend: 0.25,
  youth: 0.25,
  farm: 0.35,
  density: 0.15,
} as const;

export interface SettlementScoreDimensions {
  populationTrend: number;
  youth: number;
  farm: number;
  density: number;
}

export interface SettlementScore {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 시도 SGIS 코드 (2자리) */
  sidoSgisCode: string;
  /** 가중 총점 (0~100) */
  totalScore: number;
  /** 차원별 점수 */
  dimensions: SettlementScoreDimensions;
  /** 점수 산출 근거 (UI 표시용) */
  raw: {
    populationChangePct: number | null;
    agingRate: number | null;
    farmCount: number | null;
    avgFarmPopulation: number | null;
    densityPerKm2: number | null;
  };
}

export const SETTLEMENT_SCORES: SettlementScore[] = [
  {
    "sgisCode": "31140",
    "name": "오산시",
    "sidoSgisCode": "31",
    "totalScore": 81.4,
    "dimensions": {
      "populationTrend": 97,
      "youth": 95,
      "farm": 83,
      "density": 29
    },
    "raw": {
      "populationChangePct": 6.4,
      "agingRate": 11,
      "farmCount": 1496,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 5676.1
    }
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "sidoSgisCode": "32",
    "totalScore": 81.3,
    "dimensions": {
      "populationTrend": 100,
      "youth": 67,
      "farm": 73,
      "density": 93
    },
    "raw": {
      "populationChangePct": 5.1,
      "agingRate": 16.6,
      "farmCount": 8935,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 417.1
    }
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "sidoSgisCode": "31",
    "totalScore": 77,
    "dimensions": {
      "populationTrend": 96,
      "youth": 76,
      "farm": 59,
      "density": 89
    },
    "raw": {
      "populationChangePct": 3,
      "agingRate": 14.9,
      "farmCount": 8229,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 492.5
    }
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "sidoSgisCode": "37",
    "totalScore": 76.9,
    "dimensions": {
      "populationTrend": 98,
      "youth": 66,
      "farm": 70,
      "density": 76
    },
    "raw": {
      "populationChangePct": 3.9,
      "agingRate": 16.9,
      "farmCount": 7511,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 717.8
    }
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "sidoSgisCode": "31",
    "totalScore": 76.8,
    "dimensions": {
      "populationTrend": 87,
      "youth": 89,
      "farm": 83,
      "density": 25
    },
    "raw": {
      "populationChangePct": -0.3,
      "agingRate": 12.3,
      "farmCount": 5427,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 10049.1
    }
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "sidoSgisCode": "33",
    "totalScore": 76.4,
    "dimensions": {
      "populationTrend": 93,
      "youth": 77,
      "farm": 69,
      "density": 65
    },
    "raw": {
      "populationChangePct": 1.6,
      "agingRate": 14.7,
      "farmCount": 15977,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 913
    }
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "sidoSgisCode": "31",
    "totalScore": 75.9,
    "dimensions": {
      "populationTrend": 97,
      "youth": 73,
      "farm": 79,
      "density": 38
    },
    "raw": {
      "populationChangePct": 3.7,
      "agingRate": 15.5,
      "farmCount": 5950,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 3906.2
    }
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "sidoSgisCode": "37",
    "totalScore": 75.6,
    "dimensions": {
      "populationTrend": 62,
      "youth": 95,
      "farm": 70,
      "density": 79
    },
    "raw": {
      "populationChangePct": -3.1,
      "agingRate": 11.1,
      "farmCount": 10490,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 665.1
    }
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "sidoSgisCode": "33",
    "totalScore": 75.2,
    "dimensions": {
      "populationTrend": 92,
      "youth": 56,
      "farm": 70,
      "density": 91
    },
    "raw": {
      "populationChangePct": 0.8,
      "agingRate": 18.9,
      "farmCount": 1484,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 461.6
    }
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "sidoSgisCode": "38",
    "totalScore": 74.6,
    "dimensions": {
      "populationTrend": 93,
      "youth": 86,
      "farm": 60,
      "density": 59
    },
    "raw": {
      "populationChangePct": 1.5,
      "agingRate": 12.8,
      "farmCount": 8633,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 1181.2
    }
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "sidoSgisCode": "26",
    "totalScore": 74.3,
    "dimensions": {
      "populationTrend": 97,
      "youth": 100,
      "farm": 47,
      "density": 57
    },
    "raw": {
      "populationChangePct": 6.4,
      "agingRate": 9.7,
      "farmCount": 2609,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 1367.2
    }
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "sidoSgisCode": "36",
    "totalScore": 73.6,
    "dimensions": {
      "populationTrend": 93,
      "youth": 76,
      "farm": 47,
      "density": 99
    },
    "raw": {
      "populationChangePct": 1.3,
      "agingRate": 14.8,
      "farmCount": 6942,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 320.9
    }
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "sidoSgisCode": "31",
    "totalScore": 73.1,
    "dimensions": {
      "populationTrend": 79,
      "youth": 89,
      "farm": 64,
      "density": 58
    },
    "raw": {
      "populationChangePct": 17,
      "agingRate": 12.3,
      "farmCount": 9054,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 1286.3
    }
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "sidoSgisCode": "39",
    "totalScore": 73.1,
    "dimensions": {
      "populationTrend": 95,
      "youth": 73,
      "farm": 51,
      "density": 88
    },
    "raw": {
      "populationChangePct": 2.6,
      "agingRate": 15.4,
      "farmCount": 17783,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 506.5
    }
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "sidoSgisCode": "35",
    "totalScore": 72.7,
    "dimensions": {
      "populationTrend": 92,
      "youth": 68,
      "farm": 75,
      "density": 43
    },
    "raw": {
      "populationChangePct": 1.1,
      "agingRate": 16.4,
      "farmCount": 8310,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 3229
    }
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "sidoSgisCode": "32",
    "totalScore": 72.6,
    "dimensions": {
      "populationTrend": 96,
      "youth": 56,
      "farm": 56,
      "density": 100
    },
    "raw": {
      "populationChangePct": 2.9,
      "agingRate": 18.8,
      "farmCount": 6702,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 262.6
    }
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "sidoSgisCode": "34",
    "totalScore": 72.1,
    "dimensions": {
      "populationTrend": 95,
      "youth": 91,
      "farm": 48,
      "density": 59
    },
    "raw": {
      "populationChangePct": 2.4,
      "agingRate": 11.9,
      "farmCount": 11111,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 1081.3
    }
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "sidoSgisCode": "34",
    "totalScore": 71.9,
    "dimensions": {
      "populationTrend": 98,
      "youth": 86,
      "farm": 40,
      "density": 79
    },
    "raw": {
      "populationChangePct": 6.1,
      "agingRate": 12.9,
      "farmCount": 8847,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 669.9
    }
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "sidoSgisCode": "32",
    "totalScore": 71.5,
    "dimensions": {
      "populationTrend": 97,
      "youth": 43,
      "farm": 73,
      "density": 73
    },
    "raw": {
      "populationChangePct": 3.3,
      "agingRate": 21.4,
      "farmCount": 1027,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 768.7
    }
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "sidoSgisCode": "31",
    "totalScore": 70.6,
    "dimensions": {
      "populationTrend": 80,
      "youth": 83,
      "farm": 62,
      "density": 54
    },
    "raw": {
      "populationChangePct": 15.6,
      "agingRate": 13.4,
      "farmCount": 4980,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 1775.8
    }
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "sidoSgisCode": "31",
    "totalScore": 70.6,
    "dimensions": {
      "populationTrend": 77,
      "youth": 100,
      "farm": 51,
      "density": 57
    },
    "raw": {
      "populationChangePct": 19.9,
      "agingRate": 9.4,
      "farmCount": 10395,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 1353.3
    }
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "sidoSgisCode": "31",
    "totalScore": 70.5,
    "dimensions": {
      "populationTrend": 97,
      "youth": 63,
      "farm": 46,
      "density": 96
    },
    "raw": {
      "populationChangePct": 3.7,
      "agingRate": 17.4,
      "farmCount": 7943,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 376.9
    }
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "sidoSgisCode": "31",
    "totalScore": 70,
    "dimensions": {
      "populationTrend": 100,
      "youth": 71,
      "farm": 58,
      "density": 46
    },
    "raw": {
      "populationChangePct": 5.2,
      "agingRate": 15.8,
      "farmCount": 854,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 2913.3
    }
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "sidoSgisCode": "38",
    "totalScore": 69.8,
    "dimensions": {
      "populationTrend": 87,
      "youth": 59,
      "farm": 57,
      "density": 89
    },
    "raw": {
      "populationChangePct": -0.3,
      "agingRate": 18.2,
      "farmCount": 13204,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 492.7
    }
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "sidoSgisCode": "23",
    "totalScore": 68.7,
    "dimensions": {
      "populationTrend": 81,
      "youth": 95,
      "farm": 59,
      "density": 27
    },
    "raw": {
      "populationChangePct": 14.4,
      "agingRate": 11,
      "farmCount": 806,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 7993.8
    }
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "sidoSgisCode": "36",
    "totalScore": 68.3,
    "dimensions": {
      "populationTrend": 93,
      "youth": 64,
      "farm": 40,
      "density": 100
    },
    "raw": {
      "populationChangePct": 1.4,
      "agingRate": 17.2,
      "farmCount": 11869,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 299.9
    }
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "sidoSgisCode": "31",
    "totalScore": 68,
    "dimensions": {
      "populationTrend": 99,
      "youth": 66,
      "farm": 64,
      "density": 29
    },
    "raw": {
      "populationChangePct": 5.3,
      "agingRate": 16.9,
      "farmCount": 1459,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 5581.7
    }
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "sidoSgisCode": "31",
    "totalScore": 67.9,
    "dimensions": {
      "populationTrend": 98,
      "youth": 77,
      "farm": 46,
      "density": 54
    },
    "raw": {
      "populationChangePct": 3.8,
      "agingRate": 14.7,
      "farmCount": 7288,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 1800.2
    }
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "sidoSgisCode": "29",
    "totalScore": 67.7,
    "dimensions": {
      "populationTrend": 75,
      "youth": 99,
      "farm": 39,
      "density": 70
    },
    "raw": {
      "populationChangePct": 22.5,
      "agingRate": 10.1,
      "farmCount": 7163,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 822.4
    }
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "sidoSgisCode": "25",
    "totalScore": 67,
    "dimensions": {
      "populationTrend": 92,
      "youth": 97,
      "farm": 34,
      "density": 52
    },
    "raw": {
      "populationChangePct": 0.9,
      "agingRate": 10.6,
      "farmCount": 3353,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 2091.7
    }
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "sidoSgisCode": "31",
    "totalScore": 66.6,
    "dimensions": {
      "populationTrend": 91,
      "youth": 77,
      "farm": 38,
      "density": 75
    },
    "raw": {
      "populationChangePct": 9.6,
      "agingRate": 14.7,
      "farmCount": 6555,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 729.6
    }
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "sidoSgisCode": "25",
    "totalScore": 66.6,
    "dimensions": {
      "populationTrend": 71,
      "youth": 78,
      "farm": 71,
      "density": 30
    },
    "raw": {
      "populationChangePct": -2.1,
      "agingRate": 14.3,
      "farmCount": 4466,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 4976.9
    }
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "sidoSgisCode": "31",
    "totalScore": 66.5,
    "dimensions": {
      "populationTrend": 60,
      "youth": 73,
      "farm": 83,
      "density": 28
    },
    "raw": {
      "populationChangePct": -3.3,
      "agingRate": 15.4,
      "farmCount": 915,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 7363.9
    }
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "sidoSgisCode": "31",
    "totalScore": 66.4,
    "dimensions": {
      "populationTrend": 79,
      "youth": 98,
      "farm": 47,
      "density": 38
    },
    "raw": {
      "populationChangePct": 16.1,
      "agingRate": 10.4,
      "farmCount": 1798,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 3987.9
    }
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "sidoSgisCode": "36",
    "totalScore": 66.4,
    "dimensions": {
      "populationTrend": 87,
      "youth": 54,
      "farm": 46,
      "density": 100
    },
    "raw": {
      "populationChangePct": 11.4,
      "agingRate": 19.1,
      "farmCount": 7152,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 201.5
    }
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "sidoSgisCode": "32",
    "totalScore": 66.3,
    "dimensions": {
      "populationTrend": 79,
      "youth": 37,
      "farm": 68,
      "density": 90
    },
    "raw": {
      "populationChangePct": -1.2,
      "agingRate": 22.6,
      "farmCount": 2155,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 481.6
    }
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "sidoSgisCode": "32",
    "totalScore": 66.2,
    "dimensions": {
      "populationTrend": 88,
      "youth": 37,
      "farm": 57,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.2,
      "agingRate": 22.6,
      "farmCount": 7046,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 206.8
    }
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "sidoSgisCode": "33",
    "totalScore": 66.2,
    "dimensions": {
      "populationTrend": 88,
      "youth": 69,
      "farm": 34,
      "density": 100
    },
    "raw": {
      "populationChangePct": 11,
      "agingRate": 16.2,
      "farmCount": 3592,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 228.9
    }
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "sidoSgisCode": "31",
    "totalScore": 65.2,
    "dimensions": {
      "populationTrend": 94,
      "youth": 76,
      "farm": 37,
      "density": 65
    },
    "raw": {
      "populationChangePct": 7.9,
      "agingRate": 14.9,
      "farmCount": 3928,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 911.7
    }
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "sidoSgisCode": "21",
    "totalScore": 65.1,
    "dimensions": {
      "populationTrend": 97,
      "youth": 47,
      "farm": 75,
      "density": 19
    },
    "raw": {
      "populationChangePct": 3.4,
      "agingRate": 20.6,
      "farmCount": 691,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 16072.9
    }
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "sidoSgisCode": "24",
    "totalScore": 64.9,
    "dimensions": {
      "populationTrend": 91,
      "youth": 99,
      "farm": 27,
      "density": 53
    },
    "raw": {
      "populationChangePct": 0.3,
      "agingRate": 10.3,
      "farmCount": 5183,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 1892.2
    }
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "sidoSgisCode": "39",
    "totalScore": 64.8,
    "dimensions": {
      "populationTrend": 97,
      "youth": 49,
      "farm": 38,
      "density": 100
    },
    "raw": {
      "populationChangePct": 3.3,
      "agingRate": 20.3,
      "farmCount": 12582,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 207.7
    }
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "sidoSgisCode": "31",
    "totalScore": 64.7,
    "dimensions": {
      "populationTrend": 84,
      "youth": 89,
      "farm": 47,
      "density": 33
    },
    "raw": {
      "populationChangePct": -0.7,
      "agingRate": 12.2,
      "farmCount": 2009,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 4613.2
    }
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "sidoSgisCode": "22",
    "totalScore": 64.7,
    "dimensions": {
      "populationTrend": 98,
      "youth": 80,
      "farm": 23,
      "density": 81
    },
    "raw": {
      "populationChangePct": 6.1,
      "agingRate": 14.1,
      "farmCount": 5946,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 623.8
    }
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "sidoSgisCode": "31",
    "totalScore": 64.6,
    "dimensions": {
      "populationTrend": 92,
      "youth": 71,
      "farm": 44,
      "density": 56
    },
    "raw": {
      "populationChangePct": 8.8,
      "agingRate": 15.8,
      "farmCount": 4930,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 1570.1
    }
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "sidoSgisCode": "38",
    "totalScore": 64.1,
    "dimensions": {
      "populationTrend": 67,
      "youth": 67,
      "farm": 63,
      "density": 57
    },
    "raw": {
      "populationChangePct": -2.6,
      "agingRate": 16.6,
      "farmCount": 14517,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 1360.9
    }
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "sidoSgisCode": "34",
    "totalScore": 64,
    "dimensions": {
      "populationTrend": 94,
      "youth": 53,
      "farm": 35,
      "density": 100
    },
    "raw": {
      "populationChangePct": 2.2,
      "agingRate": 19.5,
      "farmCount": 11082,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 240.1
    }
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "sidoSgisCode": "23",
    "totalScore": 63.9,
    "dimensions": {
      "populationTrend": 92,
      "youth": 91,
      "farm": 39,
      "density": 30
    },
    "raw": {
      "populationChangePct": 9.1,
      "agingRate": 11.8,
      "farmCount": 1090,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 5123.6
    }
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "sidoSgisCode": "34",
    "totalScore": 63.8,
    "dimensions": {
      "populationTrend": 94,
      "youth": 80,
      "farm": 25,
      "density": 77
    },
    "raw": {
      "populationChangePct": 2.1,
      "agingRate": 14,
      "farmCount": 513,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 698.6
    }
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "sidoSgisCode": "31",
    "totalScore": 63.5,
    "dimensions": {
      "populationTrend": 49,
      "youth": 73,
      "farm": 83,
      "density": 26
    },
    "raw": {
      "populationChangePct": -4.6,
      "agingRate": 15.5,
      "farmCount": 1390,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 9250.6
    }
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "sidoSgisCode": "37",
    "totalScore": 63.3,
    "dimensions": {
      "populationTrend": 77,
      "youth": 51,
      "farm": 50,
      "density": 92
    },
    "raw": {
      "populationChangePct": -1.5,
      "agingRate": 19.8,
      "farmCount": 13998,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 439.9
    }
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "sidoSgisCode": "36",
    "totalScore": 63.1,
    "dimensions": {
      "populationTrend": 99,
      "youth": 36,
      "farm": 41,
      "density": 100
    },
    "raw": {
      "populationChangePct": 4.5,
      "agingRate": 22.9,
      "farmCount": 9087,
      "avgFarmPopulation": 2,
      "densityPerKm2": 190
    }
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "sidoSgisCode": "21",
    "totalScore": 63.1,
    "dimensions": {
      "populationTrend": 78,
      "youth": 89,
      "farm": 30,
      "density": 72
    },
    "raw": {
      "populationChangePct": 18.4,
      "agingRate": 12.2,
      "farmCount": 2459,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 791.1
    }
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "sidoSgisCode": "31",
    "totalScore": 63,
    "dimensions": {
      "populationTrend": 87,
      "youth": 63,
      "farm": 42,
      "density": 72
    },
    "raw": {
      "populationChangePct": 11.6,
      "agingRate": 17.5,
      "farmCount": 3735,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 783.1
    }
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "sidoSgisCode": "34",
    "totalScore": 62.9,
    "dimensions": {
      "populationTrend": 91,
      "youth": 53,
      "farm": 34,
      "density": 100
    },
    "raw": {
      "populationChangePct": 0.7,
      "agingRate": 19.4,
      "farmCount": 10177,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 246.3
    }
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "sidoSgisCode": "38",
    "totalScore": 62.9,
    "dimensions": {
      "populationTrend": 95,
      "youth": 73,
      "farm": 27,
      "density": 76
    },
    "raw": {
      "populationChangePct": 2.3,
      "agingRate": 15.5,
      "farmCount": 3530,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 726.8
    }
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "sidoSgisCode": "11",
    "totalScore": 62.7,
    "dimensions": {
      "populationTrend": 86,
      "youth": 71,
      "farm": 60,
      "density": 16
    },
    "raw": {
      "populationChangePct": -0.4,
      "agingRate": 15.9,
      "farmCount": 656,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 18765
    }
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "sidoSgisCode": "26",
    "totalScore": 62.4,
    "dimensions": {
      "populationTrend": 45,
      "youth": 78,
      "farm": 75,
      "density": 36
    },
    "raw": {
      "populationChangePct": -5,
      "agingRate": 14.3,
      "farmCount": 2803,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 4230.2
    }
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "sidoSgisCode": "31",
    "totalScore": 62.3,
    "dimensions": {
      "populationTrend": 50,
      "youth": 71,
      "farm": 83,
      "density": 20
    },
    "raw": {
      "populationChangePct": -4.5,
      "agingRate": 15.9,
      "farmCount": 1474,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 15159.8
    }
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "sidoSgisCode": "33",
    "totalScore": 62,
    "dimensions": {
      "populationTrend": 91,
      "youth": 45,
      "farm": 37,
      "density": 100
    },
    "raw": {
      "populationChangePct": 0.3,
      "agingRate": 21,
      "farmCount": 8933,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 219.4
    }
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "sidoSgisCode": "26",
    "totalScore": 61.9,
    "dimensions": {
      "populationTrend": 86,
      "youth": 68,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.4,
      "agingRate": 16.5,
      "farmCount": 6721,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 295.8
    }
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "sidoSgisCode": "11",
    "totalScore": 61.4,
    "dimensions": {
      "populationTrend": 93,
      "youth": 64,
      "farm": 56,
      "density": 17
    },
    "raw": {
      "populationChangePct": 8.3,
      "agingRate": 17.3,
      "farmCount": 466,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 18245.4
    }
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "sidoSgisCode": "21",
    "totalScore": 60.8,
    "dimensions": {
      "populationTrend": 89,
      "youth": 41,
      "farm": 73,
      "density": 18
    },
    "raw": {
      "populationChangePct": -0.1,
      "agingRate": 21.8,
      "farmCount": 395,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 16535.7
    }
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "sidoSgisCode": "31",
    "totalScore": 60.7,
    "dimensions": {
      "populationTrend": 92,
      "youth": 53,
      "farm": 27,
      "density": 100
    },
    "raw": {
      "populationChangePct": 1.2,
      "agingRate": 19.4,
      "farmCount": 6035,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 197.9
    }
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "sidoSgisCode": "36",
    "totalScore": 60.4,
    "dimensions": {
      "populationTrend": 81,
      "youth": 44,
      "farm": 46,
      "density": 87
    },
    "raw": {
      "populationChangePct": -1,
      "agingRate": 21.2,
      "farmCount": 7948,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 532.7
    }
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "sidoSgisCode": "31",
    "totalScore": 60.2,
    "dimensions": {
      "populationTrend": 70,
      "youth": 78,
      "farm": 44,
      "density": 52
    },
    "raw": {
      "populationChangePct": 36.6,
      "agingRate": 14.5,
      "farmCount": 357,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 2047
    }
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "sidoSgisCode": "33",
    "totalScore": 60.2,
    "dimensions": {
      "populationTrend": 65,
      "youth": 47,
      "farm": 49,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.8,
      "agingRate": 20.6,
      "farmCount": 6318,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 197.1
    }
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "sidoSgisCode": "31",
    "totalScore": 60.1,
    "dimensions": {
      "populationTrend": 70,
      "youth": 81,
      "farm": 46,
      "density": 42
    },
    "raw": {
      "populationChangePct": 32.1,
      "agingRate": 13.9,
      "farmCount": 1078,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 3387.5
    }
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "sidoSgisCode": "31",
    "totalScore": 60.1,
    "dimensions": {
      "populationTrend": 93,
      "youth": 34,
      "farm": 38,
      "density": 100
    },
    "raw": {
      "populationChangePct": 1.5,
      "agingRate": 23.3,
      "farmCount": 6878,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 187.3
    }
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "sidoSgisCode": "11",
    "totalScore": 60,
    "dimensions": {
      "populationTrend": 50,
      "youth": 73,
      "farm": 77,
      "density": 15
    },
    "raw": {
      "populationChangePct": -4.4,
      "agingRate": 15.5,
      "farmCount": 469,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 20311.8
    }
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "sidoSgisCode": "22",
    "totalScore": 59.9,
    "dimensions": {
      "populationTrend": 79,
      "youth": 70,
      "farm": 51,
      "density": 32
    },
    "raw": {
      "populationChangePct": -1.2,
      "agingRate": 16,
      "farmCount": 3640,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 4675.4
    }
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "sidoSgisCode": "35",
    "totalScore": 59.4,
    "dimensions": {
      "populationTrend": 71,
      "youth": 49,
      "farm": 50,
      "density": 79
    },
    "raw": {
      "populationChangePct": -2.1,
      "agingRate": 20.2,
      "farmCount": 6659,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 672.7
    }
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "sidoSgisCode": "23",
    "totalScore": 58.9,
    "dimensions": {
      "populationTrend": 44,
      "youth": 68,
      "farm": 80,
      "density": 19
    },
    "raw": {
      "populationChangePct": -5.1,
      "agingRate": 16.5,
      "farmCount": 934,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 15580.2
    }
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "sidoSgisCode": "22",
    "totalScore": 58.7,
    "dimensions": {
      "populationTrend": 41,
      "youth": 69,
      "farm": 78,
      "density": 26
    },
    "raw": {
      "populationChangePct": -5.5,
      "agingRate": 16.3,
      "farmCount": 4920,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 8743.6
    }
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "sidoSgisCode": "24",
    "totalScore": 58.5,
    "dimensions": {
      "populationTrend": 44,
      "youth": 69,
      "farm": 74,
      "density": 29
    },
    "raw": {
      "populationChangePct": -5.1,
      "agingRate": 16.2,
      "farmCount": 3104,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 5998.6
    }
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "sidoSgisCode": "11",
    "totalScore": 58.1,
    "dimensions": {
      "populationTrend": 52,
      "youth": 68,
      "farm": 76,
      "density": 10
    },
    "raw": {
      "populationChangePct": -4.2,
      "agingRate": 16.5,
      "farmCount": 451,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 24539.1
    }
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "sidoSgisCode": "11",
    "totalScore": 58,
    "dimensions": {
      "populationTrend": 70,
      "youth": 57,
      "farm": 69,
      "density": 14
    },
    "raw": {
      "populationChangePct": -2.2,
      "agingRate": 18.5,
      "farmCount": 505,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 21075.4
    }
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "sidoSgisCode": "37",
    "totalScore": 57.9,
    "dimensions": {
      "populationTrend": 76,
      "youth": 27,
      "farm": 49,
      "density": 100
    },
    "raw": {
      "populationChangePct": -1.6,
      "agingRate": 24.7,
      "farmCount": 12235,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 136.4
    }
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "sidoSgisCode": "21",
    "totalScore": 57.4,
    "dimensions": {
      "populationTrend": 92,
      "youth": 64,
      "farm": 22,
      "density": 71
    },
    "raw": {
      "populationChangePct": 8.8,
      "agingRate": 17.3,
      "farmCount": 1850,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 800.3
    }
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "sidoSgisCode": "11",
    "totalScore": 57,
    "dimensions": {
      "populationTrend": 61,
      "youth": 53,
      "farm": 75,
      "density": 15
    },
    "raw": {
      "populationChangePct": -3.2,
      "agingRate": 19.4,
      "farmCount": 628,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 20493.4
    }
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "sidoSgisCode": "38",
    "totalScore": 57,
    "dimensions": {
      "populationTrend": 32,
      "youth": 86,
      "farm": 43,
      "density": 83
    },
    "raw": {
      "populationChangePct": -6.4,
      "agingRate": 12.9,
      "farmCount": 5425,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 589.3
    }
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "sidoSgisCode": "11",
    "totalScore": 56.6,
    "dimensions": {
      "populationTrend": 71,
      "youth": 61,
      "farm": 63,
      "density": 10
    },
    "raw": {
      "populationChangePct": -2.1,
      "agingRate": 17.9,
      "farmCount": 324,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 24663.1
    }
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "sidoSgisCode": "24",
    "totalScore": 56.4,
    "dimensions": {
      "populationTrend": 78,
      "youth": 53,
      "farm": 50,
      "density": 41
    },
    "raw": {
      "populationChangePct": -1.3,
      "agingRate": 19.3,
      "farmCount": 2840,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 3515.7
    }
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "sidoSgisCode": "21",
    "totalScore": 56.3,
    "dimensions": {
      "populationTrend": 88,
      "youth": 31,
      "farm": 68,
      "density": 18
    },
    "raw": {
      "populationChangePct": -0.2,
      "agingRate": 23.9,
      "farmCount": 306,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 16651
    }
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "sidoSgisCode": "31",
    "totalScore": 56.2,
    "dimensions": {
      "populationTrend": 36,
      "youth": 72,
      "farm": 71,
      "density": 29
    },
    "raw": {
      "populationChangePct": -6,
      "agingRate": 15.7,
      "farmCount": 656,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 5527.3
    }
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "sidoSgisCode": "22",
    "totalScore": 55.8,
    "dimensions": {
      "populationTrend": 55,
      "youth": 62,
      "farm": 63,
      "density": 30
    },
    "raw": {
      "populationChangePct": -3.9,
      "agingRate": 17.7,
      "farmCount": 4020,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 5257.5
    }
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "sidoSgisCode": "23",
    "totalScore": 55.7,
    "dimensions": {
      "populationTrend": 47,
      "youth": 72,
      "farm": 63,
      "density": 26
    },
    "raw": {
      "populationChangePct": -4.8,
      "agingRate": 15.7,
      "farmCount": 1110,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 8959.2
    }
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "sidoSgisCode": "34",
    "totalScore": 55.7,
    "dimensions": {
      "populationTrend": 67,
      "youth": 27,
      "farm": 49,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.6,
      "agingRate": 24.6,
      "farmCount": 10029,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 226.1
    }
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "sidoSgisCode": "37",
    "totalScore": 55.5,
    "dimensions": {
      "populationTrend": 35,
      "youth": 64,
      "farm": 45,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.1,
      "agingRate": 17.2,
      "farmCount": 5074,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 251.8
    }
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "sidoSgisCode": "36",
    "totalScore": 55.3,
    "dimensions": {
      "populationTrend": 42,
      "youth": 56,
      "farm": 73,
      "density": 35
    },
    "raw": {
      "populationChangePct": -5.3,
      "agingRate": 18.9,
      "farmCount": 2086,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 4382
    }
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "sidoSgisCode": "11",
    "totalScore": 55.1,
    "dimensions": {
      "populationTrend": 55,
      "youth": 64,
      "farm": 63,
      "density": 22
    },
    "raw": {
      "populationChangePct": -3.9,
      "agingRate": 17.1,
      "farmCount": 807,
      "avgFarmPopulation": 2.8,
      "densityPerKm2": 13417
    }
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "sidoSgisCode": "37",
    "totalScore": 54.9,
    "dimensions": {
      "populationTrend": 75,
      "youth": 34,
      "farm": 36,
      "density": 100
    },
    "raw": {
      "populationChangePct": -1.7,
      "agingRate": 23.1,
      "farmCount": 12553,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 196.1
    }
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "sidoSgisCode": "23",
    "totalScore": 54.8,
    "dimensions": {
      "populationTrend": 96,
      "youth": 0,
      "farm": 45,
      "density": 100
    },
    "raw": {
      "populationChangePct": 3.1,
      "agingRate": 35.2,
      "farmCount": 6415,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 161.5
    }
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "sidoSgisCode": "11",
    "totalScore": 54.7,
    "dimensions": {
      "populationTrend": 77,
      "youth": 71,
      "farm": 41,
      "density": 22
    },
    "raw": {
      "populationChangePct": -1.5,
      "agingRate": 15.8,
      "farmCount": 495,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 12662
    }
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "sidoSgisCode": "24",
    "totalScore": 54.4,
    "dimensions": {
      "populationTrend": 59,
      "youth": 68,
      "farm": 47,
      "density": 41
    },
    "raw": {
      "populationChangePct": -3.4,
      "agingRate": 16.4,
      "farmCount": 4629,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 3598.3
    }
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "sidoSgisCode": "23",
    "totalScore": 54.2,
    "dimensions": {
      "populationTrend": 33,
      "youth": 74,
      "farm": 66,
      "density": 29
    },
    "raw": {
      "populationChangePct": -6.3,
      "agingRate": 15.2,
      "farmCount": 933,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 6322.6
    }
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "sidoSgisCode": "35",
    "totalScore": 54.2,
    "dimensions": {
      "populationTrend": 36,
      "youth": 44,
      "farm": 61,
      "density": 86
    },
    "raw": {
      "populationChangePct": -6,
      "agingRate": 21.2,
      "farmCount": 10590,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 546.4
    }
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "sidoSgisCode": "21",
    "totalScore": 53.9,
    "dimensions": {
      "populationTrend": 41,
      "youth": 50,
      "farm": 77,
      "density": 28
    },
    "raw": {
      "populationChangePct": -5.5,
      "agingRate": 20,
      "farmCount": 1217,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 6999.7
    }
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "sidoSgisCode": "38",
    "totalScore": 53.9,
    "dimensions": {
      "populationTrend": 67,
      "youth": 31,
      "farm": 41,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.6,
      "agingRate": 23.8,
      "farmCount": 5785,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 274.6
    }
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "sidoSgisCode": "31",
    "totalScore": 53.2,
    "dimensions": {
      "populationTrend": 64,
      "youth": 71,
      "farm": 43,
      "density": 29
    },
    "raw": {
      "populationChangePct": -2.9,
      "agingRate": 15.9,
      "farmCount": 1508,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 6382.7
    }
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "sidoSgisCode": "11",
    "totalScore": 53.1,
    "dimensions": {
      "populationTrend": 93,
      "youth": 66,
      "farm": 30,
      "density": 19
    },
    "raw": {
      "populationChangePct": 1.6,
      "agingRate": 16.8,
      "farmCount": 215,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 16366.8
    }
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "sidoSgisCode": "32",
    "totalScore": 53,
    "dimensions": {
      "populationTrend": 93,
      "youth": 0,
      "farm": 42,
      "density": 100
    },
    "raw": {
      "populationChangePct": 1.7,
      "agingRate": 32,
      "farmCount": 4879,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 45
    }
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "sidoSgisCode": "22",
    "totalScore": 52.6,
    "dimensions": {
      "populationTrend": 91,
      "youth": 49,
      "farm": 40,
      "density": 24
    },
    "raw": {
      "populationChangePct": 0.7,
      "agingRate": 20.1,
      "farmCount": 250,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 10979
    }
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "sidoSgisCode": "37",
    "totalScore": 52.6,
    "dimensions": {
      "populationTrend": 97,
      "youth": 0,
      "farm": 38,
      "density": 100
    },
    "raw": {
      "populationChangePct": 6.6,
      "agingRate": 31.5,
      "farmCount": 7139,
      "avgFarmPopulation": 2,
      "densityPerKm2": 82.3
    }
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "sidoSgisCode": "32",
    "totalScore": 52.5,
    "dimensions": {
      "populationTrend": 94,
      "youth": 38,
      "farm": 18,
      "density": 88
    },
    "raw": {
      "populationChangePct": 1.8,
      "agingRate": 22.4,
      "farmCount": 2817,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 18.8
    }
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "sidoSgisCode": "32",
    "totalScore": 52.2,
    "dimensions": {
      "populationTrend": 97,
      "youth": 0,
      "farm": 37,
      "density": 100
    },
    "raw": {
      "populationChangePct": 3.6,
      "agingRate": 32.7,
      "farmCount": 2733,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 42.2
    }
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "sidoSgisCode": "23",
    "totalScore": 52,
    "dimensions": {
      "populationTrend": 73,
      "youth": 74,
      "farm": 20,
      "density": 55
    },
    "raw": {
      "populationChangePct": 26.1,
      "agingRate": 15.3,
      "farmCount": 521,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 1703.4
    }
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "sidoSgisCode": "11",
    "totalScore": 51.6,
    "dimensions": {
      "populationTrend": 82,
      "youth": 60,
      "farm": 39,
      "density": 16
    },
    "raw": {
      "populationChangePct": -0.9,
      "agingRate": 18,
      "farmCount": 152,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 18999.6
    }
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "sidoSgisCode": "31",
    "totalScore": 51.6,
    "dimensions": {
      "populationTrend": 99,
      "youth": 11,
      "farm": 26,
      "density": 100
    },
    "raw": {
      "populationChangePct": 5.3,
      "agingRate": 27.9,
      "farmCount": 6149,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 133.2
    }
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "sidoSgisCode": "11",
    "totalScore": 51.5,
    "dimensions": {
      "populationTrend": 76,
      "youth": 76,
      "farm": 30,
      "density": 20
    },
    "raw": {
      "populationChangePct": -1.6,
      "agingRate": 14.8,
      "farmCount": 143,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 15202
    }
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "sidoSgisCode": "23",
    "totalScore": 51.3,
    "dimensions": {
      "populationTrend": 90,
      "youth": 59,
      "farm": 32,
      "density": 19
    },
    "raw": {
      "populationChangePct": 0,
      "agingRate": 18.2,
      "farmCount": 244,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 16467.2
    }
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "sidoSgisCode": "37",
    "totalScore": 51.1,
    "dimensions": {
      "populationTrend": 92,
      "youth": 2,
      "farm": 36,
      "density": 100
    },
    "raw": {
      "populationChangePct": 1.1,
      "agingRate": 29.6,
      "farmCount": 8758,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 108.4
    }
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "sidoSgisCode": "11",
    "totalScore": 50.9,
    "dimensions": {
      "populationTrend": 88,
      "youth": 65,
      "farm": 29,
      "density": 17
    },
    "raw": {
      "populationChangePct": -0.2,
      "agingRate": 17,
      "farmCount": 165,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 18075.4
    }
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "sidoSgisCode": "11",
    "totalScore": 50.7,
    "dimensions": {
      "populationTrend": 85,
      "youth": 64,
      "farm": 31,
      "density": 17
    },
    "raw": {
      "populationChangePct": -0.6,
      "agingRate": 17.3,
      "farmCount": 234,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 17742.6
    }
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "sidoSgisCode": "36",
    "totalScore": 50.5,
    "dimensions": {
      "populationTrend": 76,
      "youth": 24,
      "farm": 30,
      "density": 100
    },
    "raw": {
      "populationChangePct": -1.6,
      "agingRate": 25.1,
      "farmCount": 6761,
      "avgFarmPopulation": 2,
      "densityPerKm2": 93.1
    }
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "sidoSgisCode": "11",
    "totalScore": 48.8,
    "dimensions": {
      "populationTrend": 64,
      "youth": 63,
      "farm": 44,
      "density": 11
    },
    "raw": {
      "populationChangePct": -2.9,
      "agingRate": 17.4,
      "farmCount": 223,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 23645.6
    }
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "sidoSgisCode": "21",
    "totalScore": 48.4,
    "dimensions": {
      "populationTrend": 46,
      "youth": 51,
      "farm": 57,
      "density": 28
    },
    "raw": {
      "populationChangePct": -4.9,
      "agingRate": 19.8,
      "farmCount": 1217,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 7332.8
    }
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "sidoSgisCode": "31",
    "totalScore": 48.2,
    "dimensions": {
      "populationTrend": 0,
      "youth": 71,
      "farm": 75,
      "density": 28
    },
    "raw": {
      "populationChangePct": -12.2,
      "agingRate": 15.8,
      "farmCount": 842,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 7377.4
    }
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "sidoSgisCode": "25",
    "totalScore": 48.2,
    "dimensions": {
      "populationTrend": 43,
      "youth": 62,
      "farm": 42,
      "density": 48
    },
    "raw": {
      "populationChangePct": -5.2,
      "agingRate": 17.6,
      "farmCount": 1846,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 2548.8
    }
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "sidoSgisCode": "11",
    "totalScore": 48,
    "dimensions": {
      "populationTrend": 75,
      "youth": 53,
      "farm": 37,
      "density": 20
    },
    "raw": {
      "populationChangePct": -1.7,
      "agingRate": 19.3,
      "farmCount": 318,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 15302.9
    }
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "sidoSgisCode": "35",
    "totalScore": 48,
    "dimensions": {
      "populationTrend": 60,
      "youth": 34,
      "farm": 27,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.3,
      "agingRate": 23.2,
      "farmCount": 7500,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 115.4
    }
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "sidoSgisCode": "24",
    "totalScore": 47.7,
    "dimensions": {
      "populationTrend": 87,
      "youth": 43,
      "farm": 22,
      "density": 50
    },
    "raw": {
      "populationChangePct": 11.3,
      "agingRate": 21.5,
      "farmCount": 920,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 2280.2
    }
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "sidoSgisCode": "36",
    "totalScore": 47.7,
    "dimensions": {
      "populationTrend": 86,
      "youth": 0,
      "farm": 32,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.4,
      "agingRate": 32.5,
      "farmCount": 5426,
      "avgFarmPopulation": 2,
      "densityPerKm2": 95.8
    }
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "sidoSgisCode": "36",
    "totalScore": 47.4,
    "dimensions": {
      "populationTrend": 86,
      "youth": 0,
      "farm": 31,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.5,
      "agingRate": 30.4,
      "farmCount": 5065,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 103.9
    }
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "sidoSgisCode": "26",
    "totalScore": 47.1,
    "dimensions": {
      "populationTrend": 21,
      "youth": 77,
      "farm": 49,
      "density": 36
    },
    "raw": {
      "populationChangePct": -7.7,
      "agingRate": 14.7,
      "farmCount": 672,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 4262.1
    }
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "sidoSgisCode": "11",
    "totalScore": 46.7,
    "dimensions": {
      "populationTrend": 66,
      "youth": 68,
      "farm": 30,
      "density": 18
    },
    "raw": {
      "populationChangePct": -2.7,
      "agingRate": 16.5,
      "farmCount": 228,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 16798.9
    }
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "sidoSgisCode": "37",
    "totalScore": 46.6,
    "dimensions": {
      "populationTrend": 80,
      "youth": 0,
      "farm": 33,
      "density": 100
    },
    "raw": {
      "populationChangePct": -1.1,
      "agingRate": 34.4,
      "farmCount": 5060,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 66.3
    }
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "sidoSgisCode": "31",
    "totalScore": 46.5,
    "dimensions": {
      "populationTrend": 59,
      "youth": 40,
      "farm": 36,
      "density": 61
    },
    "raw": {
      "populationChangePct": -3.5,
      "agingRate": 22,
      "farmCount": 837,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 984.1
    }
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "sidoSgisCode": "31",
    "totalScore": 46.3,
    "dimensions": {
      "populationTrend": 87,
      "youth": 10,
      "farm": 20,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.3,
      "agingRate": 28,
      "farmCount": 3751,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 70.8
    }
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "sidoSgisCode": "26",
    "totalScore": 46.1,
    "dimensions": {
      "populationTrend": 1,
      "youth": 61,
      "farm": 75,
      "density": 29
    },
    "raw": {
      "populationChangePct": -9.9,
      "agingRate": 17.8,
      "farmCount": 2479,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 5527.3
    }
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "sidoSgisCode": "21",
    "totalScore": 45.8,
    "dimensions": {
      "populationTrend": 72,
      "youth": 44,
      "farm": 38,
      "density": 23
    },
    "raw": {
      "populationChangePct": -2,
      "agingRate": 21.2,
      "farmCount": 482,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 11810.8
    }
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "sidoSgisCode": "25",
    "totalScore": 45.7,
    "dimensions": {
      "populationTrend": 68,
      "youth": 51,
      "farm": 22,
      "density": 55
    },
    "raw": {
      "populationChangePct": -2.5,
      "agingRate": 19.9,
      "farmCount": 1884,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 1691.7
    }
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "sidoSgisCode": "38",
    "totalScore": 45.7,
    "dimensions": {
      "populationTrend": 32,
      "youth": 42,
      "farm": 40,
      "density": 88
    },
    "raw": {
      "populationChangePct": -6.4,
      "agingRate": 21.7,
      "farmCount": 3376,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 512.9
    }
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "sidoSgisCode": "34",
    "totalScore": 45.3,
    "dimensions": {
      "populationTrend": 86,
      "youth": 0,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.5,
      "agingRate": 32.9,
      "farmCount": 6580,
      "avgFarmPopulation": 2,
      "densityPerKm2": 117.7
    }
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "sidoSgisCode": "34",
    "totalScore": 45.2,
    "dimensions": {
      "populationTrend": 66,
      "youth": 0,
      "farm": 39,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.7,
      "agingRate": 32.5,
      "farmCount": 9273,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 141.8
    }
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "sidoSgisCode": "33",
    "totalScore": 45.1,
    "dimensions": {
      "populationTrend": 52,
      "youth": 29,
      "farm": 28,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.2,
      "agingRate": 24.2,
      "farmCount": 6383,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 147.7
    }
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "sidoSgisCode": "23",
    "totalScore": 45,
    "dimensions": {
      "populationTrend": 91,
      "youth": 5,
      "farm": 17,
      "density": 100
    },
    "raw": {
      "populationChangePct": 0.6,
      "agingRate": 29,
      "farmCount": 1133,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 117.4
    }
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "sidoSgisCode": "37",
    "totalScore": 44.9,
    "dimensions": {
      "populationTrend": 72,
      "youth": 0,
      "farm": 34,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2,
      "agingRate": 39.6,
      "farmCount": 6791,
      "avgFarmPopulation": 2,
      "densityPerKm2": 57.7
    }
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "sidoSgisCode": "11",
    "totalScore": 44.8,
    "dimensions": {
      "populationTrend": 59,
      "youth": 66,
      "farm": 28,
      "density": 25
    },
    "raw": {
      "populationChangePct": -3.4,
      "agingRate": 16.8,
      "farmCount": 78,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 10026.6
    }
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "sidoSgisCode": "36",
    "totalScore": 44.7,
    "dimensions": {
      "populationTrend": 86,
      "youth": 6,
      "farm": 19,
      "density": 100
    },
    "raw": {
      "populationChangePct": -0.4,
      "agingRate": 28.9,
      "farmCount": 5893,
      "avgFarmPopulation": 2,
      "densityPerKm2": 76
    }
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "sidoSgisCode": "37",
    "totalScore": 44.5,
    "dimensions": {
      "populationTrend": 56,
      "youth": 20,
      "farm": 30,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.8,
      "agingRate": 26,
      "farmCount": 12088,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 102.6
    }
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "sidoSgisCode": "22",
    "totalScore": 44.3,
    "dimensions": {
      "populationTrend": 65,
      "youth": 42,
      "farm": 27,
      "density": 54
    },
    "raw": {
      "populationChangePct": -2.8,
      "agingRate": 21.7,
      "farmCount": 4527,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 1827.8
    }
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "sidoSgisCode": "37",
    "totalScore": 44.2,
    "dimensions": {
      "populationTrend": 43,
      "youth": 5,
      "farm": 49,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.2,
      "agingRate": 29,
      "farmCount": 8248,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 151.7
    }
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "sidoSgisCode": "34",
    "totalScore": 44.1,
    "dimensions": {
      "populationTrend": 46,
      "youth": 13,
      "farm": 41,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.9,
      "agingRate": 27.5,
      "farmCount": 9882,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 210.6
    }
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "sidoSgisCode": "38",
    "totalScore": 44,
    "dimensions": {
      "populationTrend": 71,
      "youth": 0,
      "farm": 32,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.1,
      "agingRate": 30.3,
      "farmCount": 9169,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 127.1
    }
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "sidoSgisCode": "11",
    "totalScore": 43.7,
    "dimensions": {
      "populationTrend": 32,
      "youth": 72,
      "farm": 39,
      "density": 27
    },
    "raw": {
      "populationChangePct": -6.4,
      "agingRate": 15.7,
      "farmCount": 540,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 8156.3
    }
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "sidoSgisCode": "32",
    "totalScore": 42.8,
    "dimensions": {
      "populationTrend": 38,
      "youth": 34,
      "farm": 28,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.8,
      "agingRate": 23.3,
      "farmCount": 2280,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 29.7
    }
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "sidoSgisCode": "37",
    "totalScore": 42.8,
    "dimensions": {
      "populationTrend": 72,
      "youth": 0,
      "farm": 28,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2,
      "agingRate": 32.7,
      "farmCount": 6894,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 74.1
    }
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "sidoSgisCode": "32",
    "totalScore": 42.5,
    "dimensions": {
      "populationTrend": 64,
      "youth": 1,
      "farm": 32,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.9,
      "agingRate": 29.8,
      "farmCount": 6788,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 35.8
    }
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "sidoSgisCode": "34",
    "totalScore": 42.4,
    "dimensions": {
      "populationTrend": 57,
      "youth": 12,
      "farm": 29,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.7,
      "agingRate": 27.7,
      "farmCount": 7792,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 169.6
    }
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "sidoSgisCode": "32",
    "totalScore": 42.1,
    "dimensions": {
      "populationTrend": 25,
      "youth": 26,
      "farm": 41,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7.2,
      "agingRate": 24.8,
      "farmCount": 3806,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 45.8
    }
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "sidoSgisCode": "33",
    "totalScore": 42,
    "dimensions": {
      "populationTrend": 59,
      "youth": 0,
      "farm": 35,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.5,
      "agingRate": 32.3,
      "farmCount": 5267,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 89.4
    }
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "sidoSgisCode": "35",
    "totalScore": 42,
    "dimensions": {
      "populationTrend": 56,
      "youth": 0,
      "farm": 37,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.8,
      "agingRate": 33.4,
      "farmCount": 7306,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 143.6
    }
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "sidoSgisCode": "36",
    "totalScore": 42,
    "dimensions": {
      "populationTrend": 77,
      "youth": 0,
      "farm": 22,
      "density": 100
    },
    "raw": {
      "populationChangePct": -1.4,
      "agingRate": 34.2,
      "farmCount": 3779,
      "avgFarmPopulation": 2,
      "densityPerKm2": 65.8
    }
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "sidoSgisCode": "34",
    "totalScore": 41.5,
    "dimensions": {
      "populationTrend": 57,
      "youth": 14,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.7,
      "agingRate": 27.1,
      "farmCount": 9281,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 122.7
    }
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "sidoSgisCode": "33",
    "totalScore": 41.4,
    "dimensions": {
      "populationTrend": 76,
      "youth": 0,
      "farm": 21,
      "density": 100
    },
    "raw": {
      "populationChangePct": -1.6,
      "agingRate": 34.9,
      "farmCount": 5187,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 44.9
    }
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "sidoSgisCode": "35",
    "totalScore": 41.3,
    "dimensions": {
      "populationTrend": 49,
      "youth": 3,
      "farm": 38,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.6,
      "agingRate": 29.5,
      "farmCount": 9953,
      "avgFarmPopulation": 2,
      "densityPerKm2": 149.1
    }
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "sidoSgisCode": "11",
    "totalScore": 41.1,
    "dimensions": {
      "populationTrend": 18,
      "youth": 67,
      "farm": 49,
      "density": 18
    },
    "raw": {
      "populationChangePct": -8,
      "agingRate": 16.6,
      "farmCount": 250,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 16733.7
    }
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "sidoSgisCode": "36",
    "totalScore": 41,
    "dimensions": {
      "populationTrend": 59,
      "youth": 0,
      "farm": 32,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.4,
      "agingRate": 43,
      "farmCount": 10062,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 75.3
    }
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "sidoSgisCode": "11",
    "totalScore": 40.8,
    "dimensions": {
      "populationTrend": 59,
      "youth": 56,
      "farm": 25,
      "density": 22
    },
    "raw": {
      "populationChangePct": -3.5,
      "agingRate": 18.9,
      "farmCount": 37,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 12576
    }
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "sidoSgisCode": "37",
    "totalScore": 40.8,
    "dimensions": {
      "populationTrend": 50,
      "youth": 0,
      "farm": 38,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.5,
      "agingRate": 33.1,
      "farmCount": 12582,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 74.3
    }
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "sidoSgisCode": "38",
    "totalScore": 40.8,
    "dimensions": {
      "populationTrend": 43,
      "youth": 0,
      "farm": 43,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.2,
      "agingRate": 39.2,
      "farmCount": 5792,
      "avgFarmPopulation": 2,
      "densityPerKm2": 113.2
    }
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "sidoSgisCode": "38",
    "totalScore": 40.7,
    "dimensions": {
      "populationTrend": 70,
      "youth": 2,
      "farm": 22,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.2,
      "agingRate": 29.7,
      "farmCount": 6503,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 73
    }
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "sidoSgisCode": "25",
    "totalScore": 40.3,
    "dimensions": {
      "populationTrend": 33,
      "youth": 41,
      "farm": 45,
      "density": 40
    },
    "raw": {
      "populationChangePct": -6.3,
      "agingRate": 21.8,
      "farmCount": 1942,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 3607.2
    }
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "sidoSgisCode": "21",
    "totalScore": 40.2,
    "dimensions": {
      "populationTrend": 25,
      "youth": 42,
      "farm": 55,
      "density": 28
    },
    "raw": {
      "populationChangePct": -7.2,
      "agingRate": 21.6,
      "farmCount": 910,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 7252.3
    }
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "sidoSgisCode": "32",
    "totalScore": 39.6,
    "dimensions": {
      "populationTrend": 58,
      "youth": 1,
      "farm": 28,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.6,
      "agingRate": 29.8,
      "farmCount": 2125,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 40.8
    }
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "sidoSgisCode": "36",
    "totalScore": 39.5,
    "dimensions": {
      "populationTrend": 56,
      "youth": 0,
      "farm": 30,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.8,
      "agingRate": 31.9,
      "farmCount": 5352,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 77.7
    }
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "sidoSgisCode": "32",
    "totalScore": 39.1,
    "dimensions": {
      "populationTrend": 42,
      "youth": 18,
      "farm": 26,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.3,
      "agingRate": 26.3,
      "farmCount": 3974,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 54.2
    }
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "sidoSgisCode": "36",
    "totalScore": 39,
    "dimensions": {
      "populationTrend": 44,
      "youth": 0,
      "farm": 37,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.1,
      "agingRate": 38.9,
      "farmCount": 5346,
      "avgFarmPopulation": 2,
      "densityPerKm2": 74
    }
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "sidoSgisCode": "36",
    "totalScore": 38.9,
    "dimensions": {
      "populationTrend": 62,
      "youth": 0,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.1,
      "agingRate": 32.8,
      "farmCount": 3378,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 118.3
    }
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "sidoSgisCode": "32",
    "totalScore": 38.1,
    "dimensions": {
      "populationTrend": 60,
      "youth": 0,
      "farm": 23,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.3,
      "agingRate": 31.7,
      "farmCount": 3915,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 26.4
    }
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "sidoSgisCode": "11",
    "totalScore": 37.9,
    "dimensions": {
      "populationTrend": 26,
      "youth": 60,
      "farm": 38,
      "density": 21
    },
    "raw": {
      "populationChangePct": -7.1,
      "agingRate": 18.1,
      "farmCount": 437,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 14007.4
    }
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "sidoSgisCode": "37",
    "totalScore": 37.7,
    "dimensions": {
      "populationTrend": 57,
      "youth": 0,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.7,
      "agingRate": 44.7,
      "farmCount": 8494,
      "avgFarmPopulation": 2,
      "densityPerKm2": 40.6
    }
  },
  {
    "sgisCode": "11010",
    "name": "종로구",
    "sidoSgisCode": "11",
    "totalScore": 37.6,
    "dimensions": {
      "populationTrend": 31,
      "youth": 60,
      "farm": 30,
      "density": 29
    },
    "raw": {
      "populationChangePct": -6.6,
      "agingRate": 18,
      "farmCount": 77,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 6169.5
    }
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "sidoSgisCode": "32",
    "totalScore": 37.4,
    "dimensions": {
      "populationTrend": 63,
      "youth": 0,
      "farm": 19,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3,
      "agingRate": 32.6,
      "farmCount": 3047,
      "avgFarmPopulation": 2,
      "densityPerKm2": 31.6
    }
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "sidoSgisCode": "35",
    "totalScore": 37.2,
    "dimensions": {
      "populationTrend": 34,
      "youth": 0,
      "farm": 39,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.2,
      "agingRate": 35.6,
      "farmCount": 7364,
      "avgFarmPopulation": 2,
      "densityPerKm2": 96
    }
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "sidoSgisCode": "35",
    "totalScore": 37,
    "dimensions": {
      "populationTrend": 53,
      "youth": 0,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.1,
      "agingRate": 30.6,
      "farmCount": 6979,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 100
    }
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "sidoSgisCode": "35",
    "totalScore": 36.7,
    "dimensions": {
      "populationTrend": 60,
      "youth": 0,
      "farm": 19,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.3,
      "agingRate": 35.7,
      "farmCount": 4544,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 35.3
    }
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "sidoSgisCode": "38",
    "totalScore": 36.7,
    "dimensions": {
      "populationTrend": 22,
      "youth": 17,
      "farm": 34,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7.6,
      "agingRate": 26.7,
      "farmCount": 5405,
      "avgFarmPopulation": 2,
      "densityPerKm2": 149.9
    }
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "sidoSgisCode": "34",
    "totalScore": 36.4,
    "dimensions": {
      "populationTrend": 49,
      "youth": 0,
      "farm": 26,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.6,
      "agingRate": 37.5,
      "farmCount": 6355,
      "avgFarmPopulation": 2,
      "densityPerKm2": 62.1
    }
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "sidoSgisCode": "36",
    "totalScore": 36.4,
    "dimensions": {
      "populationTrend": 52,
      "youth": 0,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.2,
      "agingRate": 39,
      "farmCount": 6112,
      "avgFarmPopulation": 2,
      "densityPerKm2": 52
    }
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "sidoSgisCode": "36",
    "totalScore": 36.3,
    "dimensions": {
      "populationTrend": 50,
      "youth": 0,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.5,
      "agingRate": 37.9,
      "farmCount": 3943,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 52.3
    }
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "sidoSgisCode": "22",
    "totalScore": 36,
    "dimensions": {
      "populationTrend": 70,
      "youth": 0,
      "farm": 10,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.2,
      "agingRate": 42.6,
      "farmCount": 3771,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 35.5
    }
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "sidoSgisCode": "37",
    "totalScore": 35.9,
    "dimensions": {
      "populationTrend": 44,
      "youth": 13,
      "farm": 19,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.1,
      "agingRate": 27.4,
      "farmCount": 468,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 113.8
    }
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "sidoSgisCode": "31",
    "totalScore": 35.8,
    "dimensions": {
      "populationTrend": 47,
      "youth": 8,
      "farm": 20,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.8,
      "agingRate": 28.5,
      "farmCount": 3079,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 59.3
    }
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "sidoSgisCode": "32",
    "totalScore": 35.8,
    "dimensions": {
      "populationTrend": 37,
      "youth": 25,
      "farm": 15,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.9,
      "agingRate": 25,
      "farmCount": 1840,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 24.8
    }
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "sidoSgisCode": "34",
    "totalScore": 35.8,
    "dimensions": {
      "populationTrend": 37,
      "youth": 0,
      "farm": 33,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.9,
      "agingRate": 38.6,
      "farmCount": 5940,
      "avgFarmPopulation": 2,
      "densityPerKm2": 135.4
    }
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "sidoSgisCode": "35",
    "totalScore": 35.8,
    "dimensions": {
      "populationTrend": 65,
      "youth": 0,
      "farm": 13,
      "density": 100
    },
    "raw": {
      "populationChangePct": -2.8,
      "agingRate": 37.5,
      "farmCount": 3462,
      "avgFarmPopulation": 2,
      "densityPerKm2": 28.7
    }
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "sidoSgisCode": "21",
    "totalScore": 35.8,
    "dimensions": {
      "populationTrend": 71,
      "youth": 17,
      "farm": 28,
      "density": 27
    },
    "raw": {
      "populationChangePct": -2.1,
      "agingRate": 26.6,
      "farmCount": 85,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 7519.7
    }
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "sidoSgisCode": "11",
    "totalScore": 35.6,
    "dimensions": {
      "populationTrend": 24,
      "youth": 42,
      "farm": 46,
      "density": 20
    },
    "raw": {
      "populationChangePct": -7.3,
      "agingRate": 21.6,
      "farmCount": 326,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 14713.9
    }
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "sidoSgisCode": "21",
    "totalScore": 35.6,
    "dimensions": {
      "populationTrend": 93,
      "youth": 10,
      "farm": 17,
      "density": 26
    },
    "raw": {
      "populationChangePct": 1.6,
      "agingRate": 28,
      "farmCount": 84,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 8830.2
    }
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "sidoSgisCode": "38",
    "totalScore": 35.4,
    "dimensions": {
      "populationTrend": 34,
      "youth": 0,
      "farm": 34,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.2,
      "agingRate": 32.8,
      "farmCount": 6498,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 110.4
    }
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "sidoSgisCode": "22",
    "totalScore": 35.3,
    "dimensions": {
      "populationTrend": 45,
      "youth": 24,
      "farm": 40,
      "density": 27
    },
    "raw": {
      "populationChangePct": -5,
      "agingRate": 25.1,
      "farmCount": 613,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 8180.9
    }
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "sidoSgisCode": "37",
    "totalScore": 35.3,
    "dimensions": {
      "populationTrend": 53,
      "youth": 0,
      "farm": 20,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.1,
      "agingRate": 40.5,
      "farmCount": 5094,
      "avgFarmPopulation": 2,
      "densityPerKm2": 27.4
    }
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "sidoSgisCode": "34",
    "totalScore": 35.2,
    "dimensions": {
      "populationTrend": 47,
      "youth": 0,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.8,
      "agingRate": 31,
      "farmCount": 6001,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 91
    }
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "sidoSgisCode": "35",
    "totalScore": 35.1,
    "dimensions": {
      "populationTrend": 30,
      "youth": 0,
      "farm": 36,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.7,
      "agingRate": 36.4,
      "farmCount": 7975,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 83.6
    }
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "sidoSgisCode": "21",
    "totalScore": 34.9,
    "dimensions": {
      "populationTrend": 11,
      "youth": 48,
      "farm": 45,
      "density": 29
    },
    "raw": {
      "populationChangePct": -8.8,
      "agingRate": 20.5,
      "farmCount": 654,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 5739
    }
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "sidoSgisCode": "21",
    "totalScore": 34.6,
    "dimensions": {
      "populationTrend": 16,
      "youth": 36,
      "farm": 44,
      "density": 41
    },
    "raw": {
      "populationChangePct": -8.2,
      "agingRate": 22.9,
      "farmCount": 1142,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 3490.1
    }
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "sidoSgisCode": "38",
    "totalScore": 34.3,
    "dimensions": {
      "populationTrend": 56,
      "youth": 0,
      "farm": 15,
      "density": 100
    },
    "raw": {
      "populationChangePct": -3.8,
      "agingRate": 39.5,
      "farmCount": 5128,
      "avgFarmPopulation": 2,
      "densityPerKm2": 41.3
    }
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "sidoSgisCode": "36",
    "totalScore": 34,
    "dimensions": {
      "populationTrend": 41,
      "youth": 0,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.5,
      "agingRate": 36.9,
      "farmCount": 5305,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 62.9
    }
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "sidoSgisCode": "33",
    "totalScore": 33.3,
    "dimensions": {
      "populationTrend": 38,
      "youth": 0,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.8,
      "agingRate": 37.1,
      "farmCount": 4099,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 52.4
    }
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "sidoSgisCode": "38",
    "totalScore": 33.1,
    "dimensions": {
      "populationTrend": 43,
      "youth": 0,
      "farm": 21,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.2,
      "agingRate": 36.8,
      "farmCount": 5529,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 49.7
    }
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "sidoSgisCode": "36",
    "totalScore": 32.9,
    "dimensions": {
      "populationTrend": 38,
      "youth": 0,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.8,
      "agingRate": 34.5,
      "farmCount": 9452,
      "avgFarmPopulation": 2,
      "densityPerKm2": 61.9
    }
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "sidoSgisCode": "37",
    "totalScore": 32.6,
    "dimensions": {
      "populationTrend": 50,
      "youth": 2,
      "farm": 13,
      "density": 100
    },
    "raw": {
      "populationChangePct": -4.4,
      "agingRate": 29.6,
      "farmCount": 3798,
      "avgFarmPopulation": 2,
      "densityPerKm2": 46.5
    }
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "sidoSgisCode": "37",
    "totalScore": 32.5,
    "dimensions": {
      "populationTrend": 21,
      "youth": 0,
      "farm": 35,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7.7,
      "agingRate": 32.8,
      "farmCount": 3618,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 78.4
    }
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "sidoSgisCode": "36",
    "totalScore": 31.9,
    "dimensions": {
      "populationTrend": 34,
      "youth": 0,
      "farm": 24,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.2,
      "agingRate": 36.7,
      "farmCount": 5772,
      "avgFarmPopulation": 2,
      "densityPerKm2": 54.4
    }
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "sidoSgisCode": "34",
    "totalScore": 31.7,
    "dimensions": {
      "populationTrend": 22,
      "youth": 0,
      "farm": 32,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7.6,
      "agingRate": 37.3,
      "farmCount": 9279,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 98.4
    }
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "sidoSgisCode": "38",
    "totalScore": 31.6,
    "dimensions": {
      "populationTrend": 30,
      "youth": 0,
      "farm": 26,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.7,
      "agingRate": 33.4,
      "farmCount": 5271,
      "avgFarmPopulation": 2,
      "densityPerKm2": 93.4
    }
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "sidoSgisCode": "38",
    "totalScore": 31.4,
    "dimensions": {
      "populationTrend": 43,
      "youth": 0,
      "farm": 16,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.2,
      "agingRate": 38.7,
      "farmCount": 3731,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 51.8
    }
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "sidoSgisCode": "35",
    "totalScore": 31.3,
    "dimensions": {
      "populationTrend": 37,
      "youth": 0,
      "farm": 20,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.9,
      "agingRate": 36.8,
      "farmCount": 3984,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 37.6
    }
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "sidoSgisCode": "35",
    "totalScore": 30.9,
    "dimensions": {
      "populationTrend": 41,
      "youth": 0,
      "farm": 16,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.5,
      "agingRate": 38.1,
      "farmCount": 4026,
      "avgFarmPopulation": 2,
      "densityPerKm2": 41.7
    }
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "sidoSgisCode": "36",
    "totalScore": 30.9,
    "dimensions": {
      "populationTrend": 37,
      "youth": 0,
      "farm": 19,
      "density": 100
    },
    "raw": {
      "populationChangePct": -5.9,
      "agingRate": 36.8,
      "farmCount": 4674,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 48.3
    }
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "sidoSgisCode": "11",
    "totalScore": 30.8,
    "dimensions": {
      "populationTrend": 28,
      "youth": 38,
      "farm": 31,
      "density": 23
    },
    "raw": {
      "populationChangePct": -6.9,
      "agingRate": 22.5,
      "farmCount": 194,
      "avgFarmPopulation": 2.6,
      "densityPerKm2": 12194.4
    }
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "sidoSgisCode": "35",
    "totalScore": 30.3,
    "dimensions": {
      "populationTrend": 29,
      "youth": 0,
      "farm": 23,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.8,
      "agingRate": 36.3,
      "farmCount": 4653,
      "avgFarmPopulation": 2,
      "densityPerKm2": 51
    }
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "sidoSgisCode": "21",
    "totalScore": 29.5,
    "dimensions": {
      "populationTrend": 12,
      "youth": 42,
      "farm": 35,
      "density": 25
    },
    "raw": {
      "populationChangePct": -8.7,
      "agingRate": 21.6,
      "farmCount": 333,
      "avgFarmPopulation": 2.5,
      "densityPerKm2": 9622
    }
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "sidoSgisCode": "32",
    "totalScore": 29.2,
    "dimensions": {
      "populationTrend": 33,
      "youth": 0,
      "farm": 17,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.3,
      "agingRate": 30.9,
      "farmCount": 2688,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 27.3
    }
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "sidoSgisCode": "22",
    "totalScore": 29,
    "dimensions": {
      "populationTrend": 0,
      "youth": 22,
      "farm": 56,
      "density": 26
    },
    "raw": {
      "populationChangePct": -12.6,
      "agingRate": 25.6,
      "farmCount": 893,
      "avgFarmPopulation": 2.3,
      "densityPerKm2": 9201.7
    }
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "sidoSgisCode": "38",
    "totalScore": 28.6,
    "dimensions": {
      "populationTrend": 18,
      "youth": 0,
      "farm": 26,
      "density": 100
    },
    "raw": {
      "populationChangePct": -8,
      "agingRate": 38.1,
      "farmCount": 6337,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 58.5
    }
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "sidoSgisCode": "37",
    "totalScore": 28.1,
    "dimensions": {
      "populationTrend": 30,
      "youth": 0,
      "farm": 16,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.7,
      "agingRate": 40.1,
      "farmCount": 5190,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 24
    }
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "sidoSgisCode": "38",
    "totalScore": 27.7,
    "dimensions": {
      "populationTrend": 31,
      "youth": 0,
      "farm": 14,
      "density": 100
    },
    "raw": {
      "populationChangePct": -6.5,
      "agingRate": 42,
      "farmCount": 6935,
      "avgFarmPopulation": 1.9,
      "densityPerKm2": 40.8
    }
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "sidoSgisCode": "21",
    "totalScore": 27.5,
    "dimensions": {
      "populationTrend": 56,
      "youth": 11,
      "farm": 22,
      "density": 20
    },
    "raw": {
      "populationChangePct": -3.8,
      "agingRate": 27.9,
      "farmCount": 28,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 14590.4
    }
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "sidoSgisCode": "36",
    "totalScore": 27.1,
    "dimensions": {
      "populationTrend": 19,
      "youth": 0,
      "farm": 21,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7.9,
      "agingRate": 41.5,
      "farmCount": 5568,
      "avgFarmPopulation": 2,
      "densityPerKm2": 54.6
    }
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "sidoSgisCode": "37",
    "totalScore": 26.4,
    "dimensions": {
      "populationTrend": 26,
      "youth": 0,
      "farm": 14,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7.1,
      "agingRate": 39.8,
      "farmCount": 3314,
      "avgFarmPopulation": 2,
      "densityPerKm2": 45.2
    }
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "sidoSgisCode": "33",
    "totalScore": 26.3,
    "dimensions": {
      "populationTrend": 27,
      "youth": 0,
      "farm": 13,
      "density": 100
    },
    "raw": {
      "populationChangePct": -7,
      "agingRate": 35,
      "farmCount": 3227,
      "avgFarmPopulation": 2,
      "densityPerKm2": 33.9
    }
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "sidoSgisCode": "32",
    "totalScore": 24.8,
    "dimensions": {
      "populationTrend": 0,
      "youth": 11,
      "farm": 20,
      "density": 100
    },
    "raw": {
      "populationChangePct": -10.1,
      "agingRate": 27.9,
      "farmCount": 679,
      "avgFarmPopulation": 2.2,
      "densityPerKm2": 128.9
    }
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "sidoSgisCode": "33",
    "totalScore": 24.8,
    "dimensions": {
      "populationTrend": 4,
      "youth": 0,
      "farm": 25,
      "density": 100
    },
    "raw": {
      "populationChangePct": -9.6,
      "agingRate": 34.9,
      "farmCount": 5958,
      "avgFarmPopulation": 2.1,
      "densityPerKm2": 51.8
    }
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "sidoSgisCode": "37",
    "totalScore": 23.5,
    "dimensions": {
      "populationTrend": 23,
      "youth": 0,
      "farm": 13,
      "density": 88
    },
    "raw": {
      "populationChangePct": -7.4,
      "agingRate": 40.2,
      "farmCount": 2586,
      "avgFarmPopulation": 2,
      "densityPerKm2": 18.8
    }
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "sidoSgisCode": "23",
    "totalScore": 22.3,
    "dimensions": {
      "populationTrend": 0,
      "youth": 27,
      "farm": 33,
      "density": 27
    },
    "raw": {
      "populationChangePct": -10.9,
      "agingRate": 24.7,
      "farmCount": 53,
      "avgFarmPopulation": 2.7,
      "densityPerKm2": 8077.6
    }
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "sidoSgisCode": "21",
    "totalScore": 15.8,
    "dimensions": {
      "populationTrend": 9,
      "youth": 6,
      "farm": 23,
      "density": 27
    },
    "raw": {
      "populationChangePct": -9,
      "agingRate": 28.8,
      "farmCount": 114,
      "avgFarmPopulation": 2.4,
      "densityPerKm2": 7777
    }
  }
];

const SCORE_INDEX = new Map(SETTLEMENT_SCORES.map((s) => [s.sgisCode, s]));

/** SGIS 코드로 시군구 정착 점수 조회 (없으면 null) */
export function getSettlementScore(sgisCode: string): SettlementScore | null {
  return SCORE_INDEX.get(sgisCode) ?? null;
}

/** 특정 시도의 시군구 점수 목록 (총점 내림차순) */
export function getSettlementScoresBySido(
  sidoSgisCode: string,
): SettlementScore[] {
  return SETTLEMENT_SCORES.filter((s) => s.sidoSgisCode === sidoSgisCode).sort(
    (a, b) => b.totalScore - a.totalScore,
  );
}

/** 전체 점수 분위 (백분위, 0~100). 점수가 같으면 동일 분위 */
export function getScorePercentile(score: number): number {
  const total = SETTLEMENT_SCORES.length;
  if (total === 0) return 0;
  const below = SETTLEMENT_SCORES.filter((s) => s.totalScore < score).length;
  return Math.round((below / total) * 100);
}
