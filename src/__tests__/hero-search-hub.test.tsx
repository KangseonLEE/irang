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

  it("검색 입구는 /search 로 가는 입력창 모양 링크 — 진짜 입력·폼은 없다 (10/2 회장)", () => {
    const a = html.match(/<a[^>]*data-track="hero:search_open"[^>]*>/)?.[0] ?? "";
    expect(a).toContain('href="/search"');
    expect(a).toContain('aria-label="통합검색 열기"');
    expect(html).not.toContain("<form");
    expect(html).not.toContain('name="q"');
    expect(html).not.toContain("search_submit");
  });

  it("모바일 유형 캐러셀 — 카드 6장이 한 트랙(ul)에 있고 위치 점 6개가 SSR 된다", () => {
    const ul = html.slice(html.indexOf("정착 유형으로 시작하기"));
    expect(ul.match(/<li[^>]*>/g)?.length).toBeGreaterThanOrEqual(6);
    expect(html).toContain('aria-label="정착 유형 카드 위치"');
    for (const lane of JOURNEY_LANES) expect(html).toContain(`aria-label="${lane.label} 카드로"`);
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
    // 회전 단어 중 보이는 것은 하나(추천 검색어 줄도 data-state 를 쓰므로 단어만 센다)
    expect(html.match(/data-hero-word="[^"]+" data-state="in"/g)?.length).toBe(1);
  });

  it("첫 장면과 같은 유형 카드(귀농)가 강조된 채 시작한다", () => {
    expect(html).toMatch(/data-hero-card="guinong" data-active=""/);
    expect(html.match(/data-active=""/g)?.length).toBe(1);
  });

  it("배경은 첫 장면(귀농) 이미지만 SSR 하고 나머지는 연출 뒤에 받는다(10/2 지연 로드)", () => {
    expect(html).toContain("/landing/hero/hero-2.webp");
    for (const img of ["hero-3", "hero-1", "hero-youth", "hero-4"]) {
      expect(html).not.toContain(`/landing/hero/${img}.webp`);
    }
  });

  it("자동 전환 정지 버튼이 SSR 된다(WCAG 2.2.2)", () => {
    expect(html).toMatch(/aria-label="장면 자동 전환 멈추기"/);
    expect(html).toContain('aria-pressed="false"');
  });
});

describe("이런 검색어를 추천해요 — 한 줄 회전 (10/2 회장)", () => {
  const html = renderToStaticMarkup(<HeroSearchHub stats={stats} deadlines={deadlines} />);

  it("추천 검색어가 전부 SSR 링크로 남고 외부 서비스명(토지이음)은 빠진다", () => {
    expect(html).toContain("이런 검색어를 추천해요");
    expect(html).toContain(`href="/search?q=${encodeURIComponent("농촌 정착 지원금")}"`);
    expect(html).not.toContain("토지이음");
  });

  it("보이는 검색어는 하나이고 나머지는 포커스를 받지 않는다", () => {
    const items = html.match(/<a[^>]*data-track="hero_tag:[^"]*"[^>]*>/g) ?? [];
    expect(items.length).toBeGreaterThan(1);
    expect(items.filter((a) => a.includes('data-state="in"')).length).toBe(1);
    expect(items.filter((a) => a.includes('tabindex="-1"')).length).toBe(items.length - 1);
  });
});

describe("등장 연출 + 유리 UI (10/2 회장)", () => {
  const html = renderToStaticMarkup(<HeroSearchHub stats={stats} deadlines={deadlines} />);

  it("안개 층은 배경(aria-hidden) 안에만 있고 본문 텍스트·링크는 그대로 SSR 된다", () => {
    const bg = html.slice(0, html.indexOf("<h1"));
    expect(bg).toMatch(/class="[^"]*fog/);
    expect(html).toContain("어디서부터 볼까요?");
    expect(html.match(/data-track="hero_type:/g)?.length).toBe(6);
  });

  it("h1 두 줄이 각자 줄 마스크(lineInner)를 갖는다", () => {
    const h1 = html.slice(html.indexOf("<h1"), html.indexOf("</h1>"));
    expect(h1.match(/class="[^"]*lineInner/g)?.length).toBe(2);
  });

  it("유형 카드 li 에 등장 순서(--i 0~5)가 실린다", () => {
    for (let i = 0; i < 6; i++) expect(html).toContain(`--i:${i}`);
  });
});

describe("하단 고정 바 (1024+)", () => {
  const html = renderToStaticMarkup(<HeroSearchDock />);

  it("첫 렌더는 숨김(inert)이고 유형 6 + /search 입구 링크를 가진다", () => {
    expect(html).toContain('data-hero-dock="hidden"');
    expect(html).toContain("inert");
    expect(html.match(/data-track="hero_dock:(?!search_open)/g)?.length).toBe(6);
    expect(html.match(/<a[^>]*data-track="hero_dock:search_open"[^>]*>/)?.[0]).toContain('href="/search"');
  });
});
