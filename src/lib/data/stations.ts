/**
 * 기상청 ASOS 관측지점 데이터
 * - 귀농 관련 주요 시/군 위주로 선별
 * - stnId: 기상청 종관기상관측소 지점번호
 */

export interface Station {
  stnId: string;
  name: string;
  province: string;
  description: string;
  /** SGIS 시도 단위 지역코드 */
  sgisCode: string;
  /** 건강보험심사평가원 시도코드 */
  hiraSidoCd: string;
  /** 교육부 NEIS 시도교육청코드 */
  eduCode: string;
}

/** 도/광역시 이름으로 대표 Station 찾기 (Cross-linking용) */
export function getStationByProvince(province: string): Station | undefined {
  return STATIONS.find((st) => st.province === province);
}

export const STATIONS: Station[] = [
  // 수도권
  { stnId: "108", name: "서울", province: "서울특별시", description: "수도권 기준점", sgisCode: "11", hiraSidoCd: "110000", eduCode: "B10" },
  { stnId: "119", name: "수원", province: "경기도", description: "경기 남부", sgisCode: "31", hiraSidoCd: "310000", eduCode: "J10" },

  // 강원도
  { stnId: "101", name: "춘천", province: "강원도", description: "강원 내륙", sgisCode: "32", hiraSidoCd: "320000", eduCode: "R10" },
  { stnId: "211", name: "인제", province: "강원도", description: "산간 고랭지", sgisCode: "32", hiraSidoCd: "320000", eduCode: "R10" },
  { stnId: "217", name: "정선", province: "강원도", description: "고랭지 농업", sgisCode: "32", hiraSidoCd: "320000", eduCode: "R10" },

  // 충청도
  { stnId: "131", name: "청주", province: "충청북도", description: "충북 중심", sgisCode: "33", hiraSidoCd: "330000", eduCode: "M10" },
  { stnId: "133", name: "대전", province: "대전광역시", description: "충남 기준점", sgisCode: "25", hiraSidoCd: "250000", eduCode: "G10" },
  { stnId: "238", name: "금산", province: "충청남도", description: "인삼 주산지", sgisCode: "34", hiraSidoCd: "340000", eduCode: "N10" },

  // 전라도
  { stnId: "146", name: "전주", province: "전라북도", description: "호남 평야", sgisCode: "35", hiraSidoCd: "350000", eduCode: "P10" },
  { stnId: "156", name: "광주", province: "광주광역시", description: "전남 기준점", sgisCode: "24", hiraSidoCd: "240000", eduCode: "F10" },
  { stnId: "262", name: "보성", province: "전라남도", description: "차 재배지", sgisCode: "36", hiraSidoCd: "360000", eduCode: "Q10" },
  { stnId: "259", name: "순천", province: "전라남도", description: "남해안 온난", sgisCode: "36", hiraSidoCd: "360000", eduCode: "Q10" },

  // 경상도
  { stnId: "143", name: "대구", province: "대구광역시", description: "경북 분지", sgisCode: "22", hiraSidoCd: "220000", eduCode: "D10" },
  { stnId: "192", name: "진주", province: "경상남도", description: "경남 내륙", sgisCode: "38", hiraSidoCd: "380000", eduCode: "T10" },
  { stnId: "289", name: "산청", province: "경상남도", description: "지리산 자락", sgisCode: "38", hiraSidoCd: "380000", eduCode: "T10" },
  { stnId: "271", name: "봉화", province: "경상북도", description: "경북 산간", sgisCode: "37", hiraSidoCd: "370000", eduCode: "S10" },
  { stnId: "272", name: "영주", province: "경상북도", description: "사과 주산지", sgisCode: "37", hiraSidoCd: "370000", eduCode: "S10" },

  // 제주
  { stnId: "184", name: "제주", province: "제주특별자치도", description: "감귤 재배", sgisCode: "39", hiraSidoCd: "390000", eduCode: "V10" },
  { stnId: "189", name: "서귀포", province: "제주특별자치도", description: "아열대 작물", sgisCode: "39", hiraSidoCd: "390000", eduCode: "V10" },
];

/** 기본 표시 지역 (페이지 최초 로딩 시) */
export const DEFAULT_STATION_IDS = ["108", "146", "143", "184"];
