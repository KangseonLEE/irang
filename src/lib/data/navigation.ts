/**
 * 전역 메뉴 SSOT — 헤더 GNB · 하단 탭 · /more 전체 메뉴 · 푸터가 모두 이 파일을 소비한다.
 *
 * 구조는 "여정형 5그룹": 탐색 → 비교·진단 → 준비 → 신청 → 참고자료.
 * 항목을 추가·이동할 때 이 파일만 고치면 네 곳이 함께 따라간다.
 *
 * 아이콘은 컴포넌트가 아니라 **문자열 이름**으로 둔다.
 *   · lib → components 역참조 금지(eslint no-restricted-imports)
 *   · 헤더 번들에 쓰지도 않는 아이콘 20여 개가 딸려 들어가는 것 방지
 * 실제 lucide 컴포넌트 매핑은 아이콘을 쓰는 화면(/more)에서 로컬로 한다.
 */

export interface NavItem {
  href: string;
  label: string;
  desc: string;
  /** lucide-react export 이름. "Sprout" 는 프로젝트 커스텀 IrangSprout 로 매핑한다. */
  iconName: string;
}

export interface NavGroup {
  id: string;
  label: string;
  /**
   * 이 그룹이 활성으로 판정되는 경로 뿌리.
   * 그룹 간 prefix 가 겹치면(예: "/regions" vs "/regions/compare")
   * **가장 긴 매칭 basePath 를 가진 그룹 하나만** 활성이다. resolveActiveGroupId 참조.
   */
  basePaths: string[];
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "explore",
    label: "탐색",
    basePaths: ["/regions", "/crops", "/interviews"],
    items: [
      { href: "/regions", label: "지역 탐색", desc: "시·도별 기후·인구·작물 정보", iconName: "MapPin" },
      { href: "/crops", label: "작물 정보", desc: "재배 난이도·수익성·적합 기후", iconName: "Sprout" },
      { href: "/regions/centers", label: "지자체 센터", desc: "시·도 귀농귀촌지원센터 안내", iconName: "Building2" },
      { href: "/interviews", label: "정착 이야기", desc: "실제 정착 인터뷰", iconName: "Users" },
    ],
  },
  {
    id: "compare",
    label: "비교·진단",
    basePaths: [
      "/regions/compare",
      "/regions/ranking",
      "/crops/compare",
      "/guide/track-compare",
      "/match",
      "/assess",
    ],
    items: [
      { href: "/regions/compare", label: "지역 비교", desc: "최대 3개 지역 비교 분석", iconName: "GitCompareArrows" },
      { href: "/regions/ranking", label: "시군구 순위", desc: "5차원·정착 스타일로 줄세우기", iconName: "Trophy" },
      { href: "/crops/compare", label: "작물 비교", desc: "최대 3종 작물 비교", iconName: "GitCompareArrows" },
      { href: "/guide/track-compare", label: "귀농·귀산촌 비교", desc: "추진체계를 한눈에 비교", iconName: "GitCompareArrows" },
      { href: "/match", label: "유형 진단", desc: "5분 진단으로 내 정착 유형 확인", iconName: "Compass" },
    ],
  },
  {
    id: "prepare",
    label: "준비",
    basePaths: ["/guide", "/guides", "/costs", "/education/therapy"],
    items: [
      { href: "/guide", label: "정착 로드맵", desc: "5단계 정착 준비 가이드", iconName: "Route" },
      { href: "/guides", label: "주제별 가이드", desc: "50대·1인·실패 사례 등 상황별", iconName: "BookOpen" },
      { href: "/guide/shelter", label: "농촌체류형 쉼터", desc: "33㎡ 임시 주거 설치 가이드", iconName: "Home" },
      { href: "/costs", label: "비용 가이드", desc: "연령·작물별 비용 분석 & 지원금", iconName: "Wallet" },
      { href: "/education/therapy", label: "치유·사회적 농업", desc: "다른 농촌 정착 모델 가이드", iconName: "Heart" },
    ],
  },
  {
    id: "apply",
    label: "신청",
    basePaths: ["/programs", "/education", "/events"],
    items: [
      { href: "/programs", label: "지원사업", desc: "귀농·귀촌 지원금 & 정책", iconName: "FileText" },
      { href: "/programs/roadmap", label: "정부사업 가이드", desc: "5대 사업 신청 절차 안내", iconName: "FileCheck" },
      { href: "/education", label: "교육 프로그램", desc: "온·오프라인 정착 교육", iconName: "GraduationCap" },
      { href: "/events", label: "체험·행사", desc: "현장 체험 & 박람회 일정", iconName: "CalendarDays" },
    ],
  },
  {
    id: "reference",
    label: "참고자료",
    basePaths: ["/stats", "/glossary", "/about"],
    items: [
      { href: "/stats", label: "통계", desc: "정착 인구·청년·만족도 추이", iconName: "BarChart3" },
      { href: "/glossary", label: "농업 용어집", desc: "처음 만나는 농업 용어 해설", iconName: "BookOpen" },
      { href: "/about", label: "서비스 소개", desc: "이랑은 이런 팀이 만들어요", iconName: "Info" },
    ],
  },
];

/** 그룹 구분 없는 평면 목록 — href 조회·전수 검증용 */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/**
 * GNB 에는 없지만 "더보기" 축에 속하는 경로.
 * "/assess" 는 항상 /match 로 redirect 되므로 실제로 매칭될 일은 없지만,
 * redirect 가 걷힐 때를 대비해 재편 전 목록 그대로 유지한다.
 */
export const EXTRA_MORE_PATHS = ["/more", "/search", "/assess"];

/** 경로가 뿌리(base) 아래에 있는가 — 세그먼트 단위 비교("/guides" 는 "/guide" 아래가 아니다) */
function isUnder(pathname: string, base: string): boolean {
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(base + "/");
}

/**
 * 현재 경로가 속한 그룹 id — 겹치는 basePath 중 **가장 긴 것** 하나만 이긴다.
 * 예: /regions/compare → "compare"(탐색의 /regions 가 아니라), /education/therapy → "prepare".
 */
export function resolveActiveGroupId(pathname: string): string | null {
  let bestId: string | null = null;
  let bestLength = -1;
  for (const group of NAV_GROUPS) {
    for (const base of group.basePaths) {
      if (isUnder(pathname, base) && base.length > bestLength) {
        bestLength = base.length;
        bestId = group.id;
      }
    }
  }
  return bestId;
}

/**
 * 드롭다운 항목 활성 판정 — 그룹 경계와 무관하게 **전체 항목** 중 가장 구체적인 href 하나만 활성.
 * 예: /regions/compare 에서 탐색의 "/regions" 는 활성이 아니다.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (!isUnder(pathname, href)) return false;
  return !NAV_ITEMS.some(
    (other) =>
      other.href !== href &&
      other.href.length > href.length &&
      isUnder(pathname, other.href),
  );
}

/**
 * 하단 탭 "전체(더보기)" 가 활성으로 표시될 경로 목록.
 * 전체 메뉴 항목 + 부속 경로에서 탭이 이미 담당하는 축을 빼고, 상위 경로에 흡수되는 하위 경로를 접는다.
 */
export function deriveMorePaths(tabHrefs: string[]): string[] {
  const candidates = [
    ...EXTRA_MORE_PATHS,
    ...NAV_ITEMS.map((item) => item.href),
  ].filter((href) => !tabHrefs.some((tab) => isUnder(href, tab)));

  const unique = [...new Set(candidates)].sort(
    (a, b) => a.length - b.length || a.localeCompare(b),
  );

  const result: string[] = [];
  for (const href of unique) {
    if (result.some((kept) => isUnder(href, kept))) continue;
    result.push(href);
  }
  return result;
}
