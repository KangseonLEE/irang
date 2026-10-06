/**
 * 지역 상세(시·도 · 시·군·구 · 구) 목록 섹션 데이터 — 지원사업 · 정착 교육 · 체험·행사
 * (2026-10-06 QA1 Q1-F1 · Q1-W3)
 *
 * 종전: 시·군·구·구 상세는 정적 `EDUCATION_COURSES`·`EVENTS` 를 **손으로 적은 status** 로 거르고 그 값을
 * 배지로 그렸다 → 4/26 에 끝난 박람회가 10월에도 "접수중"(111쪽). DB 에만 있는 접수 중 행(그린대로
 * 살아보기 등)은 보이지 않았다. 시·도 상세는 async 로더를 썼지만 체험·행사만 정적이었다.
 *
 * 이제 세 목록 모두 같은 경로:
 *   async 로더(DB ∪ 정적) → 상태를 날짜에서 다시 파생 → 마감 제외 → 가까운 지역 먼저
 *   (시·군·구 → 시·도 → 전국) → 같은 범위 안에서는 마감 임박순.
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
import { deriveEventStatus, deriveStatus } from "@/lib/program-status";

/** 시·군·구 이름 — 수집 행의 `sigungu` 는 정식("청주시")·약칭("괴산") 둘 다 온다 */
export interface LocalArea {
  name: string;
  shortName: string;
}

export interface RegionListingContext {
  /** PROVINCES.name (행정구역명 SSOT) */
  provinceName: string;
  /** 시·군·구 상세면 그 시·군·구, 구 상세면 상위 시 */
  local?: LocalArea;
}

export interface RegionListings {
  programs: SupportProgram[];
  education: EducationCourse[];
  events: FarmEvent[];
}

/**
 * 행이 이 시·군·구 소속인가 — 정확히 같은 이름이거나 "수원시 장안구"처럼 이름 뒤에 하위 구가 붙은 경우만.
 * `includes` 로 비교하면 인천 동구 상세에서 "남동구" 행이 지역 행사로 잡힌다.
 */
export function isLocalRow(rowSigungu: string | undefined, local: LocalArea | undefined): boolean {
  const sg = rowSigungu?.trim();
  if (!sg || !local) return false;
  return [local.name, local.shortName].some((n) => n && (sg === n || sg.startsWith(`${n} `)));
}

interface RankOptions {
  /**
   * 다른 시·군·구 전용 행을 맨 뒤로 — 지원사업용. 시·군 사업은 대개 그 지역 주민만 신청할 수 있어
   * 가평 상세에서 안성시 공고가 전국 사업보다 앞서면 안 된다. 교육·행사는 다른 시·군에서도 들으러
   * 갈 수 있으니 시·도 범위로 둔다.
   */
  otherLocalLast?: boolean;
}

/** 0 = 그 시·군·구, 1 = 그 시·도, 2 = 전국(그 밖), 3 = 같은 시·도의 다른 시·군·구 전용(otherLocalLast) */
function regionTier(
  row: { region: string; sigungu?: string },
  ctx: RegionListingContext,
  options: RankOptions,
): 0 | 1 | 2 | 3 {
  if (row.region !== ctx.provinceName) return 2;
  if (isLocalRow(row.sigungu, ctx.local)) return 0;
  if (options.otherLocalLast && ctx.local && row.sigungu?.trim()) return 3;
  return 1;
}

/** 가까운 지역 먼저 — 같은 범위 안에서는 들어온 순서(마감 임박순)를 유지한다 */
export function rankByRegion<T extends { region: string; sigungu?: string }>(
  rows: readonly T[],
  ctx: RegionListingContext,
  options: RankOptions = {},
): T[] {
  return rows
    .map((row, i) => ({ row, i, tier: regionTier(row, ctx, options) }))
    .sort((a, b) => a.tier - b.tier || a.i - b.i)
    .map(({ row }) => row);
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
    programs: rankByRegion(sortPrograms(openPrograms(programs), "deadline"), ctx, {
      otherLocalLast: true,
    }),
    education: rankByRegion(sortEducation(openEducation(education), "deadline"), ctx),
    events: rankByRegion(sortEvents(openEvents(events), "deadline"), ctx),
  };
}
