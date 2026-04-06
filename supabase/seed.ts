/**
 * Supabase 시드 스크립트
 * - 기존 정적 데이터(.ts)를 Supabase DB로 마이그레이션
 * - 실행: npx tsx supabase/seed.ts
 *
 * 필요 환경변수:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

// ── 정적 데이터 임포트 (상대경로) ──
// Note: seed 스크립트는 프로젝트 루트에서 실행하므로 직접 임포트 대신
//       데이터를 인라인으로 포함하거나, tsx를 통해 실행

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
// 지원사업 시드 데이터
// ═══════════════════════════════════════
const programsSeed = [
  {
    slug: "prg-001",
    title: "2026년 귀농인 정착지원금 (순천시)",
    summary: "순천시로 귀농하는 청년·중장년 대상 정착 초기 생활안정자금 지원. 영농정착 3년 이내 귀농인에게 월 정착지원금을 지급합니다.",
    region: "전라남도",
    organization: "순천시청 농업정책과",
    support_type: "보조금",
    support_amount: "월 80만원 (최대 24개월)",
    eligibility_age_min: 20,
    eligibility_age_max: 65,
    eligibility_detail: "순천시 전입 후 실제 영농에 종사하는 귀농인. 농지 0.5ha 이상 경작 필수. 귀농 3년 이내.",
    application_start: "2026-03-01",
    application_end: "2026-05-31",
    status: "모집중",
    related_crops: ["매실", "블루베리", "고추"],
    source_url: "https://suncheon.go.kr/board/board.do?boardId=bbs_0000000000000190&cntId=1943&mode=view",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "prg-002",
    title: "청년 귀농 창업지원 사업",
    summary: "만 40세 이하 청년 귀농인의 영농 창업을 위한 종합 지원. 영농기술 교육, 창업자금, 멘토링을 패키지로 제공합니다.",
    region: "전국",
    organization: "농림축산식품부",
    support_type: "보조금",
    support_amount: "최대 3,000만원 (보조 70%, 자부담 30%)",
    eligibility_age_min: 18,
    eligibility_age_max: 40,
    eligibility_detail: "만 18~40세 청년. 독립 경영 3년 이내. 영농에 전념할 수 있는 자. 귀농교육 100시간 이상 이수자.",
    application_start: "2026-02-01",
    application_end: "2026-04-15",
    status: "모집중",
    related_crops: [],
    source_url: "https://www.mafra.go.kr",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "prg-003",
    title: "스마트팜 시설 설치 보조",
    summary: "ICT 기반 스마트팜 시설 설치비 보조. 온실 자동화, 환경제어 시스템, IoT 센서 등 설치를 지원합니다.",
    region: "경상북도",
    organization: "경상북도 농업기술원",
    support_type: "보조금",
    support_amount: "최대 5,000만원 (보조 50%)",
    eligibility_age_min: 20,
    eligibility_age_max: 65,
    eligibility_detail: "경상북도 소재 농업인. 시설원예 재배 면적 1,000m2 이상. 스마트팜 교육 이수자.",
    application_start: "2026-04-01",
    application_end: "2026-06-30",
    status: "모집중",
    related_crops: ["토마토", "파프리카", "딸기", "상추"],
    source_url: "https://www.smartfarmkorea.net",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "prg-011",
    title: "귀농 융자 지원 (농지 구입)",
    summary: "귀농인의 농지 구입을 위한 저금리 융자 지원. 연 1.5% 고정금리, 5년 거치 10년 상환.",
    region: "전국",
    organization: "농림축산식품부·농협은행",
    support_type: "융자",
    support_amount: "최대 3억원 (연 1.5%)",
    eligibility_age_min: 20,
    eligibility_age_max: 65,
    eligibility_detail: "귀농 5년 이내. 농지 직접 경작 의무. 귀농교육 이수자. 신용등급 6등급 이내.",
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    related_crops: [],
    source_url: "https://www.gov.kr/portal/service/serviceInfo/154300000011",
    year: 2026,
    is_verified: true,
  },
  {
    slug: "prg-016",
    title: "귀농인 주택 구입 융자",
    summary: "귀농인의 농촌 주택 구입 또는 신축을 위한 저금리 융자. 연 2.0%, 5년 거치 15년 균등분할상환.",
    region: "전국",
    organization: "농림축산식품부·농협은행",
    support_type: "융자",
    support_amount: "최대 2억원 (연 2.0%)",
    eligibility_age_min: 20,
    eligibility_age_max: 65,
    eligibility_detail: "귀농 5년 이내. 무주택자 또는 도시 주택 처분 예정자. 농촌지역 소재 주택.",
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    related_crops: [],
    source_url: "https://www.gov.kr/portal/service/serviceInfo/544000000218",
    year: 2026,
    is_verified: true,
  },
];

// ═══════════════════════════════════════
// 교육과정 시드 데이터
// ═══════════════════════════════════════
const educationSeed = [
  {
    slug: "edu-001",
    title: "귀농·귀촌 온라인 기초 교육",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    type: "온라인",
    duration: "100시간 (8주)",
    schedule: "상시",
    target: "귀농 예정자 및 귀농 5년 이내 초기 정착자",
    cost: "무료",
    description: "귀농·귀촌에 필요한 기초 지식을 온라인으로 학습하는 과정입니다. 작물재배 기초, 농촌생활 적응, 귀농 지원제도 안내 등 필수 교육을 포함합니다.",
    capacity: null,
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    level: "입문",
    url: "https://agriedu.net/page/client_edu_online",
    is_verified: true,
  },
  {
    slug: "edu-004",
    title: "경북 과수 전문 재배 교육",
    region: "경상북도",
    organization: "경상북도 농업기술원 과수과",
    type: "오프라인",
    duration: "60시간 (3주)",
    schedule: "2026.05.11 ~ 05.29",
    target: "사과·배·복숭아 재배 예정 귀농인 및 초기 과수 농업인",
    cost: "10만 원",
    description: "경북 주요 과수(사과, 배, 복숭아)의 전정, 적과, 병해충 방제, 수확 후 처리 등 전문 재배 기술을 체계적으로 교육합니다.",
    capacity: 25,
    application_start: "2026-03-10",
    application_end: "2026-04-10",
    status: "모집중",
    level: "중급",
    url: "https://hrd.rda.go.kr/ehrd_asp/gyeongbuk.do",
    is_verified: true,
  },
  {
    slug: "edu-006",
    title: "충남 스마트팜 기초·실습 교육",
    region: "충청남도",
    organization: "충청남도 농업기술원 스마트팜센터",
    type: "혼합",
    duration: "60시간 (5주)",
    schedule: "2026.04.20 ~ 05.22",
    target: "스마트팜 도입 예정 귀농인 및 시설원예 농업인",
    cost: "5만 원",
    description: "ICT 기반 스마트팜의 원리와 운영 기술을 이론(온라인)과 실습(현장)으로 배우는 과정입니다.",
    capacity: 20,
    application_start: "2026-03-01",
    application_end: "2026-04-05",
    status: "모집중",
    level: "중급",
    url: "https://cnnongup.chungnam.go.kr/sub.cs?m=307",
    is_verified: true,
  },
  {
    slug: "edu-007",
    title: "귀농 창업 경영 교육",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    type: "온라인",
    duration: "40시간 (4주)",
    schedule: "2026.05.04 ~ 05.29",
    target: "영농 창업을 준비하는 귀농 예정자 및 초기 귀농인",
    cost: "무료",
    description: "영농 사업계획서 작성, 농산물 원가 분석, 자금 조달, 세무·회계 기초 등 귀농 창업에 필요한 경영 역량을 체계적으로 학습합니다.",
    capacity: null,
    application_start: "2026-04-01",
    application_end: "2026-04-25",
    status: "모집중",
    level: "초급",
    url: "https://agriedu.net/page/client_found_info",
    is_verified: true,
  },
];

// ═══════════════════════════════════════
// 행사 시드 데이터
// ═══════════════════════════════════════
const eventsSeed = [
  {
    slug: "evt-004",
    title: "2026 전국 귀농귀촌 박람회",
    region: "전국",
    organization: "농림축산식품부·귀농귀촌종합센터",
    type: "박람회",
    date_start: "2026-05-15",
    date_end: "2026-05-17",
    location: "서울 양재동 aT센터 제1·2전시장",
    cost: "무료",
    description: "전국 120개 지자체와 귀농 관련 기관이 참여하는 국내 최대 귀농귀촌 박람회입니다.",
    capacity: null,
    target: "귀농·귀촌 희망자 누구나",
    url: "https://www.yfarmexpo.co.kr/fairDash.do?hl=KOR",
    status: "접수중",
    is_verified: true,
  },
  {
    slug: "evt-006",
    title: "충남 스마트팜 견학 설명회",
    region: "충청남도",
    organization: "충남농업기술원 스마트팜지원단",
    type: "설명회",
    date_start: "2026-06-05",
    date_end: null,
    location: "논산시 스마트팜 혁신밸리",
    cost: "무료",
    description: "ICT 기반 스마트팜 시설을 직접 견학하고 운영 사례를 듣는 설명회입니다.",
    capacity: 50,
    target: "스마트팜 도입 희망 귀농인, 영농인",
    url: "https://cnnongup.chungnam.go.kr/sub.cs?m=307",
    status: "접수중",
    is_verified: true,
  },
  {
    slug: "evt-009",
    title: "전북 귀농 선배 멘토링 데이",
    region: "전라북도",
    organization: "전북특별자치도 귀농귀촌지원센터",
    type: "멘토링",
    date_start: "2026-04-12",
    date_end: null,
    location: "전주시 완산구 전북도청 대회의실",
    cost: "무료",
    description: "전북에 정착한 귀농 선배 10인이 직접 경험을 나누는 멘토링 행사입니다.",
    capacity: 60,
    target: "전북 귀농 예정자 및 초기 정착 귀농인",
    url: "https://www.jeonbuk.go.kr",
    status: "접수중",
    is_verified: true,
  },
];

// ═══════════════════════════════════════
// 시드 실행
// ═══════════════════════════════════════
async function seed() {
  console.log("🌱 이랑 데이터 시딩 시작...\n");

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
      timestamp: new Date().toISOString(),
    },
  });

  console.log("\n✨ 시딩 완료!");
}

seed().catch(console.error);
