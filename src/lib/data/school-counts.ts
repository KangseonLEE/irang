/**
 * 학교 수 정적 폴백 데이터 (자동 생성)
 *
 * 생성 스크립트: scripts/collect-school-counts.ts
 * 데이터 소스: 교육부 NEIS 학교정보
 *   https://open.neis.go.kr/hub/schoolInfo
 * 마지막 수집: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/collect-school-counts.ts`
 *
 * Phase 4 — 빌드 시 시군구별 NEIS API 호출을 제거하기 위한 정적 폴백.
 * 시도교육청 단위로 전체 학교 목록을 받아 도로명주소 시군구명 매칭으로 분류.
 *
 * 커버리지: 229/229 시군구 (수집일 기준)
 * 0건 또는 주소 매칭 누락 의심: 1건 (스크립트 콘솔 참조)
 */

export interface SchoolCountStat {
  /** SGIS 시군구 코드 (5자리) */
  sgisCode: string;
  /** 시군구명 */
  name: string;
  /** 학교 총 수 (초·중·고·특수·각종 포함) */
  totalCount: number;
  /** 초등학교 수 */
  elementary: number;
  /** 중학교 수 */
  middle: number;
  /** 고등학교 수 */
  high: number;
}

/** 시군구 학교 수 (SGIS 5자리) */
export const SCHOOL_FALLBACK_SIGUNGU: SchoolCountStat[] = [
  {
    "sgisCode": "11010",
    "name": "종로구",
    "totalCount": 47,
    "elementary": 13,
    "middle": 9,
    "high": 14
  },
  {
    "sgisCode": "11020",
    "name": "중구",
    "totalCount": 32,
    "elementary": 11,
    "middle": 7,
    "high": 11
  },
  {
    "sgisCode": "11030",
    "name": "용산구",
    "totalCount": 37,
    "elementary": 14,
    "middle": 9,
    "high": 10
  },
  {
    "sgisCode": "11040",
    "name": "성동구",
    "totalCount": 40,
    "elementary": 21,
    "middle": 11,
    "high": 7
  },
  {
    "sgisCode": "11050",
    "name": "광진구",
    "totalCount": 46,
    "elementary": 21,
    "middle": 12,
    "high": 9
  },
  {
    "sgisCode": "11060",
    "name": "동대문구",
    "totalCount": 50,
    "elementary": 21,
    "middle": 15,
    "high": 11
  },
  {
    "sgisCode": "11070",
    "name": "중랑구",
    "totalCount": 48,
    "elementary": 24,
    "middle": 14,
    "high": 10
  },
  {
    "sgisCode": "11080",
    "name": "성북구",
    "totalCount": 62,
    "elementary": 29,
    "middle": 18,
    "high": 13
  },
  {
    "sgisCode": "11090",
    "name": "강북구",
    "totalCount": 38,
    "elementary": 14,
    "middle": 13,
    "high": 7
  },
  {
    "sgisCode": "11100",
    "name": "도봉구",
    "totalCount": 45,
    "elementary": 23,
    "middle": 13,
    "high": 9
  },
  {
    "sgisCode": "11110",
    "name": "노원구",
    "totalCount": 99,
    "elementary": 42,
    "middle": 25,
    "high": 25
  },
  {
    "sgisCode": "11120",
    "name": "은평구",
    "totalCount": 68,
    "elementary": 30,
    "middle": 18,
    "high": 18
  },
  {
    "sgisCode": "11130",
    "name": "서대문구",
    "totalCount": 43,
    "elementary": 19,
    "middle": 14,
    "high": 7
  },
  {
    "sgisCode": "11140",
    "name": "마포구",
    "totalCount": 51,
    "elementary": 22,
    "middle": 13,
    "high": 9
  },
  {
    "sgisCode": "11150",
    "name": "양천구",
    "totalCount": 64,
    "elementary": 30,
    "middle": 19,
    "high": 15
  },
  {
    "sgisCode": "11160",
    "name": "강서구",
    "totalCount": 83,
    "elementary": 34,
    "middle": 22,
    "high": 23
  },
  {
    "sgisCode": "11170",
    "name": "구로구",
    "totalCount": 60,
    "elementary": 27,
    "middle": 14,
    "high": 14
  },
  {
    "sgisCode": "11180",
    "name": "금천구",
    "totalCount": 35,
    "elementary": 18,
    "middle": 9,
    "high": 6
  },
  {
    "sgisCode": "11190",
    "name": "영등포구",
    "totalCount": 46,
    "elementary": 23,
    "middle": 12,
    "high": 8
  },
  {
    "sgisCode": "11200",
    "name": "동작구",
    "totalCount": 52,
    "elementary": 21,
    "middle": 16,
    "high": 8
  },
  {
    "sgisCode": "11210",
    "name": "관악구",
    "totalCount": 58,
    "elementary": 21,
    "middle": 16,
    "high": 17
  },
  {
    "sgisCode": "11220",
    "name": "서초구",
    "totalCount": 57,
    "elementary": 24,
    "middle": 16,
    "high": 11
  },
  {
    "sgisCode": "11230",
    "name": "강남구",
    "totalCount": 84,
    "elementary": 34,
    "middle": 24,
    "high": 21
  },
  {
    "sgisCode": "11240",
    "name": "송파구",
    "totalCount": 96,
    "elementary": 41,
    "middle": 29,
    "high": 20
  },
  {
    "sgisCode": "11250",
    "name": "강동구",
    "totalCount": 64,
    "elementary": 29,
    "middle": 19,
    "high": 14
  },
  {
    "sgisCode": "23010",
    "name": "중구",
    "totalCount": 48,
    "elementary": 19,
    "middle": 11,
    "high": 16
  },
  {
    "sgisCode": "23020",
    "name": "동구",
    "totalCount": 98,
    "elementary": 47,
    "middle": 24,
    "high": 19
  },
  {
    "sgisCode": "23090",
    "name": "미추홀구",
    "totalCount": 54,
    "elementary": 23,
    "middle": 12,
    "high": 15
  },
  {
    "sgisCode": "23040",
    "name": "연수구",
    "totalCount": 74,
    "elementary": 34,
    "middle": 19,
    "high": 16
  },
  {
    "sgisCode": "23050",
    "name": "남동구",
    "totalCount": 83,
    "elementary": 39,
    "middle": 21,
    "high": 16
  },
  {
    "sgisCode": "23060",
    "name": "부평구",
    "totalCount": 88,
    "elementary": 42,
    "middle": 21,
    "high": 19
  },
  {
    "sgisCode": "23070",
    "name": "계양구",
    "totalCount": 53,
    "elementary": 27,
    "middle": 15,
    "high": 10
  },
  {
    "sgisCode": "23080",
    "name": "서구",
    "totalCount": 106,
    "elementary": 54,
    "middle": 29,
    "high": 21
  },
  {
    "sgisCode": "23510",
    "name": "강화군",
    "totalCount": 37,
    "elementary": 20,
    "middle": 9,
    "high": 8
  },
  {
    "sgisCode": "23520",
    "name": "옹진군",
    "totalCount": 21,
    "elementary": 11,
    "middle": 5,
    "high": 5
  },
  {
    "sgisCode": "31010",
    "name": "수원시",
    "totalCount": 211,
    "elementary": 100,
    "middle": 57,
    "high": 45
  },
  {
    "sgisCode": "31020",
    "name": "성남시",
    "totalCount": 160,
    "elementary": 73,
    "middle": 44,
    "high": 36
  },
  {
    "sgisCode": "31030",
    "name": "의정부시",
    "totalCount": 74,
    "elementary": 34,
    "middle": 20,
    "high": 16
  },
  {
    "sgisCode": "31040",
    "name": "안양시",
    "totalCount": 88,
    "elementary": 40,
    "middle": 24,
    "high": 21
  },
  {
    "sgisCode": "31050",
    "name": "부천시",
    "totalCount": 134,
    "elementary": 64,
    "middle": 34,
    "high": 29
  },
  {
    "sgisCode": "31060",
    "name": "광명시",
    "totalCount": 48,
    "elementary": 24,
    "middle": 12,
    "high": 11
  },
  {
    "sgisCode": "31070",
    "name": "평택시",
    "totalCount": 128,
    "elementary": 74,
    "middle": 30,
    "high": 22
  },
  {
    "sgisCode": "31080",
    "name": "동두천시",
    "totalCount": 23,
    "elementary": 11,
    "middle": 6,
    "high": 6
  },
  {
    "sgisCode": "31090",
    "name": "안산시",
    "totalCount": 109,
    "elementary": 54,
    "middle": 29,
    "high": 24
  },
  {
    "sgisCode": "31100",
    "name": "고양시",
    "totalCount": 183,
    "elementary": 90,
    "middle": 45,
    "high": 38
  },
  {
    "sgisCode": "31110",
    "name": "과천시",
    "totalCount": 13,
    "elementary": 6,
    "middle": 3,
    "high": 4
  },
  {
    "sgisCode": "31120",
    "name": "구리시",
    "totalCount": 31,
    "elementary": 15,
    "middle": 8,
    "high": 7
  },
  {
    "sgisCode": "31130",
    "name": "남양주시",
    "totalCount": 130,
    "elementary": 70,
    "middle": 38,
    "high": 21
  },
  {
    "sgisCode": "31140",
    "name": "오산시",
    "totalCount": 49,
    "elementary": 27,
    "middle": 11,
    "high": 10
  },
  {
    "sgisCode": "31150",
    "name": "시흥시",
    "totalCount": 97,
    "elementary": 50,
    "middle": 27,
    "high": 17
  },
  {
    "sgisCode": "31160",
    "name": "군포시",
    "totalCount": 46,
    "elementary": 27,
    "middle": 11,
    "high": 8
  },
  {
    "sgisCode": "31170",
    "name": "의왕시",
    "totalCount": 30,
    "elementary": 15,
    "middle": 8,
    "high": 6
  },
  {
    "sgisCode": "31180",
    "name": "하남시",
    "totalCount": 50,
    "elementary": 24,
    "middle": 14,
    "high": 10
  },
  {
    "sgisCode": "31190",
    "name": "용인시",
    "totalCount": 194,
    "elementary": 106,
    "middle": 52,
    "high": 33
  },
  {
    "sgisCode": "31200",
    "name": "파주시",
    "totalCount": 116,
    "elementary": 65,
    "middle": 29,
    "high": 20
  },
  {
    "sgisCode": "31210",
    "name": "이천시",
    "totalCount": 60,
    "elementary": 31,
    "middle": 15,
    "high": 12
  },
  {
    "sgisCode": "31220",
    "name": "안성시",
    "totalCount": 59,
    "elementary": 34,
    "middle": 13,
    "high": 9
  },
  {
    "sgisCode": "31230",
    "name": "김포시",
    "totalCount": 91,
    "elementary": 48,
    "middle": 25,
    "high": 17
  },
  {
    "sgisCode": "31240",
    "name": "화성시",
    "totalCount": 197,
    "elementary": 110,
    "middle": 50,
    "high": 34
  },
  {
    "sgisCode": "31250",
    "name": "광주시",
    "totalCount": 61,
    "elementary": 35,
    "middle": 13,
    "high": 9
  },
  {
    "sgisCode": "31260",
    "name": "양주시",
    "totalCount": 197,
    "elementary": 110,
    "middle": 52,
    "high": 30
  },
  {
    "sgisCode": "31270",
    "name": "포천시",
    "totalCount": 48,
    "elementary": 27,
    "middle": 14,
    "high": 7
  },
  {
    "sgisCode": "31280",
    "name": "여주시",
    "totalCount": 46,
    "elementary": 24,
    "middle": 13,
    "high": 9
  },
  {
    "sgisCode": "31580",
    "name": "양평군",
    "totalCount": 44,
    "elementary": 23,
    "middle": 12,
    "high": 8
  },
  {
    "sgisCode": "31570",
    "name": "가평군",
    "totalCount": 27,
    "elementary": 15,
    "middle": 6,
    "high": 5
  },
  {
    "sgisCode": "31550",
    "name": "연천군",
    "totalCount": 23,
    "elementary": 14,
    "middle": 6,
    "high": 2
  },
  {
    "sgisCode": "32010",
    "name": "춘천시",
    "totalCount": 82,
    "elementary": 42,
    "middle": 20,
    "high": 14
  },
  {
    "sgisCode": "32020",
    "name": "원주시",
    "totalCount": 99,
    "elementary": 51,
    "middle": 24,
    "high": 16
  },
  {
    "sgisCode": "32030",
    "name": "강릉시",
    "totalCount": 63,
    "elementary": 37,
    "middle": 12,
    "high": 11
  },
  {
    "sgisCode": "32040",
    "name": "동해시",
    "totalCount": 29,
    "elementary": 14,
    "middle": 7,
    "high": 6
  },
  {
    "sgisCode": "32050",
    "name": "태백시",
    "totalCount": 25,
    "elementary": 12,
    "middle": 6,
    "high": 5
  },
  {
    "sgisCode": "32060",
    "name": "속초시",
    "totalCount": 21,
    "elementary": 12,
    "middle": 4,
    "high": 3
  },
  {
    "sgisCode": "32070",
    "name": "삼척시",
    "totalCount": 36,
    "elementary": 18,
    "middle": 10,
    "high": 8
  },
  {
    "sgisCode": "32510",
    "name": "홍천군",
    "totalCount": 45,
    "elementary": 25,
    "middle": 11,
    "high": 7
  },
  {
    "sgisCode": "32520",
    "name": "횡성군",
    "totalCount": 34,
    "elementary": 17,
    "middle": 10,
    "high": 7
  },
  {
    "sgisCode": "32530",
    "name": "영월군",
    "totalCount": 29,
    "elementary": 13,
    "middle": 10,
    "high": 6
  },
  {
    "sgisCode": "32540",
    "name": "평창군",
    "totalCount": 31,
    "elementary": 18,
    "middle": 8,
    "high": 5
  },
  {
    "sgisCode": "32550",
    "name": "정선군",
    "totalCount": 33,
    "elementary": 17,
    "middle": 9,
    "high": 7
  },
  {
    "sgisCode": "32560",
    "name": "철원군",
    "totalCount": 26,
    "elementary": 16,
    "middle": 5,
    "high": 5
  },
  {
    "sgisCode": "32570",
    "name": "화천군",
    "totalCount": 19,
    "elementary": 11,
    "middle": 4,
    "high": 4
  },
  {
    "sgisCode": "32580",
    "name": "양구군",
    "totalCount": 19,
    "elementary": 10,
    "middle": 6,
    "high": 3
  },
  {
    "sgisCode": "32590",
    "name": "인제군",
    "totalCount": 24,
    "elementary": 14,
    "middle": 6,
    "high": 4
  },
  {
    "sgisCode": "32600",
    "name": "고성군",
    "totalCount": 21,
    "elementary": 13,
    "middle": 4,
    "high": 4
  },
  {
    "sgisCode": "32610",
    "name": "양양군",
    "totalCount": 20,
    "elementary": 15,
    "middle": 4,
    "high": 1
  },
  {
    "sgisCode": "33010",
    "name": "청주시",
    "totalCount": 203,
    "elementary": 101,
    "middle": 50,
    "high": 38
  },
  {
    "sgisCode": "33020",
    "name": "충주시",
    "totalCount": 71,
    "elementary": 38,
    "middle": 17,
    "high": 11
  },
  {
    "sgisCode": "33030",
    "name": "제천시",
    "totalCount": 45,
    "elementary": 23,
    "middle": 13,
    "high": 7
  },
  {
    "sgisCode": "33520",
    "name": "보은군",
    "totalCount": 22,
    "elementary": 14,
    "middle": 5,
    "high": 3
  },
  {
    "sgisCode": "33530",
    "name": "옥천군",
    "totalCount": 22,
    "elementary": 14,
    "middle": 5,
    "high": 3
  },
  {
    "sgisCode": "33540",
    "name": "영동군",
    "totalCount": 26,
    "elementary": 14,
    "middle": 7,
    "high": 5
  },
  {
    "sgisCode": "33590",
    "name": "증평군",
    "totalCount": 10,
    "elementary": 4,
    "middle": 3,
    "high": 3
  },
  {
    "sgisCode": "33550",
    "name": "진천군",
    "totalCount": 32,
    "elementary": 16,
    "middle": 8,
    "high": 6
  },
  {
    "sgisCode": "33560",
    "name": "괴산군",
    "totalCount": 24,
    "elementary": 14,
    "middle": 8,
    "high": 1
  },
  {
    "sgisCode": "33570",
    "name": "음성군",
    "totalCount": 36,
    "elementary": 20,
    "middle": 10,
    "high": 4
  },
  {
    "sgisCode": "33580",
    "name": "단양군",
    "totalCount": 20,
    "elementary": 13,
    "middle": 5,
    "high": 2
  },
  {
    "sgisCode": "29010",
    "name": "세종특별자치시",
    "totalCount": 109,
    "elementary": 55,
    "middle": 28,
    "high": 22
  },
  {
    "sgisCode": "25010",
    "name": "동구",
    "totalCount": 48,
    "elementary": 22,
    "middle": 12,
    "high": 9
  },
  {
    "sgisCode": "25020",
    "name": "중구",
    "totalCount": 56,
    "elementary": 27,
    "middle": 14,
    "high": 14
  },
  {
    "sgisCode": "25030",
    "name": "서구",
    "totalCount": 94,
    "elementary": 42,
    "middle": 29,
    "high": 17
  },
  {
    "sgisCode": "25040",
    "name": "유성구",
    "totalCount": 84,
    "elementary": 42,
    "middle": 23,
    "high": 16
  },
  {
    "sgisCode": "25050",
    "name": "대덕구",
    "totalCount": 41,
    "elementary": 21,
    "middle": 12,
    "high": 5
  },
  {
    "sgisCode": "34010",
    "name": "천안시",
    "totalCount": 139,
    "elementary": 79,
    "middle": 31,
    "high": 22
  },
  {
    "sgisCode": "34020",
    "name": "공주시",
    "totalCount": 53,
    "elementary": 27,
    "middle": 14,
    "high": 10
  },
  {
    "sgisCode": "34030",
    "name": "보령시",
    "totalCount": 47,
    "elementary": 29,
    "middle": 11,
    "high": 6
  },
  {
    "sgisCode": "34040",
    "name": "아산시",
    "totalCount": 93,
    "elementary": 53,
    "middle": 23,
    "high": 12
  },
  {
    "sgisCode": "34050",
    "name": "서산시",
    "totalCount": 55,
    "elementary": 30,
    "middle": 16,
    "high": 8
  },
  {
    "sgisCode": "34060",
    "name": "논산시",
    "totalCount": 59,
    "elementary": 31,
    "middle": 14,
    "high": 13
  },
  {
    "sgisCode": "34070",
    "name": "계룡시",
    "totalCount": 11,
    "elementary": 6,
    "middle": 3,
    "high": 2
  },
  {
    "sgisCode": "34080",
    "name": "당진시",
    "totalCount": 57,
    "elementary": 33,
    "middle": 15,
    "high": 8
  },
  {
    "sgisCode": "34510",
    "name": "금산군",
    "totalCount": 29,
    "elementary": 17,
    "middle": 8,
    "high": 4
  },
  {
    "sgisCode": "34530",
    "name": "부여군",
    "totalCount": 36,
    "elementary": 21,
    "middle": 10,
    "high": 5
  },
  {
    "sgisCode": "34540",
    "name": "서천군",
    "totalCount": 32,
    "elementary": 16,
    "middle": 9,
    "high": 7
  },
  {
    "sgisCode": "34550",
    "name": "청양군",
    "totalCount": 17,
    "elementary": 11,
    "middle": 4,
    "high": 2
  },
  {
    "sgisCode": "34560",
    "name": "홍성군",
    "totalCount": 44,
    "elementary": 22,
    "middle": 11,
    "high": 8
  },
  {
    "sgisCode": "34570",
    "name": "예산군",
    "totalCount": 44,
    "elementary": 24,
    "middle": 11,
    "high": 7
  },
  {
    "sgisCode": "34580",
    "name": "태안군",
    "totalCount": 30,
    "elementary": 19,
    "middle": 7,
    "high": 4
  },
  {
    "sgisCode": "35010",
    "name": "전주시",
    "totalCount": 155,
    "elementary": 75,
    "middle": 41,
    "high": 29
  },
  {
    "sgisCode": "35020",
    "name": "군산시",
    "totalCount": 84,
    "elementary": 51,
    "middle": 18,
    "high": 12
  },
  {
    "sgisCode": "35030",
    "name": "익산시",
    "totalCount": 106,
    "elementary": 60,
    "middle": 26,
    "high": 18
  },
  {
    "sgisCode": "35040",
    "name": "정읍시",
    "totalCount": 69,
    "elementary": 33,
    "middle": 19,
    "high": 13
  },
  {
    "sgisCode": "35050",
    "name": "남원시",
    "totalCount": 49,
    "elementary": 26,
    "middle": 13,
    "high": 9
  },
  {
    "sgisCode": "35060",
    "name": "김제시",
    "totalCount": 56,
    "elementary": 32,
    "middle": 13,
    "high": 10
  },
  {
    "sgisCode": "35510",
    "name": "완주군",
    "totalCount": 52,
    "elementary": 30,
    "middle": 13,
    "high": 8
  },
  {
    "sgisCode": "35520",
    "name": "진안군",
    "totalCount": 28,
    "elementary": 13,
    "middle": 10,
    "high": 5
  },
  {
    "sgisCode": "35530",
    "name": "무주군",
    "totalCount": 18,
    "elementary": 9,
    "middle": 5,
    "high": 4
  },
  {
    "sgisCode": "35540",
    "name": "장수군",
    "totalCount": 22,
    "elementary": 9,
    "middle": 7,
    "high": 5
  },
  {
    "sgisCode": "35550",
    "name": "임실군",
    "totalCount": 28,
    "elementary": 14,
    "middle": 8,
    "high": 3
  },
  {
    "sgisCode": "35560",
    "name": "순창군",
    "totalCount": 25,
    "elementary": 15,
    "middle": 7,
    "high": 3
  },
  {
    "sgisCode": "35570",
    "name": "고창군",
    "totalCount": 40,
    "elementary": 20,
    "middle": 14,
    "high": 6
  },
  {
    "sgisCode": "35580",
    "name": "부안군",
    "totalCount": 37,
    "elementary": 18,
    "middle": 12,
    "high": 7
  },
  {
    "sgisCode": "24010",
    "name": "동구",
    "totalCount": 24,
    "elementary": 11,
    "middle": 6,
    "high": 5
  },
  {
    "sgisCode": "24020",
    "name": "서구",
    "totalCount": 55,
    "elementary": 30,
    "middle": 15,
    "high": 8
  },
  {
    "sgisCode": "24030",
    "name": "남구",
    "totalCount": 60,
    "elementary": 23,
    "middle": 16,
    "high": 18
  },
  {
    "sgisCode": "24040",
    "name": "북구",
    "totalCount": 102,
    "elementary": 48,
    "middle": 28,
    "high": 21
  },
  {
    "sgisCode": "24050",
    "name": "광산구",
    "totalCount": 94,
    "elementary": 45,
    "middle": 28,
    "high": 19
  },
  {
    "sgisCode": "36010",
    "name": "목포시",
    "totalCount": 73,
    "elementary": 34,
    "middle": 16,
    "high": 15
  },
  {
    "sgisCode": "36020",
    "name": "여수시",
    "totalCount": 96,
    "elementary": 55,
    "middle": 25,
    "high": 15
  },
  {
    "sgisCode": "36030",
    "name": "순천시",
    "totalCount": 82,
    "elementary": 42,
    "middle": 22,
    "high": 15
  },
  {
    "sgisCode": "36040",
    "name": "나주시",
    "totalCount": 54,
    "elementary": 24,
    "middle": 17,
    "high": 12
  },
  {
    "sgisCode": "36060",
    "name": "광양시",
    "totalCount": 54,
    "elementary": 29,
    "middle": 14,
    "high": 9
  },
  {
    "sgisCode": "36510",
    "name": "담양군",
    "totalCount": 26,
    "elementary": 14,
    "middle": 7,
    "high": 4
  },
  {
    "sgisCode": "36520",
    "name": "곡성군",
    "totalCount": 15,
    "elementary": 8,
    "middle": 3,
    "high": 4
  },
  {
    "sgisCode": "36530",
    "name": "구례군",
    "totalCount": 18,
    "elementary": 11,
    "middle": 5,
    "high": 2
  },
  {
    "sgisCode": "36550",
    "name": "고흥군",
    "totalCount": 39,
    "elementary": 20,
    "middle": 15,
    "high": 4
  },
  {
    "sgisCode": "36560",
    "name": "보성군",
    "totalCount": 35,
    "elementary": 16,
    "middle": 11,
    "high": 6
  },
  {
    "sgisCode": "36570",
    "name": "화순군",
    "totalCount": 31,
    "elementary": 17,
    "middle": 10,
    "high": 4
  },
  {
    "sgisCode": "36580",
    "name": "장흥군",
    "totalCount": 27,
    "elementary": 14,
    "middle": 9,
    "high": 4
  },
  {
    "sgisCode": "36590",
    "name": "강진군",
    "totalCount": 28,
    "elementary": 13,
    "middle": 9,
    "high": 4
  },
  {
    "sgisCode": "36600",
    "name": "해남군",
    "totalCount": 37,
    "elementary": 22,
    "middle": 11,
    "high": 4
  },
  {
    "sgisCode": "36610",
    "name": "영암군",
    "totalCount": 35,
    "elementary": 16,
    "middle": 11,
    "high": 6
  },
  {
    "sgisCode": "36620",
    "name": "무안군",
    "totalCount": 38,
    "elementary": 21,
    "middle": 12,
    "high": 5
  },
  {
    "sgisCode": "36630",
    "name": "함평군",
    "totalCount": 25,
    "elementary": 11,
    "middle": 7,
    "high": 4
  },
  {
    "sgisCode": "36640",
    "name": "영광군",
    "totalCount": 30,
    "elementary": 14,
    "middle": 10,
    "high": 6
  },
  {
    "sgisCode": "36650",
    "name": "장성군",
    "totalCount": 23,
    "elementary": 12,
    "middle": 7,
    "high": 4
  },
  {
    "sgisCode": "36660",
    "name": "완도군",
    "totalCount": 43,
    "elementary": 23,
    "middle": 14,
    "high": 6
  },
  {
    "sgisCode": "36670",
    "name": "진도군",
    "totalCount": 28,
    "elementary": 17,
    "middle": 7,
    "high": 4
  },
  {
    "sgisCode": "36680",
    "name": "신안군",
    "totalCount": 43,
    "elementary": 24,
    "middle": 13,
    "high": 6
  },
  {
    "sgisCode": "21010",
    "name": "중구",
    "totalCount": 9,
    "elementary": 4,
    "middle": 1,
    "high": 4
  },
  {
    "sgisCode": "21020",
    "name": "서구",
    "totalCount": 70,
    "elementary": 32,
    "middle": 18,
    "high": 13
  },
  {
    "sgisCode": "21030",
    "name": "동구",
    "totalCount": 20,
    "elementary": 6,
    "middle": 5,
    "high": 5
  },
  {
    "sgisCode": "21040",
    "name": "영도구",
    "totalCount": 28,
    "elementary": 14,
    "middle": 8,
    "high": 6
  },
  {
    "sgisCode": "21050",
    "name": "부산진구",
    "totalCount": 66,
    "elementary": 30,
    "middle": 19,
    "high": 17
  },
  {
    "sgisCode": "21060",
    "name": "동래구",
    "totalCount": 52,
    "elementary": 23,
    "middle": 14,
    "high": 13
  },
  {
    "sgisCode": "21070",
    "name": "남구",
    "totalCount": 53,
    "elementary": 21,
    "middle": 13,
    "high": 15
  },
  {
    "sgisCode": "21080",
    "name": "북구",
    "totalCount": 55,
    "elementary": 28,
    "middle": 16,
    "high": 9
  },
  {
    "sgisCode": "21090",
    "name": "해운대구",
    "totalCount": 65,
    "elementary": 32,
    "middle": 18,
    "high": 14
  },
  {
    "sgisCode": "21100",
    "name": "사하구",
    "totalCount": 58,
    "elementary": 26,
    "middle": 16,
    "high": 14
  },
  {
    "sgisCode": "21110",
    "name": "금정구",
    "totalCount": 53,
    "elementary": 21,
    "middle": 12,
    "high": 14
  },
  {
    "sgisCode": "21120",
    "name": "강서구",
    "totalCount": 46,
    "elementary": 21,
    "middle": 11,
    "high": 8
  },
  {
    "sgisCode": "21130",
    "name": "연제구",
    "totalCount": 30,
    "elementary": 16,
    "middle": 8,
    "high": 4
  },
  {
    "sgisCode": "21140",
    "name": "수영구",
    "totalCount": 22,
    "elementary": 10,
    "middle": 6,
    "high": 4
  },
  {
    "sgisCode": "21150",
    "name": "사상구",
    "totalCount": 39,
    "elementary": 21,
    "middle": 10,
    "high": 5
  },
  {
    "sgisCode": "21510",
    "name": "기장군",
    "totalCount": 40,
    "elementary": 23,
    "middle": 8,
    "high": 5
  },
  {
    "sgisCode": "22010",
    "name": "중구",
    "totalCount": 20,
    "elementary": 10,
    "middle": 5,
    "high": 4
  },
  {
    "sgisCode": "22020",
    "name": "동구",
    "totalCount": 57,
    "elementary": 32,
    "middle": 13,
    "high": 11
  },
  {
    "sgisCode": "22030",
    "name": "서구",
    "totalCount": 140,
    "elementary": 70,
    "middle": 36,
    "high": 29
  },
  {
    "sgisCode": "22040",
    "name": "남구",
    "totalCount": 32,
    "elementary": 11,
    "middle": 6,
    "high": 7
  },
  {
    "sgisCode": "22050",
    "name": "북구",
    "totalCount": 80,
    "elementary": 39,
    "middle": 22,
    "high": 17
  },
  {
    "sgisCode": "22060",
    "name": "수성구",
    "totalCount": 74,
    "elementary": 34,
    "middle": 23,
    "high": 16
  },
  {
    "sgisCode": "22070",
    "name": "달서구",
    "totalCount": 109,
    "elementary": 54,
    "middle": 28,
    "high": 23
  },
  {
    "sgisCode": "22510",
    "name": "달성군",
    "totalCount": 65,
    "elementary": 33,
    "middle": 18,
    "high": 10
  },
  {
    "sgisCode": "26010",
    "name": "중구",
    "totalCount": 42,
    "elementary": 21,
    "middle": 11,
    "high": 9
  },
  {
    "sgisCode": "26020",
    "name": "남구",
    "totalCount": 64,
    "elementary": 31,
    "middle": 16,
    "high": 15
  },
  {
    "sgisCode": "26030",
    "name": "동구",
    "totalCount": 35,
    "elementary": 16,
    "middle": 9,
    "high": 9
  },
  {
    "sgisCode": "26040",
    "name": "북구",
    "totalCount": 51,
    "elementary": 22,
    "middle": 14,
    "high": 12
  },
  {
    "sgisCode": "26510",
    "name": "울주군",
    "totalCount": 62,
    "elementary": 33,
    "middle": 14,
    "high": 12
  },
  {
    "sgisCode": "37010",
    "name": "포항시",
    "totalCount": 137,
    "elementary": 69,
    "middle": 35,
    "high": 27
  },
  {
    "sgisCode": "37020",
    "name": "경주시",
    "totalCount": 84,
    "elementary": 44,
    "middle": 20,
    "high": 19
  },
  {
    "sgisCode": "37030",
    "name": "김천시",
    "totalCount": 54,
    "elementary": 27,
    "middle": 15,
    "high": 9
  },
  {
    "sgisCode": "37040",
    "name": "안동시",
    "totalCount": 59,
    "elementary": 30,
    "middle": 13,
    "high": 13
  },
  {
    "sgisCode": "37050",
    "name": "구미시",
    "totalCount": 105,
    "elementary": 52,
    "middle": 30,
    "high": 21
  },
  {
    "sgisCode": "37060",
    "name": "영주시",
    "totalCount": 39,
    "elementary": 19,
    "middle": 11,
    "high": 9
  },
  {
    "sgisCode": "37070",
    "name": "영천시",
    "totalCount": 42,
    "elementary": 19,
    "middle": 11,
    "high": 9
  },
  {
    "sgisCode": "37080",
    "name": "상주시",
    "totalCount": 56,
    "elementary": 29,
    "middle": 16,
    "high": 10
  },
  {
    "sgisCode": "37090",
    "name": "문경시",
    "totalCount": 34,
    "elementary": 17,
    "middle": 9,
    "high": 6
  },
  {
    "sgisCode": "37100",
    "name": "경산시",
    "totalCount": 62,
    "elementary": 31,
    "middle": 15,
    "high": 12
  },
  {
    "sgisCode": "22520",
    "name": "군위군",
    "totalCount": 0,
    "elementary": 0,
    "middle": 0,
    "high": 0
  },
  {
    "sgisCode": "37520",
    "name": "의성군",
    "totalCount": 31,
    "elementary": 16,
    "middle": 9,
    "high": 6
  },
  {
    "sgisCode": "37530",
    "name": "청송군",
    "totalCount": 21,
    "elementary": 8,
    "middle": 8,
    "high": 5
  },
  {
    "sgisCode": "37540",
    "name": "영양군",
    "totalCount": 14,
    "elementary": 7,
    "middle": 4,
    "high": 3
  },
  {
    "sgisCode": "37550",
    "name": "영덕군",
    "totalCount": 22,
    "elementary": 10,
    "middle": 8,
    "high": 4
  },
  {
    "sgisCode": "37560",
    "name": "청도군",
    "totalCount": 22,
    "elementary": 11,
    "middle": 6,
    "high": 5
  },
  {
    "sgisCode": "37570",
    "name": "고령군",
    "totalCount": 17,
    "elementary": 9,
    "middle": 6,
    "high": 2
  },
  {
    "sgisCode": "37580",
    "name": "성주군",
    "totalCount": 23,
    "elementary": 12,
    "middle": 8,
    "high": 3
  },
  {
    "sgisCode": "37590",
    "name": "칠곡군",
    "totalCount": 39,
    "elementary": 21,
    "middle": 11,
    "high": 7
  },
  {
    "sgisCode": "37600",
    "name": "예천군",
    "totalCount": 24,
    "elementary": 12,
    "middle": 9,
    "high": 3
  },
  {
    "sgisCode": "37610",
    "name": "봉화군",
    "totalCount": 24,
    "elementary": 14,
    "middle": 7,
    "high": 3
  },
  {
    "sgisCode": "37620",
    "name": "울진군",
    "totalCount": 26,
    "elementary": 13,
    "middle": 8,
    "high": 5
  },
  {
    "sgisCode": "37630",
    "name": "울릉군",
    "totalCount": 6,
    "elementary": 4,
    "middle": 1,
    "high": 1
  },
  {
    "sgisCode": "38010",
    "name": "창원시",
    "totalCount": 233,
    "elementary": 113,
    "middle": 62,
    "high": 48
  },
  {
    "sgisCode": "38030",
    "name": "진주시",
    "totalCount": 95,
    "elementary": 47,
    "middle": 21,
    "high": 23
  },
  {
    "sgisCode": "38050",
    "name": "통영시",
    "totalCount": 40,
    "elementary": 21,
    "middle": 12,
    "high": 5
  },
  {
    "sgisCode": "38060",
    "name": "사천시",
    "totalCount": 37,
    "elementary": 17,
    "middle": 11,
    "high": 9
  },
  {
    "sgisCode": "38070",
    "name": "김해시",
    "totalCount": 120,
    "elementary": 62,
    "middle": 33,
    "high": 23
  },
  {
    "sgisCode": "38080",
    "name": "밀양시",
    "totalCount": 42,
    "elementary": 21,
    "middle": 11,
    "high": 8
  },
  {
    "sgisCode": "38090",
    "name": "거제시",
    "totalCount": 73,
    "elementary": 41,
    "middle": 20,
    "high": 10
  },
  {
    "sgisCode": "38100",
    "name": "양산시",
    "totalCount": 78,
    "elementary": 44,
    "middle": 19,
    "high": 14
  },
  {
    "sgisCode": "38510",
    "name": "의령군",
    "totalCount": 22,
    "elementary": 13,
    "middle": 5,
    "high": 3
  },
  {
    "sgisCode": "38520",
    "name": "함안군",
    "totalCount": 30,
    "elementary": 17,
    "middle": 8,
    "high": 5
  },
  {
    "sgisCode": "38530",
    "name": "창녕군",
    "totalCount": 36,
    "elementary": 18,
    "middle": 10,
    "high": 8
  },
  {
    "sgisCode": "38540",
    "name": "고성군",
    "totalCount": 30,
    "elementary": 17,
    "middle": 8,
    "high": 4
  },
  {
    "sgisCode": "38550",
    "name": "남해군",
    "totalCount": 29,
    "elementary": 13,
    "middle": 9,
    "high": 6
  },
  {
    "sgisCode": "38560",
    "name": "하동군",
    "totalCount": 31,
    "elementary": 17,
    "middle": 9,
    "high": 5
  },
  {
    "sgisCode": "38570",
    "name": "산청군",
    "totalCount": 24,
    "elementary": 13,
    "middle": 4,
    "high": 7
  },
  {
    "sgisCode": "38580",
    "name": "함양군",
    "totalCount": 23,
    "elementary": 13,
    "middle": 6,
    "high": 4
  },
  {
    "sgisCode": "38590",
    "name": "거창군",
    "totalCount": 35,
    "elementary": 17,
    "middle": 9,
    "high": 7
  },
  {
    "sgisCode": "38600",
    "name": "합천군",
    "totalCount": 33,
    "elementary": 18,
    "middle": 9,
    "high": 6
  },
  {
    "sgisCode": "39010",
    "name": "제주시",
    "totalCount": 129,
    "elementary": 74,
    "middle": 30,
    "high": 20
  },
  {
    "sgisCode": "39020",
    "name": "서귀포시",
    "totalCount": 72,
    "elementary": 46,
    "middle": 15,
    "high": 10
  }
];

/** 시도 합산 학교 수 (SGIS 2자리) */
export const SCHOOL_FALLBACK_SIDO: SchoolCountStat[] = [
  {
    "sgisCode": "11",
    "name": "서울",
    "totalCount": 1405,
    "elementary": 606,
    "middle": 387,
    "high": 317
  },
  {
    "sgisCode": "23",
    "name": "인천",
    "totalCount": 662,
    "elementary": 316,
    "middle": 166,
    "high": 145
  },
  {
    "sgisCode": "31",
    "name": "경기",
    "totalCount": 2767,
    "elementary": 1440,
    "middle": 721,
    "high": 526
  },
  {
    "sgisCode": "32",
    "name": "강원",
    "totalCount": 656,
    "elementary": 355,
    "middle": 160,
    "high": 116
  },
  {
    "sgisCode": "33",
    "name": "충북",
    "totalCount": 511,
    "elementary": 271,
    "middle": 131,
    "high": 83
  },
  {
    "sgisCode": "29",
    "name": "세종",
    "totalCount": 109,
    "elementary": 55,
    "middle": 28,
    "high": 22
  },
  {
    "sgisCode": "25",
    "name": "대전",
    "totalCount": 323,
    "elementary": 154,
    "middle": 90,
    "high": 61
  },
  {
    "sgisCode": "34",
    "name": "충남",
    "totalCount": 746,
    "elementary": 418,
    "middle": 187,
    "high": 118
  },
  {
    "sgisCode": "35",
    "name": "전북",
    "totalCount": 769,
    "elementary": 405,
    "middle": 206,
    "high": 132
  },
  {
    "sgisCode": "24",
    "name": "광주",
    "totalCount": 335,
    "elementary": 157,
    "middle": 93,
    "high": 71
  },
  {
    "sgisCode": "36",
    "name": "전남",
    "totalCount": 880,
    "elementary": 457,
    "middle": 255,
    "high": 143
  },
  {
    "sgisCode": "21",
    "name": "부산",
    "totalCount": 706,
    "elementary": 328,
    "middle": 183,
    "high": 150
  },
  {
    "sgisCode": "22",
    "name": "대구",
    "totalCount": 577,
    "elementary": 283,
    "middle": 151,
    "high": 117
  },
  {
    "sgisCode": "26",
    "name": "울산",
    "totalCount": 254,
    "elementary": 123,
    "middle": 64,
    "high": 57
  },
  {
    "sgisCode": "37",
    "name": "경북",
    "totalCount": 941,
    "elementary": 474,
    "middle": 260,
    "high": 182
  },
  {
    "sgisCode": "38",
    "name": "경남",
    "totalCount": 1011,
    "elementary": 522,
    "middle": 266,
    "high": 195
  },
  {
    "sgisCode": "39",
    "name": "제주",
    "totalCount": 201,
    "elementary": 120,
    "middle": 45,
    "high": 30
  }
];

const SIGUNGU_INDEX = new Map(
  SCHOOL_FALLBACK_SIGUNGU.map((s) => [s.sgisCode, s]),
);
const SIDO_INDEX = new Map(SCHOOL_FALLBACK_SIDO.map((s) => [s.sgisCode, s]));

export function getSchoolFallback(sgisCode: string): SchoolCountStat | null {
  return SIGUNGU_INDEX.get(sgisCode) ?? SIDO_INDEX.get(sgisCode) ?? null;
}
