/**
 * 광역(시·도) 귀농귀촌지원센터 디렉토리
 *
 * - sidoSlug는 src/lib/data/regions.ts의 Province.id와 일치한다.
 * - url은 2026-04-15 기준으로 curl/WebFetch/WebSearch 삼중 검증 완료.
 *   각 항목 옆 주석에 검증 증거(HTTP 코드 + 페이지 타이틀)를 남겼다.
 * - 강원: 광역 전용 센터 도메인(returnfarm.gwd.go.kr)이 ECONNREFUSED로
 *   서비스 장애 상태(2026-04-15 확인) → 강원특별자치도청 귀농귀촌 분야 페이지로 폴백.
 * - 충북·충남: 도 전용 "귀농귀촌지원센터" 단일 도메인이 확인되지 않아
 *   각 도 농업기술원(귀농 교육·정책 주무 기관) 공식 홈페이지로 대체.
 *
 * Step 2(시군구 기초센터)는 별도 PR에서 확장한다.
 */

export interface Center {
  /** 센터 고유 식별자 (예: "jeonbuk-sido") */
  id: string;
  /** 시·도 명 (regions.ts shortName과 동일) */
  sido: string;
  /** 시·도 slug (regions.ts Province.id와 동일) */
  sidoSlug: string;
  /** 분류 — 이번 단계는 광역만 */
  category: "sido";
  /** 공식 명칭 */
  name: string;
  /** 대표 전화번호 (확인된 경우) */
  phone?: string;
  /** 대표 주소 (확인된 경우) */
  address?: string;
  /** 공식 홈페이지 URL */
  url: string;
  /** URL 검증 일자 (YYYY-MM-DD) */
  verifiedAt: string;
}

export const CENTERS: Center[] = [
  {
    id: "jeonbuk-sido",
    sido: "전북",
    sidoSlug: "jeonbuk",
    category: "sido",
    name: "전북특별자치도 귀농귀촌 종합안내",
    url: "https://www.jeonbuk.go.kr/index.jeonbuk?menuCd=DOM_000000104008004000",
    // 검증 2026-04-15: HTTP 200, title="분야별 정보 > 전북농업 > 귀농귀촌 종합안내 > 전북특별자치도 지원사업 | 전북특별자치도"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-sido",
    sido: "전남",
    sidoSlug: "jeonnam",
    category: "sido",
    name: "전라남도 귀농산어촌 종합지원센터",
    phone: "1577-1425",
    url: "https://jnfarm.jeonnam.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="전라남도 귀농산어촌 종합지원센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-sido",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    category: "sido",
    name: "경상북도 귀농귀촌종합지원센터",
    url: "https://www.gb.go.kr/Main/open_contents/section/refarm/index.html",
    // 검증 2026-04-15: HTTP 200, title="귀농귀촌종합지원센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-sido",
    sido: "경남",
    sidoSlug: "gyeongnam",
    category: "sido",
    name: "경상남도 귀농귀촌 플랫폼",
    url: "https://www.gyeongnam.go.kr/gnreturn/",
    // 검증 2026-04-15: HTTP 200, title="경상남도 귀농귀촌 플랫폼"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-sido",
    sido: "충북",
    sidoSlug: "chungbuk",
    category: "sido",
    // 폴백: 도 전용 귀농센터 단일 도메인 미확인 → 농업기술원(귀농 교육 주무) 사용
    name: "충청북도농업기술원 (귀농 교육·정책 주무)",
    phone: "043-220-5555",
    url: "https://ares.chungbuk.go.kr/home/main.php",
    // 검증 2026-04-15: HTTP 200, title="충청북도 농업기술원" (폴백 — 전용 센터 도메인 부재)
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-sido",
    sido: "충남",
    sidoSlug: "chungnam",
    category: "sido",
    // 폴백: 도 전용 귀농센터 단일 도메인 미확인 → 농업기술원(귀농 교육 주무) 사용
    name: "충청남도농업기술원 (귀농 교육·정책 주무)",
    url: "https://cnnongup.chungnam.go.kr/main.cs",
    // 검증 2026-04-15: HTTP 200, title="충청남도농업기술원" (폴백 — 전용 센터 도메인 부재)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-sido",
    sido: "강원",
    sidoSlug: "gangwon",
    category: "sido",
    // 폴백: 강원도귀농귀촌지원센터(returnfarm.gwd.go.kr)가 2026-04-15 ECONNREFUSED
    // → 강원특별자치도청 귀농귀촌 분야 페이지로 대체
    name: "강원특별자치도 귀농귀촌 안내 (도청)",
    url: "https://state.gwd.go.kr/portal/partinfo/livestock/agriculture/return",
    // 검증 2026-04-15: HTTP 200, title="귀농귀촌 현황 - 분야별정보 | 강원특별자치도청"
    // (전용 센터 도메인 returnfarm.gwd.go.kr는 서비스 장애로 폴백)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-sido",
    sido: "경기",
    sidoSlug: "gyeonggi",
    category: "sido",
    name: "경기도귀농귀촌지원센터",
    phone: "031-250-2711",
    url: "https://www.refarmgg.or.kr/",
    // 검증 2026-04-15: HTTP 200, redirect→/index.do, title="경기도귀농귀촌지원센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeju-sido",
    sido: "제주",
    sidoSlug: "jeju",
    category: "sido",
    // 폴백: 도 단위 통합 "귀농귀촌지원센터" 도메인 없음 → 제주특별자치도 정착지원사업 페이지 사용
    name: "제주특별자치도 귀농귀촌 지원사업",
    url: "https://www.jeju.go.kr/jeju/life/support/support.htm",
    // 검증 2026-04-15: HTTP 200(원본 302→), title="제주소개 > 제주정착정보 > 정착지원사업 > 귀농귀촌 지원사업 - 제주특별자치도"
    verifiedAt: "2026-04-15",
  },
];

/** sidoSlug로 광역 센터 조회 */
export function getSidoCenter(sidoSlug: string): Center | undefined {
  return CENTERS.find((c) => c.category === "sido" && c.sidoSlug === sidoSlug);
}
