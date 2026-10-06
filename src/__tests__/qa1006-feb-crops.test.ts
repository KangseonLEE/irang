/**
 * 10/6 전체 QA 1차 — FE-B 회귀: 작물 목록(/crops)
 *
 * - Q4-W3: balanced 페르소나 빈 목록 + 틀린 빈 상태 문구("'전체' 카테고리에 등록된 작물이 없어요").
 * - Q2-W1·Q4-W2: 1글자 작물 검색(쌀·콩·감·배·무·밤) — 부분 문자열이면 "배"가 "배추"까지, 설명의 "감소"까지 걸린다.
 * - Q2-W3: 공유 카드(og·twitter)가 사이트 기본값 — 페이지 제목·설명과 맞춘다.
 * - axe heading-order: h1 다음 카드 이름(h3)이 바로 와 제목 단계를 건너뛰었다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { CROPS } from "@/lib/data/crops";
import { cropListEmptyMessage, filterCropList } from "@/app/crops/crop-list-filter";

const PAGE_SRC = readFileSync(path.resolve(__dirname, "../app/crops/page.tsx"), "utf8");

function search(query: string) {
  return filterCropList(CROPS, { categories: [], difficulties: [], query, sort: "name" }).map((c) => c.name);
}

describe("/crops 1글자 검색 — 낱말 단위", () => {
  it("작물 이름 그대로 한 종만 — '배'는 '배추'를, '감'은 '감자'·'감귤'을 끌어오지 않는다", () => {
    expect(search("배")).toEqual(["배"]);
    expect(search("감")).toEqual(["감"]);
    expect(search("무")).toEqual(["무"]);
    expect(search("쌀")).toEqual(["쌀"]);
  });

  it("2글자 이상은 종전대로 이름·설명 부분 일치", () => {
    expect(search("감자")).toContain("감자");
    expect(search("토마토")).toEqual(expect.arrayContaining(["토마토", "방울토마토"]));
  });
});

describe("/crops 빈 결과 문구 — 실제 조건을 말한다", () => {
  it("페르소나로 비면 페르소나를, 카테고리·난이도는 고른 값 그대로", () => {
    expect(cropListEmptyMessage({ query: "", categories: ["화훼"], difficulties: [], personaLabel: "귀촌 직장인" })).toBe(
      "'화훼' 카테고리에서 '귀촌 직장인' 유형에 잘 맞는 작물이 없어요",
    );
    expect(cropListEmptyMessage({ query: "", categories: [], difficulties: [], personaLabel: "귀촌 직장인" })).toBe(
      "'귀촌 직장인' 유형에 잘 맞는 작물이 없어요",
    );
    expect(cropListEmptyMessage({ query: "", categories: ["과수", "채소"], difficulties: ["쉬움"] })).toBe(
      "'과수·채소' 카테고리의 '쉬움' 난이도 작물이 없어요",
    );
    expect(cropListEmptyMessage({ query: "고사리", categories: ["과수"], difficulties: [] })).toBe(
      "'고사리' 검색 결과가 없어요",
    );
  });

  it("'전체' 카테고리 문구는 더 이상 만들지 않는다", () => {
    for (const msg of [
      cropListEmptyMessage({ query: "", categories: [], difficulties: [] }),
      cropListEmptyMessage({ query: "", categories: [], difficulties: ["어려움"] }),
    ]) {
      expect(msg).not.toContain("'전체'");
    }
  });
});

describe("/crops 페이지 소스 가드", () => {
  it("공유 카드 제목 = 문서 제목 + ' | 이랑', 설명은 같은 상수", () => {
    const title = PAGE_SRC.match(/export const metadata[\s\S]*?\btitle:\s*"([^"]+)"/)?.[1];
    expect(title).toBeTruthy();
    const shareTitle = PAGE_SRC.match(/shareMetadata\(\{[\s\S]*?title:\s*"([^"]+)"/)?.[1];
    expect(shareTitle).toBe(`${title} | 이랑`);
    expect(PAGE_SRC).toMatch(/shareMetadata\(\{[\s\S]*?description:\s*DESCRIPTION/);
  });

  it("결과 영역 h2 가 카드 그리드보다 먼저 나온다 (h1 → h2 → 카드 h3)", () => {
    const h2 = PAGE_SRC.indexOf("<h2 className={s.srOnly}>");
    const grid = PAGE_SRC.indexOf("className={s.cropGrid}");
    expect(h2).toBeGreaterThan(-1);
    expect(grid).toBeGreaterThan(h2);
  });
});
