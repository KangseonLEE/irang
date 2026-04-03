/**
 * 도/광역시 단위 지역 데이터
 * - 관측소(stations.ts)를 도 단위로 그룹화
 * - 지역 상세 페이지 + 목록 페이지에서 사용
 */

export interface RegionPersona {
  title: string; // "자연 속 조용한 삶을 원하는 분"
  description: string;
}

export interface Province {
  /** URL slug (예: "gangwon") */
  id: string;
  /** 정식 명칭 (예: "강원도") */
  name: string;
  /** 약칭 (예: "강원") */
  shortName: string;
  /** 한 줄 소개 */
  description: string;
  /** 핵심 키워드 (3~4개) */
  highlights: string[];
  /** 소속 관측소 stnId 목록 */
  stationIds: string[];
  /** 대표 관측소 stnId (API 호출 기본값) */
  representativeStationId: string;
  /** SGIS 시도 코드 */
  sgisCode: string;
  /** HIRA 시도 코드 */
  hiraSidoCd: string;
  /** NEIS 교육청 코드 */
  eduCode: string;
  /** Unsplash 검색 키워드 */
  unsplashQuery: string;
  /** "이런 분에게 추천" 페르소나 */
  personas: RegionPersona[];
}

export const PROVINCES: Province[] = [
  {
    id: "seoul",
    name: "서울특별시",
    shortName: "서울",
    description: "수도권 중심, 도시 농업과 주말 농장의 시작점",
    highlights: ["도시농업", "주말농장", "직거래 시장", "교육 인프라"],
    stationIds: ["108"],
    representativeStationId: "108",
    sgisCode: "11",
    hiraSidoCd: "110000",
    eduCode: "B10",
    unsplashQuery: "Gyeongbokgung palace Seoul Korea",
    personas: [
      {
        title: "도시를 완전히 떠나기 전 경험을 쌓고 싶은 분",
        description:
          "주말 농장이나 도시 농업 프로그램으로 귀농 적성을 먼저 테스트할 수 있습니다.",
      },
      {
        title: "수도권 접근성을 유지하며 농업에 입문하려는 분",
        description:
          "서울 근교 직거래 시장 접근이 용이하고, 귀농 교육 기관이 풍부합니다.",
      },
    ],
  },
  {
    id: "gyeonggi",
    name: "경기도",
    shortName: "경기",
    description: "수도권 소비시장과 가까운 근교 농업의 최적지",
    highlights: ["근교 농업", "직거래 유통", "스마트팜", "체험농장"],
    stationIds: ["119"],
    representativeStationId: "119",
    sgisCode: "31",
    hiraSidoCd: "310000",
    eduCode: "J10",
    unsplashQuery: "Suwon Hwaseong Fortress gate Korea",
    personas: [
      {
        title: "서울 생활권을 유지하면서 농업을 시작하려는 분",
        description:
          "서울과 1시간 내 접근이 가능해, 가족의 교육·문화 생활을 병행할 수 있습니다.",
      },
      {
        title: "직거래·체험농장으로 6차산업에 도전하려는 분",
        description:
          "수도권 2,500만 소비자를 인접시장으로 활용해 높은 수익성을 기대할 수 있습니다.",
      },
    ],
  },
  {
    id: "gangwon",
    name: "강원도",
    shortName: "강원",
    description: "청정 자연 속 고랭지 농업과 산촌 체험의 중심",
    highlights: ["고랭지 채소", "청정 환경", "산촌 생활", "관광 연계"],
    stationIds: ["101", "211", "217"],
    representativeStationId: "101",
    sgisCode: "32",
    hiraSidoCd: "320000",
    eduCode: "R10",
    unsplashQuery: "Seoraksan mountain Korea autumn",
    personas: [
      {
        title: "깨끗한 자연 속에서 건강한 먹거리를 키우고 싶은 분",
        description:
          "고랭지 배추, 감자 등 청정 프리미엄 작물 재배에 최적인 환경입니다.",
      },
      {
        title: "체력에 자신 있고, 조용한 산촌 생활을 꿈꾸는 분",
        description:
          "인구 밀도가 낮아 넓은 농지를 확보하기 쉽고, 관광과 연계한 팜스테이도 가능합니다.",
      },
      {
        title: "겨울 스포츠·자연 레저를 즐기며 농업하려는 분",
        description:
          "사계절 뚜렷한 기후로 시즌별 다양한 여가 활동이 가능합니다.",
      },
    ],
  },
  {
    id: "chungbuk",
    name: "충청북도",
    shortName: "충북",
    description: "내륙 중심의 유기농·친환경 농업 선도 지역",
    highlights: ["유기농", "친환경 인증", "내륙 기후", "교통 요충지"],
    stationIds: ["131"],
    representativeStationId: "131",
    sgisCode: "33",
    hiraSidoCd: "330000",
    eduCode: "M10",
    unsplashQuery: "Suanbo Chungju lake South Korea landscape",
    personas: [
      {
        title: "유기농·친환경 농업에 관심 있는 분",
        description:
          "유기농 전환 지원 사업이 활발하며, 친환경 인증 농가 비율이 높습니다.",
      },
      {
        title: "전국 어디든 접근 좋은 중앙 위치를 원하는 분",
        description:
          "서울에서 1시간 반, KTX·고속도로 교통이 편리해 유통에 유리합니다.",
      },
    ],
  },
  {
    id: "daejeon",
    name: "대전광역시",
    shortName: "대전",
    description: "과학기술 도시에서 시작하는 스마트 농업",
    highlights: ["스마트팜", "연구기관 연계", "교통 허브", "도시 근교"],
    stationIds: ["133"],
    representativeStationId: "133",
    sgisCode: "25",
    hiraSidoCd: "250000",
    eduCode: "G10",
    unsplashQuery: "Daejeon Yuseong hot spring Korea cityscape",
    personas: [
      {
        title: "기술 기반 스마트팜에 관심 있는 분",
        description:
          "KAIST, 충남대 등 연구기관이 밀집해 농업 기술 협력 기회가 풍부합니다.",
      },
      {
        title: "충청권 도시 생활을 병행하며 농업을 준비하는 분",
        description:
          "도시 인프라를 누리면서 인근 충남·충북 농지에서 영농을 시작할 수 있습니다.",
      },
    ],
  },
  {
    id: "chungnam",
    name: "충청남도",
    shortName: "충남",
    description: "쌀·인삼·딸기의 전통 농업 강호, 서해안 온화한 기후",
    highlights: ["쌀 주산지", "인삼 특구", "서해안 기후", "귀농 지원 활발"],
    stationIds: ["238"],
    representativeStationId: "238",
    sgisCode: "34",
    hiraSidoCd: "340000",
    eduCode: "N10",
    unsplashQuery: "Korea rice paddy field landscape",
    personas: [
      {
        title: "전통 농업(쌀·인삼·참깨)의 안정적 수익을 원하는 분",
        description:
          "전국 쌀 생산 1위 지역이며, 금산 인삼 등 특화 작물 클러스터가 형성되어 있습니다.",
      },
      {
        title: "귀농 지원 혜택을 최대한 활용하고 싶은 분",
        description:
          "기초영농교육, 농지 장기 임대, 주택 융자 등 전국 단위 지원사업 접근이 용이합니다.",
      },
    ],
  },
  {
    id: "jeonbuk",
    name: "전라북도",
    shortName: "전북",
    description: "호남 평야의 비옥한 땅, 한국 농업의 곡창지대",
    highlights: ["호남 평야", "쌀·콩", "전통 식문화", "축산 컨설팅"],
    stationIds: ["146"],
    representativeStationId: "146",
    sgisCode: "35",
    hiraSidoCd: "350000",
    eduCode: "P10",
    unsplashQuery: "Jeonju Hanok Village Korea",
    personas: [
      {
        title: "넓은 평야에서 곡물·식량 작물을 재배하고 싶은 분",
        description:
          "전국 최대의 곡창지대로 농지 확보가 용이하고, 쌀·콩 등 식량 작물 생산성이 높습니다.",
      },
      {
        title: "한국 전통 식문화와 연계한 농업을 꿈꾸는 분",
        description:
          "전주 비빔밥 등 지역 식문화 브랜드와 연계한 로컬푸드 사업이 활발합니다.",
      },
    ],
  },
  {
    id: "gwangju",
    name: "광주광역시",
    shortName: "광주",
    description: "전남 농업권의 거점 도시, 문화와 농업의 교차점",
    highlights: ["전남 거점", "로컬푸드", "문화도시", "교육 인프라"],
    stationIds: ["156"],
    representativeStationId: "156",
    sgisCode: "24",
    hiraSidoCd: "240000",
    eduCode: "F10",
    unsplashQuery: "Mudeungsan mountain Gwangju Korea",
    personas: [
      {
        title: "도시 생활을 유지하며 전남 농업에 접근하려는 분",
        description:
          "광주에 거주하면서 인근 전남 지역 농지에서 영농 활동이 가능합니다.",
      },
      {
        title: "로컬푸드·직거래에 관심 있는 분",
        description:
          "광주광역시 로컬푸드 직매장이 잘 갖춰져 있어 안정적 판로 확보가 가능합니다.",
      },
    ],
  },
  {
    id: "jeonnam",
    name: "전라남도",
    shortName: "전남",
    description: "온화한 남해안 기후, 다양한 작물과 풍부한 귀농 지원",
    highlights: ["온난 기후", "다품목 재배", "귀농 지원금", "남해안 생활"],
    stationIds: ["262", "259"],
    representativeStationId: "259",
    sgisCode: "36",
    hiraSidoCd: "360000",
    eduCode: "Q10",
    unsplashQuery: "Korean green tea field rows",
    personas: [
      {
        title: "온화한 기후에서 다양한 작물을 시도하고 싶은 분",
        description:
          "쌀, 고구마, 마늘, 양파, 배 등 다품목 재배가 가능하며, 보성 녹차 등 특산품도 유명합니다.",
      },
      {
        title: "귀농 정착 지원금 등 실질적 혜택을 원하는 분",
        description:
          "순천시 귀농 정착 지원금, 주택 수리비 지원 등 전남 지역만의 파격적인 지원 혜택이 있습니다.",
      },
      {
        title: "바다와 가까운 자연환경을 선호하는 분",
        description:
          "순천만, 보성 등 아름다운 남해안 생활환경과 농업을 동시에 누릴 수 있습니다.",
      },
    ],
  },
  {
    id: "daegu",
    name: "대구광역시",
    shortName: "대구",
    description: "분지 기후의 도시 근교 농업과 과수원 전통",
    highlights: ["분지 기후", "사과 전통", "도시 근교", "경북 거점"],
    stationIds: ["143"],
    representativeStationId: "143",
    sgisCode: "22",
    hiraSidoCd: "220000",
    eduCode: "D10",
    unsplashQuery: "Daegu 83 tower South Korea",
    personas: [
      {
        title: "도시형 과수·원예 농업에 관심 있는 분",
        description:
          "대구 근교 과수원이 전통적으로 발달했고, 도시 소비자 직접 판매가 용이합니다.",
      },
      {
        title: "경상북도 귀농을 준비하며 도시 생활을 병행하려는 분",
        description:
          "경북 영주·봉화 등과 1시간 내 연결되어 준비 단계에서 거점으로 활용 가능합니다.",
      },
    ],
  },
  {
    id: "gyeongbuk",
    name: "경상북도",
    shortName: "경북",
    description: "사과·포도·인삼의 과수 강국, 전통 농촌 마을 보존",
    highlights: ["사과 주산지", "포도·인삼", "전통 농촌", "스마트팜 단지"],
    stationIds: ["271", "272"],
    representativeStationId: "272",
    sgisCode: "37",
    hiraSidoCd: "370000",
    eduCode: "S10",
    unsplashQuery: "Bulguksa temple Gyeongju Korea",
    personas: [
      {
        title: "과수(사과·포도) 전문 농가를 꿈꾸는 분",
        description:
          "영주·봉화 지역은 전국 최고 품질의 사과 산지이며, 과수원 조성 지원 사업이 있습니다.",
      },
      {
        title: "스마트팜·첨단 시설농업에 투자하려는 분",
        description:
          "경북 스마트팜 시설 지원 사업이 활발하고, ICT 기반 과수 관리 기술이 보급되고 있습니다.",
      },
      {
        title: "전통 농촌 공동체에서 정착하고 싶은 분",
        description:
          "마을 단위 귀농 정착 프로그램이 잘 갖춰져 있어 초기 적응이 수월합니다.",
      },
    ],
  },
  {
    id: "gyeongnam",
    name: "경상남도",
    shortName: "경남",
    description: "지리산 자락부터 남해안까지, 마늘·딸기·약용작물의 보고",
    highlights: ["마늘·딸기", "약용작물", "지리산 자락", "남해안 기후"],
    stationIds: ["192", "289"],
    representativeStationId: "192",
    sgisCode: "38",
    hiraSidoCd: "380000",
    eduCode: "T10",
    unsplashQuery: "Hallyeohaesang Tongyeong cable car Korea coast",
    personas: [
      {
        title: "마늘·양파·딸기 등 채소·과수 농업을 원하는 분",
        description:
          "의령 마늘, 진주 딸기 등 전국적 브랜드 작물이 많아 판로가 안정적입니다.",
      },
      {
        title: "약용작물·특수작물에 관심 있는 분",
        description:
          "산청 지리산 자락의 약용작물 재배 지원 사업이 있으며, 한방 특구와 연계됩니다.",
      },
      {
        title: "산과 바다를 모두 누리고 싶은 분",
        description:
          "지리산 산간 지역부터 남해안 온난 지역까지 다양한 생활환경을 선택할 수 있습니다.",
      },
    ],
  },
  {
    id: "jeju",
    name: "제주특별자치도",
    shortName: "제주",
    description: "아열대 기후의 감귤 왕국, 관광과 농업의 융합",
    highlights: ["감귤·아열대", "관광 연계", "팜스테이", "청정 환경"],
    stationIds: ["184", "189"],
    representativeStationId: "184",
    sgisCode: "39",
    hiraSidoCd: "390000",
    eduCode: "V10",
    unsplashQuery: "Seongsan Ilchulbong Jeju Korea",
    personas: [
      {
        title: "감귤·아열대 작물에 도전하고 싶은 분",
        description:
          "감귤 신품종 보급 지원이 있으며, 온난화로 망고·패션프루트 등 아열대 작물 재배가 확대 중입니다.",
      },
      {
        title: "관광·체험과 결합한 6차산업을 구상하는 분",
        description:
          "연간 1,500만 관광객을 활용한 팜스테이·농촌 체험이 높은 수익을 기대할 수 있습니다.",
      },
      {
        title: "독특한 자연환경에서 새로운 삶을 시작하려는 분",
        description:
          "제주만의 청정 자연과 여유로운 생활 문화는 삶의 질 자체를 바꿔줍니다.",
      },
    ],
  },
];

/** slug로 도 찾기 */
export function getProvinceById(id: string): Province | undefined {
  return PROVINCES.find((p) => p.id === id);
}

/** province 정식 명칭으로 도 찾기 */
export function getProvinceByName(name: string): Province | undefined {
  return PROVINCES.find((p) => p.name === name);
}
