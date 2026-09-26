// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";

import { RegionResultGroup } from "@/components/search/region-result-group";
import { GlossaryResultList } from "@/components/search/glossary-result-list";
import { InterviewResultCard } from "@/components/search/interview-result-card";
import { interviews } from "@/lib/data/landing";
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

  it("시·도마다 1건씩이면(동음이의 '중구') 헤더 없이 시·도 접두 행", () => {
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

    // 헤더가 행보다 많아지면 압축이 아니다
    expect(container.querySelectorAll("h3")).toHaveLength(0);
    const rows = container.querySelectorAll("li");
    expect(rows).toHaveLength(3);
    // 각 행이 어느 시·도인지 스스로 말한다
    expect(rows[0].textContent).toContain("서울");
    expect(rows[1].textContent).toContain("부산");
    expect(rows[2].textContent).toContain("대구");
  });

  it("시·군·구 3건 미만이면 압축하지 않고 카드 그대로 (정확 일치 프로미넌스)", () => {
    const { container } = render(
      <RegionResultGroup
        items={ranked([region("gapyeong", "가평군", "/regions/gyeonggi/gapyeong")])}
        query="가평"
        highlightCls="hl"
      />,
    );
    expect(container.querySelectorAll("li")).toHaveLength(0);
    expect(container.querySelectorAll("article")).toHaveLength(1);
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
    const heads = [...container.querySelectorAll("h3")].map((h) => h.textContent ?? "");
    expect(heads[0]).toContain("전남");
    expect(heads[1]).toContain("경기");
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
