/**
 * 주요 작물 기본 정보 상수 데이터
 * - 귀농 시 재배 가능한 대표 작물 위주로 선별
 */

export interface CropInfo {
  id: string;
  name: string;
  category: "식량" | "채소" | "과수" | "특용";
  growingSeason: string;
  difficulty: "쉬움" | "보통" | "어려움";
  description: string;
  emoji: string;
}

// --- 작물 상세 정보 ---

/** 재배 환경 상세 */
export interface CultivationDetail {
  climate: string;
  soil: string;
  water: string;
  spacing: string;
  fertilizerNote: string;
}

/** 품종·재배방식별 수익 정보 */
export interface VarietyIncome {
  /** 품종명 또는 재배방식 (예: "샤인머스캣", "노지재배", "토경재배") */
  name: string;
  /** 공식 통계 기반 소득 범위 — 검증된 데이터가 없으면 생략 */
  revenueRange?: string;
  /** 한줄 특성 설명 */
  note?: string;
}

/** 수익 정보 */
export interface IncomeInfo {
  revenueRange: string;
  costNote: string;
  laborNote: string;
  /** 연 수익 달성을 위한 최소 권장 규모 (예: "3,000평 이상") */
  minScale?: string;
  /** 연간 필요 노동일수 (예: "약 150~200일") */
  annualWorkdays?: string;
  /** 노동 강도 */
  laborIntensity?: "낮음" | "보통" | "높음";
  /** 수익 데이터 출처 (예: "농촌진흥청 농업소득자료집 2024") */
  source?: string;
  /** 품종별 수익 정보 */
  varieties?: VarietyIncome[];
}

/** 재배 방법 단계 */
export interface CultivationStep {
  /** 단계 번호 */
  step: number;
  /** 단계명 (예: "파종") */
  title: string;
  /** 시기 (예: "3~4월") */
  period: string;
  /** 설명 */
  description: string;
}

/** KOSIS 연동 설정 — API 데이터 매핑용 */
export interface KosisConfig {
  tblId: string;
  objL1Code?: string;
}

/** 장단점 카테고리 */
export type ProsConsCategory =
  | "수익성"
  | "재배난이도"
  | "시장성"
  | "안정성"
  | "생활"
  | "확장성";

/** 장단점 항목 */
export interface ProsConsItem {
  category: ProsConsCategory;
  text: string;
}

/** 장단점 정보 */
export interface ProsConsInfo {
  pros: ProsConsItem[];
  cons: ProsConsItem[];
  verdict?: string;
}


/** 투자·노력 상세 — "이 수익을 얻으려면 얼마나 필요한가" */
export interface InvestmentDetail {
  /** 초기 투자 비용 (시설·묘목·장비 등) */
  initialCost: string;
  /** 연간 운영 비용 (난방·인건비·자재 등) */
  annualOperatingCost: string;
  /** 손익분기점까지 기간 */
  breakEvenPeriod: string;
  /** 안정 수익을 위한 최소 권장 면적 */
  minimumArea: string;
  /** 연간 주요 작업 노동일수 또는 강도 */
  annualLaborDays: string;
}

/** 외부 콘텐츠 (유튜브·블로그 큐레이션) */
export interface ExternalResource {
  type: "youtube" | "blog";
  title: string;
  url: string;
  /** 유튜브: 썸네일 URL, 블로그: OG 이미지 (선택) */
  thumbnail?: string;
  /** 블로그 출처명 (네이버 블로그, 티스토리 등) */
  source?: string;
}

/** 작물 상세 정보 — CropInfo.id로 1:1 매핑 */
export interface CropDetailInfo {
  id: string;
  cultivation: CultivationDetail;
  income: IncomeInfo;
  majorRegions: string[];
  tips: string[];
  relatedCropIds: string[];
  kosisConfig?: KosisConfig;
  prosCons?: ProsConsInfo;
  /** 재배 방법 (단계별) */
  cultivationSteps?: CultivationStep[];
  investmentDetail?: InvestmentDetail;
  externalResources?: ExternalResource[];
}

/** 기본 정보 + 상세 정보를 합쳐 반환. 상세가 없으면 null */
export function getCropWithDetail(
  id: string
): (CropInfo & { detail: CropDetailInfo }) | null {
  const crop = CROPS.find((c) => c.id === id);
  const detail = CROP_DETAILS.find((d) => d.id === id);
  if (!crop || !detail) return null;
  return { ...crop, detail };
}

/** 정적 생성을 위한 전체 ID 목록 */
export function getAllCropIds(): string[] {
  return CROPS.map((c) => c.id);
}

/** 작물 별칭 → 정규 이름 매핑 */
const CROP_ALIAS: Record<string, string> = {
  벼: "쌀",
  한라봉: "감귤",
  천혜향: "감귤",
  산양삼: "인삼",
  로켓: "루꼴라",
  "rocket salad": "루꼴라",
  아루굴라: "루꼴라",
  애플망고: "망고",
  어윈: "망고",
};

/** 작물 이름 → CropInfo 매핑 (Cross-linking용, 별칭 지원) */
export function getCropByName(name: string): CropInfo | undefined {
  return (
    CROPS.find((c) => c.name === name) ??
    CROPS.find((c) => c.name === CROP_ALIAS[name])
  );
}

export const CROP_CATEGORIES = ["전체", "식량", "채소", "과수", "특용"] as const;
export type CropCategory = (typeof CROP_CATEGORIES)[number];

export const CROP_DIFFICULTIES = ["전체", "쉬움", "보통", "어려움"] as const;
export type CropDifficulty = (typeof CROP_DIFFICULTIES)[number];

export const CROPS: CropInfo[] = [
  // 식량작물
  {
    id: "rice",
    name: "쌀",
    category: "식량",
    growingSeason: "4월~10월",
    difficulty: "보통",
    description:
      "우리나라 대표 식량작물. 논 재배가 기본이며, 기계화가 잘 되어 있어 대규모 재배에 유리합니다.",
    emoji: "🌾",
  },
  {
    id: "soybean",
    name: "콩",
    category: "식량",
    growingSeason: "5월~10월",
    difficulty: "쉬움",
    description:
      "밭작물 중 재배가 수월한 편. 토양을 비옥하게 하는 질소고정 효과가 있어 윤작에 적합합니다.",
    emoji: "🫘",
  },
  {
    id: "sweet-potato",
    name: "고구마",
    category: "식량",
    growingSeason: "5월~10월",
    difficulty: "쉬움",
    description:
      "병해충에 강하고 재배가 쉬워 초보 귀농인에게 추천. 저장성이 좋아 출하 시기를 조절할 수 있습니다.",
    emoji: "🍠",
  },
  {
    id: "potato",
    name: "감자",
    category: "식량",
    growingSeason: "3월~7월",
    difficulty: "쉬움",
    description:
      "서늘한 기후에서 잘 자라며 강원도 고랭지 감자가 유명. 이모작으로 가을 감자도 가능합니다.",
    emoji: "🥔",
  },
  {
    id: "corn",
    name: "옥수수",
    category: "식량",
    growingSeason: "4월~8월",
    difficulty: "쉬움",
    description:
      "생육 기간이 짧고 재배가 간편. 찰옥수수, 초당옥수수 등 고부가가치 품종도 인기입니다.",
    emoji: "🌽",
  },

  // 채소류
  {
    id: "chili-pepper",
    name: "고추",
    category: "채소",
    growingSeason: "3월~10월",
    difficulty: "어려움",
    description:
      "수익성이 높지만 탄저병 등 병해 관리가 까다로움. 건고추 기준 소득이 높은 고수익 작물입니다.",
    emoji: "🌶️",
  },
  {
    id: "napa-cabbage",
    name: "배추",
    category: "채소",
    growingSeason: "8월~11월",
    difficulty: "보통",
    description:
      "김장 수요로 안정적 판로 확보 가능. 봄배추, 고랭지배추 등 시기별 재배가 가능합니다.",
    emoji: "🥬",
  },
  {
    id: "garlic",
    name: "마늘",
    category: "채소",
    growingSeason: "9월~6월",
    difficulty: "보통",
    description:
      "가을에 심어 이듬해 수확. 의성 마늘, 남해 마늘 등 산지별 특화 품종이 있습니다.",
    emoji: "🧄",
  },
  {
    id: "onion",
    name: "양파",
    category: "채소",
    growingSeason: "9월~6월",
    difficulty: "보통",
    description:
      "전남 무안, 경남 창녕이 주산지. 저장성이 좋으나 가격 변동이 큰 편입니다.",
    emoji: "🧅",
  },
  {
    id: "lettuce",
    name: "상추",
    category: "채소",
    growingSeason: "3월~11월",
    difficulty: "쉬움",
    description:
      "생육 기간이 짧아 연중 다회 수확 가능. 소규모 시설재배에 적합한 입문용 채소입니다.",
    emoji: "🥗",
  },

  // 과수류
  {
    id: "apple",
    name: "사과",
    category: "과수",
    growingSeason: "4월~10월",
    difficulty: "어려움",
    description:
      "대구·경북이 전통 주산지이나 기후변화로 강원·충북으로 재배지 이동 중. 초기 투자비가 큽니다.",
    emoji: "🍎",
  },
  {
    id: "pear",
    name: "배",
    category: "과수",
    growingSeason: "4월~10월",
    difficulty: "어려움",
    description:
      "나주배가 대표적. 과수원 조성 후 수확까지 3~4년이 필요하며 전정 기술이 중요합니다.",
    emoji: "🍐",
  },
  {
    id: "grape",
    name: "포도",
    category: "과수",
    growingSeason: "4월~9월",
    difficulty: "보통",
    description:
      "샤인머스캣 등 고급 품종의 인기가 높음. 비가림 시설이 필수이며 노동 집약적입니다.",
    emoji: "🍇",
  },
  {
    id: "citrus",
    name: "감귤",
    category: "과수",
    growingSeason: "3월~12월",
    difficulty: "보통",
    description:
      "제주도 특산물이지만 최근 남해안 지역으로 재배지 확대 중. 한라봉 등 만감류도 성장세입니다.",
    emoji: "🍊",
  },
  {
    id: "strawberry",
    name: "딸기",
    category: "과수",
    growingSeason: "9월~5월",
    difficulty: "어려움",
    description:
      "겨울 시설재배로 높은 수익 가능. 묘 관리, 온습도 조절 등 세밀한 기술이 요구됩니다.",
    emoji: "🍓",
  },

  // 특용작물
  {
    id: "ginseng",
    name: "인삼",
    category: "특용",
    growingSeason: "3월~10월",
    difficulty: "어려움",
    description:
      "4~6년 재배 후 수확하는 장기 투자 작물. 금산·풍기가 유명하며 연작이 불가합니다.",
    emoji: "🌿",
  },
  {
    id: "sesame",
    name: "참깨",
    category: "특용",
    growingSeason: "5월~9월",
    difficulty: "보통",
    description:
      "소규모 밭에서 재배 가능한 고소득 작물. 수확 시 노동력이 많이 필요하지만 단가가 높습니다.",
    emoji: "🌱",
  },

  // 채소류 (추가)
  {
    id: "arugula",
    name: "루꼴라",
    category: "채소",
    growingSeason: "3~5월·9~11월 (시설: 연중)",
    difficulty: "쉬움",
    description:
      "파종 후 40~50일이면 수확 가능한 서늘한 기후 향채소. 시설재배로 연중 출하하며 밀키트·레스토랑 수요가 꾸준히 성장하는 귀농 초기 진입 작목.",
    emoji: "🥬",
  },

  // 과수류 (추가)
  {
    id: "mango",
    name: "망고",
    category: "과수",
    growingSeason: "10월~이듬해 7월 (시설)",
    difficulty: "어려움",
    description:
      "100% 시설재배가 전제되는 아열대 과수. 10a당 소득이 사과의 6배에 달하지만, 초기 시설 투자비·난방비·착과 관리 난이도가 모두 높아 충분한 기술과 자본이 필요.",
    emoji: "🥭",
  },
];

// --- 작물 상세 데이터 ---

export const CROP_DETAILS: CropDetailInfo[] = [
  {
    id: "rice",
    cultivation: {
      climate: "고온다습한 여름 기후, 생육적온 25~30℃",
      soil: "점질토(찰흙) 논, 배수와 관개가 용이한 평탄지",
      water: "이앙기~출수기 충분한 관개 필수, 물 관리가 핵심",
      spacing: "포기 간격 30x15cm (기계 이앙 기준)",
      fertilizerNote: "질소 과다 시 도복·병해 증가, 분시법 적용 권장",
    },
    income: {
      revenueRange: "1ha당 약 500~800만 원 (쌀값 변동에 따라 차이)",
      costNote: "기계화율 높아 노동비 비중 낮음, 농기계 초기 투자 필요",
      laborNote: "이앙·수확 시기에 집중, 그 외 기간 관리 부담 적음",
      minScale: "논 3,000평(1ha) 이상",
      annualWorkdays: "약 60~80일 (이앙·수확기 집중)",
      laborIntensity: "낮음",
      source: "KOSIS 농축산물생산비조사 (본 자료집 미수록, 추후 검증 예정)",
    },
    majorRegions: ["전라남도", "충청남도", "경상북도", "전라북도"],
    tips: [
      "초보자는 RPC(미곡종합처리장) 계약 재배부터 시작하면 판로 걱정이 줄어듭니다.",
      "논 임대 시 최소 3,000평 이상이어야 농기계 활용 효율이 나옵니다.",
      "직불금 제도를 꼭 확인하세요 — 공익직불, 전략작물직불 등 소득 보전 장치가 있습니다.",
      "첫 해는 관행 재배로 경험을 쌓고, 이후 친환경·특수미 등 부가가치를 높여보세요.",
    ],
    relatedCropIds: ["soybean", "corn", "sweet-potato"],
    kosisConfig: { tblId: "DT_1ET0034" },
    prosCons: {
      pros: [
        { category: "재배난이도", text: "기계화율이 높아 대면적 관리가 수월하고, 기술 진입 장벽이 낮음" },
        { category: "안정성", text: "공익직불·전략작물직불 등 정부 소득보전 제도가 잘 갖춰져 있음" },
        { category: "시장성", text: "RPC 계약재배 등 판로가 안정적이고 유통구조가 체계적" },
        { category: "생활", text: "이앙·수확기 외에는 관리 부담이 적어 여유로운 농촌 생활 가능" },
      ],
      cons: [
        { category: "수익성", text: "ha당 수익이 500~800만 원으로 다른 작물 대비 낮은 편" },
        { category: "시장성", text: "1인당 쌀 소비량이 매년 감소하는 추세로 장기 전망에 불확실성" },
        { category: "수익성", text: "농기계(이앙기·콤바인) 초기 구입 또는 임차 비용이 필요" },
      ],
      verdict: "안정적인 소득과 여유로운 생활을 원하는 귀농 입문자에게 적합한 작물",
    },
    cultivationSteps: [
      { step: 1, title: "못자리 준비·육묘", period: "3~4월", description: "종자 소독 후 육묘상에서 모 기르기. 약 30일간 육묘" },
      { step: 2, title: "논 준비·이앙(모내기)", period: "5~6월", description: "논갈이·써레질 후 기계 이앙. 포기 간격 30x15cm" },
      { step: 3, title: "물 관리·병해충 방제", period: "6~8월", description: "분얼기→중간낙수→출수기 관수. 잎도열병·벼멸구 방제" },
      { step: 4, title: "수확·건조", period: "9~10월", description: "콤바인 기계수확. 수분 함량 15% 이하로 건조 후 RPC 출하" },
    ],
    investmentDetail: {
      initialCost: "농기계(이앙기·콤바인) 구입 또는 임차 2,000~5,000만 원",
      annualOperatingCost: "ha당 비료·농약·연료 등 약 300~400만 원",
      breakEvenPeriod: "1~2년차부터 수익 발생 (기계 임차 시 초년도 가능)",
      minimumArea: "논 1ha(3,000평) 이상이어야 기계화 효율",
      annualLaborDays: "연 40~60일 (이앙·수확기 집중, 그 외 여유)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "쌀값 올리는 비밀, 진짜 있었다.. 벼농사 50년 노하우 공개",
        url: "https://www.youtube.com/watch?v=AlqPtOC5blw",
        thumbnail: "https://img.youtube.com/vi/AlqPtOC5blw/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "벼농사 출수후 물관리 · 병해충 방제 (도열병, 벼멸구 등)",
        url: "https://www.youtube.com/watch?v=8Dl-DAxnbVc",
        thumbnail: "https://img.youtube.com/vi/8Dl-DAxnbVc/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "쌀 농사 과정",
        url: "https://brunch.co.kr/@paxcom/85",
        source: "브런치",
      },
    ],
  },
  {
    id: "soybean",
    cultivation: {
      climate: "온난한 기후, 생육적온 20~25℃",
      soil: "배수 양호한 사질양토~양토, 산성토양 피할 것",
      water: "개화·결협기에 충분한 수분 필요, 과습에 약함",
      spacing: "60x15cm (밭콩 기준), 논콩은 이랑 재배",
      fertilizerNote: "질소고정 작물이라 질소비료 최소화, 인산·칼리 위주 시비",
    },
    income: {
      revenueRange: "1ha당 약 300~500만 원",
      costNote: "생산비 낮은 편, 종자·비료비 외 큰 비용 없음",
      laborNote: "파종·수확기 외에는 노동력 부담 적음",
      minScale: "밭 2,000~3,000평",
      annualWorkdays: "약 50~70일",
      laborIntensity: "낮음",
      source: "KOSIS 농축산물생산비조사 (본 자료집 미수록, 추후 검증 예정)",
      varieties: [
        { name: "일반 백태", note: "두부·된장 등 가공용, 안정적 수요" },
        { name: "토종콩·약콩", note: "직거래 시 프리미엄 단가 가능" },
      ],
    },
    majorRegions: ["충청북도", "경상북도", "전라북도"],
    tips: [
      "논 이모작으로 벼 수확 후 콩을 재배하면 토지 활용도를 높일 수 있습니다.",
      "토종콩·약콩 등 특수 품종은 직거래 시 높은 단가를 받을 수 있습니다.",
      "윤작 작물로 활용하면 토양 질소를 자연 보충하여 후작물에 유리합니다.",
    ],
    relatedCropIds: ["rice", "corn", "sesame"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "재배난이도", text: "재배 기술이 비교적 단순하고, 병해충 관리 부담이 적음" },
        { category: "수익성", text: "생산비가 낮아 소규모에서도 수지를 맞추기 쉬움" },
        { category: "확장성", text: "질소고정 효과로 후작물에 유리해 윤작 체계에 핵심 역할" },
        { category: "시장성", text: "토종콩·약콩 등 특수 품종은 직거래 시 높은 프리미엄 확보 가능" },
      ],
      cons: [
        { category: "수익성", text: "ha당 300~500만 원으로 수익 규모 자체는 크지 않음" },
        { category: "시장성", text: "수입 대두와의 가격 경쟁이 존재해 일반콩은 수익 압박" },
        { category: "안정성", text: "개화·결협기 가뭄이나 과습에 수량이 크게 좌우됨" },
      ],
      verdict: "낮은 비용으로 안정적인 부수입을 원하거나, 윤작 체계를 구축하려는 분에게 추천",
    },
    cultivationSteps: [
      { step: 1, title: "밭 준비·파종", period: "5~6월", description: "배수로 정비, 이랑 만들기 후 종자 직파. 주간 15cm" },
      { step: 2, title: "김매기·추비", period: "7~8월", description: "중경·배토 작업. 개화기 적절한 관수 유지" },
      { step: 3, title: "병해충 관리", period: "8~9월", description: "탄저병·콩나방 방제. 과습 방지를 위한 배수 관리" },
      { step: 4, title: "수확·탈곡", period: "10~11월", description: "잎이 누렇게 변하면 수확. 콤바인 또는 수작업 탈곡" },
    ],
    investmentDetail: {
      initialCost: "종자·비료 위주 500만 원 미만 (논콩 활용 시 추가 비용 적음)",
      annualOperatingCost: "1ha당 약 150~250만 원",
      breakEvenPeriod: "첫 해부터 수익 가능",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 30~50일 (파종·수확기 집중)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "이놈을 막지 못하면 콩농사는 헛방!",
        url: "https://www.youtube.com/watch?v=ahJcQikLCWs",
        thumbnail: "https://img.youtube.com/vi/ahJcQikLCWs/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "부지런한 농민과 게으른 농민 — 콩농사에서 드러나는 진실",
        url: "https://www.youtube.com/watch?v=5fngEcx3Tpo",
        thumbnail: "https://img.youtube.com/vi/5fngEcx3Tpo/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "콩 키우기 / 콩 심는 시기 / 콩 심는 방법",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=15230833",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "sweet-potato",
    cultivation: {
      climate: "고온성 작물, 생육적온 25~30℃",
      soil: "배수 좋은 사질양토, 점토가 많으면 형태 불량",
      water: "가뭄에 강하나 심한 건조 시 수량 감소",
      spacing: "이랑폭 75cm, 주간 25~30cm",
      fertilizerNote: "칼리 비료 중요, 질소 과다 시 잎만 무성해짐",
    },
    income: {
      revenueRange: "10a당 약 171만 원 (1ha당 약 1,711만 원, 소득 기준 2024)",
      costNote: "묘 구입비, 비닐멀칭 자재비가 주요 비용",
      laborNote: "수확이 노동 집약적, 기계 수확 도입 시 효율 향상",
      minScale: "밭 1,000~2,000평",
      annualWorkdays: "약 100~130일",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "밤고구마", note: "전분용·군고구마용, 저장성 우수" },
        { name: "꿀고구마(호박고구마)", note: "소비자 선호도·단가 높음, 직거래 유리" },
      ],
    },
    majorRegions: ["전라남도", "충청남도", "경기도"],
    tips: [
      "꿀고구마(호박고구마) 품종이 소비자 선호도와 단가가 높습니다.",
      "큐어링(상처 치유) 처리 후 저장하면 당도가 올라가고 저장 기간이 길어집니다.",
      "직거래·체험농장과 연계하면 수익성을 크게 높일 수 있습니다.",
    ],
    relatedCropIds: ["potato", "corn", "lettuce"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "재배난이도", text: "병해충에 강하고 재배가 쉬워 초보 귀농인도 도전 가능" },
        { category: "안정성", text: "저장성이 좋아 출하 시기를 조절해 유리한 가격에 판매 가능" },
        { category: "시장성", text: "꿀고구마(호박고구마) 등 소비자 선호 품종의 직거래 수요가 높음" },
        { category: "확장성", text: "체험농장·말랭이 가공 등 6차산업 연계가 활발" },
      ],
      cons: [
        { category: "재배난이도", text: "수확 작업이 노동 집약적이라 인력 확보가 필요" },
        { category: "안정성", text: "품종에 따라 수익성 편차가 크고, 유행 품종이 바뀔 수 있음" },
        { category: "수익성", text: "묘 구입비와 비닐멀칭 자재비 등 자재비 비중이 높음" },
      ],
      verdict: "귀농 입문자에게 가장 추천되는 작물 중 하나 — 직거래와 체험농장 병행 시 수익성 우수",
    },
    cultivationSteps: [
      { step: 1, title: "묘 준비·비닐멀칭", period: "3~4월", description: "씨고구마로 묘상에서 묘(줄기) 기르기. 밭에 비닐멀칭 준비" },
      { step: 2, title: "정식(삽식)", period: "5~6월", description: "이랑폭 75cm에 묘 삽식. 활착을 위해 정식 후 충분한 관수" },
      { step: 3, title: "생육 관리", period: "6~9월", description: "덩굴 뒤집기로 부정근 제거. 칼리 비료 추비. 가뭄 시 관수" },
      { step: 4, title: "수확·큐어링", period: "9~10월", description: "서리 전 수확. 큐어링(33℃·습도 90%·4일) 처리 후 저장" },
    ],
    investmentDetail: {
      initialCost: "묘 구입·비닐멀칭·소형 농기계 등 1,000~2,000만 원",
      annualOperatingCost: "1ha당 약 400~600만 원 (묘·멀칭·비료·인건비)",
      breakEvenPeriod: "1~2년차부터 수익 발생",
      minimumArea: "1,000㎡(약 300평) 이상이면 시작 가능",
      annualLaborDays: "연 50~80일 (수확기 집중 노동)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "싱싱한 고구마 순을 내 손으로 키운다! 씨고구마 싹 틔우기",
        url: "https://www.youtube.com/watch?v=46v065GSyOQ",
        thumbnail: "https://img.youtube.com/vi/46v065GSyOQ/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "고구마비료 — 칼리(K)질 비료성분 많은 이유?",
        url: "https://www.youtube.com/watch?v=f1oPm24a5h4",
        thumbnail: "https://img.youtube.com/vi/f1oPm24a5h4/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "고구마 키우기 / 고구마 심는시기 / 심는방법",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=14484381",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "potato",
    cultivation: {
      climate: "서늘한 기후 선호, 생육적온 15~20℃",
      soil: "배수 양호한 사질양토, 유기질이 풍부한 토양",
      water: "생육 중 균일한 수분 공급 필요, 과습은 역병 유발",
      spacing: "이랑폭 60~70cm, 주간 25~30cm",
      fertilizerNote: "칼리·인산 충분히, 질소는 분시 필요",
    },
    income: {
      revenueRange: "10a당 약 95~125만 원 (가을~봄감자, 소득 기준 2024)",
      costNote: "씨감자, 농약비 비중이 높음, 저장 시설 필요",
      laborNote: "심기·수확 시 집중 노동, 중간 관리는 비교적 수월",
      minScale: "밭 1,500~3,000평",
      annualWorkdays: "약 80~100일",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "봄감자", revenueRange: "10a당 약 125만 원 (1ha당 약 1,250만 원)", note: "가장 보편적, 수미·대서 품종" },
        { name: "가을감자", revenueRange: "10a당 약 95만 원 (1ha당 약 946만 원)", note: "이모작 가능, 소득 다소 낮음" },
      ],
    },
    majorRegions: ["강원도", "경상북도", "제주특별자치도"],
    tips: [
      "강원도 고랭지에서 여름 감자를 재배하면 높은 가격을 받을 수 있습니다.",
      "씨감자는 반드시 검역 인증된 것을 사용하세요 — 바이러스병 예방이 핵심입니다.",
      "봄·가을 이모작이 가능한 지역이라면 연간 수익을 높일 수 있습니다.",
    ],
    relatedCropIds: ["sweet-potato", "corn", "napa-cabbage"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "수익성", text: "고랭지 여름 감자는 시세가 높아 프리미엄 수익 기대 가능" },
        { category: "생활", text: "봄·가을 이모작이 가능해 토지 활용도와 연간 수익을 높일 수 있음" },
        { category: "재배난이도", text: "재배 기간이 짧고 중간 관리가 비교적 수월" },
      ],
      cons: [
        { category: "안정성", text: "역병 등 병해 리스크가 높아 검역 인증 씨감자 사용이 필수" },
        { category: "수익성", text: "저장 시설(저온저장고) 투자가 필요하고 저장 중 손실 발생" },
        { category: "시장성", text: "출하 시기가 겹치면 산지 가격이 크게 하락할 수 있음" },
      ],
      verdict: "강원도 등 서늘한 지역에서 이모작과 함께 운영하면 높은 토지 효율을 기대할 수 있는 작물",
    },
    cultivationSteps: [
      { step: 1, title: "씨감자 준비·밭 갈기", period: "2~3월", description: "검역 인증 씨감자 절단(40~60g). 밭 경운·비료 시비" },
      { step: 2, title: "파종", period: "3~4월", description: "이랑폭 60~70cm, 주간 25~30cm로 심기. 멀칭으로 지온 확보" },
      { step: 3, title: "생육 관리·배토", period: "5~6월", description: "북주기(배토)로 녹화 방지. 역병 예방 방제. 균일 관수" },
      { step: 4, title: "수확·저장", period: "6~7월", description: "하경(茎)이 마르기 시작하면 수확. 저온저장고(3~5℃)에 보관" },
    ],
    investmentDetail: {
      initialCost: "씨감자·농기계·저온저장고 등 1,500~3,000만 원",
      annualOperatingCost: "1ha당 약 400~600만 원 (씨감자·농약·비료)",
      breakEvenPeriod: "1~2년차부터 수익 발생 (저장고 투자 시 3년)",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 40~60일 (파종·수확기 집중)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "감자 전부 알려드립니다 | 감자 재배교육 총 정리",
        url: "https://www.youtube.com/watch?v=dPDfMQXzKEw",
        thumbnail: "https://img.youtube.com/vi/dPDfMQXzKEw/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "씨감자의 싹틔우기 결과가 감자순이 올라오는 기간에 미치는 영향",
        url: "https://www.youtube.com/watch?v=uaQ0zEyVQHU",
        thumbnail: "https://img.youtube.com/vi/uaQ0zEyVQHU/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "감자 키우기 / 감자 심는시기 / 감자 심는방법",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=14413313",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "corn",
    cultivation: {
      climate: "고온성 작물, 생육적온 25~30℃, 서리에 약함",
      soil: "비옥한 양토~사질양토, pH 5.5~7.0",
      water: "수정기·등숙기에 충분한 수분 필요",
      spacing: "이랑폭 60~70cm, 주간 25~30cm",
      fertilizerNote: "질소 요구량이 높음, 웃거름 2~3회 분시",
    },
    income: {
      revenueRange: "10a당 약 114만 원 (노지풋옥수수, 1ha당 약 1,135만 원, 소득 기준 2024)",
      costNote: "종자비·비료비 외 큰 비용 없음, 비닐멀칭 권장",
      laborNote: "재배 기간 짧아 노동 부담 적음, 수확 시기가 집중",
      minScale: "밭 1,000~2,000평",
      annualWorkdays: "약 60~80일",
      laborIntensity: "낮음",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "찰옥수수", note: "삶아먹는 식용, 택배 직거래 가능" },
        { name: "초당옥수수", note: "높은 당도, 직거래 프리미엄" },
        { name: "풋옥수수(일반)", note: "가장 보편적, 공식 통계 기준 작목" },
      ],
    },
    majorRegions: ["강원도", "충청북도", "경기도"],
    tips: [
      "초당옥수수는 당도 높아 직거래에 유리하고, 택배 판매 수요가 높습니다.",
      "시기를 달리 파종(시차재배)하면 출하 기간을 늘려 안정적 수입이 가능합니다.",
      "옥수수 후작으로 배추·무를 심으면 토지 활용도를 높일 수 있습니다.",
    ],
    relatedCropIds: ["sweet-potato", "potato", "soybean"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "생활", text: "재배 기간이 짧아(3~4개월) 노동 집중 기간이 한정적" },
        { category: "시장성", text: "초당옥수수 등 프리미엄 품종은 택배·직거래 수요가 높음" },
        { category: "수익성", text: "생산비가 낮고 종자·비료비 외 큰 비용이 들지 않음" },
      ],
      cons: [
        { category: "수익성", text: "ha당 300~700만 원으로 전업 소득원으로는 부족할 수 있음" },
        { category: "안정성", text: "수확 시기가 집중되어 적기 출하를 놓치면 품질 저하" },
        { category: "시장성", text: "일반 옥수수는 수입산과의 가격 경쟁에서 불리" },
      ],
      verdict: "부업형 귀농이나 다른 작물과의 병행 재배에 적합 — 시차재배로 출하 기간을 늘리는 것이 핵심",
    },
    cultivationSteps: [
      { step: 1, title: "밭 준비·파종", period: "4~5월", description: "비닐멀칭 후 이랑폭 60cm, 주간 25~30cm로 점파" },
      { step: 2, title: "솎음·추비", period: "5~6월", description: "1구 1본으로 솎음. 질소 웃거름 2~3회 분시" },
      { step: 3, title: "수정·생육 관리", period: "6~7월", description: "수정기 충분한 관수. 조명나방·멸강나방 방제" },
      { step: 4, title: "수확·출하", period: "7~8월", description: "수염이 갈변하면 수확 적기. 당일 예냉 후 택배·직거래 출하" },
    ],
    investmentDetail: {
      initialCost: "종자·비닐멀칭·소형 농기계 등 500~1,000만 원",
      annualOperatingCost: "1ha당 약 200~350만 원",
      breakEvenPeriod: "첫 해부터 수익 가능",
      minimumArea: "2,000㎡(약 600평) 이상 권장",
      annualLaborDays: "연 30~50일 (재배 기간이 짧아 부담 적음)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "옥수수 심을 밭에 밑거름 넣고 두둑을 이렇게 만드는 이유!",
        url: "https://www.youtube.com/watch?v=8aR0035757Y",
        thumbnail: "https://img.youtube.com/vi/8aR0035757Y/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "F3 찰옥수수 첫수확 — 한포기에 수확량은 이것이 결정한다!",
        url: "https://www.youtube.com/watch?v=wXkjjvJBVq0",
        thumbnail: "https://img.youtube.com/vi/wXkjjvJBVq0/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "2024년 옥수수 심는 시기 및 재배방법 알아보기",
        url: "https://healthygirl.easycorp.kr/entry/2024%EB%85%84-%EC%98%A5%EC%88%98%EC%88%98-%EC%8B%AC%EB%8A%94-%EC%8B%9C%EA%B8%B0-%EB%B0%8F-%EC%9E%AC%EB%B0%B0%EB%B0%A9%EB%B2%95-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0",
        source: "텃밭일기",
      },
    ],
  },
  {
    id: "chili-pepper",
    cultivation: {
      climate: "고온성, 생육적온 25~30℃, 밤낮 기온차가 클수록 착색 양호",
      soil: "배수 양호한 양토, 유기질 풍부, 연작 금지",
      water: "정식 후 충분한 관수, 장마철 배수 관리 필수",
      spacing: "이랑폭 90~100cm, 주간 40~45cm",
      fertilizerNote: "칼슘 결핍 주의, 장기 재배이므로 추비 3~4회 필수",
    },
    income: {
      revenueRange: "10a당 약 1,259만 원 (시설고추, 소득 기준 2024)",
      costNote: "농약비·인건비가 상당, 비가림 시설 투자 고려",
      laborNote: "수확·건조·탈꼭지 등 노동 집약적, 가족 노동력 중요",
      minScale: "밭 1,000~2,000평",
      annualWorkdays: "약 180~220일 (수확·건조 포함)",
      laborIntensity: "높음",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "시설고추", note: "연중 출하 가능, 공식 통계 기준 작목" },
        { name: "노지 건고추", note: "건조 비용 포함, 가격 변동 큼 (공식 통계 미수록)" },
      ],
    },
    majorRegions: ["충청북도", "경상북도", "전라남도", "충청남도"],
    tips: [
      "탄저병·역병 방제가 수확량을 좌우합니다 — 예방 위주 방제 체계를 세우세요.",
      "비가림 재배 시 병해가 줄고 품질이 좋아져 초기 투자 대비 효과가 큽니다.",
      "건고추 자가 건조 시설을 갖추면 외주 건조비를 절약하고 품질 관리가 가능합니다.",
      "첫해부터 대면적보다 1,000평 이하로 시작해 병해 관리 노하우를 익히세요.",
    ],
    relatedCropIds: ["garlic", "onion", "napa-cabbage"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "수익성", text: "ha당 800~1,500만 원으로 채소류 중 높은 수익 기대" },
        { category: "시장성", text: "국내 고추 수요가 안정적이고 건고추 형태로 장기 저장·판매 가능" },
        { category: "안정성", text: "비가림 재배 시 병해가 크게 줄어 품질과 수량 안정화" },
      ],
      cons: [
        { category: "재배난이도", text: "탄저병·역병 등 병해충 방제가 수확량을 좌우할 만큼 중요" },
        { category: "생활", text: "수확·건조·탈꼭지 등 노동 강도가 높아 가족 노동력이 필요" },
        { category: "안정성", text: "건고추 가격 변동이 크고, 수입산과의 가격 경쟁이 존재" },
      ],
      verdict: "기술 습득에 시간을 투자할 의지가 있다면 채소류 중 높은 수익을 기대할 수 있는 작물",
    },
    cultivationSteps: [
      { step: 1, title: "육묘·정식 준비", period: "1~3월", description: "육묘장에서 모종 기르기(약 60~70일). 밭 경운·비닐멀칭" },
      { step: 2, title: "정식·지주 세우기", period: "4~5월", description: "이랑폭 90~100cm, 주간 40~45cm 정식. 지주대 설치" },
      { step: 3, title: "생육 관리·방제", period: "5~8월", description: "추비 3~4회. 탄저병·역병 예방 위주 방제. 비가림 재배 권장" },
      { step: 4, title: "수확 (풋고추·홍고추)", period: "7~8월", description: "풋고추는 녹색 상태에서, 홍고추는 완전 착색 후 수확" },
      { step: 5, title: "건조·출하", period: "8~10월", description: "태양 건조 또는 건조기 이용. 건고추 수분 14% 이하로 조절" },
    ],
    investmentDetail: {
      initialCost: "비가림 시설·건조기·묘 구입 등 2,000~4,000만 원",
      annualOperatingCost: "1ha당 약 600~1,000만 원 (농약·인건비 비중 높음)",
      breakEvenPeriod: "2~3년차 (비가림 시설 투자 회수 포함)",
      minimumArea: "1,000~2,000㎡(300~600평) 권장 (초보자 기준)",
      annualLaborDays: "연 80~120일 (수확·건조·방제 등 연중 관리)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "고추모종 이식(가식)작업 — 고추농사 고추묘 키우기",
        url: "https://www.youtube.com/watch?v=ZAtVhrV6xHs",
        thumbnail: "https://img.youtube.com/vi/ZAtVhrV6xHs/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "지금 익은 후물고추, 수확해야 하나요?!! 농사의 여신의 고추농사",
        url: "https://www.youtube.com/watch?v=NRdVBxqHTfw",
        thumbnail: "https://img.youtube.com/vi/NRdVBxqHTfw/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "고추 재배법",
        url: "https://brunch.co.kr/@jayyoon1/191",
        source: "브런치",
      },
    ],
  },
  {
    id: "napa-cabbage",
    cultivation: {
      climate: "서늘한 기후 선호, 생육적온 15~20℃",
      soil: "보수력 좋은 양토, 유기질 풍부한 토양",
      water: "결구기에 충분한 수분 공급, 배수 양호해야 함",
      spacing: "이랑폭 60cm, 주간 35~40cm",
      fertilizerNote: "질소 흡수량 많음, 분시 3~4회 필요",
    },
    income: {
      revenueRange: "10a당 약 116~260만 원 (봄~가을배추, 소득 기준 2024)",
      costNote: "종자·비료·농약비 중심, 가격 폭락 리스크 있음",
      laborNote: "정식·수확 시 인력 필요, 기계화 어려운 부분 존재",
      minScale: "밭 2,000~3,000평",
      annualWorkdays: "약 100~130일 (작기당)",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "봄배추", revenueRange: "10a당 약 116만 원 (1ha당 약 1,158만 원)", note: "3~6월 출하, 가격 변동 보통" },
        { name: "가을배추(김장)", revenueRange: "10a당 약 260만 원 (1ha당 약 2,603만 원)", note: "김장 수요로 가장 소득 높음" },
        { name: "고랭지 여름배추", revenueRange: "10a당 약 121만 원 (1ha당 약 1,213만 원)", note: "7~8월 출하, 기상 리스크 큼" },
      ],
    },
    majorRegions: ["강원도", "전라남도", "충청남도"],
    tips: [
      "고랭지 여름배추는 가격이 높지만, 기상 변동 리스크도 큽니다.",
      "김장 수요에 맞춘 가을배추가 가장 안정적인 소득원입니다.",
      "배추 계약 재배를 활용하면 가격 하락 위험을 줄일 수 있습니다.",
    ],
    relatedCropIds: ["chili-pepper", "garlic", "onion"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "시장성", text: "김장 수요가 매년 안정적이라 가을배추 판매 기반이 탄탄" },
        { category: "생활", text: "단기 재배(60~90일)로 연중 여러 작기 운영이 가능" },
        { category: "안정성", text: "계약 재배 제도를 활용하면 가격 하락 리스크를 줄일 수 있음" },
      ],
      cons: [
        { category: "안정성", text: "풍작 시 가격이 급락하는 '배추 파동'이 반복적으로 발생" },
        { category: "안정성", text: "고랭지 재배 시 기상 변동(냉해·폭우)에 따른 피해 위험이 큼" },
        { category: "재배난이도", text: "정식·수확 시 인력이 대량으로 필요하고, 기계화가 어려운 부분 존재" },
      ],
      verdict: "계약 재배를 활용해 리스크를 관리하면서 김장 시즌 안정 수입을 노리기에 적합",
    },
    cultivationSteps: [
      { step: 1, title: "육묘·밭 준비", period: "7~8월", description: "셀 트레이에 육묘(약 25일). 밭 경운·비료 시비·이랑 만들기" },
      { step: 2, title: "정식", period: "8~9월", description: "이랑폭 60cm, 주간 35~40cm. 활착 후 1주일 차광 보호" },
      { step: 3, title: "생육 관리", period: "9~10월", description: "추비 3~4회 분시. 배추좀나방·무름병 방제. 결구기 충분한 관수" },
      { step: 4, title: "수확·출하", period: "11~12월", description: "결구가 단단해지면 수확. 김장철 수요에 맞춰 출하 시기 조절" },
    ],
    investmentDetail: {
      initialCost: "종자·비료·농기계 임차 등 500~1,500만 원",
      annualOperatingCost: "1ha당 약 300~500만 원",
      breakEvenPeriod: "첫 해부터 수익 가능 (가격 변동에 따라 차이)",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 40~70일 (정식·수확기 집중)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "속이 꽉차고 단단한 배추 수확하려면 수확전 꼭! 해주세요",
        url: "https://www.youtube.com/watch?v=mHWChpTSUJ0",
        thumbnail: "https://img.youtube.com/vi/mHWChpTSUJ0/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "배추농사 이렇게 했더니 대박났어요 — 노하우는?",
        url: "https://www.youtube.com/watch?v=rk1eUtu2wGM",
        thumbnail: "https://img.youtube.com/vi/rk1eUtu2wGM/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "배추 키우기 김장배추 심는 시기와 방법",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=76961942",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "garlic",
    cultivation: {
      climate: "서늘한 기후에서 월동, 생육적온 15~20℃",
      soil: "배수 양호한 사질양토, pH 6.0~6.5",
      water: "월동 후 생육기에 적절한 관수 필요",
      spacing: "이랑폭 20cm, 주간 10~12cm",
      fertilizerNote: "인산·칼리 기비 충분히, 봄 추비 2회",
    },
    income: {
      revenueRange: "1ha당 약 600~1,200만 원 (난지형/한지형에 따라 차이)",
      costNote: "종구비가 상당, 기계화로 노동비 절감 가능",
      laborNote: "심기·수확이 노동 집약적이나 기계화 진행 중",
      minScale: "밭 1,000~2,000평",
      annualWorkdays: "약 120~150일",
      laborIntensity: "보통",
      source: "KOSIS 농축산물생산비조사 (본 자료집 미수록, 추후 검증 예정)",
      varieties: [
        { name: "난지형(남해·제주)", note: "따뜻한 지역, 6월 수확" },
        { name: "한지형(의성·서산)", note: "추운 지역, 단가 높음" },
      ],
    },
    majorRegions: ["경상남도", "전라남도", "충청남도", "경상북도"],
    tips: [
      "의성 마늘(한지형)과 남해 마늘(난지형)은 재배 시기와 방법이 다르니 지역에 맞게 선택하세요.",
      "마늘종 제거를 적시에 해야 구 비대가 좋아집니다.",
      "마늘쫑도 별도 수입원이 되니, 출하 루트를 미리 확보해두세요.",
    ],
    relatedCropIds: ["onion", "chili-pepper", "napa-cabbage"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "시장성", text: "국내 마늘 수요가 안정적이고, 건마늘·깐마늘 등 가공 수요도 꾸준" },
        { category: "확장성", text: "마늘쫑도 별도 수입원이 되어 추가 수익 확보 가능" },
        { category: "재배난이도", text: "기계화(파종기·수확기)가 진행되면서 노동 부담이 점차 감소" },
      ],
      cons: [
        { category: "수익성", text: "종구(씨마늘) 비용이 상당해 초기 투입 자본이 필요" },
        { category: "생활", text: "심기·수확이 노동 집약적이라 작기별 인력 확보가 관건" },
        { category: "시장성", text: "수입 마늘과의 가격 경쟁이 있어 소규모 농가는 부담" },
      ],
      verdict: "의성·남해 등 산지에서 시작하면 기존 유통망을 활용해 안정적 수입 확보 가능",
    },
    cultivationSteps: [
      { step: 1, title: "종구 준비·밭 갈기", period: "8~9월", description: "종구(씨마늘) 선별·소독. 밭 경운 후 인산·칼리 기비" },
      { step: 2, title: "파종", period: "9~10월", description: "이랑폭 20cm, 주간 10~12cm로 심기. 멀칭으로 월동 보호" },
      { step: 3, title: "월동 후 관리", period: "이듬해 3~4월", description: "봄 추비 2회. 마늘종(꽃대) 제거로 구 비대 촉진" },
      { step: 4, title: "수확·건조", period: "6~7월", description: "잎이 2/3 정도 마르면 수확. 양건(볕 건조) 후 통풍 보관" },
    ],
    investmentDetail: {
      initialCost: "종구(씨마늘)·농기계 등 1,500~3,000만 원 (종구비 비중 높음)",
      annualOperatingCost: "1ha당 약 500~800만 원",
      breakEvenPeriod: "1~2년차부터 수익 발생",
      minimumArea: "2,000㎡(약 600평) 이상 권장",
      annualLaborDays: "연 50~80일 (심기·수확기 집중 노동)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "마늘잎이 노랗게 변했다면? 당장 이것 안하면 다 썩고 마늘농사 폭망합니다",
        url: "https://www.youtube.com/watch?v=TAh8oB90Kk8",
        thumbnail: "https://img.youtube.com/vi/TAh8oB90Kk8/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "3월에 이것 안 뿌리면 마늘 농사 망칩니다! 굵고 단단한 마늘 만드는 비결",
        url: "https://www.youtube.com/watch?v=V68HuZjySqs",
        thumbnail: "https://img.youtube.com/vi/V68HuZjySqs/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "마늘 심는 시기 마늘 심는 방법 알아보기",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=16577405",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "onion",
    cultivation: {
      climate: "서늘한 기후 선호, 생육적온 15~20℃",
      soil: "배수 양호하고 보수력 있는 양토~사질양토",
      water: "비대기에 충분한 수분, 수확 전 2주는 단수",
      spacing: "이랑폭 15~20cm, 주간 10~12cm",
      fertilizerNote: "인산·칼리 기비 충실, 질소 과다 시 저장성 저하",
    },
    income: {
      revenueRange: "1ha당 약 400~1,000만 원 (가격 변동 매우 큼)",
      costNote: "묘 구입비, 정식 인건비가 주요 비용",
      laborNote: "정식·수확 시 인력 대량 필요, 기계화 진행 중",
      minScale: "밭 2,000~3,000평",
      annualWorkdays: "약 120~150일",
      laborIntensity: "보통",
      source: "KOSIS 농축산물생산비조사 (본 자료집 미수록, 추후 검증 예정)",
    },
    majorRegions: ["전라남도", "경상남도", "경상북도"],
    tips: [
      "양파는 가격 폭락 위험이 크므로 계약 재배나 출하 조절이 중요합니다.",
      "저장 양파 출하 전략을 세우면 비수기 높은 가격을 노릴 수 있습니다.",
      "양파즙·양파 가공품 등 6차산업과 연계하면 부가가치를 높일 수 있습니다.",
    ],
    relatedCropIds: ["garlic", "napa-cabbage", "chili-pepper"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "수익성", text: "대량 생산이 가능하고, 저장 양파 출하 전략으로 비수기 고가 판매 가능" },
        { category: "확장성", text: "양파즙·양파 가공품 등 6차산업과 연계해 부가가치를 높일 수 있음" },
        { category: "시장성", text: "국내 소비량이 많고 김치·요리 필수 식재료로 수요 기반이 탄탄" },
      ],
      cons: [
        { category: "안정성", text: "가격 변동이 채소류 중 가장 극심 — 풍작 시 폭락이 반복됨" },
        { category: "재배난이도", text: "정식 시 인력이 대량으로 필요하고, 기계화가 아직 부분적" },
        { category: "시장성", text: "과잉 생산 위험이 상존해 재배 면적 조절이 중요" },
      ],
      verdict: "저장·출하 전략을 잘 세우고, 가공 연계까지 고려하면 규모의 경제를 실현할 수 있는 작물",
    },
    cultivationSteps: [
      { step: 1, title: "육묘", period: "8~9월", description: "셀 트레이 또는 노지 육묘상에서 묘 기르기(약 50일)" },
      { step: 2, title: "정식", period: "10~11월", description: "이랑폭 15~20cm, 주간 10~12cm 정식. 멀칭으로 월동 보호" },
      { step: 3, title: "월동 후 관리", period: "이듬해 3~5월", description: "추비 시비. 노균병·잎마름병 방제. 비대기 충분한 관수" },
      { step: 4, title: "수확·저장", period: "6~7월", description: "잎이 쓰러지면 수확. 수확 전 2주 단수. 양건 후 저온저장" },
    ],
    investmentDetail: {
      initialCost: "묘 구입·저장시설·농기계 등 1,500~3,000만 원",
      annualOperatingCost: "1ha당 약 400~700만 원 (묘·정식 인건비 비중 높음)",
      breakEvenPeriod: "1~2년차 (저장시설 투자 시 3년)",
      minimumArea: "3,000㎡(약 900평) 이상 권장",
      annualLaborDays: "연 50~80일 (정식·수확기 집중)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "양파 지금 심어도될까? 한겨울에도 견디는 양파 품종 심는팁 3가지",
        url: "https://www.youtube.com/watch?v=rCCjRffODeQ",
        thumbnail: "https://img.youtube.com/vi/rCCjRffODeQ/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "양파농사 어떻게 준비하세요?",
        url: "https://www.youtube.com/watch?v=9dh_1hiixaI",
        thumbnail: "https://img.youtube.com/vi/9dh_1hiixaI/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "양파 키우기 — 양파 심는 시기와 심는 방법",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=16104305",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "lettuce",
    cultivation: {
      climate: "서늘한 기후, 생육적온 15~20℃, 고온에서 꽃대 발생",
      soil: "유기질 풍부한 양토, 배수 양호",
      water: "생육 전 기간 고른 수분 공급 필요",
      spacing: "이랑폭 30cm, 주간 20~25cm",
      fertilizerNote: "질소 비료 적정량 유지, 과다 시 맛 저하",
    },
    income: {
      revenueRange: "10a당 약 502만 원 (시설상추, 소득 기준 2024)",
      costNote: "시설비(하우스)가 주요 투자, 운영비는 낮은 편",
      laborNote: "수확·포장이 매일 반복, 꾸준한 노동 필요",
      minScale: "시설 300~500평",
      annualWorkdays: "약 250~300일 (연중 수확)",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
    },
    majorRegions: ["충청남도", "경기도", "강원도"],
    tips: [
      "소규모 비닐하우스에서 시작할 수 있어 귀농 입문용으로 적합합니다.",
      "직거래·로컬푸드 매장에 납품하면 중간 유통 비용을 줄일 수 있습니다.",
      "여름 고온기에는 추대(꽃대) 방지 품종을 선택하세요.",
    ],
    relatedCropIds: ["sweet-potato", "napa-cabbage", "chili-pepper"],
    kosisConfig: { tblId: "DT_1ET0017" },
    prosCons: {
      pros: [
        { category: "수익성", text: "소규모 비닐하우스에서도 시작할 수 있어 초기 투자 부담이 적음" },
        { category: "수익성", text: "연중 다회 수확이 가능해 지속적인 현금 흐름을 확보할 수 있음" },
        { category: "시장성", text: "로컬푸드 매장·직거래에 적합하고, 소비자 접근성이 높음" },
      ],
      cons: [
        { category: "생활", text: "수확·포장이 매일 반복되어 꾸준한 노동이 필요" },
        { category: "안정성", text: "여름 고온기에는 추대(꽃대) 발생으로 재배가 어려움" },
        { category: "수익성", text: "하우스 시설비가 주요 투자 항목이고, 난방·냉방 비용 발생 가능" },
      ],
      verdict: "소규모로 안정적인 일일 수입을 원하는 분에게 적합 — 귀농 입문용으로 추천",
    },
    cultivationSteps: [
      { step: 1, title: "육묘·하우스 준비", period: "연중", description: "셀 트레이 육묘(약 20일). 하우스 내 이랑·점적관수 설치" },
      { step: 2, title: "정식", period: "연중 (고온기 제외)", description: "이랑폭 30cm, 주간 20~25cm. 추대 방지 품종 선택" },
      { step: 3, title: "생육 관리", period: "정식 후 20~30일", description: "질소 적정량 유지. 진딧물 방제. 고온기 차광" },
      { step: 4, title: "수확·출하", period: "정식 후 30~40일부터", description: "잎 크기 적당할 때 겉잎부터 수확. 매일 반복 수확·포장·출하" },
    ],
    investmentDetail: {
      initialCost: "비닐하우스 시설 1,000~3,000만 원 (규모에 따라 차이)",
      annualOperatingCost: "10a당 약 150~300만 원 (난방·종자·비료)",
      breakEvenPeriod: "1~2년차부터 수익 발생",
      minimumArea: "100~200평 하우스로 시작 가능",
      annualLaborDays: "연 200일 이상 (매일 수확·포장 반복)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "추운 겨울에 거실에서 키우는 상추 1차 수확!",
        url: "https://www.youtube.com/watch?v=eCHUFY9hXH4",
        thumbnail: "https://img.youtube.com/vi/eCHUFY9hXH4/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "강추위 속에서 상추 쑥갓을 파종하여 키우는 2가지 방법",
        url: "https://www.youtube.com/watch?v=uEXv3Ya7FZs",
        thumbnail: "https://img.youtube.com/vi/uEXv3Ya7FZs/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "상추 키우기 / 상추 심는 시기 / 상추 심는 방법",
        url: "https://kwonnong.com/farminginfo/?bmode=view&idx=14543744",
        source: "권농종묘",
      },
    ],
  },
  {
    id: "apple",
    cultivation: {
      climate: "서늘한 기후, 연평균 8~12℃, 일교차 큰 지역 유리",
      soil: "배수 양호한 사질양토~양토, 토심 깊은 곳",
      water: "과실 비대기 충분한 관수, 수확기 단수로 당도 향상",
      spacing: "열간 4~5m, 주간 2~3m (왜화 재배 기준)",
      fertilizerNote: "칼슘·붕소 결핍 주의, 엽면시비 병행",
    },
    income: {
      revenueRange: "10a당 약 511만 원 (1ha당 약 5,114만 원, 소득 기준 2024)",
      costNote: "묘목·지주·방조망 등 초기 투자비 높음, 수확까지 3~5년",
      laborNote: "전정·적과·봉지씌우기·수확 등 연중 관리 작업 많음",
      minScale: "과수원 3,000~5,000평",
      annualWorkdays: "약 200~250일 (연중 관리)",
      laborIntensity: "높음",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "후지(부사)", note: "국내 재배 70%, 저장성 좋음, 11월 수확" },
        { name: "홍로", note: "추석 출하용, 9월 조생종" },
        { name: "감홍·시나노스위트", note: "프리미엄 품종, 고당도 직거래 유리" },
      ],
    },
    majorRegions: ["경상북도", "충청북도", "강원도", "경상남도"],
    tips: [
      "기후변화로 재배 적지가 북상 중이니 지역 선택 시 장기 전망을 고려하세요.",
      "왜화 재배(반왜성 대목)가 조기 수확과 관리 효율 면에서 유리합니다.",
      "사과 품종 다양화(시나노스위트, 감홍 등)로 출하 시기를 분산시키세요.",
      "첫 수확까지 3~5년이 걸리므로, 그 사이 소득원(단기 작물)을 병행하세요.",
    ],
    relatedCropIds: ["pear", "grape", "citrus"],
    kosisConfig: { tblId: "DT_1AG20411" },
    prosCons: {
      pros: [
        { category: "수익성", text: "성목 기준 1ha당1,500~3,000만 원으로 고소득 작물" },
        { category: "시장성", text: "국내 소비 수요가 안정적이고 직거래·온라인 판매 채널이 다양" },
        { category: "확장성", text: "사과즙·사과잼·체험농장 등 6차산업 연계가 활발" },
        { category: "안정성", text: "저장성이 좋아 CA저장으로 출하 시기를 조절해 가격 대응 가능" },
      ],
      cons: [
        { category: "재배난이도", text: "전정·적과·봉지씌우기 등 숙련된 기술 없이는 품질 확보 어려움" },
        { category: "안정성", text: "기후변화로 재배 적지가 북상 중 — 기존 산지의 품질 저하 우려" },
        { category: "수익성", text: "묘목 식재 후 3~5년간 수확 불가, 초기 투자 회수까지 시간 소요" },
      ],
      verdict: "중장기 투자 여력이 있고 기술을 배울 의지가 있다면 높은 수익이 가능한 작물",
    },
    cultivationSteps: [
      { step: 1, title: "묘목 식재·기반 조성", period: "1년차 3~4월", description: "왜화 대목 묘목 식재. 지주·방조망 설치. 열간 4~5m, 주간 2~3m" },
      { step: 2, title: "유목기 관리", period: "1~3년차", description: "수형 만들기(주간형). 적심으로 가지 유인. 병해충 기본 방제" },
      { step: 3, title: "전정·적과", period: "매년 2~3월(전정), 6월(적과)", description: "도장지 제거·결과지 확보. 적과로 과실 크기·당도 향상" },
      { step: 4, title: "봉지씌우기·방제", period: "매년 6~7월", description: "병해충 방지·외관 향상을 위한 봉지. SS기로 정기 방제" },
      { step: 5, title: "수확·선과·출하", period: "매년 9~11월", description: "품종별 수확 시기 상이. 선과장 이용 선별. CA저장으로 출하 시기 조절" },
    ],
    investmentDetail: {
      initialCost: "묘목·지주·방조망·관수 시설 등 1ha당3,000~6,000만 원",
      annualOperatingCost: "1ha당 약 800~1,200만 원 (농약·비료·인건비)",
      breakEvenPeriod: "5~7년 (식재 후 3~5년 무수확 + 초기 수확 2년)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 150~200일 (전정·적과·수확 등 연중 관리)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "9월 사과나무 유목관리 / 2년생 생육상태",
        url: "https://www.youtube.com/watch?v=HQVv19CoH7g",
        thumbnail: "https://img.youtube.com/vi/HQVv19CoH7g/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "사과 조류피해 이렇게 하면 새가 도망갑니다 [사과재배]",
        url: "https://www.youtube.com/watch?v=rV_qE57LLVE",
        thumbnail: "https://img.youtube.com/vi/rV_qE57LLVE/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "사과나무 재배법 (개화시기, 인공수분, 착과, 적과 시기와 방법)",
        url: "https://furune.info/449",
        source: "푸른하늘",
      },
    ],
  },
  {
    id: "pear",
    cultivation: {
      climate: "온난한 기후, 연평균 11~15℃, 배수 좋은 곳",
      soil: "사질양토~양토, 토심 깊고 유기질 풍부",
      water: "과실 비대기 충분한 관수, 침수에 약함",
      spacing: "열간 5~6m, 주간 3~4m",
      fertilizerNote: "유기질 비료 위주, 칼슘·붕소 엽면시비 병행",
    },
    income: {
      revenueRange: "10a당 약 432만 원 (1ha당 약 4,319만 원, 소득 기준 2024)",
      costNote: "과수원 조성 비용 높음, 봉지씌우기 인건비 상당",
      laborNote: "전정·수분·적과·봉지·수확 등 연중 세밀한 관리 필요",
      minScale: "과수원 3,000~5,000평",
      annualWorkdays: "약 200~250일",
      laborIntensity: "높음",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "신고(나주배)", note: "국내 재배 80%, 선물용 수요 안정적" },
        { name: "원황·화산", note: "조생종, 8~9월 출하로 시기 분산" },
      ],
    },
    majorRegions: ["전라남도", "충청남도", "경기도"],
    tips: [
      "나주배가 브랜드 가치가 높으나, 기후변화에 따른 재배지 확대도 고려해보세요.",
      "인공수분 기술을 반드시 익히세요 — 배는 자가수분이 되지 않습니다.",
      "봉지씌우기 작업이 인건비의 상당 부분을 차지하니 적기에 인력 확보가 필요합니다.",
    ],
    relatedCropIds: ["apple", "grape", "citrus"],
    kosisConfig: { tblId: "DT_1AG20411" },
    prosCons: {
      pros: [
        { category: "수익성", text: "ha당 1,200~2,500만 원으로 과수 중 안정적 고소득" },
        { category: "시장성", text: "나주배 등 브랜드 가치가 높고, 선물용 수요가 꾸준" },
        { category: "확장성", text: "배즙·배 가공품 등으로 부가가치를 높일 수 있음" },
      ],
      cons: [
        { category: "수익성", text: "과수원 조성 비용이 높고, 첫 수확까지 4~5년 소요" },
        { category: "재배난이도", text: "인공수분이 필수이고, 전정·적과 등 세밀한 관리 기술 필요" },
        { category: "생활", text: "봉지씌우기 작업 시 대량 인력이 필요해 인건비 부담" },
      ],
      verdict: "브랜드 산지(나주 등) 인근에서 기술을 익히며 시작하면 안정적인 고소득이 가능",
    },
    cultivationSteps: [
      { step: 1, title: "묘목 식재·과수원 조성", period: "1년차 봄", description: "대목 접목 묘 식재. 지주 설치. 열간 5~6m, 주간 3~4m" },
      { step: 2, title: "수형 만들기·전정", period: "1~4년차", description: "배상형·편평형 수형 조성. 매년 겨울 전정" },
      { step: 3, title: "인공수분·적과", period: "매년 4~5월", description: "다른 품종 꽃가루로 인공수분(필수). 적과로 과실 크기 확보" },
      { step: 4, title: "봉지씌우기·생육 관리", period: "매년 5~8월", description: "외관 품질 향상 봉지. 칼슘 엽면시비. 관수 관리" },
      { step: 5, title: "수확·저장·출하", period: "매년 9~10월", description: "과피 색·당도 확인 후 수확. 저온저장(0~1℃)으로 출하 조절" },
    ],
    investmentDetail: {
      initialCost: "묘목·지주·수분수·방조망 등 1ha당3,000~5,000만 원",
      annualOperatingCost: "1ha당 약 700~1,100만 원 (봉지·인건비·농약)",
      breakEvenPeriod: "6~8년 (식재 후 4~5년 무수확)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 150~200일 (인공수분·전정·봉지씌우기·수확)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "3년차 배나무 지지대 설치하고, 수형잡고, 가지치기",
        url: "https://www.youtube.com/watch?v=dgWnYLkXLic",
        thumbnail: "https://img.youtube.com/vi/dgWnYLkXLic/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "배 해충, 주경배나무이 — 배나무 병해충 관리",
        url: "https://www.youtube.com/watch?v=d8ujda9XmSI",
        thumbnail: "https://img.youtube.com/vi/d8ujda9XmSI/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "배 재배 일정 및 관리 기술",
        url: "https://nongsaro.go.kr/portal/ps/psb/psbl/workScheduleDtl.ps?cntntsNo=30661&menuId=PS00087",
        source: "농사로",
      },
    ],
  },
  {
    id: "grape",
    cultivation: {
      climate: "온난·건조한 기후, 생육적온 25~30℃, 일조량 풍부해야",
      soil: "배수 양호한 사질양토, 자갈이 섞인 토양도 가능",
      water: "착색기 이후 관수 절제, 비가림 재배 필수",
      spacing: "열간 3~4m, 주간 2~3m (덕식 재배 기준)",
      fertilizerNote: "칼슘·마그네슘 중요, 착색기 질소 제한",
    },
    income: {
      revenueRange: "10a당 약 548~705만 원 (노지~시설, 소득 기준 2024)",
      costNote: "비가림 시설·덕 설치 초기 투자 큼, 묘목비 고가",
      laborNote: "적방·적과·봉지·수확 등 세밀한 손작업 많음",
      minScale: "과수원 2,000~3,000평",
      annualWorkdays: "약 200~250일",
      laborIntensity: "높음",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "노지포도", revenueRange: "10a당 약 548만 원 (1ha당 약 5,479만 원)", note: "거봉·캠벨얼리 등, 전통 노지 재배" },
        { name: "시설포도", revenueRange: "10a당 약 705만 원 (1ha당 약 7,048만 원)", note: "샤인머스캣 등 고급 품종, 시설 투자 필요" },
      ],
    },
    majorRegions: ["경상북도", "충청남도", "경기도"],
    tips: [
      "샤인머스캣은 현재 높은 수익을 올리고 있지만, 공급 과잉 가능성을 고려하세요.",
      "비가림 시설은 필수 — 노지 재배 시 열과·병해로 상품성이 크게 떨어집니다.",
      "와이너리·체험농장과 연계하면 6차산업으로 부가가치를 높일 수 있습니다.",
    ],
    relatedCropIds: ["apple", "pear", "strawberry"],
    kosisConfig: { tblId: "DT_1AG20411" },
    prosCons: {
      pros: [
        { category: "수익성", text: "품종에 따라 1ha당 1,200~4,000만 원 — 샤인머스캣은 최상위 수익 구간" },
        { category: "확장성", text: "와이너리·체험농장과 연계해 6차산업 부가가치 창출 가능" },
        { category: "시장성", text: "프리미엄 품종의 직거래·택배 판매 수요가 매우 높음" },
      ],
      cons: [
        { category: "수익성", text: "비가림 시설·덕 설치·묘목 등 초기 투자 규모가 큼" },
        { category: "시장성", text: "샤인머스캣 재배 급증으로 향후 공급 과잉·가격 하락 우려" },
        { category: "재배난이도", text: "적방·적과·봉지 등 세밀한 손작업이 많아 숙련도가 요구됨" },
      ],
      verdict: "현재 수익성은 최상위이나 공급 과잉 리스크를 고려해 품종 다양화 전략이 필요",
    },
    cultivationSteps: [
      { step: 1, title: "묘목 식재·덕 설치", period: "1년차", description: "비가림 시설 설치. 덕(pergola) 또는 울타리식 지주. 열간 3~4m" },
      { step: 2, title: "수형 관리·전정", period: "매년 겨울", description: "일자형 또는 X자형 수형. 결과모지 확보를 위한 전정" },
      { step: 3, title: "적방·적과·봉지", period: "매년 5~6월", description: "송이당 적정 알수 확보. 봉지씌우기로 외관·병해 방지" },
      { step: 4, title: "착색 관리·수확", period: "매년 8~9월", description: "착색기 질소 제한·관수 절제. 당도 확인 후 수확" },
      { step: 5, title: "저장·출하", period: "매년 9~10월", description: "예냉 후 저온저장. 직거래·택배·로컬마켓 출하" },
    ],
    investmentDetail: {
      initialCost: "비가림 시설·덕 설치·묘목 등 1ha당4,000~8,000만 원",
      annualOperatingCost: "1ha당 약 800~1,500만 원 (시설유지·인건비·농약)",
      breakEvenPeriod: "4~6년 (식재 후 2~3년 무수확)",
      minimumArea: "2,000㎡(약 600평) 이상 권장",
      annualLaborDays: "연 150~200일 (적방·적과·수확 등 세밀 작업)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "샤인머스켓 재배방법 · 포도경매가격 · 수확 비닐하우스 귀농귀촌",
        url: "https://www.youtube.com/watch?v=tH-rlgeuyLY",
        thumbnail: "https://img.youtube.com/vi/tH-rlgeuyLY/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "포도나무 3년차 — V형 지지대 이렇게 설치한다! [포도재배]",
        url: "https://www.youtube.com/watch?v=04es-lmgP_U",
        thumbnail: "https://img.youtube.com/vi/04es-lmgP_U/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "포도 재배법 — 다락골사랑 블로그",
        url: "http://blog.daum.net/_blog/BlogTypeView.do?articleno=543&blogid=0TcG5&categoryId=16&regdt=20130604214210",
        source: "다음 블로그",
      },
    ],
  },
  {
    id: "citrus",
    cultivation: {
      climate: "아열대~온대, 연평균 15℃ 이상, 겨울 영하 잘 안 되는 곳",
      soil: "배수 양호한 화산토(제주) 또는 사질양토",
      water: "여름 고온기 충분한 관수, 과도한 수분은 당도 저하",
      spacing: "열간 4~5m, 주간 3~4m",
      fertilizerNote: "질소·칼리 위주, 미량원소(마그네슘·아연) 보충",
    },
    income: {
      revenueRange: "10a당 약 287만 원 (노지감귤, 1ha당 약 2,866만 원, 소득 기준 2024)",
      costNote: "하우스 재배 시 난방비 부담, 노지 재배 상대적 저비용",
      laborNote: "적과·수확 시 인력 집중, 비수기 전정·방제 관리",
      minScale: "과수원 3,000~5,000평",
      annualWorkdays: "약 180~220일",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "노지감귤(온주밀감)", note: "제주 중심, 재배 쉬움, 가격 낮음" },
        { name: "한라봉(부지화)", note: "하우스 재배, 난방비 고려 필요" },
        { name: "천혜향·레드향", note: "최고 프리미엄, 재배 난이도 높음" },
      ],
    },
    majorRegions: ["제주특별자치도", "경상남도", "전라남도"],
    tips: [
      "한라봉·천혜향 등 만감류는 단가가 높지만, 동해 방지 난방비를 고려하세요.",
      "제주 외 남해안 지역에서도 재배가 가능해지고 있으니, 최신 재배 적지도를 확인하세요.",
      "감귤 가공(주스, 초콜릿 등)으로 부가가치를 높이는 농가가 늘고 있습니다.",
    ],
    relatedCropIds: ["apple", "pear", "grape"],
    kosisConfig: { tblId: "DT_1AG20411" },
    prosCons: {
      pros: [
        { category: "수익성", text: "만감류(한라봉·천혜향)는 kg당 단가가 높아 고소득 가능" },
        { category: "확장성", text: "감귤 주스·초콜릿·건조 감귤 등 가공품 종류가 다양" },
        { category: "시장성", text: "제주 브랜드 파워가 강하고, 관광·체험과 연계하기 좋음" },
      ],
      cons: [
        { category: "안정성", text: "재배 가능 지역이 제주·남해안으로 제한되어 있음" },
        { category: "수익성", text: "하우스 재배 시 겨울 난방비 부담이 크고, 유가에 민감" },
        { category: "안정성", text: "태풍·동해 등 기후 재해에 취약한 편" },
      ],
      verdict: "제주 또는 남해안 지역 정착 계획이 있다면 관광·가공과 시너지를 낼 수 있는 작물",
    },
    cultivationSteps: [
      { step: 1, title: "묘목 식재·기반 조성", period: "1년차 봄", description: "접목 묘 식재. 노지 또는 하우스. 열간 4~5m, 주간 3~4m" },
      { step: 2, title: "수형 관리·전정", period: "매년 3~4월", description: "개심자연형 수형. 밀생지·도장지 제거. 봄순 관리" },
      { step: 3, title: "적과·병해충 관리", period: "매년 6~8월", description: "생리낙과 후 추가 적과. 궤양병·깍지벌레 방제" },
      { step: 4, title: "수확·출하", period: "매년 10~12월 (노지감귤)", description: "착색·당도 확인 후 수확. 농협 선과장 또는 직거래 출하" },
    ],
    investmentDetail: {
      initialCost: "묘목·하우스(만감류) 등 1ha당2,000~6,000만 원",
      annualOperatingCost: "1ha당 약 600~1,200만 원 (난방비 변동 큼)",
      breakEvenPeriod: "4~6년 (식재 후 3~4년 무수확)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 120~180일 (적과·수확·전정·방제)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "과일의 품질을 높이는 스테비아 감귤에 1년 동안 사용했더니 무엇이 달라졌을까요?",
        url: "https://www.youtube.com/watch?v=7wjfTSsw54o",
        thumbnail: "https://img.youtube.com/vi/7wjfTSsw54o/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "감귤방제 보르도칼과 기계유로 살균 및 응애, 진딧물 방제 방법",
        url: "https://www.youtube.com/watch?v=8-kaSWMqN08",
        thumbnail: "https://img.youtube.com/vi/8-kaSWMqN08/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "귀농 6년 째, 귤 농사는 사면초가",
        url: "https://www.jejusori.net/news/articleView.html?idxno=174524",
        source: "제주의소리",
      },
    ],
  },
  {
    id: "strawberry",
    cultivation: {
      climate: "겨울 시설재배, 야간 5~8℃, 주간 20~25℃ 유지",
      soil: "유기질 풍부한 양토, 배수 양호, pH 5.5~6.5",
      water: "점적 관수로 정밀 수분 관리, 과습 주의",
      spacing: "이랑폭 30cm, 주간 20~25cm (고설 재배 별도)",
      fertilizerNote: "양액 재배 시 EC·pH 정밀 관리 필요",
    },
    income: {
      revenueRange: "10a당 약 1,069~1,500만 원 (토경~수경, 소득 기준 2024)",
      costNote: "하우스·난방·양액 시설 초기 투자 상당, 묘 관리비도 높음",
      laborNote: "수확이 매일 반복, 겨울 내내 지속적 관리 필요",
      minScale: "시설 300~500평",
      annualWorkdays: "약 250~300일 (겨울 연속 관리)",
      laborIntensity: "높음",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "토경재배", revenueRange: "10a당 약 1,069만 원", note: "설향 등 일반 재배, 초기 투자 적음" },
        { name: "수경재배(고설)", revenueRange: "10a당 약 1,500만 원", note: "금실 등 고품질 품종, 노동 효율 높음" },
      ],
    },
    majorRegions: ["경상남도", "충청남도", "전라북도"],
    tips: [
      "딸기 묘(모종) 관리가 수확량의 70%를 결정합니다 — 육묘 기술을 반드시 익히세요.",
      "고설(높은 베드) 재배는 노동 강도를 크게 줄여주지만, 초기 투자가 필요합니다.",
      "체험 농장·직거래를 병행하면 높은 수익을 기대할 수 있습니다.",
      "첫해는 소규모(100~200평)로 시작해 환경 제어 감각을 익히세요.",
    ],
    relatedCropIds: ["grape", "lettuce", "citrus"],
    kosisConfig: { tblId: "DT_1ET0017" },
    prosCons: {
      pros: [
        { category: "수익성", text: "10a당 1,500~3,000만 원으로 면적 대비 최고 수준의 수익" },
        { category: "확장성", text: "체험농장·딸기 따기 관광이 매우 인기 있어 부가 수입 확보 용이" },
        { category: "시장성", text: "겨울 과일 수요가 높고, 소비자 선호도가 꾸준히 증가" },
      ],
      cons: [
        { category: "수익성", text: "하우스·난방·양액 시설 등 초기 투자 규모가 상당" },
        { category: "재배난이도", text: "육묘 기술이 수확량의 70%를 결정할 만큼 핵심적이고 난이도 높음" },
        { category: "생활", text: "겨울 내내 매일 수확·관리가 필요해 연속 휴가가 어려움" },
      ],
      verdict: "높은 투자 대비 높은 수익 — 시설원예 기술을 제대로 익히겠다는 각오가 있다면 최고의 선택",
    },
    cultivationSteps: [
      { step: 1, title: "육묘(런너 증식)", period: "매년 4~7월", description: "모주에서 런너(기는줄기)를 받아 자묘 육성. 딸기 재배의 70% 핵심" },
      { step: 2, title: "하우스 준비·정식", period: "매년 9월", description: "하우스 토양 소독·이랑·점적관수 설치. 고설베드 또는 토경 정식" },
      { step: 3, title: "보온·화아분화 유도", period: "매년 10~11월", description: "야간 최저 5℃ 이상 유지. 전조 처리로 화아분화 촉진" },
      { step: 4, title: "수확·출하", period: "매년 12월~이듬해 5월", description: "매일 반복 수확. 당일 선별·포장·출하. 체험농장 병행 가능" },
    ],
    investmentDetail: {
      initialCost: "하우스·난방·양액·고설베드 등 10a당 5,000만~1억 원",
      annualOperatingCost: "10a당 약 1,500~2,500만 원 (난방·인건비·자재)",
      breakEvenPeriod: "3~5년 (시설 투자 회수 기간)",
      minimumArea: "100~200평 하우스로 시작 가능",
      annualLaborDays: "연 250일 이상 (겨울 내내 매일 수확·관리)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "스마트팜 46일 매출공개 / 딸기농장 / 매출 / 귀농 / 수익",
        url: "https://www.youtube.com/watch?v=zzsqX3oSqfc",
        thumbnail: "https://img.youtube.com/vi/zzsqX3oSqfc/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "[딸기 일지#3] 스마트팜(수경재배)에서 2달 만에 딸기 재배",
        url: "https://www.youtube.com/watch?v=Vvcv4Oe-OUk",
        thumbnail: "https://img.youtube.com/vi/Vvcv4Oe-OUk/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "딸기 재배 방법 :: 알콩달콩 귀농생활",
        url: "https://blog.daum.net/interworld/207",
        source: "다음 블로그",
      },
    ],
  },
  {
    id: "ginseng",
    cultivation: {
      climate: "서늘·습윤, 생육적온 20~25℃, 직사광선 차단 필수",
      soil: "배수 양호한 사질양토, pH 5.5~6.0, 연작 불가",
      water: "적절한 토양 수분 유지, 과습 시 뿌리 썩음",
      spacing: "이랑폭 120~150cm, 주간 10~15cm, 차광막 필수",
      fertilizerNote: "유기질 기비 위주, 화학비료 최소화",
    },
    income: {
      revenueRange: "10a당 약 563만 원 (4년근 1기작 합계, 연평균 약 141만 원, 소득 기준 2024)",
      costNote: "차광 시설·묘삼비·토지 비용 높음, 투자 회수까지 4~6년",
      laborNote: "해가림 관리·병해 방제에 세심한 관리 필요",
      minScale: "밭 3,000~5,000평",
      annualWorkdays: "약 150~180일 (4~6년 장기)",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
      varieties: [
        { name: "수삼(4~6년근)", note: "생물 출하, 가장 보편적" },
        { name: "홍삼 가공 원료용", note: "건조·가공 시 부가가치 상승" },
      ],
    },
    majorRegions: ["충청남도", "경상북도", "전라북도"],
    tips: [
      "연작이 불가하므로 인삼을 심은 적 없는 토지를 확보해야 합니다.",
      "금산·풍기 등 산지 인근에 정착하면 기존 유통망을 활용할 수 있습니다.",
      "수확까지 4~6년이 걸리므로, 그 기간 동안의 생활비 계획이 필수입니다.",
      "홍삼 가공까지 하면 부가가치가 크게 올라갑니다.",
    ],
    relatedCropIds: ["sesame", "chili-pepper"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "수익성", text: "ha당 3,000~6,000만 원으로 전 작물 중 최고 수준의 수익" },
        { category: "확장성", text: "홍삼·인삼 가공품으로 6차산업 연계 시 부가가치가 극대화" },
        { category: "시장성", text: "금산·풍기 등 산지 브랜드 파워가 강하고, 수출 수요도 있음" },
      ],
      cons: [
        { category: "수익성", text: "수확까지 4~6년이 걸려 초기 투자 회수 기간이 매우 긴 편" },
        { category: "안정성", text: "한 번 재배한 토지에서는 연작이 불가하여 새 토지 확보가 필수" },
        { category: "재배난이도", text: "뿌리 썩음병 등 병해 관리가 어렵고, 해가림 시설 관리에 전문성 필요" },
      ],
      verdict: "장기 투자형 귀농을 계획하고 4~6년 생활비를 확보할 수 있다면 최고 수익의 특용작물",
    },
    cultivationSteps: [
      { step: 1, title: "토지 선정·해가림 설치", period: "1년차", description: "연작지 아닌 새 토지 확보. 차광막(해가림) 설치. 이랑폭 120~150cm" },
      { step: 2, title: "묘삼 정식", period: "1년차 가을~2년차 봄", description: "1년생 묘삼을 주간 10~15cm로 정식. 짚 멀칭" },
      { step: 3, title: "생육 관리·병해 방제", period: "2~5년차", description: "해가림 보수. 뿌리 썩음병 예방 방제. 배수 관리 철저" },
      { step: 4, title: "수확·가공", period: "4~6년차 가을", description: "기계 또는 수작업 굴취. 수삼 출하 또는 홍삼 가공" },
    ],
    investmentDetail: {
      initialCost: "해가림 시설·묘삼·토지 임차 등 1ha당5,000만~1억 원",
      annualOperatingCost: "1ha당 약 500~800만 원 (병해 방제·시설 유지)",
      breakEvenPeriod: "6~8년 (4~6년 재배 + 투자 회수 2년)",
      minimumArea: "3,000㎡(약 1,000평) 이상 권장",
      annualLaborDays: "연 80~120일 (해가림 관리·병해 방제 중심)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "텃밭 인삼재배 — 묘상 만들기, 배양토 만들기, 묘삼 심는방법",
        url: "https://www.youtube.com/watch?v=KEWcoCxvXZU",
        thumbnail: "https://img.youtube.com/vi/KEWcoCxvXZU/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "화분·스티로폼으로 새싹삼 아주 쉽게 키우는방법",
        url: "https://www.youtube.com/watch?v=BNGR2-irCDs",
        thumbnail: "https://img.youtube.com/vi/BNGR2-irCDs/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "인삼 수경재배의 재배 절차 (18화)",
        url: "https://brunch.co.kr/@jupiter/144",
        source: "브런치",
      },
    ],
  },
  {
    id: "sesame",
    cultivation: {
      climate: "고온성 작물, 생육적온 25~30℃, 서리에 약함",
      soil: "배수 양호한 사질양토~양토",
      water: "개화·결실기 적정 수분, 과습에 약함",
      spacing: "이랑폭 60cm, 주간 15~20cm",
      fertilizerNote: "인산·칼리 위주, 질소는 적정량",
    },
    income: {
      revenueRange: "10a당 약 105만 원 (소득 기준 2024)",
      costNote: "생산비 낮은 편, 종자·비료비 위주",
      laborNote: "수확·탈립이 노동 집약적, 기계 수확 어려움",
      minScale: "밭 1,000~2,000평",
      annualWorkdays: "약 80~100일",
      laborIntensity: "보통",
      source: "농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)",
    },
    majorRegions: ["충청남도", "전라남도", "경상북도"],
    tips: [
      "국산 참깨는 수입산 대비 높은 가격을 받을 수 있어 소규모로도 수익성이 있습니다.",
      "수확 시기를 놓치면 꼬투리가 터져 손실이 크니, 적기 수확이 중요합니다.",
      "들깨와 함께 재배하면 작업을 효율적으로 분산할 수 있습니다.",
    ],
    relatedCropIds: ["soybean", "corn", "ginseng"],
    kosisConfig: { tblId: "DT_1ET0292" },
    prosCons: {
      pros: [
        { category: "시장성", text: "국산 참깨는 수입산 대비 2~3배 높은 가격으로 프리미엄 판매 가능" },
        { category: "수익성", text: "생산비가 낮아 소규모 면적에서도 수지를 맞추기 쉬움" },
        { category: "생활", text: "소규모 재배 시 부업형 귀농에 적합하고, 다른 작물과 병행 가능" },
      ],
      cons: [
        { category: "재배난이도", text: "수확·탈립 과정이 노동 집약적이고, 기계 수확이 어려움" },
        { category: "수익성", text: "단위면적당 생산량에 한계가 있어 대규모 소득원으로는 부족" },
        { category: "안정성", text: "수확 적기를 놓치면 꼬투리가 터져 수확량 손실이 큼" },
      ],
      verdict: "부업형 귀농이나 다른 작물과의 복합 경영에 적합 — 국산 프리미엄으로 소규모에서도 수익성 확보",
    },
    cultivationSteps: [
      { step: 1, title: "밭 준비·파종", period: "5~6월", description: "이랑폭 60cm, 주간 15~20cm 점파. 비닐멀칭 권장" },
      { step: 2, title: "솎음·김매기", period: "6~7월", description: "1구 1~2본으로 솎음. 중경·배토 작업" },
      { step: 3, title: "개화·결실 관리", period: "7~8월", description: "적정 관수 유지. 과습 방지. 잎마름병 방제" },
      { step: 4, title: "수확·탈립", period: "9월", description: "아래쪽 꼬투리 벌어지기 시작하면 수확. 세워서 건조 후 탈립" },
    ],
    investmentDetail: {
      initialCost: "종자·비료·소형 농기계 등 300~500만 원",
      annualOperatingCost: "10a당 약 50~100만 원",
      breakEvenPeriod: "첫 해부터 수익 가능",
      minimumArea: "1,000㎡(약 300평) 이상이면 시작 가능",
      annualLaborDays: "연 30~50일 (수확기 집중 노동)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "참깨 빈꼬투리 안생기게 하려면 확실히 잘라줘야 통통한 참깨 수확해요",
        url: "https://www.youtube.com/watch?v=CN3BbH2iTBM",
        thumbnail: "https://img.youtube.com/vi/CN3BbH2iTBM/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "농사 짓기 쉬운 참깨농사!!!! 수익도 엄청 좋아요~",
        url: "https://www.youtube.com/watch?v=rln7sYvdvm4",
        thumbnail: "https://img.youtube.com/vi/rln7sYvdvm4/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "참깨재배 (파종방법, 발아, 수확시기, 종자소독, 밑거름 시비량)",
        url: "https://furune.info/159",
        source: "푸른하늘",
      },
    ],
  },
  {
    id: "arugula",
    cultivation: {
      climate: "서늘한 기후 선호, 생육적온 15~20℃. 25℃ 이상 고온 시 추대(꽃대) 발생",
      soil: "배수 양호한 양질사양토, 유기물 풍부한 토양. pH 6.0~7.0",
      water: "점적관수 유리. 표면 마르면 충분히 관수, 잎에 직접 물 닿지 않도록 관리",
      spacing: "조간 15~20cm, 주간 5~10cm (시설 직파 기준, 밀식 후 솎음)",
      fertilizerNote: "기비(밑거름) 위주, 추비 1~2회. 질소 과다 시 잎 연약·저장성 저하",
    },
    income: {
      revenueRange: "1ha당 약 4,000~8,000만 원 (추정, 공식 소득통계 미등재)",
      costNote: "종자비 저렴, 하우스 유지·난방비(겨울)와 수확 인건비가 주요 비용",
      laborNote: "파종·솎음·수확 모두 수작업. 주 2~3회 수확 작업으로 꾸준한 노동 필요",
      minScale: "시설 1,000~2,000평 (비가림하우스 3~5동)",
      annualWorkdays: "약 200~250일 (주 5~6일, 수확 주기 짧음)",
      laborIntensity: "보통",
      source: "농업관측센터 추정치 (공식 소득통계 미등재)",
    },
    majorRegions: ["경기도", "충청남도", "전라북도", "전라남도"],
    tips: [
      "파종~수확 40~50일, 연 3회 순환 가능 — 귀농 초기 현금 흐름 조기 확보에 유리합니다.",
      "고온기(6~8월) 25℃ 이상에서 추대(꽃대)가 올라오면 상품성이 없어집니다. 흑백 이중 필름 차광과 환기가 핵심.",
      "수확 시 줄기 끝(생장점)을 포함하면 저장 중 부패 → 칼로 생장점 근처를 제거하는 것이 현장 포인트.",
      "스마트팜·수경재배로 확장 시 수익성 개선 가능. 지자체 시설지원사업을 적극 활용하세요.",
    ],
    relatedCropIds: ["lettuce", "napa-cabbage"],
    prosCons: {
      pros: [
        { category: "재배난이도", text: "파종~수확 40~50일로 전 작물 중 가장 짧은 편. 별도 전정·접목 기술 없이도 시작 가능" },
        { category: "수익성", text: "연 3회 이상 순환 가능, 레스토랑·대형마트·온라인 밀키트 시장의 꾸준한 수요 성장세" },
        { category: "시장성", text: "이탈리안 레스토랑·샐러드 전문점·가정용 밀키트 수요 급증. 국내 재배면적 9년간 3배 성장" },
        { category: "확장성", text: "수경재배·스마트팜 연계 용이. 지자체 스마트팜 지원사업 활용 시 초기 투자 부담 절감" },
      ],
      cons: [
        { category: "수익성", text: "공식 소득통계 미등재 작목으로 1ha당수익 예측이 불확실. 단가 변동 리스크 존재" },
        { category: "안정성", text: "고온기(6~8월) 추대 발생 시 상품성 급감 — 시설 온도 관리 실패 시 시기 전체 수확 손실 가능" },
        { category: "시장성", text: "대형마트 입점은 일정 물량·규격·포장 품질 요구 — 소규모 농가의 유통 채널 확보가 쉽지 않음" },
      ],
      verdict: "진입 문턱은 낮지만 유통 채널 확보와 고온기 관리가 수익을 가르는 작목. 안정적 구매처를 먼저 확보한 후 규모를 키우는 전략이 적합.",
    },
    cultivationSteps: [
      { step: 1, title: "토양 준비·시설 점검", period: "파종 2~3주 전", description: "하우스 점검, 토양 소독 후 퇴비·복합비료를 혼화하여 두둑(raised bed)을 높게 만들어 배수성 확보" },
      { step: 2, title: "파종", period: "봄 3~5월 / 가을 9~11월", description: "직파 방식: 8공 비닐에 구멍당 20~25립 점파. 발아 최적온도 18~20℃. 시설재배 시 연중 파종 가능" },
      { step: 3, title: "솎음·물주기", period: "파종 후 7~14일", description: "발아 후 과밀한 부분을 솎아내어 주간 5~10cm 확보. 점적호스로 오전 중 관수" },
      { step: 4, title: "생육 관리", period: "파종 후 15~35일", description: "추비 1회 시비. 고온기에는 흑백 이중 필름으로 차광. 25℃ 이상 시 추대 방지를 위한 환기 필수" },
      { step: 5, title: "수확", period: "파종 후 40~50일", description: "잎 길이 15~20cm일 때 칼로 수확. 줄기 끝(생장점) 제거하여 저장성 확보. 연속 수확(cut-and-come-again) 방식 가능" },
      { step: 6, title: "포장·출하", period: "수확 당일", description: "2kg 포 단위로 소포장. 예냉 후 당일 출하가 원칙. 로컬푸드 매장·레스토랑 직거래가 효과적" },
    ],
    investmentDetail: {
      initialCost: "비닐하우스·관수 시설 등 500~1,500만 원 (노지 시 더 적음)",
      annualOperatingCost: "10a당 약 100~200만 원 (종자·비료·수도)",
      breakEvenPeriod: "첫 해부터 수익 가능 (회전율 높음)",
      minimumArea: "100평 이상이면 시작 가능",
      annualLaborDays: "연 60~100일 (연중 다회 수확 시)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "지금 심으면 폭풍성장 대박나는 작물 — 뿌리 쪼개 심으면 최대 20배",
        url: "https://www.youtube.com/watch?v=CIHoQ68OXWk",
        thumbnail: "https://img.youtube.com/vi/CIHoQ68OXWk/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "루꼴라 키우기 : 3천원짜리 씨앗으로 부자가 됐다",
        url: "https://brunch.co.kr/@binah/5",
        source: "브런치",
      },
    ],
  },
  {
    id: "mango",
    cultivation: {
      climate: "시설재배 전제. 생육적온 24~27℃, 18℃ 이하 생장 둔화, 10℃ 이하 신초 정지",
      soil: "pH 5.5~6.5 배수 양호한 사질양토. 구덩이 직경 1~1.2m에 퇴구비 10~15kg 혼합",
      water: "10a당 1일 5mm 점적관수. 수확기 습도 60~70% 유지, 80% 이상 시 병해 급증",
      spacing: "8m 폭 하우스: 4×5m (10a당 약 50주). 측고 2m 이상, 동 길이 50m 이하",
      fertilizerNote: "정식 시 퇴구비·골분 기비. 질소 과다 시 화아분화 저해. 칼리(K) 충분 공급이 당도에 중요",
    },
    income: {
      revenueRange: "10a당 약 1,853만 원 (사과 대비 약 6배, 경영비 차감 전)",
      costNote: "시설 투자비 수천만~억 원, 연간 난방비·가온비가 수익의 상당 부분을 차감",
      laborNote: "화아분화 유도·개화·적과·수확 등 숙련 관리 다수. 착과 실패 시 해당 연도 전손 위험",
      minScale: "시설 1,000~2,000평 (비닐하우스·가온 설비 포함)",
      annualWorkdays: "약 280~320일 (거의 연중 관리, 겨울 가온 포함)",
      laborIntensity: "높음",
      source: "제주특별자치도농업기술원 · 농촌진흥청",
      varieties: [
        { name: "어윈(애플망고)", revenueRange: "10a당 약 1,500~2,000만 원", note: "국내 주력 품종, 6~8월 출하" },
        { name: "금황(국산 신품종)", revenueRange: "10a당 약 1,800~2,500만 원", note: "로열티 없는 국산 품종, 보급 확대 중" },
      ],
    },
    majorRegions: ["제주특별자치도", "전라남도", "경상남도"],
    tips: [
      "화아분화 유도가 수확의 시작 — 10~11월에 하우스 야간 8~15℃로 낮춰 꽃눈을 유도. 이 시기 관리 실패 시 다음 해 전체 수확 불가.",
      "수분(授粉) 관리가 착과율을 결정 — 개화기(12~1월)에 꿀벌·검정빰금파리 방사 필수. 하우스 밀폐로 자연 수분 어려움.",
      "초기 3년은 투자 기간 — 식재 후 3년차까지 상품 수확이 거의 없음. 최소 3~4년치 생활비와 운영비 사전 확보 필수.",
      "난방비 저감이 경영의 생사 — 히트펌프·지열·단열 이중 피복재 등 활용. 제주·전남 등 온난 지역에서 시작하면 부담 절감.",
    ],
    relatedCropIds: ["citrus", "strawberry", "grape"],
    prosCons: {
      pros: [
        { category: "수익성", text: "10a당 소득 1,853만 원 — 사과 대비 6배. 프리미엄 과일 포지션으로 백화점·고급 유통채널 접근 가능" },
        { category: "시장성", text: "국내 아열대과일 수요 지속 증가. 국산 망고는 신선도·풍미에서 수입산 대비 우위" },
        { category: "확장성", text: "다품종(캐리어·알폰소·어윈 등) 조합으로 수확 시기 분산 가능. 농진청 기술지원 체계 구비" },
        { category: "안정성", text: "연간 출하 패턴이 명확(5~7월 집중). 제주 안덕농협 등 조직화된 판로 존재" },
      ],
      cons: [
        { category: "재배난이도", text: "화아분화·개화·착과 3단계 모두 온도·습도 정밀 관리 필요. 실패 시 해당 연도 수확 전손" },
        { category: "수익성", text: "식재 후 3~4년은 상품 생산 거의 없어 초기 투자 회수 기간이 긺. 연간 난방비 부담 큼" },
        { category: "재배난이도", text: "시설 초기 투자비(하우스·가온·방충망 등) 수천만~억 원. 자본력 부족 시 진입 불가" },
      ],
      verdict: "국내 시설과수 중 단위 소득 1위 수준이지만, 초기 투자·기술 난이도·자금 회수 기간 모두 최상급. 충분한 자본과 2~3년 이상 기술 습득 후 진입 권장.",
    },
    cultivationSteps: [
      { step: 1, title: "시설 조성·묘목 준비", period: "1년차 봄 (3~5월)", description: "비닐하우스(8~10m 폭, 측고 2m+) 설치. 가온 설비·방충망 갖추기. 1년생 접목 묘목 구입, 구덩이 직경 1~1.2m에 퇴구비·골분 혼합 후 정식" },
      { step: 2, title: "수형(나무 골격) 만들기", period: "1~2년차", description: "주간 1~2본으로 유인하여 개심자연형 수형 조성. 불필요한 가지 정리. 이 시기에는 과일을 딸 수 없으며, 나무를 키우는 데 집중" },
      { step: 3, title: "화아분화 유도", period: "매년 10~11월", description: "하우스 야간 온도를 8~15℃, 주간 20℃ 이하로 낮춰 꽃눈(화아) 형성 유도. 자동개폐·온도계 설치 필수. 이 단계가 다음 해 수확의 핵심" },
      { step: 4, title: "개화·수분 관리", period: "매년 12~1월", description: "하우스 내 17~25℃ 유지. 꿀벌 또는 검정빰금파리 방사하여 수정 촉진. 착과율이 수입을 결정하는 가장 중요한 시기" },
      { step: 5, title: "과실 비대·적과", period: "매년 2~5월", description: "비대기 충분한 관수·시비. 과다 착과 시 적과하여 상품 과실 확보. 탄저병 방제를 위해 습도 60~70% 관리" },
      { step: 6, title: "수확·출하", period: "매년 5~7월", description: "과피 색 변화(어윈 기준 붉은색)와 향으로 수확 시기 판단. 3kg 상자 단위 포장, 선별 후 농협·직거래·택배 출하" },
    ],
    investmentDetail: {
      initialCost: "보온 하우스·묘목·난방 설비 등 10a당 1억~2억 원",
      annualOperatingCost: "10a당 약 2,000~3,000만 원 (난방비 비중 매우 높음)",
      breakEvenPeriod: "5~8년 (식재 후 3~4년 무수확 + 시설 투자 회수)",
      minimumArea: "200~300평 하우스 이상 권장",
      annualLaborDays: "연 200일 이상 (온도 관리·수분·적과·수확 등 연중 관리)",
    },
    externalResources: [
      {
        type: "youtube",
        title: "1200평 6년차 애플망고 농사 수익은? 망고도 샤인머스켓처럼 시장포화일까?",
        url: "https://www.youtube.com/watch?v=ZwhNYUHvNEY",
        thumbnail: "https://img.youtube.com/vi/ZwhNYUHvNEY/mqdefault.jpg",
      },
      {
        type: "youtube",
        title: "애플망고가 고소득작물??? 잘키워야 고소득 작물입니다!",
        url: "https://www.youtube.com/watch?v=x4Dk-zpcez0",
        thumbnail: "https://img.youtube.com/vi/x4Dk-zpcez0/mqdefault.jpg",
      },
      {
        type: "blog",
        title: "딸기 이어 애플망고 재배 도전…'땀과 노력 결실 보았죠'",
        url: "https://www.nongmin.com/article/20240108500634",
        source: "농민신문",
      },
    ],
  },
];
