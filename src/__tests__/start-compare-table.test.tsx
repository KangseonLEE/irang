import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StartComparePage from "@/app/start/page";
import { buildLaneCompare } from "@/lib/data/journey-lanes-hub";

/**
 * 비교 표의 행 라벨은 **레인 값과 무관하게 고정**이어야 한다 (9/29 S7-2).
 * 첫 열(귀농) 타일의 label 을 행 라벨로 쓰면 "2024년 귀농 인구" 행에 귀촌 인구·귀산촌 가구가
 * 나란히 오고, "초기 투자금 평균" 행에 귀촌의 "비교할 시·군·구"가 들어온다.
 */
describe("/start 비교 표 — 행 라벨 고정 (9/29 S7-2)", () => {
  const html = renderToStaticMarkup(<StartComparePage />);
  const rows = buildLaneCompare();

  it("행 라벨 4개가 일반 명칭으로 고정된다", () => {
    for (const label of ["지금 볼 수 있는 지원사업", "진입 난이도", "최근 추세", "규모 · 초기 투자금"]) {
      expect(html).toContain(`>${label}</th>`);
    }
  });

  it("레인마다 다른 지표명이 행 라벨로 새지 않는다", () => {
    // 귀농 3·4번 타일의 label 은 귀농 전용 문구 — 행 헤더(<th>)로는 절대 나오면 안 된다
    const guinong = rows.find((r) => r.id === "guinong")!;
    for (const t of guinong.tiles.slice(2)) {
      expect(html).not.toContain(`>${t.label}</th>`);
    }
  });

  it("각 레인의 실제 지표명은 셀 안에 병기된다", () => {
    for (const row of rows) {
      for (const tile of row.tiles) {
        expect(html, `${row.id}/${tile.label}`).toContain(tile.label);
        expect(html, `${row.id}/${tile.value}`).toContain(tile.value);
      }
    }
  });

  it("레인 5종이 열과 카드 양쪽에 모두 링크로 남는다", () => {
    for (const row of rows) {
      expect(html.match(new RegExp(`href="/start/${row.id}"`, "g"))?.length).toBeGreaterThanOrEqual(2);
    }
  });
});
