// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";

import { RegionResultGroup } from "@/components/search/region-result-group";
import { GlossaryResultList } from "@/components/search/glossary-result-list";
import { InterviewResultCard } from "@/components/search/interview-result-card";
import { interviews } from "@/lib/data/landing";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { getInterviewImageSrc } from "@/lib/interview-image";
import type { SearchItem } from "@/lib/data/search-index";

/**
 * /search 유형별 전용 레이아웃 계약 (Phase C, 2026-09-26)
 *
 * 여기서 잡으려는 것은 "묶는 규칙"과 "시맨틱"이다 — 픽셀은 Playwright 실측이 본다.
 *  - 지역: 시·도 2건 이상이면 헤더 묶음, 시·도마다 1건이면 헤더 없이 접두 행, 3건 미만이면 카드
 *  - 용어: <dl> / <dt> / <dd> 1:1
 *  - 인터뷰: 일러 썸네일은 장식(alt="") + 인용구 blockquote
 *  - 계측: data-search-result="<type>:<순위>" 는 어떤 레이아웃에서도 유지
 */

const region = (id: string, title: string, href: string): SearchItem => ({
  type: "region",
  id,
  title,
  subtitle: `${title} 요약`,
  href,
  keywords: [title],
  icon: "\u{1F4CD}",
});

function ranked(items: SearchItem[]) {
  return items.map((item, i) => ({ item, rank: i + 1 }));
}

/** 페이지네이션용 실데이터 픽스처 — href 가 실제 시·군·구여야 lookupRegionFromHref 가 행으로 판정한다 */
const SIGUNGU_FIXTURES: [string, string, string][] = SIGUNGUS.slice(0, 60).map((sg) => [
  sg.id,
  sg.name,
  `/regions/${sg.sidoId}/${sg.id}`,
]);

afterEach(() => cleanup());

describe("RegionResultGroup — 시·도 묶기", () => {
  it("한 시·도에 2건 이상이면 시·도 헤더 + 건수 + 비교하기 링크", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([
          region("suncheon", "순천시", "/regions/jeonnam/suncheon"),
          region("naju", "나주시", "/regions/jeonnam/naju"),
          region("mokpo", "목포시", "/regions/jeonnam/mokpo"),
        ])}
        query="전남"
        highlightCls="hl"
      />,
    );

    const heads = container.querySelectorAll("h3");
    expect(heads).toHaveLength(1);
    expect(heads[0].textContent).toContain("전남");
    expect(heads[0].textContent).toContain("3곳");
    expect(container.querySelectorAll("li")).toHaveLength(3);
    const compare = screen.getByRole("link", { name: "전남 지역 비교하기" });
    expect(compare.getAttribute("href")).toBe("/regions/compare?regions=jeonnam");
  });

  it("1건짜리 시·도도 헤더 아래 — 묶음 규칙이 예외 없이 읽힌다 (9/27)", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([
          region("jung-gu-seoul", "중구", "/regions/seoul/jung-gu-seoul"),
          region("jung-gu-busan", "중구", "/regions/busan/jung-gu-busan"),
          region("jung-gu-daegu", "중구", "/regions/daegu/jung-gu-daegu"),
        ])}
        query="중구"
        highlightCls="hl"
      />,
    );

    const heads = [...container.querySelectorAll("h3")].map((h) => h.textContent ?? "");
    expect(heads).toHaveLength(3);
    expect(heads[0]).toContain("서울");
    expect(heads[1]).toContain("부산");
    expect(heads[2]).toContain("대구");
    // 1곳뿐인 묶음에는 비교하기를 달지 않는다
    expect(heads.every((h) => h.includes("1곳"))).toBe(true);
    expect(container.querySelectorAll("a[href*='/regions/compare']")).toHaveLength(0);
    expect(container.querySelectorAll("li")).toHaveLength(3);
  });

  it("시·군·구 1건도 카드가 아니라 헤더 + 행", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([region("gapyeong", "가평군", "/regions/gyeonggi/gapyeong")])}
        query="가평"
        highlightCls="hl"
      />,
    );
    expect(container.querySelectorAll("article")).toHaveLength(0);
    expect(container.querySelectorAll("h3")).toHaveLength(1);
    expect(container.querySelectorAll("li")).toHaveLength(1);
  });

  it("시·도 자체 카드는 묶지 않고 카드로 남고, 시·군·구는 묶인다", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([
          region("province-jeonnam", "전라남도", "/regions/jeonnam"),
          region("suncheon", "순천시", "/regions/jeonnam/suncheon"),
          region("naju", "나주시", "/regions/jeonnam/naju"),
          region("mokpo", "목포시", "/regions/jeonnam/mokpo"),
        ])}
        query="전남"
        highlightCls="hl"
      />,
    );
    expect(container.querySelectorAll("article")).toHaveLength(1);
    expect(container.querySelectorAll("li")).toHaveLength(3);
  });

  it("관측소는 '기상 관측소' 한 묶음으로 모이고 비교하기 링크가 없다", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([
          region("stn-108", "서울 관측소", "/regions?stations=108"),
          region("stn-119", "수원 관측소", "/regions?stations=119"),
        ])}
        query="관측소"
        highlightCls="hl"
      />,
    );
    const heads = container.querySelectorAll("h3");
    expect(heads).toHaveLength(1);
    expect(heads[0].textContent).toContain("기상 관측소");
    expect(container.querySelectorAll("a[href*='/regions/compare']")).toHaveLength(0);
  });

  it("행 순서는 첫 등장 순 — 관련도 신호를 보존한다", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([
          region("naju", "나주시", "/regions/jeonnam/naju"),
          region("gapyeong", "가평군", "/regions/gyeonggi/gapyeong"),
          region("suncheon", "순천시", "/regions/jeonnam/suncheon"),
          region("yangpyeong", "양평군", "/regions/gyeonggi/yangpyeong"),
        ])}
        query="군"
        highlightCls="hl"
      />,
    );
    // 같은 시·도는 첫 등장 위치의 한 묶음으로 모인다 — 헤더가 두 번 생기지 않는다
    const heads = [...container.querySelectorAll("h3")].map((h) => h.textContent ?? "");
    expect(heads).toHaveLength(2);
    expect(heads[0]).toContain("전남");
    expect(heads[1]).toContain("경기");
    expect([...container.querySelectorAll("li")].map((li) => li.querySelector("a")?.textContent)).toEqual([
      "나주시",
      "순천시",
      "가평군",
      "양평군",
    ]);
  });

  it("계측 라벨은 레이아웃과 무관하게 <type>:<순위> — trackType 으로 직답 블록 구분", () => {
    const items = ranked([
      region("suncheon", "순천시", "/regions/jeonnam/suncheon"),
      region("naju", "나주시", "/regions/jeonnam/naju"),
      region("mokpo", "목포시", "/regions/jeonnam/mokpo"),
    ]);
    const { container } = render(
      <RegionResultGroup items={items} query="전남" highlightCls="hl" />,
    );
    expect(
      [...container.querySelectorAll("[data-search-result]")].map(
        (el) => (el as HTMLElement).dataset.searchResult,
      ),
    ).toEqual(["region:1", "region:2", "region:3"]);

    cleanup();
    const pinnedRender = render(
      <RegionResultGroup items={items} query="전남" highlightCls="hl" trackType="pinned" />,
    );
    expect(
      [...pinnedRender.container.querySelectorAll("[data-search-result]")].map(
        (el) => (el as HTMLElement).dataset.searchResult,
      ),
    ).toEqual(["pinned:1", "pinned:2", "pinned:3"]);
  });

  it("행 안에 링크는 하나 — 중첩 인터랙티브 0", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([
          region("suncheon", "순천시", "/regions/jeonnam/suncheon"),
          region("naju", "나주시", "/regions/jeonnam/naju"),
          region("mokpo", "목포시", "/regions/jeonnam/mokpo"),
        ])}
        query="전남"
        highlightCls="hl"
      />,
    );
    expect(container.querySelectorAll("a a, a button, button a")).toHaveLength(0);
    for (const li of container.querySelectorAll("li")) {
      expect(li.querySelectorAll("a")).toHaveLength(1);
    }
  });
});

describe("RegionResultGroup — 페이지네이션 (9/27)", () => {
  const many = (n: number) =>
    ranked(
      SIGUNGU_FIXTURES.slice(0, n).map(([id, name, href]) => region(id, name, href)),
    );

  it("pageSize 를 주면 한 페이지 5행 + 페이지네이션, 안 주면 전량", () => {
    const { container } = render(
      <RegionResultGroup items={many(12)} query="시" highlightCls="hl" pageSize={5} />,
    );
    expect(container.querySelectorAll("li[data-search-result]")).toHaveLength(5);
    const pager = screen.getByRole("navigation", { name: "지역 결과 페이지" });
    expect(pager).not.toBeNull();
    // 12건 / 5 = 3페이지
    expect(pager.querySelectorAll("button[aria-label$='페이지']")).toHaveLength(3 + 2);

    cleanup();
    const all = render(<RegionResultGroup items={many(12)} query="시" highlightCls="hl" />);
    expect(all.container.querySelectorAll("li[data-search-result]")).toHaveLength(12);
    expect(all.container.querySelectorAll("nav")).toHaveLength(0);
  });

  it("현재 페이지는 aria-current='page', 이동하면 다음 5건 + 순위 라벨이 이어진다", () => {
    render(<RegionResultGroup items={many(12)} query="시" highlightCls="hl" pageSize={5} />);
    expect(screen.getByRole("button", { current: "page" }).textContent).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "2페이지" }));
    expect(screen.getByRole("button", { current: "page" }).textContent).toBe("2");
    expect(
      [...document.querySelectorAll("li[data-search-result]")].map(
        (el) => (el as HTMLElement).dataset.searchResult,
      ),
    ).toEqual(["region:6", "region:7", "region:8", "region:9", "region:10"]);

    // 마지막 페이지는 나머지 2건 + "다음" 비활성
    fireEvent.click(screen.getByRole("button", { name: "3페이지" }));
    expect(document.querySelectorAll("li[data-search-result]")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "이전 페이지" })).not.toBeDisabled();
  });

  it("잘린 시·도 묶음은 다음 페이지에 헤더가 다시 붙고, 건수는 총계를 유지한다", () => {
    // 전남 6건 → 1페이지 5행 + 2페이지 1행, 헤더는 양쪽 모두 "6곳"
    const items = ranked([
      region("suncheon", "순천시", "/regions/jeonnam/suncheon"),
      region("naju", "나주시", "/regions/jeonnam/naju"),
      region("mokpo", "목포시", "/regions/jeonnam/mokpo"),
      region("yeosu", "여수시", "/regions/jeonnam/yeosu"),
      region("gwangyang", "광양시", "/regions/jeonnam/gwangyang"),
      region("damyang", "담양군", "/regions/jeonnam/damyang"),
    ]);
    render(<RegionResultGroup items={items} query="전남" highlightCls="hl" pageSize={5} />);
    expect(document.querySelector("h3")?.textContent).toContain("6곳");
    expect(document.querySelectorAll("li[data-search-result]")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "2페이지" }));
    expect(document.querySelectorAll("h3")).toHaveLength(1);
    expect(document.querySelector("h3")?.textContent).toContain("6곳");
    expect(document.querySelectorAll("li[data-search-result]")).toHaveLength(1);
  });

  it("페이지가 많으면 버튼 창은 처음·현재±1·마지막 (… 는 버튼 아님)", () => {
    render(<RegionResultGroup items={many(60)} query="시" highlightCls="hl" pageSize={5} />);
    const pager = screen.getByRole("navigation", { name: "지역 결과 페이지" });
    const nums = [...pager.querySelectorAll("li > button")].map((b) => b.textContent);
    expect(nums).toEqual(["1", "2", "12"]);
    expect(pager.textContent).toContain("…");
  });

  it("검색어가 바뀌면 1페이지로 돌아온다", () => {
    const { rerender } = render(
      <RegionResultGroup items={many(12)} query="시" highlightCls="hl" pageSize={5} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "3페이지" }));
    expect(screen.getByRole("button", { current: "page" }).textContent).toBe("3");

    rerender(<RegionResultGroup items={many(11)} query="군" highlightCls="hl" pageSize={5} />);
    expect(screen.getByRole("button", { current: "page" }).textContent).toBe("1");
  });
});

describe("GlossaryResultList — 정의 리스트", () => {
  const items: SearchItem[] = [
    {
      type: "glossary",
      id: "ha",
      title: "ha",
      subtitle: "헥타르",
      href: "/glossary#ha",
      keywords: ["ha"],
      icon: "\u{1F4D6}",
    },
    {
      type: "glossary",
      id: "10a",
      title: "10a",
      subtitle: "10아르",
      href: "/glossary#10a",
      keywords: ["10a"],
      icon: "\u{1F4D6}",
    },
  ];

  it("dl > div(dt+dd) 1:1 — 카드가 아니다", () => {
    const { container } = render(
      <GlossaryResultList items={items} query="ha" highlightCls="hl" />,
    );
    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    expect(dl!.querySelectorAll("dt")).toHaveLength(2);
    expect(dl!.querySelectorAll("dd")).toHaveLength(2);
    expect(container.querySelectorAll("article")).toHaveLength(0);
    // dl 직계 자식은 div 묶음만 (계측 속성 보유)
    for (const child of dl!.children) {
      expect(child.tagName).toBe("DIV");
      expect((child as HTMLElement).dataset.searchResult).toBeTruthy();
    }
  });

  it("항목 링크는 dt 안에 하나 + 순위 offset 반영", () => {
    const { container } = render(
      <GlossaryResultList items={items} query="ha" highlightCls="hl" rankOffset={4} />,
    );
    expect(
      [...container.querySelectorAll("[data-search-result]")].map(
        (el) => (el as HTMLElement).dataset.searchResult,
      ),
    ).toEqual(["glossary:5", "glossary:6"]);
    for (const dt of container.querySelectorAll("dt")) {
      expect(dt.querySelectorAll("a")).toHaveLength(1);
    }
  });

  it("실제 용어 사전 항목이면 정의·카테고리를 보여준다", () => {
    render(<GlossaryResultList items={[items[0]]} query="" highlightCls="hl" />);
    expect(screen.getByRole("definition").textContent).toContain("헥타르");
  });
});

describe("InterviewResultCard — 인물 카드", () => {
  const person = interviews[0];

  it("일러 썸네일은 장식(alt=\"\") + 인용구는 blockquote", () => {
    const { container } = render(
      <InterviewResultCard
        person={person}
        href={`/interviews/${person.id}`}
        query={person.name}
        highlightCls="hl"
        track="interview:1"
      />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("alt")).toBe("");
    expect(container.querySelector("blockquote")?.textContent).toContain(person.quote);
    expect(container.querySelector("article")?.dataset.searchResult).toBe("interview:1");
  });

  it("제목 링크의 접근 이름은 이름·지역 평문 (하이라이트 토막 아님)", () => {
    render(
      <InterviewResultCard
        person={person}
        href={`/interviews/${person.id}`}
        query={person.name}
        highlightCls="hl"
      />,
    );
    const link = screen.getByRole("link", { name: `${person.name} · ${person.region}` });
    expect(link.getAttribute("href")).toBe(`/interviews/${person.id}`);
  });

  it("인터뷰 19명 전원 일러를 보유 — 폴백 경로가 실행되지 않는다", () => {
    const missing = interviews.filter((p) => !getInterviewImageSrc(p.id));
    expect(missing.map((p) => p.id)).toEqual([]);
  });
});
