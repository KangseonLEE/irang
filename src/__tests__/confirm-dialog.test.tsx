import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DialogProvider, useDialog } from "@/components/ui/confirm-dialog";

function Harness({ onResult }: { onResult: (v: unknown) => void }) {
  const { confirm, alert } = useDialog();
  return (
    <>
      <button onClick={async () => onResult(await confirm({ title: "지울까요?", description: "되돌릴 수 없어요" }))}>
        확인요청
      </button>
      <button onClick={async () => { await alert({ title: "전송했어요" }); onResult("alert-done"); }}>
        알림
      </button>
    </>
  );
}

const open = (label: string) => fireEvent.click(screen.getByText(label));

describe("useDialog — 공용 확인·알림 (9/29)", () => {
  it("확인을 누르면 true 로 resolve 한다", async () => {
    const onResult = vi.fn();
    render(<DialogProvider><Harness onResult={onResult} /></DialogProvider>);
    open("확인요청");
    expect(await screen.findByRole("alertdialog")).toHaveAccessibleName("지울까요?");
    fireEvent.click(screen.getByText("삭제"));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  });

  it("취소를 누르면 false 로 resolve 한다", async () => {
    const onResult = vi.fn();
    render(<DialogProvider><Harness onResult={onResult} /></DialogProvider>);
    open("확인요청");
    fireEvent.click(await screen.findByText("취소"));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });

  it("Esc 는 취소(false)로 닫는다", async () => {
    const onResult = vi.fn();
    render(<DialogProvider><Harness onResult={onResult} /></DialogProvider>);
    open("확인요청");
    fireEvent.keyDown(await screen.findByRole("alertdialog"), { key: "Escape" });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("alert 은 확인 버튼 하나로 resolve 한다", async () => {
    const onResult = vi.fn();
    render(<DialogProvider><Harness onResult={onResult} /></DialogProvider>);
    open("알림");
    const dialog = await screen.findByRole("alertdialog");
    expect(screen.queryByText("취소")).toBeNull();
    fireEvent.click(screen.getByText("확인"));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith("alert-done"));
    expect(dialog).not.toBeInTheDocument();
  });
});

/**
 * 계약 테스트 — 새 `window.confirm/alert/prompt` 가 조용히 들어오지 못하게 (lint 와 이중 가드).
 * search-bar·community-notes 처럼 다이얼로그를 쓰는 화면은 렌더 비용이 커(router·searchParams mock)
 * 컴포넌트 렌더 대신 **호출처 스캔**으로 막는다 — 9/19 internal-traffic-callsites 와 같은 결.
 */
describe("브라우저 기본 팝업 금지 계약", () => {
  it("src 에 window.confirm/alert/prompt 호출이 없다", async () => {
    const { readdirSync, readFileSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (name === "__tests__" || name === "node_modules") continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) { walk(full); continue; }
        if (!/\.(ts|tsx)$/.test(name)) continue;
        const src = readFileSync(full, "utf8");
        src.split("\n").forEach((line, i) => {
          if (/^\s*[/*]/.test(line)) return; // 주석 제외
          if (/\bwindow\.(confirm|alert|prompt)\s*\(/.test(line)) hits.push(`${full}:${i + 1}`);
        });
      }
    };
    walk("src");
    expect(hits).toEqual([]);
  });
});
