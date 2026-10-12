/**
 * 인구 추이 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-population-trend.ts
 * 데이터 소스: 통계청 SGIS 인구통계 (1~2년 지연)
 * 수집 연도: 2020, 2021, 2022, 2023, 2024
 * 마지막 수집: 2026-10-12
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
export const POPULATION_TREND_YEARS = [2020,2021,2022,2023,2024] as const;

/** 시군구 인구 시계열 (SGIS 5자리 × 연도) */
export const POPULATION_TREND_SIGUNGU: PopulationTrendPoint[] = [
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
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2023,
    "population": 146179,
    "householdCount": 64507,
    "agingRate": 18.7
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2023,
    "population": 127576,
    "householdCount": 59265,
    "agingRate": 19.3
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2023,
    "population": 214791,
    "householdCount": 98322,
    "agingRate": 17.7
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2023,
    "population": 277683,
    "householdCount": 123124,
    "agingRate": 17.4
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2023,
    "population": 348160,
    "householdCount": 158612,
    "agingRate": 16.2
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2023,
    "population": 355999,
    "householdCount": 159457,
    "agingRate": 18.4
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2023,
    "population": 376621,
    "householdCount": 171823,
    "agingRate": 20.5
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2023,
    "population": 432874,
    "householdCount": 184404,
    "agingRate": 18.2
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2023,
    "population": 284155,
    "householdCount": 131363,
    "agingRate": 23.6
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2023,
    "population": 299931,
    "householdCount": 129149,
    "agingRate": 23
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2023,
    "population": 492979,
    "householdCount": 205769,
    "agingRate": 19.1
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2023,
    "population": 452988,
    "householdCount": 198534,
    "agingRate": 20.2
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2023,
    "population": 320168,
    "householdCount": 138166,
    "agingRate": 17.6
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2023,
    "population": 361380,
    "householdCount": 167410,
    "agingRate": 15.5
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2023,
    "population": 422248,
    "householdCount": 169479,
    "agingRate": 17.7
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2023,
    "population": 549557,
    "householdCount": 255617,
    "agingRate": 18.2
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2023,
    "population": 423397,
    "householdCount": 171257,
    "agingRate": 19.7
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2023,
    "population": 245860,
    "householdCount": 111789,
    "agingRate": 19.2
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2023,
    "population": 400544,
    "householdCount": 174908,
    "agingRate": 17.5
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2023,
    "population": 384089,
    "householdCount": 173897,
    "agingRate": 18.1
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2023,
    "population": 493677,
    "householdCount": 263166,
    "agingRate": 17.2
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2023,
    "population": 385267,
    "householdCount": 157290,
    "agingRate": 16.5
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2023,
    "population": 511084,
    "householdCount": 218895,
    "agingRate": 16.3
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2023,
    "population": 630744,
    "householdCount": 265857,
    "agingRate": 16.8
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2023,
    "population": 446561,
    "householdCount": 189599,
    "agingRate": 18.3
  },
  {
    "sgisCode": "11010",
    "name": "종로구",
    "year": 2024,
    "population": 144486,
    "householdCount": 64643,
    "agingRate": 19.7
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "year": 2024,
    "population": 126899,
    "householdCount": 59849,
    "agingRate": 20.2
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "year": 2024,
    "population": 203401,
    "householdCount": 93491,
    "agingRate": 18.3
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "year": 2024,
    "population": 274688,
    "householdCount": 122894,
    "agingRate": 18.3
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "year": 2024,
    "population": 345130,
    "householdCount": 158609,
    "agingRate": 17.2
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "year": 2024,
    "population": 355789,
    "householdCount": 160767,
    "agingRate": 19.2
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "year": 2024,
    "population": 375066,
    "householdCount": 173326,
    "agingRate": 21.7
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "year": 2024,
    "population": 429210,
    "householdCount": 184228,
    "agingRate": 19
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "year": 2024,
    "population": 280470,
    "householdCount": 130929,
    "agingRate": 24.9
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "year": 2024,
    "population": 296997,
    "householdCount": 129841,
    "agingRate": 24.4
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "year": 2024,
    "population": 486446,
    "householdCount": 205666,
    "agingRate": 20.2
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "year": 2024,
    "population": 448142,
    "householdCount": 198916,
    "agingRate": 21.3
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "year": 2024,
    "population": 316345,
    "householdCount": 137979,
    "agingRate": 18.4
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "year": 2024,
    "population": 358927,
    "householdCount": 167967,
    "agingRate": 16.1
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "year": 2024,
    "population": 417397,
    "householdCount": 169044,
    "agingRate": 18.8
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "year": 2024,
    "population": 543974,
    "householdCount": 256036,
    "agingRate": 19.3
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "year": 2024,
    "population": 418832,
    "householdCount": 171388,
    "agingRate": 20.9
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "year": 2024,
    "population": 243662,
    "householdCount": 112676,
    "agingRate": 20.5
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "year": 2024,
    "population": 400799,
    "householdCount": 176587,
    "agingRate": 18.3
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "year": 2024,
    "population": 381172,
    "householdCount": 173615,
    "agingRate": 18.9
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "year": 2024,
    "population": 490493,
    "householdCount": 264148,
    "agingRate": 17.9
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "year": 2024,
    "population": 386254,
    "householdCount": 158384,
    "agingRate": 17.2
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "year": 2024,
    "population": 528194,
    "householdCount": 226333,
    "agingRate": 16.8
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "year": 2024,
    "population": 628648,
    "householdCount": 267817,
    "agingRate": 17.7
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "year": 2024,
    "population": 454023,
    "householdCount": 194369,
    "agingRate": 19.2
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
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2023,
    "population": 408476,
    "householdCount": 148578,
    "agingRate": 11.6
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2023,
    "population": 500087,
    "householdCount": 209484,
    "agingRate": 17.2
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2023,
    "population": 498558,
    "householdCount": 205580,
    "agingRate": 17.7
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2023,
    "population": 279818,
    "householdCount": 116641,
    "agingRate": 16.9
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2023,
    "population": 414941,
    "householdCount": 180687,
    "agingRate": 19.2
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2023,
    "population": 66246,
    "householdCount": 29379,
    "agingRate": 36.9
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2023,
    "population": 19286,
    "householdCount": 9877,
    "agingRate": 30.8
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "year": 2024,
    "population": 417391,
    "householdCount": 153239,
    "agingRate": 12.4
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "year": 2024,
    "population": 492920,
    "householdCount": 209333,
    "agingRate": 18.7
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "year": 2024,
    "population": 504885,
    "householdCount": 210282,
    "agingRate": 18.7
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "year": 2024,
    "population": 278600,
    "householdCount": 118278,
    "agingRate": 18.3
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "year": 2024,
    "population": 421789,
    "householdCount": 184785,
    "agingRate": 20
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "year": 2024,
    "population": 66309,
    "householdCount": 29769,
    "agingRate": 38.7
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "year": 2024,
    "population": 19192,
    "householdCount": 9883,
    "agingRate": 32.5
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
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2023,
    "population": 275209,
    "householdCount": 110588,
    "agingRate": 15.6
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2023,
    "population": 372852,
    "householdCount": 154095,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2023,
    "population": 211665,
    "householdCount": 91149,
    "agingRate": 16
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2023,
    "population": 366636,
    "householdCount": 147736,
    "agingRate": 9
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2023,
    "population": 241230,
    "householdCount": 105884,
    "agingRate": 18.2
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2023,
    "population": 210665,
    "householdCount": 93755,
    "agingRate": 18.4
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2023,
    "population": 451221,
    "householdCount": 180364,
    "agingRate": 15.2
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2023,
    "population": 458966,
    "householdCount": 193577,
    "agingRate": 17.8
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2023,
    "population": 234408,
    "householdCount": 95384,
    "agingRate": 19.1
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2023,
    "population": 302751,
    "householdCount": 118431,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2023,
    "population": 405077,
    "householdCount": 162567,
    "agingRate": 16.1
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2023,
    "population": 242773,
    "householdCount": 92784,
    "agingRate": 18.3
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2023,
    "population": 155662,
    "householdCount": 65056,
    "agingRate": 18.2
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2023,
    "population": 275397,
    "householdCount": 107445,
    "agingRate": 16.8
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2023,
    "population": 605678,
    "householdCount": 253667,
    "agingRate": 12.8
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2023,
    "population": 91301,
    "householdCount": 39014,
    "agingRate": 23.7
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2023,
    "population": 355957,
    "householdCount": 142660,
    "agingRate": 13.8
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2023,
    "population": 353190,
    "householdCount": 125368,
    "agingRate": 12.5
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2023,
    "population": 484424,
    "householdCount": 203461,
    "agingRate": 16.9
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2023,
    "population": 285959,
    "householdCount": 117087,
    "agingRate": 16.2
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2023,
    "population": 277209,
    "householdCount": 106524,
    "agingRate": 15.9
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2023,
    "population": 76824,
    "householdCount": 27702,
    "agingRate": 14.7
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2023,
    "population": 183048,
    "householdCount": 74350,
    "agingRate": 16.7
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2023,
    "population": 716123,
    "householdCount": 276687,
    "agingRate": 16.8
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2023,
    "population": 243832,
    "householdCount": 98406,
    "agingRate": 11.8
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2023,
    "population": 568455,
    "householdCount": 213014,
    "agingRate": 11.2
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2023,
    "population": 263939,
    "householdCount": 105892,
    "agingRate": 16.7
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2023,
    "population": 154788,
    "householdCount": 60145,
    "agingRate": 16.9
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2023,
    "population": 320562,
    "householdCount": 131044,
    "agingRate": 14.6
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2023,
    "population": 274005,
    "householdCount": 107739,
    "agingRate": 16.1
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2023,
    "population": 428463,
    "householdCount": 162728,
    "agingRate": 15.6
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2023,
    "population": 364511,
    "householdCount": 134824,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2023,
    "population": 495339,
    "householdCount": 194815,
    "agingRate": 15.6
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2023,
    "population": 228695,
    "householdCount": 90581,
    "agingRate": 15.8
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2023,
    "population": 210390,
    "householdCount": 82975,
    "agingRate": 18.2
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2023,
    "population": 496323,
    "householdCount": 188422,
    "agingRate": 14.2
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2023,
    "population": 974156,
    "householdCount": 375093,
    "agingRate": 9.8
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2023,
    "population": 394667,
    "householdCount": 154441,
    "agingRate": 16
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2023,
    "population": 269641,
    "householdCount": 105751,
    "agingRate": 17.4
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2023,
    "population": 157111,
    "householdCount": 62070,
    "agingRate": 21.5
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2023,
    "population": 116045,
    "householdCount": 48619,
    "agingRate": 24.1
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2023,
    "population": 41007,
    "householdCount": 18647,
    "agingRate": 30.2
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2023,
    "population": 59893,
    "householdCount": 27241,
    "agingRate": 29.4
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2023,
    "population": 119320,
    "householdCount": 52242,
    "agingRate": 29.3
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "year": 2024,
    "population": 280812,
    "householdCount": 114321,
    "agingRate": 16.4
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "year": 2024,
    "population": 370600,
    "householdCount": 155236,
    "agingRate": 14.9
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "year": 2024,
    "population": 208817,
    "householdCount": 90276,
    "agingRate": 17
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "year": 2024,
    "population": 364750,
    "householdCount": 148731,
    "agingRate": 9.6
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "year": 2024,
    "population": 246990,
    "householdCount": 109006,
    "agingRate": 19
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "year": 2024,
    "population": 205957,
    "householdCount": 93112,
    "agingRate": 19.8
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "year": 2024,
    "population": 447920,
    "householdCount": 180886,
    "agingRate": 16.1
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "year": 2024,
    "population": 456516,
    "householdCount": 194238,
    "agingRate": 18.9
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "year": 2024,
    "population": 229980,
    "householdCount": 95009,
    "agingRate": 20.6
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "year": 2024,
    "population": 315820,
    "householdCount": 125090,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "year": 2024,
    "population": 401522,
    "householdCount": 164060,
    "agingRate": 17.5
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "year": 2024,
    "population": 240865,
    "householdCount": 93540,
    "agingRate": 19.7
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "year": 2024,
    "population": 151695,
    "householdCount": 64770,
    "agingRate": 20.1
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "year": 2024,
    "population": 272371,
    "householdCount": 107268,
    "agingRate": 18
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "year": 2024,
    "population": 615755,
    "householdCount": 260328,
    "agingRate": 13.5
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "year": 2024,
    "population": 89466,
    "householdCount": 38765,
    "agingRate": 25.2
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "year": 2024,
    "population": 348328,
    "householdCount": 141317,
    "agingRate": 15
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "year": 2024,
    "population": 353223,
    "householdCount": 126632,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "year": 2024,
    "population": 482446,
    "householdCount": 204590,
    "agingRate": 17.9
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "year": 2024,
    "population": 288578,
    "householdCount": 118943,
    "agingRate": 17.3
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "year": 2024,
    "population": 273944,
    "householdCount": 106542,
    "agingRate": 17.2
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "year": 2024,
    "population": 81213,
    "householdCount": 29182,
    "agingRate": 15.1
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "year": 2024,
    "population": 182102,
    "householdCount": 75031,
    "agingRate": 17.9
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "year": 2024,
    "population": 718385,
    "householdCount": 280404,
    "agingRate": 17.9
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "year": 2024,
    "population": 254071,
    "householdCount": 103897,
    "agingRate": 12.4
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "year": 2024,
    "population": 571982,
    "householdCount": 214491,
    "agingRate": 12.2
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "year": 2024,
    "population": 258110,
    "householdCount": 105395,
    "agingRate": 18.2
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "year": 2024,
    "population": 151306,
    "householdCount": 59181,
    "agingRate": 18.3
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "year": 2024,
    "population": 320872,
    "householdCount": 131561,
    "agingRate": 15.6
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "year": 2024,
    "population": 286273,
    "householdCount": 113692,
    "agingRate": 16.7
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "year": 2024,
    "population": 429488,
    "householdCount": 165282,
    "agingRate": 16.5
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "year": 2024,
    "population": 361720,
    "householdCount": 134781,
    "agingRate": 15.6
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "year": 2024,
    "population": 510689,
    "householdCount": 201200,
    "agingRate": 16.1
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "year": 2024,
    "population": 230189,
    "householdCount": 92642,
    "agingRate": 16.7
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "year": 2024,
    "population": 215739,
    "householdCount": 86190,
    "agingRate": 18.9
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "year": 2024,
    "population": 499536,
    "householdCount": 190489,
    "agingRate": 15.2
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "year": 2024,
    "population": 1004079,
    "householdCount": 388620,
    "agingRate": 10.4
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "year": 2024,
    "population": 402335,
    "householdCount": 158681,
    "agingRate": 17
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "year": 2024,
    "population": 293000,
    "householdCount": 116280,
    "agingRate": 17.6
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "year": 2024,
    "population": 157166,
    "householdCount": 62351,
    "agingRate": 23.2
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "year": 2024,
    "population": 117477,
    "householdCount": 49618,
    "agingRate": 25.3
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "year": 2024,
    "population": 40386,
    "householdCount": 18486,
    "agingRate": 31.8
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "year": 2024,
    "population": 60384,
    "householdCount": 27941,
    "agingRate": 31
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "year": 2024,
    "population": 121622,
    "householdCount": 54017,
    "agingRate": 30.8
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
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2023,
    "population": 292504,
    "householdCount": 128682,
    "agingRate": 19.8
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2023,
    "population": 364912,
    "householdCount": 162343,
    "agingRate": 17.5
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2023,
    "population": 213786,
    "householdCount": 98918,
    "agingRate": 23.7
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2023,
    "population": 86222,
    "householdCount": 39492,
    "agingRate": 23.8
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2023,
    "population": 38425,
    "householdCount": 18657,
    "agingRate": 29.3
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2023,
    "population": 80497,
    "householdCount": 38042,
    "agingRate": 22.6
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2023,
    "population": 63542,
    "householdCount": 30225,
    "agingRate": 27.4
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2023,
    "population": 65109,
    "householdCount": 30685,
    "agingRate": 31.4
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2023,
    "population": 45789,
    "householdCount": 21006,
    "agingRate": 33.5
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2023,
    "population": 35581,
    "householdCount": 18013,
    "agingRate": 34.2
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2023,
    "population": 38959,
    "householdCount": 19175,
    "agingRate": 32.9
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2023,
    "population": 32793,
    "householdCount": 16413,
    "agingRate": 32.8
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2023,
    "population": 40702,
    "householdCount": 17365,
    "agingRate": 26.1
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2023,
    "population": 22372,
    "householdCount": 10239,
    "agingRate": 26.4
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2023,
    "population": 20943,
    "householdCount": 9027,
    "agingRate": 24.5
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2023,
    "population": 31490,
    "householdCount": 14021,
    "agingRate": 23.1
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2023,
    "population": 27811,
    "householdCount": 12866,
    "agingRate": 30.2
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2023,
    "population": 26577,
    "householdCount": 13241,
    "agingRate": 34.1
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "year": 2024,
    "population": 291783,
    "householdCount": 129466,
    "agingRate": 20.8
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "year": 2024,
    "population": 365720,
    "householdCount": 164385,
    "agingRate": 18.6
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "year": 2024,
    "population": 212352,
    "householdCount": 98987,
    "agingRate": 25.1
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "year": 2024,
    "population": 85673,
    "householdCount": 39776,
    "agingRate": 25.1
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "year": 2024,
    "population": 37590,
    "householdCount": 18551,
    "agingRate": 31
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "year": 2024,
    "population": 79758,
    "householdCount": 38116,
    "agingRate": 24
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "year": 2024,
    "population": 62953,
    "householdCount": 30275,
    "agingRate": 28.8
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "year": 2024,
    "population": 65719,
    "householdCount": 31062,
    "agingRate": 32.7
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "year": 2024,
    "population": 45947,
    "householdCount": 21229,
    "agingRate": 35.2
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "year": 2024,
    "population": 35449,
    "householdCount": 18107,
    "agingRate": 35.6
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "year": 2024,
    "population": 39016,
    "householdCount": 19383,
    "agingRate": 34.4
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "year": 2024,
    "population": 32503,
    "householdCount": 16473,
    "agingRate": 34.3
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "year": 2024,
    "population": 40069,
    "householdCount": 17349,
    "agingRate": 27.5
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "year": 2024,
    "population": 22278,
    "householdCount": 10287,
    "agingRate": 27.4
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "year": 2024,
    "population": 20443,
    "householdCount": 8967,
    "agingRate": 25.9
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "year": 2024,
    "population": 31167,
    "householdCount": 14093,
    "agingRate": 24.4
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "year": 2024,
    "population": 27774,
    "householdCount": 12838,
    "agingRate": 31.4
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "year": 2024,
    "population": 26687,
    "householdCount": 13259,
    "agingRate": 35.2
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
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2023,
    "population": 215990,
    "householdCount": 97709,
    "agingRate": 22
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2023,
    "population": 131583,
    "householdCount": 59900,
    "agingRate": 25.2
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2023,
    "population": 197451,
    "householdCount": 82951,
    "agingRate": 17.5
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2023,
    "population": 195222,
    "householdCount": 85942,
    "agingRate": 17.6
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2023,
    "population": 281394,
    "householdCount": 122901,
    "agingRate": 12.9
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2023,
    "population": 196291,
    "householdCount": 84993,
    "agingRate": 14.7
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2023,
    "population": 30226,
    "householdCount": 14460,
    "agingRate": 38.6
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2023,
    "population": 47771,
    "householdCount": 21650,
    "agingRate": 33.4
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2023,
    "population": 44331,
    "householdCount": 21114,
    "agingRate": 35.3
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2023,
    "population": 94405,
    "householdCount": 38111,
    "agingRate": 16.7
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2023,
    "population": 37607,
    "householdCount": 18191,
    "agingRate": 36.5
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2023,
    "population": 104615,
    "householdCount": 42185,
    "agingRate": 21.2
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2023,
    "population": 26473,
    "householdCount": 13086,
    "agingRate": 36.4
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2023,
    "population": 38122,
    "householdCount": 17038,
    "agingRate": 19.8
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "year": 2024,
    "population": 215904,
    "householdCount": 98610,
    "agingRate": 23.1
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "year": 2024,
    "population": 130733,
    "householdCount": 59785,
    "agingRate": 26.6
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "year": 2024,
    "population": 195499,
    "householdCount": 82964,
    "agingRate": 18.6
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "year": 2024,
    "population": 190979,
    "householdCount": 84953,
    "agingRate": 18.9
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "year": 2024,
    "population": 291048,
    "householdCount": 128364,
    "agingRate": 13.3
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "year": 2024,
    "population": 195842,
    "householdCount": 85315,
    "agingRate": 15.7
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "year": 2024,
    "population": 29858,
    "householdCount": 14470,
    "agingRate": 40.1
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "year": 2024,
    "population": 47416,
    "householdCount": 21622,
    "agingRate": 34.6
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "year": 2024,
    "population": 43730,
    "householdCount": 20939,
    "agingRate": 36.8
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "year": 2024,
    "population": 96544,
    "householdCount": 38826,
    "agingRate": 17.3
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "year": 2024,
    "population": 37346,
    "householdCount": 18293,
    "agingRate": 38
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "year": 2024,
    "population": 106652,
    "householdCount": 42537,
    "agingRate": 21.8
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "year": 2024,
    "population": 26597,
    "householdCount": 13172,
    "agingRate": 37.6
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "year": 2024,
    "population": 38180,
    "householdCount": 17138,
    "agingRate": 20.8
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
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2023,
    "population": 386261,
    "householdCount": 156444,
    "agingRate": 10.5
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "year": 2024,
    "population": 390156,
    "householdCount": 158901,
    "agingRate": 11.1
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
    "sgisCode": "25010",
    "name": "동구",
    "year": 2023,
    "population": 230134,
    "householdCount": 106617,
    "agingRate": 20.6
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2023,
    "population": 220292,
    "householdCount": 98670,
    "agingRate": 23
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2023,
    "population": 469031,
    "householdCount": 210520,
    "agingRate": 15.2
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2023,
    "population": 379100,
    "householdCount": 162551,
    "agingRate": 11.2
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2023,
    "population": 171779,
    "householdCount": 76451,
    "agingRate": 18.9
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "year": 2024,
    "population": 229875,
    "householdCount": 106763,
    "agingRate": 21.7
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "year": 2024,
    "population": 220497,
    "householdCount": 99781,
    "agingRate": 23.8
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "year": 2024,
    "population": 462226,
    "householdCount": 209783,
    "agingRate": 16.3
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "year": 2024,
    "population": 384024,
    "householdCount": 165705,
    "agingRate": 12
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "year": 2024,
    "population": 170471,
    "householdCount": 76799,
    "agingRate": 20.3
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
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2023,
    "population": 275944,
    "householdCount": 115739,
    "agingRate": 16
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2023,
    "population": 413907,
    "householdCount": 175824,
    "agingRate": 10.3
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2023,
    "population": 105498,
    "householdCount": 47452,
    "agingRate": 28.3
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2023,
    "population": 96890,
    "householdCount": 43912,
    "agingRate": 28.4
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2023,
    "population": 376632,
    "householdCount": 146899,
    "agingRate": 13.2
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2023,
    "population": 178618,
    "householdCount": 77564,
    "agingRate": 20.3
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2023,
    "population": 115925,
    "householdCount": 50401,
    "agingRate": 28.3
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2023,
    "population": 44822,
    "householdCount": 18349,
    "agingRate": 14.5
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2023,
    "population": 174955,
    "householdCount": 75714,
    "agingRate": 19.7
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2023,
    "population": 53124,
    "householdCount": 23354,
    "agingRate": 31.4
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2023,
    "population": 60991,
    "householdCount": 27956,
    "agingRate": 38.2
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2023,
    "population": 49294,
    "householdCount": 23135,
    "agingRate": 39.4
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2023,
    "population": 29972,
    "householdCount": 13801,
    "agingRate": 37.9
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2023,
    "population": 100015,
    "householdCount": 43845,
    "agingRate": 25.3
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2023,
    "population": 79229,
    "householdCount": 35961,
    "agingRate": 32.4
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2023,
    "population": 60516,
    "householdCount": 28725,
    "agingRate": 34.1
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "year": 2024,
    "population": 279621,
    "householdCount": 118114,
    "agingRate": 16.9
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "year": 2024,
    "population": 415144,
    "householdCount": 176860,
    "agingRate": 11.1
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "year": 2024,
    "population": 104393,
    "householdCount": 47903,
    "agingRate": 29.5
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "year": 2024,
    "population": 96182,
    "householdCount": 43802,
    "agingRate": 29.4
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "year": 2024,
    "population": 392509,
    "householdCount": 153914,
    "agingRate": 13.5
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "year": 2024,
    "population": 178586,
    "householdCount": 78442,
    "agingRate": 21.3
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "year": 2024,
    "population": 114692,
    "householdCount": 50237,
    "agingRate": 29.6
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "year": 2024,
    "population": 45026,
    "householdCount": 18551,
    "agingRate": 15.5
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "year": 2024,
    "population": 177715,
    "householdCount": 77685,
    "agingRate": 20.3
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "year": 2024,
    "population": 53212,
    "householdCount": 23752,
    "agingRate": 32.1
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "year": 2024,
    "population": 59930,
    "householdCount": 27807,
    "agingRate": 39.5
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "year": 2024,
    "population": 48575,
    "householdCount": 22881,
    "agingRate": 40.5
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "year": 2024,
    "population": 29818,
    "householdCount": 13709,
    "agingRate": 38.7
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "year": 2024,
    "population": 102178,
    "householdCount": 45485,
    "agingRate": 25.7
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "year": 2024,
    "population": 79848,
    "householdCount": 36320,
    "agingRate": 33.2
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "year": 2024,
    "population": 60814,
    "householdCount": 29076,
    "agingRate": 35.1
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
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2023,
    "population": 333353,
    "householdCount": 146921,
    "agingRate": 18.7
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2023,
    "population": 324679,
    "householdCount": 137271,
    "agingRate": 15.7
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2023,
    "population": 265764,
    "householdCount": 116911,
    "agingRate": 21.1
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2023,
    "population": 274350,
    "householdCount": 121458,
    "agingRate": 22.1
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2023,
    "population": 102507,
    "householdCount": 47323,
    "agingRate": 30.2
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2023,
    "population": 74554,
    "householdCount": 34712,
    "agingRate": 31.4
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2023,
    "population": 79663,
    "householdCount": 36483,
    "agingRate": 33.5
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2023,
    "population": 101002,
    "householdCount": 44049,
    "agingRate": 23.1
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2023,
    "population": 22843,
    "householdCount": 10928,
    "agingRate": 38.3
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2023,
    "population": 22401,
    "householdCount": 10864,
    "agingRate": 36.3
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2023,
    "population": 19914,
    "householdCount": 9456,
    "agingRate": 37.7
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2023,
    "population": 24509,
    "householdCount": 12066,
    "agingRate": 38.7
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2023,
    "population": 25368,
    "householdCount": 11941,
    "agingRate": 36.7
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2023,
    "population": 50731,
    "householdCount": 23871,
    "agingRate": 37.2
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2023,
    "population": 46853,
    "householdCount": 22521,
    "agingRate": 36.8
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "year": 2024,
    "population": 327406,
    "householdCount": 146418,
    "agingRate": 19.9
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "year": 2024,
    "population": 322228,
    "householdCount": 137378,
    "agingRate": 16.7
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "year": 2024,
    "population": 265473,
    "householdCount": 117450,
    "agingRate": 22
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "year": 2024,
    "population": 272392,
    "householdCount": 121801,
    "agingRate": 23.3
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "year": 2024,
    "population": 101887,
    "householdCount": 47287,
    "agingRate": 31
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "year": 2024,
    "population": 73781,
    "householdCount": 34859,
    "agingRate": 32.4
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "year": 2024,
    "population": 79692,
    "householdCount": 36667,
    "agingRate": 34.1
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "year": 2024,
    "population": 102877,
    "householdCount": 45051,
    "agingRate": 23.5
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "year": 2024,
    "population": 22855,
    "householdCount": 11014,
    "agingRate": 39.1
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "year": 2024,
    "population": 22904,
    "householdCount": 10864,
    "agingRate": 36.4
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "year": 2024,
    "population": 19838,
    "householdCount": 9479,
    "agingRate": 38.6
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "year": 2024,
    "population": 24275,
    "householdCount": 12027,
    "agingRate": 39.8
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "year": 2024,
    "population": 25494,
    "householdCount": 11990,
    "agingRate": 37.4
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "year": 2024,
    "population": 51371,
    "householdCount": 23951,
    "agingRate": 37.6
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "year": 2024,
    "population": 46363,
    "householdCount": 22385,
    "agingRate": 37.9
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
    "sgisCode": "24010",
    "name": "동구",
    "year": 2023,
    "population": 112016,
    "householdCount": 52727,
    "agingRate": 22
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2023,
    "population": 284014,
    "householdCount": 128794,
    "agingRate": 17.1
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2023,
    "population": 211536,
    "householdCount": 90635,
    "agingRate": 20.4
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2023,
    "population": 432033,
    "householdCount": 190468,
    "agingRate": 17.4
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2023,
    "population": 417491,
    "householdCount": 164978,
    "agingRate": 11
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "year": 2024,
    "population": 111289,
    "householdCount": 52807,
    "agingRate": 22.9
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "year": 2024,
    "population": 278639,
    "householdCount": 127177,
    "agingRate": 18.2
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "year": 2024,
    "population": 208707,
    "householdCount": 90230,
    "agingRate": 21.6
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "year": 2024,
    "population": 433088,
    "householdCount": 193108,
    "agingRate": 18.5
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "year": 2024,
    "population": 412447,
    "householdCount": 165228,
    "agingRate": 11.9
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
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2023,
    "population": 217950,
    "householdCount": 96911,
    "agingRate": 19.9
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2023,
    "population": 267392,
    "householdCount": 116299,
    "agingRate": 22.1
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2023,
    "population": 272041,
    "householdCount": 116484,
    "agingRate": 18
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2023,
    "population": 117012,
    "householdCount": 52082,
    "agingRate": 23
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2023,
    "population": 147378,
    "householdCount": 62702,
    "agingRate": 15.6
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2023,
    "population": 43763,
    "householdCount": 19234,
    "agingRate": 33.2
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2023,
    "population": 26273,
    "householdCount": 13018,
    "agingRate": 37.9
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2023,
    "population": 22894,
    "householdCount": 11254,
    "agingRate": 38.8
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2023,
    "population": 58735,
    "householdCount": 30024,
    "agingRate": 43.5
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2023,
    "population": 35955,
    "householdCount": 17986,
    "agingRate": 42
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2023,
    "population": 59354,
    "householdCount": 26750,
    "agingRate": 29.7
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2023,
    "population": 33396,
    "householdCount": 16463,
    "agingRate": 37.5
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2023,
    "population": 31266,
    "householdCount": 15392,
    "agingRate": 37.8
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2023,
    "population": 62459,
    "householdCount": 29232,
    "agingRate": 35.1
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2023,
    "population": 59689,
    "householdCount": 24977,
    "agingRate": 24.1
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2023,
    "population": 90426,
    "householdCount": 38330,
    "agingRate": 19.6
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2023,
    "population": 29259,
    "householdCount": 13808,
    "agingRate": 39.3
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2023,
    "population": 49493,
    "householdCount": 22526,
    "agingRate": 31.1
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2023,
    "population": 40187,
    "householdCount": 17903,
    "agingRate": 32.7
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2023,
    "population": 47655,
    "householdCount": 21172,
    "agingRate": 32.8
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2023,
    "population": 29233,
    "householdCount": 13647,
    "agingRate": 34.4
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2023,
    "population": 34858,
    "householdCount": 17055,
    "agingRate": 39.1
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "year": 2024,
    "population": 214701,
    "householdCount": 96786,
    "agingRate": 21.1
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "year": 2024,
    "population": 265859,
    "householdCount": 116709,
    "agingRate": 23.3
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "year": 2024,
    "population": 271376,
    "householdCount": 117060,
    "agingRate": 19.2
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "year": 2024,
    "population": 118018,
    "householdCount": 52573,
    "agingRate": 23.6
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "year": 2024,
    "population": 150390,
    "householdCount": 64822,
    "agingRate": 16.3
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "year": 2024,
    "population": 43310,
    "householdCount": 19299,
    "agingRate": 34.7
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "year": 2024,
    "population": 25990,
    "householdCount": 13048,
    "agingRate": 39
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "year": 2024,
    "population": 22724,
    "householdCount": 11253,
    "agingRate": 40
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "year": 2024,
    "population": 58776,
    "householdCount": 30127,
    "agingRate": 44.3
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "year": 2024,
    "population": 36033,
    "householdCount": 17925,
    "agingRate": 42.6
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "year": 2024,
    "population": 59174,
    "householdCount": 26850,
    "agingRate": 30.9
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "year": 2024,
    "population": 33351,
    "householdCount": 16425,
    "agingRate": 38.3
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "year": 2024,
    "population": 31042,
    "householdCount": 15375,
    "agingRate": 39
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "year": 2024,
    "population": 62068,
    "householdCount": 29171,
    "agingRate": 36.1
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "year": 2024,
    "population": 60323,
    "householdCount": 25057,
    "agingRate": 24.6
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "year": 2024,
    "population": 92913,
    "householdCount": 39706,
    "agingRate": 19.8
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "year": 2024,
    "population": 29009,
    "householdCount": 13804,
    "agingRate": 40.1
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "year": 2024,
    "population": 50012,
    "householdCount": 22967,
    "agingRate": 31.5
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "year": 2024,
    "population": 40067,
    "householdCount": 18036,
    "agingRate": 33.5
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "year": 2024,
    "population": 48182,
    "householdCount": 21134,
    "agingRate": 33
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "year": 2024,
    "population": 29448,
    "householdCount": 13637,
    "agingRate": 34.5
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "year": 2024,
    "population": 35572,
    "householdCount": 17248,
    "agingRate": 39
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
    "sgisCode": "21010",
    "name": "중구",
    "year": 2023,
    "population": 40487,
    "householdCount": 21497,
    "agingRate": 29.2
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2023,
    "population": 103883,
    "householdCount": 49104,
    "agingRate": 27.5
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2023,
    "population": 87477,
    "householdCount": 42678,
    "agingRate": 28.4
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2023,
    "population": 109389,
    "householdCount": 50216,
    "agingRate": 29.9
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2023,
    "population": 355644,
    "householdCount": 169534,
    "agingRate": 21.9
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2023,
    "population": 265047,
    "householdCount": 112749,
    "agingRate": 21.7
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2023,
    "population": 258412,
    "householdCount": 112697,
    "agingRate": 22.3
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2023,
    "population": 270951,
    "householdCount": 116981,
    "agingRate": 21.6
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2023,
    "population": 370849,
    "householdCount": 160219,
    "agingRate": 21.1
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2023,
    "population": 298826,
    "householdCount": 131845,
    "agingRate": 22.9
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2023,
    "population": 221890,
    "householdCount": 100914,
    "agingRate": 24.2
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2023,
    "population": 144102,
    "householdCount": 56762,
    "agingRate": 13
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2023,
    "population": 198491,
    "householdCount": 88825,
    "agingRate": 22.9
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2023,
    "population": 170220,
    "householdCount": 81720,
    "agingRate": 24.8
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2023,
    "population": 208245,
    "householdCount": 93814,
    "agingRate": 21.8
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2023,
    "population": 175691,
    "householdCount": 72849,
    "agingRate": 18.2
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "year": 2024,
    "population": 39599,
    "householdCount": 21368,
    "agingRate": 30.7
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "year": 2024,
    "population": 103413,
    "householdCount": 49325,
    "agingRate": 28.6
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "year": 2024,
    "population": 85665,
    "householdCount": 42435,
    "agingRate": 29.6
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "year": 2024,
    "population": 106825,
    "householdCount": 49844,
    "agingRate": 31.5
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "year": 2024,
    "population": 356874,
    "householdCount": 172688,
    "agingRate": 22.8
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "year": 2024,
    "population": 265089,
    "householdCount": 113922,
    "agingRate": 22.8
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "year": 2024,
    "population": 260090,
    "householdCount": 114573,
    "agingRate": 23.1
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "year": 2024,
    "population": 265364,
    "householdCount": 116545,
    "agingRate": 23.4
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "year": 2024,
    "population": 365974,
    "householdCount": 160164,
    "agingRate": 22.4
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "year": 2024,
    "population": 293036,
    "householdCount": 131455,
    "agingRate": 24.5
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "year": 2024,
    "population": 215539,
    "householdCount": 99693,
    "agingRate": 25.9
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "year": 2024,
    "population": 145762,
    "householdCount": 57178,
    "agingRate": 13.6
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "year": 2024,
    "population": 207871,
    "householdCount": 93609,
    "agingRate": 23.1
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "year": 2024,
    "population": 167787,
    "householdCount": 81578,
    "agingRate": 26.1
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "year": 2024,
    "population": 205140,
    "householdCount": 93578,
    "agingRate": 23.5
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "year": 2024,
    "population": 173228,
    "householdCount": 72607,
    "agingRate": 19.3
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
    "sgisCode": "22010",
    "name": "중구",
    "year": 2023,
    "population": 85775,
    "householdCount": 41035,
    "agingRate": 19.2
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2023,
    "population": 335589,
    "householdCount": 151103,
    "agingRate": 22.5
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2023,
    "population": 161396,
    "householdCount": 74822,
    "agingRate": 26.4
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2023,
    "population": 141259,
    "householdCount": 71002,
    "agingRate": 26.1
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2023,
    "population": 430146,
    "householdCount": 185594,
    "agingRate": 17.1
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2023,
    "population": 396295,
    "householdCount": 163311,
    "agingRate": 18.7
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2023,
    "population": 539884,
    "householdCount": 229085,
    "agingRate": 17.3
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2023,
    "population": 267045,
    "householdCount": 106343,
    "agingRate": 15
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2023,
    "population": 21799,
    "householdCount": 10943,
    "agingRate": 43.6
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "year": 2024,
    "population": 94128,
    "householdCount": 44817,
    "agingRate": 18.4
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "year": 2024,
    "population": 336051,
    "householdCount": 153872,
    "agingRate": 23.6
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "year": 2024,
    "population": 164111,
    "householdCount": 76914,
    "agingRate": 27.4
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "year": 2024,
    "population": 136119,
    "householdCount": 69820,
    "agingRate": 27.8
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "year": 2024,
    "population": 422633,
    "householdCount": 185284,
    "agingRate": 18.4
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "year": 2024,
    "population": 398685,
    "householdCount": 166264,
    "agingRate": 19.6
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "year": 2024,
    "population": 532999,
    "householdCount": 229849,
    "agingRate": 18.7
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "year": 2024,
    "population": 263117,
    "householdCount": 106027,
    "agingRate": 16.2
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "year": 2024,
    "population": 21493,
    "householdCount": 10883,
    "agingRate": 45.5
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
    "sgisCode": "26010",
    "name": "중구",
    "year": 2023,
    "population": 203534,
    "householdCount": 87430,
    "agingRate": 19.1
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2023,
    "population": 308537,
    "householdCount": 133445,
    "agingRate": 15.5
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2023,
    "population": 157071,
    "householdCount": 63118,
    "agingRate": 15.7
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2023,
    "population": 214918,
    "householdCount": 83685,
    "agingRate": 10.6
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2023,
    "population": 223371,
    "householdCount": 90451,
    "agingRate": 17.6
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "year": 2024,
    "population": 203766,
    "householdCount": 88674,
    "agingRate": 20.3
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "year": 2024,
    "population": 305176,
    "householdCount": 133777,
    "agingRate": 16.7
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "year": 2024,
    "population": 158268,
    "householdCount": 63721,
    "agingRate": 17
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "year": 2024,
    "population": 215421,
    "householdCount": 84332,
    "agingRate": 11.7
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "year": 2024,
    "population": 224263,
    "householdCount": 91838,
    "agingRate": 18.7
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
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2023,
    "population": 226936,
    "householdCount": 101417,
    "agingRate": 20.9
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2023,
    "population": 266458,
    "householdCount": 115312,
    "agingRate": 21
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2023,
    "population": 259505,
    "householdCount": 114793,
    "agingRate": 24.1
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2023,
    "population": 137413,
    "householdCount": 61530,
    "agingRate": 25.5
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2023,
    "population": 154581,
    "householdCount": 72259,
    "agingRate": 27
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2023,
    "population": 407458,
    "householdCount": 177393,
    "agingRate": 11.9
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2023,
    "population": 100479,
    "householdCount": 46254,
    "agingRate": 29.9
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2023,
    "population": 100492,
    "householdCount": 46589,
    "agingRate": 30.3
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2023,
    "population": 92990,
    "householdCount": 43933,
    "agingRate": 34
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2023,
    "population": 66535,
    "householdCount": 31254,
    "agingRate": 33.9
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2023,
    "population": 296453,
    "householdCount": 127547,
    "agingRate": 17.6
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2023,
    "population": 47920,
    "householdCount": 24646,
    "agingRate": 45.5
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2023,
    "population": 23099,
    "householdCount": 11928,
    "agingRate": 41.6
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2023,
    "population": 15197,
    "householdCount": 7730,
    "agingRate": 41.1
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2023,
    "population": 33492,
    "householdCount": 16982,
    "agingRate": 40.5
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2023,
    "population": 40008,
    "householdCount": 19396,
    "agingRate": 40.5
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2023,
    "population": 30518,
    "householdCount": 13781,
    "agingRate": 33.2
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2023,
    "population": 41073,
    "householdCount": 18994,
    "agingRate": 35.1
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2023,
    "population": 112465,
    "householdCount": 49152,
    "agingRate": 18
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2023,
    "population": 54263,
    "householdCount": 25184,
    "agingRate": 32.1
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2023,
    "population": 28430,
    "householdCount": 14213,
    "agingRate": 41.3
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2023,
    "population": 45697,
    "householdCount": 21988,
    "agingRate": 30.5
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2023,
    "population": 8418,
    "householdCount": 4319,
    "agingRate": 28.1
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "year": 2024,
    "population": 222544,
    "householdCount": 100981,
    "agingRate": 22.4
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "year": 2024,
    "population": 270531,
    "householdCount": 118722,
    "agingRate": 22.1
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "year": 2024,
    "population": 258733,
    "householdCount": 115464,
    "agingRate": 25.3
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "year": 2024,
    "population": 136187,
    "householdCount": 61623,
    "agingRate": 26.6
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "year": 2024,
    "population": 153692,
    "householdCount": 72810,
    "agingRate": 27.8
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "year": 2024,
    "population": 407365,
    "householdCount": 180308,
    "agingRate": 12.8
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "year": 2024,
    "population": 99151,
    "householdCount": 46210,
    "agingRate": 31.2
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "year": 2024,
    "population": 99523,
    "householdCount": 46469,
    "agingRate": 31.8
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "year": 2024,
    "population": 92458,
    "householdCount": 43835,
    "agingRate": 35.1
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "year": 2024,
    "population": 65505,
    "householdCount": 31172,
    "agingRate": 35.4
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "year": 2024,
    "population": 298529,
    "householdCount": 129430,
    "agingRate": 18.4
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "year": 2024,
    "population": 47094,
    "householdCount": 24419,
    "agingRate": 46.9
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "year": 2024,
    "population": 23079,
    "householdCount": 11965,
    "agingRate": 42.7
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "year": 2024,
    "population": 15059,
    "householdCount": 7698,
    "agingRate": 41.8
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "year": 2024,
    "population": 32655,
    "householdCount": 16834,
    "agingRate": 42
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "year": 2024,
    "population": 39479,
    "householdCount": 19368,
    "agingRate": 42.4
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "year": 2024,
    "population": 30934,
    "householdCount": 14069,
    "agingRate": 34.2
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "year": 2024,
    "population": 41068,
    "householdCount": 19015,
    "agingRate": 36.5
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "year": 2024,
    "population": 110043,
    "householdCount": 48695,
    "agingRate": 19.2
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "year": 2024,
    "population": 53609,
    "householdCount": 25009,
    "agingRate": 33
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "year": 2024,
    "population": 27972,
    "householdCount": 14081,
    "agingRate": 42.6
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "year": 2024,
    "population": 45274,
    "householdCount": 21992,
    "agingRate": 31.4
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "year": 2024,
    "population": 8515,
    "householdCount": 4428,
    "agingRate": 29.4
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
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2023,
    "population": 348272,
    "householdCount": 152167,
    "agingRate": 19.1
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2023,
    "population": 121626,
    "householdCount": 54144,
    "agingRate": 22.9
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2023,
    "population": 109008,
    "householdCount": 48983,
    "agingRate": 24.6
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2023,
    "population": 548672,
    "householdCount": 217871,
    "agingRate": 13.6
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2023,
    "population": 102738,
    "householdCount": 47747,
    "agingRate": 31.2
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2023,
    "population": 238671,
    "householdCount": 97648,
    "agingRate": 13.8
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2023,
    "population": 355412,
    "householdCount": 148613,
    "agingRate": 16.5
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2023,
    "population": 214516,
    "householdCount": 90347,
    "agingRate": 16.5
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2023,
    "population": 243412,
    "householdCount": 100848,
    "agingRate": 11.6
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2023,
    "population": 178496,
    "householdCount": 79384,
    "agingRate": 24.3
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2023,
    "population": 180058,
    "householdCount": 77093,
    "agingRate": 21.8
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2023,
    "population": 190660,
    "householdCount": 80649,
    "agingRate": 17
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2023,
    "population": 24827,
    "householdCount": 12594,
    "agingRate": 39.6
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2023,
    "population": 62173,
    "householdCount": 26738,
    "agingRate": 27.8
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2023,
    "population": 58475,
    "householdCount": 26965,
    "agingRate": 34
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2023,
    "population": 48650,
    "householdCount": 22477,
    "agingRate": 34.1
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2023,
    "population": 39706,
    "householdCount": 19653,
    "agingRate": 40.1
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2023,
    "population": 39125,
    "householdCount": 19461,
    "agingRate": 39.5
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2023,
    "population": 32892,
    "householdCount": 16149,
    "agingRate": 40.6
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2023,
    "population": 35505,
    "householdCount": 17493,
    "agingRate": 37.8
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2023,
    "population": 58588,
    "householdCount": 27105,
    "agingRate": 30.5
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2023,
    "population": 39667,
    "householdCount": 20347,
    "agingRate": 42.8
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "year": 2024,
    "population": 346145,
    "householdCount": 153161,
    "agingRate": 20.1
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "year": 2024,
    "population": 120204,
    "householdCount": 53934,
    "agingRate": 24.4
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "year": 2024,
    "population": 109218,
    "householdCount": 49561,
    "agingRate": 25.4
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "year": 2024,
    "population": 549861,
    "householdCount": 220514,
    "agingRate": 14.6
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "year": 2024,
    "population": 102535,
    "householdCount": 47882,
    "agingRate": 32.6
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "year": 2024,
    "population": 241284,
    "householdCount": 98902,
    "agingRate": 14.7
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "year": 2024,
    "population": 359629,
    "householdCount": 152501,
    "agingRate": 17.5
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "year": 2024,
    "population": 210801,
    "householdCount": 90150,
    "agingRate": 17.9
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "year": 2024,
    "population": 244140,
    "householdCount": 101990,
    "agingRate": 12.8
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "year": 2024,
    "population": 178265,
    "householdCount": 80293,
    "agingRate": 25.6
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "year": 2024,
    "population": 178865,
    "householdCount": 77674,
    "agingRate": 23.1
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "year": 2024,
    "population": 188972,
    "householdCount": 80717,
    "agingRate": 18
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "year": 2024,
    "population": 24609,
    "householdCount": 12507,
    "agingRate": 40.7
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "year": 2024,
    "population": 61675,
    "householdCount": 26561,
    "agingRate": 28.9
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "year": 2024,
    "population": 57766,
    "householdCount": 26927,
    "agingRate": 35.5
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "year": 2024,
    "population": 47664,
    "householdCount": 22367,
    "agingRate": 35.6
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "year": 2024,
    "population": 39011,
    "householdCount": 19482,
    "agingRate": 41.3
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "year": 2024,
    "population": 38704,
    "householdCount": 19384,
    "agingRate": 40.6
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "year": 2024,
    "population": 32480,
    "householdCount": 16182,
    "agingRate": 41.9
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "year": 2024,
    "population": 35073,
    "householdCount": 17420,
    "agingRate": 38.8
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "year": 2024,
    "population": 58393,
    "householdCount": 27491,
    "agingRate": 31.7
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "year": 2024,
    "population": 38950,
    "householdCount": 20180,
    "agingRate": 44.3
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
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2023,
    "population": 495553,
    "householdCount": 202367,
    "agingRate": 16.1
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2023,
    "population": 181214,
    "householdCount": 75948,
    "agingRate": 21.1
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "year": 2024,
    "population": 493908,
    "householdCount": 203478,
    "agingRate": 17
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "year": 2024,
    "population": 180909,
    "householdCount": 76179,
    "agingRate": 22.1
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
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2023,
    "population": 1226362,
    "householdCount": 503568,
    "agingRate": 13.1
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "year": 2024,
    "population": 1224979,
    "householdCount": 508564,
    "agingRate": 14
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
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2023,
    "population": 903116,
    "householdCount": 380003,
    "agingRate": 16.7
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "year": 2024,
    "population": 900867,
    "householdCount": 383004,
    "agingRate": 17.7
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
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2023,
    "population": 537159,
    "householdCount": 213815,
    "agingRate": 16.6
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "year": 2024,
    "population": 545800,
    "householdCount": 220099,
    "agingRate": 17.6
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
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2023,
    "population": 803512,
    "householdCount": 320407,
    "agingRate": 17.2
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "year": 2024,
    "population": 794082,
    "householdCount": 322370,
    "agingRate": 18.7
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
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2023,
    "population": 709147,
    "householdCount": 268028,
    "agingRate": 13.2
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "year": 2024,
    "population": 701551,
    "householdCount": 267949,
    "agingRate": 14.3
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
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2023,
    "population": 1047592,
    "householdCount": 427072,
    "agingRate": 16.4
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "year": 2024,
    "population": 1044968,
    "householdCount": 430075,
    "agingRate": 17.6
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
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2023,
    "population": 1066979,
    "householdCount": 405291,
    "agingRate": 15.5
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "year": 2024,
    "population": 1077481,
    "householdCount": 413755,
    "agingRate": 16.3
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
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2023,
    "population": 870358,
    "householdCount": 376787,
    "agingRate": 15.4
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "year": 2024,
    "population": 873368,
    "householdCount": 381596,
    "agingRate": 16.2
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
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2023,
    "population": 689851,
    "householdCount": 291563,
    "agingRate": 12.6
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "year": 2024,
    "population": 694765,
    "householdCount": 294974,
    "agingRate": 13.4
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
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2023,
    "population": 658032,
    "householdCount": 284192,
    "agingRate": 17.2
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "year": 2024,
    "population": 649634,
    "householdCount": 283796,
    "agingRate": 18.3
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
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2023,
    "population": 493394,
    "householdCount": 216729,
    "agingRate": 21
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "year": 2024,
    "population": 493075,
    "householdCount": 219703,
    "agingRate": 22.2
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
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2023,
    "population": 1007142,
    "householdCount": 428321,
    "agingRate": 17.7
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "year": 2024,
    "population": 1001043,
    "householdCount": 430824,
    "agingRate": 19
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "year": 2020,
    "population": 107805,
    "householdCount": 44773,
    "agingRate": 23.1
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "year": 2020,
    "population": 92066,
    "householdCount": 39955,
    "agingRate": 9.7
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "year": 2020,
    "population": 383797,
    "householdCount": 145068,
    "agingRate": 10.7
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "year": 2020,
    "population": 157737,
    "householdCount": 55786,
    "agingRate": 10.4
  },
  {
    "sgisCode": "31241",
    "name": "만세구",
    "year": 2020,
    "population": 246706,
    "householdCount": 88682,
    "agingRate": 11.4
  },
  {
    "sgisCode": "31242",
    "name": "효행구",
    "year": 2020,
    "population": 124571,
    "householdCount": 45746,
    "agingRate": 12.5
  },
  {
    "sgisCode": "31243",
    "name": "병점구",
    "year": 2020,
    "population": 152499,
    "householdCount": 57250,
    "agingRate": 9
  },
  {
    "sgisCode": "31244",
    "name": "동탄구",
    "year": 2020,
    "population": 357083,
    "householdCount": 130193,
    "agingRate": 4.7
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "year": 2021,
    "population": 106547,
    "householdCount": 45723,
    "agingRate": 24.4
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "year": 2021,
    "population": 96264,
    "householdCount": 42515,
    "agingRate": 10.1
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "year": 2021,
    "population": 380304,
    "householdCount": 147770,
    "agingRate": 11.7
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "year": 2021,
    "population": 170722,
    "householdCount": 62475,
    "agingRate": 10.7
  },
  {
    "sgisCode": "31241",
    "name": "만세구",
    "year": 2021,
    "population": 251485,
    "householdCount": 93489,
    "agingRate": 12
  },
  {
    "sgisCode": "31242",
    "name": "효행구",
    "year": 2021,
    "population": 127427,
    "householdCount": 48439,
    "agingRate": 13.1
  },
  {
    "sgisCode": "31243",
    "name": "병점구",
    "year": 2021,
    "population": 158690,
    "householdCount": 61522,
    "agingRate": 9.5
  },
  {
    "sgisCode": "31244",
    "name": "동탄구",
    "year": 2021,
    "population": 368779,
    "householdCount": 137982,
    "agingRate": 5.1
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "year": 2022,
    "population": 103310,
    "householdCount": 45077,
    "agingRate": 25.5
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "year": 2022,
    "population": 105438,
    "householdCount": 47026,
    "agingRate": 10.5
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "year": 2022,
    "population": 384974,
    "householdCount": 152965,
    "agingRate": 12.5
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "year": 2022,
    "population": 196095,
    "householdCount": 72784,
    "agingRate": 10.6
  },
  {
    "sgisCode": "31241",
    "name": "만세구",
    "year": 2022,
    "population": 258064,
    "householdCount": 96252,
    "agingRate": 12.5
  },
  {
    "sgisCode": "31242",
    "name": "효행구",
    "year": 2022,
    "population": 133953,
    "householdCount": 51949,
    "agingRate": 13.6
  },
  {
    "sgisCode": "31243",
    "name": "병점구",
    "year": 2022,
    "population": 158771,
    "householdCount": 63262,
    "agingRate": 10.1
  },
  {
    "sgisCode": "31244",
    "name": "동탄구",
    "year": 2022,
    "population": 380684,
    "householdCount": 145079,
    "agingRate": 5.5
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "year": 2023,
    "population": 104279,
    "householdCount": 46209,
    "agingRate": 26.3
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "year": 2023,
    "population": 112411,
    "householdCount": 50678,
    "agingRate": 10.7
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "year": 2023,
    "population": 393711,
    "householdCount": 158539,
    "agingRate": 13.3
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "year": 2023,
    "population": 228137,
    "householdCount": 86516,
    "agingRate": 10.8
  },
  {
    "sgisCode": "31241",
    "name": "만세구",
    "year": 2023,
    "population": 271227,
    "householdCount": 100440,
    "agingRate": 12.9
  },
  {
    "sgisCode": "31242",
    "name": "효행구",
    "year": 2023,
    "population": 139921,
    "householdCount": 54533,
    "agingRate": 14.1
  },
  {
    "sgisCode": "31243",
    "name": "병점구",
    "year": 2023,
    "population": 174294,
    "householdCount": 70126,
    "agingRate": 10.2
  },
  {
    "sgisCode": "31244",
    "name": "동탄구",
    "year": 2023,
    "population": 388714,
    "householdCount": 149994,
    "agingRate": 5.9
  },
  {
    "sgisCode": "23100",
    "name": "제물포구",
    "year": 2024,
    "population": 101960,
    "householdCount": 45705,
    "agingRate": 27.8
  },
  {
    "sgisCode": "23110",
    "name": "영종구",
    "year": 2024,
    "population": 120921,
    "householdCount": 55277,
    "agingRate": 11
  },
  {
    "sgisCode": "23120",
    "name": "서해구",
    "year": 2024,
    "population": 393148,
    "householdCount": 160135,
    "agingRate": 14.4
  },
  {
    "sgisCode": "23130",
    "name": "검단구",
    "year": 2024,
    "population": 240918,
    "householdCount": 91447,
    "agingRate": 11.6
  },
  {
    "sgisCode": "31241",
    "name": "만세구",
    "year": 2024,
    "population": 279898,
    "householdCount": 103516,
    "agingRate": 13.7
  },
  {
    "sgisCode": "31242",
    "name": "효행구",
    "year": 2024,
    "population": 153544,
    "householdCount": 60327,
    "agingRate": 14.3
  },
  {
    "sgisCode": "31243",
    "name": "병점구",
    "year": 2024,
    "population": 173413,
    "householdCount": 70187,
    "agingRate": 11
  },
  {
    "sgisCode": "31244",
    "name": "동탄구",
    "year": 2024,
    "population": 397224,
    "householdCount": 154590,
    "agingRate": 6.4
  }
];

/** 시도 인구 시계열 (SGIS 2자리 × 연도, 시군구 합산) */
const POPULATION_TREND_SIDO: PopulationTrendPoint[] = [
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
    "sgisCode": "11",
    "name": "서울",
    "year": 2023,
    "population": 9384512,
    "householdCount": 4141659,
    "agingRate": 18.3
  },
  {
    "sgisCode": "11",
    "name": "서울",
    "year": 2024,
    "population": 9335444,
    "householdCount": 4159502,
    "agingRate": 19.2
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
    "sgisCode": "23",
    "name": "인천",
    "year": 2023,
    "population": 3025950,
    "householdCount": 1242168,
    "agingRate": 16.4
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "year": 2024,
    "population": 3058033,
    "householdCount": 1268133,
    "agingRate": 17.4
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
    "sgisCode": "31",
    "name": "경기",
    "year": 2023,
    "population": 13815367,
    "householdCount": 5500024,
    "agingRate": 15.4
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "year": 2024,
    "population": 13914479,
    "householdCount": 5592072,
    "agingRate": 16.3
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
    "sgisCode": "32",
    "name": "강원",
    "year": 2023,
    "population": 1528014,
    "householdCount": 698410,
    "agingRate": 23.4
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "year": 2024,
    "population": 1522881,
    "householdCount": 702603,
    "agingRate": 24.7
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
    "sgisCode": "33",
    "name": "충북",
    "year": 2023,
    "population": 1641481,
    "householdCount": 720231,
    "agingRate": 19.9
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "year": 2024,
    "population": 1646328,
    "householdCount": 726988,
    "agingRate": 20.8
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
    "sgisCode": "29",
    "name": "세종",
    "year": 2023,
    "population": 386261,
    "householdCount": 156444,
    "agingRate": 10.5
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "year": 2024,
    "population": 390156,
    "householdCount": 158901,
    "agingRate": 11.1
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
    "sgisCode": "25",
    "name": "대전",
    "year": 2023,
    "population": 1470336,
    "householdCount": 654809,
    "agingRate": 16.6
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "year": 2024,
    "population": 1467093,
    "householdCount": 658831,
    "agingRate": 17.6
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
    "sgisCode": "34",
    "name": "충남",
    "year": 2023,
    "population": 2216332,
    "householdCount": 948631,
    "agingRate": 20.1
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "year": 2024,
    "population": 2238243,
    "householdCount": 964538,
    "agingRate": 20.8
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
    "sgisCode": "35",
    "name": "전북",
    "year": 2023,
    "population": 1768491,
    "householdCount": 786775,
    "agingRate": 23.4
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "year": 2024,
    "population": 1758836,
    "householdCount": 788621,
    "agingRate": 24.4
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
    "sgisCode": "24",
    "name": "광주",
    "year": 2023,
    "population": 1457090,
    "householdCount": 627602,
    "agingRate": 16.3
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "year": 2024,
    "population": 1444170,
    "householdCount": 628550,
    "agingRate": 17.3
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
    "sgisCode": "36",
    "name": "전남",
    "year": 2023,
    "population": 1776668,
    "householdCount": 793249,
    "agingRate": 25.4
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "year": 2024,
    "population": 1778338,
    "householdCount": 799012,
    "agingRate": 26.3
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
    "sgisCode": "21",
    "name": "부산",
    "year": 2023,
    "population": 3279604,
    "householdCount": 1462404,
    "agingRate": 22.4
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "year": 2024,
    "population": 3257256,
    "householdCount": 1470562,
    "agingRate": 23.6
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
    "sgisCode": "22",
    "name": "대구",
    "year": 2023,
    "population": 2379188,
    "householdCount": 1033238,
    "agingRate": 19.4
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "year": 2024,
    "population": 2369336,
    "householdCount": 1043730,
    "agingRate": 20.6
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
    "sgisCode": "26",
    "name": "울산",
    "year": 2023,
    "population": 1107431,
    "householdCount": 458129,
    "agingRate": 15.7
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "year": 2024,
    "population": 1106894,
    "householdCount": 462342,
    "agingRate": 16.8
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
    "sgisCode": "37",
    "name": "경북",
    "year": 2023,
    "population": 2589880,
    "householdCount": 1166594,
    "agingRate": 23.8
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "year": 2024,
    "population": 2578999,
    "householdCount": 1174597,
    "agingRate": 24.9
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
    "sgisCode": "38",
    "name": "경남",
    "year": 2023,
    "population": 3271149,
    "householdCount": 1404476,
    "agingRate": 20
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "year": 2024,
    "population": 3264244,
    "householdCount": 1415780,
    "agingRate": 21.1
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
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2023,
    "population": 676767,
    "householdCount": 278315,
    "agingRate": 17.4
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "year": 2024,
    "population": 674817,
    "householdCount": 279657,
    "agingRate": 18.4
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
