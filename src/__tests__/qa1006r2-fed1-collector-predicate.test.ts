/**
 * 10/6 전체 QA 2차 — FE-D1: 수집기 기본값 판정은 하나다 (R2-Q1 ⚪).
 *
 * 1차에선 화면 표시가 `isCrawledRow`(crawl-* 만), 목록 필터가 programs.ts `hasCollectorDefaults`·education.ts
 * `isLevelUnknown`(crawl-* + rda-*)로 따로 판정해, Supabase 가 실패해 RDA API 폴백 행(rda-·rda-edu-)이 뜨면
 * 화면은 "보조금"·"초급"·"오프라인"을 보여 주는데 필터는 그 행을 '모름'으로 뺐다.
 * 이제 표시·필터·맞춤 점수가 전부 lib/programs/display.ts `hasCollectorDefaults` 하나를 쓴다.
 *
 * 네트워크 없이 — Supabase 는 실패, RDA API 는 고정 응답으로 바꿔 폴백 행을 실제 로더로 만든다.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return { ...actual, isSupabaseConfigured: false, getSupabase: vi.fn() };
});

/** vi.mock 팩토리는 파일 맨 위로 끌어올려지므로 고정 응답도 vi.hoisted 로 먼저 만든다 */
const { POLICIES, EDUS } = vi.hoisted(() => {
  const base = {
    contents: "<p>지원대상 : 만18세 이상 ~ 만39세 이하 청년농업인</p>",
    applStDt: "2026-01-01",
    applEdDt: "2099-12-31",
    eduTarget: null,
    area2Nm: null,
    chargeAgency: "농업기술센터",
    chargeDept: "",
    chargeTel: "",
  };
  const policy = (seq: string, title: string) => ({
    ...base,
    seq,
    typeDv: "policy" as const,
    title,
    area1Nm: "전남",
    infoUrl: "https://www.rda.go.kr/young/custom/policy/view.do?sId=1",
    totQuantity: null,
    price: null,
  });
  const edu = (seq: string, title: string) => ({
    ...base,
    seq,
    typeDv: "edu" as const,
    title,
    contents: "<p>교육내용: 비대면 실시간 강의</p>",
    area1Nm: "경북",
    infoUrl: "https://www.rda.go.kr/young/custom/education/view.do?sId=1",
    eduStDt: "2026-11-01",
    eduEdDt: "2026-11-02",
    eduTime: null,
    eduCnt: null,
    eduMethod: null,
    eduMethod2: null,
    eduMethod3: null,
  });
  return {
    POLICIES: [policy("901", "청년 스마트팜 창업 지원"), policy("902", "농기계 임대")],
    EDUS: [edu("801", "온라인 마케팅 교육"), edu("802", "농업기계 안전 교육")],
  };
});

vi.mock("@/lib/api/rda", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/rda")>("@/lib/api/rda");
  return {
    ...actual,
    fetchPolicies: vi.fn().mockResolvedValue(POLICIES),
    fetchEducation: vi.fn().mockResolvedValue(EDUS),
  };
});

import {
  displayAgeRange,
  displayEducationLevel,
  displayEducationType,
  displaySupportType,
  displayValue,
  hasCollectorDefaults,
  isCapacityKnown,
  isCrawledRow,
  isEducationTypeUnknown,
} from "@/lib/programs/display";
import { filterProgramsAsync, type SupportProgram } from "@/lib/data/programs";
import { filterEducationAsync, type EducationCourse } from "@/lib/data/education";

describe("hasCollectorDefaults — 수집 행과 RDA API 폴백 행", () => {
  it("crawl-*·rda-*·rda-edu-* 는 참, 큐레이션 행은 거짓", () => {
    for (const id of ["crawl-rda-programs-aaacd312", "crawl-greendaero-education-1e8e5362", "rda-901", "rda-edu-801"]) {
      expect(hasCollectorDefaults(id), id).toBe(true);
    }
    for (const id of ["SP-001", "ED-008", "evt-001", "", null, undefined]) {
      expect(hasCollectorDefaults(id), String(id)).toBe(false);
    }
  });

  it("isCrawledRow 는 종전 뜻(crawl-* 만) 그대로 — 다른 트랙의 import 가 깨지지 않는다", () => {
    expect(isCrawledRow("crawl-rda-programs-aaacd312")).toBe(true);
    expect(isCrawledRow("rda-901")).toBe(false);
  });

  it("RDA API 폴백 행의 기본값도 화면에 싣지 않는다", () => {
    expect(displaySupportType("rda-901", "보조금")).toBeNull();
    expect(displayAgeRange("rda-901", 18, 65)).toBeNull();
    expect(displayValue("rda-901", "공고문 참조")).toBeNull();
    expect(displayEducationLevel("rda-edu-801", "초급")).toBeNull();
    expect(displayEducationType("rda-edu-801", "오프라인")).toBeNull();
    expect(isEducationTypeUnknown("rda-edu-801")).toBe(true);
    expect(isCapacityKnown("rda-edu-801", null)).toBe(false);
  });
});

describe("표시와 목록 필터가 같은 행을 '모름'으로 본다 — RDA API 폴백 시나리오", () => {
  let programs: SupportProgram[] = [];
  let courses: EducationCourse[] = [];

  beforeAll(async () => {
    programs = (await filterProgramsAsync({})).programs;
    courses = (await filterEducationAsync({ includeClosed: true })).courses;
  });

  it("전제: 폴백 행이 실제 로더로 만들어진다", () => {
    expect(programs.some((p) => p.id === "rda-901")).toBe(true);
    expect(courses.some((c) => c.id === "rda-edu-801")).toBe(true);
  });

  it("지원 유형 '보조금' 필터 — 화면에 유형을 안 싣는 행은 필터에서도 빠진다", async () => {
    const { programs: grant } = await filterProgramsAsync({ supportType: "보조금" });
    const kept = new Set(grant.map((p) => p.id));
    for (const p of programs) {
      const shownAsGrant = displaySupportType(p.id, p.supportType) === "보조금";
      expect(kept.has(p.id), p.id).toBe(shownAsGrant);
    }
  });

  it("연령 필터 — 화면에 연령을 안 싣는 행은 연령을 골라도 나오지 않는다", async () => {
    const { programs: aged } = await filterProgramsAsync({ age: "19~29세" });
    expect(aged.length).toBeGreaterThan(0);
    expect(aged.some((p) => p.id.startsWith("rda-"))).toBe(false);
    for (const p of aged) expect(displayAgeRange(p.id, p.eligibilityAgeMin, p.eligibilityAgeMax), p.id).not.toBeNull();
  });

  it("교육 수준·방식 필터 — 화면에 안 싣는 행은 필터에서도 빠진다", async () => {
    const { courses: basic } = await filterEducationAsync({ includeClosed: true, level: "초급" });
    const { courses: offline } = await filterEducationAsync({ includeClosed: true, type: "오프라인" });
    const basicIds = new Set(basic.map((c) => c.id));
    const offlineIds = new Set(offline.map((c) => c.id));
    for (const c of courses) {
      expect(basicIds.has(c.id), c.id).toBe(displayEducationLevel(c.id, c.level) === "초급");
      expect(offlineIds.has(c.id), c.id).toBe(displayEducationType(c.id, c.type) === "오프라인");
    }
  });
});
