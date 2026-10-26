/**
 * 시·군·구 귀농·귀촌 카드 정적 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-return-farm-rate.ts (return-farm-rate.ts 와 같은 KOSIS 조회 1회)
 * 데이터 소스: KOSIS 국가데이터처 귀농어·귀촌인 통계 — DT_1A02002 귀농인(T02)·DT_1A02008 귀농가구(T01)·DT_1A02015 귀촌인(T01), 전부 '계'
 * 통계 연도: 2025 (비공개로 빠진 곳은 전년도 값: 울릉군(2024))
 * 마지막 수집: 2026-10-26
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-return-farm-rate.ts` (data-sources.yml 주간 재수집)
 *
 * 왜 정적인가(2026-10-26 #184): 화면이 빌드·재생성 때 KOSIS 를 부르면 시간 초과로 카드가 숨은 채 하루 굳었다.
 * 연 1회(6월) 공표 숫자라 수집 때 고정한다. 짝은 admCode + 응답 지역명(10/7 코드 15건 밀림), 세 값이 다 있을 때만.
 * 주간 대조(check-region-stats-integrity.ts)가 이 파일을 거치지 않고 원표와 화면을 맞춘다.
 *
 * 수록: 139/230 시·군·구 (없는 곳 = 표에 없는 자치구·신설 구 → 카드 없음)
 */

export interface ReturnFarmCardStat {
  /** KOSIS 지역코드 = sigungus.ts admCode */
  admCode: string;
  /** 시·군·구 이름 */
  name: string;
  /** 귀농인 (명) */
  returnFarmPerson: number;
  /** 귀농 가구 (가구) */
  returnFarmHousehold: number;
  /** 귀촌인 (명) */
  returnRuralPerson: number;
  /** 통계 연도 */
  year: number;
}

export const RETURN_FARM_SIGUNGU: ReturnFarmCardStat[] = [
  {
    "admCode": "23310",
    "name": "강화군",
    "returnFarmPerson": 71,
    "returnFarmHousehold": 69,
    "returnRuralPerson": 2945,
    "year": 2025
  },
  {
    "admCode": "23320",
    "name": "옹진군",
    "returnFarmPerson": 14,
    "returnFarmHousehold": 14,
    "returnRuralPerson": 1283,
    "year": 2025
  },
  {
    "admCode": "31070",
    "name": "평택시",
    "returnFarmPerson": 46,
    "returnFarmHousehold": 44,
    "returnRuralPerson": 8989,
    "year": 2025
  },
  {
    "admCode": "31130",
    "name": "남양주시",
    "returnFarmPerson": 34,
    "returnFarmHousehold": 34,
    "returnRuralPerson": 14980,
    "year": 2025
  },
  {
    "admCode": "31190",
    "name": "용인시",
    "returnFarmPerson": 70,
    "returnFarmHousehold": 66,
    "returnRuralPerson": 14623,
    "year": 2025
  },
  {
    "admCode": "31200",
    "name": "파주시",
    "returnFarmPerson": 50,
    "returnFarmHousehold": 49,
    "returnRuralPerson": 7947,
    "year": 2025
  },
  {
    "admCode": "31210",
    "name": "이천시",
    "returnFarmPerson": 57,
    "returnFarmHousehold": 55,
    "returnRuralPerson": 8342,
    "year": 2025
  },
  {
    "admCode": "31220",
    "name": "안성시",
    "returnFarmPerson": 76,
    "returnFarmHousehold": 73,
    "returnRuralPerson": 7619,
    "year": 2025
  },
  {
    "admCode": "31230",
    "name": "김포시",
    "returnFarmPerson": 29,
    "returnFarmHousehold": 24,
    "returnRuralPerson": 7928,
    "year": 2025
  },
  {
    "admCode": "31240",
    "name": "화성시",
    "returnFarmPerson": 114,
    "returnFarmHousehold": 109,
    "returnRuralPerson": 23790,
    "year": 2025
  },
  {
    "admCode": "31250",
    "name": "광주시",
    "returnFarmPerson": 20,
    "returnFarmHousehold": 18,
    "returnRuralPerson": 5210,
    "year": 2025
  },
  {
    "admCode": "31260",
    "name": "양주시",
    "returnFarmPerson": 25,
    "returnFarmHousehold": 22,
    "returnRuralPerson": 4316,
    "year": 2025
  },
  {
    "admCode": "31270",
    "name": "포천시",
    "returnFarmPerson": 52,
    "returnFarmHousehold": 49,
    "returnRuralPerson": 4713,
    "year": 2025
  },
  {
    "admCode": "31280",
    "name": "여주시",
    "returnFarmPerson": 47,
    "returnFarmHousehold": 44,
    "returnRuralPerson": 2114,
    "year": 2025
  },
  {
    "admCode": "31380",
    "name": "양평군",
    "returnFarmPerson": 87,
    "returnFarmHousehold": 83,
    "returnRuralPerson": 5614,
    "year": 2025
  },
  {
    "admCode": "31370",
    "name": "가평군",
    "returnFarmPerson": 44,
    "returnFarmHousehold": 41,
    "returnRuralPerson": 2575,
    "year": 2025
  },
  {
    "admCode": "31350",
    "name": "연천군",
    "returnFarmPerson": 41,
    "returnFarmHousehold": 37,
    "returnRuralPerson": 2351,
    "year": 2025
  },
  {
    "admCode": "32010",
    "name": "춘천시",
    "returnFarmPerson": 50,
    "returnFarmHousehold": 44,
    "returnRuralPerson": 5750,
    "year": 2025
  },
  {
    "admCode": "32020",
    "name": "원주시",
    "returnFarmPerson": 48,
    "returnFarmHousehold": 47,
    "returnRuralPerson": 4453,
    "year": 2025
  },
  {
    "admCode": "32030",
    "name": "강릉시",
    "returnFarmPerson": 24,
    "returnFarmHousehold": 24,
    "returnRuralPerson": 1779,
    "year": 2025
  },
  {
    "admCode": "32070",
    "name": "삼척시",
    "returnFarmPerson": 23,
    "returnFarmHousehold": 20,
    "returnRuralPerson": 595,
    "year": 2025
  },
  {
    "admCode": "32310",
    "name": "홍천군",
    "returnFarmPerson": 77,
    "returnFarmHousehold": 70,
    "returnRuralPerson": 1982,
    "year": 2025
  },
  {
    "admCode": "32320",
    "name": "횡성군",
    "returnFarmPerson": 69,
    "returnFarmHousehold": 63,
    "returnRuralPerson": 1381,
    "year": 2025
  },
  {
    "admCode": "32330",
    "name": "영월군",
    "returnFarmPerson": 69,
    "returnFarmHousehold": 60,
    "returnRuralPerson": 1043,
    "year": 2025
  },
  {
    "admCode": "32340",
    "name": "평창군",
    "returnFarmPerson": 54,
    "returnFarmHousehold": 48,
    "returnRuralPerson": 1306,
    "year": 2025
  },
  {
    "admCode": "32350",
    "name": "정선군",
    "returnFarmPerson": 41,
    "returnFarmHousehold": 39,
    "returnRuralPerson": 1130,
    "year": 2025
  },
  {
    "admCode": "32360",
    "name": "철원군",
    "returnFarmPerson": 27,
    "returnFarmHousehold": 26,
    "returnRuralPerson": 1213,
    "year": 2025
  },
  {
    "admCode": "32370",
    "name": "화천군",
    "returnFarmPerson": 21,
    "returnFarmHousehold": 21,
    "returnRuralPerson": 1123,
    "year": 2025
  },
  {
    "admCode": "32380",
    "name": "양구군",
    "returnFarmPerson": 19,
    "returnFarmHousehold": 19,
    "returnRuralPerson": 761,
    "year": 2025
  },
  {
    "admCode": "32390",
    "name": "인제군",
    "returnFarmPerson": 18,
    "returnFarmHousehold": 16,
    "returnRuralPerson": 1424,
    "year": 2025
  },
  {
    "admCode": "32400",
    "name": "고성군",
    "returnFarmPerson": 21,
    "returnFarmHousehold": 20,
    "returnRuralPerson": 1099,
    "year": 2025
  },
  {
    "admCode": "32410",
    "name": "양양군",
    "returnFarmPerson": 26,
    "returnFarmHousehold": 25,
    "returnRuralPerson": 995,
    "year": 2025
  },
  {
    "admCode": "33010",
    "name": "청주시",
    "returnFarmPerson": 106,
    "returnFarmHousehold": 104,
    "returnRuralPerson": 13790,
    "year": 2025
  },
  {
    "admCode": "33020",
    "name": "충주시",
    "returnFarmPerson": 76,
    "returnFarmHousehold": 75,
    "returnRuralPerson": 4783,
    "year": 2025
  },
  {
    "admCode": "33030",
    "name": "제천시",
    "returnFarmPerson": 45,
    "returnFarmHousehold": 44,
    "returnRuralPerson": 890,
    "year": 2025
  },
  {
    "admCode": "33320",
    "name": "보은군",
    "returnFarmPerson": 64,
    "returnFarmHousehold": 60,
    "returnRuralPerson": 896,
    "year": 2025
  },
  {
    "admCode": "33330",
    "name": "옥천군",
    "returnFarmPerson": 81,
    "returnFarmHousehold": 77,
    "returnRuralPerson": 1642,
    "year": 2025
  },
  {
    "admCode": "33340",
    "name": "영동군",
    "returnFarmPerson": 75,
    "returnFarmHousehold": 70,
    "returnRuralPerson": 1091,
    "year": 2025
  },
  {
    "admCode": "33390",
    "name": "증평군",
    "returnFarmPerson": 16,
    "returnFarmHousehold": 15,
    "returnRuralPerson": 1191,
    "year": 2025
  },
  {
    "admCode": "33350",
    "name": "진천군",
    "returnFarmPerson": 51,
    "returnFarmHousehold": 50,
    "returnRuralPerson": 2948,
    "year": 2025
  },
  {
    "admCode": "33360",
    "name": "괴산군",
    "returnFarmPerson": 87,
    "returnFarmHousehold": 81,
    "returnRuralPerson": 1130,
    "year": 2025
  },
  {
    "admCode": "33370",
    "name": "음성군",
    "returnFarmPerson": 61,
    "returnFarmHousehold": 60,
    "returnRuralPerson": 4081,
    "year": 2025
  },
  {
    "admCode": "33380",
    "name": "단양군",
    "returnFarmPerson": 28,
    "returnFarmHousehold": 26,
    "returnRuralPerson": 725,
    "year": 2025
  },
  {
    "admCode": "29010",
    "name": "세종특별자치시",
    "returnFarmPerson": 37,
    "returnFarmHousehold": 37,
    "returnRuralPerson": 4533,
    "year": 2025
  },
  {
    "admCode": "34010",
    "name": "천안시",
    "returnFarmPerson": 40,
    "returnFarmHousehold": 40,
    "returnRuralPerson": 5145,
    "year": 2025
  },
  {
    "admCode": "34020",
    "name": "공주시",
    "returnFarmPerson": 89,
    "returnFarmHousehold": 88,
    "returnRuralPerson": 1488,
    "year": 2025
  },
  {
    "admCode": "34030",
    "name": "보령시",
    "returnFarmPerson": 83,
    "returnFarmHousehold": 79,
    "returnRuralPerson": 958,
    "year": 2025
  },
  {
    "admCode": "34040",
    "name": "아산시",
    "returnFarmPerson": 82,
    "returnFarmHousehold": 78,
    "returnRuralPerson": 13896,
    "year": 2025
  },
  {
    "admCode": "34050",
    "name": "서산시",
    "returnFarmPerson": 106,
    "returnFarmHousehold": 101,
    "returnRuralPerson": 3185,
    "year": 2025
  },
  {
    "admCode": "34060",
    "name": "논산시",
    "returnFarmPerson": 93,
    "returnFarmHousehold": 90,
    "returnRuralPerson": 1921,
    "year": 2025
  },
  {
    "admCode": "34070",
    "name": "계룡시",
    "returnFarmPerson": 11,
    "returnFarmHousehold": 11,
    "returnRuralPerson": 2292,
    "year": 2025
  },
  {
    "admCode": "34080",
    "name": "당진시",
    "returnFarmPerson": 95,
    "returnFarmHousehold": 87,
    "returnRuralPerson": 3824,
    "year": 2025
  },
  {
    "admCode": "34310",
    "name": "금산군",
    "returnFarmPerson": 89,
    "returnFarmHousehold": 83,
    "returnRuralPerson": 1387,
    "year": 2025
  },
  {
    "admCode": "34330",
    "name": "부여군",
    "returnFarmPerson": 112,
    "returnFarmHousehold": 107,
    "returnRuralPerson": 1227,
    "year": 2025
  },
  {
    "admCode": "34340",
    "name": "서천군",
    "returnFarmPerson": 60,
    "returnFarmHousehold": 59,
    "returnRuralPerson": 1171,
    "year": 2025
  },
  {
    "admCode": "34350",
    "name": "청양군",
    "returnFarmPerson": 77,
    "returnFarmHousehold": 71,
    "returnRuralPerson": 878,
    "year": 2025
  },
  {
    "admCode": "34360",
    "name": "홍성군",
    "returnFarmPerson": 84,
    "returnFarmHousehold": 78,
    "returnRuralPerson": 3303,
    "year": 2025
  },
  {
    "admCode": "34370",
    "name": "예산군",
    "returnFarmPerson": 96,
    "returnFarmHousehold": 94,
    "returnRuralPerson": 2433,
    "year": 2025
  },
  {
    "admCode": "34380",
    "name": "태안군",
    "returnFarmPerson": 71,
    "returnFarmHousehold": 68,
    "returnRuralPerson": 1858,
    "year": 2025
  },
  {
    "admCode": "35020",
    "name": "군산시",
    "returnFarmPerson": 35,
    "returnFarmHousehold": 33,
    "returnRuralPerson": 1116,
    "year": 2025
  },
  {
    "admCode": "35030",
    "name": "익산시",
    "returnFarmPerson": 69,
    "returnFarmHousehold": 68,
    "returnRuralPerson": 1898,
    "year": 2025
  },
  {
    "admCode": "35040",
    "name": "정읍시",
    "returnFarmPerson": 96,
    "returnFarmHousehold": 94,
    "returnRuralPerson": 1100,
    "year": 2025
  },
  {
    "admCode": "35050",
    "name": "남원시",
    "returnFarmPerson": 103,
    "returnFarmHousehold": 102,
    "returnRuralPerson": 801,
    "year": 2025
  },
  {
    "admCode": "35060",
    "name": "김제시",
    "returnFarmPerson": 109,
    "returnFarmHousehold": 108,
    "returnRuralPerson": 2287,
    "year": 2025
  },
  {
    "admCode": "35310",
    "name": "완주군",
    "returnFarmPerson": 105,
    "returnFarmHousehold": 97,
    "returnRuralPerson": 5476,
    "year": 2025
  },
  {
    "admCode": "35320",
    "name": "진안군",
    "returnFarmPerson": 69,
    "returnFarmHousehold": 64,
    "returnRuralPerson": 837,
    "year": 2025
  },
  {
    "admCode": "35330",
    "name": "무주군",
    "returnFarmPerson": 40,
    "returnFarmHousehold": 39,
    "returnRuralPerson": 533,
    "year": 2025
  },
  {
    "admCode": "35340",
    "name": "장수군",
    "returnFarmPerson": 66,
    "returnFarmHousehold": 61,
    "returnRuralPerson": 502,
    "year": 2025
  },
  {
    "admCode": "35350",
    "name": "임실군",
    "returnFarmPerson": 48,
    "returnFarmHousehold": 44,
    "returnRuralPerson": 881,
    "year": 2025
  },
  {
    "admCode": "35360",
    "name": "순창군",
    "returnFarmPerson": 94,
    "returnFarmHousehold": 93,
    "returnRuralPerson": 997,
    "year": 2025
  },
  {
    "admCode": "35370",
    "name": "고창군",
    "returnFarmPerson": 109,
    "returnFarmHousehold": 106,
    "returnRuralPerson": 1290,
    "year": 2025
  },
  {
    "admCode": "35380",
    "name": "부안군",
    "returnFarmPerson": 86,
    "returnFarmHousehold": 83,
    "returnRuralPerson": 1121,
    "year": 2025
  },
  {
    "admCode": "36020",
    "name": "여수시",
    "returnFarmPerson": 31,
    "returnFarmHousehold": 31,
    "returnRuralPerson": 2205,
    "year": 2025
  },
  {
    "admCode": "36030",
    "name": "순천시",
    "returnFarmPerson": 73,
    "returnFarmHousehold": 72,
    "returnRuralPerson": 3629,
    "year": 2025
  },
  {
    "admCode": "36040",
    "name": "나주시",
    "returnFarmPerson": 121,
    "returnFarmHousehold": 117,
    "returnRuralPerson": 1932,
    "year": 2025
  },
  {
    "admCode": "36060",
    "name": "광양시",
    "returnFarmPerson": 33,
    "returnFarmHousehold": 33,
    "returnRuralPerson": 2583,
    "year": 2025
  },
  {
    "admCode": "36310",
    "name": "담양군",
    "returnFarmPerson": 53,
    "returnFarmHousehold": 50,
    "returnRuralPerson": 1567,
    "year": 2025
  },
  {
    "admCode": "36320",
    "name": "곡성군",
    "returnFarmPerson": 83,
    "returnFarmHousehold": 81,
    "returnRuralPerson": 881,
    "year": 2025
  },
  {
    "admCode": "36330",
    "name": "구례군",
    "returnFarmPerson": 39,
    "returnFarmHousehold": 39,
    "returnRuralPerson": 695,
    "year": 2025
  },
  {
    "admCode": "36350",
    "name": "고흥군",
    "returnFarmPerson": 153,
    "returnFarmHousehold": 148,
    "returnRuralPerson": 1468,
    "year": 2025
  },
  {
    "admCode": "36360",
    "name": "보성군",
    "returnFarmPerson": 81,
    "returnFarmHousehold": 80,
    "returnRuralPerson": 956,
    "year": 2025
  },
  {
    "admCode": "36370",
    "name": "화순군",
    "returnFarmPerson": 89,
    "returnFarmHousehold": 88,
    "returnRuralPerson": 1816,
    "year": 2025
  },
  {
    "admCode": "36380",
    "name": "장흥군",
    "returnFarmPerson": 70,
    "returnFarmHousehold": 69,
    "returnRuralPerson": 925,
    "year": 2025
  },
  {
    "admCode": "36390",
    "name": "강진군",
    "returnFarmPerson": 63,
    "returnFarmHousehold": 60,
    "returnRuralPerson": 690,
    "year": 2025
  },
  {
    "admCode": "36400",
    "name": "해남군",
    "returnFarmPerson": 107,
    "returnFarmHousehold": 106,
    "returnRuralPerson": 1326,
    "year": 2025
  },
  {
    "admCode": "36410",
    "name": "영암군",
    "returnFarmPerson": 103,
    "returnFarmHousehold": 96,
    "returnRuralPerson": 1479,
    "year": 2025
  },
  {
    "admCode": "36420",
    "name": "무안군",
    "returnFarmPerson": 110,
    "returnFarmHousehold": 107,
    "returnRuralPerson": 5163,
    "year": 2025
  },
  {
    "admCode": "36430",
    "name": "함평군",
    "returnFarmPerson": 92,
    "returnFarmHousehold": 86,
    "returnRuralPerson": 815,
    "year": 2025
  },
  {
    "admCode": "36440",
    "name": "영광군",
    "returnFarmPerson": 72,
    "returnFarmHousehold": 72,
    "returnRuralPerson": 2046,
    "year": 2025
  },
  {
    "admCode": "36450",
    "name": "장성군",
    "returnFarmPerson": 78,
    "returnFarmHousehold": 78,
    "returnRuralPerson": 2263,
    "year": 2025
  },
  {
    "admCode": "36460",
    "name": "완도군",
    "returnFarmPerson": 41,
    "returnFarmHousehold": 38,
    "returnRuralPerson": 933,
    "year": 2025
  },
  {
    "admCode": "36470",
    "name": "진도군",
    "returnFarmPerson": 51,
    "returnFarmHousehold": 49,
    "returnRuralPerson": 649,
    "year": 2025
  },
  {
    "admCode": "36480",
    "name": "신안군",
    "returnFarmPerson": 138,
    "returnFarmHousehold": 133,
    "returnRuralPerson": 2172,
    "year": 2025
  },
  {
    "admCode": "21310",
    "name": "기장군",
    "returnFarmPerson": 24,
    "returnFarmHousehold": 23,
    "returnRuralPerson": 6870,
    "year": 2025
  },
  {
    "admCode": "22310",
    "name": "달성군",
    "returnFarmPerson": 43,
    "returnFarmHousehold": 41,
    "returnRuralPerson": 8102,
    "year": 2025
  },
  {
    "admCode": "22320",
    "name": "군위군",
    "returnFarmPerson": 74,
    "returnFarmHousehold": 73,
    "returnRuralPerson": 719,
    "year": 2025
  },
  {
    "admCode": "26310",
    "name": "울주군",
    "returnFarmPerson": 80,
    "returnFarmHousehold": 76,
    "returnRuralPerson": 8748,
    "year": 2025
  },
  {
    "admCode": "37010",
    "name": "포항시",
    "returnFarmPerson": 91,
    "returnFarmHousehold": 86,
    "returnRuralPerson": 11274,
    "year": 2025
  },
  {
    "admCode": "37020",
    "name": "경주시",
    "returnFarmPerson": 112,
    "returnFarmHousehold": 104,
    "returnRuralPerson": 6827,
    "year": 2025
  },
  {
    "admCode": "37030",
    "name": "김천시",
    "returnFarmPerson": 77,
    "returnFarmHousehold": 76,
    "returnRuralPerson": 1699,
    "year": 2025
  },
  {
    "admCode": "37040",
    "name": "안동시",
    "returnFarmPerson": 115,
    "returnFarmHousehold": 109,
    "returnRuralPerson": 2194,
    "year": 2025
  },
  {
    "admCode": "37050",
    "name": "구미시",
    "returnFarmPerson": 38,
    "returnFarmHousehold": 38,
    "returnRuralPerson": 4208,
    "year": 2025
  },
  {
    "admCode": "37060",
    "name": "영주시",
    "returnFarmPerson": 57,
    "returnFarmHousehold": 56,
    "returnRuralPerson": 732,
    "year": 2025
  },
  {
    "admCode": "37070",
    "name": "영천시",
    "returnFarmPerson": 109,
    "returnFarmHousehold": 106,
    "returnRuralPerson": 1509,
    "year": 2025
  },
  {
    "admCode": "37080",
    "name": "상주시",
    "returnFarmPerson": 125,
    "returnFarmHousehold": 121,
    "returnRuralPerson": 1131,
    "year": 2025
  },
  {
    "admCode": "37090",
    "name": "문경시",
    "returnFarmPerson": 78,
    "returnFarmHousehold": 74,
    "returnRuralPerson": 775,
    "year": 2025
  },
  {
    "admCode": "37100",
    "name": "경산시",
    "returnFarmPerson": 52,
    "returnFarmHousehold": 50,
    "returnRuralPerson": 4046,
    "year": 2025
  },
  {
    "admCode": "37320",
    "name": "의성군",
    "returnFarmPerson": 138,
    "returnFarmHousehold": 132,
    "returnRuralPerson": 1162,
    "year": 2025
  },
  {
    "admCode": "37330",
    "name": "청송군",
    "returnFarmPerson": 80,
    "returnFarmHousehold": 77,
    "returnRuralPerson": 673,
    "year": 2025
  },
  {
    "admCode": "37340",
    "name": "영양군",
    "returnFarmPerson": 42,
    "returnFarmHousehold": 41,
    "returnRuralPerson": 519,
    "year": 2025
  },
  {
    "admCode": "37350",
    "name": "영덕군",
    "returnFarmPerson": 57,
    "returnFarmHousehold": 54,
    "returnRuralPerson": 879,
    "year": 2025
  },
  {
    "admCode": "37360",
    "name": "청도군",
    "returnFarmPerson": 98,
    "returnFarmHousehold": 93,
    "returnRuralPerson": 1232,
    "year": 2025
  },
  {
    "admCode": "37370",
    "name": "고령군",
    "returnFarmPerson": 41,
    "returnFarmHousehold": 41,
    "returnRuralPerson": 792,
    "year": 2025
  },
  {
    "admCode": "37380",
    "name": "성주군",
    "returnFarmPerson": 62,
    "returnFarmHousehold": 60,
    "returnRuralPerson": 1053,
    "year": 2025
  },
  {
    "admCode": "37390",
    "name": "칠곡군",
    "returnFarmPerson": 40,
    "returnFarmHousehold": 40,
    "returnRuralPerson": 3291,
    "year": 2025
  },
  {
    "admCode": "37400",
    "name": "예천군",
    "returnFarmPerson": 89,
    "returnFarmHousehold": 84,
    "returnRuralPerson": 1516,
    "year": 2025
  },
  {
    "admCode": "37410",
    "name": "봉화군",
    "returnFarmPerson": 57,
    "returnFarmHousehold": 52,
    "returnRuralPerson": 690,
    "year": 2025
  },
  {
    "admCode": "37420",
    "name": "울진군",
    "returnFarmPerson": 38,
    "returnFarmHousehold": 37,
    "returnRuralPerson": 1486,
    "year": 2025
  },
  {
    "admCode": "37430",
    "name": "울릉군",
    "returnFarmPerson": 5,
    "returnFarmHousehold": 5,
    "returnRuralPerson": 615,
    "year": 2024
  },
  {
    "admCode": "38110",
    "name": "창원시",
    "returnFarmPerson": 41,
    "returnFarmHousehold": 41,
    "returnRuralPerson": 5741,
    "year": 2025
  },
  {
    "admCode": "38030",
    "name": "진주시",
    "returnFarmPerson": 66,
    "returnFarmHousehold": 65,
    "returnRuralPerson": 2584,
    "year": 2025
  },
  {
    "admCode": "38050",
    "name": "통영시",
    "returnFarmPerson": 42,
    "returnFarmHousehold": 37,
    "returnRuralPerson": 2518,
    "year": 2025
  },
  {
    "admCode": "38060",
    "name": "사천시",
    "returnFarmPerson": 49,
    "returnFarmHousehold": 46,
    "returnRuralPerson": 3027,
    "year": 2025
  },
  {
    "admCode": "38070",
    "name": "김해시",
    "returnFarmPerson": 24,
    "returnFarmHousehold": 24,
    "returnRuralPerson": 3451,
    "year": 2025
  },
  {
    "admCode": "38080",
    "name": "밀양시",
    "returnFarmPerson": 89,
    "returnFarmHousehold": 86,
    "returnRuralPerson": 1790,
    "year": 2025
  },
  {
    "admCode": "38090",
    "name": "거제시",
    "returnFarmPerson": 30,
    "returnFarmHousehold": 28,
    "returnRuralPerson": 2873,
    "year": 2025
  },
  {
    "admCode": "38100",
    "name": "양산시",
    "returnFarmPerson": 27,
    "returnFarmHousehold": 27,
    "returnRuralPerson": 9637,
    "year": 2025
  },
  {
    "admCode": "38310",
    "name": "의령군",
    "returnFarmPerson": 48,
    "returnFarmHousehold": 44,
    "returnRuralPerson": 668,
    "year": 2025
  },
  {
    "admCode": "38320",
    "name": "함안군",
    "returnFarmPerson": 53,
    "returnFarmHousehold": 51,
    "returnRuralPerson": 1389,
    "year": 2025
  },
  {
    "admCode": "38330",
    "name": "창녕군",
    "returnFarmPerson": 89,
    "returnFarmHousehold": 83,
    "returnRuralPerson": 1168,
    "year": 2025
  },
  {
    "admCode": "38340",
    "name": "고성군",
    "returnFarmPerson": 65,
    "returnFarmHousehold": 59,
    "returnRuralPerson": 1076,
    "year": 2025
  },
  {
    "admCode": "38350",
    "name": "남해군",
    "returnFarmPerson": 74,
    "returnFarmHousehold": 68,
    "returnRuralPerson": 1197,
    "year": 2025
  },
  {
    "admCode": "38360",
    "name": "하동군",
    "returnFarmPerson": 96,
    "returnFarmHousehold": 88,
    "returnRuralPerson": 972,
    "year": 2025
  },
  {
    "admCode": "38370",
    "name": "산청군",
    "returnFarmPerson": 65,
    "returnFarmHousehold": 62,
    "returnRuralPerson": 913,
    "year": 2025
  },
  {
    "admCode": "38380",
    "name": "함양군",
    "returnFarmPerson": 66,
    "returnFarmHousehold": 62,
    "returnRuralPerson": 798,
    "year": 2025
  },
  {
    "admCode": "38390",
    "name": "거창군",
    "returnFarmPerson": 78,
    "returnFarmHousehold": 75,
    "returnRuralPerson": 1362,
    "year": 2025
  },
  {
    "admCode": "38400",
    "name": "합천군",
    "returnFarmPerson": 76,
    "returnFarmHousehold": 74,
    "returnRuralPerson": 850,
    "year": 2025
  },
  {
    "admCode": "39010",
    "name": "제주시",
    "returnFarmPerson": 71,
    "returnFarmHousehold": 67,
    "returnRuralPerson": 5911,
    "year": 2025
  },
  {
    "admCode": "39020",
    "name": "서귀포시",
    "returnFarmPerson": 76,
    "returnFarmHousehold": 70,
    "returnRuralPerson": 3820,
    "year": 2025
  }
];

const BY_ADM = new Map(RETURN_FARM_SIGUNGU.map((r) => [r.admCode, r]));

/** 시·군·구 귀농·귀촌 카드 값 — 코드와 이름이 둘 다 맞을 때만, 없으면 null(카드 숨김) */
export function getReturnFarmStat(admCode: string, name: string): ReturnFarmCardStat | null {
  const r = BY_ADM.get(admCode);
  return r && r.name === name ? r : null;
}
