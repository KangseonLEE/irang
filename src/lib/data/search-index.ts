/**
 * 통합 검색 인덱스
 * - 지역(Station), 작물(Crop), 지원사업(Program) 데이터를 단일 검색 인덱스로 통합
 * - 클라이언트 사이드 fuzzy-ish 검색 (debounce + prefix match)
 *
 * 번들 최적화:
 * - POPULAR_TAGS는 search-tags.ts에서 re-export (경량 파일)
 * - SEARCH_INDEX 빌드를 lazy initialization으로 지연하여
 *   첫 검색 호출 시에만 데이터 참조 → 모듈 그래프는 유지하되 실행 비용 절감
 */

import { STATIONS } from "./stations";
import { SIGUNGUS } from "./sigungus";
import { getProvinceById } from "./regions";
import { CROPS } from "./crops";
import { PROGRAMS } from "./programs";
import { EDUCATION_COURSES } from "./education";
import { EVENTS } from "./events";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchItem {
  type: "region" | "crop" | "program" | "education" | "event" | "guide";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  icon: string;
  badge?: string;
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

  const regionItems: SearchItem[] = STATIONS.map((s) => ({
    type: "region" as const,
    id: s.stnId,
    title: s.name,
    subtitle: truncate(`${s.province} · ${s.description}`, 40),
    href: `/regions?stations=${s.stnId}`,
    keywords: [s.province],
    icon: "\u{1F4CD}", // 📍
  }));

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

  const programItems: SearchItem[] = PROGRAMS.map((p) => ({
    type: "program" as const,
    id: p.id,
    title: p.title,
    subtitle: truncate(p.summary, 50),
    href: `/programs/${p.id}`,
    keywords: [p.region, p.supportType, ...p.relatedCrops],
    icon: "\u{1F4CB}", // 📋
    badge: p.status,
  }));

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

  const guideItems: SearchItem[] = [
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
      id: "gov-roadmap",
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
      id: "glossary",
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
  ];

  _searchIndex = [
    ...regionItems,
    ...sigunguItems,
    ...cropItems,
    ...programItems,
    ...educationItems,
    ...eventItems,
    ...guideItems,
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
  "농지": ["농지", "농지은행", "토지"],
  "귀촌": ["귀촌", "귀농"],
  "전원": ["귀촌", "전원생활"],
  "은퇴": ["귀촌", "전원생활", "시니어"],
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
const TYPE_WEIGHT: Record<SearchItem["type"], number> = {
  guide: 1.2,
  region: 1.1,
  crop: 1.0,
  program: 1.0,
  education: 0.95,
  event: 0.9,
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
 * 통합 검색 (드롭다운용) — 최대 10개 반환, 타입별 최대 3개.
 * 관련도 순으로 섹션 순서가 동적 결정됨.
 *   예: "사과" → 작물 섹션 먼저, "전남" → 지역 섹션 먼저
 */
export function searchItems(query: string): SearchItem[] {
  const all = searchAll(query);

  // 결과 순서에서 섹션 순서 도출 (가장 관련도 높은 타입이 먼저)
  const sectionOrder: SearchItem["type"][] = [];
  const seen = new Set<SearchItem["type"]>();
  for (const item of all) {
    if (!seen.has(item.type)) {
      seen.add(item.type);
      sectionOrder.push(item.type);
    }
  }

  // 타입별 최대 3개 수집
  const byType: Record<SearchItem["type"], SearchItem[]> = {
    region: [], crop: [], program: [], education: [], event: [], guide: [],
  };
  for (const item of all) {
    if (byType[item.type].length < 3) {
      byType[item.type].push(item);
    }
  }

  // 관련도 기반 섹션 순서로 결과 조합
  const results: SearchItem[] = [];
  for (const type of sectionOrder) {
    results.push(...byType[type]);
  }

  return results.slice(0, 10);
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

  const index = getSearchIndex();

  if (terms.length === 1) {
    const term = terms[0];
    return index
      .map((item) => ({ item, score: scoreItem(item, term) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }

  // 복합 쿼리: OR 매칭 + 관련도 합산 정렬
  return index
    .map((item) => ({ item, score: scoreItemMulti(item, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
