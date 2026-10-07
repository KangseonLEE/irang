/**
 * 10/6 QA2 R2-Q2 F1 (= R2-Q4 F-a) — 지역 상세가 다른 시·군 전용 지원사업을 추천하던 회귀.
 *
 * 1차 수정(region-listings)이 `row.sigungu` 칸만 보고 시·군을 갈라, 칸이 빈 큐레이션 시·군 사업(SP-035 공주·SP-070 당진·
 * SP-074 서산·SP-049 진안·SP-044/045 괴산·SP-053 거창·SP-073 합천…)이 "시·도 공통"으로 잡혀 전국 사업보다 앞에 섰다
 * (시·군·구 101쪽 + 구 15쪽, 추천 783칸 중 244칸, 운영은 0). 이제 검색 패널과 같은 판정기(localSigunguIdsOf)로 가른다.
 *
 * 실제 로더(filterProgramsAsync → loadPrograms: DB 우선 + 정적 병합)를 그대로 쓰고, DB 는 수집 행 몇 개를 돌려주는 대역이다.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return { ...actual, isSupabaseConfigured: true, getSupabase: vi.fn() };
});
vi.mock("@/lib/api/rda", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/rda")>("@/lib/api/rda");
  return {
    ...actual,
    fetchPolicies: vi.fn().mockResolvedValue(null),
    fetchEducation: vi.fn().mockResolvedValue(null),
  };
});

import { getSupabase } from "@/lib/supabase";
import { loadRegionListings, type RegionListingContext } from "@/app/regions/[id]/region-listings";
import { localSigunguIdsOf } from "@/lib/data/entity-panel";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
import { makeSupabaseDouble, programRow } from "./fixtures/qa1006-feb-supabase";

/** 수집 행 — 시·군 칸으로만 시·군을 알 수 있는 경우와 제목으로 아는 경우를 섞는다 */
const CRAWLED_PROGRAMS = [
  programRow("crawl-rda-programs-anseong", {
    region: "경기도",
    sigungu: "안성",
    title: "2026년 농업기계 등화장치 부착지원 사업 추가신청 공고",
    organization: "안성시청",
    application_start: "2026-09-01",
    application_end: "2026-10-20",
  }),
  programRow("crawl-rda-programs-gapyeong", {
    region: "경기도",
    sigungu: "가평군",
    title: "귀농인 농가주택 수리비 지원 공고",
    organization: "농업기술센터",
    application_start: "2026-09-01",
    application_end: "2026-11-30",
  }),
  programRow("crawl-rda-programs-gyeonggi", {
    region: "경기도",
    sigungu: null,
    title: "경기도 청년 농업인 영농 정착 지원",
    organization: "경기도청",
    application_start: "2026-09-01",
    application_end: "2026-12-31",
  }),
];

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // KST 2026-10-06 12:00 — 상태(마감 여부)를 고정
  vi.setSystemTime(new Date("2026-10-06T03:00:00Z"));
  vi.mocked(getSupabase).mockReturnValue(
    makeSupabaseDouble({
      support_programs: CRAWLED_PROGRAMS,
      education_courses: [],
      farm_events: [],
    }) as unknown as ReturnType<typeof getSupabase>,
  );
});

afterAll(() => {
  vi.useRealTimers();
});

type Scope = "own" | "other" | "shared" | "national";

function scopeOf(
  p: { region: string; title: string; organization: string; sigungu?: string },
  provinceName: string,
  sigunguId: string,
): Scope {
  if (p.region !== provinceName) return "national";
  const ids = localSigunguIdsOf(p);
  if (ids.length === 0) return "shared";
  return ids.includes(sigunguId) ? "own" : "other";
}

const RANK: Record<Scope, number> = { own: 0, shared: 1, national: 2, other: 9 };

function contextOf(sidoId: string, sigunguId: string): RegionListingContext & { sigunguId: string } {
  const province = PROVINCES.find((p) => p.id === sidoId)!;
  const sg = SIGUNGUS.find((s) => s.sidoId === sidoId && s.id === sigunguId)!;
  return {
    provinceName: province.name,
    local: { id: sg.id, name: sg.name, shortName: sg.shortName },
    sigunguId: sg.id,
  };
}

async function topPrograms(sidoId: string, sigunguId: string, n = 3) {
  const { programs } = await loadRegionListings(contextOf(sidoId, sigunguId));
  return programs.slice(0, n).map((p) => p.id);
}

describe("시·군·구·구 상세 — 다른 시·군 전용 지원사업 0", () => {
  it(`전 시·군·구 ${SIGUNGUS.length}곳: 목록 어디에도 다른 시·군 전용이 없고, 이 시·군 전용이 맨 앞`, async () => {
    const offenders: string[] = [];
    for (const sg of SIGUNGUS) {
      const ctx = contextOf(sg.sidoId, sg.id);
      const { programs } = await loadRegionListings(ctx);
      const ranks = programs.map((p) => RANK[scopeOf(p, ctx.provinceName, sg.id)]);
      if (ranks.includes(RANK.other)) offenders.push(`${sg.sidoId}/${sg.id}: other`);
      if (ranks.some((r, i) => i > 0 && r < ranks[i - 1])) offenders.push(`${sg.sidoId}/${sg.id}: 순서`);
    }
    expect(offenders).toEqual([]);
  });

  it(`전 구 ${GUS.length}곳: 상위 시 기준으로 같은 규칙`, async () => {
    const offenders: string[] = [];
    for (const gu of GUS) {
      const ctx = contextOf(gu.sidoId, gu.parentSigunguId);
      const { programs } = await loadRegionListings(ctx);
      if (programs.some((p) => scopeOf(p, ctx.provinceName, gu.parentSigunguId) === "other")) {
        offenders.push(`${gu.sidoId}/${gu.parentSigunguId}/${gu.id}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("QA 재현 지면의 상위 3 — 천안·예천·무주 (공주·당진·서산·안동·고령·진안 사업이 서던 곳)", async () => {
    // 정적 데이터 기준(대역 DB 엔 경기 수집 행만) — 운영 DB 에선 SP-011 마감일이 정해져 있어 그 사업이 맨 앞에 온다
    expect(await topPrograms("chungnam", "cheonan")).toEqual(["SP-001", "SP-002", "SP-011"]);
    expect(await topPrograms("gyeongbuk", "yecheon")).toEqual(["SP-001", "SP-002", "SP-011"]);
    expect(await topPrograms("jeonbuk", "muju")).toEqual(["SP-063", "SP-001", "SP-002"]);

    // QA 가 본 다른 시·군 사업은 목록 어디에도 없다
    const all = async (sidoId: string, sigunguId: string) =>
      (await loadRegionListings(contextOf(sidoId, sigunguId))).programs.map((p) => p.id);
    const cheonan = await all("chungnam", "cheonan");
    for (const id of ["SP-035", "SP-070", "SP-074"]) expect(cheonan).not.toContain(id);
    expect(await all("jeonbuk", "muju")).not.toContain("SP-049");
    expect(await all("chungbuk", "cheongju")).not.toEqual(expect.arrayContaining(["SP-044"]));
    expect(await all("chungbuk", "cheongju")).not.toEqual(expect.arrayContaining(["SP-045"]));
  });

  it("이 시·군 전용은 맨 앞 — 공주 상세의 SP-035, 가평 상세의 가평 수집 행", async () => {
    expect((await topPrograms("chungnam", "gongju", 1))[0]).toBe("SP-035");
    const gapyeong = await loadRegionListings(contextOf("gyeonggi", "gapyeong"));
    const ids = gapyeong.programs.map((p) => p.id);
    expect(ids[0]).toBe("crawl-rda-programs-gapyeong");
    expect(ids).toContain("crawl-rda-programs-gyeonggi");
    expect(ids).not.toContain("crawl-rda-programs-anseong");
  });
});

describe("시·도 상세 — 시·도 공통 → 전국 → 도 안의 시·군 전용", () => {
  it("17개 시·도 모두 범위 순서를 지킨다", async () => {
    const offenders: string[] = [];
    for (const province of PROVINCES) {
      const { programs } = await loadRegionListings({ provinceName: province.name });
      const ranks = programs.map((p) => {
        if (p.region !== province.name) return 1;
        return localSigunguIdsOf(p).length === 0 ? 0 : 2;
      });
      if (ranks.some((r, i) => i > 0 && r < ranks[i - 1])) offenders.push(province.id);
    }
    expect(offenders).toEqual([]);
  });

  it("경기: 시·군 수집 행(안성·가평)은 시·도 공통·전국 뒤로", async () => {
    const { programs } = await loadRegionListings({ provinceName: "경기도" });
    const ids = programs.map((p) => p.id);
    const firstLocal = Math.min(ids.indexOf("crawl-rda-programs-anseong"), ids.indexOf("crawl-rda-programs-gapyeong"));
    const lastNational = Math.max(...programs.map((p, i) => (p.region === "전국" ? i : -1)));
    expect(ids[0]).toBe("crawl-rda-programs-gyeonggi");
    expect(firstLocal).toBeGreaterThan(lastNational);
  });

  it("경북 상위 6칸에 도 안의 시·군 전용 사업이 없다 (QA2: 6칸 중 4칸)", async () => {
    const { programs } = await loadRegionListings({ provinceName: "경상북도" });
    const top6 = programs.slice(0, 6);
    expect(top6.filter((p) => p.region === "경상북도" && localSigunguIdsOf(p).length > 0)).toEqual([]);
  });
});
