/**
 * 인구 추이 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-population-trend.ts
 * 데이터 소스: 통계청 SGIS 인구통계 (1~2년 지연)
 * 수집 연도: 2018, 2019, 2020, 2021, 2022
 * 마지막 수집: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-population-trend.ts`
 *
 * 빌드 안정성을 위해 SGIS API population.json 시계열 호출은 빌드 시점에 하지 않고
 * 이 정적 폴백만 사용한다 (시도×연도 = 85회 호출이 빌드 폭증을 일으킴).
 */

export interface PopulationTrendPoint {
  /** SGIS 코드 (시도 2자리 또는 시군구 5자리) */
  sgisCode: string;
  /** 행정구역명 */
  name: string;
  /** 통계 연도 */
  year: number;
  /** 총 인구 */
  population: number;
  /** 총 세대수 */
  householdCount: number;
  /** 65세 이상 비율 (%) — 부양비 역산 */
  agingRate: number;
}

/** 수집 대상 연도 */
export const POPULATION_TREND_YEARS = [2018,2019,2020,2021,2022] as const;

/** 시군구 인구 시계열 (SGIS 5자리 × 연도) */
export const POPULATION_TREND_SIGUNGU: PopulationTrendPoint[] = [
  {
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2018,
    "population": 157967,
    "householdCount": 63773,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2018,
    "population": 129797,
    "householdCount": 53102,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2018,
    "population": 226931,
    "householdCount": 92497,
    "agingRate": 14.6
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2018,
    "population": 306796,
    "householdCount": 123963,
    "agingRate": 13.3
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2018,
    "population": 362304,
    "householdCount": 148735,
    "agingRate": 12.2
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2018,
    "population": 358141,
    "householdCount": 146974,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2018,
    "population": 391668,
    "householdCount": 159444,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2018,
    "population": 438734,
    "householdCount": 171943,
    "agingRate": 14.7
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2018,
    "population": 309138,
    "householdCount": 127551,
    "agingRate": 18
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2018,
    "population": 328243,
    "householdCount": 126286,
    "agingRate": 16.6
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2018,
    "population": 534092,
    "householdCount": 202325,
    "agingRate": 13.9
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2018,
    "population": 462552,
    "householdCount": 181338,
    "agingRate": 15.9
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2018,
    "population": 318874,
    "householdCount": 127197,
    "agingRate": 14.9
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2018,
    "population": 368188,
    "householdCount": 154943,
    "agingRate": 12.9
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2018,
    "population": 445591,
    "householdCount": 162039,
    "agingRate": 12.5
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2018,
    "population": 578539,
    "householdCount": 235754,
    "agingRate": 13.2
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2018,
    "population": 433765,
    "householdCount": 156235,
    "agingRate": 14.5
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2018,
    "population": 249344,
    "householdCount": 96298,
    "agingRate": 14.4
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2018,
    "population": 395286,
    "householdCount": 149831,
    "agingRate": 14
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2018,
    "population": 397980,
    "householdCount": 161495,
    "agingRate": 14.4
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2018,
    "population": 510303,
    "householdCount": 236761,
    "agingRate": 13.8
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2018,
    "population": 409491,
    "householdCount": 155418,
    "agingRate": 12.6
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2018,
    "population": 507810,
    "householdCount": 203083,
    "agingRate": 12.4
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2018,
    "population": 638167,
    "householdCount": 243547,
    "agingRate": 12.2
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2018,
    "population": 414231,
    "householdCount": 159233,
    "agingRate": 13.7
  },
  {
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2019,
    "population": 154969,
    "householdCount": 62652,
    "agingRate": 15.9
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2019,
    "population": 130957,
    "householdCount": 54496,
    "agingRate": 15.9
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2019,
    "population": 227174,
    "householdCount": 93174,
    "agingRate": 14.9
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2019,
    "population": 299688,
    "householdCount": 122770,
    "agingRate": 14
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2019,
    "population": 359766,
    "householdCount": 149905,
    "agingRate": 12.9
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2019,
    "population": 355094,
    "householdCount": 148349,
    "agingRate": 15.9
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2019,
    "population": 386331,
    "householdCount": 160776,
    "agingRate": 16.2
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2019,
    "population": 445327,
    "householdCount": 176729,
    "agingRate": 15.1
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2019,
    "population": 303871,
    "householdCount": 128012,
    "agingRate": 19
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2019,
    "population": 323543,
    "householdCount": 126831,
    "agingRate": 17.6
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2019,
    "population": 522480,
    "householdCount": 201458,
    "agingRate": 14.9
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2019,
    "population": 461530,
    "householdCount": 184890,
    "agingRate": 16.7
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2019,
    "population": 319394,
    "householdCount": 128635,
    "agingRate": 15.3
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2019,
    "population": 369334,
    "householdCount": 156888,
    "agingRate": 13.2
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2019,
    "population": 440354,
    "householdCount": 162867,
    "agingRate": 13.3
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2019,
    "population": 574097,
    "householdCount": 240135,
    "agingRate": 14.1
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2019,
    "population": 435560,
    "householdCount": 160378,
    "agingRate": 15.4
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2019,
    "population": 249747,
    "householdCount": 99315,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2019,
    "population": 394083,
    "householdCount": 153923,
    "agingRate": 14.6
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2019,
    "population": 400368,
    "householdCount": 164963,
    "agingRate": 14.9
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2019,
    "population": 507828,
    "householdCount": 242154,
    "agingRate": 14.4
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2019,
    "population": 404960,
    "householdCount": 155377,
    "agingRate": 13.2
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2019,
    "population": 509199,
    "householdCount": 206524,
    "agingRate": 13.1
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2019,
    "population": 648600,
    "householdCount": 252212,
    "agingRate": 12.9
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2019,
    "population": 415287,
    "householdCount": 162976,
    "agingRate": 14.6
  },
  {
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2020,
    "population": 151291,
    "householdCount": 63414,
    "agingRate": 16.8
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2020,
    "population": 128744,
    "householdCount": 55093,
    "agingRate": 16.9
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2020,
    "population": 225876,
    "householdCount": 95711,
    "agingRate": 15.4
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2020,
    "population": 291918,
    "householdCount": 122186,
    "agingRate": 14.8
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2020,
    "population": 353967,
    "householdCount": 152090,
    "agingRate": 13.8
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2020,
    "population": 351057,
    "householdCount": 150373,
    "agingRate": 16.7
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2020,
    "population": 385663,
    "householdCount": 164832,
    "agingRate": 17.2
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2020,
    "population": 438833,
    "householdCount": 179660,
    "agingRate": 16.1
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2020,
    "population": 299535,
    "householdCount": 129805,
    "agingRate": 20.2
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2020,
    "population": 315979,
    "householdCount": 127362,
    "agingRate": 19
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2020,
    "population": 511982,
    "householdCount": 202695,
    "agingRate": 16
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2020,
    "population": 463102,
    "householdCount": 190631,
    "agingRate": 17.5
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2020,
    "population": 317209,
    "householdCount": 133112,
    "agingRate": 16
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2020,
    "population": 365618,
    "householdCount": 160684,
    "agingRate": 13.8
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2020,
    "population": 439068,
    "householdCount": 166044,
    "agingRate": 14.3
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2020,
    "population": 564854,
    "householdCount": 244097,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2020,
    "population": 435442,
    "householdCount": 164083,
    "agingRate": 16.5
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2020,
    "population": 249419,
    "householdCount": 103432,
    "agingRate": 16.2
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2020,
    "population": 403619,
    "householdCount": 162391,
    "agingRate": 15.3
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2020,
    "population": 392772,
    "householdCount": 167766,
    "agingRate": 15.9
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2020,
    "population": 502641,
    "householdCount": 248959,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2020,
    "population": 401749,
    "householdCount": 156123,
    "agingRate": 14
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2020,
    "population": 508135,
    "householdCount": 208833,
    "agingRate": 13.9
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2020,
    "population": 643288,
    "householdCount": 255766,
    "agingRate": 13.9
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2020,
    "population": 444434,
    "householdCount": 177148,
    "agingRate": 15.2
  },
  {
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2021,
    "population": 148857,
    "householdCount": 63984,
    "agingRate": 17.4
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2021,
    "population": 126310,
    "householdCount": 56116,
    "agingRate": 17.9
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2021,
    "population": 221681,
    "householdCount": 96986,
    "agingRate": 16.1
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2021,
    "population": 286469,
    "householdCount": 122756,
    "agingRate": 15.7
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2021,
    "population": 347099,
    "householdCount": 153962,
    "agingRate": 14.5
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2021,
    "population": 348201,
    "householdCount": 153246,
    "agingRate": 17.4
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2021,
    "population": 380307,
    "householdCount": 167260,
    "agingRate": 18.3
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2021,
    "population": 435509,
    "householdCount": 181827,
    "agingRate": 16.7
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2021,
    "population": 292611,
    "householdCount": 130329,
    "agingRate": 21.4
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2021,
    "population": 309200,
    "householdCount": 128439,
    "agingRate": 20.2
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2021,
    "population": 503929,
    "householdCount": 204282,
    "agingRate": 17
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2021,
    "population": 457385,
    "householdCount": 193626,
    "agingRate": 18.5
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2021,
    "population": 314547,
    "householdCount": 134544,
    "agingRate": 16.5
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2021,
    "population": 365199,
    "householdCount": 164083,
    "agingRate": 14.3
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2021,
    "population": 433373,
    "householdCount": 168355,
    "agingRate": 15.4
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2021,
    "population": 559837,
    "householdCount": 249984,
    "agingRate": 16.1
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2021,
    "population": 426220,
    "householdCount": 166197,
    "agingRate": 17.6
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2021,
    "population": 247398,
    "householdCount": 107430,
    "agingRate": 17.1
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2021,
    "population": 402984,
    "householdCount": 168518,
    "agingRate": 16
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2021,
    "population": 388094,
    "householdCount": 170333,
    "agingRate": 16.7
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2021,
    "population": 495777,
    "householdCount": 252619,
    "agingRate": 16
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2021,
    "population": 392302,
    "householdCount": 155936,
    "agingRate": 14.8
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2021,
    "population": 503019,
    "householdCount": 211168,
    "agingRate": 14.9
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2021,
    "population": 634720,
    "householdCount": 259378,
    "agingRate": 14.9
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2021,
    "population": 451099,
    "householdCount": 185441,
    "agingRate": 16.1
  },
  {
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2022,
    "population": 147512,
    "householdCount": 64422,
    "agingRate": 18
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2022,
    "population": 125257,
    "householdCount": 56260,
    "agingRate": 18.9
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2022,
    "population": 219282,
    "householdCount": 98480,
    "agingRate": 16.8
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2022,
    "population": 282131,
    "householdCount": 122873,
    "agingRate": 16.6
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2022,
    "population": 346519,
    "householdCount": 156463,
    "agingRate": 15.5
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2022,
    "population": 350709,
    "householdCount": 155912,
    "agingRate": 17.9
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2022,
    "population": 379127,
    "householdCount": 170544,
    "agingRate": 19.4
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2022,
    "population": 436113,
    "householdCount": 183972,
    "agingRate": 17.3
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2022,
    "population": 287788,
    "householdCount": 131275,
    "agingRate": 22.5
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2022,
    "population": 304137,
    "householdCount": 128975,
    "agingRate": 21.6
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2022,
    "population": 496423,
    "householdCount": 205078,
    "agingRate": 18.1
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2022,
    "population": 454649,
    "householdCount": 196206,
    "agingRate": 19.3
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2022,
    "population": 318308,
    "householdCount": 136043,
    "agingRate": 17
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2022,
    "population": 362415,
    "householdCount": 165606,
    "agingRate": 14.8
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2022,
    "population": 426981,
    "householdCount": 169344,
    "agingRate": 16.5
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2022,
    "population": 555999,
    "householdCount": 254540,
    "agingRate": 17.1
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2022,
    "population": 424038,
    "householdCount": 169228,
    "agingRate": 18.5
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2022,
    "population": 247185,
    "householdCount": 110689,
    "agingRate": 18
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2022,
    "population": 401805,
    "householdCount": 172104,
    "agingRate": 16.8
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2022,
    "population": 386605,
    "householdCount": 172696,
    "agingRate": 17.4
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2022,
    "population": 496743,
    "householdCount": 260075,
    "agingRate": 16.5
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2022,
    "population": 383181,
    "householdCount": 154471,
    "agingRate": 15.7
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2022,
    "population": 500149,
    "householdCount": 212499,
    "agingRate": 15.8
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2022,
    "population": 635758,
    "householdCount": 263448,
    "agingRate": 15.9
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2022,
    "population": 448655,
    "householdCount": 187615,
    "agingRate": 17.3
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "year": 2018,
    "population": 119514,
    "householdCount": 48828,
    "agingRate": 14.1
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "year": 2018,
    "population": 65185,
    "householdCount": 25737,
    "agingRate": 19.7
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2018,
    "population": 349963,
    "householdCount": 120190,
    "agingRate": 8.7
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2018,
    "population": 537389,
    "householdCount": 201623,
    "agingRate": 11.6
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2018,
    "population": 525014,
    "householdCount": 195852,
    "agingRate": 12.5
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2018,
    "population": 307598,
    "householdCount": 114050,
    "agingRate": 10.7
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "year": 2018,
    "population": 532713,
    "householdCount": 189779,
    "agingRate": 9.3
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2018,
    "population": 415102,
    "householdCount": 162813,
    "agingRate": 14.9
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2018,
    "population": 64432,
    "householdCount": 26728,
    "agingRate": 30.9
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2018,
    "population": 19207,
    "householdCount": 9149,
    "agingRate": 23.5
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "year": 2019,
    "population": 131863,
    "householdCount": 55660,
    "agingRate": 14
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "year": 2019,
    "population": 63003,
    "householdCount": 25183,
    "agingRate": 21
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2019,
    "population": 374413,
    "householdCount": 130428,
    "agingRate": 9
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2019,
    "population": 533119,
    "householdCount": 203704,
    "agingRate": 12.4
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2019,
    "population": 514385,
    "householdCount": 194930,
    "agingRate": 13.4
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2019,
    "population": 298912,
    "householdCount": 112858,
    "agingRate": 11.7
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "year": 2019,
    "population": 540655,
    "householdCount": 195663,
    "agingRate": 9.9
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2019,
    "population": 411612,
    "householdCount": 166240,
    "agingRate": 15.6
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2019,
    "population": 65235,
    "householdCount": 27048,
    "agingRate": 31.7
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2019,
    "population": 19040,
    "householdCount": 8862,
    "agingRate": 24.7
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "year": 2020,
    "population": 138586,
    "householdCount": 59494,
    "agingRate": 14.5
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "year": 2020,
    "population": 61285,
    "householdCount": 25234,
    "agingRate": 22.5
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2020,
    "population": 390260,
    "householdCount": 141117,
    "agingRate": 9.4
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2020,
    "population": 528927,
    "householdCount": 207421,
    "agingRate": 13.5
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2020,
    "population": 500812,
    "householdCount": 193963,
    "agingRate": 14.6
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2020,
    "population": 292852,
    "householdCount": 113632,
    "agingRate": 12.9
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "year": 2020,
    "population": 541534,
    "householdCount": 200854,
    "agingRate": 10.6
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2020,
    "population": 405886,
    "householdCount": 168908,
    "agingRate": 16.8
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2020,
    "population": 66020,
    "householdCount": 27827,
    "agingRate": 33.1
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2020,
    "population": 19292,
    "householdCount": 8750,
    "agingRate": 26.5
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "year": 2021,
    "population": 141758,
    "householdCount": 62254,
    "agingRate": 15
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "year": 2021,
    "population": 61053,
    "householdCount": 25984,
    "agingRate": 23.6
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2021,
    "population": 399594,
    "householdCount": 146830,
    "agingRate": 10.2
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2021,
    "population": 521165,
    "householdCount": 210772,
    "agingRate": 14.6
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2021,
    "population": 494641,
    "householdCount": 197396,
    "agingRate": 15.5
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2021,
    "population": 290967,
    "householdCount": 116818,
    "agingRate": 14
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "year": 2021,
    "population": 551026,
    "householdCount": 210245,
    "agingRate": 11.4
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2021,
    "population": 412022,
    "householdCount": 175389,
    "agingRate": 17.5
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2021,
    "population": 65834,
    "householdCount": 28616,
    "agingRate": 34.4
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2021,
    "population": 18984,
    "householdCount": 9306,
    "agingRate": 28
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "year": 2022,
    "population": 150670,
    "householdCount": 67034,
    "agingRate": 15.3
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "year": 2022,
    "population": 58078,
    "householdCount": 25069,
    "agingRate": 24.7
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2022,
    "population": 400488,
    "householdCount": 145258,
    "agingRate": 11
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2022,
    "population": 511392,
    "householdCount": 210750,
    "agingRate": 15.7
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2022,
    "population": 498254,
    "householdCount": 202792,
    "agingRate": 16.5
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2022,
    "population": 288122,
    "householdCount": 117769,
    "agingRate": 15.2
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "year": 2022,
    "population": 581069,
    "householdCount": 225749,
    "agingRate": 11.8
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2022,
    "population": 415303,
    "householdCount": 179308,
    "agingRate": 18.2
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2022,
    "population": 66420,
    "householdCount": 29259,
    "agingRate": 35.2
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2022,
    "population": 19329,
    "householdCount": 9743,
    "agingRate": 29
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2018,
    "population": 288719,
    "householdCount": 103605,
    "agingRate": 11.4
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2018,
    "population": 379845,
    "householdCount": 141227,
    "agingRate": 9.5
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2018,
    "population": 194288,
    "householdCount": 75216,
    "agingRate": 13
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2018,
    "population": 357697,
    "householdCount": 131449,
    "agingRate": 6.3
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2018,
    "population": 240405,
    "householdCount": 96967,
    "agingRate": 13.8
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2018,
    "population": 221034,
    "householdCount": 88527,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2018,
    "population": 469954,
    "householdCount": 173828,
    "agingRate": 11.5
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2018,
    "population": 432286,
    "householdCount": 164439,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2018,
    "population": 251818,
    "householdCount": 93094,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2018,
    "population": 314756,
    "householdCount": 111890,
    "agingRate": 10.3
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2018,
    "population": 428218,
    "householdCount": 157585,
    "agingRate": 10.7
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2018,
    "population": 245437,
    "householdCount": 88436,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2018,
    "population": 175101,
    "householdCount": 65847,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2018,
    "population": 323460,
    "householdCount": 117086,
    "agingRate": 12.1
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2018,
    "population": 504485,
    "householdCount": 187813,
    "agingRate": 11.1
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2018,
    "population": 97535,
    "householdCount": 37226,
    "agingRate": 18.2
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2018,
    "population": 367063,
    "householdCount": 137013,
    "agingRate": 9.8
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2018,
    "population": 353042,
    "householdCount": 114405,
    "agingRate": 8.4
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2018,
    "population": 436865,
    "householdCount": 164489,
    "agingRate": 13.4
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2018,
    "population": 287473,
    "householdCount": 107411,
    "agingRate": 11.6
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2018,
    "population": 282654,
    "householdCount": 98208,
    "agingRate": 11.5
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2018,
    "population": 53740,
    "householdCount": 18678,
    "agingRate": 13.5
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2018,
    "population": 195872,
    "householdCount": 71875,
    "agingRate": 11.8
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2018,
    "population": 661866,
    "householdCount": 232836,
    "agingRate": 12.9
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2018,
    "population": 228059,
    "householdCount": 83469,
    "agingRate": 8.3
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2018,
    "population": 480201,
    "householdCount": 165423,
    "agingRate": 8.1
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2018,
    "population": 276860,
    "householdCount": 98728,
    "agingRate": 11.5
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2018,
    "population": 149599,
    "householdCount": 53682,
    "agingRate": 12.6
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2018,
    "population": 238592,
    "householdCount": 89479,
    "agingRate": 12
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2018,
    "population": 259524,
    "householdCount": 92279,
    "agingRate": 12.4
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2018,
    "population": 421515,
    "householdCount": 144809,
    "agingRate": 11.7
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2018,
    "population": 344019,
    "householdCount": 118537,
    "agingRate": 12.5
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2018,
    "population": 447906,
    "householdCount": 159143,
    "agingRate": 12.6
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2018,
    "population": 220599,
    "householdCount": 78535,
    "agingRate": 12.4
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2018,
    "population": 201135,
    "householdCount": 72418,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2018,
    "population": 424865,
    "householdCount": 147297,
    "agingRate": 11.1
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2018,
    "population": 776657,
    "householdCount": 271029,
    "agingRate": 8
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2018,
    "population": 364178,
    "householdCount": 131002,
    "agingRate": 11.4
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2018,
    "population": 217776,
    "householdCount": 77928,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2018,
    "population": 161564,
    "householdCount": 58539,
    "agingRate": 15.7
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2018,
    "population": 112096,
    "householdCount": 42310,
    "agingRate": 19
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2018,
    "population": 43383,
    "householdCount": 18089,
    "agingRate": 23.5
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2018,
    "population": 59957,
    "householdCount": 24724,
    "agingRate": 23
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2018,
    "population": 111094,
    "householdCount": 44928,
    "agingRate": 23
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2019,
    "population": 282288,
    "householdCount": 103478,
    "agingRate": 12.1
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2019,
    "population": 374771,
    "householdCount": 141422,
    "agingRate": 10.3
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2019,
    "population": 189051,
    "householdCount": 74469,
    "agingRate": 13.8
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2019,
    "population": 369409,
    "householdCount": 138288,
    "agingRate": 6.7
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2019,
    "population": 241256,
    "householdCount": 98955,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2019,
    "population": 216005,
    "householdCount": 88878,
    "agingRate": 14.5
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2019,
    "population": 462634,
    "householdCount": 173580,
    "agingRate": 12.1
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2019,
    "population": 440357,
    "householdCount": 170040,
    "agingRate": 14.5
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2019,
    "population": 246200,
    "householdCount": 92620,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2019,
    "population": 311139,
    "householdCount": 113075,
    "agingRate": 11.1
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2019,
    "population": 422301,
    "householdCount": 157785,
    "agingRate": 11.6
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2019,
    "population": 243473,
    "householdCount": 88599,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2019,
    "population": 170977,
    "householdCount": 65526,
    "agingRate": 13.1
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2019,
    "population": 313462,
    "householdCount": 115414,
    "agingRate": 12.9
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2019,
    "population": 521172,
    "householdCount": 197997,
    "agingRate": 11.4
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2019,
    "population": 96541,
    "householdCount": 37297,
    "agingRate": 19.1
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2019,
    "population": 356620,
    "householdCount": 134952,
    "agingRate": 10.6
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2019,
    "population": 358030,
    "householdCount": 118188,
    "agingRate": 8.9
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2019,
    "population": 448571,
    "householdCount": 172880,
    "agingRate": 13.9
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2019,
    "population": 287041,
    "householdCount": 109198,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2019,
    "population": 289033,
    "householdCount": 102943,
    "agingRate": 12.1
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2019,
    "population": 53830,
    "householdCount": 18901,
    "agingRate": 14
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2019,
    "population": 192270,
    "householdCount": 71974,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2019,
    "population": 681077,
    "householdCount": 243802,
    "agingRate": 13.5
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2019,
    "population": 233998,
    "householdCount": 87151,
    "agingRate": 8.9
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2019,
    "population": 508749,
    "householdCount": 178734,
    "agingRate": 8.4
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2019,
    "population": 275154,
    "householdCount": 100586,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2019,
    "population": 155826,
    "householdCount": 57061,
    "agingRate": 13.1
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2019,
    "population": 260544,
    "householdCount": 101231,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2019,
    "population": 266647,
    "householdCount": 95858,
    "agingRate": 12.9
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2019,
    "population": 434075,
    "householdCount": 151111,
    "agingRate": 12.2
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2019,
    "population": 351807,
    "householdCount": 124783,
    "agingRate": 12.9
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2019,
    "population": 454328,
    "householdCount": 164306,
    "agingRate": 13
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2019,
    "population": 222995,
    "householdCount": 80367,
    "agingRate": 12.8
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2019,
    "population": 202284,
    "householdCount": 74066,
    "agingRate": 15.3
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2019,
    "population": 442910,
    "householdCount": 156040,
    "agingRate": 11.5
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2019,
    "population": 838102,
    "householdCount": 298091,
    "agingRate": 8.1
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2019,
    "population": 375238,
    "householdCount": 136730,
    "agingRate": 12.1
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2019,
    "population": 224684,
    "householdCount": 81582,
    "agingRate": 15.1
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2019,
    "population": 159871,
    "householdCount": 58273,
    "agingRate": 16.6
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2019,
    "population": 111981,
    "householdCount": 42903,
    "agingRate": 19.9
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2019,
    "population": 42540,
    "householdCount": 17681,
    "agingRate": 24.5
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2019,
    "population": 59823,
    "householdCount": 24950,
    "agingRate": 24
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2019,
    "population": 111836,
    "householdCount": 45895,
    "agingRate": 24.2
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2020,
    "population": 278507,
    "householdCount": 104418,
    "agingRate": 13.3
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2020,
    "population": 373381,
    "householdCount": 143231,
    "agingRate": 11.1
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2020,
    "population": 187922,
    "householdCount": 76086,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2020,
    "population": 370340,
    "householdCount": 142354,
    "agingRate": 7.2
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2020,
    "population": 249044,
    "householdCount": 104775,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2020,
    "population": 211880,
    "householdCount": 89721,
    "agingRate": 15.6
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2020,
    "population": 461101,
    "householdCount": 175089,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2020,
    "population": 449572,
    "householdCount": 178067,
    "agingRate": 15.3
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2020,
    "population": 240986,
    "householdCount": 92486,
    "agingRate": 15.9
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2020,
    "population": 301350,
    "householdCount": 110955,
    "agingRate": 12
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2020,
    "population": 421012,
    "householdCount": 160114,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2020,
    "population": 244819,
    "householdCount": 90163,
    "agingRate": 14.8
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2020,
    "population": 167317,
    "householdCount": 65419,
    "agingRate": 14.4
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2020,
    "population": 298116,
    "householdCount": 111383,
    "agingRate": 13.9
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2020,
    "population": 542522,
    "householdCount": 213185,
    "agingRate": 11.7
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2020,
    "population": 95239,
    "householdCount": 37936,
    "agingRate": 20.6
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2020,
    "population": 359979,
    "householdCount": 139191,
    "agingRate": 11.1
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2020,
    "population": 357366,
    "householdCount": 121407,
    "agingRate": 9.8
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2020,
    "population": 460881,
    "householdCount": 180981,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2020,
    "population": 292616,
    "householdCount": 112376,
    "agingRate": 13.4
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2020,
    "population": 292000,
    "householdCount": 105507,
    "agingRate": 12.8
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2020,
    "population": 58018,
    "householdCount": 20504,
    "agingRate": 14.1
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2020,
    "population": 192051,
    "householdCount": 73253,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2020,
    "population": 696033,
    "householdCount": 252977,
    "agingRate": 14.2
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2020,
    "population": 240645,
    "householdCount": 91909,
    "agingRate": 9.5
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2020,
    "population": 535147,
    "householdCount": 192833,
    "agingRate": 9.1
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2020,
    "population": 275571,
    "householdCount": 103186,
    "agingRate": 13.3
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2020,
    "population": 160230,
    "householdCount": 59444,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2020,
    "population": 279795,
    "householdCount": 112462,
    "agingRate": 12.8
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2020,
    "population": 268242,
    "householdCount": 100342,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2020,
    "population": 434871,
    "householdCount": 157399,
    "agingRate": 13.2
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2020,
    "population": 363862,
    "householdCount": 129188,
    "agingRate": 13.2
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2020,
    "population": 460541,
    "householdCount": 170924,
    "agingRate": 13.8
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2020,
    "population": 226212,
    "householdCount": 83415,
    "agingRate": 13.4
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2020,
    "population": 203030,
    "householdCount": 77368,
    "agingRate": 16.2
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2020,
    "population": 474546,
    "householdCount": 171854,
    "agingRate": 11.9
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2020,
    "population": 880859,
    "householdCount": 321871,
    "agingRate": 8.4
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2020,
    "population": 385141,
    "householdCount": 143039,
    "agingRate": 13
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2020,
    "population": 233286,
    "householdCount": 86650,
    "agingRate": 15.9
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2020,
    "population": 157939,
    "householdCount": 59525,
    "agingRate": 17.9
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2020,
    "population": 113352,
    "householdCount": 44234,
    "agingRate": 21.2
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2020,
    "population": 42278,
    "householdCount": 18014,
    "agingRate": 25.8
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2020,
    "population": 60233,
    "householdCount": 25652,
    "agingRate": 25.2
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2020,
    "population": 113844,
    "householdCount": 47544,
    "agingRate": 25.5
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2021,
    "population": 277786,
    "householdCount": 107638,
    "agingRate": 13.9
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2021,
    "population": 368924,
    "householdCount": 145846,
    "agingRate": 11.9
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2021,
    "population": 195418,
    "householdCount": 82531,
    "agingRate": 15.1
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2021,
    "population": 366209,
    "householdCount": 144551,
    "agingRate": 7.9
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2021,
    "population": 244058,
    "householdCount": 105013,
    "agingRate": 16.3
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2021,
    "population": 209170,
    "householdCount": 91134,
    "agingRate": 16.6
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2021,
    "population": 460254,
    "householdCount": 178933,
    "agingRate": 13.4
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2021,
    "population": 455454,
    "householdCount": 185533,
    "agingRate": 16.1
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2021,
    "population": 240501,
    "householdCount": 95136,
    "agingRate": 16.8
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2021,
    "population": 298428,
    "householdCount": 113148,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2021,
    "population": 414997,
    "householdCount": 161792,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2021,
    "population": 243011,
    "householdCount": 90988,
    "agingRate": 15.9
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2021,
    "population": 164627,
    "householdCount": 66188,
    "agingRate": 15.5
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2021,
    "population": 290345,
    "householdCount": 110678,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2021,
    "population": 571838,
    "householdCount": 232252,
    "agingRate": 12
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2021,
    "population": 94912,
    "householdCount": 39259,
    "agingRate": 21.3
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2021,
    "population": 364309,
    "householdCount": 143399,
    "agingRate": 11.8
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2021,
    "population": 354075,
    "householdCount": 124084,
    "agingRate": 10.7
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2021,
    "population": 468756,
    "householdCount": 188951,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2021,
    "population": 293014,
    "householdCount": 115977,
    "agingRate": 14.1
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2021,
    "population": 287743,
    "householdCount": 106209,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2021,
    "population": 65880,
    "householdCount": 23761,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2021,
    "population": 187798,
    "householdCount": 73348,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2021,
    "population": 713549,
    "householdCount": 266223,
    "agingRate": 15
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2021,
    "population": 242297,
    "householdCount": 95384,
    "agingRate": 10.2
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2021,
    "population": 554074,
    "householdCount": 204432,
    "agingRate": 9.7
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2021,
    "population": 270443,
    "householdCount": 104422,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2021,
    "population": 160115,
    "householdCount": 60830,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2021,
    "population": 305470,
    "householdCount": 124008,
    "agingRate": 13.2
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2021,
    "population": 268115,
    "householdCount": 103351,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2021,
    "population": 435708,
    "householdCount": 160839,
    "agingRate": 14
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2021,
    "population": 363524,
    "householdCount": 131922,
    "agingRate": 13.8
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2021,
    "population": 475212,
    "householdCount": 181689,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2021,
    "population": 229321,
    "householdCount": 87231,
    "agingRate": 14.1
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2021,
    "population": 203897,
    "householdCount": 80301,
    "agingRate": 17
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2021,
    "population": 491572,
    "householdCount": 182709,
    "agingRate": 12.4
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2021,
    "population": 906381,
    "householdCount": 341432,
    "agingRate": 8.9
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2021,
    "population": 387700,
    "householdCount": 147829,
    "agingRate": 14
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2021,
    "population": 239800,
    "householdCount": 90836,
    "agingRate": 16.8
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2021,
    "population": 157602,
    "householdCount": 61505,
    "agingRate": 19.1
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2021,
    "population": 113270,
    "householdCount": 45571,
    "agingRate": 22.3
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2021,
    "population": 41642,
    "householdCount": 18342,
    "agingRate": 27.2
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2021,
    "population": 59714,
    "householdCount": 26221,
    "agingRate": 26.7
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2021,
    "population": 115616,
    "householdCount": 49236,
    "agingRate": 26.7
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2022,
    "population": 276081,
    "householdCount": 109192,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2022,
    "population": 371343,
    "householdCount": 150221,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2022,
    "population": 205106,
    "householdCount": 87352,
    "agingRate": 15.5
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2022,
    "population": 363819,
    "householdCount": 145286,
    "agingRate": 8.4
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2022,
    "population": 242193,
    "householdCount": 105193,
    "agingRate": 17.3
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2022,
    "population": 203409,
    "householdCount": 89857,
    "agingRate": 17.7
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2022,
    "population": 459088,
    "householdCount": 181129,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2022,
    "population": 455128,
    "householdCount": 189934,
    "agingRate": 16.9
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2022,
    "population": 236296,
    "householdCount": 95126,
    "agingRate": 18
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2022,
    "population": 304493,
    "householdCount": 117896,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2022,
    "population": 411286,
    "householdCount": 162683,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2022,
    "population": 238572,
    "householdCount": 90108,
    "agingRate": 17.2
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2022,
    "population": 160284,
    "householdCount": 65770,
    "agingRate": 16.7
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2022,
    "population": 284031,
    "householdCount": 109959,
    "agingRate": 15.8
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2022,
    "population": 590205,
    "householdCount": 244548,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2022,
    "population": 94142,
    "householdCount": 39645,
    "agingRate": 22
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2022,
    "population": 362147,
    "householdCount": 144031,
    "agingRate": 12.7
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2022,
    "population": 352941,
    "householdCount": 124578,
    "agingRate": 11.6
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2022,
    "population": 473370,
    "householdCount": 196261,
    "agingRate": 16.2
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2022,
    "population": 290321,
    "householdCount": 117248,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2022,
    "population": 280551,
    "householdCount": 105987,
    "agingRate": 14.8
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2022,
    "population": 73406,
    "householdCount": 26753,
    "agingRate": 14.5
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2022,
    "population": 184114,
    "householdCount": 73755,
    "agingRate": 15.7
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2022,
    "population": 719886,
    "householdCount": 274943,
    "agingRate": 15.8
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2022,
    "population": 242596,
    "householdCount": 96992,
    "agingRate": 11
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2022,
    "population": 557663,
    "householdCount": 207794,
    "agingRate": 10.4
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2022,
    "population": 267750,
    "householdCount": 105957,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2022,
    "population": 157318,
    "householdCount": 60598,
    "agingRate": 15.8
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2022,
    "population": 315203,
    "householdCount": 128198,
    "agingRate": 13.9
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2022,
    "population": 268863,
    "householdCount": 105181,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2022,
    "population": 431163,
    "householdCount": 162281,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2022,
    "population": 364474,
    "householdCount": 133838,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2022,
    "population": 490765,
    "householdCount": 189856,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2022,
    "population": 227193,
    "householdCount": 88663,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2022,
    "population": 208619,
    "householdCount": 82267,
    "agingRate": 17.4
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2022,
    "population": 491249,
    "householdCount": 185175,
    "agingRate": 13.4
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2022,
    "population": 931472,
    "householdCount": 356542,
    "agingRate": 9.4
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2022,
    "population": 392926,
    "householdCount": 152615,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2022,
    "population": 242995,
    "householdCount": 93648,
    "agingRate": 17.5
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2022,
    "population": 163542,
    "householdCount": 67222,
    "agingRate": 19.4
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2022,
    "population": 113831,
    "householdCount": 46944,
    "agingRate": 23.3
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2022,
    "population": 41288,
    "householdCount": 18427,
    "agingRate": 28.5
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2022,
    "population": 59755,
    "householdCount": 26772,
    "agingRate": 28
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2022,
    "population": 116950,
    "householdCount": 50538,
    "agingRate": 27.9
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2018,
    "population": 284985,
    "householdCount": 112917,
    "agingRate": 15.7
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2018,
    "population": 344168,
    "householdCount": 137823,
    "agingRate": 13.5
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2018,
    "population": 215528,
    "householdCount": 90664,
    "agingRate": 18.7
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2018,
    "population": 87830,
    "householdCount": 35984,
    "agingRate": 18.4
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2018,
    "population": 43488,
    "householdCount": 18663,
    "agingRate": 21.9
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2018,
    "population": 78312,
    "householdCount": 33623,
    "agingRate": 17.4
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2018,
    "population": 67881,
    "householdCount": 29470,
    "agingRate": 21.9
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2018,
    "population": 67177,
    "householdCount": 28314,
    "agingRate": 23.5
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2018,
    "population": 44116,
    "householdCount": 18612,
    "agingRate": 26.6
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2018,
    "population": 36762,
    "householdCount": 16642,
    "agingRate": 27.3
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2018,
    "population": 40025,
    "householdCount": 17612,
    "agingRate": 25.2
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2018,
    "population": 35580,
    "householdCount": 15539,
    "agingRate": 24.8
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2018,
    "population": 44346,
    "householdCount": 17064,
    "agingRate": 20.3
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2018,
    "population": 23950,
    "householdCount": 10169,
    "agingRate": 20.3
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2018,
    "population": 22101,
    "householdCount": 9076,
    "agingRate": 18.6
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2018,
    "population": 30373,
    "householdCount": 12768,
    "agingRate": 19
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2018,
    "population": 28127,
    "householdCount": 12031,
    "agingRate": 24.9
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2018,
    "population": 25642,
    "householdCount": 11513,
    "agingRate": 28.4
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2019,
    "population": 284753,
    "householdCount": 113550,
    "agingRate": 16.4
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2019,
    "population": 349319,
    "householdCount": 142352,
    "agingRate": 14.1
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2019,
    "population": 216357,
    "householdCount": 92093,
    "agingRate": 19.4
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2019,
    "population": 86780,
    "householdCount": 36214,
    "agingRate": 19.4
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2019,
    "population": 42474,
    "householdCount": 18536,
    "agingRate": 23.2
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2019,
    "population": 78643,
    "householdCount": 34213,
    "agingRate": 18.4
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2019,
    "population": 67210,
    "householdCount": 29361,
    "agingRate": 22.7
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2019,
    "population": 66634,
    "householdCount": 28356,
    "agingRate": 24.6
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2019,
    "population": 44431,
    "householdCount": 18912,
    "agingRate": 27.6
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2019,
    "population": 36332,
    "householdCount": 16608,
    "agingRate": 28.5
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2019,
    "population": 39657,
    "householdCount": 17758,
    "agingRate": 26.7
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2019,
    "population": 35255,
    "householdCount": 15595,
    "agingRate": 25.7
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2019,
    "population": 43520,
    "householdCount": 16770,
    "agingRate": 21.4
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2019,
    "population": 23425,
    "householdCount": 9713,
    "agingRate": 21.4
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2019,
    "population": 21780,
    "householdCount": 8519,
    "agingRate": 19.7
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2019,
    "population": 30133,
    "householdCount": 12326,
    "agingRate": 19.6
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2019,
    "population": 27144,
    "householdCount": 11132,
    "agingRate": 26.6
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2019,
    "population": 26280,
    "householdCount": 11934,
    "agingRate": 29.1
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2020,
    "population": 284645,
    "householdCount": 118030,
    "agingRate": 17.4
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2020,
    "population": 352429,
    "householdCount": 150242,
    "agingRate": 14.9
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2020,
    "population": 216542,
    "householdCount": 98032,
    "agingRate": 20.4
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2020,
    "population": 87801,
    "householdCount": 37427,
    "agingRate": 20.4
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2020,
    "population": 41494,
    "householdCount": 18586,
    "agingRate": 24.6
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2020,
    "population": 80054,
    "householdCount": 35551,
    "agingRate": 19.4
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2020,
    "population": 65939,
    "householdCount": 30764,
    "agingRate": 23.9
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2020,
    "population": 66587,
    "householdCount": 29207,
    "agingRate": 26.1
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2020,
    "population": 44649,
    "householdCount": 19524,
    "agingRate": 29
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2020,
    "population": 36282,
    "householdCount": 17069,
    "agingRate": 29.7
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2020,
    "population": 39258,
    "householdCount": 18305,
    "agingRate": 28.5
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2020,
    "population": 34524,
    "householdCount": 16275,
    "agingRate": 27.6
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2020,
    "population": 43042,
    "householdCount": 16968,
    "agingRate": 22.6
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2020,
    "population": 23733,
    "householdCount": 9899,
    "agingRate": 22.2
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2020,
    "population": 21317,
    "householdCount": 8521,
    "agingRate": 20.9
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2020,
    "population": 30147,
    "householdCount": 12592,
    "agingRate": 20.7
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2020,
    "population": 26572,
    "householdCount": 11723,
    "agingRate": 28.5
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2020,
    "population": 26748,
    "householdCount": 12324,
    "agingRate": 30
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2021,
    "population": 287104,
    "householdCount": 121827,
    "agingRate": 18.2
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2021,
    "population": 357224,
    "householdCount": 155108,
    "agingRate": 15.8
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2021,
    "population": 216560,
    "householdCount": 99105,
    "agingRate": 21.4
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2021,
    "population": 87264,
    "householdCount": 38396,
    "agingRate": 21.5
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2021,
    "population": 40395,
    "householdCount": 18723,
    "agingRate": 26.2
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2021,
    "population": 80362,
    "householdCount": 36656,
    "agingRate": 20.4
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2021,
    "population": 64464,
    "householdCount": 29554,
    "agingRate": 25.2
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2021,
    "population": 65658,
    "householdCount": 29649,
    "agingRate": 27.9
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2021,
    "population": 44712,
    "householdCount": 19910,
    "agingRate": 30.5
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2021,
    "population": 35728,
    "householdCount": 17190,
    "agingRate": 31.3
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2021,
    "population": 38613,
    "householdCount": 18519,
    "agingRate": 30.2
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2021,
    "population": 33786,
    "householdCount": 16272,
    "agingRate": 29.1
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2021,
    "population": 41855,
    "householdCount": 17093,
    "agingRate": 23.6
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2021,
    "population": 23092,
    "householdCount": 10005,
    "agingRate": 23.5
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2021,
    "population": 21121,
    "householdCount": 8733,
    "agingRate": 22.1
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2021,
    "population": 30670,
    "householdCount": 13345,
    "agingRate": 21.4
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2021,
    "population": 26650,
    "householdCount": 11992,
    "agingRate": 29.3
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2021,
    "population": 26632,
    "householdCount": 12651,
    "agingRate": 31.3
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2022,
    "population": 293124,
    "householdCount": 126016,
    "agingRate": 18.8
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2022,
    "population": 361810,
    "householdCount": 159208,
    "agingRate": 16.6
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2022,
    "population": 215128,
    "householdCount": 97663,
    "agingRate": 22.6
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2022,
    "population": 86772,
    "householdCount": 39024,
    "agingRate": 22.6
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2022,
    "population": 39113,
    "householdCount": 18543,
    "agingRate": 27.9
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2022,
    "population": 80903,
    "householdCount": 37502,
    "agingRate": 21.4
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2022,
    "population": 64289,
    "householdCount": 29676,
    "agingRate": 26.3
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2022,
    "population": 65215,
    "householdCount": 30034,
    "agingRate": 29.8
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2022,
    "population": 44864,
    "householdCount": 20247,
    "agingRate": 32
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2022,
    "population": 35654,
    "householdCount": 17555,
    "agingRate": 32.6
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2022,
    "population": 38699,
    "householdCount": 18704,
    "agingRate": 31.7
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2022,
    "population": 33354,
    "householdCount": 16202,
    "agingRate": 30.9
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2022,
    "population": 41145,
    "householdCount": 17007,
    "agingRate": 24.8
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2022,
    "population": 22545,
    "householdCount": 10007,
    "agingRate": 25
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2022,
    "population": 20824,
    "householdCount": 8822,
    "agingRate": 23.3
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2022,
    "population": 30905,
    "householdCount": 13509,
    "agingRate": 22.4
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2022,
    "population": 27127,
    "householdCount": 12309,
    "agingRate": 29.8
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2022,
    "population": 26566,
    "householdCount": 12867,
    "agingRate": 32.7
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2018,
    "population": 215224,
    "householdCount": 88711,
    "agingRate": 17.3
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2018,
    "population": 136101,
    "householdCount": 56476,
    "agingRate": 19.1
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2018,
    "population": 170119,
    "householdCount": 63905,
    "agingRate": 14.7
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2018,
    "population": 216410,
    "householdCount": 83080,
    "agingRate": 12.3
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2018,
    "population": 258037,
    "householdCount": 100525,
    "agingRate": 9.9
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2018,
    "population": 200470,
    "householdCount": 77513,
    "agingRate": 11.1
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2018,
    "population": 32507,
    "householdCount": 14080,
    "agingRate": 31.6
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2018,
    "population": 49756,
    "householdCount": 20362,
    "agingRate": 27.5
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2018,
    "population": 48475,
    "householdCount": 20915,
    "agingRate": 28.5
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2018,
    "population": 83915,
    "householdCount": 31023,
    "agingRate": 14.6
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2018,
    "population": 38449,
    "householdCount": 16764,
    "agingRate": 29.6
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2018,
    "population": 105539,
    "householdCount": 39808,
    "agingRate": 16.7
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2018,
    "population": 28444,
    "householdCount": 12684,
    "agingRate": 28.2
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2018,
    "population": 37485,
    "householdCount": 15131,
    "agingRate": 15.2
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2019,
    "population": 216446,
    "householdCount": 90191,
    "agingRate": 18
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2019,
    "population": 136093,
    "householdCount": 57422,
    "agingRate": 20
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2019,
    "population": 173786,
    "householdCount": 66169,
    "agingRate": 15.2
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2019,
    "population": 210270,
    "householdCount": 83743,
    "agingRate": 13.2
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2019,
    "population": 266301,
    "householdCount": 105115,
    "agingRate": 10.4
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2019,
    "population": 200581,
    "householdCount": 79404,
    "agingRate": 11.6
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2019,
    "population": 32001,
    "householdCount": 14044,
    "agingRate": 32.8
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2019,
    "population": 49117,
    "householdCount": 20331,
    "agingRate": 28.5
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2019,
    "population": 48004,
    "householdCount": 20749,
    "agingRate": 29.5
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2019,
    "population": 87525,
    "householdCount": 32901,
    "agingRate": 14.6
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2019,
    "population": 38808,
    "householdCount": 17013,
    "agingRate": 30.2
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2019,
    "population": 104823,
    "householdCount": 39538,
    "agingRate": 17.6
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2019,
    "population": 28095,
    "householdCount": 12719,
    "agingRate": 29.5
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2019,
    "population": 37493,
    "householdCount": 15374,
    "agingRate": 16
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2020,
    "population": 218412,
    "householdCount": 93082,
    "agingRate": 18.8
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2020,
    "population": 134768,
    "householdCount": 59680,
    "agingRate": 21.2
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2020,
    "population": 184788,
    "householdCount": 72113,
    "agingRate": 15.3
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2020,
    "population": 202389,
    "householdCount": 84612,
    "agingRate": 14.7
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2020,
    "population": 270590,
    "householdCount": 110912,
    "agingRate": 10.9
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2020,
    "population": 197559,
    "householdCount": 80691,
    "agingRate": 12.5
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2020,
    "population": 31543,
    "householdCount": 14306,
    "agingRate": 34.2
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2020,
    "population": 48868,
    "householdCount": 20721,
    "agingRate": 29.4
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2020,
    "population": 47016,
    "householdCount": 20984,
    "agingRate": 30.9
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2020,
    "population": 89514,
    "householdCount": 34771,
    "agingRate": 15.1
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2020,
    "population": 38093,
    "householdCount": 18209,
    "agingRate": 31.9
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2020,
    "population": 103725,
    "householdCount": 40342,
    "agingRate": 18.7
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2020,
    "population": 27640,
    "householdCount": 12785,
    "agingRate": 31
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2020,
    "population": 37183,
    "householdCount": 15714,
    "agingRate": 16.8
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2021,
    "population": 215349,
    "householdCount": 95350,
    "agingRate": 20
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2021,
    "population": 133750,
    "householdCount": 60089,
    "agingRate": 22.5
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2021,
    "population": 189611,
    "householdCount": 76707,
    "agingRate": 16
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2021,
    "population": 195526,
    "householdCount": 83147,
    "agingRate": 15.9
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2021,
    "population": 273483,
    "householdCount": 115438,
    "agingRate": 11.5
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2021,
    "population": 198303,
    "householdCount": 83540,
    "agingRate": 13.1
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2021,
    "population": 30929,
    "householdCount": 14477,
    "agingRate": 35.8
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2021,
    "population": 48507,
    "householdCount": 21297,
    "agingRate": 30.6
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2021,
    "population": 45546,
    "householdCount": 21119,
    "agingRate": 32.7
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2021,
    "population": 91779,
    "householdCount": 36620,
    "agingRate": 15.5
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2021,
    "population": 37526,
    "householdCount": 17997,
    "agingRate": 33.8
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2021,
    "population": 100866,
    "householdCount": 41040,
    "agingRate": 19.9
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2021,
    "population": 26937,
    "householdCount": 12885,
    "agingRate": 33
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2021,
    "population": 36652,
    "householdCount": 15905,
    "agingRate": 18.1
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2022,
    "population": 215783,
    "householdCount": 96130,
    "agingRate": 21
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2022,
    "population": 130436,
    "householdCount": 58927,
    "agingRate": 24.2
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2022,
    "population": 191510,
    "householdCount": 79442,
    "agingRate": 16.9
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2022,
    "population": 194132,
    "householdCount": 84616,
    "agingRate": 16.9
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2022,
    "population": 274114,
    "householdCount": 117269,
    "agingRate": 12.2
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2022,
    "population": 198744,
    "householdCount": 84556,
    "agingRate": 13.9
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2022,
    "population": 30636,
    "householdCount": 14640,
    "agingRate": 37.1
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2022,
    "population": 48013,
    "householdCount": 21462,
    "agingRate": 32.3
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2022,
    "population": 43813,
    "householdCount": 20557,
    "agingRate": 34.9
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2022,
    "population": 93174,
    "householdCount": 37664,
    "agingRate": 16.2
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2022,
    "population": 37830,
    "householdCount": 18083,
    "agingRate": 34.9
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2022,
    "population": 102564,
    "householdCount": 41958,
    "agingRate": 20.6
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2022,
    "population": 26466,
    "householdCount": 12950,
    "agingRate": 35
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2022,
    "population": 37778,
    "householdCount": 16610,
    "agingRate": 18.9
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2018,
    "population": 312374,
    "householdCount": 119029,
    "agingRate": 8.9
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2019,
    "population": 338136,
    "householdCount": 129664,
    "agingRate": 9
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2020,
    "population": 353933,
    "householdCount": 139106,
    "agingRate": 9.3
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2021,
    "population": 366227,
    "householdCount": 145295,
    "agingRate": 9.8
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2022,
    "population": 382589,
    "householdCount": 154019,
    "agingRate": 10.1
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "year": 2018,
    "population": 237297,
    "householdCount": 99157,
    "agingRate": 16.2
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2018,
    "population": 239284,
    "householdCount": 95807,
    "agingRate": 17.2
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2018,
    "population": 484492,
    "householdCount": 194136,
    "agingRate": 11.1
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2018,
    "population": 365833,
    "householdCount": 140085,
    "agingRate": 8
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2018,
    "population": 184308,
    "householdCount": 72990,
    "agingRate": 13.4
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "year": 2019,
    "population": 237273,
    "householdCount": 100718,
    "agingRate": 17
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2019,
    "population": 234995,
    "householdCount": 96106,
    "agingRate": 18.3
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2019,
    "population": 480920,
    "householdCount": 196870,
    "agingRate": 11.8
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2019,
    "population": 366544,
    "householdCount": 143172,
    "agingRate": 8.5
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2019,
    "population": 179107,
    "householdCount": 72177,
    "agingRate": 14.3
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "year": 2020,
    "population": 232559,
    "householdCount": 102668,
    "agingRate": 18.2
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2020,
    "population": 231959,
    "householdCount": 97687,
    "agingRate": 19.5
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2020,
    "population": 478629,
    "householdCount": 203296,
    "agingRate": 12.6
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2020,
    "population": 368895,
    "householdCount": 154100,
    "agingRate": 9.2
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2020,
    "population": 176393,
    "householdCount": 73457,
    "agingRate": 15.5
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "year": 2021,
    "population": 233721,
    "householdCount": 105021,
    "agingRate": 18.9
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2021,
    "population": 227326,
    "householdCount": 98269,
    "agingRate": 20.8
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2021,
    "population": 475671,
    "householdCount": 207138,
    "agingRate": 13.4
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2021,
    "population": 367288,
    "householdCount": 154421,
    "agingRate": 9.9
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2021,
    "population": 175734,
    "householdCount": 75236,
    "agingRate": 16.5
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "year": 2022,
    "population": 231324,
    "householdCount": 104997,
    "agingRate": 19.9
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2022,
    "population": 224114,
    "householdCount": 99050,
    "agingRate": 21.8
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2022,
    "population": 474248,
    "householdCount": 209618,
    "agingRate": 14.3
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2022,
    "population": 369281,
    "householdCount": 156411,
    "agingRate": 10.6
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2022,
    "population": 174695,
    "householdCount": 76398,
    "agingRate": 17.6
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2018,
    "population": 276455,
    "householdCount": 104705,
    "agingRate": 12
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2018,
    "population": 395344,
    "householdCount": 152244,
    "agingRate": 7.6
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2018,
    "population": 110119,
    "householdCount": 44552,
    "agingRate": 22.7
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2018,
    "population": 100229,
    "householdCount": 41506,
    "agingRate": 23.1
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2018,
    "population": 342272,
    "householdCount": 120613,
    "agingRate": 11
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2018,
    "population": 174177,
    "householdCount": 68462,
    "agingRate": 16.9
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2018,
    "population": 122843,
    "householdCount": 48759,
    "agingRate": 23.1
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2018,
    "population": 41557,
    "householdCount": 14905,
    "agingRate": 10.5
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2018,
    "population": 169965,
    "householdCount": 67159,
    "agingRate": 16.6
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2018,
    "population": 55015,
    "householdCount": 22889,
    "agingRate": 26.3
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2018,
    "population": 66527,
    "householdCount": 28265,
    "agingRate": 31.1
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2018,
    "population": 52604,
    "householdCount": 22804,
    "agingRate": 33.4
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2018,
    "population": 31181,
    "householdCount": 13493,
    "agingRate": 32.4
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2018,
    "population": 103044,
    "householdCount": 41721,
    "agingRate": 21
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2018,
    "population": 79136,
    "householdCount": 32641,
    "agingRate": 27.8
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2018,
    "population": 60948,
    "householdCount": 26406,
    "agingRate": 28.2
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2019,
    "population": 279153,
    "householdCount": 108123,
    "agingRate": 12.5
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2019,
    "population": 400590,
    "householdCount": 156260,
    "agingRate": 8
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2019,
    "population": 109877,
    "householdCount": 44816,
    "agingRate": 23.4
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2019,
    "population": 99320,
    "householdCount": 41410,
    "agingRate": 24
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2019,
    "population": 347032,
    "householdCount": 123229,
    "agingRate": 11.3
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2019,
    "population": 175204,
    "householdCount": 70024,
    "agingRate": 17.4
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2019,
    "population": 122111,
    "householdCount": 49004,
    "agingRate": 24
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2019,
    "population": 41153,
    "householdCount": 15028,
    "agingRate": 11.4
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2019,
    "population": 169171,
    "householdCount": 67758,
    "agingRate": 17.2
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2019,
    "population": 54442,
    "householdCount": 22450,
    "agingRate": 27.3
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2019,
    "population": 65337,
    "householdCount": 27982,
    "agingRate": 32.6
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2019,
    "population": 51826,
    "householdCount": 22581,
    "agingRate": 34.5
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2019,
    "population": 30783,
    "householdCount": 13382,
    "agingRate": 33.5
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2019,
    "population": 102791,
    "householdCount": 42235,
    "agingRate": 21.7
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2019,
    "population": 78963,
    "householdCount": 32933,
    "agingRate": 28.7
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2019,
    "population": 60896,
    "householdCount": 26887,
    "agingRate": 29
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2020,
    "population": 273764,
    "householdCount": 111538,
    "agingRate": 13.6
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2020,
    "population": 408435,
    "householdCount": 164169,
    "agingRate": 8.5
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2020,
    "population": 108333,
    "householdCount": 46165,
    "agingRate": 25
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2020,
    "population": 99088,
    "householdCount": 42417,
    "agingRate": 25.2
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2020,
    "population": 340518,
    "householdCount": 128012,
    "agingRate": 12.2
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2020,
    "population": 176379,
    "householdCount": 72765,
    "agingRate": 18
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2020,
    "population": 119707,
    "householdCount": 50139,
    "agingRate": 25.5
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2020,
    "population": 40854,
    "householdCount": 15137,
    "agingRate": 12.3
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2020,
    "population": 168955,
    "householdCount": 69099,
    "agingRate": 18
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2020,
    "population": 53758,
    "householdCount": 23257,
    "agingRate": 28.5
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2020,
    "population": 64207,
    "householdCount": 28332,
    "agingRate": 34.1
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2020,
    "population": 51039,
    "householdCount": 22790,
    "agingRate": 36.2
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2020,
    "population": 30103,
    "householdCount": 13532,
    "agingRate": 35.3
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2020,
    "population": 102757,
    "householdCount": 43192,
    "agingRate": 22.8
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2020,
    "population": 77838,
    "householdCount": 33675,
    "agingRate": 30.2
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2020,
    "population": 60901,
    "householdCount": 28003,
    "agingRate": 30.3
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2021,
    "population": 270836,
    "householdCount": 112262,
    "agingRate": 14.6
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2021,
    "population": 413052,
    "householdCount": 170229,
    "agingRate": 9
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2021,
    "population": 106915,
    "householdCount": 46411,
    "agingRate": 26.1
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2021,
    "population": 97390,
    "householdCount": 43135,
    "agingRate": 26.4
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2021,
    "population": 348727,
    "householdCount": 135276,
    "agingRate": 12.7
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2021,
    "population": 177497,
    "householdCount": 75485,
    "agingRate": 18.7
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2021,
    "population": 117262,
    "householdCount": 50723,
    "agingRate": 26.6
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2021,
    "population": 41415,
    "householdCount": 15882,
    "agingRate": 13.2
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2021,
    "population": 169507,
    "householdCount": 71602,
    "agingRate": 18.7
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2021,
    "population": 52436,
    "householdCount": 23299,
    "agingRate": 30
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2021,
    "population": 62415,
    "householdCount": 28500,
    "agingRate": 36
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2021,
    "population": 50012,
    "householdCount": 22999,
    "agingRate": 37.7
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2021,
    "population": 30103,
    "householdCount": 13700,
    "agingRate": 36
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2021,
    "population": 101618,
    "householdCount": 43690,
    "agingRate": 23.7
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2021,
    "population": 76490,
    "householdCount": 34083,
    "agingRate": 31.5
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2021,
    "population": 60285,
    "householdCount": 28358,
    "agingRate": 31.7
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2022,
    "population": 273967,
    "householdCount": 113562,
    "agingRate": 15.2
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2022,
    "population": 413984,
    "householdCount": 173951,
    "agingRate": 9.7
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2022,
    "population": 106038,
    "householdCount": 46899,
    "agingRate": 27.1
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2022,
    "population": 96511,
    "householdCount": 43622,
    "agingRate": 27.7
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2022,
    "population": 363197,
    "householdCount": 140653,
    "agingRate": 12.9
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2022,
    "population": 177947,
    "householdCount": 76382,
    "agingRate": 19.5
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2022,
    "population": 116852,
    "householdCount": 50599,
    "agingRate": 27.5
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2022,
    "population": 42416,
    "householdCount": 16790,
    "agingRate": 14
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2022,
    "population": 171192,
    "householdCount": 73500,
    "agingRate": 19.4
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2022,
    "population": 52399,
    "householdCount": 23275,
    "agingRate": 31
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2022,
    "population": 61481,
    "householdCount": 28539,
    "agingRate": 37.3
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2022,
    "population": 49509,
    "householdCount": 23132,
    "agingRate": 38.6
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2022,
    "population": 29761,
    "householdCount": 13844,
    "agingRate": 37.5
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2022,
    "population": 100339,
    "householdCount": 43014,
    "agingRate": 24.6
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2022,
    "population": 76967,
    "householdCount": 34960,
    "agingRate": 32.5
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2022,
    "population": 60654,
    "householdCount": 28648,
    "agingRate": 32.9
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2018,
    "population": 348108,
    "householdCount": 137053,
    "agingRate": 14.2
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2018,
    "population": 310804,
    "householdCount": 118551,
    "agingRate": 12.9
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2018,
    "population": 272204,
    "householdCount": 108539,
    "agingRate": 16.3
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2018,
    "population": 294787,
    "householdCount": 118435,
    "agingRate": 17
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2018,
    "population": 108271,
    "householdCount": 45514,
    "agingRate": 25.5
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2018,
    "population": 78483,
    "householdCount": 33134,
    "agingRate": 26.6
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2018,
    "population": 81410,
    "householdCount": 34621,
    "agingRate": 29.5
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2018,
    "population": 98002,
    "householdCount": 37860,
    "agingRate": 19.7
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2018,
    "population": 23306,
    "householdCount": 10374,
    "agingRate": 33.2
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2018,
    "population": 23058,
    "householdCount": 10251,
    "agingRate": 31.7
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2018,
    "population": 21285,
    "householdCount": 9214,
    "agingRate": 31.7
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2018,
    "population": 26377,
    "householdCount": 11940,
    "agingRate": 33.8
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2018,
    "population": 27136,
    "householdCount": 11577,
    "agingRate": 33
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2018,
    "population": 54425,
    "householdCount": 23647,
    "agingRate": 31.7
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2018,
    "population": 50501,
    "householdCount": 22270,
    "agingRate": 31.1
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2019,
    "population": 341123,
    "householdCount": 136857,
    "agingRate": 15.1
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2019,
    "population": 320963,
    "householdCount": 124521,
    "agingRate": 13.2
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2019,
    "population": 270635,
    "householdCount": 108999,
    "agingRate": 17.2
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2019,
    "population": 290119,
    "householdCount": 118313,
    "agingRate": 17.9
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2019,
    "population": 107348,
    "householdCount": 45455,
    "agingRate": 26.3
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2019,
    "population": 77690,
    "householdCount": 33242,
    "agingRate": 27.4
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2019,
    "population": 80422,
    "householdCount": 34491,
    "agingRate": 30.4
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2019,
    "population": 96212,
    "householdCount": 37510,
    "agingRate": 20.6
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2019,
    "population": 23013,
    "householdCount": 10348,
    "agingRate": 34.2
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2019,
    "population": 22852,
    "householdCount": 10296,
    "agingRate": 32.7
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2019,
    "population": 21267,
    "householdCount": 9248,
    "agingRate": 32.3
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2019,
    "population": 26144,
    "householdCount": 11985,
    "agingRate": 34.5
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2019,
    "population": 26642,
    "householdCount": 11476,
    "agingRate": 33.6
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2019,
    "population": 53260,
    "householdCount": 23540,
    "agingRate": 32.8
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2019,
    "population": 49733,
    "householdCount": 22026,
    "agingRate": 32
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2020,
    "population": 342896,
    "householdCount": 140814,
    "agingRate": 15.9
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2020,
    "population": 323621,
    "householdCount": 129954,
    "agingRate": 13.9
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2020,
    "population": 269023,
    "householdCount": 111817,
    "agingRate": 18.3
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2020,
    "population": 285312,
    "householdCount": 119474,
    "agingRate": 19.2
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2020,
    "population": 106706,
    "householdCount": 45970,
    "agingRate": 27.2
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2020,
    "population": 78097,
    "householdCount": 33974,
    "agingRate": 28.3
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2020,
    "population": 79733,
    "householdCount": 34697,
    "agingRate": 31.4
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2020,
    "population": 95834,
    "householdCount": 38551,
    "agingRate": 21.5
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2020,
    "population": 23380,
    "householdCount": 10674,
    "agingRate": 35.1
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2020,
    "population": 22678,
    "householdCount": 10469,
    "agingRate": 33.5
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2020,
    "population": 20879,
    "householdCount": 9383,
    "agingRate": 33.7
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2020,
    "population": 26075,
    "householdCount": 12288,
    "agingRate": 35.4
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2020,
    "population": 26598,
    "householdCount": 11647,
    "agingRate": 34.3
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2020,
    "population": 52608,
    "householdCount": 23512,
    "agingRate": 33.9
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2020,
    "population": 49326,
    "householdCount": 22351,
    "agingRate": 33.2
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2021,
    "population": 342394,
    "householdCount": 145603,
    "agingRate": 16.7
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2021,
    "population": 328017,
    "householdCount": 136293,
    "agingRate": 14.5
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2021,
    "population": 267635,
    "householdCount": 114276,
    "agingRate": 19.2
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2021,
    "population": 280150,
    "householdCount": 119937,
    "agingRate": 20.2
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2021,
    "population": 104463,
    "householdCount": 46589,
    "agingRate": 28.4
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2021,
    "population": 76551,
    "householdCount": 34386,
    "agingRate": 29.5
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2021,
    "population": 77998,
    "householdCount": 35113,
    "agingRate": 32.8
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2021,
    "population": 95029,
    "householdCount": 39605,
    "agingRate": 23
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2021,
    "population": 22760,
    "householdCount": 10725,
    "agingRate": 36.7
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2021,
    "population": 22305,
    "householdCount": 10669,
    "agingRate": 34.6
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2021,
    "population": 20335,
    "householdCount": 9452,
    "agingRate": 35.4
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2021,
    "population": 24997,
    "householdCount": 12247,
    "agingRate": 37.3
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2021,
    "population": 25483,
    "householdCount": 11639,
    "agingRate": 35.4
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2021,
    "population": 51180,
    "householdCount": 23648,
    "agingRate": 35.4
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2021,
    "population": 47756,
    "householdCount": 22289,
    "agingRate": 34.5
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2022,
    "population": 338570,
    "householdCount": 146694,
    "agingRate": 17.7
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2022,
    "population": 327314,
    "householdCount": 136191,
    "agingRate": 15.1
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2022,
    "population": 266438,
    "householdCount": 115636,
    "agingRate": 20.2
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2022,
    "population": 277030,
    "householdCount": 120485,
    "agingRate": 21.2
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2022,
    "population": 103255,
    "householdCount": 46936,
    "agingRate": 29.5
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2022,
    "population": 75259,
    "householdCount": 34509,
    "agingRate": 30.6
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2022,
    "population": 78277,
    "householdCount": 35702,
    "agingRate": 33.4
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2022,
    "population": 94771,
    "householdCount": 39938,
    "agingRate": 23.2
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2022,
    "population": 22645,
    "householdCount": 10857,
    "agingRate": 37.5
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2022,
    "population": 22296,
    "householdCount": 10770,
    "agingRate": 35.7
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2022,
    "population": 20036,
    "householdCount": 9480,
    "agingRate": 36.8
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2022,
    "population": 24922,
    "householdCount": 12387,
    "agingRate": 38.1
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2022,
    "population": 25279,
    "householdCount": 11728,
    "agingRate": 36.3
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2022,
    "population": 50784,
    "householdCount": 23836,
    "agingRate": 36.4
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2022,
    "population": 47372,
    "householdCount": 22531,
    "agingRate": 35.6
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "year": 2018,
    "population": 99870,
    "householdCount": 43155,
    "agingRate": 20.6
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2018,
    "population": 302189,
    "householdCount": 121889,
    "agingRate": 12.7
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2018,
    "population": 217345,
    "householdCount": 84578,
    "agingRate": 16
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2018,
    "population": 450023,
    "householdCount": 177427,
    "agingRate": 13.2
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2018,
    "population": 420665,
    "householdCount": 151510,
    "agingRate": 8.4
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "year": 2019,
    "population": 103754,
    "householdCount": 44954,
    "agingRate": 20.6
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2019,
    "population": 298033,
    "householdCount": 122889,
    "agingRate": 13.4
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2019,
    "population": 217972,
    "householdCount": 86172,
    "agingRate": 16.5
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2019,
    "population": 446661,
    "householdCount": 178759,
    "agingRate": 13.9
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2019,
    "population": 423310,
    "householdCount": 154385,
    "agingRate": 8.8
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "year": 2020,
    "population": 106005,
    "householdCount": 47388,
    "agingRate": 21.1
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2020,
    "population": 294854,
    "householdCount": 124204,
    "agingRate": 14.3
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2020,
    "population": 214860,
    "householdCount": 87098,
    "agingRate": 17.6
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2020,
    "population": 439352,
    "householdCount": 181167,
    "agingRate": 14.9
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2020,
    "population": 422502,
    "householdCount": 159360,
    "agingRate": 9.4
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "year": 2021,
    "population": 108676,
    "householdCount": 49595,
    "agingRate": 21.3
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2021,
    "population": 290565,
    "householdCount": 126759,
    "agingRate": 15.1
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2021,
    "population": 216266,
    "householdCount": 90004,
    "agingRate": 18.2
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2021,
    "population": 436997,
    "householdCount": 185983,
    "agingRate": 15.7
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2021,
    "population": 422758,
    "householdCount": 163352,
    "agingRate": 9.7
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "year": 2022,
    "population": 111181,
    "householdCount": 51245,
    "agingRate": 21.5
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2022,
    "population": 286793,
    "householdCount": 127918,
    "agingRate": 16.2
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2022,
    "population": 214531,
    "householdCount": 90939,
    "agingRate": 19.3
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2022,
    "population": 434712,
    "householdCount": 188407,
    "agingRate": 16.4
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2022,
    "population": 421755,
    "householdCount": 164743,
    "agingRate": 10.3
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2018,
    "population": 231798,
    "householdCount": 93021,
    "agingRate": 15.2
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2018,
    "population": 270947,
    "householdCount": 108824,
    "agingRate": 17.6
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2018,
    "population": 268284,
    "householdCount": 104561,
    "agingRate": 14.6
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2018,
    "population": 109862,
    "householdCount": 45864,
    "agingRate": 21.3
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2018,
    "population": 144027,
    "householdCount": 55698,
    "agingRate": 12
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2018,
    "population": 43749,
    "householdCount": 17730,
    "agingRate": 29.5
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2018,
    "population": 28116,
    "householdCount": 12464,
    "agingRate": 33.4
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2018,
    "population": 24246,
    "householdCount": 10839,
    "agingRate": 33.5
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2018,
    "population": 60664,
    "householdCount": 28993,
    "agingRate": 39.5
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2018,
    "population": 39373,
    "householdCount": 17970,
    "agingRate": 36.8
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2018,
    "population": 60040,
    "householdCount": 24869,
    "agingRate": 25.5
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2018,
    "population": 35875,
    "householdCount": 16356,
    "agingRate": 32.5
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2018,
    "population": 33298,
    "householdCount": 15012,
    "agingRate": 33.1
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2018,
    "population": 66209,
    "householdCount": 28634,
    "agingRate": 30.7
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2018,
    "population": 57175,
    "householdCount": 22736,
    "agingRate": 22.8
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2018,
    "population": 81324,
    "householdCount": 31570,
    "agingRate": 18.9
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2018,
    "population": 30600,
    "householdCount": 13412,
    "agingRate": 34.5
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2018,
    "population": 49570,
    "householdCount": 21324,
    "agingRate": 28.2
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2018,
    "population": 41850,
    "householdCount": 16850,
    "agingRate": 28.6
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2018,
    "population": 48340,
    "householdCount": 20922,
    "agingRate": 30.1
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2018,
    "population": 29366,
    "householdCount": 13185,
    "agingRate": 31.9
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2018,
    "population": 35639,
    "householdCount": 16572,
    "agingRate": 35.3
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2019,
    "population": 228876,
    "householdCount": 92846,
    "agingRate": 15.8
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2019,
    "population": 270283,
    "householdCount": 109473,
    "agingRate": 18.3
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2019,
    "population": 270202,
    "householdCount": 106414,
    "agingRate": 15.1
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2019,
    "population": 112101,
    "householdCount": 46928,
    "agingRate": 21.6
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2019,
    "population": 143656,
    "householdCount": 56134,
    "agingRate": 12.6
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2019,
    "population": 43804,
    "householdCount": 17663,
    "agingRate": 29.8
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2019,
    "population": 27858,
    "householdCount": 12630,
    "agingRate": 33.9
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2019,
    "population": 23836,
    "householdCount": 10786,
    "agingRate": 34.8
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2019,
    "population": 60332,
    "householdCount": 28933,
    "agingRate": 40.1
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2019,
    "population": 38339,
    "householdCount": 17708,
    "agingRate": 37.6
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2019,
    "population": 59671,
    "householdCount": 24708,
    "agingRate": 26.3
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2019,
    "population": 35494,
    "householdCount": 16350,
    "agingRate": 33.1
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2019,
    "population": 32805,
    "householdCount": 14918,
    "agingRate": 33.6
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2019,
    "population": 65175,
    "householdCount": 28491,
    "agingRate": 31.3
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2019,
    "population": 57476,
    "householdCount": 22747,
    "agingRate": 23
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2019,
    "population": 81789,
    "householdCount": 32078,
    "agingRate": 19.3
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2019,
    "population": 30556,
    "householdCount": 13434,
    "agingRate": 35
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2019,
    "population": 50004,
    "householdCount": 21345,
    "agingRate": 28.2
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2019,
    "population": 42193,
    "householdCount": 17059,
    "agingRate": 28.7
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2019,
    "population": 48366,
    "householdCount": 20810,
    "agingRate": 30.2
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2019,
    "population": 29295,
    "householdCount": 13090,
    "agingRate": 31.8
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2019,
    "population": 35432,
    "householdCount": 16481,
    "agingRate": 35.7
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2020,
    "population": 224509,
    "householdCount": 94391,
    "agingRate": 16.9
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2020,
    "population": 271505,
    "householdCount": 112397,
    "agingRate": 19.3
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2020,
    "population": 272449,
    "householdCount": 110112,
    "agingRate": 15.7
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2020,
    "population": 113293,
    "householdCount": 48497,
    "agingRate": 22.1
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2020,
    "population": 143928,
    "householdCount": 57752,
    "agingRate": 13.4
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2020,
    "population": 44201,
    "householdCount": 18034,
    "agingRate": 30.4
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2020,
    "population": 27349,
    "householdCount": 12689,
    "agingRate": 35
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2020,
    "population": 23907,
    "householdCount": 11009,
    "agingRate": 36.1
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2020,
    "population": 60045,
    "householdCount": 29520,
    "agingRate": 41.1
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2020,
    "population": 37888,
    "householdCount": 17862,
    "agingRate": 39
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2020,
    "population": 60247,
    "householdCount": 25343,
    "agingRate": 27.2
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2020,
    "population": 35273,
    "householdCount": 16484,
    "agingRate": 34.1
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2020,
    "population": 32778,
    "householdCount": 15250,
    "agingRate": 34.4
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2020,
    "population": 65223,
    "householdCount": 29031,
    "agingRate": 31.8
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2020,
    "population": 57076,
    "householdCount": 23534,
    "agingRate": 23.6
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2020,
    "population": 84637,
    "householdCount": 35628,
    "agingRate": 19.3
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2020,
    "population": 30156,
    "householdCount": 13538,
    "agingRate": 36
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2020,
    "population": 50196,
    "householdCount": 21780,
    "agingRate": 28.8
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2020,
    "population": 41443,
    "householdCount": 17291,
    "agingRate": 29.8
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2020,
    "population": 48269,
    "householdCount": 21234,
    "agingRate": 31
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2020,
    "population": 29297,
    "householdCount": 13400,
    "agingRate": 32.4
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2020,
    "population": 35138,
    "householdCount": 16742,
    "agingRate": 37.3
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2021,
    "population": 221178,
    "householdCount": 95442,
    "agingRate": 18
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2021,
    "population": 268687,
    "householdCount": 114112,
    "agingRate": 20.2
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2021,
    "population": 273827,
    "householdCount": 114166,
    "agingRate": 16.3
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2021,
    "population": 115138,
    "householdCount": 50270,
    "agingRate": 22.4
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2021,
    "population": 144226,
    "householdCount": 59376,
    "agingRate": 14.1
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2021,
    "population": 44034,
    "householdCount": 18704,
    "agingRate": 31.3
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2021,
    "population": 26781,
    "householdCount": 12801,
    "agingRate": 35.9
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2021,
    "population": 23543,
    "householdCount": 11160,
    "agingRate": 37.3
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2021,
    "population": 58873,
    "householdCount": 29739,
    "agingRate": 42.2
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2021,
    "population": 36981,
    "householdCount": 18065,
    "agingRate": 40.4
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2021,
    "population": 60136,
    "householdCount": 26120,
    "agingRate": 27.9
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2021,
    "population": 34268,
    "householdCount": 16533,
    "agingRate": 35.4
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2021,
    "population": 31941,
    "householdCount": 15358,
    "agingRate": 35.9
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2021,
    "population": 63242,
    "householdCount": 29265,
    "agingRate": 33.4
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2021,
    "population": 55998,
    "householdCount": 24003,
    "agingRate": 24.5
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2021,
    "population": 90094,
    "householdCount": 37294,
    "agingRate": 18.7
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2021,
    "population": 29369,
    "householdCount": 13724,
    "agingRate": 37.8
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2021,
    "population": 48981,
    "householdCount": 21957,
    "agingRate": 29.9
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2021,
    "population": 40604,
    "householdCount": 17551,
    "agingRate": 30.8
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2021,
    "population": 47210,
    "householdCount": 21304,
    "agingRate": 32.2
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2021,
    "population": 29013,
    "householdCount": 13616,
    "agingRate": 33.4
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2021,
    "population": 34000,
    "householdCount": 16798,
    "agingRate": 38.5
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2022,
    "population": 219625,
    "householdCount": 95985,
    "agingRate": 18.9
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2022,
    "population": 268139,
    "householdCount": 115438,
    "agingRate": 21.2
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2022,
    "population": 272085,
    "householdCount": 114578,
    "agingRate": 17.2
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2022,
    "population": 114785,
    "householdCount": 50878,
    "agingRate": 22.9
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2022,
    "population": 145926,
    "householdCount": 61173,
    "agingRate": 14.8
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2022,
    "population": 43572,
    "householdCount": 18842,
    "agingRate": 32.5
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2022,
    "population": 26454,
    "householdCount": 12901,
    "agingRate": 36.8
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2022,
    "population": 23165,
    "householdCount": 11198,
    "agingRate": 37.9
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2022,
    "population": 58630,
    "householdCount": 30107,
    "agingRate": 43
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2022,
    "population": 36244,
    "householdCount": 18073,
    "agingRate": 41.5
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2022,
    "population": 59822,
    "householdCount": 26435,
    "agingRate": 28.9
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2022,
    "population": 33638,
    "householdCount": 16470,
    "agingRate": 36.7
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2022,
    "population": 31476,
    "householdCount": 15343,
    "agingRate": 36.9
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2022,
    "population": 62360,
    "householdCount": 29277,
    "agingRate": 34.5
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2022,
    "population": 56287,
    "householdCount": 24392,
    "agingRate": 25.1
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2022,
    "population": 90630,
    "householdCount": 37810,
    "agingRate": 19.1
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2022,
    "population": 29048,
    "householdCount": 13772,
    "agingRate": 38.9
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2022,
    "population": 49323,
    "householdCount": 22451,
    "agingRate": 30.4
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2022,
    "population": 40266,
    "householdCount": 17739,
    "agingRate": 31.9
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2022,
    "population": 46863,
    "householdCount": 21221,
    "agingRate": 32.8
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2022,
    "population": 28945,
    "householdCount": 13616,
    "agingRate": 34.2
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2022,
    "population": 34148,
    "householdCount": 16946,
    "agingRate": 39
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "year": 2018,
    "population": 42766,
    "householdCount": 19886,
    "agingRate": 23.3
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2018,
    "population": 107028,
    "householdCount": 46072,
    "agingRate": 22.3
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2018,
    "population": 84557,
    "householdCount": 37194,
    "agingRate": 24.6
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2018,
    "population": 120731,
    "householdCount": 50356,
    "agingRate": 22.8
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2018,
    "population": 357723,
    "householdCount": 151852,
    "agingRate": 17.4
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2018,
    "population": 258386,
    "householdCount": 100613,
    "agingRate": 17
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2018,
    "population": 282645,
    "householdCount": 111261,
    "agingRate": 17.2
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2018,
    "population": 291675,
    "householdCount": 112896,
    "agingRate": 14.6
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2018,
    "population": 396601,
    "householdCount": 155092,
    "agingRate": 15.3
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2018,
    "population": 326655,
    "householdCount": 129242,
    "agingRate": 15.9
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2018,
    "population": 247681,
    "householdCount": 100993,
    "agingRate": 17.7
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2018,
    "population": 121351,
    "householdCount": 44028,
    "agingRate": 10.3
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2018,
    "population": 199887,
    "householdCount": 80104,
    "agingRate": 17.4
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2018,
    "population": 170296,
    "householdCount": 72556,
    "agingRate": 19.7
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2018,
    "population": 226961,
    "householdCount": 90355,
    "agingRate": 15
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2018,
    "population": 160335,
    "householdCount": 61108,
    "agingRate": 14.5
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "year": 2019,
    "population": 41958,
    "householdCount": 19847,
    "agingRate": 24.4
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2019,
    "population": 105847,
    "householdCount": 46608,
    "agingRate": 23.4
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2019,
    "population": 85673,
    "householdCount": 38163,
    "agingRate": 25.1
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2019,
    "population": 117959,
    "householdCount": 49823,
    "agingRate": 24.1
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2019,
    "population": 352390,
    "householdCount": 152433,
    "agingRate": 18.3
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2019,
    "population": 260986,
    "householdCount": 103176,
    "agingRate": 17.7
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2019,
    "population": 278849,
    "householdCount": 111594,
    "agingRate": 18
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2019,
    "population": 285098,
    "householdCount": 112242,
    "agingRate": 15.7
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2019,
    "population": 393132,
    "householdCount": 156356,
    "agingRate": 16.2
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2019,
    "population": 319828,
    "householdCount": 128548,
    "agingRate": 17.3
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2019,
    "population": 244440,
    "householdCount": 101168,
    "agingRate": 18.9
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2019,
    "population": 128809,
    "householdCount": 47138,
    "agingRate": 10.6
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2019,
    "population": 203959,
    "householdCount": 83398,
    "agingRate": 18.2
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2019,
    "population": 170414,
    "householdCount": 74187,
    "agingRate": 20.7
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2019,
    "population": 222618,
    "householdCount": 90171,
    "agingRate": 16.2
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2019,
    "population": 160732,
    "householdCount": 62178,
    "agingRate": 15.3
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "year": 2020,
    "population": 41439,
    "householdCount": 20508,
    "agingRate": 25.9
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2020,
    "population": 105303,
    "householdCount": 47261,
    "agingRate": 24.7
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2020,
    "population": 87246,
    "householdCount": 39776,
    "agingRate": 26
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2020,
    "population": 113224,
    "householdCount": 50842,
    "agingRate": 26.2
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2020,
    "population": 351403,
    "householdCount": 157105,
    "agingRate": 19.4
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2020,
    "population": 263345,
    "householdCount": 106013,
    "agingRate": 18.7
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2020,
    "population": 269111,
    "householdCount": 110605,
    "agingRate": 19.3
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2020,
    "population": 280177,
    "householdCount": 113121,
    "agingRate": 17.2
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2020,
    "population": 389804,
    "householdCount": 158738,
    "agingRate": 17.4
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2020,
    "population": 312057,
    "householdCount": 128354,
    "agingRate": 18.9
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2020,
    "population": 236950,
    "householdCount": 101677,
    "agingRate": 20.4
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2020,
    "population": 136734,
    "householdCount": 51376,
    "agingRate": 10.9
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2020,
    "population": 204947,
    "householdCount": 85699,
    "agingRate": 19.4
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2020,
    "population": 171461,
    "householdCount": 76700,
    "agingRate": 21.8
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2020,
    "population": 216350,
    "householdCount": 90678,
    "agingRate": 17.9
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2020,
    "population": 169465,
    "householdCount": 66584,
    "agingRate": 15.7
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "year": 2021,
    "population": 41539,
    "householdCount": 21352,
    "agingRate": 26.8
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2021,
    "population": 104130,
    "householdCount": 47761,
    "agingRate": 25.9
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2021,
    "population": 86035,
    "householdCount": 40372,
    "agingRate": 27
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2021,
    "population": 112834,
    "householdCount": 50400,
    "agingRate": 27.3
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2021,
    "population": 351201,
    "householdCount": 160558,
    "agingRate": 20.3
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2021,
    "population": 259838,
    "householdCount": 107309,
    "agingRate": 19.9
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2021,
    "population": 264756,
    "householdCount": 111810,
    "agingRate": 20.4
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2021,
    "population": 279815,
    "householdCount": 116241,
    "agingRate": 18.5
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2021,
    "population": 386064,
    "householdCount": 161168,
    "agingRate": 18.5
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2021,
    "population": 305790,
    "householdCount": 129782,
    "agingRate": 20.2
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2021,
    "population": 233596,
    "householdCount": 102456,
    "agingRate": 21.6
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2021,
    "population": 142110,
    "householdCount": 55143,
    "agingRate": 11.4
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2021,
    "population": 201217,
    "householdCount": 86267,
    "agingRate": 20.8
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2021,
    "population": 170720,
    "householdCount": 78800,
    "agingRate": 22.8
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2021,
    "population": 211788,
    "householdCount": 92300,
    "agingRate": 19.2
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2021,
    "population": 172902,
    "householdCount": 69646,
    "agingRate": 16.4
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "year": 2022,
    "population": 41145,
    "householdCount": 21635,
    "agingRate": 27.9
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2022,
    "population": 104824,
    "householdCount": 48741,
    "agingRate": 26.6
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2022,
    "population": 85918,
    "householdCount": 41296,
    "agingRate": 28
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2022,
    "population": 109889,
    "householdCount": 49844,
    "agingRate": 28.8
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2022,
    "population": 350426,
    "householdCount": 164101,
    "agingRate": 21.2
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2022,
    "population": 267292,
    "householdCount": 112153,
    "agingRate": 20.6
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2022,
    "population": 258062,
    "householdCount": 111263,
    "agingRate": 21.6
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2022,
    "population": 275580,
    "householdCount": 117296,
    "agingRate": 20
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2022,
    "population": 377199,
    "householdCount": 160597,
    "agingRate": 19.8
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2022,
    "population": 303000,
    "householdCount": 131434,
    "agingRate": 21.6
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2022,
    "population": 227484,
    "householdCount": 101834,
    "agingRate": 22.9
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2022,
    "population": 143734,
    "householdCount": 56601,
    "agingRate": 12.2
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2022,
    "population": 199751,
    "householdCount": 87486,
    "agingRate": 21.8
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2022,
    "population": 170007,
    "householdCount": 80409,
    "agingRate": 23.9
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2022,
    "population": 206948,
    "householdCount": 91789,
    "agingRate": 20.5
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2022,
    "population": 174501,
    "householdCount": 71346,
    "agingRate": 17.3
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "year": 2018,
    "population": 76935,
    "householdCount": 34109,
    "agingRate": 19.2
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2018,
    "population": 342396,
    "householdCount": 138759,
    "agingRate": 17.6
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2018,
    "population": 183857,
    "householdCount": 76111,
    "agingRate": 19.5
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2018,
    "population": 150132,
    "householdCount": 68263,
    "agingRate": 21.3
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2018,
    "population": 444759,
    "householdCount": 171041,
    "agingRate": 12.6
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2018,
    "population": 418834,
    "householdCount": 156596,
    "agingRate": 14.3
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2018,
    "population": 576746,
    "householdCount": 220531,
    "agingRate": 12.2
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2018,
    "population": 250753,
    "householdCount": 92106,
    "agingRate": 11.3
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2018,
    "population": 22277,
    "householdCount": 10565,
    "agingRate": 37.7
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "year": 2019,
    "population": 75561,
    "householdCount": 34207,
    "agingRate": 19.5
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2019,
    "population": 337439,
    "householdCount": 139168,
    "agingRate": 18.5
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2019,
    "population": 175243,
    "householdCount": 73980,
    "agingRate": 21
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2019,
    "population": 147500,
    "householdCount": 68268,
    "agingRate": 22.3
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2019,
    "population": 446050,
    "householdCount": 174696,
    "agingRate": 13.4
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2019,
    "population": 415283,
    "householdCount": 157906,
    "agingRate": 15
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2019,
    "population": 574390,
    "householdCount": 224644,
    "agingRate": 13
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2019,
    "population": 258474,
    "householdCount": 95751,
    "agingRate": 11.7
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2019,
    "population": 22206,
    "householdCount": 10560,
    "agingRate": 38.5
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "year": 2020,
    "population": 74278,
    "householdCount": 34805,
    "agingRate": 20.1
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2020,
    "population": 333294,
    "householdCount": 141788,
    "agingRate": 19.7
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2020,
    "population": 170437,
    "householdCount": 74097,
    "agingRate": 22.7
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2020,
    "population": 145588,
    "householdCount": 69120,
    "agingRate": 23.4
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2020,
    "population": 446466,
    "householdCount": 179584,
    "agingRate": 14.2
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2020,
    "population": 412912,
    "householdCount": 160239,
    "agingRate": 15.8
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2020,
    "population": 566712,
    "householdCount": 226813,
    "agingRate": 14.1
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2020,
    "population": 261013,
    "householdCount": 99370,
    "agingRate": 12.6
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2020,
    "population": 22096,
    "householdCount": 10726,
    "agingRate": 39.8
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "year": 2021,
    "population": 72834,
    "householdCount": 34680,
    "agingRate": 20.6
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2021,
    "population": 332637,
    "householdCount": 145080,
    "agingRate": 20.8
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2021,
    "population": 165455,
    "householdCount": 73944,
    "agingRate": 24.1
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2021,
    "population": 144898,
    "householdCount": 70508,
    "agingRate": 24.2
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2021,
    "population": 444446,
    "householdCount": 183714,
    "agingRate": 15.1
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2021,
    "population": 408085,
    "householdCount": 162210,
    "agingRate": 16.7
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2021,
    "population": 554702,
    "householdCount": 227587,
    "agingRate": 15.2
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2021,
    "population": 264854,
    "householdCount": 103208,
    "agingRate": 13.3
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2021,
    "population": 21285,
    "householdCount": 10797,
    "agingRate": 42
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "year": 2022,
    "population": 77512,
    "householdCount": 37289,
    "agingRate": 20.1
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2022,
    "population": 332954,
    "householdCount": 147698,
    "agingRate": 21.7
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2022,
    "population": 160754,
    "householdCount": 73196,
    "agingRate": 25.6
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2022,
    "population": 142675,
    "householdCount": 70698,
    "agingRate": 25.1
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2022,
    "population": 439303,
    "householdCount": 185834,
    "agingRate": 16
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2022,
    "population": 402458,
    "householdCount": 163237,
    "agingRate": 17.7
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2022,
    "population": 545073,
    "householdCount": 227834,
    "agingRate": 16.3
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2022,
    "population": 266123,
    "householdCount": 105048,
    "agingRate": 14.1
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2022,
    "population": 21797,
    "householdCount": 11185,
    "agingRate": 42.6
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "year": 2018,
    "population": 227054,
    "householdCount": 87707,
    "agingRate": 12.6
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2018,
    "population": 327561,
    "householdCount": 128089,
    "agingRate": 10.4
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2018,
    "population": 166992,
    "householdCount": 61714,
    "agingRate": 9.8
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2018,
    "population": 203675,
    "householdCount": 71603,
    "agingRate": 7.2
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2018,
    "population": 224832,
    "householdCount": 82278,
    "agingRate": 12.5
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "year": 2019,
    "population": 219428,
    "householdCount": 86756,
    "agingRate": 13.8
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2019,
    "population": 322135,
    "householdCount": 128579,
    "agingRate": 11.3
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2019,
    "population": 162104,
    "householdCount": 60684,
    "agingRate": 10.9
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2019,
    "population": 213524,
    "householdCount": 76681,
    "agingRate": 7.5
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2019,
    "population": 226501,
    "householdCount": 84394,
    "agingRate": 13.1
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "year": 2020,
    "population": 214147,
    "householdCount": 86488,
    "agingRate": 15.1
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2020,
    "population": 320175,
    "householdCount": 130469,
    "agingRate": 12.3
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2020,
    "population": 159000,
    "householdCount": 61081,
    "agingRate": 12.2
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2020,
    "population": 217051,
    "householdCount": 79213,
    "agingRate": 8
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2020,
    "population": 225050,
    "householdCount": 86836,
    "agingRate": 14.4
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "year": 2021,
    "population": 209555,
    "householdCount": 87324,
    "agingRate": 16.4
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2021,
    "population": 315307,
    "householdCount": 131994,
    "agingRate": 13.3
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2021,
    "population": 155578,
    "householdCount": 62152,
    "agingRate": 13.4
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2021,
    "population": 216149,
    "householdCount": 81037,
    "agingRate": 8.9
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2021,
    "population": 224164,
    "householdCount": 88925,
    "agingRate": 15.4
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "year": 2022,
    "population": 204622,
    "householdCount": 87021,
    "agingRate": 17.8
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2022,
    "population": 311172,
    "householdCount": 132411,
    "agingRate": 14.3
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2022,
    "population": 154118,
    "householdCount": 61785,
    "agingRate": 14.7
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2022,
    "population": 216750,
    "householdCount": 82811,
    "agingRate": 9.7
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2022,
    "population": 223854,
    "householdCount": 89970,
    "agingRate": 16.5
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2018,
    "population": 236268,
    "householdCount": 95390,
    "agingRate": 14.8
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2018,
    "population": 268114,
    "householdCount": 106066,
    "agingRate": 15.5
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2018,
    "population": 264282,
    "householdCount": 107484,
    "agingRate": 19.3
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2018,
    "population": 139894,
    "householdCount": 56670,
    "agingRate": 21.1
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2018,
    "population": 162186,
    "householdCount": 68050,
    "agingRate": 22.1
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2018,
    "population": 422196,
    "householdCount": 163406,
    "agingRate": 8.3
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2018,
    "population": 107034,
    "householdCount": 44681,
    "agingRate": 24.2
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2018,
    "population": 98686,
    "householdCount": 42328,
    "agingRate": 26
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2018,
    "population": 97562,
    "householdCount": 42328,
    "agingRate": 28.7
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2018,
    "population": 68895,
    "householdCount": 29855,
    "agingRate": 28.4
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2018,
    "population": 284517,
    "householdCount": 109175,
    "agingRate": 14
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2018,
    "population": 49620,
    "householdCount": 23678,
    "agingRate": 39.9
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2018,
    "population": 24160,
    "householdCount": 11518,
    "agingRate": 35.4
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2018,
    "population": 16559,
    "householdCount": 7585,
    "agingRate": 34.9
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2018,
    "population": 36096,
    "householdCount": 17027,
    "agingRate": 35
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2018,
    "population": 40878,
    "householdCount": 18438,
    "agingRate": 35.1
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2018,
    "population": 32660,
    "householdCount": 13506,
    "agingRate": 27.5
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2018,
    "population": 41299,
    "householdCount": 17677,
    "agingRate": 29.5
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2018,
    "population": 120983,
    "householdCount": 47160,
    "agingRate": 13.4
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2018,
    "population": 51082,
    "householdCount": 22350,
    "agingRate": 30.1
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2018,
    "population": 30872,
    "householdCount": 14044,
    "agingRate": 34.6
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2018,
    "population": 48057,
    "householdCount": 21409,
    "agingRate": 26
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2018,
    "population": 8729,
    "householdCount": 4145,
    "agingRate": 22.7
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2019,
    "population": 233172,
    "householdCount": 95137,
    "agingRate": 15.9
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2019,
    "population": 268892,
    "householdCount": 107355,
    "agingRate": 16.5
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2019,
    "population": 264314,
    "householdCount": 108194,
    "agingRate": 20.1
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2019,
    "population": 139902,
    "householdCount": 57408,
    "agingRate": 21.8
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2019,
    "population": 160344,
    "householdCount": 68285,
    "agingRate": 23
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2019,
    "population": 420319,
    "householdCount": 164752,
    "agingRate": 8.8
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2019,
    "population": 105235,
    "householdCount": 44303,
    "agingRate": 25.4
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2019,
    "population": 100487,
    "householdCount": 43310,
    "agingRate": 26.3
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2019,
    "population": 96641,
    "householdCount": 42579,
    "agingRate": 29.7
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2019,
    "population": 68542,
    "householdCount": 30068,
    "agingRate": 29.2
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2019,
    "population": 290088,
    "householdCount": 112324,
    "agingRate": 14.5
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2019,
    "population": 49477,
    "householdCount": 23767,
    "agingRate": 40.6
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2019,
    "population": 23958,
    "householdCount": 11512,
    "agingRate": 36.4
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2019,
    "population": 16146,
    "householdCount": 7539,
    "agingRate": 36.2
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2019,
    "population": 35672,
    "householdCount": 16918,
    "agingRate": 35.9
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2019,
    "population": 41054,
    "householdCount": 18616,
    "agingRate": 35.9
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2019,
    "population": 32191,
    "householdCount": 13468,
    "agingRate": 28.6
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2019,
    "population": 41314,
    "householdCount": 17835,
    "agingRate": 30.3
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2019,
    "population": 118517,
    "householdCount": 46237,
    "agingRate": 14.3
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2019,
    "population": 53020,
    "householdCount": 23382,
    "agingRate": 30
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2019,
    "population": 30308,
    "householdCount": 13992,
    "agingRate": 35.7
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2019,
    "population": 47651,
    "householdCount": 21332,
    "agingRate": 26.7
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2019,
    "population": 8704,
    "householdCount": 4061,
    "agingRate": 23.5
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2020,
    "population": 228937,
    "householdCount": 96024,
    "agingRate": 17.2
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2020,
    "population": 272172,
    "householdCount": 111435,
    "agingRate": 17.6
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2020,
    "population": 261778,
    "householdCount": 111247,
    "agingRate": 21.2
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2020,
    "population": 139145,
    "householdCount": 59250,
    "agingRate": 22.8
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2020,
    "population": 159412,
    "householdCount": 70934,
    "agingRate": 24.1
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2020,
    "population": 416603,
    "householdCount": 169519,
    "agingRate": 9.5
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2020,
    "population": 103818,
    "householdCount": 45636,
    "agingRate": 26.7
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2020,
    "population": 100353,
    "householdCount": 44842,
    "agingRate": 27.3
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2020,
    "population": 95473,
    "householdCount": 43717,
    "agingRate": 30.7
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2020,
    "population": 68212,
    "householdCount": 30574,
    "agingRate": 30.4
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2020,
    "population": 283733,
    "householdCount": 116127,
    "agingRate": 15.7
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2020,
    "population": 49243,
    "householdCount": 24119,
    "agingRate": 41.8
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2020,
    "population": 23761,
    "householdCount": 11723,
    "agingRate": 37.6
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2020,
    "population": 15743,
    "householdCount": 7661,
    "agingRate": 37.8
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2020,
    "population": 34893,
    "householdCount": 16969,
    "agingRate": 37.2
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2020,
    "population": 41378,
    "householdCount": 18821,
    "agingRate": 36.7
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2020,
    "population": 31419,
    "householdCount": 13498,
    "agingRate": 30
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2020,
    "population": 41574,
    "householdCount": 18255,
    "agingRate": 31.8
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2020,
    "population": 115756,
    "householdCount": 46786,
    "agingRate": 15.4
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2020,
    "population": 53718,
    "householdCount": 24041,
    "agingRate": 30.4
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2020,
    "population": 29945,
    "householdCount": 14092,
    "agingRate": 37.1
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2020,
    "population": 47151,
    "householdCount": 21707,
    "agingRate": 27.5
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2020,
    "population": 8444,
    "householdCount": 4116,
    "agingRate": 25.3
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2021,
    "population": 228869,
    "householdCount": 99133,
    "agingRate": 18.4
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2021,
    "population": 272382,
    "householdCount": 114277,
    "agingRate": 18.8
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2021,
    "population": 261102,
    "householdCount": 113760,
    "agingRate": 22.2
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2021,
    "population": 137962,
    "householdCount": 60115,
    "agingRate": 23.8
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2021,
    "population": 158064,
    "householdCount": 71804,
    "agingRate": 25
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2021,
    "population": 413963,
    "householdCount": 173937,
    "agingRate": 10.3
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2021,
    "population": 102414,
    "householdCount": 45423,
    "agingRate": 28
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2021,
    "population": 99859,
    "householdCount": 45839,
    "agingRate": 28.6
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2021,
    "population": 93722,
    "householdCount": 43339,
    "agingRate": 32.1
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2021,
    "population": 67669,
    "householdCount": 31154,
    "agingRate": 31.6
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2021,
    "population": 293418,
    "householdCount": 122309,
    "agingRate": 16.2
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2021,
    "population": 48021,
    "householdCount": 24243,
    "agingRate": 43.6
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2021,
    "population": 23288,
    "householdCount": 11861,
    "agingRate": 39.3
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2021,
    "population": 15558,
    "householdCount": 7723,
    "agingRate": 39.1
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2021,
    "population": 33927,
    "householdCount": 16958,
    "agingRate": 38.8
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2021,
    "population": 40071,
    "householdCount": 19041,
    "agingRate": 38.5
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2021,
    "population": 30399,
    "householdCount": 13576,
    "agingRate": 31.6
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2021,
    "population": 40804,
    "householdCount": 18547,
    "agingRate": 33.3
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2021,
    "population": 114564,
    "householdCount": 47930,
    "agingRate": 16.3
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2021,
    "population": 54267,
    "householdCount": 24682,
    "agingRate": 30.8
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2021,
    "population": 29168,
    "householdCount": 14186,
    "agingRate": 38.7
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2021,
    "population": 46369,
    "householdCount": 21876,
    "agingRate": 28.8
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2021,
    "population": 8169,
    "householdCount": 4135,
    "agingRate": 26.3
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2022,
    "population": 227243,
    "householdCount": 99834,
    "agingRate": 19.7
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2022,
    "population": 269365,
    "householdCount": 114811,
    "agingRate": 19.9
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2022,
    "population": 259674,
    "householdCount": 113877,
    "agingRate": 23.1
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2022,
    "population": 137698,
    "householdCount": 61083,
    "agingRate": 24.7
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2022,
    "population": 156025,
    "householdCount": 71913,
    "agingRate": 26
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2022,
    "population": 409171,
    "householdCount": 174947,
    "agingRate": 11.1
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2022,
    "population": 101521,
    "householdCount": 45918,
    "agingRate": 29
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2022,
    "population": 99741,
    "householdCount": 46283,
    "agingRate": 29.6
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2022,
    "population": 93208,
    "householdCount": 43721,
    "agingRate": 33.1
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2022,
    "population": 67515,
    "householdCount": 31556,
    "agingRate": 32.7
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2022,
    "population": 295543,
    "householdCount": 124164,
    "agingRate": 16.9
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2022,
    "population": 47775,
    "householdCount": 24455,
    "agingRate": 44.7
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2022,
    "population": 23173,
    "householdCount": 11930,
    "agingRate": 40.5
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2022,
    "population": 15333,
    "householdCount": 7763,
    "agingRate": 40.2
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2022,
    "population": 33516,
    "householdCount": 16920,
    "agingRate": 39.8
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2022,
    "population": 40045,
    "householdCount": 19309,
    "agingRate": 39.6
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2022,
    "population": 30142,
    "householdCount": 13676,
    "agingRate": 32.8
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2022,
    "population": 40851,
    "householdCount": 18796,
    "agingRate": 34.4
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2022,
    "population": 113549,
    "householdCount": 48734,
    "agingRate": 17.2
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2022,
    "population": 54448,
    "householdCount": 25070,
    "agingRate": 31.5
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2022,
    "population": 28798,
    "householdCount": 14243,
    "agingRate": 40.1
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2022,
    "population": 45954,
    "householdCount": 21870,
    "agingRate": 29.6
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2022,
    "population": 8288,
    "householdCount": 4248,
    "agingRate": 27.4
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2018,
    "population": 352333,
    "householdCount": 137960,
    "agingRate": 14.9
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2018,
    "population": 131407,
    "householdCount": 53250,
    "agingRate": 16.8
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2018,
    "population": 112248,
    "householdCount": 45623,
    "agingRate": 19.7
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2018,
    "population": 539401,
    "householdCount": 194797,
    "agingRate": 9.9
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2018,
    "population": 103762,
    "householdCount": 44774,
    "agingRate": 25.2
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2018,
    "population": 252889,
    "householdCount": 93740,
    "agingRate": 9
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2018,
    "population": 344995,
    "householdCount": 132069,
    "agingRate": 11.8
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2018,
    "population": 209219,
    "householdCount": 79680,
    "agingRate": 11.6
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2018,
    "population": 268606,
    "householdCount": 98367,
    "agingRate": 7.1
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2018,
    "population": 178440,
    "householdCount": 72241,
    "agingRate": 18.5
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2018,
    "population": 197674,
    "householdCount": 75850,
    "agingRate": 14.9
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2018,
    "population": 190276,
    "householdCount": 73215,
    "agingRate": 12.6
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2018,
    "population": 26401,
    "householdCount": 12196,
    "agingRate": 34.5
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2018,
    "population": 67520,
    "householdCount": 26844,
    "agingRate": 21
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2018,
    "population": 62703,
    "householdCount": 26707,
    "agingRate": 27.5
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2018,
    "population": 51778,
    "householdCount": 22148,
    "agingRate": 28
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2018,
    "population": 42696,
    "householdCount": 19431,
    "agingRate": 35.5
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2018,
    "population": 43001,
    "householdCount": 19352,
    "agingRate": 32.4
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2018,
    "population": 34122,
    "householdCount": 15406,
    "agingRate": 33.8
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2018,
    "population": 38005,
    "householdCount": 17119,
    "agingRate": 31.8
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2018,
    "population": 60020,
    "householdCount": 25430,
    "agingRate": 26
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2018,
    "population": 42856,
    "householdCount": 20195,
    "agingRate": 37.6
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2019,
    "population": 354166,
    "householdCount": 140718,
    "agingRate": 15.5
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2019,
    "population": 129931,
    "householdCount": 53200,
    "agingRate": 17.7
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2019,
    "population": 111110,
    "householdCount": 45589,
    "agingRate": 20.7
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2019,
    "population": 549331,
    "householdCount": 201314,
    "agingRate": 10.4
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2019,
    "population": 103402,
    "householdCount": 44923,
    "agingRate": 26.1
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2019,
    "population": 251226,
    "householdCount": 93728,
    "agingRate": 9.6
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2019,
    "population": 347221,
    "householdCount": 134260,
    "agingRate": 12.6
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2019,
    "population": 211040,
    "householdCount": 81571,
    "agingRate": 12.3
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2019,
    "population": 264912,
    "householdCount": 99046,
    "agingRate": 7.7
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2019,
    "population": 177583,
    "householdCount": 73297,
    "agingRate": 19.6
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2019,
    "population": 192442,
    "householdCount": 74960,
    "agingRate": 16.2
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2019,
    "population": 190885,
    "householdCount": 74650,
    "agingRate": 13.3
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2019,
    "population": 26040,
    "householdCount": 12144,
    "agingRate": 35.1
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2019,
    "population": 66611,
    "householdCount": 26560,
    "agingRate": 22.2
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2019,
    "population": 62370,
    "householdCount": 26590,
    "agingRate": 28.3
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2019,
    "population": 50887,
    "householdCount": 21824,
    "agingRate": 29.2
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2019,
    "population": 42169,
    "householdCount": 19316,
    "agingRate": 36
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2019,
    "population": 42583,
    "householdCount": 19387,
    "agingRate": 33.3
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2019,
    "population": 33579,
    "householdCount": 15356,
    "agingRate": 35.2
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2019,
    "population": 37384,
    "householdCount": 17165,
    "agingRate": 32.7
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2019,
    "population": 59888,
    "householdCount": 25491,
    "agingRate": 26.7
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2019,
    "population": 42449,
    "householdCount": 20124,
    "agingRate": 38.3
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2020,
    "population": 352403,
    "householdCount": 146660,
    "agingRate": 16.5
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2020,
    "population": 127984,
    "householdCount": 53758,
    "agingRate": 19
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2020,
    "population": 111184,
    "householdCount": 46540,
    "agingRate": 21.8
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2020,
    "population": 552427,
    "householdCount": 207272,
    "agingRate": 11.1
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2020,
    "population": 103228,
    "householdCount": 45948,
    "agingRate": 27.3
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2020,
    "population": 246965,
    "householdCount": 95837,
    "agingRate": 10.5
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2020,
    "population": 351206,
    "householdCount": 138629,
    "agingRate": 13.5
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2020,
    "population": 219537,
    "householdCount": 87135,
    "agingRate": 13.1
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2020,
    "population": 256273,
    "householdCount": 98842,
    "agingRate": 8.6
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2020,
    "population": 172635,
    "householdCount": 71774,
    "agingRate": 21.6
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2020,
    "population": 190386,
    "householdCount": 76209,
    "agingRate": 17.6
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2020,
    "population": 190558,
    "householdCount": 75728,
    "agingRate": 14.2
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2020,
    "population": 25965,
    "householdCount": 12321,
    "agingRate": 36.2
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2020,
    "population": 65279,
    "householdCount": 26634,
    "agingRate": 23.7
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2020,
    "population": 61302,
    "householdCount": 26908,
    "agingRate": 29.8
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2020,
    "population": 50016,
    "householdCount": 22039,
    "agingRate": 30.6
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2020,
    "population": 41587,
    "householdCount": 19501,
    "agingRate": 37
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2020,
    "population": 41772,
    "householdCount": 19435,
    "agingRate": 34.8
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2020,
    "population": 33500,
    "householdCount": 15611,
    "agingRate": 36.5
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2020,
    "population": 37114,
    "householdCount": 17361,
    "agingRate": 33.9
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2020,
    "population": 59595,
    "householdCount": 25874,
    "agingRate": 27.7
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2020,
    "population": 42140,
    "householdCount": 20139,
    "agingRate": 39.3
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2021,
    "population": 353389,
    "householdCount": 149469,
    "agingRate": 17.3
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2021,
    "population": 124829,
    "householdCount": 54056,
    "agingRate": 20.4
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2021,
    "population": 109646,
    "householdCount": 47535,
    "agingRate": 22.9
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2021,
    "population": 547995,
    "householdCount": 211354,
    "agingRate": 11.9
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2021,
    "population": 101837,
    "householdCount": 46760,
    "agingRate": 28.9
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2021,
    "population": 242426,
    "householdCount": 97007,
    "agingRate": 11.6
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2021,
    "population": 352610,
    "householdCount": 142960,
    "agingRate": 14.4
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2021,
    "population": 216915,
    "householdCount": 88919,
    "agingRate": 14.2
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2021,
    "population": 249909,
    "householdCount": 99939,
    "agingRate": 9.5
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2021,
    "population": 180049,
    "householdCount": 77292,
    "agingRate": 22
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2021,
    "population": 186464,
    "householdCount": 76727,
    "agingRate": 19
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2021,
    "population": 192365,
    "householdCount": 78968,
    "agingRate": 15.1
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2021,
    "population": 25325,
    "householdCount": 12529,
    "agingRate": 37.6
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2021,
    "population": 63233,
    "householdCount": 26753,
    "agingRate": 25.5
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2021,
    "population": 59664,
    "householdCount": 27107,
    "agingRate": 31.4
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2021,
    "population": 48803,
    "householdCount": 22274,
    "agingRate": 32.2
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2021,
    "population": 40870,
    "householdCount": 19606,
    "agingRate": 38.1
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2021,
    "population": 40167,
    "householdCount": 19457,
    "agingRate": 36.7
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2021,
    "population": 33014,
    "householdCount": 15867,
    "agingRate": 38.4
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2021,
    "population": 36541,
    "householdCount": 17563,
    "agingRate": 35.3
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2021,
    "population": 59238,
    "householdCount": 26508,
    "agingRate": 28.6
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2021,
    "population": 40642,
    "householdCount": 20332,
    "agingRate": 40.9
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2022,
    "population": 351119,
    "householdCount": 150980,
    "agingRate": 18.2
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2022,
    "population": 123006,
    "householdCount": 54109,
    "agingRate": 21.7
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2022,
    "population": 109350,
    "householdCount": 48150,
    "agingRate": 23.8
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2022,
    "population": 547313,
    "householdCount": 214436,
    "agingRate": 12.8
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2022,
    "population": 101574,
    "householdCount": 47331,
    "agingRate": 30.3
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2022,
    "population": 236686,
    "householdCount": 96780,
    "agingRate": 12.9
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2022,
    "population": 352842,
    "householdCount": 145390,
    "agingRate": 15.5
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2022,
    "population": 215053,
    "householdCount": 90177,
    "agingRate": 15.3
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2022,
    "population": 246438,
    "householdCount": 100454,
    "agingRate": 10.6
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2022,
    "population": 179191,
    "householdCount": 78501,
    "agingRate": 23.1
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2022,
    "population": 183667,
    "householdCount": 77049,
    "agingRate": 20.5
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2022,
    "population": 192402,
    "householdCount": 80227,
    "agingRate": 16
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2022,
    "population": 25032,
    "householdCount": 12609,
    "agingRate": 38.7
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2022,
    "population": 62409,
    "householdCount": 26756,
    "agingRate": 26.7
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2022,
    "population": 58804,
    "householdCount": 27217,
    "agingRate": 32.8
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2022,
    "population": 48298,
    "householdCount": 22398,
    "agingRate": 33.4
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2022,
    "population": 40491,
    "householdCount": 19804,
    "agingRate": 39.2
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2022,
    "population": 39542,
    "householdCount": 19438,
    "agingRate": 38.1
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2022,
    "population": 32811,
    "householdCount": 16033,
    "agingRate": 39.5
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2022,
    "population": 36017,
    "householdCount": 17624,
    "agingRate": 36.8
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2022,
    "population": 58702,
    "householdCount": 26693,
    "agingRate": 29.7
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2022,
    "population": 40082,
    "householdCount": 20452,
    "agingRate": 42
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2018,
    "population": 482932,
    "householdCount": 180880,
    "agingRate": 12.9
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2018,
    "population": 175350,
    "householdCount": 68118,
    "agingRate": 17.7
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2019,
    "population": 487688,
    "householdCount": 184488,
    "agingRate": 13.3
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2019,
    "population": 177360,
    "householdCount": 69228,
    "agingRate": 18.2
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2020,
    "population": 492306,
    "householdCount": 191619,
    "agingRate": 14.1
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2020,
    "population": 178552,
    "householdCount": 71449,
    "agingRate": 18.9
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2021,
    "population": 493869,
    "householdCount": 197149,
    "agingRate": 14.8
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2021,
    "population": 179238,
    "householdCount": 74013,
    "agingRate": 19.6
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2022,
    "population": 495281,
    "householdCount": 200677,
    "agingRate": 15.4
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2022,
    "population": 181094,
    "householdCount": 75548,
    "agingRate": 20.3
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2018,
    "population": 1220549,
    "householdCount": 451497,
    "agingRate": 9.6
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2019,
    "population": 1215519,
    "householdCount": 457657,
    "agingRate": 10.2
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2020,
    "population": 1210150,
    "householdCount": 466089,
    "agingRate": 11
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2021,
    "population": 1208337,
    "householdCount": 480566,
    "agingRate": 11.7
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2022,
    "population": 1216349,
    "householdCount": 492051,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2018,
    "population": 931393,
    "householdCount": 359322,
    "agingRate": 12.6
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2019,
    "population": 919895,
    "householdCount": 361413,
    "agingRate": 13.3
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2020,
    "population": 922025,
    "householdCount": 369585,
    "agingRate": 14.1
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2021,
    "population": 913482,
    "householdCount": 375080,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2022,
    "population": 904690,
    "householdCount": 376179,
    "agingRate": 15.9
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2018,
    "population": 566574,
    "householdCount": 204984,
    "agingRate": 11.8
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2019,
    "population": 557339,
    "householdCount": 205695,
    "agingRate": 12.6
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2020,
    "population": 542336,
    "householdCount": 203441,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2021,
    "population": 538929,
    "householdCount": 208284,
    "agingRate": 14.5
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2022,
    "population": 540789,
    "householdCount": 213022,
    "agingRate": 15.5
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2018,
    "population": 848756,
    "householdCount": 311868,
    "agingRate": 11.6
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2019,
    "population": 836751,
    "householdCount": 311910,
    "agingRate": 12.5
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2020,
    "population": 833148,
    "householdCount": 315696,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2021,
    "population": 822635,
    "householdCount": 318968,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2022,
    "population": 810142,
    "householdCount": 318561,
    "agingRate": 15.9
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2018,
    "population": 720105,
    "householdCount": 251418,
    "agingRate": 9.1
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2019,
    "population": 714650,
    "householdCount": 253140,
    "agingRate": 9.7
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2020,
    "population": 717345,
    "householdCount": 260598,
    "agingRate": 10.5
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2021,
    "population": 718384,
    "householdCount": 267483,
    "agingRate": 11.3
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2022,
    "population": 715088,
    "householdCount": 268609,
    "agingRate": 12.2
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2018,
    "population": 1006992,
    "householdCount": 370108,
    "agingRate": 12.4
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2019,
    "population": 1024645,
    "householdCount": 385021,
    "agingRate": 12.9
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2020,
    "population": 1045497,
    "householdCount": 398864,
    "agingRate": 13.8
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2021,
    "population": 1049513,
    "householdCount": 411137,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2022,
    "population": 1044242,
    "householdCount": 419496,
    "agingRate": 15.5
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2018,
    "population": 1025058,
    "householdCount": 355625,
    "agingRate": 12.1
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2019,
    "population": 1052529,
    "householdCount": 371752,
    "agingRate": 12.6
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2020,
    "population": 1066975,
    "householdCount": 386929,
    "agingRate": 13.3
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2021,
    "population": 1067347,
    "householdCount": 396112,
    "agingRate": 14.1
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2022,
    "population": 1064500,
    "householdCount": 401300,
    "agingRate": 14.7
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2018,
    "population": 845036,
    "householdCount": 325023,
    "agingRate": 11.8
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2019,
    "population": 850938,
    "householdCount": 334431,
    "agingRate": 12.4
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2020,
    "population": 855326,
    "householdCount": 348328,
    "agingRate": 13.1
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2021,
    "population": 856923,
    "householdCount": 358832,
    "agingRate": 13.9
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2022,
    "population": 858500,
    "householdCount": 365883,
    "agingRate": 14.7
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2018,
    "population": 671799,
    "householdCount": 256949,
    "agingRate": 9.4
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2019,
    "population": 679743,
    "householdCount": 264383,
    "agingRate": 9.8
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2020,
    "population": 682199,
    "householdCount": 275707,
    "agingRate": 10.5
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2021,
    "population": 683888,
    "householdCount": 282491,
    "agingRate": 11.2
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2022,
    "population": 687951,
    "householdCount": 287513,
    "agingRate": 11.9
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2018,
    "population": 658912,
    "householdCount": 255604,
    "agingRate": 13.6
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2019,
    "population": 662086,
    "householdCount": 261378,
    "agingRate": 14.2
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2020,
    "population": 666517,
    "householdCount": 270768,
    "agingRate": 14.9
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2021,
    "population": 670411,
    "householdCount": 281896,
    "agingRate": 15.6
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2022,
    "population": 665884,
    "householdCount": 282885,
    "agingRate": 16.4
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2018,
    "population": 504382,
    "householdCount": 201456,
    "agingRate": 15.2
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2019,
    "population": 502064,
    "householdCount": 202492,
    "agingRate": 16.2
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2020,
    "population": 501109,
    "householdCount": 207459,
    "agingRate": 17.4
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2021,
    "population": 501251,
    "householdCount": 213410,
    "agingRate": 18.6
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2022,
    "population": 496608,
    "householdCount": 214645,
    "agingRate": 19.8
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2018,
    "population": 1044215,
    "householdCount": 399353,
    "agingRate": 12.4
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2019,
    "population": 1036862,
    "householdCount": 403524,
    "agingRate": 13.3
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2020,
    "population": 1029389,
    "householdCount": 409688,
    "agingRate": 14.4
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2021,
    "population": 1025702,
    "householdCount": 421845,
    "agingRate": 15.5
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2022,
    "population": 1016751,
    "householdCount": 426408,
    "agingRate": 16.6
  }
];

/** 시도 인구 시계열 (SGIS 2자리 × 연도, 시군구 합산) */
export const POPULATION_TREND_SIDO: PopulationTrendPoint[] = [
  {
    "sgisCode": "11",
    "name": "서울",
    "year": 2018,
    "population": 9673932,
    "householdCount": 3839765,
    "agingRate": 14
  },
  {
    "sgisCode": "11",
    "name": "서울",
    "year": 2019,
    "population": 9639541,
    "householdCount": 3896389,
    "agingRate": 14.7
  },
  {
    "sgisCode": "11",
    "name": "서울",
    "year": 2020,
    "population": 9586195,
    "householdCount": 3982290,
    "agingRate": 15.6
  },
  {
    "sgisCode": "11",
    "name": "서울",
    "year": 2021,
    "population": 9472127,
    "householdCount": 4046799,
    "agingRate": 16.5
  },
  {
    "sgisCode": "11",
    "name": "서울",
    "year": 2022,
    "population": 9417469,
    "householdCount": 4098818,
    "agingRate": 17.4
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "year": 2018,
    "population": 2936117,
    "householdCount": 1094749,
    "agingRate": 12.2
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "year": 2019,
    "population": 2952237,
    "householdCount": 1120576,
    "agingRate": 12.8
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "year": 2020,
    "population": 2945454,
    "householdCount": 1147200,
    "agingRate": 13.8
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "year": 2021,
    "population": 2957044,
    "householdCount": 1183610,
    "agingRate": 14.6
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "year": 2022,
    "population": 2989125,
    "householdCount": 1212731,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "year": 2018,
    "population": 13103192,
    "householdCount": 4751498,
    "agingRate": 11.7
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "year": 2019,
    "population": 13300900,
    "householdCount": 4907660,
    "agingRate": 12.3
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "year": 2020,
    "population": 13511676,
    "householdCount": 5098431,
    "agingRate": 13
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "year": 2021,
    "population": 13652529,
    "householdCount": 5290662,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "year": 2022,
    "population": 13717827,
    "householdCount": 5406963,
    "agingRate": 14.5
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "year": 2018,
    "population": 1520391,
    "householdCount": 628484,
    "agingRate": 18.4
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "year": 2019,
    "population": 1520127,
    "householdCount": 633942,
    "agingRate": 19.2
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "year": 2020,
    "population": 1521763,
    "householdCount": 661039,
    "agingRate": 20.3
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "year": 2021,
    "population": 1521890,
    "householdCount": 674728,
    "agingRate": 21.3
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "year": 2022,
    "population": 1528037,
    "householdCount": 684895,
    "agingRate": 22.3
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "year": 2018,
    "population": 1620931,
    "householdCount": 640977,
    "agingRate": 15.8
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "year": 2019,
    "population": 1629343,
    "householdCount": 654713,
    "agingRate": 16.4
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "year": 2020,
    "population": 1632088,
    "householdCount": 678922,
    "agingRate": 17.2
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "year": 2021,
    "population": 1624764,
    "householdCount": 695611,
    "agingRate": 18.2
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "year": 2022,
    "population": 1624993,
    "householdCount": 704864,
    "agingRate": 19.1
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "year": 2018,
    "population": 312374,
    "householdCount": 119029,
    "agingRate": 8.9
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "year": 2019,
    "population": 338136,
    "householdCount": 129664,
    "agingRate": 9
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "year": 2020,
    "population": 353933,
    "householdCount": 139106,
    "agingRate": 9.3
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "year": 2021,
    "population": 366227,
    "householdCount": 145295,
    "agingRate": 9.8
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "year": 2022,
    "population": 382589,
    "householdCount": 154019,
    "agingRate": 10.1
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "year": 2018,
    "population": 1511214,
    "householdCount": 602175,
    "agingRate": 12.4
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "year": 2019,
    "population": 1498839,
    "householdCount": 609043,
    "agingRate": 13.1
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "year": 2020,
    "population": 1488435,
    "householdCount": 631208,
    "agingRate": 14.1
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "year": 2021,
    "population": 1479740,
    "householdCount": 640085,
    "agingRate": 14.9
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "year": 2022,
    "population": 1473662,
    "householdCount": 646474,
    "agingRate": 15.8
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "year": 2018,
    "population": 2181416,
    "householdCount": 851124,
    "agingRate": 16.6
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "year": 2019,
    "population": 2188649,
    "householdCount": 864102,
    "agingRate": 17.2
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "year": 2020,
    "population": 2176636,
    "householdCount": 892222,
    "agingRate": 18.1
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "year": 2021,
    "population": 2175960,
    "householdCount": 915634,
    "agingRate": 18.9
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "year": 2022,
    "population": 2193214,
    "householdCount": 931370,
    "agingRate": 19.6
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "year": 2018,
    "population": 1818157,
    "householdCount": 732980,
    "agingRate": 19.2
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "year": 2019,
    "population": 1807423,
    "householdCount": 738307,
    "agingRate": 19.9
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "year": 2020,
    "population": 1802766,
    "householdCount": 755575,
    "agingRate": 20.8
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "year": 2021,
    "population": 1787053,
    "householdCount": 772471,
    "agingRate": 21.7
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "year": 2022,
    "population": 1774248,
    "householdCount": 777680,
    "agingRate": 22.6
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "year": 2018,
    "population": 1490092,
    "householdCount": 578559,
    "agingRate": 12.6
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "year": 2019,
    "population": 1489730,
    "householdCount": 587159,
    "agingRate": 13.2
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "year": 2020,
    "population": 1477573,
    "householdCount": 599217,
    "agingRate": 14
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "year": 2021,
    "population": 1475262,
    "householdCount": 615693,
    "agingRate": 14.6
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "year": 2022,
    "population": 1468972,
    "householdCount": 623252,
    "agingRate": 15.4
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "year": 2018,
    "population": 1790352,
    "householdCount": 737406,
    "agingRate": 21.9
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "year": 2019,
    "population": 1787543,
    "householdCount": 741026,
    "agingRate": 22.3
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "year": 2020,
    "population": 1788807,
    "householdCount": 761518,
    "agingRate": 23.1
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "year": 2021,
    "population": 1778124,
    "householdCount": 777358,
    "agingRate": 23.9
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "year": 2022,
    "population": 1771431,
    "householdCount": 784645,
    "agingRate": 24.7
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "year": 2018,
    "population": 3395278,
    "householdCount": 1363608,
    "agingRate": 16.9
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "year": 2019,
    "population": 3372692,
    "householdCount": 1377030,
    "agingRate": 17.9
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "year": 2020,
    "population": 3349016,
    "householdCount": 1405037,
    "agingRate": 19.1
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "year": 2021,
    "population": 3324335,
    "householdCount": 1431365,
    "agingRate": 20.2
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "year": 2022,
    "population": 3295760,
    "householdCount": 1447825,
    "agingRate": 21.3
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "year": 2018,
    "population": 2466689,
    "householdCount": 968081,
    "agingRate": 14.8
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "year": 2019,
    "population": 2452146,
    "householdCount": 979180,
    "agingRate": 15.6
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "year": 2020,
    "population": 2432796,
    "householdCount": 996542,
    "agingRate": 16.6
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "year": 2021,
    "population": 2409196,
    "householdCount": 1011728,
    "agingRate": 17.6
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "year": 2022,
    "population": 2388649,
    "householdCount": 1022019,
    "agingRate": 18.5
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "year": 2018,
    "population": 1150114,
    "householdCount": 431391,
    "agingRate": 10.6
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "year": 2019,
    "population": 1143692,
    "householdCount": 437094,
    "agingRate": 11.4
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "year": 2020,
    "population": 1135423,
    "householdCount": 444087,
    "agingRate": 12.4
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "year": 2021,
    "population": 1120753,
    "householdCount": 451432,
    "agingRate": 13.5
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "year": 2022,
    "population": 1110516,
    "householdCount": 453998,
    "agingRate": 14.5
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "year": 2018,
    "population": 2650629,
    "householdCount": 1083970,
    "agingRate": 19.1
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "year": 2019,
    "population": 2645948,
    "householdCount": 1092374,
    "agingRate": 19.9
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "year": 2020,
    "population": 2622661,
    "householdCount": 1121093,
    "agingRate": 20.9
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "year": 2021,
    "population": 2614029,
    "householdCount": 1145848,
    "agingRate": 21.9
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "year": 2022,
    "population": 2598576,
    "householdCount": 1155121,
    "agingRate": 22.9
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "year": 2018,
    "population": 3350352,
    "householdCount": 1306394,
    "agingRate": 15.2
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "year": 2019,
    "population": 3347209,
    "householdCount": 1321213,
    "agingRate": 15.9
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "year": 2020,
    "population": 3333056,
    "householdCount": 1350155,
    "agingRate": 16.9
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "year": 2021,
    "population": 3305931,
    "householdCount": 1378982,
    "agingRate": 18
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "year": 2022,
    "population": 3280829,
    "householdCount": 1392608,
    "agingRate": 19
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2018,
    "population": 658282,
    "householdCount": 248998,
    "agingRate": 14.2
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2019,
    "population": 665048,
    "householdCount": 253716,
    "agingRate": 14.6
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2020,
    "population": 670858,
    "householdCount": 263068,
    "agingRate": 15.4
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2021,
    "population": 673107,
    "householdCount": 271162,
    "agingRate": 16.1
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2022,
    "population": 676375,
    "householdCount": 276225,
    "agingRate": 16.7
  }
];

/**
 * 특정 SGIS 코드의 연도별 시계열을 반환한다.
 * 시군구·시도 모두 지원. 연도 오름차순.
 */
export function getPopulationTrend(
  sgisCode: string,
): PopulationTrendPoint[] {
  const source = sgisCode.length === 2
    ? POPULATION_TREND_SIDO
    : POPULATION_TREND_SIGUNGU;
  return source
    .filter((p) => p.sgisCode === sgisCode)
    .sort((a, b) => a.year - b.year);
}
