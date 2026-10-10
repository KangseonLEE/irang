/**
 * 히어로 여정 레인 — 선택 패널의 "데이터 특징" 타일 (2026-09-29 회장 S2).
 *
 * 값은 전부 **우리 데이터에서 서버가 계산**한다(하드코딩 숫자 0). page.tsx(Server)가 한 번 계산해
 * 직렬화 가능한 형태로 넘기고, 클라이언트는 그리기만 한다.
 * 각 타일에 `source` 를 함께 두는 건 "데이터에는 반드시 근거가 있어야 한다"(CLAUDE.md) 원칙.
 */

import { hasCollectorDefaults } from "@/lib/programs/display";
import { CROPS, type CropInfo } from "./crops";
import { PROGRAMS, type SupportProgram } from "./programs";
import { CROP_COSTS_BY_TYPE } from "./cost-by-type";
import { getCropPersonaFit, getProgramPersonaFit } from "./persona-fit";
import {
  populationData,
  populationSummary,
  mountainData,
  mountainSummary,
  smartfarmAreaData,
  smartfarmSummary,
  youthData,
  youthSummary,
  settlementSurvey,
  investmentByAge,
  mountainVillageArea,
  smartfarmAdoption,
} from "./stats";
import { deriveStatus, isUnannounced } from "../program-status";
import type { PersonaId } from "./personas";
import type { CostTypeId } from "./landing";

export interface LaneTile {
  /** 큰 값 — "12건", "보통", "+9.1%" */
  value: string;
  /** 값이 무엇인지 */
  label: string;
  /** 작은 글씨 출처 */
  source: string;
}

export type LaneStats = Record<string, LaneTile[]>;

/**
 * 출처 문구 축약 — 타일 폭(≈150px)에서 3~4줄로 늘어져 선택 화면 높이를 44px 밀어냈다(1366 실측).
 * 기관 정식명 → 통용 약칭만 바꾼다(내용을 버리지 않는다).
 */
function shortenSource(text: string): string {
  return text
    .replace(/농촌진흥청/g, "농진청")
    .replace(/농림축산식품부/g, "농식품부")
    .replace(/행정안전부/g, "행안부")
    .replace(/농축산물 표준소득자료집/g, "표준소득자료집")
    .replace(/스마트팜 시설 단가/g, "스마트팜 단가")
    .replace(/청년창업농 인기품목 통계/g, "청년창업농 통계")
    .replace(/\s*\+\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ── 레인 ↔ 기존 분류 매핑 ──
   아래 매핑·판정 함수는 선택 패널(타일)과 `/start` 허브(journey-lanes-hub.ts)가 **같은 것**을 써야 한다.
   같은 레인이 화면마다 다른 건수를 보이면 그 자체가 오표시다(9/23 매칭 SSOT 교훈). */

export const LANE_PERSONA: Record<string, PersonaId | undefined> = {
  guinong: "family",
  guichon: "commuter",
  youth: "farmYouth",
};

export const LANE_COST_TYPE: Record<string, CostTypeId | undefined> = {
  guinong: "farming",
  guichon: "village", // 작물 행 0건 — 투자액 타일만(실태조사 귀촌 가구)
  forest: "forestry",
  youth: "youth",
  smartfarm: "smartfarm",
};

/** 임산물 계열 작물 — 귀산촌 난이도 산출 대상 (CROPS 카테고리엔 '임산물'이 없어 이름으로 고정) */
export const FOREST_CROP_NAMES = new Set([
  "표고버섯",
  "느타리버섯",
  "새송이버섯",
  "도라지",
  "더덕",
  "오미자",
  "밤",
  "호두",
  "인삼",
]);

/**
 * 레인 판정 규칙 (2026-09-29 QA 지적 후 교체).
 * `description` 은 보지 않는다 — 본문에 스친 단어까지 세면 오탐이 난다.
 *  · SP-060(스마트팜 에너지절감): summary 에 "버섯"이 있어 귀산촌에도 잡히던 것 → 제목에 스마트팜이 있으면 제외
 *  · SP-061(전남 연작장해): 제목 괄호의 "시설원예" 때문에 스마트팜에 잡히던 것 → summary 에 노지가 있으면 제외
 */
const FOREST_CORE = /산촌|임업|임산물|산림|산양삼/;
const MUSHROOM = /버섯|표고/;
const SMARTFARM_TITLE = /스마트\s?팜|ICT/;
const FACILITY = /온실|시설원예/;

/**
 * 수집 행(crawl-*·RDA API 폴백 rda-*)의 summary 는 원문 공고 발췌(지원대상·자격 문구)라 분류 신호로 쓰지 않는다 — 10/3 수집기가
 * 요약을 원문 발췌로 바꾸자 남원 면세유 사업이 지원대상의 "시설원예작물" 때문에 스마트팜에 잡혔다.
 * 큐레이션 행만 summary 까지 본다. 판정은 화면 표시·필터·맞춤 점수와 같은 `hasCollectorDefaults` (10/6 QA R2).
 */
function isCrawledProgram(p: SupportProgram): boolean {
  return hasCollectorDefaults(p.id);
}

export function isForestProgram(p: SupportProgram): boolean {
  const head = isCrawledProgram(p) ? p.title : `${p.title} ${p.summary}`;
  if (SMARTFARM_TITLE.test(p.title)) return false;
  return FOREST_CORE.test(head) || MUSHROOM.test(p.title);
}

export function isSmartfarmProgram(p: SupportProgram): boolean {
  if (SMARTFARM_TITLE.test(p.title)) return true;
  if (isCrawledProgram(p)) return FACILITY.test(p.title) && !/노지/.test(p.title);
  return FACILITY.test(`${p.title} ${p.summary}`) && !/노지/.test(p.summary);
}

/* ── 공통 계산 ── */

/**
 * "지금 볼 수 있는" 지원사업 — 마감은 빼고, 일자 미확정(9999 페어)이라도 연례 창구형
 * (`applicationCycle`: "매년 12월 시·군·구 접수")은 남긴다. 목록·상세가 "정기 접수"로 보여 주는 건들이다(9/27).
 * 원문 링크가 깨진 DB 행은 `/programs` 목록처럼 뺀다 — 허브가 DB 로더를 쓰면서 같은 기준이 필요해졌다(10/3).
 */
export function activePrograms(programs: readonly SupportProgram[]): SupportProgram[] {
  return programs.filter((p) => {
    if (p.linkStatus === "broken") return false;
    if (deriveStatus(p.applicationStart, p.applicationEnd) === "마감") return false;
    if (isUnannounced(p.applicationStart, p.applicationEnd)) return Boolean(p.applicationCycle);
    return true;
  });
}

/**
 * 레인 규칙에 맞는 "지금 볼 수 있는" 지원사업 — 타일 건수와 허브 목록의 **단일 출처**.
 * 페르소나가 있는 레인(귀농·귀촌·청년농)은 적합도 4+ 로, 없는 레인은 키워드 판정으로 고른다.
 */
export function matchLanePrograms(
  programs: readonly SupportProgram[],
  laneId: string,
): SupportProgram[] {
  const active = activePrograms(programs);
  const persona = LANE_PERSONA[laneId];
  if (persona) return active.filter((p) => getProgramPersonaFit(p)[persona] >= 4);
  if (laneId === "forest") return active.filter(isForestProgram);
  if (laneId === "smartfarm") return active.filter(isSmartfarmProgram);
  return active;
}

const DIFFICULTY_SCORE: Record<string, number> = { 쉬움: 1, 보통: 2, 어려움: 3 };
const DIFFICULTY_LABEL = ["쉬움", "보통", "어려움"];

/** 작물 난이도 평균 → 라벨. 상위 N종만 본다(전체 평균은 레인 차이를 지운다) */
function averageDifficulty(crops: CropInfo[]): { label: string; names: string[] } {
  if (!crops.length) return { label: "보통", names: [] };
  const avg = crops.reduce((sum, c) => sum + (DIFFICULTY_SCORE[c.difficulty] ?? 2), 0) / crops.length;
  return { label: DIFFICULTY_LABEL[Math.min(2, Math.max(0, Math.round(avg) - 1))], names: crops.map((c) => c.name) };
}

/** 페르소나 적합도 상위 N 작물 */
export function topCropsFor(persona: PersonaId, n = 5): CropInfo[] {
  return [...CROPS]
    .map((crop) => ({ crop, score: getCropPersonaFit(crop)[persona] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.crop);
}

function pct(now: number, before: number): string {
  const v = ((now / before - 1) * 100).toFixed(1);
  return `${Number(v) >= 0 ? "+" : ""}${v}%`;
}

/* ── 레인별 타일 ── */

function programTile(programs: SupportProgram[], laneId: string): LaneTile {
  const matched = matchLanePrograms(programs, laneId);
  return {
    value: `${matched.length}건`,
    label: "지금 볼 수 있는 지원사업",
    source: "이랑 지원사업 DB",
  };
}

function difficultyTile(laneId: string): LaneTile | null {
  if (laneId === "undecided") {
    return {
      value: "진단으로",
      label: "진입 난이도",
      source: "이랑 유형 진단",
    };
  }
  const persona = LANE_PERSONA[laneId];
  let crops: CropInfo[];
  if (laneId === "forest") {
    crops = CROPS.filter((c) => FOREST_CROP_NAMES.has(c.name));
  } else if (laneId === "smartfarm") {
    // 스마트팜 주력 작물은 CROPS 이름과 표기가 달라(예: "상추·엽채류") 비용 데이터의 난이도를 직접 쓴다
    const list = CROP_COSTS_BY_TYPE.smartfarm;
    const avg = list.reduce((sum, c) => sum + (DIFFICULTY_SCORE[c.difficulty] ?? 2), 0) / (list.length || 1);
    return {
      value: DIFFICULTY_LABEL[Math.min(2, Math.max(0, Math.round(avg) - 1))],
      label: "진입 난이도",
      source: `이랑 작물 DB · ${list.length}종 평균`,
    };
  } else if (persona) {
    crops = topCropsFor(persona);
  } else {
    return null;
  }
  const { label, names } = averageDifficulty(crops);
  if (!names.length) return null;
  return {
    value: label,
    label: "진입 난이도",
    source: `이랑 작물 DB · ${names.length}종 평균`,
  };
}

function trendTile(laneId: string): LaneTile | null {
  const last = <T,>(arr: readonly T[]) => arr[arr.length - 1];
  const prev = <T,>(arr: readonly T[]) => arr[arr.length - 2];

  if (laneId === "guinong") {
    const a = last(populationData);
    const b = prev(populationData);
    return {
      value: pct(a.farming, b.farming),
      // 10/3 정정: 귀농인(등록 본인)·귀촌인(동반가구원 포함)은 세는 방식이 달라 "인구"로 뭉뚱그리지 않는다
      label: `${a.year}년 귀농인`,
      source: populationSummary.source,
    };
  }
  if (laneId === "guichon") {
    const a = last(populationData);
    const b = prev(populationData);
    return {
      value: pct(a.rural, b.rural),
      label: `${a.year}년 귀촌인`,
      source: populationSummary.source,
    };
  }
  if (laneId === "forest") {
    const a = last(mountainData);
    const b = prev(mountainData);
    return {
      value: pct(a.households, b.households),
      label: `${a.year}년 귀산촌 가구`,
      source: mountainSummary.source,
    };
  }
  if (laneId === "youth") {
    const a = last(youthData);
    return {
      value: `${a.ratio}%`,
      label: "청년 정착 비율",
      source: youthSummary.source,
    };
  }
  if (laneId === "smartfarm") {
    // 10/3 정정: '도입 농가 수' 시계열은 공식 근거가 없어 공식 보급 면적(ha)으로. 2022년 값이 없어
    // (NABO 2017~2021 + 농식품부 2023) 전년 대비는 계산하지 않고 최신 면적을 그대로 보여 준다.
    const a = last(smartfarmAreaData);
    return {
      value: `${a.area.toLocaleString("ko-KR")}ha`,
      label: `${a.year}년 스마트온실 면적`,
      source: smartfarmSummary.source,
    };
  }
  // undecided — 귀농·귀촌을 합쳐 본 전체 흐름. 농식품부 "귀농귀촌 인구" 관례(귀농가구원 + 귀촌인) — 귀촌인이
  // 동반가구원까지 세므로 짝도 귀농가구원이어야 셈법이 맞는다(10/3)
  const a = last(populationData);
  const b = prev(populationData);
  return {
    value: pct(a.farmingMembers + a.rural, b.farmingMembers + b.rural),
    label: `${a.year}년 농촌 이주`,
    source: populationSummary.source,
  };
}

/**
 * 비용 타일 — 실태조사 투자액(농지·가축·시설). 10/10 정정: 예전엔 비용 화면 작물 행의 '초기 투자금' 범위를 평균했는데
 * 그 범위에 원문이 없어 지웠다. 공식 투자액이 있는 귀농·귀촌·청년(30대 이하)만 만들고, 귀산촌·스마트팜은 보완 타일로 넘긴다.
 */
function costTile(laneId: string): LaneTile | null {
  const type = LANE_COST_TYPE[laneId];
  const source = `농림축산식품부 ${settlementSurvey.year} 귀농귀촌 실태조사`;
  const man = (n: number) => `${n.toLocaleString("ko-KR")}만 원`;
  if (type === "farming") return { value: man(settlementSurvey.investment), label: "평균 투자액", source: `${source} · 귀농 가구` };
  if (type === "village") return { value: man(settlementSurvey.ruralInvestment), label: "평균 투자액", source: `${source} · 귀촌 가구` };
  if (type === "youth") {
    const young = investmentByAge[0];
    return { value: man(young.amount), label: `${young.age} 평균 투자액`, source };
  }
  return null;
}

/** 비용 타일이 없는 레인을 위한 보완 타일 */
function extraTile(laneId: string): LaneTile | null {
  /* 10/10: 귀촌은 실태조사 투자액 타일이 생겨 시·군·구 수 보완 타일이 필요 없어졌다.
     귀산촌·스마트팜은 공식 투자액이 없어 '규모' 지표로 채운다 — 화면 비교 표 4번째 행 "투자액 · 규모" */
  if (laneId === "forest") {
    return {
      value: `${mountainVillageArea.eupmyeon}곳`,
      label: "산촌 읍·면",
      source: `산림청 ${mountainVillageArea.year} 산촌기초조사`,
    };
  }
  if (laneId === "smartfarm") {
    return {
      value: `${smartfarmAdoption.pct}%`,
      label: "스마트온실 도입률",
      source: `농림축산식품부 · ${smartfarmAdoption.year}`,
    };
  }
  if (laneId === "undecided") {
    return {
      value: `${CROPS.length}종`,
      label: "진단 뒤 볼 작물",
      source: "이랑 작물 DB",
    };
  }
  return null;
}

/**
 * 레인별 타일 3~4개. 순서는 지원사업 → 난이도 → 추세 → 비용(또는 보완).
 * 데이터가 없는 타일은 조용히 빠지고, 화면은 3개만 받아도 성립한다.
 */
export function buildLaneStats(laneIds: readonly string[], programs: readonly SupportProgram[] = PROGRAMS): LaneStats {
  const list = [...programs];
  const out: LaneStats = {};
  for (const id of laneIds) {
    out[id] = [programTile(list, id), difficultyTile(id), trendTile(id), costTile(id) ?? extraTile(id)]
      .filter((t): t is LaneTile => t !== null)
      .map((t) => ({ ...t, source: shortenSource(t.source) }));
  }
  return out;
}
