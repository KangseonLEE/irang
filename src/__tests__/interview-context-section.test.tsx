import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { InterviewContextSection } from "@/components/interview/interview-context-section";
import { InterviewStrip } from "@/components/landing/interview-strip";
import { interviews } from "@/lib/data/landing";

/**
 * 2026-10-05 회장 결재 B안 — 마크업 계약.
 *  - 상세 "정착한 사람": 0명이면 아무것도 안 그림 · 최대 3장 · 더 있으면 /interviews · 외부 링크는 새 창 + noopener
 *  - 랜딩 한 줄 진입점: 계측 라벨 interviews:view_all · trackId="interviews" 유지 (2주 뒤 전/후 비교)
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

describe("InterviewStrip — 랜딩 한 줄 진입점", () => {
  it("띠 전체가 /interviews 링크 하나, 계측 라벨 interviews:view_all 유지", () => {
    const html = renderToStaticMarkup(<InterviewStrip />);
    const links = anchors(html);
    expect(links).toHaveLength(1);
    expect(links[0]).toContain('href="/interviews"');
    expect(links[0]).toContain('data-track="interviews:view_all"');
  });

  it("인원은 배열 길이에서 — '먼저 떠난 N명의 이야기' h2 + 얼굴 3개(장식)", () => {
    const html = renderToStaticMarkup(<InterviewStrip />);
    expect(html).toMatch(new RegExp(`<h2 id="landing-interviews-title"[^>]*>먼저 떠난 ${interviews.length}명의 이야기</h2>`));
    expect(html).toContain('aria-labelledby="landing-interviews-title"');
    const imgs = html.match(/<img [^>]*>/g) ?? [];
    expect(imgs).toHaveLength(3);
    for (const img of imgs) expect(img).toContain('alt=""');
    expect(html).toContain("모두 보기");
  });

  it("랜딩은 같은 자리에서 trackId=\"interviews\" 로 감싼다 (노출 지표 연속성)", () => {
    const page = readFileSync(join(process.cwd(), "src", "app", "page.tsx"), "utf8");
    expect(page).toMatch(/<ScrollReveal trackId="interviews"[^>]*>\s*<InterviewStrip \/>\s*<\/ScrollReveal>/);
    expect(page).not.toContain("InterviewCarousel");
  });
});
