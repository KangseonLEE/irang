import { describe, it, expect } from "vitest";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { render } from "@testing-library/react";
import { SearchDeadlineBadge } from "@/components/search/search-deadline-badge";
import { kstToday } from "@/lib/program-status";

/**
 * 검색 결과 카드 D-N 배지 — 하이드레이션 안전 (10/3 QA, FE-C 보고).
 * 서버 HTML(그날 날짜)과 브라우저(오늘)의 D-N 이 갈리면 #418 이었다. 서버·하이드레이션은 배지를 그리지 않고,
 * 하이드레이션 직후(또는 처음부터 클라이언트 렌더면 바로) 오늘 기준으로 그린다.
 */
const inDays = (n: number) => kstToday(Date.now() + n * 86_400_000);

describe("SearchDeadlineBadge", () => {
  it("서버 렌더에는 날짜 의존 글자가 없다", () => {
    expect(renderToString(<SearchDeadlineBadge applicationEnd={inDays(3)} applicationStart="2026-01-01" />)).toBe("");
  });

  it("하이드레이션은 오류 없이 지나가고, 끝나면 오늘 기준 배지가 붙는다", async () => {
    const el = <SearchDeadlineBadge applicationEnd={inDays(3)} applicationStart="2026-01-01" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(el);
    document.body.appendChild(container);
    const errors: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, el, { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    expect(container.textContent).toBe("마감 D-3");
    container.remove();
  });

  it("처음부터 클라이언트에서 그리면(운영 /search 는 결과가 CSR) 바로 배지가 있다", () => {
    const { container } = render(<SearchDeadlineBadge applicationEnd={inDays(0)} applicationStart="2026-01-01" />);
    expect(container.textContent).toBe("오늘 마감");
  });

  it("마감 건·먼 마감은 그리지 않는다 (DeadlineBadge 규칙 그대로)", () => {
    const closed = render(<SearchDeadlineBadge applicationEnd={inDays(3)} status="마감" />);
    expect(closed.container.textContent).toBe("");
    const far = render(<SearchDeadlineBadge applicationEnd={inDays(30)} />);
    expect(far.container.textContent).toBe("");
  });
});
