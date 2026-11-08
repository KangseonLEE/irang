// @vitest-environment jsdom
/**
 * PageViewTracker — 클라이언트 이동 page_view 의 제목 (2026-10-30)
 *
 * 10/30 운영 실측: 링크 이동에서 경로가 바뀐 순간 document.title 이 5~20ms 빈 문자열이라
 * GA4 pageTitle "(not set)" 이 10/26(미리 받기 끔) 뒤 하루 32~65건. 제목이 채워진 뒤 보내야 한다.
 * 실경로 import(Q9) — 판정을 끄면(제목을 바로 읽으면) 1·3번이 실패한다.
 */
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/crops";
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return { ...actual, usePathname: () => pathname };
});

import { PAGE_TITLE_WAIT_MS, PageViewTracker } from "@/components/analytics/page-view-tracker";

const gtag = vi.fn();
const pageViews = () => gtag.mock.calls.filter((c) => c[0] === "event" && c[1] === "page_view").map((c) => c[2]);

beforeEach(() => {
  vi.useFakeTimers();
  gtag.mockReset();
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  pathname = "/crops";
  document.title = "귀농 작물 목록 | 이랑";
});
afterEach(() => {
  vi.useRealTimers();
  document.title = "";
});

/** 경로를 바꾸고 다시 렌더 — Next 가 옛 <title> 을 뺀 상태(빈 제목)를 흉내 낸다 */
function navigate(rerender: (ui: React.ReactElement) => void, to: string, titleAtCommit: string) {
  pathname = to;
  document.title = titleAtCommit;
  act(() => rerender(<PageViewTracker />));
}

describe("PageViewTracker — 제목이 빈 순간에 보내지 않는다", () => {
  it("경로가 바뀐 순간 제목이 비어 있으면 <title> 이 채워진 뒤 그 제목으로 보낸다", async () => {
    const { rerender } = render(<PageViewTracker />);
    expect(pageViews()).toHaveLength(0); // 최초 로드는 config 몫

    navigate(rerender, "/crops/eggplant", "");
    expect(pageViews()).toHaveLength(0); // 아직 — 제목이 비었다

    // 스트리밍된 새 <title> 도착 — MutationObserver 콜백은 마이크로태스크라 async act 로 비운다
    await act(async () => {
      document.title = "가지 농사 난이도·수익 | 이랑";
    });
    expect(pageViews()).toEqual([
      { page_path: "/crops/eggplant", page_location: window.location.href, page_title: "가지 농사 난이도·수익 | 이랑" },
    ]);
  });

  it("제목이 이미 있으면 바로 보낸다 (정적 페이지 — 메타데이터가 같이 온다)", () => {
    const { rerender } = render(<PageViewTracker />);
    navigate(rerender, "/programs/SP-022", "청년농업인 아이디어 사업화 | 이랑");
    expect(pageViews()).toEqual([
      { page_path: "/programs/SP-022", page_location: window.location.href, page_title: "청년농업인 아이디어 사업화 | 이랑" },
    ]);
  });

  it("2초가 지나도 제목이 안 오면 빈 제목으로라도 보낸다 — 조회수는 잃지 않는다", () => {
    const { rerender } = render(<PageViewTracker />);
    navigate(rerender, "/regions/gyeonggi", "");
    act(() => {
      vi.advanceTimersByTime(PAGE_TITLE_WAIT_MS - 1);
    });
    expect(pageViews()).toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(pageViews()).toEqual([{ page_path: "/regions/gyeonggi", page_location: window.location.href, page_title: "" }]);
  });

  it("기다리는 중에 또 이동하면 앞 페이지는 잡아 둔 주소·빈 제목으로 보내고, 뒤 페이지는 새로 센다 (Y1)", () => {
    const { rerender } = render(<PageViewTracker />);
    window.history.pushState(null, "", "/regions/gyeonggi");
    navigate(rerender, "/regions/gyeonggi", "");
    window.history.pushState(null, "", "/regions/gyeonggi/yongin"); // 다음 이동 — location 은 이미 다음 페이지
    navigate(rerender, "/regions/gyeonggi/yongin", "용인 귀농 | 이랑");
    expect(pageViews()).toEqual([
      { page_path: "/regions/gyeonggi", page_location: "http://localhost:3000/regions/gyeonggi", page_title: "" },
      { page_path: "/regions/gyeonggi/yongin", page_location: "http://localhost:3000/regions/gyeonggi/yongin", page_title: "용인 귀농 | 이랑" },
    ]);
    act(() => {
      vi.advanceTimersByTime(PAGE_TITLE_WAIT_MS);
    });
    expect(pageViews()).toHaveLength(2); // 타이머가 남아 두 번 보내지 않는다
  });

  it("제목이 비어 있는 동안 본문만 바뀌면 보내지 않는다 — 제목이 올 때까지 기다린다 (T5)", async () => {
    const { rerender } = render(<PageViewTracker />);
    navigate(rerender, "/crops/eggplant", "");
    await act(async () => {
      document.body.appendChild(document.createElement("section")); // 스트리밍 본문이 먼저 온다
    });
    expect(pageViews()).toHaveLength(0);
    await act(async () => {
      document.title = "가지 | 이랑";
    });
    expect(pageViews().map((p) => p.page_title)).toEqual(["가지 | 이랑"]);
  });

  it("같은 경로로 다시 렌더되면 보내지 않는다", () => {
    const { rerender } = render(<PageViewTracker />);
    navigate(rerender, "/crops/rice", "쌀 | 이랑");
    act(() => rerender(<PageViewTracker />));
    expect(pageViews()).toHaveLength(1);
  });
});
