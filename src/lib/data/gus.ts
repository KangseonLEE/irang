import { GU_MAIN_CROPS } from "./sigungu-main-crops";
import { getEnrichedHighlights } from "./popular-tags";

/**
 * 구(區) 단위 지역 데이터
 * - 일반구가 있는 13개 시의 하위 구 39개
 * - 부천시: 2016년 구 폐지 → 2024-01-01 원미·소사·오정구 재설치 (10/7 반영 — 예전엔 폐지 상태로 빠져 있었다)
 * - 화성시: 2026-02-01 만세·효행·병점·동탄구 신설 (10/7 반영). 통계청(SGIS)에 새 구 코드가 아직 없어 인구·농가는
 *   행정동을 더한다(region-composites.ts parentSigunguId)
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
  /** 면적 (km², 소수점 2자리) — 국토교통부 지적통계 2025(KOSIS 116/DT_MLTM_2300) — scripts/collect-areas.ts, 그 해 통계에 없는 신설 구는 lib/data/cadastre-area.ts AREA_NOT_YET_IN_CADASTRE */
  area: number;
  /** 한 줄 소개 */
  description: string;
  /** 핵심 키워드 (2~3개) */
  highlights: string[];
  /**
   * 주요 작물 — 2025 농림어업총조사 구 단위 재배면적 큰 순(sigungu-main-crops.ts GU_MAIN_CROPS, 생성본).
   * 표에 없는 화성 2026 신설 4구는 빈 배열(화면은 '자료 없음' 안내). 손으로 넣지 않는다(10/10).
   */
  mainCrops: string[];
  /**
   * 법정 읍·면·동 — 원천 주소에 구 이름이 없는 시(부천·화성)만 둔다. 교육부 학교 주소(education.ts)와
   * 심평원의 시 단위로 남은 기관(hira.ts)을 이 목록으로 구에 나눈다 (10/7).
   * 두 구에 걸친 법정동(화성 능동 — 병점구 진안동 9통 / 동탄구 동탄3동 31통)은 넣지 않는다 — 학교는 SCHOOL_GU_OVERRIDES.
   */
  legalAreas?: readonly string[];
}

// ---------------------------------------------------------------------------
// 구 데이터 (13개 시, 39개 구)
// ---------------------------------------------------------------------------

const GU_ROWS: Omit<GuDistrict, "mainCrops">[] = [
  // ========================================================================
  // 수원시 (4구) — 경기도
  // ========================================================================
  { id: "jangan-gu", name: "장안구", shortName: "장안", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31011", hiraSgguCd: "310602", area: 33.34, description: "수원 북부, 수원화성 일대 도시농업 중심지", highlights: ["수원화성", "도시농업"] },
  { id: "gwonseon-gu", name: "권선구", shortName: "권선", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31012", hiraSgguCd: "310601", area: 47.19, description: "수원 남서부, 농업진흥원 인접 농업 허브", highlights: ["농업진흥원", "근교농업"] },
  { id: "paldal-gu", name: "팔달구", shortName: "팔달", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31013", hiraSgguCd: "310603", area: 12.87, description: "수원 도심, 전통시장 직거래 허브", highlights: ["전통시장", "직거래"] },
  { id: "yeongtong-gu", name: "영통구", shortName: "영통", parentSigunguId: "suwon", sidoId: "gyeonggi", sgisCode: "31014", hiraSgguCd: "310604", area: 27.71, description: "수원 동부, 광교 신도시가 있는 도심", highlights: ["신도시"] },

  // ========================================================================
  // 성남시 (3구) — 경기도
  // ========================================================================
  { id: "sujeong-gu", name: "수정구", shortName: "수정", parentSigunguId: "seongnam", sidoId: "gyeonggi", sgisCode: "31021", hiraSgguCd: "310401", area: 45.45, description: "성남 동부, 남한산성 인근 친환경 농업 지대", highlights: ["남한산성", "친환경"] },
  { id: "jungwon-gu", name: "중원구", shortName: "중원", parentSigunguId: "seongnam", sidoId: "gyeonggi", sgisCode: "31022", hiraSgguCd: "310402", area: 26.42, description: "성남 중심부, 도시농업 교육 거점", highlights: ["도시농업", "교육"] },
  { id: "bundang-gu", name: "분당구", shortName: "분당", parentSigunguId: "seongnam", sidoId: "gyeonggi", sgisCode: "31023", hiraSgguCd: "310403", area: 69.76, description: "판교 테크노밸리가 있는 성남 서부 신도시", highlights: ["판교", "신도시"] },

  // ========================================================================
  // 안양시 (2구) — 경기도
  // ========================================================================
  { id: "manan-gu", name: "만안구", shortName: "만안", parentSigunguId: "anyang", sidoId: "gyeonggi", sgisCode: "31041", hiraSgguCd: "310701", area: 36.56, description: "안양 서부, 삼성산 자락 도시 텃밭 활성화", highlights: ["도시텃밭", "체험"] },
  { id: "dongan-gu", name: "동안구", shortName: "동안", parentSigunguId: "anyang", sidoId: "gyeonggi", sgisCode: "31042", hiraSgguCd: "310702", area: 21.94, description: "안양 동부, 관악산 인근 친환경 텃밭", highlights: ["친환경", "교육"] },

  // ========================================================================
  // 안산시 (2구) — 경기도
  // ========================================================================
  { id: "sangnok-gu", name: "상록구", shortName: "상록", parentSigunguId: "ansan", sidoId: "gyeonggi", sgisCode: "31091", hiraSgguCd: "311102", area: 57.99, description: "안산 동부, 수암봉 자락 친환경 농업 지대", highlights: ["친환경", "체험"] },
  { id: "danwon-gu", name: "단원구", shortName: "단원", parentSigunguId: "ansan", sidoId: "gyeonggi", sgisCode: "31092", hiraSgguCd: "311101", area: 98.47, description: "대부도·시화호 인근 유기농 특화 지역", highlights: ["유기농", "대부도"] },

  // ========================================================================
  // 고양시 (3구) — 경기도
  // ========================================================================
  { id: "deogyang-gu", name: "덕양구", shortName: "덕양", parentSigunguId: "goyang", sidoId: "gyeonggi", sgisCode: "31101", hiraSgguCd: "311901", area: 165.63, description: "고양 서부, 행주산성 인근 대규모 농업 지대", highlights: ["대규모농업", "친환경"] },
  { id: "ilsandong-gu", name: "일산동구", shortName: "일산동", parentSigunguId: "goyang", sidoId: "gyeonggi", sgisCode: "31103", hiraSgguCd: "311903", area: 59.96, description: "일산 동부, 호수공원 인근 근교 원예 중심", highlights: ["원예", "근교농업"] },
  { id: "ilsanseo-gu", name: "일산서구", shortName: "일산서", parentSigunguId: "goyang", sidoId: "gyeonggi", sgisCode: "31104", hiraSgguCd: "311902", area: 42.56, description: "일산 서부, 한강변 화훼·원예 단지", highlights: ["화훼단지", "한강변"] },

  // ========================================================================
  // 용인시 (3구) — 경기도
  // ========================================================================
  { id: "cheoin-gu", name: "처인구", shortName: "처인", parentSigunguId: "yongin", sidoId: "gyeonggi", sgisCode: "31191", hiraSgguCd: "312003", area: 467.48, description: "용인 남부, 대규모 농업지대·딸기 명산지", highlights: ["딸기", "대규모농업"] },
  { id: "giheung-gu", name: "기흥구", shortName: "기흥", parentSigunguId: "yongin", sidoId: "gyeonggi", sgisCode: "31192", hiraSgguCd: "312001", area: 81.64, description: "용인 중부, 산업단지 인근 도시농업", highlights: ["도시농업", "직거래"] },
  { id: "suji-gu", name: "수지구", shortName: "수지", parentSigunguId: "yongin", sidoId: "gyeonggi", sgisCode: "31193", hiraSgguCd: "312002", area: 42.11, description: "용인 북부, 수지 신도시 근교 체험농장", highlights: ["체험농장", "근교농업"] },

  // ========================================================================
  // 부천시 (3구) — 경기도. 2024-01-01 구 재설치
  //   코드: 통계청 31051~31053 · 심평원 310303(원미)·310301(소사)·310302(오정) — 응답 지역명으로 확인(10/7)
  //   면적: 지적통계 2025(collect-areas) · 법정동: 행정안전부 「법정동 변경내역」 2024.1.1 시행분
  //   교육부 학교 주소의 84%(112/134)에 구 이름이 없어 법정동으로 나눈다(education.ts schoolMatcher)
  // ========================================================================
  { id: "wonmi-gu", name: "원미구", shortName: "원미", parentSigunguId: "bucheon", sidoId: "gyeonggi", sgisCode: "31051", hiraSgguCd: "310303", area: 20.58, description: "부천 중심부, 상동 문화동산 텃밭 등 도시농업", highlights: ["도시농업"], legalAreas: ["원미동", "심곡동", "춘의동", "도당동", "약대동", "소사동", "역곡동", "중동", "상동"] },
  { id: "sosa-gu", name: "소사구", shortName: "소사", parentSigunguId: "bucheon", sidoId: "gyeonggi", sgisCode: "31052", hiraSgguCd: "310301", area: 12.83, description: "부천 남부, 소사본동·범박동·옥길동 일대 도심", highlights: [], legalAreas: ["소사본동", "심곡본동", "범박동", "괴안동", "송내동", "옥길동", "계수동"] },
  { id: "ojeong-gu", name: "오정구", shortName: "오정", parentSigunguId: "bucheon", sidoId: "gyeonggi", sgisCode: "31053", hiraSgguCd: "310302", area: 20.05, description: "부천 북부, 대장동 들판과 개발제한구역의 근교농업 지역", highlights: ["근교농업", "개발제한구역"], legalAreas: ["오정동", "여월동", "작동", "원종동", "고강동", "대장동", "삼정동", "내동"] },

  // ========================================================================
  // 화성시 (4구) — 경기도. 2026-02-01 신설 (「화성시 읍ㆍ면ㆍ동ㆍ리의 명칭 및 관할구역에 관한 조례」 별표1)
  //   코드: 국가데이터처 한국행정구역분류 31241~31244(SGIS 미등재 → region-composites.ts 행정동 합) ·
  //         심평원 312501~312504(시 단위로 남은 312500 은 법정 읍·면·동으로 나눈다, hira.ts)
  //   면적: 화성시 토지정보과 구별 면적(2026.4.30 — 지적통계 2025 엔 구가 아직 없다, 4구 합 = 지적통계 화성시 706.50) · 법정동: 조례 별표1 2025.12.31 법정동 기준판
  //         (2026.3.1 오산동 → 여울동, 옛 이름도 둔다). 능동은 병점·동탄에 걸쳐 목록에서 뺀다
  //   설명·작물: 구청 일반현황(만세 '농축수산업' 산업 중심지, 효행 '개발제한구역·농업진흥지역'·도농복합권역),
  //         송산포도(송산면 일대, 향토문화전자대전). 병점·동탄은 농업 자료가 없다
  // ========================================================================
  { id: "manse-gu", name: "만세구", shortName: "만세", parentSigunguId: "hwaseong", sidoId: "gyeonggi", sgisCode: "31241", hiraSgguCd: "312501", area: 472.38, description: "화성 서부, 송산포도 산지가 있는 농축수산업 권역", highlights: ["송산포도", "농축수산업"], legalAreas: ["우정읍", "향남읍", "남양읍", "마도면", "송산면", "서신면", "팔탄면", "장안면", "양감면", "새솔동"] },
  { id: "hyohaeng-gu", name: "효행구", shortName: "효행", parentSigunguId: "hwaseong", sidoId: "gyeonggi", sgisCode: "31242", hiraSgguCd: "312502", area: 153.48, description: "화성 중부, 농업진흥지역이 넓은 도농복합 권역", highlights: ["도농복합", "농업진흥지역"], legalAreas: ["봉담읍", "매송면", "비봉면", "정남면", "배양동", "기안동"] },
  { id: "byeongjeom-gu", name: "병점구", shortName: "병점", parentSigunguId: "hwaseong", sidoId: "gyeonggi", sgisCode: "31243", hiraSgguCd: "312503", area: 25.12, description: "화성 동부, 병점·진안·반월동 일대 도심", highlights: [], legalAreas: ["진안동", "기산동", "반정동", "병점동", "반월동", "황계동", "송산동", "안녕동"] },
  { id: "dongtan-gu", name: "동탄구", shortName: "동탄", parentSigunguId: "hwaseong", sidoId: "gyeonggi", sgisCode: "31244", hiraSgguCd: "312504", area: 55.52, description: "화성 동부, 동탄1~9동 신도시", highlights: [], legalAreas: ["반송동", "석우동", "청계동", "영천동", "중동", "오산동", "여울동", "방교동", "금곡동", "송동", "산척동", "장지동", "목동", "신동"] },

  // ========================================================================
  // 청주시 (4구) — 충청북도
  // ========================================================================
  { id: "sangdang-gu", name: "상당구", shortName: "상당", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33041", hiraSgguCd: "330101", area: 404.35, description: "청주 동부, 상당산성 인근 친환경 농업지대", highlights: ["친환경", "산촌"] },
  { id: "heungdeok-gu", name: "흥덕구", shortName: "흥덕", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33043", hiraSgguCd: "330102", area: 199.09, description: "청주 서부, 오송 바이오밸리 인접 농업 허브", highlights: ["근교농업", "바이오"] },
  { id: "cheongwon-gu", name: "청원구", shortName: "청원", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33044", hiraSgguCd: "330103", area: 214.88, description: "청주 북부, 청원 생명산업특구 대규모 농업", highlights: ["생명산업", "대규모농업"] },
  { id: "seowon-gu", name: "서원구", shortName: "서원", parentSigunguId: "cheongju", sidoId: "chungbuk", sgisCode: "33042", hiraSgguCd: "330104", area: 122.6, description: "청주 남부, 보은·옥천 접경 친환경 농촌", highlights: ["친환경"] },

  // ========================================================================
  // 천안시 (2구) — 충청남도
  // ========================================================================
  { id: "dongnam-gu", name: "동남구", shortName: "동남", parentSigunguId: "cheonan", sidoId: "chungnam", sgisCode: "34011", hiraSgguCd: "340202", area: 438.36, description: "천안 동남부, 배·호두 특산지", highlights: ["배", "호두"] },
  { id: "seobuk-gu", name: "서북구", shortName: "서북", parentSigunguId: "cheonan", sidoId: "chungnam", sgisCode: "34012", hiraSgguCd: "340201", area: 197.77, description: "천안 서북부, 직산·성환 농업 중심지", highlights: ["근교농업", "수도권접근"] },

  // ========================================================================
  // 전주시 (2구) — 전라북도
  // ========================================================================
  { id: "wansan-gu", name: "완산구", shortName: "완산", parentSigunguId: "jeonju", sidoId: "jeonbuk", sgisCode: "35011", hiraSgguCd: "350401", area: 92.47, description: "전주 서부, 한옥마을 로컬푸드 허브", highlights: ["로컬푸드", "한옥마을"] },
  { id: "deokjin-gu", name: "덕진구", shortName: "덕진", parentSigunguId: "jeonju", sidoId: "jeonbuk", sgisCode: "35012", hiraSgguCd: "350402", area: 113.49, description: "전주 동부, 전북대 인근 농업 교육 거점", highlights: ["농업교육", "친환경"] },

  // ========================================================================
  // 포항시 (2구) — 경상북도
  // ========================================================================
  { id: "nam-gu-pohang", name: "남구", shortName: "남구", parentSigunguId: "pohang", sidoId: "gyeongbuk", sgisCode: "37011", hiraSgguCd: "370701", area: 394.06, description: "포항 남부, 형산강변 농업지대", highlights: ["근교농업", "수산업"] },
  { id: "buk-gu-pohang", name: "북구", shortName: "북구", parentSigunguId: "pohang", sidoId: "gyeongbuk", sgisCode: "37012", hiraSgguCd: "370702", area: 736.69, description: "포항 북부, 산간 친환경 농업 지대", highlights: ["친환경", "산촌"] },

  // ========================================================================
  // 창원시 (5구) — 경상남도
  // ========================================================================
  { id: "uichang-gu", name: "의창구", shortName: "의창", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38111", hiraSgguCd: "380704", area: 204.26, description: "창원 중심부, 농업기술센터 소재 근교 농업 거점", highlights: ["근교농업", "기술센터"] },
  { id: "seongsan-gu", name: "성산구", shortName: "성산", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38112", hiraSgguCd: "380705", area: 89.11, description: "창원 동부, 산업도시 근교 도시농업", highlights: ["도시농업", "산업도시"] },
  { id: "masanhappo-gu", name: "마산합포구", shortName: "합포", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38113", hiraSgguCd: "380702", area: 241.22, description: "마산 남부, 해안 농수산물 직거래 허브", highlights: ["직거래", "해안농업"] },
  { id: "masanhoewon-gu", name: "마산회원구", shortName: "회원", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38114", hiraSgguCd: "380701", area: 90.61, description: "마산 북부, 내서 일대 근교 농업 지대", highlights: ["근교농업", "체험"] },
  { id: "jinhae-gu", name: "진해구", shortName: "진해", parentSigunguId: "changwon", sidoId: "gyeongnam", sgisCode: "38115", hiraSgguCd: "380703", area: 124.06, description: "진해만 인근 벚꽃·해안 농업 특화 지역", highlights: ["해안농업", "친환경"] },
];

/** 구 — 주요 작물·'정착 인기'는 원천 생성본에서 붙인다(구는 KOSIS 귀농 표에 없어 '정착 인기'가 붙지 않는다) */
export const GUS: GuDistrict[] = GU_ROWS.map((g) => ({
  ...g,
  highlights: getEnrichedHighlights(g.sgisCode, g.highlights),
  mainCrops: (GU_MAIN_CROPS[g.id] ?? []).map((e) => e.crop),
}));

// ---------------------------------------------------------------------------
// 유틸리티 함수
// ---------------------------------------------------------------------------

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
const CITIES_WITH_GU = new Set(GUS.map((g) => g.parentSigunguId));

/** 특정 시군구가 구 분할 시인지 확인 */
export function hasGuDistricts(sigunguId: string): boolean {
  return CITIES_WITH_GU.has(sigunguId);
}

/**
 * 법정동만으로 구를 정할 수 없는 학교(교육부 학교 코드 SD_SCHUL_CODE → 구 id) — 10/7 통계청 주소 좌표 변환으로 확인.
 * - 상세 주소에 법정동이 없음: 송내초(부천 상동) · 방교초·왕배초(화성 동탄구) · 청연초(화성 효행구)
 * - 두 구에 걸친 법정동 능동: 능동중·능동초·푸른중·푸른초·한마음초 — 모두 동탄3동 쪽(동탄구)
 * 새 학교가 어느 구에도 배정되지 않거나 두 구에 배정되면 주간 정합성 대조(scripts/check-region-stats-integrity.ts)가
 * 그날의 교육부 목록에 이 판정을 그대로 돌려 '구 배정' 문제로 잡는다(0 허용 — 10/7 독립 QA 뒤, 그 전엔 ±2 가 묻었다).
 */
export const SCHOOL_GU_OVERRIDES: Readonly<Record<string, string>> = {
  "7581086": "wonmi-gu", // 송내초등학교 — 상동
  "7679366": "dongtan-gu", // 방교초등학교
  "7679367": "dongtan-gu", // 왕배초등학교
  "7679516": "hyohaeng-gu", // 청연초등학교
  "7679103": "dongtan-gu", // 능동중학교
  "7679018": "dongtan-gu", // 능동초등학교
  "7679123": "dongtan-gu", // 푸른중학교
  "7679061": "dongtan-gu", // 푸른초등학교
  "7679063": "dongtan-gu", // 한마음초등학교
};

/** 같은 시의 구 전부 */
export function getGusOfCity(sidoId: string, parentSigunguId: string): GuDistrict[] {
  return GUS.filter((g) => g.sidoId === sidoId && g.parentSigunguId === parentSigunguId);
}

