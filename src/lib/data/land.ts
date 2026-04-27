/**
 * 토지·농지 정적 데이터
 * - 지목 체계, 농지 취득 절차, 용도지역, 취득 자격 요건
 * - 출처: 농지법, 공간정보관리법(지적법), 국토계획법
 */

/* ── 1. 지목(地目) 체계 ── */

export interface LandType {
  /** 고유 식별자 */
  id: string;
  /** 정식 명칭 — "전(田)" */
  name: string;
  /** 약칭 — "전" */
  shortName: string;
  /** 한자 훈음 — "밭 전" */
  hanja: string;
  /** 지목 코드 (공간정보관리법 시행령 기준) */
  code: string;
  /** 법률상 정의 */
  description: string;
  /** 귀농 관련도 */
  farmingRelevance: "핵심" | "중요" | "부수";
  /** 귀농 관점 설명 */
  farmingDescription: string;
  /** 아이콘 */
  icon: string;
}

export const LAND_TYPES: LandType[] = [
  {
    id: "jeon",
    name: "전(田)",
    shortName: "전",
    hanja: "밭 전",
    code: "01",
    description:
      "물을 상시적으로 이용하지 않고 곡물·원예작물(채소·약초·꽃·잔디)·과수류 기타 식물을 재배하는 토지.",
    farmingRelevance: "핵심",
    farmingDescription:
      "밭작물(고추, 마늘, 감자, 고구마, 콩 등) 재배의 기본 토지. 귀농 시 가장 먼저 검토하는 지목이며, 비닐하우스·시설원예도 전에서 가능해요.",
    icon: "🌿",
  },
  {
    id: "dap",
    name: "답(畓)",
    shortName: "답",
    hanja: "논 답",
    code: "02",
    description:
      "물을 상시적으로 직접 이용하여 벼·연(蓮)·미나리·왕골 등의 식물을 주로 재배하는 토지.",
    farmingRelevance: "핵심",
    farmingDescription:
      "벼농사의 근간이 되는 토지. 관개시설이 확보된 논은 안정적 수확이 가능하며, 벼 이외에도 이모작·답전윤환을 통해 보리·밀 등 이중 수확을 기대할 수 있어요.",
    icon: "🌾",
  },
  {
    id: "gwasu",
    name: "과수원(果樹園)",
    shortName: "과",
    hanja: "과일나무 과, 나무 수, 동산 원",
    code: "03",
    description:
      "사과·배·밤·호두·귤·감·매실·복숭아·살구·포도·감귤 등 과수류를 집단적으로 재배하는 토지와 이에 접속된 저장고 등 부속시설의 부지.",
    farmingRelevance: "핵심",
    farmingDescription:
      "과수 재배 전용 토지. 나무가 성목이 되기까지 3~5년이 소요되므로, 기존 과수원을 인수하면 초기 수확까지의 시간을 단축할 수 있어요. 사과·배·감귤 등 주산지 여부를 반드시 확인하세요.",
    icon: "🍎",
  },
  {
    id: "imya",
    name: "임야(林野)",
    shortName: "임",
    hanja: "수풀 림, 들 야",
    code: "05",
    description:
      "산림 및 원야(原野)를 이루고 있는 수림지·죽림지·암석지·자갈땅·모래땅·습지·황무지 등의 토지.",
    farmingRelevance: "중요",
    farmingDescription:
      "임산물(표고버섯, 산나물, 약초, 산양삼) 재배와 산림경영에 활용 가능해요. 전용허가 없이는 농작물 재배가 불가하며, 산지전용허가 절차가 필요해요.",
    icon: "🌲",
  },
  {
    id: "daeji",
    name: "대지(垈地)",
    shortName: "대",
    hanja: "터 대",
    code: "08",
    description:
      "영구적 건축물 중 주거·사무실·점포와 박물관·극장·미술관 등 문화시설과 이에 접속된 정원 및 부속시설의 부지.",
    farmingRelevance: "부수",
    farmingDescription:
      "귀농 주거지 확보에 필수적인 지목. 농지(전·답)에는 농막·컨테이너 외 주택 건축이 제한되므로, 별도 대지를 확보하거나 농지전용 후 건축해야 해요.",
    icon: "🏠",
  },
  {
    id: "mokjang",
    name: "목장용지(牧場用地)",
    shortName: "목",
    hanja: "칠 목, 마당 장",
    code: "09",
    description:
      "축산업 및 낙농업을 하기 위하여 초지를 조성한 토지와 축산법에 따른 가축을 사육하는 축사 등의 부지.",
    farmingRelevance: "중요",
    farmingDescription:
      "축산·낙농업 기반 토지. 한우·젖소·양·염소 등 사육을 계획한다면 목장용지가 적합해요. 축산업 허가와 가축사육시설 기준을 충족해야 하며, 인접 주거지와의 이격거리 규정을 확인하세요.",
    icon: "🐄",
  },
  {
    id: "changgo",
    name: "창고용지(倉庫用地)",
    shortName: "창",
    hanja: "곳간 창, 곳간 고",
    code: "18",
    description:
      "물건 등을 보관 또는 저장하기 위하여 독립적으로 설치된 보관시설의 부지와 이에 접속된 부속시설의 부지.",
    farmingRelevance: "부수",
    farmingDescription:
      "수확 농산물의 저장·선별·가공 시설 부지로 활용돼요. 농산물 산지유통시설(APC), 저온저장고, 건조시설 등을 운영하려면 창고용지 확보가 유리해요.",
    icon: "🏭",
  },
];

/** 지목 ID로 LandType 조회 */
export function getLandTypeById(id: string): LandType | undefined {
  return LAND_TYPES.find((lt) => lt.id === id);
}

/** 전체 지목 ID 목록 (정적 생성용) */
export function getAllLandTypeIds(): string[] {
  return LAND_TYPES.map((lt) => lt.id);
}

/** 귀농 관련도 필터 상수 */
export const LAND_FARMING_RELEVANCES = ["전체", "핵심", "중요", "부수"] as const;
export type LandFarmingRelevance = (typeof LAND_FARMING_RELEVANCES)[number];

/* ── 2. 농지 취득 자격증명 발급 절차 ── */

export interface AcquisitionStep {
  /** 단계 번호 */
  step: number;
  /** 단계 제목 */
  title: string;
  /** 상세 설명 */
  description: string;
  /** 소요 기간 */
  duration: string;
  /** 실무 팁 */
  tip?: string;
}

/** 농지취득자격증명 발급 절차 (농지법 제8조) */
export const ACQUISITION_STEPS: AcquisitionStep[] = [
  {
    step: 1,
    title: "농업경영계획서 작성",
    description:
      "취득하려는 농지에서 어떤 작물을 어떤 방식으로 재배할 것인지 구체적인 농업경영계획서를 작성해요. 재배 작물, 노동력 확보 방안, 농기계 보유·임차 계획 등을 포함해야 해요.",
    duration: "신청인 준비 기간에 따라 상이",
    tip: "계획서 내용이 취득 농지의 지목·면적·위치와 부합해야 해요. 실현 가능성이 낮은 계획은 반려 사유가 돼요.",
  },
  {
    step: 2,
    title: "읍/면/동 주민센터 신청",
    description:
      "농지 소재지 관할 읍·면·동 주민센터에 농지취득자격증명 발급 신청서와 농업경영계획서를 제출해요. 신분증, 토지 관련 서류(등기부등본, 토지대장 등)를 함께 지참해요.",
    duration: "접수 당일",
    tip: "농지 소재지와 거주지가 다를 수 있으므로, 반드시 '농지 소재지' 관할 주민센터에 신청해야 해요.",
  },
  {
    step: 3,
    title: "농지위원회 심의",
    description:
      "읍·면·동장이 농업경영계획의 타당성을 검토하고 농지위원회의 확인을 거칩니다. 자격 요건, 경영계획의 실현 가능성, 통작거리(농지와 거주지 간 거리) 등을 심사해요.",
    duration: "4영업일 이내",
    tip: "통작거리 제한은 2023년 농지법 개정으로 강화됐어요. 농지 소재지에서 직선거리 30km 또는 시·군 내 거주 요건을 확인하세요.",
  },
  {
    step: 4,
    title: "적합 판정 시 증명 발급",
    description:
      "심의 결과 적합 판정을 받으면 농지취득자격증명이 발급돼요. 부적합 판정 시 사유를 통보받으며, 보완 후 재신청이 가능해요.",
    duration: "심의 완료 후 즉시",
    tip: "부적합 판정에 대해서는 이의신청이 가능해요. 판정 사유를 확인하고 보완 후 재신청하세요.",
  },
  {
    step: 5,
    title: "소유권 이전 등기",
    description:
      "발급받은 농지취득자격증명을 첨부하여 관할 등기소에서 소유권 이전 등기를 완료해요. 증명 발급일로부터 2년 이내에 등기해야 하며, 기한 경과 시 증명이 실효돼요.",
    duration: "발급일로부터 2년 이내",
    tip: "매매계약 전 증명을 먼저 발급받는 것이 안전해요. 증명 없이 계약 후 발급이 거부되면 계약 이행이 불가능해질 수 있어요.",
  },
];

/* ── 3. 용도지역 안내 ── */

export interface ZoningType {
  /** 고유 식별자 */
  id: string;
  /** 용도지역 명칭 */
  name: string;
  /** 귀농 관점 설명 */
  farmingDescription: string;
  /** 건축 가능 난이도 */
  buildingEase: "용이" | "조건부" | "제한" | "불가";
}

export const ZONING_TYPES: ZoningType[] = [
  {
    id: "farmland",
    name: "농림지역",
    farmingDescription:
      "농업 진흥 및 산림 보전을 위해 지정된 지역으로, 농업 활동에 가장 적합해요. 농지전용이 까다로운 대신 농지 가격이 상대적으로 저렴하고, 대규모 영농에 유리해요. 농업진흥구역 내에서는 농업용 건축물(농막, 축사, 창고) 외 건축이 엄격히 제한돼요.",
    buildingEase: "제한",
  },
  {
    id: "management",
    name: "관리지역",
    farmingDescription:
      "계획관리·생산관리·보전관리 3개 세부 지역으로 구분돼요. 계획관리지역은 개발과 농업이 혼재 가능하여 농가 주택 건축이 비교적 용이해요. 생산관리지역은 농업 생산성 보호 목적이며, 보전관리지역은 자연환경 보전 우선이에요.",
    buildingEase: "조건부",
  },
  {
    id: "natural-green",
    name: "자연녹지지역",
    farmingDescription:
      "도시 내 녹지 보전을 위해 지정되며, 제한적 개발이 허용돼요. 소규모 농업 활동과 농가 주택 건축이 가능하나, 건폐율·용적률 제한이 있어 대규모 시설은 어려워요. 도시 근교 귀농·반농반X 생활에 적합해요.",
    buildingEase: "조건부",
  },
  {
    id: "conservation-green",
    name: "보전녹지지역",
    farmingDescription:
      "도시의 자연환경·경관·산림·녹지공간을 보전할 목적으로 지정된 지역이에요. 개발 행위가 매우 제한적이며, 신규 건축물 건축이 사실상 불가해요. 기존 농업 활동은 가능하나 신규 영농 시설 설치는 어려워요.",
    buildingEase: "불가",
  },
];

/** 용도지역 ID로 조회 */
export function getZoningTypeById(id: string): ZoningType | undefined {
  return ZONING_TYPES.find((z) => z.id === id);
}

/** 건축 난이도 필터 상수 */
export const BUILDING_EASE_LEVELS = [
  "전체",
  "용이",
  "조건부",
  "제한",
  "불가",
] as const;
export type BuildingEaseLevel = (typeof BUILDING_EASE_LEVELS)[number];

/* ── 4. 유용 외부 링크 ── */

export interface ExternalLandService {
  /** 서비스 명칭 */
  name: string;
  /** URL */
  url: string;
  /** 서비스 설명 */
  description: string;
  /** 아이콘 */
  icon: string;
}

export const EXTERNAL_LAND_SERVICES: ExternalLandService[] = [
  {
    name: "실거래가 공개시스템",
    url: "https://rt.molit.go.kr",
    description:
      "국토교통부에서 운영하는 부동산 실거래가 조회 시스템. 토지·아파트·단독주택 등의 실거래 가격을 지역별·기간별로 조회할 수 있어, 농지 매입 시 적정 가격 판단에 필수적이에요.",
    icon: "💰",
  },
  {
    name: "토지이음",
    url: "https://www.eum.go.kr",
    description:
      "토지이용계획 열람, 용도지역·지구·구역 규제 확인, 개별공시지가 조회 등을 제공하는 국토교통부 통합 플랫폼. 기존 토지이용규제정보서비스(LURIS)가 통합되었으며, 농지 매입 전 규제 사항과 개발 가능성을 반드시 확인해야 해요.",
    icon: "🗺️",
  },
  {
    name: "씨:리얼(SEE:REAL)",
    url: "https://seereal.lh.or.kr",
    description:
      "한국토지주택공사(LH)에서 운영하는 부동산 종합정보 포털. 공시지가, 실거래가, 개발 계획, 토지 거래 허가구역 등을 한곳에서 확인할 수 있어요. 기존 온나라 부동산 포털이 통합·개편됐어요.",
    icon: "🏛️",
  },
  {
    name: "농지은행",
    url: "https://www.fbo.or.kr",
    description:
      "한국농어촌공사에서 운영하는 농지 매매·임대차 중개 플랫폼. 귀농인을 위한 농지 매물 정보, 농지 임대·위탁경영 서비스를 제공하며, 농지연금 상담도 가능해요.",
    icon: "🌾",
  },
];

/* ── 5. 농지 취득 자격 요건 (농지법 제6조) ── */

export interface FarmerQualification {
  /** 자격 유형 */
  type: string;
  /** 취득 조건 */
  condition: string;
  /** 면적 제한 등 */
  limit?: string;
}

/** 농지법 제6조 기반 농지 소유 자격 요건 */
export const FARMER_QUALIFICATIONS: FarmerQualification[] = [
  {
    type: "농업인",
    condition:
      "자기의 농업경영에 이용하거나 이용할 자로서, 농업경영계획서를 제출하고 농지취득자격증명을 발급받아야 해요. 통작거리 요건(농지 소재지 시·군 또는 직선거리 30km 이내 거주)을 충족해야 해요.",
    limit: "소유 상한 없음 (자경 전제)",
  },
  {
    type: "농업법인",
    condition:
      "농업회사법인 또는 영농조합법인으로서, 업무집행권을 가진 자의 1/3 이상이 농업인이어야 해요. 법인 명의로 농지를 취득하며, 법인 설립 시 농업 관련 사업목적이 정관에 명시되어야 해요.",
    limit: "농업회사법인: 소유 상한 없음 / 영농조합법인: 소유 상한 없음 (농업경영 목적)",
  },
  {
    type: "주말·체험영농",
    condition:
      "주말·여가 활동으로 농작물을 경작하거나 다년생 식물을 재배하는 경우. 세대원 전체 합산 면적 기준으로 제한되며, 농지취득자격증명 발급이 필요해요.",
    limit: "세대원 합산 총 1,000m2(약 302평) 이하",
  },
];
