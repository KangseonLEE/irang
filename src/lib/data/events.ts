/**
 * 귀농 체험·행사 샘플 데이터
 * - 실제 API 연동 전까지 사용하는 정적 데이터
 * - 나중에 DB/API로 교체 시 인터페이스는 유지
 */

export interface FarmEvent {
  id: string;
  title: string;
  region: string;
  organization: string;
  type: "일일체험" | "팜스테이" | "박람회" | "설명회" | "멘토링" | "축제";
  date: string;
  dateEnd: string | null;
  location: string;
  cost: string;
  description: string;
  capacity: number | null;
  target: string;
  url: string;
  status: "접수중" | "접수예정" | "마감";
}

export const EVENT_TYPES = [
  "일일체험",
  "팜스테이",
  "박람회",
  "설명회",
  "멘토링",
  "축제",
] as const;

export const EVENT_REGIONS = [
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

export const EVENTS: FarmEvent[] = [
  {
    id: "evt-001",
    title: "순천 귀농 일일체험",
    region: "전라남도",
    organization: "순천시 농업기술센터",
    type: "일일체험",
    date: "2026-04-18",
    dateEnd: null,
    location: "순천시 농업기술센터",
    cost: "무료",
    description:
      "순천 지역 귀농에 관심 있는 도시민을 위한 일일 영농 체험 프로그램입니다. 고추 모종 정식, 텃밭 관리 실습, 선배 귀농인과의 간담회로 구성됩니다.",
    capacity: 30,
    target: "귀농 예정자 및 관심 도시민",
    url: "https://www.suncheon.go.kr/sca/returnFarm/0015/0001/",
    status: "접수중",
  },
  {
    id: "evt-002",
    title: "제주 감귤 수확 체험",
    region: "제주특별자치도",
    organization: "서귀포시 감귤농업과",
    type: "일일체험",
    date: "2026-11-08",
    dateEnd: "2026-11-09",
    location: "서귀포시 남원읍 감귤체험농장",
    cost: "1만 원/인",
    description:
      "제주 감귤 산지에서 직접 수확하고 맛보는 체험 프로그램입니다. 감귤 수확, 선별 작업 체험, 감귤청 만들기를 진행합니다.",
    capacity: 40,
    target: "가족 단위 체험객, 귀농 희망자",
    url: "https://eticket.seogwipo.go.kr/contents?bmcode=tangerines",
    status: "접수예정",
  },
  {
    id: "evt-003",
    title: "강원 고랭지 팜스테이",
    region: "강원도",
    organization: "평창군 농업기술센터",
    type: "팜스테이",
    date: "2026-07-10",
    dateEnd: "2026-07-12",
    location: "평창군 대관령면 고랭지 채소농가",
    cost: "15만 원/인 (2박 3일, 숙식 포함)",
    description:
      "해발 700m 고랭지에서 배추·무 재배를 직접 체험하는 팜스테이 프로그램입니다. 파종부터 수확까지 영농 과정을 경험하고 농가 민박에서 머물며 농촌 생활을 체험합니다.",
    capacity: 15,
    target: "귀농 예정자, 농촌 체험 희망 도시민",
    url: "https://tour.pc.go.kr/Home/H10000/H10200/placeDetail?place_no=769",
    status: "접수예정",
  },
  {
    id: "evt-004",
    title: "2026 전국 귀농귀촌 박람회",
    region: "전국",
    organization: "농림축산식품부·귀농귀촌종합센터",
    type: "박람회",
    date: "2026-05-15",
    dateEnd: "2026-05-17",
    location: "서울 양재동 aT센터 제1·2전시장",
    cost: "무료",
    description:
      "전국 120개 지자체와 귀농 관련 기관이 참여하는 국내 최대 귀농귀촌 박람회입니다. 지역별 상담부스, 귀농 정책 설명회, 선배 귀농인 토크콘서트가 진행됩니다.",
    capacity: null,
    target: "귀농·귀촌 희망자 누구나",
    url: "https://www.yfarmexpo.co.kr/fairDash.do?hl=KOR",
    status: "접수중",
  },
  {
    id: "evt-005",
    title: "경북 사과농장 일일체험",
    region: "경상북도",
    organization: "영주시 농업기술센터",
    type: "일일체험",
    date: "2026-09-20",
    dateEnd: null,
    location: "영주시 풍기읍 사과시험포장",
    cost: "5천 원/인",
    description:
      "경북 영주의 사과 주산지에서 적과·봉지씌우기·수확까지 사과 재배의 핵심 작업을 체험합니다. 갓 딴 사과 시식과 사과즙 만들기 체험이 포함됩니다.",
    capacity: 25,
    target: "과수 재배 관심자, 가족 단위",
    url: "https://www.yeongju.go.kr/atec/page.do?mnu_uid=10815",
    status: "접수예정",
  },
  {
    id: "evt-006",
    title: "충남 스마트팜 견학 설명회",
    region: "충청남도",
    organization: "충남농업기술원 스마트팜지원단",
    type: "설명회",
    date: "2026-06-05",
    dateEnd: null,
    location: "논산시 스마트팜 혁신밸리",
    cost: "무료",
    description:
      "ICT 기반 스마트팜 시설을 직접 견학하고 운영 사례를 듣는 설명회입니다. 스마트온실 시스템 소개, 환경제어 실습, 성공 농가 인터뷰로 구성됩니다.",
    capacity: 50,
    target: "스마트팜 도입 희망 귀농인, 영농인",
    url: "https://cnnongup.chungnam.go.kr/sub.cs?m=307",
    status: "접수중",
  },
  {
    id: "evt-007",
    title: "전남 녹차밭 팜스테이",
    region: "전라남도",
    organization: "보성군 녹차사업소",
    type: "팜스테이",
    date: "2026-05-02",
    dateEnd: "2026-05-04",
    location: "보성군 보성읍 녹차밭 농가",
    cost: "12만 원/인 (2박 3일, 숙식 포함)",
    description:
      "보성 녹차밭에서 찻잎 수확부터 덖음까지 전통 차 제조 과정을 체험하는 프로그램입니다. 차 농가에서 민박하며 농촌 생활과 차 문화를 함께 즐길 수 있습니다.",
    capacity: 12,
    target: "차 문화 관심자, 귀농 예정자",
    url: "https://tour.boseong.go.kr/tour/festivity/tea_aroma",
    status: "접수중",
  },
  {
    id: "evt-008",
    title: "경기 도시농업 축제",
    region: "경기도",
    organization: "수원시 도시농업과",
    type: "축제",
    date: "2026-10-10",
    dateEnd: "2026-10-12",
    location: "수원시 권선구 도시농업공원",
    cost: "무료 (일부 체험 유료)",
    description:
      "도시에서 즐기는 농업의 가치를 체험하는 축제입니다. 텃밭 경진대회, 도시양봉 시연, 농산물 직거래 장터, 귀농 상담 부스가 운영됩니다.",
    capacity: null,
    target: "도시농업 관심 시민 누구나",
    url: "https://www.suwon.go.kr/culture/ingCultureView.do?ctrSeqNo=1958&listType=ing",
    status: "접수예정",
  },
  {
    id: "evt-009",
    title: "전북 귀농 선배 멘토링 데이",
    region: "전라북도",
    organization: "전북특별자치도 귀농귀촌지원센터",
    type: "멘토링",
    date: "2026-04-12",
    dateEnd: null,
    location: "전주시 완산구 전북도청 대회의실",
    cost: "무료",
    description:
      "전북에 정착한 귀농 선배 10인이 직접 경험을 나누는 멘토링 행사입니다. 분야별(과수·채소·축산) 소그룹 멘토링과 1:1 상담이 진행됩니다.",
    capacity: 60,
    target: "전북 귀농 예정자 및 초기 정착 귀농인",
    url: "https://www.jeonbuk.go.kr/index.jeonbuk?menuCd=DOM_000000104008004000",
    status: "접수중",
  },
  {
    id: "evt-010",
    title: "제주 아열대 작물 견학 설명회",
    region: "제주특별자치도",
    organization: "제주특별자치도 농업기술원",
    type: "설명회",
    date: "2026-08-22",
    dateEnd: null,
    location: "서귀포시 아열대과수시험장",
    cost: "무료",
    description:
      "기후 변화에 따라 재배 가능성이 높아지는 아열대 작물을 소개하는 견학 설명회입니다. 망고, 패션프루트, 바나나 등 시험 재배 현장을 방문합니다.",
    capacity: 35,
    target: "신소득 작물 관심 귀농인, 영농인",
    url: "https://agri.jeju.go.kr/seogwipo/notice/edu/edurequest.htm",
    status: "접수예정",
  },
  {
    id: "evt-011",
    title: "경남 약용작물 일일체험",
    region: "경상남도",
    organization: "산청군 농업기술센터",
    type: "일일체험",
    date: "2026-03-15",
    dateEnd: null,
    location: "산청군 금서면 약초테마공원",
    cost: "무료",
    description:
      "지리산 자락 산청에서 당귀, 황기, 작약 등 약용작물의 파종과 관리를 직접 체험합니다. 한방차 시음, 약초 건조 시연, 약용작물 재배 상담이 포함됩니다.",
    capacity: 20,
    target: "약용작물 재배 관심자, 귀농 예정자",
    url: "https://donguibogam-village.sancheong.go.kr/html/sub/01_11_05.jsp",
    status: "마감",
  },
  {
    id: "evt-012",
    title: "전국 온라인 귀농 설명회 (상반기)",
    region: "전국",
    organization: "귀농귀촌종합센터",
    type: "설명회",
    date: "2026-03-08",
    dateEnd: null,
    location: "온라인 (Zoom 웨비나)",
    cost: "무료",
    description:
      "전국 어디서나 참여할 수 있는 온라인 귀농 설명회입니다. 귀농 절차 안내, 지역별 지원사업 소개, 성공 사례 발표, 실시간 Q&A로 구성됩니다.",
    capacity: 300,
    target: "귀농·귀촌 관심자 누구나",
    url: "https://www.greendaero.go.kr/svc/rfph/edc/live/front/program.do",
    status: "마감",
  },
];

// --- 헬퍼 함수 ---

/** ID로 단일 행사 조회 */
export function getEventById(id: string): FarmEvent | undefined {
  return EVENTS.find((e) => e.id === id);
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
export interface EventFilters {
  region?: string;
  type?: string;
  query?: string;
  /** 조회 시점 "YYYY-MM" — 해당 월에 행사일이 겹치는 건만 표시 */
  period?: string;
  /** true이면 마감 행사도 포함 */
  includeClosed?: boolean;
}

/** 필터 조건에 맞는 행사 목록 반환 */
export function filterEvents(filters: EventFilters): FarmEvent[] {
  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  return EVENTS.filter((event) => {
    // 조회 시점 필터: 행사 기간(date ~ dateEnd)과 선택 월이 겹치는지 확인
    if (periodStart && periodEnd) {
      const eventStart = event.date;
      const eventEnd = event.dateEnd ?? event.date;
      // 겹치려면: eventStart <= periodEnd AND eventEnd >= periodStart
      if (eventStart > periodEnd || eventEnd < periodStart) {
        return false;
      }
    }

    // 마감 제외 (기본 동작)
    if (!filters.includeClosed && event.status === "마감") {
      return false;
    }

    // 텍스트 검색
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        event.title,
        event.description,
        event.region,
        event.organization,
        event.location,
        event.type,
        event.target,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    // 지역 필터
    if (filters.region && filters.region !== "전체") {
      if (event.region !== "전국" && event.region !== filters.region) {
        return false;
      }
    }

    // 행사 유형 필터
    if (filters.type && filters.type !== "전체") {
      if (event.type !== filters.type) {
        return false;
      }
    }

    return true;
  });
}
