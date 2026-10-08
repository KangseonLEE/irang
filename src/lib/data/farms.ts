/**
 * 농가 통계 정적 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-farms.ts
 * 데이터 소스: 국가데이터처 KOSIS 101/DT_1AG25104 가구원수별 농가 — 2025 농림어업총조사 확정(2026-09-29 공표, 2025-12-01 기준)
 * 비교 유의: 2025 조사는 명부에 농지대장 등 행정자료를 더해 2020 값과 바로 비교하면 안 된다(공표 일러두기)
 * 마지막 수집: 2026-10-08
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-farms.ts`
 *
 * 화면·순위가 같은 값을 쓰도록 실행 중 외부 호출 없이 이 값만 쓴다(lib/api/sgis.ts fetchFarmHousehold).
 * 행정동 묶음 신설 구(인천 2026·화성 2026)는 조사 기준일 경계라 표에 없어 행이 없다.
 */

import {
  INTEGRATED_CITY_GU_CODES,
  INTEGRATED_CITY_NAMES,
} from "./integrated-cities";

export interface FarmStat {
  /** 우리 단위 코드 (SGIS 체계 — 시도 2자리 또는 시군구·구 5자리) */
  sgisCode: string;
  /** 행정구역명 */
  name: string;
  /** 농가 수 (가구) */
  farmCount: number;
  /** 농가 인구 (명) */
  farmPopulation: number;
  /** 가구당 평균 농가 인구 (명) — 농가 인구 ÷ 농가 수, 소수 한 자리 */
  avgPopulation: number;
}

/** 시군구·구 농가 통계 */
export const FARM_FALLBACK_SIGUNGU: FarmStat[] = [
  {
    "sgisCode": "11010",
    "name": "종로구",
    "farmCount": 184,
    "farmPopulation": 417,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "farmCount": 199,
    "farmPopulation": 395,
    "avgPopulation": 2
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "farmCount": 232,
    "farmPopulation": 468,
    "avgPopulation": 2
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "farmCount": 512,
    "farmPopulation": 1227,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "farmCount": 589,
    "farmPopulation": 1399,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "farmCount": 759,
    "farmPopulation": 1624,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "farmCount": 907,
    "farmPopulation": 2064,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "farmCount": 625,
    "farmPopulation": 1478,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "farmCount": 240,
    "farmPopulation": 585,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "farmCount": 616,
    "farmPopulation": 1365,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "farmCount": 901,
    "farmPopulation": 2118,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "farmCount": 675,
    "farmPopulation": 1590,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "farmCount": 302,
    "farmPopulation": 729,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "farmCount": 478,
    "farmPopulation": 1040,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "farmCount": 770,
    "farmPopulation": 1883,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "farmCount": 1314,
    "farmPopulation": 3218,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "farmCount": 818,
    "farmPopulation": 1899,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "farmCount": 301,
    "farmPopulation": 733,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "farmCount": 588,
    "farmPopulation": 1310,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "farmCount": 505,
    "farmPopulation": 1222,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "farmCount": 460,
    "farmPopulation": 1072,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "farmCount": 1033,
    "farmPopulation": 2509,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "farmCount": 1278,
    "farmPopulation": 3120,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "farmCount": 1580,
    "farmPopulation": 3780,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "farmCount": 875,
    "farmPopulation": 2075,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "farmCount": 692,
    "farmPopulation": 1506,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "farmCount": 1546,
    "farmPopulation": 3821,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "farmCount": 1892,
    "farmPopulation": 4567,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "farmCount": 1251,
    "farmPopulation": 3018,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "farmCount": 1262,
    "farmPopulation": 2903,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "farmCount": 6788,
    "farmPopulation": 13838,
    "avgPopulation": 2
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "farmCount": 1521,
    "farmPopulation": 2786,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "farmCount": 2435,
    "farmPopulation": 5866,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "farmCount": 1200,
    "farmPopulation": 2931,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "farmCount": 11470,
    "farmPopulation": 25638,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "farmCount": 948,
    "farmPopulation": 2187,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "farmCount": 439,
    "farmPopulation": 1158,
    "avgPopulation": 2.6
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "farmCount": 942,
    "farmPopulation": 2255,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "farmCount": 6174,
    "farmPopulation": 14558,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "farmCount": 1965,
    "farmPopulation": 4952,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "farmCount": 2920,
    "farmPopulation": 6933,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "farmCount": 1417,
    "farmPopulation": 3517,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "farmCount": 1119,
    "farmPopulation": 2680,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "farmCount": 1501,
    "farmPopulation": 3549,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "farmCount": 8565,
    "farmPopulation": 19760,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "farmCount": 9285,
    "farmPopulation": 20495,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "farmCount": 8984,
    "farmPopulation": 19332,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "farmCount": 6369,
    "farmPopulation": 14902,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "farmCount": 12994,
    "farmPopulation": 29477,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "farmCount": 5056,
    "farmPopulation": 11650,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "farmCount": 4277,
    "farmPopulation": 9731,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "farmCount": 6881,
    "farmPopulation": 14432,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "farmCount": 8206,
    "farmPopulation": 17307,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "farmCount": 7269,
    "farmPopulation": 15279,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "farmCount": 4145,
    "farmPopulation": 8350,
    "avgPopulation": 2
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "farmCount": 2945,
    "farmPopulation": 6215,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "farmCount": 7691,
    "farmPopulation": 16525,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "farmCount": 10862,
    "farmPopulation": 23230,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "farmCount": 8219,
    "farmPopulation": 16958,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "farmCount": 2180,
    "farmPopulation": 4360,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "farmCount": 697,
    "farmPopulation": 1355,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "farmCount": 1444,
    "farmPopulation": 3015,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "farmCount": 4134,
    "farmPopulation": 7669,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "farmCount": 8248,
    "farmPopulation": 16142,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "farmCount": 6139,
    "farmPopulation": 12092,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "farmCount": 3884,
    "farmPopulation": 7347,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "farmCount": 4605,
    "farmPopulation": 8912,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "farmCount": 2893,
    "farmPopulation": 5421,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "farmCount": 4526,
    "farmPopulation": 9574,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "farmCount": 2353,
    "farmPopulation": 4511,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "farmCount": 2374,
    "farmPopulation": 4777,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "farmCount": 3100,
    "farmPopulation": 6200,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "farmCount": 2374,
    "farmPopulation": 4659,
    "avgPopulation": 2
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "farmCount": 3176,
    "farmPopulation": 6039,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "farmCount": 10949,
    "farmPopulation": 22548,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "farmCount": 7898,
    "farmPopulation": 15900,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "farmCount": 4770,
    "farmPopulation": 9321,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "farmCount": 5890,
    "farmPopulation": 11518,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "farmCount": 6931,
    "farmPopulation": 13060,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "farmCount": 1699,
    "farmPopulation": 3537,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "farmCount": 5048,
    "farmPopulation": 9920,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "farmCount": 6143,
    "farmPopulation": 11284,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "farmCount": 7087,
    "farmPopulation": 13878,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "farmCount": 3561,
    "farmPopulation": 6562,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "farmCount": 9237,
    "farmPopulation": 20539,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "farmCount": 2283,
    "farmPopulation": 4761,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "farmCount": 3049,
    "farmPopulation": 5989,
    "avgPopulation": 2
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "farmCount": 5702,
    "farmPopulation": 12790,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "farmCount": 4762,
    "farmPopulation": 10804,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "farmCount": 3034,
    "farmPopulation": 6177,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "farmCount": 10453,
    "farmPopulation": 20484,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "farmCount": 8847,
    "farmPopulation": 16737,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "farmCount": 10355,
    "farmPopulation": 21714,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "farmCount": 13016,
    "farmPopulation": 25784,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "farmCount": 10825,
    "farmPopulation": 20719,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "farmCount": 908,
    "farmPopulation": 1865,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "farmCount": 11084,
    "farmPopulation": 22222,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "farmCount": 6660,
    "farmPopulation": 12775,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "farmCount": 10271,
    "farmPopulation": 19741,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "farmCount": 6617,
    "farmPopulation": 12512,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "farmCount": 6313,
    "farmPopulation": 11701,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "farmCount": 10318,
    "farmPopulation": 20345,
    "avgPopulation": 2
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "farmCount": 8956,
    "farmPopulation": 17301,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "farmCount": 7220,
    "farmPopulation": 13172,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "farmCount": 7900,
    "farmPopulation": 15484,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "farmCount": 13156,
    "farmPopulation": 26061,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "farmCount": 11177,
    "farmPopulation": 20837,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "farmCount": 9314,
    "farmPopulation": 16580,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "farmCount": 8147,
    "farmPopulation": 15245,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "farmCount": 8564,
    "farmPopulation": 16368,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "farmCount": 4344,
    "farmPopulation": 8100,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "farmCount": 4241,
    "farmPopulation": 7723,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "farmCount": 4298,
    "farmPopulation": 8222,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "farmCount": 4104,
    "farmPopulation": 7360,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "farmCount": 5422,
    "farmPopulation": 10083,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "farmCount": 9079,
    "farmPopulation": 16088,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "farmCount": 6828,
    "farmPopulation": 12887,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "farmCount": 1421,
    "farmPopulation": 2904,
    "avgPopulation": 2
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "farmCount": 4343,
    "farmPopulation": 9273,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "farmCount": 3685,
    "farmPopulation": 7865,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "farmCount": 5841,
    "farmPopulation": 12767,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "farmCount": 7480,
    "farmPopulation": 15624,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "farmCount": 2479,
    "farmPopulation": 5258,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "farmCount": 9471,
    "farmPopulation": 18187,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "farmCount": 14868,
    "farmPopulation": 29942,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "farmCount": 10379,
    "farmPopulation": 19023,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "farmCount": 7659,
    "farmPopulation": 15266,
    "avgPopulation": 2
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "farmCount": 6547,
    "farmPopulation": 12127,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "farmCount": 5453,
    "farmPopulation": 9514,
    "avgPopulation": 1.7
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "farmCount": 4245,
    "farmPopulation": 7987,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "farmCount": 10746,
    "farmPopulation": 18525,
    "avgPopulation": 1.7
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "farmCount": 6325,
    "farmPopulation": 11265,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "farmCount": 7000,
    "farmPopulation": 12289,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "farmCount": 6322,
    "farmPopulation": 11313,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "farmCount": 5794,
    "farmPopulation": 10349,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "farmCount": 10184,
    "farmPopulation": 18441,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "farmCount": 6719,
    "farmPopulation": 12342,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "farmCount": 8446,
    "farmPopulation": 16082,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "farmCount": 5718,
    "farmPopulation": 10125,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "farmCount": 5791,
    "farmPopulation": 11048,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "farmCount": 5673,
    "farmPopulation": 10613,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "farmCount": 3785,
    "farmPopulation": 7049,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "farmCount": 4104,
    "farmPopulation": 7389,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "farmCount": 6715,
    "farmPopulation": 12601,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "farmCount": 35,
    "farmPopulation": 75,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "farmCount": 154,
    "farmPopulation": 346,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "farmCount": 102,
    "farmPopulation": 220,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "farmCount": 165,
    "farmPopulation": 344,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "farmCount": 801,
    "farmPopulation": 1787,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "farmCount": 1058,
    "farmPopulation": 2364,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "farmCount": 892,
    "farmPopulation": 1767,
    "avgPopulation": 2
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "farmCount": 2051,
    "farmPopulation": 4637,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "farmCount": 1593,
    "farmPopulation": 3605,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "farmCount": 862,
    "farmPopulation": 1928,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "farmCount": 1425,
    "farmPopulation": 3157,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "farmCount": 2486,
    "farmPopulation": 5172,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "farmCount": 655,
    "farmPopulation": 1411,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "farmCount": 459,
    "farmPopulation": 990,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "farmCount": 971,
    "farmPopulation": 2151,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "farmCount": 2219,
    "farmPopulation": 4674,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "farmCount": 628,
    "farmPopulation": 1397,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "farmCount": 5144,
    "farmPopulation": 10331,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "farmCount": 1137,
    "farmPopulation": 2447,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "farmCount": 655,
    "farmPopulation": 1342,
    "avgPopulation": 2
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "farmCount": 4556,
    "farmPopulation": 10281,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "farmCount": 5149,
    "farmPopulation": 11538,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "farmCount": 7696,
    "farmPopulation": 17089,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "farmCount": 6909,
    "farmPopulation": 14499,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "farmCount": 4119,
    "farmPopulation": 7430,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "farmCount": 3170,
    "farmPopulation": 6753,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "farmCount": 4116,
    "farmPopulation": 9097,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "farmCount": 1058,
    "farmPopulation": 2246,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "farmCount": 2953,
    "farmPopulation": 6715,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "farmCount": 7413,
    "farmPopulation": 15023,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "farmCount": 15526,
    "farmPopulation": 28868,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "farmCount": 15511,
    "farmPopulation": 30387,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "farmCount": 13115,
    "farmPopulation": 24933,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "farmCount": 14485,
    "farmPopulation": 29635,
    "avgPopulation": 2
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "farmCount": 9351,
    "farmPopulation": 18091,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "farmCount": 9751,
    "farmPopulation": 17782,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "farmCount": 13633,
    "farmPopulation": 25791,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "farmCount": 7893,
    "farmPopulation": 15190,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "farmCount": 9745,
    "farmPopulation": 20218,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "farmCount": 10007,
    "farmPopulation": 18307,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "farmCount": 5158,
    "farmPopulation": 9567,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "farmCount": 3013,
    "farmPopulation": 5543,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "farmCount": 3999,
    "farmPopulation": 7252,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "farmCount": 7339,
    "farmPopulation": 13240,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "farmCount": 3934,
    "farmPopulation": 7155,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "farmCount": 5764,
    "farmPopulation": 10499,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "farmCount": 5280,
    "farmPopulation": 10209,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "farmCount": 8286,
    "farmPopulation": 15675,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "farmCount": 5621,
    "farmPopulation": 10683,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "farmCount": 4519,
    "farmPopulation": 8148,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "farmCount": 541,
    "farmPopulation": 1002,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "farmCount": 16192,
    "farmPopulation": 33713,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "farmCount": 4191,
    "farmPopulation": 8057,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "farmCount": 6788,
    "farmPopulation": 13082,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "farmCount": 10512,
    "farmPopulation": 22570,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "farmCount": 10823,
    "farmPopulation": 20440,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "farmCount": 7602,
    "farmPopulation": 15121,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "farmCount": 4373,
    "farmPopulation": 9290,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "farmCount": 3839,
    "farmPopulation": 6474,
    "avgPopulation": 1.7
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "farmCount": 5961,
    "farmPopulation": 10951,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "farmCount": 7148,
    "farmPopulation": 13246,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "farmCount": 6271,
    "farmPopulation": 11047,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "farmCount": 6494,
    "farmPopulation": 12216,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "farmCount": 7355,
    "farmPopulation": 13518,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "farmCount": 6465,
    "farmPopulation": 11305,
    "avgPopulation": 1.7
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "farmCount": 6549,
    "farmPopulation": 12050,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "farmCount": 8495,
    "farmPopulation": 15833,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "farmCount": 7122,
    "farmPopulation": 12819,
    "avgPopulation": 1.8
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "farmCount": 23221,
    "farmPopulation": 55835,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "farmCount": 14932,
    "farmPopulation": 33189,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "31011",
    "name": "장안구",
    "farmCount": 1835,
    "farmPopulation": 4445,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31012",
    "name": "권선구",
    "farmCount": 2815,
    "farmPopulation": 6818,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31013",
    "name": "팔달구",
    "farmCount": 1115,
    "farmPopulation": 2595,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31014",
    "name": "영통구",
    "farmCount": 2055,
    "farmPopulation": 5386,
    "avgPopulation": 2.6
  },
  {
    "sgisCode": "31021",
    "name": "수정구",
    "farmCount": 628,
    "farmPopulation": 1398,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "31022",
    "name": "중원구",
    "farmCount": 458,
    "farmPopulation": 1064,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31023",
    "name": "분당구",
    "farmCount": 1336,
    "farmPopulation": 3382,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31041",
    "name": "만안구",
    "farmCount": 900,
    "farmPopulation": 2199,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31042",
    "name": "동안구",
    "farmCount": 1259,
    "farmPopulation": 3255,
    "avgPopulation": 2.6
  },
  {
    "sgisCode": "31091",
    "name": "상록구",
    "farmCount": 1443,
    "farmPopulation": 3359,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31092",
    "name": "단원구",
    "farmCount": 1809,
    "farmPopulation": 4207,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31101",
    "name": "덕양구",
    "farmCount": 3302,
    "farmPopulation": 7955,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31103",
    "name": "일산동구",
    "farmCount": 2154,
    "farmPopulation": 5352,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31104",
    "name": "일산서구",
    "farmCount": 1932,
    "farmPopulation": 4784,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31191",
    "name": "처인구",
    "farmCount": 5982,
    "farmPopulation": 13600,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "31192",
    "name": "기흥구",
    "farmCount": 2459,
    "farmPopulation": 6280,
    "avgPopulation": 2.6
  },
  {
    "sgisCode": "31193",
    "name": "수지구",
    "farmCount": 1634,
    "farmPopulation": 4120,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31051",
    "name": "원미구",
    "farmCount": 1237,
    "farmPopulation": 3106,
    "avgPopulation": 2.5
  },
  {
    "sgisCode": "31052",
    "name": "소사구",
    "farmCount": 579,
    "farmPopulation": 1414,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "31053",
    "name": "오정구",
    "farmCount": 448,
    "farmPopulation": 1083,
    "avgPopulation": 2.4
  },
  {
    "sgisCode": "33041",
    "name": "상당구",
    "farmCount": 6050,
    "farmPopulation": 12580,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "33043",
    "name": "흥덕구",
    "farmCount": 6207,
    "farmPopulation": 13275,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "33044",
    "name": "청원구",
    "farmCount": 5376,
    "farmPopulation": 11339,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "33042",
    "name": "서원구",
    "farmCount": 4466,
    "farmPopulation": 9596,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "34011",
    "name": "동남구",
    "farmCount": 7039,
    "farmPopulation": 15040,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "34012",
    "name": "서북구",
    "farmCount": 6863,
    "farmPopulation": 15039,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "35011",
    "name": "완산구",
    "farmCount": 5763,
    "farmPopulation": 12727,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "35012",
    "name": "덕진구",
    "farmCount": 5978,
    "farmPopulation": 13157,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "37011",
    "name": "남구",
    "farmCount": 6721,
    "farmPopulation": 13827,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "37012",
    "name": "북구",
    "farmCount": 10011,
    "farmPopulation": 20063,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38111",
    "name": "의창구",
    "farmCount": 6473,
    "farmPopulation": 13684,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "38112",
    "name": "성산구",
    "farmCount": 4021,
    "farmPopulation": 9154,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "38113",
    "name": "마산합포구",
    "farmCount": 4212,
    "farmPopulation": 8439,
    "avgPopulation": 2
  },
  {
    "sgisCode": "38114",
    "name": "마산회원구",
    "farmCount": 3134,
    "farmPopulation": 6879,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "38115",
    "name": "진해구",
    "farmCount": 2097,
    "farmPopulation": 4478,
    "avgPopulation": 2.1
  }
];

/** 시도 농가 통계 (원천 시·도 행 그대로) */
const FARM_FALLBACK_SIDO: FarmStat[] = [
  {
    "sgisCode": "11",
    "name": "서울",
    "farmCount": 16741,
    "farmPopulation": 39320,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "farmCount": 17705,
    "farmPopulation": 38687,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "farmCount": 152886,
    "farmPopulation": 348956,
    "avgPopulation": 2.3
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "farmCount": 78899,
    "farmPopulation": 158786,
    "avgPopulation": 2
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "farmCount": 82075,
    "farmPopulation": 164318,
    "avgPopulation": 2
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "farmCount": 9237,
    "farmPopulation": 20539,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "farmCount": 18830,
    "farmPopulation": 40521,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "farmCount": 135745,
    "farmPopulation": 267151,
    "avgPopulation": 2
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "farmCount": 108315,
    "farmPopulation": 206922,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "farmCount": 22770,
    "farmPopulation": 48433,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "farmCount": 154423,
    "farmPopulation": 286735,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "farmCount": 15928,
    "farmPopulation": 34628,
    "avgPopulation": 2.2
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "farmCount": 35993,
    "farmPopulation": 76354,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "farmCount": 18710,
    "farmPopulation": 39834,
    "avgPopulation": 2.1
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "farmCount": 189203,
    "farmPopulation": 362065,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "farmCount": 146117,
    "farmPopulation": 284366,
    "avgPopulation": 1.9
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "farmCount": 38153,
    "farmPopulation": 89024,
    "avgPopulation": 2.3
  }
];

/** 시군구 sgisCode → FarmStat 빠른 조회 */
const SIGUNGU_INDEX = new Map(FARM_FALLBACK_SIGUNGU.map((f) => [f.sgisCode, f]));

/** 시도 sgisCode → FarmStat 빠른 조회 */
const SIDO_INDEX = new Map(FARM_FALLBACK_SIDO.map((f) => [f.sgisCode, f]));

/**
 * 통합시(수원·성남·용인 등) 농가 통계를 구 데이터 합산으로 산출 — 원천에서 시 = 구 합을 확인하고 쓴다.
 * 구 하나라도 없으면 null — 덜 센 합을 숫자로 내보내지 않는다 (10/7).
 */
function aggregateIntegratedCity(sgisCode: string): FarmStat | null {
  const guCodes = INTEGRATED_CITY_GU_CODES[sgisCode];
  if (!guCodes) return null;

  let farmCount = 0;
  let farmPopulation = 0;

  for (const gu of guCodes) {
    const stat = SIGUNGU_INDEX.get(gu);
    if (!stat) return null;
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
