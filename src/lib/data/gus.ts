/**
 * 구(區) 단위 지역 데이터
 * - 일반구가 있는 11개 시의 하위 구 32개
 * - 부천시는 2016년 구 폐지로 제외
 * - 구 상세 페이지 + 시 상세 페이지 구 지도에서 사용
 */

export interface GuDistrict {
  /** URL slug (예: "jangan-gu") */
  id: string;
  /** 정식 명칭 (예: "장안구") */
  name: string;
  /** 약칭 (예: "장안") */
  shortName: string;
  /** 소속 시군구 ID (Sigungu.id 참조, 예: "suwon") */
  parentSigunguId: string;
  /** 소속 시/도 ID (Province.id 참조, 예: "gyeonggi") */
  sidoId: string;
  /** SGIS 구 코드 (5자리) */
  sgisCode: string;
  /** HIRA 구 코드 (6자리) */
  hiraSgguCd: string;
  /** 면적 (km²) */
  area: number;
  /** 한 줄 소개 */
  description: string;
  /** 핵심 키워드 (2~3개) */
  highlights: string[];
  /** 대표 작물 */
  mainCrops: string[];
}

// ---------------------------------------------------------------------------
// 구 데이터 (11개 시, 32개 구)
// ---------------------------------------------------------------------------

export const GUS: GuDistrict[] = [
  // ========================================================================
  // 수원시 (4구) — 경기도
  // ========================================================================
  { id: "jangan-gu", name: "장안구", shortName: "장안", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31011", hiraSgguCd: "310601", area: 33.29, description: "수원 북부, 수원화성 일대 도시농업 중심지", highlights: ["수원화성", "도시농업"], mainCrops: ["상추", "딸기"] },
  { id: "gwonseon-gu", name: "권선구", shortName: "권선", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31012", hiraSgguCd: "310602", area: 47.37, description: "수원 남서부, 농업진흥원 인접 농업 허브", highlights: ["농업진흥원", "근교농업"], mainCrops: ["상추", "배추"] },
  { id: "paldal-gu", name: "팔달구", shortName: "팔달", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31013", hiraSgguCd: "310603", area: 12.87, description: "수원 도심, 전통시장 직거래 허브", highlights: ["전통시장", "직거래"], mainCrops: ["상추", "토마토"] },
  { id: "yeongtong-gu", name: "영통구", shortName: "영통", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31014", hiraSgguCd: "310604", area: 27.51, description: "수원 동부, 광교 신도시 스마트팜 시범 지역", highlights: ["스마트팜", "신도시"], mainCrops: ["딸기", "상추"] },

  // ========================================================================
  // 성남시 (3구) — 경기도
  // ========================================================================
  { id: "sujeong-gu", name: "수정구", shortName: "수정", parentSigunguId: "seongnam", sidoId: "gyeonggi", sgisCode: "31021", hiraSgguCd: "310401", area: 44.87, description: "성남 동부, 남한산성 인근 친환경 농업 지대", highlights: ["남한산성", "친환경"], mainCrops: ["상추", "배추"] },
  { id: "jungwon-gu", name: "중원구", shortName: "중원", parentSigunguId: "seongnam", sidoId: "gyeonggi", sgisCode: "31022", hiraSgguCd: "310402", area: 25.91, description: "성남 중심부, 도시농업 교육 거점", highlights: ["도시농업", "교육"], mainCrops: ["상추", "고추"] },
  { id: "bundang-gu", name: "분당구", shortName: "분당", parentSigunguId: "seongnam", sidoId: "gyeonggi", sgisCode: "31023", hiraSgguCd: "310403", area: 69.44, description: "판교 테크노밸리 인접, 스마트팜 기술 허브", highlights: ["스마트팜", "기술"], mainCrops: ["딸기", "상추"] },

  // ========================================================================
  // 안양시 (2구) — 경기도
  // ========================================================================
  { id: "manan-gu", name: "만안구", shortName: "만안", parentSigunguId: "anyang", sidoId: "gyeonggi", sgisCode: "31041", hiraSgguCd: "310701", area: 30.44, description: "안양 서부, 삼성산 자락 도시 텃밭 활성화", highlights: ["도시텃밭", "체험"], mainCrops: ["상추", "고추"] },
  { id: "dongan-gu", name: "동안구", shortName: "동안", parentSigunguId: "anyang", sidoId: "gyeonggi", sgisCode: "31042", hiraSgguCd: "310702", area: 28.02, description: "안양 동부, 관악산 인근 친환경 텃밭", highlights: ["친환경", "교육"], mainCrops: ["상추", "토마토"] },

  // ========================================================================
  // 안산시 (2구) — 경기도
  // ========================================================================
  { id: "sangnok-gu", name: "상록구", shortName: "상록", parentSigunguId: "ansan", sidoId: "gyeonggi", sgisCode: "31091", hiraSgguCd: "311101", area: 57.33, description: "안산 동부, 수암봉 자락 친환경 농업 지대", highlights: ["친환경", "체험"], mainCrops: ["포도", "상추"] },
  { id: "danwon-gu", name: "단원구", shortName: "단원", parentSigunguId: "ansan", sidoId: "gyeonggi", sgisCode: "31092", hiraSgguCd: "311102", area: 97.68, description: "대부도·시화호 인근 유기농 특화 지역", highlights: ["유기농", "대부도"], mainCrops: ["포도", "배추"] },

  // ========================================================================
  // 고양시 (3구) — 경기도
  // ========================================================================
  { id: "deogyang-gu", name: "덕양구", shortName: "덕양", parentSigunguId: "goyang", sidoId: "gyeonggi", sgisCode: "31101", hiraSgguCd: "311901", area: 164.73, description: "고양 서부, 행주산성 인근 대규모 농업 지대", highlights: ["대규모농업", "친환경"], mainCrops: ["쌀", "화훼"] },
  { id: "ilsandong-gu", name: "일산동구", shortName: "일산동", parentSigunguId: "goyang", sidoId: "gyeonggi", sgisCode: "31103", hiraSgguCd: "311902", area: 59.50, description: "일산 동부, 호수공원 인근 근교 원예 중심", highlights: ["원예", "근교농업"], mainCrops: ["화훼", "인삼"] },
  { id: "ilsanseo-gu", name: "일산서구", shortName: "일산서", parentSigunguId: "goyang", sidoId: "gyeonggi", sgisCode: "31104", hiraSgguCd: "311903", area: 43.10, description: "일산 서부, 한강변 화훼·원예 단지", highlights: ["화훼단지", "한강변"], mainCrops: ["화훼", "상추"] },

  // ========================================================================
  // 용인시 (3구) — 경기도
  // ========================================================================
  { id: "cheoin-gu", name: "처인구", shortName: "처인", parentSigunguId: "yongin", sidoId: "gyeonggi", sgisCode: "31191", hiraSgguCd: "312001", area: 466.28, description: "용인 남부, 대규모 농업지대·딸기 명산지", highlights: ["딸기", "대규모농업", "귀농인기"], mainCrops: ["딸기", "배", "쌀"] },
  { id: "giheung-gu", name: "기흥구", shortName: "기흥", parentSigunguId: "yongin", sidoId: "gyeonggi", sgisCode: "31192", hiraSgguCd: "312002", area: 81.92, description: "용인 중부, 산업단지 인근 도시농업", highlights: ["도시농업", "직거래"], mainCrops: ["상추", "딸기"] },
  { id: "suji-gu", name: "수지구", shortName: "수지", parentSigunguId: "yongin", sidoId: "gyeonggi", sgisCode: "31193", hiraSgguCd: "312003", area: 43.12, description: "용인 북부, 수지 신도시 근교 체험농장", highlights: ["체험농장", "근교농업"], mainCrops: ["상추", "토마토"] },

  // ========================================================================
  // 청주시 (4구) — 충청북도
  // ========================================================================
  { id: "sangdang-gu", name: "상당구", shortName: "상당", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33041", hiraSgguCd: "330101", area: 276.07, description: "청주 동부, 상당산성 인근 친환경 농업지대", highlights: ["친환경", "산촌"], mainCrops: ["쌀", "고추", "사과"] },
  { id: "heungdeok-gu", name: "흥덕구", shortName: "흥덕", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33042", hiraSgguCd: "330102", area: 178.51, description: "청주 서부, 오송 바이오밸리 인접 농업 허브", highlights: ["근교농업", "바이오"], mainCrops: ["쌀", "딸기"] },
  { id: "cheongwon-gu", name: "청원구", shortName: "청원", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33043", hiraSgguCd: "330103", area: 253.87, description: "청주 북부, 청원 생명산업특구 대규모 농업", highlights: ["생명산업", "대규모농업"], mainCrops: ["쌀", "포도", "배추"] },
  { id: "seowon-gu", name: "서원구", shortName: "서원", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33044", hiraSgguCd: "330104", area: 231.85, description: "청주 남부, 보은·옥천 접경 친환경 농촌", highlights: ["친환경", "귀농인기"], mainCrops: ["쌀", "고추"] },

  // ========================================================================
  // 천안시 (2구) — 충청남도
  // ========================================================================
  { id: "dongnam-gu", name: "동남구", shortName: "동남", parentSigunguId: "cheonan", sidoId: "chungnam", sgisCode: "34011", hiraSgguCd: "340201", area: 323.73, description: "천안 동남부, 배·호두 특산지", highlights: ["배", "호두"], mainCrops: ["배", "호두", "쌀"] },
  { id: "seobuk-gu", name: "서북구", shortName: "서북", parentSigunguId: "cheonan", sidoId: "chungnam", sgisCode: "34012", hiraSgguCd: "340202", area: 312.52, description: "천안 서북부, 직산·성환 농업 중심지", highlights: ["근교농업", "수도권접근"], mainCrops: ["쌀", "배추", "고추"] },

  // ========================================================================
  // 전주시 (2구) — 전라북도
  // ========================================================================
  { id: "wansan-gu", name: "완산구", shortName: "완산", parentSigunguId: "jeonju", sidoId: "jeonbuk", sgisCode: "35011", hiraSgguCd: "350401", area: 110.34, description: "전주 서부, 한옥마을 로컬푸드 허브", highlights: ["로컬푸드", "한옥마을"], mainCrops: ["쌀", "콩"] },
  { id: "deokjin-gu", name: "덕진구", shortName: "덕진", parentSigunguId: "jeonju", sidoId: "jeonbuk", sgisCode: "35012", hiraSgguCd: "350402", area: 95.88, description: "전주 동부, 전북대 인근 농업 교육 거점", highlights: ["농업교육", "친환경"], mainCrops: ["쌀", "배추"] },

  // ========================================================================
  // 포항시 (2구) — 경상북도
  // ========================================================================
  { id: "nam-gu-pohang", name: "남구", shortName: "남구", parentSigunguId: "pohang", sidoId: "gyeongbuk", sgisCode: "37011", hiraSgguCd: "370701", area: 487.16, description: "포항 남부, 형산강변 농업지대", highlights: ["근교농업", "수산업"], mainCrops: ["쌀", "배추"] },
  { id: "buk-gu-pohang", name: "북구", shortName: "북구", parentSigunguId: "pohang", sidoId: "gyeongbuk", sgisCode: "37012", hiraSgguCd: "370702", area: 641.68, description: "포항 북부, 산간 친환경 농업 지대", highlights: ["친환경", "산촌"], mainCrops: ["감자", "배추", "사과"] },

  // ========================================================================
  // 창원시 (5구) — 경상남도
  // ========================================================================
  { id: "uichang-gu", name: "의창구", shortName: "의창", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38111", hiraSgguCd: "380701", area: 212.55, description: "창원 중심부, 농업기술센터 소재 근교 농업 거점", highlights: ["근교농업", "기술센터"], mainCrops: ["쌀", "배추"] },
  { id: "seongsan-gu", name: "성산구", shortName: "성산", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38112", hiraSgguCd: "380702", area: 83.92, description: "창원 동부, 산업도시 근교 도시농업", highlights: ["도시농업", "산업도시"], mainCrops: ["상추", "고추"] },
  { id: "masanhappo-gu", name: "마산합포구", shortName: "합포", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38113", hiraSgguCd: "380703", area: 185.42, description: "마산 남부, 해안 농수산물 직거래 허브", highlights: ["직거래", "해안농업"], mainCrops: ["쌀", "감자"] },
  { id: "masanhoewon-gu", name: "마산회원구", shortName: "회원", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38114", hiraSgguCd: "380704", area: 91.62, description: "마산 북부, 내서 일대 근교 농업 지대", highlights: ["근교농업", "체험"], mainCrops: ["배추", "감자"] },
  { id: "jinhae-gu", name: "진해구", shortName: "진해", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38115", hiraSgguCd: "380705", area: 173.60, description: "진해만 인근 벚꽃·해안 농업 특화 지역", highlights: ["해안농업", "친환경"], mainCrops: ["쌀", "배추"] },
];

// ---------------------------------------------------------------------------
// 유틸리티 함수
// ---------------------------------------------------------------------------

/** parentSigunguId로 해당 시의 모든 구를 조회 */
export function getGusByParent(parentSigunguId: string): GuDistrict[] {
  return GUS.filter((g) => g.parentSigunguId === parentSigunguId);
}

/** sidoId + parentSigunguId + guId로 특정 구를 조회 */
export function getGuByIds(
  sidoId: string,
  parentSigunguId: string,
  guId: string,
): GuDistrict | undefined {
  return GUS.find(
    (g) => g.sidoId === sidoId && g.parentSigunguId === parentSigunguId && g.id === guId,
  );
}

/** 구가 있는 시군구 ID 집합 */
export const CITIES_WITH_GU = new Set(GUS.map((g) => g.parentSigunguId));

/** 특정 시군구가 구 분할 시인지 확인 */
export function hasGuDistricts(sigunguId: string): boolean {
  return CITIES_WITH_GU.has(sigunguId);
}
