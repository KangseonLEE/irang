/**
 * 시군구 차원별 5점수 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-dimension-scores.ts
 * 마지막 갱신: 2026-10-12
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
    "populationTrend": 37,
    "farmActivity": null,
    "medical": 98,
    "school": 54,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2020~2024년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 33.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 33.0곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 2%)"
      },
      "school": {
        "rawValue": 3.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 46%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "populationTrend": 57,
    "farmActivity": null,
    "medical": 99,
    "school": 46,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.4%",
        "interpretation": "2020~2024년 인구 -1.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 49.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 49.0곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 2.68,
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
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 67,
    "school": 21,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -10,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -10.0%",
        "interpretation": "2020~2024년 인구 -10.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 1.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 21%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "populationTrend": 27,
    "farmActivity": null,
    "medical": 81,
    "school": 7,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2020~2024년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.2곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 19%)"
      },
      "school": {
        "rawValue": 1.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 7%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "populationTrend": 50,
    "farmActivity": null,
    "medical": 74,
    "school": 3,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.5%",
        "interpretation": "2020~2024년 인구 -2.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.5곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 26%)"
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
    "populationTrend": 76,
    "farmActivity": null,
    "medical": 79,
    "school": 4,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.3%",
        "interpretation": "2020~2024년 인구 +1.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.1곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 21%)"
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
    "sgisCode": "11070",
    "name": "중랑구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 59,
    "school": 1,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.7%",
        "interpretation": "2020~2024년 인구 -2.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.6곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 41%)"
      },
      "school": {
        "rawValue": 1.28,
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
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 32,
    "school": 7,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2020~2024년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 32%)"
      },
      "school": {
        "rawValue": 1.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 7%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 72,
    "school": 3,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2020~2024년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.0곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 1.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 3%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "populationTrend": 27,
    "farmActivity": null,
    "medical": 30,
    "school": 10,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.0%",
        "interpretation": "2020~2024년 인구 -6.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 1.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 10%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 60,
    "school": 29,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.0%",
        "interpretation": "2020~2024년 인구 -5.0% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.75,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
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
    "sgisCode": "11120",
    "name": "은평구",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 63,
    "school": 9,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.2%",
        "interpretation": "2020~2024년 인구 -3.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 1.52,
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
    "medical": 48,
    "school": 3,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.3%",
        "interpretation": "2020~2024년 인구 -0.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
      },
      "school": {
        "rawValue": 1.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 3%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "populationTrend": 54,
    "farmActivity": null,
    "medical": 96,
    "school": 7,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.8%",
        "interpretation": "2020~2024년 인구 -1.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 22.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 22.1곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 4%)"
      },
      "school": {
        "rawValue": 1.45,
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
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 69,
    "school": 9,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2020~2024년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.8곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 1.53,
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
    "populationTrend": 42,
    "farmActivity": null,
    "medical": 80,
    "school": 10,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2020~2024년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.11,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.1곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
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
    "sgisCode": "11170",
    "name": "구로구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 55,
    "school": 5,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2020~2024년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.0곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 45%)"
      },
      "school": {
        "rawValue": 1.43,
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
    "populationTrend": 51,
    "farmActivity": null,
    "medical": 58,
    "school": 6,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.3%",
        "interpretation": "2020~2024년 인구 -2.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.3곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 42%)"
      },
      "school": {
        "rawValue": 1.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 6%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "populationTrend": 62,
    "farmActivity": null,
    "medical": 95,
    "school": 1,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.7%",
        "interpretation": "2020~2024년 인구 -0.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.5곳",
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
    "populationTrend": 47,
    "farmActivity": null,
    "medical": 62,
    "school": 4,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.0%",
        "interpretation": "2020~2024년 인구 -3.0% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.1곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 38%)"
      },
      "school": {
        "rawValue": 1.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 4%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "populationTrend": 51,
    "farmActivity": null,
    "medical": 50,
    "school": 1,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.4%",
        "interpretation": "2020~2024년 인구 -2.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.7곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
      },
      "school": {
        "rawValue": 1.2,
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
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 99,
    "school": 8,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.9%",
        "interpretation": "2020~2024년 인구 -3.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 41.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 41.7곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
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
    "sgisCode": "11230",
    "name": "강남구",
    "populationTrend": 93,
    "farmActivity": null,
    "medical": 100,
    "school": 12,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.9%",
        "interpretation": "2020~2024년 인구 +3.9% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 60.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 60.2곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
      },
      "school": {
        "rawValue": 1.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 12%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "populationTrend": 51,
    "farmActivity": null,
    "medical": 95,
    "school": 10,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.3%",
        "interpretation": "2020~2024년 인구 -2.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.4곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 5%)"
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
    "sgisCode": "11250",
    "name": "강동구",
    "populationTrend": 81,
    "farmActivity": null,
    "medical": 94,
    "school": 5,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.2%",
        "interpretation": "2020~2024년 인구 +2.2% 변화로 회복세예요"
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
        "rawValue": 1.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 5%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "populationTrend": 31,
    "farmActivity": null,
    "medical": 44,
    "school": 58,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.4%",
        "interpretation": "2020~2024년 인구 -5.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 44%)"
      },
      "school": {
        "rawValue": 3.53,
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
    "school": 34,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 31.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +31.3%",
        "interpretation": "2020~2024년 인구 +31.3% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 7.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 7.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 34%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "populationTrend": 93,
    "farmActivity": null,
    "medical": 25,
    "school": 2,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.9%",
        "interpretation": "2020~2024년 인구 +3.9% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 25%)"
      },
      "school": {
        "rawValue": 1.28,
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
    "medical": 26,
    "school": 18,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +7.0%",
        "interpretation": "2020~2024년 인구 +7.0% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 26%)"
      },
      "school": {
        "rawValue": 1.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 18%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "populationTrend": 21,
    "farmActivity": null,
    "medical": 58,
    "school": 15,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.8%",
        "interpretation": "2020~2024년 인구 -6.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.4곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 42%)"
      },
      "school": {
        "rawValue": 1.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 15%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "populationTrend": 72,
    "farmActivity": null,
    "medical": 39,
    "school": 16,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.8%",
        "interpretation": "2020~2024년 인구 +0.8% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 39%)"
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
    "sgisCode": "23070",
    "name": "계양구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 39,
    "school": 24,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2020~2024년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 39%)"
      },
      "school": {
        "rawValue": 1.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 24%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "populationTrend": 83,
    "farmActivity": null,
    "medical": 11,
    "school": 13,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.4%",
        "interpretation": "2020~2024년 인구 +2.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 11%)"
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
    "sgisCode": "23130",
    "name": "검단구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 11,
    "school": 16,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 52.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +52.7%",
        "interpretation": "2020~2024년 인구 +52.7% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 11%)"
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
    "sgisCode": "23510",
    "name": "강화군",
    "populationTrend": 70,
    "farmActivity": 53,
    "medical": 33,
    "school": 71,
    "returnFarm": 55,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.4%",
        "interpretation": "2020~2024년 인구 +0.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1023.69,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,024호",
        "rankPercent": 47,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 47%)"
      },
      "medical": {
        "rawValue": 13.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 5.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
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
    "populationTrend": 63,
    "farmActivity": 40,
    "medical": 45,
    "school": 98,
    "returnFarm": 41,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2020~2024년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 792.52,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 793호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 40%)"
      },
      "medical": {
        "rawValue": 14.07,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
      },
      "school": {
        "rawValue": 10.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 10.9곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 2%)"
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
    "sgisCode": "31010",
    "name": "수원시",
    "populationTrend": 75,
    "farmActivity": null,
    "medical": 50,
    "school": 17,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.2%",
        "interpretation": "2020~2024년 인구 +1.2% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.7곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
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
    "sgisCode": "31020",
    "name": "성남시",
    "populationTrend": 51,
    "farmActivity": null,
    "medical": 93,
    "school": 18,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.3%",
        "interpretation": "2020~2024년 인구 -2.3% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 21.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.3곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 1.8,
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
    "populationTrend": 77,
    "farmActivity": null,
    "medical": 41,
    "school": 13,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.5%",
        "interpretation": "2020~2024년 인구 +1.5% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
      },
      "school": {
        "rawValue": 1.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 13%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "populationTrend": 71,
    "farmActivity": null,
    "medical": 73,
    "school": 13,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.6%",
        "interpretation": "2020~2024년 인구 +0.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.2곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
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
    "populationTrend": 35,
    "farmActivity": null,
    "medical": 51,
    "school": 14,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.7%",
        "interpretation": "2020~2024년 인구 -4.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 49%)"
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
    "sgisCode": "31060",
    "name": "광명시",
    "populationTrend": 9,
    "farmActivity": null,
    "medical": 79,
    "school": 19,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -8.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -8.6%",
        "interpretation": "2020~2024년 인구 -8.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.0곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 21%)"
      },
      "school": {
        "rawValue": 1.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 19%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "populationTrend": 100,
    "farmActivity": 7,
    "medical": 15,
    "school": 31,
    "returnFarm": 6,
    "evidence": {
      "populationTrend": {
        "rawValue": 13.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +13.5%",
        "interpretation": "2020~2024년 인구 +13.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 186.28,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 186호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 7%)"
      },
      "medical": {
        "rawValue": 11.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 15%)"
      },
      "school": {
        "rawValue": 2.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 31%)"
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
    "populationTrend": 26,
    "farmActivity": null,
    "medical": 7,
    "school": 43,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2020~2024년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 2.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 17,
    "school": 11,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2020~2024년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 1.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 11%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "populationTrend": 66,
    "farmActivity": null,
    "medical": 37,
    "school": 17,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.1%",
        "interpretation": "2020~2024년 인구 -0.1% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
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
    "sgisCode": "31110",
    "name": "과천시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 52,
    "school": 12,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 40,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +40.0%",
        "interpretation": "2020~2024년 인구 +40.0% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 1.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.6곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 12%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 89,
    "school": 17,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2020~2024년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.5곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 11%)"
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
    "sgisCode": "31130",
    "name": "남양주시",
    "populationTrend": 88,
    "farmActivity": 1,
    "medical": 19,
    "school": 20,
    "returnFarm": 2,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.2%",
        "interpretation": "2020~2024년 인구 +3.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 85.94,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 85.9호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 1%)"
      },
      "medical": {
        "rawValue": 11.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 19%)"
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
    "medical": 8,
    "school": 24,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.6%",
        "interpretation": "2020~2024년 인구 +5.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 8%)"
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
    "sgisCode": "31150",
    "name": "시흥시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 5,
    "school": 14,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.9%",
        "interpretation": "2020~2024년 인구 +6.9% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 5%)"
      },
      "school": {
        "rawValue": 1.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.7곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 14%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 33,
    "school": 20,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.3%",
        "interpretation": "2020~2024년 인구 -6.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
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
    "sgisCode": "31170",
    "name": "의왕시",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 13,
    "school": 28,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.6%",
        "interpretation": "2020~2024년 인구 -5.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 2.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 28%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 47,
    "school": 11,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 14.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +14.7%",
        "interpretation": "2020~2024년 인구 +14.7% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
      },
      "school": {
        "rawValue": 1.56,
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
    "populationTrend": 73,
    "farmActivity": 1,
    "medical": 22,
    "school": 21,
    "returnFarm": 5,
    "evidence": {
      "populationTrend": {
        "rawValue": 1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.0%",
        "interpretation": "2020~2024년 인구 +1.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 93.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 93.5호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 1%)"
      },
      "medical": {
        "rawValue": 12.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 22%)"
      },
      "school": {
        "rawValue": 1.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
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
    "medical": 8,
    "school": 37,
    "returnFarm": 9,
    "evidence": {
      "populationTrend": {
        "rawValue": 10.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +10.9%",
        "interpretation": "2020~2024년 인구 +10.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 167.71,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 168호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 6%)"
      },
      "medical": {
        "rawValue": 10.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 8%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 37%)"
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
    "populationTrend": 78,
    "farmActivity": 22,
    "medical": 17,
    "school": 46,
    "returnFarm": 22,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.8%",
        "interpretation": "2020~2024년 인구 +1.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 403.36,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 403호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 22%)"
      },
      "medical": {
        "rawValue": 11.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
      },
      "school": {
        "rawValue": 2.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 46%)"
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
    "sgisCode": "31220",
    "name": "안성시",
    "populationTrend": 100,
    "farmActivity": 22,
    "medical": 6,
    "school": 48,
    "returnFarm": 27,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.3%",
        "interpretation": "2020~2024년 인구 +6.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 416.43,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 416호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 22%)"
      },
      "medical": {
        "rawValue": 10.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 6%)"
      },
      "school": {
        "rawValue": 2.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 48%)"
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
    "sgisCode": "31230",
    "name": "김포시",
    "populationTrend": 100,
    "farmActivity": 4,
    "medical": 13,
    "school": 20,
    "returnFarm": 4,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.3%",
        "interpretation": "2020~2024년 인구 +5.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 127.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 127호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 4%)"
      },
      "medical": {
        "rawValue": 11.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 1.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
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
    "medical": 7,
    "school": 26,
    "returnFarm": 11,
    "evidence": {
      "populationTrend": {
        "rawValue": 14,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +14.0%",
        "interpretation": "2020~2024년 인구 +14.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 129.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 129호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 5%)"
      },
      "medical": {
        "rawValue": 10.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 1.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 26%)"
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
    "sgisCode": "31250",
    "name": "광주시",
    "populationTrend": 96,
    "farmActivity": 3,
    "medical": 2,
    "school": 8,
    "returnFarm": 3,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.5%",
        "interpretation": "2020~2024년 인구 +4.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 125.67,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 126호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 3%)"
      },
      "medical": {
        "rawValue": 9.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 2%)"
      },
      "school": {
        "rawValue": 1.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.5곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 8%)"
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
    "medical": 1,
    "school": 37,
    "returnFarm": 7,
    "evidence": {
      "populationTrend": {
        "rawValue": 25.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +25.6%",
        "interpretation": "2020~2024년 인구 +25.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 145.97,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 146호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 6%)"
      },
      "medical": {
        "rawValue": 8.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 8.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 37%)"
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
    "sgisCode": "31270",
    "name": "포천시",
    "populationTrend": 63,
    "farmActivity": 23,
    "medical": 5,
    "school": 51,
    "returnFarm": 24,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2020~2024년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 437.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 438호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 23%)"
      },
      "medical": {
        "rawValue": 10.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 5%)"
      },
      "school": {
        "rawValue": 3.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
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
    "sgisCode": "31280",
    "name": "여주시",
    "populationTrend": 91,
    "farmActivity": 37,
    "medical": 23,
    "school": 61,
    "returnFarm": 30,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.6%",
        "interpretation": "2020~2024년 인구 +3.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 698.52,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 699호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 37%)"
      },
      "medical": {
        "rawValue": 12.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.2곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 3.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.9곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
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
    "farmActivity": 30,
    "medical": 24,
    "school": 59,
    "returnFarm": 40,
    "evidence": {
      "populationTrend": {
        "rawValue": 6.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.8%",
        "interpretation": "2020~2024년 인구 +6.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 597.67,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 598호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 30%)"
      },
      "medical": {
        "rawValue": 12.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 3.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.6곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 41%)"
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
    "sgisCode": "31570",
    "name": "가평군",
    "populationTrend": 68,
    "farmActivity": 36,
    "medical": 60,
    "school": 64,
    "returnFarm": 42,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.3%",
        "interpretation": "2020~2024년 인구 +0.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 686.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 686호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 36%)"
      },
      "medical": {
        "rawValue": 15.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 4.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.5곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 36%)"
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
    "sgisCode": "31550",
    "name": "연천군",
    "populationTrend": 37,
    "farmActivity": 38,
    "medical": 36,
    "school": 72,
    "returnFarm": 53,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2020~2024년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 729.21,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 729호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 38%)"
      },
      "medical": {
        "rawValue": 13.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 36%)"
      },
      "school": {
        "rawValue": 5.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 28%)"
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
    "populationTrend": 83,
    "farmActivity": 13,
    "medical": 32,
    "school": 49,
    "returnFarm": 17,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.5%",
        "interpretation": "2020~2024년 인구 +2.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 263.59,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 264호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 13%)"
      },
      "medical": {
        "rawValue": 13.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 32%)"
      },
      "school": {
        "rawValue": 2.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 49%)"
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
    "populationTrend": 92,
    "farmActivity": 14,
    "medical": 45,
    "school": 47,
    "returnFarm": 14,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.8%",
        "interpretation": "2020~2024년 인구 +3.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 297,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 297호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 14%)"
      },
      "medical": {
        "rawValue": 14.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.1곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 45%)"
      },
      "school": {
        "rawValue": 2.71,
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
    "populationTrend": 54,
    "farmActivity": 21,
    "medical": 30,
    "school": 50,
    "returnFarm": 10,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.9%",
        "interpretation": "2020~2024년 인구 -1.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 387.05,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 387호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 21%)"
      },
      "medical": {
        "rawValue": 12.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 2.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.0곳",
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
    "populationTrend": 51,
    "farmActivity": null,
    "medical": 24,
    "school": 55,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.4%",
        "interpretation": "2020~2024년 인구 -2.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 24%)"
      },
      "school": {
        "rawValue": 3.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 45%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "populationTrend": 4,
    "farmActivity": null,
    "medical": 21,
    "school": 82,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -9.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.4%",
        "interpretation": "2020~2024년 인구 -9.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 21%)"
      },
      "school": {
        "rawValue": 6.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.7곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 71,
    "school": 45,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2020~2024년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 29%)"
      },
      "school": {
        "rawValue": 2.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 45%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "populationTrend": 36,
    "farmActivity": 35,
    "medical": 7,
    "school": 73,
    "returnFarm": 29,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2020~2024년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 656.68,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 657호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 35%)"
      },
      "medical": {
        "rawValue": 10.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 7%)"
      },
      "school": {
        "rawValue": 5.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.7곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 27%)"
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
    "populationTrend": 58,
    "farmActivity": 67,
    "medical": 37,
    "school": 83,
    "returnFarm": 58,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.3%",
        "interpretation": "2020~2024년 인구 -1.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1255.04,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,255호",
        "rankPercent": 33,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 33%)"
      },
      "medical": {
        "rawValue": 13.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 6.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.8곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
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
    "populationTrend": 86,
    "farmActivity": 70,
    "medical": 15,
    "school": 86,
    "returnFarm": 68,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.9%",
        "interpretation": "2020~2024년 인구 +2.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1336.1,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,336호",
        "rankPercent": 30,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 30%)"
      },
      "medical": {
        "rawValue": 11.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 15%)"
      },
      "school": {
        "rawValue": 7.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.4곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
      },
      "returnFarm": {
        "rawValue": 0.15,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 32,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 32%)"
      }
    }
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "populationTrend": 51,
    "farmActivity": 55,
    "medical": 10,
    "school": 92,
    "returnFarm": 81,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.3%",
        "interpretation": "2020~2024년 인구 -2.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1095.66,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,096호",
        "rankPercent": 45,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 45%)"
      },
      "medical": {
        "rawValue": 10.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 8.18,
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
    "sgisCode": "32540",
    "name": "평창군",
    "populationTrend": 63,
    "farmActivity": 60,
    "medical": 53,
    "school": 90,
    "returnFarm": 66,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.6%",
        "interpretation": "2020~2024년 인구 -0.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1180.29,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,180호",
        "rankPercent": 40,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 40%)"
      },
      "medical": {
        "rawValue": 14.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 7.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.9곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
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
    "sgisCode": "32550",
    "name": "정선군",
    "populationTrend": 28,
    "farmActivity": 44,
    "medical": 21,
    "school": 98,
    "returnFarm": 62,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2020~2024년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 890.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 890호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 44%)"
      },
      "medical": {
        "rawValue": 12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 21%)"
      },
      "school": {
        "rawValue": 10.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 10.2곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 2%)"
      },
      "returnFarm": {
        "rawValue": 0.13,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 38,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 38%)"
      }
    }
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "populationTrend": 21,
    "farmActivity": 58,
    "medical": 27,
    "school": 80,
    "returnFarm": 40,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.9%",
        "interpretation": "2020~2024년 인구 -6.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1129.55,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,130호",
        "rankPercent": 42,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 42%)"
      },
      "medical": {
        "rawValue": 12.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 6.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
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
    "populationTrend": 26,
    "farmActivity": 54,
    "medical": 43,
    "school": 93,
    "returnFarm": 51,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2020~2024년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1056.2,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,056호",
        "rankPercent": 46,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 46%)"
      },
      "medical": {
        "rawValue": 13.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.9곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 8.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.5곳",
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
    "populationTrend": 39,
    "farmActivity": 60,
    "medical": 19,
    "school": 96,
    "returnFarm": 50,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.1%",
        "interpretation": "2020~2024년 인구 -4.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1161.28,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,161호",
        "rankPercent": 40,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 40%)"
      },
      "medical": {
        "rawValue": 11.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 19%)"
      },
      "school": {
        "rawValue": 9.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.3곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 4%)"
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
    "populationTrend": 89,
    "farmActivity": 49,
    "medical": 6,
    "school": 89,
    "returnFarm": 37,
    "evidence": {
      "populationTrend": {
        "rawValue": 3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +3.4%",
        "interpretation": "2020~2024년 인구 +3.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 994.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 995호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 49%)"
      },
      "medical": {
        "rawValue": 10.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 6%)"
      },
      "school": {
        "rawValue": 7.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.7곳",
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
    "populationTrend": 97,
    "farmActivity": 42,
    "medical": 14,
    "school": 88,
    "returnFarm": 43,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.5%",
        "interpretation": "2020~2024년 인구 +4.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 854.76,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 855호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 42%)"
      },
      "medical": {
        "rawValue": 11.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
      },
      "school": {
        "rawValue": 7.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.6곳",
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
    "populationTrend": 65,
    "farmActivity": 63,
    "medical": 4,
    "school": 87,
    "returnFarm": 52,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2020~2024년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1190.09,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,190호",
        "rankPercent": 37,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 37%)"
      },
      "medical": {
        "rawValue": 9.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 4%)"
      },
      "school": {
        "rawValue": 7.49,
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
    "populationTrend": 81,
    "farmActivity": 12,
    "medical": 34,
    "school": 37,
    "returnFarm": 12,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.1%",
        "interpretation": "2020~2024년 인구 +2.1% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 253.03,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 253호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 12%)"
      },
      "medical": {
        "rawValue": 13.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
      },
      "school": {
        "rawValue": 2.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 37%)"
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
    "populationTrend": 59,
    "farmActivity": 27,
    "medical": 28,
    "school": 55,
    "returnFarm": 27,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.1%",
        "interpretation": "2020~2024년 인구 -1.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 507.12,
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
        "rankPercent": 45,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 45%)"
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
    "populationTrend": 47,
    "farmActivity": 32,
    "medical": 51,
    "school": 57,
    "returnFarm": 25,
    "evidence": {
      "populationTrend": {
        "rawValue": -3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.0%",
        "interpretation": "2020~2024년 인구 -3.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 604.13,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 604호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 32%)"
      },
      "medical": {
        "rawValue": 14.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 49,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 49%)"
      },
      "school": {
        "rawValue": 3.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
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
    "sgisCode": "33520",
    "name": "보은군",
    "populationTrend": 31,
    "farmActivity": 79,
    "medical": 83,
    "school": 85,
    "returnFarm": 88,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2020~2024년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1597.56,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,598호",
        "rankPercent": 21,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 21%)"
      },
      "medical": {
        "rawValue": 18.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.4곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 7.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.4곳",
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
    "populationTrend": 47,
    "farmActivity": 65,
    "medical": 78,
    "school": 65,
    "returnFarm": 73,
    "evidence": {
      "populationTrend": {
        "rawValue": -3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.0%",
        "interpretation": "2020~2024년 인구 -3.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1242.2,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,242호",
        "rankPercent": 35,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 35%)"
      },
      "medical": {
        "rawValue": 17.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 22%)"
      },
      "school": {
        "rawValue": 4.64,
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
    "populationTrend": 20,
    "farmActivity": 78,
    "medical": 83,
    "school": 75,
    "returnFarm": 74,
    "evidence": {
      "populationTrend": {
        "rawValue": -7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.0%",
        "interpretation": "2020~2024년 인구 -7.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1584.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,585호",
        "rankPercent": 22,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 22%)"
      },
      "medical": {
        "rawValue": 18.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.5곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 5.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
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
    "sgisCode": "33590",
    "name": "증평군",
    "populationTrend": 85,
    "farmActivity": 24,
    "medical": 29,
    "school": 45,
    "returnFarm": 31,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.7%",
        "interpretation": "2020~2024년 인구 +2.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 445,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 445호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 24%)"
      },
      "medical": {
        "rawValue": 12.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 29%)"
      },
      "school": {
        "rawValue": 2.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 45%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 31%)"
      }
    }
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "populationTrend": 100,
    "farmActivity": 29,
    "medical": 9,
    "school": 54,
    "returnFarm": 34,
    "evidence": {
      "populationTrend": {
        "rawValue": 7.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +7.9%",
        "interpretation": "2020~2024년 인구 +7.9% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 522.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 523호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 29%)"
      },
      "medical": {
        "rawValue": 10.67,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 9%)"
      },
      "school": {
        "rawValue": 3.31,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.3곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 46%)"
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
    "populationTrend": 54,
    "farmActivity": 81,
    "medical": 46,
    "school": 79,
    "returnFarm": 90,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2020~2024년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1644.89,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,645호",
        "rankPercent": 19,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 19%)"
      },
      "medical": {
        "rawValue": 14.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 46%)"
      },
      "school": {
        "rawValue": 6.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.4곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
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
    "populationTrend": 85,
    "farmActivity": 35,
    "medical": 23,
    "school": 57,
    "returnFarm": 36,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.8%",
        "interpretation": "2020~2024년 인구 +2.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 664.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 664호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 35%)"
      },
      "medical": {
        "rawValue": 12.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 3.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.5곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 43%)"
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
    "sgisCode": "33580",
    "name": "단양군",
    "populationTrend": 42,
    "farmActivity": 71,
    "medical": 61,
    "school": 88,
    "returnFarm": 55,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2020~2024년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1338.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,339호",
        "rankPercent": 29,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 29%)"
      },
      "medical": {
        "rawValue": 15.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.8곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 39%)"
      },
      "school": {
        "rawValue": 7.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.5곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 12%)"
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
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "populationTrend": 100,
    "farmActivity": 11,
    "medical": 22,
    "school": 49,
    "returnFarm": 9,
    "evidence": {
      "populationTrend": {
        "rawValue": 10.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +10.2%",
        "interpretation": "2020~2024년 인구 +10.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 236.75,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 237호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 11%)"
      },
      "medical": {
        "rawValue": 12.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 22%)"
      },
      "school": {
        "rawValue": 2.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 49%)"
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
    "sgisCode": "25010",
    "name": "동구",
    "populationTrend": 59,
    "farmActivity": null,
    "medical": 54,
    "school": 31,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.2%",
        "interpretation": "2020~2024년 인구 -1.2% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 46%)"
      },
      "school": {
        "rawValue": 2.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 31%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 65,
    "school": 43,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2020~2024년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 35%)"
      },
      "school": {
        "rawValue": 2.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.5곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 91,
    "school": 27,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2020~2024년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.2곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 9%)"
      },
      "school": {
        "rawValue": 2.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 27%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "populationTrend": 94,
    "farmActivity": null,
    "medical": 36,
    "school": 33,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.1%",
        "interpretation": "2020~2024년 인구 +4.1% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 36%)"
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
    "sgisCode": "25050",
    "name": "대덕구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 29,
    "school": 40,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2020~2024년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 29%)"
      },
      "school": {
        "rawValue": 2.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "populationTrend": 79,
    "farmActivity": 9,
    "medical": 25,
    "school": 27,
    "returnFarm": 4,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.8%",
        "interpretation": "2020~2024년 인구 +1.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 200.1,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 200호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 9%)"
      },
      "medical": {
        "rawValue": 12.38,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 25%)"
      },
      "school": {
        "rawValue": 2.02,
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
    "medical": 64,
    "school": 68,
    "returnFarm": 47,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.6%",
        "interpretation": "2020~2024년 인구 -3.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1001.31,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,001호",
        "rankPercent": 50,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 50%)"
      },
      "medical": {
        "rawValue": 16.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 36%)"
      },
      "school": {
        "rawValue": 5.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.1곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 32%)"
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
    "sgisCode": "34030",
    "name": "보령시",
    "populationTrend": 47,
    "farmActivity": 45,
    "medical": 57,
    "school": 67,
    "returnFarm": 48,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2020~2024년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 919.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 920호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 45%)"
      },
      "medical": {
        "rawValue": 15.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 4.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.9곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
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
    "sgisCode": "34040",
    "name": "아산시",
    "populationTrend": 100,
    "farmActivity": 14,
    "medical": 4,
    "school": 42,
    "returnFarm": 20,
    "evidence": {
      "populationTrend": {
        "rawValue": 15.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +15.3%",
        "interpretation": "2020~2024년 인구 +15.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 263.82,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 264호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 14%)"
      },
      "medical": {
        "rawValue": 9.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 4%)"
      },
      "school": {
        "rawValue": 2.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 42%)"
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
    "populationTrend": 75,
    "farmActivity": 37,
    "medical": 18,
    "school": 52,
    "returnFarm": 39,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.3%",
        "interpretation": "2020~2024년 인구 +1.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 728.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 729호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 37%)"
      },
      "medical": {
        "rawValue": 11.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 18%)"
      },
      "school": {
        "rawValue": 3.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.1곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 48%)"
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
    "sgisCode": "34060",
    "name": "논산시",
    "populationTrend": 39,
    "farmActivity": 47,
    "medical": 74,
    "school": 68,
    "returnFarm": 44,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2020~2024년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 943.83,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 944호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 47%)"
      },
      "medical": {
        "rawValue": 17.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.5곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 26%)"
      },
      "school": {
        "rawValue": 5.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.1곳",
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
    "populationTrend": 100,
    "farmActivity": 10,
    "medical": 35,
    "school": 41,
    "returnFarm": 22,
    "evidence": {
      "populationTrend": {
        "rawValue": 10.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +10.2%",
        "interpretation": "2020~2024년 인구 +10.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 201.66,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 202호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 10%)"
      },
      "medical": {
        "rawValue": 13.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 35%)"
      },
      "school": {
        "rawValue": 2.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 41%)"
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
    "sgisCode": "34080",
    "name": "당진시",
    "populationTrend": 100,
    "farmActivity": 33,
    "medical": 16,
    "school": 53,
    "returnFarm": 35,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.2%",
        "interpretation": "2020~2024년 인구 +5.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 623.7,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 624호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 33%)"
      },
      "medical": {
        "rawValue": 11.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 16%)"
      },
      "school": {
        "rawValue": 3.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.2곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 47%)"
      },
      "returnFarm": {
        "rawValue": 0.05,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 35%)"
      }
    }
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "populationTrend": 60,
    "farmActivity": 66,
    "medical": 63,
    "school": 70,
    "returnFarm": 72,
    "evidence": {
      "populationTrend": {
        "rawValue": -1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.0%",
        "interpretation": "2020~2024년 인구 -1.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1251.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,252호",
        "rankPercent": 34,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 34%)"
      },
      "medical": {
        "rawValue": 16.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 5.45,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.4곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
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
    "sgisCode": "34530",
    "name": "부여군",
    "populationTrend": 22,
    "farmActivity": 83,
    "medical": 72,
    "school": 78,
    "returnFarm": 79,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.7%",
        "interpretation": "2020~2024년 인구 -6.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1713.83,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,714호",
        "rankPercent": 17,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 17%)"
      },
      "medical": {
        "rawValue": 17.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.0곳",
        "rankPercent": 28,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 28%)"
      },
      "school": {
        "rawValue": 6.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 22%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 21,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 21%)"
      }
    }
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "populationTrend": 34,
    "farmActivity": 71,
    "medical": 80,
    "school": 81,
    "returnFarm": 61,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2020~2024년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1362.22,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,362호",
        "rankPercent": 29,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 29%)"
      },
      "medical": {
        "rawValue": 18.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.1곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
      },
      "school": {
        "rawValue": 6.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.6곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 19%)"
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
    "sgisCode": "34550",
    "name": "청양군",
    "populationTrend": 60,
    "farmActivity": 97,
    "medical": 67,
    "school": 73,
    "returnFarm": 92,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.9%",
        "interpretation": "2020~2024년 인구 -0.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2117.18,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,117호",
        "rankPercent": 3,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 3%)"
      },
      "medical": {
        "rawValue": 16.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 5.7,
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
    "populationTrend": 63,
    "farmActivity": 51,
    "medical": 41,
    "school": 64,
    "returnFarm": 45,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.6%",
        "interpretation": "2020~2024년 인구 -0.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1009.81,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,010호",
        "rankPercent": 49,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 49%)"
      },
      "medical": {
        "rawValue": 13.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 41%)"
      },
      "school": {
        "rawValue": 4.31,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.3곳",
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
    "populationTrend": 84,
    "farmActivity": 57,
    "medical": 42,
    "school": 70,
    "returnFarm": 60,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.6%",
        "interpretation": "2020~2024년 인구 +2.6% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1121.63,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,122호",
        "rankPercent": 43,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 43%)"
      },
      "medical": {
        "rawValue": 13.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 42%)"
      },
      "school": {
        "rawValue": 5.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
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
    "sgisCode": "34580",
    "name": "태안군",
    "populationTrend": 66,
    "farmActivity": 62,
    "medical": 31,
    "school": 67,
    "returnFarm": 57,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.1%",
        "interpretation": "2020~2024년 인구 -0.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1187.23,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,187호",
        "rankPercent": 38,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 38%)"
      },
      "medical": {
        "rawValue": 12.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
      },
      "school": {
        "rawValue": 4.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.9곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
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
    "sgisCode": "35010",
    "name": "전주시",
    "populationTrend": 50,
    "farmActivity": null,
    "medical": 73,
    "school": 40,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.5%",
        "interpretation": "2020~2024년 인구 -2.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 17.13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.1곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
      },
      "school": {
        "rawValue": 2.42,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 40%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "populationTrend": 58,
    "farmActivity": 15,
    "medical": 42,
    "school": 53,
    "returnFarm": 14,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.3%",
        "interpretation": "2020~2024년 인구 -1.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 297.58,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 298호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 15%)"
      },
      "medical": {
        "rawValue": 13.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 42%)"
      },
      "school": {
        "rawValue": 3.16,
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
    "populationTrend": 36,
    "farmActivity": 27,
    "medical": 55,
    "school": 60,
    "returnFarm": 23,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2020~2024년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 482.98,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 483호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 27%)"
      },
      "medical": {
        "rawValue": 15.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.1곳",
        "rankPercent": 45,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 45%)"
      },
      "school": {
        "rawValue": 3.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.9곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 40%)"
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
    "sgisCode": "35040",
    "name": "정읍시",
    "populationTrend": 37,
    "farmActivity": 55,
    "medical": 84,
    "school": 83,
    "returnFarm": 50,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2020~2024년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1097,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,097호",
        "rankPercent": 45,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 45%)"
      },
      "medical": {
        "rawValue": 18.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.6곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 16%)"
      },
      "school": {
        "rawValue": 6.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.8곳",
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
    "populationTrend": 30,
    "farmActivity": 68,
    "medical": 85,
    "school": 82,
    "returnFarm": 67,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2020~2024년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1262.38,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,262호",
        "rankPercent": 32,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 32%)"
      },
      "medical": {
        "rawValue": 18.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.7곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 15%)"
      },
      "school": {
        "rawValue": 6.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.6곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 18%)"
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
    "sgisCode": "35060",
    "name": "김제시",
    "populationTrend": 66,
    "farmActivity": 52,
    "medical": 78,
    "school": 84,
    "returnFarm": 65,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.1%",
        "interpretation": "2020~2024년 인구 -0.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1022.31,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,022호",
        "rankPercent": 48,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 48%)"
      },
      "medical": {
        "rawValue": 17.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 22%)"
      },
      "school": {
        "rawValue": 7.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.0곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 16%)"
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
    "sgisCode": "35510",
    "name": "완주군",
    "populationTrend": 100,
    "farmActivity": 41,
    "medical": 33,
    "school": 67,
    "returnFarm": 53,
    "evidence": {
      "populationTrend": {
        "rawValue": 7.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +7.3%",
        "interpretation": "2020~2024년 인구 +7.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 832.45,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 832호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 41%)"
      },
      "medical": {
        "rawValue": 13.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 33%)"
      },
      "school": {
        "rawValue": 5.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.1곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 33%)"
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
    "sgisCode": "35520",
    "name": "진안군",
    "populationTrend": 52,
    "farmActivity": 92,
    "medical": 90,
    "school": 100,
    "returnFarm": 95,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2020~2024년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1900.68,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,901호",
        "rankPercent": 8,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 8%)"
      },
      "medical": {
        "rawValue": 19.69,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.7곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 12.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 12.3곳",
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
    "populationTrend": 73,
    "farmActivity": 86,
    "medical": 63,
    "school": 90,
    "returnFarm": 77,
    "evidence": {
      "populationTrend": {
        "rawValue": 1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.0%",
        "interpretation": "2020~2024년 인구 +1.0% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1851.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,852호",
        "rankPercent": 14,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 14%)"
      },
      "medical": {
        "rawValue": 16.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.2곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 37%)"
      },
      "school": {
        "rawValue": 7.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.9곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
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
    "populationTrend": 33,
    "farmActivity": 99,
    "medical": 68,
    "school": 99,
    "returnFarm": 97,
    "evidence": {
      "populationTrend": {
        "rawValue": -5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.0%",
        "interpretation": "2020~2024년 인구 -5.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2166.55,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,167호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 16.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 32%)"
      },
      "school": {
        "rawValue": 11.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 11.1곳",
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
    "populationTrend": 21,
    "farmActivity": 82,
    "medical": 97,
    "school": 99,
    "returnFarm": 84,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.9%",
        "interpretation": "2020~2024년 인구 -6.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1690.63,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,691호",
        "rankPercent": 18,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 18%)"
      },
      "medical": {
        "rawValue": 25.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 26.0곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
      },
      "school": {
        "rawValue": 11.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 11.5곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 16,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 16%)"
      }
    }
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "populationTrend": 39,
    "farmActivity": 99,
    "medical": 96,
    "school": 97,
    "returnFarm": 99,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.2%",
        "interpretation": "2020~2024년 인구 -4.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2126.77,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,127호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 23.14,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 23.1곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 4%)"
      },
      "school": {
        "rawValue": 9.81,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.8곳",
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
    "populationTrend": 51,
    "farmActivity": 84,
    "medical": 80,
    "school": 89,
    "returnFarm": 88,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.4%",
        "interpretation": "2020~2024년 인구 -2.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1767.34,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,767호",
        "rankPercent": 16,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 16%)"
      },
      "medical": {
        "rawValue": 18.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.1곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 20%)"
      },
      "school": {
        "rawValue": 7.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.8곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 11%)"
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
    "populationTrend": 27,
    "farmActivity": 75,
    "medical": 77,
    "school": 90,
    "returnFarm": 78,
    "evidence": {
      "populationTrend": {
        "rawValue": -6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.0%",
        "interpretation": "2020~2024년 인구 -6.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1472.73,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,473호",
        "rankPercent": 25,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 25%)"
      },
      "medical": {
        "rawValue": 17.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 7.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.0곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 10%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
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
    "school": 32,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.0%",
        "interpretation": "2020~2024년 인구 +5.0% 변화로 회복세예요"
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
        "rawValue": 2.16,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 32%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 93,
    "school": 25,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2020~2024년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.7곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
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
    "sgisCode": "24030",
    "name": "남구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 70,
    "school": 50,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2020~2024년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.91,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 2.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.9곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 50%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "populationTrend": 57,
    "farmActivity": null,
    "medical": 52,
    "school": 39,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.4%",
        "interpretation": "2020~2024년 인구 -1.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.8곳",
        "rankPercent": 48,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 48%)"
      },
      "school": {
        "rawValue": 2.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 39%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "populationTrend": 51,
    "farmActivity": null,
    "medical": 27,
    "school": 34,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.4%",
        "interpretation": "2020~2024년 인구 -2.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.68,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 2.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 34%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "populationTrend": 38,
    "farmActivity": null,
    "medical": 35,
    "school": 56,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.4%",
        "interpretation": "2020~2024년 인구 -4.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 35%)"
      },
      "school": {
        "rawValue": 3.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 44%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "populationTrend": 53,
    "farmActivity": 20,
    "medical": 40,
    "school": 59,
    "returnFarm": 12,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2020~2024년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 356.24,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 356호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 20%)"
      },
      "medical": {
        "rawValue": 13.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.7곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 3.61,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.6곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 41%)"
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
    "sgisCode": "36030",
    "name": "순천시",
    "populationTrend": 64,
    "farmActivity": 29,
    "medical": 38,
    "school": 50,
    "returnFarm": 24,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2020~2024년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 547.87,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 548호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 29%)"
      },
      "medical": {
        "rawValue": 13.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 3.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.0곳",
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
    "sgisCode": "36040",
    "name": "나주시",
    "populationTrend": 94,
    "farmActivity": 43,
    "medical": 48,
    "school": 65,
    "returnFarm": 54,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.2%",
        "interpretation": "2020~2024년 인구 +4.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 879.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 879호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 43%)"
      },
      "medical": {
        "rawValue": 14.49,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 48%)"
      },
      "school": {
        "rawValue": 4.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.6곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 35%)"
      },
      "returnFarm": {
        "rawValue": 0.1,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 46,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 46%)"
      }
    }
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "populationTrend": 97,
    "farmActivity": 28,
    "medical": 9,
    "school": 60,
    "returnFarm": 21,
    "evidence": {
      "populationTrend": {
        "rawValue": 4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +4.5%",
        "interpretation": "2020~2024년 인구 +4.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 509.28,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 509호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 28%)"
      },
      "medical": {
        "rawValue": 10.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 9%)"
      },
      "school": {
        "rawValue": 3.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.7곳",
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
    "populationTrend": 53,
    "farmActivity": 76,
    "medical": 81,
    "school": 77,
    "returnFarm": 60,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2020~2024년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1511.66,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,512호",
        "rankPercent": 24,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 24%)"
      },
      "medical": {
        "rawValue": 18.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.2곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 19%)"
      },
      "school": {
        "rawValue": 6,
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
    "populationTrend": 34,
    "farmActivity": 96,
    "medical": 92,
    "school": 74,
    "returnFarm": 96,
    "evidence": {
      "populationTrend": {
        "rawValue": -5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.0%",
        "interpretation": "2020~2024년 인구 -5.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2098.11,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,098호",
        "rankPercent": 4,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 4%)"
      },
      "medical": {
        "rawValue": 20.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.4곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 8%)"
      },
      "school": {
        "rawValue": 5.77,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.8곳",
        "rankPercent": 26,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 26%)"
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
    "sgisCode": "36530",
    "name": "구례군",
    "populationTrend": 34,
    "farmActivity": 89,
    "medical": 93,
    "school": 87,
    "returnFarm": 75,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2020~2024년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1868.07,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,868호",
        "rankPercent": 11,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 11%)"
      },
      "medical": {
        "rawValue": 21.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 21.1곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 7%)"
      },
      "school": {
        "rawValue": 7.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.5곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
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
    "sgisCode": "36550",
    "name": "고흥군",
    "populationTrend": 53,
    "farmActivity": 85,
    "medical": 77,
    "school": 80,
    "returnFarm": 93,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2020~2024년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1828.3,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,828호",
        "rankPercent": 15,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 15%)"
      },
      "medical": {
        "rawValue": 17.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.9곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 6.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.5곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
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
    "populationTrend": 34,
    "farmActivity": 83,
    "medical": 87,
    "school": 97,
    "returnFarm": 89,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2020~2024년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1755.34,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,755호",
        "rankPercent": 17,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 17%)"
      },
      "medical": {
        "rawValue": 19.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.1곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
      },
      "school": {
        "rawValue": 9.71,
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
    "populationTrend": 55,
    "farmActivity": 61,
    "medical": 77,
    "school": 69,
    "returnFarm": 69,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.8%",
        "interpretation": "2020~2024년 인구 -1.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1182.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,183호",
        "rankPercent": 39,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 39%)"
      },
      "medical": {
        "rawValue": 17.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 23%)"
      },
      "school": {
        "rawValue": 5.24,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.2곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 31%)"
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
    "sgisCode": "36580",
    "name": "장흥군",
    "populationTrend": 30,
    "farmActivity": 91,
    "medical": 90,
    "school": 91,
    "returnFarm": 87,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.4%",
        "interpretation": "2020~2024년 인구 -5.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1895.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,896호",
        "rankPercent": 9,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 9%)"
      },
      "medical": {
        "rawValue": 19.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.8곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 8.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.1곳",
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
    "populationTrend": 31,
    "farmActivity": 88,
    "medical": 76,
    "school": 95,
    "returnFarm": 86,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2020~2024년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1866.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,867호",
        "rankPercent": 12,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 12%)"
      },
      "medical": {
        "rawValue": 17.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 24%)"
      },
      "school": {
        "rawValue": 9.02,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.0곳",
        "rankPercent": 5,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 5%)"
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
    "populationTrend": 34,
    "farmActivity": 80,
    "medical": 67,
    "school": 74,
    "returnFarm": 76,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2020~2024년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1640.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,641호",
        "rankPercent": 20,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 20%)"
      },
      "medical": {
        "rawValue": 16.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 33,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 33%)"
      },
      "school": {
        "rawValue": 5.8,
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
    "populationTrend": 100,
    "farmActivity": 56,
    "medical": 28,
    "school": 75,
    "returnFarm": 73,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.7%",
        "interpretation": "2020~2024년 인구 +5.7% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1113.84,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,114호",
        "rankPercent": 44,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 44%)"
      },
      "medical": {
        "rawValue": 12.76,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 28%)"
      },
      "school": {
        "rawValue": 5.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.8곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 25%)"
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
    "sgisCode": "36620",
    "name": "무안군",
    "populationTrend": 100,
    "farmActivity": 45,
    "medical": 27,
    "school": 63,
    "returnFarm": 58,
    "evidence": {
      "populationTrend": {
        "rawValue": 9.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +9.8%",
        "interpretation": "2020~2024년 인구 +9.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 909.02,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 909호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 45%)"
      },
      "medical": {
        "rawValue": 12.59,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 27%)"
      },
      "school": {
        "rawValue": 4.2,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.2곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
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
    "sgisCode": "36630",
    "name": "함평군",
    "populationTrend": 41,
    "farmActivity": 94,
    "medical": 88,
    "school": 93,
    "returnFarm": 96,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.8%",
        "interpretation": "2020~2024년 인구 -3.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1971.11,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,971호",
        "rankPercent": 6,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 6%)"
      },
      "medical": {
        "rawValue": 19.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.3곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 12%)"
      },
      "school": {
        "rawValue": 8.62,
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
    "populationTrend": 64,
    "farmActivity": 59,
    "medical": 84,
    "school": 77,
    "returnFarm": 68,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.4%",
        "interpretation": "2020~2024년 인구 -0.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1157.92,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,158호",
        "rankPercent": 41,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 41%)"
      },
      "medical": {
        "rawValue": 18.6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.6곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 16%)"
      },
      "school": {
        "rawValue": 6,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 23,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 23%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
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
    "populationTrend": 45,
    "farmActivity": 73,
    "medical": 60,
    "school": 76,
    "returnFarm": 82,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.3%",
        "interpretation": "2020~2024년 인구 -3.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1415.88,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,416호",
        "rankPercent": 27,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 27%)"
      },
      "medical": {
        "rawValue": 15.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 40,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 40%)"
      },
      "school": {
        "rawValue": 5.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.0곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 24%)"
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
    "sgisCode": "36660",
    "name": "완도군",
    "populationTrend": 65,
    "farmActivity": 39,
    "medical": 57,
    "school": 94,
    "returnFarm": 46,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2020~2024년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 785.56,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 786호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 39%)"
      },
      "medical": {
        "rawValue": 15.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.2곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 8.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.9곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 6%)"
      },
      "returnFarm": {
        "rawValue": 0.09,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "interpretation": "정착 비율이 평균 수준이에요 (전국 하위 46%)"
      }
    }
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "populationTrend": 70,
    "farmActivity": 72,
    "medical": 75,
    "school": 97,
    "returnFarm": 76,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.5%",
        "interpretation": "2020~2024년 인구 +0.5% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1393.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,394호",
        "rankPercent": 28,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 28%)"
      },
      "medical": {
        "rawValue": 17.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 25%)"
      },
      "school": {
        "rawValue": 9.51,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.5곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 3%)"
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
    "sgisCode": "36680",
    "name": "신안군",
    "populationTrend": 75,
    "farmActivity": 90,
    "medical": 75,
    "school": 100,
    "returnFarm": 100,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.2%",
        "interpretation": "2020~2024년 인구 +1.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 1887.72,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,888호",
        "rankPercent": 10,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 10%)"
      },
      "medical": {
        "rawValue": 17.71,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 25,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 25%)"
      },
      "school": {
        "rawValue": 12.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 12.4곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 1%)"
      },
      "returnFarm": {
        "rawValue": 0.39,
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
    "populationTrend": 37,
    "farmActivity": null,
    "medical": 98,
    "school": 35,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.4%",
        "interpretation": "2020~2024년 인구 -4.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 34.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 34.8곳",
        "rankPercent": 2,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 2%)"
      },
      "school": {
        "rawValue": 2.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 35%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "populationTrend": 55,
    "farmActivity": null,
    "medical": 34,
    "school": 36,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.8%",
        "interpretation": "2020~2024년 인구 -1.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 13.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.2곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 34%)"
      },
      "school": {
        "rawValue": 2.32,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "populationTrend": 55,
    "farmActivity": null,
    "medical": 82,
    "school": 38,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.8%",
        "interpretation": "2020~2024년 인구 -1.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 18.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.3곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 18%)"
      },
      "school": {
        "rawValue": 2.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 38%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "populationTrend": 29,
    "farmActivity": null,
    "medical": 26,
    "school": 41,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.7%",
        "interpretation": "2020~2024년 인구 -5.7% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 12.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 26%)"
      },
      "school": {
        "rawValue": 2.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 41%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "populationTrend": 77,
    "farmActivity": null,
    "medical": 97,
    "school": 22,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.6%",
        "interpretation": "2020~2024년 인구 +1.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 24.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 24.4곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
      },
      "school": {
        "rawValue": 1.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 22%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "populationTrend": 71,
    "farmActivity": null,
    "medical": 91,
    "school": 25,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.7%",
        "interpretation": "2020~2024년 인구 +0.7% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.2곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 9%)"
      },
      "school": {
        "rawValue": 1.96,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 25%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 62,
    "school": 27,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2020~2024년 인구 -3.4% 변화로 안정 추세예요"
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
        "rawValue": 2.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 27%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "populationTrend": 31,
    "farmActivity": null,
    "medical": 50,
    "school": 35,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2020~2024년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.7,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.7곳",
        "rankPercent": 50,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 50%)"
      },
      "school": {
        "rawValue": 2.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 35%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "populationTrend": 26,
    "farmActivity": null,
    "medical": 88,
    "school": 19,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2020~2024년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.3곳",
        "rankPercent": 12,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 12%)"
      },
      "school": {
        "rawValue": 1.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.8곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 19%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "populationTrend": 26,
    "farmActivity": null,
    "medical": 53,
    "school": 26,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2020~2024년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
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
    "sgisCode": "21110",
    "name": "금정구",
    "populationTrend": 6,
    "farmActivity": null,
    "medical": 71,
    "school": 42,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -9.0%",
        "interpretation": "2020~2024년 인구 -9.0% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 29%)"
      },
      "school": {
        "rawValue": 2.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.5곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 42%)"
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
        "rawValue": 6.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +6.6%",
        "interpretation": "2020~2024년 인구 +6.6% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 9.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 2%)"
      },
      "school": {
        "rawValue": 3.09,
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
    "populationTrend": 76,
    "farmActivity": null,
    "medical": 89,
    "school": 6,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.4%",
        "interpretation": "2020~2024년 인구 +1.4% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.34,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.3곳",
        "rankPercent": 11,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 11%)"
      },
      "school": {
        "rawValue": 1.44,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.4곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 6%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 90,
    "school": 2,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2020~2024년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.1곳",
        "rankPercent": 10,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 10%)"
      },
      "school": {
        "rawValue": 1.31,
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
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 20,
    "school": 23,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2020~2024년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.85,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 1.9,
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
    "populationTrend": 81,
    "farmActivity": 4,
    "medical": 23,
    "school": 36,
    "returnFarm": 15,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.2%",
        "interpretation": "2020~2024년 인구 +2.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 128.1,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 128호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 4%)"
      },
      "medical": {
        "rawValue": 12.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 23%)"
      },
      "school": {
        "rawValue": 2.31,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.3곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 36%)"
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
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 100,
    "school": 30,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 26.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +26.7%",
        "interpretation": "2020~2024년 인구 +26.7% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 51.21,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 51.2곳",
        "rankPercent": 1,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 1%)"
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
    "sgisCode": "22020",
    "name": "동구",
    "populationTrend": 72,
    "farmActivity": null,
    "medical": 56,
    "school": 15,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.8%",
        "interpretation": "2020~2024년 인구 +0.8% 변화로 회복세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 15.12,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.1곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 44%)"
      },
      "school": {
        "rawValue": 1.7,
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
    "populationTrend": 42,
    "farmActivity": null,
    "medical": 66,
    "school": 23,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.7%",
        "interpretation": "2020~2024년 인구 -3.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.33,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 34%)"
      },
      "school": {
        "rawValue": 1.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 23%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "populationTrend": 23,
    "farmActivity": null,
    "medical": 87,
    "school": 38,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.5%",
        "interpretation": "2020~2024년 인구 -6.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 19.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.0곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
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
    "sgisCode": "22050",
    "name": "북구",
    "populationTrend": 31,
    "farmActivity": null,
    "medical": 46,
    "school": 23,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.3%",
        "interpretation": "2020~2024년 인구 -5.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 14.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.3곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 46%)"
      },
      "school": {
        "rawValue": 1.89,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 23%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 97,
    "school": 22,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.4%",
        "interpretation": "2020~2024년 인구 -3.4% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 23.15,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 23.2곳",
        "rankPercent": 3,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 3%)"
      },
      "school": {
        "rawValue": 1.88,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 1.9곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 22%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "populationTrend": 27,
    "farmActivity": null,
    "medical": 66,
    "school": 28,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.9%",
        "interpretation": "2020~2024년 인구 -5.9% 변화로 감소 폭이 커요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 16.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.4곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 34%)"
      },
      "school": {
        "rawValue": 2.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.0곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 28%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "populationTrend": 72,
    "farmActivity": 12,
    "medical": 10,
    "school": 43,
    "returnFarm": 17,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.8%",
        "interpretation": "2020~2024년 인구 +0.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 262.58,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 263호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 12%)"
      },
      "medical": {
        "rawValue": 10.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 2.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.5곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 43%)"
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
    "populationTrend": 48,
    "farmActivity": 93,
    "medical": 65,
    "school": 84,
    "returnFarm": 98,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.7%",
        "interpretation": "2020~2024년 인구 -2.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1916.44,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,916호",
        "rankPercent": 7,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 7%)"
      },
      "medical": {
        "rawValue": 16.28,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 35,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 35%)"
      },
      "school": {
        "rawValue": 6.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.0곳",
        "rankPercent": 16,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 16%)"
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
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 17,
    "school": 29,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.8%",
        "interpretation": "2020~2024년 인구 -4.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 11.63,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.6곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 17%)"
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
    "sgisCode": "26020",
    "name": "남구",
    "populationTrend": 35,
    "farmActivity": null,
    "medical": 92,
    "school": 30,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.7%",
        "interpretation": "2020~2024년 인구 -4.7% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 20.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 20.3곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 8%)"
      },
      "school": {
        "rawValue": 2.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
      },
      "returnFarm": null
    }
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 12,
    "school": 33,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2020~2024년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 10.99,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 12%)"
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
    "sgisCode": "26040",
    "name": "북구",
    "populationTrend": 62,
    "farmActivity": null,
    "medical": 1,
    "school": 40,
    "returnFarm": null,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.8%",
        "interpretation": "2020~2024년 인구 -0.8% 변화로 안정 추세예요"
      },
      "farmActivity": null,
      "medical": {
        "rawValue": 8.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 8.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 1%)"
      },
      "school": {
        "rawValue": 2.41,
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
    "medical": 3,
    "school": 47,
    "returnFarm": 28,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.3%",
        "interpretation": "2020~2024년 인구 -0.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 330.55,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 331호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 17%)"
      },
      "medical": {
        "rawValue": 9.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 2.76,
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
    "medical": 40,
    "school": 48,
    "returnFarm": 19,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.6%",
        "interpretation": "2020~2024년 인구 -1.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 339.34,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 339호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 18%)"
      },
      "medical": {
        "rawValue": 13.55,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 2.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.8곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 48%)"
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
    "populationTrend": 59,
    "farmActivity": 31,
    "medical": 20,
    "school": 53,
    "returnFarm": 32,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.2%",
        "interpretation": "2020~2024년 인구 -1.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 600.08,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 600호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 31%)"
      },
      "medical": {
        "rawValue": 11.83,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 3.25,
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
    "populationTrend": 52,
    "farmActivity": 58,
    "medical": 14,
    "school": 62,
    "returnFarm": 35,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.1%",
        "interpretation": "2020~2024년 인구 -2.1% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1138.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,139호",
        "rankPercent": 42,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 42%)"
      },
      "medical": {
        "rawValue": 11.53,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 14%)"
      },
      "school": {
        "rawValue": 4.04,
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
    "populationTrend": 43,
    "farmActivity": 42,
    "medical": 49,
    "school": 60,
    "returnFarm": 42,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.6%",
        "interpretation": "2020~2024년 인구 -3.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 853.33,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 853호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 42%)"
      },
      "medical": {
        "rawValue": 14.64,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.6곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 49%)"
      },
      "school": {
        "rawValue": 3.84,
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
    "populationTrend": 52,
    "farmActivity": 19,
    "medical": 16,
    "school": 44,
    "returnFarm": 8,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.2%",
        "interpretation": "2020~2024년 인구 -2.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 355.58,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 356호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 19%)"
      },
      "medical": {
        "rawValue": 11.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.5곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 16%)"
      },
      "school": {
        "rawValue": 2.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.6곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 44%)"
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
    "sgisCode": "37060",
    "name": "영주시",
    "populationTrend": 37,
    "farmActivity": 46,
    "medical": 49,
    "school": 61,
    "returnFarm": 37,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.5%",
        "interpretation": "2020~2024년 인구 -4.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 943.11,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 943호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 46%)"
      },
      "medical": {
        "rawValue": 14.52,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 49%)"
      },
      "school": {
        "rawValue": 3.93,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.9곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 39%)"
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
    "sgisCode": "37070",
    "name": "영천시",
    "populationTrend": 61,
    "farmActivity": 48,
    "medical": 54,
    "school": 63,
    "returnFarm": 56,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.8%",
        "interpretation": "2020~2024년 인구 -0.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 979.77,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 980호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 48%)"
      },
      "medical": {
        "rawValue": 14.97,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.0곳",
        "rankPercent": 46,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 46%)"
      },
      "school": {
        "rawValue": 4.22,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.2곳",
        "rankPercent": 37,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 37%)"
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
    "sgisCode": "37080",
    "name": "상주시",
    "populationTrend": 46,
    "farmActivity": 76,
    "medical": 61,
    "school": 76,
    "returnFarm": 64,
    "evidence": {
      "populationTrend": {
        "rawValue": -3.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.2%",
        "interpretation": "2020~2024년 인구 -3.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1474.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,475호",
        "rankPercent": 24,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 24%)"
      },
      "medical": {
        "rawValue": 15.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.8곳",
        "rankPercent": 39,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 39%)"
      },
      "school": {
        "rawValue": 5.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.9곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 24%)"
      },
      "returnFarm": {
        "rawValue": 0.14,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.1%",
        "rankPercent": 36,
        "interpretation": "정착 비율이 평균 수준이에요 (전국 상위 36%)"
      }
    }
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "populationTrend": 40,
    "farmActivity": 63,
    "medical": 69,
    "school": 69,
    "returnFarm": 59,
    "evidence": {
      "populationTrend": {
        "rawValue": -4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.0%",
        "interpretation": "2020~2024년 인구 -4.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1204.95,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,205호",
        "rankPercent": 37,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 37%)"
      },
      "medical": {
        "rawValue": 16.79,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.8곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 31%)"
      },
      "school": {
        "rawValue": 5.19,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.2곳",
        "rankPercent": 31,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 31%)"
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
    "sgisCode": "37100",
    "name": "경산시",
    "populationTrend": 100,
    "farmActivity": 17,
    "medical": 18,
    "school": 30,
    "returnFarm": 18,
    "evidence": {
      "populationTrend": {
        "rawValue": 5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +5.2%",
        "interpretation": "2020~2024년 인구 +5.2% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 326.43,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 326호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 17%)"
      },
      "medical": {
        "rawValue": 11.72,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 18%)"
      },
      "school": {
        "rawValue": 2.08,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.1곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 30%)"
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
    "populationTrend": 38,
    "farmActivity": 98,
    "medical": 73,
    "school": 81,
    "returnFarm": 94,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.4%",
        "interpretation": "2020~2024년 인구 -4.4% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2124.9,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,125호",
        "rankPercent": 2,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 2%)"
      },
      "medical": {
        "rawValue": 17.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.4곳",
        "rankPercent": 27,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 27%)"
      },
      "school": {
        "rawValue": 6.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.6곳",
        "rankPercent": 19,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 19%)"
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
    "populationTrend": 48,
    "farmActivity": 100,
    "medical": 70,
    "school": 95,
    "returnFarm": 99,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.9%",
        "interpretation": "2020~2024년 인구 -2.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2234.93,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,235호",
        "rankPercent": 1,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 1%)"
      },
      "medical": {
        "rawValue": 16.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 9.1,
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
    "populationTrend": 38,
    "farmActivity": 95,
    "medical": 43,
    "school": 96,
    "returnFarm": 94,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.3%",
        "interpretation": "2020~2024년 인구 -4.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 2000.8,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,001호",
        "rankPercent": 5,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 5%)"
      },
      "medical": {
        "rawValue": 13.95,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.9곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 9.3,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 9.3곳",
        "rankPercent": 4,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 4%)"
      },
      "returnFarm": {
        "rawValue": 0.28,
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
    "populationTrend": 24,
    "farmActivity": 64,
    "medical": 83,
    "school": 83,
    "returnFarm": 78,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.4%",
        "interpretation": "2020~2024년 인구 -6.4% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1224.62,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,225호",
        "rankPercent": 36,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 36%)"
      },
      "medical": {
        "rawValue": 18.37,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.4곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 17%)"
      },
      "school": {
        "rawValue": 6.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.7곳",
        "rankPercent": 17,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 17%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 22,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 22%)"
      }
    }
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "populationTrend": 36,
    "farmActivity": 87,
    "medical": 76,
    "school": 71,
    "returnFarm": 91,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.6%",
        "interpretation": "2020~2024년 인구 -4.6% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1858.96,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,859호",
        "rankPercent": 13,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 13%)"
      },
      "medical": {
        "rawValue": 17.73,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 17.7곳",
        "rankPercent": 24,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 24%)"
      },
      "school": {
        "rawValue": 5.57,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.6곳",
        "rankPercent": 29,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 29%)"
      },
      "returnFarm": {
        "rawValue": 0.25,
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
    "populationTrend": 56,
    "farmActivity": 68,
    "medical": 53,
    "school": 70,
    "returnFarm": 63,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.5%",
        "interpretation": "2020~2024년 인구 -1.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1271.74,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,272호",
        "rankPercent": 32,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 32%)"
      },
      "medical": {
        "rawValue": 14.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.9곳",
        "rankPercent": 47,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 47%)"
      },
      "school": {
        "rawValue": 5.5,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 5.5곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 30%)"
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
    "sgisCode": "37580",
    "name": "성주군",
    "populationTrend": 59,
    "farmActivity": 73,
    "medical": 56,
    "school": 72,
    "returnFarm": 70,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.2%",
        "interpretation": "2020~2024년 인구 -1.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1403.53,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,404호",
        "rankPercent": 27,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 27%)"
      },
      "medical": {
        "rawValue": 15.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.1곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 44%)"
      },
      "school": {
        "rawValue": 5.6,
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
    "populationTrend": 34,
    "farmActivity": 26,
    "medical": 12,
    "school": 58,
    "returnFarm": 29,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.9,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.9%",
        "interpretation": "2020~2024년 인구 -4.9% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 479.81,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 480호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 26%)"
      },
      "medical": {
        "rawValue": 11.09,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.1곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 12%)"
      },
      "school": {
        "rawValue": 3.54,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.5곳",
        "rankPercent": 42,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 42%)"
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
    "sgisCode": "37600",
    "name": "예천군",
    "populationTrend": 65,
    "farmActivity": 77,
    "medical": 43,
    "school": 66,
    "returnFarm": 71,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.2%",
        "interpretation": "2020~2024년 인구 -0.2% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1545.64,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,546호",
        "rankPercent": 23,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 23%)"
      },
      "medical": {
        "rawValue": 13.8,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.8곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 43%)"
      },
      "school": {
        "rawValue": 4.66,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.7곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 34%)"
      },
      "returnFarm": {
        "rawValue": 0.17,
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
    "populationTrend": 23,
    "farmActivity": 96,
    "medical": 30,
    "school": 93,
    "returnFarm": 86,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.6%",
        "interpretation": "2020~2024년 인구 -6.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 2009.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 2,010호",
        "rankPercent": 4,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 4%)"
      },
      "medical": {
        "rawValue": 12.87,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 12.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 30%)"
      },
      "school": {
        "rawValue": 8.58,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.6곳",
        "rankPercent": 7,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 7%)"
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
    "sgisCode": "37620",
    "name": "울진군",
    "populationTrend": 40,
    "farmActivity": 50,
    "medical": 47,
    "school": 73,
    "returnFarm": 45,
    "evidence": {
      "populationTrend": {
        "rawValue": -4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.0%",
        "interpretation": "2020~2024년 인구 -4.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 998.14,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 998호",
        "rankPercent": 50,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 50%)"
      },
      "medical": {
        "rawValue": 14.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
      },
      "school": {
        "rawValue": 5.74,
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
    "populationTrend": 72,
    "farmActivity": 34,
    "medical": 3,
    "school": 85,
    "returnFarm": 38,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.8%",
        "interpretation": "2020~2024년 인구 +0.8% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 635.35,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 635호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 34%)"
      },
      "medical": {
        "rawValue": 9.4,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.4곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 7.05,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.0곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 15%)"
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
    "sgisCode": "38010",
    "name": "창원시",
    "populationTrend": 48,
    "farmActivity": 9,
    "medical": 40,
    "school": 39,
    "returnFarm": 1,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.8%",
        "interpretation": "2020~2024년 인구 -2.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 199.16,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 199호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 9%)"
      },
      "medical": {
        "rawValue": 13.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.6곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 40%)"
      },
      "school": {
        "rawValue": 2.36,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.4곳",
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 하위 39%)"
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
    "populationTrend": 55,
    "farmActivity": 24,
    "medical": 44,
    "school": 47,
    "returnFarm": 19,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.8%",
        "interpretation": "2020~2024년 인구 -1.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 467.78,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 468호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 24%)"
      },
      "medical": {
        "rawValue": 14.04,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.0곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 44%)"
      },
      "school": {
        "rawValue": 2.77,
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
    "sgisCode": "38050",
    "name": "통영시",
    "populationTrend": 26,
    "farmActivity": 19,
    "medical": 37,
    "school": 56,
    "returnFarm": 26,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.1,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.1%",
        "interpretation": "2020~2024년 인구 -6.1% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 348.66,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 349호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 19%)"
      },
      "medical": {
        "rawValue": 13.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.4곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 37%)"
      },
      "school": {
        "rawValue": 3.41,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.4곳",
        "rankPercent": 44,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 44%)"
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
    "sgisCode": "38060",
    "name": "사천시",
    "populationTrend": 55,
    "farmActivity": 32,
    "medical": 31,
    "school": 57,
    "returnFarm": 33,
    "evidence": {
      "populationTrend": {
        "rawValue": -1.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -1.8%",
        "interpretation": "2020~2024년 인구 -1.8% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 621.51,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 622호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 32%)"
      },
      "medical": {
        "rawValue": 13,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.0곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 31%)"
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
    "populationTrend": 64,
    "farmActivity": 8,
    "medical": 10,
    "school": 33,
    "returnFarm": 1,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.5%",
        "interpretation": "2020~2024년 인구 -0.5% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 191.18,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 191호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 8%)"
      },
      "medical": {
        "rawValue": 10.82,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 10.8곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 10%)"
      },
      "school": {
        "rawValue": 2.18,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 33%)"
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
    "populationTrend": 62,
    "farmActivity": 53,
    "medical": 38,
    "school": 63,
    "returnFarm": 49,
    "evidence": {
      "populationTrend": {
        "rawValue": -0.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -0.7%",
        "interpretation": "2020~2024년 인구 -0.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1055.54,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,056호",
        "rankPercent": 47,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 47%)"
      },
      "medical": {
        "rawValue": 13.46,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 13.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 38%)"
      },
      "school": {
        "rawValue": 4.1,
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
    "populationTrend": 51,
    "farmActivity": 16,
    "medical": 3,
    "school": 51,
    "returnFarm": 13,
    "evidence": {
      "populationTrend": {
        "rawValue": -2.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.3%",
        "interpretation": "2020~2024년 인구 -2.3% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 315.06,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 315호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 16%)"
      },
      "medical": {
        "rawValue": 9.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 9.7곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 3%)"
      },
      "school": {
        "rawValue": 3.03,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 3.0곳",
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
    "populationTrend": 83,
    "farmActivity": 2,
    "medical": 20,
    "school": 32,
    "returnFarm": 6,
    "evidence": {
      "populationTrend": {
        "rawValue": 2.4,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +2.4%",
        "interpretation": "2020~2024년 인구 +2.4% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 121.6,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 122호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 2%)"
      },
      "medical": {
        "rawValue": 11.9,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.9곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 20%)"
      },
      "school": {
        "rawValue": 2.17,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 2.2곳",
        "interpretation": "1만 명당 학교가 적은 편이에요 (전국 하위 32%)"
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
    "returnFarm": 83,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.2%",
        "interpretation": "2020~2024년 인구 -5.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1560,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,560호",
        "rankPercent": 22,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 22%)"
      },
      "medical": {
        "rawValue": 19.1,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 19.1곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 13%)"
      },
      "school": {
        "rawValue": 8.94,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.9곳",
        "rankPercent": 6,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 6%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 17,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 17%)"
      }
    }
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "populationTrend": 30,
    "farmActivity": 47,
    "medical": 13,
    "school": 66,
    "returnFarm": 47,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2020~2024년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 966.52,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 967호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 47%)"
      },
      "medical": {
        "rawValue": 11.35,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 11.3곳",
        "interpretation": "1만 명당 의료기관이 적은 편이에요 (전국 하위 13%)"
      },
      "school": {
        "rawValue": 4.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.9곳",
        "rankPercent": 34,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 34%)"
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
    "sgisCode": "38530",
    "name": "창녕군",
    "populationTrend": 28,
    "farmActivity": 65,
    "medical": 68,
    "school": 78,
    "returnFarm": 71,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.8,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.8%",
        "interpretation": "2020~2024년 인구 -5.8% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1237.41,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,237호",
        "rankPercent": 35,
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 상위 35%)"
      },
      "medical": {
        "rawValue": 16.62,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.6곳",
        "rankPercent": 32,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 32%)"
      },
      "school": {
        "rawValue": 6.23,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.2곳",
        "rankPercent": 22,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 22%)"
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
    "sgisCode": "38540",
    "name": "고성군",
    "populationTrend": 35,
    "farmActivity": 69,
    "medical": 47,
    "school": 79,
    "returnFarm": 65,
    "evidence": {
      "populationTrend": {
        "rawValue": -4.7,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -4.7%",
        "interpretation": "2020~2024년 인구 -4.7% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1315.67,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,316호",
        "rankPercent": 31,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 31%)"
      },
      "medical": {
        "rawValue": 14.48,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 14.5곳",
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 하위 47%)"
      },
      "school": {
        "rawValue": 6.29,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.3곳",
        "rankPercent": 21,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 21%)"
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
    "sgisCode": "38550",
    "name": "남해군",
    "populationTrend": 25,
    "farmActivity": 81,
    "medical": 70,
    "school": 87,
    "returnFarm": 81,
    "evidence": {
      "populationTrend": {
        "rawValue": -6.2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -6.2%",
        "interpretation": "2020~2024년 인구 -6.2% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1664.66,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,665호",
        "rankPercent": 19,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 19%)"
      },
      "medical": {
        "rawValue": 16.92,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.9곳",
        "rankPercent": 30,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 30%)"
      },
      "school": {
        "rawValue": 7.43,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.4곳",
        "rankPercent": 13,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 13%)"
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
    "sgisCode": "38560",
    "name": "하동군",
    "populationTrend": 18,
    "farmActivity": 91,
    "medical": 86,
    "school": 91,
    "returnFarm": 91,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.3%",
        "interpretation": "2020~2024년 인구 -7.3% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1900.32,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,900호",
        "rankPercent": 9,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 9%)"
      },
      "medical": {
        "rawValue": 18.86,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.9곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 8.01,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.0곳",
        "rankPercent": 9,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 9%)"
      },
      "returnFarm": {
        "rawValue": 0.25,
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
    "populationTrend": 46,
    "farmActivity": 94,
    "medical": 86,
    "school": 86,
    "returnFarm": 85,
    "evidence": {
      "populationTrend": {
        "rawValue": -3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -3.0%",
        "interpretation": "2020~2024년 인구 -3.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1990.46,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,990호",
        "rankPercent": 6,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 6%)"
      },
      "medical": {
        "rawValue": 18.78,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.8곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 14%)"
      },
      "school": {
        "rawValue": 7.39,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 7.4곳",
        "rankPercent": 14,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 14%)"
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
    "sgisCode": "38580",
    "name": "함양군",
    "populationTrend": 30,
    "farmActivity": 88,
    "medical": 82,
    "school": 80,
    "returnFarm": 80,
    "evidence": {
      "populationTrend": {
        "rawValue": -5.5,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -5.5%",
        "interpretation": "2020~2024년 인구 -5.5% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1867.25,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,867호",
        "rankPercent": 12,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 12%)"
      },
      "medical": {
        "rawValue": 18.25,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.2곳",
        "rankPercent": 18,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 18%)"
      },
      "school": {
        "rawValue": 6.56,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 6.6곳",
        "rankPercent": 20,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 20%)"
      },
      "returnFarm": {
        "rawValue": 0.19,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 20,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 20%)"
      }
    }
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "populationTrend": 53,
    "farmActivity": 74,
    "medical": 64,
    "school": 77,
    "returnFarm": 63,
    "evidence": {
      "populationTrend": {
        "rawValue": -2,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -2.0%",
        "interpretation": "2020~2024년 인구 -2.0% 변화로 안정 추세예요"
      },
      "farmActivity": {
        "rawValue": 1454.8,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,455호",
        "rankPercent": 26,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 26%)"
      },
      "medical": {
        "rawValue": 16.27,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 16.3곳",
        "rankPercent": 36,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 36%)"
      },
      "school": {
        "rawValue": 5.99,
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
    "populationTrend": 16,
    "farmActivity": 86,
    "medical": 85,
    "school": 92,
    "returnFarm": 83,
    "evidence": {
      "populationTrend": {
        "rawValue": -7.6,
        "rawUnit": "%",
        "rawLabel": "5년 인구 -7.6%",
        "interpretation": "2020~2024년 인구 -7.6% 변화로 감소 폭이 커요"
      },
      "farmActivity": {
        "rawValue": 1828.5,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 1,828호",
        "rankPercent": 14,
        "interpretation": "1만 명당 농가가 많아 농업 활동이 활발해요 (전국 상위 14%)"
      },
      "medical": {
        "rawValue": 18.74,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 18.7곳",
        "rankPercent": 15,
        "interpretation": "1만 명당 의료기관이 많아 접근성이 좋아요 (전국 상위 15%)"
      },
      "school": {
        "rawValue": 8.47,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 8.5곳",
        "rankPercent": 8,
        "interpretation": "1만 명당 학교가 많아 자녀 교육 환경이 좋아요 (전국 상위 8%)"
      },
      "returnFarm": {
        "rawValue": 0.2,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.2%",
        "rankPercent": 17,
        "interpretation": "정착 비율이 높아 정착 사례가 많은 곳이에요 (전국 상위 17%)"
      }
    }
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "populationTrend": 69,
    "farmActivity": 25,
    "medical": 59,
    "school": 44,
    "returnFarm": 16,
    "evidence": {
      "populationTrend": {
        "rawValue": 0.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +0.3%",
        "interpretation": "2020~2024년 인구 +0.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 470.15,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 470호",
        "interpretation": "1만 명당 농가가 적은 편이에요 (전국 하위 25%)"
      },
      "medical": {
        "rawValue": 15.65,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.7곳",
        "rankPercent": 41,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 41%)"
      },
      "school": {
        "rawValue": 2.61,
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
    "populationTrend": 75,
    "farmActivity": 40,
    "medical": 57,
    "school": 62,
    "returnFarm": 32,
    "evidence": {
      "populationTrend": {
        "rawValue": 1.3,
        "rawUnit": "%",
        "rawLabel": "5년 인구 +1.3%",
        "interpretation": "2020~2024년 인구 +1.3% 변화로 회복세예요"
      },
      "farmActivity": {
        "rawValue": 825.39,
        "rawUnit": "호",
        "rawLabel": "1만 명당 농가 825호",
        "interpretation": "1만 명당 농가가 평균 수준이에요 (전국 하위 40%)"
      },
      "medical": {
        "rawValue": 15.26,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 의료기관 15.3곳",
        "rankPercent": 43,
        "interpretation": "1만 명당 의료기관이 평균 수준이에요 (전국 상위 43%)"
      },
      "school": {
        "rawValue": 3.98,
        "rawUnit": "곳",
        "rawLabel": "1만 명당 학교 4.0곳",
        "rankPercent": 38,
        "interpretation": "1만 명당 학교가 평균 수준이에요 (전국 상위 38%)"
      },
      "returnFarm": {
        "rawValue": 0.04,
        "rawUnit": "%",
        "rawLabel": "전체 인구 대비 귀농 0.0%",
        "interpretation": "정착 비율이 낮은 편이에요 (전국 하위 32%)"
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
