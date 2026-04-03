/**
 * 귀농 교육 과정 샘플 데이터
 * - 실제 API 연동 전까지 사용하는 정적 데이터
 * - 나중에 DB/API로 교체 시 인터페이스는 유지
 */

export interface EducationCourse {
  id: string;
  title: string;
  region: string;
  organization: string;
  type: "온라인" | "오프라인" | "혼합";
  duration: string;
  schedule: string;
  target: string;
  cost: string;
  description: string;
  capacity: number | null;
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
  level: "입문" | "초급" | "중급" | "심화";
  url: string;
}

export const EDUCATION_REGIONS = [
  "전국",
  "서울특별시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
] as const;

export const EDUCATION_TYPES = ["온라인", "오프라인", "혼합"] as const;

export const EDUCATION_LEVELS = ["입문", "초급", "중급", "심화"] as const;

export const EDUCATION_COURSES: EducationCourse[] = [
  {
    id: "edu-001",
    title: "귀농·귀촌 온라인 기초 교육",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    type: "온라인",
    duration: "100시간 (8주)",
    schedule: "상시",
    target: "귀농 예정자 및 귀농 5년 이내 초기 정착자",
    cost: "무료",
    description:
      "귀농·귀촌에 필요한 기초 지식을 온라인으로 학습하는 과정입니다. 작물재배 기초, 농촌생활 적응, 귀농 지원제도 안내 등 필수 교육을 포함합니다. 농림축산식품부 귀농교육 100시간 이수 인정 과정입니다.",
    capacity: null,
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    level: "입문",
    url: "https://www.epis.or.kr",
  },
  {
    id: "edu-002",
    title: "강원도 고랭지 채소 재배 실습 교육",
    region: "강원도",
    organization: "강원도 농업기술원",
    type: "오프라인",
    duration: "80시간 (4주)",
    schedule: "2026.06.01 ~ 06.26",
    target: "강원도 고랭지 지역 귀농 예정자 및 초기 정착 농업인",
    cost: "무료 (숙식 제공)",
    description:
      "해발 600m 이상 고랭지 환경에 적합한 배추, 무, 감자 등의 재배 기술을 현장 실습 중심으로 배우는 교육입니다. 병해충 관리, 토양 분석, 수확 후 관리 등 실무 역량을 강화합니다.",
    capacity: 20,
    applicationStart: "2026-04-15",
    applicationEnd: "2026-05-15",
    status: "모집예정",
    level: "중급",
    url: "https://www.gwd.go.kr",
  },
  {
    id: "edu-003",
    title: "전남 귀농귀촌 아카데미",
    region: "전라남도",
    organization: "전라남도 농업기술원",
    type: "혼합",
    duration: "120시간 (10주)",
    schedule: "2026.04.07 ~ 06.13",
    target: "전남 지역 이주 예정 귀농·귀촌인",
    cost: "무료",
    description:
      "온라인 이론 학습과 전남 현지 농가 실습을 결합한 종합 귀농 교육 과정입니다. 지역 특화 작물(매실, 블루베리, 녹차 등) 재배 체험과 선배 귀농인 멘토링을 제공합니다.",
    capacity: 30,
    applicationStart: "2026-02-17",
    applicationEnd: "2026-03-21",
    status: "마감",
    level: "초급",
    url: "https://www.jeonnam.go.kr",
  },
  {
    id: "edu-004",
    title: "경북 과수 전문 재배 교육",
    region: "경상북도",
    organization: "경상북도 농업기술원 과수과",
    type: "오프라인",
    duration: "60시간 (3주)",
    schedule: "2026.05.11 ~ 05.29",
    target: "사과·배·복숭아 재배 예정 귀농인 및 초기 과수 농업인",
    cost: "10만 원",
    description:
      "경북 주요 과수(사과, 배, 복숭아)의 전정, 적과, 병해충 방제, 수확 후 처리 등 전문 재배 기술을 체계적으로 교육합니다. 영주·안동·상주 지역 선진 과수원 현장 견학이 포함됩니다.",
    capacity: 25,
    applicationStart: "2026-03-10",
    applicationEnd: "2026-04-10",
    status: "모집중",
    level: "중급",
    url: "https://www.gb.go.kr",
  },
  {
    id: "edu-005",
    title: "제주 감귤 재배 기술 교육",
    region: "제주특별자치도",
    organization: "제주특별자치도 감귤농업기술센터",
    type: "오프라인",
    duration: "40시간 (2주)",
    schedule: "2026.07.06 ~ 07.17",
    target: "제주 감귤 재배 입문자 및 품종 전환 희망 농업인",
    cost: "무료",
    description:
      "감귤 재배의 기초부터 신품종(한라봉, 천혜향, 레드향) 관리 기술까지 다루는 현장 중심 교육입니다. 기후 변화 대응 재배 기술과 친환경 병해충 방제법을 집중 교육합니다.",
    capacity: 15,
    applicationStart: "2026-05-01",
    applicationEnd: "2026-06-15",
    status: "모집예정",
    level: "초급",
    url: "https://www.jeju.go.kr",
  },
  {
    id: "edu-006",
    title: "충남 스마트팜 기초·실습 교육",
    region: "충청남도",
    organization: "충청남도 농업기술원 스마트팜센터",
    type: "혼합",
    duration: "60시간 (5주)",
    schedule: "2026.04.20 ~ 05.22",
    target: "스마트팜 도입 예정 귀농인 및 시설원예 농업인",
    cost: "5만 원",
    description:
      "ICT 기반 스마트팜의 원리와 운영 기술을 이론(온라인)과 실습(현장)으로 배우는 과정입니다. 환경제어 시스템, IoT 센서 활용, 데이터 기반 작물 관리 등 실무 역량을 키웁니다.",
    capacity: 20,
    applicationStart: "2026-03-01",
    applicationEnd: "2026-04-05",
    status: "모집중",
    level: "중급",
    url: "https://www.chungnam.go.kr",
  },
  {
    id: "edu-007",
    title: "귀농 창업 경영 교육",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    type: "온라인",
    duration: "40시간 (4주)",
    schedule: "2026.05.04 ~ 05.29",
    target: "영농 창업을 준비하는 귀농 예정자 및 초기 귀농인",
    cost: "무료",
    description:
      "영농 사업계획서 작성, 농산물 원가 분석, 자금 조달, 세무·회계 기초 등 귀농 창업에 필요한 경영 역량을 체계적으로 학습합니다. 성공 귀농 사례 분석과 전문가 화상 멘토링이 포함됩니다.",
    capacity: null,
    applicationStart: "2026-04-01",
    applicationEnd: "2026-04-25",
    status: "모집중",
    level: "초급",
    url: "https://www.epis.or.kr",
  },
  {
    id: "edu-008",
    title: "경기도 도시농업 체험 교육",
    region: "경기도",
    organization: "경기도 농업기술원",
    type: "오프라인",
    duration: "24시간 (3일)",
    schedule: "2026.04.24 ~ 04.26",
    target: "귀농 전 단계 도시민 및 주말농장 운영 희망자",
    cost: "3만 원",
    description:
      "도시농업의 기초를 체험하며 귀농에 대한 관심을 높이는 단기 입문 과정입니다. 텃밭 조성, 친환경 재배, 퇴비 만들기 등 실습 위주로 진행되며, 귀농 상담도 함께 제공합니다.",
    capacity: 40,
    applicationStart: "2026-03-15",
    applicationEnd: "2026-04-15",
    status: "모집중",
    level: "입문",
    url: "https://www.gg.go.kr",
  },
  {
    id: "edu-009",
    title: "전북 소규모 축산 입문 교육",
    region: "전라북도",
    organization: "전라북도 축산진흥연구센터",
    type: "오프라인",
    duration: "50시간 (2주)",
    schedule: "2026.08.03 ~ 08.14",
    target: "축산업 입문을 희망하는 귀농 예정자",
    cost: "무료 (교재비 별도)",
    description:
      "한우, 돼지, 닭 등 소규모 축산의 기초 사양관리, 축사 설계, 방역, 사료 배합 등을 배우는 실습 중심 교육입니다. 전북 지역 우수 축산 농가 견학과 수의사 특강이 포함됩니다.",
    capacity: 15,
    applicationStart: "2026-06-01",
    applicationEnd: "2026-07-15",
    status: "모집예정",
    level: "입문",
    url: "https://www.jeonbuk.go.kr",
  },
  {
    id: "edu-010",
    title: "농산물 유통·마케팅 전문 과정",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    type: "온라인",
    duration: "30시간 (3주)",
    schedule: "2026.03.02 ~ 03.20",
    target: "농산물 판매·유통 역량 강화를 원하는 귀농인",
    cost: "무료",
    description:
      "농산물 직거래, 온라인 판매 채널 구축, SNS 마케팅, 브랜딩 전략 등 농산물 유통·마케팅 전반을 다루는 과정입니다. 로컬푸드 직매장 입점, 꾸러미 사업 등 실전 사례를 중심으로 교육합니다.",
    capacity: null,
    applicationStart: "2026-01-15",
    applicationEnd: "2026-02-20",
    status: "마감",
    level: "심화",
    url: "https://www.epis.or.kr",
  },
];

// --- 헬퍼 함수 ---

/** ID로 단일 교육 과정 조회 */
export function getEducationById(id: string): EducationCourse | undefined {
  return EDUCATION_COURSES.find((c) => c.id === id);
}

/** 현재 연월 문자열 (YYYY-MM) */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 조회 시점 옵션 생성 (2026년 1~12월) */
export function getPeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const year = 2026;
  for (let m = 1; m <= 12; m++) {
    const value = `${year}-${String(m).padStart(2, "0")}`;
    options.push({ value, label: `${year}년 ${m}월` });
  }
  return options;
}

/** 필터 조건 */
export interface EducationFilters {
  region?: string;
  type?: string;
  level?: string;
  query?: string;
  /** 조회 시점 "YYYY-MM" -- 해당 월에 모집기간이 겹치는 과정만 표시 */
  period?: string;
  includeClosed?: boolean;
}

/** 필터 조건에 맞는 교육 과정 목록 반환 */
export function filterEducation(filters: EducationFilters): EducationCourse[] {
  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  return EDUCATION_COURSES.filter((course) => {
    // 조회 시점 필터: 모집기간과 선택 월이 겹치는지 확인
    if (periodStart && periodEnd) {
      if (
        course.applicationStart > periodEnd ||
        course.applicationEnd < periodStart
      ) {
        return false;
      }
    }

    // 마감 제외 (기본 동작: includeClosed가 true가 아니면 마감 숨김)
    if (!filters.includeClosed && course.status === "마감") {
      return false;
    }

    // 텍스트 검색 (제목, 설명, 지역, 기관, 대상)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        course.title,
        course.description,
        course.region,
        course.organization,
        course.target,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    if (filters.region && filters.region !== "전체") {
      if (course.region !== "전국" && course.region !== filters.region) {
        return false;
      }
    }

    if (filters.type && filters.type !== "전체") {
      if (course.type !== filters.type) {
        return false;
      }
    }

    if (filters.level && filters.level !== "전체") {
      if (course.level !== filters.level) {
        return false;
      }
    }

    return true;
  });
}
