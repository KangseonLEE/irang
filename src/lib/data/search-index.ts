/**
 * 통합 검색 인덱스
 * - 사이트 내 존재하는 모든 데이터를 단일 검색 인덱스로 통합
 * - 클라이언트 사이드 fuzzy-ish 검색 (debounce + prefix match)
 *
 * 번들 최적화:
 * - POPULAR_TAGS는 search-tags.ts에서 re-export (경량 파일)
 * - SEARCH_INDEX 빌드를 lazy initialization으로 지연하여
 *   첫 검색 호출 시에만 데이터 참조 → 모듈 그래프는 유지하되 실행 비용 절감
 */

import { STATIONS } from "./stations";
import { SIGUNGUS, getSigunguById } from "./sigungus";
import { GUS } from "./gus";
import { getProvinceById, PROVINCES } from "./regions";
import { CROPS } from "./crops";
import { PROGRAMS } from "./programs";
import { EDUCATION_COURSES } from "./education";
import { EVENTS } from "./events";
import { CENTERS } from "./centers";
import { interviews } from "./landing";
import { GLOSSARY_ENTRIES } from "./glossary";
import { GOV_PROGRAMS } from "./gov-roadmap";
import { THERAPY_TRACKS } from "./therapy";
import { TRACKS } from "./track-compare";
import { LAND_TYPES, ZONING_TYPES, EXTERNAL_LAND_SERVICES } from "./land";
import { PLAN_STEPS } from "./plan";
import { GUIDE_STEP_SUMMARIES } from "./guide-steps";
import { SEARCH_FAQS, type FaqAction } from "./search-faq";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchItemType =
  | "region"
  | "crop"
  | "program"
  | "education"
  | "event"
  | "guide"
  | "center"
  | "interview"
  | "glossary"
  | "land";

export interface SearchItem {
  type: SearchItemType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  icon: string;
  badge?: string;
  /** true이면 외부 링크 — target="_blank" + 외부 링크 표시 */
  external?: boolean;
}

// Re-export from search-tags for backward compatibility
export { POPULAR_TAGS, type SearchTag } from "./search-tags";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 문자열을 maxLen 이하로 잘라서 말줄임표 붙이기 */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

// ---------------------------------------------------------------------------
// Lazy index — 첫 검색 호출 시에만 빌드
// ---------------------------------------------------------------------------

let _searchIndex: SearchItem[] | null = null;

function getSearchIndex(): SearchItem[] {
  if (_searchIndex) return _searchIndex;

  // ── 지역 (기상 관측소) ──
  const regionItems: SearchItem[] = STATIONS.map((s) => ({
    type: "region" as const,
    id: s.stnId,
    title: s.name,
    subtitle: truncate(`${s.province} · ${s.description}`, 40),
    href: `/regions?stations=${s.stnId}`,
    keywords: [s.province],
    icon: "\u{1F4CD}", // 📍
  }));

  // ── 지역 (시군구) ──
  const sigunguItems: SearchItem[] = SIGUNGUS.map((sg) => {
    const province = getProvinceById(sg.sidoId);
    const provinceName = province?.name ?? "";
    return {
      type: "region" as const,
      id: `${sg.sidoId}-${sg.id}`,
      title: sg.name,
      subtitle: truncate(`${provinceName} · ${sg.description}`, 45),
      href: `/regions/${sg.sidoId}/${sg.id}`,
      keywords: [sg.shortName, provinceName, ...sg.mainCrops, ...sg.highlights],
      icon: "\u{1F3E1}", // 🏡
    };
  });

  // ── 지역 (구) ──
  const guItems: SearchItem[] = GUS.map((g) => {
    const province = getProvinceById(g.sidoId);
    const provinceName = province?.name ?? "";
    const sigungu = getSigunguById(g.parentSigunguId);
    const sigunguName = sigungu?.name ?? "";
    return {
      type: "region" as const,
      id: `${g.sidoId}-${g.parentSigunguId}-${g.id}`,
      title: `${sigunguName} ${g.name}`,
      subtitle: truncate(`${provinceName} · ${g.description}`, 45),
      href: `/regions/${g.sidoId}/${g.parentSigunguId}/${g.id}`,
      keywords: [g.shortName, sigunguName, provinceName, ...g.mainCrops, ...g.highlights],
      icon: "\u{1F3E1}", // 🏡
    };
  });

  // ── 작물 ──
  const cropItems: SearchItem[] = CROPS.map((c) => ({
    type: "crop" as const,
    id: c.id,
    title: c.name,
    subtitle: truncate(c.description, 50),
    href: `/crops/${c.id}`,
    keywords: [c.category, c.difficulty],
    icon: c.emoji,
    badge: c.category,
  }));

  // ── 지원사업 (모집중 + 모집예정만 — 마감 항목 제외) ──
  const programItems: SearchItem[] = PROGRAMS
    .filter((p) => p.status !== "마감")
    .map((p) => ({
      type: "program" as const,
      id: p.id,
      title: p.title,
      subtitle: truncate(p.summary, 50),
      href: `/programs/${p.id}`,
      keywords: [p.region, p.supportType, ...p.relatedCrops],
      icon: "\u{1F4CB}", // 📋
      badge: p.status,
    }));

  // ── 교육 ──
  const educationItems: SearchItem[] = EDUCATION_COURSES.map((e) => ({
    type: "education" as const,
    id: e.id,
    title: e.title,
    subtitle: truncate(e.description, 50),
    href: `/education/${e.id}`,
    keywords: [e.region, e.type, e.level, e.organization],
    icon: "\u{1F393}", // 🎓
    badge: e.status,
  }));

  // ── 체험·행사 ──
  const eventItems: SearchItem[] = EVENTS.map((e) => ({
    type: "event" as const,
    id: e.id,
    title: e.title,
    subtitle: truncate(e.description, 50),
    href: `/events/${e.id}`,
    keywords: [e.region, e.type, e.organization, e.target],
    icon: "\u{1F389}", // 🎉
    badge: e.status,
  }));

  // ── 지자체 센터 ──
  const centerItems: SearchItem[] = CENTERS.map((c) => ({
    type: "center" as const,
    id: c.id,
    title: c.name,
    subtitle: truncate(
      [c.sido, c.sigungu, c.phone].filter(Boolean).join(" · "),
      50,
    ),
    href: `/regions/centers?q=${encodeURIComponent(c.sigungu ?? c.sido)}`,
    keywords: [
      c.sido,
      c.sigungu ?? "",
      c.sidoSlug,
      c.sigunguSlug ?? "",
      "센터",
      "귀농귀촌",
      "상담",
      c.phone ?? "",
    ].filter(Boolean),
    icon: "\u{1F3DB}\u{FE0F}", // 🏛️
    badge: c.category === "sido" ? "광역" : "시·군",
  }));

  // ── 인터뷰 ──
  const interviewItems: SearchItem[] = interviews.map((iv) => ({
    type: "interview" as const,
    id: iv.id,
    title: `${iv.name} — ${iv.crop}`,
    subtitle: truncate(iv.quote, 50),
    href: `/interviews/${iv.id}`,
    keywords: [
      iv.name,
      iv.region,
      iv.crop,
      iv.prevJob,
      iv.currentJob,
      "인터뷰",
      "귀농인",
      "이야기",
    ],
    icon: "\u{1F464}", // 👤
  }));

  // ── 용어집 ──
  const glossaryCategoryKo: Record<string, string> = {
    cultivation: "재배",
    soil: "토양·비료",
    pest: "병해충",
    certification: "제도·인증",
    economy: "경영",
    unit: "단위",
    settlement: "귀농귀촌",
  };
  const glossaryItems: SearchItem[] = GLOSSARY_ENTRIES.map((g) => ({
    type: "glossary" as const,
    id: g.slug,
    title: g.term,
    subtitle: truncate(g.shortDesc, 50),
    href: `/glossary#${g.slug}`,
    keywords: [
      ...(g.aliases ?? []),
      g.category,
      ...(g.related ?? []),
      "용어",
      "뜻",
    ],
    icon: "\u{1F4D6}", // 📖
    badge: glossaryCategoryKo[g.category] ?? g.category,
  }));

  // ── 정부사업 로드맵 (4대 사업) ──
  const govProgramItems: SearchItem[] = GOV_PROGRAMS.map((gp) => ({
    type: "guide" as const,
    id: `gov-${gp.id}`,
    title: gp.name,
    subtitle: truncate(gp.summary, 50),
    href: `/programs/roadmap#${gp.id}`,
    keywords: [
      gp.shortName,
      gp.agency,
      gp.supportType,
      gp.targetAudience,
      "정부사업",
      "보조금",
      "융자",
      "신청",
      "절차",
    ],
    icon: "\u{1F3DB}\u{FE0F}", // 🏛️
  }));

  // ── 치유·사회적 농업 ──
  const therapyItems: SearchItem[] = THERAPY_TRACKS.map((t) => ({
    type: "guide" as const,
    id: `therapy-${t.id}`,
    title: t.title,
    subtitle: truncate(t.subtitle, 50),
    href: `/education/therapy#${t.id}`,
    keywords: ["치유", "사회적농업", "치유농업", "치유농장", "자격증"],
    icon: "\u{2764}\u{FE0F}", // ❤️
  }));

  // ── 귀농·귀산촌 비교 트랙 ──
  const trackItems: SearchItem[] = TRACKS.map((t) => ({
    type: "guide" as const,
    id: `track-${t.id}`,
    title: t.name,
    subtitle: truncate(`${t.shortName} · ${t.agency}`, 50),
    href: "/guide/track-compare",
    keywords: [
      "귀농",
      "귀산촌",
      "비교",
      "영농",
      "임업",
      t.agency,
      t.shortName,
    ],
    icon: "\u{1F500}", // 🔀
  }));

  // ── 농지 유형 ──
  const landItems: SearchItem[] = LAND_TYPES.map((l) => ({
    type: "land" as const,
    id: `land-${l.id}`,
    title: l.name,
    subtitle: truncate(l.description, 50),
    href: `/guide#step-4`,
    keywords: [
      l.shortName,
      l.farmingRelevance,
      "농지",
      "토지",
      "지목",
      "땅",
    ],
    icon: l.icon,
  }));

  // ── 용도지역 ──
  const zoningItems: SearchItem[] = ZONING_TYPES.map((z) => ({
    type: "land" as const,
    id: `zoning-${z.id}`,
    title: z.name,
    subtitle: truncate(z.farmingDescription, 50),
    href: `/guide#step-4`,
    keywords: ["용도지역", "건축", "토지이용", "농지", z.buildingEase],
    icon: "\u{1F3D7}\u{FE0F}", // 🏗️
  }));

  // ── 농지 관련 외부 서비스 ──
  const landServiceItems: SearchItem[] = EXTERNAL_LAND_SERVICES.map((ls, i) => ({
    type: "land" as const,
    id: `land-svc-${i}`,
    title: ls.name,
    subtitle: truncate(ls.description, 50),
    href: ls.url,
    keywords: ["농지", "토지", "부동산", "매물"],
    icon: ls.icon,
    external: true,
  }));

  // ── 귀농 5단계 로드맵 (각 단계) ──
  const guideStepItems: SearchItem[] = GUIDE_STEP_SUMMARIES.map((gs) => ({
    type: "guide" as const,
    id: `step-${gs.step}`,
    title: `${gs.step}단계: ${gs.title}`,
    subtitle: truncate(`${gs.period} · ${gs.cost.amount}`, 50),
    href: `/guide#step-${gs.step}`,
    keywords: [
      gs.title,
      "로드맵",
      "단계",
      "가이드",
      "준비",
    ],
    icon: "\u{1F4CB}", // 📋
  }));

  // ── 실행 계획 (plan steps) ──
  const planItems: SearchItem[] = PLAN_STEPS.map((ps) => ({
    type: "guide" as const,
    id: `plan-${ps.id}`,
    title: `${ps.step}단계: ${ps.title}`,
    subtitle: truncate(ps.description, 50),
    href: `/guide#step-${Math.min(ps.step, 5)}`,
    keywords: [
      "실행계획",
      "체크리스트",
      ps.shortTitle,
      ...ps.checklist.map((c) => c.label),
    ].slice(0, 10),
    icon: "\u{2705}", // ✅
  }));

  // ── 정적 가이드 페이지 ──
  const staticGuideItems: SearchItem[] = [
    {
      type: "guide",
      id: "costs",
      title: "귀농 비용 가이드",
      subtitle: "연령·작물별 초기 투자금 분석 & 지원금",
      href: "/costs",
      keywords: ["비용", "투자금", "자금", "돈", "얼마", "예산", "생활비", "주거비", "영농비", "절감", "시뮬레이션"],
      icon: "\u{1F4B0}", // 💰
    },
    {
      type: "guide",
      id: "gov-roadmap-page",
      title: "정부사업 진입 가이드",
      subtitle: "4대 핵심 정부사업 신청 절차 안내",
      href: "/programs/roadmap",
      keywords: ["정부사업", "신청", "절차", "자격", "서류", "보조금", "융자", "청년창업농", "농지은행", "귀산촌", "로드맵"],
      icon: "\u{1F3DB}\u{FE0F}", // 🏛️
    },
    {
      type: "guide",
      id: "guide-5step",
      title: "귀농 5단계 로드맵",
      subtitle: "준비부터 정착까지 체크리스트 가이드",
      href: "/guide",
      keywords: ["가이드", "로드맵", "5단계", "준비", "프로세스", "체크리스트", "순서", "과정", "절차", "정보탐색", "교육이수", "지역선정", "영농시작", "정착"],
      icon: "\u{1F4CB}", // 📋
    },
    {
      type: "guide",
      id: "stats-population",
      title: "귀농·귀촌 인구 통계",
      subtitle: "10년 추이 데이터 & 원인 분석",
      href: "/stats/population",
      keywords: ["통계", "인구", "추이", "트렌드", "데이터", "현황", "몇명", "증가", "감소"],
      icon: "\u{1F4CA}", // 📊
    },
    {
      type: "guide",
      id: "stats-satisfaction",
      title: "귀농 만족도 통계",
      subtitle: "귀농인 생활 만족도 조사 결과",
      href: "/stats/satisfaction",
      keywords: ["만족도", "만족", "통계", "조사", "생활", "후회"],
      icon: "\u{1F4CA}", // 📊
    },
    {
      type: "guide",
      id: "stats-youth",
      title: "청년 귀농 통계",
      subtitle: "청년층 귀농 현황 & 지원 정책",
      href: "/stats/youth",
      keywords: ["청년", "청년귀농", "통계", "MZ", "20대", "30대"],
      icon: "\u{1F4CA}", // 📊
    },
    {
      type: "guide",
      id: "glossary-page",
      title: "농업 용어집",
      subtitle: "처음 만나는 농업 용어 해설",
      href: "/glossary",
      keywords: ["용어", "사전", "뜻", "의미", "설명", "농업용어", "재배", "토양", "비료", "병해충"],
      icon: "\u{1F4D6}", // 📖
    },
    {
      type: "guide",
      id: "match",
      title: "귀농 적합도 진단",
      subtitle: "나에게 맞는 귀농 지역 · 작물 추천",
      href: "/match",
      keywords: ["진단", "유형", "테스트", "추천", "맞춤", "적합", "나에게맞는", "어디", "뭐가좋을까"],
      icon: "\u{1F50D}", // 🔍
    },
    {
      type: "guide",
      id: "assess",
      title: "귀농 적합도 진단",
      subtitle: "10문항으로 확인하는 나의 귀농 준비도",
      href: "/assess",
      keywords: ["적합도", "진단", "테스트", "준비도", "체크", "평가", "점수"],
      icon: "\u{1F4DD}", // 📝
    },
    {
      type: "guide",
      id: "shelter",
      title: "농촌체류형 쉼터",
      subtitle: "33㎡ 임시 주거 설치 가이드",
      href: "/guide/shelter",
      keywords: ["쉼터", "체류형", "주거", "임시주거", "농막", "숙소", "집", "주택", "33"],
      icon: "\u{1F3E0}", // 🏠
    },
    {
      type: "guide",
      id: "track-compare-page",
      title: "귀농·귀산촌 비교",
      subtitle: "영농 vs 임업 추진체계 비교",
      href: "/guide/track-compare",
      keywords: ["귀농", "귀산촌", "비교", "영농", "임업", "차이", "산림"],
      icon: "\u{1F500}", // 🔀
    },
    {
      type: "guide",
      id: "centers-page",
      title: "지자체 귀농지원센터",
      subtitle: "전국 광역·시·군 센터 연락처 안내",
      href: "/regions/centers",
      keywords: ["센터", "지자체", "상담", "연락처", "전화", "귀농귀촌지원센터"],
      icon: "\u{1F3DB}\u{FE0F}", // 🏛️
    },
    {
      type: "guide",
      id: "regions-compare",
      title: "지역 비교",
      subtitle: "최대 3개 지역 비교 분석",
      href: "/regions/compare",
      keywords: ["비교", "지역비교", "기후", "인구", "의료", "학교"],
      icon: "\u{1F4CA}", // 📊
    },
    {
      type: "guide",
      id: "crops-compare",
      title: "작물 비교",
      subtitle: "최대 3종 작물 비교",
      href: "/crops/compare",
      keywords: ["비교", "작물비교", "수익", "난이도"],
      icon: "\u{1F33F}", // 🌿
    },
    // ── 기획 기사형 가이드 (guides/*) ──
    {
      type: "guide",
      id: "guides-preparation",
      title: "귀농 준비 순서",
      subtitle: "5단계 체크리스트로 정리하는 준비 순서",
      href: "/guides/preparation",
      keywords: ["준비", "순서", "체크리스트", "시작", "처음", "입문"],
      icon: "\u{1F4CB}", // 📋
    },
    {
      type: "guide",
      id: "guides-beginner-crops",
      title: "초보 추천 작물 TOP 5",
      subtitle: "난이도 낮은 작물로 시작하기",
      href: "/guides/beginner-crops",
      keywords: ["초보", "추천", "작물", "쉬운", "입문", "난이도", "TOP5"],
      icon: "\u{1F331}", // 🌱
    },
    {
      type: "guide",
      id: "guides-budget-50s",
      title: "50대 귀농 자본 가이드",
      subtitle: "현실적인 비용 설계와 절감 전략",
      href: "/guides/budget-50s",
      keywords: ["50대", "자본", "비용", "예산", "시니어", "은퇴", "노후"],
      icon: "\u{1F4B0}", // 💰
    },
    {
      type: "guide",
      id: "guides-failure-cases",
      title: "귀농 실패 사례",
      subtitle: "실패에서 배우는 준비의 핵심",
      href: "/guides/failure-cases",
      keywords: ["실패", "사례", "주의", "실수", "함정", "위험", "후회"],
      icon: "\u{26A0}\u{FE0F}", // ⚠️
    },
    {
      type: "guide",
      id: "guides-solo-farming",
      title: "1인 귀농 가이드",
      subtitle: "혼자서도 가능한 귀농 전략",
      href: "/guides/solo-farming",
      keywords: ["1인", "혼자", "솔로", "독립", "단독", "싱글"],
      icon: "\u{1F464}", // 👤
    },
    {
      type: "guide",
      id: "education-therapy-page",
      title: "치유·사회적 농업",
      subtitle: "다른 귀농 모델 탐색",
      href: "/education/therapy",
      keywords: ["치유", "치유농업", "사회적농업", "치유농장", "자격증", "힐링"],
      icon: "\u{2764}\u{FE0F}", // ❤️
    },
    {
      type: "guide",
      id: "interviews-page",
      title: "귀농인 이야기",
      subtitle: "실제 귀농인 인터뷰 모음",
      href: "/interviews",
      keywords: ["인터뷰", "이야기", "사례", "경험", "후기", "선배"],
      icon: "\u{1F4AC}", // 💬
    },
  ];

  _searchIndex = [
    ...regionItems,
    ...sigunguItems,
    ...guItems,
    ...cropItems,
    ...programItems,
    ...educationItems,
    ...eventItems,
    ...centerItems,
    ...interviewItems,
    ...glossaryItems,
    ...govProgramItems,
    ...therapyItems,
    ...trackItems,
    ...landItems,
    ...zoningItems,
    ...landServiceItems,
    ...guideStepItems,
    ...planItems,
    ...staticGuideItems,
  ];

  return _searchIndex;
}

// ---------------------------------------------------------------------------
// 동의어 사전 (Synonym Dictionary)
// ---------------------------------------------------------------------------

/**
 * 사용자가 입력할 수 있는 다양한 표현을 정규화된 검색어로 매핑합니다.
 * key: 사용자 입력 (축약어, 구어체, 유의어)
 * value: 실제 검색에 사용할 정규화된 검색어 배열
 */
const SYNONYMS: Record<string, string[]> = {
  // ── 지역 약칭 / 별칭 ──
  "경기": ["경기도"],
  "강원": ["강원특별자치도", "강원도"],
  "충북": ["충청북도"],
  "충남": ["충청남도"],
  "전북": ["전라북도", "전북특별자치도"],
  "전남": ["전라남도"],
  "경북": ["경상북도"],
  "경남": ["경상남도"],
  "제주": ["제주특별자치도"],

  // ── 작물 관련 ──
  "사과": ["사과"],
  "딸기": ["딸기"],
  "고추": ["고추"],
  "벼": ["쌀", "벼"],
  "쌀": ["쌀", "벼", "식량"],
  "감자": ["감자", "식량"],
  "포도": ["포도", "과수"],
  "감귤": ["감귤", "귤"],
  "귤": ["감귤", "귤"],
  "인삼": ["인삼", "특용"],
  "녹차": ["녹차", "특용"],
  "약초": ["약용작물", "특용"],

  // ── 구어체 / 의도 기반 ──
  "보조금": ["지원", "보조금", "융자", "지원금"],
  "지원금": ["지원", "보조금", "지원금"],
  "돈": ["비용", "자금", "투자금", "예산"],
  "얼마": ["비용", "자금", "투자금"],
  "시작": ["준비", "로드맵", "가이드"],
  "처음": ["초보", "경험 없음", "가이드", "준비"],
  "초보": ["초보", "쉬움", "경험 없음"],
  "입문": ["초보", "가이드", "교육"],
  "배우고": ["교육", "학습", "과정"],
  "배우기": ["교육", "학습", "과정"],
  "교육": ["교육", "학습", "과정"],
  "신청": ["신청", "접수", "모집"],
  "접수": ["신청", "접수", "모집"],

  // ── 카테고리 매핑 ──
  "채소류": ["채소"],
  "과일": ["과수"],
  "과일류": ["과수"],
  "특작": ["특용"],
  "특용작물": ["특용"],
  "식량작물": ["식량"],

  // ── 스마트팜 관련 ──
  "스마트팜": ["스마트팜", "ICT", "기술"],
  "ict": ["스마트팜", "ICT", "기술"],
  "기술농업": ["스마트팜", "ICT"],

  // ── 정책/제도 ──
  "청년농": ["청년", "청년농업인"],
  "청년농업": ["청년", "청년농업인", "청년창업농"],
  "창업": ["청년창업농", "창업"],
  "농지": ["농지", "농지은행", "토지", "땅"],
  "귀촌": ["귀촌", "귀농"],
  "전원": ["귀촌", "전원생활"],
  "은퇴": ["귀촌", "전원생활", "시니어"],
  "땅": ["농지", "토지", "땅", "지목"],
  "집": ["주택", "주거", "쉼터", "농막"],
  "주택": ["주택", "주거", "쉼터"],
  "농막": ["농막", "쉼터", "체류형", "임시주거"],

  // ── 센터/상담 ──
  "상담": ["상담", "센터", "지원센터"],
  "센터": ["센터", "귀농귀촌", "지원센터"],
  "전화": ["전화", "연락처", "상담"],

  // ── 인터뷰/후기 ──
  "후기": ["인터뷰", "이야기", "후기", "경험"],
  "경험": ["인터뷰", "이야기", "경험", "사례"],
  "선배": ["인터뷰", "귀농인"],

  // ── 용어 ──
  "용어": ["용어", "뜻", "사전"],
  "뜻": ["용어", "뜻", "의미"],

  // ── 실패/위험 ──
  "실패": ["실패", "주의", "위험", "사례"],
  "후회": ["후회", "실패", "만족도"],
  "주의": ["주의", "실패", "위험"],
};

/**
 * 검색어를 동의어 사전을 사용해 확장합니다.
 * 원래 검색어 + 동의어 배열을 합쳐 반환합니다.
 */
function expandWithSynonyms(term: string): string[] {
  const synonyms = SYNONYMS[term];
  if (synonyms) {
    return [term, ...synonyms];
  }
  return [term];
}

// ---------------------------------------------------------------------------
// 기본 형태소 처리 (Basic Morpheme Processing)
// ---------------------------------------------------------------------------

/** 한국어 조사/어미 패턴 (가장 흔한 것들) */
const KOREAN_SUFFIXES = /(?:은|는|이|가|을|를|에|의|로|으로|에서|도|만|부터|까지|랑|하고|와|과|이랑)$/;

/** 검색어에서 한국어 조사를 제거하여 어간을 추출 */
function removeKoreanSuffix(term: string): string {
  if (term.length <= 1) return term;
  const stripped = term.replace(KOREAN_SUFFIXES, "");
  // 어간이 너무 짧아지면 원래 term 유지
  return stripped.length >= 1 ? stripped : term;
}

// ---------------------------------------------------------------------------
// Relevance scoring
// ---------------------------------------------------------------------------

/** 타입별 가중치 — 가이드/지역은 일반 검색에서 우선 노출 */
const TYPE_WEIGHT: Record<SearchItemType, number> = {
  guide: 1.2,
  region: 1.1,
  crop: 1.0,
  program: 1.0,
  center: 1.0,
  interview: 0.95,
  education: 0.95,
  event: 0.9,
  glossary: 0.85,
  land: 0.9,
};

/**
 * 단일 검색어에 대한 개별 항목의 관련도 점수 산출.
 *
 * | 우선순위 | 매칭 유형            | 점수 |
 * |---------|---------------------|------|
 * | 1       | 제목 완전 일치        | 100  |
 * | 2       | 제목이 검색어로 시작   | 80   |
 * | 3       | 제목에 검색어 포함     | 60   |
 * | 4       | 배지(카테고리) 일치    | 40   |
 * | 5       | 키워드 완전 일치       | 35   |
 * | 6       | 키워드 부분 일치       | 25   |
 * | 7       | 부제목에 검색어 포함   | 15   |
 *
 * 동의어 확장: 원본 term 외에 동의어로도 매칭 시도, 최고 점수 사용
 * 타입 가중치: guide/region 타입에 약간의 부스트
 */
function scoreItem(item: SearchItem, term: string): number {
  // 동의어 확장 + 형태소 처리
  const stemmed = removeKoreanSuffix(term);
  const expandedTerms = new Set([
    ...expandWithSynonyms(term),
    ...(stemmed !== term ? expandWithSynonyms(stemmed) : []),
  ]);

  let bestScore = 0;

  for (const t of expandedTerms) {
    const score = scoreItemRaw(item, t);
    if (score > bestScore) bestScore = score;
  }

  // 타입 가중치 적용
  return Math.round(bestScore * (TYPE_WEIGHT[item.type] ?? 1.0));
}

/** 순수 매칭 점수 (가중치 없이) */
function scoreItemRaw(item: SearchItem, term: string): number {
  const t = item.title.toLowerCase();

  if (t === term) return 100;
  if (t.startsWith(term)) return 80;
  if (t.includes(term)) return 60;
  if (item.badge?.toLowerCase().includes(term)) return 40;
  if (item.keywords.some((kw) => kw.toLowerCase() === term)) return 35;
  if (item.keywords.some((kw) => kw.toLowerCase().includes(term))) return 25;
  if (item.subtitle.toLowerCase().includes(term)) return 15;

  return 0;
}

/** 복합 쿼리 (여러 단어)용 — 각 단어별 최고 점수 합산 + 매칭 단어 수 보너스 */
function scoreItemMulti(item: SearchItem, terms: string[]): number {
  let total = 0;
  let matched = 0;
  for (const term of terms) {
    const s = scoreItem(item, term);
    if (s > 0) {
      total += s;
      matched++;
    }
  }
  // 여러 단어가 동시 매칭되면 보너스 (예: "전남 딸기" 둘 다 매칭 > 하나만)
  return matched > 0 ? total + matched * 10 : 0;
}

// ---------------------------------------------------------------------------
// Search function
// ---------------------------------------------------------------------------

/**
 * 검색 결과 중 제목이 쿼리와 정확히 일치하는 항목이 있는지 확인.
 * (대소문자 무시, 양쪽 공백 제거)
 */
export function hasExactMatch(query: string, results: SearchItem[]): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return false;
  return results.some((r) => r.title.toLowerCase() === q);
}

/**
 * 통합 검색 (드롭다운용) — 최대 10개 반환, 타입별 최대 3개.
 * 관련도 순으로 섹션 순서가 동적 결정됨.
 *   예: "사과" → 작물 섹션 먼저, "전남" → 지역 섹션 먼저
 */
export function searchItems(query: string): SearchItem[] {
  const all = searchAll(query);

  // 결과 순서에서 섹션 순서 도출 (가장 관련도 높은 타입이 먼저)
  const sectionOrder: SearchItemType[] = [];
  const seen = new Set<SearchItemType>();
  for (const item of all) {
    if (!seen.has(item.type)) {
      seen.add(item.type);
      sectionOrder.push(item.type);
    }
  }

  // 타입별 최대 3개 수집
  const byType: Partial<Record<SearchItemType, SearchItem[]>> = {};
  for (const item of all) {
    const arr = byType[item.type] ??= [];
    if (arr.length < 3) {
      arr.push(item);
    }
  }

  // 관련도 기반 섹션 순서로 결과 조합
  const results: SearchItem[] = [];
  for (const type of sectionOrder) {
    results.push(...(byType[type] ?? []));
  }

  return results.slice(0, 12);
}

/**
 * 통합 검색 (결과 페이지용) — 전체 매칭 결과, 관련도 내림차순 정렬.
 *
 * 복합 쿼리 지원:
 *   "전남 딸기" → "전남" OR "딸기" 로 분리, 관련도 합산 정렬
 */
export function searchAll(query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  // FAQ 매칭 — 질문형 쿼리를 FAQ 패턴과 비교하여 상위에 삽입
  const faqResults = matchFaqs(q);

  const index = getSearchIndex();

  if (terms.length === 1) {
    const term = terms[0];
    const results = index
      .map((item) => ({ item, score: scoreItem(item, term) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
    return [...faqResults, ...results];
  }

  // 복합 쿼리: OR 매칭 + 관련도 합산 정렬
  // 인텐트 감지 — region-crop 조합이면 합성 결과를 상위에 삽입
  const intent = detectIntent(q);

  const scored = index
    .map((item) => {
      let score = scoreItemMulti(item, terms);
      // region-crop 인텐트 보너스: 해당 작물 아이템의 키워드에 지역이 포함되면 +50
      if (intent.type === "region-crop" && score > 0) {
        if (
          item.type === "crop" &&
          item.title === intent.crop
        ) {
          score += 50;
        }
        if (
          item.type === "region" &&
          (item.title.includes(intent.region) ||
            item.keywords.some((kw) => kw.includes(intent.region)))
        ) {
          score += 30;
        }
      }
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  // region-crop 인텐트일 때 합성 결과 아이템을 최상위에 삽입
  if (intent.type === "region-crop") {
    const province = PROVINCES.find(
      (p) => p.shortName === intent.region || p.name === intent.region,
    );
    const crop = CROPS.find((c) => c.name === intent.crop);
    if (province && crop) {
      const syntheticItem: SearchItem = {
        type: "guide",
        id: `cross-${province.id}-${crop.id}`,
        title: `${intent.region}에서 ${intent.crop} 재배하기`,
        subtitle: `${province.name} × ${crop.name} — 지역·작물 교차 탐색`,
        href: `/regions/${province.id}`,
        keywords: [intent.region, intent.crop],
        icon: "\u{1F50D}", // 🔍
      };
      scored.unshift(syntheticItem);
    }
  }

  return [...faqResults, ...scored];
}

// ---------------------------------------------------------------------------
// Query Suggestions (인기 쿼리 자동완성)
// ---------------------------------------------------------------------------

const QUERY_SUGGESTIONS = [
  // 지역
  "전남 귀농", "경북 귀농", "충남 귀농", "제주 귀농", "강원 귀농",
  // 작물
  "사과 재배", "딸기 재배", "포도 재배", "고추 재배", "블루베리 재배",
  // 지원금
  "귀농 지원금", "청년 농업", "창업 자금", "주택 지원", "영농 정착금",
  // 교육
  "귀농 교육", "스마트팜 교육", "온라인 교육", "체험 행사",
  // 비용/절차
  "귀농 비용", "귀농 절차", "농지 구입", "귀농 준비",
  // 비교
  "지역 비교", "작물 비교", "작물 소득",
  // 생활
  "의료기관", "학교", "귀촌", "귀산촌",
  // 기타
  "인터뷰", "성공 사례", "실패 사례",
] as const;

/**
 * 입력 문자열에 매칭되는 인기 쿼리를 제안합니다.
 * - 2글자 이상일 때만 동작
 * - 시작 부분 매칭이 포함 매칭보다 우선
 * - 최대 maxResults개 반환 (기본 5)
 */
export function suggestQueries(
  partial: string,
  maxResults = 5,
): string[] {
  const p = partial.trim().toLowerCase();
  if (p.length < 2) return [];

  const startsWith: string[] = [];
  const includes: string[] = [];

  for (const suggestion of QUERY_SUGGESTIONS) {
    const lower = suggestion.toLowerCase();
    if (lower.startsWith(p)) {
      startsWith.push(suggestion);
    } else if (lower.includes(p)) {
      includes.push(suggestion);
    }
  }

  return [...startsWith, ...includes].slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// Cross-Entity Intent Detection (교차 인텐트 감지)
// ---------------------------------------------------------------------------

export type SearchIntent =
  | { type: "region-crop"; region: string; crop: string }
  | { type: "general" };

/**
 * 쿼리에서 지역+작물 조합 인텐트를 감지합니다.
 * 예: "전남 사과" → { type: "region-crop", region: "전남", crop: "사과" }
 */
export function detectIntent(query: string): SearchIntent {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { type: "general" };

  let detectedRegion: string | null = null;
  let detectedCrop: string | null = null;

  for (const word of words) {
    // 지역 매칭: shortName 또는 name
    if (!detectedRegion) {
      const province = PROVINCES.find(
        (p) =>
          p.shortName.toLowerCase() === word ||
          p.name.toLowerCase() === word,
      );
      if (province) {
        detectedRegion = province.shortName;
        continue;
      }
    }
    // 작물 매칭
    if (!detectedCrop) {
      const crop = CROPS.find((c) => c.name.toLowerCase() === word);
      if (crop) {
        detectedCrop = crop.name;
        continue;
      }
    }
  }

  if (detectedRegion && detectedCrop) {
    return { type: "region-crop", region: detectedRegion, crop: detectedCrop };
  }

  return { type: "general" };
}

// ---------------------------------------------------------------------------
// FAQ 매칭 — 자연어 질문형 쿼리 → 페이지 매핑
// ---------------------------------------------------------------------------

function matchFaqs(query: string): SearchItem[] {
  const q = query.toLowerCase();
  const results: SearchItem[] = [];

  for (const faq of SEARCH_FAQS) {
    const matched = faq.patterns.some((p) => q.includes(p.toLowerCase()))
      || faq.keywords.some((kw) => q.includes(kw.toLowerCase()));
    if (matched) {
      results.push({
        type: "guide",
        id: `faq-${faq.href}`,
        title: faq.title,
        subtitle: faq.description,
        href: faq.href,
        keywords: faq.keywords,
        icon: "\u{1F4A1}", // 💡
      });
    }
  }

  return results.slice(0, 3); // FAQ 결과는 최대 3개
}

// ---------------------------------------------------------------------------
// 답변 카드 — 자연어 질문에 대한 대화형 응답
// ---------------------------------------------------------------------------

export interface AnswerCard {
  answer: string;
  actions: FaqAction[];
  title: string;
}

/** 자연어 질문에 매칭되는 답변 카드를 반환. 없으면 null. */
export function matchAnswerCard(query: string): AnswerCard | null {
  if (!query || query.trim().length < 3) return null;

  const q = query.toLowerCase();

  for (const faq of SEARCH_FAQS) {
    if (!faq.answer || !faq.actions) continue;

    const matched = faq.patterns.some((p) => q.includes(p.toLowerCase()))
      || faq.keywords.some((kw) => q.includes(kw.toLowerCase()));

    if (matched) {
      return {
        answer: faq.answer,
        actions: faq.actions,
        title: faq.title,
      };
    }
  }

  return null;
}
