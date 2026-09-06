import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QuickStartSection } from "@/components/landing/quick-start-section";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

/**
 * 랜딩 "바로 시작" 우측 블록 SSR 계약 (2026-09-06 개편).
 * 8/30 설계 — 랜딩 내부 링크는 SSR HTML 에 남아야 한다. 검색창은 JS 로 지연 로드하지만
 * 시·도 17 + 페르소나 4 + 비교·전체 보기는 JS 없이도 그대로 있어야 색인·논-JS 사용자가 닿는다.
 * 검색창 래퍼는 지연 로드(dynamic) 라 여기서는 대역으로 세운다 — 링크 계약만 본다.
 */
vi.mock("@/components/landing/landing-region-search", () => ({
  LandingRegionSearch: () => <div data-testid="region-search-slot" />,
}));

afterEach(cleanup);

function hrefsOf(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("a")).map(
    (a) => a.getAttribute("href") ?? "",
  );
}

describe("QuickStartSection — 우측 지역 블록 SSR 계약", () => {
  it("h2 두 개 — 진단 카드와 지역 블록", () => {
    render(<QuickStartSection />);
    expect(screen.getByRole("heading", { name: /내 땅, 어디쯤일까요\?/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /어디부터 볼까요\?/ })).toBeTruthy();
  });

  it("시·도 링크가 PROVINCES 전건(17) 그대로 있다", () => {
    const { container } = render(<QuickStartSection />);
    const hrefs = hrefsOf(container);
    for (const p of PROVINCES) {
      expect(hrefs).toContain(`/regions/${p.id}`);
    }
    expect(PROVINCES.length).toBeGreaterThanOrEqual(17);
  });

  it("페르소나 순위 딥링크 4종 — normalize 화이트리스트 값만 쓴다", () => {
    const { container } = render(<QuickStartSection />);
    const personaHrefs = hrefsOf(container).filter((h) =>
      h.startsWith("/regions/ranking?persona="),
    );
    expect(personaHrefs.sort()).toEqual(
      [
        "/regions/ranking?persona=commuter",
        "/regions/ranking?persona=elderRural",
        "/regions/ranking?persona=family",
        "/regions/ranking?persona=farmYouth",
      ].sort(),
    );
  });

  it("보조 링크 — 지역 비교 · 전체 지역 보기", () => {
    const { container } = render(<QuickStartSection />);
    const hrefs = hrefsOf(container);
    expect(hrefs).toContain("/regions/compare");
    expect(hrefs).toContain("/regions");
  });

  it("data-track 라벨 — 진단 1 + 검색 슬롯 외 21개(페르소나 4·시·도 17)+비교·전체 2", () => {
    const { container } = render(<QuickStartSection />);
    const tracks = Array.from(container.querySelectorAll("[data-track]")).map(
      (el) => (el as HTMLElement).dataset.track,
    );
    expect(tracks).toContain("quickstart:assess");
    expect(tracks).toContain("quickstart:compare");
    expect(tracks).toContain("quickstart:regions");
    expect(tracks.filter((t) => t?.startsWith("quickstart:persona:"))).toHaveLength(4);
    expect(tracks.filter((t) => t?.startsWith("quickstart:region:"))).toHaveLength(
      PROVINCES.length,
    );
    expect(tracks).toHaveLength(PROVINCES.length + 4 + 3);
  });

  it("시·군·구 건수는 하드코딩이 아니라 SIGUNGUS.length 에서 온다", () => {
    render(<QuickStartSection />);
    expect(
      screen.getByText(new RegExp(`시·군·구\\s*${SIGUNGUS.length}\\s*곳`)),
    ).toBeTruthy();
  });

  it("검색창 슬롯이 지역 블록 안에 있다", () => {
    render(<QuickStartSection />);
    expect(screen.getByTestId("region-search-slot")).toBeTruthy();
  });
});
