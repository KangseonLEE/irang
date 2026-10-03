/**
 * 상세 페이지 링크·브레드크럼 회귀 (2026-10-03 QA)
 *
 *  1) 작물 비교 딥링크는 `?ids=` 만 — `?crops=` 는 normalize 화이트리스트 밖이라 308 로 지워져
 *     선택이 사라지고 기본 작물 비교가 떴다(작물 상세 "수익·난이도 자세히 비교하기").
 *  2) 화면 브레드크럼과 BreadcrumbJsonLd 가 같은 경로 — 작물 상세는 분류 단계("과수")가 화면에만,
 *     체험 상세는 "체험행사"(목록·메뉴 SSOT 는 "체험·행사")였다.
 *  3) /about h1 textContent 가 "서비스 소개이랑"처럼 붙지 않는다 · 기관 수는 목록에서 센다.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LIST_PAGE_NORMALIZE_OPTIONS, normalizeSearchParams } from "@/lib/search-params/normalize";
import { CROP_CATEGORY_NAMES } from "@/lib/data/crop-categories";
import AboutPage from "@/app/about/page";

const SRC = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

function normalize(path: string, query: string) {
  const raw = new URLSearchParams(query);
  const { cleaned } = normalizeSearchParams(raw, LIST_PAGE_NORMALIZE_OPTIONS[path]);
  return { original: raw.toString(), cleaned: cleaned.toString() };
}

describe("작물 비교 딥링크 — ids 만 살아남는다", () => {
  it("ids=작물 4개(비교 화면 한도)는 normalize 를 그대로 통과", () => {
    const r = normalize("/crops/compare", "ids=strawberry,tomato,cherry-tomato,king-oyster-mushroom");
    expect(r.cleaned).toBe(r.original);
  });

  it("crops= 는 308 strip 대상 — 이 키로 링크를 만들면 선택이 사라진다", () => {
    expect(normalize("/crops/compare", "crops=strawberry").cleaned).toBe("");
  });

  it("src 안의 모든 /crops/compare?<키>= 링크는 ids 키만 쓴다", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/\/crops\/compare\?([A-Za-z_]+)=/g)) {
        if (m[1] !== "ids") offenders.push(`${relative(SRC, file)} → ?${m[1]}=`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("브레드크럼 — 화면과 JSON-LD 가 같은 경로", () => {
  it("작물 분류 단계 링크(/crops?category=…)는 normalize 를 통과한다 — 분류 5종 전부", () => {
    for (const category of CROP_CATEGORY_NAMES) {
      const query = new URLSearchParams({ category }).toString();
      expect(normalize("/crops", query).cleaned).toBe(query);
    }
  });

  it.each([
    ["src/app/crops/[id]/page.tsx"],
    ["src/app/events/[id]/page.tsx"],
  ])("%s — Breadcrumb 와 BreadcrumbJsonLd 가 같은 breadcrumbTrail 을 쓴다", (file) => {
    const text = readFileSync(join(process.cwd(), file), "utf8");
    expect(text).toMatch(/<BreadcrumbJsonLd items=\{breadcrumbTrail\} \/>/);
    expect(text).toMatch(/<Breadcrumb(?: className=\{[^}]+\})? items=\{breadcrumbTrail\} \/>/);
  });

  it("체험 상세 경로 이름은 목록·메뉴와 같은 '체험·행사'", () => {
    const detail = readFileSync(join(process.cwd(), "src/app/events/[id]/page.tsx"), "utf8");
    const list = readFileSync(join(process.cwd(), "src/app/events/page.tsx"), "utf8");
    expect(list).toContain('{ name: "체험·행사", href: "/events" }');
    expect(detail).toContain('{ name: "체험·행사", href: "/events" }');
    expect(detail).not.toMatch(/name: "체험행사"/);
  });
});

describe("/about — h1·기관 수", () => {
  const html = renderToStaticMarkup(<AboutPage />);
  const doc = new DOMParser().parseFromString(html, "text/html");

  it("h1 textContent 가 단어 사이 공백을 가진다 ('서비스 소개 이랑')", () => {
    const h1s = doc.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe("서비스 소개 이랑");
  });

  it("'N개 공공기관' 문구의 N 은 출처 목록 항목 수와 같다", () => {
    const sourcesList = doc.querySelector('section[aria-labelledby="about-data-title"] ul');
    const n = sourcesList?.querySelectorAll("li").length ?? 0;
    expect(n).toBeGreaterThan(0);
    const text = doc.body.textContent ?? "";
    expect(text).toContain(`아래 ${n}개 공공기관 자료를 연동해요`);
    expect(text).toContain(`공공기관 ${n}곳의 자료를`);
  });
});
