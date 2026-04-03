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

/** 작물 상세 정보 — CropInfo.id로 1:1 매핑 */
export interface CropDetailInfo {
  id: string;
  cultivation: CultivationDetail;
  income: IncomeInfo;
  majorRegions: string[];
  tips: string[];
  relatedCropIds: string[];
  kosisConfig?: KosisConfig;
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

/** 작물 이름 → CropInfo 매핑 (Cross-linking용) */
export function getCropByName(name: string): CropInfo | undefined {
  return CROPS.find((c) => c.name === name);
}

export const CROP_CATEGORIES = ["전체", "식량", "채소", "과수", "특용"] as const;
export type CropCategory = (typeof CROP_CATEGORIES)[number];

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
  },
];
