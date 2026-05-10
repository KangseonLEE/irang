/**
 * 시군구 차원별 5점수 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-dimension-scores.ts
 * 마지막 갱신: 2026-05-10
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/compute-dimension-scores.ts`
 *
 * 5차원 (각 0~100 또는 null):
 * 1. populationTrend: 5년 인구 변화율 선형 (-10% → 0, +5% → 100)
 * 2. farmActivity: 인구 1만명당 농가 수 전국 분위 (1~100). 도시 자치구 null
 * 3. medical: 인구 1만명당 의료기관 수 전국 분위 (1~100)
 * 4. school: 인구 1만명당 학교 수 전국 분위 (1~100). 군위 null
 * 5. returnFarm: 귀농 인구 비율 전국 분위 (1~100). 도시 자치구 null
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
  /** 학교 인프라 분위 (1~100). 군위 null */
  school: number | null;
  /** 귀농 인구 비율 분위 (1~100). 도시 자치구 null */
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
    "school": 51,
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
        "rawValue": 31.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 31.9곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 2%)"
      },
      "school": {
        "rawValue": 3.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 49%)"
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
        "rawValue": 49.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 49.3곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 2.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 41%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 56,
    "school": 14,
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
        "rawValue": 15.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.1곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 44%)"
      },
      "school": {
        "rawValue": 1.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 14%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "populationTrend": 13,
    "farmActivity": null,
    "medical": 75,
    "school": 6,
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
        "rawValue": 17.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.4곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 25%)"
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
        "rawValue": 17.43,
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
    "school": 7,
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
        "rawValue": 18.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.5곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 16%)"
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
    "sgisCode": "11070",
    "name": "중랑구",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 57,
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
        "rawValue": 15.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
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
    "medical": 31,
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
        "rawValue": 12.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
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
    "medical": 71,
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
        "rawValue": 16.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 29%)"
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
    "school": 7,
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
        "rawValue": 12.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 1.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 7%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "populationTrend": 20,
    "farmActivity": null,
    "medical": 59,
    "school": 26,
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
        "rawValue": 15.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.5곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 41%)"
      },
      "school": {
        "rawValue": 1.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 26%)"
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
    "school": 9,
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
        "rawValue": 15.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.8곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 38%)"
      },
      "school": {
        "rawValue": 1.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 9%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "populationTrend": 65,
    "farmActivity": null,
    "medical": 47,
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
        "rawValue": 14.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
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
    "school": 4,
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
        "rawValue": 21.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 22.0곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 4%)"
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
    "sgisCode": "11150",
    "name": "양천구",
    "populationTrend": 39,
    "farmActivity": null,
    "medical": 68,
    "school": 9,
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
        "rawValue": 16.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 32%)"
      },
      "school": {
        "rawValue": 1.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 9%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 76,
    "school": 8,
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
        "rawValue": 17.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 24%)"
      },
      "school": {
        "rawValue": 1.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 8%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 51,
    "school": 5,
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
        "rawValue": 14.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.6곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 49%)"
      },
      "school": {
        "rawValue": 1.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 5%)"
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
    "medical": 94,
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
        "rawValue": 21.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.3곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 6%)"
      },
      "school": {
        "rawValue": 1.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.1곳",
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
    "medical": 63,
    "school": 4,
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
        "rawValue": 15.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 1.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.3곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 4%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "populationTrend": 49,
    "farmActivity": null,
    "medical": 49,
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
        "rawValue": 14.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 49%)"
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
    "sgisCode": "11220",
    "name": "서초구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 99,
    "school": 8,
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
        "rawValue": 41.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 41.6곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 1.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 8%)"
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
    "school": 14,
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
        "rawValue": 62.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 62.3곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 1.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 14%)"
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
        "rawValue": 20.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.9곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
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
        "rawValue": 21.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.5곳",
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
    "sgisCode": "23010",
    "name": "중구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 5,
    "school": 51,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 26.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +26.1%",
        "interpretation": "2018~2022년 인구 +26.1% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 9.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 5%)"
      },
      "school": {
        "rawValue": 3.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 49%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 54,
    "school": 100,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -10.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -10.9%",
        "interpretation": "2018~2022년 인구 -10.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.0곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 46%)"
      },
      "school": {
        "rawValue": 16.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 16.9곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "populationTrend": 67,
    "farmActivity": null,
    "medical": 28,
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
        "rawValue": 12.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 28%)"
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
    "medical": 31,
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
        "rawValue": 12.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
      },
      "school": {
        "rawValue": 1.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
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
        "rawValue": 14.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 1.62,
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
        "rawValue": 13.69,
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
    "medical": 34,
    "school": 21,
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
        "rawValue": 13.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
      },
      "school": {
        "rawValue": 1.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 21%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 20,
    "school": 21,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 9.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +9.1%",
        "interpretation": "2018~2022년 인구 +9.1% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 1.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 21%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "populationTrend": 87,
    "farmActivity": 57,
    "medical": 31,
    "school": 69,
    "returnFarm": 58,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.1%",
        "interpretation": "2018~2022년 인구 +3.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 965.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 966호",
        "rankPercent": 43,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 43%)"
      },
      "medical": {
        "rawValue": 12.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
      },
      "school": {
        "rawValue": 5.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 31%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 42,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 42%)"
      }
    }
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "populationTrend": 71,
    "farmActivity": 34,
    "medical": 44,
    "school": 98,
    "returnFarm": 39,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.6%",
        "interpretation": "2018~2022년 인구 +0.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 586.17,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 586호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 34%)"
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
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 39%)"
      }
    }
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 51,
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
        "rawValue": 14.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 49%)"
      },
      "school": {
        "rawValue": 1.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
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
    "school": 18,
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
        "rawValue": 1.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 18%)"
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
        "rawValue": 13.75,
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
        "rawValue": 1.63,
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
    "medical": 48,
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
        "rawValue": 14.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
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
    "medical": 73,
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
        "rawValue": 17.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.0곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
      },
      "school": {
        "rawValue": 1.69,
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
    "medical": 21,
    "school": 31,
    "returnFarm": 8,
    "evidence": {
      "populationTrend": {
        "rawValue": 17,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +17.0%",
        "interpretation": "2018~2022년 인구 +17.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 153.4,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 153호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 8%)"
      },
      "medical": {
        "rawValue": 11.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 21%)"
      },
      "school": {
        "rawValue": 2.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 31%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 8%)"
      }
    }
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "populationTrend": 43,
    "farmActivity": null,
    "medical": 5,
    "school": 39,
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
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 5%)"
      },
      "school": {
        "rawValue": 2.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 39%)"
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
    "school": 11,
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
        "rawValue": 11.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 1.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 11%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "populationTrend": 91,
    "farmActivity": null,
    "medical": 35,
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
        "rawValue": 13.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 35%)"
      },
      "school": {
        "rawValue": 1.75,
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
    "medical": 65,
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
        "rawValue": 16.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 35%)"
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
    "medical": 88,
    "school": 14,
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
        "rawValue": 19.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.1곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 12%)"
      },
      "school": {
        "rawValue": 1.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 14%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "populationTrend": 100,
    "farmActivity": 2,
    "medical": 17,
    "school": 19,
    "returnFarm": 3,
    "evidence": {
      "populationTrend": {
        "rawValue": 8.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +8.8%",
        "interpretation": "2018~2022년 인구 +8.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 68.48,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 68.5호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 2%)"
      },
      "medical": {
        "rawValue": 11.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 1.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 19%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 3%)"
      }
    }
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 11,
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
        "rawValue": 10.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 11%)"
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
    "medical": 6,
    "school": 17,
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
        "rawValue": 10.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 6%)"
      },
      "school": {
        "rawValue": 1.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 17%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 29,
    "school": 16,
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
        "rawValue": 12.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 29%)"
      },
      "school": {
        "rawValue": 1.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 16%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 9,
    "school": 24,
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
        "rawValue": 10.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 9%)"
      },
      "school": {
        "rawValue": 1.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 24%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 48,
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
        "rawValue": 14.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
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
    "school": 20,
    "returnFarm": 1,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.8%",
        "interpretation": "2018~2022년 인구 +3.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 68.46,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 68.5호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 1%)"
      },
      "medical": {
        "rawValue": 12.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 22%)"
      },
      "school": {
        "rawValue": 1.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 20%)"
      },
      "returnFarm": {
        "rawValue": 0,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 1%)"
      }
    }
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "populationTrend": 100,
    "farmActivity": 7,
    "medical": 12,
    "school": 38,
    "returnFarm": 6,
    "evidence": {
      "populationTrend": {
        "rawValue": 9.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +9.6%",
        "interpretation": "2018~2022년 인구 +9.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 133.57,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 134호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 7%)"
      },
      "medical": {
        "rawValue": 10.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 12%)"
      },
      "school": {
        "rawValue": 2.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 38%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 6%)"
      }
    }
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "populationTrend": 87,
    "farmActivity": 23,
    "medical": 18,
    "school": 44,
    "returnFarm": 22,
    "evidence": {
      "populationTrend": {
        "rawValue": 3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.0%",
        "interpretation": "2018~2022년 인구 +3.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 362.2,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 362호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 23%)"
      },
      "medical": {
        "rawValue": 11.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 18%)"
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
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 22%)"
      }
    }
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "populationTrend": 91,
    "farmActivity": 25,
    "medical": 10,
    "school": 47,
    "returnFarm": 30,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.7%",
        "interpretation": "2018~2022년 인구 +3.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 380.74,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 381호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 25%)"
      },
      "medical": {
        "rawValue": 10.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 2.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 30%)"
      }
    }
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "populationTrend": 100,
    "farmActivity": 4,
    "medical": 14,
    "school": 22,
    "returnFarm": 7,
    "evidence": {
      "populationTrend": {
        "rawValue": 15.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +15.6%",
        "interpretation": "2018~2022년 인구 +15.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 101.37,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 101호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 4%)"
      },
      "medical": {
        "rawValue": 11.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
      },
      "school": {
        "rawValue": 1.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 22%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 7%)"
      }
    }
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "populationTrend": 100,
    "farmActivity": 5,
    "medical": 1,
    "school": 30,
    "returnFarm": 11,
    "evidence": {
      "populationTrend": {
        "rawValue": 19.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +19.9%",
        "interpretation": "2018~2022년 인구 +19.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 111.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 112호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 5%)"
      },
      "medical": {
        "rawValue": 4.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 4.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.11,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 11%)"
      }
    }
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "populationTrend": 100,
    "farmActivity": 2,
    "medical": 3,
    "school": 11,
    "returnFarm": 5,
    "evidence": {
      "populationTrend": {
        "rawValue": 7.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +7.9%",
        "interpretation": "2018~2022년 인구 +7.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 99.97,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 100.0호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 2%)"
      },
      "medical": {
        "rawValue": 9.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
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
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 5%)"
      }
    }
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "populationTrend": 100,
    "farmActivity": 8,
    "medical": 7,
    "school": 90,
    "returnFarm": 2,
    "evidence": {
      "populationTrend": {
        "rawValue": 11.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.6%",
        "interpretation": "2018~2022년 인구 +11.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 153.71,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 154호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 8%)"
      },
      "medical": {
        "rawValue": 10.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 8.11,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.1곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 2%)"
      }
    }
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "populationTrend": 75,
    "farmActivity": 23,
    "medical": 4,
    "school": 49,
    "returnFarm": 27,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.2%",
        "interpretation": "2018~2022년 인구 +1.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 369.02,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 369호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 23%)"
      },
      "medical": {
        "rawValue": 9.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 4%)"
      },
      "school": {
        "rawValue": 2.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.9곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 49%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 27%)"
      }
    }
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "populationTrend": 77,
    "farmActivity": 36,
    "medical": 26,
    "school": 61,
    "returnFarm": 36,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.5%",
        "interpretation": "2018~2022년 인구 +1.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 604.23,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 604호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 36%)"
      },
      "medical": {
        "rawValue": 12.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 26%)"
      },
      "school": {
        "rawValue": 4.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.0곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 36%)"
      }
    }
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 29,
    "school": 58,
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
        "rawValue": 12.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 29%)"
      },
      "school": {
        "rawValue": 3.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 42%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 61,
    "school": 63,
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
        "rawValue": 15.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 39%)"
      },
      "school": {
        "rawValue": 4.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.5곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 33,
    "school": 69,
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
        "rawValue": 13.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 5.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 31%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "populationTrend": 86,
    "farmActivity": 13,
    "medical": 33,
    "school": 47,
    "returnFarm": 11,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.9%",
        "interpretation": "2018~2022년 인구 +2.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 228.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 229호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 13%)"
      },
      "medical": {
        "rawValue": 13.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 2.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 11%)"
      }
    }
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "populationTrend": 100,
    "farmActivity": 15,
    "medical": 45,
    "school": 45,
    "returnFarm": 10,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.1%",
        "interpretation": "2018~2022년 인구 +5.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 246.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 247호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 15%)"
      },
      "medical": {
        "rawValue": 14.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
      },
      "school": {
        "rawValue": 2.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.7곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 10%)"
      }
    }
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "populationTrend": 65,
    "farmActivity": 21,
    "medical": 28,
    "school": 48,
    "returnFarm": 17,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2018~2022년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 327.53,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 328호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 21%)"
      },
      "medical": {
        "rawValue": 12.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 28%)"
      },
      "school": {
        "rawValue": 2.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.9곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 48%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 17%)"
      }
    }
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "populationTrend": 59,
    "farmActivity": null,
    "medical": 24,
    "school": 54,
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
        "rawValue": 12.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 3.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 46%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 14,
    "school": 79,
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
        "rawValue": 11.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
      },
      "school": {
        "rawValue": 6.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.4곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "populationTrend": 89,
    "farmActivity": null,
    "medical": 70,
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
        "rawValue": 16.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
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
    "farmActivity": 37,
    "medical": 7,
    "school": 70,
    "returnFarm": 30,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2018~2022년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 618.15,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 618호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 37%)"
      },
      "medical": {
        "rawValue": 10.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 5.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 30%)"
      }
    }
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "populationTrend": 47,
    "farmActivity": 63,
    "medical": 38,
    "school": 82,
    "returnFarm": 67,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2018~2022년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1040.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,041호",
        "rankPercent": 37,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 37%)"
      },
      "medical": {
        "rawValue": 13.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 6.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.9곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 33,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 33%)"
      }
    }
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "populationTrend": 78,
    "farmActivity": 64,
    "medical": 20,
    "school": 86,
    "returnFarm": 76,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.7%",
        "interpretation": "2018~2022년 인구 +1.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1087.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,088호",
        "rankPercent": 36,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 36%)"
      },
      "medical": {
        "rawValue": 11.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 7.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.6곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
      },
      "returnFarm": {
        "rawValue": 0.16,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 24,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 24%)"
      }
    }
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "populationTrend": 47,
    "farmActivity": 48,
    "medical": 8,
    "school": 91,
    "returnFarm": 69,
    "evidence": {
      "populationTrend": {
        "rawValue": -3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.0%",
        "interpretation": "2018~2022년 인구 -3.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 854.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 855호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 48%)"
      },
      "medical": {
        "rawValue": 10.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 8%)"
      },
      "school": {
        "rawValue": 8.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.1곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 9%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 31,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 31%)"
      }
    }
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "populationTrend": 45,
    "farmActivity": 60,
    "medical": 55,
    "school": 89,
    "returnFarm": 74,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1011.65,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,012호",
        "rankPercent": 40,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 40%)"
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
        "rankPercent": 11,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 11%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 26,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 26%)"
      }
    }
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "populationTrend": 25,
    "farmActivity": 44,
    "medical": 17,
    "school": 97,
    "returnFarm": 40,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.3%",
        "interpretation": "2018~2022년 인구 -6.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 805.9,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 806호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 44%)"
      },
      "medical": {
        "rawValue": 11.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 9.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.9곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 3%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 40%)"
      }
    }
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "populationTrend": 19,
    "farmActivity": 54,
    "medical": 23,
    "school": 78,
    "returnFarm": 48,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.2%",
        "interpretation": "2018~2022년 인구 -7.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 925.02,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 925호",
        "rankPercent": 46,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 46%)"
      },
      "medical": {
        "rawValue": 12.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 6.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.3곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 22%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 48%)"
      }
    }
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "populationTrend": 28,
    "farmActivity": 46,
    "medical": 55,
    "school": 92,
    "returnFarm": 67,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 816.15,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 816호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 46%)"
      },
      "medical": {
        "rawValue": 15.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.1곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 45%)"
      },
      "school": {
        "rawValue": 8.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.4곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 8%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 33,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 33%)"
      }
    }
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "populationTrend": 28,
    "farmActivity": 66,
    "medical": 15,
    "school": 95,
    "returnFarm": 60,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2018~2022년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1094.89,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,095호",
        "rankPercent": 34,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 34%)"
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
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 40,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 40%)"
      }
    }
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "populationTrend": 78,
    "farmActivity": 53,
    "medical": 7,
    "school": 87,
    "returnFarm": 47,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.8%",
        "interpretation": "2018~2022년 인구 +1.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 911.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 912호",
        "rankPercent": 47,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 47%)"
      },
      "medical": {
        "rawValue": 10.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 7.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 47%)"
      }
    }
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "populationTrend": 43,
    "farmActivity": 41,
    "medical": 19,
    "school": 86,
    "returnFarm": 38,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.6%",
        "interpretation": "2018~2022년 인구 -3.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 783.35,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 783호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 41%)"
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
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 38%)"
      }
    }
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "populationTrend": 91,
    "farmActivity": 62,
    "medical": 4,
    "school": 85,
    "returnFarm": 44,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.6%",
        "interpretation": "2018~2022년 인구 +3.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1028.76,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,029호",
        "rankPercent": 38,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 38%)"
      },
      "medical": {
        "rawValue": 9.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 4%)"
      },
      "school": {
        "rawValue": 7.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.5곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 15%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 44%)"
      }
    }
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "populationTrend": 77,
    "farmActivity": 11,
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
        "rawValue": 186.1,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 186호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 11%)"
      },
      "medical": {
        "rawValue": 13.36,
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
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 12%)"
      }
    }
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "populationTrend": 68,
    "farmActivity": 28,
    "medical": 30,
    "school": 53,
    "returnFarm": 26,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.3%",
        "interpretation": "2018~2022년 인구 +0.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 413.98,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 414호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 28%)"
      },
      "medical": {
        "rawValue": 12.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 3.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 26%)"
      }
    }
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "populationTrend": 39,
    "farmActivity": 32,
    "medical": 53,
    "school": 56,
    "returnFarm": 27,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2018~2022년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 489.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 489호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 32%)"
      },
      "medical": {
        "rawValue": 14.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 3.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 27%)"
      }
    }
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "populationTrend": 28,
    "farmActivity": null,
    "medical": 82,
    "school": 84,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2018~2022년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 18%)"
      },
      "school": {
        "rawValue": 7.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 16%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "populationTrend": 43,
    "farmActivity": 67,
    "medical": 77,
    "school": 64,
    "returnFarm": 65,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.5%",
        "interpretation": "2018~2022년 인구 -3.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1096.99,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,097호",
        "rankPercent": 33,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 33%)"
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
        "rankPercent": 36,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 36%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 35,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 35%)"
      }
    }
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "populationTrend": 3,
    "farmActivity": 78,
    "medical": 82,
    "school": 74,
    "returnFarm": 75,
    "evidence": {
      "populationTrend": {
        "rawValue": -9.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.6%",
        "interpretation": "2018~2022년 인구 -9.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1359.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,360호",
        "rankPercent": 22,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 22%)"
      },
      "medical": {
        "rawValue": 18.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 18%)"
      },
      "school": {
        "rawValue": 5.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 26%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 25,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 25%)"
      }
    }
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "populationTrend": 72,
    "farmActivity": 27,
    "medical": 32,
    "school": 44,
    "returnFarm": 77,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.8%",
        "interpretation": "2018~2022년 인구 +0.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 392.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 393호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 27%)"
      },
      "medical": {
        "rawValue": 12.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 32%)"
      },
      "school": {
        "rawValue": 2.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.16,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 23,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 23%)"
      }
    }
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "populationTrend": 100,
    "farmActivity": 27,
    "medical": 10,
    "school": 55,
    "returnFarm": 31,
    "evidence": {
      "populationTrend": {
        "rawValue": 11,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.0%",
        "interpretation": "2018~2022년 인구 +11.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 385.52,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 386호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 27%)"
      },
      "medical": {
        "rawValue": 10.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 3.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 31%)"
      }
    }
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "populationTrend": 56,
    "farmActivity": 79,
    "medical": 45,
    "school": 78,
    "returnFarm": 87,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1371.13,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,371호",
        "rankPercent": 21,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 21%)"
      },
      "medical": {
        "rawValue": 14.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
      },
      "school": {
        "rawValue": 6.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.3곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 22%)"
      },
      "returnFarm": {
        "rawValue": 0.22,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 13,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 13%)"
      }
    }
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "populationTrend": 48,
    "farmActivity": 36,
    "medical": 27,
    "school": 57,
    "returnFarm": 37,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.8%",
        "interpretation": "2018~2022년 인구 -2.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 616.01,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 616호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 36%)"
      },
      "medical": {
        "rawValue": 12.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 3.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.5곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 37%)"
      }
    }
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "populationTrend": 20,
    "farmActivity": 73,
    "medical": 62,
    "school": 86,
    "returnFarm": 86,
    "evidence": {
      "populationTrend": {
        "rawValue": -7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.0%",
        "interpretation": "2018~2022년 인구 -7.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1219.3,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,219호",
        "rankPercent": 27,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 27%)"
      },
      "medical": {
        "rawValue": 15.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.9곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 38%)"
      },
      "school": {
        "rawValue": 7.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.6곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 14,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 14%)"
      }
    }
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "populationTrend": 100,
    "farmActivity": 11,
    "medical": 1,
    "school": 48,
    "returnFarm": 8,
    "evidence": {
      "populationTrend": {
        "rawValue": 22.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +22.5%",
        "interpretation": "2018~2022년 인구 +22.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 187.22,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 187호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 11%)"
      },
      "medical": {
        "rawValue": 0,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 0.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 48%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 8%)"
      }
    }
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "populationTrend": 50,
    "farmActivity": null,
    "medical": 54,
    "school": 29,
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
        "rawValue": 14.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.0곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 46%)"
      },
      "school": {
        "rawValue": 2.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 29%)"
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
    "school": 40,
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
        "rawValue": 16.11,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.1곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 35%)"
      },
      "school": {
        "rawValue": 2.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.5곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
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
    "school": 25,
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
        "rawValue": 19.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.6곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 1.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 25%)"
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
    "school": 34,
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
        "rawValue": 13.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.9곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
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
    "sgisCode": "25050",
    "name": "대덕구",
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 26,
    "school": 37,
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
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 26%)"
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
    "sgisCode": "34010",
    "name": "천안시",
    "populationTrend": 83,
    "farmActivity": 10,
    "medical": 25,
    "school": 28,
    "returnFarm": 5,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.4%",
        "interpretation": "2018~2022년 인구 +2.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 161.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 162호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 10%)"
      },
      "medical": {
        "rawValue": 12.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 25%)"
      },
      "school": {
        "rawValue": 2.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 28%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 5%)"
      }
    }
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "populationTrend": 42,
    "farmActivity": 50,
    "medical": 63,
    "school": 66,
    "returnFarm": 46,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2018~2022년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 875.25,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 875호",
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
        "rankPercent": 34,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 34%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 46%)"
      }
    }
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "populationTrend": 42,
    "farmActivity": 45,
    "medical": 56,
    "school": 65,
    "returnFarm": 48,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2018~2022년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 807.37,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 807호",
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
        "rankPercent": 35,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 35%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 48%)"
      }
    }
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "populationTrend": 100,
    "farmActivity": 14,
    "medical": 8,
    "school": 41,
    "returnFarm": 24,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.1%",
        "interpretation": "2018~2022년 인구 +6.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 243.59,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 244호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 14%)"
      },
      "medical": {
        "rawValue": 10.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 8%)"
      },
      "school": {
        "rawValue": 2.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 41%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 24%)"
      }
    }
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "populationTrend": 81,
    "farmActivity": 38,
    "medical": 18,
    "school": 50,
    "returnFarm": 35,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.2%",
        "interpretation": "2018~2022년 인구 +2.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 622.77,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 623호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 38%)"
      },
      "medical": {
        "rawValue": 11.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 18%)"
      },
      "school": {
        "rawValue": 3.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 35%)"
      }
    }
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "populationTrend": 34,
    "farmActivity": 48,
    "medical": 74,
    "school": 67,
    "returnFarm": 49,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2018~2022년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 845.69,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 846호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 48%)"
      },
      "medical": {
        "rawValue": 17.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.3곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 26%)"
      },
      "school": {
        "rawValue": 5.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.0곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 49%)"
      }
    }
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "populationTrend": 80,
    "farmActivity": 6,
    "medical": 37,
    "school": 43,
    "returnFarm": 21,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.1%",
        "interpretation": "2018~2022년 인구 +2.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 120.94,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 121호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 6%)"
      },
      "medical": {
        "rawValue": 13.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 2.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 21%)"
      }
    }
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "populationTrend": 71,
    "farmActivity": 35,
    "medical": 17,
    "school": 54,
    "returnFarm": 34,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.7%",
        "interpretation": "2018~2022년 인구 +0.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 594.48,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 594호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 35%)"
      },
      "medical": {
        "rawValue": 11.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 3.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 46%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 34%)"
      }
    }
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "populationTrend": 35,
    "farmActivity": 69,
    "medical": 66,
    "school": 68,
    "returnFarm": 62,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2018~2022년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1145.25,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,145호",
        "rankPercent": 31,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 31%)"
      },
      "medical": {
        "rawValue": 16.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 34%)"
      },
      "school": {
        "rawValue": 5.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 32%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 38,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 38%)"
      }
    }
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "populationTrend": 16,
    "farmActivity": null,
    "medical": 72,
    "school": 73,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.6%",
        "interpretation": "2018~2022년 인구 -7.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 5.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 27%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "populationTrend": 27,
    "farmActivity": 70,
    "medical": 78,
    "school": 79,
    "returnFarm": 84,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1199.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,200호",
        "rankPercent": 30,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 30%)"
      },
      "medical": {
        "rawValue": 17.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.8곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 22%)"
      },
      "school": {
        "rawValue": 6.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 16,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 16%)"
      }
    }
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "populationTrend": 36,
    "farmActivity": 99,
    "medical": 68,
    "school": 72,
    "returnFarm": 92,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.6%",
        "interpretation": "2018~2022년 인구 -4.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2135.34,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,135호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 16.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 32%)"
      },
      "school": {
        "rawValue": 5.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 28%)"
      },
      "returnFarm": {
        "rawValue": 0.24,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 8,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 8%)"
      }
    }
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "populationTrend": 49,
    "farmActivity": 59,
    "medical": 41,
    "school": 62,
    "returnFarm": 42,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.6%",
        "interpretation": "2018~2022년 인구 -2.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 999.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,000호",
        "rankPercent": 41,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 41%)"
      },
      "medical": {
        "rawValue": 13.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
      },
      "school": {
        "rawValue": 4.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.4곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 38%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 42%)"
      }
    }
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "populationTrend": 48,
    "farmActivity": 72,
    "medical": 48,
    "school": 73,
    "returnFarm": 57,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.7%",
        "interpretation": "2018~2022년 인구 -2.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1204.8,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,205호",
        "rankPercent": 28,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 28%)"
      },
      "medical": {
        "rawValue": 14.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
      },
      "school": {
        "rawValue": 5.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 27%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 43,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 43%)"
      }
    }
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "populationTrend": 63,
    "farmActivity": 64,
    "medical": 30,
    "school": 65,
    "returnFarm": 64,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2018~2022년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1084.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,085호",
        "rankPercent": 36,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 36%)"
      },
      "medical": {
        "rawValue": 12.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 4.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.9곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 35%)"
      },
      "returnFarm": {
        "rawValue": 0.13,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 36,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 36%)"
      }
    }
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "populationTrend": 74,
    "farmActivity": null,
    "medical": 72,
    "school": 36,
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
        "rawValue": 16.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "populationTrend": 53,
    "farmActivity": 16,
    "medical": 42,
    "school": 50,
    "returnFarm": 14,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 249.93,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 250호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 16%)"
      },
      "medical": {
        "rawValue": 13.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 42%)"
      },
      "school": {
        "rawValue": 3.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 14%)"
      }
    }
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "populationTrend": 27,
    "farmActivity": 26,
    "medical": 52,
    "school": 59,
    "returnFarm": 23,
    "evidence": {
      "populationTrend": {
        "rawValue": -6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.0%",
        "interpretation": "2018~2022년 인구 -6.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 382.27,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 382호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 26%)"
      },
      "medical": {
        "rawValue": 14.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 3.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 41%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 23%)"
      }
    }
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "populationTrend": 36,
    "farmActivity": 56,
    "medical": 85,
    "school": 82,
    "returnFarm": 52,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.6%",
        "interpretation": "2018~2022년 인구 -4.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 963.92,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 964호",
        "rankPercent": 44,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 44%)"
      },
      "medical": {
        "rawValue": 18.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.5곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 15%)"
      },
      "school": {
        "rawValue": 6.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.7곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 48,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 48%)"
      }
    }
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "populationTrend": 39,
    "farmActivity": 55,
    "medical": 85,
    "school": 80,
    "returnFarm": 68,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.1%",
        "interpretation": "2018~2022년 인구 -4.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 927.33,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 927호",
        "rankPercent": 45,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 45%)"
      },
      "medical": {
        "rawValue": 18.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.6곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 15%)"
      },
      "school": {
        "rawValue": 6.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 32,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 32%)"
      }
    }
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "populationTrend": 41,
    "farmActivity": 55,
    "medical": 81,
    "school": 83,
    "returnFarm": 61,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 933.35,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 933호",
        "rankPercent": 45,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 45%)"
      },
      "medical": {
        "rawValue": 18.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.1곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 19%)"
      },
      "school": {
        "rawValue": 7.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 39,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 39%)"
      }
    }
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "populationTrend": 45,
    "farmActivity": 42,
    "medical": 44,
    "school": 68,
    "returnFarm": 45,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 791.38,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 791호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 42%)"
      },
      "medical": {
        "rawValue": 13.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.9곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 44%)"
      },
      "school": {
        "rawValue": 5.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 32%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 45%)"
      }
    }
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "populationTrend": 48,
    "farmActivity": 82,
    "medical": 90,
    "school": 99,
    "returnFarm": 94,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.8%",
        "interpretation": "2018~2022년 인구 -2.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1528.81,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,529호",
        "rankPercent": 18,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 18%)"
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
        "rawValue": 0.25,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 6,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 6%)"
      }
    }
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "populationTrend": 45,
    "farmActivity": 98,
    "medical": 70,
    "school": 90,
    "returnFarm": 96,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2018~2022년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2038.03,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,038호",
        "rankPercent": 2,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 2%)"
      },
      "medical": {
        "rawValue": 16.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 8.07,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.1곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.27,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 4,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 4%)"
      }
    }
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "populationTrend": 28,
    "farmActivity": 98,
    "medical": 69,
    "school": 98,
    "returnFarm": 89,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1988.42,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,988호",
        "rankPercent": 2,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 2%)"
      },
      "medical": {
        "rawValue": 16.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 10.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 11.0곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 2%)"
      },
      "returnFarm": {
        "rawValue": 0.22,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 11,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 11%)"
      }
    }
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "populationTrend": 30,
    "farmActivity": 87,
    "medical": 97,
    "school": 99,
    "returnFarm": 90,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2018~2022년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1615.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,615호",
        "rankPercent": 13,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 13%)"
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
        "rawValue": 0.24,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 10,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 10%)"
      }
    }
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "populationTrend": 21,
    "farmActivity": 97,
    "medical": 97,
    "school": 97,
    "returnFarm": 100,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.8%",
        "interpretation": "2018~2022년 인구 -6.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1840.66,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,841호",
        "rankPercent": 3,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 3%)"
      },
      "medical": {
        "rawValue": 23.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 23.7곳",
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
        "rawValue": 0.36,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.4%",
        "rankPercent": 1,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 1%)"
      }
    }
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "populationTrend": 22,
    "farmActivity": 86,
    "medical": 83,
    "school": 89,
    "returnFarm": 78,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2018~2022년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1570.38,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,570호",
        "rankPercent": 14,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 14%)"
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
        "rankPercent": 11,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 11%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 22,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 22%)"
      }
    }
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "populationTrend": 25,
    "farmActivity": 84,
    "medical": 77,
    "school": 88,
    "returnFarm": 66,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2018~2022년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1554.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,555호",
        "rankPercent": 16,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 16%)"
      },
      "medical": {
        "rawValue": 17.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 7.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 12%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 34,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 34%)"
      }
    }
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 95,
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
        "rawValue": 21.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.5곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 5%)"
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
    "school": 25,
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
        "rawValue": 20.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.2곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 1.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 25%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "populationTrend": 58,
    "farmActivity": null,
    "medical": 67,
    "school": 46,
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
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 2.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 46%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 50,
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
        "rawValue": 14.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.6곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
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
        "rawValue": 12.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 2.23,
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
    "medical": 34,
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
        "rawValue": 13.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
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
    "farmActivity": 20,
    "medical": 39,
    "school": 57,
    "returnFarm": 17,
    "evidence": {
      "populationTrend": {
        "rawValue": -1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.0%",
        "interpretation": "2018~2022년 인구 -1.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 296.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 296호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 20%)"
      },
      "medical": {
        "rawValue": 13.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.6곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 39%)"
      },
      "school": {
        "rawValue": 3.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.6곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 17%)"
      }
    }
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "populationTrend": 76,
    "farmActivity": 29,
    "medical": 38,
    "school": 49,
    "returnFarm": 29,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.4%",
        "interpretation": "2018~2022년 인구 +1.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 436.22,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 436호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 29%)"
      },
      "medical": {
        "rawValue": 13.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 3.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.0곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 49%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 29%)"
      }
    }
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "populationTrend": 97,
    "farmActivity": 43,
    "medical": 53,
    "school": 64,
    "returnFarm": 52,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.5%",
        "interpretation": "2018~2022년 인구 +4.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 791.65,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 792호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 43%)"
      },
      "medical": {
        "rawValue": 14.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 4.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.7곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 36%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 48,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 48%)"
      }
    }
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "populationTrend": 75,
    "farmActivity": 30,
    "medical": 12,
    "school": 57,
    "returnFarm": 25,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.3%",
        "interpretation": "2018~2022년 인구 +1.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 475.72,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 476호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 30%)"
      },
      "medical": {
        "rawValue": 10.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 12%)"
      },
      "school": {
        "rawValue": 3.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.7곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 25%)"
      }
    }
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "populationTrend": 64,
    "farmActivity": 74,
    "medical": 79,
    "school": 75,
    "returnFarm": 77,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1245.3,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,245호",
        "rankPercent": 26,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 26%)"
      },
      "medical": {
        "rawValue": 17.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 21%)"
      },
      "school": {
        "rawValue": 5.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
      },
      "returnFarm": {
        "rawValue": 0.16,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 23,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 23%)"
      }
    }
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "populationTrend": 27,
    "farmActivity": 93,
    "medical": 91,
    "school": 71,
    "returnFarm": 99,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2018~2022년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1766.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,767호",
        "rankPercent": 7,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 7%)"
      },
      "medical": {
        "rawValue": 20.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.0곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 9%)"
      },
      "school": {
        "rawValue": 5.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.32,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 1,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 1%)"
      }
    }
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "populationTrend": 37,
    "farmActivity": 90,
    "medical": 93,
    "school": 87,
    "returnFarm": 86,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2018~2022년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1702.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,702호",
        "rankPercent": 10,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 10%)"
      },
      "medical": {
        "rawValue": 20.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.3곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 7.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 14,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 14%)"
      }
    }
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "populationTrend": 44,
    "farmActivity": 92,
    "medical": 79,
    "school": 81,
    "returnFarm": 83,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2018~2022년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1716.19,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,716호",
        "rankPercent": 8,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 8%)"
      },
      "medical": {
        "rawValue": 17.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 21%)"
      },
      "school": {
        "rawValue": 6.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.7곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 19%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 17,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 17%)"
      }
    }
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "populationTrend": 14,
    "farmActivity": 83,
    "medical": 89,
    "school": 96,
    "returnFarm": 95,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.9%",
        "interpretation": "2018~2022년 인구 -7.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1536.25,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,536호",
        "rankPercent": 17,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 17%)"
      },
      "medical": {
        "rawValue": 19.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.6곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 11%)"
      },
      "school": {
        "rawValue": 9.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.7곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 4%)"
      },
      "returnFarm": {
        "rawValue": 0.27,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 5,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 5%)"
      }
    }
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "populationTrend": 64,
    "farmActivity": 58,
    "medical": 78,
    "school": 67,
    "returnFarm": 61,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 985.09,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 985호",
        "rankPercent": 42,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 42%)"
      },
      "medical": {
        "rawValue": 17.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 22%)"
      },
      "school": {
        "rawValue": 5.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.2곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 39,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 39%)"
      }
    }
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "populationTrend": 25,
    "farmActivity": 91,
    "medical": 89,
    "school": 89,
    "returnFarm": 70,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2018~2022년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1715.92,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,716호",
        "rankPercent": 9,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 9%)"
      },
      "medical": {
        "rawValue": 19.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.3곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 11%)"
      },
      "school": {
        "rawValue": 8.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.0곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 11%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 30,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 30%)"
      }
    }
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "populationTrend": 30,
    "farmActivity": 88,
    "medical": 76,
    "school": 94,
    "returnFarm": 85,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2018~2022년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1685.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,685호",
        "rankPercent": 12,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 12%)"
      },
      "medical": {
        "rawValue": 17.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.5곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 24%)"
      },
      "school": {
        "rawValue": 8.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.9곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 6%)"
      },
      "returnFarm": {
        "rawValue": 0.21,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 15,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 15%)"
      }
    }
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "populationTrend": 28,
    "farmActivity": 81,
    "medical": 69,
    "school": 74,
    "returnFarm": 83,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2018~2022년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1515.72,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,516호",
        "rankPercent": 19,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 19%)"
      },
      "medical": {
        "rawValue": 16.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 5.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 26%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 17,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 17%)"
      }
    }
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "populationTrend": 56,
    "farmActivity": 71,
    "medical": 40,
    "school": 77,
    "returnFarm": 80,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1201.17,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,201호",
        "rankPercent": 29,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 29%)"
      },
      "medical": {
        "rawValue": 13.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 6.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.2곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 23%)"
      },
      "returnFarm": {
        "rawValue": 0.18,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 20,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 20%)"
      }
    }
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "populationTrend": 100,
    "farmActivity": 42,
    "medical": 28,
    "school": 61,
    "returnFarm": 53,
    "evidence": {
      "populationTrend": {
        "rawValue": 11.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +11.4%",
        "interpretation": "2018~2022년 인구 +11.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 789.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 789호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 42%)"
      },
      "medical": {
        "rawValue": 12.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 28%)"
      },
      "school": {
        "rawValue": 4.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.2곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 47,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 47%)"
      }
    }
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "populationTrend": 33,
    "farmActivity": 96,
    "medical": 88,
    "school": 93,
    "returnFarm": 97,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.1%",
        "interpretation": "2018~2022년 인구 -5.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1840.4,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,840호",
        "rankPercent": 4,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 4%)"
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
        "rawValue": 0.27,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 3,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 3%)"
      }
    }
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "populationTrend": 63,
    "farmActivity": 61,
    "medical": 87,
    "school": 76,
    "returnFarm": 58,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2018~2022년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1026.9,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,027호",
        "rankPercent": 39,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 39%)"
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
        "rankPercent": 24,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 24%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 42,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 42%)"
      }
    }
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "populationTrend": 41,
    "farmActivity": 77,
    "medical": 59,
    "school": 72,
    "returnFarm": 81,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1329.16,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,329호",
        "rankPercent": 23,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 23%)"
      },
      "medical": {
        "rawValue": 15.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.4곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 41%)"
      },
      "school": {
        "rawValue": 5.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 28%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 19,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 19%)"
      }
    }
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "populationTrend": 46,
    "farmActivity": 39,
    "medical": 59,
    "school": 96,
    "returnFarm": 45,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.1%",
        "interpretation": "2018~2022년 인구 -3.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 720.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 721호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 39%)"
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
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 45%)"
      }
    }
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "populationTrend": 57,
    "farmActivity": 75,
    "medical": 80,
    "school": 96,
    "returnFarm": 54,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.4%",
        "interpretation": "2018~2022년 인구 -1.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1305.58,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,306호",
        "rankPercent": 25,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 25%)"
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
        "rankPercent": 4,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 4%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 46,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 46%)"
      }
    }
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "populationTrend": 39,
    "farmActivity": 95,
    "medical": 83,
    "school": 100,
    "returnFarm": 98,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2018~2022년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1789.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,790호",
        "rankPercent": 5,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 5%)"
      },
      "medical": {
        "rawValue": 18.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.4곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 12.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 12.6곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.27,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 2,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 2%)"
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
        "rawValue": 33.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 33.8곳",
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
    "medical": 35,
    "school": 82,
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
        "rawValue": 13.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 35%)"
      },
      "school": {
        "rawValue": 6.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.7곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "populationTrend": 77,
    "farmActivity": null,
    "medical": 86,
    "school": 36,
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
        "rawValue": 18.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.6곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "populationTrend": 7,
    "farmActivity": null,
    "medical": 25,
    "school": 40,
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
        "rawValue": 12.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 25%)"
      },
      "school": {
        "rawValue": 2.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.5곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
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
        "rawValue": 24.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 24.7곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
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
    "medical": 62,
    "school": 29,
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
        "rawValue": 15.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.8곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 38%)"
      },
      "school": {
        "rawValue": 2.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 29%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 45,
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
        "rawValue": 14.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
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
    "sgisCode": "21090",
    "name": "해운대구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 87,
    "school": 16,
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
        "rawValue": 18.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.0곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
      },
      "school": {
        "rawValue": 1.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 16%)"
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
    "school": 24,
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
        "rawValue": 14.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 49%)"
      },
      "school": {
        "rawValue": 1.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 24%)"
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
    "school": 36,
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
        "rawValue": 16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.0곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 36%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 2,
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
        "rawValue": 8.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 8.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 2%)"
      },
      "school": {
        "rawValue": 3.2,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
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
    "school": 10,
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
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 10%)"
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
        "rawValue": 19.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.9곳",
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
    "medical": 22,
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
        "rawValue": 11.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 22%)"
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
    "farmActivity": 5,
    "medical": 21,
    "school": 35,
    "returnFarm": 9,
    "evidence": {
      "populationTrend": {
        "rawValue": 8.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +8.8%",
        "interpretation": "2018~2022년 인구 +8.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 106.02,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 106호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 5%)"
      },
      "medical": {
        "rawValue": 11.98,
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
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 9%)"
      }
    }
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "populationTrend": 72,
    "farmActivity": null,
    "medical": 100,
    "school": 42,
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
        "rawValue": 61.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 61.8곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 2.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 42%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 58,
    "school": 15,
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
        "rankPercent": 42,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 42%)"
      },
      "school": {
        "rawValue": 1.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 15%)"
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
    "school": 93,
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
        "rawValue": 16.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.8곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 29%)"
      },
      "school": {
        "rawValue": 8.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.7곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 7%)"
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
    "school": 33,
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
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 33%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "populationTrend": 58,
    "farmActivity": null,
    "medical": 41,
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
        "rawValue": 13.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
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
        "rawValue": 22.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 22.8곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 4%)"
      },
      "school": {
        "rawValue": 1.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
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
    "medical": 64,
    "school": 27,
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
        "rankPercent": 36,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 36%)"
      },
      "school": {
        "rawValue": 2,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 27%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "populationTrend": 100,
    "farmActivity": 12,
    "medical": 9,
    "school": 39,
    "returnFarm": 20,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.1%",
        "interpretation": "2018~2022년 인구 +6.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 223.43,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 223호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 12%)"
      },
      "medical": {
        "rawValue": 10.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 9%)"
      },
      "school": {
        "rawValue": 2.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 20%)"
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
        "rawValue": 11.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
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
    "medical": 92,
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
        "rawValue": 20.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.1곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 8%)"
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
    "medical": 14,
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
        "rawValue": 11.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
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
    "medical": 2,
    "school": 38,
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
        "rawValue": 8.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 8.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 2%)"
      },
      "school": {
        "rawValue": 2.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 38%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "populationTrend": 64,
    "farmActivity": 20,
    "medical": 3,
    "school": 46,
    "returnFarm": 23,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2018~2022년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 300.24,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 300호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 20%)"
      },
      "medical": {
        "rawValue": 9.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 2.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 46%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 23%)"
      }
    }
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "populationTrend": 56,
    "farmActivity": 19,
    "medical": 38,
    "school": 46,
    "returnFarm": 19,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.5%",
        "interpretation": "2018~2022년 인구 -1.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 281.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 282호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 19%)"
      },
      "medical": {
        "rawValue": 13.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 2.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 46%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 19%)"
      }
    }
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "populationTrend": 55,
    "farmActivity": 31,
    "medical": 19,
    "school": 52,
    "returnFarm": 32,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.7%",
        "interpretation": "2018~2022년 인구 -1.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 483.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 483호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 31%)"
      },
      "medical": {
        "rawValue": 11.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 19%)"
      },
      "school": {
        "rawValue": 3.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 48%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 32%)"
      }
    }
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "populationTrend": 56,
    "farmActivity": 52,
    "medical": 15,
    "school": 60,
    "returnFarm": 43,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2018~2022년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 888.54,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 889호",
        "rankPercent": 48,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 48%)"
      },
      "medical": {
        "rawValue": 11.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 15%)"
      },
      "school": {
        "rawValue": 3.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.9곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.07,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 43%)"
      }
    }
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "populationTrend": 41,
    "farmActivity": 40,
    "medical": 50,
    "school": 58,
    "returnFarm": 42,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 774.75,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 775호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 40%)"
      },
      "medical": {
        "rawValue": 14.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
      },
      "school": {
        "rawValue": 3.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.8곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 42%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 42%)"
      }
    }
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "populationTrend": 46,
    "farmActivity": 17,
    "medical": 16,
    "school": 42,
    "returnFarm": 13,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.1%",
        "interpretation": "2018~2022년 인구 -3.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 256.37,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 256호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 17%)"
      },
      "medical": {
        "rawValue": 11.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 16%)"
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
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 13%)"
      }
    }
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "populationTrend": 32,
    "farmActivity": 45,
    "medical": 46,
    "school": 59,
    "returnFarm": 50,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 812.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 812호",
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
        "rankPercent": 41,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 41%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 50,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 50%)"
      }
    }
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "populationTrend": 74,
    "farmActivity": 51,
    "medical": 52,
    "school": 62,
    "returnFarm": 70,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.1%",
        "interpretation": "2018~2022년 인구 +1.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 878.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 878호",
        "rankPercent": 49,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 49%)"
      },
      "medical": {
        "rawValue": 14.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 4.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.2곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 38%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 30,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 30%)"
      }
    }
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "populationTrend": 37,
    "farmActivity": 77,
    "medical": 61,
    "school": 75,
    "returnFarm": 72,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2018~2022년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1349.88,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,350호",
        "rankPercent": 23,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 23%)"
      },
      "medical": {
        "rawValue": 15.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 39%)"
      },
      "school": {
        "rawValue": 6.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 28,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 28%)"
      }
    }
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "populationTrend": 53,
    "farmActivity": 61,
    "medical": 66,
    "school": 66,
    "returnFarm": 55,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2018~2022년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1021.11,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,021호",
        "rankPercent": 39,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 39%)"
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
        "rankPercent": 34,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 34%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 45,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 45%)"
      }
    }
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "populationTrend": 93,
    "farmActivity": 17,
    "medical": 21,
    "school": 30,
    "returnFarm": 14,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.9%",
        "interpretation": "2018~2022년 인구 +3.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 254.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 254호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 17%)"
      },
      "medical": {
        "rawValue": 11.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 21%)"
      },
      "school": {
        "rawValue": 2.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 14%)"
      }
    }
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 1,
    "school": null,
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
        "rawValue": 0,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 0.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": null,
      "returnFarm": null
    }
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "populationTrend": 42,
    "farmActivity": 94,
    "medical": 73,
    "school": 80,
    "returnFarm": 89,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2018~2022년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1777.92,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,778호",
        "rankPercent": 6,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 6%)"
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
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
      },
      "returnFarm": {
        "rawValue": 0.23,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 11,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 11%)"
      }
    }
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "populationTrend": 39,
    "farmActivity": 100,
    "medical": 72,
    "school": 94,
    "returnFarm": 98,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.1%",
        "interpretation": "2018~2022년 인구 -4.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2198.25,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,198호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 16.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.8곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 9.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.1곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 6%)"
      },
      "returnFarm": {
        "rawValue": 0.28,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 2,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 2%)"
      }
    }
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "populationTrend": 17,
    "farmActivity": 89,
    "medical": 41,
    "school": 95,
    "returnFarm": 92,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.4%",
        "interpretation": "2018~2022년 인구 -7.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1686.56,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,687호",
        "rankPercent": 11,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 11%)"
      },
      "medical": {
        "rawValue": 13.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
      },
      "school": {
        "rawValue": 9.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.1곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 5%)"
      },
      "returnFarm": {
        "rawValue": 0.24,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 8,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 8%)"
      }
    }
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "populationTrend": 19,
    "farmActivity": 58,
    "medical": 79,
    "school": 81,
    "returnFarm": 73,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.1%",
        "interpretation": "2018~2022년 인구 -7.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 988.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 989호",
        "rankPercent": 42,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 42%)"
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
        "rankPercent": 19,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 19%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 27,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 27%)"
      }
    }
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "populationTrend": 53,
    "farmActivity": 89,
    "medical": 76,
    "school": 68,
    "returnFarm": 95,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2018~2022년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1695.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,696호",
        "rankPercent": 11,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 11%)"
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
        "rankPercent": 32,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 32%)"
      },
      "returnFarm": {
        "rawValue": 0.26,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.3%",
        "rankPercent": 5,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 5%)"
      }
    }
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "populationTrend": 15,
    "farmActivity": 70,
    "medical": 60,
    "school": 71,
    "returnFarm": 51,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.7%",
        "interpretation": "2018~2022년 인구 -7.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1200.32,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,200호",
        "rankPercent": 30,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 30%)"
      },
      "medical": {
        "rawValue": 15.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.6곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 5.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.08,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 49,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 49%)"
      }
    }
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "populationTrend": 59,
    "farmActivity": 73,
    "medical": 57,
    "school": 70,
    "returnFarm": 80,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.1%",
        "interpretation": "2018~2022년 인구 -1.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1238.65,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,239호",
        "rankPercent": 27,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 27%)"
      },
      "medical": {
        "rawValue": 15.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 5.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 20,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 20%)"
      }
    }
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "populationTrend": 26,
    "farmActivity": 30,
    "medical": 10,
    "school": 56,
    "returnFarm": 28,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2018~2022년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 446.86,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 447호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 30%)"
      },
      "medical": {
        "rawValue": 10.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 3.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 44%)"
      },
      "returnFarm": {
        "rawValue": 0.03,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 28%)"
      }
    }
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "populationTrend": 100,
    "farmActivity": 76,
    "medical": 39,
    "school": 63,
    "returnFarm": 73,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.6%",
        "interpretation": "2018~2022년 인구 +6.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1311.16,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,311호",
        "rankPercent": 24,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 24%)"
      },
      "medical": {
        "rawValue": 13.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.6곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 39%)"
      },
      "school": {
        "rawValue": 4.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.4곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 27,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 27%)"
      }
    }
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "populationTrend": 22,
    "farmActivity": 95,
    "medical": 24,
    "school": 92,
    "returnFarm": 88,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2018~2022년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1802.21,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,802호",
        "rankPercent": 5,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 5%)"
      },
      "medical": {
        "rawValue": 12.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 8.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.3곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 8%)"
      },
      "returnFarm": {
        "rawValue": 0.22,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 12,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 12%)"
      }
    }
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "populationTrend": 37,
    "farmActivity": 47,
    "medical": 46,
    "school": 71,
    "returnFarm": 39,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.4%",
        "interpretation": "2018~2022년 인구 -4.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 826.48,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 826호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 47%)"
      },
      "medical": {
        "rawValue": 14.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 46%)"
      },
      "school": {
        "rawValue": 5.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 39%)"
      }
    }
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "populationTrend": 33,
    "farmActivity": 33,
    "medical": 3,
    "school": 84,
    "returnFarm": 41,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.1%",
        "interpretation": "2018~2022년 인구 -5.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 564.67,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 565호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 33%)"
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
        "rankPercent": 16,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 16%)"
      },
      "returnFarm": {
        "rawValue": 0.06,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 41%)"
      }
    }
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "populationTrend": 49,
    "farmActivity": null,
    "medical": 36,
    "school": 35,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.6%",
        "interpretation": "2018~2022년 인구 -2.6% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 36%)"
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
    "sgisCode": "38030",
    "name": "진주시",
    "populationTrend": 64,
    "farmActivity": 24,
    "medical": 43,
    "school": 45,
    "returnFarm": 18,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.3%",
        "interpretation": "2018~2022년 인구 -0.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 376.05,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 376호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 24%)"
      },
      "medical": {
        "rawValue": 13.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.9곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 2.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.7곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 18%)"
      }
    }
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "populationTrend": 24,
    "farmActivity": 18,
    "medical": 34,
    "school": 53,
    "returnFarm": 20,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2018~2022년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 274.46,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 274호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 18%)"
      },
      "medical": {
        "rawValue": 13.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
      },
      "school": {
        "rawValue": 3.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.02,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 20%)"
      }
    }
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "populationTrend": 49,
    "farmActivity": 33,
    "medical": 32,
    "school": 55,
    "returnFarm": 36,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.6%",
        "interpretation": "2018~2022년 인구 -2.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 529.04,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 529호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 33%)"
      },
      "medical": {
        "rawValue": 12.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 32%)"
      },
      "school": {
        "rawValue": 3.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 하위 36%)"
      }
    }
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "populationTrend": 76,
    "farmActivity": 9,
    "medical": 11,
    "school": 32,
    "returnFarm": 2,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.5%",
        "interpretation": "2018~2022년 인구 +1.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 157.73,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 158호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 9%)"
      },
      "medical": {
        "rawValue": 10.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 11%)"
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
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 2%)"
      }
    }
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "populationTrend": 53,
    "farmActivity": 52,
    "medical": 37,
    "school": 61,
    "returnFarm": 55,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2018~2022년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 902.69,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 903호",
        "rankPercent": 48,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 48%)"
      },
      "medical": {
        "rawValue": 13.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 4.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.1곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 45,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 45%)"
      }
    }
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "populationTrend": 24,
    "farmActivity": 14,
    "medical": 6,
    "school": 50,
    "returnFarm": 16,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2018~2022년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 229.21,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 229호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 14%)"
      },
      "medical": {
        "rawValue": 10.06,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 6%)"
      },
      "school": {
        "rawValue": 3.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 16%)"
      }
    }
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "populationTrend": 82,
    "farmActivity": 3,
    "medical": 23,
    "school": 32,
    "returnFarm": 4,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.3%",
        "interpretation": "2018~2022년 인구 +2.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 100.04,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 100호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 3%)"
      },
      "medical": {
        "rawValue": 12.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 2.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 32%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 4%)"
      }
    }
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "populationTrend": 32,
    "farmActivity": 80,
    "medical": 86,
    "school": 93,
    "returnFarm": 59,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1490.49,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,490호",
        "rankPercent": 20,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 20%)"
      },
      "medical": {
        "rawValue": 18.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.8곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 8.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.8곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 7%)"
      },
      "returnFarm": {
        "rawValue": 0.11,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 41,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 41%)"
      }
    }
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "populationTrend": 16,
    "farmActivity": 49,
    "medical": 13,
    "school": 64,
    "returnFarm": 33,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.6%",
        "interpretation": "2018~2022년 인구 -7.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 866.06,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 866호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 49%)"
      },
      "medical": {
        "rawValue": 11.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 4.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.8곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 36%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 33%)"
      }
    }
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "populationTrend": 25,
    "farmActivity": 67,
    "medical": 66,
    "school": 76,
    "returnFarm": 63,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2018~2022년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1105.03,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,105호",
        "rankPercent": 33,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 33%)"
      },
      "medical": {
        "rawValue": 16.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 34%)"
      },
      "school": {
        "rawValue": 6.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.1곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 24%)"
      },
      "returnFarm": {
        "rawValue": 0.12,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 37,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 37%)"
      }
    }
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "populationTrend": 22,
    "farmActivity": 65,
    "medical": 47,
    "school": 77,
    "returnFarm": 71,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2018~2022년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1091.35,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,091호",
        "rankPercent": 35,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 35%)"
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
        "rankPercent": 23,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 23%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 29,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 29%)"
      }
    }
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "populationTrend": 32,
    "farmActivity": 80,
    "medical": 69,
    "school": 83,
    "returnFarm": 56,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1430.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,430호",
        "rankPercent": 20,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 20%)"
      },
      "medical": {
        "rawValue": 16.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.5곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 7.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.2곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 44,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 44%)"
      }
    }
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "populationTrend": 13,
    "farmActivity": 86,
    "medical": 84,
    "school": 88,
    "returnFarm": 79,
    "evidence": {
      "populationTrend": {
        "rawValue": -8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.0%",
        "interpretation": "2018~2022년 인구 -8.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1602.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,603호",
        "rankPercent": 14,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 14%)"
      },
      "medical": {
        "rawValue": 18.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.5곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 16%)"
      },
      "school": {
        "rawValue": 7.84,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 12%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 21,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 21%)"
      }
    }
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "populationTrend": 41,
    "farmActivity": 85,
    "medical": 83,
    "school": 85,
    "returnFarm": 93,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2018~2022년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1562.89,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,563호",
        "rankPercent": 15,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 15%)"
      },
      "medical": {
        "rawValue": 18.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 7.31,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.3곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 15%)"
      },
      "returnFarm": {
        "rawValue": 0.25,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 7,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 7%)"
      }
    }
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "populationTrend": 32,
    "farmActivity": 83,
    "medical": 80,
    "school": 79,
    "returnFarm": 82,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2018~2022년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1535.11,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,535호",
        "rankPercent": 17,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 17%)"
      },
      "medical": {
        "rawValue": 18.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.0곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
      },
      "school": {
        "rawValue": 6.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.4곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 18,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 18%)"
      }
    }
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "populationTrend": 52,
    "farmActivity": 68,
    "medical": 67,
    "school": 75,
    "returnFarm": 64,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2018~2022년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1107.8,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,108호",
        "rankPercent": 32,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 32%)"
      },
      "medical": {
        "rawValue": 16.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 5.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
      },
      "returnFarm": {
        "rawValue": 0.13,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 36,
        "interpretation": "귀농 비율이 평균 수준이에요 (전국 상위 36%)"
      }
    }
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "populationTrend": 24,
    "farmActivity": 92,
    "medical": 86,
    "school": 91,
    "returnFarm": 91,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.5%",
        "interpretation": "2018~2022년 인구 -6.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1730.2,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,730호",
        "rankPercent": 8,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 8%)"
      },
      "medical": {
        "rawValue": 18.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.7곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 8.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.2곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 9%)"
      },
      "returnFarm": {
        "rawValue": 0.24,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 9,
        "interpretation": "귀농 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 9%)"
      }
    }
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "populationTrend": 84,
    "farmActivity": 22,
    "medical": 60,
    "school": 43,
    "returnFarm": 15,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.6%",
        "interpretation": "2018~2022년 인구 +2.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 359.05,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 359호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 22%)"
      },
      "medical": {
        "rawValue": 15.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.6곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 2.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": {
        "rawValue": 0.01,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 15%)"
      }
    }
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "populationTrend": 89,
    "farmActivity": 39,
    "medical": 58,
    "school": 60,
    "returnFarm": 33,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.3%",
        "interpretation": "2018~2022년 인구 +3.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 694.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 695호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 39%)"
      },
      "medical": {
        "rawValue": 15.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 42%)"
      },
      "school": {
        "rawValue": 3.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.0곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 40%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "귀농 비율이 낮은 편이에요 (전국 하위 33%)"
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

/** 차원별 라벨 (UI/methodology 공용) */
export const DIMENSION_LABELS = {
  populationTrend: "인구 추세",
  farmActivity: "농가 활성도",
  medical: "의료 인프라",
  school: "학교 인프라",
  returnFarm: "귀농 활성도",
} as const;

export type DimensionId = keyof typeof DIMENSION_LABELS;

export const DIMENSION_IDS: DimensionId[] = [
  "populationTrend",
  "farmActivity",
  "medical",
  "school",
  "returnFarm",
];
