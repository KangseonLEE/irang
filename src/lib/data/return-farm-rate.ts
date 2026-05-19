/**
 * 농촌 정착 인구 비율 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-return-farm-rate.ts
 * 데이터 소스: KOSIS 통계청 귀농어·귀촌인 통계 (DT_1A02002)
 * 인구 베이스: src/lib/data/population-trend.ts (2022년)
 * 시도 인구: src/lib/data/population.ts POPULATION_FALLBACK
 * 통계 연도: 2024
 * 마지막 수집: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-return-farm-rate.ts`
 *
 * Phase 4 — 정착 점수 산출용 추가 차원 (농촌 정착 활성도).
 * 비율 = (해당 지역 정착자 수 / 해당 지역 전체 인구) × 100
 *
 * ⚠ 코드 체계 주의:
 *   - KOSIS C1 코드 = 행안부 admCode (예: 전남 순천 = 46150)
 *   - 본 파일의 sgisCode = SGIS 5자리 (예: 전남 순천 = 36030)
 *   - 매핑은 sigungus.ts의 admCode + sgisCode 페어를 통해 변환
 *
 * 커버리지: 132/229 시군구 (수집일 기준)
 * 미수집 시군구: 97건 (스크립트 콘솔 참조)
 */

export interface ReturnFarmRateStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 정착자 수 (명) */
  returnFarmCount: number;
  /** 농촌 정착 인구 비율 (%) */
  returnFarmRate: number;
  /** 통계 연도 */
  year: number;
}

/** 시군구 농촌 정착 인구 비율 (SGIS 5자리) */
export const RETURN_FARM_RATE_SIGUNGU: ReturnFarmRateStat[] = [
  {
    "sgisCode": "23510",
    "name": "강화군",
    "returnFarmCount": 70,
    "returnFarmRate": 0.1054,
    "year": 2024
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "returnFarmCount": 11,
    "returnFarmRate": 0.0569,
    "year": 2024
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "returnFarmCount": 48,
    "returnFarmRate": 0.0081,
    "year": 2024
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "returnFarmCount": 39,
    "returnFarmRate": 0.0054,
    "year": 2024
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "returnFarmCount": 37,
    "returnFarmRate": 0.0035,
    "year": 2024
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "returnFarmCount": 35,
    "returnFarmRate": 0.0071,
    "year": 2024
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "returnFarmCount": 54,
    "returnFarmRate": 0.0238,
    "year": 2024
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "returnFarmCount": 69,
    "returnFarmRate": 0.0331,
    "year": 2024
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "returnFarmCount": 37,
    "returnFarmRate": 0.0075,
    "year": 2024
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "returnFarmCount": 86,
    "returnFarmRate": 0.0092,
    "year": 2024
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "returnFarmCount": 27,
    "returnFarmRate": 0.0069,
    "year": 2024
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "returnFarmCount": 13,
    "returnFarmRate": 0.0053,
    "year": 2024
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "returnFarmCount": 48,
    "returnFarmRate": 0.0294,
    "year": 2024
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "returnFarmCount": 57,
    "returnFarmRate": 0.0501,
    "year": 2024
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "returnFarmCount": 32,
    "returnFarmRate": 0.0109,
    "year": 2024
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "returnFarmCount": 33,
    "returnFarmRate": 0.0091,
    "year": 2024
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "returnFarmCount": 33,
    "returnFarmRate": 0.0153,
    "year": 2024
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "returnFarmCount": 21,
    "returnFarmRate": 0.0327,
    "year": 2024
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "returnFarmCount": 90,
    "returnFarmRate": 0.138,
    "year": 2024
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "returnFarmCount": 70,
    "returnFarmRate": 0.156,
    "year": 2024
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "returnFarmCount": 50,
    "returnFarmRate": 0.1402,
    "year": 2024
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "returnFarmCount": 59,
    "returnFarmRate": 0.1525,
    "year": 2024
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "returnFarmCount": 20,
    "returnFarmRate": 0.06,
    "year": 2024
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "returnFarmCount": 31,
    "returnFarmRate": 0.0753,
    "year": 2024
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "returnFarmCount": 31,
    "returnFarmRate": 0.1375,
    "year": 2024
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "returnFarmCount": 24,
    "returnFarmRate": 0.1153,
    "year": 2024
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "returnFarmCount": 23,
    "returnFarmRate": 0.0744,
    "year": 2024
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "returnFarmCount": 14,
    "returnFarmRate": 0.0516,
    "year": 2024
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "returnFarmCount": 18,
    "returnFarmRate": 0.0678,
    "year": 2024
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "returnFarmCount": 102,
    "returnFarmRate": 0.0119,
    "year": 2024
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "returnFarmCount": 59,
    "returnFarmRate": 0.0273,
    "year": 2024
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "returnFarmCount": 36,
    "returnFarmRate": 0.0276,
    "year": 2024
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "returnFarmCount": 65,
    "returnFarmRate": 0.1354,
    "year": 2024
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "returnFarmCount": 67,
    "returnFarmRate": 0.1529,
    "year": 2024
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "returnFarmCount": 60,
    "returnFarmRate": 0.1588,
    "year": 2024
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "returnFarmCount": 35,
    "returnFarmRate": 0.0376,
    "year": 2024
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "returnFarmCount": 83,
    "returnFarmRate": 0.2194,
    "year": 2024
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "returnFarmCount": 52,
    "returnFarmRate": 0.0507,
    "year": 2024
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "returnFarmCount": 56,
    "returnFarmRate": 0.2116,
    "year": 2024
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "returnFarmCount": 31,
    "returnFarmRate": 0.0081,
    "year": 2024
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "returnFarmCount": 47,
    "returnFarmRate": 0.0068,
    "year": 2024
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "returnFarmCount": 77,
    "returnFarmRate": 0.0726,
    "year": 2024
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "returnFarmCount": 72,
    "returnFarmRate": 0.0746,
    "year": 2024
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "returnFarmCount": 91,
    "returnFarmRate": 0.0251,
    "year": 2024
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "returnFarmCount": 84,
    "returnFarmRate": 0.0472,
    "year": 2024
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "returnFarmCount": 89,
    "returnFarmRate": 0.0762,
    "year": 2024
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "returnFarmCount": 9,
    "returnFarmRate": 0.0212,
    "year": 2024
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "returnFarmCount": 77,
    "returnFarmRate": 0.045,
    "year": 2024
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "returnFarmCount": 65,
    "returnFarmRate": 0.124,
    "year": 2024
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "returnFarmCount": 102,
    "returnFarmRate": 0.206,
    "year": 2024
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "returnFarmCount": 71,
    "returnFarmRate": 0.2386,
    "year": 2024
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "returnFarmCount": 62,
    "returnFarmRate": 0.0618,
    "year": 2024
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "returnFarmCount": 81,
    "returnFarmRate": 0.1052,
    "year": 2024
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "returnFarmCount": 81,
    "returnFarmRate": 0.1335,
    "year": 2024
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "returnFarmCount": 35,
    "returnFarmRate": 0.0131,
    "year": 2024
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "returnFarmCount": 68,
    "returnFarmRate": 0.0245,
    "year": 2024
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "returnFarmCount": 89,
    "returnFarmRate": 0.0862,
    "year": 2024
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "returnFarmCount": 105,
    "returnFarmRate": 0.1395,
    "year": 2024
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "returnFarmCount": 92,
    "returnFarmRate": 0.1175,
    "year": 2024
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "returnFarmCount": 68,
    "returnFarmRate": 0.0718,
    "year": 2024
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "returnFarmCount": 57,
    "returnFarmRate": 0.2517,
    "year": 2024
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "returnFarmCount": 60,
    "returnFarmRate": 0.2691,
    "year": 2024
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "returnFarmCount": 45,
    "returnFarmRate": 0.2246,
    "year": 2024
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "returnFarmCount": 59,
    "returnFarmRate": 0.2367,
    "year": 2024
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "returnFarmCount": 90,
    "returnFarmRate": 0.356,
    "year": 2024
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "returnFarmCount": 87,
    "returnFarmRate": 0.1713,
    "year": 2024
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "returnFarmCount": 65,
    "returnFarmRate": 0.1372,
    "year": 2024
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "returnFarmCount": 41,
    "returnFarmRate": 0.0153,
    "year": 2024
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "returnFarmCount": 83,
    "returnFarmRate": 0.0305,
    "year": 2024
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "returnFarmCount": 102,
    "returnFarmRate": 0.0889,
    "year": 2024
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "returnFarmCount": 37,
    "returnFarmRate": 0.0254,
    "year": 2024
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "returnFarmCount": 68,
    "returnFarmRate": 0.1561,
    "year": 2024
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "returnFarmCount": 84,
    "returnFarmRate": 0.3175,
    "year": 2024
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "returnFarmCount": 49,
    "returnFarmRate": 0.2115,
    "year": 2024
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "returnFarmCount": 120,
    "returnFarmRate": 0.2047,
    "year": 2024
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "returnFarmCount": 97,
    "returnFarmRate": 0.2676,
    "year": 2024
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "returnFarmCount": 73,
    "returnFarmRate": 0.122,
    "year": 2024
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "returnFarmCount": 48,
    "returnFarmRate": 0.1427,
    "year": 2024
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "returnFarmCount": 65,
    "returnFarmRate": 0.2065,
    "year": 2024
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "returnFarmCount": 123,
    "returnFarmRate": 0.1972,
    "year": 2024
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "returnFarmCount": 103,
    "returnFarmRate": 0.183,
    "year": 2024
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "returnFarmCount": 83,
    "returnFarmRate": 0.0916,
    "year": 2024
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "returnFarmCount": 79,
    "returnFarmRate": 0.272,
    "year": 2024
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "returnFarmCount": 53,
    "returnFarmRate": 0.1075,
    "year": 2024
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "returnFarmCount": 77,
    "returnFarmRate": 0.1912,
    "year": 2024
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "returnFarmCount": 32,
    "returnFarmRate": 0.0683,
    "year": 2024
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "returnFarmCount": 28,
    "returnFarmRate": 0.0967,
    "year": 2024
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "returnFarmCount": 93,
    "returnFarmRate": 0.2723,
    "year": 2024
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "returnFarmCount": 15,
    "returnFarmRate": 0.0086,
    "year": 2024
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "returnFarmCount": 52,
    "returnFarmRate": 0.0195,
    "year": 2024
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "returnFarmCount": 56,
    "returnFarmRate": 0.025,
    "year": 2024
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "returnFarmCount": 83,
    "returnFarmRate": 0.0167,
    "year": 2024
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "returnFarmCount": 104,
    "returnFarmRate": 0.0401,
    "year": 2024
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "returnFarmCount": 93,
    "returnFarmRate": 0.0675,
    "year": 2024
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "returnFarmCount": 101,
    "returnFarmRate": 0.0647,
    "year": 2024
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "returnFarmCount": 49,
    "returnFarmRate": 0.012,
    "year": 2024
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "returnFarmCount": 80,
    "returnFarmRate": 0.0788,
    "year": 2024
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "returnFarmCount": 140,
    "returnFarmRate": 0.1404,
    "year": 2024
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "returnFarmCount": 138,
    "returnFarmRate": 0.1481,
    "year": 2024
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "returnFarmCount": 66,
    "returnFarmRate": 0.0978,
    "year": 2024
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "returnFarmCount": 39,
    "returnFarmRate": 0.0132,
    "year": 2024
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "returnFarmCount": 112,
    "returnFarmRate": 0.2344,
    "year": 2024
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "returnFarmCount": 64,
    "returnFarmRate": 0.2762,
    "year": 2024
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "returnFarmCount": 37,
    "returnFarmRate": 0.2413,
    "year": 2024
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "returnFarmCount": 50,
    "returnFarmRate": 0.1492,
    "year": 2024
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "returnFarmCount": 104,
    "returnFarmRate": 0.2597,
    "year": 2024
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "returnFarmCount": 25,
    "returnFarmRate": 0.0829,
    "year": 2024
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "returnFarmCount": 78,
    "returnFarmRate": 0.1909,
    "year": 2024
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "returnFarmCount": 34,
    "returnFarmRate": 0.0299,
    "year": 2024
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "returnFarmCount": 83,
    "returnFarmRate": 0.1524,
    "year": 2024
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "returnFarmCount": 64,
    "returnFarmRate": 0.2222,
    "year": 2024
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "returnFarmCount": 24,
    "returnFarmRate": 0.0522,
    "year": 2024
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "returnFarmCount": 5,
    "returnFarmRate": 0.0603,
    "year": 2024
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "returnFarmCount": 56,
    "returnFarmRate": 0.0159,
    "year": 2024
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "returnFarmCount": 21,
    "returnFarmRate": 0.0171,
    "year": 2024
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "returnFarmCount": 54,
    "returnFarmRate": 0.0494,
    "year": 2024
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "returnFarmCount": 23,
    "returnFarmRate": 0.0042,
    "year": 2024
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "returnFarmCount": 99,
    "returnFarmRate": 0.0975,
    "year": 2024
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "returnFarmCount": 35,
    "returnFarmRate": 0.0148,
    "year": 2024
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "returnFarmCount": 23,
    "returnFarmRate": 0.0065,
    "year": 2024
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "returnFarmCount": 28,
    "returnFarmRate": 0.1119,
    "year": 2024
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "returnFarmCount": 28,
    "returnFarmRate": 0.0449,
    "year": 2024
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "returnFarmCount": 73,
    "returnFarmRate": 0.1241,
    "year": 2024
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "returnFarmCount": 70,
    "returnFarmRate": 0.1449,
    "year": 2024
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "returnFarmCount": 40,
    "returnFarmRate": 0.0988,
    "year": 2024
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "returnFarmCount": 68,
    "returnFarmRate": 0.172,
    "year": 2024
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "returnFarmCount": 81,
    "returnFarmRate": 0.2469,
    "year": 2024
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "returnFarmCount": 69,
    "returnFarmRate": 0.1916,
    "year": 2024
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "returnFarmCount": 77,
    "returnFarmRate": 0.1312,
    "year": 2024
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "returnFarmCount": 95,
    "returnFarmRate": 0.237,
    "year": 2024
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "returnFarmCount": 70,
    "returnFarmRate": 0.0141,
    "year": 2024
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "returnFarmCount": 74,
    "returnFarmRate": 0.0409,
    "year": 2024
  }
];

/** 시도 합산 농촌 정착 인구 비율 (SGIS 2자리) */
export const RETURN_FARM_RATE_SIDO: ReturnFarmRateStat[] = [
  {
    "sgisCode": "23",
    "name": "인천",
    "returnFarmCount": 81,
    "returnFarmRate": 0.0027,
    "year": 2024
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "returnFarmCount": 550,
    "returnFarmRate": 0.004,
    "year": 2024
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "returnFarmCount": 549,
    "returnFarmRate": 0.0359,
    "year": 2024
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "returnFarmCount": 615,
    "returnFarmRate": 0.0386,
    "year": 2024
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "returnFarmCount": 31,
    "returnFarmRate": 0.0081,
    "year": 2024
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "returnFarmCount": 1008,
    "returnFarmRate": 0.0476,
    "year": 2024
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "returnFarmCount": 920,
    "returnFarmRate": 0.0525,
    "year": 2024
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "returnFarmCount": 1538,
    "returnFarmRate": 0.0858,
    "year": 2024
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "returnFarmCount": 15,
    "returnFarmRate": 0.0005,
    "year": 2024
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "returnFarmCount": 52,
    "returnFarmRate": 0.0022,
    "year": 2024
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "returnFarmCount": 56,
    "returnFarmRate": 0.0051,
    "year": 2024
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "returnFarmCount": 1573,
    "returnFarmRate": 0.0611,
    "year": 2024
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "returnFarmCount": 940,
    "returnFarmRate": 0.029,
    "year": 2024
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "returnFarmCount": 144,
    "returnFarmRate": 0.0213,
    "year": 2024
  }
];

const SIGUNGU_INDEX = new Map(
  RETURN_FARM_RATE_SIGUNGU.map((r) => [r.sgisCode, r]),
);
const SIDO_INDEX = new Map(RETURN_FARM_RATE_SIDO.map((r) => [r.sgisCode, r]));

export function getReturnFarmRateFallback(sgisCode: string): ReturnFarmRateStat | null {
  return SIGUNGU_INDEX.get(sgisCode) ?? SIDO_INDEX.get(sgisCode) ?? null;
}
