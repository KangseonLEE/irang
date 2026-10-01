import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- 테스트용 next/image 대역
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

import { HeroSearchHub, type HeroDeadline, type HeroStat } from "@/components/landing/hero-search-hub";
import { HeroSearchDock } from "@/components/landing/hero-search-dock";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";

const stats: HeroStat[] = [
  { id: "programs_open", label: "신청 가능한 지원사업", value: 12, unit: "건", href: "/programs" },
  { id: "programs_due", label: "7일 안에 마감", value: 0, unit: "건", href: "/programs" },
  { id: "education_open", label: "모집 중인 교육", value: 64, unit: "건", href: "/education" },
];
const deadlines: HeroDeadline[] = [
  { id: "SP-001", title: "테스트 사업", amount: "500만 원", daysLeft: 3 },
  { id: "SP-002", title: "오늘 끝나는 사업", daysLeft: 0 },
];

describe("랜딩 히어로 A안 — 검색 + 정착 유형 (10/1)", () => {
  const html = renderToStaticMarkup(<HeroSearchHub stats={stats} deadlines={deadlines} />);

  it("h1 은 1개", () => {
    expect(html.match(/<h1/g)?.length).toBe(1);
  });

  it("투명 헤더 게이트 data-landing-hero 를 세운다", () => {
    expect(html).toContain("data-landing-hero");
  });

  it("검색은 JS 없이 동작하는 GET 폼 (/search, name=q)", () => {
    expect(html).toMatch(/<form[^>]*action="\/search"[^>]*method="get"/);
    expect(html).toContain('name="q"');
    expect(html).toContain('role="search"');
  });

  it("정착 유형 링크 6개가 SSR <a> 로 남고 계측 라벨이 붙는다", () => {
    expect(JOURNEY_LANES.length).toBe(6);
    for (const lane of JOURNEY_LANES) {
      expect(html).toContain(`href="${lane.href}"`);
      expect(html).toContain(`data-track="hero_type:${lane.id}"`);
    }
  });

  it("인기 검색어 칩은 인코딩된 /search?q= 링크", () => {
    expect(html).toContain(`/search?q=${encodeURIComponent("전남 귀농")}`);
  });

  it("수치 0 항목은 그리지 않고, 마감 카드는 D-N·오늘 마감으로 표기", () => {
    expect(html).toContain("12");
    expect(html).toContain("모집 중인 교육");
    expect(html).not.toContain("7일 안에 마감");
    expect(html).toContain("D-3");
    expect(html).toContain("오늘 마감");
    expect(html).toContain('href="/programs/SP-001"');
  });
});

describe("히어로 장면 회전 — 단어·배경·카드 (10/1 회장)", () => {
  const html = renderToStaticMarkup(<HeroSearchHub stats={stats} deadlines={deadlines} />);

  it("h1 이 읽는 문장은 5개 유형을 모두 담은 한 줄이다(회전 줄은 aria-hidden)", () => {
    const h1 = html.slice(html.indexOf("<h1"), html.indexOf("</h1>"));
    expect(h1).toContain("귀농·귀촌·귀산촌·청년농·스마트팜 준비, 어디서부터 볼까요?");
    expect(h1.match(/aria-hidden="true"/g)?.length).toBe(2);
  });

  it("단어 5개가 SSR 되고 첫 장면(귀농)만 보이는 상태로 시작한다", () => {
    expect(html.match(/data-hero-word=/g)?.length).toBe(5);
    expect(html).toMatch(/data-hero-word="guinong" data-state="in"/);
    expect(html.match(/data-state="in"/g)?.length).toBe(1);
  });

  it("첫 장면과 같은 유형 카드(귀농)가 강조된 채 시작한다", () => {
    expect(html).toMatch(/data-hero-card="guinong" data-active=""/);
    expect(html.match(/data-active=""/g)?.length).toBe(1);
  });

  it("배경 장면 5개가 유형별 이미지로 SSR 된다", () => {
    for (const img of ["hero-2", "hero-3", "hero-1", "hero-youth", "hero-4"]) {
      expect(html).toContain(`/landing/hero/${img}.webp`);
    }
  });
});

describe("하단 고정 바 (1024+)", () => {
  const html = renderToStaticMarkup(<HeroSearchDock />);

  it("첫 렌더는 숨김(inert)이고 유형 6 + 검색 폼을 가진다", () => {
    expect(html).toContain('data-hero-dock="hidden"');
    expect(html).toContain("inert");
    expect(html.match(/data-track="hero_dock:(?!search_submit)/g)?.length).toBe(6);
    expect(html).toMatch(/<form[^>]*action="\/search"/);
  });
});
