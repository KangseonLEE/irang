/**
 * 농가 통계 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-farms.ts
 * 데이터 소스: 통계청 SGIS 농림어업총조사 2020년 (5년 주기)
 * 마지막 수집: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-farms.ts`
 *
 * 빌드 안정성을 위해 SGIS API farmhousehold.json은 빌드 시점에 호출하지 않고
 * 이 정적 폴백만 사용한다. 시군구 단건 호출은 ISR on-demand에서만.
 */

import {
  INTEGRATED_CITY_GU_CODES,
  INTEGRATED_CITY_NAMES,
} from "./integrated-cities";

export interface FarmStat {
  /** SGIS 코드 (시도 2자리 또는 시군구 5자리) */
  sgisCode: string;
  /** 행정구역명 */
  name: string;
  /** 농가 수 (가구) */
  farmCount: number;
  /** 농가 인구 (명) */
  farmPopulation: number;
  /** 가구당 평균 농가 인구 (명) — population/farm_cnt */
  avgPopulation: number;
}

/** 시군구 농가 통계 (SGIS 5자리) */
export const FARM_FALLBACK_SIGUNGU: FarmStat[] = [
  {
    "sgisCode": "11010",
    "name": "종로구",
    "farmCount": 77,
    "farmPopulation": 208,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "farmCount": 37,
    "farmPopulation": 93,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "farmCount": 78,
    "farmPopulation": 202,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "farmCount": 250,
    "farmPopulation": 667,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "farmCount": 469,
    "farmPopulation": 1199,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "farmCount": 324,
    "farmPopulation": 798,
    "avgPopulation": 2
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "farmCount": 628,
    "farmPopulation": 1591,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "farmCount": 234,
    "farmPopulation": 583,
    "avgPopulation": 2
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "farmCount": 194,
    "farmPopulation": 505,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "farmCount": 326,
    "farmPopulation": 829,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "farmCount": 437,
    "farmPopulation": 1104,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "farmCount": 318,
    "farmPopulation": 842,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "farmCount": 165,
    "farmPopulation": 403,
    "avgPopulation": 2
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "farmCount": 143,
    "farmPopulation": 383,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "farmCount": 451,
    "farmPopulation": 1234,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "farmCount": 807,
    "farmPopulation": 2229,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "farmCount": 505,
    "farmPopulation": 1277,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "farmCount": 152,
    "farmPopulation": 397,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "farmCount": 215,
    "farmPopulation": 545,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "farmCount": 223,
    "farmPopulation": 580,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "farmCount": 228,
    "farmPopulation": 582,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "farmCount": 540,
    "farmPopulation": 1395,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "farmCount": 495,
    "farmPopulation": 1266,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "farmCount": 656,
    "farmPopulation": 1786,
    "avgPopulation": 3
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "farmCount": 466,
    "farmPopulation": 1199,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "farmCount": 521,
    "farmPopulation": 1217,
    "avgPopulation": 2
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "farmCount": 53,
    "farmPopulation": 141,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "farmCount": 806,
    "farmPopulation": 2222,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "farmCount": 1110,
    "farmPopulation": 2901,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "farmCount": 934,
    "farmPopulation": 2543,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "farmCount": 933,
    "farmPopulation": 2384,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "farmCount": 1090,
    "farmPopulation": 2953,
    "avgPopulation": 3
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "farmCount": 244,
    "farmPopulation": 581,
    "avgPopulation": 2
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "farmCount": 6415,
    "farmPopulation": 14509,
    "avgPopulation": 2
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "farmCount": 1133,
    "farmPopulation": 2377,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31011",
    "name": "수원시 장안구",
    "farmCount": 1372,
    "farmPopulation": 3765,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31012",
    "name": "수원시 권선구",
    "farmCount": 2116,
    "farmPopulation": 5909,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31013",
    "name": "수원시 팔달구",
    "farmCount": 760,
    "farmPopulation": 1979,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31014",
    "name": "수원시 영통구",
    "farmCount": 1179,
    "farmPopulation": 3488,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31021",
    "name": "성남시 수정구",
    "farmCount": 474,
    "farmPopulation": 1272,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31022",
    "name": "성남시 중원구",
    "farmCount": 192,
    "farmPopulation": 520,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31023",
    "name": "성남시 분당구",
    "farmCount": 842,
    "farmPopulation": 2313,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "farmCount": 1459,
    "farmPopulation": 4003,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31041",
    "name": "안양시 만안구",
    "farmCount": 579,
    "farmPopulation": 1553,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31042",
    "name": "안양시 동안구",
    "farmCount": 811,
    "farmPopulation": 2298,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31051",
    "name": "부천시 원미구",
    "farmCount": 730,
    "farmPopulation": 2080,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31052",
    "name": "부천시 소사구",
    "farmCount": 357,
    "farmPopulation": 962,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31053",
    "name": "부천시 오정구",
    "farmCount": 387,
    "farmPopulation": 1053,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "farmCount": 842,
    "farmPopulation": 2264,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "farmCount": 9054,
    "farmPopulation": 22752,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "farmCount": 837,
    "farmPopulation": 2167,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31091",
    "name": "안산시 상록구",
    "farmCount": 891,
    "farmPopulation": 2414,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31092",
    "name": "안산시 단원구",
    "farmCount": 1118,
    "farmPopulation": 2713,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31101",
    "name": "고양시 덕양구",
    "farmCount": 2748,
    "farmPopulation": 7632,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31103",
    "name": "고양시 일산동구",
    "farmCount": 1821,
    "farmPopulation": 5125,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31104",
    "name": "고양시 일산서구",
    "farmCount": 1381,
    "farmPopulation": 3909,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "farmCount": 357,
    "farmPopulation": 989,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "farmCount": 656,
    "farmPopulation": 1806,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "farmCount": 4930,
    "farmPopulation": 13304,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "farmCount": 1496,
    "farmPopulation": 4233,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "farmCount": 1798,
    "farmPopulation": 4679,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "farmCount": 915,
    "farmPopulation": 2536,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "farmCount": 854,
    "farmPopulation": 2303,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "farmCount": 1078,
    "farmPopulation": 2877,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31191",
    "name": "용인시 처인구",
    "farmCount": 4785,
    "farmPopulation": 12136,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31192",
    "name": "용인시 기흥구",
    "farmCount": 1436,
    "farmPopulation": 4084,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31193",
    "name": "용인시 수지구",
    "farmCount": 1067,
    "farmPopulation": 3075,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "farmCount": 6555,
    "farmPopulation": 16722,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "farmCount": 8229,
    "farmPopulation": 20607,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "farmCount": 7943,
    "farmPopulation": 19321,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "farmCount": 4980,
    "farmPopulation": 12830,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "farmCount": 10395,
    "farmPopulation": 26340,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "farmCount": 3928,
    "farmPopulation": 10358,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "farmCount": 3735,
    "farmPopulation": 9507,
    "avgPopulation": 3
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "farmCount": 6035,
    "farmPopulation": 14270,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "farmCount": 6878,
    "farmPopulation": 16472,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "farmCount": 3079,
    "farmPopulation": 6989,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "farmCount": 3751,
    "farmPopulation": 8481,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "farmCount": 6149,
    "farmPopulation": 14587,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "farmCount": 6702,
    "farmPopulation": 16143,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "farmCount": 8935,
    "farmPopulation": 21336,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "farmCount": 7046,
    "farmPopulation": 15662,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "farmCount": 2155,
    "farmPopulation": 4805,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "farmCount": 679,
    "farmPopulation": 1479,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "farmCount": 1027,
    "farmPopulation": 2461,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "farmCount": 3974,
    "farmPopulation": 8262,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "farmCount": 6788,
    "farmPopulation": 15034,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "farmCount": 4879,
    "farmPopulation": 10926,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "farmCount": 3047,
    "farmPopulation": 6160,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "farmCount": 3915,
    "farmPopulation": 8452,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "farmCount": 2688,
    "farmPopulation": 5545,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "farmCount": 3806,
    "farmPopulation": 9260,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "farmCount": 1840,
    "farmPopulation": 3955,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "farmCount": 2280,
    "farmPopulation": 5088,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "farmCount": 2817,
    "farmPopulation": 6166,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "farmCount": 2125,
    "farmPopulation": 4707,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "farmCount": 2733,
    "farmPopulation": 5885,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "farmCount": 8933,
    "farmPopulation": 20202,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "farmCount": 6383,
    "farmPopulation": 14051,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33041",
    "name": "청주시 상당구",
    "farmCount": 4531,
    "farmPopulation": 10481,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33042",
    "name": "청주시 서원구",
    "farmCount": 3299,
    "farmPopulation": 7995,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33043",
    "name": "청주시 흥덕구",
    "farmCount": 3859,
    "farmPopulation": 9315,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33044",
    "name": "청주시 청원구",
    "farmCount": 4288,
    "farmPopulation": 10322,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "farmCount": 4099,
    "farmPopulation": 8762,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "farmCount": 5267,
    "farmPopulation": 11283,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "farmCount": 5958,
    "farmPopulation": 12685,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "farmCount": 3592,
    "farmPopulation": 7998,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "farmCount": 5187,
    "farmPopulation": 10706,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "farmCount": 6318,
    "farmPopulation": 14291,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "farmCount": 3227,
    "farmPopulation": 6424,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "farmCount": 1484,
    "farmPopulation": 3389,
    "avgPopulation": 2
  },
  {
    "sgisCode": "29010",
    "name": "세종시",
    "farmCount": 7163,
    "farmPopulation": 17063,
    "avgPopulation": 2
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "farmCount": 1884,
    "farmPopulation": 4341,
    "avgPopulation": 2
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "farmCount": 1942,
    "farmPopulation": 4407,
    "avgPopulation": 2
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "farmCount": 4466,
    "farmPopulation": 11045,
    "avgPopulation": 2
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "farmCount": 3353,
    "farmPopulation": 8515,
    "avgPopulation": 3
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "farmCount": 1846,
    "farmPopulation": 4496,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34011",
    "name": "천안시 동남구",
    "farmCount": 5984,
    "farmPopulation": 14178,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34012",
    "name": "천안시 서북구",
    "farmCount": 5127,
    "farmPopulation": 13067,
    "avgPopulation": 3
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "farmCount": 9281,
    "farmPopulation": 20258,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "farmCount": 7792,
    "farmPopulation": 16641,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "farmCount": 8847,
    "farmPopulation": 19952,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "farmCount": 11082,
    "farmPopulation": 24141,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "farmCount": 9882,
    "farmPopulation": 21247,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "farmCount": 513,
    "farmPopulation": 1237,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "farmCount": 10177,
    "farmPopulation": 22898,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "farmCount": 6001,
    "farmPopulation": 13183,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "farmCount": 9279,
    "farmPopulation": 19918,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "farmCount": 5940,
    "farmPopulation": 12146,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "farmCount": 6355,
    "farmPopulation": 12933,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "farmCount": 10029,
    "farmPopulation": 21265,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "farmCount": 9273,
    "farmPopulation": 20065,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "farmCount": 6580,
    "farmPopulation": 13380,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35011",
    "name": "전주시 완산구",
    "farmCount": 3969,
    "farmPopulation": 9869,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35012",
    "name": "전주시 덕진구",
    "farmCount": 4341,
    "farmPopulation": 10887,
    "avgPopulation": 3
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "farmCount": 6659,
    "farmPopulation": 14396,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "farmCount": 10590,
    "farmPopulation": 23398,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "farmCount": 9953,
    "farmPopulation": 20377,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "farmCount": 6979,
    "farmPopulation": 14793,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "farmCount": 7306,
    "farmPopulation": 15450,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "farmCount": 7500,
    "farmPopulation": 16484,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "farmCount": 3462,
    "farmPopulation": 6820,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "farmCount": 4544,
    "farmPopulation": 9341,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "farmCount": 3984,
    "farmPopulation": 8519,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "farmCount": 4026,
    "farmPopulation": 8158,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "farmCount": 4653,
    "farmPopulation": 9440,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "farmCount": 7975,
    "farmPopulation": 16401,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "farmCount": 7364,
    "farmPopulation": 14824,
    "avgPopulation": 2
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "farmCount": 920,
    "farmPopulation": 2130,
    "avgPopulation": 2
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "farmCount": 3104,
    "farmPopulation": 7649,
    "avgPopulation": 2
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "farmCount": 2840,
    "farmPopulation": 6590,
    "avgPopulation": 2
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "farmCount": 4629,
    "farmPopulation": 11454,
    "avgPopulation": 2
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "farmCount": 5183,
    "farmPopulation": 12050,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "farmCount": 2086,
    "farmPopulation": 5055,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "farmCount": 7948,
    "farmPopulation": 16444,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "farmCount": 11869,
    "farmPopulation": 26052,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "farmCount": 9087,
    "farmPopulation": 17982,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "farmCount": 6942,
    "farmPopulation": 15331,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "farmCount": 5426,
    "farmPopulation": 11028,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "farmCount": 4674,
    "farmPopulation": 9090,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "farmCount": 3943,
    "farmPopulation": 8241,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "farmCount": 10062,
    "farmPopulation": 19349,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "farmCount": 5568,
    "farmPopulation": 10889,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "farmCount": 5893,
    "farmPopulation": 11603,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "farmCount": 5772,
    "farmPopulation": 11547,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "farmCount": 5305,
    "farmPopulation": 10264,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "farmCount": 9452,
    "farmPopulation": 18754,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "farmCount": 6761,
    "farmPopulation": 13808,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "farmCount": 7152,
    "farmPopulation": 15213,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "farmCount": 5346,
    "farmPopulation": 10705,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "farmCount": 5065,
    "farmPopulation": 10468,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "farmCount": 5352,
    "farmPopulation": 11191,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "farmCount": 3378,
    "farmPopulation": 7078,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "farmCount": 3779,
    "farmPopulation": 7686,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "farmCount": 6112,
    "farmPopulation": 12282,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "farmCount": 28,
    "farmPopulation": 61,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "farmCount": 85,
    "farmPopulation": 217,
    "avgPopulation": 3
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "farmCount": 84,
    "farmPopulation": 178,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "farmCount": 114,
    "farmPopulation": 276,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "farmCount": 482,
    "farmPopulation": 1100,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "farmCount": 691,
    "farmPopulation": 1760,
    "avgPopulation": 3
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "farmCount": 333,
    "farmPopulation": 822,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "farmCount": 1217,
    "farmPopulation": 3114,
    "avgPopulation": 3
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "farmCount": 1217,
    "farmPopulation": 2981,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "farmCount": 910,
    "farmPopulation": 2304,
    "avgPopulation": 3
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "farmCount": 1142,
    "farmPopulation": 2751,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "farmCount": 2459,
    "farmPopulation": 5440,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "farmCount": 395,
    "farmPopulation": 955,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "farmCount": 306,
    "farmPopulation": 719,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "farmCount": 654,
    "farmPopulation": 1563,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "farmCount": 1850,
    "farmPopulation": 4288,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "farmCount": 250,
    "farmPopulation": 564,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "farmCount": 4527,
    "farmPopulation": 10077,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "farmCount": 893,
    "farmPopulation": 2090,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "farmCount": 613,
    "farmPopulation": 1400,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "farmCount": 3640,
    "farmPopulation": 9475,
    "avgPopulation": 3
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "farmCount": 4020,
    "farmPopulation": 10167,
    "avgPopulation": 3
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "farmCount": 4920,
    "farmPopulation": 12629,
    "avgPopulation": 3
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "farmCount": 5946,
    "farmPopulation": 14228,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "farmCount": 3771,
    "farmPopulation": 7284,
    "avgPopulation": 2
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "farmCount": 2479,
    "farmPopulation": 6191,
    "avgPopulation": 2
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "farmCount": 2803,
    "farmPopulation": 6868,
    "avgPopulation": 2
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "farmCount": 672,
    "farmPopulation": 1598,
    "avgPopulation": 2
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "farmCount": 2609,
    "farmPopulation": 6561,
    "avgPopulation": 3
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "farmCount": 6721,
    "farmPopulation": 15588,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37011",
    "name": "포항시 남구",
    "farmCount": 5698,
    "farmPopulation": 12777,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37012",
    "name": "포항시 북구",
    "farmCount": 8300,
    "farmPopulation": 17932,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "farmCount": 12553,
    "farmPopulation": 26488,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "farmCount": 12235,
    "farmPopulation": 26543,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "farmCount": 12088,
    "farmPopulation": 25171,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "farmCount": 10490,
    "farmPopulation": 24443,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "farmCount": 8248,
    "farmPopulation": 17796,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "farmCount": 8758,
    "farmPopulation": 18361,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "farmCount": 12582,
    "farmPopulation": 26146,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "farmCount": 6894,
    "farmPopulation": 14732,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "farmCount": 7511,
    "farmPopulation": 17414,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "farmCount": 8494,
    "farmPopulation": 16803,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "farmCount": 5094,
    "farmPopulation": 10243,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "farmCount": 2586,
    "farmPopulation": 5217,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "farmCount": 3314,
    "farmPopulation": 6749,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "farmCount": 6791,
    "farmPopulation": 13649,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "farmCount": 3618,
    "farmPopulation": 7481,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "farmCount": 5060,
    "farmPopulation": 11097,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "farmCount": 5074,
    "farmPopulation": 11287,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "farmCount": 7139,
    "farmPopulation": 14414,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "farmCount": 5190,
    "farmPopulation": 10945,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "farmCount": 3798,
    "farmPopulation": 7491,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "farmCount": 468,
    "farmPopulation": 912,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "farmCount": 13204,
    "farmPopulation": 30367,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "farmCount": 3376,
    "farmPopulation": 7016,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "farmCount": 5785,
    "farmPopulation": 12270,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "farmCount": 8633,
    "farmPopulation": 20901,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "farmCount": 9169,
    "farmPopulation": 19238,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "farmCount": 5425,
    "farmPopulation": 12336,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "farmCount": 3530,
    "farmPopulation": 8464,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38111",
    "name": "창원시 의창구",
    "farmCount": 4764,
    "farmPopulation": 10917,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38112",
    "name": "창원시 성산구",
    "farmCount": 2541,
    "farmPopulation": 6811,
    "avgPopulation": 3
  },
  {
    "sgisCode": "38113",
    "name": "창원시 마산합포구",
    "farmCount": 3153,
    "farmPopulation": 6802,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38114",
    "name": "창원시 마산회원구",
    "farmCount": 2326,
    "farmPopulation": 5752,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38115",
    "name": "창원시 진해구",
    "farmCount": 1733,
    "farmPopulation": 4067,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "farmCount": 3731,
    "farmPopulation": 7004,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "farmCount": 5405,
    "farmPopulation": 10911,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "farmCount": 6498,
    "farmPopulation": 13464,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "farmCount": 5271,
    "farmPopulation": 10373,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "farmCount": 5792,
    "farmPopulation": 11676,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "farmCount": 6337,
    "farmPopulation": 13111,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "farmCount": 5128,
    "farmPopulation": 10077,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "farmCount": 5529,
    "farmPopulation": 11513,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "farmCount": 6503,
    "farmPopulation": 13356,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "farmCount": 6935,
    "farmPopulation": 13403,
    "avgPopulation": 2
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "farmCount": 17783,
    "farmPopulation": 47896,
    "avgPopulation": 3
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "farmCount": 12582,
    "farmPopulation": 31901,
    "avgPopulation": 3
  }
];

/** 시도 합산 농가 통계 (SGIS 2자리) */
export const FARM_FALLBACK_SIDO: FarmStat[] = [
  {
    "sgisCode": "11",
    "name": "서울",
    "farmCount": 8418,
    "farmPopulation": 21897,
    "avgPopulation": 2.6
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "farmCount": 13239,
    "farmPopulation": 31828,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "farmCount": 120979,
    "farmPopulation": 308677,
    "avgPopulation": 2.6
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "farmCount": 67436,
    "farmPopulation": 151326,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "farmCount": 66425,
    "farmPopulation": 147904,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "farmCount": 7163,
    "farmPopulation": 17063,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "farmCount": 13491,
    "farmPopulation": 32804,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "farmCount": 122142,
    "farmPopulation": 266509,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "farmCount": 93305,
    "farmPopulation": 199157,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "farmCount": 16676,
    "farmPopulation": 39873,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "farmCount": 136972,
    "farmPopulation": 280060,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "farmCount": 11967,
    "farmPopulation": 28529,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "farmCount": 28580,
    "farmPopulation": 67914,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "farmCount": 15284,
    "farmPopulation": 36806,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "farmCount": 161983,
    "farmPopulation": 344091,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "farmCount": 120768,
    "farmPopulation": 259829,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "farmCount": 30365,
    "farmPopulation": 79797,
    "avgPopulation": 2.6
  }
];

/** 시군구 sgisCode → FarmStat 빠른 조회 */
const SIGUNGU_INDEX = new Map(FARM_FALLBACK_SIGUNGU.map((f) => [f.sgisCode, f]));

/** 시도 sgisCode → FarmStat 빠른 조회 */
const SIDO_INDEX = new Map(FARM_FALLBACK_SIDO.map((f) => [f.sgisCode, f]));

/**
 * 통합시(수원·성남·용인 등 12개) 농가 통계를 구 데이터 합산으로 산출.
 * SGIS는 통합시 자체 sgisCode(31190 등)에 -100을 반환하므로,
 * 폴백 데이터에도 통합시 자체 항목이 없다 → 구 항목들을 합산해 즉석 생성.
 */
function aggregateIntegratedCity(sgisCode: string): FarmStat | null {
  const guCodes = INTEGRATED_CITY_GU_CODES[sgisCode];
  if (!guCodes) return null;

  let farmCount = 0;
  let farmPopulation = 0;

  for (const gu of guCodes) {
    const stat = SIGUNGU_INDEX.get(gu);
    if (!stat) continue;
    farmCount += stat.farmCount;
    farmPopulation += stat.farmPopulation;
  }

  if (farmCount === 0) return null;

  return {
    sgisCode,
    name: INTEGRATED_CITY_NAMES[sgisCode] ?? "",
    farmCount,
    farmPopulation,
    avgPopulation:
      Math.round((farmPopulation / farmCount) * 10) / 10, // 소수점 1자리
  };
}

/** 통합시 sgisCode → 합산 FarmStat 캐시 (모듈 로드 시 1회 계산) */
const INTEGRATED_CITY_INDEX: Map<string, FarmStat> = new Map(
  Object.keys(INTEGRATED_CITY_GU_CODES)
    .map((code) => [code, aggregateIntegratedCity(code)] as const)
    .filter((entry): entry is [string, FarmStat] => entry[1] !== null),
);

export function getFarmFallback(sgisCode: string): FarmStat | null {
  return (
    SIGUNGU_INDEX.get(sgisCode) ??
    INTEGRATED_CITY_INDEX.get(sgisCode) ??
    SIDO_INDEX.get(sgisCode) ??
    null
  );
}

/** 특정 시도(2자리) 하위 시군구 농가 통계 일괄 조회 */
export function getFarmsBySido(sidoSgisCode: string): FarmStat[] {
  // 일반 시군구 + 통합시 합산본 모두 포함 (시도 페이지 카드/지도용)
  const direct = FARM_FALLBACK_SIGUNGU.filter((f) =>
    f.sgisCode.startsWith(sidoSgisCode),
  );
  const integrated = Array.from(INTEGRATED_CITY_INDEX.values()).filter((f) =>
    f.sgisCode.startsWith(sidoSgisCode),
  );
  return [...direct, ...integrated];
}
