/**
 * 10/6 QA Q4-W11 — 위저드 안 브라우저 뒤로가기 = 한 단계 뒤로 (use-wizard-back-guard).
 * 가드 항목은 늘 하나 — depth 1 이상이면 얹고, 뒤로가기가 꺼내면 한 단계 되돌린 뒤 다시 얹고, 0 이면 걷는다.
 */
import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { useWizardBackGuard } from "@/app/match/use-wizard-back-guard";

function Wizard() {
  const [step, setStep] = useState(0);
  useWizardBackGuard(step, () => setStep((s) => Math.max(0, s - 1)));
  return (
    <div>
      <span data-testid="step">{step}</span>
      <button type="button" onClick={() => setStep((s) => s + 1)}>다음</button>
      <button type="button" onClick={() => setStep(0)}>처음부터</button>
    </div>
  );
}

/** jsdom 의 history.back() 은 popstate 를 다음 작업으로 미룬다 */
async function back() {
  await act(async () => {
    window.history.back();
    await new Promise((r) => setTimeout(r, 30));
  });
}

const step = () => screen.getByTestId("step").textContent;

describe("useWizardBackGuard", () => {
  it("뒤로가기를 누를 때마다 한 단계씩, 첫 단계에서는 가드가 없다", async () => {
    window.history.replaceState(null, "", "/match?mode=quick");
    const base = window.history.length;
    render(<Wizard />);
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(step()).toBe("3");
    // 문항 셋을 넘겨도 가드는 하나 — history 가 문항 수만큼 늘지 않는다
    expect(window.history.length).toBe(base + 1);

    await back();
    expect(step()).toBe("2");
    await back();
    expect(step()).toBe("1");
    await back();
    expect(step()).toBe("0");
    expect(window.location.search).toBe("?mode=quick");
  });

  it("처음부터(0) 으로 돌아가면 가드를 걷는다 — 그 popstate 는 한 단계 뒤로가 아니다", async () => {
    render(<Wizard />);
    fireEvent.click(screen.getByText("다음"));
    fireEvent.click(screen.getByText("다음"));
    expect(step()).toBe("2");
    await act(async () => {
      fireEvent.click(screen.getByText("처음부터"));
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(step()).toBe("0");
    expect(window.history.state === null || !("__irangWizardGuard" in (window.history.state as object))).toBe(true);
  });
});
