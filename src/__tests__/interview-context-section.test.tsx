import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { InterviewContextSection } from "@/components/interview/interview-context-section";
import { TypeInterviewBand, buildTypeInterviewBands } from "@/components/landing/type-interview-band";
import { TrendCostSection } from "@/components/landing/trend-cost-section";

/**
 * 2026-10-05 회장 결재 B안 — 마크업 계약.
 *  - 상세 "정착한 사람": 0명이면 아무것도 안 그림 · 최대 3장 · 더 있으면 /interviews · 외부 링크는 새 창 + noopener
 *  - 랜딩 트렌드·비용 탭 사이 유형별 띠(같은 날 한 줄 진입점을 대체): 고른 유형의 사람만 · 유형 그림 배경 ·
 *    계측 라벨 interviews:view_all · trackId="interviews" 유지
 */

const anchors = (html: string) => html.match(/<a [^>]*>/g) ?? [];

describe("InterviewContextSection — 작물·지역 상세", () => {
  it("딸기(5명): 카드 3장 + '인터뷰 모두 보기' → /interviews", () => {
    const html = renderToStaticMarkup(<InterviewContextSection context={{ kind: "crop", cropId: "strawberry" }} />);
    expect(html).toContain("이 작물로 정착한 사람");
    expect(html).toContain("언론에 소개된 5명 중 최근 3명이에요");
    expect(html.match(/<li>/g)).toHaveLength(3);
    expect(html).toMatch(/<a [^>]*href="\/interviews"[^>]*>인터뷰 모두 보기/);
    expect(html).toContain('aria-labelledby="interview-context-heading"');
  });

  it("동의자는 내부 링크(새 창 아님), 미동의자는 원문 기사 새 창 + noopener noreferrer", () => {
    const html = renderToStaticMarkup(<InterviewContextSection context={{ kind: "crop", cropId: "strawberry" }} />);
    const cards = anchors(html).filter((a) => !a.includes('href="/interviews"'));
    expect(cards).toHaveLength(3);
    const internal = cards.filter((a) => a.includes('href="/interviews/kim-gwanghun"'));
    expect(internal).toHaveLength(1);
    expect(internal[0]).not.toContain("target=");
    for (const a of cards.filter((x) => !x.includes("/interviews/"))) {
      expect(a).toMatch(/href="https?:\/\//);
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer"');
      // 새 창 안내 — 숨긴 설명 요소를 직접 참조
      expect(a).toContain('aria-describedby="interview-context-new-tab"');
    }
    expect(html).toMatch(/<span id="interview-context-new-tab" hidden="">원문 기사가 새 창에서 열려요<\/span>/);
  });

  it("원문 기사 카드가 없으면 새 창 안내 요소도 없다 (참조 없는 id 를 남기지 않는다)", () => {
    // 김광훈(동의자)만 있는 충북 충주
    const html = renderToStaticMarkup(
      <InterviewContextSection context={{ kind: "sigungu", sidoId: "chungbuk", sigunguId: "chungju" }} />,
    );
    expect(html).toContain('href="/interviews/kim-gwanghun"');
    expect(html).not.toContain("interview-context-new-tab");
  });

  it("일러스트는 장식(alt=\"\")", () => {
    const html = renderToStaticMarkup(<InterviewContextSection context={{ kind: "crop", cropId: "strawberry" }} />);
    const imgs = html.match(/<img [^>]*>/g) ?? [];
    expect(imgs).toHaveLength(3);
    for (const img of imgs) expect(img).toContain('alt=""');
  });

  it("0명(사과·전남 나주)이면 아무것도 그리지 않는다", () => {
    expect(renderToStaticMarkup(<InterviewContextSection context={{ kind: "crop", cropId: "apple" }} />)).toBe("");
    expect(
      renderToStaticMarkup(
        <InterviewContextSection context={{ kind: "sigungu", sidoId: "jeonnam", sigunguId: "naju" }} />,
      ),
    ).toBe("");
  });

  it("3명 이하면 모두 보기 없이 기본 설명", () => {
    const html = renderToStaticMarkup(<InterviewContextSection context={{ kind: "crop", cropId: "shiitake" }} />);
    expect(html.match(/<li>/g)).toHaveLength(1);
    expect(html).toContain("언론에 소개된 정착 이야기예요");
    expect(html).not.toContain('href="/interviews"');
  });

  it("시·도 상세는 카드에 지역을, 시·군·구 상세는 지역을 빼고 그린다", () => {
    const sido = renderToStaticMarkup(<InterviewContextSection context={{ kind: "sido", sidoId: "jeonnam" }} />);
    expect(sido).toContain("이 지역에 정착한 사람");
    expect(sido).toContain("전남 신안");
    const sg = renderToStaticMarkup(
      <InterviewContextSection context={{ kind: "sigungu", sidoId: "jeonnam", sigunguId: "suncheon" }} />,
    );
    expect(sg).toContain("이 지역에 정착한 사람");
    expect(sg).toContain("조성수");
    expect(sg).not.toContain("전남 순천");
  });
});

describe("TypeInterviewBand — 랜딩 트렌드·비용 사이 유형별 띠 (10/5)", () => {
  it("귀농: 제목은 '귀농으로 정착한 사람'(유형만 강조), 사람 3명 · 인용은 가장 최근 기사(염수정)", () => {
    const html = renderToStaticMarkup(<TypeInterviewBand type="farming" />);
    expect(html).toMatch(/<h3 id="type-interviews-farming"[^>]*><em>귀농<\/em>으로 정착한 사람<\/h3>/);
    expect(html).toContain('aria-labelledby="type-interviews-farming"');
    expect(html.match(/<li>/g)).toHaveLength(3);
    expect(html).toContain("귀농으로 성공하려면 고3 수험생처럼 공부해야 해요.");
    expect(html).toContain("염수정 님 · 농민신문 2024.02");
  });

  it("배경은 유형 그림(히어로와 같은 hero-2 · sizes 100vw), 장식이라 alt=\"\"", () => {
    const html = renderToStaticMarkup(<TypeInterviewBand type="farming" />);
    const bg = (html.match(/<img [^>]*>/g) ?? []).find((img) => img.includes("hero-2.webp"));
    expect(bg).toBeDefined();
    expect(bg).toContain('alt=""');
    expect(bg).toContain('sizes="100vw"');
    expect(bg).toContain('loading="lazy"');
  });

  it("모두 보기 → /interviews?type=<유형> · data-track interviews:view_all, 사람 링크는 interviews:story", () => {
    const html = renderToStaticMarkup(<TypeInterviewBand type="rural" />);
    const more = anchors(html).filter((a) => a.includes('href="/interviews?type=rural"'));
    expect(more).toHaveLength(1);
    expect(more[0]).toContain('data-track="interviews:view_all"');
    expect(html).toMatch(/href="\/interviews\?type=rural">귀촌 이야기 모두 보기/);
    const stories = anchors(html).filter((a) => a.includes('data-track="interviews:story"'));
    expect(stories).toHaveLength(2);
  });

  it("원문 기사는 새 창 + noopener noreferrer + 새 창 안내 참조, 본문 동의자(김광훈)는 내부 링크", () => {
    const html = renderToStaticMarkup(<TypeInterviewBand type="smartfarm" />);
    const stories = anchors(html).filter((a) => a.includes('data-track="interviews:story"'));
    expect(stories).toHaveLength(3);
    const internal = stories.filter((a) => a.includes('href="/interviews/kim-gwanghun"'));
    expect(internal).toHaveLength(1);
    expect(internal[0]).not.toContain("target=");
    for (const a of stories.filter((x) => !x.includes('href="/interviews/'))) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer"');
      expect(a).toContain('aria-describedby="type-interviews-new-tab-smartfarm"');
    }
    expect(html).toContain('<span id="type-interviews-new-tab-smartfarm" hidden="">원문 기사가 새 창에서 열려요</span>');
  });

  it("귀산촌은 1명(이춘복)만 — 인원 수는 적지 않는다(목록은 보조 태그까지 넣어 더 많다)", () => {
    const html = renderToStaticMarkup(<TypeInterviewBand type="mountain" />);
    expect(html.match(/<li>/g)).toHaveLength(1);
    expect(html).toContain("이춘복");
    expect(html).not.toMatch(/\d+명/);
  });

  it("buildTypeInterviewBands — 트렌드 탭 5종 모두 띠가 있다", () => {
    const bands = buildTypeInterviewBands();
    expect(Object.keys(bands).sort()).toEqual(["farming", "mountain", "rural", "smartfarm", "youth"]);
    for (const [type, node] of Object.entries(bands)) {
      expect(renderToStaticMarkup(<>{node}</>), type).toContain(`data-type-interviews="${type}"`);
    }
  });
});

describe("TrendCostSection — 띠는 트렌드와 비용 사이, 첫 화면은 첫 탭(귀농) 것 하나만", () => {
  it("순서: #정착 트렌드 → 띠(farming) → #비용 가이드, 다른 유형 띠는 HTML 에 없다", () => {
    const html = renderToStaticMarkup(<TrendCostSection interviewBands={buildTypeInterviewBands()} />);
    const trend = html.indexOf("#정착 트렌드");
    const band = html.indexOf('data-type-interviews="farming"');
    const cost = html.indexOf("#비용 가이드");
    expect(trend).toBeGreaterThan(-1);
    expect(band).toBeGreaterThan(trend);
    expect(cost).toBeGreaterThan(band);
    expect(html.match(/data-type-interviews=/g)).toHaveLength(1);
  });

  it("띠를 안 넘기면 띠 자리도 없다", () => {
    const html = renderToStaticMarkup(<TrendCostSection />);
    expect(html).not.toContain("data-type-interviews");
  });

  it("랜딩은 트렌드·비용 섹션에 띠를 넘기고, 하단 한 줄 진입점은 없다", () => {
    const page = readFileSync(join(process.cwd(), "src", "app", "page.tsx"), "utf8");
    expect(page).toContain("<TrendCostSection interviewBands={buildTypeInterviewBands()} />");
    expect(page).not.toContain("InterviewStrip");
    expect(page).not.toContain('trackId="interviews"');
    const section = readFileSync(join(process.cwd(), "src", "components", "landing", "trend-cost-section.tsx"), "utf8");
    expect(section).toMatch(/<ScrollReveal trackId="interviews"[^>]*>\s*<div key=\{cat\.id\}>/);
  });
});
