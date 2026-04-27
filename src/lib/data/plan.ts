/**
 * 귀농 준비 6단계 플랜 데이터
 * - 단계별 체크리스트, 이랑 내부 링크, 외부 기관 링크 포함
 * - 출처: 농림축산식품부 귀농귀촌종합센터 가이드, 귀농어·귀촌 활성화법
 */

/* ── 체크리스트 항목 ── */

export interface PlanCheckItem {
  /** 고유 ID (예: "step1-item1") */
  id: string;
  /** 체크리스트 항목명 */
  label: string;
  /** 상세 설명 */
  description: string;
  /** 이랑 내부 링크 경로 */
  irangLink?: string;
  /** 이랑 내부 링크 표시 텍스트 */
  irangLinkLabel?: string;
  /** 외부 사이트 링크 */
  externalLink?: string;
  /** 외부 링크 표시 텍스트 */
  externalLinkLabel?: string;
}

/* ── 단계 정보 ── */

export interface PlanStep {
  /** 단계 번호 (1~6) */
  step: number;
  /** 단계 식별자 */
  id: string;
  /** 단계 제목 */
  title: string;
  /** 축약 제목 (탭/네비게이션용) */
  shortTitle: string;
  /** 권장 시작 시점 */
  timeline: string;
  /** 단계 아이콘 (이모지) */
  icon: string;
  /** 단계 설명 (2~3문장) */
  description: string;
  /** 단계 목표 */
  goal: string;
  /** 체크리스트 항목 배열 */
  checklist: PlanCheckItem[];
}

/* ── 6단계 데이터 ── */

export const PLAN_STEPS: PlanStep[] = [
  /* ── 1단계: 관심 및 정보 수집 ── */
  {
    step: 1,
    id: "interest",
    title: "관심 및 정보 수집",
    shortTitle: "관심·정보",
    timeline: "D-24개월~",
    icon: "🔍",
    description:
      "귀농에 대한 막연한 관심을 구체적인 계획으로 전환하는 첫 단계예요. " +
      "자기 진단을 통해 귀농 적합성을 확인하고, 가족과 함께 방향을 설정해요. " +
      "이 단계에서 충분한 정보를 모을수록 이후 과정이 순탄해집니다.",
    goal: "귀농에 대한 기본 이해, 자기 진단, 가족 합의",
    checklist: [
      {
        id: "step1-item1",
        label: "귀농 적합성 자가 진단",
        description:
          "체력, 경제적 여건, 농촌 생활 적응력 등을 종합적으로 평가하여 본인의 귀농 준비 수준을 파악해요.",
        irangLink: "/match?mode=assess",
        irangLinkLabel: "적합성 진단 바로가기",
      },
      {
        id: "step1-item2",
        label: "귀농 정보 탐색",
        description:
          "귀농귀촌종합센터, 농업기술센터, 이랑 등에서 제공하는 다양한 귀농 정보를 폭넓게 수집해요.",
      },
      {
        id: "step1-item3",
        label: "귀농 유형 결정",
        description:
          "전업농, 반농반X(겸업), 주말농장 등 본인의 라이프스타일과 경제 상황에 맞는 귀농 유형을 선택해요.",
        irangLink: "/match",
        irangLinkLabel: "맞춤 매칭 바로가기",
      },
      {
        id: "step1-item4",
        label: "가족 합의",
        description:
          "배우자의 귀농 동의, 자녀 교육 계획(전학, 통학 가능 여부), 부양가족 돌봄 등 가족 전체의 의견을 조율해요.",
      },
      {
        id: "step1-item5",
        label: "자금 계획 초안 수립",
        description:
          "보유 자산, 예상 지출(토지·주거·생활비·영농자금), 융자 가능액을 개략적으로 추산하여 재무 로드맵을 그려요.",
      },
    ],
  },

  /* ── 2단계: 교육 및 체험 ── */
  {
    step: 2,
    id: "education",
    title: "교육 및 체험",
    shortTitle: "교육·체험",
    timeline: "D-18개월~",
    icon: "📚",
    description:
      "귀농에 필요한 실질적인 지식과 기술을 습득하는 단계예요. " +
      "공인 교육 이수(40시간 이상)는 귀농 정착금 등 지원사업 신청의 필수 요건이므로 반드시 이수해야 해요. " +
      "선도 농가 현장 체험을 통해 실제 농촌 생활을 미리 경험해 볼 수 있어요.",
    goal: "공인 교육 이수(40시간+), 작물 선정, 현장 감각 확보",
    checklist: [
      {
        id: "step2-item1",
        label: "귀농귀촌 교육 수강 (40시간 이상)",
        description:
          "농업기술센터, 귀농귀촌종합센터 등에서 제공하는 공인 교육을 이수해요. " +
          "귀농 창업자금 지원사업의 필수 요건(100시간 이상 권장)이므로 체계적으로 수강 계획을 세웁니다.",
        irangLink: "/education",
        irangLinkLabel: "교육 과정 탐색",
      },
      {
        id: "step2-item2",
        label: "선도 농가 현장 체험 (1~4주)",
        description:
          "관심 작물을 재배하는 선도 농가에서 1~4주간 현장 실습을 해요. " +
          "실제 영농 과정을 체험하며 본인의 적성과 체력을 재점검해요.",
        irangLink: "/events",
        irangLinkLabel: "체험·행사 보기",
      },
      {
        id: "step2-item3",
        label: "작물 선정",
        description:
          "기후 조건, 토양 적합도, 시장 수요, 수익성, 노동 강도를 종합적으로 고려하여 주력 작물을 선정해요.",
        irangLink: "/crops",
        irangLinkLabel: "작물 정보 탐색",
      },
      {
        id: "step2-item4",
        label: "귀농 박람회 참가",
        description:
          "전국 각지에서 열리는 귀농귀촌 박람회에 참가하여 지역별 정보, 지원사업, 성공 사례를 수집해요.",
        irangLink: "/events",
        irangLinkLabel: "박람회·행사 보기",
      },
      {
        id: "step2-item5",
        label: "농지법 및 농업 기초 학습",
        description:
          "농지 취득 자격, 농지전용 제한, 농업경영체 등록 요건 등 귀농에 필수적인 법률·제도 기초를 학습해요.",
      },
    ],
  },

  /* ── 3단계: 지역 선정 ── */
  {
    step: 3,
    id: "region",
    title: "지역 선정",
    shortTitle: "지역 선정",
    timeline: "D-12개월~",
    icon: "📍",
    description:
      "수집한 정보와 체험을 바탕으로 정착할 지역을 구체적으로 결정하는 단계예요. " +
      "후보 지역을 2~3곳으로 압축한 뒤, 계절별 현장 답사와 주민 면담을 통해 최종 지역을 선정해요. " +
      "지역별 지원사업과 정주 여건(의료, 교육, 교통)을 꼼꼼히 비교해요.",
    goal: "후보 지역 비교·답사 → 정착 지역 최종 결정",
    checklist: [
      {
        id: "step3-item1",
        label: "후보 지역 2~3곳 비교",
        description:
          "기후, 토양, 접근성, 생활 인프라, 지원사업 등을 기준으로 후보 지역을 비교 분석해요.",
        irangLink: "/regions",
        irangLinkLabel: "지역 비교 탐색",
      },
      {
        id: "step3-item2",
        label: "시/군/구 단위 구체적 탐색",
        description:
          "선정한 시/도 내에서 읍/면/동 단위까지 세부적으로 탐색하여 최적의 정착 후보지를 좁혀 나갑니다.",
        irangLink: "/regions",
        irangLinkLabel: "시군구 상세 탐색",
      },
      {
        id: "step3-item3",
        label: "현장 답사 (최소 2~3회)",
        description:
          "후보 지역을 최소 2~3회, 가능하면 다른 계절에 방문하여 기후, 도로 사정, 생활 환경을 직접 확인해요.",
      },
      {
        id: "step3-item4",
        label: "지역 주민 및 선배 귀농인 면담",
        description:
          "해당 지역에 먼저 정착한 귀농인이나 지역 주민을 만나 실제 생활 여건과 주의사항을 청취해요.",
      },
      {
        id: "step3-item5",
        label: "지원사업 사전 조회",
        description:
          "해당 지역 지자체에서 운영하는 귀농 지원사업(정착금, 주택지원, 영농자금)의 자격 요건과 일정을 사전에 확인해요.",
        irangLink: "/programs",
        irangLinkLabel: "지원사업 탐색",
      },
      {
        id: "step3-item6",
        label: "귀농귀촌종합센터 1:1 상담",
        description:
          "귀농귀촌종합센터에서 전문 상담사와 1:1 상담을 받아 개인 상황에 맞는 맞춤형 조언을 얻을 수 있어요.",
        externalLink: "https://www.greendaero.go.kr",
        externalLinkLabel: "귀농귀촌종합센터 바로가기",
      },
    ],
  },

  /* ── 4단계: 토지 및 주거 확보 ── */
  {
    step: 4,
    id: "land",
    title: "토지 및 주거 확보",
    shortTitle: "토지·주거",
    timeline: "D-6개월~",
    icon: "🏡",
    description:
      "실제 농지를 매입(또는 임차)하고 주거지를 확보하는 가장 실무적인 단계예요. " +
      "농지취득자격증명, 토지이용규제 확인, 매매 계약, 전입신고까지 법률적 절차가 집중돼요. " +
      "이 단계에서의 실수는 금전적 손실로 직결되므로 전문가 자문을 적극 활용해요.",
    goal: "농지 매입(임차), 주거 확보, 전입신고, 농업경영체 등록",
    checklist: [
      {
        id: "step4-item1",
        label: "농지 물색",
        description:
          "한국농어촌공사 농지은행, 부동산 매물 사이트 등을 통해 조건에 맞는 농지를 탐색해요. " +
          "임야, 전, 답, 과수원 등 지목과 실제 이용 현황을 반드시 확인해요.",
        externalLink: "https://www.farmland.or.kr",
        externalLinkLabel: "농지은행 바로가기",
      },
      {
        id: "step4-item2",
        label: "토지이용규제 확인 (LURIS)",
        description:
          "토지이용규제정보시스템(LURIS)에서 농업진흥지역, 개발행위제한, 군사시설보호구역 등 규제 사항을 확인해요.",
        externalLink: "https://luris.molit.go.kr",
        externalLinkLabel: "LURIS 바로가기",
      },
      {
        id: "step4-item3",
        label: "농지취득자격증명 발급 신청",
        description:
          "농지 소재지 읍/면/동사무소에 농지취득자격증명을 신청해요. " +
          "영농계획서 작성이 필요하며, 발급까지 약 4~7일이 소요돼요.",
      },
      {
        id: "step4-item4",
        label: "농지 매매 계약 체결",
        description:
          "계약금 → 중도금 → 잔금 순으로 매매를 진행하고, 잔금 지급 후 소유권이전등기를 완료해요. " +
          "등기 전 근저당, 가압류 등 권리 관계를 반드시 확인해요.",
      },
      {
        id: "step4-item5",
        label: "주거 확보",
        description:
          "농지 인근 주택 매입, 신축, 또는 지자체 운영 귀농인의집 임대 등으로 주거를 마련해요. " +
          "귀농인의집은 최대 5년까지 임대 가능하며 지자체별 운영 현황이 다릅니다.",
      },
      {
        id: "step4-item6",
        label: "전입신고 (주민등록 이전)",
        description:
          "정착 지역 읍/면/동 주민센터에 전입신고를 해요. " +
          "전입 시점이 귀농인 인정 및 지원사업 자격의 기준일이 되므로 시기를 신중히 결정해요.",
      },
      {
        id: "step4-item7",
        label: "농업경영체 등록",
        description:
          "국립농산물품질관리원(NAQS)에 농업경영체를 등록해요. " +
          "직불금, 정책자금, 재해보험 등 각종 지원사업의 기본 자격 요건이에요.",
      },
    ],
  },

  /* ── 5단계: 영농 시작 ── */
  {
    step: 5,
    id: "farming",
    title: "영농 시작",
    shortTitle: "영농 시작",
    timeline: "D-Day",
    icon: "🌱",
    description:
      "실질적으로 농사를 시작하는 단계예요. " +
      "농지원부 작성, 영농 계획 수립, 농기계·시설 확보 등 첫 해 영농에 필요한 기반을 갖춥니다. " +
      "초기 투자 부담을 줄이기 위해 지원사업과 농기계 공동이용을 적극 활용해요.",
    goal: "첫 해 영농 기반 구축, 지원사업 수급, 판로 확보 준비",
    checklist: [
      {
        id: "step5-item1",
        label: "농지원부 작성",
        description:
          "농지 소재지 읍/면/동 주민센터에서 농지원부를 작성해요. " +
          "농업인 확인서 발급, 농협 조합원 가입 등의 기초 서류가 돼요.",
      },
      {
        id: "step5-item2",
        label: "영농 계획 수립",
        description:
          "작부 체계(작물 배치·윤작 계획), 연간 농사 일정, 예상 수확량과 매출 목표를 구체적으로 수립해요.",
      },
      {
        id: "step5-item3",
        label: "농기계 및 시설 확보",
        description:
          "트랙터, 경운기 등 필요 농기계를 구매하거나 농기계임대사업소, 농협 공동이용을 활용해요. " +
          "비닐하우스, 관수시설 등 재배 시설도 이 시기에 설치해요.",
      },
      {
        id: "step5-item4",
        label: "지원사업 신청",
        description:
          "귀농 농업창업 지원금, 영농정착 지원금, 농업정책자금 융자 등 자격 요건에 맞는 지원사업을 신청해요. " +
          "대부분 연초(1~2월)에 공모하므로 일정을 미리 확인해요.",
        irangLink: "/programs",
        irangLinkLabel: "지원사업 탐색",
      },
      {
        id: "step5-item5",
        label: "농협 조합원 가입",
        description:
          "지역 농협에 조합원으로 가입하면 농산물 판로(공판장 출하), 농자재 할인 구매, 영농 기술 지도를 받을 수 있어요.",
      },
    ],
  },

  /* ── 6단계: 정착 및 안정화 ── */
  {
    step: 6,
    id: "settle",
    title: "정착 및 안정화",
    shortTitle: "정착·안정",
    timeline: "D+12개월~",
    icon: "🏠",
    description:
      "첫 해 영농 경험을 바탕으로 안정적인 농업 경영 체계를 구축하는 단계예요. " +
      "다양한 판로를 확보하고, 6차산업화를 통한 부가가치 창출을 모색해요. " +
      "지역 커뮤니티에 적극 참여하여 농촌 사회에 뿌리를 내립니다.",
    goal: "판로 다각화, 소득 안정화, 지역 사회 정착",
    checklist: [
      {
        id: "step6-item1",
        label: "판로 확보",
        description:
          "농협 공판장 출하, 직거래(꾸러미·마르쉐), 로컬푸드 직매장, 온라인 쇼핑몰 등 복수의 판매 채널을 확보하여 소득을 안정화해요.",
      },
      {
        id: "step6-item2",
        label: "6차산업화 검토",
        description:
          "농산물 가공(잼, 즙, 건조), 농촌 체험·관광, 농가 카페·민박 등 1차(생산)·2차(가공)·3차(서비스)를 융합하는 6차산업화를 검토해요.",
      },
      {
        id: "step6-item3",
        label: "후속 교육 수강",
        description:
          "전문 영농 기술(병해충 관리, 스마트팜), 농업 경영(회계, 마케팅), GAP 인증 등 심화 교육을 지속적으로 수강해요.",
        irangLink: "/education",
        irangLinkLabel: "교육 과정 탐색",
      },
      {
        id: "step6-item4",
        label: "커뮤니티 참여",
        description:
          "귀농인 모임, 작목반, 마을공동체, 지역 봉사활동 등에 적극 참여하여 인적 네트워크를 확장하고 지역 사회에 안착해요.",
      },
      {
        id: "step6-item5",
        label: "농지원부 갱신",
        description:
          "농지원부는 연 1회 경작 현황을 갱신해야 해요. " +
          "미갱신 시 농업인 자격 확인이 어려워 지원사업 수급에 불이익이 생길 수 있어요.",
      },
    ],
  },
];

/* ── 전체 기간 ── */

/** 귀농 준비 전체 예상 기간 */
export const PLAN_TOTAL_DURATION = "약 2~3년";

/* ── 유틸리티 함수 ── */

/** 단계 ID로 PlanStep 조회 */
export function getPlanStepById(id: string): PlanStep | undefined {
  return PLAN_STEPS.find((s) => s.id === id);
}

/** 단계 번호(1~6)로 PlanStep 조회 */
export function getPlanStepByNumber(step: number): PlanStep | undefined {
  return PLAN_STEPS.find((s) => s.step === step);
}

/** 전체 체크리스트 항목 수 */
export function getTotalChecklistCount(): number {
  return PLAN_STEPS.reduce((sum, s) => sum + s.checklist.length, 0);
}

/** 이랑 내부 링크가 있는 체크리스트 항목만 추출 */
export function getItemsWithIrangLink(): (PlanCheckItem & { stepId: string })[] {
  return PLAN_STEPS.flatMap((s) =>
    s.checklist
      .filter((item) => item.irangLink)
      .map((item) => ({ ...item, stepId: s.id }))
  );
}

/* ── 핵심 법률·제도 ── */

/** 귀농 관련 핵심 법률/제도 */
export interface KeyRegulation {
  /** 법률/제도 명칭 */
  name: string;
  /** 설명 */
  description: string;
  /** 관련 단계 번호 (1~6) */
  relevantSteps: number[];
}

export const KEY_REGULATIONS: KeyRegulation[] = [
  {
    name: "농지법",
    description:
      "농지의 소유·이용·보전에 관한 핵심 법률이에요. " +
      "농지취득자격증명 발급, 농업진흥지역 행위 제한, 농지전용 허가 등 농지 취득과 이용의 모든 단계에 적용돼요.",
    relevantSteps: [2, 4],
  },
  {
    name: "농업경영체 육성 및 지원에 관한 법률",
    description:
      "농업경영체 등록 근거 법률이에요. " +
      "직불금, 정책자금, 재해보험 등 정부 지원사업을 수급하려면 농업경영체 등록이 필수이며, 이 법이 그 기반을 제공해요.",
    relevantSteps: [4, 5],
  },
  {
    name: "귀농어·귀촌 활성화 및 지원에 관한 법률",
    description:
      "귀농인·귀촌인의 법적 정의와 지원 근거를 규정한 법률이에요. " +
      "귀농 교육, 정착 지원금, 귀농인의집 등 각종 지원사업의 법적 토대가 돼요.",
    relevantSteps: [1, 2, 3, 5],
  },
  {
    name: "농어촌정비법",
    description:
      "농어촌 생활환경 정비 및 농어촌 마을 개발에 관한 법률이에요. " +
      "귀농인의집 조성·운영 근거, 농어촌 도로·용수 시설 정비 등 정주 여건과 관련돼요.",
    relevantSteps: [4, 6],
  },
  {
    name: "산지관리법",
    description:
      "산지(임야)의 전용·보전에 관한 법률이에요. " +
      "임야를 농지로 전용하거나 산지에 농업용 시설을 설치할 때 산지전용허가 절차와 복구비 예치 등이 적용돼요.",
    relevantSteps: [4],
  },
];
