import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { StartCardsSection } from "@/components/landing/start-cards-section";

describe("StartCardsSection — 이랑에서 할 수 있는 것 3카드 (9/7)", () => {
  const html = renderToStaticMarkup(<StartCardsSection openProgramCount={12} dueSoonProgramCount={3} />);

  it("카드 3장이 전부 <a> 이고 start_card 계측 라벨이 있다", () => {
    expect(html.match(/<a /g)?.length).toBe(3);
    for (const id of ["assess", "ranking", "programs"]) expect(html).toContain(`data-track="start_card:${id}"`);
  });

  it("href 가 실제 라우트로 존재", () => {
    for (const href of ["/match", "/regions/ranking", "/programs"]) {
      expect(html).toContain(`href="${href}"`);
      expect(existsSync(join(process.cwd(), "src", "app", href.slice(1), "page.tsx")), href).toBe(true);
    }
  });

  it("지원사업 카드에 서버 집계 숫자가 들어간다", () => {
    expect(html).toContain("12건");
    expect(html).toContain("이번 주 마감 3건");
  });

  it("일러스트 3장이 public 에 실존", () => {
    for (const f of ["farm-youth", "commuter", "family"]) {
      // next/image 가 src 를 /_next/image?url=%2F... 로 감싸므로 인코딩된 경로로 확인
      expect(html).toContain(encodeURIComponent(`/landing/personas/${f}.webp`));
      expect(existsSync(join(process.cwd(), "public", "landing", "personas", `${f}.webp`)), f).toBe(true);
    }
  });

  it("버튼 요소가 카드 안에 없다 (카드 전체가 링크)", () => {
    // 위치 점(role=tab)은 트랙 밖. 카드 내부 <button> 0
    const cardHtml = html.slice(html.indexOf("<ul"), html.indexOf("</ul>"));
    expect(cardHtml).not.toContain("<button");
  });
});
