/**
 * 귀농귀촌지원센터 / 농업기술센터 디렉토리
 *
 * - sidoSlug는 src/lib/data/regions.ts의 Province.id와 일치한다.
 * - sigunguSlug(시군구)는 src/lib/data/sigungus.ts의 Sigungu.id와 일치한다.
 * - url은 2026-04-15 기준으로 curl + WebFetch/WebSearch 삼중 검증 완료.
 *   각 항목 옆 주석에 검증 증거(HTTP 코드 + 페이지 타이틀)를 남겼다.
 *
 * 광역(시·도) 폴백:
 * - 강원: 광역 전용 센터 도메인(returnfarm.gwd.go.kr)이 ECONNREFUSED로
 *   서비스 장애 상태(2026-04-15 확인) → 강원특별자치도청 귀농귀촌 분야 페이지로 폴백.
 * - 충북·충남: 도 전용 "귀농귀촌지원센터" 단일 도메인이 확인되지 않아
 *   각 도 농업기술원(귀농 교육·정책 주무 기관) 공식 홈페이지로 대체.
 *
 * 시군구(Step 2a, 2026-04-15):
 * - 1차 대상: 수도권(인천 강화/옹진 포함) + 전북 + 전남 + 경북 + 경남 (112개 시군)
 * - 전용 "귀농귀촌지원센터" 또는 "농업기술센터" 도메인이 확인된 경우 해당 URL 사용.
 * - 확인되지 않거나 soft-404를 반환하는 경우 → 시/군청 메인 누리집으로 폴백 (주석 명기).
 * - Step 2b(강원·충북·충남·제주·수도권 잔여): 다음 PR에서 확장.
 *
 * 주의 (CLAUDE.md 8번 원칙):
 * - 한국 공공 사이트는 HTTP 200으로 soft-404를 서빙하는 경우가 많으므로
 *   상태코드뿐 아니라 <title>에 "찾을 수 없/404/에러/오류" 등이 있는지 교차 검증함.
 * - 시군 농업기술센터 서브도메인은 규칙성이 낮아(예: agri/atec/atc/farm/depart 등) 개별 확인 필요.
 */

export interface Center {
  /** 센터 고유 식별자 (예: "jeonbuk-sido", "gyeonggi-namyangju-sigungu") */
  id: string;
  /** 시·도 명 (regions.ts shortName과 동일) */
  sido: string;
  /** 시·도 slug (regions.ts Province.id와 동일) */
  sidoSlug: string;
  /** 시·군·구 명 (sigungu 카테고리에서만) */
  sigungu?: string;
  /** 시·군·구 slug (sigungus.ts Sigungu.id와 동일, sigungu 카테고리에서만) */
  sigunguSlug?: string;
  /** 분류 — 광역 또는 기초 */
  category: "sido" | "sigungu";
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

  // ==========================================================================
  // 시·군·구(기초) 센터 — Step 2a: 수도권(인천 강화/옹진) + 전북 + 전남 + 경북 + 경남
  // ==========================================================================

  // --- 인천: 수도권 내 농업 시군 (강화·옹진) ---
  {
    id: "incheon-ganghwa-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "강화군",
    sigunguSlug: "ganghwa",
    category: "sigungu",
    // 폴백: 강화군 전용 농업기술센터 도메인 미확인 → 강화군청 대표 누리집 사용
    name: "강화군청 (농업기술센터 안내)",
    url: "https://www.ganghwa.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 강화군청" (시청 누리집 폴백)
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-ongjin-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "옹진군",
    sigunguSlug: "ongjin",
    category: "sigungu",
    name: "옹진군청 (농업기술센터 안내)",
    url: "https://www.ongjin.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="옹진군청" (시청 누리집 폴백)
    verifiedAt: "2026-04-15",
  },

  // --- 경기도 (31개 시군) ---
  {
    id: "gyeonggi-suwon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "수원시",
    sigunguSlug: "suwon",
    category: "sigungu",
    name: "수원특례시청 (농업기술센터 안내)",
    url: "https://www.suwon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="수원특례시청" (시청 누리집 폴백)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-seongnam-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "성남시",
    sigunguSlug: "seongnam",
    category: "sigungu",
    name: "성남시청",
    url: "https://www.seongnam.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="성남시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-uijeongbu-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "의정부시",
    sigunguSlug: "uijeongbu",
    category: "sigungu",
    name: "의정부시청",
    url: "https://www.ui4u.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="의정부시청 대표 홈페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-anyang-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "안양시",
    sigunguSlug: "anyang",
    category: "sigungu",
    name: "안양시청",
    url: "https://www.anyang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="안양시 대표홈페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-bucheon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "부천시",
    sigunguSlug: "bucheon",
    category: "sigungu",
    name: "부천시청",
    url: "https://www.bucheon.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-gwangmyeong-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "광명시",
    sigunguSlug: "gwangmyeong",
    category: "sigungu",
    name: "광명시청",
    url: "https://www.gm.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="광명시청 HOME > 메인"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-pyeongtaek-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "평택시",
    sigunguSlug: "pyeongtaek",
    category: "sigungu",
    name: "평택시청",
    url: "https://www.pyeongtaek.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="평택시 대표포털"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-dongducheon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "동두천시",
    sigunguSlug: "dongducheon",
    category: "sigungu",
    // 도메인 변경 감지: ddc21.net → ddc.go.kr (2026-04-15)
    name: "동두천시청",
    url: "https://www.ddc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="동두천시 대표홈페이지" (ddc21.net는 521 응답)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-ansan-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "안산시",
    sigunguSlug: "ansan",
    category: "sigungu",
    name: "안산시청",
    url: "https://www.ansan.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-goyang-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "고양시",
    sigunguSlug: "goyang",
    category: "sigungu",
    name: "고양시 농업기술센터",
    url: "https://www.goyang.go.kr/atc/index.do",
    // 검증 2026-04-15: HTTP 200, title="Document" (SPA 렌더 — 실제 atc 서브도메인 정상)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-gwacheon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "과천시",
    sigunguSlug: "gwacheon",
    category: "sigungu",
    name: "과천시청",
    url: "https://www.gccity.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="과천시청에 오신 것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-guri-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "구리시",
    sigunguSlug: "guri",
    category: "sigungu",
    name: "구리시청",
    url: "https://www.guri.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-namyangju-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "남양주시",
    sigunguSlug: "namyangju",
    category: "sigungu",
    name: "남양주시 농업기술센터",
    url: "https://www.nyj.go.kr/agri/index.do",
    // 검증 2026-04-15: HTTP 200, title="농업기술센터" (전용 서브경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-osan-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "오산시",
    sigunguSlug: "osan",
    category: "sigungu",
    name: "오산시청",
    url: "https://www.osan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="오산시"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-siheung-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "시흥시",
    sigunguSlug: "siheung",
    category: "sigungu",
    name: "시흥시청",
    url: "https://www.siheung.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="시흥시 대표홈페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-gunpo-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "군포시",
    sigunguSlug: "gunpo",
    category: "sigungu",
    name: "군포시청",
    url: "https://www.gunpo.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="군포시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-uiwang-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "의왕시",
    sigunguSlug: "uiwang",
    category: "sigungu",
    name: "의왕시청",
    url: "https://www.uiwang.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-hanam-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "하남시",
    sigunguSlug: "hanam",
    category: "sigungu",
    name: "하남시청",
    url: "https://www.hanam.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="하남시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-yongin-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "용인시",
    sigunguSlug: "yongin",
    category: "sigungu",
    name: "용인특례시청",
    url: "https://www.yongin.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="용인특례시청 대표포털"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-paju-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "파주시",
    sigunguSlug: "paju",
    category: "sigungu",
    name: "파주시청",
    url: "https://www.paju.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-icheon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "이천시",
    sigunguSlug: "icheon",
    category: "sigungu",
    name: "이천시 농업기술센터 (분야별 포털)",
    url: "https://www.icheon.go.kr/depart/index.do",
    // 검증 2026-04-15: HTTP 200, title="이천시 분야별 포털에 오신 것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-anseong-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "안성시",
    sigunguSlug: "anseong",
    category: "sigungu",
    name: "안성시청",
    url: "https://www.anseong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="안성시청 홈페이지 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-gimpo-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "김포시",
    sigunguSlug: "gimpo",
    category: "sigungu",
    name: "김포시청",
    url: "https://www.gimpo.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="김포시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-hwaseong-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "화성시",
    sigunguSlug: "hwaseong",
    category: "sigungu",
    name: "화성시청",
    url: "https://www.hscity.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="화성시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-gwangju-gg-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "광주시",
    sigunguSlug: "gwangju-gg",
    category: "sigungu",
    name: "광주시청 (경기)",
    url: "https://www.gjcity.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="광주시 홈페이지에 오신 것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-yangju-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "양주시",
    sigunguSlug: "yangju",
    category: "sigungu",
    name: "양주시청",
    url: "https://www.yangju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="양주시청 홈페이지에 오신것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-pocheon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "포천시",
    sigunguSlug: "pocheon",
    category: "sigungu",
    name: "포천시청",
    url: "https://www.pocheon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="포천시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-yeoju-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "여주시",
    sigunguSlug: "yeoju",
    category: "sigungu",
    name: "여주시청",
    url: "https://www.yeoju.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-yangpyeong-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "양평군",
    sigunguSlug: "yangpyeong",
    category: "sigungu",
    name: "양평군 농업기술센터",
    url: "https://www.yp21.go.kr/ypatc/index.do",
    // 검증 2026-04-15: HTTP 200, title="농업기술센터" (ypatc 전용 경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-gapyeong-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "가평군",
    sigunguSlug: "gapyeong",
    category: "sigungu",
    name: "가평군청",
    url: "https://www.gp.go.kr/",
    // 검증 2026-04-15: HTTP 200 (군청 대표 누리집 폴백 — portal/atc 경로는 404)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeonggi-yeoncheon-sigungu",
    sido: "경기",
    sidoSlug: "gyeonggi",
    sigungu: "연천군",
    sigunguSlug: "yeoncheon",
    category: "sigungu",
    name: "연천군청",
    url: "https://www.yeoncheon.go.kr/",
    // 검증 2026-04-15: HTTP 200 (군청 대표 누리집 폴백)
    verifiedAt: "2026-04-15",
  },

  // --- 전라북도 (14개 시군) ---
  {
    id: "jeonbuk-jeonju-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "전주시",
    sigunguSlug: "jeonju",
    category: "sigungu",
    name: "전주시청",
    url: "https://www.jeonju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="전주시 대표사이트" (agri.jeonju.go.kr는 ECONNREFUSED로 폴백)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-gunsan-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "군산시",
    sigunguSlug: "gunsan",
    category: "sigungu",
    name: "군산시청",
    url: "https://www.gunsan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="군산시 누리집"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-iksan-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "익산시",
    sigunguSlug: "iksan",
    category: "sigungu",
    name: "익산시청",
    url: "https://www.iksan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="익산시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-jeongeup-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "정읍시",
    sigunguSlug: "jeongeup",
    category: "sigungu",
    name: "정읍시청",
    url: "https://www.jeongeup.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="정읍시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-namwon-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "남원시",
    sigunguSlug: "namwon",
    category: "sigungu",
    name: "남원시청",
    url: "https://www.namwon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="남원시 대표 누리집 > 메인"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-gimje-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "김제시",
    sigunguSlug: "gimje",
    category: "sigungu",
    name: "김제시청",
    url: "https://www.gimje.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="김제시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-wanju-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "완주군",
    sigunguSlug: "wanju",
    category: "sigungu",
    name: "완주귀농귀촌지원센터",
    url: "https://www.wanjuro.org/",
    // 검증 2026-04-15: HTTP 200, title="완주귀농귀촌지원센터" (전용 센터 도메인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-jinan-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "진안군",
    sigunguSlug: "jinan",
    category: "sigungu",
    name: "진안군청",
    url: "https://www.jinan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="새로운 시작으로 성공시대를 열어가는 미래 진안"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-muju-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "무주군",
    sigunguSlug: "muju",
    category: "sigungu",
    name: "무주군청",
    url: "https://www.muju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="무주군청 > 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-jangsu-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "장수군",
    sigunguSlug: "jangsu",
    category: "sigungu",
    name: "장수군청",
    url: "https://www.jangsu.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="장수군청 누리집"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-imsil-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "임실군",
    sigunguSlug: "imsil",
    category: "sigungu",
    name: "임실군청",
    url: "https://www.imsil.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="임실군"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-sunchang-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "순창군",
    sigunguSlug: "sunchang",
    category: "sigungu",
    name: "순창군청",
    url: "https://www.sunchang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="순창군 대표 > 메인"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-gochang-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "고창군",
    sigunguSlug: "gochang",
    category: "sigungu",
    name: "고창군청",
    url: "https://www.gochang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="고창군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonbuk-buan-sigungu",
    sido: "전북",
    sidoSlug: "jeonbuk",
    sigungu: "부안군",
    sigunguSlug: "buan",
    category: "sigungu",
    name: "부안군청",
    url: "https://www.buan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="부안군"
    verifiedAt: "2026-04-15",
  },

  // --- 전라남도 (22개 시군) ---
  {
    id: "jeonnam-mokpo-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "목포시",
    sigunguSlug: "mokpo",
    category: "sigungu",
    name: "목포시청",
    url: "https://www.mokpo.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="목포시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-yeosu-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "여수시",
    sigunguSlug: "yeosu",
    category: "sigungu",
    name: "여수시청",
    url: "https://www.yeosu.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="여수시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-suncheon-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "순천시",
    sigunguSlug: "suncheon",
    category: "sigungu",
    name: "순천시 농업기술센터",
    url: "https://www.suncheon.go.kr/sca/index.jsp",
    // 검증 2026-04-15: HTTP 200, title="순천시 농업기술센터" (sca 서브경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-naju-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "나주시",
    sigunguSlug: "naju",
    category: "sigungu",
    name: "나주시청",
    url: "https://www.naju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="나주시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-gwangyang-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "광양시",
    sigunguSlug: "gwangyang",
    category: "sigungu",
    name: "광양시청",
    url: "https://www.gwangyang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="광양시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-damyang-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "담양군",
    sigunguSlug: "damyang",
    category: "sigungu",
    name: "담양군청",
    url: "https://www.damyang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="담양군청" (atec 서브경로는 에러 페이지)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-gokseong-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "곡성군",
    sigunguSlug: "gokseong",
    category: "sigungu",
    name: "곡성군청",
    url: "https://www.gokseong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="곡성군청 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-gurye-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "구례군",
    sigunguSlug: "gurye",
    category: "sigungu",
    name: "구례군청",
    url: "https://www.gurye.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="구례군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-goheung-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "고흥군",
    sigunguSlug: "goheung",
    category: "sigungu",
    name: "고흥군청",
    url: "https://www.goheung.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="고흥군청" (farm.goheung.go.kr는 ECONNREFUSED로 폴백)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-boseong-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "보성군",
    sigunguSlug: "boseong",
    category: "sigungu",
    name: "보성군 농업기술센터",
    url: "https://www.boseong.go.kr/atec/",
    // 검증 2026-04-15: HTTP 200, title="농업기술센터" (전용 서브경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-hwasun-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "화순군",
    sigunguSlug: "hwasun",
    category: "sigungu",
    name: "화순군청",
    url: "https://www.hwasun.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="화순군청 홈페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-jangheung-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "장흥군",
    sigunguSlug: "jangheung",
    category: "sigungu",
    name: "장흥군청",
    url: "https://www.jangheung.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="장흥군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-gangjin-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "강진군",
    sigunguSlug: "gangjin",
    category: "sigungu",
    name: "강진군청",
    url: "https://www.gangjin.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="강진군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-haenam-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "해남군",
    sigunguSlug: "haenam",
    category: "sigungu",
    name: "해남군 농업기술센터",
    url: "https://www.haenam.go.kr/atc/",
    // 검증 2026-04-15: HTTP 200, title="농업기술센터 > 농업기술원_new 메인"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-yeongam-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "영암군",
    sigunguSlug: "yeongam",
    category: "sigungu",
    name: "영암군 농업기술센터",
    url: "https://www.yeongam.go.kr/home/nong",
    // 검증 2026-04-15: HTTP 200, title="영암군" (home/nong 전용 경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-muan-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "무안군",
    sigunguSlug: "muan",
    category: "sigungu",
    name: "무안군청",
    url: "https://www.muan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="무안군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-hampyeong-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "함평군",
    sigunguSlug: "hampyeong",
    category: "sigungu",
    name: "함평군 농업기술센터",
    url: "https://www.hampyeong.go.kr/agri/",
    // 검증 2026-04-15: HTTP 200, title="함평군 농업기술센터" (전용 서브경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-yeonggwang-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "영광군",
    sigunguSlug: "yeonggwang",
    category: "sigungu",
    name: "영광군청",
    url: "https://www.yeonggwang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="영광군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-jangseong-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "장성군",
    sigunguSlug: "jangseong",
    category: "sigungu",
    name: "장성군청",
    url: "https://www.jangseong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="장성군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-wando-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "완도군",
    sigunguSlug: "wando",
    category: "sigungu",
    name: "완도군청",
    url: "https://www.wando.go.kr/",
    // 검증 2026-04-15: HTTP 200 (군청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-jindo-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "진도군",
    sigunguSlug: "jindo",
    category: "sigungu",
    name: "진도군청",
    url: "https://www.jindo.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="진도군청 시작 화면"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeonnam-sinan-sigungu",
    sido: "전남",
    sidoSlug: "jeonnam",
    sigungu: "신안군",
    sigunguSlug: "sinan",
    category: "sigungu",
    // 도메인 주의: shinan.go.kr (표준 로마자와 상이)
    name: "신안군청",
    url: "https://www.shinan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="신안군"
    verifiedAt: "2026-04-15",
  },

  // --- 경상북도 (23개 시군) ---
  {
    id: "gyeongbuk-pohang-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "포항시",
    sigunguSlug: "pohang",
    category: "sigungu",
    name: "포항시청",
    url: "https://www.pohang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="포항시 대표 포털에 오신 것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-gyeongju-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "경주시",
    sigunguSlug: "gyeongju",
    category: "sigungu",
    name: "경주시청",
    url: "https://www.gyeongju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="경주시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-gimcheon-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "김천시",
    sigunguSlug: "gimcheon",
    category: "sigungu",
    name: "김천시청",
    url: "https://www.gc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="김천시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-andong-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "안동시",
    sigunguSlug: "andong",
    category: "sigungu",
    name: "안동시 귀농귀촌지원센터",
    url: "https://www.andong.go.kr/refarm/main.do",
    // 검증 2026-04-15: HTTP 200, title="안동시 귀농귀촌지원센터" (refarm 전용 경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-gumi-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "구미시",
    sigunguSlug: "gumi",
    category: "sigungu",
    name: "구미시청",
    url: "https://www.gumi.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="구미시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-yeongju-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "영주시",
    sigunguSlug: "yeongju",
    category: "sigungu",
    name: "영주시 농업기술센터",
    url: "https://www.yeongju.go.kr/atec/index.do",
    // 검증 2026-04-15: HTTP 200, title="영주시 농업기술센터" (atec 전용 경로 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-yeongcheon-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "영천시",
    sigunguSlug: "yeongcheon",
    category: "sigungu",
    name: "영천시청",
    url: "https://www.yc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="영천시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-sangju-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "상주시",
    sigunguSlug: "sangju",
    category: "sigungu",
    name: "상주시청",
    url: "https://www.sangju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="상주시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-mungyeong-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "문경시",
    sigunguSlug: "mungyeong",
    category: "sigungu",
    name: "문경시청",
    url: "https://www.gbmg.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="문경시 홈페이지 통합 서비스 안내"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-gyeongsan-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "경산시",
    sigunguSlug: "gyeongsan",
    category: "sigungu",
    name: "경산시청",
    url: "https://www.gbgs.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="꽃피다 시민중심 행복경산"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-gunwi-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "군위군",
    sigunguSlug: "gunwi",
    category: "sigungu",
    name: "군위군청",
    url: "https://www.gunwi.go.kr/",
    // 검증 2026-04-15: HTTP 200 (군청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-uiseong-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "의성군",
    sigunguSlug: "uiseong",
    category: "sigungu",
    name: "의성군청",
    url: "https://www.usc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="의성군"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-cheongsong-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "청송군",
    sigunguSlug: "cheongsong",
    category: "sigungu",
    name: "청송군 농업기술센터",
    url: "https://www.cs.go.kr/atec/index.do",
    // 검증 2026-04-15: HTTP 200 (atec 경로 정상 — title은 SPA로 공란이나 응답 OK)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-yeongyang-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "영양군",
    sigunguSlug: "yeongyang",
    category: "sigungu",
    name: "영양군청",
    url: "https://www.yyg.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="영양군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-yeongdeok-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "영덕군",
    sigunguSlug: "yeongdeok",
    category: "sigungu",
    name: "영덕군청",
    url: "https://www.yd.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="영덕군청 랜딩 페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-cheongdo-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "청도군",
    sigunguSlug: "cheongdo",
    category: "sigungu",
    name: "청도군청",
    url: "https://www.cheongdo.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="청도군 홈페이지 점검안내" (검증 시점 점검 중 — 군청 공식 도메인 확인)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-goryeong-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "고령군",
    sigunguSlug: "goryeong",
    category: "sigungu",
    name: "고령군청",
    url: "https://www.goryeong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="고령군"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-seongju-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "성주군",
    sigunguSlug: "seongju",
    category: "sigungu",
    name: "성주군청",
    url: "https://www.sj.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="성주군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-chilgok-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "칠곡군",
    sigunguSlug: "chilgok",
    category: "sigungu",
    name: "칠곡군청",
    url: "https://www.chilgok.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="칠곡군청에 오신 것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-yecheon-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "예천군",
    sigunguSlug: "yecheon",
    category: "sigungu",
    name: "예천군청",
    url: "http://www.ycg.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="경북의 중심, 도약하는 예천" (HTTPS는 000 — HTTP만 응답)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-bonghwa-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "봉화군",
    sigunguSlug: "bonghwa",
    category: "sigungu",
    name: "봉화군청 (농업기술센터 안내)",
    url: "https://www.bonghwa.go.kr/open_content/atc/main.do",
    // 검증 2026-04-15: HTTP 200, title="봉화군 홈페이지에 오신 것을 환영합니다" (SPA 메인 타이틀)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-uljin-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "울진군",
    sigunguSlug: "uljin",
    category: "sigungu",
    name: "울진군청",
    url: "https://www.uljin.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="울진군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongbuk-ulleung-sigungu",
    sido: "경북",
    sidoSlug: "gyeongbuk",
    sigungu: "울릉군",
    sigunguSlug: "ulleung",
    category: "sigungu",
    name: "울릉군청",
    url: "https://www.ulleung.go.kr/",
    // 검증 2026-04-15: HTTP 200 (군청 대표 누리집)
    verifiedAt: "2026-04-15",
  },

  // --- 경상남도 (18개 시군) ---
  {
    id: "gyeongnam-changwon-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "창원시",
    sigunguSlug: "changwon",
    category: "sigungu",
    name: "창원특례시청",
    url: "https://www.changwon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="창원특례시"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-jinju-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "진주시",
    sigunguSlug: "jinju",
    category: "sigungu",
    name: "진주시청",
    url: "https://www.jinju.go.kr/",
    // 검증 2026-04-15: HTTP 200 (시청 대표 누리집)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-tongyeong-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "통영시",
    sigunguSlug: "tongyeong",
    category: "sigungu",
    name: "통영시청",
    url: "https://www.tongyeong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="통영시"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-sacheon-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "사천시",
    sigunguSlug: "sacheon",
    category: "sigungu",
    name: "사천시청",
    url: "https://www.sacheon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="사천시: 대한민국 우주항공 수도 > 사천시"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-gimhae-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "김해시",
    sigunguSlug: "gimhae",
    category: "sigungu",
    name: "김해시청",
    url: "https://www.gimhae.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="김해시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-miryang-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "밀양시",
    sigunguSlug: "miryang",
    category: "sigungu",
    name: "밀양시 귀농귀촌종합지원센터",
    url: "https://www.miryang.go.kr/myreturn/",
    // 검증 2026-04-15: HTTP 200 (myreturn 전용 경로 — 공식 센터 페이지)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-geoje-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "거제시",
    sigunguSlug: "geoje",
    category: "sigungu",
    name: "거제시청",
    url: "https://www.geoje.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="거제시청 - 함께여는 동남권중심 거제"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-yangsan-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "양산시",
    sigunguSlug: "yangsan",
    category: "sigungu",
    name: "양산시청",
    url: "https://www.yangsan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="양산시 홈페이지에 오신 것을 환영합니다"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-uiryeong-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "의령군",
    sigunguSlug: "uiryeong",
    category: "sigungu",
    name: "의령군청",
    url: "https://www.uiryeong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="의령군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-haman-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "함안군",
    sigunguSlug: "haman",
    category: "sigungu",
    name: "함안군청",
    url: "https://www.haman.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="함안군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-changnyeong-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "창녕군",
    sigunguSlug: "changnyeong",
    category: "sigungu",
    name: "창녕군청",
    url: "https://www.cng.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="창녕군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-goseong-gn-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "고성군",
    sigunguSlug: "goseong-gn",
    category: "sigungu",
    name: "고성군청 (경남)",
    url: "https://www.goseong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="경상남도 고성군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-namhae-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "남해군",
    sigunguSlug: "namhae",
    category: "sigungu",
    name: "남해군청",
    url: "https://www.namhae.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="남해군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-hadong-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "하동군",
    sigunguSlug: "hadong",
    category: "sigungu",
    name: "하동군청",
    url: "https://www.hadong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="하동군"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-sancheong-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "산청군",
    sigunguSlug: "sancheong",
    category: "sigungu",
    name: "산청군청",
    url: "https://www.sancheong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="모두가 행복한 산청군"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-hamyang-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "함양군",
    sigunguSlug: "hamyang",
    category: "sigungu",
    // 도메인 변경 감지: hamyang.go.kr → hygn.go.kr (2026-04-15)
    name: "함양군청",
    url: "https://www.hygn.go.kr/main.web",
    // 검증 2026-04-15: HTTP 200, title="함양군 대표누리집" (hamyang.go.kr는 미응답)
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-geochang-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "거창군",
    sigunguSlug: "geochang",
    category: "sigungu",
    name: "거창군청",
    url: "https://www.geochang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="거창군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gyeongnam-hapcheon-sigungu",
    sido: "경남",
    sidoSlug: "gyeongnam",
    sigungu: "합천군",
    sigunguSlug: "hapcheon",
    category: "sigungu",
    name: "합천군청",
    url: "https://www.hc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="합천군 인트로"
    verifiedAt: "2026-04-15",
  },

  // ====== Step 2b (2026-04-15): 잔여 시군구 — 수도권(서울 25 + 인천 본토 8) + 광역시(부산·대구·광주·대전·울산) + 강원 + 충북 + 충남 + 세종 + 제주 ======
  // - 모든 URL은 2026-04-15 curl(Mozilla UA, Accept-Language: ko, --max-time 15) 검증 완료.
  // - title이 비어 보이는 경우는 해당 공식 도메인이 JS 기반 SPA로 렌더링되는 케이스(정적 HTML에 <title> 미삽입)이며, 브라우저로는 정상 렌더된다.
  // - 농업/도시농업 전담 부서의 개별 상세 페이지는 시·구별 IA가 달라 대표 누리집으로 통일했으나,
  //   Step 2c(2026-04-15)에서 공식 농업기술센터/도시농업 포털이 확인된 9개 시·군은 해당 서브경로로 승격했다.
  //
  // Step 2c (2026-04-15) ECONNREFUSED 6건 재검증 결과 및 처리:
  //   · 대구 수성구(suseong.go.kr) — curl/WebFetch 재차 ECONNREFUSED. 구 단위 농업부서 없음 → 대구광역시 농업기술센터로 폴백.
  //   · 광주 동구(donggu.gwangju.kr) — ERR_TLS_CERT_ALTNAME_INVALID 지속. 구 단위 농업부서 없음 → 광주광역시 농업·도시농업 포털로 폴백.
  //   · 대전 동구(donggu.daejeon.go.kr) — ECONNREFUSED 지속 → 대전광역시 농업기술센터로 폴백.
  //   · 대전 서구(seogu.daejeon.go.kr) — ECONNREFUSED 지속 → 대전광역시 농업기술센터로 폴백.
  //   · 울산 남구(namgu.ulsan.kr) — ECONNREFUSED 지속 → 울산광역시 농업기술센터로 폴백.
  //   · 강원 횡성(hoengseong.go.kr) — ECONNREFUSED 지속 → 강원특별자치도청 귀농귀촌 분야 페이지로 폴백.
  //   (6건 모두 빌드 환경 IP 차단으로 추정되나 curl + WebFetch 삼중 확인에도 접속 불가하여 광역 폴백 유지.)

  // -- 서울 --
  {
    id: "seoul-jongno-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "종로구",
    sigunguSlug: "jongno",
    category: "sigungu",
    name: "종로구청 (대표 누리집)",
    url: "https://www.jongno.go.kr/portalMain.do",
    // 검증 2026-04-15: HTTP 200, title="종로구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-jung-gu-seoul-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "중구",
    sigunguSlug: "jung-gu-seoul",
    category: "sigungu",
    name: "중구청 (대표 누리집)",
    url: "https://junggu.seoul.kr/",
    // 검증 2026-04-15: HTTP 200, 공식 도메인(junggu.seoul.kr) SPA 렌더링
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-yongsan-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "용산구",
    sigunguSlug: "yongsan",
    category: "sigungu",
    name: "용산구청 (대표 누리집)",
    url: "https://yongsan.go.kr/portal/main/main.do",
    // 검증 2026-04-15: HTTP 200, title="용산구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-seongdong-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "성동구",
    sigunguSlug: "seongdong",
    category: "sigungu",
    name: "성동구청 (대표 누리집)",
    url: "https://www.sd.go.kr/main/index.do",
    // 검증 2026-04-15: HTTP 200, title="성동구 - 더불어 행복한 스마트포용도시 성동"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-gwangjin-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "광진구",
    sigunguSlug: "gwangjin",
    category: "sigungu",
    name: "광진구청 (대표 누리집)",
    url: "https://gwangjin.go.kr/portal/main/main.do",
    // 검증 2026-04-15: HTTP 200, title="광진구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-dongdaemun-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "동대문구",
    sigunguSlug: "dongdaemun",
    category: "sigungu",
    name: "동대문구청 (대표 누리집)",
    url: "https://www.ddm.go.kr/",
    // 검증 2026-04-15: HTTP 200, 공식 도메인(ddm.go.kr) SPA 렌더링
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-jungnang-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "중랑구",
    sigunguSlug: "jungnang",
    category: "sigungu",
    name: "중랑구청 (대표 누리집)",
    url: "https://www.jungnang.go.kr/portal/main.do",
    // 검증 2026-04-15: HTTP 200, title="중랑구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-seongbuk-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "성북구",
    sigunguSlug: "seongbuk",
    category: "sigungu",
    name: "성북구청 (대표 누리집)",
    url: "https://sb.go.kr/",
    // 검증 2026-04-15: HTTP 200, 공식 도메인(sb.go.kr) SPA 렌더링
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-gangbuk-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "강북구",
    sigunguSlug: "gangbuk",
    category: "sigungu",
    name: "강북구청 (대표 누리집)",
    url: "https://gangbuk.go.kr/",
    // 검증 2026-04-15: HTTP 200, 공식 도메인(gangbuk.go.kr) SPA 렌더링
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-dobong-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "도봉구",
    sigunguSlug: "dobong",
    category: "sigungu",
    name: "도봉구청 (대표 누리집)",
    url: "https://www.dobong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="도봉구청 대표 사이트"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-nowon-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "노원구",
    sigunguSlug: "nowon",
    category: "sigungu",
    name: "노원구청 (대표 누리집)",
    url: "https://www.nowon.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="노원구청 : 노원구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-eunpyeong-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "은평구",
    sigunguSlug: "eunpyeong",
    category: "sigungu",
    name: "은평구청 (대표 누리집)",
    url: "https://www.ep.go.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="은평구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-seodaemun-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "서대문구",
    sigunguSlug: "seodaemun",
    category: "sigungu",
    name: "서대문구청 (대표 누리집)",
    url: "https://sdm.go.kr/index.do",
    // 검증 2026-04-15: HTTP 200, 공식 서대문구청 도메인(SPA 렌더, 타이틀 인코딩 이슈)
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-mapo-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "마포구",
    sigunguSlug: "mapo",
    category: "sigungu",
    name: "마포구청 (대표 누리집)",
    url: "https://www.mapo.go.kr/site/main/home",
    // 검증 2026-04-15: HTTP 200, title="마포구청 | 대표사이트"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-yangcheon-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "양천구",
    sigunguSlug: "yangcheon",
    category: "sigungu",
    name: "양천구청 (대표 누리집)",
    url: "https://www.yangcheon.go.kr/site/yangcheon/main.do",
    // 검증 2026-04-15: HTTP 200, title="양천구청 대표홈페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-gangseo-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "강서구",
    sigunguSlug: "gangseo",
    category: "sigungu",
    name: "강서구청 (대표 누리집)",
    url: "https://www.gangseo.seoul.kr/index",
    // 검증 2026-04-15: HTTP 200, title="강서구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-guro-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "구로구",
    sigunguSlug: "guro",
    category: "sigungu",
    name: "구로구청 (대표 누리집)",
    url: "https://www.guro.go.kr:443/",
    // 검증 2026-04-15: HTTP 200, title="구로구청 홈페이지에 오신것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-geumcheon-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "금천구",
    sigunguSlug: "geumcheon",
    category: "sigungu",
    name: "금천구청 (대표 누리집)",
    url: "https://geumcheon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="금천구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-yeongdeungpo-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "영등포구",
    sigunguSlug: "yeongdeungpo",
    category: "sigungu",
    name: "영등포구청 (대표 누리집)",
    url: "https://www.ydp.go.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="희망 행복 미래도시 영등포"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-dongjak-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "동작구",
    sigunguSlug: "dongjak",
    category: "sigungu",
    name: "동작구청 (대표 누리집)",
    url: "https://www.dongjak.go.kr/portal/main/main.do",
    // 검증 2026-04-15: HTTP 200, title="동작구청 포털사이트"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-gwanak-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "관악구",
    sigunguSlug: "gwanak",
    category: "sigungu",
    name: "관악구청 (대표 누리집)",
    url: "https://www.gwanak.go.kr/site/gwanak/main.do",
    // 검증 2026-04-15: HTTP 200, title="관악구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-seocho-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "서초구",
    sigunguSlug: "seocho",
    category: "sigungu",
    name: "서초구청 (대표 누리집)",
    url: "https://www.seocho.go.kr:443/",
    // 검증 2026-04-15: HTTP 200, title="서초구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-gangnam-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "강남구",
    sigunguSlug: "gangnam",
    category: "sigungu",
    name: "강남구청 (대표 누리집)",
    url: "https://gangnam.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="강남구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-songpa-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "송파구",
    sigunguSlug: "songpa",
    category: "sigungu",
    name: "송파구청 (대표 누리집)",
    url: "https://www.songpa.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="송파구청에 오신것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "seoul-gangdong-sigungu",
    sido: "서울",
    sidoSlug: "seoul",
    sigungu: "강동구",
    sigunguSlug: "gangdong",
    category: "sigungu",
    // Step 2c 승격: 강동구 공식 도시농업 포털(cityfarm 서브도메인)로 교체 — 귀농·도시농업 맥락에 더 적합.
    name: "강동구청 도시농업포털",
    url: "https://cityfarm.gangdong.go.kr/site/main/home",
    // 검증 2026-04-15: HTTP 200, title="Home::강동구청 도시농업포털"
    verifiedAt: "2026-04-15",
  },
  // -- 인천 --
  {
    id: "incheon-jung-gu-incheon-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "중구",
    sigunguSlug: "jung-gu-incheon",
    category: "sigungu",
    name: "중구청 (대표 누리집)",
    url: "https://www.icjg.go.kr/index",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 중구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-dong-gu-incheon-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "동구",
    sigunguSlug: "dong-gu-incheon",
    category: "sigungu",
    name: "동구청 (대표 누리집)",
    url: "https://www.icdonggu.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 동구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-michuhol-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "미추홀구",
    sigunguSlug: "michuhol",
    category: "sigungu",
    name: "미추홀구청 (대표 누리집)",
    url: "https://www.michuhol.go.kr/main/main.do",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 미추홀구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-yeonsu-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "연수구",
    sigunguSlug: "yeonsu",
    category: "sigungu",
    name: "연수구청 (대표 누리집)",
    url: "https://www.yeonsu.go.kr/main/",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 연수구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-namdong-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "남동구",
    sigunguSlug: "namdong",
    category: "sigungu",
    name: "남동구청 (대표 누리집)",
    url: "https://www.namdong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="남동구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-bupyeong-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "부평구",
    sigunguSlug: "bupyeong",
    category: "sigungu",
    name: "부평구청 (대표 누리집)",
    url: "https://www.icbp.go.kr/main/",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 부평구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-gyeyang-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "계양구",
    sigunguSlug: "gyeyang",
    category: "sigungu",
    name: "계양구청 (대표 누리집)",
    url: "https://www.gyeyang.go.kr/open_content/main/",
    // 검증 2026-04-15: HTTP 200, title="계양구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "incheon-seo-gu-incheon-sigungu",
    sido: "인천",
    sidoSlug: "incheon",
    sigungu: "서구",
    sigunguSlug: "seo-gu-incheon",
    category: "sigungu",
    name: "서구청 (대표 누리집)",
    url: "https://seo.incheon.kr/open_content/main/",
    // 검증 2026-04-15: HTTP 200, title="인천광역시 서구청"
    verifiedAt: "2026-04-15",
  },
  // -- 부산 --
  {
    id: "busan-jung-gu-busan-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "중구",
    sigunguSlug: "jung-gu-busan",
    category: "sigungu",
    name: "중구청 (대표 누리집)",
    url: "https://www.bsjunggu.go.kr/index.junggu",
    // 검증 2026-04-15: HTTP 200, title="부산광역시 중구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-seo-gu-busan-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "서구",
    sigunguSlug: "seo-gu-busan",
    category: "sigungu",
    name: "서구청 (대표 누리집)",
    url: "https://www.bsseogu.go.kr/index.bsseogu",
    // 검증 2026-04-15: HTTP 200, title="부산광역시 서구청 홈페이지에 오신 것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-dong-gu-busan-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "동구",
    sigunguSlug: "dong-gu-busan",
    category: "sigungu",
    name: "동구청 (대표 누리집)",
    url: "https://www.bsdonggu.go.kr/",
    // 검증 2026-04-15: HTTP 200(→/index.donggu), title="부산광역시 동구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-yeongdo-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "영도구",
    sigunguSlug: "yeongdo",
    category: "sigungu",
    name: "영도구청 (대표 누리집)",
    url: "https://www.yeongdo.go.kr/main.web",
    // 검증 2026-04-15: HTTP 200, title="영도구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-busanjin-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "부산진구",
    sigunguSlug: "busanjin",
    category: "sigungu",
    name: "부산진구청 (대표 누리집)",
    url: "https://busanjin.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="부산진구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-dongnae-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "동래구",
    sigunguSlug: "dongnae",
    category: "sigungu",
    name: "동래구청 (대표 누리집)",
    url: "https://www.dongnae.go.kr/index.dongnae",
    // 검증 2026-04-15: HTTP 200, title="동래구청 홈페이지에 오신것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-nam-gu-busan-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "남구",
    sigunguSlug: "nam-gu-busan",
    category: "sigungu",
    name: "남구청 (대표 누리집)",
    url: "https://bsnamgu.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="부산 남구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-buk-gu-busan-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "북구",
    sigunguSlug: "buk-gu-busan",
    category: "sigungu",
    name: "북구청 (대표 누리집)",
    url: "https://www.bsbukgu.go.kr/index.bsbukgu",
    // 검증 2026-04-15: HTTP 200, title="부산북구청 대표 홈페이지에 오신것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-haeundae-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "해운대구",
    sigunguSlug: "haeundae",
    category: "sigungu",
    name: "해운대구청 (대표 누리집)",
    url: "https://haeundae.go.kr/",
    // 검증 2026-04-15: HTTP 200, 공식 도메인(haeundae.go.kr) SPA 렌더링
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-saha-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "사하구",
    sigunguSlug: "saha",
    category: "sigungu",
    name: "사하구청 (대표 누리집)",
    url: "https://www.saha.go.kr/main.do",
    // 검증 2026-04-15: HTTP 200, title="부산광역시 사하구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-geumjeong-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "금정구",
    sigunguSlug: "geumjeong",
    category: "sigungu",
    name: "금정구청 (대표 누리집)",
    url: "https://www.geumjeong.go.kr/index.geumj",
    // 검증 2026-04-15: HTTP 200, title="부산광역시 금정구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-gangseo-busan-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "강서구",
    sigunguSlug: "gangseo-busan",
    category: "sigungu",
    name: "강서구청 (대표 누리집)",
    url: "https://bsgangseo.go.kr/main.do",
    // 검증 2026-04-15: HTTP 200, title="부산광역시 강서구청에 오신 것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-yeonje-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "연제구",
    sigunguSlug: "yeonje",
    category: "sigungu",
    name: "연제구청 (대표 누리집)",
    url: "https://yeonje.go.kr/main.do",
    // 검증 2026-04-15: HTTP 200, title="부산연제구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-suyeong-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "수영구",
    sigunguSlug: "suyeong",
    category: "sigungu",
    name: "수영구청 (대표 누리집)",
    url: "https://www.suyeong.go.kr/index.suyeong",
    // 검증 2026-04-15: HTTP 200, title="부산광역시 수영구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-sasang-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "사상구",
    sigunguSlug: "sasang",
    category: "sigungu",
    name: "사상구청 (대표 누리집)",
    url: "https://www.sasang.go.kr/index.sasang",
    // 검증 2026-04-15: HTTP 200, title="사상구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "busan-gijang-sigungu",
    sido: "부산",
    sidoSlug: "busan",
    sigungu: "기장군",
    sigunguSlug: "gijang",
    category: "sigungu",
    name: "기장군청 (대표 누리집)",
    url: "https://gijang.go.kr/index.gijang",
    // 검증 2026-04-15: HTTP 200, title="기장군청"
    verifiedAt: "2026-04-15",
  },
  // -- 대구 --
  {
    id: "daegu-jung-gu-daegu-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "중구",
    sigunguSlug: "jung-gu-daegu",
    category: "sigungu",
    name: "중구청 (대표 누리집)",
    url: "https://jung.daegu.kr/",
    // 검증 2026-04-15: HTTP 200, 공식 도메인(jung.daegu.kr) SPA 렌더링
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-dong-gu-daegu-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "동구",
    sigunguSlug: "dong-gu-daegu",
    category: "sigungu",
    name: "동구청 (대표 누리집)",
    url: "https://dong.daegu.kr/main.do",
    // 검증 2026-04-15: HTTP 200, title="대구광역시 동구청 홈페이지에 오신 것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-seo-gu-daegu-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "서구",
    sigunguSlug: "seo-gu-daegu",
    category: "sigungu",
    name: "서구청 (대표 누리집)",
    url: "https://dgs.go.kr/main.do",
    // 검증 2026-04-15: HTTP 200, title="대구광역시 서구청 홈페이지에 오신것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-nam-gu-daegu-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "남구",
    sigunguSlug: "nam-gu-daegu",
    category: "sigungu",
    name: "남구청 (대표 누리집)",
    url: "https://nam.daegu.kr/",
    // 검증 2026-04-15: HTTP 200, title="대구광역시 남구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-buk-gu-daegu-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "북구",
    sigunguSlug: "buk-gu-daegu",
    category: "sigungu",
    name: "북구청 (대표 누리집)",
    url: "https://www.buk.daegu.kr/",
    // 검증 2026-04-15: HTTP 200, title="대구광역시 북구 > >"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-dalseo-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "달서구",
    sigunguSlug: "dalseo",
    category: "sigungu",
    name: "달서구청 (대표 누리집)",
    url: "https://dalseo.daegu.kr/",
    // 검증 2026-04-15: HTTP 200, title="대구광역시 달서구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-dalseong-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "달성군",
    sigunguSlug: "dalseong",
    category: "sigungu",
    name: "달성군청 (대표 누리집)",
    url: "https://dalseong.daegu.kr/",
    // 검증 2026-04-15: HTTP 200, title="군민이 빛나는 달성(대구광역시 달성군)"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daegu-suseong-sigungu",
    sido: "대구",
    sidoSlug: "daegu",
    sigungu: "수성구",
    sigunguSlug: "suseong",
    category: "sigungu",
    // Step 2c 폴백: 수성구청 도메인(suseong.go.kr) 빌드 환경 ECONNREFUSED 지속 → 대구광역시 농업기술센터
    name: "대구광역시 농업기술센터 (수성구 폴백)",
    url: "https://daegu.go.kr/agri/",
    // 검증 2026-04-15: HTTP 200, title="대구광역시 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  // -- 광주 --
  {
    id: "gwangju-seo-gu-gwangju-sigungu",
    sido: "광주",
    sidoSlug: "gwangju",
    sigungu: "서구",
    sigunguSlug: "seo-gu-gwangju",
    category: "sigungu",
    name: "서구청 (대표 누리집)",
    url: "https://www.seogu.gwangju.kr/",
    // 검증 2026-04-15: HTTP 200, title="seogu"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gwangju-nam-gu-gwangju-sigungu",
    sido: "광주",
    sidoSlug: "gwangju",
    sigungu: "남구",
    sigunguSlug: "nam-gu-gwangju",
    category: "sigungu",
    name: "남구청 (대표 누리집)",
    url: "https://www.namgu.gwangju.kr/",
    // 검증 2026-04-15: HTTP 200, title="광주광역시 남구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gwangju-buk-gu-gwangju-sigungu",
    sido: "광주",
    sidoSlug: "gwangju",
    sigungu: "북구",
    sigunguSlug: "buk-gu-gwangju",
    category: "sigungu",
    name: "북구청 (대표 누리집)",
    url: "https://bukgu.gwangju.kr/",
    // 검증 2026-04-15: HTTP 200, title="광주광역시 북구"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gwangju-gwangsan-sigungu",
    sido: "광주",
    sidoSlug: "gwangju",
    sigungu: "광산구",
    sigunguSlug: "gwangsan",
    category: "sigungu",
    name: "광산구청 (대표 누리집)",
    url: "https://www.gwangsan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="광산구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gwangju-dong-gu-gwangju-sigungu",
    sido: "광주",
    sidoSlug: "gwangju",
    sigungu: "동구",
    sigunguSlug: "dong-gu-gwangju",
    category: "sigungu",
    // Step 2c 폴백: 동구청 도메인(donggu.gwangju.kr) ERR_TLS_CERT_ALTNAME_INVALID → 광주광역시 농업·도시농업 포털
    name: "광주광역시 농업·도시농업 (동구 폴백)",
    url: "https://www.gwangju.go.kr/agri/",
    // 검증 2026-04-15: HTTP 200, title="광주광역시 농업·도시농업"
    verifiedAt: "2026-04-15",
  },
  // -- 대전 --
  {
    id: "daejeon-jung-gu-daejeon-sigungu",
    sido: "대전",
    sidoSlug: "daejeon",
    sigungu: "중구",
    sigunguSlug: "jung-gu-daejeon",
    category: "sigungu",
    name: "중구청 (대표 누리집)",
    url: "https://djjunggu.go.kr/kr/index.do",
    // 검증 2026-04-15: HTTP 200, title="대전광역시 중구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daejeon-yuseong-sigungu",
    sido: "대전",
    sidoSlug: "daejeon",
    sigungu: "유성구",
    sigunguSlug: "yuseong",
    category: "sigungu",
    name: "유성구청 (대표 누리집)",
    url: "https://www.yuseong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="대전 유성구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daejeon-daedeok-sigungu",
    sido: "대전",
    sidoSlug: "daejeon",
    sigungu: "대덕구",
    sigunguSlug: "daedeok",
    category: "sigungu",
    name: "대덕구청 (대표 누리집)",
    url: "https://daedeok.go.kr/dpt/DPT.do",
    // 검증 2026-04-15: HTTP 200, title="대전광역시 대덕구청 홈페이지"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daejeon-dong-gu-daejeon-sigungu",
    sido: "대전",
    sidoSlug: "daejeon",
    sigungu: "동구",
    sigunguSlug: "dong-gu-daejeon",
    category: "sigungu",
    // Step 2c 폴백: 동구청 도메인(donggu.daejeon.go.kr) 빌드 환경 ECONNREFUSED 지속 → 대전광역시 농업기술센터
    name: "대전광역시 농업기술센터 (동구 폴백)",
    url: "https://www.daejeon.go.kr/far/index.do",
    // 검증 2026-04-15: HTTP 200, title="대전광역시 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "daejeon-seo-gu-daejeon-sigungu",
    sido: "대전",
    sidoSlug: "daejeon",
    sigungu: "서구",
    sigunguSlug: "seo-gu-daejeon",
    category: "sigungu",
    // Step 2c 폴백: 서구청 도메인(seogu.daejeon.go.kr) 빌드 환경 ECONNREFUSED 지속 → 대전광역시 농업기술센터
    name: "대전광역시 농업기술센터 (서구 폴백)",
    url: "https://www.daejeon.go.kr/far/index.do",
    // 검증 2026-04-15: HTTP 200, title="대전광역시 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  // -- 울산 --
  {
    id: "ulsan-jung-gu-ulsan-sigungu",
    sido: "울산",
    sidoSlug: "ulsan",
    sigungu: "중구",
    sigunguSlug: "jung-gu-ulsan",
    category: "sigungu",
    name: "중구청 (대표 누리집)",
    url: "https://www.junggu.ulsan.kr/index.ulsan",
    // 검증 2026-04-15: HTTP 200, title="누구나 살고싶은 종갓집 중구 [울산광역시 중구청]"
    verifiedAt: "2026-04-15",
  },
  {
    id: "ulsan-dong-gu-ulsan-sigungu",
    sido: "울산",
    sidoSlug: "ulsan",
    sigungu: "동구",
    sigunguSlug: "dong-gu-ulsan",
    category: "sigungu",
    name: "동구청 (대표 누리집)",
    url: "https://www.donggu.ulsan.kr/",
    // 검증 2026-04-15: HTTP 200, title="울산광역시 동구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "ulsan-buk-gu-ulsan-sigungu",
    sido: "울산",
    sidoSlug: "ulsan",
    sigungu: "북구",
    sigunguSlug: "buk-gu-ulsan",
    category: "sigungu",
    name: "북구청 (대표 누리집)",
    url: "https://www.bukgu.ulsan.kr/index.do;jsessionid=WyLG8s3ZyvfWEgaB9zeG31HNC1B565NZVc6XliEFRyUlgot6tQZNdX5apKcVz1Ca.www_ap_servlet_engine1",
    // 검증 2026-04-15: HTTP 200, title="울산광역시 북구청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "ulsan-ulju-sigungu",
    sido: "울산",
    sidoSlug: "ulsan",
    sigungu: "울주군",
    sigunguSlug: "ulju",
    category: "sigungu",
    name: "울주군청 (대표 누리집)",
    url: "https://www.ulju.ulsan.kr/ulju/main.do",
    // 검증 2026-04-15: HTTP 200, title="울산광역시 울주군 대표홈페이지에 오신 것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "ulsan-nam-gu-ulsan-sigungu",
    sido: "울산",
    sidoSlug: "ulsan",
    sigungu: "남구",
    sigunguSlug: "nam-gu-ulsan",
    category: "sigungu",
    // Step 2c 폴백: 남구청 도메인(namgu.ulsan.kr) 빌드 환경 ECONNREFUSED 지속 → 울산광역시 농업기술센터
    name: "울산광역시 농업기술센터 (남구 폴백)",
    url: "https://www.ulsan.go.kr/s/atc/main.ulsan",
    // 검증 2026-04-15: HTTP 200, title="울산광역시 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  // -- 강원 --
  {
    id: "gangwon-chuncheon-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "춘천시",
    sigunguSlug: "chuncheon",
    category: "sigungu",
    name: "춘천시청 (대표 누리집)",
    url: "https://www.chuncheon.go.kr/cityhall/",
    // 검증 2026-04-15: HTTP 200, title="춘천시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-wonju-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "원주시",
    sigunguSlug: "wonju",
    category: "sigungu",
    name: "원주시청 (대표 누리집)",
    url: "https://www.wonju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="원주시청 홈페이지에 오신것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-gangneung-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "강릉시",
    sigunguSlug: "gangneung",
    category: "sigungu",
    name: "강릉시청 (대표 누리집)",
    url: "https://gn.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="강릉시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-donghae-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "동해시",
    sigunguSlug: "donghae",
    category: "sigungu",
    // Step 2c 승격: 동해시 농업기술센터 서브경로로 교체
    name: "동해시 농업기술센터",
    url: "https://dh.go.kr/agriculture/index.do",
    // 검증 2026-04-15: HTTP 200, title=" - 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-taebaek-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "태백시",
    sigunguSlug: "taebaek",
    category: "sigungu",
    name: "태백시청 (대표 누리집)",
    url: "https://www.taebaek.go.kr/intro.jsp",
    // 검증 2026-04-15: HTTP 200, title="태백시"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-sokcho-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "속초시",
    sigunguSlug: "sokcho",
    category: "sigungu",
    name: "속초시청 (대표 누리집)",
    url: "https://sokcho.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="속초시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-samcheok-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "삼척시",
    sigunguSlug: "samcheok",
    category: "sigungu",
    name: "삼척시청 (대표 누리집)",
    url: "https://www.samcheok.go.kr/portal/intro/intro.jsp",
    // 검증 2026-04-15: HTTP 200, title="삼척시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-hongcheon-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "홍천군",
    sigunguSlug: "hongcheon",
    category: "sigungu",
    name: "홍천군청 (대표 누리집)",
    url: "https://www.hongcheon.go.kr/hongcheon_intro_new/intro.html",
    // 검증 2026-04-15: HTTP 200, title="홍천군 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-hoengseong-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "횡성군",
    sigunguSlug: "hoengseong",
    category: "sigungu",
    // Step 2c 폴백: 횡성군청 도메인(hoengseong.go.kr) 빌드 환경 ECONNREFUSED 지속 → 강원특별자치도청 귀농귀촌 분야 페이지
    name: "강원특별자치도 귀농귀촌 (횡성군 폴백)",
    url: "https://state.gwd.go.kr/portal/partinfo/livestock/agriculture/return",
    // 검증 2026-04-15: HTTP 200, title="귀농귀촌 현황  - 분야별정보 | 강원특별자치도청 - 새로운 강원! 특별 자치시대!"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-yeongwol-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "영월군",
    sigunguSlug: "yeongwol",
    category: "sigungu",
    name: "영월군청 (대표 누리집)",
    url: "https://www.yw.go.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="영월군"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-pyeongchang-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "평창군",
    sigunguSlug: "pyeongchang",
    category: "sigungu",
    name: "평창군청 (대표 누리집)",
    url: "https://pc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="평창군입니다. 평창행정"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-jeongseon-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "정선군",
    sigunguSlug: "jeongseon",
    category: "sigungu",
    name: "정선군청 (대표 누리집)",
    url: "https://jeongseon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="정선군청 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-cheorwon-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "철원군",
    sigunguSlug: "cheorwon",
    category: "sigungu",
    // Step 2c 승격: 철원군 농업기술센터 서브경로로 교체
    name: "철원군 농업기술센터",
    url: "https://www.cwg.go.kr/atc/index.do",
    // 검증 2026-04-15: HTTP 200, title="철원군 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-hwacheon-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "화천군",
    sigunguSlug: "hwacheon",
    category: "sigungu",
    name: "화천군청 (대표 누리집)",
    url: "https://www.ihc.go.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="화천군 대표 누리집"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-yanggu-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "양구군",
    sigunguSlug: "yanggu",
    category: "sigungu",
    name: "양구군청 (대표 누리집)",
    url: "https://yanggu.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="국토의 정중앙 양구에 오신걸 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-inje-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "인제군",
    sigunguSlug: "inje",
    category: "sigungu",
    name: "인제군청 (대표 누리집)",
    url: "https://inje.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="인제군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-goseong-gw-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "고성군",
    sigunguSlug: "goseong-gw",
    category: "sigungu",
    name: "고성군청 (대표 누리집)",
    url: "https://gwgs.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="강원고성군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "gangwon-yangyang-sigungu",
    sido: "강원",
    sidoSlug: "gangwon",
    sigungu: "양양군",
    sigunguSlug: "yangyang",
    category: "sigungu",
    name: "양양군청 (대표 누리집)",
    url: "https://yangyang.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="해 오름의 고장 양양에 오신 것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  // -- 충북 --
  {
    id: "chungbuk-cheongju-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "청주시",
    sigunguSlug: "cheongju",
    category: "sigungu",
    name: "청주시청 (대표 누리집)",
    url: "https://intro.cheongju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="청주시청 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-chungju-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "충주시",
    sigunguSlug: "chungju",
    category: "sigungu",
    name: "충주시청 (대표 누리집)",
    url: "https://www.chungju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="충주시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-jecheon-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "제천시",
    sigunguSlug: "jecheon",
    category: "sigungu",
    name: "제천시청 (대표 누리집)",
    url: "https://www.jecheon.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="제천시청에 오신 것을 환영합니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-boeun-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "보은군",
    sigunguSlug: "boeun",
    category: "sigungu",
    // Step 2c 승격: 보은군 농업기술센터 서브경로(bio)로 교체
    name: "보은군 농업기술센터",
    url: "https://www.boeun.go.kr/bio/index.do",
    // 검증 2026-04-15: HTTP 200, title="농업기술센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-okcheon-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "옥천군",
    sigunguSlug: "okcheon",
    category: "sigungu",
    name: "옥천군청 (대표 누리집)",
    url: "https://oc.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="옥천군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-yeongdong-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "영동군",
    sigunguSlug: "yeongdong",
    category: "sigungu",
    name: "영동군청 (대표 누리집)",
    url: "https://www.yd21.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="영동군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-jeungpyeong-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "증평군",
    sigunguSlug: "jeungpyeong",
    category: "sigungu",
    name: "증평군청 (대표 누리집)",
    url: "https://www.jp.go.kr/kor.do",
    // 검증 2026-04-15: HTTP 200, title="증평군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-jincheon-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "진천군",
    sigunguSlug: "jincheon",
    category: "sigungu",
    name: "진천군청 (대표 누리집)",
    url: "https://www.jincheon.go.kr/home/intro.do",
    // 검증 2026-04-15: HTTP 200, title="진천군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-goesan-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "괴산군",
    sigunguSlug: "goesan",
    category: "sigungu",
    name: "괴산군청 (대표 누리집)",
    url: "https://goesan.go.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="괴산군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-eumseong-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "음성군",
    sigunguSlug: "eumseong",
    category: "sigungu",
    // Step 2c 승격: 음성군 농업기술센터 서브경로(esatc)로 교체
    name: "음성군 농업기술센터",
    url: "https://www.eumseong.go.kr/esatc/index.do",
    // 검증 2026-04-15: HTTP 200, title="농업기술센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungbuk-danyang-sigungu",
    sido: "충북",
    sidoSlug: "chungbuk",
    sigungu: "단양군",
    sigunguSlug: "danyang",
    category: "sigungu",
    name: "단양군청 (대표 누리집)",
    url: "https://danyang.go.kr/dy21/1",
    // 검증 2026-04-15: HTTP 200, title="단양군"
    verifiedAt: "2026-04-15",
  },
  // -- 충남 --
  {
    id: "chungnam-cheonan-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "천안시",
    sigunguSlug: "cheonan",
    category: "sigungu",
    name: "천안시청 (대표 누리집)",
    url: "https://www.cheonan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="천안시청 인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-gongju-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "공주시",
    sigunguSlug: "gongju",
    category: "sigungu",
    name: "공주시청 (대표 누리집)",
    url: "https://gongju.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="공주시청_인트로"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-boryeong-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "보령시",
    sigunguSlug: "boryeong",
    category: "sigungu",
    name: "보령시청 (대표 누리집)",
    url: "https://brcn.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="보령시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-asan-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "아산시",
    sigunguSlug: "asan",
    category: "sigungu",
    // Step 2c 승격: 아산시 농업기술센터 전용 서브도메인으로 교체
    name: "아산시 농업기술센터",
    url: "https://farm.asan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="아산시 농업기술센터 홈페이지입니다."
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-seosan-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "서산시",
    sigunguSlug: "seosan",
    category: "sigungu",
    name: "서산시청 (대표 누리집)",
    url: "https://www.seosan.go.kr/www/index.do",
    // 검증 2026-04-15: HTTP 200, title="서산시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-nonsan-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "논산시",
    sigunguSlug: "nonsan",
    category: "sigungu",
    name: "논산시청 (대표 누리집)",
    url: "https://nonsan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="논산시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-gyeryong-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "계룡시",
    sigunguSlug: "gyeryong",
    category: "sigungu",
    name: "계룡시청 (대표 누리집)",
    url: "https://gyeryong.go.kr/kr/",
    // 검증 2026-04-15: HTTP 200, title="계룡시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-dangjin-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "당진시",
    sigunguSlug: "dangjin",
    category: "sigungu",
    name: "당진시청 (대표 누리집)",
    url: "https://www.dangjin.go.kr/kor.do",
    // 검증 2026-04-15: HTTP 200, title="당진시청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-geumsan-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "금산군",
    sigunguSlug: "geumsan",
    category: "sigungu",
    name: "금산군청 (대표 누리집)",
    url: "https://geumsan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="금산군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-buyeo-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "부여군",
    sigunguSlug: "buyeo",
    category: "sigungu",
    name: "부여군청 (대표 누리집)",
    url: "https://buyeo.go.kr/intro.html",
    // 검증 2026-04-15: HTTP 200, title="부여군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-seocheon-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "서천군",
    sigunguSlug: "seocheon",
    category: "sigungu",
    name: "서천군청 (대표 누리집)",
    url: "http://www.seocheon.go.kr/kor.do",
    // 검증 2026-04-15: HTTP 200, title="서천군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-cheongyang-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "청양군",
    sigunguSlug: "cheongyang",
    category: "sigungu",
    name: "청양군청 (대표 누리집)",
    url: "https://www.cheongyang.go.kr/kor.do",
    // 검증 2026-04-15: HTTP 200, title="청양군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-hongseong-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "홍성군",
    sigunguSlug: "hongseong",
    category: "sigungu",
    name: "홍성군청 (대표 누리집)",
    url: "https://hongseong.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="홍성군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-yesan-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "예산군",
    sigunguSlug: "yesan",
    category: "sigungu",
    name: "예산군청 (대표 누리집)",
    url: "https://yesan.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="예산군청"
    verifiedAt: "2026-04-15",
  },
  {
    id: "chungnam-taean-sigungu",
    sido: "충남",
    sidoSlug: "chungnam",
    sigungu: "태안군",
    sigunguSlug: "taean",
    category: "sigungu",
    // Step 2c 승격: 태안군 농업기술센터 서브경로(farm)로 교체
    name: "태안군 농업기술센터",
    url: "https://www.taean.go.kr/farm.do",
    // 검증 2026-04-15: HTTP 200, title="태안군 농업기술센터"
    verifiedAt: "2026-04-15",
  },
  // -- 세종 --
  {
    id: "sejong-sejong-si-sigungu",
    sido: "세종",
    sidoSlug: "sejong",
    sigungu: "세종특별자치시",
    sigunguSlug: "sejong-si",
    category: "sigungu",
    name: "세종특별자치시 (대표 누리집)",
    url: "https://www.sejong.go.kr/kor.do",
    // 검증 2026-04-15: HTTP 200, title="세종소개"
    verifiedAt: "2026-04-15",
  },
  // -- 제주 --
  {
    id: "jeju-jeju-si-sigungu",
    sido: "제주",
    sidoSlug: "jeju",
    sigungu: "제주시",
    sigunguSlug: "jeju-si",
    category: "sigungu",
    // Step 2c 승격: 제주특별자치도 제주농업기술센터(agri 서브도메인)로 교체
    name: "제주농업기술센터",
    url: "https://agri.jeju.go.kr/jeju/index.htm",
    // 검증 2026-04-15: HTTP 200, title="제주농업기술센터"
    verifiedAt: "2026-04-15",
  },
  {
    id: "jeju-seogwipo-sigungu",
    sido: "제주",
    sidoSlug: "jeju",
    sigungu: "서귀포시",
    sigunguSlug: "seogwipo",
    category: "sigungu",
    name: "서귀포시청 (대표 누리집)",
    url: "https://seogwipo.go.kr/",
    // 검증 2026-04-15: HTTP 200, title="메인 - 서귀포시"
    verifiedAt: "2026-04-15",
  },
];

/** sidoSlug로 광역 센터 조회 */
export function getSidoCenter(sidoSlug: string): Center | undefined {
  return CENTERS.find((c) => c.category === "sido" && c.sidoSlug === sidoSlug);
}

/** sigunguSlug로 기초 센터 조회 */
export function getSigunguCenter(sigunguSlug: string): Center | undefined {
  return CENTERS.find(
    (c) => c.category === "sigungu" && c.sigunguSlug === sigunguSlug,
  );
}

/** sidoSlug에 속한 모든 기초 센터 조회 */
export function getSigunguCentersBySido(sidoSlug: string): Center[] {
  return CENTERS.filter(
    (c) => c.category === "sigungu" && c.sidoSlug === sidoSlug,
  );
}
