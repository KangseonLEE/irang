/**
 * 시 아래 구 학교 판정 — 원천 주소에 구 이름이 없는 시(부천 2024 재설치·화성 2026 신설) (2026-10-07)
 *
 * 보호 대상:
 *   1) 구 이름 → 그 구 / 다른 구 이름 → 제외 / 구 이름 없으면 법정 읍·면·동(도로명의 읍·면, 상세 주소의 동)
 *   2) 상세 주소 형식 3종 — "(소사본동, ○○초)" · "상동 ○○초"(괄호 없음) · "(산척동 741)"(번지)
 *   3) 동이 없거나 두 구에 걸친 법정동(화성 능동)은 예외 표(SCHOOL_GU_OVERRIDES)
 *   4) 이름이 비슷한 법정 구역을 섞지 않는다 — 송산면(만세)·송산동(병점), 심곡동(원미)·심곡본동(소사)
 *   5) 상세 카드 학교 수(fetchSigunguSchoolCounts)와 학교 목록(/api/school-list)이 같은 판정을 쓴다
 *   6) 구가 원래 주소에 있던 시(수원 등)는 예전과 같다 — 주소 낱말 일치
 * 10/7 실측: 부천 134곳 → 원미 70·소사 41·오정 23, 화성 200곳 → 만세 65·효행 34·병점 25·동탄 76.
 * 통계청 주소 좌표 변환과 부천 134곳·화성 198곳 전부 같은 구(화성 2곳은 주소가 불완전해 변환 실패).
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { fetchSigunguSchoolCounts, isSchoolInDistrict, schoolMatcher, type NeisSchoolRow } from "@/lib/api/education";
import { GUS, SCHOOL_GU_OVERRIDES, getGusOfCity } from "@/lib/data/gus";
import { GET as schoolList } from "@/app/api/school-list/route";

const row = (SD_SCHUL_CODE: string, SCHUL_NM: string, ORG_RDNMA: string, ORG_RDNDA: string): NeisSchoolRow => ({
  SD_SCHUL_CODE,
  SCHUL_NM,
  ORG_RDNMA,
  ORG_RDNDA,
});

// 교육부 NEIS 실제 주소 형식(10/7) — 학교명·번지는 일부 바꿈
const BUCHEON: NeisSchoolRow[] = [
  row("t1", "가초등학교", "경기도 부천시 원미구 길주로 210", "(상동)"), // 구 이름
  row("t2", "나초등학교", "경기도 부천시 소사로 86", "(소사본동, 나초등학교)"), // 법정동 괄호
  row("7581040", "상미초등학교", "경기도 부천시 상이로 64", "상동 상미초등학교"), // 괄호 없는 법정동
  row("7581086", "송내초등학교", "경기도 부천시 석천로 27", ", 송내초등학교 "), // 동 없음 → 예외 표(원미)
  row("t3", "다중학교", "경기도 부천시 오정로 1", "(오정동,다중학교)"),
  row("t4", "라중학교", "경기도 부천시 소사구 경인로 1", "(심곡동)"), // 구 이름이 법정동보다 먼저
  row("t5", "마중학교", "경기도 부천시 신흥로 1", "(심곡본동, 중동)"), // 두 구를 가리킴 → 어느 구에도 안 셈
  row("t6", "바초등학교", "인천광역시 부평구 부평대로 1", "(상동)"), // 다른 시의 같은 동 이름
];

const HWASEONG: NeisSchoolRow[] = [
  row("h1", "갈담초등학교", "경기도 화성시 봉담읍 갈담초교길 24", "(봉담읍)"), // 읍 → 효행
  row("h2", "고정초등학교", "경기도 화성시 만세구 송산면 공룡로 326", ", 고정초등학교 (송산면)"), // 구 이름 → 만세
  row("h3", "구봉초등학교", "경기도 화성시 병점1로 105", "(병점동,구봉초등학교)"), // 법정동 → 병점
  row("7679488", "화성세정중학교", "경기도 화성시 동탄순환대로12길 60", "(산척동 741)"), // 법정동 + 번지 → 동탄
  row("7679103", "능동중학교", "경기 화성시 동탄원천로 289-17", "(능동,능동중학교)"), // 두 구에 걸친 능동 → 예외 표(동탄)
  row("7679516", "청연초등학교", "경기도 화성시 새비봉서로 68", "청연초등학교"), // 동 없음 → 예외 표(효행)
  row("h4", "사중학교", "경기도 화성시 어딘가로 1", "(송산동)"), // 송산동은 병점(송산면은 만세)
  row("h5", "아중학교", "경기도 화성시 동탄대로 1", "(여울동)"), // 2026.3.1 오산동 → 여울동
];

const count = (rows: NeisSchoolRow[], name: string) => rows.filter(schoolMatcher("J10", name)).map((r) => r.SCHUL_NM);

describe("schoolMatcher — 부천 3구", () => {
  it("원미 = 구 이름·상동(괄호 없음)·송내초(예외 표), 소사 = 소사본동·소사구 이름, 오정 = 오정동", () => {
    expect(count(BUCHEON, "원미구")).toEqual(["가초등학교", "상미초등학교", "송내초등학교"]);
    expect(count(BUCHEON, "소사구")).toEqual(["나초등학교", "라중학교"]);
    expect(count(BUCHEON, "오정구")).toEqual(["다중학교"]);
  });

  it("두 구를 가리키는 학교·다른 시 학교는 어느 구에도 세지 않는다", () => {
    const all = ["원미구", "소사구", "오정구"].flatMap((g) => count(BUCHEON, g));
    expect(all).not.toContain("마중학교");
    expect(all).not.toContain("바초등학교");
  });
});

describe("schoolMatcher — 화성 4구", () => {
  it("만세 = 구 이름, 효행 = 봉담읍·청연초, 병점 = 병점동·송산동, 동탄 = 산척동·능동(예외)·여울동", () => {
    expect(count(HWASEONG, "만세구")).toEqual(["고정초등학교"]);
    expect(count(HWASEONG, "효행구")).toEqual(["갈담초등학교", "청연초등학교"]);
    expect(count(HWASEONG, "병점구")).toEqual(["구봉초등학교", "사중학교"]);
    expect(count(HWASEONG, "동탄구")).toEqual(["화성세정중학교", "능동중학교", "아중학교"]);
  });

  it("모든 학교가 정확히 한 구에만 든다", () => {
    const names = ["만세구", "효행구", "병점구", "동탄구"].flatMap((g) => count(HWASEONG, g));
    expect(names.sort()).toEqual(HWASEONG.map((r) => r.SCHUL_NM!).sort());
  });
});

describe("법정 읍·면·동 표 — gus.ts legalAreas", () => {
  it("부천·화성 구에만 있고, 한 시 안에서 겹치지 않는다", () => {
    const withAreas = GUS.filter((g) => g.legalAreas);
    expect([...new Set(withAreas.map((g) => g.parentSigunguId))].sort()).toEqual(["bucheon", "hwaseong"]);
    for (const city of ["bucheon", "hwaseong"]) {
      const areas = getGusOfCity("gyeonggi", city).flatMap((g) => g.legalAreas ?? []);
      expect(new Set(areas).size, city).toBe(areas.length);
    }
    // 두 구에 걸친 능동은 목록에 없다 — 학교는 예외 표로
    expect(getGusOfCity("gyeonggi", "hwaseong").some((g) => g.legalAreas?.includes("능동"))).toBe(false);
  });

  it("예외 표의 구는 실재하고 법정동 판정을 쓰는 구다", () => {
    for (const [code, guId] of Object.entries(SCHOOL_GU_OVERRIDES)) {
      const g = GUS.find((x) => x.id === guId);
      expect(g?.legalAreas, `${code} → ${guId}`).toBeDefined();
    }
  });

  it("구 이름이 원래 주소에 있는 시(수원 장안구)는 예전과 같다 — 주소 낱말 일치", () => {
    const rows = [row("s1", "가", "경기도 수원시 장안구 정조로 1", "(연무동)"), row("s2", "나", "경기도 수원시 정조로 1", "(연무동)")];
    expect(rows.filter(schoolMatcher("J10", "장안구")).map((r) => r.SCHUL_NM)).toEqual(["가"]);
    expect(rows.filter(schoolMatcher("J10", "수원시")).length).toBe(rows.filter((r) => isSchoolInDistrict(r.ORG_RDNMA, "수원시")).length);
  });
});

describe("상세 카드 수 = 학교 목록 수 (같은 판정)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  const stubNeis = (rows: NeisSchoolRow[]) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ schoolInfo: [{ head: [{ list_total_count: rows.length }] }, { row: rows }] }))),
    );

  it("원미구 — 카드 3곳, 목록 3곳", async () => {
    vi.stubEnv("NEIS_API_KEY", "KEY");
    stubNeis(BUCHEON);
    await expect(fetchSigunguSchoolCounts("J10", "원미구")).resolves.toMatchObject({ totalCount: 3 });
    const req = new NextRequest("http://localhost/api/school-list?eduCode=J10&sigunguName=%EC%9B%90%EB%AF%B8%EA%B5%AC", {
      headers: { "x-forwarded-for": "10.9.9.9" },
    });
    const body = await (await schoolList(req)).json();
    expect(body.totalCount).toBe(3);
    expect(body.items.map((i: { name: string }) => i.name)).toEqual(["가초등학교", "상미초등학교", "송내초등학교"]);
  });
});
