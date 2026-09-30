import { describe, it, expect } from "vitest";

import { buildEntityPanel } from "@/lib/data/entity-panel";
import {
  searchAllGrouped,
  resolveSearchDisplay,
  buildCropPanel,
  buildSearchAnswer,
} from "@/lib/data/search-index";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import { deriveStatus, deriveEventStatus } from "@/lib/program-status";

/**
 * 엔티티 지식 패널 계약 (2026-09-30 회장 지시)
 *
 * 여기서 잡으려는 것은 **특정 판정**과 **총 건수 불변식**이다 — 픽셀은 Playwright 실측이 본다.
 *  - 시·군·구·시·도·지원사업·교육·행사가 하나로 특정되면 그 종류의 패널
 *  - 복합 검색어("횡성 귀농")·동음("광주")·작물명("사과")은 패널 없음
 *  - 패널이 흡수한 카드만큼 히어로로 되돌리므로 총 건수는 패널 유무와 무관하게 같다
 */

/** 마감되지 않은 첫 항목 — 마감 항목은 패널 대상이 아니라 픽스처로 못 쓴다 */
const openCourse = EDUCATION_COURSES.find(
  (c) => deriveStatus(c.applicationStart, c.applicationEnd) !== "마감",
);
const openEvent = EVENTS.find(
  (e) => deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd) !== "마감",
);

describe("buildEntityPanel — 종류 판정", () => {
  it("'횡성군' → 시·군·구 패널 (시·도 브레드크럼 + 상세·비교 CTA)", () => {
    const panel = buildEntityPanel("횡성군");
    expect(panel?.kind).toBe("sigungu");
    expect(panel?.title).toBe("횡성군");
    expect(panel?.overline).toBe("강원도");
    expect(panel?.ctas.map((c) => c.href)).toEqual([
      "/regions/gangwon/hoengseong",
      "/regions/compare?regions=gangwon:hoengseong",
    ]);
    // 지역 카드 자신을 흡수한다 (검색 인덱스 시·군·구 id = `${sidoId}-${sigunguId}`)
    expect(panel?.absorbKeys).toContain("region-gangwon-hoengseong");
  });

  it("약칭 '횡성'도 같은 시·군·구로 특정된다", () => {
    expect(buildEntityPanel("횡성")?.title).toBe("횡성군");
  });

  it("'강원도' → 시·도 패널 (시·군·구 수 + 시·군·구 칩)", () => {
    const panel = buildEntityPanel("강원도");
    expect(panel?.kind).toBe("province");
    expect(panel?.title).toBe("강원도");
    expect(panel?.facts.some((f) => f.label === "시·군·구")).toBe(true);
    const sigunguLine = panel?.lines.find((l) => l.label === "시·군·구");
    expect(sigunguLine?.links?.length).toBeGreaterThan(0);
    expect(panel?.absorbKeys).toContain("region-province-gangwon");
  });

  it("SP-001 제목 정확 검색 → 지원사업 패널 (접수 시기·상태 라벨 SSOT·원문 링크)", () => {
    const program = PROGRAMS.find((p) => p.id === "SP-001");
    expect(program).toBeDefined();
    const panel = buildEntityPanel(program!.title);
    expect(panel?.kind).toBe("program");
    // 9999 페어 + applicationCycle → "정기 접수" (programStatusLabel SSOT)
    expect(panel?.statusLabel).toBe("정기 접수");
    expect(panel?.facts.find((f) => f.label === "접수 시기")?.value).toBe(
      program!.applicationCycle,
    );
    expect(panel?.source?.href).toBe(program!.sourceUrl);
    expect(panel?.absorbKeys).toEqual(["program-SP-001"]);
  });

  it("범용 사업(관련 작물 55종)은 칩을 늘어놓지 않고 한 줄로 안내한다", () => {
    const program = PROGRAMS.find((p) => p.id === "SP-001")!;
    const line = buildEntityPanel(program.title)?.lines.find((l) => l.label === "관련 작물");
    expect(line?.chips).toEqual(["작물 구분 없이 신청할 수 있어요"]);
    expect(line?.links).toBeUndefined();
  });

  it("교육 과정 제목 정확 검색 → 교육 패널", () => {
    expect(openCourse).toBeDefined();
    const panel = buildEntityPanel(openCourse!.title);
    expect(panel?.kind).toBe("education");
    // 주관 기관 overline 은 제목이 그 기관명으로 시작하면 생략한다 (같은 말 두 줄 방지)
    const expectedOverline = openCourse!.title.startsWith(openCourse!.organization)
      ? undefined
      : openCourse!.organization;
    expect(panel?.overline).toBe(expectedOverline);
    expect(panel?.absorbKeys).toEqual([`education-${openCourse!.id}`]);
    expect(panel?.ctas[0].href).toBe(`/education/${openCourse!.id}`);
  });

  it("체험·행사 제목 정확 검색 → 행사 패널", () => {
    expect(openEvent).toBeDefined();
    const panel = buildEntityPanel(openEvent!.title);
    expect(panel?.kind).toBe("event");
    expect(panel?.facts.some((f) => f.label === "행사일")).toBe(true);
    expect(panel?.absorbKeys).toEqual([`event-${openEvent!.id}`]);
    expect(panel?.ctas[0].href).toBe(`/events/${openEvent!.id}`);
  });
});

describe("buildEntityPanel — 특정되지 않으면 패널 없음", () => {
  it("복합 검색어 '횡성 귀농'", () => {
    expect(buildEntityPanel("횡성 귀농")).toBeNull();
  });

  it.each(["광주", "중구", "고성", "제주", "세종", "동구", "서구", "남구", "북구", "강서구"])(
    "동음 지역명 '%s'",
    (q) => {
      expect(buildEntityPanel(q)).toBeNull();
    },
  );

  it("작물명은 작물 지식 패널이 담당한다", () => {
    expect(buildEntityPanel("사과")).toBeNull();
    expect(buildCropPanel("사과")).not.toBeNull();
  });

  it("부분 일치·존재하지 않는 이름", () => {
    expect(buildEntityPanel("횡성군청")).toBeNull();
    expect(buildEntityPanel("없는지역군")).toBeNull();
    expect(buildEntityPanel("")).toBeNull();
  });

  it("마감된 지원사업은 패널을 만들지 않는다 (검색 인덱스와 같은 기준)", () => {
    const closed = PROGRAMS.find(
      (p) => deriveStatus(p.applicationStart, p.applicationEnd) === "마감",
    );
    if (!closed) return; // 전건 활성이면 검증 대상 없음
    expect(buildEntityPanel(closed.title)).toBeNull();
  });
});

describe("총 건수 불변식 — 패널이 흡수한 만큼 히어로로 되돌린다", () => {
  const queries = ["횡성군", "강원도", "순천시", "횡성", "광주", "횡성 귀농"];

  it.each(queries)("'%s' 히트 수가 패널 유무와 같다", (q) => {
    const groups = searchAllGrouped(q);
    const results = [...groups.pinned, ...groups.rest];
    const answer = buildSearchAnswer(q);
    const cropPanel = answer ? null : buildCropPanel(q);
    const entityPanel = answer || cropPanel ? null : buildEntityPanel(q);

    const withPanel = resolveSearchDisplay(results, answer, cropPanel, entityPanel);
    const without = resolveSearchDisplay(results, answer, cropPanel, null);
    expect(withPanel.hitCount).toBe(without.hitCount);
  });

  it("'횡성군' 패널은 지역 카드·센터 카드를 목록에서 흡수한다", () => {
    const groups = searchAllGrouped("횡성군");
    const results = [...groups.pinned, ...groups.rest];
    const entityPanel = buildEntityPanel("횡성군")!;
    const { displayResults, hitCount } = resolveSearchDisplay(
      results,
      null,
      null,
      entityPanel,
    );
    expect(displayResults.length).toBeLessThan(results.length);
    expect(hitCount).toBe(results.length);
    expect(
      displayResults.some((r) => r.type === "region" && r.id === "gangwon-hoengseong"),
    ).toBe(false);
  });

  it("흡수할 항목이 없어도 (기본값 null) 기존 동작과 같다", () => {
    const groups = searchAllGrouped("귀농 교육");
    const results = [...groups.pinned, ...groups.rest];
    expect(resolveSearchDisplay(results, null, null).hitCount).toBe(results.length);
  });
});

describe("패널 링크 위생", () => {
  it("목록 필터 deep link 는 그 필터가 받아주는 시·도에만 붙는다 (normalize 308 strip 방지)", () => {
    // 부산광역시는 /programs?region= enum 밖 — 쿼리 없이 목록으로만 보낸다
    const busan = buildEntityPanel("기장군"); // 부산 유일 군
    const more = busan?.groups.find((g) => g.items[0]?.id.startsWith("program-"))?.more;
    expect(more?.href).toBe("/programs");

    const gangwon = buildEntityPanel("강원도");
    const gwMore = gangwon?.groups.find((g) => g.items[0]?.id.startsWith("program-"))?.more;
    expect(gwMore?.href).toBe(`/programs?region=${encodeURIComponent("강원도")}`);
  });

  it("모든 내부 링크는 절대 경로이고 외부 링크는 http(s) 뿐이다", () => {
    for (const q of ["횡성군", "강원도"]) {
      const panel = buildEntityPanel(q)!;
      const internal = [
        ...panel.ctas.map((c) => c.href),
        ...panel.groups.flatMap((g) => [...g.items.map((i) => i.href), ...(g.more ? [g.more.href] : [])]),
        ...panel.lines.flatMap((l) => l.links?.map((x) => x.href) ?? []),
        ...panel.crops.map((c) => `/crops/${c.id}`),
      ];
      for (const href of internal) expect(href.startsWith("/")).toBe(true);
      if (panel.center) expect(panel.center.url).toMatch(/^https?:\/\//);
    }
  });
});
