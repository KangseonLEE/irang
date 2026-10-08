/**
 * 시군구 차원별 5점수 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-dimension-scores.ts
 * 마지막 갱신: 2026-10-08
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/compute-dimension-scores.ts`
 *
 * 5차원 (각 0~100 또는 null):
 * 1. populationTrend: 5년 인구 변화율 선형 (-10% → 0, +5% → 100)
 * 2. farmActivity: 인구 1만명당 농가 수 전국 분위 (1~100). 도시 자치구 null
 * 3. medical: 인구 1만명당 의료기관 수 전국 분위 (1~100)
 * 4. school: 인구 1만명당 학교 수 전국 분위 (1~100). 학교 0곳이면 null
 * 5. returnFarm: 농촌 정착 인구 비율 전국 분위 (1~100). 도시 자치구 null
 *
 * 회장 결재 사항 (A'안):
 *   - 농가/의료/학교/귀농 전국 분위 통일 (어르신 친화 카피 일관)
 *   - 도시 자치구는 농가·귀농 동시 hide (KOSIS 귀농 부재 기준)
 */

export interface DimensionEvidence {
  /** 원시 수치 (분위 환산 전) */
  rawValue: number;
  /** 원시 단위 (%, 호, 곳 등) */
  rawUnit: string;
  /** UI 노출용 짧은 라벨 (예: "1만 명당 농가 4.2호") */
  rawLabel: string;
  /**
   * 전국 상위 N% (점수 50 이상에서만 채움).
   * 점수 50 미만 시군구는 "상위 표기"가 자연스럽지 않으므로 undefined.
   * 인구 추세 차원은 분위 변환을 하지 않아 항상 undefined.
   */
  rankPercent?: number;
  /** 한 줄 해석 카피 (UI 노출용) */
  interpretation: string;
}

export interface DimensionEvidenceMap {
  populationTrend: DimensionEvidence | null;
  farmActivity: DimensionEvidence | null;
  medical: DimensionEvidence | null;
  school: DimensionEvidence | null;
  returnFarm: DimensionEvidence | null;
}

export interface DimensionScores {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 인구 추세 점수 (0~100). 선형 정규화 */
  populationTrend: number | null;
  /** 농가 활성도 분위 (1~100). 도시 자치구 null */
  farmActivity: number | null;
  /** 의료 인프라 분위 (1~100) */
  medical: number | null;
  /** 학교 인프라 분위 (1~100). 학교 0곳이면 null */
  school: number | null;
  /** 농촌 정착 인구 비율 분위 (1~100). 도시 자치구 null */
  returnFarm: number | null;
  /** 차원별 evidence (raw 수치 + 해석 카피) */
  evidence: DimensionEvidenceMap;
}

/** 시군구 5차원 점수 (SGIS sgisCode 키) */
export const DIMENSION_SCORES: DimensionScores[] = [
  {
    "sgisCode": "11010",
    "name": "종로구",
    "populationTrend": 23,
    "farmActivity": null,
    "medical": 98,
    "school": 53,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.6%",
        "interpretation": "2018~2022년 인구 -6.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 32.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 32.3곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 2%)"
      },
      "school": {
        "rawValue": 3.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 47%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "populationTrend": 43,
    "farmActivity": null,
    "medical": 99,
    "school": 46,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.5%",
        "interpretation": "2018~2022년 인구 -3.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 49.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 49.7곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 2.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.7곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 46%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 58,
    "school": 15,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2018~2022년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.4곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 42%)"
      },
      "school": {
        "rawValue": 1.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 15%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "populationTrend": 13,
    "farmActivity": null,
    "medical": 77,
    "school": 5,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.0%",
        "interpretation": "2018~2022년 인구 -8.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 1.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 5%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "populationTrend": 38,
    "farmActivity": null,
    "medical": 75,
    "school": 3,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.4%",
        "interpretation": "2018~2022년 인구 -4.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.4곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 25%)"
      },
      "school": {
        "rawValue": 1.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 3%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 84,
    "school": 6,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.4곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 16%)"
      },
      "school": {
        "rawValue": 1.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 6%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 59,
    "school": 1,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.2%",
        "interpretation": "2018~2022년 인구 -3.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.5곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 41%)"
      },
      "school": {
        "rawValue": 1.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 1%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "populationTrend": 63,
    "farmActivity": null,
    "medical": 29,
    "school": 6,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.6%",
        "interpretation": "2018~2022년 인구 -0.6% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 29%)"
      },
      "school": {
        "rawValue": 1.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 6%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "populationTrend": 21,
    "farmActivity": null,
    "medical": 70,
    "school": 3,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.9%",
        "interpretation": "2018~2022년 인구 -6.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 1.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 3%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "populationTrend": 18,
    "farmActivity": null,
    "medical": 27,
    "school": 9,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.3%",
        "interpretation": "2018~2022년 인구 -7.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 1.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 9%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "populationTrend": 20,
    "farmActivity": null,
    "medical": 58,
    "school": 27,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.1%",
        "interpretation": "2018~2022년 인구 -7.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.4곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 42%)"
      },
      "school": {
        "rawValue": 2.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 27%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "populationTrend": 55,
    "farmActivity": null,
    "medical": 62,
    "school": 7,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.7%",
        "interpretation": "2018~2022년 인구 -1.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 38%)"
      },
      "school": {
        "rawValue": 1.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 7%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "populationTrend": 65,
    "farmActivity": null,
    "medical": 48,
    "school": 4,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2018~2022년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
      },
      "school": {
        "rawValue": 1.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 4%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "populationTrend": 56,
    "farmActivity": null,
    "medical": 96,
    "school": 7,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.9곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 4%)"
      },
      "school": {
        "rawValue": 1.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 7%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "populationTrend": 39,
    "farmActivity": null,
    "medical": 68,
    "school": 8,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2018~2022년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 32%)"
      },
      "school": {
        "rawValue": 1.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 8%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 78,
    "school": 9,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.9%",
        "interpretation": "2018~2022년 인구 -3.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 22%)"
      },
      "school": {
        "rawValue": 1.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 9%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 53,
    "school": 4,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2018~2022년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 1.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 4%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "populationTrend": 61,
    "farmActivity": null,
    "medical": 55,
    "school": 5,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.9%",
        "interpretation": "2018~2022년 인구 -0.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.0곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 45%)"
      },
      "school": {
        "rawValue": 1.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 5%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "populationTrend": 78,
    "farmActivity": null,
    "medical": 95,
    "school": 1,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.6%",
        "interpretation": "2018~2022년 인구 +1.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.4곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 5%)"
      },
      "school": {
        "rawValue": 1.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 1%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 62,
    "school": 3,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2018~2022년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 38%)"
      },
      "school": {
        "rawValue": 1.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 3%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "populationTrend": 49,
    "farmActivity": null,
    "medical": 50,
    "school": 1,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.7%",
        "interpretation": "2018~2022년 인구 -2.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
      },
      "school": {
        "rawValue": 1.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 1%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 99,
    "school": 10,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2018~2022년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 42.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 42.0곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 1.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 10%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "populationTrend": 57,
    "farmActivity": null,
    "medical": 100,
    "school": 13,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.5%",
        "interpretation": "2018~2022년 인구 -1.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 63.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 63.6곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 1.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 13%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 93,
    "school": 10,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.1곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 1.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 10%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 95,
    "school": 7,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 8.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +8.3%",
        "interpretation": "2018~2022년 인구 +8.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.6곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 5%)"
      },
      "school": {
        "rawValue": 1.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 7%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "populationTrend": 3,
    "farmActivity": null,
    "medical": 43,
    "school": 58,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -9.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.5%",
        "interpretation": "2018~2022년 인구 -9.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 3.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.5곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 42%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 1,
    "school": 42,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 49.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +49.5%",
        "interpretation": "2018~2022년 인구 +49.5% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 8.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 8.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 42%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "populationTrend": 67,
    "farmActivity": null,
    "medical": 27,
    "school": 2,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.0%",
        "interpretation": "2018~2022년 인구 +0.0% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 1.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 2%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 32,
    "school": 22,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 14.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +14.4%",
        "interpretation": "2018~2022년 인구 +14.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 32%)"
      },
      "school": {
        "rawValue": 1.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 22%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 52,
    "school": 12,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2018~2022년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 1.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 12%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 40,
    "school": 18,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.1%",
        "interpretation": "2018~2022년 인구 -5.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 1.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 18%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 33,
    "school": 22,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.3%",
        "interpretation": "2018~2022년 인구 -6.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 1.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 22%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "populationTrend": 84,
    "farmActivity": null,
    "medical": 12,
    "school": 14,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.5%",
        "interpretation": "2018~2022년 인구 +2.5% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 12%)"
      },
      "school": {
        "rawValue": 1.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 14%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 37,
    "school": 30,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 24.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +24.8%",
        "interpretation": "2018~2022년 인구 +24.8% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 2.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "populationTrend": 87,
    "farmActivity": 51,
    "medical": 34,
    "school": 70,
    "returnFarm": 55,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.1%",
        "interpretation": "2018~2022년 인구 +3.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1021.98,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,022호",
        "rankPercent": 49,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 49%)"
      },
      "medical": {
        "rawValue": 13.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
      },
      "school": {
        "rawValue": 5.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 45,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 45%)"
      }
    }
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "populationTrend": 71,
    "farmActivity": 39,
    "medical": 44,
    "school": 98,
    "returnFarm": 40,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.6%",
        "interpretation": "2018~2022년 인구 +0.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 786.9,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 787호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 39%)"
      },
      "medical": {
        "rawValue": 13.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 44%)"
      },
      "school": {
        "rawValue": 10.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 10.9곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 2%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 40%)"
      }
    }
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 53,
    "school": 17,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.3%",
        "interpretation": "2018~2022년 인구 -0.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 1.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 17%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 94,
    "school": 19,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2018~2022년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.2곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 6%)"
      },
      "school": {
        "rawValue": 1.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 19%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 42,
    "school": 12,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.3%",
        "interpretation": "2018~2022년 인구 +5.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 42%)"
      },
      "school": {
        "rawValue": 1.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 12%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "populationTrend": 36,
    "farmActivity": null,
    "medical": 74,
    "school": 13,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.6%",
        "interpretation": "2018~2022년 인구 -4.6% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.3곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 26%)"
      },
      "school": {
        "rawValue": 1.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 13%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "populationTrend": 36,
    "farmActivity": null,
    "medical": 50,
    "school": 13,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2018~2022년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
      },
      "school": {
        "rawValue": 1.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 13%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 74,
    "school": 15,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -12.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -12.2%",
        "interpretation": "2018~2022년 인구 -12.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.2곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 26%)"
      },
      "school": {
        "rawValue": 1.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 15%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "populationTrend": 100,
    "farmActivity": 8,
    "medical": 20,
    "school": 33,
    "returnFarm": 6,
    "evidence": {
      "populationTrend": {
        "rawValue": 17,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +17.0%",
        "interpretation": "2018~2022년 인구 +17.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 194.34,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 194호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 8%)"
      },
      "medical": {
        "rawValue": 12.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 2.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 6%)"
      }
    }
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "populationTrend": 43,
    "farmActivity": null,
    "medical": 4,
    "school": 41,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.5%",
        "interpretation": "2018~2022년 인구 -3.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 9.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 4%)"
      },
      "school": {
        "rawValue": 2.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 41%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "populationTrend": 62,
    "farmActivity": null,
    "medical": 13,
    "school": 10,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.7%",
        "interpretation": "2018~2022년 인구 -0.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 1.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 10%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "populationTrend": 91,
    "farmActivity": null,
    "medical": 36,
    "school": 18,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.7%",
        "interpretation": "2018~2022년 인구 +3.7% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 36%)"
      },
      "school": {
        "rawValue": 1.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 18%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 67,
    "school": 19,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 36.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +36.6%",
        "interpretation": "2018~2022년 인구 +36.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 1.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 19%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "populationTrend": 27,
    "farmActivity": null,
    "medical": 89,
    "school": 16,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.0%",
        "interpretation": "2018~2022년 인구 -6.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.3곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 11%)"
      },
      "school": {
        "rawValue": 1.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 16%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "populationTrend": 100,
    "farmActivity": 1,
    "medical": 17,
    "school": 20,
    "returnFarm": 2,
    "evidence": {
      "populationTrend": {
        "rawValue": 8.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +8.8%",
        "interpretation": "2018~2022년 인구 +8.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 85.76,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 85.8호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 1%)"
      },
      "medical": {
        "rawValue": 11.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 1.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 20%)"
      },
      "returnFarm": {
        "rawValue": 0,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 2%)"
      }
    }
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 10,
    "school": 27,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.4%",
        "interpretation": "2018~2022년 인구 +6.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 2.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 27%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 5,
    "school": 16,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 16.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +16.1%",
        "interpretation": "2018~2022년 인구 +16.1% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 5%)"
      },
      "school": {
        "rawValue": 1.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 16%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 27,
    "school": 17,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 1.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 17%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 10,
    "school": 25,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.2%",
        "interpretation": "2018~2022년 인구 +5.2% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 1.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 25%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 50,
    "school": 11,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 32.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +32.1%",
        "interpretation": "2018~2022년 인구 +32.1% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.6곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
      },
      "school": {
        "rawValue": 1.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 11%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "populationTrend": 92,
    "farmActivity": 1,
    "medical": 22,
    "school": 21,
    "returnFarm": 5,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.8%",
        "interpretation": "2018~2022년 인구 +3.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 94.65,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 94.6호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 1%)"
      },
      "medical": {
        "rawValue": 12.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 22%)"
      },
      "school": {
        "rawValue": 1.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 21%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 5%)"
      }
    }
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "populationTrend": 100,
    "farmActivity": 6,
    "medical": 10,
    "school": 40,
    "returnFarm": 9,
    "evidence": {
      "populationTrend": {
        "rawValue": 9.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +9.6%",
        "interpretation": "2018~2022년 인구 +9.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 174.52,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 175호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 6%)"
      },
      "medical": {
        "rawValue": 11,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 2.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 9%)"
      }
    }
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "populationTrend": 87,
    "farmActivity": 22,
    "medical": 18,
    "school": 45,
    "returnFarm": 22,
    "evidence": {
      "populationTrend": {
        "rawValue": 3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.0%",
        "interpretation": "2018~2022년 인구 +3.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 408.68,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 409호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 22%)"
      },
      "medical": {
        "rawValue": 11.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 18%)"
      },
      "school": {
        "rawValue": 2.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.7곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 22%)"
      }
    }
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "populationTrend": 91,
    "farmActivity": 23,
    "medical": 7,
    "school": 50,
    "returnFarm": 29,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.7%",
        "interpretation": "2018~2022년 인구 +3.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 430.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 431호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 23%)"
      },
      "medical": {
        "rawValue": 10.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 2.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.9곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 29%)"
      }
    }
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "populationTrend": 100,
    "farmActivity": 4,
    "medical": 13,
    "school": 20,
    "returnFarm": 4,
    "evidence": {
      "populationTrend": {
        "rawValue": 15.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +15.6%",
        "interpretation": "2018~2022년 인구 +15.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 129.65,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 130호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 4%)"
      },
      "medical": {
        "rawValue": 11.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 1.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 20%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 4%)"
      }
    }
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "populationTrend": 100,
    "farmActivity": 5,
    "medical": 11,
    "school": 30,
    "returnFarm": 12,
    "evidence": {
      "populationTrend": {
        "rawValue": 19.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +19.9%",
        "interpretation": "2018~2022년 인구 +19.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 139.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 139호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 5%)"
      },
      "medical": {
        "rawValue": 11.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 11%)"
      },
      "school": {
        "rawValue": 2.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 12%)"
      }
    }
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "populationTrend": 100,
    "farmActivity": 4,
    "medical": 2,
    "school": 11,
    "returnFarm": 3,
    "evidence": {
      "populationTrend": {
        "rawValue": 7.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +7.9%",
        "interpretation": "2018~2022년 인구 +7.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 128.68,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 129호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 4%)"
      },
      "medical": {
        "rawValue": 9.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 2%)"
      },
      "school": {
        "rawValue": 1.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 11%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 3%)"
      }
    }
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "populationTrend": 100,
    "farmActivity": 6,
    "medical": 6,
    "school": 48,
    "returnFarm": 9,
    "evidence": {
      "populationTrend": {
        "rawValue": 11.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.6%",
        "interpretation": "2018~2022년 인구 +11.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 176.01,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 176호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 6%)"
      },
      "medical": {
        "rawValue": 10.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 6%)"
      },
      "school": {
        "rawValue": 2.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 48%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 9%)"
      }
    }
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "populationTrend": 75,
    "farmActivity": 22,
    "medical": 3,
    "school": 50,
    "returnFarm": 24,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.2%",
        "interpretation": "2018~2022년 인구 +1.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 420.75,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 421호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 22%)"
      },
      "medical": {
        "rawValue": 9.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 2.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.9곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 24%)"
      }
    }
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "populationTrend": 77,
    "farmActivity": 37,
    "medical": 26,
    "school": 62,
    "returnFarm": 30,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.5%",
        "interpretation": "2018~2022년 인구 +1.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 720.89,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 721호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 37%)"
      },
      "medical": {
        "rawValue": 12.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 26%)"
      },
      "school": {
        "rawValue": 4.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.0곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 38%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 30%)"
      }
    }
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "populationTrend": 100,
    "farmActivity": 32,
    "medical": 28,
    "school": 59,
    "returnFarm": 42,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.3%",
        "interpretation": "2018~2022년 인구 +5.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 621.55,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 622호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 32%)"
      },
      "medical": {
        "rawValue": 12.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 28%)"
      },
      "school": {
        "rawValue": 3.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 41%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 42%)"
      }
    }
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "populationTrend": 64,
    "farmActivity": 36,
    "medical": 61,
    "school": 64,
    "returnFarm": 41,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.3%",
        "interpretation": "2018~2022년 인구 -0.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 693.67,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 694호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 36%)"
      },
      "medical": {
        "rawValue": 15.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 39%)"
      },
      "school": {
        "rawValue": 4.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.5곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 36%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 41%)"
      }
    }
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "populationTrend": 34,
    "farmActivity": 37,
    "medical": 33,
    "school": 71,
    "returnFarm": 53,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2018~2022년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 713.28,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 713호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 37%)"
      },
      "medical": {
        "rawValue": 13.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 5.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 47,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 47%)"
      }
    }
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "populationTrend": 86,
    "farmActivity": 13,
    "medical": 32,
    "school": 48,
    "returnFarm": 17,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.9%",
        "interpretation": "2018~2022년 인구 +2.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 262.38,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 262호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 13%)"
      },
      "medical": {
        "rawValue": 13.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 32%)"
      },
      "school": {
        "rawValue": 2.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 48%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 17%)"
      }
    }
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "populationTrend": 100,
    "farmActivity": 15,
    "medical": 47,
    "school": 47,
    "returnFarm": 14,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.1%",
        "interpretation": "2018~2022년 인구 +5.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 300.21,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 300호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 15%)"
      },
      "medical": {
        "rawValue": 14.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
      },
      "school": {
        "rawValue": 2.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.7곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 14%)"
      }
    }
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "populationTrend": 65,
    "farmActivity": 21,
    "medical": 29,
    "school": 50,
    "returnFarm": 10,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2018~2022년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 382.05,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 382호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 21%)"
      },
      "medical": {
        "rawValue": 12.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 29%)"
      },
      "school": {
        "rawValue": 2.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.9곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 10%)"
      }
    }
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "populationTrend": 59,
    "farmActivity": null,
    "medical": 21,
    "school": 55,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.2%",
        "interpretation": "2018~2022년 인구 -1.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 21%)"
      },
      "school": {
        "rawValue": 3.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 45%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 15,
    "school": 80,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -10.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -10.1%",
        "interpretation": "2018~2022년 인구 -10.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 15%)"
      },
      "school": {
        "rawValue": 6.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.4곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "populationTrend": 89,
    "farmActivity": null,
    "medical": 72,
    "school": 43,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.3%",
        "interpretation": "2018~2022년 인구 +3.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.7곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 2.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "populationTrend": 31,
    "farmActivity": 33,
    "medical": 5,
    "school": 71,
    "returnFarm": 29,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2018~2022년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 643.03,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 643호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 33%)"
      },
      "medical": {
        "rawValue": 10.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 5%)"
      },
      "school": {
        "rawValue": 5.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 29%)"
      }
    }
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "populationTrend": 47,
    "farmActivity": 67,
    "medical": 37,
    "school": 84,
    "returnFarm": 58,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2018~2022년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1264.74,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,265호",
        "rankPercent": 33,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 33%)"
      },
      "medical": {
        "rawValue": 13.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 6.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.9곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 16%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 42,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 42%)"
      }
    }
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "populationTrend": 78,
    "farmActivity": 71,
    "medical": 19,
    "school": 88,
    "returnFarm": 71,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.7%",
        "interpretation": "2018~2022년 인구 +1.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1368.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,368호",
        "rankPercent": 29,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 29%)"
      },
      "medical": {
        "rawValue": 11.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 19%)"
      },
      "school": {
        "rawValue": 7.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.6곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 12%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 29,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 29%)"
      }
    }
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "populationTrend": 47,
    "farmActivity": 55,
    "medical": 7,
    "school": 92,
    "returnFarm": 83,
    "evidence": {
      "populationTrend": {
        "rawValue": -3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.0%",
        "interpretation": "2018~2022년 인구 -3.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1089.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,089호",
        "rankPercent": 45,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 45%)"
      },
      "medical": {
        "rawValue": 10.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 8.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.1곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 8%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 17,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 17%)"
      }
    }
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "populationTrend": 45,
    "farmActivity": 61,
    "medical": 55,
    "school": 90,
    "returnFarm": 67,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1189.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,190호",
        "rankPercent": 39,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 39%)"
      },
      "medical": {
        "rawValue": 14.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.0곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 45%)"
      },
      "school": {
        "rawValue": 8.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.0곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 33,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 33%)"
      }
    }
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "populationTrend": 25,
    "farmActivity": 42,
    "medical": 16,
    "school": 98,
    "returnFarm": 61,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.3%",
        "interpretation": "2018~2022년 인구 -6.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 867.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 867호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 42%)"
      },
      "medical": {
        "rawValue": 11.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 16%)"
      },
      "school": {
        "rawValue": 9.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.9곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 2%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 39,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 39%)"
      }
    }
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "populationTrend": 19,
    "farmActivity": 56,
    "medical": 23,
    "school": 79,
    "returnFarm": 40,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.2%",
        "interpretation": "2018~2022년 인구 -7.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1100.01,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,100호",
        "rankPercent": 44,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 44%)"
      },
      "medical": {
        "rawValue": 12.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 6.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.3곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 40%)"
      }
    }
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "populationTrend": 28,
    "farmActivity": 53,
    "medical": 41,
    "school": 93,
    "returnFarm": 51,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1043.69,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,044호",
        "rankPercent": 47,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 47%)"
      },
      "medical": {
        "rawValue": 13.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
      },
      "school": {
        "rawValue": 8.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.4곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 7%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 49,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 49%)"
      }
    }
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "populationTrend": 28,
    "farmActivity": 58,
    "medical": 15,
    "school": 95,
    "returnFarm": 50,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2018~2022년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1140.03,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,140호",
        "rankPercent": 42,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 42%)"
      },
      "medical": {
        "rawValue": 11.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 15%)"
      },
      "school": {
        "rawValue": 9.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.1곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 5%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 50,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 50%)"
      }
    }
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "populationTrend": 78,
    "farmActivity": 50,
    "medical": 6,
    "school": 89,
    "returnFarm": 37,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.8%",
        "interpretation": "2018~2022년 인구 +1.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1003.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,003호",
        "rankPercent": 50,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 50%)"
      },
      "medical": {
        "rawValue": 10.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 6%)"
      },
      "school": {
        "rawValue": 7.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 11%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 37%)"
      }
    }
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "populationTrend": 43,
    "farmActivity": 42,
    "medical": 19,
    "school": 88,
    "returnFarm": 43,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.6%",
        "interpretation": "2018~2022년 인구 -3.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 875.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 875호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 42%)"
      },
      "medical": {
        "rawValue": 11.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 19%)"
      },
      "school": {
        "rawValue": 7.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.7곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 12%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 43%)"
      }
    }
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "populationTrend": 91,
    "farmActivity": 64,
    "medical": 3,
    "school": 87,
    "returnFarm": 52,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.6%",
        "interpretation": "2018~2022년 인구 +3.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1195.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,196호",
        "rankPercent": 36,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 36%)"
      },
      "medical": {
        "rawValue": 9.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 7.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.5곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 48,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 48%)"
      }
    }
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "populationTrend": 77,
    "farmActivity": 12,
    "medical": 36,
    "school": 39,
    "returnFarm": 12,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.6%",
        "interpretation": "2018~2022년 인구 +1.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 257.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 257호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 12%)"
      },
      "medical": {
        "rawValue": 13.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 36%)"
      },
      "school": {
        "rawValue": 2.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 12%)"
      }
    }
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "populationTrend": 68,
    "farmActivity": 27,
    "medical": 28,
    "school": 56,
    "returnFarm": 27,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.3%",
        "interpretation": "2018~2022년 인구 +0.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 507.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 507호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 27%)"
      },
      "medical": {
        "rawValue": 12.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 28%)"
      },
      "school": {
        "rawValue": 3.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 27%)"
      }
    }
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "populationTrend": 39,
    "farmActivity": 31,
    "medical": 51,
    "school": 57,
    "returnFarm": 26,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2018~2022년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 605.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 606호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 31%)"
      },
      "medical": {
        "rawValue": 14.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 49%)"
      },
      "school": {
        "rawValue": 3.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 26%)"
      }
    }
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "populationTrend": 28,
    "farmActivity": 78,
    "medical": 80,
    "school": 85,
    "returnFarm": 88,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2018~2022년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1556.99,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,557호",
        "rankPercent": 22,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 22%)"
      },
      "medical": {
        "rawValue": 17.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.0곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
      },
      "school": {
        "rawValue": 7.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 15%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 12,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 12%)"
      }
    }
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "populationTrend": 43,
    "farmActivity": 65,
    "medical": 77,
    "school": 65,
    "returnFarm": 73,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.5%",
        "interpretation": "2018~2022년 인구 -3.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1226.75,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,227호",
        "rankPercent": 35,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 35%)"
      },
      "medical": {
        "rawValue": 17.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 4.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.6곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 35%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 27,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 27%)"
      }
    }
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "populationTrend": 3,
    "farmActivity": 79,
    "medical": 86,
    "school": 76,
    "returnFarm": 75,
    "evidence": {
      "populationTrend": {
        "rawValue": -9.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.6%",
        "interpretation": "2018~2022년 인구 -9.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1581.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,582호",
        "rankPercent": 21,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 21%)"
      },
      "medical": {
        "rawValue": 18.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.5곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 5.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 24%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 25,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 25%)"
      }
    }
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "populationTrend": 72,
    "farmActivity": 24,
    "medical": 30,
    "school": 45,
    "returnFarm": 32,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.8%",
        "interpretation": "2018~2022년 인구 +0.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 449.73,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 450호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 24%)"
      },
      "medical": {
        "rawValue": 12.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 2.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 32%)"
      }
    }
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "populationTrend": 100,
    "farmActivity": 29,
    "medical": 11,
    "school": 56,
    "returnFarm": 34,
    "evidence": {
      "populationTrend": {
        "rawValue": 11,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.0%",
        "interpretation": "2018~2022년 인구 +11.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 541.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 542호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 29%)"
      },
      "medical": {
        "rawValue": 11.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 11%)"
      },
      "school": {
        "rawValue": 3.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 34%)"
      }
    }
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "populationTrend": 56,
    "farmActivity": 81,
    "medical": 44,
    "school": 80,
    "returnFarm": 90,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1623.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,624호",
        "rankPercent": 19,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 19%)"
      },
      "medical": {
        "rawValue": 14.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 44%)"
      },
      "school": {
        "rawValue": 6.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.3곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
      },
      "returnFarm": {
        "rawValue": 0.23,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 10,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 10%)"
      }
    }
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "populationTrend": 48,
    "farmActivity": 35,
    "medical": 26,
    "school": 59,
    "returnFarm": 37,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.8%",
        "interpretation": "2018~2022년 인구 -2.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 690.98,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 691호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 35%)"
      },
      "medical": {
        "rawValue": 12.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 26%)"
      },
      "school": {
        "rawValue": 3.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.6곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 41%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 37%)"
      }
    }
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "populationTrend": 20,
    "farmActivity": 71,
    "medical": 61,
    "school": 87,
    "returnFarm": 54,
    "evidence": {
      "populationTrend": {
        "rawValue": -7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.0%",
        "interpretation": "2018~2022년 인구 -7.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1345.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,345호",
        "rankPercent": 29,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 29%)"
      },
      "medical": {
        "rawValue": 15.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 39%)"
      },
      "school": {
        "rawValue": 7.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.6곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 46,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 46%)"
      }
    }
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "populationTrend": 100,
    "farmActivity": 11,
    "medical": 23,
    "school": 49,
    "returnFarm": 8,
    "evidence": {
      "populationTrend": {
        "rawValue": 22.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +22.5%",
        "interpretation": "2018~2022년 인구 +22.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 241.43,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 241호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 11%)"
      },
      "medical": {
        "rawValue": 12.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 2.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 49%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 8%)"
      }
    }
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "populationTrend": 50,
    "farmActivity": null,
    "medical": 53,
    "school": 30,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.5%",
        "interpretation": "2018~2022년 인구 -2.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 2.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 65,
    "school": 41,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.3%",
        "interpretation": "2018~2022년 인구 -6.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.1곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 35%)"
      },
      "school": {
        "rawValue": 2.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.5곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 41%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 90,
    "school": 26,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.7곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 1.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 26%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "populationTrend": 73,
    "farmActivity": null,
    "medical": 43,
    "school": 36,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.9%",
        "interpretation": "2018~2022년 인구 +0.9% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.9곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 2.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 24,
    "school": 38,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 2.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 38%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "populationTrend": 83,
    "farmActivity": 9,
    "medical": 25,
    "school": 27,
    "returnFarm": 4,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.4%",
        "interpretation": "2018~2022년 인구 +2.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 202.08,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 202호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 9%)"
      },
      "medical": {
        "rawValue": 12.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 25%)"
      },
      "school": {
        "rawValue": 2.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 27%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 4%)"
      }
    }
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "populationTrend": 42,
    "farmActivity": 50,
    "medical": 63,
    "school": 67,
    "returnFarm": 46,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2018~2022년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 985.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 986호",
        "rankPercent": 50,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 50%)"
      },
      "medical": {
        "rawValue": 15.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.0곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 46%)"
      }
    }
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "populationTrend": 42,
    "farmActivity": 45,
    "medical": 56,
    "school": 67,
    "returnFarm": 47,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2018~2022년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 916.68,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 917호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 45%)"
      },
      "medical": {
        "rawValue": 15.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.1곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 44%)"
      },
      "school": {
        "rawValue": 4.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.9곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 47%)"
      }
    }
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "populationTrend": 100,
    "farmActivity": 14,
    "medical": 7,
    "school": 44,
    "returnFarm": 20,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.1%",
        "interpretation": "2018~2022년 인구 +6.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 285.11,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 285호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 14%)"
      },
      "medical": {
        "rawValue": 10.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 2.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 20%)"
      }
    }
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "populationTrend": 81,
    "farmActivity": 38,
    "medical": 17,
    "school": 52,
    "returnFarm": 38,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.2%",
        "interpretation": "2018~2022년 인구 +2.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 731.45,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 731호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 38%)"
      },
      "medical": {
        "rawValue": 11.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 3.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 48%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 38%)"
      }
    }
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "populationTrend": 34,
    "farmActivity": 46,
    "medical": 73,
    "school": 68,
    "returnFarm": 44,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2018~2022년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 926.39,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 926호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 46%)"
      },
      "medical": {
        "rawValue": 17.2,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.2곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
      },
      "school": {
        "rawValue": 5.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.0곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 32%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 44%)"
      }
    }
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "populationTrend": 80,
    "farmActivity": 10,
    "medical": 45,
    "school": 43,
    "returnFarm": 23,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.1%",
        "interpretation": "2018~2022년 인구 +2.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 214.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 214호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 10%)"
      },
      "medical": {
        "rawValue": 14.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
      },
      "school": {
        "rawValue": 2.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 23%)"
      }
    }
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "populationTrend": 71,
    "farmActivity": 34,
    "medical": 20,
    "school": 54,
    "returnFarm": 35,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.7%",
        "interpretation": "2018~2022년 인구 +0.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 647.46,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 647호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 34%)"
      },
      "medical": {
        "rawValue": 11.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 3.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 46%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 35%)"
      }
    }
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "populationTrend": 35,
    "farmActivity": 68,
    "medical": 68,
    "school": 70,
    "returnFarm": 73,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2018~2022년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1271.02,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,271호",
        "rankPercent": 32,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 32%)"
      },
      "medical": {
        "rawValue": 16.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 32%)"
      },
      "school": {
        "rawValue": 5.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 27,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 27%)"
      }
    }
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "populationTrend": 16,
    "farmActivity": 83,
    "medical": 70,
    "school": 75,
    "returnFarm": 78,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.6%",
        "interpretation": "2018~2022년 인구 -7.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1670.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,671호",
        "rankPercent": 17,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 17%)"
      },
      "medical": {
        "rawValue": 16.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 5.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 22,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 22%)"
      }
    }
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "populationTrend": 27,
    "farmActivity": 70,
    "medical": 79,
    "school": 81,
    "returnFarm": 59,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1336.52,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,337호",
        "rankPercent": 30,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 30%)"
      },
      "medical": {
        "rawValue": 17.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.8곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 21%)"
      },
      "school": {
        "rawValue": 6.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 19%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 41,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 41%)"
      }
    }
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "populationTrend": 36,
    "farmActivity": 98,
    "medical": 69,
    "school": 73,
    "returnFarm": 92,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.6%",
        "interpretation": "2018~2022년 인구 -4.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2121.23,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,121호",
        "rankPercent": 2,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 2%)"
      },
      "medical": {
        "rawValue": 16.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 5.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 27%)"
      },
      "returnFarm": {
        "rawValue": 0.26,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 8,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 8%)"
      }
    }
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "populationTrend": 49,
    "farmActivity": 52,
    "medical": 43,
    "school": 64,
    "returnFarm": 45,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.6%",
        "interpretation": "2018~2022년 인구 -2.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1028.31,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,028호",
        "rankPercent": 48,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 48%)"
      },
      "medical": {
        "rawValue": 13.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 4.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.4곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 36%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 45%)"
      }
    }
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "populationTrend": 48,
    "farmActivity": 58,
    "medical": 48,
    "school": 74,
    "returnFarm": 62,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.7%",
        "interpretation": "2018~2022년 인구 -2.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1163.62,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,164호",
        "rankPercent": 42,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 42%)"
      },
      "medical": {
        "rawValue": 14.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
      },
      "school": {
        "rawValue": 5.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 26%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 38,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 38%)"
      }
    }
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "populationTrend": 63,
    "farmActivity": 62,
    "medical": 31,
    "school": 67,
    "returnFarm": 58,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2018~2022년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1190.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,190호",
        "rankPercent": 38,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 38%)"
      },
      "medical": {
        "rawValue": 13.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
      },
      "school": {
        "rawValue": 4.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.9곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 42,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 42%)"
      }
    }
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "populationTrend": 74,
    "farmActivity": null,
    "medical": 72,
    "school": 38,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.1%",
        "interpretation": "2018~2022년 인구 +1.1% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.7곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 2.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 38%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "populationTrend": 53,
    "farmActivity": 14,
    "medical": 41,
    "school": 53,
    "returnFarm": 14,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 296.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 297호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 14%)"
      },
      "medical": {
        "rawValue": 13.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
      },
      "school": {
        "rawValue": 3.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 14%)"
      }
    }
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "populationTrend": 27,
    "farmActivity": 27,
    "medical": 52,
    "school": 60,
    "returnFarm": 22,
    "evidence": {
      "populationTrend": {
        "rawValue": -6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.0%",
        "interpretation": "2018~2022년 인구 -6.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 474.89,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 475호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 27%)"
      },
      "medical": {
        "rawValue": 14.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 3.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 22%)"
      }
    }
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "populationTrend": 36,
    "farmActivity": 55,
    "medical": 84,
    "school": 83,
    "returnFarm": 50,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.6%",
        "interpretation": "2018~2022년 인구 -4.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1082.47,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,082호",
        "rankPercent": 45,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 45%)"
      },
      "medical": {
        "rawValue": 18.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.4곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 16%)"
      },
      "school": {
        "rawValue": 6.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.7곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 50,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 50%)"
      }
    }
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "populationTrend": 39,
    "farmActivity": 66,
    "medical": 83,
    "school": 82,
    "returnFarm": 65,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.1%",
        "interpretation": "2018~2022년 인구 -4.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1237.59,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,238호",
        "rankPercent": 34,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 34%)"
      },
      "medical": {
        "rawValue": 18.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 6.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 35,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 35%)"
      }
    }
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "populationTrend": 41,
    "farmActivity": 53,
    "medical": 82,
    "school": 84,
    "returnFarm": 66,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1040.79,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,041호",
        "rankPercent": 47,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 47%)"
      },
      "medical": {
        "rawValue": 18.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 18%)"
      },
      "school": {
        "rawValue": 7.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 16%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 34,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 34%)"
      }
    }
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "populationTrend": 45,
    "farmActivity": 43,
    "medical": 47,
    "school": 69,
    "returnFarm": 56,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 903.65,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 904호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 43%)"
      },
      "medical": {
        "rawValue": 14.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
      },
      "school": {
        "rawValue": 5.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 31%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 44,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 44%)"
      }
    }
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "populationTrend": 48,
    "farmActivity": 92,
    "medical": 90,
    "school": 100,
    "returnFarm": 95,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.8%",
        "interpretation": "2018~2022년 인구 -2.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1918.3,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,918호",
        "rankPercent": 8,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 8%)"
      },
      "medical": {
        "rawValue": 19.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.9곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 12.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 12.4곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.3,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 5,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 5%)"
      }
    }
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "populationTrend": 45,
    "farmActivity": 91,
    "medical": 71,
    "school": 91,
    "returnFarm": 77,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1902.13,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,902호",
        "rankPercent": 9,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 9%)"
      },
      "medical": {
        "rawValue": 16.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 29%)"
      },
      "school": {
        "rawValue": 8.07,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.1곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 9%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 23,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 23%)"
      }
    }
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "populationTrend": 28,
    "farmActivity": 99,
    "medical": 70,
    "school": 99,
    "returnFarm": 97,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 2145.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,145호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 16.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 10.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 11.0곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.33,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 3,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 3%)"
      }
    }
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "populationTrend": 30,
    "farmActivity": 82,
    "medical": 97,
    "school": 99,
    "returnFarm": 83,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2018~2022년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1646.74,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,647호",
        "rankPercent": 18,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 18%)"
      },
      "medical": {
        "rawValue": 25.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 25.3곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
      },
      "school": {
        "rawValue": 11.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 11.2곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 17,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 17%)"
      }
    }
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "populationTrend": 21,
    "farmActivity": 99,
    "medical": 97,
    "school": 97,
    "returnFarm": 99,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.8%",
        "interpretation": "2018~2022년 인구 -6.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 2144.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,145호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 23.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 23.3곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
      },
      "school": {
        "rawValue": 9.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.9곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 3%)"
      },
      "returnFarm": {
        "rawValue": 0.37,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.4%",
        "rankPercent": 1,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 1%)"
      }
    }
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "populationTrend": 22,
    "farmActivity": 85,
    "medical": 83,
    "school": 90,
    "returnFarm": 88,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2018~2022년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1787.77,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,788호",
        "rankPercent": 15,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 15%)"
      },
      "medical": {
        "rawValue": 18.31,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 7.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.9곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 12,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 12%)"
      }
    }
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "populationTrend": 25,
    "farmActivity": 74,
    "medical": 76,
    "school": 89,
    "returnFarm": 78,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2018~2022년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1441.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,441호",
        "rankPercent": 26,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 26%)"
      },
      "medical": {
        "rawValue": 17.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.5곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 24%)"
      },
      "school": {
        "rawValue": 7.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 11%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 22,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 22%)"
      }
    }
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 94,
    "school": 31,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 11.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.3%",
        "interpretation": "2018~2022년 인구 +11.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.3곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 6%)"
      },
      "school": {
        "rawValue": 2.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 31%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 93,
    "school": 24,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.1%",
        "interpretation": "2018~2022년 인구 -5.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.2곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 1.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 24%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "populationTrend": 58,
    "farmActivity": null,
    "medical": 69,
    "school": 49,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.3%",
        "interpretation": "2018~2022년 인구 -1.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 2.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 49%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 51,
    "school": 37,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2018~2022년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 49%)"
      },
      "school": {
        "rawValue": 2.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 37%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "populationTrend": 68,
    "farmActivity": null,
    "medical": 24,
    "school": 33,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.3%",
        "interpretation": "2018~2022년 인구 +0.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 2.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 33%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 31,
    "school": 54,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2018~2022년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
      },
      "school": {
        "rawValue": 3.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 46%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "populationTrend": 60,
    "farmActivity": 19,
    "medical": 38,
    "school": 58,
    "returnFarm": 11,
    "evidence": {
      "populationTrend": {
        "rawValue": -1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.0%",
        "interpretation": "2018~2022년 인구 -1.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 353.21,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 353호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 19%)"
      },
      "medical": {
        "rawValue": 13.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 3.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.6곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 42%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 11%)"
      }
    }
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "populationTrend": 76,
    "farmActivity": 29,
    "medical": 35,
    "school": 51,
    "returnFarm": 24,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.4%",
        "interpretation": "2018~2022년 인구 +1.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 546.45,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 546호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 29%)"
      },
      "medical": {
        "rawValue": 13.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 35%)"
      },
      "school": {
        "rawValue": 3.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.0곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 49%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 24%)"
      }
    }
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "populationTrend": 97,
    "farmActivity": 44,
    "medical": 54,
    "school": 66,
    "returnFarm": 53,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.5%",
        "interpretation": "2018~2022년 인구 +4.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 904.21,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 904호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 44%)"
      },
      "medical": {
        "rawValue": 14.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 46%)"
      },
      "school": {
        "rawValue": 4.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.7곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 34%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 47,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 47%)"
      }
    }
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "populationTrend": 75,
    "farmActivity": 28,
    "medical": 9,
    "school": 60,
    "returnFarm": 21,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.3%",
        "interpretation": "2018~2022년 인구 +1.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 524.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 525호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 28%)"
      },
      "medical": {
        "rawValue": 10.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 9%)"
      },
      "school": {
        "rawValue": 3.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 21%)"
      }
    }
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "populationTrend": 64,
    "farmActivity": 76,
    "medical": 81,
    "school": 77,
    "returnFarm": 60,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1502.57,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,503호",
        "rankPercent": 24,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 24%)"
      },
      "medical": {
        "rawValue": 18.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.1곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 19%)"
      },
      "school": {
        "rawValue": 5.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 23%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 40,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 40%)"
      }
    }
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "populationTrend": 27,
    "farmActivity": 96,
    "medical": 92,
    "school": 73,
    "returnFarm": 96,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 2061.31,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,061호",
        "rankPercent": 4,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 4%)"
      },
      "medical": {
        "rawValue": 20.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.0곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 8%)"
      },
      "school": {
        "rawValue": 5.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 27%)"
      },
      "returnFarm": {
        "rawValue": 0.31,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 4,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 4%)"
      }
    }
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "populationTrend": 37,
    "farmActivity": 86,
    "medical": 93,
    "school": 87,
    "returnFarm": 72,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2018~2022년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1832.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,833호",
        "rankPercent": 14,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 14%)"
      },
      "medical": {
        "rawValue": 20.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.7곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 7.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.3곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 28,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 28%)"
      }
    }
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "populationTrend": 44,
    "farmActivity": 88,
    "medical": 80,
    "school": 81,
    "returnFarm": 93,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2018~2022년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1832.85,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,833호",
        "rankPercent": 12,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 12%)"
      },
      "medical": {
        "rawValue": 17.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
      },
      "school": {
        "rawValue": 6.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 19%)"
      },
      "returnFarm": {
        "rawValue": 0.26,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 7,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 7%)"
      }
    }
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "populationTrend": 14,
    "farmActivity": 83,
    "medical": 88,
    "school": 97,
    "returnFarm": 89,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.9%",
        "interpretation": "2018~2022년 인구 -7.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1745.12,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,745호",
        "rankPercent": 17,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 17%)"
      },
      "medical": {
        "rawValue": 19.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.0곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 12%)"
      },
      "school": {
        "rawValue": 9.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.7곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 3%)"
      },
      "returnFarm": {
        "rawValue": 0.22,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 11,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 11%)"
      }
    }
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "populationTrend": 64,
    "farmActivity": 60,
    "medical": 77,
    "school": 69,
    "returnFarm": 68,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1170.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,170호",
        "rankPercent": 40,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 40%)"
      },
      "medical": {
        "rawValue": 17.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.6곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 5.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.2곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 31%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 32,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 32%)"
      }
    }
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "populationTrend": 25,
    "farmActivity": 90,
    "medical": 89,
    "school": 91,
    "returnFarm": 87,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2018~2022년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1879.42,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,879호",
        "rankPercent": 10,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 10%)"
      },
      "medical": {
        "rawValue": 19.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.6곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 11%)"
      },
      "school": {
        "rawValue": 8.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.0곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 9%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 13,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 13%)"
      }
    }
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "populationTrend": 30,
    "farmActivity": 88,
    "medical": 75,
    "school": 94,
    "returnFarm": 86,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2018~2022년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1840.77,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,841호",
        "rankPercent": 12,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 12%)"
      },
      "medical": {
        "rawValue": 17.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.5곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 25%)"
      },
      "school": {
        "rawValue": 8.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.9곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 6%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 14,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 14%)"
      }
    }
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "populationTrend": 28,
    "farmActivity": 81,
    "medical": 67,
    "school": 74,
    "returnFarm": 76,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2018~2022년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1633.1,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,633호",
        "rankPercent": 19,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 19%)"
      },
      "medical": {
        "rawValue": 16.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 5.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.8곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 26%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 24,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 24%)"
      }
    }
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "populationTrend": 56,
    "farmActivity": 63,
    "medical": 39,
    "school": 79,
    "returnFarm": 80,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1193.7,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,194호",
        "rankPercent": 37,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 37%)"
      },
      "medical": {
        "rawValue": 13.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 39%)"
      },
      "school": {
        "rawValue": 6.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.2곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 20,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 20%)"
      }
    }
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "populationTrend": 100,
    "farmActivity": 47,
    "medical": 30,
    "school": 63,
    "returnFarm": 60,
    "evidence": {
      "populationTrend": {
        "rawValue": 11.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.4%",
        "interpretation": "2018~2022년 인구 +11.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 931.92,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 932호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 47%)"
      },
      "medical": {
        "rawValue": 12.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 4.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.3곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 40,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 40%)"
      }
    }
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "populationTrend": 33,
    "farmActivity": 95,
    "medical": 88,
    "school": 93,
    "returnFarm": 96,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.1%",
        "interpretation": "2018~2022년 인구 -5.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1968.47,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,968호",
        "rankPercent": 5,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 5%)"
      },
      "medical": {
        "rawValue": 19.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.3곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 12%)"
      },
      "school": {
        "rawValue": 8.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.6곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 7%)"
      },
      "returnFarm": {
        "rawValue": 0.32,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 4,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 4%)"
      }
    }
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "populationTrend": 63,
    "farmActivity": 60,
    "medical": 87,
    "school": 77,
    "returnFarm": 68,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2018~2022년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1174.1,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,174호",
        "rankPercent": 40,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 40%)"
      },
      "medical": {
        "rawValue": 18.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.9곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
      },
      "school": {
        "rawValue": 6.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.1곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 23%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 32,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 32%)"
      }
    }
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "populationTrend": 41,
    "farmActivity": 72,
    "medical": 60,
    "school": 76,
    "returnFarm": 84,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1408.88,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,409호",
        "rankPercent": 28,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 28%)"
      },
      "medical": {
        "rawValue": 15.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.6곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 5.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 24%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 16,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 16%)"
      }
    }
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "populationTrend": 46,
    "farmActivity": 40,
    "medical": 59,
    "school": 96,
    "returnFarm": 48,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.1%",
        "interpretation": "2018~2022년 인구 -3.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 807.67,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 808호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 40%)"
      },
      "medical": {
        "rawValue": 15.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.6곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 41%)"
      },
      "school": {
        "rawValue": 9.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.2곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 4%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 48%)"
      }
    }
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "populationTrend": 57,
    "farmActivity": 73,
    "medical": 80,
    "school": 97,
    "returnFarm": 76,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.4%",
        "interpretation": "2018~2022년 인구 -1.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1417.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,418호",
        "rankPercent": 27,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 27%)"
      },
      "medical": {
        "rawValue": 17.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.0곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
      },
      "school": {
        "rawValue": 9.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.7곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 3%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 24,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 24%)"
      }
    }
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "populationTrend": 39,
    "farmActivity": 94,
    "medical": 85,
    "school": 100,
    "returnFarm": 100,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2018~2022년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1966.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,966호",
        "rankPercent": 6,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 6%)"
      },
      "medical": {
        "rawValue": 18.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.4곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 15%)"
      },
      "school": {
        "rawValue": 12.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 12.9곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.4,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.4%",
        "rankPercent": 1,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 1%)"
      }
    }
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 98,
    "school": 32,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 33.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 33.5곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 2%)"
      },
      "school": {
        "rawValue": 2.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 32%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 33,
    "school": 35,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.07,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 2.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 35%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "populationTrend": 77,
    "farmActivity": null,
    "medical": 83,
    "school": 37,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.6%",
        "interpretation": "2018~2022년 인구 +1.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 37%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "populationTrend": 7,
    "farmActivity": null,
    "medical": 23,
    "school": 39,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.0%",
        "interpretation": "2018~2022년 인구 -9.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 2.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 39%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 97,
    "school": 23,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2018~2022년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 24.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 24.9곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
      },
      "school": {
        "rawValue": 1.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 23%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "populationTrend": 90,
    "farmActivity": null,
    "medical": 91,
    "school": 25,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.4%",
        "interpretation": "2018~2022년 인구 +3.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.0곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 9%)"
      },
      "school": {
        "rawValue": 1.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 25%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "populationTrend": 9,
    "farmActivity": null,
    "medical": 63,
    "school": 28,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -8.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.7%",
        "interpretation": "2018~2022년 인구 -8.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.0곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 2.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 28%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 46,
    "school": 31,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2018~2022년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 46%)"
      },
      "school": {
        "rawValue": 2.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 31%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 87,
    "school": 17,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2018~2022년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.7곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
      },
      "school": {
        "rawValue": 1.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 17%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "populationTrend": 18,
    "farmActivity": null,
    "medical": 49,
    "school": 23,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.2%",
        "interpretation": "2018~2022년 인구 -7.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 49%)"
      },
      "school": {
        "rawValue": 1.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 23%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "populationTrend": 12,
    "farmActivity": null,
    "medical": 64,
    "school": 37,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -8.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.2%",
        "interpretation": "2018~2022년 인구 -8.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.0곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 36%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 37%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 1,
    "school": 52,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 18.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +18.4%",
        "interpretation": "2018~2022년 인구 +18.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 9.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 3.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 48%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "populationTrend": 66,
    "farmActivity": null,
    "medical": 92,
    "school": 8,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.1%",
        "interpretation": "2018~2022년 인구 -0.1% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.1곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 8%)"
      },
      "school": {
        "rawValue": 1.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 8%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "populationTrend": 66,
    "farmActivity": null,
    "medical": 90,
    "school": 2,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2018~2022년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.8곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 1.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 2%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "populationTrend": 8,
    "farmActivity": null,
    "medical": 17,
    "school": 23,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -8.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.8%",
        "interpretation": "2018~2022년 인구 -8.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 1.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 23%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "populationTrend": 100,
    "farmActivity": 3,
    "medical": 21,
    "school": 35,
    "returnFarm": 15,
    "evidence": {
      "populationTrend": {
        "rawValue": 8.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +8.8%",
        "interpretation": "2018~2022년 인구 +8.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 127.16,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 127호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 3%)"
      },
      "medical": {
        "rawValue": 12.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 21%)"
      },
      "school": {
        "rawValue": 2.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 35%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 15%)"
      }
    }
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "populationTrend": 72,
    "farmActivity": null,
    "medical": 100,
    "school": 43,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.7%",
        "interpretation": "2018~2022년 인구 +0.7% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 62.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 62.2곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 2.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 57,
    "school": 14,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.8%",
        "interpretation": "2018~2022년 인구 -2.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.3곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 1.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 14%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 71,
    "school": 24,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -12.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -12.6%",
        "interpretation": "2018~2022년 인구 -12.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.7곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 29%)"
      },
      "school": {
        "rawValue": 1.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 24%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 81,
    "school": 34,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.0%",
        "interpretation": "2018~2022년 인구 -5.0% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.2곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 19%)"
      },
      "school": {
        "rawValue": 2.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 34%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "populationTrend": 58,
    "farmActivity": null,
    "medical": 40,
    "school": 20,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.2%",
        "interpretation": "2018~2022년 인구 -1.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 1.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 20%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 96,
    "school": 21,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.9%",
        "interpretation": "2018~2022년 인구 -3.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 22.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 22.9곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 4%)"
      },
      "school": {
        "rawValue": 1.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 21%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 63,
    "school": 26,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2018~2022년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.0곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 2,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 26%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "populationTrend": 100,
    "farmActivity": 12,
    "medical": 8,
    "school": 40,
    "returnFarm": 17,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.1%",
        "interpretation": "2018~2022년 인구 +6.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 259.62,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 260호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 12%)"
      },
      "medical": {
        "rawValue": 10.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 8%)"
      },
      "school": {
        "rawValue": 2.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 17%)"
      }
    }
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "populationTrend": 52,
    "farmActivity": 91,
    "medical": 64,
    "school": 83,
    "returnFarm": 98,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2018~2022년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1889.71,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,890호",
        "rankPercent": 9,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 9%)"
      },
      "medical": {
        "rawValue": 16.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.1곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 36%)"
      },
      "school": {
        "rawValue": 6.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.9곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
      },
      "returnFarm": {
        "rawValue": 0.34,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 2,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 2%)"
      }
    }
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "populationTrend": 1,
    "farmActivity": null,
    "medical": 16,
    "school": 28,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -9.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.9%",
        "interpretation": "2018~2022년 인구 -9.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 16%)"
      },
      "school": {
        "rawValue": 2.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 28%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 91,
    "school": 29,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.0%",
        "interpretation": "2018~2022년 인구 -5.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.0곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 9%)"
      },
      "school": {
        "rawValue": 2.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 29%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "populationTrend": 15,
    "farmActivity": null,
    "medical": 13,
    "school": 34,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.7%",
        "interpretation": "2018~2022년 인구 -7.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 2.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 34%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 1,
    "school": 40,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.4%",
        "interpretation": "2018~2022년 인구 +6.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 8.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 8.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "populationTrend": 64,
    "farmActivity": 17,
    "medical": 2,
    "school": 47,
    "returnFarm": 28,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 331.15,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 331호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 17%)"
      },
      "medical": {
        "rawValue": 9.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 2%)"
      },
      "school": {
        "rawValue": 2.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 28%)"
      }
    }
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "populationTrend": 56,
    "farmActivity": 18,
    "medical": 37,
    "school": 47,
    "returnFarm": 19,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.5%",
        "interpretation": "2018~2022년 인구 -1.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 336.93,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 337호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 18%)"
      },
      "medical": {
        "rawValue": 13.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 2.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 19%)"
      }
    }
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "populationTrend": 55,
    "farmActivity": 30,
    "medical": 18,
    "school": 53,
    "returnFarm": 32,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.7%",
        "interpretation": "2018~2022년 인구 -1.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 597.9,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 598호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 30%)"
      },
      "medical": {
        "rawValue": 11.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 18%)"
      },
      "school": {
        "rawValue": 3.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 32%)"
      }
    }
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "populationTrend": 56,
    "farmActivity": 57,
    "medical": 14,
    "school": 62,
    "returnFarm": 35,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1126.45,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,126호",
        "rankPercent": 43,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 43%)"
      },
      "medical": {
        "rawValue": 11.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
      },
      "school": {
        "rawValue": 3.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.0곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 38%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 35%)"
      }
    }
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "populationTrend": 41,
    "farmActivity": 41,
    "medical": 49,
    "school": 60,
    "returnFarm": 42,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 840.57,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 841호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 41%)"
      },
      "medical": {
        "rawValue": 14.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 49%)"
      },
      "school": {
        "rawValue": 3.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 42%)"
      }
    }
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "populationTrend": 46,
    "farmActivity": 20,
    "medical": 14,
    "school": 42,
    "returnFarm": 7,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.1%",
        "interpretation": "2018~2022년 인구 -3.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 354.01,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 354호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 20%)"
      },
      "medical": {
        "rawValue": 11.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
      },
      "school": {
        "rawValue": 2.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 42%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 7%)"
      }
    }
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "populationTrend": 32,
    "farmActivity": 45,
    "medical": 46,
    "school": 61,
    "returnFarm": 36,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 921.09,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 921호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 45%)"
      },
      "medical": {
        "rawValue": 14.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 46%)"
      },
      "school": {
        "rawValue": 3.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 36%)"
      }
    }
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "populationTrend": 74,
    "farmActivity": 48,
    "medical": 54,
    "school": 63,
    "returnFarm": 55,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.1%",
        "interpretation": "2018~2022년 인구 +1.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 977.63,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 978호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 48%)"
      },
      "medical": {
        "rawValue": 14.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 46%)"
      },
      "school": {
        "rawValue": 4.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.2곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 45,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 45%)"
      }
    }
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "populationTrend": 37,
    "farmActivity": 76,
    "medical": 60,
    "school": 75,
    "returnFarm": 63,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2018~2022년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1462.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,463호",
        "rankPercent": 24,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 24%)"
      },
      "medical": {
        "rawValue": 15.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 5.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
      },
      "returnFarm": {
        "rawValue": 0.13,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 37,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 37%)"
      }
    }
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "populationTrend": 53,
    "farmActivity": 59,
    "medical": 66,
    "school": 68,
    "returnFarm": 57,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2018~2022년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1169.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,169호",
        "rankPercent": 41,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 41%)"
      },
      "medical": {
        "rawValue": 16.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 34%)"
      },
      "school": {
        "rawValue": 5.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.0곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 32%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 43,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 43%)"
      }
    }
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "populationTrend": 93,
    "farmActivity": 17,
    "medical": 20,
    "school": 29,
    "returnFarm": 18,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.9%",
        "interpretation": "2018~2022년 인구 +3.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 329.73,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 330호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 17%)"
      },
      "medical": {
        "rawValue": 11.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 2.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 18%)"
      }
    }
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "populationTrend": 42,
    "farmActivity": 97,
    "medical": 73,
    "school": 82,
    "returnFarm": 94,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2018~2022년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2094.61,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,095호",
        "rankPercent": 3,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 3%)"
      },
      "medical": {
        "rawValue": 17.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.2곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
      },
      "school": {
        "rawValue": 6.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
      },
      "returnFarm": {
        "rawValue": 0.29,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 6,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 6%)"
      }
    }
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "populationTrend": 39,
    "farmActivity": 100,
    "medical": 73,
    "school": 95,
    "returnFarm": 99,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.1%",
        "interpretation": "2018~2022년 인구 -4.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2225.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,226호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 16.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.8곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
      },
      "school": {
        "rawValue": 9.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.1곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 5%)"
      },
      "returnFarm": {
        "rawValue": 0.35,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 1,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 1%)"
      }
    }
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "populationTrend": 17,
    "farmActivity": 94,
    "medical": 40,
    "school": 96,
    "returnFarm": 94,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.4%",
        "interpretation": "2018~2022년 인구 -7.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1965.04,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,965호",
        "rankPercent": 6,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 6%)"
      },
      "medical": {
        "rawValue": 13.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 9.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.1곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 4%)"
      },
      "returnFarm": {
        "rawValue": 0.27,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 6,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 6%)"
      }
    }
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "populationTrend": 19,
    "farmActivity": 63,
    "medical": 79,
    "school": 83,
    "returnFarm": 74,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.1%",
        "interpretation": "2018~2022년 인구 -7.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1193.16,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,193호",
        "rankPercent": 37,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 37%)"
      },
      "medical": {
        "rawValue": 17.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 21%)"
      },
      "school": {
        "rawValue": 6.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.6곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 26,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 26%)"
      }
    }
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "populationTrend": 53,
    "farmActivity": 87,
    "medical": 76,
    "school": 70,
    "returnFarm": 91,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2018~2022년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1832.69,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,833호",
        "rankPercent": 13,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 13%)"
      },
      "medical": {
        "rawValue": 17.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.5곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 24%)"
      },
      "school": {
        "rawValue": 5.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.24,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 9,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 9%)"
      }
    }
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "populationTrend": 15,
    "farmActivity": 69,
    "medical": 57,
    "school": 72,
    "returnFarm": 65,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.7%",
        "interpretation": "2018~2022년 인구 -7.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1305.16,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,305호",
        "rankPercent": 31,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 31%)"
      },
      "medical": {
        "rawValue": 15.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.3곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 5.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 28%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 35,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 35%)"
      }
    }
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "populationTrend": 59,
    "farmActivity": 73,
    "medical": 56,
    "school": 72,
    "returnFarm": 70,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.1%",
        "interpretation": "2018~2022년 인구 -1.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1410.98,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,411호",
        "rankPercent": 27,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 27%)"
      },
      "medical": {
        "rawValue": 15.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 44%)"
      },
      "school": {
        "rawValue": 5.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 28%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 30,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 30%)"
      }
    }
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "populationTrend": 26,
    "farmActivity": 25,
    "medical": 8,
    "school": 57,
    "returnFarm": 27,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2018~2022년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 465,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 465호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 25%)"
      },
      "medical": {
        "rawValue": 10.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 8%)"
      },
      "school": {
        "rawValue": 3.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 27%)"
      }
    }
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "populationTrend": 100,
    "farmActivity": 77,
    "medical": 39,
    "school": 65,
    "returnFarm": 71,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.6%",
        "interpretation": "2018~2022년 인구 +6.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1521.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,522호",
        "rankPercent": 23,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 23%)"
      },
      "medical": {
        "rawValue": 13.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.6곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 39%)"
      },
      "school": {
        "rawValue": 4.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.6곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 35%)"
      },
      "returnFarm": {
        "rawValue": 0.16,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 29,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 29%)"
      }
    }
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "populationTrend": 22,
    "farmActivity": 93,
    "medical": 25,
    "school": 93,
    "returnFarm": 85,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2018~2022년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1951.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,952호",
        "rankPercent": 7,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 7%)"
      },
      "medical": {
        "rawValue": 12.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 25%)"
      },
      "school": {
        "rawValue": 8.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.3곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 7%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 15,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 15%)"
      }
    }
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "populationTrend": 37,
    "farmActivity": 49,
    "medical": 45,
    "school": 73,
    "returnFarm": 45,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.4%",
        "interpretation": "2018~2022년 인구 -4.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 983.37,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 983호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 49%)"
      },
      "medical": {
        "rawValue": 14.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
      },
      "school": {
        "rawValue": 5.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 27%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 45%)"
      }
    }
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "populationTrend": 33,
    "farmActivity": 35,
    "medical": 3,
    "school": 86,
    "returnFarm": 39,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.1%",
        "interpretation": "2018~2022년 인구 -5.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 652.75,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 653호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 35%)"
      },
      "medical": {
        "rawValue": 9.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 7.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 39%)"
      }
    }
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "populationTrend": 49,
    "farmActivity": 9,
    "medical": 35,
    "school": 36,
    "returnFarm": 1,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.6%",
        "interpretation": "2018~2022년 인구 -2.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 196.09,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 196호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 9%)"
      },
      "medical": {
        "rawValue": 13.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 35%)"
      },
      "school": {
        "rawValue": 2.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
      },
      "returnFarm": {
        "rawValue": 0,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 1%)"
      }
    }
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "populationTrend": 64,
    "farmActivity": 24,
    "medical": 42,
    "school": 46,
    "returnFarm": 19,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.3%",
        "interpretation": "2018~2022년 인구 -0.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 461.15,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 461호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 24%)"
      },
      "medical": {
        "rawValue": 13.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 42%)"
      },
      "school": {
        "rawValue": 2.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.7곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 46%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 19%)"
      }
    }
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "populationTrend": 24,
    "farmActivity": 19,
    "medical": 34,
    "school": 55,
    "returnFarm": 25,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2018~2022년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 340.72,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 341호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 19%)"
      },
      "medical": {
        "rawValue": 13.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
      },
      "school": {
        "rawValue": 3.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 25%)"
      }
    }
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "populationTrend": 49,
    "farmActivity": 32,
    "medical": 30,
    "school": 57,
    "returnFarm": 33,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.6%",
        "interpretation": "2018~2022년 인구 -2.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 620.76,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 621호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 32%)"
      },
      "medical": {
        "rawValue": 12.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 3.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.5곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 33%)"
      }
    }
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "populationTrend": 76,
    "farmActivity": 7,
    "medical": 9,
    "school": 32,
    "returnFarm": 1,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.5%",
        "interpretation": "2018~2022년 인구 +1.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 192.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 192호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 7%)"
      },
      "medical": {
        "rawValue": 10.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 9%)"
      },
      "school": {
        "rawValue": 2.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 32%)"
      },
      "returnFarm": {
        "rawValue": 0,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 1%)"
      }
    }
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "populationTrend": 53,
    "farmActivity": 54,
    "medical": 38,
    "school": 63,
    "returnFarm": 49,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1065.53,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,066호",
        "rankPercent": 46,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 46%)"
      },
      "medical": {
        "rawValue": 13.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.6곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 4.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.1곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 49%)"
      }
    }
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "populationTrend": 24,
    "farmActivity": 16,
    "medical": 4,
    "school": 51,
    "returnFarm": 13,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2018~2022년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 321.19,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 321호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 16%)"
      },
      "medical": {
        "rawValue": 9.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 4%)"
      },
      "school": {
        "rawValue": 3.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 49%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 13%)"
      }
    }
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "populationTrend": 82,
    "farmActivity": 2,
    "medical": 22,
    "school": 33,
    "returnFarm": 6,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.3%",
        "interpretation": "2018~2022년 인구 +2.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 123.94,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 124호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 2%)"
      },
      "medical": {
        "rawValue": 12.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 22%)"
      },
      "school": {
        "rawValue": 2.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 6%)"
      }
    }
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "populationTrend": 32,
    "farmActivity": 78,
    "medical": 87,
    "school": 94,
    "returnFarm": 82,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1533.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,534호",
        "rankPercent": 22,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 22%)"
      },
      "medical": {
        "rawValue": 18.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.8곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
      },
      "school": {
        "rawValue": 8.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.8곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 6%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 18,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 18%)"
      }
    }
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "populationTrend": 16,
    "farmActivity": 47,
    "medical": 12,
    "school": 66,
    "returnFarm": 47,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.6%",
        "interpretation": "2018~2022년 인구 -7.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 955.15,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 955호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 47%)"
      },
      "medical": {
        "rawValue": 11.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 12%)"
      },
      "school": {
        "rawValue": 4.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.8곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 34%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 47%)"
      }
    }
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "populationTrend": 25,
    "farmActivity": 65,
    "medical": 67,
    "school": 78,
    "returnFarm": 69,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2018~2022년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1215.56,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,216호",
        "rankPercent": 35,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 35%)"
      },
      "medical": {
        "rawValue": 16.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 6.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.1곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 22%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 31,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 31%)"
      }
    }
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "populationTrend": 22,
    "farmActivity": 68,
    "medical": 47,
    "school": 78,
    "returnFarm": 64,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2018~2022년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1298.4,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,298호",
        "rankPercent": 32,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 32%)"
      },
      "medical": {
        "rawValue": 14.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
      },
      "school": {
        "rawValue": 6.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.2곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 22%)"
      },
      "returnFarm": {
        "rawValue": 0.13,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 36,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 36%)"
      }
    }
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "populationTrend": 32,
    "farmActivity": 80,
    "medical": 66,
    "school": 85,
    "returnFarm": 79,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1603.81,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,604호",
        "rankPercent": 20,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 20%)"
      },
      "medical": {
        "rawValue": 16.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 34%)"
      },
      "school": {
        "rawValue": 7.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 15%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 21,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 21%)"
      }
    }
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "populationTrend": 13,
    "farmActivity": 89,
    "medical": 85,
    "school": 90,
    "returnFarm": 91,
    "evidence": {
      "populationTrend": {
        "rawValue": -8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.0%",
        "interpretation": "2018~2022년 인구 -8.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1860.05,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,860호",
        "rankPercent": 11,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 11%)"
      },
      "medical": {
        "rawValue": 18.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.5곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 15%)"
      },
      "school": {
        "rawValue": 7.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.24,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 9,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 9%)"
      }
    }
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "populationTrend": 41,
    "farmActivity": 96,
    "medical": 86,
    "school": 86,
    "returnFarm": 86,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1970.38,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,970호",
        "rankPercent": 4,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 4%)"
      },
      "medical": {
        "rawValue": 18.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.6곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 7.31,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.3곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 14,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 14%)"
      }
    }
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "populationTrend": 32,
    "farmActivity": 86,
    "medical": 78,
    "school": 80,
    "returnFarm": 81,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1818.31,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,818호",
        "rankPercent": 14,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 14%)"
      },
      "medical": {
        "rawValue": 17.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.8곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 22%)"
      },
      "school": {
        "rawValue": 6.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.4곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 19,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 19%)"
      }
    }
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "populationTrend": 52,
    "farmActivity": 75,
    "medical": 65,
    "school": 77,
    "returnFarm": 63,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2018~2022년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1447.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,447호",
        "rankPercent": 25,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 25%)"
      },
      "medical": {
        "rawValue": 16.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 35%)"
      },
      "school": {
        "rawValue": 5.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 23%)"
      },
      "returnFarm": {
        "rawValue": 0.13,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 37,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 37%)"
      }
    }
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "populationTrend": 24,
    "farmActivity": 84,
    "medical": 82,
    "school": 92,
    "returnFarm": 81,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.5%",
        "interpretation": "2018~2022년 인구 -6.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1776.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,777호",
        "rankPercent": 16,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 16%)"
      },
      "medical": {
        "rawValue": 18.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.2곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 18%)"
      },
      "school": {
        "rawValue": 8.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.2곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 8%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 19,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 19%)"
      }
    }
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "populationTrend": 84,
    "farmActivity": 26,
    "medical": 60,
    "school": 44,
    "returnFarm": 16,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.6%",
        "interpretation": "2018~2022년 인구 +2.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 468.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 469호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 26%)"
      },
      "medical": {
        "rawValue": 15.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.6곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 2.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 16%)"
      }
    }
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "populationTrend": 89,
    "farmActivity": 40,
    "medical": 57,
    "school": 61,
    "returnFarm": 31,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.3%",
        "interpretation": "2018~2022년 인구 +3.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 824.54,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 825호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 40%)"
      },
      "medical": {
        "rawValue": 15.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 3.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.0곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 31%)"
      }
    }
  }
];

const SCORE_INDEX = new Map(DIMENSION_SCORES.map((s) => [s.sgisCode, s]));

/** sgisCode로 차원별 점수 조회 (없으면 null) */
export function getDimensionScores(
  sgisCode: string,
): DimensionScores | null {
  return SCORE_INDEX.get(sgisCode) ?? null;
}

/**
 * 차원 라벨·ID·타입은 경량 모듈 dimension-meta.ts로 분리했다 (번들 다이어트 2026-07-27).
 * 서버 코드가 dimension-scores.ts 한 곳에서 함께 import하던 경로를 보존하기 위해 re-export.
 * ⚠️ client 컴포넌트는 이 re-export가 아니라 `@/lib/data/dimension-meta`에서 직접 import할 것.
 */
export {
  DIMENSION_LABELS,
  DIMENSION_IDS,
  type DimensionId,
} from "./dimension-meta";
