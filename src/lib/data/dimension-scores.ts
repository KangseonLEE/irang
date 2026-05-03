/**
 * 시군구 차원별 5점수 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-dimension-scores.ts
 * 마지막 갱신: 2026-05-03
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
    "returnFarm": null
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "populationTrend": 43,
    "farmActivity": null,
    "medical": 99,
    "school": 41,
    "returnFarm": null
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 56,
    "school": 14,
    "returnFarm": null
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "populationTrend": 13,
    "farmActivity": null,
    "medical": 75,
    "school": 6,
    "returnFarm": null
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "populationTrend": 38,
    "farmActivity": null,
    "medical": 75,
    "school": 3,
    "returnFarm": null
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 84,
    "school": 7,
    "returnFarm": null
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 57,
    "school": 1,
    "returnFarm": null
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "populationTrend": 63,
    "farmActivity": null,
    "medical": 31,
    "school": 6,
    "returnFarm": null
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "populationTrend": 21,
    "farmActivity": null,
    "medical": 71,
    "school": 3,
    "returnFarm": null
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "populationTrend": 18,
    "farmActivity": null,
    "medical": 27,
    "school": 7,
    "returnFarm": null
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "populationTrend": 20,
    "farmActivity": null,
    "medical": 59,
    "school": 26,
    "returnFarm": null
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "populationTrend": 55,
    "farmActivity": null,
    "medical": 62,
    "school": 9,
    "returnFarm": null
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "populationTrend": 65,
    "farmActivity": null,
    "medical": 47,
    "school": 4,
    "returnFarm": null
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "populationTrend": 56,
    "farmActivity": null,
    "medical": 96,
    "school": 4,
    "returnFarm": null
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "populationTrend": 39,
    "farmActivity": null,
    "medical": 68,
    "school": 9,
    "returnFarm": null
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 76,
    "school": 8,
    "returnFarm": null
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 51,
    "school": 5,
    "returnFarm": null
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "populationTrend": 61,
    "farmActivity": null,
    "medical": 55,
    "school": 5,
    "returnFarm": null
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "populationTrend": 78,
    "farmActivity": null,
    "medical": 94,
    "school": 1,
    "returnFarm": null
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 63,
    "school": 4,
    "returnFarm": null
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "populationTrend": 49,
    "farmActivity": null,
    "medical": 49,
    "school": 1,
    "returnFarm": null
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 99,
    "school": 8,
    "returnFarm": null
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "populationTrend": 57,
    "farmActivity": null,
    "medical": 100,
    "school": 14,
    "returnFarm": null
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 93,
    "school": 10,
    "returnFarm": null
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 95,
    "school": 7,
    "returnFarm": null
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 5,
    "school": 51,
    "returnFarm": null
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 54,
    "school": 100,
    "returnFarm": null
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "populationTrend": 67,
    "farmActivity": null,
    "medical": 28,
    "school": 2,
    "returnFarm": null
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 31,
    "school": 22,
    "returnFarm": null
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 52,
    "school": 12,
    "returnFarm": null
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 40,
    "school": 18,
    "returnFarm": null
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 34,
    "school": 21,
    "returnFarm": null
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 20,
    "school": 21,
    "returnFarm": null
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "populationTrend": 87,
    "farmActivity": 57,
    "medical": 31,
    "school": 69,
    "returnFarm": 58
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "populationTrend": 71,
    "farmActivity": 34,
    "medical": 44,
    "school": 98,
    "returnFarm": 39
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 51,
    "school": 17,
    "returnFarm": null
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 94,
    "school": 18,
    "returnFarm": null
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 42,
    "school": 12,
    "returnFarm": null
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "populationTrend": 36,
    "farmActivity": null,
    "medical": 74,
    "school": 13,
    "returnFarm": null
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "populationTrend": 36,
    "farmActivity": null,
    "medical": 48,
    "school": 13,
    "returnFarm": null
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 73,
    "school": 15,
    "returnFarm": null
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "populationTrend": 100,
    "farmActivity": 8,
    "medical": 21,
    "school": 31,
    "returnFarm": 8
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "populationTrend": 43,
    "farmActivity": null,
    "medical": 5,
    "school": 39,
    "returnFarm": null
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "populationTrend": 62,
    "farmActivity": null,
    "medical": 13,
    "school": 11,
    "returnFarm": null
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "populationTrend": 91,
    "farmActivity": null,
    "medical": 35,
    "school": 18,
    "returnFarm": null
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 65,
    "school": 19,
    "returnFarm": null
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "populationTrend": 27,
    "farmActivity": null,
    "medical": 88,
    "school": 14,
    "returnFarm": null
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "populationTrend": 100,
    "farmActivity": 2,
    "medical": 17,
    "school": 19,
    "returnFarm": 3
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 11,
    "school": 27,
    "returnFarm": null
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 6,
    "school": 17,
    "returnFarm": null
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "populationTrend": 45,
    "farmActivity": null,
    "medical": 29,
    "school": 16,
    "returnFarm": null
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 9,
    "school": 24,
    "returnFarm": null
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 48,
    "school": 11,
    "returnFarm": null
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "populationTrend": 92,
    "farmActivity": 1,
    "medical": 22,
    "school": 20,
    "returnFarm": 1
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "populationTrend": 100,
    "farmActivity": 7,
    "medical": 12,
    "school": 38,
    "returnFarm": 6
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "populationTrend": 87,
    "farmActivity": 23,
    "medical": 18,
    "school": 44,
    "returnFarm": 22
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "populationTrend": 91,
    "farmActivity": 25,
    "medical": 10,
    "school": 47,
    "returnFarm": 30
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "populationTrend": 100,
    "farmActivity": 4,
    "medical": 14,
    "school": 22,
    "returnFarm": 7
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "populationTrend": 100,
    "farmActivity": 5,
    "medical": 1,
    "school": 30,
    "returnFarm": 11
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "populationTrend": 100,
    "farmActivity": 2,
    "medical": 3,
    "school": 11,
    "returnFarm": 5
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "populationTrend": 100,
    "farmActivity": 8,
    "medical": 7,
    "school": 90,
    "returnFarm": 2
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "populationTrend": 75,
    "farmActivity": 23,
    "medical": 4,
    "school": 49,
    "returnFarm": 27
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "populationTrend": 77,
    "farmActivity": 36,
    "medical": 26,
    "school": 61,
    "returnFarm": 36
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 29,
    "school": 58,
    "returnFarm": null
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "populationTrend": 64,
    "farmActivity": null,
    "medical": 61,
    "school": 63,
    "returnFarm": null
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 33,
    "school": 69,
    "returnFarm": null
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "populationTrend": 86,
    "farmActivity": 13,
    "medical": 33,
    "school": 47,
    "returnFarm": 11
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "populationTrend": 100,
    "farmActivity": 15,
    "medical": 45,
    "school": 45,
    "returnFarm": 10
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "populationTrend": 65,
    "farmActivity": 21,
    "medical": 28,
    "school": 48,
    "returnFarm": 17
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "populationTrend": 59,
    "farmActivity": null,
    "medical": 24,
    "school": 54,
    "returnFarm": null
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 14,
    "school": 79,
    "returnFarm": null
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "populationTrend": 89,
    "farmActivity": null,
    "medical": 70,
    "school": 43,
    "returnFarm": null
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "populationTrend": 31,
    "farmActivity": 37,
    "medical": 7,
    "school": 70,
    "returnFarm": 30
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "populationTrend": 47,
    "farmActivity": 63,
    "medical": 38,
    "school": 82,
    "returnFarm": 67
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "populationTrend": 78,
    "farmActivity": 64,
    "medical": 20,
    "school": 86,
    "returnFarm": 76
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "populationTrend": 47,
    "farmActivity": 48,
    "medical": 8,
    "school": 91,
    "returnFarm": 69
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "populationTrend": 45,
    "farmActivity": 60,
    "medical": 55,
    "school": 89,
    "returnFarm": 74
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "populationTrend": 25,
    "farmActivity": 44,
    "medical": 17,
    "school": 97,
    "returnFarm": 40
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "populationTrend": 19,
    "farmActivity": 54,
    "medical": 23,
    "school": 78,
    "returnFarm": 48
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "populationTrend": 28,
    "farmActivity": 46,
    "medical": 55,
    "school": 92,
    "returnFarm": 67
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "populationTrend": 28,
    "farmActivity": 66,
    "medical": 15,
    "school": 95,
    "returnFarm": 60
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "populationTrend": 78,
    "farmActivity": 53,
    "medical": 7,
    "school": 87,
    "returnFarm": 47
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "populationTrend": 43,
    "farmActivity": 41,
    "medical": 19,
    "school": 86,
    "returnFarm": 38
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "populationTrend": 91,
    "farmActivity": 62,
    "medical": 4,
    "school": 85,
    "returnFarm": 44
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "populationTrend": 77,
    "farmActivity": 11,
    "medical": 36,
    "school": 39,
    "returnFarm": 12
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "populationTrend": 68,
    "farmActivity": 28,
    "medical": 30,
    "school": 53,
    "returnFarm": 26
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "populationTrend": 39,
    "farmActivity": 32,
    "medical": 53,
    "school": 56,
    "returnFarm": 27
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "populationTrend": 28,
    "farmActivity": null,
    "medical": 82,
    "school": 84,
    "returnFarm": null
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "populationTrend": 43,
    "farmActivity": 67,
    "medical": 77,
    "school": 64,
    "returnFarm": 65
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "populationTrend": 3,
    "farmActivity": 78,
    "medical": 82,
    "school": 74,
    "returnFarm": 75
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "populationTrend": 72,
    "farmActivity": 27,
    "medical": 32,
    "school": 44,
    "returnFarm": 77
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "populationTrend": 100,
    "farmActivity": 27,
    "medical": 10,
    "school": 55,
    "returnFarm": 31
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "populationTrend": 56,
    "farmActivity": 79,
    "medical": 45,
    "school": 78,
    "returnFarm": 87
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "populationTrend": 48,
    "farmActivity": 36,
    "medical": 27,
    "school": 57,
    "returnFarm": 37
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "populationTrend": 20,
    "farmActivity": 73,
    "medical": 62,
    "school": 86,
    "returnFarm": 86
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "populationTrend": 100,
    "farmActivity": 11,
    "medical": 1,
    "school": 48,
    "returnFarm": 8
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "populationTrend": 50,
    "farmActivity": null,
    "medical": 54,
    "school": 29,
    "returnFarm": null
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "populationTrend": 24,
    "farmActivity": null,
    "medical": 65,
    "school": 40,
    "returnFarm": null
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 90,
    "school": 25,
    "returnFarm": null
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "populationTrend": 73,
    "farmActivity": null,
    "medical": 43,
    "school": 34,
    "returnFarm": null
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 26,
    "school": 37,
    "returnFarm": null
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "populationTrend": 83,
    "farmActivity": 10,
    "medical": 25,
    "school": 28,
    "returnFarm": 5
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "populationTrend": 42,
    "farmActivity": 50,
    "medical": 63,
    "school": 66,
    "returnFarm": 46
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "populationTrend": 42,
    "farmActivity": 45,
    "medical": 56,
    "school": 65,
    "returnFarm": 48
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "populationTrend": 100,
    "farmActivity": 14,
    "medical": 8,
    "school": 41,
    "returnFarm": 24
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "populationTrend": 81,
    "farmActivity": 38,
    "medical": 18,
    "school": 50,
    "returnFarm": 35
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "populationTrend": 34,
    "farmActivity": 48,
    "medical": 74,
    "school": 67,
    "returnFarm": 49
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "populationTrend": 80,
    "farmActivity": 6,
    "medical": 37,
    "school": 43,
    "returnFarm": 21
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "populationTrend": 71,
    "farmActivity": 35,
    "medical": 17,
    "school": 54,
    "returnFarm": 34
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "populationTrend": 35,
    "farmActivity": 69,
    "medical": 66,
    "school": 68,
    "returnFarm": 62
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "populationTrend": 16,
    "farmActivity": null,
    "medical": 72,
    "school": 73,
    "returnFarm": null
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "populationTrend": 27,
    "farmActivity": 70,
    "medical": 78,
    "school": 79,
    "returnFarm": 84
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "populationTrend": 36,
    "farmActivity": 99,
    "medical": 68,
    "school": 72,
    "returnFarm": 92
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "populationTrend": 49,
    "farmActivity": 59,
    "medical": 41,
    "school": 62,
    "returnFarm": 42
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "populationTrend": 48,
    "farmActivity": 72,
    "medical": 48,
    "school": 73,
    "returnFarm": 57
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "populationTrend": 63,
    "farmActivity": 64,
    "medical": 30,
    "school": 65,
    "returnFarm": 64
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "populationTrend": 74,
    "farmActivity": null,
    "medical": 72,
    "school": 36,
    "returnFarm": null
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "populationTrend": 53,
    "farmActivity": 16,
    "medical": 42,
    "school": 50,
    "returnFarm": 14
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "populationTrend": 27,
    "farmActivity": 26,
    "medical": 52,
    "school": 59,
    "returnFarm": 23
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "populationTrend": 36,
    "farmActivity": 56,
    "medical": 85,
    "school": 82,
    "returnFarm": 52
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "populationTrend": 39,
    "farmActivity": 55,
    "medical": 85,
    "school": 80,
    "returnFarm": 68
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "populationTrend": 41,
    "farmActivity": 55,
    "medical": 81,
    "school": 83,
    "returnFarm": 61
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "populationTrend": 45,
    "farmActivity": 42,
    "medical": 44,
    "school": 68,
    "returnFarm": 45
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "populationTrend": 48,
    "farmActivity": 82,
    "medical": 90,
    "school": 99,
    "returnFarm": 94
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "populationTrend": 45,
    "farmActivity": 98,
    "medical": 70,
    "school": 90,
    "returnFarm": 96
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "populationTrend": 28,
    "farmActivity": 98,
    "medical": 69,
    "school": 98,
    "returnFarm": 89
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "populationTrend": 30,
    "farmActivity": 87,
    "medical": 97,
    "school": 99,
    "returnFarm": 90
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "populationTrend": 21,
    "farmActivity": 97,
    "medical": 97,
    "school": 97,
    "returnFarm": 100
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "populationTrend": 22,
    "farmActivity": 86,
    "medical": 83,
    "school": 89,
    "returnFarm": 78
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "populationTrend": 25,
    "farmActivity": 84,
    "medical": 77,
    "school": 88,
    "returnFarm": 66
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 95,
    "school": 31,
    "returnFarm": null
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 93,
    "school": 25,
    "returnFarm": null
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "populationTrend": 58,
    "farmActivity": null,
    "medical": 67,
    "school": 46,
    "returnFarm": null
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "populationTrend": 44,
    "farmActivity": null,
    "medical": 50,
    "school": 37,
    "returnFarm": null
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "populationTrend": 68,
    "farmActivity": null,
    "medical": 24,
    "school": 33,
    "returnFarm": null
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "populationTrend": 32,
    "farmActivity": null,
    "medical": 34,
    "school": 54,
    "returnFarm": null
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "populationTrend": 60,
    "farmActivity": 20,
    "medical": 39,
    "school": 57,
    "returnFarm": 17
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "populationTrend": 76,
    "farmActivity": 29,
    "medical": 38,
    "school": 49,
    "returnFarm": 29
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "populationTrend": 97,
    "farmActivity": 43,
    "medical": 53,
    "school": 64,
    "returnFarm": 52
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "populationTrend": 75,
    "farmActivity": 30,
    "medical": 12,
    "school": 57,
    "returnFarm": 25
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "populationTrend": 64,
    "farmActivity": 74,
    "medical": 79,
    "school": 75,
    "returnFarm": 77
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "populationTrend": 27,
    "farmActivity": 93,
    "medical": 91,
    "school": 71,
    "returnFarm": 99
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "populationTrend": 37,
    "farmActivity": 90,
    "medical": 93,
    "school": 87,
    "returnFarm": 86
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "populationTrend": 44,
    "farmActivity": 92,
    "medical": 79,
    "school": 81,
    "returnFarm": 83
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "populationTrend": 14,
    "farmActivity": 83,
    "medical": 89,
    "school": 96,
    "returnFarm": 95
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "populationTrend": 64,
    "farmActivity": 58,
    "medical": 78,
    "school": 67,
    "returnFarm": 61
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "populationTrend": 25,
    "farmActivity": 91,
    "medical": 89,
    "school": 89,
    "returnFarm": 70
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "populationTrend": 30,
    "farmActivity": 88,
    "medical": 76,
    "school": 94,
    "returnFarm": 85
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "populationTrend": 28,
    "farmActivity": 81,
    "medical": 69,
    "school": 74,
    "returnFarm": 83
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "populationTrend": 56,
    "farmActivity": 71,
    "medical": 40,
    "school": 77,
    "returnFarm": 80
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "populationTrend": 100,
    "farmActivity": 42,
    "medical": 28,
    "school": 61,
    "returnFarm": 53
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "populationTrend": 33,
    "farmActivity": 96,
    "medical": 88,
    "school": 93,
    "returnFarm": 97
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "populationTrend": 63,
    "farmActivity": 61,
    "medical": 87,
    "school": 76,
    "returnFarm": 58
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "populationTrend": 41,
    "farmActivity": 77,
    "medical": 59,
    "school": 72,
    "returnFarm": 81
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "populationTrend": 46,
    "farmActivity": 39,
    "medical": 59,
    "school": 96,
    "returnFarm": 45
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "populationTrend": 57,
    "farmActivity": 75,
    "medical": 80,
    "school": 96,
    "returnFarm": 54
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "populationTrend": 39,
    "farmActivity": 95,
    "medical": 83,
    "school": 100,
    "returnFarm": 98
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 98,
    "school": 32,
    "returnFarm": null
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 35,
    "school": 82,
    "returnFarm": null
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "populationTrend": 77,
    "farmActivity": null,
    "medical": 86,
    "school": 36,
    "returnFarm": null
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "populationTrend": 7,
    "farmActivity": null,
    "medical": 25,
    "school": 40,
    "returnFarm": null
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "populationTrend": 53,
    "farmActivity": null,
    "medical": 97,
    "school": 23,
    "returnFarm": null
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "populationTrend": 90,
    "farmActivity": null,
    "medical": 91,
    "school": 25,
    "returnFarm": null
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "populationTrend": 9,
    "farmActivity": null,
    "medical": 62,
    "school": 29,
    "returnFarm": null
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 45,
    "school": 26,
    "returnFarm": null
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 87,
    "school": 16,
    "returnFarm": null
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "populationTrend": 18,
    "farmActivity": null,
    "medical": 49,
    "school": 24,
    "returnFarm": null
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "populationTrend": 12,
    "farmActivity": null,
    "medical": 64,
    "school": 36,
    "returnFarm": null
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 2,
    "school": 52,
    "returnFarm": null
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "populationTrend": 66,
    "farmActivity": null,
    "medical": 92,
    "school": 10,
    "returnFarm": null
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "populationTrend": 66,
    "farmActivity": null,
    "medical": 90,
    "school": 2,
    "returnFarm": null
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "populationTrend": 8,
    "farmActivity": null,
    "medical": 22,
    "school": 23,
    "returnFarm": null
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "populationTrend": 100,
    "farmActivity": 5,
    "medical": 21,
    "school": 35,
    "returnFarm": 9
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "populationTrend": 72,
    "farmActivity": null,
    "medical": 100,
    "school": 42,
    "returnFarm": null
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "populationTrend": 48,
    "farmActivity": null,
    "medical": 58,
    "school": 15,
    "returnFarm": null
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "populationTrend": 0,
    "farmActivity": null,
    "medical": 71,
    "school": 93,
    "returnFarm": null
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "populationTrend": 34,
    "farmActivity": null,
    "medical": 81,
    "school": 33,
    "returnFarm": null
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "populationTrend": 58,
    "farmActivity": null,
    "medical": 41,
    "school": 20,
    "returnFarm": null
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "populationTrend": 41,
    "farmActivity": null,
    "medical": 96,
    "school": 21,
    "returnFarm": null
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "populationTrend": 30,
    "farmActivity": null,
    "medical": 64,
    "school": 27,
    "returnFarm": null
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "populationTrend": 100,
    "farmActivity": 12,
    "medical": 9,
    "school": 39,
    "returnFarm": 20
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "populationTrend": 1,
    "farmActivity": null,
    "medical": 16,
    "school": 28,
    "returnFarm": null
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "populationTrend": 33,
    "farmActivity": null,
    "medical": 92,
    "school": 29,
    "returnFarm": null
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "populationTrend": 15,
    "farmActivity": null,
    "medical": 14,
    "school": 34,
    "returnFarm": null
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "populationTrend": 100,
    "farmActivity": null,
    "medical": 2,
    "school": 38,
    "returnFarm": null
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "populationTrend": 64,
    "farmActivity": 20,
    "medical": 3,
    "school": 46,
    "returnFarm": 23
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "populationTrend": 56,
    "farmActivity": 19,
    "medical": 38,
    "school": 46,
    "returnFarm": 19
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "populationTrend": 55,
    "farmActivity": 31,
    "medical": 19,
    "school": 52,
    "returnFarm": 32
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "populationTrend": 56,
    "farmActivity": 52,
    "medical": 15,
    "school": 60,
    "returnFarm": 43
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "populationTrend": 41,
    "farmActivity": 40,
    "medical": 50,
    "school": 58,
    "returnFarm": 42
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "populationTrend": 46,
    "farmActivity": 17,
    "medical": 16,
    "school": 42,
    "returnFarm": 13
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "populationTrend": 32,
    "farmActivity": 45,
    "medical": 46,
    "school": 59,
    "returnFarm": 50
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "populationTrend": 74,
    "farmActivity": 51,
    "medical": 52,
    "school": 62,
    "returnFarm": 70
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "populationTrend": 37,
    "farmActivity": 77,
    "medical": 61,
    "school": 75,
    "returnFarm": 72
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "populationTrend": 53,
    "farmActivity": 61,
    "medical": 66,
    "school": 66,
    "returnFarm": 55
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "populationTrend": 93,
    "farmActivity": 17,
    "medical": 21,
    "school": 30,
    "returnFarm": 14
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "populationTrend": 52,
    "farmActivity": null,
    "medical": 1,
    "school": null,
    "returnFarm": null
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "populationTrend": 42,
    "farmActivity": 94,
    "medical": 73,
    "school": 80,
    "returnFarm": 89
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "populationTrend": 39,
    "farmActivity": 100,
    "medical": 72,
    "school": 94,
    "returnFarm": 98
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "populationTrend": 17,
    "farmActivity": 89,
    "medical": 41,
    "school": 95,
    "returnFarm": 92
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "populationTrend": 19,
    "farmActivity": 58,
    "medical": 79,
    "school": 81,
    "returnFarm": 73
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "populationTrend": 53,
    "farmActivity": 89,
    "medical": 76,
    "school": 68,
    "returnFarm": 95
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "populationTrend": 15,
    "farmActivity": 70,
    "medical": 60,
    "school": 71,
    "returnFarm": 51
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "populationTrend": 59,
    "farmActivity": 73,
    "medical": 57,
    "school": 70,
    "returnFarm": 80
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "populationTrend": 26,
    "farmActivity": 30,
    "medical": 10,
    "school": 56,
    "returnFarm": 28
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "populationTrend": 100,
    "farmActivity": 76,
    "medical": 39,
    "school": 63,
    "returnFarm": 73
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "populationTrend": 22,
    "farmActivity": 95,
    "medical": 24,
    "school": 92,
    "returnFarm": 88
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "populationTrend": 37,
    "farmActivity": 47,
    "medical": 46,
    "school": 71,
    "returnFarm": 39
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "populationTrend": 33,
    "farmActivity": 33,
    "medical": 3,
    "school": 84,
    "returnFarm": 41
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "populationTrend": 49,
    "farmActivity": null,
    "medical": 36,
    "school": 35,
    "returnFarm": null
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "populationTrend": 64,
    "farmActivity": 24,
    "medical": 43,
    "school": 45,
    "returnFarm": 18
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "populationTrend": 24,
    "farmActivity": 18,
    "medical": 34,
    "school": 53,
    "returnFarm": 20
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "populationTrend": 49,
    "farmActivity": 33,
    "medical": 32,
    "school": 55,
    "returnFarm": 36
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "populationTrend": 76,
    "farmActivity": 9,
    "medical": 11,
    "school": 32,
    "returnFarm": 2
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "populationTrend": 53,
    "farmActivity": 52,
    "medical": 37,
    "school": 61,
    "returnFarm": 55
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "populationTrend": 24,
    "farmActivity": 14,
    "medical": 6,
    "school": 50,
    "returnFarm": 16
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "populationTrend": 82,
    "farmActivity": 3,
    "medical": 23,
    "school": 32,
    "returnFarm": 4
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "populationTrend": 32,
    "farmActivity": 80,
    "medical": 86,
    "school": 93,
    "returnFarm": 59
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "populationTrend": 16,
    "farmActivity": 49,
    "medical": 13,
    "school": 64,
    "returnFarm": 33
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "populationTrend": 25,
    "farmActivity": 67,
    "medical": 66,
    "school": 76,
    "returnFarm": 63
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "populationTrend": 22,
    "farmActivity": 65,
    "medical": 47,
    "school": 77,
    "returnFarm": 71
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "populationTrend": 32,
    "farmActivity": 80,
    "medical": 69,
    "school": 83,
    "returnFarm": 56
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "populationTrend": 13,
    "farmActivity": 86,
    "medical": 84,
    "school": 88,
    "returnFarm": 79
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "populationTrend": 41,
    "farmActivity": 85,
    "medical": 83,
    "school": 85,
    "returnFarm": 93
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "populationTrend": 32,
    "farmActivity": 83,
    "medical": 80,
    "school": 79,
    "returnFarm": 82
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "populationTrend": 52,
    "farmActivity": 68,
    "medical": 67,
    "school": 75,
    "returnFarm": 64
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "populationTrend": 24,
    "farmActivity": 92,
    "medical": 86,
    "school": 91,
    "returnFarm": 91
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "populationTrend": 84,
    "farmActivity": 22,
    "medical": 60,
    "school": 43,
    "returnFarm": 15
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "populationTrend": 89,
    "farmActivity": 39,
    "medical": 58,
    "school": 60,
    "returnFarm": 33
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
