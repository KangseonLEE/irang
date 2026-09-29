/**
 * 여정 레인 허브 데이터 — `/start/<lane>` 상세 + `/start` 비교 화면 (2026-09-29 회장 S7 구조).
 *
 * 회장 원문: "이미 목적지가 있는 사람이면 5가지 카드가 나타나고 누르면 요약 데이터 지금처럼 보여주고
 * 탐색하기 누르면 … 각 산업별 현황, 비용이나 추이 추세 같은 것부터 지원사업, 작물, 인터뷰 등을
 * 모아서 볼 수 있는 화면 / 목적이 없는 사람이면 … 비교하여 볼 수 있는 화면으로 이동."
 *
 * 원칙 3가지:
 *  1. **하드코딩 숫자 0** — 건수·평균·추세는 전부 우리 데이터에서 파생한다. 값에는 출처가 따라붙는다
 *     (타일은 `buildLaneStats` 가 이미 `source` 를 달아 준다 — CLAUDE.md "데이터에는 근거").
 *  2. **판정 규칙은 한 곳** — 지원사업 레인 판정은 `journey-lanes-stats.ts` 의 `matchLanePrograms` 하나만 쓴다.
 *     선택 패널 타일("N건")과 허브 목록이 다른 규칙을 쓰면 같은 레인이 화면마다 다른 수를 말하게 된다(9/23 SSOT 교훈).
 *  3. **딥링크는 화이트리스트 안에서만** — `?persona=`·`?category=`·`?type=`·`?q=` 값이 normalize 밖이면
 *     middleware 가 308 로 떼어내 링크가 조용히 무력화된다(6/16 박제, 4회 재발).
 *
 * 새 화면(`/start`·`/start/<id>`)은 프론트가 같은 스프린트에서 만든다. 이 모듈은 그 화면이 그릴
 * **값과 목적지**만 계산한다(직렬화 가능한 평범한 객체 — Server → Client 경계 안전).
 */

import { CROPS, type CropInfo } from "./crops";
import { CROP_COSTS_BY_TYPE } from "./cost-by-type";
import { JOURNEY_LANES } from "./journey-lanes";
import {
  buildLaneStats,
  matchLanePrograms,
  topCropsFor,
  FOREST_CROP_NAMES,
  LANE_COST_TYPE,
  LANE_PERSONA,
  type LaneTile,
} from "./journey-lanes-stats";
import {
  interviews,
  hasFullStory,
  TREND_BENTO_PROFILES,
  type CostTypeId,
  type InterviewCard,
  type InterviewCategoryId,
  type TrendTypeId,
} from "./landing";
import { PROGRAMS, type SupportProgram } from "./programs";
import { getInterviewImageSrc } from "../interview-image";
import { deriveStatus, isUnannounced } from "../program-status";

/* ── 레인 식별자 ── */

/** 허브를 가진 레인 = 히어로 레인 6종 중 `undecided`(진단행)를 뺀 5종 */
export type HubLaneId = "guinong" | "guichon" | "forest" | "youth" | "smartfarm";

const HUB_LANE_ID_SET = new Set<string>([
  "guinong",
  "guichon",
  "forest",
  "youth",
  "smartfarm",
]);

export function isHubLaneId(x: string): x is HubLaneId {
  return HUB_LANE_ID_SET.has(x);
}

/**
 * 순서는 `JOURNEY_LANES`(히어로 SSOT)에서 파생한다 — 여기서 다시 나열하면
 * 히어로 카드 순서와 비교 화면 순서가 말없이 갈라진다.
 */
export const HUB_LANE_IDS: readonly HubLaneId[] = JOURNEY_LANES.map((l) => l.id).filter(isHubLaneId);

/* ── 레인 ↔ 기존 분류 매핑 (지원사업·비용 매핑은 journey-lanes-stats 의 것을 그대로 쓴다) ── */

/** 추이 차트 키 — `TREND_BENTO_PROFILES`(랜딩 추세 벤토)와 같은 체계. 귀촌은 `rural`(탭 값은 village) */
const LANE_TREND: Record<HubLaneId, TrendTypeId> = {
  guinong: "farming",
  guichon: "rural",
  forest: "mountain",
  youth: "youth",
  smartfarm: "smartfarm",
};

/** 인터뷰 카테고리 키 — `/interviews?type=` enum 6종 중 5종 */
const LANE_INTERVIEW_TYPE: Record<HubLaneId, InterviewCategoryId> = {
  guinong: "farming",
  guichon: "rural",
  forest: "mountain",
  youth: "youth",
  smartfarm: "smartfarm",
};

/** 한 섹션에 담는 최대치 — 넘치면 각 목록 페이지로 보낸다 */
const MAX_PROGRAMS = 12;
const MAX_CROPS = 6;
const MAX_INTERVIEWS = 6;
/** 레인마다 최소 이 개수는 채운다(못 채우면 규칙을 한 단계 넓힌다 — 아래 2차 규칙) */
const MIN_INTERVIEWS = 3;

/* ── 지원사업 ── */

/**
 * 접수 중 → 정기 접수(연례 창구형) → 접수 예정.
 * 같은 순위 안에서는 마감이 가까운 것부터(정렬은 안정적이라 그 외에는 원래 순서 유지).
 */
function programRank(p: SupportProgram): number {
  if (isUnannounced(p.applicationStart, p.applicationEnd)) return 1; // "정기 접수"(applicationCycle)
  return deriveStatus(p.applicationStart, p.applicationEnd) === "모집중" ? 0 : 2;
}

function sortLanePrograms(list: SupportProgram[]): SupportProgram[] {
  return [...list].sort((a, b) => {
    const rank = programRank(a) - programRank(b);
    if (rank !== 0) return rank;
    // 접수 중은 마감 임박 순, 예정은 시작 빠른 순. 정기 접수는 일자가 없어 원래 순서.
    if (programRank(a) === 0) return a.applicationEnd.localeCompare(b.applicationEnd);
    if (programRank(a) === 2) return a.applicationStart.localeCompare(b.applicationStart);
    return 0;
  });
}

/**
 * 더보기 목적지. 페르소나가 있는 레인은 `?persona=`(정확히 같은 4+ 규칙으로 걸러진다),
 * 없는 레인은 `?q=` 로 보낸다 — 9/29 실측 건수가 허브 목록과 일치하는 키워드만 골랐다
 * (산림 1건 · 스마트팜 2건). 두 값 모두 /programs normalize 의 q 길이 제한(2~30자) 안.
 */
function programsHrefFor(id: HubLaneId): string {
  const persona = LANE_PERSONA[id];
  if (persona) return `/programs?persona=${persona}`;
  return id === "forest" ? "/programs?q=산림" : "/programs?q=스마트팜";
}

/* ── 작물 ── */

/** 괄호 표기 제거 — 비용 데이터는 "딸기 (ICT)"처럼 재배 방식을 붙여 둔다 */
function baseCropName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

/**
 * 레인 대표 작물.
 *  · 페르소나 레인 → 적합도 상위(작물 페르소나 점수)
 *  · 귀산촌 → 임산물 계열 이름 집합(`FOREST_CROP_NAMES`)
 *  · 스마트팜 → 시설 비용 데이터의 작물명 ∩ 작물 DB (엽채·표고처럼 DB 표기가 다른 건 자연히 빠진다)
 */
function laneCrops(id: HubLaneId): CropInfo[] {
  const persona = LANE_PERSONA[id];
  if (persona) return topCropsFor(persona, MAX_CROPS);
  if (id === "forest") return CROPS.filter((c) => FOREST_CROP_NAMES.has(c.name)).slice(0, MAX_CROPS);
  const names = new Set(CROP_COSTS_BY_TYPE.smartfarm.map((c) => baseCropName(c.name)));
  return CROPS.filter((c) => names.has(c.name)).slice(0, MAX_CROPS);
}

function cropsHrefFor(id: HubLaneId): string {
  const persona = LANE_PERSONA[id];
  if (persona) return `/crops?persona=${persona}`;
  // 임산물은 전부 '특용' 카테고리다(실측 9종 전건). 스마트팜 작물은 과수·채소·화훼가 섞여 카테고리로 못 좁힌다.
  return id === "forest" ? "/crops?category=특용" : "/crops";
}

/* ── 인터뷰 ── */

export interface InterviewSummary {
  id: string;
  name: string;
  region: string;
  crop: string;
  /** 카드 한 줄 — 본인 발언 인용 */
  quote: string;
  /** 본문 동의자는 상세 페이지, 미동의자는 원문 기사(인터뷰 카드와 같은 규칙) */
  href: string;
  external: boolean;
  /** 일러스트 경로. 없으면 null → 호출자가 FarmerAvatar 로 폴백 */
  image: string | null;
}

/** '특용' 작물 이름 = 임산물·약용 계열 판정의 데이터 파생 사전(홍화 같은 약용작물은 키워드로 보완) */
const SPECIAL_CROP_NAMES = CROPS.filter((c) => c.category === "특용").map((c) => c.name);

function interviewHaystack(p: InterviewCard): string {
  return `${p.crop} ${p.currentJob} ${p.prevJob} ${p.quote}`;
}

function inCategory(p: InterviewCard, id: InterviewCategoryId): boolean {
  return p.category === id || (p.tags ?? []).includes(id);
}

/** "28세" · "31·30세" · "30대" → 39세 이하 여부. 나이 미상("(미상)")은 청년으로 보지 않는다. */
function isYoungFarmer(p: InterviewCard): boolean {
  const m = /(\d{2})/.exec(p.age);
  if (m) return Number(m[1]) <= 39;
  return /^[23]0대/.test(p.age);
}

/**
 * 레인별 인터뷰 규칙 — 1차(대표·보조 카테고리)로 뽑고, {@link MIN_INTERVIEWS} 에 못 미치면 2차로 넓힌다.
 * 어떤 규칙으로 들어왔는지는 각 항목 주석에 남긴다(오분류 추적용).
 */
const INTERVIEW_RULES: Record<HubLaneId, ((p: InterviewCard) => boolean)[]> = {
  // 1차: 대표 카테고리가 '귀농'
  // 2차: 보조 태그가 '귀농'인 영농 사례(귀촌 대표 카테고리는 제외 — 그쪽은 생업이 농사가 아니다)
  guinong: [
    (p) => p.category === "farming",
    (p) => (p.tags ?? []).includes("farming") && p.category !== "rural",
  ],
  // 1차: '귀촌' 대표·보조 카테고리
  // 2차(예비): 비영농 생업(어업·방앗간·공방·카페). 농산물 '가공'은 6차산업이라 일부러 뺐다 — 귀농 쪽 사례다.
  guichon: [
    (p) => inCategory(p, "rural"),
    (p) => /어업|방앗간|공방|카페/.test(interviewHaystack(p)),
  ],
  // 1차: '귀산촌' 대표·보조 카테고리
  // 2차: 임산물·약용 계열 작목(특용 작물 이름 ∪ 임산물·산림·산양삼·두릅·약용) — 표고·두릅·홍화가 여기로 들어온다
  forest: [
    (p) => inCategory(p, "mountain"),
    (p) =>
      SPECIAL_CROP_NAMES.some((n) => interviewHaystack(p).includes(n)) ||
      /임산물|산림|산양삼|두릅|약용/.test(interviewHaystack(p)),
  ],
  // 1차: '청년농' 대표·보조 카테고리
  // 2차: 나이 39세 이하(청년 지원 기준과 같은 선)
  youth: [(p) => inCategory(p, "youth"), isYoungFarmer],
  // 1차: '스마트팜' 대표·보조 카테고리
  // 2차: 시설·온실·수경·ICT 키워드
  smartfarm: [
    (p) => inCategory(p, "smartfarm"),
    (p) => /스마트\s?팜|시설|온실|수경|ICT/.test(interviewHaystack(p)),
  ],
};

function toSummary(p: InterviewCard): InterviewSummary {
  const internal = hasFullStory(p);
  return {
    id: p.id,
    name: p.name,
    region: p.region,
    crop: p.crop,
    quote: p.quote,
    href: internal ? `/interviews/${p.id}` : p.sourceUrl,
    external: !internal,
    image: getInterviewImageSrc(p.id),
  };
}

function laneInterviews(id: HubLaneId): InterviewSummary[] {
  const picked: InterviewCard[] = [];
  const seen = new Set<string>();
  for (const match of INTERVIEW_RULES[id]) {
    // 2차 규칙은 1차만으로 최소 건수를 못 채울 때만 연다(넓힌 규칙이 대표 사례를 밀어내지 않게)
    if (picked.length >= MIN_INTERVIEWS) break;
    for (const p of interviews) {
      if (seen.has(p.id) || !match(p)) continue;
      seen.add(p.id);
      picked.push(p);
    }
  }
  return picked.slice(0, MAX_INTERVIEWS).map(toSummary);
}

/* ── 다음 걸음 ── */

interface NextStep {
  label: string;
  href: string;
  desc: string;
}

/**
 * 허브 하단 "이어서 볼 것" 3~4개. 목적지는 전부 이미 있는 화면이다(새 필터·새 화면 0).
 * 비용은 `LANE_COST_TYPE` 의 원 매핑을 쓴다 — 귀촌은 작물 비용 표가 비어 타일은 안 만들지만
 * `/costs?type=village` 화면 자체는 총액·항목 요약을 갖고 있다.
 */
function nextStepsFor(id: HubLaneId, laneLabel: string): NextStep[] {
  const persona = LANE_PERSONA[id];
  const costType = LANE_COST_TYPE[id];
  const steps: NextStep[] = [
    {
      label: "맞춤 시군구 찾기",
      href: persona ? `/regions/ranking?persona=${persona}` : "/regions/ranking",
      desc: "정착 점수로 시·군·구 순위를 보고 후보를 좁혀요",
    },
    {
      label: "정착 추이 보기",
      href: TREND_BENTO_PROFILES[LANE_TREND[id]].href,
      desc: `${laneLabel} 인구가 어떻게 움직였는지 흐름으로 봐요`,
    },
    {
      label: "2분 진단",
      href: "/match?mode=assess",
      desc: "이 길이 나와 맞는지 헷갈리면 진단으로 확인해요",
    },
  ];
  if (costType) {
    steps.splice(1, 0, {
      label: "비용 가이드",
      href: `/costs?type=${costType}`,
      desc: "초기 투자금과 준비 기간을 항목별로 봐요",
    });
  }
  return steps;
}

/* ── 허브 ── */

export interface LaneHub {
  id: HubLaneId;
  /** 비용 유형 — 귀촌은 작물 비용 데이터가 0건이라 null(타일·섹션을 만들지 않는다) */
  costType: CostTypeId | null;
  /** 추이 키 — `TREND_BENTO_PROFILES` 와 같은 체계 */
  trendKey: TrendTypeId | null;
  /** 선택 패널과 **같은** 타일(같은 계산·같은 출처) */
  tiles: LaneTile[];
  programs: SupportProgram[];
  programsHref: string;
  crops: CropInfo[];
  cropsHref: string;
  interviews: InterviewSummary[];
  interviewsHref: string;
  nextSteps: NextStep[];
}

export function buildLaneHub(
  id: HubLaneId,
  programs: readonly SupportProgram[] = PROGRAMS,
): LaneHub {
  const lane = JOURNEY_LANES.find((l) => l.id === id);
  const costType = LANE_COST_TYPE[id];
  const hasCostRows = Boolean(costType && CROP_COSTS_BY_TYPE[costType].length > 0);

  return {
    id,
    costType: hasCostRows ? (costType as CostTypeId) : null,
    trendKey: LANE_TREND[id],
    tiles: buildLaneStats([id], programs)[id],
    programs: sortLanePrograms(matchLanePrograms(programs, id)).slice(0, MAX_PROGRAMS),
    programsHref: programsHrefFor(id),
    crops: laneCrops(id),
    cropsHref: cropsHrefFor(id),
    interviews: laneInterviews(id),
    interviewsHref: `/interviews?type=${LANE_INTERVIEW_TYPE[id]}`,
    nextSteps: nextStepsFor(id, lane?.label ?? id),
  };
}

/* ── 비교 화면(/start) ── */

export interface LaneCompareRow {
  id: HubLaneId;
  label: string;
  intro: string;
  tiles: LaneTile[];
  /** 대표 작물 이름만 — 비교 표의 한 칸 */
  topCrops: string[];
  href: string;
}

/** 목적을 아직 못 고른 사람이 5종을 나란히 보는 화면. 행 순서는 히어로 카드 순서 그대로. */
export function buildLaneCompare(
  programs: readonly SupportProgram[] = PROGRAMS,
): LaneCompareRow[] {
  const stats = buildLaneStats(HUB_LANE_IDS, programs);
  return HUB_LANE_IDS.map((id) => {
    const lane = JOURNEY_LANES.find((l) => l.id === id);
    return {
      id,
      label: lane?.label ?? id,
      intro: lane?.intro ?? "",
      tiles: stats[id],
      topCrops: laneCrops(id).map((c) => c.name),
      href: `/start/${id}`,
    };
  });
}
