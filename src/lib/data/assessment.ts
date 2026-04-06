/* ==========================================================================
   귀농 적합성 진단 — 데이터 & 스코어링 로직
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
    question: "귀농을 생각하게 된 가장 큰 이유는 무엇인가요?",
    options: [
      { label: "도시 생활이 지쳐서, 일단 벗어나고 싶어요", score: 1 },
      { label: "자연 속에서 여유로운 삶을 살고 싶어요", score: 2 },
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
      { label: "처음 알았어요, 좀 걱정이 되네요", score: 1 },
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
        label: "농사만으로 충분하지 않을까요? 아직 생각해본 적 없어요",
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
        label: "아직 꺼내보지 못했어요, 반대할까 봐 걱정이에요",
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
    question: "지금까지 농사와 관련된 경험이 있으신가요?",
    options: [
      { label: "전혀 없어요, 흙을 만져본 적도 거의 없어요", score: 1 },
      {
        label: "베란다 텃밭이나 화분 키우기 정도는 해봤어요",
        score: 2,
      },
      {
        label: "주말농장이나 체험 농장을 1년 이상 다녀봤어요",
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
    question: "귀농과 관련된 교육이나 정보 수집을 해보셨나요?",
    options: [
      {
        label: "유튜브 영상이나 블로그 글을 가끔 보는 정도예요",
        score: 1,
      },
      {
        label: "귀농 관련 책을 읽거나 온라인 강의를 들어봤어요",
        score: 2,
      },
      {
        label: "귀농귀촌종합센터나 지자체 설명회에 참석해봤어요",
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

/* ── 결과 등급 ── */

export const RESULT_TIERS: ResultTier[] = [
  {
    id: "starter",
    range: [10, 17],
    title: "귀농의 씨앗을 품은 단계",
    emoji: "🌱",
    summary:
      "귀농에 대한 관심이 싹트고 있어요. 지금은 마음속 씨앗을 소중히 키울 때입니다.",
    description:
      "아직은 귀농이 막연한 꿈일 수 있어요. 하지만 관심을 갖기 시작한 것 자체가 중요한 첫걸음입니다. 지금 단계에서는 귀농의 현실을 차근차근 알아가면서, 정말 나에게 맞는 길인지 탐색해보세요. 서두르지 않아도 괜찮아요.",
    tips: [
      "귀농귀촌종합센터의 무료 온라인 교육부터 가볍게 시작해보세요",
      "주말에 가까운 체험 농장을 방문해서 농사의 현실을 느껴보세요",
      "귀농한 사람들의 인터뷰나 수기를 읽으며 현실적인 기대치를 만들어보세요",
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
