/**
 * 히어로 여정 레인 — 선택 패널의 "데이터 특징" 타일 (2026-09-29 회장 S2).
 *
 * 값은 전부 **우리 데이터에서 서버가 계산**한다(하드코딩 숫자 0). page.tsx(Server)가 한 번 계산해
 * 직렬화 가능한 형태로 넘기고, 클라이언트는 그리기만 한다.
 * 각 타일에 `source` 를 함께 두는 건 "데이터에는 반드시 근거가 있어야 한다"(CLAUDE.md) 원칙.
 */

import { CROPS, type CropInfo } from "./crops";
import { PROGRAMS, type SupportProgram } from "./programs";
import { SIGUNGUS } from "./sigungus";
import { CROP_COSTS_BY_TYPE } from "./cost-by-type";
import { getCropPersonaFit, getProgramPersonaFit } from "./persona-fit";
import {
  populationData,
  populationSummary,
  mountainData,
  mountainSummary,
  smartfarmData,
  smartfarmSummary,
  youthData,
  youthSummary,
} from "./stats";
import { deriveStatus, isUnannounced } from "../program-status";
import type { PersonaId } from "./personas";
import type { CostTypeId } from "./landing";

interface LaneTile {
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

/* ── 레인 ↔ 기존 분류 매핑 ── */

const LANE_PERSONA: Record<string, PersonaId | undefined> = {
  guinong: "family",
  guichon: "commuter",
  youth: "farmYouth",
};

const LANE_COST_TYPE: Record<string, CostTypeId | undefined> = {
  guinong: "farming",
  guichon: "village", // 데이터 0건 — 타일 생략
  forest: "forestry",
  youth: "youth",
  smartfarm: "smartfarm",
};

/** 임산물 계열 작물 — 귀산촌 난이도 산출 대상 (CROPS 카테고리엔 '임산물'이 없어 이름으로 고정) */
const FOREST_CROP_NAMES = new Set([
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

function isForestProgram(p: SupportProgram): boolean {
  const head = `${p.title} ${p.summary}`;
  if (SMARTFARM_TITLE.test(p.title)) return false;
  return FOREST_CORE.test(head) || MUSHROOM.test(p.title);
}

function isSmartfarmProgram(p: SupportProgram): boolean {
  if (SMARTFARM_TITLE.test(p.title)) return true;
  return FACILITY.test(`${p.title} ${p.summary}`) && !/노지/.test(p.summary);
}

/* ── 공통 계산 ── */

/**
 * "지금 볼 수 있는" 지원사업 — 마감은 빼고, 일자 미확정(9999 페어)이라도 연례 창구형
 * (`applicationCycle`: "매년 12월 시·군·구 접수")은 남긴다. 목록·상세가 "정기 접수"로 보여 주는 건들이다(9/27).
 */
function activePrograms(programs: readonly SupportProgram[]): SupportProgram[] {
  return programs.filter((p) => {
    if (deriveStatus(p.applicationStart, p.applicationEnd) === "마감") return false;
    if (isUnannounced(p.applicationStart, p.applicationEnd)) return Boolean(p.applicationCycle);
    return true;
  });
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
function topCropsFor(persona: PersonaId, n = 5): CropInfo[] {
  return [...CROPS]
    .map((crop) => ({ crop, score: getCropPersonaFit(crop)[persona] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.crop);
}

/**
 * "300만~500만 원" · "1.5억~2.5억 원" · "1억 5,000만 원" → 만원 단위 중앙값.
 * 비용 데이터는 단일값 금지(범위 표기) 규칙이라 항상 두 토큰이다.
 */
export function parseCostRangeMan(text: string): number | null {
  const parts = text.split("~");
  const values = parts
    .map((raw) => {
      const t = raw.replace(/\s|원/g, "");
      const eok = /([\d.,]+)억/.exec(t);
      const man = /([\d,]+)만/.exec(t);
      let v = 0;
      if (eok) v += Number(eok[1].replace(/,/g, "")) * 10_000;
      if (man) v += Number(man[1].replace(/,/g, ""));
      return v;
    })
    .filter((v) => v > 0);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** 만원 → "1,800만 원" · "1.3억 원" */
function formatMan(man: number): string {
  if (man >= 10_000) {
    const eok = Math.round((man / 10_000) * 10) / 10;
    return `${eok >= 10 ? Math.round(eok) : eok}억 원`;
  }
  return `${(Math.round(man / 100) * 100).toLocaleString()}만 원`;
}

function pct(now: number, before: number): string {
  const v = ((now / before - 1) * 100).toFixed(1);
  return `${Number(v) >= 0 ? "+" : ""}${v}%`;
}

/* ── 레인별 타일 ── */

function programTile(programs: SupportProgram[], laneId: string): LaneTile {
  const active = activePrograms(programs);
  const persona = LANE_PERSONA[laneId];
  let matched: SupportProgram[];

  if (persona) {
    matched = active.filter((p) => getProgramPersonaFit(p)[persona] >= 4);
  } else if (laneId === "forest") {
    matched = active.filter(isForestProgram);
  } else if (laneId === "smartfarm") {
    matched = active.filter(isSmartfarmProgram);
  } else {
    matched = active;
  }

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
      source: `농촌진흥청 ICT 스마트팜 단가 · ${list.length}종 평균`,
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
      label: `${a.year}년 귀농 인구`,
      source: populationSummary.source,
    };
  }
  if (laneId === "guichon") {
    const a = last(populationData);
    const b = prev(populationData);
    return {
      value: pct(a.rural, b.rural),
      label: `${a.year}년 귀촌 인구`,
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
    const a = last(smartfarmData);
    const b = prev(smartfarmData);
    return {
      value: pct(a.farms, b.farms),
      label: `${a.year}년 도입 농가`,
      source: smartfarmSummary.source,
    };
  }
  // undecided — 귀농·귀촌을 합쳐 본 전체 흐름
  const a = last(populationData);
  const b = prev(populationData);
  return {
    value: pct(a.farming + a.rural, b.farming + b.rural),
    label: `${a.year}년 농촌 이주`,
    source: populationSummary.source,
  };
}

function costTile(laneId: string): LaneTile | null {
  const type = LANE_COST_TYPE[laneId];
  if (!type) return null;
  const crops = CROP_COSTS_BY_TYPE[type];
  const values = crops.map((c) => parseCostRangeMan(c.initialCost)).filter((v): v is number => v !== null);
  if (!values.length) return null; // village 은 작물 데이터가 없어 타일을 만들지 않는다
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  /* 대표 1건만 적으면 나머지 출처를 숨기는 셈이라 "외 N" 으로 몇 곳이 섞였는지 드러낸다.
     전부 나열하면 타일 폭(≈150px)에서 4줄로 늘어져 선택 화면 높이를 밀어낸다(9/29 실측) */
  const sources = [...new Set(crops.map((c) => c.source))];
  return {
    value: formatMan(avg),
    label: "초기 투자금 평균",
    source: sources.length > 1 ? `${sources[0]} 외 ${sources.length - 1}` : sources[0],
  };
}

/** 비용 타일이 없는 레인을 위한 보완 타일 */
function extraTile(laneId: string): LaneTile | null {
  if (laneId === "guichon") {
    const count = Object.values(SIGUNGUS).flat().length;
    return {
      value: `${count}곳`,
      label: "비교할 시·군·구",
      source: "행정안전부 행정구역 · 이랑 정착 점수",
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
