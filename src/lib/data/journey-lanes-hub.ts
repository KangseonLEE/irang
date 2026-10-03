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
import { PROGRAMS, loadPrograms, type SupportProgram } from "./programs";
import {
  changePct,
  mountainData,
  populationData,
  satisfactionSegments,
  satisfactionSummary,
  signedPct,
  smartfarmAdoption,
  smartfarmAreaData,
  smartfarmEffect,
  toCount,
  youthData,
} from "./stats";
import type { CropCost } from "./cost-by-type";
import type { EducationCourse } from "./education";
import type { FarmEvent } from "./events";
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

/** 한 섹션에 담는 최대치 — 넘치면 각 목록 페이지로 보낸다(탭 배지는 상한 전 전체 건수, 10/3) */
export const MAX_PROGRAMS = 12;
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

/**
 * 허브·비교 화면의 지원사업 원천 — `/programs` 목록과 같은 로더(DB 우선 + 정적 병합, 10/3).
 * 정적 PROGRAMS 만 쓰면 DB 전용 활성 사업(크롤 수집분)이 빠져 `/programs?q=스마트팜` 과 허브 목록이 갈라진다
 * (예: `crawl-rda-programs-aaacd312` "2027년 청년창업 스마트팜 지원사업"). 로더가 실패해도 화면은 정적 데이터로 선다.
 */
export async function loadHubPrograms(): Promise<SupportProgram[]> {
  try {
    const { programs } = await loadPrograms();
    return programs.length > 0 ? programs : [...PROGRAMS];
  } catch {
    return [...PROGRAMS];
  }
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

/* ── 함께 보면 좋은 것 ── */

/** 카드 아이콘 이름 — lucide 매핑은 페이지 로컬(lib 이 components 를 import 하지 않게, navigation.ts 와 같은 방식) */
export type RelatedIconName = "map" | "wallet" | "trend" | "compass";

interface NextStep {
  label: string;
  href: string;
  desc: string;
  icon: RelatedIconName;
}

/**
 * 허브 하단 "함께 보면 좋아요" 3~4개 — 순서를 강요하는 '단계'가 아니라 곁가지 추천 묶음이다(10/2 회장).
 * 목적지는 전부 이미 있는 화면이다(새 필터·새 화면 0).
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
      desc: `${laneLabel}에 맞는 시·군·구를 정착 점수로 견줘 봐요`,
      icon: "map",
    },
    {
      label: "정착 통계",
      href: TREND_BENTO_PROFILES[LANE_TREND[id]].href,
      desc: `${laneLabel} 인구 흐름과 이유를 더 자세히 볼 수 있어요`,
      icon: "trend",
    },
    {
      label: "2분 유형 진단",
      href: "/match?mode=assess",
      desc: "이 길이 나와 맞는지 헷갈린다면 가볍게 확인해 보세요",
      icon: "compass",
    },
  ];
  if (costType) {
    steps.splice(1, 0, {
      label: "비용 가이드",
      href: `/costs?type=${costType}`,
      desc: "초기 투자금과 준비 기간을 항목별로 볼 수 있어요",
      icon: "wallet",
    });
  }
  return steps;
}

/* ── 대표 작물 비용 카드 ── */

interface LaneCostCard {
  id: string;
  name: string;
  /** 작물 DB id — 일러스트·상세 링크용. 비용 표기("산양삼"·"장미 (화훼)")가 DB 에 없으면 null */
  cropId: string | null;
  initialCost: string;
  annual: string;
  breakEven: string;
  difficulty: CropCost["difficulty"];
  facilityType: string | null;
  source: string;
}

const CROP_ID_BY_NAME = new Map(CROPS.map((c) => [c.name, c.id]));

/**
 * 비용 행 → 작물 id. `cropPageId`(비용 데이터가 직접 단 상세 링크)가 1순위,
 * 없으면 괄호 표기를 뗀 이름이 작물 DB 이름과 **정확히** 같을 때만(부분 일치 금지 — "엽채"가 "상추"로 둔갑하지 않게).
 */
function resolveCostCropId(row: Pick<CropCost, "name" | "cropPageId">): string | null {
  if (row.cropPageId && CROPS.some((c) => c.id === row.cropPageId)) return row.cropPageId;
  return CROP_ID_BY_NAME.get(baseCropName(row.name)) ?? null;
}

function costCardsFor(rows: readonly CropCost[]): LaneCostCard[] {
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    cropId: resolveCostCropId(c),
    initialCost: c.initialCost,
    annual: c.annual,
    breakEven: c.breakEven,
    difficulty: c.difficulty,
    facilityType: c.facilityType ?? null,
    source: c.source,
  }));
}

/* ── "왜 이 길을 택할까" 차트 ── */

interface LaneTrendPoint {
  year: number;
  value: number;
}

/**
 * 보조 지표 — 데이터 성격에 맞춰 그리는 방식을 고른다.
 *  · gauge: 전체 중 비율(청년 비율·30대 비중) — 0~100% 링
 *  · donut: 응답 분포(만족도 4단 응답) — 조각별 비중
 *  · stat : 금액·나이·면적처럼 비율이 아닌 값 — 숫자 그대로(억지로 차트로 만들지 않는다)
 */
export type LaneIndicator =
  | { kind: "gauge"; label: string; value: string; sub: string; pct: number }
  | { kind: "donut"; label: string; value: string; sub: string; segments: { label: string; pct: number }[] }
  | { kind: "stat"; label: string; value: string; sub: string };

interface LaneTrend {
  /** 섹션 소제목 — "왜 귀농을 할까?" */
  title: string;
  subtitle: string;
  href: string;
  /** 시계열 이름·단위 — 툴팁·축 표기 */
  seriesLabel: string;
  unit: string;
  /** 소수 자릿수(만 명 1.2 → 1, 가구 2,685 → 0) */
  decimals: number;
  points: LaneTrendPoint[];
  /** 정책 목표선 — 공식 목표가 시계열과 같은 단위로 있을 때만(10/3: 근거 없던 "2027 1만 호" 제거) */
  target: { value: number; label: string } | null;
  headline: { value: string; label: string; sub: string };
  indicators: LaneIndicator[];
  reasons: { title: string; surveyLabel: string; items: { label: string; pct: number }[] };
  source: string;
}

const last = <T,>(arr: readonly T[]): T => arr[arr.length - 1];

/** "23.4%" → 23.4 (랜딩 벤토 문자열이 SSOT 인 값만 — 숫자 원천이 따로 없을 때) */
function pctOf(text: string): number {
  const n = Number.parseFloat(text.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * 출처 이어 붙이기 — 같은 조사는 한 번만 (10/3 QA: "농림축산식품부 2025 귀농귀촌 실태조사 · 농림축산식품부
 * 귀농귀촌 실태조사 (2024)"). 구분자는 " · " 만 본다(조사명 안의 "귀농·귀촌" 가운뎃점은 자르지 않는다).
 * 연도·괄호·공백·가운뎃점만 다른 표기는 같은 조사로 보고 먼저 나온 표기를 남긴다.
 */
export function joinSources(...sources: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of sources.flatMap((src) => src.split(/\s+·\s+/))) {
    const label = part.trim();
    if (!label) continue;
    const key = label.replace(/\([^)]*\)|\d{4}년?|[\s·]/g, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out.join(" · ");
}

/**
 * 레인별 차트 구성. 시계열은 `stats.ts`(통계 페이지와 같은 원천)에서, 문구·이유 막대는
 * 랜딩 추세 벤토(`TREND_BENTO_PROFILES`)에서 가져온다 — 두 화면이 다른 수를 말하지 않게.
 */
function laneTrendFor(id: HubLaneId): LaneTrend {
  const profile = TREND_BENTO_PROFILES[LANE_TREND[id]];
  const base = {
    title: profile.title,
    subtitle: profile.subtitle,
    href: profile.href,
    headline: { value: profile.hero.value, label: profile.hero.label, sub: profile.hero.sub },
    reasons: { title: profile.chart.title, surveyLabel: profile.chart.surveyLabel, items: profile.chart.items },
    target: null as LaneTrend["target"],
  };
  const satisfied = satisfactionSegments
    .filter((seg) => seg.label.includes("만족") && !seg.label.includes("불만족"))
    .reduce((sum, seg) => sum + seg.pct, 0);

  switch (id) {
    case "guinong": {
      const youth = last(youthData);
      return {
        ...base,
        // 10/3 정정: 귀농인은 연 1만 명 안팎이라 "0.84만 명"보다 명 단위가 읽기 쉽다
        seriesLabel: "귀농인",
        unit: "명",
        decimals: 0,
        points: populationData.map((d) => ({ year: d.year, value: toCount(d.farming) })),
        indicators: [
          { kind: "gauge", label: "청년 정착 비율", value: `${youth.ratio}%`, sub: `${youth.year}년 · 40세 미만`, pct: youth.ratio },
          {
            kind: "donut",
            label: "정착 만족도",
            value: `${satisfied}%`,
            sub: "매우 만족 + 만족",
            segments: satisfactionSegments,
          },
        ],
        source: joinSources(profile.source, satisfactionSummary.source),
      };
    }
    case "guichon": {
      const [a, b] = profile.stats;
      return {
        ...base,
        seriesLabel: "귀촌인",
        unit: "만 명",
        decimals: 1,
        points: populationData.map((d) => ({ year: d.year, value: d.rural })),
        indicators: [
          { kind: "gauge", label: a.label, value: a.value, sub: a.sub, pct: pctOf(a.value) },
          { kind: "gauge", label: b.label, value: b.value, sub: b.sub, pct: pctOf(b.value) },
        ],
        source: profile.source,
      };
    }
    case "youth": {
      const [a, b] = profile.stats;
      return {
        ...base,
        seriesLabel: "청년농 비율",
        unit: "%",
        decimals: 1,
        points: youthData.map((d) => ({ year: d.year, value: d.ratio })),
        indicators: [
          { kind: "stat", label: a.label, value: a.value, sub: a.sub },
          { kind: "stat", label: b.label, value: b.value, sub: b.sub },
        ],
        source: profile.source,
      };
    }
    case "forest": {
      const first = mountainData[0];
      const latest = last(mountainData);
      const [, b] = profile.stats;
      return {
        ...base,
        seriesLabel: "귀산촌 가구",
        unit: "가구",
        decimals: 0,
        points: mountainData.map((d) => ({ year: d.year, value: d.households })),
        indicators: [
          {
            kind: "stat",
            // 10/3 정정: 공식 귀산촌가구는 2018 43,155 → 2025 40,350(감소) — "증가율" 고정 라벨 제거, 부호는 값에서
            label: `${latest.year - first.year + 1}년간 변화`,
            value: signedPct(changePct(latest.households, first.households)),
            sub: `${first.year} → ${latest.year}`,
          },
          { kind: "stat", label: b.label, value: b.value, sub: b.sub },
        ],
        source: profile.source,
      };
    }
    case "smartfarm": {
      // 10/3 정정: '도입 농가 수' 시계열과 "2027 목표 1만 호"는 공식 근거가 없었다(정부 계획에 없음).
      // 공식 보급 면적(NABO 2017~2021 · 농식품부 2023, 2022 미공표)과 공식 목표(스마트온실 도입률
      // 2024 16% → 2030 35%, 2026 시행계획)로 바꾼다. 면적과 도입률은 단위가 달라 목표선은 그리지 않는다.
      return {
        ...base,
        seriesLabel: "스마트온실 면적",
        unit: "ha",
        decimals: 0,
        points: smartfarmAreaData.map((d) => ({ year: d.year, value: d.area })),
        target: null,
        indicators: [
          {
            kind: "gauge",
            label: "스마트온실 도입률",
            value: `${smartfarmAdoption.pct}%`,
            sub: `${smartfarmAdoption.year}년 · ${smartfarmAdoption.targetYear} 목표 ${smartfarmAdoption.targetPct}%`,
            pct: smartfarmAdoption.pct,
          },
          {
            kind: "stat",
            label: "도입 농가 생산량",
            value: signedPct(smartfarmEffect.output),
            sub: "시설원예 도입 전후 · 농식품부",
          },
        ],
        source: profile.source,
      };
    }
  }
}

/* ── 교육·체험 매칭 ── */

/**
 * 레인 ↔ 교육·체험 판정 규칙 (2026-10-02).
 * 지원사업 판정(`journey-lanes-stats.ts`)과 같은 원칙 — **제목(과 수집 출처·마을 유형 같은 구조화 필드)만** 본다.
 * 그린대로 수집 행은 description 이 전부 "그린대로 … 수집했어요" 같은 정형 문구라 본문 키워드는 신호가 없다.
 *  · 귀농: "귀농"(귀농귀촌·귀농산어촌 포함) 또는 영농 실무(재배·작물·농기계·병해충·농업일자리·창업농).
 *          단 "귀촌"만 있고 "귀농"이 없는 과정(예비귀촌인 특화)은 귀촌 쪽으로 보낸다
 *  · 귀촌: "귀촌"·전원/농촌생활·생활기술·빈집·농촌관광 — 농사가 생업이 아닌 정착
 *  · 귀산촌: 산촌·산어촌·산림·임업·임산물·산채·목본·약용·특용 (지원사업 FOREST_CORE 를 교육 어휘로 확장)
 *  · 청년농: 제목 "청년" 또는 수집 출처가 「똑똑!청년농부」(청년농 전용 포털)
 *  · 스마트팜: 스마트팜·스마트농업·수직농장·ICT·시설원예 (지원사업 SMARTFARM_TITLE·FACILITY 와 같은 축)
 */
const EDU_GUINONG = /귀농|재배|작물|농기계|트랙터|병해충|농업일자리|창업농|영농/;
const EDU_GUICHON = /귀촌|전원생활|농촌생활|생활기술|라이프스타일|빈집|농촌관광|살아보기|한달/;
const EDU_FOREST = /산촌|산어촌|산림|임업|임산물|산채|목본|약용|특용|산양삼/;
const EDU_SMARTFARM = /스마트\s?팜|스마트\s?농업|스마트\s?영농|수직농장|ICT|시설원예/;
const YOUTH_SOURCE = /똑똑!?\s?청년농부/;

function onlyGuichon(title: string): boolean {
  return /귀촌/.test(title) && !/귀농/.test(title);
}

const EDUCATION_RULES: Record<HubLaneId, (c: EducationCourse) => boolean> = {
  guinong: (c) => EDU_GUINONG.test(c.title) && !onlyGuichon(c.title),
  guichon: (c) => EDU_GUICHON.test(c.title),
  // 치유(산림치유·치유농업)는 정착이 아니라 휴양·복지 과정이라 귀산촌에서 뺀다(10/2 회장)
  forest: (c) => EDU_FOREST.test(c.title) && !/치유/.test(c.title),
  youth: (c) => /청년/.test(c.title) || YOUTH_SOURCE.test(c.description),
  smartfarm: (c) => EDU_SMARTFARM.test(c.title),
};

/** 체험은 그린대로 마을 유형(귀농형·귀촌형)이 1순위 신호, 없으면 제목 */
const EVENT_RULES: Record<HubLaneId, (e: FarmEvent) => boolean> = {
  guinong: (e) => e.villageType === "귀농형" || (!e.villageType && /귀농/.test(e.title)),
  guichon: (e) => e.villageType === "귀촌형" || (!e.villageType && /귀촌/.test(e.title)),
  forest: (e) => EDU_FOREST.test(e.title) || /숲/.test(e.title),
  youth: (e) => /청년/.test(e.title),
  smartfarm: (e) => EDU_SMARTFARM.test(e.title),
};

/**
 * 교육·체험 한 목록에 담는 최대치 — 페이지네이션 6건 × 4쪽. 넘치면 목록 페이지로 보낸다.
 * `matchLane*` 는 **상한 없이** 전체를 돌려준다 — 탭 배지(전체 건수)와 목록(상한까지)이 같은 배열에서 나오게(10/3).
 */
export const MAX_OPPORTUNITIES = 24;

const OPEN_RANK: Record<string, number> = { 모집중: 0, 접수중: 0, 모집예정: 1, 접수예정: 1 };

export function matchLaneEducation(courses: readonly EducationCourse[], id: HubLaneId): EducationCourse[] {
  return courses
    .filter((c) => c.status !== "마감" && c.linkStatus !== "broken" && EDUCATION_RULES[id](c))
    .sort(
      (a, b) =>
        (OPEN_RANK[a.status] ?? 2) - (OPEN_RANK[b.status] ?? 2) ||
        a.applicationEnd.localeCompare(b.applicationEnd),
    );
}

export function matchLaneEvents(events: readonly FarmEvent[], id: HubLaneId): FarmEvent[] {
  const seen = new Set<string>();
  return events
    .filter((e) => {
      if (e.status === "마감" || !EVENT_RULES[id](e)) return false;
      // 같은 공고가 회차별로 두 줄 수집되는 경우(춘천 팸투어 ×2, 일자만 다름) — 카드가 똑같아 보이므로 제목당 한 장.
      // 회차는 상세·원문에서 고른다.
      const key = e.title.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        (OPEN_RANK[a.status] ?? 2) - (OPEN_RANK[b.status] ?? 2) ||
        (a.applicationEnd ?? a.date).localeCompare(b.applicationEnd ?? b.date),
    );
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
  /** 대표 작물 비용 카드(일러스트 id 포함) — costType 이 null 이면 빈 배열 */
  costCards: LaneCostCard[];
  /** "왜 이 길을 택할까" 차트 구성 */
  trend: LaneTrend;
  /** 목록에 싣는 지원사업 — 상한 {@link MAX_PROGRAMS} 까지 */
  programs: SupportProgram[];
  /** 상한 전 전체 건수 = 타일 "N건"과 같은 수(탭 배지가 쓴다) */
  programsTotal: number;
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
  const matchedPrograms = sortLanePrograms(matchLanePrograms(programs, id));

  return {
    id,
    costType: hasCostRows ? (costType as CostTypeId) : null,
    trendKey: LANE_TREND[id],
    tiles: buildLaneStats([id], programs)[id],
    costCards: hasCostRows && costType ? costCardsFor(CROP_COSTS_BY_TYPE[costType]) : [],
    trend: laneTrendFor(id),
    programs: matchedPrograms.slice(0, MAX_PROGRAMS),
    programsTotal: matchedPrograms.length,
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
