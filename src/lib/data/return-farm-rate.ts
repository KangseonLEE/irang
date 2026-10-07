/**
 * 귀농 인구 비율 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-return-farm-rate.ts
 * 데이터 소스: KOSIS 통계청 귀농어·귀촌인 통계 (DT_1A02002)
 * 인구 베이스: src/lib/data/population-trend.ts (2022년)
 * 통계 연도: 2025 (비공개로 빠진 곳은 전년도 값: 울릉군(2024))
 * 마지막 수집: 2026-10-07
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-return-farm-rate.ts`
 *
 * Phase 4 — 정착 점수 산출용 추가 차원 (귀농 활성도).
 * 비율 = (해당 지역 귀농인 수 / 해당 지역 전체 인구) × 100
 *
 * ⚠ 코드 체계 주의:
 *   - KOSIS C1 코드 = sigungus.ts admCode (옛 행정구역분류 체계, 예: 전남 순천 = 36030 — 행안부 코드 아님)
 *   - 본 파일의 sgisCode = SGIS 5자리 (예: 전남 순천 = 36030)
 *   - 매핑은 sigungus.ts의 admCode + sgisCode 페어를 통해 변환
 *
 * 커버리지: 139/230 시군구 (수집일 기준)
 * 미수집 시군구: 91건 (스크립트 콘솔 참조)
 */

export interface ReturnFarmRateStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 귀농인 수 (명) */
  returnFarmCount: number;
  /** 귀농 인구 비율 (%) */
  returnFarmRate: number;
  /** 통계 연도 */
  year: number;
}

/** 시군구 귀농 인구 비율 (SGIS 5자리) */
export const RETURN_FARM_RATE_SIGUNGU: ReturnFarmRateStat[] = [
  {
    "sgisCode": "23510",
    "name": "강화군",
    "returnFarmCount": 71,
    "returnFarmRate": 0.1069,
    "year": 2025
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "returnFarmCount": 14,
    "returnFarmRate": 0.0724,
    "year": 2025
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "returnFarmCount": 46,
    "returnFarmRate": 0.0078,
    "year": 2025
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "returnFarmCount": 34,
    "returnFarmRate": 0.0047,
    "year": 2025
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "returnFarmCount": 70,
    "returnFarmRate": 0.0066,
    "year": 2025
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "returnFarmCount": 50,
    "returnFarmRate": 0.0102,
    "year": 2025
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "returnFarmCount": 57,
    "returnFarmRate": 0.0251,
    "year": 2025
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "returnFarmCount": 76,
    "returnFarmRate": 0.0364,
    "year": 2025
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "returnFarmCount": 29,
    "returnFarmRate": 0.0059,
    "year": 2025
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "returnFarmCount": 114,
    "returnFarmRate": 0.0122,
    "year": 2025
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "returnFarmCount": 20,
    "returnFarmRate": 0.0051,
    "year": 2025
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "returnFarmCount": 25,
    "returnFarmRate": 0.0103,
    "year": 2025
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "returnFarmCount": 52,
    "returnFarmRate": 0.0318,
    "year": 2025
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "returnFarmCount": 47,
    "returnFarmRate": 0.0413,
    "year": 2025
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "returnFarmCount": 87,
    "returnFarmRate": 0.0744,
    "year": 2025
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "returnFarmCount": 44,
    "returnFarmRate": 0.0736,
    "year": 2025
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "returnFarmCount": 41,
    "returnFarmRate": 0.0993,
    "year": 2025
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "returnFarmCount": 50,
    "returnFarmRate": 0.0171,
    "year": 2025
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "returnFarmCount": 48,
    "returnFarmRate": 0.0133,
    "year": 2025
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "returnFarmCount": 24,
    "returnFarmRate": 0.0112,
    "year": 2025
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "returnFarmCount": 23,
    "returnFarmRate": 0.0358,
    "year": 2025
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "returnFarmCount": 77,
    "returnFarmRate": 0.1181,
    "year": 2025
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "returnFarmCount": 69,
    "returnFarmRate": 0.1538,
    "year": 2025
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "returnFarmCount": 69,
    "returnFarmRate": 0.1935,
    "year": 2025
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "returnFarmCount": 54,
    "returnFarmRate": 0.1395,
    "year": 2025
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "returnFarmCount": 41,
    "returnFarmRate": 0.1229,
    "year": 2025
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "returnFarmCount": 27,
    "returnFarmRate": 0.0656,
    "year": 2025
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "returnFarmCount": 21,
    "returnFarmRate": 0.0931,
    "year": 2025
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "returnFarmCount": 19,
    "returnFarmRate": 0.0912,
    "year": 2025
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "returnFarmCount": 18,
    "returnFarmRate": 0.0582,
    "year": 2025
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "returnFarmCount": 21,
    "returnFarmRate": 0.0774,
    "year": 2025
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "returnFarmCount": 26,
    "returnFarmRate": 0.0979,
    "year": 2025
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "returnFarmCount": 106,
    "returnFarmRate": 0.0123,
    "year": 2025
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "returnFarmCount": 76,
    "returnFarmRate": 0.0352,
    "year": 2025
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "returnFarmCount": 45,
    "returnFarmRate": 0.0345,
    "year": 2025
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "returnFarmCount": 64,
    "returnFarmRate": 0.2089,
    "year": 2025
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "returnFarmCount": 81,
    "returnFarmRate": 0.1687,
    "year": 2025
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "returnFarmCount": 75,
    "returnFarmRate": 0.1712,
    "year": 2025
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "returnFarmCount": 16,
    "returnFarmRate": 0.0424,
    "year": 2025
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "returnFarmCount": 51,
    "returnFarmRate": 0.0547,
    "year": 2025
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "returnFarmCount": 87,
    "returnFarmRate": 0.23,
    "year": 2025
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "returnFarmCount": 61,
    "returnFarmRate": 0.0595,
    "year": 2025
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "returnFarmCount": 28,
    "returnFarmRate": 0.1058,
    "year": 2025
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "returnFarmCount": 37,
    "returnFarmRate": 0.0097,
    "year": 2025
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "returnFarmCount": 40,
    "returnFarmRate": 0.0058,
    "year": 2025
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "returnFarmCount": 89,
    "returnFarmRate": 0.0839,
    "year": 2025
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "returnFarmCount": 83,
    "returnFarmRate": 0.086,
    "year": 2025
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "returnFarmCount": 82,
    "returnFarmRate": 0.0226,
    "year": 2025
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "returnFarmCount": 106,
    "returnFarmRate": 0.0596,
    "year": 2025
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "returnFarmCount": 93,
    "returnFarmRate": 0.0796,
    "year": 2025
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "returnFarmCount": 11,
    "returnFarmRate": 0.0259,
    "year": 2025
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "returnFarmCount": 95,
    "returnFarmRate": 0.0555,
    "year": 2025
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "returnFarmCount": 89,
    "returnFarmRate": 0.1699,
    "year": 2025
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "returnFarmCount": 112,
    "returnFarmRate": 0.1822,
    "year": 2025
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "returnFarmCount": 60,
    "returnFarmRate": 0.1212,
    "year": 2025
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "returnFarmCount": 77,
    "returnFarmRate": 0.2587,
    "year": 2025
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "returnFarmCount": 84,
    "returnFarmRate": 0.0837,
    "year": 2025
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "returnFarmCount": 96,
    "returnFarmRate": 0.1247,
    "year": 2025
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "returnFarmCount": 71,
    "returnFarmRate": 0.1171,
    "year": 2025
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "returnFarmCount": 35,
    "returnFarmRate": 0.0131,
    "year": 2025
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "returnFarmCount": 69,
    "returnFarmRate": 0.0249,
    "year": 2025
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "returnFarmCount": 96,
    "returnFarmRate": 0.093,
    "year": 2025
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "returnFarmCount": 103,
    "returnFarmRate": 0.1369,
    "year": 2025
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "returnFarmCount": 109,
    "returnFarmRate": 0.1392,
    "year": 2025
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "returnFarmCount": 105,
    "returnFarmRate": 0.1108,
    "year": 2025
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "returnFarmCount": 69,
    "returnFarmRate": 0.3047,
    "year": 2025
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "returnFarmCount": 40,
    "returnFarmRate": 0.1794,
    "year": 2025
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "returnFarmCount": 66,
    "returnFarmRate": 0.3294,
    "year": 2025
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "returnFarmCount": 48,
    "returnFarmRate": 0.1926,
    "year": 2025
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "returnFarmCount": 94,
    "returnFarmRate": 0.3719,
    "year": 2025
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "returnFarmCount": 109,
    "returnFarmRate": 0.2146,
    "year": 2025
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "returnFarmCount": 86,
    "returnFarmRate": 0.1815,
    "year": 2025
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "returnFarmCount": 31,
    "returnFarmRate": 0.0116,
    "year": 2025
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "returnFarmCount": 73,
    "returnFarmRate": 0.0268,
    "year": 2025
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "returnFarmCount": 121,
    "returnFarmRate": 0.1054,
    "year": 2025
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "returnFarmCount": 33,
    "returnFarmRate": 0.0226,
    "year": 2025
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "returnFarmCount": 53,
    "returnFarmRate": 0.1216,
    "year": 2025
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "returnFarmCount": 83,
    "returnFarmRate": 0.3138,
    "year": 2025
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "returnFarmCount": 39,
    "returnFarmRate": 0.1684,
    "year": 2025
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "returnFarmCount": 153,
    "returnFarmRate": 0.261,
    "year": 2025
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "returnFarmCount": 81,
    "returnFarmRate": 0.2235,
    "year": 2025
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "returnFarmCount": 89,
    "returnFarmRate": 0.1488,
    "year": 2025
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "returnFarmCount": 70,
    "returnFarmRate": 0.2081,
    "year": 2025
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "returnFarmCount": 63,
    "returnFarmRate": 0.2002,
    "year": 2025
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "returnFarmCount": 107,
    "returnFarmRate": 0.1716,
    "year": 2025
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "returnFarmCount": 103,
    "returnFarmRate": 0.183,
    "year": 2025
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "returnFarmCount": 110,
    "returnFarmRate": 0.1214,
    "year": 2025
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "returnFarmCount": 92,
    "returnFarmRate": 0.3167,
    "year": 2025
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "returnFarmCount": 72,
    "returnFarmRate": 0.146,
    "year": 2025
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "returnFarmCount": 78,
    "returnFarmRate": 0.1937,
    "year": 2025
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "returnFarmCount": 41,
    "returnFarmRate": 0.0875,
    "year": 2025
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "returnFarmCount": 51,
    "returnFarmRate": 0.1762,
    "year": 2025
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "returnFarmCount": 138,
    "returnFarmRate": 0.4041,
    "year": 2025
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "returnFarmCount": 24,
    "returnFarmRate": 0.0138,
    "year": 2025
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "returnFarmCount": 43,
    "returnFarmRate": 0.0162,
    "year": 2025
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "returnFarmCount": 74,
    "returnFarmRate": 0.3395,
    "year": 2025
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "returnFarmCount": 80,
    "returnFarmRate": 0.0357,
    "year": 2025
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "returnFarmCount": 91,
    "returnFarmRate": 0.0183,
    "year": 2025
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "returnFarmCount": 112,
    "returnFarmRate": 0.0431,
    "year": 2025
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "returnFarmCount": 77,
    "returnFarmRate": 0.0559,
    "year": 2025
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "returnFarmCount": 115,
    "returnFarmRate": 0.0737,
    "year": 2025
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "returnFarmCount": 38,
    "returnFarmRate": 0.0093,
    "year": 2025
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "returnFarmCount": 57,
    "returnFarmRate": 0.0561,
    "year": 2025
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "returnFarmCount": 109,
    "returnFarmRate": 0.1093,
    "year": 2025
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "returnFarmCount": 125,
    "returnFarmRate": 0.1341,
    "year": 2025
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "returnFarmCount": 78,
    "returnFarmRate": 0.1155,
    "year": 2025
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "returnFarmCount": 52,
    "returnFarmRate": 0.0176,
    "year": 2025
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "returnFarmCount": 138,
    "returnFarmRate": 0.2889,
    "year": 2025
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "returnFarmCount": 80,
    "returnFarmRate": 0.3452,
    "year": 2025
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "returnFarmCount": 42,
    "returnFarmRate": 0.2739,
    "year": 2025
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "returnFarmCount": 57,
    "returnFarmRate": 0.1701,
    "year": 2025
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "returnFarmCount": 98,
    "returnFarmRate": 0.2447,
    "year": 2025
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "returnFarmCount": 41,
    "returnFarmRate": 0.136,
    "year": 2025
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "returnFarmCount": 62,
    "returnFarmRate": 0.1518,
    "year": 2025
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "returnFarmCount": 40,
    "returnFarmRate": 0.0352,
    "year": 2025
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "returnFarmCount": 89,
    "returnFarmRate": 0.1635,
    "year": 2025
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "returnFarmCount": 57,
    "returnFarmRate": 0.1979,
    "year": 2025
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "returnFarmCount": 38,
    "returnFarmRate": 0.0827,
    "year": 2025
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "returnFarmCount": 5,
    "returnFarmRate": 0.0603,
    "year": 2024
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "returnFarmCount": 41,
    "returnFarmRate": 0.004,
    "year": 2025
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "returnFarmCount": 66,
    "returnFarmRate": 0.0188,
    "year": 2025
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "returnFarmCount": 42,
    "returnFarmRate": 0.0341,
    "year": 2025
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "returnFarmCount": 49,
    "returnFarmRate": 0.0448,
    "year": 2025
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "returnFarmCount": 24,
    "returnFarmRate": 0.0044,
    "year": 2025
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "returnFarmCount": 89,
    "returnFarmRate": 0.0876,
    "year": 2025
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "returnFarmCount": 30,
    "returnFarmRate": 0.0127,
    "year": 2025
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "returnFarmCount": 27,
    "returnFarmRate": 0.0077,
    "year": 2025
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "returnFarmCount": 48,
    "returnFarmRate": 0.1918,
    "year": 2025
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "returnFarmCount": 53,
    "returnFarmRate": 0.0849,
    "year": 2025
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "returnFarmCount": 89,
    "returnFarmRate": 0.1514,
    "year": 2025
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "returnFarmCount": 65,
    "returnFarmRate": 0.1346,
    "year": 2025
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "returnFarmCount": 74,
    "returnFarmRate": 0.1828,
    "year": 2025
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "returnFarmCount": 96,
    "returnFarmRate": 0.2428,
    "year": 2025
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "returnFarmCount": 65,
    "returnFarmRate": 0.1981,
    "year": 2025
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "returnFarmCount": 66,
    "returnFarmRate": 0.1832,
    "year": 2025
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "returnFarmCount": 78,
    "returnFarmRate": 0.1329,
    "year": 2025
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "returnFarmCount": 76,
    "returnFarmRate": 0.1896,
    "year": 2025
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "returnFarmCount": 71,
    "returnFarmRate": 0.0143,
    "year": 2025
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "returnFarmCount": 76,
    "returnFarmRate": 0.042,
    "year": 2025
  }
];
