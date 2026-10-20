/**
 * 진단 진입 기록 (2026-10-20) — 클라이언트 기록(sessionStorage) + /api/assess 저장 + 마이그레이션 전 재시도.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const inserts: Record<string, unknown>[] = [];
let failFirstWith: string | null = null;
const fallbackLog = vi.fn(async () => {});

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      insert: async (payload: Record<string, unknown>) => {
        inserts.push(payload);
        if (failFirstWith && inserts.length === 1) {
          return { error: { code: "PGRST204", message: failFirstWith } };
        }
        return { error: null };
      },
    }),
  }),
  recordApiFallback: (...args: unknown[]) => fallbackLog(...(args as [])),
}));

import {
  entryPathGroup,
  buildAssessmentStats,
} from "@/lib/admin/assessment-stats";
import {
  isValidEntryPath,
  noteVisitedPath,
  readAssessEntry,
  rememberAssessEntry,
  resultClickTarget,
} from "@/lib/assess-entry";
import { POST as assessPost } from "@/app/api/assess/route";
import { QUICK_QUESTIONS } from "@/lib/data/quick-check";
import type { AssessmentRow } from "@/lib/admin/types";

let ipSeq = 0;
function post(body: unknown) {
  ipSeq += 1;
  return new NextRequest("https://irangfarm.com/api/assess", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0 Chrome/124.0",
      "x-real-ip": `10.1.0.${ipSeq}`,
    }),
    body: JSON.stringify(body),
  });
}

const quickBody = (extra: Record<string, unknown>) => ({
  id: "abcDEF123_-y",
  answers: Object.fromEntries(QUICK_QUESTIONS.map((q) => [q.id, q.options[0].id])),
  source: "quick",
  persona: "balanced",
  top_regions: [],
  top_crops: [],
  recommended_programs: [],
  referrer: null,
  ...extra,
});

beforeEach(() => {
  sessionStorage.clear();
  inserts.length = 0;
  failFirstWith = null;
  fallbackLog.mockClear();
});

describe("클라이언트 진입 기록", () => {
  it("진입 버튼 라벨은 1시간 안에만, 직전 경로는 진단 화면을 건너뛴다", () => {
    const t0 = 1_000_000;
    rememberAssessEntry("crop_detail_top", t0);
    noteVisitedPath("/crops/apple");
    noteVisitedPath("/match");
    noteVisitedPath("/assess/result/abc");
    expect(readAssessEntry(t0 + 59 * 60_000)).toMatchObject({ entry_from: "crop_detail_top", entry_path: "/crops/apple" });
    expect(readAssessEntry(t0 + 61 * 60_000).entry_from).toBeNull();
  });

  it("형식에 안 맞는 라벨·경로는 남기지 않는다", () => {
    rememberAssessEntry("Crop Detail<script>");
    noteVisitedPath("/search?q=사과");
    expect(readAssessEntry()).toMatchObject({ entry_from: null, entry_path: null });
    expect(isValidEntryPath("/crops/apple")).toBe(true);
    expect(isValidEntryPath("https://evil.example/")).toBe(false);
  });

  it("깨진 저장값은 무시한다", () => {
    sessionStorage.setItem("irang-assess-entry", "{not json");
    expect(readAssessEntry().entry_from).toBeNull();
  });

  it("결과 화면 링크 → 이동한 곳", () => {
    const o = "https://irangfarm.com";
    expect(resultClickTarget("/regions/jeonnam", o)).toBe("region");
    expect(resultClickTarget("/crops/apple?x=1", o)).toBe("crop");
    expect(resultClickTarget("/programs/SP-001", o)).toBe("program");
    expect(resultClickTarget("/match?mode=assess", o)).toBe("next_assess");
    expect(resultClickTarget("https://www.rda.go.kr/", o)).toBe("external");
    expect(resultClickTarget("/stats", o)).toBe("other");
  });
});

describe("/api/assess 진입 기록 저장", () => {
  it("올바른 값은 그대로, 틀린 값은 null 로 저장한다", async () => {
    await assessPost(post(quickBody({ entry_from: "crop_detail_top", entry_path: "/crops/apple" })));
    expect(inserts[0]).toMatchObject({ entry_from: "crop_detail_top", entry_path: "/crops/apple" });

    inserts.length = 0;
    await assessPost(post(quickBody({ id: "abcDEF123_-z", entry_from: "DROP TABLE", entry_path: "javascript:alert(1)" })));
    expect(inserts[0]).toMatchObject({ entry_from: null, entry_path: null });
  });

  it("마이그레이션 전(entry 컬럼 없음)이면 진입 기록만 빼고 다시 저장한다", async () => {
    failFirstWith = "Could not find the 'entry_from' column of 'assessment_results' in the schema cache";
    const res = await assessPost(post(quickBody({ entry_from: "crops_list" })));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(inserts).toHaveLength(2);
    expect(inserts[1]).not.toHaveProperty("entry_from");
    expect(inserts[1]).toMatchObject({ source: "quick", persona: "balanced" });
    expect(fallbackLog).toHaveBeenCalledTimes(1);
  });
});

describe("어드민 진입 집계", () => {
  it("직전 경로를 화면 단위로 묶는다", () => {
    expect(entryPathGroup("/")).toBe("/");
    expect(entryPathGroup("/crops")).toBe("/crops");
    expect(entryPathGroup("/crops/apple")).toBe("/crops/*");
    expect(entryPathGroup("/regions/gyeongbuk/pohang")).toBe("/regions/*");
  });

  it("진입 기록이 있는 행만 센다", () => {
    const base = {
      farm_type_id: null,
      answers: {},
      top_regions: [],
      top_crops: [],
      referrer: null,
      user_agent: null,
      age_group: null,
      source: "quick" as const,
      persona: "balanced",
      created_at: "2026-10-20T00:00:00Z",
    };
    const rows: AssessmentRow[] = [
      { ...base, id: "a", entry_from: "crop_detail_top", entry_path: "/crops/apple" },
      { ...base, id: "b", entry_from: null, entry_path: "/crops/pear" },
      { ...base, id: "c" },
    ];
    const stats = buildAssessmentStats(rows, 0, []);
    expect(stats.entryRecorded).toBe(2);
    expect(stats.byEntryFrom).toEqual({ crop_detail_top: 1 });
    expect(stats.byEntryPath).toEqual({ "/crops/*": 2 });
  });
});

describe("첫 방문 꼬리표 (utm)", () => {
  it("세션 첫 꼬리표만 남기고 결과 저장 때 같이 읽힌다", async () => {
    const { captureLandingTags } = await import("@/lib/assess-entry");
    captureLandingTags("?utm_source=kakao&utm_medium=share&utm_campaign=assess_result");
    captureLandingTags("?utm_source=google"); // 두 번째는 무시
    expect(readAssessEntry()).toMatchObject({ utm_source: "kakao", utm_medium: "share" });
  });

  it("꼬리표가 없거나 형식이 틀리면 남기지 않는다", async () => {
    const { captureLandingTags } = await import("@/lib/assess-entry");
    captureLandingTags("?q=사과");
    captureLandingTags("?utm_source=<b>");
    expect(readAssessEntry().utm_source).toBeNull();
  });

  it("API 는 utm 을 저장하고, 컬럼이 없으면 빼고 다시 저장한다", async () => {
    await assessPost(post(quickBody({ id: "abcDEF123_-u", utm_source: "kakao", utm_medium: "share" })));
    expect(inserts[0]).toMatchObject({ utm_source: "kakao", utm_medium: "share" });

    inserts.length = 0;
    failFirstWith = "Could not find the 'utm_source' column of 'assessment_results' in the schema cache";
    const res = await assessPost(post(quickBody({ id: "abcDEF123_-v", utm_source: "kakao" })));
    expect(res.status).toBe(200);
    expect(inserts[1]).not.toHaveProperty("utm_source");
  });
});

describe("공유 링크 꼬리표", () => {
  it("채널·내용을 붙이고 기존 쿼리는 지킨다", async () => {
    const { tagShareUrl } = await import("@/lib/share-tag");
    const tagged = new URL(tagShareUrl("https://irangfarm.com/regions/jeonnam?tab=climate", "kakao", "region"));
    expect(tagged.searchParams.get("tab")).toBe("climate");
    expect(tagged.searchParams.get("utm_source")).toBe("kakao");
    expect(tagged.searchParams.get("utm_medium")).toBe("share");
    expect(tagged.searchParams.get("utm_campaign")).toBe("region");
    expect(tagShareUrl("not a url", "kakao", "x")).toBe("not a url");
  });
});
