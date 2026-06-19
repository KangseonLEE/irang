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

import { getChosung, isChosungQuery, matchChosung } from "../chosung";
import { STATIONS } from "./stations";
import { SIGUNGUS, getSigunguById } from "./sigungus";
import { GUS } from "./gus";
import { getProvinceById, PROVINCES } from "./regions";
import { CROPS, CROP_DETAILS } from "./crops";
import { PROGRAMS } from "./programs";
import { deriveStatus } from "@/lib/program-status";
import { EDUCATION_COURSES } from "./education";
import { EVENTS } from "./events";
import { CENTERS } from "./centers";
import { interviews, hasFullStory } from "./landing";
import { GLOSSARY_ENTRIES } from "./glossary";
import { GOV_PROGRAMS } from "./gov-roadmap";
import { THERAPY_TRACKS } from "./therapy";
import { TRACKS } from "./track-compare";
import { LAND_TYPES, ZONING_TYPES, EXTERNAL_LAND_SERVICES } from "./land";
import { PLAN_STEPS } from "./plan";
import { GUIDE_STEP_SUMMARIES } from "./guide-steps";
import { SEARCH_FAQS } from "./search-faq";

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
    .map((p) => ({ ...p, status: deriveStatus(p.applicationStart, p.applicationEnd) }))
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
  // 본문 동의자는 내부 상세 페이지, 미동의자는 원문 기사 외부 링크
  const interviewItems: SearchItem[] = interviews.map((iv) => {
    const isInternal = hasFullStory(iv);
    return {
      type: "interview" as const,
      id: iv.id,
      title: `${iv.name} — ${iv.crop}`,
      subtitle: isInternal
        ? truncate(iv.quote, 50)
        : `${iv.sourceName} 원문 기사`,
      href: isInternal ? `/interviews/${iv.id}` : iv.sourceUrl,
      external: !isInternal,
      keywords: [
        iv.name,
        iv.region,
        iv.crop,
        iv.prevJob,
        iv.currentJob,
        iv.sourceName,
        "인터뷰",
        "정착자",
        "이야기",
      ],
      icon: "\u{1F464}", // 👤
    };
  });

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

  // ── 정부사업 로드맵 (5대 사업) ──
  const govProgramItems: SearchItem[] = GOV_PROGRAMS.map((gp) => ({
    type: "guide" as const,
    id: `gov-${gp.id}`,
    title: gp.name,
    subtitle: truncate(gp.summary, 50),
    href: `/programs/roadmap?tab=${gp.id}`,
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
      title: "정착 비용 가이드",
      subtitle: "연령·작물별 초기 투자금 분석 & 지원금",
      href: "/costs",
      keywords: ["비용", "투자금", "자금", "돈", "얼마", "예산", "생활비", "주거비", "영농비", "절감", "시뮬레이션"],
      icon: "\u{1F4B0}", // 💰
    },
    {
      type: "guide",
      id: "gov-roadmap-page",
      title: "정부사업 진입 가이드",
      subtitle: "5대 핵심 정부사업 신청 절차 안내",
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
      href: "/stats?tab=farming",
      keywords: ["통계", "인구", "추이", "트렌드", "데이터", "현황", "몇명", "증가", "감소"],
      icon: "\u{1F4CA}", // 📊
    },
    {
      type: "guide",
      id: "stats-satisfaction",
      title: "정착 만족도 통계",
      subtitle: "정착자 생활 만족도 조사 결과",
      href: "/stats?tab=farming",
      keywords: ["만족도", "만족", "통계", "조사", "생활", "후회"],
      icon: "\u{1F4CA}", // 📊
    },
    {
      type: "guide",
      id: "stats-youth",
      title: "청년 농촌 정착 통계",
      subtitle: "청년층 귀농 현황 & 지원 정책",
      href: "/stats?tab=youth",
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
      title: "농촌 정착 적합도 진단",
      subtitle: "나에게 맞는 농촌 정착 지역 · 작물 추천",
      href: "/match",
      keywords: ["진단", "유형", "테스트", "추천", "맞춤", "적합", "나에게맞는", "어디", "뭐가좋을까"],
      icon: "\u{1F50D}", // 🔍
    },
    {
      type: "guide",
      id: "assess",
      title: "농촌 정착 적합도 진단",
      subtitle: "10문항으로 확인하는 나의 정착 준비도",
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
      id: "regions-ranking",
      title: "차원별 점수 랭킹",
      subtitle: "전국 시군구를 5가지 차원으로 비교",
      href: "/regions/ranking",
      keywords: ["랭킹", "차원별", "비교", "농가", "의료", "학교", "귀농", "인구"],
      icon: "\u{1F3C6}", // 🏆
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
      title: "정착 준비 순서",
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
      title: "50대 정착 자본 가이드",
      subtitle: "현실적인 비용 설계와 절감 전략",
      href: "/guides/budget-50s",
      keywords: ["50대", "자본", "비용", "예산", "시니어", "은퇴", "노후"],
      icon: "\u{1F4B0}", // 💰
    },
    {
      type: "guide",
      id: "guides-failure-cases",
      title: "정착 실패 사례",
      subtitle: "실패에서 배우는 준비의 핵심",
      href: "/guides/failure-cases",
      keywords: ["실패", "사례", "주의", "실수", "함정", "위험", "후회"],
      icon: "\u{26A0}\u{FE0F}", // ⚠️
    },
    {
      type: "guide",
      id: "guides-solo-farming",
      title: "1인 농촌 정착 가이드",
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
      title: "정착 이야기",
      subtitle: "실제 정착 인터뷰 모음",
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
  "선배": ["인터뷰", "정착자"],

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
// 작물명 prefix 자동 공백 삽입 (Crop-name prefix splitter)
// ---------------------------------------------------------------------------
// 한국어 사용자는 "사과 재배지" / "사과재배지" 둘 다 자연스럽게 입력하지만
// tokenization은 공백 기반이라 후자는 "사과재배지" 단일 토큰으로 매칭이 좁아짐.
//   "사과 재배지" → 130건 (사과 OR 재배지)
//   "사과재배지"  → 3건   (substring 매칭만)
// CROPS 49종 prefix를 길이 내림차순 greedy로 검사하여 자동 분리.
// 조사(는/을/를/의 등)만 남는 경우는 removeKoreanSuffix가 처리하도록 skip.

const PARTICLE_ONLY = /^(?:은|는|이|가|을|를|에|의|로|으로|에서|도|만|부터|까지|랑|하고|와|과|이랑)$/;

const CROP_NAMES_BY_LENGTH_DESC: string[] = (() => {
  const names = CROPS.map((c) => c.name.toLowerCase());
  return Array.from(new Set(names)).sort((a, b) => b.length - a.length);
})();

/** 작물명 정확 매치 판별용 Set — prefix 자동 분리에서 정확 작물명은 제외 */
const CROP_NAME_SET = new Set(CROP_NAMES_BY_LENGTH_DESC);

/**
 * 테마 접두어 — "귀농교육"처럼 붙여 쓴 복합어를 "귀농 교육"으로 분리해
 * 복합 쿼리 OR 매칭을 타게 한다. (단일 토큰이면 교육 강좌 제목에 "귀농교육"
 * 연속 문자열이 없어 0점 매칭되던 사고. 6/19 회장 발견)
 * 길이 내림차순 — 긴 접두어 우선("스마트팜" before "귀농").
 */
const THEME_PREFIXES: string[] = ["스마트팜", "귀농", "귀촌", "농촌"].sort(
  (a, b) => b.length - a.length,
);

/**
 * 단일 term이 entity 정확명 매치 시 해당 카드를 hoist.
 *
 * 범위 (5/22 회장 결재 A안):
 *   - 작물 (CROPS.name)
 *   - 시도 (PROVINCES.shortName / PROVINCES.name) — 인덱스에 SearchItem 없어 동적 생성
 *   - 시군구·구 (인덱스 region.title)
 *   - 지원사업 (인덱스 program.title)
 *
 * 동음이의어("중구" 등)는 모두 hoist. seen Set으로 중복 제거.
 */
function findExactMatchHoists(
  term: string,
  index: SearchItem[],
): SearchItem[] {
  const out: SearchItem[] = [];
  const seen = new Set<string>();
  const push = (item: SearchItem) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  };

  // 시도 — shortName 또는 name 정확 매치. 동적 SearchItem 생성 (인덱스에 미포함).
  for (const prov of PROVINCES) {
    if (
      prov.shortName.toLowerCase() === term ||
      prov.name.toLowerCase() === term
    ) {
      push({
        type: "region",
        id: `province-${prov.id}`,
        title: prov.shortName,
        subtitle: `${prov.name} 종합 정보 — 시군구·기후·작물·정착 데이터`,
        href: `/regions/${prov.id}`,
        keywords: [prov.shortName, prov.name],
        icon: "\u{1F4CD}", // 📍
      });
    }
  }

  // 작물 — CROPS.name 정확 매치
  for (const item of index) {
    if (item.type === "crop" && item.title.toLowerCase() === term) {
      push(item);
    }
  }

  // 시군구·구 — 인덱스 region.title 정확 매치 (동음이의 다수 가능)
  for (const item of index) {
    if (item.type === "region" && item.title.toLowerCase() === term) {
      push(item);
    }
  }

  // 지원사업 — 인덱스 program.title 정확 매치
  for (const item of index) {
    if (item.type === "program" && item.title.toLowerCase() === term) {
      push(item);
    }
  }

  return out;
}

function injectCropPrefixSpace(q: string): string {
  if (q.length < 2 || /\s/.test(q)) return q;
  // q 자체가 정확한 작물명이면 분리 금지.
  //   "감귤"은 작물 "감"(감)으로 시작하므로 분리 규칙에 걸리면 "감 귤"이 되어
  //   단일어 정확 hoist 분기를 못 타고 복합 쿼리로 빠진다. (감귤 카드가 밀림)
  if (CROP_NAME_SET.has(q)) return q;
  for (const cropName of CROP_NAMES_BY_LENGTH_DESC) {
    if (q.length > cropName.length && q.startsWith(cropName)) {
      const rest = q.slice(cropName.length);
      // 조사 단독은 분리하지 않음 (예: "사과는" → removeKoreanSuffix가 처리)
      if (PARTICLE_ONLY.test(rest)) return q;
      return `${cropName} ${rest}`;
    }
  }
  // 테마 접두어 분리 — "귀농교육" → "귀농 교육". rest 2자 이상일 때만 분리해
  // "귀농인"(rest "인")·"귀촌살이"처럼 한 단어인 케이스 오분리를 막는다.
  for (const prefix of THEME_PREFIXES) {
    if (q.length > prefix.length && q.startsWith(prefix)) {
      const rest = q.slice(prefix.length);
      if (rest.length < 2 || PARTICLE_ONLY.test(rest)) return q;
      return `${prefix} ${rest}`;
    }
  }
  return q;
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
  // ── 초성 검색 분기 ──
  if (isChosungQuery(term)) {
    const score = scoreItemChosung(item, term);
    return Math.round(score * (TYPE_WEIGHT[item.type] ?? 1.0));
  }

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

/**
 * 초성 검색 전용 스코어링.
 * 제목 초성 완전 일치 → 100, 시작 일치 → 80, 포함 → 60,
 * 키워드 초성 매칭 → 35, 부제목 초성 매칭 → 15.
 */
function scoreItemChosung(item: SearchItem, chosungQuery: string): number {
  const titleChosung = getChosung(item.title);

  if (titleChosung === chosungQuery) return 100;
  if (titleChosung.startsWith(chosungQuery)) return 80;
  if (titleChosung.includes(chosungQuery)) return 60;
  // 초성 검색의 keyword/subtitle 매칭은 광범위 false positive 위험. 보수적으로 유지.
  if (item.keywords.some((kw) => matchChosung(kw, chosungQuery))) return 35;
  if (matchChosung(item.subtitle, chosungQuery)) return 15;

  return 0;
}

/**
 * 일반 단어(stopword) — keywords/subtitle 부분 매칭 시 노이즈 유발하는 흔한 용어.
 * 이 단어들이 검색어로 들어오면:
 *  - title 매칭(=, startsWith, includes)은 그대로 살림 (페이지 자체가 의미 있는 결과)
 *  - badge·keywords 완전 일치도 살림 (정확 매칭은 의미 있음)
 *  - keywords 부분 매칭(25) / subtitle 부분 매칭(15) 은 차단 (광범위 노이즈 제거)
 *
 * 검증: SIGUNGUS/CROPS 데이터 분석 결과 — 41~146건 등장
 *   "지역" 41건, "농업" 146건, "도시" 114건, "재배" 48건, "귀농" 29건, "체험" 24건
 */
const GENERIC_TERMS = new Set([
  "지역", "농업", "도시", "재배", "귀농", "체험",
  "정보", "찾기", "맞춤", "농촌", "교육", "지원",
]);

/** 순수 매칭 점수 (가중치 없이) */
function scoreItemRaw(item: SearchItem, term: string): number {
  const t = item.title.toLowerCase();
  const isGeneric = GENERIC_TERMS.has(term);

  if (t === term) return 100;
  if (t.startsWith(term)) return 80;
  if (t.includes(term)) return 60;
  if (item.badge?.toLowerCase().includes(term)) return 40;
  if (item.keywords.some((kw) => kw.toLowerCase() === term)) return 35;
  // GENERIC_TERMS는 keywords/subtitle 부분 매칭 차단 — 광범위 노이즈 제거
  if (isGeneric) return 0;
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
  const q0 = query.trim().toLowerCase();
  if (q0.length === 0) return [];
  // 작물명 prefix 자동 공백 — "사과재배지" → "사과 재배지"
  const q = injectCropPrefixSpace(q0);

  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  // 읍·면·동 안내 — 시드 매칭 시 최상단에 노출 (동음이의어는 다수 항목)
  // 복합 쿼리("울산 서생")는 첫 단어로만 매칭 — 단일 단어 검색이 일반적
  const hintPrefix = matchSubRegionHints(terms[0] ?? q);

  // FAQ 매칭 — 질문형 쿼리를 FAQ 패턴과 비교하여 상위에 삽입
  const faqResults = matchFaqs(q);

  const index = getSearchIndex();

  if (terms.length === 1) {
    const term = terms[0];

    // 단일 term이 entity 정확명 매치 시 해당 카드를 최상단으로 hoist.
    // (5/22 회장 요청 — FAQ guide 카드가 무관하게 1위로 박히던 동작 변경.
    // 범위: 작물 + 시도 + 시군구 + 구 + 지원사업.)
    const hoisted = findExactMatchHoists(term, index);
    const hoistedIds = new Set(hoisted.map((i) => i.id));

    const results = index
      .filter((item) => !hoistedIds.has(item.id))
      .map((item) => ({ item, score: scoreItem(item, term) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
    return [...hintPrefix, ...hoisted, ...faqResults, ...results];
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

  // crop-{context} 인텐트일 때 /crops/[id]#anchor deep link 합성 아이템 최상위 삽입.
  // hintPrefix 직후·faqResults 앞으로 prepend — 사용자가 찾는 정확한 섹션으로 바로 유도.
  const cropContextPrefix: SearchItem[] = [];
  if (
    intent.type === "crop-region" ||
    intent.type === "crop-cultivation" ||
    intent.type === "crop-method" ||
    intent.type === "crop-income" ||
    intent.type === "crop-difficulty"
  ) {
    const crop = CROPS.find((c) => c.name === intent.crop);
    if (crop) {
      const anchor = CROP_CONTEXT_ANCHOR[intent.type];
      const detail = CROP_DETAILS.find((d) => d.id === crop.id);

      let title = "";
      let subtitle = "";
      const extraKeywords: string[] = [];

      switch (intent.type) {
        case "crop-region": {
          title = `${crop.name} 주요 산지`;
          const majorRegions = detail?.majorRegions?.slice(0, 3) ?? [];
          subtitle = majorRegions.length
            ? `${majorRegions.join("·")} — 주요 재배지로 알려져 있어요.`
            : `${crop.name} 주요 재배지를 확인해 보세요.`;
          extraKeywords.push("산지", "재배지", ...majorRegions);
          break;
        }
        case "crop-cultivation": {
          title = `${crop.name} 재배 조건`;
          subtitle = `${crop.name} 기후·토양·재배 환경을 살펴보세요.`;
          extraKeywords.push("재배환경", "기후", "토양");
          break;
        }
        case "crop-method": {
          title = `${crop.name} 재배 방법`;
          subtitle = `${crop.name} 재배 단계·구조를 단계별로 확인해 보세요.`;
          extraKeywords.push("재배법", "재배 단계", "구조");
          break;
        }
        case "crop-income": {
          title = `${crop.name} 수익·소득`;
          subtitle = `${crop.name} 소득 범위와 수익성 정보예요.`;
          extraKeywords.push("수익", "소득", "수익성");
          break;
        }
        case "crop-difficulty": {
          title = `${crop.name} 난이도·장단점`;
          subtitle = `${crop.name} 재배 난이도와 장단점을 확인해 보세요.`;
          extraKeywords.push("난이도", "장단점", "쉬운", "어려운");
          break;
        }
      }

      cropContextPrefix.push({
        type: "guide",
        id: `${intent.type}-${crop.id}`,
        title,
        subtitle,
        href: `/crops/${crop.id}#${anchor}`,
        keywords: [crop.name, ...extraKeywords],
        icon: crop.emoji,
      });
    }
  }

  // 첫 단어가 정확한 작물명이고 별도 context 인텐트(crop-region 등)가 없으면
  // 해당 작물 카드를 최상단으로 hoist.
  //   "감귤 작물", "사과 정보", "딸기 추천" 등 — 사용자가 작물을 먼저 입력한 건
  //   그 작물 자체의 재배 정보를 원한다는 신호. FAQ 가이드 카드보다 우선.
  //   (5/22 회장 결재한 단일어 findExactMatchHoists의 복합 쿼리 확장)
  //   context 인텐트가 있으면 cropContextPrefix 딥링크가 더 정확하므로 중복 hoist 생략.
  const leadingCropHoist: SearchItem[] = [];
  if (cropContextPrefix.length === 0) {
    const firstCrop = CROPS.find((c) => c.name.toLowerCase() === terms[0]);
    if (firstCrop) {
      const cropItem = index.find(
        (it) => it.type === "crop" && it.id === firstCrop.id,
      );
      if (cropItem) leadingCropHoist.push(cropItem);
    }
  }
  const leadingHoistIds = new Set(leadingCropHoist.map((i) => i.id));
  const scoredOut = leadingHoistIds.size
    ? scored.filter((it) => !leadingHoistIds.has(it.id))
    : scored;

  return [
    ...hintPrefix,
    ...leadingCropHoist,
    ...cropContextPrefix,
    ...faqResults,
    ...scoredOut,
  ];
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
  "농촌 정착 지원금", "청년 농업", "창업 자금", "주택 지원", "영농 정착금",
  // 교육
  "정착 교육", "스마트팜 교육", "온라인 교육", "체험 행사",
  // 비용/절차
  "정착 비용", "농촌 정착 절차", "농지 구입", "정착 준비",
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

/**
 * 네이버 스타일 자동완성 — 텍스트만 반환하는 통합 함수.
 *
 * 동작:
 *  - 입력값 자체를 첫 후보로 포함 (네이버 패턴 — Enter 시 입력값 그대로 검색)
 *  - searchAll 결과의 title 추출 + suggestQueries(QUERY_SUGGESTIONS) 합쳐 dedup
 *  - type별 균형 cap(기본 2건)으로 region 8개·crop 1개 같은 편향 차단
 *  - 시드 안내 카드(sub-region-hint-*)는 풀네임("울산 울주 서생면") 그대로 포함
 *
 * @param query 사용자 입력
 * @param maxResults 최대 결과 수 (기본 8)
 * @param perTypeCap type당 최대 노출 (기본 2)
 */
export function getQuerySuggestions(
  query: string,
  maxResults = 8,
  perTypeCap = 2,
): string[] {
  const q = query.trim();
  if (q.length === 0) return [];

  const out: string[] = [];
  const seen = new Set<string>();
  const push = (text: string) => {
    const t = text.trim();
    if (t.length === 0) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  };

  // 1) 입력값 그대로 (네이버 패턴 — 최상단 첫 후보)
  push(q);

  // 2) searchAll 결과의 title — type별 cap 적용
  if (q.length >= 1) {
    const items = searchAll(q);
    const typeCount = new Map<SearchItemType, number>();
    for (const item of items) {
      const cur = typeCount.get(item.type) ?? 0;
      if (cur >= perTypeCap) continue;
      // 시드 안내(sub-region-hint-*)는 풀네임이 title이므로 그대로 사용
      push(item.title);
      typeCount.set(item.type, cur + 1);
      if (out.length >= maxResults) break;
    }
  }

  // 3) QUERY_SUGGESTIONS 자동완성 (정적 인기 쿼리) — 남은 슬롯 채움
  if (out.length < maxResults && q.length >= 2) {
    const sugg = suggestQueries(q, maxResults);
    for (const s of sugg) {
      push(s);
      if (out.length >= maxResults) break;
    }
  }

  return out.slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// Cross-Entity Intent Detection (교차 인텐트 감지)
// ---------------------------------------------------------------------------

export type CropContextType =
  | "crop-region"
  | "crop-cultivation"
  | "crop-method"
  | "crop-income"
  | "crop-difficulty";

export type SearchIntent =
  | { type: "region-crop"; region: string; crop: string }
  | { type: CropContextType; crop: string }
  | { type: "general" };

/**
 * 작물 + 컨텍스트 키워드 매핑.
 * 사용자 검색어에 작물명 + 컨텍스트 키워드가 함께 등장하면 해당 의도로 분기.
 * 예: "사과 재배지" → crop-region intent → /crops/apple#region deep link
 */
const CROP_CONTEXT_KEYWORDS: Record<CropContextType, string[]> = {
  "crop-region": ["재배지", "산지", "주산지", "생산지", "주요 지역"],
  "crop-cultivation": ["재배환경", "재배 조건", "기후", "토양", "환경"],
  "crop-method": ["재배 방법", "재배법", "재배 단계", "구조", "키우는", "기르는"],
  "crop-income": ["수익", "소득", "가격", "수익성"],
  "crop-difficulty": ["난이도", "쉬운", "어려운", "초보"],
};

/** crop-context 분기에서 사용할 anchor id 매핑 (/crops/[id]#anchor) */
const CROP_CONTEXT_ANCHOR: Record<CropContextType, string> = {
  "crop-region": "region",
  "crop-cultivation": "cultivation",
  "crop-method": "grow-steps",
  "crop-income": "income",
  "crop-difficulty": "pros-cons",
};

/**
 * 쿼리에서 지역+작물 조합 또는 작물+컨텍스트 인텐트를 감지합니다.
 * 우선순위:
 *   1. region + crop 동시 매칭 → region-crop
 *   2. crop + context keyword 매칭 → crop-{context}
 *   3. 그 외 → general
 *
 * 예시:
 *   "전남 사과"  → { type: "region-crop", region: "전남", crop: "사과" }
 *   "사과 재배지" → { type: "crop-region", crop: "사과" }
 *   "딸기 수익"  → { type: "crop-income", crop: "딸기" }
 */
export function detectIntent(query: string): SearchIntent {
  // 작물명 prefix 자동 공백 — "사과재배지" → "사과 재배지" 로 정규화 후 분기
  const lowerQuery = injectCropPrefixSpace(query.trim().toLowerCase());
  const words = lowerQuery.split(/\s+/).filter(Boolean);
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

  // ── 작물 + 컨텍스트 키워드 분기 ──
  // 단어 분리 매칭 실패한 작물도 substring으로 한번 더 시도 (조사 결합 케이스 대응)
  // e.g. "사과를" → words에 "사과를" 그대로 들어가지만 includes("사과")는 true
  if (!detectedCrop) {
    const cropMatch = CROPS.find((c) =>
      lowerQuery.includes(c.name.toLowerCase()),
    );
    if (cropMatch) detectedCrop = cropMatch.name;
  }

  if (detectedCrop) {
    for (const [contextType, keywords] of Object.entries(
      CROP_CONTEXT_KEYWORDS,
    ) as [CropContextType, string[]][]) {
      if (keywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))) {
        return { type: contextType, crop: detectedCrop };
      }
    }
  }

  return { type: "general" };
}

// ---------------------------------------------------------------------------
// 읍·면·동 검색 안내 — 시·군·구 단위까지만 데이터 제공 명시
// ---------------------------------------------------------------------------
// 검색 인덱스는 시·도/시·군·구/구 단위까지만 색인하지만, 사용자는 자연스럽게
// 인지도 높은 읍·면·동(서생면·우도면 등)도 검색한다. 매칭 시 안내 카드를
// 최상단에 노출하고 상위 시·군·구 페이지로 유도.
//
// 데이터 소스: 통계청 SGIS Open API stage.json
//   - scripts/generate-sub-regions.ts 가 사전 수집한 정적 데이터 사용
//   - 전국 3,559건 읍·면·동 자동 매핑
//   - 6,161개 검색 키 (풀네임 + 접미사 제거 별칭) + 585개 동음이의어 처리
//
// 행정구역 통폐합 시 generate-sub-regions.ts 재실행으로 갱신.

import { SUB_REGIONS } from "./sub-regions.generated";

/**
 * 수동 별칭 시드 — SGIS는 면(面) 이름으로 등록하지만 사용자는 섬(島) 이름으로 검색.
 * 별칭 → SGIS 등록 키로 리다이렉트. 추가 항목은 자유롭게 등록 가능.
 */
const SUB_REGION_ALIASES: Record<string, string> = {
  "청산도": "청산면",
  "보길도": "보길면",
  "흑산도": "흑산면",
  "홍도": "흑산면", // 홍도는 흑산면 소속
  "소록도": "도양읍", // 전남 고흥
  "거제도": "거제시", // 거제도 자체는 시 단위
  "남해도": "남해읍",
  "진도": "진도읍",
  "완도": "완도읍",
  "강화도": "강화읍",
};

/**
 * 검색어가 읍·면·동에 매칭되면 안내 SearchItem 배열을 반환.
 * 동음이의어(예: "중앙동"이 여러 시·군·구에 존재)는 다수 항목 노출.
 * 검색 결과 최상단에 노출하여 사용자에게 데이터 제공 범위를 명확히 안내.
 */
function matchSubRegionHints(query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  // 별칭(섬 이름 등) → SGIS 등록 키로 정규화
  const normalizedKey = SUB_REGION_ALIASES[q] ?? q;
  const tuples = SUB_REGIONS[normalizedKey];
  if (!tuples || tuples.length === 0) return [];

  // 동음이의어 cap — 최대 5건만 노출 (혼란 방지)
  // "중앙동" 처럼 31건+ 매칭되는 케이스 대응. 사용자가 시·도까지 함께 입력하면
  // 검색 결과 페이지에서 좁혀짐.
  const capped = tuples.slice(0, 5);

  return capped.map((tuple, idx) => {
    const [fullName, sigunguId, sidoId] = tuple;
    const sigungu = getSigunguById(sigunguId);
    const province = getProvinceById(sidoId);
    const sigunguShortName = sigungu?.shortName ?? "";
    const sidoShortName = province?.shortName ?? "";

    return {
      type: "region" as const,
      id: `sub-region-hint-${q}-${idx}`,
      title: `${sidoShortName} ${sigunguShortName} ${fullName}`,
      subtitle: `읍·면·동 단위는 따로 제공하지 않아요. ${sidoShortName} ${sigunguShortName} 페이지에서 살펴보세요.`,
      href: `/regions/${sidoId}/${sigunguId}`,
      keywords: [fullName, sigunguShortName, sidoShortName],
      icon: "\u{1F4CD}", // 📍
      badge: "안내",
    };
  });
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
// 답변 카드 (Featured Snippet) — intent 감지 시 결과 최상단에 구조화된 답을 직접 제공.
// P0(6/19 회장 결재). 기존 synthetic link 카드를 "실제 데이터 값"으로 승격.
// 신규 데이터 0 — CROP_DETAILS(income·majorRegions·cultivation·prosCons) 재활용.
// ---------------------------------------------------------------------------

export interface SearchAnswerFact {
  label: string;
  value: string;
}

export interface SearchAnswer {
  kind: CropContextType | "region-crop";
  cropId: string;
  cropName: string;
  emoji: string;
  category: string;
  difficulty: string;
  /** 헤드라인 — "감귤 — 예상 소득" */
  headline: string;
  /** 큰 강조값 — revenueRange / 기후 / 난이도 등 (없을 수 있음) */
  lead?: string;
  /** 칩으로 노출할 보조 사실 */
  facts: SearchAnswerFact[];
  /** 주요 산지 (시도명) */
  regions?: string[];
  /** 출처 표기 (소득 등) */
  source?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

/**
 * intent 감지 → 답변 카드 데이터. general·작물 미해석 시 null.
 * 페이지는 이 결과를 결과 섹션 위에 렌더하고, 동일 intent의 synthetic guide 카드는
 * 그룹에서 제외한다 (`${kind}-${cropId}` / `cross-*` id로 식별).
 */
export function buildSearchAnswer(query: string): SearchAnswer | null {
  const intent = detectIntent(query);
  if (intent.type === "general") return null;

  const crop = CROPS.find((c) => c.name === intent.crop);
  if (!crop) return null;
  const detail = CROP_DETAILS.find((d) => d.id === crop.id);

  const base = {
    cropId: crop.id,
    cropName: crop.name,
    emoji: crop.emoji,
    category: crop.category,
    difficulty: crop.difficulty,
  };
  const detailHref = (anchor: string) => `/crops/${crop.id}#${anchor}`;

  switch (intent.type) {
    case "crop-income": {
      const inc = detail?.income;
      const facts: SearchAnswerFact[] = [{ label: "난이도", value: crop.difficulty }];
      if (inc?.laborIntensity) facts.push({ label: "노동강도", value: inc.laborIntensity });
      if (inc?.minScale) facts.push({ label: "최소규모", value: inc.minScale });
      return {
        ...base,
        kind: intent.type,
        headline: `${crop.name} — 예상 소득`,
        lead: inc?.revenueRange,
        facts,
        regions: detail?.majorRegions?.slice(0, 3),
        source: inc?.source,
        primaryHref: detailHref("income"),
        primaryLabel: `${crop.name} 소득 상세`,
        secondaryHref: "/crops?sort=income",
        secondaryLabel: "소득 높은 작물 비교",
      };
    }
    case "crop-region": {
      const regions = detail?.majorRegions ?? [];
      return {
        ...base,
        kind: intent.type,
        headline: `${crop.name} — 주요 산지`,
        lead: regions.length ? regions.slice(0, 4).join(" · ") : undefined,
        facts: [
          { label: "분류", value: crop.category },
          { label: "난이도", value: crop.difficulty },
        ],
        regions: regions.slice(0, 4),
        primaryHref: detailHref("region"),
        primaryLabel: `${crop.name} 재배지 상세`,
        secondaryHref: "/regions",
        secondaryLabel: "지역별 비교",
      };
    }
    case "crop-difficulty": {
      const inc = detail?.income;
      const facts: SearchAnswerFact[] = [];
      if (inc?.laborIntensity) facts.push({ label: "노동강도", value: inc.laborIntensity });
      if (inc?.annualWorkdays) facts.push({ label: "연 작업일", value: inc.annualWorkdays });
      const firstCon = detail?.prosCons?.cons?.[0]?.text;
      return {
        ...base,
        kind: intent.type,
        headline: `${crop.name} — 재배 난이도`,
        lead: `난이도 ${crop.difficulty}`,
        facts,
        source: firstCon ? `유의점: ${firstCon}` : undefined,
        primaryHref: detailHref("pros-cons"),
        primaryLabel: `${crop.name} 장단점 보기`,
        secondaryHref: "/crops?difficulty=쉬움",
        secondaryLabel: "쉬운 작물부터 보기",
      };
    }
    case "crop-cultivation": {
      const cul = detail?.cultivation;
      const facts: SearchAnswerFact[] = [];
      if (cul?.soil) facts.push({ label: "토양", value: cul.soil });
      if (cul?.water) facts.push({ label: "물관리", value: cul.water });
      return {
        ...base,
        kind: intent.type,
        headline: `${crop.name} — 재배 조건`,
        lead: cul?.climate,
        facts,
        primaryHref: detailHref("cultivation"),
        primaryLabel: `${crop.name} 재배 환경 상세`,
      };
    }
    case "crop-method": {
      const steps = detail?.cultivationSteps ?? [];
      const facts: SearchAnswerFact[] = steps.slice(0, 3).map((st) => ({
        label: `${st.step}단계`,
        value: st.title,
      }));
      return {
        ...base,
        kind: intent.type,
        headline: `${crop.name} — 재배 단계`,
        lead: steps.length ? `총 ${steps.length}단계로 재배해요.` : undefined,
        facts,
        primaryHref: detailHref("grow-steps"),
        primaryLabel: `${crop.name} 재배법 상세`,
      };
    }
    case "region-crop": {
      const regions = detail?.majorRegions ?? [];
      const inRegion = regions.some((r) => r.includes(intent.region) || intent.region.includes(r.slice(0, 2)));
      return {
        ...base,
        kind: intent.type,
        headline: `${intent.region} × ${crop.name}`,
        lead: inRegion
          ? `${intent.region}은(는) ${crop.name} 주요 산지예요.`
          : `${crop.name} 재배 정보와 ${intent.region} 지역을 함께 살펴보세요.`,
        facts: [
          { label: "분류", value: crop.category },
          { label: "난이도", value: crop.difficulty },
        ],
        regions: regions.slice(0, 3),
        primaryHref: detailHref("region"),
        primaryLabel: `${crop.name} 재배지`,
        secondaryHref: "/regions",
        secondaryLabel: `${intent.region} 지역 정보`,
      };
    }
  }
}
