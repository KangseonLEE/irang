/**
 * 하이브리드 데이터 로더
 * - Supabase 설정 시 → DB에서 조회 (실시간 데이터)
 * - 미설정 시 → 기존 정적 .ts 파일 폴백
 *
 * 기존 인터페이스를 유지하므로 페이지 코드 변경 최소화
 */

import {
  getSupabase,
  isSupabaseConfigured,
  type ProgramRow,
  type EducationRow,
  type EventRow,
} from "@/lib/supabase";

import {
  PROGRAMS,
  filterPrograms as filterProgramsLocal,
  type SupportProgram,
  type ProgramFilters,
} from "./programs";

import {
  EDUCATION_COURSES,
  filterEducation as filterEducationLocal,
  type EducationCourse,
  type EducationFilters,
} from "./education";

import {
  EVENTS,
  filterEvents as filterEventsLocal,
  type FarmEvent,
  type EventFilters,
} from "./events";

// ─── 타입 재수출 ───
export type { SupportProgram, ProgramFilters };
export type { EducationCourse, EducationFilters };
export type { FarmEvent, EventFilters };

type DataSource = "supabase" | "static" | "rda_api";

interface LoadResult<T> {
  data: T[];
  source: DataSource;
}

// ═══════════════════════════════════════
// 1. 지원사업
// ═══════════════════════════════════════

export async function loadPrograms(
  filters?: ProgramFilters
): Promise<LoadResult<SupportProgram>> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      let query = sb.from("support_programs").select("*");

      if (filters?.region && filters.region !== "전체") {
        query = query.or(`region.eq.${filters.region},region.eq.전국`);
      }
      if (filters?.supportType && filters.supportType !== "전체") {
        query = query.eq("support_type", filters.supportType);
      }
      if (filters?.status && filters.status !== "전체") {
        query = query.eq("status", filters.status);
      }
      if (!filters?.includeClosed) {
        query = query.neq("status", "마감");
      }
      if (filters?.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,summary.ilike.%${filters.query}%`
        );
      }

      query = query
        .neq("link_status", "broken")
        .order("application_end", { ascending: true });

      const { data, error } = await query;

      if (!error && data) {
        const rows = data as unknown as ProgramRow[];
        const programs: SupportProgram[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          summary: row.summary,
          region: row.region,
          organization: row.organization,
          supportType: row.support_type as SupportProgram["supportType"],
          supportAmount: row.support_amount,
          eligibilityAgeMin: row.eligibility_age_min,
          eligibilityAgeMax: row.eligibility_age_max,
          eligibilityDetail: row.eligibility_detail,
          applicationStart: row.application_start,
          applicationEnd: row.application_end,
          status: row.status as SupportProgram["status"],
          relatedCrops: row.related_crops ?? [],
          sourceUrl: row.source_url,
          linkStatus: row.link_status as SupportProgram["linkStatus"],
          year: row.year,
        }));
        return { data: programs, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  // 정적 폴백
  const programs = filters ? filterProgramsLocal(filters) : PROGRAMS;
  return { data: programs, source: "static" };
}

// ═══════════════════════════════════════
// 2. 교육과정
// ═══════════════════════════════════════

export async function loadEducation(
  filters?: EducationFilters
): Promise<LoadResult<EducationCourse>> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      let query = sb.from("education_courses").select("*");

      if (filters?.region && filters.region !== "전체") {
        query = query.or(`region.eq.${filters.region},region.eq.전국`);
      }
      if (filters?.type && filters.type !== "전체") {
        query = query.eq("type", filters.type);
      }
      if (filters?.level && filters.level !== "전체") {
        query = query.eq("level", filters.level);
      }
      if (!filters?.includeClosed) {
        query = query.neq("status", "마감");
      }
      if (filters?.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      query = query
        .neq("link_status", "broken")
        .order("application_end", { ascending: true });

      const { data, error } = await query;

      if (!error && data) {
        const rows = data as unknown as EducationRow[];
        const courses: EducationCourse[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          region: row.region,
          organization: row.organization,
          type: row.type as EducationCourse["type"],
          duration: row.duration,
          schedule: row.schedule,
          target: row.target,
          cost: row.cost,
          description: row.description,
          capacity: row.capacity,
          applicationStart: row.application_start,
          applicationEnd: row.application_end,
          status: row.status as EducationCourse["status"],
          level: row.level as EducationCourse["level"],
          url: row.url,
          linkStatus: row.link_status as EducationCourse["linkStatus"],
        }));
        return { data: courses, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  const courses = filters
    ? filterEducationLocal(filters)
    : EDUCATION_COURSES;
  return { data: courses, source: "static" };
}

// ═══════════════════════════════════════
// 3. 행사/체험
// ═══════════════════════════════════════

export async function loadEvents(
  filters?: EventFilters
): Promise<LoadResult<FarmEvent>> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      let query = sb.from("farm_events").select("*");

      if (filters?.region && filters.region !== "전체") {
        query = query.or(`region.eq.${filters.region},region.eq.전국`);
      }
      if (filters?.type && filters.type !== "전체") {
        query = query.eq("type", filters.type);
      }
      if (!filters?.includeClosed) {
        query = query.neq("status", "마감");
      }
      if (filters?.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      query = query.order("date_start", { ascending: true });

      const { data, error } = await query;

      if (!error && data) {
        const rows = data as unknown as EventRow[];
        const events: FarmEvent[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          region: row.region,
          organization: row.organization,
          type: row.type as FarmEvent["type"],
          date: row.date_start,
          dateEnd: row.date_end,
          location: row.location,
          cost: row.cost,
          description: row.description,
          capacity: row.capacity,
          target: row.target,
          url: row.url,
          status: row.status as FarmEvent["status"],
        }));
        return { data: events, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  const events = filters ? filterEventsLocal(filters) : EVENTS;
  return { data: events, source: "static" };
}
