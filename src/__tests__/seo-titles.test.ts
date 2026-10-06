import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CROPS, getCropWithDetail } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { cropSeoDescription, cropSeoTitle } from "@/lib/crops/seo";
import { programSeoDescription, programSeoTitle } from "@/lib/programs/seo";

/**
 * 검색 결과 제목·설명 (2026-10-06, GSC 9월 — 회장 "1번 진행, 귀농은 다시 넣어").
 * 사람들은 "귀농 비용"·"블루베리 농사 난이도"·"농지은행 임대 조건"으로 검색하는데 제목엔 "정착"·산지 나열만 있었다.
 */

describe("작물 상세 — 55종 전부", () => {
  const all = CROPS.map((c) => getCropWithDetail(c.id)).filter((x): x is NonNullable<typeof x> => x !== null);

  it("모든 작물이 상세를 갖고, 제목은 '작물명 농사 난이도·수익 … | 귀농 작물'", () => {
    expect(all).toHaveLength(CROPS.length);
    for (const c of all) {
      const t = cropSeoTitle(c);
      expect(t.startsWith(`${c.name} 농사 난이도·수익`), c.id).toBe(true);
      expect(t, c.id).toContain("귀농");
    }
  });

  it("설명에 실제 난이도·재배 시기가 들어가고, 템플릿 구멍(undefined·null·NaN)이 없다", () => {
    for (const c of all) {
      const d = cropSeoDescription(c);
      expect(d, c.id).toContain(c.name);
      expect(d, c.id).toContain("재배 난이도가");
      expect(d, c.id).toContain(c.growingSeason);
      expect(d, c.id).not.toMatch(/undefined|null|NaN|이에요이에요|\(\)/);
      expect(d, c.id).toContain("귀농");
    }
  });

  it("소득 숫자는 공공기관 출처일 때만 — 블루베리(농촌진흥청)는 10a당 숫자, 출처 기관을 괄호로", () => {
    const blueberry = all.find((c) => c.id === "blueberry")!;
    expect(cropSeoDescription(blueberry)).toMatch(/^블루베리는 재배 난이도가 보통이고, 10a당 소득은 약 [\d,]+만 원이에요\(농촌진흥청\)\./);
    for (const c of all) {
      const d = cropSeoDescription(c);
      if (d.includes("10a당 소득")) {
        expect(d, c.id).toMatch(/\((농촌진흥청|통계청|산림청|농림축산식품부|한국농촌경제연구원)\)/);
      }
    }
  });

  it("주산지는 짧은 이름, 끝 글자 받침에 맞춰 이에요/예요", () => {
    const blueberry = all.find((c) => c.id === "blueberry")!;
    expect(cropSeoDescription(blueberry)).toContain("주산지는 전남·경남·충남이에요.");
  });
});

describe("지원사업 상세", () => {
  it("일반 사업: '사업명 — 조건·신청 방법 | (지역) 귀농 지원사업'", () => {
    for (const p of PROGRAMS.filter((x) => x.id !== "SP-018")) {
      const t = programSeoTitle(p);
      expect(t.startsWith(`${p.title} — 조건·신청 방법 | `), p.id).toBe(true);
      expect(t.endsWith("귀농 지원사업"), p.id).toBe(true);
      expect(t, p.id).not.toMatch(/\s{2,}|undefined/);
    }
  });

  it("SP-018 농지은행은 실제 검색어(임대·위탁 조건·수수료)로", () => {
    const sp018 = PROGRAMS.find((p) => p.id === "SP-018")!;
    expect(programSeoTitle(sp018)).toBe("농지은행 농지임대수탁사업 — 임대·위탁 조건과 수수료");
    const d = programSeoDescription(sp018, sp018.summary);
    expect(d.startsWith("농지은행 농지임대수탁사업의 임대 조건·위탁 조건·수수료를 확인하세요.")).toBe(true);
    // 검색 결과가 약속한 내용이 본문에 있다
    expect(sp018.description).toMatch(/위탁/);
    expect(sp018.description).toMatch(/수수료/);
  });

  it("지역이 비어도 공백이 겹치지 않는다", () => {
    const t = programSeoTitle({ id: "X", title: "테스트 사업", region: "" });
    expect(t).toBe("테스트 사업 — 조건·신청 방법 | 귀농 지원사업");
    expect(programSeoDescription({ id: "X", title: "테스트 사업", region: "" })).toBe(
      "테스트 사업의 자격 조건, 지원 금액, 신청 방법을 확인하세요.",
    );
  });
});

describe("허브 페이지 제목에 '귀농'", () => {
  const titleOf = (route: string) => {
    const src = readFileSync(join(process.cwd(), "src", "app", route, "page.tsx"), "utf8");
    const m = src.match(/export const metadata[\s\S]*?title:\s*"([^"]+)"/);
    return m?.[1] ?? "";
  };
  it.each([
    ["costs", "귀농 비용 가이드"],
    ["programs", "귀농·귀촌 지원사업"],
    ["guide", "귀농 절차 5단계"],
    ["crops", "귀농 작물 목록"],
    ["education", "귀농 교육"],
    ["events", "귀농 체험·행사"],
    ["interviews", "귀농·귀촌 인터뷰"],
    ["regions", "귀농 지역 탐색"],
  ])("/%s", (route, expected) => {
    expect(titleOf(route)).toContain(expected);
  });

  it("사이트 기본 제목·랜딩", () => {
    for (const f of ["layout.tsx", "page.tsx"]) {
      const src = readFileSync(join(process.cwd(), "src", "app", f), "utf8");
      expect(src, f).toContain("이랑 — 귀농·귀촌 정보 큐레이션 포탈");
      expect(src, f).not.toContain("농촌 정착 정보 큐레이션 포탈");
    }
  });
});
