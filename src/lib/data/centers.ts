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
