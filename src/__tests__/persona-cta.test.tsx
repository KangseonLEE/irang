import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PersonaCta } from "@/components/persona/persona-cta";
import { PERSONA_INDEX } from "@/lib/data/personas";
import { analytics } from "@/lib/analytics";

/** 진단 진입 CTA — SSR 계약. 유입의 61%가 Organic Search라 SSR 링크는 타협 대상이 아니다. */
describe("PersonaCta", () => {
  it("SSR HTML에 /match 링크가 나온다 — /assess 는 리다이렉트 전용이라 쓰지 않는다", () => {
    const html = renderToStaticMarkup(<PersonaCta from="crops_list" />);
    expect(html).toContain('href="/match?mode=assess"');
    expect(html).not.toContain('href="/assess"');
  });

  it("계측 훅 data-assess-entry 로 지면을 구분한다", () => {
    const html = renderToStaticMarkup(<PersonaCta from="crop_detail" />);
    expect(html).toContain('data-assess-entry="crop_detail"');
  });

  it("persona 가 있으면 적용 상태와 그 라벨을 보여준다", () => {
    const html = renderToStaticMarkup(<PersonaCta persona="farmYouth" from="crops_list" />);
    expect(html).toContain(PERSONA_INDEX.get("farmYouth")!.label);
    expect(html).toContain("맞춤 정렬 중");
    expect(html).toContain("다시 진단하기");
  });

  it("알 수 없는 persona 값은 미적용으로 떨어진다 — 308 strip 이나 수기 URL 대비", () => {
    const html = renderToStaticMarkup(<PersonaCta persona="nope" from="crops_list" />);
    expect(html).toContain("2분 진단 시작");
    expect(html).not.toContain("맞춤 정렬 중");
  });

  it("copy 로 지면별 문구를 바꿀 수 있다", () => {
    const html = renderToStaticMarkup(<PersonaCta from="region_detail" copy="이 지역이 내 조건에 맞을까요?" />);
    expect(html).toContain("이 지역이 내 조건에 맞을까요?");
  });
});

describe("계측 계약", () => {
  it("진단 진입·비교 이벤트가 정의돼 있다", () => {
    expect(typeof analytics.assessEntryClick).toBe("function");
    expect(typeof analytics.compareView).toBe("function");
    expect(typeof analytics.compareRegionChange).toBe("function");
  });
});
