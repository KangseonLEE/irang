/**
 * 귀농·귀촌 지원사업 샘플 데이터
 * - 실제 API(AgriX) 연동 전까지 사용하는 정적 데이터
 * - 나중에 DB/API로 교체 시 인터페이스는 유지
 */

export interface SupportProgram {
  id: string;
  title: string;
  summary: string;
  region: string;
  organization: string;
  supportType: "보조금" | "융자" | "교육" | "현물" | "컨설팅";
  supportAmount: string;
  eligibilityAgeMin: number;
  eligibilityAgeMax: number;
  eligibilityDetail: string;
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
  relatedCrops: string[];
  sourceUrl: string;
  year: number;
}

export const REGIONS = [
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

export const SUPPORT_TYPES = [
  "보조금",
  "융자",
  "교육",
  "현물",
  "컨설팅",
] as const;

export const STATUS_OPTIONS = ["모집중", "모집예정", "마감"] as const;

export const PROGRAMS: SupportProgram[] = [
  {
    id: "prg-001",
    title: "2026년 귀농인 정착지원금 (순천시)",
    summary:
      "순천시로 귀농하는 청년·중장년 대상 정착 초기 생활안정자금 지원. 영농정착 3년 이내 귀농인에게 월 정착지원금을 지급합니다.",
    region: "전라남도",
    organization: "순천시청 농업정책과",
    supportType: "보조금",
    supportAmount: "월 80만원 (최대 24개월)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "순천시 전입 후 실제 영농에 종사하는 귀농인. 농지 0.5ha 이상 경작 필수. 귀농 3년 이내.",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-05-31",
    status: "모집중",
    relatedCrops: ["매실", "블루베리", "고추"],
    sourceUrl: "https://www.suncheon.go.kr",
    year: 2026,
  },
  {
    id: "prg-002",
    title: "청년 귀농 창업지원 사업",
    summary:
      "만 40세 이하 청년 귀농인의 영농 창업을 위한 종합 지원. 영농기술 교육, 창업자금, 멘토링을 패키지로 제공합니다.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "최대 3,000만원 (보조 70%, 자부담 30%)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 40,
    eligibilityDetail:
      "만 18~40세 청년. 독립 경영 3년 이내. 영농에 전념할 수 있는 자. 귀농교육 100시간 이상 이수자.",
    applicationStart: "2026-02-01",
    applicationEnd: "2026-04-15",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.mafra.go.kr",
    year: 2026,
  },
  {
    id: "prg-003",
    title: "스마트팜 시설 설치 보조",
    summary:
      "ICT 기반 스마트팜 시설 설치비 보조. 온실 자동화, 환경제어 시스템, IoT 센서 등 설치를 지원합니다.",
    region: "경상북도",
    organization: "경상북도 농업기술원",
    supportType: "보조금",
    supportAmount: "최대 5,000만원 (보조 50%)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "경상북도 소재 농업인. 시설원예 재배 면적 1,000m2 이상. 스마트팜 교육 이수자.",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-06-30",
    status: "모집중",
    relatedCrops: ["토마토", "파프리카", "딸기", "상추"],
    sourceUrl: "https://www.gb.go.kr",
    year: 2026,
  },
  {
    id: "prg-004",
    title: "귀농·귀촌 주택 수리비 지원",
    summary:
      "농촌 빈집을 활용한 귀농인 주거 안정 사업. 빈집 매입 또는 임차 후 수리비를 지원합니다.",
    region: "전라남도",
    organization: "전라남도청 농업정책과",
    supportType: "보조금",
    supportAmount: "최대 2,000만원",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 70,
    eligibilityDetail:
      "전라남도 농촌지역 전입 귀농인. 빈집 매입 또는 임차 계약 완료자. 5년 이상 거주 의무.",
    applicationStart: "2026-03-15",
    applicationEnd: "2026-05-15",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.jeonnam.go.kr",
    year: 2026,
  },
  {
    id: "prg-005",
    title: "농지 장기임대 지원 사업",
    summary:
      "귀농인에게 공공 비축 농지를 장기 임대하여 안정적인 영농 기반을 마련할 수 있도록 지원합니다.",
    region: "전국",
    organization: "한국농어촌공사",
    supportType: "현물",
    supportAmount: "농지 임대 (시세 60% 수준)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 5년 이내. 영농계획서 제출 필수. 임차 농지에서 직접 영농 종사해야 함.",
    applicationStart: "2026-01-15",
    applicationEnd: "2026-03-31",
    status: "마감",
    relatedCrops: ["벼", "콩", "고구마"],
    sourceUrl: "https://www.ekr.or.kr",
    year: 2026,
  },
  {
    id: "prg-006",
    title: "귀농 기초 영농교육 (상반기)",
    summary:
      "귀농 예정자 및 초기 귀농인을 위한 기초 영농기술 교육 과정. 작물재배, 병해충 관리, 농기계 운용 등 기초 과정.",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    supportType: "교육",
    supportAmount: "무료 (교육비 전액 지원)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 70,
    eligibilityDetail:
      "귀농 예정자 또는 귀농 5년 이내인 자. 온라인 100시간 + 현장실습 포함.",
    applicationStart: "2026-02-15",
    applicationEnd: "2026-03-15",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.epis.or.kr",
    year: 2026,
  },
  {
    id: "prg-007",
    title: "과수원 조성 지원 (사과·배)",
    summary:
      "경상북도 과수 주산지 육성을 위한 과수원 신규 조성 지원. 묘목비, 시설비, 초기 관리비를 보조합니다.",
    region: "경상북도",
    organization: "영주시청 농업기술센터",
    supportType: "보조금",
    supportAmount: "ha당 최대 1,500만원",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 60,
    eligibilityDetail:
      "영주시 관내 농업인. 과수 재배 경력 또는 교육 이수 필수. 0.3ha 이상 조성 계획.",
    applicationStart: "2026-05-01",
    applicationEnd: "2026-07-31",
    status: "모집예정",
    relatedCrops: ["사과", "배"],
    sourceUrl: "https://www.yeongju.go.kr",
    year: 2026,
  },
  {
    id: "prg-008",
    title: "농기계 임대사업",
    summary:
      "영농에 필요한 농기계를 저렴한 비용으로 임대. 트랙터, 이앙기, 콤바인 등 주요 농기계를 포함합니다.",
    region: "전국",
    organization: "각 시군 농업기술센터",
    supportType: "현물",
    supportAmount: "시중 임대료의 30~50%",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 75,
    eligibilityDetail:
      "관내 농업인 등록자. 농기계 운전면허 소지자 (해당 기종).",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    relatedCrops: ["벼", "밭작물"],
    sourceUrl: "https://www.nongsaro.go.kr",
    year: 2026,
  },
  {
    id: "prg-009",
    title: "귀농인 영농정착 컨설팅",
    summary:
      "귀농 초기 정착에 어려움을 겪는 농업인 대상 1:1 전문 컨설팅. 재배기술, 경영관리, 유통판매 분야 맞춤 지원.",
    region: "전국",
    organization: "농촌진흥청",
    supportType: "컨설팅",
    supportAmount: "무료 (연 4회 방문 컨설팅)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 3년 이내. 연간 농산물 판매액 1,000만원 미만인 소규모 농가.",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-05-31",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.rda.go.kr",
    year: 2026,
  },
  {
    id: "prg-010",
    title: "제주 감귤 신품종 보급 사업",
    summary:
      "기후 변화에 대응하는 감귤 신품종 묘목 보급 및 재배기술 교육. 한라봉, 천혜향 등 만감류 포함.",
    region: "제주특별자치도",
    organization: "제주특별자치도 감귤농업과",
    supportType: "현물",
    supportAmount: "묘목 무상 보급 + 기술지도",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 70,
    eligibilityDetail:
      "제주도 관내 감귤 재배 농업인 또는 신규 감귤 재배 예정자.",
    applicationStart: "2026-06-01",
    applicationEnd: "2026-08-31",
    status: "모집예정",
    relatedCrops: ["감귤", "한라봉", "천혜향"],
    sourceUrl: "https://www.jeju.go.kr",
    year: 2026,
  },
  {
    id: "prg-011",
    title: "귀농 융자 지원 (농지 구입)",
    summary:
      "귀농인의 농지 구입을 위한 저금리 융자 지원. 연 1.5% 고정금리, 5년 거치 10년 상환.",
    region: "전국",
    organization: "농림축산식품부·농협은행",
    supportType: "융자",
    supportAmount: "최대 3억원 (연 1.5%)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 5년 이내. 농지 직접 경작 의무. 귀농교육 이수자. 신용등급 6등급 이내.",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.mafra.go.kr",
    year: 2026,
  },
  {
    id: "prg-012",
    title: "충북 유기농업 전환 지원",
    summary:
      "관행농업에서 유기농업으로 전환하는 농가에 전환기간(3년) 소득 감소분을 보전합니다.",
    region: "충청북도",
    organization: "충청북도 친환경농업과",
    supportType: "보조금",
    supportAmount: "ha당 연 200만원 (3년간)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 70,
    eligibilityDetail:
      "충청북도 관내 농업인. 유기농업 전환 계획서 제출. 친환경농업 교육 이수.",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-04-30",
    status: "모집중",
    relatedCrops: ["채소류", "잡곡"],
    sourceUrl: "https://www.cb21.net",
    year: 2026,
  },
  {
    id: "prg-013",
    title: "강원도 고랭지 채소 재배 교육",
    summary:
      "해발 600m 이상 고랭지 지역 채소 재배 전문 교육. 배추, 무, 감자 등 고랭지 작물 중심 실습 과정.",
    region: "강원도",
    organization: "강원도 농업기술원",
    supportType: "교육",
    supportAmount: "무료 (숙식 제공)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 60,
    eligibilityDetail:
      "강원도 고랭지 지역 귀농 예정자 또는 영농 초기 정착자. 20명 선발.",
    applicationStart: "2026-05-15",
    applicationEnd: "2026-06-15",
    status: "모집예정",
    relatedCrops: ["배추", "무", "감자", "양배추"],
    sourceUrl: "https://www.gwd.go.kr",
    year: 2026,
  },
  {
    id: "prg-014",
    title: "농촌 태양광 설치 지원",
    summary:
      "농업용 시설(비닐하우스, 축사 등) 지붕에 태양광 발전설비를 설치하여 농가 소득을 보전합니다.",
    region: "전국",
    organization: "한국에너지공단",
    supportType: "보조금",
    supportAmount: "설치비의 최대 50% (kW당 보조)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 70,
    eligibilityDetail:
      "농업시설 소유 농업인. 시설 면적 300m2 이상. 구조안전 진단 통과 필수.",
    applicationStart: "2026-04-15",
    applicationEnd: "2026-07-31",
    status: "모집예정",
    relatedCrops: [],
    sourceUrl: "https://www.energy.or.kr",
    year: 2026,
  },
  {
    id: "prg-015",
    title: "경남 약용작물 재배 지원",
    summary:
      "산청·함양 등 경남 지리산 권역 약용작물 재배 농가 지원. 묘목비, 시설비, 가공시설 보조.",
    region: "경상남도",
    organization: "산청군청 농업기술센터",
    supportType: "보조금",
    supportAmount: "최대 2,000만원",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "산청군 관내 거주 농업인. 약용작물 재배 계획서 제출. 1,000m2 이상 재배 예정.",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-04-30",
    status: "모집중",
    relatedCrops: ["당귀", "황기", "작약", "산양삼"],
    sourceUrl: "https://www.sancheong.go.kr",
    year: 2026,
  },
  {
    id: "prg-016",
    title: "귀농인 주택 구입 융자",
    summary:
      "귀농인의 농촌 주택 구입 또는 신축을 위한 저금리 융자. 연 2.0%, 5년 거치 15년 균등분할상환.",
    region: "전국",
    organization: "농림축산식품부·농협은행",
    supportType: "융자",
    supportAmount: "최대 2억원 (연 2.0%)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 5년 이내. 무주택자 또는 도시 주택 처분 예정자. 농촌지역 소재 주택.",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.mafra.go.kr",
    year: 2026,
  },
  {
    id: "prg-017",
    title: "전북 친환경 축산 컨설팅",
    summary:
      "전북 지역 소규모 축산 귀농인 대상 친환경 축산 컨설팅. 축사 설계, 사양관리, 방역 등.",
    region: "전라북도",
    organization: "전라북도 축산과",
    supportType: "컨설팅",
    supportAmount: "무료 (연 6회 방문)",
    eligibilityAgeMin: 25,
    eligibilityAgeMax: 60,
    eligibilityDetail:
      "전북 관내 축산업 종사 귀농인. 사육두수 50두 미만 소규모 농가.",
    applicationStart: "2026-05-01",
    applicationEnd: "2026-06-30",
    status: "모집예정",
    relatedCrops: [],
    sourceUrl: "https://www.jeonbuk.go.kr",
    year: 2026,
  },
  {
    id: "prg-018",
    title: "귀농 후계자 육성 교육 (하반기)",
    summary:
      "체계적인 영농 후계자 육성을 위한 심화 교육 프로그램. 선진농가 견학, 해외 연수 포함.",
    region: "전국",
    organization: "농림수산식품교육문화정보원",
    supportType: "교육",
    supportAmount: "무료 (교통·숙박비 일부 지원)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 45,
    eligibilityDetail:
      "만 18~45세. 귀농교육 기초과정 수료자. 영농 정착 의지가 확인되는 자.",
    applicationStart: "2026-07-01",
    applicationEnd: "2026-08-15",
    status: "모집예정",
    relatedCrops: [],
    sourceUrl: "https://www.epis.or.kr",
    year: 2026,
  },
];

// --- 헬퍼 함수 ---

/** ID로 단일 프로그램 조회 */
export function getProgramById(id: string): SupportProgram | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

/** 필터 조건에 맞는 프로그램 목록 반환 */
export interface ProgramFilters {
  region?: string;
  age?: number;
  supportType?: string;
  status?: string;
}

/** 필터만 적용 (전체 반환) */
export function filterPrograms(filters: ProgramFilters): SupportProgram[] {
  return PROGRAMS.filter((program) => {
    if (filters.region && filters.region !== "전체") {
      if (program.region !== "전국" && program.region !== filters.region) {
        return false;
      }
    }

    if (filters.age) {
      if (
        filters.age < program.eligibilityAgeMin ||
        filters.age > program.eligibilityAgeMax
      ) {
        return false;
      }
    }

    if (filters.supportType && filters.supportType !== "전체") {
      if (program.supportType !== filters.supportType) {
        return false;
      }
    }

    if (filters.status && filters.status !== "전체") {
      if (program.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/** 페이지 크기 (3열 × 2행) */
export const PAGE_SIZE = 6;

export interface PaginatedResult {
  programs: SupportProgram[];
  total: number;
  hasMore: boolean;
}

/** 필터 + 페이지네이션 (offset 기반) */
export function filterProgramsPaginated(
  filters: ProgramFilters,
  offset: number = 0,
  limit: number = PAGE_SIZE
): PaginatedResult {
  const all = filterPrograms(filters);
  const programs = all.slice(offset, offset + limit);
  return {
    programs,
    total: all.length,
    hasMore: offset + limit < all.length,
  };
}
