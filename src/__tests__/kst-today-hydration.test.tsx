/**
 * 날짜에 따라 글자가 바뀌는 클라이언트 렌더 — 하이드레이션 불일치 회귀 (2026-10-03, 운영 Sentry #157)
 *
 * 사고: 지원사업 상세 신청 기간 위젯이 렌더 중 `new Date()` 로 D-day 를 계산했다. ISR 스냅샷을
 * 만든 날(서버, UTC)과 방문한 날(브라우저, KST)이 다르면 서버 HTML "74일" vs 첫 렌더 "73일" →
 * React #418. `new Date("2026-01-12").getMonth()` 는 뉴욕 타임존에서 1/11 로 읽혀 날짜 표기도 어긋났다.
 * 같은 계열: /programs 카드 "마감 D-N"·"신규", 작물 상세 "이번 달" 강조.
 *
 * 계약:
 *   1) 서버 렌더 글자는 서버가 넘긴 `asOf` 로만 정해진다(서버 시계·타임존 무관)
 *   2) 하이드레이션은 `asOf` 기준으로 서버 HTML 과 같다 → 복구 가능한 오류·hydration 경고 0
 *   3) 하이드레이션 직후 보는 사람의 오늘(KST)로 다시 그린다
 *   4) 날짜 표기·일수 계산은 브라우저 타임존과 무관하다
 */
import { act, type ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/programs",
}));
vi.mock("@/app/programs/actions", () => ({ loadMorePrograms: vi.fn() }));

import { ApplicationTimeline } from "@/components/programs/application-timeline";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { MonthlyTaskCalendar } from "@/components/crops/monthly-task-calendar";
import { ProgramList } from "@/app/programs/program-list";
import type { SupportProgram } from "@/lib/data/programs";
import {
  daysBetween,
  daysUntilDeadline,
  deriveStatus,
  isNewProgram,
  kstToday,
} from "@/lib/program-status";

/** KST 벽시계 → 그 순간의 epoch ms */
const kst = (iso: string) => new Date(`${iso}+09:00`).getTime();

const ORIGINAL_TZ = process.env.TZ;
function setTZ(tz: string | undefined) {
  // process.env.TZ = undefined 는 문자열 "undefined" 가 된다 — 지워야 원래 타임존으로 돌아간다
  if (tz === undefined) delete process.env.TZ;
  else process.env.TZ = tz;
}

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  // next/link 등이 마운트 때 찾는다 — jsdom 에는 없다
  if (!("IntersectionObserver" in window)) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });
    Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: IO });
  }
});

let consoleError: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.useRealTimers();
  consoleError.mockRestore();
  setTZ(ORIGINAL_TZ);
});

/** 서버 렌더(시계·타임존 지정) → 다른 시계·타임존의 브라우저가 하이드레이션 */
async function ssrThenHydrate(
  element: ReactElement,
  server: { at: number; tz?: string },
  client: { at: number; tz?: string },
) {
  setTZ(server.tz ?? "UTC");
  vi.setSystemTime(server.at);
  const html = renderToString(element);

  setTZ(client.tz ?? "Asia/Seoul");
  vi.setSystemTime(client.at);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const serverText = container.textContent ?? "";

  const recoverable: unknown[] = [];
  let root: Root | undefined;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: (error) => recoverable.push(error),
    });
  });
  const hydrationWarnings = consoleError.mock.calls
    .map((args: unknown[]) => args.map(String).join(" "))
    .filter((msg: string) => /hydrat|did not match|didn't match|#418/i.test(msg));

  return {
    html,
    serverText,
    container,
    recoverable,
    hydrationWarnings,
    unmount: () => act(() => root?.unmount()),
  };
}

// ---------------------------------------------------------------------------
// 1. 순수 함수 — KST 오늘·일수
// ---------------------------------------------------------------------------

describe("kstToday · daysBetween — 타임존 무관 KST 날짜", () => {
  it("KST 자정을 경계로 날이 바뀐다 (UTC 15:00 = KST 00:00)", () => {
    expect(kstToday(kst("2026-10-02T23:59:59"))).toBe("2026-10-02");
    expect(kstToday(kst("2026-10-03T00:00:00"))).toBe("2026-10-03");
  });

  it.each(["UTC", "Asia/Seoul", "America/New_York", "Pacific/Kiritimati"])(
    "%s 브라우저에서도 같은 KST 날짜",
    (tz) => {
      setTZ(tz);
      expect(kstToday(kst("2026-10-03T00:01:00"))).toBe("2026-10-03");
      expect(daysBetween("2026-10-02", "2026-12-15")).toBe(74);
      expect(daysBetween("2026-10-03", "2026-12-15")).toBe(73);
    },
  );

  it("daysUntilDeadline·deriveStatus 는 today 를 받으면 그 날 기준", () => {
    expect(daysUntilDeadline("2026-10-05", "2026-10-02")).toBe(3);
    expect(daysUntilDeadline("2026-10-05", "2026-10-05")).toBe(0);
    expect(daysUntilDeadline("2026-10-05", "2026-10-06")).toBe(-1);
    expect(daysUntilDeadline("9999-12-31", "2026-10-02")).toBe(Infinity);
    expect(deriveStatus("2026-09-01", "2026-10-05", "2026-10-05")).toBe("모집중");
    expect(deriveStatus("2026-09-01", "2026-10-05", "2026-10-06")).toBe("마감");
    expect(deriveStatus("2026-10-10", "2026-10-20", "2026-10-09")).toBe("모집예정");
  });

  it("today 를 생략하면 지금 KST 날짜(기존 동작)", () => {
    vi.setSystemTime(kst("2026-10-03T00:01:00"));
    expect(daysUntilDeadline("2026-10-05")).toBe(2);
    expect(deriveStatus("2026-09-01", "2026-10-02")).toBe("마감");
  });

  it("isNewProgram(today) — 등록일(KST)부터 14일째 전날까지", () => {
    const created = "2026-09-19T00:00:00Z"; // KST 9/19 09:00
    expect(isNewProgram(created, "모집중", "2026-10-02")).toBe(true); // 13일째
    expect(isNewProgram(created, "모집중", "2026-10-03")).toBe(false); // 14일째
    expect(isNewProgram(created, "마감", "2026-10-02")).toBe(false);
    expect(isNewProgram("not-a-date", "모집중", "2026-10-02")).toBe(false);
    expect(isNewProgram(undefined, "모집중", "2026-10-02")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. 신청 기간 위젯 (지원사업 상세) — Sentry #157 원인
// ---------------------------------------------------------------------------

describe("ApplicationTimeline — asOf 하이드레이션", () => {
  const props = {
    applicationStart: "2026-09-01",
    applicationEnd: "2026-12-15",
    status: "모집중" as const,
    statusLabel: "모집중",
    organization: "농림축산식품부",
    asOf: "2026-10-02",
  };

  it("서버 렌더 글자는 asOf 로만 정해진다 — 서버 시계가 하루 뒤여도 '74일'", () => {
    setTZ("UTC");
    vi.setSystemTime(kst("2026-10-03T12:00:00"));
    const html = renderToString(<ApplicationTimeline {...props} />);
    const text = html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, "");
    expect(text).toContain("마감까지 74일 남았어요");
    expect(text).toContain("9/1~12/15");
  });

  it("10/2 스냅샷을 10/3 00:01 KST 브라우저가 열어도 불일치 0 → 직후 '73일'", async () => {
    const r = await ssrThenHydrate(
      <ApplicationTimeline {...props} />,
      { at: kst("2026-10-02T20:00:00"), tz: "UTC" },
      { at: kst("2026-10-03T00:01:00"), tz: "Asia/Seoul" },
    );
    expect(r.serverText).toContain("마감까지 74일 남았어요");
    expect(r.recoverable).toEqual([]);
    expect(r.hydrationWarnings).toEqual([]);
    expect(r.container.textContent).toContain("마감까지 73일 남았어요");
    await r.unmount();
  });

  it("뉴욕 타임존 브라우저 — 날짜 표기가 하루 밀리지 않는다", async () => {
    const r = await ssrThenHydrate(
      <ApplicationTimeline {...props} applicationStart="2026-01-12" applicationEnd="2026-02-13" status="마감" statusLabel="마감" asOf="2026-10-02" />,
      { at: kst("2026-10-02T20:00:00"), tz: "UTC" },
      { at: kst("2026-10-02T20:00:00"), tz: "America/New_York" },
    );
    expect(r.recoverable).toEqual([]);
    expect(r.hydrationWarnings).toEqual([]);
    expect(r.container.textContent).toContain("1/12~2/13");
    expect(r.container.textContent).not.toContain("1/11");
    await r.unmount();
  });

  it("스냅샷 이후 마감일이 지났으면 하이드레이션 직후 '마감'으로 다시 판정한다", async () => {
    const r = await ssrThenHydrate(
      <ApplicationTimeline {...props} applicationEnd="2026-10-02" />,
      { at: kst("2026-10-02T10:00:00") },
      { at: kst("2026-10-03T00:01:00") },
    );
    expect(r.serverText).toContain("오늘 마감이에요");
    expect(r.recoverable).toEqual([]);
    expect(r.hydrationWarnings).toEqual([]);
    expect(r.container.textContent).toContain("접수가 마감되었어요");
    // 첫 행(상태) 배지도 오늘 기준
    expect(r.container.querySelector("dd")?.textContent).toBe("마감");
    await r.unmount();
  });

  it("D-day 는 달력 일수 — 마감 당일 '오늘 마감', 전날 '내일 마감' (목록 D-N 과 같은 셈)", () => {
    vi.setSystemTime(kst("2026-10-05T09:00:00"));
    const { container, rerender } = render(
      <ApplicationTimeline {...props} applicationEnd="2026-10-05" asOf="2026-10-05" />,
    );
    expect(container.textContent).toContain("오늘 마감이에요");
    vi.setSystemTime(kst("2026-10-04T09:00:00"));
    rerender(<ApplicationTimeline {...props} applicationEnd="2026-10-05" asOf="2026-10-04" />);
    expect(container.textContent).toContain("내일 마감이에요");
  });
});

// ---------------------------------------------------------------------------
// 3. 마감 임박 배지 + /programs 카드 목록
// ---------------------------------------------------------------------------

describe("DeadlineBadge — today prop", () => {
  it("today 를 넘기면 그 날 기준 D-N·색 (서버 시계 무관)", () => {
    vi.setSystemTime(kst("2026-12-31T12:00:00"));
    const d3 = renderToString(<DeadlineBadge applicationEnd="2026-10-05" today="2026-10-02" />);
    expect(d3).toContain("마감 D-<!-- -->3");
    const d7 = renderToString(<DeadlineBadge applicationEnd="2026-10-05" today="2026-09-28" />);
    expect(d7).toContain("마감 D-<!-- -->7");
    expect(renderToString(<DeadlineBadge applicationEnd="2026-10-05" today="2026-10-05" />)).toContain("오늘 마감");
  });

  it("today 를 생략하면 지금 KST 날짜(서버 컴포넌트 호출처 — 기존 동작)", () => {
    vi.setSystemTime(kst("2026-10-03T00:01:00"));
    expect(renderToString(<DeadlineBadge applicationEnd="2026-10-05" />)).toContain("마감 D-<!-- -->2");
  });
});

describe("ProgramList — /programs 카드 D-N·신규 하이드레이션", () => {
  const program: SupportProgram = {
    id: "SP-TEST",
    title: "하이드레이션 테스트 사업",
    summary: "요약",
    region: "전국",
    organization: "테스트 기관",
    supportType: "보조금",
    supportAmount: "최대 100만 원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail: "누구나",
    applicationStart: "2026-09-01",
    applicationEnd: "2026-10-05",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.example.go.kr/notice/1",
    year: 2026,
    createdAt: "2026-09-19T00:00:00Z",
  };

  it("CDN 스냅샷(10/2: D-3·신규) 을 10/3 브라우저가 열어도 불일치 0 → 직후 D-2·신규 해제", async () => {
    const el = (
      <ProgramList
        initialPrograms={[program]}
        initialHasMore={false}
        total={1}
        filters={{}}
        asOf="2026-10-02"
      />
    );
    const r = await ssrThenHydrate(
      el,
      { at: kst("2026-10-02T23:58:00"), tz: "UTC" },
      { at: kst("2026-10-03T00:01:00") },
    );
    expect(r.serverText).toContain("마감 D-3");
    expect(r.serverText).toContain("신규");
    expect(r.recoverable).toEqual([]);
    expect(r.hydrationWarnings).toEqual([]);
    expect(r.container.textContent).toContain("마감 D-2");
    expect(r.container.textContent).not.toContain("신규");
    await r.unmount();
  });
});

// ---------------------------------------------------------------------------
// 4. 작물 상세 — 연간 작업 흐름 "이번 달"
// ---------------------------------------------------------------------------

describe("MonthlyTaskCalendar — 달이 바뀌는 날 하이드레이션", () => {
  it("10/31 스냅샷을 11/1 00:01 KST 에 열어도 불일치 0 → 직후 11월 강조", async () => {
    const el = <MonthlyTaskCalendar cropId="rice" asOf="2026-10-31" />;
    const r = await ssrThenHydrate(
      el,
      // 서버(UTC)는 이미 11/1 이 지난 시계여도 asOf 가 기준이다
      { at: kst("2026-11-01T10:00:00"), tz: "UTC" },
      { at: kst("2026-11-01T00:01:00") },
    );
    expect(r.serverText).toContain("10월: 수확");
    expect(r.recoverable).toEqual([]);
    expect(r.hydrationWarnings).toEqual([]);
    expect(r.container.textContent).toContain("11월: 수확 후 관리");
    await r.unmount();
  });
});
