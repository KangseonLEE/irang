/* ==========================================================================
   귀농 준비도 진단 — 데이터 & 스코어링 로직
   10문항 · 5차원 · 4등급
   ========================================================================== */

/* ── 타입 ── */

export type DimensionId =
  | "motivation"
  | "finance"
  | "family"
  | "experience"
  | "adaptability";

export interface AssessmentOption {
  label: string;
  score: 1 | 2 | 3 | 4;
}

export interface AssessmentQuestion {
  id: string;
  dimension: DimensionId;
  dimensionLabel: string;
  question: string;
  options: AssessmentOption[];
}

/* ── 인구통계 질문 (점수 무관, 맞춤 지원 추천용) ── */

export interface DemographicOption {
  label: string;
  value: string;
}

export interface DemographicQuestion {
  id: string;
  question: string;
  options: DemographicOption[];
}

export type DemographicAnswers = Record<string, string>; // questionId → value

export interface ResultTier {
  id: string;
  range: [number, number]; // [min, max]
  title: string;
  emoji: string;
  summary: string;
  description: string;
  tips: string[];
  matchParams: { experience: string; lifestyle: string };
}

export interface DimensionScore {
  id: DimensionId;
  label: string;
  score: number; // 2~8 raw
  percent: number; // 0~100
}

export interface AssessmentResult {
  totalScore: number;
  tier: ResultTier;
  dimensions: DimensionScore[];
}

/* ── 차원 메타 ── */

export const DIMENSIONS: { id: DimensionId; label: string; icon: string }[] = [
  { id: "motivation", label: "동기·마인드셋", icon: "🎯" },
  { id: "finance", label: "재정 준비도", icon: "💰" },
  { id: "family", label: "가족·생활 환경", icon: "👨‍👩‍👧" },
  { id: "experience", label: "경험·역량", icon: "🌱" },
  { id: "adaptability", label: "적응력·성향", icon: "🤝" },
];

/* ── 문항 데이터 (10문항) ── */

export const QUESTIONS: AssessmentQuestion[] = [
  // ── 차원 1: 동기·마인드셋 ──
  {
    id: "q1",
    dimension: "motivation",
    dimensionLabel: "동기·마인드셋",
    question: "귀농(시골에서 농사지으며 사는 것)에 대해 어떤 마음이세요?",
    options: [
      { label: "아직 잘 모르겠지만, 한번 알아보고 싶어요", score: 1 },
      { label: "자연 속에서 여유로운 삶을 살고 싶다는 생각이 있어요", score: 2 },
      { label: "직접 농사를 지으며 건강한 먹거리를 만들고 싶어요", score: 3 },
      {
        label: "구체적인 영농 계획이 있고, 농업을 사업으로 생각해요",
        score: 4,
      },
    ],
  },
  {
    id: "q2",
    dimension: "motivation",
    dimensionLabel: "동기·마인드셋",
    question:
      "귀농 후 처음 1~2년 동안 수입이 거의 없을 수 있다는 걸 알고 계셨나요?",
    options: [
      { label: "처음 알았어요! 귀농 생활이 어떤지 아직 잘 모르겠어요", score: 1 },
      {
        label: "들어는 봤지만 구체적으로 생각해본 적은 없어요",
        score: 2,
      },
      {
        label: "알고 있어요, 그래서 부업이나 다른 수입원을 고민 중이에요",
        score: 3,
      },
      {
        label: "이미 초기 수입 공백에 대한 대비책을 세워두었어요",
        score: 4,
      },
    ],
  },

  // ── 차원 2: 재정 준비도 ──
  {
    id: "q3",
    dimension: "finance",
    dimensionLabel: "재정 준비도",
    question: "현재 귀농을 위해 활용할 수 있는 자금은 어느 정도인가요?",
    options: [
      { label: "아직 구체적으로 모아둔 자금이 없어요", score: 1 },
      { label: "1억 원 미만이지만 조금씩 준비하고 있어요", score: 2 },
      { label: "1~3억 원 정도 준비되어 있어요", score: 3 },
      {
        label: "3억 원 이상 확보했고, 자금 계획도 세워두었어요",
        score: 4,
      },
    ],
  },
  {
    id: "q4",
    dimension: "finance",
    dimensionLabel: "재정 준비도",
    question:
      "귀농 후 농외소득(부업, 프리랜서 등)에 대해 어떻게 생각하세요?",
    options: [
      {
        label: "아직 귀농 후 생활에 대해 생각해본 적이 없어요",
        score: 1,
      },
      {
        label: "필요하다는 건 알지만, 뭘 할 수 있을지 모르겠어요",
        score: 2,
      },
      {
        label:
          "현재 직업 경험을 살려 원격 근무나 부업을 할 수 있을 것 같아요",
        score: 3,
      },
      {
        label: "이미 농외소득원을 확보했거나 구체적인 계획이 있어요",
        score: 4,
      },
    ],
  },

  // ── 차원 3: 가족·생활 환경 ──
  {
    id: "q5",
    dimension: "family",
    dimensionLabel: "가족·생활 환경",
    question:
      "가족(배우자, 자녀 등)과 귀농에 대해 얼마나 이야기를 나눠보셨나요?",
    options: [
      {
        label: "혼자 결정할 상황이거나, 아직 가족에게 꺼내보지 못했어요",
        score: 1,
      },
      {
        label: "가볍게 얘기는 했지만, 진지한 대화는 아직이에요",
        score: 2,
      },
      {
        label: "여러 번 대화했고, 조건부로 동의하는 분위기예요",
        score: 3,
      },
      {
        label: "가족 모두 합의했고, 함께 준비하고 있어요",
        score: 4,
      },
    ],
  },
  {
    id: "q6",
    dimension: "family",
    dimensionLabel: "가족·생활 환경",
    question:
      "대형 마트나 종합병원까지 차로 1시간 이상 걸리는 생활, 어떻게 느끼세요?",
    options: [
      {
        label: "솔직히 상상이 잘 안 돼요, 불편할 것 같아요",
        score: 1,
      },
      {
        label: "감수할 수는 있지만, 도시 근교가 좋겠어요",
        score: 2,
      },
      {
        label: "괜찮아요, 주 1회 정도 장보러 나가면 되니까요",
        score: 3,
      },
      {
        label: "오히려 좋아요, 불편함도 시골 생활의 일부라고 생각해요",
        score: 4,
      },
    ],
  },

  // ── 차원 4: 경험·역량 ──
  {
    id: "q7",
    dimension: "experience",
    dimensionLabel: "경험·역량",
    question: "농사나 식물 재배와 관련된 경험이 있으신가요?",
    options: [
      {
        label: "전혀 없어요! 하지만 한번 알아보고 싶은 마음이에요",
        score: 1,
      },
      {
        label: "화분이나 베란다 텃밭 정도는 키워본 적 있어요",
        score: 2,
      },
      {
        label: "주말농장이나 체험 농장에 다녀본 경험이 있어요",
        score: 3,
      },
      {
        label: "귀농 교육을 이수했거나 실제 영농 경험이 있어요",
        score: 4,
      },
    ],
  },
  {
    id: "q8",
    dimension: "experience",
    dimensionLabel: "경험·역량",
    question: "귀농에 대해 얼마나 알아보셨나요?",
    options: [
      {
        label: "아직 잘 몰라요, 이 테스트가 처음이에요!",
        score: 1,
      },
      {
        label: "SNS나 유튜브에서 귀농 관련 콘텐츠를 본 적 있어요",
        score: 2,
      },
      {
        label: "귀농 관련 책·강의를 찾아봤거나 설명회에 참석해봤어요",
        score: 3,
      },
      {
        label: "정규 귀농 교육과정을 수료했거나 현지 멘토가 있어요",
        score: 4,
      },
    ],
  },

  // ── 차원 5: 적응력·성향 ──
  {
    id: "q9",
    dimension: "adaptability",
    dimensionLabel: "적응력·성향",
    question:
      "시골 마을 이장님이 '이번 주말 마을 공동작업 나오세요'라고 하면 어떤 기분이 드세요?",
    options: [
      { label: "낯선 사람들과 어울리는 게 부담스러워요", score: 1 },
      { label: "좀 귀찮지만, 어쩔 수 없이 가겠죠", score: 2 },
      {
        label: "새로운 이웃을 알아가는 기회라고 생각해요",
        score: 3,
      },
      {
        label: "당연히 가야죠! 마을 공동체에 참여하는 건 중요하니까요",
        score: 4,
      },
    ],
  },
  {
    id: "q10",
    dimension: "adaptability",
    dimensionLabel: "적응력·성향",
    question:
      "한여름 35도 날씨에 하루 6시간 이상 야외에서 일하는 상황, 어떻게 느끼세요?",
    options: [
      { label: "체력에 전혀 자신이 없어요, 힘들 것 같아요", score: 1 },
      {
        label: "걱정은 되지만, 체력을 만들어가면 되지 않을까요",
        score: 2,
      },
      {
        label: "운동을 꾸준히 해왔고, 야외 활동을 좋아해요",
        score: 3,
      },
      {
        label: "이미 육체노동 경험이 있고, 체력 관리를 하고 있어요",
        score: 4,
      },
    ],
  },
];

/* ── 인구통계 질문 (진단 시작 전 수집, 점수에 미반영) ── */

export const DEMOGRAPHIC_QUESTIONS: DemographicQuestion[] = [
  {
    id: "ageGroup",
    question: "현재 연령대가 어떻게 되시나요?",
    options: [
      { label: "만 39세 이하 (청년)", value: "youth" },
      { label: "만 40~49세", value: "40s" },
      { label: "만 50~59세", value: "50s" },
      { label: "만 60세 이상", value: "60plus" },
    ],
  },
  {
    id: "gender",
    question: "성별을 알려주세요.",
    options: [
      { label: "남성", value: "male" },
      { label: "여성", value: "female" },
      { label: "선택하지 않음", value: "unspecified" },
    ],
  },
];

/** 인구통계 기반 맞춤 지원 힌트 생성 */
export function getDemographicHints(demo: DemographicAnswers): string[] {
  const hints: string[] = [];

  if (demo.ageGroup === "youth") {
    hints.push("청년 귀농 정착지원금(월 최대 110만 원, 최장 3년)을 신청할 수 있어요.");
    hints.push("청년 창업농 영농정착 지원사업도 확인해보세요.");
  }

  if (demo.gender === "female") {
    hints.push("여성 농업인 센터에서 경영·교육·복지 통합 지원을 받을 수 있어요.");
    hints.push("여성 농업인 영농교육, 육아·가사 도우미 지원사업도 살펴보세요.");
  }

  if (demo.ageGroup === "youth" && demo.gender === "female") {
    hints.push("청년+여성 우대 가산점이 적용되는 지원사업이 있으니 꼭 체크하세요!");
  }

  if (demo.ageGroup === "60plus") {
    hints.push("귀농귀촌 은퇴자 프로그램과 농촌 체험·치유 과정도 참고해보세요.");
  }

  return hints;
}

/* ── 결과 등급 ── */

export const RESULT_TIERS: ResultTier[] = [
  {
    id: "starter",
    range: [10, 17],
    title: "귀농의 씨앗을 품은 단계",
    emoji: "🌱",
    summary:
      "귀농에 대한 관심이 싹트고 있어요! 테스트를 해본 것만으로도 멋진 첫걸음이에요.",
    description:
      "지금은 귀농이 조금 먼 이야기처럼 느껴질 수 있어요. 하지만 궁금해서 이 테스트를 해봤다는 것 자체가 소중한 시작입니다. 서두를 필요 없이, 귀농이 어떤 것인지 가볍게 알아가는 것부터 시작해보세요. 이랑이 함께할게요!",
    tips: [
      "귀농귀촌종합센터의 무료 온라인 교육부터 가볍게 시작해보세요",
      "주말에 가까운 체험 농장을 방문해서 농사의 현실을 느껴보세요",
      "이랑의 귀농 선배 인터뷰를 읽으며 다양한 귀농 이야기를 만나보세요",
    ],
    matchParams: { experience: "none", lifestyle: "near-city" },
  },
  {
    id: "sprout",
    range: [18, 25],
    title: "가능성이 자라나는 새싹 단계",
    emoji: "🌿",
    summary:
      "귀농에 대한 마음은 확실해지고 있어요. 이제 구체적인 준비를 시작할 때입니다.",
    description:
      "귀농에 대한 관심이 단순한 호기심을 넘어서고 있어요. 하지만 아직 몇 가지 영역에서 준비가 필요합니다. 특히 재정 계획과 실제 농업 경험을 쌓는 것이 다음 단계의 핵심이에요. 준비 기간을 최소 2년 이상 잡고, 하나씩 채워가 보세요.",
    tips: [
      "월 저축 목표를 세우고, 귀농 자금 계획표를 작성해보세요",
      "주말농장을 1년 이상 운영하며 작물 재배의 전 과정을 경험해보세요",
      "가족과 진지하게 귀농 계획을 논의하고, 조건과 타임라인을 합의해보세요",
    ],
    matchParams: { experience: "none", lifestyle: "near-city" },
  },
  {
    id: "seedling",
    range: [26, 33],
    title: "든든하게 준비된 모종 단계",
    emoji: "🪴",
    summary:
      "상당한 준비가 되어 있어요! 부족한 부분만 보강하면 곧 시작할 수 있습니다.",
    description:
      "여러 면에서 귀농 준비가 잘 진행되고 있어요. 재정, 경험, 가족 합의 등 핵심 요소를 상당 부분 갖추고 있습니다. 이제는 구체적인 지역과 작물을 선정하고, 현지 답사를 통해 실행 계획을 구체화할 차례예요.",
    tips: [
      "관심 지역을 2~3곳으로 좁히고, 직접 방문하여 현지 농업인과 대화해보세요",
      "귀농 지원사업 신청 자격을 미리 확인하고, 필요한 서류를 준비해두세요",
      "처음부터 토지 구매보다 임대로 시작하는 전략을 고려해보세요",
    ],
    matchParams: { experience: "some", lifestyle: "moderate" },
  },
  {
    id: "ready",
    range: [34, 40],
    title: "이랑을 일굴 준비가 된 단계",
    emoji: "🌾",
    summary:
      "충분한 준비를 마치셨어요! 이제 나만의 이랑을 만들어갈 차례입니다.",
    description:
      "축하해요! 동기, 자금, 가족 합의, 경험, 적응력 모두 높은 준비 상태입니다. 이 정도 준비를 갖추고 시작하는 귀농인은 정착 성공률이 훨씬 높아요. 이제 이랑에서 나에게 딱 맞는 지역과 작물을 찾아볼까요?",
    tips: [
      "이랑의 맞춤 추천으로 나에게 최적인 지역과 작물을 확인해보세요",
      "정착 초기 1년은 소규모로 시작하고, 경험을 쌓으며 규모를 늘려가세요",
      "지역 농업기술센터와 연결하여 초기 정착 지원을 받아보세요",
    ],
    matchParams: { experience: "experienced", lifestyle: "rural" },
  },
];

/* ── 차원별 보강 가이드 ── */

export type ScoreTier = "critical" | "weak";

export interface ReinforcementAction {
  title: string;
  description: string;
  link: string;           // 내부 경로 또는 외부 URL
  linkLabel: string;
  isExternal?: boolean;   // true면 외부 링크
  priority: 1 | 2 | 3;   // 1=최우선
  estimatedTime?: string; // 예: "1개월", "주말 1회"
}

export interface TierGuide {
  tier: ScoreTier;
  message: string;        // 한줄 요약 메시지
  actions: ReinforcementAction[];
}

export interface DimensionGuide {
  dimensionId: DimensionId;
  guides: TierGuide[];
}

/**
 * 차원별 보강 가이드 데이터
 * - critical: 점수 ≤25% (2점, 매우 부족)
 * - weak: 점수 26~50% (3~4점, 보강 필요)
 */
export const DIMENSION_GUIDES: DimensionGuide[] = [
  /* ── 동기·마인드셋 ── */
  {
    dimensionId: "motivation",
    guides: [
      {
        tier: "critical",
        message: "귀농에 대한 현실적인 이해가 필요한 단계예요",
        actions: [
          {
            title: "귀농 선배 인터뷰 읽어보기",
            description: "실제 귀농인들의 생생한 경험담을 통해 귀농 생활의 현실을 파악해보세요.",
            link: "/interviews",
            linkLabel: "인터뷰 보러 가기",
            priority: 1,
            estimatedTime: "30분",
          },
          {
            title: "귀농귀촌종합센터 온라인 교육 수강",
            description: "농림축산식품부가 운영하는 무료 온라인 기초 교육으로 귀농의 전체 그림을 그려보세요.",
            link: "/education",
            linkLabel: "교육 과정 확인하기",
            priority: 2,
            estimatedTime: "2주",
          },
          {
            title: "귀농 비용 현실 확인하기",
            description: "토지, 주거, 농기계 등 실제 정착에 필요한 비용 구조를 미리 알아보세요.",
            link: "/costs",
            linkLabel: "비용 가이드 보기",
            priority: 3,
            estimatedTime: "20분",
          },
        ],
      },
      {
        tier: "weak",
        message: "귀농 동기를 더 구체적으로 다듬어볼 단계예요",
        actions: [
          {
            title: "귀농 선배 인터뷰로 동기 점검",
            description: "나와 비슷한 상황에서 귀농한 선배들의 이야기를 읽으며 동기를 구체화해보세요.",
            link: "/interviews",
            linkLabel: "인터뷰 보러 가기",
            priority: 1,
            estimatedTime: "30분",
          },
          {
            title: "귀농 가이드로 전체 프로세스 파악",
            description: "귀농 준비부터 정착까지의 단계별 가이드를 확인하며 나만의 계획을 세워보세요.",
            link: "/guide",
            linkLabel: "가이드 읽기",
            priority: 2,
            estimatedTime: "1시간",
          },
        ],
      },
    ],
  },

  /* ── 재정 준비도 ── */
  {
    dimensionId: "finance",
    guides: [
      {
        tier: "critical",
        message: "재정 계획이 귀농 성공의 가장 중요한 열쇠예요",
        actions: [
          {
            title: "귀농 비용 구조 파악하기",
            description: "토지·주거·농기계·생활비 등 항목별로 실제 필요 금액을 확인해보세요.",
            link: "/costs",
            linkLabel: "비용 가이드 보기",
            priority: 1,
            estimatedTime: "30분",
          },
          {
            title: "귀농 지원사업 탐색하기",
            description: "정부·지자체의 정착 지원금, 농지 임대, 저금리 융자 등 활용 가능한 지원을 찾아보세요.",
            link: "/programs",
            linkLabel: "지원사업 확인하기",
            priority: 2,
            estimatedTime: "1시간",
          },
          {
            title: "초기 비용 낮은 작물부터 시작 고려",
            description: "소규모 투자로 시작할 수 있는 작물을 알아보고, 초기 자금 부담을 줄여보세요.",
            link: "/crops",
            linkLabel: "작물 정보 보기",
            priority: 3,
            estimatedTime: "20분",
          },
        ],
      },
      {
        tier: "weak",
        message: "자금 계획을 좀 더 구체화하면 자신감이 생길 거예요",
        actions: [
          {
            title: "지원사업으로 자금 보완하기",
            description: "내 조건에 맞는 정부 지원사업을 확인하고, 자금 계획에 반영해보세요.",
            link: "/programs",
            linkLabel: "지원사업 확인하기",
            priority: 1,
            estimatedTime: "1시간",
          },
          {
            title: "지역별 정착 비용 비교하기",
            description: "지역에 따라 토지·주거 비용 차이가 커요. 예산에 맞는 지역을 찾아보세요.",
            link: "/regions",
            linkLabel: "지역 정보 보기",
            priority: 2,
            estimatedTime: "30분",
          },
        ],
      },
    ],
  },

  /* ── 가족·생활 환경 ── */
  {
    dimensionId: "family",
    guides: [
      {
        tier: "critical",
        message: "가족과의 충분한 대화가 정착 성공률을 크게 높여요",
        actions: [
          {
            title: "귀농 선배 가족의 이야기 읽기",
            description: "가족과 함께 귀농한 선배들의 경험담을 공유하며 대화의 실마리를 찾아보세요.",
            link: "/interviews",
            linkLabel: "인터뷰 보러 가기",
            priority: 1,
            estimatedTime: "30분",
          },
          {
            title: "농촌 생활 인프라 확인하기",
            description: "의료·교육·쇼핑 인프라가 잘 갖춰진 지역 정보를 미리 확인해보세요.",
            link: "/regions",
            linkLabel: "지역 정보 보기",
            priority: 2,
            estimatedTime: "30분",
          },
          {
            title: "귀농귀촌 체험 프로그램 참여",
            description: "가족과 함께 주말 농촌 체험에 참여하면 실제 생활을 미리 느껴볼 수 있어요.",
            link: "/education",
            linkLabel: "체험 프로그램 찾기",
            priority: 3,
            estimatedTime: "주말 1회",
          },
        ],
      },
      {
        tier: "weak",
        message: "가족 합의와 생활 환경 적응 계획을 구체화해보세요",
        actions: [
          {
            title: "도시 근교 지역부터 탐색하기",
            description: "생활 편의시설이 가까운 도시 근교 농촌 지역을 먼저 살펴보세요.",
            link: "/regions",
            linkLabel: "지역 정보 보기",
            priority: 1,
            estimatedTime: "30분",
          },
          {
            title: "귀농 가이드로 준비 체크리스트 확인",
            description: "가족 합의, 자녀 교육, 의료 접근성 등 생활 환경 체크포인트를 점검해보세요.",
            link: "/guide",
            linkLabel: "가이드 읽기",
            priority: 2,
            estimatedTime: "30분",
          },
        ],
      },
    ],
  },

  /* ── 경험·역량 ── */
  {
    dimensionId: "experience",
    guides: [
      {
        tier: "critical",
        message: "작은 경험부터 차근차근 쌓아가면 충분해요",
        actions: [
          {
            title: "귀농 교육 과정 수강하기",
            description: "귀농귀촌종합센터, 지역 농업기술센터의 실습 중심 교육으로 기초를 다져보세요.",
            link: "/education",
            linkLabel: "교육 과정 확인하기",
            priority: 1,
            estimatedTime: "1~3개월",
          },
          {
            title: "키우기 쉬운 작물 정보 확인",
            description: "초보자도 도전할 수 있는 난이도 낮은 작물부터 알아보세요.",
            link: "/crops",
            linkLabel: "작물 정보 보기",
            priority: 2,
            estimatedTime: "20분",
          },
          {
            title: "귀농 선배에게 배우기",
            description: "실제 영농 경험을 가진 선배들의 노하우와 시행착오를 미리 파악해보세요.",
            link: "/interviews",
            linkLabel: "인터뷰 보러 가기",
            priority: 3,
            estimatedTime: "30분",
          },
        ],
      },
      {
        tier: "weak",
        message: "실전 경험을 조금 더 쌓으면 자신감이 붙을 거예요",
        actions: [
          {
            title: "관심 작물 심화 학습하기",
            description: "재배 방법, 수익성, 난이도를 비교하며 나에게 맞는 작물을 골라보세요.",
            link: "/crops",
            linkLabel: "작물 정보 보기",
            priority: 1,
            estimatedTime: "30분",
          },
          {
            title: "현장 교육·실습 과정 참여",
            description: "이론뿐 아니라 실습이 포함된 교육 과정에 참여해 실전 감각을 키워보세요.",
            link: "/education",
            linkLabel: "교육 과정 확인하기",
            priority: 2,
            estimatedTime: "1~2개월",
          },
        ],
      },
    ],
  },

  /* ── 적응력·성향 ── */
  {
    dimensionId: "adaptability",
    guides: [
      {
        tier: "critical",
        message: "농촌 생활 적응력은 경험을 통해 충분히 기를 수 있어요",
        actions: [
          {
            title: "농촌 체험·행사 참여하기",
            description: "지역 축제, 마을 봉사활동 등에 참여하며 농촌 분위기를 먼저 경험해보세요.",
            link: "/events",
            linkLabel: "행사·이벤트 보기",
            priority: 1,
            estimatedTime: "주말 1회",
          },
          {
            title: "귀농 선배의 적응기 읽기",
            description: "도시에서 농촌으로 이주한 선배들이 어떻게 적응했는지 실제 사례를 확인해보세요.",
            link: "/interviews",
            linkLabel: "인터뷰 보러 가기",
            priority: 2,
            estimatedTime: "30분",
          },
          {
            title: "도시 근교 지역 탐색하기",
            description: "갑작스러운 환경 변화가 부담된다면, 도시 접근성이 좋은 지역부터 고려해보세요.",
            link: "/regions",
            linkLabel: "지역 정보 보기",
            priority: 3,
            estimatedTime: "20분",
          },
        ],
      },
      {
        tier: "weak",
        message: "농촌 커뮤니티와의 접점을 미리 만들어보세요",
        actions: [
          {
            title: "관심 지역 직접 방문하기",
            description: "후보 지역을 1~2곳 골라 직접 방문하고, 마을 분위기를 느껴보세요.",
            link: "/regions",
            linkLabel: "지역 정보 보기",
            priority: 1,
            estimatedTime: "주말 1회",
          },
          {
            title: "귀농 커뮤니티·행사 참여",
            description: "귀농 박람회나 설명회에 참석하면 비슷한 고민을 가진 동료를 만날 수 있어요.",
            link: "/events",
            linkLabel: "행사·이벤트 보기",
            priority: 2,
            estimatedTime: "반나절",
          },
        ],
      },
    ],
  },
];

/**
 * 차원 점수에 따른 보강 가이드 조회
 * @param dimensionId 차원 ID
 * @param percent 0~100 점수 퍼센트
 * @returns 해당 심각도의 가이드 or null (50% 초과면 보강 불필요)
 */
export function getDimensionGuide(
  dimensionId: DimensionId,
  percent: number,
): TierGuide | null {
  if (percent > 50) return null;

  const guide = DIMENSION_GUIDES.find((g) => g.dimensionId === dimensionId);
  if (!guide) return null;

  const tier: ScoreTier = percent <= 25 ? "critical" : "weak";
  return guide.guides.find((g) => g.tier === tier) ?? null;
}

/* ── 스코어링 함수 ── */

export type Answers = Record<string, number>; // questionId → score

/**
 * 답변 맵으로부터 전체 결과를 계산
 */
export function calculateResult(answers: Answers): AssessmentResult {
  // 총점
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);

  // 차원별 점수
  const dimensions: DimensionScore[] = DIMENSIONS.map((dim) => {
    const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim.id);
    const rawScore = dimQuestions.reduce(
      (sum, q) => sum + (answers[q.id] || 0),
      0
    );
    // 차원당 2문항 → max 8점
    const percent = Math.round((rawScore / 8) * 100);
    return {
      id: dim.id,
      label: dim.label,
      score: rawScore,
      percent,
    };
  });

  // 등급 판정
  const tier =
    RESULT_TIERS.find(
      (t) => totalScore >= t.range[0] && totalScore <= t.range[1]
    ) ?? RESULT_TIERS[0]; // fallback

  return { totalScore, tier, dimensions };
}
