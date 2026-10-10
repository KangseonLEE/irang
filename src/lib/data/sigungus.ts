import {
  GU_MAIN_CROPS,
  MAIN_CROP_RULE,
  MAIN_CROPS_SKEWED_PROVINCES,
  SIGUNGU_MAIN_CROPS,
  type MainCropEntry,
} from "./sigungu-main-crops";
import { getEnrichedHighlights } from "./popular-tags";

/**
 * 시/군/구 단위 지역 데이터
 * - 17개 시·도 하위 시·군·구 — 2026-07-01 인천 행정체제 개편·2023-07-01 군위 대구 편입 반영
 * - 귀농 상세 페이지(군/구 드릴다운)에서 사용
 */

export interface Sigungu {
  /** URL slug (예: "yeongju") */
  id: string;
  /** 정식 명칭 (예: "영주시") */
  name: string;
  /** 약칭 (예: "영주") */
  shortName: string;
  /** 소속 시/도 ID (Province.id 참조) */
  sidoId: string;
  /**
   * KOSIS 귀농어·귀촌인 통계 지역 코드 (5자리, 옛 행정구역분류 체계 — 군 = 3xx, 예: 순천 36030).
   * 자치구는 그 표에 없다. 10/7 전수 대조: 15곳이 한 칸씩 밀려 서천 화면에 부여 수치가 나가는 등 이웃 군 값이
   * 표시됐다 — 코드는 KOSIS 응답 지역명으로 확인하고(isSameRegionName), 이름이 다르면 화면에 쓰지 않는다.
   */
  admCode: string;
  /** SGIS 시군구 코드 — SGIS 에 아직 없는 신설 구는 임시 코드(region-composites.ts, 행정동 합산) */
  sgisCode: string;
  /** HIRA 시군구 코드 (건강보험심사평가원 자체 체계) */
  hiraSgguCd: string;
  /** 한 줄 소개 */
  description: string;
  /**
   * 핵심 키워드 (2~3개). '정착 인기'는 손으로 달지 않는다 — 아래 SIGUNGUS 가 popular-tags.ts(KOSIS 귀농 비율 상위 25%)로
   * 붙인다(10/10: 손 라벨 14곳 중 13곳이 기준 밖인데 사이드 칩·검색 패널·JSON-LD 에 그대로 나가 같은 화면 hero 와 어긋났다).
   */
  highlights: string[];
  /**
   * 주요 작물 — 2025 농림어업총조사 재배면적 큰 순(sigungu-main-crops.ts, scripts/collect-sigungu-main-crops.ts 생성).
   * CROPS.name 표기. 손으로 넣지 않는다 — 10/10 전 손 입력 600값은 작물별 주산지와 19%만 맞았다.
   * 빈 배열 = 근거 없음(서울 자치구·인천 신설 구·10ha 넘는 작물 없는 곳) — 화면은 '자료 없음'.
   */
  mainCrops: string[];
  /** 면적 (km², 소수점 2자리) — 국토교통부 지적통계 2025(KOSIS 116/DT_MLTM_2300) — scripts/collect-areas.ts, 그 해 통계에 없는 신설 구는 lib/data/cadastre-area.ts AREA_NOT_YET_IN_CADASTRE */
  area: number;
}

// ---------------------------------------------------------------------------
// 시/군/구 데이터 (시/도별 그룹)
// ---------------------------------------------------------------------------

const SIGUNGU_ROWS: Omit<Sigungu, "mainCrops">[] = [
  // ========================================================================
  // 서울특별시 (11)
  // ========================================================================
  { id: "jongno", name: "종로구", shortName: "종로", sidoId: "seoul", admCode: "11010", sgisCode: "11010", hiraSgguCd: "110016", description: "서울 도심의 도시농업 지역", highlights: ["도시농업", "도심 텃밭"], area: 23.91 },
  { id: "jung-gu-seoul", name: "중구", shortName: "중구", sidoId: "seoul", admCode: "11020", sgisCode: "11020", hiraSgguCd: "110017", description: "서울 중심부의 옥상 텃밭 특구", highlights: ["옥상농장", "도심"], area: 9.96 },
  { id: "yongsan", name: "용산구", shortName: "용산", sidoId: "seoul", admCode: "11030", sgisCode: "11030", hiraSgguCd: "110014", description: "도시 재생과 텃밭 문화의 접점", highlights: ["도시재생", "텃밭"], area: 21.87 },
  { id: "seongdong", name: "성동구", shortName: "성동", sidoId: "seoul", admCode: "11040", sgisCode: "11040", hiraSgguCd: "110011", description: "성수동 일대 도시농업 활성화 지역", highlights: ["도시농업", "로컬푸드"], area: 16.82 },
  { id: "gwangjin", name: "광진구", shortName: "광진", sidoId: "seoul", admCode: "11050", sgisCode: "11050", hiraSgguCd: "110023", description: "아차산 인근 자연친화 도시농업", highlights: ["체험농장", "도시농업"], area: 17.06 },
  { id: "dongdaemun", name: "동대문구", shortName: "동대문", sidoId: "seoul", admCode: "11060", sgisCode: "11060", hiraSgguCd: "110007", description: "주민 참여형 공동체 텃밭 운영", highlights: ["공동체텃밭", "교육"], area: 14.22 },
  { id: "jungnang", name: "중랑구", shortName: "중랑", sidoId: "seoul", admCode: "11070", sgisCode: "11070", hiraSgguCd: "110019", description: "중랑천변 도시농업 특화 지역", highlights: ["하천농업", "체험"], area: 18.5 },
  { id: "seongbuk", name: "성북구", shortName: "성북", sidoId: "seoul", admCode: "11080", sgisCode: "11080", hiraSgguCd: "110012", description: "북한산 자락 친환경 도시농업", highlights: ["친환경", "텃밭"], area: 24.59 },
  { id: "gangbuk", name: "강북구", shortName: "강북", sidoId: "seoul", admCode: "11090", sgisCode: "11090", hiraSgguCd: "110024", description: "북한산·도봉산 자락 자연친화 지역", highlights: ["자연친화", "도시농업"], area: 23.61 },
  { id: "dobong", name: "도봉구", shortName: "도봉", sidoId: "seoul", admCode: "11100", sgisCode: "11100", hiraSgguCd: "110006", description: "도봉산 인근 도시농업 교육 중심", highlights: ["농업교육", "체험"], area: 20.65 },
  { id: "nowon", name: "노원구", shortName: "노원", sidoId: "seoul", admCode: "11110", sgisCode: "11110", hiraSgguCd: "110022", description: "대규모 주민 텃밭 운영 지역", highlights: ["주민텃밭", "도시농업"], area: 35.46 },
  { id: "eunpyeong", name: "은평구", shortName: "은평", sidoId: "seoul", admCode: "11120", sgisCode: "11120", hiraSgguCd: "110015", description: "진관동 일대 농촌 체험 가능 지역", highlights: ["농촌체험", "친환경"], area: 29.71 },
  { id: "seodaemun", name: "서대문구", shortName: "서대문", sidoId: "seoul", admCode: "11130", sgisCode: "11130", hiraSgguCd: "110010", description: "안산 자락 도시농업 활동 지역", highlights: ["도시농업", "교육"], area: 17.63 },
  { id: "mapo", name: "마포구", shortName: "마포", sidoId: "seoul", admCode: "11140", sgisCode: "11140", hiraSgguCd: "110009", description: "상암동 도시농업 허브 지역", highlights: ["도시농업", "로컬푸드"], area: 23.85 },
  { id: "yangcheon", name: "양천구", shortName: "양천", sidoId: "seoul", admCode: "11150", sgisCode: "11150", hiraSgguCd: "110020", description: "목동 일대 주민 참여 텃밭 운영", highlights: ["주민텃밭", "교육"], area: 17.41 },
  { id: "gangseo", name: "강서구", shortName: "강서", sidoId: "seoul", admCode: "11160", sgisCode: "11160", hiraSgguCd: "110003", description: "김포공항 인근 도시 근교 농업지대", highlights: ["근교농업", "도시농업"], area: 41.45 },
  { id: "guro", name: "구로구", shortName: "구로", sidoId: "seoul", admCode: "11170", sgisCode: "11170", hiraSgguCd: "110005", description: "항동 일대 도시농업 특구", highlights: ["도시농업", "체험"], area: 20.12 },
  { id: "geumcheon", name: "금천구", shortName: "금천", sidoId: "seoul", admCode: "11180", sgisCode: "11180", hiraSgguCd: "110025", description: "관악산 자락 친환경 농업 체험", highlights: ["친환경", "체험농장"], area: 13.02 },
  { id: "yeongdeungpo", name: "영등포구", shortName: "영등포", sidoId: "seoul", admCode: "11190", sgisCode: "11190", hiraSgguCd: "110013", description: "여의도 도시농업 시범 지역", highlights: ["도시농업", "시범사업"], area: 24.55 },
  { id: "dongjak", name: "동작구", shortName: "동작", sidoId: "seoul", admCode: "11200", sgisCode: "11200", hiraSgguCd: "110008", description: "보라매공원 인근 텃밭 문화 지역", highlights: ["텃밭문화", "도시농업"], area: 16.36 },
  { id: "gwanak", name: "관악구", shortName: "관악", sidoId: "seoul", admCode: "11210", sgisCode: "11210", hiraSgguCd: "110004", description: "관악산 자락 도시 텃밭 운영", highlights: ["도시텃밭", "교육"], area: 29.57 },
  { id: "seocho", name: "서초구", shortName: "서초", sidoId: "seoul", admCode: "11220", sgisCode: "11220", hiraSgguCd: "110021", description: "내곡동 일대 근교 농업 가능 지역", highlights: ["근교농업", "화훼"], area: 46.97 },
  { id: "gangnam", name: "강남구", shortName: "강남", sidoId: "seoul", admCode: "11230", sgisCode: "11230", hiraSgguCd: "110001", description: "세곡동 도시농업 체험 지역", highlights: ["도시농업", "체험"], area: 39.5 },
  { id: "songpa", name: "송파구", shortName: "송파", sidoId: "seoul", admCode: "11240", sgisCode: "11240", hiraSgguCd: "110018", description: "올림픽공원 인근 도시 텃밭 운영", highlights: ["도시텃밭", "교육"], area: 33.88 },
  { id: "gangdong", name: "강동구", shortName: "강동", sidoId: "seoul", admCode: "11250", sgisCode: "11250", hiraSgguCd: "110002", description: "강일·미사 일대 도시농업 지역", highlights: ["도시농업", "친환경"], area: 24.59 },

  // ========================================================================
  // 인천광역시 (incheon) (11) — 2026-07-01 행정체제 개편 반영(제물포·영종·서해·검단, region-composites.ts)
  // ========================================================================
  // 신설 4개 구(2026-07-01) — 코드: 국가데이터처 한국행정구역분류 2026.7.10판(SGIS 미반영 → region-composites.ts 행정동 합) ·
  // 심평원 응답 지역명 확인(10/7) · 면적: 구청 공식(제물포 22.4 · 영종 125.82 · 검단 60.2㎢), 서해는 구청 값이 개편 전 서구
  // 그대로라 지적통계 옛 서구 119.02㎢(국토교통부 2025) − 검단 60.2㎢ = 58.8㎢ · 설명·작물: 구청 누리집 근거만(제물포는 농업 근거 없음)
  { id: "jemulpo", name: "제물포구", shortName: "제물포", sidoId: "incheon", admCode: "23100", sgisCode: "23100", hiraSgguCd: "220010", description: "개항장·차이나타운이 있는 인천 원도심", highlights: ["원도심", "개항장"], area: 22.4 },
  { id: "yeongjong", name: "영종구", shortName: "영종", sidoId: "incheon", admCode: "23110", sgisCode: "23110", hiraSgguCd: "220009", description: "영종·용유 섬쌀과 호박고구마가 나는 섬 지역", highlights: ["섬농업", "섬쌀"], area: 125.82 },
  { id: "michuhol", name: "미추홀구", shortName: "미추홀", sidoId: "incheon", admCode: "23040", sgisCode: "23090", hiraSgguCd: "220001", description: "인천 구도심 도시 재생·농업 접목 지역", highlights: ["도시재생", "텃밭"], area: 24.85 },
  { id: "yeonsu", name: "연수구", shortName: "연수", sidoId: "incheon", admCode: "23050", sgisCode: "23040", hiraSgguCd: "220007", description: "송도국제도시가 있는 인천 남부 도심", highlights: ["도시농업"], area: 58.6 },
  { id: "namdong", name: "남동구", shortName: "남동", sidoId: "incheon", admCode: "23060", sgisCode: "23050", hiraSgguCd: "220006", description: "소래습지 인근 친환경 농업 지대", highlights: ["친환경", "근교농업"], area: 57.45 },
  { id: "bupyeong", name: "부평구", shortName: "부평", sidoId: "incheon", admCode: "23070", sgisCode: "23060", hiraSgguCd: "220003", description: "굴포천 일대 도시농업 활성화 지역", highlights: ["도시농업", "체험"], area: 32.01 },
  { id: "gyeyang", name: "계양구", shortName: "계양", sidoId: "incheon", admCode: "23080", sgisCode: "23070", hiraSgguCd: "220008", description: "계양산 자락 근교 농업 지대", highlights: ["근교농업", "친환경"], area: 45.56 },
  { id: "seohae", name: "서해구", shortName: "서해", sidoId: "incheon", admCode: "23120", sgisCode: "23120", hiraSgguCd: "220011", description: "청라·검암 일대 도시, 지역쌀 정서진미 생산", highlights: ["도시농업", "근교농업"], area: 58.8 },
  { id: "geomdan", name: "검단구", shortName: "검단", sidoId: "incheon", admCode: "23130", sgisCode: "23130", hiraSgguCd: "220012", description: "검단 신도시 곁 대곡·불로 들녘, 지역쌀 검단불로촌장수미 생산", highlights: ["근교농업", "신도시"], area: 60.2 },
  { id: "ganghwa", name: "강화군", shortName: "강화", sidoId: "incheon", admCode: "23310", sgisCode: "23510", hiraSgguCd: "220100", description: "인삼·순무 특산지가 있는 섬 지역", highlights: ["인삼", "순무", "섬농업"], area: 411.39 },
  { id: "ongjin", name: "옹진군", shortName: "옹진", sidoId: "incheon", admCode: "23320", sgisCode: "23520", hiraSgguCd: "220200", description: "섬 특화 농수산업, 백령도·연평도 포함", highlights: ["섬농업", "수산업"], area: 172.96 },

  // ========================================================================
  // 경기도 (31)
  // ========================================================================
  { id: "suwon", name: "수원시", shortName: "수원", sidoId: "gyeonggi", admCode: "31010", sgisCode: "31010", hiraSgguCd: "310604", description: "경기도청 소재지, 도시농업 지역", highlights: ["도시농업", "직거래"], area: 121.11 },
  { id: "seongnam", name: "성남시", shortName: "성남", sidoId: "gyeonggi", admCode: "31020", sgisCode: "31020", hiraSgguCd: "310403", description: "판교·분당 신도시가 있는 수도권 도시", highlights: ["판교", "신도시"], area: 141.63 },
  { id: "uijeongbu", name: "의정부시", shortName: "의정부", sidoId: "gyeonggi", admCode: "31030", sgisCode: "31030", hiraSgguCd: "310800", description: "수락산·도봉산 자락 근교 농업", highlights: ["근교농업", "체험"], area: 81.55 },
  { id: "anyang", name: "안양시", shortName: "안양", sidoId: "gyeonggi", admCode: "31040", sgisCode: "31040", hiraSgguCd: "310702", description: "관악산 인근 도시 텃밭 활성화", highlights: ["도시텃밭", "교육"], area: 58.5 },
  { id: "bucheon", name: "부천시", shortName: "부천", sidoId: "gyeonggi", admCode: "31050", sgisCode: "31050", hiraSgguCd: "310303", description: "도심 속 옥상농장·수직농장 시범 지역", highlights: ["수직농장", "도시농업"], area: 53.46 },
  { id: "gwangmyeong", name: "광명시", shortName: "광명", sidoId: "gyeonggi", admCode: "31060", sgisCode: "31060", hiraSgguCd: "310100", description: "도시재생 연계 공동체 텃밭 운영", highlights: ["공동체텃밭", "도시재생"], area: 38.52 },
  { id: "pyeongtaek", name: "평택시", shortName: "평택", sidoId: "gyeonggi", admCode: "31070", sgisCode: "31070", hiraSgguCd: "311200", description: "경기 남부 곡창지대, 쌀 주산지", highlights: ["쌀 주산지", "대규모 농업"], area: 458.58 },
  { id: "dongducheon", name: "동두천시", shortName: "동두천", sidoId: "gyeonggi", admCode: "31080", sgisCode: "31080", hiraSgguCd: "310200", description: "소요산 자락 친환경 농업 지역", highlights: ["친환경", "산촌"], area: 95.68 },
  { id: "ansan", name: "안산시", shortName: "안산", sidoId: "gyeonggi", admCode: "31090", sgisCode: "31090", hiraSgguCd: "311102", description: "대부도 포도·유기농 특화 지역", highlights: ["포도", "유기농"], area: 156.46 },
  { id: "goyang", name: "고양시", shortName: "고양", sidoId: "gyeonggi", admCode: "31100", sgisCode: "31100", hiraSgguCd: "311903", description: "일산 근교 화훼·원예 중심지", highlights: ["화훼", "원예"], area: 268.16 },
  { id: "gwacheon", name: "과천시", shortName: "과천", sidoId: "gyeonggi", admCode: "31110", sgisCode: "31110", hiraSgguCd: "310900", description: "청계산 자락 소규모 체험농장", highlights: ["체험농장", "친환경"], area: 35.87 },
  { id: "guri", name: "구리시", shortName: "구리", sidoId: "gyeonggi", admCode: "31120", sgisCode: "31120", hiraSgguCd: "311000", description: "왕숙천변 도시 근교 농업 지대", highlights: ["근교농업", "직거래"], area: 33.34 },
  { id: "namyangju", name: "남양주시", shortName: "남양주", sidoId: "gyeonggi", admCode: "31130", sgisCode: "31130", hiraSgguCd: "311500", description: "북한강변 유기농·친환경 농업 중심지", highlights: ["유기농", "친환경"], area: 458.12 },
  { id: "osan", name: "오산시", shortName: "오산", sidoId: "gyeonggi", admCode: "31140", sgisCode: "31140", hiraSgguCd: "311800", description: "경기 남부 소규모 근교 농업 도시", highlights: ["근교농업", "직거래"], area: 42.68 },
  { id: "siheung", name: "시흥시", shortName: "시흥", sidoId: "gyeonggi", admCode: "31150", sgisCode: "31150", hiraSgguCd: "311700", description: "시화호 인근 친환경 농업 전환 지역", highlights: ["친환경", "도시농업"], area: 139.95 },
  { id: "gunpo", name: "군포시", shortName: "군포", sidoId: "gyeonggi", admCode: "31160", sgisCode: "31160", hiraSgguCd: "311400", description: "수리산 자락 소규모 텃밭 운영", highlights: ["도시텃밭", "교육"], area: 36.42 },
  { id: "uiwang", name: "의왕시", shortName: "의왕", sidoId: "gyeonggi", admCode: "31170", sgisCode: "31170", hiraSgguCd: "311600", description: "백운호수 인근 친환경 농업 체험", highlights: ["친환경", "체험"], area: 54.02 },
  { id: "hanam", name: "하남시", shortName: "하남", sidoId: "gyeonggi", admCode: "31180", sgisCode: "31180", hiraSgguCd: "311300", description: "미사·감일 인근 도시 근교 농업", highlights: ["근교농업"], area: 92.99 },
  { id: "yongin", name: "용인시", shortName: "용인", sidoId: "gyeonggi", admCode: "31190", sgisCode: "31190", hiraSgguCd: "312003", description: "처인구 일대 대규모 농업지대, 딸기·배 명산지", highlights: ["딸기", "배"], area: 591.22 },
  { id: "paju", name: "파주시", shortName: "파주", sidoId: "gyeonggi", admCode: "31200", sgisCode: "31200", hiraSgguCd: "312200", description: "임진강변 유기농·장단콩 특산지", highlights: ["유기농", "장단콩"], area: 674.49 },
  { id: "icheon", name: "이천시", shortName: "이천", sidoId: "gyeonggi", admCode: "31210", sgisCode: "31210", hiraSgguCd: "312100", description: "이천 쌀·도자기의 고장", highlights: ["이천쌀", "복숭아"], area: 461.61 },
  { id: "anseong", name: "안성시", shortName: "안성", sidoId: "gyeonggi", admCode: "31220", sgisCode: "31220", hiraSgguCd: "312400", description: "안성맞춤 배·포도 산지, 전통 농업 도시", highlights: ["배", "포도", "전통농업"], area: 553.49 },
  { id: "gimpo", name: "김포시", shortName: "김포", sidoId: "gyeonggi", admCode: "31230", sgisCode: "31230", hiraSgguCd: "312300", description: "한강 하류 평야 쌀·인삼 재배지", highlights: ["쌀", "인삼"], area: 276.61 },
  { id: "hwaseong", name: "화성시", shortName: "화성", sidoId: "gyeonggi", admCode: "31240", sgisCode: "31240", hiraSgguCd: "312504", description: "경기에서 농가가 가장 많은 시(2025), 포도·쌀 재배", highlights: ["포도", "쌀", "대규모농업"], area: 706.5 }, // 지적통계 2025 = 화성특례시 「화성시 전체면적」 2026.4.30(706,498,320㎡) = 4개 구 합(gus.ts) — 10/7 전엔 688.28(옛 값)
  { id: "gwangju-gg", name: "광주시", shortName: "광주", sidoId: "gyeonggi", admCode: "31250", sgisCode: "31250", hiraSgguCd: "312600", description: "남한산성 자락 딸기·토마토 명산지", highlights: ["딸기", "토마토"], area: 430.99 },
  { id: "yangju", name: "양주시", shortName: "양주", sidoId: "gyeonggi", admCode: "31260", sgisCode: "31260", hiraSgguCd: "312700", description: "감악산 자락 친환경 농업 지역", highlights: ["친환경", "체험"], area: 310.51 },
  { id: "pocheon", name: "포천시", shortName: "포천", sidoId: "gyeonggi", admCode: "31270", sgisCode: "31270", hiraSgguCd: "312800", description: "산정호수 인근 약초·버섯 특화 지역", highlights: ["약초", "버섯"], area: 827.23 },
  { id: "yeoju", name: "여주시", shortName: "여주", sidoId: "gyeonggi", admCode: "31280", sgisCode: "31280", hiraSgguCd: "312900", description: "여주 쌀·고구마로 알려진 남한강 유역", highlights: ["여주쌀", "고구마"], area: 608.18 },
  { id: "yangpyeong", name: "양평군", shortName: "양평", sidoId: "gyeonggi", admCode: "31380", sgisCode: "31580", hiraSgguCd: "310009", description: "남한강·북한강이 만나는 수도권 동부 농촌", highlights: ["귀농1번지", "친환경", "유기농"], area: 878.02 },
  { id: "gapyeong", name: "가평군", shortName: "가평", sidoId: "gyeonggi", admCode: "31370", sgisCode: "31570", hiraSgguCd: "310001", description: "북한강변 잣·표고버섯 특산지, 관광 귀농 적합", highlights: ["잣", "버섯", "관광귀농"], area: 843.42 },
  { id: "yeoncheon", name: "연천군", shortName: "연천", sidoId: "gyeonggi", admCode: "31350", sgisCode: "31550", hiraSgguCd: "310011", description: "한탄강 현무암 토양 콩·율무 특산지", highlights: ["콩", "율무", "청정환경"], area: 678.38 },

  // ========================================================================
  // 강원도 (18)
  // ========================================================================
  { id: "chuncheon", name: "춘천시", shortName: "춘천", sidoId: "gangwon", admCode: "32010", sgisCode: "32010", hiraSgguCd: "320500", description: "강원도청 소재지, 근교 농업과 닭갈비의 고장", highlights: ["근교농업", "관광"], area: 1116.42 },
  { id: "wonju", name: "원주시", shortName: "원주", sidoId: "gangwon", admCode: "32020", sgisCode: "32020", hiraSgguCd: "320400", description: "치악산 자락 약초·옥수수 재배 중심지", highlights: ["약초", "한방"], area: 868.3 },
  { id: "gangneung", name: "강릉시", shortName: "강릉", sidoId: "gangwon", admCode: "32030", sgisCode: "32030", hiraSgguCd: "320100", description: "동해안 온난 기후, 커피·딸기 신규 작물 도전지", highlights: ["온난기후", "커피농장"], area: 1040.82 },
  { id: "donghae", name: "동해시", shortName: "동해", sidoId: "gangwon", admCode: "32040", sgisCode: "32040", hiraSgguCd: "320200", description: "동해안 소도시, 소규모 근교 농업", highlights: ["해양기후", "근교농업"], area: 180.34 },
  { id: "taebaek", name: "태백시", shortName: "태백", sidoId: "gangwon", admCode: "32050", sgisCode: "32050", hiraSgguCd: "320600", description: "고원 도시, 고랭지 채소 재배", highlights: ["고랭지", "청정"], area: 303.44 },
  { id: "sokcho", name: "속초시", shortName: "속초", sidoId: "gangwon", admCode: "32060", sgisCode: "32060", hiraSgguCd: "320300", description: "설악산 관광 연계 체험농장 유망 지역", highlights: ["관광연계", "체험농장"], area: 105.75 },
  { id: "samcheok", name: "삼척시", shortName: "삼척", sidoId: "gangwon", admCode: "32070", sgisCode: "32070", hiraSgguCd: "320700", description: "동해안 남부 산간 농업·임업 중심", highlights: ["산간농업", "임업"], area: 1187.84 },
  { id: "hongcheon", name: "홍천군", shortName: "홍천", sidoId: "gangwon", admCode: "32310", sgisCode: "32510", hiraSgguCd: "320013", description: "전국에서 면적이 가장 넓은 시·군(2025), 한우·잣 특산지", highlights: ["한우", "잣"], area: 1820.47 },
  { id: "hoengseong", name: "횡성군", shortName: "횡성", sidoId: "gangwon", admCode: "32320", sgisCode: "32520", hiraSgguCd: "320015", description: "횡성 한우의 본고장, 더덕·도라지 특산", highlights: ["한우", "더덕"], area: 997.99 },
  { id: "yeongwol", name: "영월군", shortName: "영월", sidoId: "gangwon", admCode: "32330", sgisCode: "32530", hiraSgguCd: "320006", description: "동강 청정 지역, 고추·약초 재배", highlights: ["청정환경", "고추"], area: 1127.92 },
  { id: "pyeongchang", name: "평창군", shortName: "평창", sidoId: "gangwon", admCode: "32340", sgisCode: "32540", hiraSgguCd: "320012", description: "고랭지 배추·감자의 본고장, 동계올림픽 개최지", highlights: ["고랭지", "배추", "감자"], area: 1464.19 },
  { id: "jeongseon", name: "정선군", shortName: "정선", sidoId: "gangwon", admCode: "32350", sgisCode: "32550", hiraSgguCd: "320009", description: "산간 오지 청정 약초·산나물 특산지", highlights: ["약초", "산나물"], area: 1219.79 },
  { id: "cheorwon", name: "철원군", shortName: "철원", sidoId: "gangwon", admCode: "32360", sgisCode: "32560", hiraSgguCd: "320010", description: "DMZ 청정 오대쌀 주산지", highlights: ["오대쌀", "DMZ청정"], area: 890.13 },
  { id: "hwacheon", name: "화천군", shortName: "화천", sidoId: "gangwon", admCode: "32370", sgisCode: "32570", hiraSgguCd: "320014", description: "파로호 인근 토마토·딸기 시설농업", highlights: ["시설농업", "청정"], area: 909.09 },
  { id: "yanggu", name: "양구군", shortName: "양구", sidoId: "gangwon", admCode: "32380", sgisCode: "32580", hiraSgguCd: "320004", description: "펀치볼 분지 시래기·고랭지 채소 특산", highlights: ["시래기", "고랭지"], area: 661.98 },
  { id: "inje", name: "인제군", shortName: "인제", sidoId: "gangwon", admCode: "32390", sgisCode: "32590", hiraSgguCd: "320008", description: "설악산·내린천 자연 속 임산물 재배", highlights: ["임산물", "청정"], area: 1646.2 },
  { id: "goseong-gw", name: "고성군", shortName: "고성", sidoId: "gangwon", admCode: "32400", sgisCode: "32600", hiraSgguCd: "320001", description: "동해안 최북단, 수산·농업 복합 지역", highlights: ["수산복합", "관광"], area: 660.8 },
  { id: "yangyang", name: "양양군", shortName: "양양", sidoId: "gangwon", admCode: "32410", sgisCode: "32610", hiraSgguCd: "320005", description: "송이버섯·양양송이 특산지, 서핑 관광 연계", highlights: ["송이버섯", "관광연계"], area: 629.77 },

  // ========================================================================
  // 충청북도 (chungbuk) (11)
  // ========================================================================
  { id: "cheongju", name: "청주시", shortName: "청주", sidoId: "chungbuk", admCode: "33010", sgisCode: "33010", hiraSgguCd: "330104", description: "충북도청 소재지, 도시 근교 농업·직거래 중심", highlights: ["근교농업", "직거래"], area: 940.92 },
  { id: "chungju", name: "충주시", shortName: "충주", sidoId: "chungbuk", admCode: "33020", sgisCode: "33020", hiraSgguCd: "330200", description: "충주 사과·포도 주산지, 수안보 온천 인근", highlights: ["사과", "포도"], area: 983.16 },
  { id: "jecheon", name: "제천시", shortName: "제천", sidoId: "chungbuk", admCode: "33030", sgisCode: "33030", hiraSgguCd: "330300", description: "한방 약초의 본고장, 약령시 전통", highlights: ["약초", "한방"], area: 882.4 },
  { id: "boeun", name: "보은군", shortName: "보은", sidoId: "chungbuk", admCode: "33320", sgisCode: "33520", hiraSgguCd: "330003", description: "속리산 자락 대추·황토 특산지", highlights: ["대추", "황토"], area: 584.33 },
  { id: "okcheon", name: "옥천군", shortName: "옥천", sidoId: "chungbuk", admCode: "33330", sgisCode: "33530", hiraSgguCd: "330005", description: "금강변 포도·복숭아 재배 지역", highlights: ["포도", "복숭아"], area: 537.39 },
  { id: "yeongdong", name: "영동군", shortName: "영동", sidoId: "chungbuk", admCode: "33340", sgisCode: "33540", hiraSgguCd: "330004", description: "포도 재배면적 전국 4위(2025), 감·와인 특구", highlights: ["포도", "와인"], area: 847.05 },
  { id: "jeungpyeong", name: "증평군", shortName: "증평", sidoId: "chungbuk", admCode: "33390", sgisCode: "33590", hiraSgguCd: "330011", description: "소규모 인삼·고추 재배 중심 농촌", highlights: ["인삼", "고추"], area: 81.8 },
  { id: "jincheon", name: "진천군", shortName: "진천", sidoId: "chungbuk", admCode: "33350", sgisCode: "33550", hiraSgguCd: "330009", description: "중부고속도로가 지나는 충북 중부 농촌", highlights: ["수도권접근"], area: 407.38 },
  { id: "goesan", name: "괴산군", shortName: "괴산", sidoId: "chungbuk", admCode: "33360", sgisCode: "33560", hiraSgguCd: "330001", description: "유기농 특구, 고추·미선나무 자생지", highlights: ["유기농특구", "고추"], area: 842.19 },
  { id: "eumseong", name: "음성군", shortName: "음성", sidoId: "chungbuk", admCode: "33370", sgisCode: "33570", hiraSgguCd: "330006", description: "고추·수박 주산지, 교통 요충지", highlights: ["고추", "수박"], area: 520.08 },
  { id: "danyang", name: "단양군", shortName: "단양", sidoId: "chungbuk", admCode: "33380", sgisCode: "33580", hiraSgguCd: "330002", description: "소백산 자락 마늘·약초 특산, 관광 연계", highlights: ["마늘", "약초", "관광"], area: 780 },

  // ========================================================================
  // 세종특별자치시 (sejong) (1)
  // ========================================================================
  { id: "sejong-si", name: "세종특별자치시", shortName: "세종", sidoId: "sejong", admCode: "29010", sgisCode: "29010", hiraSgguCd: "410000", description: "행정중심복합도시와 읍·면 농촌이 함께 있는 도농복합 지역", highlights: ["도농복합"], area: 464.99 },

  // ========================================================================
  // 대전광역시 (daejeon) (5)
  // ========================================================================
  { id: "dong-gu-daejeon", name: "동구", shortName: "동구", sidoId: "daejeon", admCode: "25010", sgisCode: "25010", hiraSgguCd: "250004", description: "대전 동부 산간 근교 농업 지역", highlights: ["근교농업", "체험"], area: 136.71 },
  { id: "jung-gu-daejeon", name: "중구", shortName: "중구", sidoId: "daejeon", admCode: "25020", sgisCode: "25020", hiraSgguCd: "250005", description: "대전 원도심의 도시농업 지역", highlights: ["도시농업", "직거래"], area: 62.21 },
  { id: "seo-gu-daejeon", name: "서구", shortName: "서구", sidoId: "daejeon", admCode: "25030", sgisCode: "25030", hiraSgguCd: "250003", description: "둔산 인근 주민 텃밭 운영", highlights: ["도시텃밭", "교육"], area: 95.53 },
  { id: "yuseong", name: "유성구", shortName: "유성", sidoId: "daejeon", admCode: "25040", sgisCode: "25040", hiraSgguCd: "250001", description: "대덕연구개발특구가 있는 대전 서북부", highlights: ["연구단지"], area: 176.65 },
  { id: "daedeok", name: "대덕구", shortName: "대덕", sidoId: "daejeon", admCode: "25050", sgisCode: "25050", hiraSgguCd: "250002", description: "금강변 근교 농업지대, 쌀·채소 재배", highlights: ["근교농업", "쌀"], area: 68.73 },

  // ========================================================================
  // 충청남도 (chungnam) (15)
  // ========================================================================
  { id: "cheonan", name: "천안시", shortName: "천안", sidoId: "chungnam", admCode: "34010", sgisCode: "34010", hiraSgguCd: "340202", description: "수도권 전철이 닿는 충남 북부, 호두·배 특산지", highlights: ["호두", "수도권접근"], area: 636.13 },
  { id: "gongju", name: "공주시", shortName: "공주", sidoId: "chungnam", admCode: "34020", sgisCode: "34020", hiraSgguCd: "340300", description: "밤·감 주산지, 백제문화 관광 연계", highlights: ["밤", "감", "관광"], area: 864.15 },
  { id: "boryeong", name: "보령시", shortName: "보령", sidoId: "chungnam", admCode: "34030", sgisCode: "34030", hiraSgguCd: "340400", description: "서해안 온난 기후, 머드축제 관광 도시", highlights: ["서해안", "관광"], area: 586.93 },
  { id: "asan", name: "아산시", shortName: "아산", sidoId: "chungnam", admCode: "34040", sgisCode: "34040", hiraSgguCd: "340500", description: "온양온천 인근, 배·국화 재배 중심", highlights: ["배", "국화"], area: 542.83 },
  { id: "seosan", name: "서산시", shortName: "서산", sidoId: "chungnam", admCode: "34050", sgisCode: "34050", hiraSgguCd: "340600", description: "서해안 간척지 쌀·마늘 대규모 농업", highlights: ["간척농업", "마늘"], area: 742.31 },
  { id: "nonsan", name: "논산시", shortName: "논산", sidoId: "chungnam", admCode: "34060", sgisCode: "34060", hiraSgguCd: "340700", description: "호남평야 접경, 딸기·인삼 명산지", highlights: ["딸기", "인삼"], area: 556.2 },
  { id: "gyeryong", name: "계룡시", shortName: "계룡", sidoId: "chungnam", admCode: "34070", sgisCode: "34070", hiraSgguCd: "340800", description: "계룡산 자락 소규모 친환경 농업", highlights: ["친환경", "소규모"], area: 60.7 },
  { id: "dangjin", name: "당진시", shortName: "당진", sidoId: "chungnam", admCode: "34080", sgisCode: "34080", hiraSgguCd: "340900", description: "서해안 간척 농업 대규모 쌀 생산지", highlights: ["간척농업", "쌀"], area: 705.63 },
  { id: "geumsan", name: "금산군", shortName: "금산", sidoId: "chungnam", admCode: "34310", sgisCode: "34510", hiraSgguCd: "340002", description: "인삼 재배면적 전국 1위(2025), 인삼 특구", highlights: ["인삼특구", "약초"], area: 577.33 },
  { id: "buyeo", name: "부여군", shortName: "부여", sidoId: "chungnam", admCode: "34330", sgisCode: "34530", hiraSgguCd: "340007", description: "백제 역사 도시, 수박·딸기 주산지", highlights: ["수박", "역사관광"], area: 624.54 },
  { id: "seocheon", name: "서천군", shortName: "서천", sidoId: "chungnam", admCode: "34340", sgisCode: "34540", hiraSgguCd: "340009", description: "금강 하류 갯벌 김·쌀 복합 농수산", highlights: ["김", "갯벌"], area: 366.47 },
  { id: "cheongyang", name: "청양군", shortName: "청양", sidoId: "chungnam", admCode: "34350", sgisCode: "34550", hiraSgguCd: "340014", description: "청양고추의 본고장, 구기자 특산", highlights: ["고추", "구기자"], area: 479.29 },
  { id: "hongseong", name: "홍성군", shortName: "홍성", sidoId: "chungnam", admCode: "34360", sgisCode: "34560", hiraSgguCd: "340015", description: "홍성 한우·새조개로 알려진 충남 서부", highlights: ["한우"], area: 446.85 },
  { id: "yesan", name: "예산군", shortName: "예산", sidoId: "chungnam", admCode: "34370", sgisCode: "34570", hiraSgguCd: "340012", description: "예산 사과·배 산지, 덕산온천 관광 연계", highlights: ["사과", "배"], area: 542.73 },
  { id: "taean", name: "태안군", shortName: "태안", sidoId: "chungnam", admCode: "34380", sgisCode: "34580", hiraSgguCd: "340016", description: "서해안 해수욕장과 육쪽마늘 특산지", highlights: ["육쪽마늘", "해양관광"], area: 516.06 },

  // ========================================================================
  // 전라북도 (jeonbuk) (14)
  // ========================================================================
  { id: "jeonju", name: "전주시", shortName: "전주", sidoId: "jeonbuk", admCode: "35010", sgisCode: "35010", hiraSgguCd: "350402", description: "한옥마을 관광도시, 비빔밥 로컬푸드 허브", highlights: ["로컬푸드", "한식"], area: 205.97 },
  { id: "gunsan", name: "군산시", shortName: "군산", sidoId: "jeonbuk", admCode: "35020", sgisCode: "35020", hiraSgguCd: "350100", description: "새만금 간척지 대규모 농업 신도시", highlights: ["새만금", "간척농업"], area: 400.69 },
  { id: "iksan", name: "익산시", shortName: "익산", sidoId: "jeonbuk", admCode: "35030", sgisCode: "35030", hiraSgguCd: "350300", description: "호남평야 곡창지대, 쌀·보석 도시", highlights: ["곡창지대", "쌀"], area: 506.59 },
  { id: "jeongeup", name: "정읍시", shortName: "정읍", sidoId: "jeonbuk", admCode: "35040", sgisCode: "35040", hiraSgguCd: "350500", description: "내장산 단풍 관광, 쌀·잡곡 주산지", highlights: ["내장산", "쌀"], area: 693.34 },
  { id: "namwon", name: "남원시", shortName: "남원", sidoId: "jeonbuk", admCode: "35050", sgisCode: "35050", hiraSgguCd: "350200", description: "지리산 자락 허브·약초 재배, 춘향전 관광", highlights: ["약초", "지리산"], area: 752.19 },
  { id: "gimje", name: "김제시", shortName: "김제", sidoId: "jeonbuk", admCode: "35060", sgisCode: "35060", hiraSgguCd: "350600", description: "김제평야·벽골제, 쌀 재배면적 전국 5위(2025)", highlights: ["쌀평야", "벽골제"], area: 547.41 },
  { id: "wanju", name: "완주군", shortName: "완주", sidoId: "jeonbuk", admCode: "35310", sgisCode: "35510", hiraSgguCd: "350008", description: "전주를 둘러싼 근교 농업지대", highlights: ["로컬푸드"], area: 821.39 },
  { id: "jinan", name: "진안군", shortName: "진안", sidoId: "jeonbuk", admCode: "35320", sgisCode: "35520", hiraSgguCd: "350013", description: "마이산 고원 홍삼·인삼 특산지", highlights: ["홍삼", "고원농업"], area: 789.12 },
  { id: "muju", name: "무주군", shortName: "무주", sidoId: "jeonbuk", admCode: "35330", sgisCode: "35530", hiraSgguCd: "350004", description: "덕유산 청정 사과·반딧불이 마을", highlights: ["사과", "청정"], area: 632.06 },
  { id: "jangsu", name: "장수군", shortName: "장수", sidoId: "jeonbuk", admCode: "35340", sgisCode: "35540", hiraSgguCd: "350011", description: "고랭지 사과·한우 명산지", highlights: ["사과", "한우"], area: 533.13 },
  { id: "imsil", name: "임실군", shortName: "임실", sidoId: "jeonbuk", admCode: "35350", sgisCode: "35550", hiraSgguCd: "350010", description: "임실치즈로 알려진 낙농 지역", highlights: ["치즈", "낙농"], area: 597.17 },
  { id: "sunchang", name: "순창군", shortName: "순창", sidoId: "jeonbuk", admCode: "35360", sgisCode: "35560", hiraSgguCd: "350006", description: "전통 고추장의 고장, 발효식품 특구", highlights: ["고추장", "발효식품"], area: 495.96 },
  { id: "gochang", name: "고창군", shortName: "고창", sidoId: "jeonbuk", admCode: "35370", sgisCode: "35570", hiraSgguCd: "350001", description: "복분자·수박·풍천장어 특산, 유네스코 생물권", highlights: ["복분자", "수박"], area: 607.45 },
  { id: "buan", name: "부안군", shortName: "부안", sidoId: "jeonbuk", admCode: "35380", sgisCode: "35580", hiraSgguCd: "350005", description: "변산반도 서해안 농수산 복합 지역", highlights: ["서해안", "농수산"], area: 495.17 },

  // ========================================================================
  // 광주광역시 (gwangju) (5)
  // ========================================================================
  { id: "dong-gu-gwangju", name: "동구", shortName: "동구", sidoId: "gwangju", admCode: "24010", sgisCode: "24010", hiraSgguCd: "360801", description: "광주 도심 문화·예술 중심 지역", highlights: ["문화예술", "도심"], area: 49.32 },
  { id: "seo-gu-gwangju", name: "서구", shortName: "서구", sidoId: "gwangju", admCode: "24020", sgisCode: "24020", hiraSgguCd: "360803", description: "광주 서부 도시농업 활성화 지역", highlights: ["도시농업", "직거래"], area: 47.73 },
  { id: "nam-gu-gwangju", name: "남구", shortName: "남구", sidoId: "gwangju", admCode: "24030", sgisCode: "24030", hiraSgguCd: "360805", description: "양림동 도시재생 연계 텃밭 운영", highlights: ["도시재생", "텃밭"], area: 60.95 },
  { id: "buk-gu-gwangju", name: "북구", shortName: "북구", sidoId: "gwangju", admCode: "24040", sgisCode: "24040", hiraSgguCd: "360802", description: "무등산 자락 근교 농업·딸기 재배", highlights: ["근교농업", "딸기"], area: 120.26 },
  { id: "gwangsan", name: "광산구", shortName: "광산", sidoId: "gwangju", admCode: "24050", sgisCode: "24050", hiraSgguCd: "360804", description: "광주에서 농가가 가장 많은 구(2025), 쌀·무 재배", highlights: ["농업지대", "쌀"], area: 222.68 },

  // ========================================================================
  // 전라남도 (jeonnam) (22)
  // ========================================================================
  { id: "mokpo", name: "목포시", shortName: "목포", sidoId: "jeonnam", admCode: "36010", sgisCode: "36010", hiraSgguCd: "360300", description: "서남해안 항구도시, 수산·근교 농업", highlights: ["항구도시", "수산"], area: 52.21 },
  { id: "yeosu", name: "여수시", shortName: "여수", sidoId: "jeonnam", admCode: "36020", sgisCode: "36020", hiraSgguCd: "360500", description: "한려수도 관광도시, 돌산갓김치 특산", highlights: ["관광", "갓김치"], area: 512.46 },
  { id: "suncheon", name: "순천시", shortName: "순천", sidoId: "jeonnam", admCode: "36030", sgisCode: "36030", hiraSgguCd: "360400", description: "순천만 습지가 있는 생태도시", highlights: ["생태도시", "농촌 정착 지원"], area: 910.96 },
  { id: "naju", name: "나주시", shortName: "나주", sidoId: "jeonnam", admCode: "36040", sgisCode: "36040", hiraSgguCd: "360200", description: "나주배·나주평야 쌀의 본고장", highlights: ["나주배", "쌀"], area: 608.54 },
  { id: "gwangyang", name: "광양시", shortName: "광양", sidoId: "jeonnam", admCode: "36060", sgisCode: "36060", hiraSgguCd: "360700", description: "광양 매화마을, 매실·고추 특산지", highlights: ["매실", "매화마을"], area: 464.81 },
  { id: "damyang", name: "담양군", shortName: "담양", sidoId: "jeonnam", admCode: "36310", sgisCode: "36510", hiraSgguCd: "360008", description: "대나무의 고장, 딸기·쌀 명산지", highlights: ["대나무", "딸기"], area: 455.07 },
  { id: "gokseong", name: "곡성군", shortName: "곡성", sidoId: "jeonnam", admCode: "36320", sgisCode: "36520", hiraSgguCd: "360003", description: "섬진강 기차마을, 토란·멜론 특산", highlights: ["토란", "멜론"], area: 547.34 },
  { id: "gurye", name: "구례군", shortName: "구례", sidoId: "jeonnam", admCode: "36330", sgisCode: "36530", hiraSgguCd: "360006", description: "지리산 자락 산수유·매실 마을", highlights: ["산수유", "매실"], area: 442.96 },
  { id: "goheung", name: "고흥군", shortName: "고흥", sidoId: "jeonnam", admCode: "36350", sgisCode: "36550", hiraSgguCd: "360002", description: "남해안 유자·석류 특산, 나로우주센터", highlights: ["유자", "석류"], area: 807.19 },
  { id: "boseong", name: "보성군", shortName: "보성", sidoId: "jeonnam", admCode: "36360", sgisCode: "36560", hiraSgguCd: "360010", description: "보성녹차의 본고장, 벌교꼬막 특산", highlights: ["녹차", "꼬막"], area: 664.7 },
  { id: "hwasun", name: "화순군", shortName: "화순", sidoId: "jeonnam", admCode: "36370", sgisCode: "36570", hiraSgguCd: "360022", description: "무등산 자락 국화·고인돌 유적지", highlights: ["국화", "온천"], area: 787.21 },
  { id: "jangheung", name: "장흥군", shortName: "장흥", sidoId: "jeonnam", admCode: "36380", sgisCode: "36580", hiraSgguCd: "360018", description: "정남진 표고버섯·한우 명산지", highlights: ["표고버섯", "한우"], area: 622.4 },
  { id: "gangjin", name: "강진군", shortName: "강진", sidoId: "jeonnam", admCode: "36390", sgisCode: "36590", hiraSgguCd: "360001", description: "다산 정약용 유배지, 딸기·배 특산", highlights: ["딸기", "청자"], area: 500.88 },
  { id: "haenam", name: "해남군", shortName: "해남", sidoId: "jeonnam", admCode: "36400", sgisCode: "36600", hiraSgguCd: "360021", description: "한반도 최남단 땅끝마을, 고구마·배추 대산지", highlights: ["고구마", "배추", "땅끝"], area: 1045.15 },
  { id: "yeongam", name: "영암군", shortName: "영암", sidoId: "jeonnam", admCode: "36410", sgisCode: "36610", hiraSgguCd: "360015", description: "월출산 무화과·쌀 특산지", highlights: ["무화과", "쌀"], area: 612.4 },
  { id: "muan", name: "무안군", shortName: "무안", sidoId: "jeonnam", admCode: "36420", sgisCode: "36620", hiraSgguCd: "360009", description: "전남도청 소재지, 양파·백련 특산", highlights: ["양파", "백련"], area: 451.78 },
  { id: "hampyeong", name: "함평군", shortName: "함평", sidoId: "jeonnam", admCode: "36430", sgisCode: "36630", hiraSgguCd: "360020", description: "나비축제·한우 명산지, 청정 농업", highlights: ["한우", "나비축제"], area: 392.07 },
  { id: "yeonggwang", name: "영광군", shortName: "영광", sidoId: "jeonnam", admCode: "36440", sgisCode: "36640", hiraSgguCd: "360014", description: "영광굴비의 본고장, 모싯잎송편 특산", highlights: ["굴비", "모싯잎"], area: 474.59 },
  { id: "jangseong", name: "장성군", shortName: "장성", sidoId: "jeonnam", admCode: "36450", sgisCode: "36650", hiraSgguCd: "360017", description: "백양사 단풍 명소, 딸기·배 재배", highlights: ["딸기", "배"], area: 518.29 },
  { id: "wando", name: "완도군", shortName: "완도", sidoId: "jeonnam", admCode: "36460", sgisCode: "36660", hiraSgguCd: "360016", description: "다도해 해역의 전복·김 양식 지역", highlights: ["전복", "김양식"], area: 396.88 },
  { id: "jindo", name: "진도군", shortName: "진도", sidoId: "jeonnam", admCode: "36470", sgisCode: "36670", hiraSgguCd: "360019", description: "진도대교·바다갈림 명소, 흑미·구기자 특산", highlights: ["흑미", "구기자"], area: 440.1 },
  { id: "sinan", name: "신안군", shortName: "신안", sidoId: "jeonnam", admCode: "36480", sgisCode: "36680", hiraSgguCd: "360012", description: "1004개 섬의 보물섬, 천일염·시금치 특산", highlights: ["천일염", "섬농업"], area: 656.29 },

  // ========================================================================
  // 부산광역시 (busan) (16)
  // ========================================================================
  { id: "jung-gu-busan", name: "중구", shortName: "중구", sidoId: "busan", admCode: "21010", sgisCode: "21010", hiraSgguCd: "210008", description: "부산 도심, BIFF광장 인근 도시농업", highlights: ["도심", "도시농업"], area: 3.05 },
  { id: "seo-gu-busan", name: "서구", shortName: "서구", sidoId: "busan", admCode: "21020", sgisCode: "21020", hiraSgguCd: "210006", description: "아미동 일대 도시재생 텃밭 운영", highlights: ["도시재생", "텃밭"], area: 13.98 },
  { id: "dong-gu-busan", name: "동구", shortName: "동구", sidoId: "busan", admCode: "21030", sgisCode: "21030", hiraSgguCd: "210002", description: "부산항 인근 소규모 도시농업", highlights: ["도시농업", "도심"], area: 10.12 },
  { id: "yeongdo", name: "영도구", shortName: "영도", sidoId: "busan", admCode: "21040", sgisCode: "21040", hiraSgguCd: "210007", description: "태종대 인근 해양 기후 도시농업", highlights: ["해양기후", "도시농업"], area: 14.2 },
  { id: "busanjin", name: "부산진구", shortName: "부산진", sidoId: "busan", admCode: "21050", sgisCode: "21050", hiraSgguCd: "210004", description: "서면 도심 속 주민 텃밭 운영", highlights: ["도심텃밭", "교육"], area: 29.67 },
  { id: "dongnae", name: "동래구", shortName: "동래", sidoId: "busan", admCode: "21060", sgisCode: "21060", hiraSgguCd: "210003", description: "금정산 자락 도시 근교 농업", highlights: ["근교농업", "온천"], area: 16.63 },
  { id: "nam-gu-busan", name: "남구", shortName: "남구", sidoId: "busan", admCode: "21070", sgisCode: "21070", hiraSgguCd: "210001", description: "용호동 일대 소규모 텃밭 운영", highlights: ["텃밭", "도시농업"], area: 26.82 },
  { id: "buk-gu-busan", name: "북구", shortName: "북구", sidoId: "busan", admCode: "21080", sgisCode: "21080", hiraSgguCd: "210005", description: "금곡동 근교 농업지대", highlights: ["근교농업", "직거래"], area: 39.37 },
  { id: "haeundae", name: "해운대구", shortName: "해운대", sidoId: "busan", admCode: "21090", sgisCode: "21090", hiraSgguCd: "210009", description: "해운대 관광지 인근 도시농업", highlights: ["관광", "도시농업"], area: 51.56 },
  { id: "saha", name: "사하구", shortName: "사하", sidoId: "busan", admCode: "21100", sgisCode: "21100", hiraSgguCd: "210010", description: "감천문화마을 인근 도시재생 텃밭", highlights: ["도시재생", "문화"], area: 41.79 },
  { id: "geumjeong", name: "금정구", shortName: "금정", sidoId: "busan", admCode: "21110", sgisCode: "21110", hiraSgguCd: "210011", description: "금정산성 막걸리 마을, 근교 농업", highlights: ["막걸리", "근교농업"], area: 65.28 },
  { id: "gangseo-busan", name: "강서구", shortName: "강서", sidoId: "busan", admCode: "21120", sgisCode: "21120", hiraSgguCd: "210012", description: "낙동강 하구 대저토마토·대파 특산지", highlights: ["대저토마토", "대파"], area: 182.42 },
  { id: "yeonje", name: "연제구", shortName: "연제", sidoId: "busan", admCode: "21130", sgisCode: "21130", hiraSgguCd: "210013", description: "부산시청 인근 도시텃밭 시범지역", highlights: ["도시텃밭", "시범"], area: 12.11 },
  { id: "suyeong", name: "수영구", shortName: "수영", sidoId: "busan", admCode: "21140", sgisCode: "21140", hiraSgguCd: "210014", description: "광안리 해변 인근 소규모 도시농업", highlights: ["해변", "도시농업"], area: 10.22 },
  { id: "sasang", name: "사상구", shortName: "사상", sidoId: "busan", admCode: "21150", sgisCode: "21150", hiraSgguCd: "210015", description: "낙동강변 근교 농업·산업 복합 지역", highlights: ["근교농업", "산업"], area: 36.1 },
  { id: "gijang", name: "기장군", shortName: "기장", sidoId: "busan", admCode: "21310", sgisCode: "21510", hiraSgguCd: "210100", description: "기장 미역·다시마 특산, 농수산 복합", highlights: ["미역", "농수산"], area: 218.36 },

  // ========================================================================
  // 대구광역시 (daegu) (9) — 군위군 2023-07-01 경북에서 편입
  // ========================================================================
  { id: "jung-gu-daegu", name: "중구", shortName: "중구", sidoId: "daegu", admCode: "22010", sgisCode: "22010", hiraSgguCd: "230006", description: "대구 도심 약령시 한방 특구", highlights: ["한방특구", "도심"], area: 7.06 },
  { id: "dong-gu-daegu", name: "동구", shortName: "동구", sidoId: "daegu", admCode: "22020", sgisCode: "22020", hiraSgguCd: "230002", description: "팔공산 자락 사과·포도 과수원 지대", highlights: ["사과", "포도"], area: 182.11 },
  { id: "seo-gu-daegu", name: "서구", shortName: "서구", sidoId: "daegu", admCode: "22030", sgisCode: "22030", hiraSgguCd: "230004", description: "대구 서부 주민 참여 텃밭 운영", highlights: ["주민텃밭", "교육"], area: 17.31 },
  { id: "nam-gu-daegu", name: "남구", shortName: "남구", sidoId: "daegu", admCode: "22040", sgisCode: "22040", hiraSgguCd: "230001", description: "앞산 자락 소규모 도시농업", highlights: ["도시농업", "체험"], area: 17.43 },
  { id: "buk-gu-daegu", name: "북구", shortName: "북구", sidoId: "daegu", admCode: "22050", sgisCode: "22050", hiraSgguCd: "230003", description: "칠곡 일대 근교 채소·과수 재배", highlights: ["근교농업", "채소"], area: 93.96 },
  { id: "suseong", name: "수성구", shortName: "수성", sidoId: "daegu", admCode: "22060", sgisCode: "22060", hiraSgguCd: "230005", description: "수성못 인근 도시농업 체험 지역", highlights: ["도시농업", "체험"], area: 76.54 },
  { id: "dalseo", name: "달서구", shortName: "달서", sidoId: "daegu", admCode: "22070", sgisCode: "22070", hiraSgguCd: "230007", description: "월배 일대 도시 텃밭·직거래 활성화", highlights: ["도시텃밭", "직거래"], area: 62.37 },
  { id: "dalseong", name: "달성군", shortName: "달성", sidoId: "daegu", admCode: "22310", sgisCode: "22510", hiraSgguCd: "230100", description: "비슬산 자락 딸기·수박 대규모 재배지", highlights: ["딸기", "수박"], area: 428.54 },
  { id: "gunwi", name: "군위군", shortName: "군위", sidoId: "daegu", admCode: "22320", sgisCode: "22520", hiraSgguCd: "230200", description: "삼국유사의 고장, 사과·대추 재배", highlights: ["사과", "대추"], area: 614.37 },

  // ========================================================================
  // 울산광역시 (ulsan) (5)
  // ========================================================================
  { id: "jung-gu-ulsan", name: "중구", shortName: "중구", sidoId: "ulsan", admCode: "26010", sgisCode: "26010", hiraSgguCd: "260003", description: "울산 도심 도시농업 시범 지역", highlights: ["도시농업", "도심"], area: 37.01 },
  { id: "nam-gu-ulsan", name: "남구", shortName: "남구", sidoId: "ulsan", admCode: "26020", sgisCode: "26020", hiraSgguCd: "260001", description: "태화강 인근 도시 텃밭 운영", highlights: ["도시텃밭", "태화강"], area: 74.08 },
  { id: "dong-gu-ulsan", name: "동구", shortName: "동구", sidoId: "ulsan", admCode: "26030", sgisCode: "26030", hiraSgguCd: "260002", description: "동해안 해양 기후 소규모 농업", highlights: ["해양기후", "소규모"], area: 36.08 },
  { id: "buk-gu-ulsan", name: "북구", shortName: "북구", sidoId: "ulsan", admCode: "26040", sgisCode: "26040", hiraSgguCd: "260004", description: "농소·강동 근교 배 재배 지역", highlights: ["배", "근교농업"], area: 157.36 },
  { id: "ulju", name: "울주군", shortName: "울주", sidoId: "ulsan", admCode: "26310", sgisCode: "26510", hiraSgguCd: "260100", description: "배 재배면적 전국 6위(2025), 울산 서부 농업지대", highlights: ["배", "단감"], area: 758.38 },

  // ========================================================================
  // 경상북도 (gyeongbuk) (22)
  // ========================================================================
  { id: "pohang", name: "포항시", shortName: "포항", sidoId: "gyeongbuk", admCode: "37010", sgisCode: "37010", hiraSgguCd: "370702", description: "동해안 과메기·대게 도시, 근교 농업", highlights: ["과메기", "근교농업"], area: 1130.75 },
  { id: "gyeongju", name: "경주시", shortName: "경주", sidoId: "gyeongbuk", admCode: "37020", sgisCode: "37020", hiraSgguCd: "370100", description: "천년고도 벚꽃·한우 명산지", highlights: ["한우", "역사관광"], area: 1324.99 },
  { id: "gimcheon", name: "김천시", shortName: "김천", sidoId: "gyeongbuk", admCode: "37030", sgisCode: "37030", hiraSgguCd: "370300", description: "포도·자두 과수 명산지, 교통 요충지", highlights: ["포도", "자두"], area: 1010.05 },
  { id: "andong", name: "안동시", shortName: "안동", sidoId: "gyeongbuk", admCode: "37040", sgisCode: "37040", hiraSgguCd: "370400", description: "한국 정신문화의 수도, 사과·고추·간고등어", highlights: ["사과", "고추", "전통문화"], area: 1522.33 },
  { id: "gumi", name: "구미시", shortName: "구미", sidoId: "gyeongbuk", admCode: "37050", sgisCode: "37050", hiraSgguCd: "370200", description: "산업도시 근교 농업, 낙동강변 과수원", highlights: ["근교농업", "산업도시"], area: 615.63 },
  { id: "yeongju", name: "영주시", shortName: "영주", sidoId: "gyeongbuk", admCode: "37060", sgisCode: "37060", hiraSgguCd: "370500", description: "소백산 자락 인삼·사과의 본고장, 풍기인삼", highlights: ["인삼", "사과"], area: 670.15 },
  { id: "yeongcheon", name: "영천시", shortName: "영천", sidoId: "gyeongbuk", admCode: "37070", sgisCode: "37070", hiraSgguCd: "370600", description: "포도·복숭아 과수 중심지", highlights: ["포도", "복숭아"], area: 919.24 },
  { id: "sangju", name: "상주시", shortName: "상주", sidoId: "gyeongbuk", admCode: "37080", sgisCode: "37080", hiraSgguCd: "370900", description: "삼백의 고장(쌀·누에·감), 자전거 도시", highlights: ["감", "쌀", "자전거"], area: 1254.69 },
  { id: "mungyeong", name: "문경시", shortName: "문경", sidoId: "gyeongbuk", admCode: "37090", sgisCode: "37090", hiraSgguCd: "370800", description: "문경새재 오미자·사과 특산, 도자기 마을", highlights: ["오미자", "사과"], area: 912.09 },
  { id: "gyeongsan", name: "경산시", shortName: "경산", sidoId: "gyeongbuk", admCode: "37100", sgisCode: "37100", hiraSgguCd: "371000", description: "대구 배후도시, 대추·포도 재배", highlights: ["대추", "포도"], area: 411.88 },
  { id: "uiseong", name: "의성군", shortName: "의성", sidoId: "gyeongbuk", admCode: "37320", sgisCode: "37520", hiraSgguCd: "370021", description: "의성마늘의 본고장, 사과·고추 주산지", highlights: ["마늘", "사과"], area: 1174.57 },
  { id: "cheongsong", name: "청송군", shortName: "청송", sidoId: "gyeongbuk", admCode: "37330", sgisCode: "37530", hiraSgguCd: "370023", description: "주왕산 자락 청송사과 브랜드", highlights: ["사과", "청정"], area: 846.24 },
  { id: "yeongyang", name: "영양군", shortName: "영양", sidoId: "gyeongbuk", admCode: "37340", sgisCode: "37540", hiraSgguCd: "370013", description: "영양고추의 본고장, 청정 산간 농업", highlights: ["고추", "청정"], area: 815.86 },
  { id: "yeongdeok", name: "영덕군", shortName: "영덕", sidoId: "gyeongbuk", admCode: "37350", sgisCode: "37550", hiraSgguCd: "370012", description: "동해안 대게 명산지, 블루로드 관광", highlights: ["대게", "관광"], area: 741.3 },
  { id: "cheongdo", name: "청도군", shortName: "청도", sidoId: "gyeongbuk", admCode: "37360", sgisCode: "37560", hiraSgguCd: "370022", description: "청도반시(감)의 본고장, 소싸움 축제", highlights: ["감", "반시"], area: 698.43 },
  { id: "goryeong", name: "고령군", shortName: "고령", sidoId: "gyeongbuk", admCode: "37370", sgisCode: "37570", hiraSgguCd: "370002", description: "대가야 역사도시, 딸기·수박 주산지", highlights: ["딸기", "수박"], area: 384.25 },
  { id: "seongju", name: "성주군", shortName: "성주", sidoId: "gyeongbuk", admCode: "37380", sgisCode: "37580", hiraSgguCd: "370010", description: "참외 재배면적 전국 1위(2025), 성주참외 브랜드", highlights: ["참외", "브랜드농업"], area: 616.88 },
  { id: "chilgok", name: "칠곡군", shortName: "칠곡", sidoId: "gyeongbuk", admCode: "37390", sgisCode: "37590", hiraSgguCd: "370024", description: "대구 인접 근교 농업, 사과·복숭아", highlights: ["근교농업", "사과"], area: 451.03 },
  { id: "yecheon", name: "예천군", shortName: "예천", sidoId: "gyeongbuk", admCode: "37400", sgisCode: "37600", hiraSgguCd: "370017", description: "예천 참이슬의 고장, 사과·감 재배", highlights: ["사과", "감"], area: 661.58 },
  { id: "bonghwa", name: "봉화군", shortName: "봉화", sidoId: "gyeongbuk", admCode: "37410", sgisCode: "37610", hiraSgguCd: "370007", description: "태백산 자락 송이버섯·한우 특산", highlights: ["송이버섯", "한우"], area: 1202.51 },
  { id: "uljin", name: "울진군", shortName: "울진", sidoId: "gyeongbuk", admCode: "37420", sgisCode: "37620", hiraSgguCd: "370019", description: "동해안 대게·송이 산지, 금강소나무 숲", highlights: ["대게", "송이"], area: 990.7 },
  { id: "ulleung", name: "울릉군", shortName: "울릉", sidoId: "gyeongbuk", admCode: "37430", sgisCode: "37630", hiraSgguCd: "370018", description: "울릉도 섬 특산 산나물·오징어", highlights: ["섬농업", "산나물"], area: 73.06 },

  // ========================================================================
  // 경상남도 (gyeongnam) (18)
  // ========================================================================
  { id: "changwon", name: "창원시", shortName: "창원", sidoId: "gyeongnam", admCode: "38110", sgisCode: "38010", hiraSgguCd: "380705", description: "경남도청 소재지, 산업도시 근교 농업", highlights: ["근교농업", "산업도시"], area: 749.27 },
  { id: "jinju", name: "진주시", shortName: "진주", sidoId: "gyeongnam", admCode: "38030", sgisCode: "38030", hiraSgguCd: "380500", description: "남강 유등축제 도시, 딸기·단감 명산지", highlights: ["딸기", "단감"], area: 712.94 },
  { id: "tongyeong", name: "통영시", shortName: "통영", sidoId: "gyeongnam", admCode: "38050", sgisCode: "38050", hiraSgguCd: "380800", description: "한려수도 관광도시, 수산·근교 농업", highlights: ["수산", "관광"], area: 239.9 },
  { id: "sacheon", name: "사천시", shortName: "사천", sidoId: "gyeongnam", admCode: "38060", sgisCode: "38060", hiraSgguCd: "380300", description: "사천 딸기·실크 명산지, 항공우주산업", highlights: ["딸기", "항공우주"], area: 398.85 },
  { id: "gimhae", name: "김해시", shortName: "김해", sidoId: "gyeongnam", admCode: "38070", sgisCode: "38070", hiraSgguCd: "380100", description: "낙동강 하류 쌀·단감 재배, 부산 인접", highlights: ["단감", "부산인접"], area: 463.62 },
  { id: "miryang", name: "밀양시", shortName: "밀양", sidoId: "gyeongnam", admCode: "38080", sgisCode: "38080", hiraSgguCd: "380900", description: "밀양대추·얼음골 사과의 고장", highlights: ["대추", "사과"], area: 798.71 },
  { id: "geoje", name: "거제시", shortName: "거제", sidoId: "gyeongnam", admCode: "38090", sgisCode: "38090", hiraSgguCd: "381000", description: "조선업 도시, 해양 기후 근교 농업", highlights: ["해양기후", "관광"], area: 403.87 },
  { id: "yangsan", name: "양산시", shortName: "양산", sidoId: "gyeongnam", admCode: "38100", sgisCode: "38100", hiraSgguCd: "381100", description: "통도사 인근 매실·딸기 재배, 부울경 접근", highlights: ["매실", "부울경"], area: 485.7 },
  { id: "uiryeong", name: "의령군", shortName: "의령", sidoId: "gyeongnam", admCode: "38310", sgisCode: "38510", hiraSgguCd: "380011", description: "의령 망개떡·마늘 특산, 청정 농촌", highlights: ["마늘", "청정"], area: 482.92 },
  { id: "haman", name: "함안군", shortName: "함안", sidoId: "gyeongnam", admCode: "38320", sgisCode: "38520", hiraSgguCd: "380017", description: "함안 수박·파프리카 주산지", highlights: ["수박", "파프리카"], area: 416.61 },
  { id: "changnyeong", name: "창녕군", shortName: "창녕", sidoId: "gyeongnam", admCode: "38330", sgisCode: "38530", hiraSgguCd: "380014", description: "우포늪 생태도시, 양파·마늘 대산지", highlights: ["양파", "우포늪"], area: 532.66 },
  { id: "goseong-gn", name: "고성군", shortName: "고성", sidoId: "gyeongnam", admCode: "38340", sgisCode: "38540", hiraSgguCd: "380003", description: "공룡 화석지, 방울토마토·딸기 재배", highlights: ["공룡화석", "방울토마토"], area: 518.05 },
  { id: "namhae", name: "남해군", shortName: "남해", sidoId: "gyeongnam", admCode: "38350", sgisCode: "38550", hiraSgguCd: "380005", description: "독일마을·마늘 특산지, 귀농 비율이 높은 섬(2025)", highlights: ["마늘"], area: 357.78 },
  { id: "hadong", name: "하동군", shortName: "하동", sidoId: "gyeongnam", admCode: "38360", sgisCode: "38560", hiraSgguCd: "380016", description: "지리산 자락 하동녹차·재첩 특산지", highlights: ["녹차", "재첩"], area: 675.29 },
  { id: "sancheong", name: "산청군", shortName: "산청", sidoId: "gyeongnam", admCode: "38370", sgisCode: "38570", hiraSgguCd: "380008", description: "지리산 약초의 본고장, 한방 특구", highlights: ["약초", "한방특구"], area: 794.75 },
  { id: "hamyang", name: "함양군", shortName: "함양", sidoId: "gyeongnam", admCode: "38380", sgisCode: "38580", hiraSgguCd: "380018", description: "지리산·덕유산 사과·밤 명산지", highlights: ["사과", "밤"], area: 724.72 },
  { id: "geochang", name: "거창군", shortName: "거창", sidoId: "gyeongnam", admCode: "38390", sgisCode: "38590", hiraSgguCd: "380002", description: "덕유산 자락 사과·딸기 고랭지 재배", highlights: ["사과", "딸기"], area: 803.95 },
  { id: "hapcheon", name: "합천군", shortName: "합천", sidoId: "gyeongnam", admCode: "38400", sgisCode: "38600", hiraSgguCd: "380019", description: "해인사·가야산 율무·약초 특산지", highlights: ["율무", "해인사"], area: 983.95 },

  // ========================================================================
  // 제주특별자치도 (jeju) (2)
  // ========================================================================
  { id: "jeju-si", name: "제주시", shortName: "제주", sidoId: "jeju", admCode: "39010", sgisCode: "39010", hiraSgguCd: "390200", description: "감귤·한라봉 주산지, 관광 연계 팜스테이", highlights: ["감귤", "팜스테이"], area: 978.65 },
  { id: "seogwipo", name: "서귀포시", shortName: "서귀포", sidoId: "jeju", admCode: "39020", sgisCode: "39020", hiraSgguCd: "390100", description: "감귤 재배면적 전국 1위(2025), 아열대 작물 재배", highlights: ["아열대작물", "망고"], area: 871.49 },
];

/** 시/군/구 — 주요 작물·'정착 인기'는 원천 생성본에서 붙인다 */
export const SIGUNGUS: Sigungu[] = SIGUNGU_ROWS.map((sg) => ({
  ...sg,
  highlights: getEnrichedHighlights(sg.sgisCode, sg.highlights),
  mainCrops: (SIGUNGU_MAIN_CROPS[sg.id] ?? []).map((e) => e.crop),
}));

// ---------------------------------------------------------------------------
// 헬퍼 함수
// ---------------------------------------------------------------------------

/** 시/도 ID로 소속 시/군/구 목록 조회 */
export function getSigungusBySidoId(sidoId: string): Sigungu[] {
  return SIGUNGUS.filter((sg) => sg.sidoId === sidoId);
}

/** slug로 시/군/구 찾기 */
export function getSigunguById(id: string): Sigungu | undefined {
  return SIGUNGUS.find((sg) => sg.id === id);
}

/** 시/도 ID + 시/군/구 slug로 찾기 */
export function getSigunguBySidoAndId(
  sidoId: string,
  sigunguId: string
): Sigungu | undefined {
  return SIGUNGUS.find((sg) => sg.sidoId === sidoId && sg.id === sigunguId);
}

/**
 * 작물명 → 그 작물이 주요 작물(2025 농림어업총조사 재배면적 상위 3)인 시·군·구, 그 작물 재배면적 큰 순.
 * `sortBySidoIds` 는 면적이 같을 때만 쓴다(예전엔 시·도 순서가 1순위라 목록 앞쪽 시·군·구가 '주요 산지'처럼 보였다).
 */
function sigungusByCropArea(cropName: string, sortBySidoIds: string[]): Sigungu[] {
  const areaOf = (sg: Sigungu) => SIGUNGU_MAIN_CROPS[sg.id]?.find((e) => e.crop === cropName)?.areaHa ?? 0;
  const priority = new Map(sortBySidoIds.map((id, idx) => [id, idx]));
  return SIGUNGUS.filter((sg) => sg.mainCrops.includes(cropName)).sort(
    (a, b) =>
      areaOf(b) - areaOf(a) ||
      (priority.get(a.sidoId) ?? Number.MAX_SAFE_INTEGER) - (priority.get(b.sidoId) ?? Number.MAX_SAFE_INTEGER),
  );
}

/** 작물명 → 주요 산지 시·군·구 약칭 (최대 `limit`개) */
export function getMajorSigungusForCrop(
  cropName: string,
  sortBySidoIds: string[] = [],
  limit = 6
): string[] {
  return sigungusByCropArea(cropName, sortBySidoIds).slice(0, limit).map((sg) => sg.shortName);
}

/** 작물명 → 주요 산지 시·군·구 — 라우팅 정보 포함 (본문 cross-link 용) */
export function getMajorSigunguLinksForCrop(
  cropName: string,
  sortBySidoIds: string[] = [],
  limit = 6,
): Array<{ id: string; sidoId: string; shortName: string; name: string }> {
  return sigungusByCropArea(cropName, sortBySidoIds).slice(0, limit).map((sg) => ({
    id: sg.id,
    sidoId: sg.sidoId,
    shortName: sg.shortName,
    name: sg.name,
  }));
}

/** 시·군·구·구 id → 주요 작물과 2025 재배면적(ha). 표에 없는 단위는 빈 배열 */
export function getMainCropEntries(unitId: string): MainCropEntry[] {
  return SIGUNGU_MAIN_CROPS[unitId] ?? GU_MAIN_CROPS[unitId] ?? [];
}

/**
 * 주요 작물이 빈 이유 — 화면 안내 문구용.
 *  - "not-in-census": 2025 총조사 표에 없는 단위(인천·화성 2026 신설 구)
 *  - "residence-skew": 농가 주소지 기준 값이 경작지와 크게 어긋나는 시·도(서울)
 *  - "small": 기준 면적(10ha)을 넘는 작물이 없음
 */
export function mainCropsEmptyReason(unitId: string, sidoId: string): "not-in-census" | "residence-skew" | "small" | null {
  const entries = SIGUNGU_MAIN_CROPS[unitId] ?? GU_MAIN_CROPS[unitId];
  if (entries && entries.length > 0) return null;
  if (!entries) return "not-in-census";
  if (MAIN_CROPS_SKEWED_PROVINCES.includes(sidoId)) return "residence-skew";
  return "small";
}

/** 빈 이유 → 한 줄 안내 */
export function mainCropsEmptyMessage(reason: ReturnType<typeof mainCropsEmptyReason>, parentName?: string): string {
  switch (reason) {
    case "not-in-census":
      return parentName
        ? `새로 생긴 구라 2025 농림어업총조사에 구 단위 값이 없어요. ${parentName} 전체 값을 확인해 보세요.`
        : "새로 생긴 구라 2025 농림어업총조사에 구 단위 값이 없어요.";
    case "residence-skew":
      return "농림어업총조사 재배면적은 농가 주소지 기준이라, 서울은 다른 지역 논밭이 섞여 주요 작물로 꼽지 않았어요.";
    case "small":
      return `2025 농림어업총조사 작물 ${MAIN_CROP_RULE.cropCount}종 가운데 ${MAIN_CROP_RULE.minAreaHa}ha 넘게 재배하는 작물이 없어요.`;
    default:
      return "";
  }
}
