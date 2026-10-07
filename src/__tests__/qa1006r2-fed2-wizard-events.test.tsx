/**
 * 10/6 2차 QA R2-Q4 — 진단 결과 저장·완료 이벤트는 "결과 한 건에 한 번".
 *
 * 유형 진단(10문항)은 saveStatus 1회 가드라 "다시 시작하기"·뒤로가기로 답을 바꿔도 새 결과가 저장되지 않았고
 * (공유 링크도 첫 결과), 완료 이벤트는 결과에 다시 들어올 때마다 나갔다. 빠른 점검도 이벤트가 키 비교보다 앞이었다.
 * 규칙: 답(+미리 채운 맥락) 키가 바뀔 때만 저장·이벤트, "다시 …하기"는 키를 비워 새로 센다.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { HISTORY_STORAGE_KEY } from "@/lib/diagnosis/history";

const events: string[] = [];
vi.mock("@/lib/analytics", () => ({
  trackEvent: () => {},
  analytics: new Proxy(
    {},
    {
      get: (_t, name: string) => () => {
        events.push(name);
      },
    },
  ),
}));

let idSeq = 0;
const saved: { id: string; source?: string }[] = [];
vi.mock("@/lib/assess-result", () => ({
  generateResultId: () => `id${String(++idSeq).padStart(10, "0")}`,
  saveAssessmentResult: async (p: { id: string; source?: string }) => {
    saved.push({ id: p.id, source: p.source });
    return { success: true, id: p.id };
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  usePathname: () => "/match",
}));

import { QuickWizard } from "@/app/match/quick-wizard";
import { MatchWizard } from "@/app/match/match-wizard";

const count = (name: string) => events.filter((e) => e === name).length;
const historyIds = () =>
  (JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]") as { resultId: string }[]).map((h) => h.resultId);

/** 선택지 누르기 → 자동 넘김(400ms) */
async function pick(label: string) {
  fireEvent.click(screen.getByText(label));
  await act(async () => {
    vi.advanceTimersByTime(450);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  events.length = 0;
  saved.length = 0;
  idSeq = 0;
  localStorage.clear();
  window.history.replaceState(null, "", "/match");
});
afterEach(() => {
  vi.useRealTimers();
});

describe("빠른 점검 — 완료 이벤트·저장은 같은 답이면 한 번", () => {
  async function answerAll(capital: string) {
    await pick("40대");
    await pick("혼자");
    await pick("부업·취미");
    await pick(capital);
  }

  it("결과 → 뒤로 → 같은 답으로 다시 결과: 이벤트·저장 늘지 않음 / 답을 바꾸면 새 결과 / 다시 점검하기는 새로 센다", async () => {
    render(<QuickWizard />);
    await answerAll("1억 미만");
    expect(count("quickCheckComplete")).toBe(1);
    expect(saved).toHaveLength(1);

    // 결과 화면의 뒤로 → 마지막 문항(답 유지) → 같은 답
    fireEvent.click(screen.getByRole("button", { name: "이전 단계로" }));
    await pick("1억 미만");
    expect(count("quickCheckComplete")).toBe(1);
    expect(saved).toHaveLength(1);

    // 마지막 답만 바꾼다 → 새 결과
    fireEvent.click(screen.getByRole("button", { name: "이전 단계로" }));
    await pick("1~3억");
    expect(count("quickCheckComplete")).toBe(2);
    expect(saved).toHaveLength(2);
    expect(historyIds()).toHaveLength(2);

    // 다시 점검하기 → 같은 답으로 마쳐도 새로 센다(의도한 재진단). 목록은 같은 결과 한 칸
    fireEvent.click(screen.getByText("다시 점검하기"));
    await answerAll("1~3억");
    expect(count("quickCheckComplete")).toBe(3);
    expect(saved).toHaveLength(3);
    expect(historyIds()).toHaveLength(2);
  });
});

describe("정착 유형 진단 — 다시 시작·답 변경이 새 결과로 저장되고 공유 링크도 그 결과", () => {
  /** 10문항 — 복수 선택 2개는 하나 고르고 "다음" */
  async function answerAll(last: string) {
    await pick("온화한 기후");
    fireEvent.click(screen.getByText("자연환경"));
    fireEvent.click(screen.getByRole("button", { name: /^다음/ }));
    await act(async () => {});
    fireEvent.click(screen.getByText("채소"));
    fireEvent.click(screen.getByRole("button", { name: /^다음/ }));
    await act(async () => {});
    await pick("도시 근교");
    await pick("경험 없음");
    await pick("3천만 원 이하");
    await pick("혼자");
    await pick("1년 이내");
    await pick("직접 농사");
    await pick(last);
    // 저장 응답(Promise) 반영
    await act(async () => {});
  }

  it("같은 결과는 이벤트·저장 한 번, 다시 시작하기·답 변경은 새 결과(새 id)", async () => {
    render(<MatchWizard />);
    await answerAll("넓은 농경지");
    expect(count("matchComplete")).toBe(1);
    expect(saved.map((s) => s.id)).toEqual(["id0000000001"]);
    expect(historyIds()).toEqual(["id0000000001"]);

    // 다시 시작하기 → 같은 답 → 새로 저장(의도한 재진단), 목록은 같은 결과 한 칸(예전엔 두 칸)
    fireEvent.click(screen.getByText("다시 시작하기"));
    await answerAll("넓은 농경지");
    expect(count("matchComplete")).toBe(2);
    expect(saved).toHaveLength(2);
    expect(historyIds()).toEqual(["id0000000002"]);

    // 브라우저 뒤로가기로 마지막 문항 → 같은 답 → 결과: 이벤트·저장 그대로
    await act(async () => {
      window.history.back();
      await vi.advanceTimersByTimeAsync(30);
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/정착 환경/);
    await pick("넓은 농경지");
    await act(async () => {});
    expect(count("matchComplete")).toBe(2);
    expect(saved).toHaveLength(2);

    // 마지막 답만 바꿔 다시 결과 → 새 결과로 저장
    await act(async () => {
      window.history.back();
      await vi.advanceTimersByTimeAsync(30);
    });
    await pick("산간 마을");
    await act(async () => {});
    expect(count("matchComplete")).toBe(3);
    expect(saved.map((s) => s.id)).toEqual(["id0000000001", "id0000000002", "id0000000003"]);

    // "링크 복사"는 지금 결과(마지막 id) — 예전엔 첫 결과를 복사했다
    const copied: string[] = [];
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (t: string) => void copied.push(t) },
      configurable: true,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /링크 복사/ }));
    });
    expect(copied.at(-1)).toMatch(/\/r\/id0000000003$/);
  });
});
