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

/** 수익 정보 */
export interface IncomeInfo {
  revenueRange: string;
  costNote: string;
  laborNote: string;
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
      revenueRange: "ha당 약 500~800만 원 (쌀값 변동에 따라 차이)",
      costNote: "기계화율 높아 노동비 비중 낮음, 농기계 초기 투자 필요",
      laborNote: "이앙·수확 시기에 집중, 그 외 기간 관리 부담 적음",
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
      revenueRange: "ha당 약 300~500만 원",
      costNote: "생산비 낮은 편, 종자·비료비 외 큰 비용 없음",
      laborNote: "파종·수확기 외에는 노동력 부담 적음",
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
      revenueRange: "ha당 약 600~1,200만 원 (품종·판매 방식에 따라 차이 큼)",
      costNote: "묘 구입비, 비닐멀칭 자재비가 주요 비용",
      laborNote: "수확이 노동 집약적, 기계 수확 도입 시 효율 향상",
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
      revenueRange: "ha당 약 400~800만 원 (고랭지 감자는 프리미엄)",
      costNote: "씨감자, 농약비 비중이 높음, 저장 시설 필요",
      laborNote: "심기·수확 시 집중 노동, 중간 관리는 비교적 수월",
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
      revenueRange: "ha당 약 300~700만 원 (찰옥수수·초당옥수수는 상단)",
      costNote: "종자비·비료비 외 큰 비용 없음, 비닐멀칭 권장",
      laborNote: "재배 기간 짧아 노동 부담 적음, 수확 시기가 집중",
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
      revenueRange: "ha당 약 800~1,500만 원 (건고추 기준, 가격 변동 큼)",
      costNote: "농약비·인건비가 상당, 비가림 시설 투자 고려",
      laborNote: "수확·건조·탈꼭지 등 노동 집약적, 가족 노동력 중요",
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
      revenueRange: "ha당 약 500~1,000만 원 (김장철 가격에 따라 변동)",
      costNote: "종자·비료·농약비 중심, 가격 폭락 리스크 있음",
      laborNote: "정식·수확 시 인력 필요, 기계화 어려운 부분 존재",
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
      revenueRange: "ha당 약 600~1,200만 원 (난지형/한지형에 따라 차이)",
      costNote: "종구비가 상당, 기계화로 노동비 절감 가능",
      laborNote: "심기·수확이 노동 집약적이나 기계화 진행 중",
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
      revenueRange: "ha당 약 400~1,000만 원 (가격 변동 매우 큼)",
      costNote: "묘 구입비, 정식 인건비가 주요 비용",
      laborNote: "정식·수확 시 인력 대량 필요, 기계화 진행 중",
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
      revenueRange: "10a당 약 200~400만 원 (연중 다회 수확 가능)",
      costNote: "시설비(하우스)가 주요 투자, 운영비는 낮은 편",
      laborNote: "수확·포장이 매일 반복, 꾸준한 노동 필요",
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
      revenueRange: "ha당 약 1,500~3,000만 원 (품종·품질에 따라 차이 큼)",
      costNote: "묘목·지주·방조망 등 초기 투자비 높음, 수확까지 3~5년",
      laborNote: "전정·적과·봉지씌우기·수확 등 연중 관리 작업 많음",
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
        { category: "수익성", text: "성목 기준 ha당 1,500~3,000만 원으로 고소득 작물" },
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
      revenueRange: "ha당 약 1,200~2,500만 원 (신고배 기준)",
      costNote: "과수원 조성 비용 높음, 봉지씌우기 인건비 상당",
      laborNote: "전정·수분·적과·봉지·수확 등 연중 세밀한 관리 필요",
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
      revenueRange: "ha당 약 2,000~4,000만 원 (샤인머스캣 기준 상단)",
      costNote: "비가림 시설·덕 설치 초기 투자 큼, 묘목비 고가",
      laborNote: "적방·적과·봉지·수확 등 세밀한 손작업 많음",
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
        { category: "수익성", text: "샤인머스캣 기준 ha당 2,000~4,000만 원의 높은 수익" },
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
      revenueRange: "ha당 약 1,000~2,500만 원 (만감류는 더 높음)",
      costNote: "하우스 재배 시 난방비 부담, 노지 재배 상대적 저비용",
      laborNote: "적과·수확 시 인력 집중, 비수기 전정·방제 관리",
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
      revenueRange: "10a당 약 1,500~3,000만 원 (고설재배 시 상단)",
      costNote: "하우스·난방·양액 시설 초기 투자 상당, 묘 관리비도 높음",
      laborNote: "수확이 매일 반복, 겨울 내내 지속적 관리 필요",
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
      revenueRange: "ha당 약 3,000~6,000만 원 (4~6년근 기준, 장기 투자)",
      costNote: "차광 시설·묘삼비·토지 비용 높음, 투자 회수까지 4~6년",
      laborNote: "해가림 관리·병해 방제에 세심한 관리 필요",
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
      revenueRange: "10a당 약 200~400만 원 (들깨 대비 높은 단가)",
      costNote: "생산비 낮은 편, 종자·비료비 위주",
      laborNote: "수확·탈립이 노동 집약적, 기계 수확 어려움",
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
  },
];
