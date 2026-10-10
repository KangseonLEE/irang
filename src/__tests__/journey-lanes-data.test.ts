import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { JOURNEY_GATES, JOURNEY_LANES, START_LANES } from "@/lib/data/journey-lanes";
import { buildLaneStats } from "@/lib/data/journey-lanes-stats";
import { normalizeSearchParams, LIST_PAGE_NORMALIZE_OPTIONS } from "@/lib/search-params/normalize";

/**
 * 정착 유형(레인) 데이터 계약 — 히어로 유형 카드(hero-search-hub)·/start 비교·/start/[lane] 허브가 함께 쓴다.
 *
 * 10/3 QA(A⚪1): 9/29 히어로 레인 컴포넌트(components/landing/journey-lanes.tsx)는 라우트에서 도달하지 않아 삭제했다.
 * 그 컴포넌트를 렌더하던 테스트(hero-journey-lanes.test.tsx)에서 **화면 단언만 빼고** 살아 있는 데이터·계산 단언은
 * 그대로 옮겼다 — 타일 계산(buildLaneStats)은 히어로 유형 카드 수치의 단일 출처라 가드가 계속 필요하다.
 */

const LANE_IDS = START_LANES.map((l) => l.id);
const stats = buildLaneStats(LANE_IDS);

describe("정착 유형 레인 데이터 (9/29 S·S2 → 10/3 데이터만)", () => {
  it("레인 5종 순서·이름과 게이트 2장 라벨", () => {
    expect(START_LANES.length).toBe(5);
    expect(JOURNEY_GATES.length).toBe(2);
    expect(LANE_IDS).toEqual(["guinong", "guichon", "forest", "youth", "smartfarm"]);
    expect(START_LANES.map((l) => l.label)).toEqual(["귀농", "귀촌", "귀산촌", "청년농", "스마트팜"]);
    expect(JOURNEY_GATES.map((l) => l.label)).toEqual(["목적이 있어요", "아직 고르는 중"]);
  });

  it("레인 5장은 허브로, 게이트 2장은 비교 화면으로 간다", () => {
    for (const lane of START_LANES) expect(lane.href).toBe(`/start/${lane.id}`);
    for (const gate of JOURNEY_GATES) expect(gate.href).toBe("/start");
  });

  it("레인마다 소개글(intro)이 있고 카피 톤을 지킨다", () => {
    for (const lane of START_LANES) {
      expect(lane.intro.length, lane.id).toBeGreaterThan(60);
      expect(lane.intro, lane.id).not.toMatch(/합니다|입니다/); // copywriting.md
      expect(lane.intro, lane.id).not.toBe(lane.desc); // 카드 한 줄과 다른 글
    }
  });

  it("난이도 타일은 '진입 난이도' 로 부른다 (재배가 아닌 길의 난이도)", () => {
    for (const id of LANE_IDS) {
      const labels = stats[id].map((t) => t.label);
      expect(labels, id).toContain("진입 난이도");
      expect(labels.join(" "), id).not.toContain("재배 난이도");
    }
  });

  it("href 쿼리는 normalize 화이트리스트를 통과한다", () => {
    for (const lane of [...JOURNEY_GATES, ...START_LANES]) {
      const [path, query] = lane.href.split("?");
      const options = LIST_PAGE_NORMALIZE_OPTIONS[path];
      if (!options) continue; // 정규화 대상이 아닌 경로(/match·/search·/guide/*)는 미들웨어가 건드리지 않는다
      const result = normalizeSearchParams(new URLSearchParams(query ?? ""), options);
      expect(result.changed, `${lane.href} 가 normalize 에서 변형됨`).toBe(false);
    }
  });

  it("라우트가 실제로 존재한다", () => {
    expect(existsSync(join(process.cwd(), "src", "app", "start", "page.tsx"))).toBe(true);
    expect(existsSync(join(process.cwd(), "src", "app", "start", "[lane]", "page.tsx"))).toBe(true);
  });

  it("포스터는 목적 레인 5장에만 있고 public 에 실존한다 — undecided·게이트는 이미지 필드가 없다 (10/3)", () => {
    // /start 비교 썸네일·/start/<id> 허브 띠가 그리는 포스터 — 타입으로 필수, 실존은 여기와 CI H-2 가 본다
    // (런타임 fs 판정은 서버 번들이 public/ 전체를 추적하던 원인이라 없앴다)
    for (const lane of START_LANES) {
      expect(lane.image, lane.id).toMatch(/^\/landing\/lanes\/[a-z-]+\.webp$/);
      expect(lane.alt.length, `${lane.id} 포스터 설명`).toBeGreaterThan(0);
      expect(existsSync(join(process.cwd(), "public", lane.image)), `${lane.id} 포스터 실존`).toBe(true);
    }
    // 포스터를 그리는 화면이 없는 카드에는 이미지 경로를 두지 않는다 — 그리지 않는 파일이 public 에 남지 않게
    const purposeIds = new Set(START_LANES.map((l) => l.id));
    const others = [...JOURNEY_LANES, ...JOURNEY_GATES].filter((l) => !purposeIds.has(l.id));
    expect(others.map((l) => l.id).sort()).toEqual(["decided", "undecided", "undecided"]);
    for (const lane of others) {
      expect(Object.keys(lane).filter((k) => /image|alt$/i.test(k)), lane.id).toEqual([]);
    }
  });

  it("출처 문구는 타일 폭 안에서 읽히도록 약칭으로 줄인다", () => {
    const sources = Object.values(stats).flatMap((tiles) => tiles.map((t) => t.source));
    expect(sources.some((s) => s.includes("농식품부"))).toBe(true);
    for (const s of sources) {
      expect(s, s).not.toMatch(/농촌진흥청|농림축산식품부|행정안전부/);
      expect(s.length, s).toBeLessThanOrEqual(30);
    }
  });
});

describe("레인 데이터 타일 — 서버 계산 (9/29 S2)", () => {
  it("레인마다 타일 3~4개, 값·라벨·근거·출처가 모두 채워진다", () => {
    for (const id of LANE_IDS) {
      const tiles = stats[id];
      expect(tiles.length, id).toBeGreaterThanOrEqual(3);
      expect(tiles.length, id).toBeLessThanOrEqual(4);
      for (const t of tiles) {
        for (const k of ["value", "label", "source"] as const) {
          expect(t[k].length, `${id}.${k}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("지원사업 건수는 같은 산식을 다시 돌려도 일치하고, 마감 건은 빠진다", async () => {
    const { PROGRAMS } = await import("@/lib/data/programs");
    const { getProgramPersonaFit } = await import("@/lib/data/persona-fit");
    const { deriveStatus, isUnannounced } = await import("@/lib/program-status");
    const active = PROGRAMS.filter((p) => {
      if (deriveStatus(p.applicationStart, p.applicationEnd) === "마감") return false;
      if (isUnannounced(p.applicationStart, p.applicationEnd)) return Boolean(p.applicationCycle);
      return true;
    });
    const expected = active.filter((p) => getProgramPersonaFit(p)["family"] >= 4).length;
    expect(stats.guinong[0].value).toBe(`${expected}건`);
    // 마감 건이 섞이면 전체 건수보다 커진다
    expect(active.length).toBeLessThan(PROGRAMS.length);
  });

  it("추세 타일은 stats.ts 공식 통계로 계산된다 (스마트팜은 최근 연도 스마트온실 보급 면적, 10/3 정정)", async () => {
    const { populationData, mountainData, smartfarmAreaData } = await import("@/lib/data/stats");
    // 부호는 구현과 같은 규칙 — 양수만 "+", 음수는 값의 "-" 그대로. 예전 단언은 "+" 를 고정으로 붙여
    // 감소한 유형(귀농 -2.2%)이 생기자 "+-2.2%" 를 기대하며 깨졌다(10/3 옮기며 확인, 데이터 문제 아님)
    const yoy = (a: number, b: number) => {
      const v = ((a / b - 1) * 100).toFixed(1);
      return `${Number(v) >= 0 ? "+" : ""}${v}%`;
    };
    const pop = populationData.slice(-2);
    const mtn = mountainData.slice(-2);
    expect(stats.guinong[2].value).toBe(yoy(pop[1].farming, pop[0].farming));
    expect(stats.guichon[2].value).toBe(yoy(pop[1].rural, pop[0].rural));
    expect(stats.forest[2].value).toBe(yoy(mtn[1].households, mtn[0].households));
    // 스마트팜은 근거 없던 "도입 농가 증감" 대신 공식 보급 면적(10/3 데이터 정정) — 증감률이 아니라 최근 연도 면적
    expect(stats.smartfarm[2].value).toBe(`${smartfarmAreaData[smartfarmAreaData.length - 1].area.toLocaleString("ko-KR")}ha`);
  });

  it("레인 판정은 제목·요약만 본다 — 오탐 2건 회귀 (9/29 QA)", async () => {
    const { PROGRAMS } = await import("@/lib/data/programs");
    // 규칙은 stats 모듈이 SSOT — 테스트가 다시 구현하면 둘이 갈라진다
    const { activePrograms, isForestProgram, isSmartfarmProgram } = await import(
      "@/lib/data/journey-lanes-stats"
    );
    const active = activePrograms(PROGRAMS);
    const forest = active.filter(isForestProgram);
    const smartfarm = active.filter(isSmartfarmProgram);
    const ids = (list: typeof active) => list.map((p) => p.id);
    expect(ids(forest)).toContain("SP-057"); // 임산물생산단지
    expect(ids(forest)).not.toContain("SP-060"); // 스마트팜 에너지절감 — summary 의 "버섯" 오탐
    expect(ids(smartfarm)).not.toContain("SP-061"); // 전남 연작장해 — 제목 괄호 "시설원예" 오탐(실체 노지)
    expect(ids(forest).filter((id) => ids(smartfarm).includes(id))).toEqual([]); // 교집합 0
    // 타일 건수가 위 집합과 일치해야 규칙이 한 곳에만 있다
    expect(stats.forest[0].value).toBe(`${forest.length}건`);
    expect(stats.smartfarm[0].value).toBe(`${smartfarm.length}건`);
  });

  it("추세 출처는 해당 통계의 출처를 그대로 쓴다", async () => {
    const { youthSummary, mountainSummary } = await import("@/lib/data/stats");
    expect(stats.youth[2].source).toBe(youthSummary.source.replace(/농림축산식품부/, "농식품부"));
    expect(stats.forest[2].source).toBe(mountainSummary.source);
  });

  it("타일은 화면에 그리는 필드만 갖는다 — 안 쓰는 note 가 RSC 페이로드에 실리지 않게", () => {
    for (const tiles of Object.values(stats)) {
      for (const t of tiles) expect(Object.keys(t).sort()).toEqual(["label", "source", "value"]);
    }
  });

  /* 10/10: 작물 비용 표의 '초기 투자금' 범위 평균(원문 없음) → 실태조사 투자액 */
  it("투자액 타일은 실태조사 값과 같고, 공식 투자액이 없는 레인엔 안 뜬다", async () => {
    const { settlementSurvey, investmentByAge } = await import("@/lib/data/stats");
    const man = (n: number) => `${n.toLocaleString("ko-KR")}만 원`;
    expect(stats.guinong[3]).toMatchObject({ label: "평균 투자액", value: man(settlementSurvey.investment) });
    expect(stats.guichon[3]).toMatchObject({ label: "평균 투자액", value: man(settlementSurvey.ruralInvestment) });
    expect(stats.youth[3]).toMatchObject({ value: man(investmentByAge[0].amount) });
    for (const id of ["forest", "smartfarm"]) {
      expect(stats[id].some((t) => t.label.includes("투자액")), id).toBe(false);
    }
  });
});
