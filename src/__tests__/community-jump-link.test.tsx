import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CommunityJumpLink } from "@/components/community/community-jump-link";
import { analytics } from "@/lib/analytics";

describe("CommunityJumpLink", () => {
  it("순수 앵커라 JS 없이 의견란으로 간다 — 데스크탑·모바일 동일", () => {
    const html = renderToStaticMarkup(<CommunityJumpLink from="crop_detail" />);
    expect(html).toContain('href="#community-notes"');
  });

  it("지면 구분 계측 훅을 단다", () => {
    const html = renderToStaticMarkup(<CommunityJumpLink from="sigungu_detail" />);
    expect(html).toContain('data-community-jump="sigungu_detail"');
  });
});

describe("커뮤니티 계측 계약", () => {
  it("노출·진입 이벤트가 정의돼 있다 — 둘을 따로 세야 '안 쓴다'와 '못 본다'가 갈린다", () => {
    expect(typeof analytics.communityView).toBe("function");
    expect(typeof analytics.communityJumpClick).toBe("function");
  });
});
