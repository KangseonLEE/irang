/**
 * 지역 상세(시·도 · 시·군·구 · 구) 목록 섹션 데이터 — 지원사업 · 정착 교육 · 체험·행사
 * (2026-10-06 QA1 Q1-F1 · Q1-W3, QA2 R2-Q2 F1)
 *
 * 종전: 시·군·구·구 상세는 정적 `EDUCATION_COURSES`·`EVENTS` 를 **손으로 적은 status** 로 거르고 그 값을
 * 배지로 그렸다 → 4/26 에 끝난 박람회가 10월에도 "접수중"(111쪽). DB 에만 있는 접수 중 행(그린대로
 * 살아보기 등)은 보이지 않았다. 시·도 상세는 async 로더를 썼지만 체험·행사만 정적이었다.
 *
 * 이제 세 목록 모두 같은 경로:
 *   async 로더(DB ∪ 정적) → 상태를 날짜에서 다시 파생 → 마감 제외 → 마감 임박순 → 지역 범위 순.
 *
 * 지역 범위는 검색 패널과 같은 판정기(`localSigunguIdsOf` — 제목·주관 기관·시·군·구 칸에서 그 시·도의 실제
 * 시·군·구를 찾는다)로 가른다. QA2: 1차 수정이 `row.sigungu` 칸만 봐서, 칸이 빈 큐레이션 시·군 사업(SP-035 공주·
 * SP-070 당진…)이 "시·도 공통"으로 잡혀 시·군·구 상세 783칸 중 244칸을 다른 시·군 사업이 차지했다.
 *
 * 상태를 여기서 한 번 더 파생하는 이유: 로더가 DB `status` 컬럼을 그대로 실어 오는 경로가 있으면
 * (수집 시점 값) 지난 항목이 "모집중"으로 남는다. 파생은 멱등이라 로더가 이미 파생해도 결과가 같다.
 * 로더에는 `includeClosed: true` 로 요청한다 — 로더 쪽 status 로 먼저 거르면 실제로는 열린 행이
 * 빠질 수 있어서, 마감 판정은 파생 뒤 여기서 한 번만 한다.
 */
import {
  filterProgramsAsync,
  sortPrograms,
  type SupportProgram,
} from "@/lib/data/programs";
import {
  filterEducationAsync,
  sortEducation,
  type EducationCourse,
} from "@/lib/data/education";
import {
  filterEventsAsync,
  sortEvents,
  type FarmEvent,
} from "@/lib/data/events";
import { localSigunguIdsOf } from "@/lib/data/entity-panel";
import { deriveEventStatus, deriveStatus } from "@/lib/program-status";

/** 지금 보고 있는 시·군·구 (구 상세면 상위 시) — id 는 SIGUNGUS.id */
interface LocalArea {
  id: string;
  name: string;
  shortName: string;
}

export interface RegionListingContext {
  /** PROVINCES.name (행정구역명 SSOT) */
  provinceName: string;
  /** 시·군·구 상세면 그 시·군·구, 구 상세면 상위 시. 시·도 상세는 없음 */
  local?: LocalArea;
}

export interface RegionListings {
  programs: SupportProgram[];
  education: EducationCourse[];
  events: FarmEvent[];
}

/**
 * 행의 지역 범위.
 * - own: 지금 보는 시·군·구 전용 / other: 같은 시·도의 다른 시·군·구 전용
 * - local: 시·도 상세에서 본 "시·도 안의 시·군·구 전용"
 * - shared: 시·도 공통 / national: 전국(또는 다른 시·도)
 */
export type RegionScope = "own" | "other" | "local" | "shared" | "national";

interface ScopedRow {
  region: string;
  title: string;
  organization: string;
  sigungu?: string;
}

export function regionScopeOf(row: ScopedRow, ctx: RegionListingContext): RegionScope {
  if (row.region !== ctx.provinceName) return "national";
  const ids = localSigunguIdsOf({
    region: row.region,
    title: row.title,
    organization: row.organization,
    sigungu: row.sigungu,
  });
  if (ids.length === 0) return "shared";
  if (!ctx.local) return "local";
  return ids.includes(ctx.local.id) ? "own" : "other";
}

/**
 * 범위별 순서. 같은 순위 안에서는 들어온 순서(마감 임박순)를 지킨다. 순위 null = 목록에서 뺀다.
 *
 * 지원사업 — 시·군 사업은 대개 그 시·군 주민만 신청할 수 있다.
 *   시·군·구·구 상세: 이 시·군 → 시·도 공통 → 전국, 다른 시·군 전용은 뺀다 (검색 패널과 같은 규칙)
 *   시·도 상세: 시·도 공통 → 전국 → 도 안의 시·군 전용 (경북 6칸 중 4칸을 시·군 사업이 차지하던 것)
 * 교육·체험·행사 — 대상이 시·군에 묶이기보다 그 시·군에서 열리는 것이라(서울 송파·서초 강의, 청도 캠프)
 *   다른 시·군 것도 시·도 범위로 남긴다: 이 시·군 → 시·도(다른 시·군 포함) → 전국.
 */
const PROGRAM_RANK: Record<RegionScope, number | null> = {
  own: 0,
  shared: 1,
  national: 2,
  local: 3,
  other: null,
};

const VENUE_RANK: Record<RegionScope, number | null> = {
  own: 0,
  shared: 1,
  other: 1,
  local: 1,
  national: 2,
};

function rankRows<T extends ScopedRow>(
  rows: readonly T[],
  ctx: RegionListingContext,
  rank: Record<RegionScope, number | null>,
): T[] {
  return rows
    .map((row, i) => ({ row, i, r: rank[regionScopeOf(row, ctx)] }))
    .filter((x): x is { row: T; i: number; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(({ row }) => row);
}

/** 지원사업 범위 정렬 — 시·군·구 상세면 다른 시·군 전용을 뺀다 */
function rankProgramsByRegion<T extends ScopedRow>(rows: readonly T[], ctx: RegionListingContext): T[] {
  return rankRows(rows, ctx, PROGRAM_RANK);
}

/** 교육·체험·행사 범위 정렬 — 이 시·군 것을 앞으로, 나머지는 그대로 */
export function rankVenuesByRegion<T extends ScopedRow>(rows: readonly T[], ctx: RegionListingContext): T[] {
  return rankRows(rows, ctx, VENUE_RANK);
}

/** 날짜로 상태를 다시 파생하고 마감을 뺀다 */
function openPrograms(rows: readonly SupportProgram[], today?: string): SupportProgram[] {
  return rows
    .map((p) => ({ ...p, status: deriveStatus(p.applicationStart, p.applicationEnd, today) }))
    .filter((p) => p.status !== "마감");
}

function openEducation(rows: readonly EducationCourse[], today?: string): EducationCourse[] {
  return rows
    .map((c) => ({ ...c, status: deriveStatus(c.applicationStart, c.applicationEnd, today) }))
    .filter((c) => c.status !== "마감");
}

function openEvents(rows: readonly FarmEvent[]): FarmEvent[] {
  return rows
    .map((e) => ({ ...e, status: deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd) }))
    .filter((e) => e.status !== "마감");
}

/** 지역 상세 세 목록 — 개수 자르기는 호출하는 페이지가 한다 */
export async function loadRegionListings(ctx: RegionListingContext): Promise<RegionListings> {
  const filters = { region: ctx.provinceName, includeClosed: true } as const;
  const [programsResult, educationResult, eventsResult] = await Promise.allSettled([
    filterProgramsAsync(filters),
    filterEducationAsync(filters),
    filterEventsAsync(filters),
  ]);

  const programs =
    programsResult.status === "fulfilled" ? programsResult.value.programs : [];
  const education =
    educationResult.status === "fulfilled" ? educationResult.value.courses : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value.events : [];

  return {
    programs: rankProgramsByRegion(sortPrograms(openPrograms(programs), "deadline"), ctx),
    education: rankVenuesByRegion(sortEducation(openEducation(education), "deadline"), ctx),
    events: rankVenuesByRegion(sortEvents(openEvents(events), "deadline"), ctx),
  };
}
