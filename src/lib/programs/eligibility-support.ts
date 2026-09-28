/**
 * 자격 미충족 항목 → 이랑 안에서 채울 수 있는 경로 매핑 (2026-09-28 회장).
 *
 * 셀프 체크가 "못 채웠다"로 끝나면 사용자는 갈 곳이 없다. 미충족 항목마다
 * **무엇을 채워야 하는지** 한 줄과, 우리가 도울 수 있으면 내부 링크를 붙인다.
 *
 * 순수 함수 — 라벨 문자열만 보고 판정한다(데이터·컴포넌트 의존 0).
 * 매핑이 없으면 null 을 돌려주고, 호출처가 "{기관} 문의" 안내로 대신한다.
 */

export interface EligibilitySupport {
  /** 무엇을 채워야 하는지 — 사용자 언어 한 줄 */
  title: string;
  /** 이랑 내부 경로 (normalize 화이트리스트 통과 확인 완료) */
  href: string;
  /** 링크 버튼 라벨 */
  cta: string;
  /** 계측·테스트용 규칙 id */
  kind:
    | "education"
    | "region"
    | "ranking"
    | "youth"
    | "assess"
    | "career"
    | "farmland"
    | "housing"
    | "cost";
}

/** 농지 임대 트랙 — 작물과 무관한 상설 사업이라 미충족 항목에서 바로 연결한다 */
const FARMLAND_PROGRAM_HREF = "/programs/SP-018";

/**
 * 판정 규칙 — **위에서부터** 먼저 맞는 하나를 쓴다.
 * 한 문장에 여러 조건이 섞이므로(예: "농촌지역 전입일로부터 만 6년 미경과 세대주")
 * 더 구체적인 행동을 요구하는 규칙을 앞에 둔다.
 */
const RULES: Array<{
  test: (label: string) => boolean;
  support: EligibilitySupport;
}> = [
  {
    // 교육·수료·이수 — 가장 실행하기 쉬운 조건이라 최우선
    test: (l) => /(교육|수료|이수|연수|과정을|아카데미|보육센터)/.test(l),
    support: {
      kind: "education",
      title: "영농 교육 이수가 필요해요",
      href: "/education",
      cta: "귀농 교육 찾기",
    },
  },
  {
    // 시·군·구를 고르는 문제로 읽히는 조건
    test: (l) => /(시·군·구|시군구|해당 시군|시군 선택)/.test(l),
    support: {
      kind: "ranking",
      title: "정착할 시·군·구를 정해야 해요",
      href: "/regions/ranking",
      cta: "맞춤 시군구 찾기",
    },
  },
  {
    test: (l) =>
      /(전입|거주|주민등록|주소|이주|이전 완료|농촌 지역|농촌지역|읍·면|읍면|정착 희망|정착 예정|귀농귀촌 희망|귀농 희망|귀촌 희망|세대주|세대원)/.test(l),
    support: {
      kind: "region",
      title: "농촌 지역 전입·거주가 필요해요",
      href: "/regions",
      cta: "정착 지역 찾기",
    },
  },
  {
    // 청년 트랙 — "청년" 이거나 상한 연령이 45세 이하인 조건
    test: (l) => /청년/.test(l) || isYouthAgeLimit(l),
    support: {
      kind: "youth",
      title: "청년 연령 조건이에요",
      href: "/programs?persona=farmYouth",
      cta: "청년 지원사업 보기",
    },
  },
  {
    // 그 밖의 연령·자격 일반 — 내 유형부터 가려 본다
    // "만 18~65세"처럼 범위 표기가 많아 숫자 뒤 물결·하이픈을 함께 허용한다
    test: (l) => /(만\s*\d+\s*(?:[~∼-]\s*\d+\s*)?세|연령|나이)/.test(l),
    support: {
      kind: "assess",
      title: "연령·유형 조건을 확인해 보세요",
      href: "/match?mode=assess",
      cta: "내 유형 진단",
    },
  },
  {
    test: (l) =>
      /(영농경력|영농 경력|경영체|농업인 등록|독립경영|독립 경영|후계농|승계|영농 종사|실제 영농|영농에 종사)/.test(l),
    support: {
      kind: "career",
      title: "영농 경력·경영체 등록이 필요해요",
      href: "/guide",
      cta: "정착 로드맵 보기",
    },
  },
  {
    test: (l) => /(농지|농지은행|임차|임대|경작지|사업부지|부지 확보|과원)/.test(l),
    support: {
      kind: "farmland",
      title: "농지 확보가 필요해요",
      href: FARMLAND_PROGRAM_HREF,
      cta: "농지 임대 알아보기",
    },
  },
  {
    test: (l) => /(주택|주거|집을|빈집|거처)/.test(l),
    support: {
      kind: "housing",
      title: "주거 준비가 필요해요",
      href: "/guide",
      cta: "정착 로드맵 보기",
    },
  },
  {
    test: (l) => /(자금|소득|자부담|융자|대출|여신|신용|자기자본|담보)/.test(l),
    support: {
      kind: "cost",
      title: "자금 계획 확인이 필요해요",
      href: "/costs",
      cta: "비용 가이드 보기",
    },
  },
];

/** "만 18~39세"·"만 45세 미만"처럼 상한이 45세 이하면 청년 트랙으로 본다 */
function isYouthAgeLimit(label: string): boolean {
  const range = label.match(/만\s*(\d+)\s*[~∼-]\s*(\d+)\s*세/);
  if (range) return Number(range[2]) <= 45;
  const upper = label.match(/만\s*(\d+)\s*세\s*(미만|이하)/);
  if (upper) return Number(upper[1]) <= 45;
  return false;
}

/**
 * 자격 항목 한 줄 → 이랑 안에서 채울 경로. 매핑이 없으면 null.
 */
export function resolveEligibilitySupport(label: string): EligibilitySupport | null {
  const text = label.trim();
  if (!text) return null;
  for (const rule of RULES) {
    if (rule.test(text)) return rule.support;
  }
  return null;
}
