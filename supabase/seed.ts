/**
 * Supabase 시드 스크립트
 * - 실제 검증 데이터를 Supabase DB로 마이그레이션
 * - 실행: npx tsx supabase/seed.ts
 * - 마지막 업데이트: 2026-04-06
 *
 * 필요 환경변수:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ 환경변수를 설정해주세요:\n" +
      "   NEXT_PUBLIC_SUPABASE_URL\n" +
      "   SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ═══════════════════════════════════════
// 지원사업 시드 데이터 (실제 검증 — 2026-04-06)
// ═══════════════════════════════════════
const programsSeed = [
  {
    slug: "SP-001",
    title: "귀농 농업창업 및 주택구입 지원사업",
    summary: "귀농인의 농업창업자금과 농촌주택 구입자금을 저금리 융자로 지원하는 농식품부 대표 정착사업.",
    region: "전국",
    organization: "농림축산식품부 / 각 시군 농업기술센터",
    support_type: "융자",
    support_amount: "농업창업 최대 3억원 / 주택구입 최대 7,500만원 (5년 거치 10년 상환)",
    eligibility_age_min: 18,
    eligibility_age_max: 65,
    eligibility_detail: "농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 100시간 이상 이수.",
    application_start: "2026-01-12",
    application_end: "2026-02-13",
    status: "마감",
    related_crops: [],
    source_url: "https://www.gunsan.go.kr/farm/m2435/view/8495763",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "SP-002",
    title: "청년농업인 영농정착지원사업 (청년창업형 후계농업경영인)",
    summary: "만 39세 이하 청년농업인에게 독립경영 초기 3년간 월 정착지원금을 지급하는 보조금 사업.",
    region: "전국",
    organization: "농림축산식품부",
    support_type: "보조금",
    support_amount: "독립경영 1년차 월 110만원, 2년차 월 100만원, 3년차 월 90만원",
    eligibility_age_min: 18,
    eligibility_age_max: 39,
    eligibility_detail: "만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록.",
    application_start: "2025-11-05",
    application_end: "2025-12-11",
    status: "마감",
    related_crops: [],
    source_url: "https://agro.seoul.go.kr/archives/54938",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "SP-003",
    title: "충남 스마트팜 청년창업 교육 및 창업지원 (제8기)",
    summary: "충남 청년농업인 대상 6개월 스마트팜 교육과정(이론+실습+현장)으로 창업역량을 지원.",
    region: "충청남도",
    organization: "충청남도농업기술원",
    support_type: "교육",
    support_amount: "교육 수강료 전액 지원 + 현장실습 훈련비 월 최대 100만원",
    eligibility_age_min: 18,
    eligibility_age_max: 44,
    eligibility_detail: "충남도내 청년농업인 또는 충남 전입 예정자. 6개월 과정(이론+실습+현장).",
    application_start: "2025-12-29",
    application_end: "2026-01-02",
    status: "마감",
    related_crops: ["딸기", "토마토", "파프리카"],
    source_url: "https://youth.chungnam.go.kr/web/main/bbs/cnyouth_notice/497",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "SP-005",
    title: "함평군 귀농어귀촌 체류형 지원센터 입교 (제6기)",
    summary: "함평군에서 귀농 희망자에게 주거공간·공동실습농지·시설하우스를 제공하는 체류형 교육.",
    region: "전라남도",
    organization: "함평군 귀농어귀촌 체류형 지원센터",
    support_type: "현물",
    support_amount: "주거공간 제공 + 공동실습농지·시설하우스·작업장 이용 (21세대)",
    eligibility_age_min: 18,
    eligibility_age_max: 65,
    eligibility_detail: "만 65세 이하. 도시지역 1년 이상 거주 후 함평군 전입 6개월 이내 또는 이주 희망 예비귀농인.",
    application_start: "2026-01-10",
    application_end: "2026-02-10",
    status: "마감",
    related_crops: [],
    source_url: "https://www.asiaa.co.kr/news/articleView.html?idxno=237422",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "SP-008",
    title: "연천군 신규농업인 선도농가 현장실습 교육",
    summary: "연천군 귀농귀촌인 대상 선도농가 현장실습 교육으로 월 80만원 교육훈련비를 지급.",
    region: "경기도",
    organization: "연천군 농업기술센터",
    support_type: "교육",
    support_amount: "연수생 월 80만원 교육훈련비 + 선도농가 월 40만원 교수수당",
    eligibility_age_min: 18,
    eligibility_age_max: 65,
    eligibility_detail: "최근 5년 이내 해당 지역 농촌으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년.",
    application_start: "2026-04-01",
    application_end: "2026-04-17",
    status: "마감",
    related_crops: [],
    source_url: "https://www.post24.kr/319532",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "SP-011",
    title: "귀농닥터 멘토링 (선도농가 현장실습 교육 지원)",
    summary: "귀농귀촌 희망자에게 무료 1:1 현장 컨설팅과 선도농가 기술 전수를 제공하는 상시 프로그램.",
    region: "전국",
    organization: "농촌진흥청 / 각 시군 농업기술센터",
    support_type: "컨설팅",
    support_amount: "무료 1:1 현장 컨설팅 + 선도농가 기술 전수",
    eligibility_age_min: 18,
    eligibility_age_max: 65,
    eligibility_detail: "귀농귀촌 희망자 및 농촌 거주 1년 미만. 각 지역 농업기술센터 또는 그린대로에서 신청.",
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    related_crops: [],
    source_url: "https://www.rda.go.kr/young/content/content76.do",
    year: 2026,
    is_verified: true,
  },
];

// ═══════════════════════════════════════
// 교육과정 시드 데이터 (실제 검증 — 2026-04-06)
// ═══════════════════════════════════════
const educationSeed = [
  {
    slug: "ED-001",
    title: "서울시 전원생활교육 (귀촌 준비 기초)",
    region: "서울특별시",
    organization: "서울시 농업기술센터",
    type: "오프라인",
    duration: "30시간 (5일)",
    schedule: "1기 3.23~27 / 2기 4.6~10 / 3기 4.20~24",
    target: "서울시민 (5년 이내 수강자 제외)",
    cost: "무료",
    description: "전원생활 준비 및 성공사례, 채소·과수·화훼 기초영농기술, 농기계 안전사용법을 배우는 서울시 공식 귀촌 준비 교육 과정입니다.",
    capacity: 40,
    application_start: "2026-02-10",
    application_end: "2026-04-17",
    status: "모집중",
    level: "입문",
    url: "https://agro.seoul.go.kr/archives/55475",
    is_verified: true,
  },
  {
    slug: "ED-002",
    title: "서울시 스마트팜 실용교육",
    region: "서울특별시",
    organization: "서울시 농업기술센터",
    type: "오프라인",
    duration: "14시간 (3일)",
    schedule: "2026.4.21(월) ~ 4.23(수)",
    target: "서울 거주자 (주민등록상)",
    cost: "무료",
    description: "식물공장과 아쿠아포닉스, 디지털농업 동향 및 사례, 강남농협 현장견학, 스마트팜 원예작물 재배생리를 배우는 실용 교육입니다.",
    capacity: 45,
    application_start: "2026-04-06",
    application_end: "2026-04-10",
    status: "모집중",
    level: "초급",
    url: "https://agro.seoul.go.kr/archives/55870",
    is_verified: true,
  },
  {
    slug: "ED-006",
    title: "농촌진흥청 농촌인적자원개발센터 교육 (연간 391개 과정)",
    region: "전국",
    organization: "농촌진흥청 농촌인적자원개발센터",
    type: "혼합",
    duration: "과정별 상이 (연간 391개 과정)",
    schedule: "상시 운영",
    target: "귀농귀촌 희망자 및 농업인 누구나",
    cost: "국비 70~90% 지원 (개인 부담 최소)",
    description: "귀농귀촌 아카데미, 맞춤형교육, 농산업 창업교육, 청년귀촌장기교육 등 연간 391개 과정을 운영합니다.",
    capacity: null,
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    level: "입문",
    url: "https://agriedu.net/",
    is_verified: true,
  },
  {
    slug: "ED-008",
    title: "영주 소백산귀농드림타운 체류형 농업창업교육",
    region: "경상북도",
    organization: "영주시 농업기술센터",
    type: "오프라인",
    duration: "수개월 (체류형)",
    schedule: "수시 접수 (제11기 운영 중)",
    target: "귀농 희망자 (영주 지역 체류 가능자)",
    cost: "입교비 소정 (확인 필요)",
    description: "영주 소백산 인근 귀농드림타운에서 체류하며 농업을 학습하고 현장실습을 병행하는 체류형 교육 프로그램입니다.",
    capacity: 5,
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    level: "초급",
    url: "http://www.ttlnews.com/news/articleView.html?idxno=3085607",
    is_verified: true,
  },
];

// ═══════════════════════════════════════
// 행사 시드 데이터 (실제 검증 — 2026-04-06)
// ═══════════════════════════════════════
const eventsSeed = [
  {
    slug: "evt-001",
    title: "Y-FARM EXPO 2026 귀농귀촌 지역살리기 박람회",
    region: "경기도",
    organization: "Y-FARM EXPO 운영위원회",
    type: "박람회",
    date_start: "2026-04-24",
    date_end: "2026-04-26",
    location: "수원컨벤션센터",
    cost: "사전등록 시 무료",
    description: "기업·기관 전시부스, 일반인 참관등록, 비즈니스 매칭, 특별 체험 등이 진행되는 귀농귀촌·지역살리기 전문 박람회입니다.",
    capacity: null,
    target: "귀농·귀촌 희망자, 농업 관련 기업·기관",
    url: "https://yfarmexpo.co.kr/fairDash.do",
    status: "접수중",
    is_verified: true,
  },
  {
    slug: "evt-002",
    title: "2026 스마트팜코리아 (Smart Farm Korea 2026)",
    region: "경상남도",
    organization: "경상남도·창원특례시",
    type: "박람회",
    date_start: "2026-05-27",
    date_end: "2026-05-29",
    location: "창원컨벤션센터(CECO) 제1,2전시장",
    cost: "무료 (사전등록)",
    description: "120개사 400부스 규모의 스마트농업·귀농귀촌 박람회입니다. 경남국제축산박람회(GILEX) 동시 개최.",
    capacity: null,
    target: "스마트팜 도입 희망 농업인, 귀농 예정자",
    url: "https://sfkorea.kr/",
    status: "접수중",
    is_verified: true,
  },
  {
    slug: "evt-003",
    title: "2026 충청 케이팜 (KFARM CHUNGCHEONG)",
    region: "충청북도",
    organization: "대한민국지방신문협의회",
    type: "박람회",
    date_start: "2026-06-18",
    date_end: "2026-06-20",
    location: "청주 OSCO (오스코)",
    cost: "무료 (사전등록 ~6/17)",
    description: "AgTech 기획관, 도시농업관, 귀농귀촌 정보 등 농업·축산·귀농 분야 종합 박람회입니다.",
    capacity: null,
    target: "귀농귀촌 희망자, 농업 기술 관심자",
    url: "https://kfarm.co.kr/",
    status: "접수중",
    is_verified: true,
  },
];

// ═══════════════════════════════════════
// 시드 실행
// ═══════════════════════════════════════
async function seed() {
  console.log("🌱 이랑 데이터 시딩 시작 (실제 검증 데이터)...\n");

  // 1. 지원사업
  console.log("📋 지원사업 시딩...");
  const { error: pErr } = await supabase
    .from("support_programs")
    .upsert(programsSeed, { onConflict: "slug" });

  if (pErr) {
    console.error("  ❌ 지원사업 시딩 실패:", pErr.message);
  } else {
    console.log(`  ✅ 지원사업 ${programsSeed.length}건 완료`);
  }

  // 2. 교육과정
  console.log("📚 교육과정 시딩...");
  const { error: eErr } = await supabase
    .from("education_courses")
    .upsert(educationSeed, { onConflict: "slug" });

  if (eErr) {
    console.error("  ❌ 교육과정 시딩 실패:", eErr.message);
  } else {
    console.log(`  ✅ 교육과정 ${educationSeed.length}건 완료`);
  }

  // 3. 행사
  console.log("🎪 행사/체험 시딩...");
  const { error: evErr } = await supabase
    .from("farm_events")
    .upsert(eventsSeed, { onConflict: "slug" });

  if (evErr) {
    console.error("  ❌ 행사 시딩 실패:", evErr.message);
  } else {
    console.log(`  ✅ 행사 ${eventsSeed.length}건 완료`);
  }

  // 4. 로그 기록
  await supabase.from("data_sync_log").insert({
    source: "seed_script",
    table_name: "all",
    action: "sync",
    record_count:
      programsSeed.length + educationSeed.length + eventsSeed.length,
    status: "success",
    metadata: {
      programs: programsSeed.length,
      education: educationSeed.length,
      events: eventsSeed.length,
      dataAsOf: "2026-04-06",
      timestamp: new Date().toISOString(),
    },
  });

  console.log("\n✨ 시딩 완료! (실제 검증 데이터 기준: 2026-04-06)");
}

seed().catch(console.error);
