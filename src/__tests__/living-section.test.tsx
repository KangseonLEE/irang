import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { LivingSection, pickLivingStays, LIVING_MAX } from "@/components/landing/living-section";
import type { FarmEvent } from "@/lib/data/events";

/** 실데이터(그린대로 수집)와 같은 모양의 최소 행 */
function stay(over: Partial<FarmEvent> & { id: string }): FarmEvent {
  return {
    title: "대티골마을 농촌에서 살아보기 (귀농형)",
    region: "경상북도",
    sigungu: "영양군",
    organization: "영양군",
    type: "살아보기",
    date: "2026-10-01",
    dateEnd: "2026-11-30",
    applicationStart: "2026-09-09",
    applicationEnd: "2026-12-31",
    location: "경북 영양군",
    cost: "무료",
    description: "마을에서 살아보는 프로그램이에요.",
    capacity: 5,
    target: "귀농 희망자",
    url: "https://www.greendaero.go.kr/",
    status: "접수중",
    ...over,
  };
}

const three = [stay({ id: "a" }), stay({ id: "b" }), stay({ id: "c" })];

describe("LivingSection — 랜딩 살아보기 캐러셀 (9/30)", () => {
  it("3건 미만이면 섹션 자체를 렌더하지 않는다", () => {
    expect(renderToStaticMarkup(<LivingSection items={[]} />)).toBe("");
    expect(renderToStaticMarkup(<LivingSection items={three.slice(0, 2)} />)).toBe("");
    expect(renderToStaticMarkup(<LivingSection items={three} />)).not.toBe("");
  });

  it("SSR 에 카드 수만큼 /events/ 링크가 남는다 (조건부 렌더 금지)", () => {
    const items = Array.from({ length: 8 }, (_, i) => stay({ id: `v${i}` }));
    const html = renderToStaticMarkup(<LivingSection items={items} />);
    expect(html.match(/href="\/events\/v\d"/g)?.length).toBe(8);
    // 계측 라벨 2종
    expect(html.match(/data-track="living:card"/g)?.length).toBe(8);
    expect(html).toContain('data-track="living:view_all"');
  });

  it("모두 보기는 /events?type=살아보기 (라우트 실존)", () => {
    const html = renderToStaticMarkup(<LivingSection items={three} />);
    expect(html).toContain("/events?type=살아보기");
    expect(existsSync(join(process.cwd(), "src", "app", "events", "page.tsx"))).toBe(true);
    expect(existsSync(join(process.cwd(), "src", "app", "events", "[id]", "page.tsx"))).toBe(true);
  });

  it("카드 문구 — 마을명·지역 축약·유형 칩·운영 기간·짧은 마감 표기", () => {
    const html = renderToStaticMarkup(<LivingSection items={three} />);
    expect(html).toContain("대티골마을"); // "농촌에서 살아보기 (귀농형)" 보일러플레이트 제거
    expect(html).not.toContain("대티골마을 농촌에서");
    expect(html).toContain("경북 영양군"); // PROVINCES.shortName + 시·군·구
    expect(html).toContain("귀농형"); // 유형 칩 (village_type 비어 있어도 제목에서 도출)
    expect(html).toContain("10.1부터 2개월 살아보기"); // 운영 기간 길이
    expect(html).toContain("~12.31 마감"); // 전체 기간 대신 마감 한 조각
    expect(html).toContain("5명 모집");
  });

  it("마감 임박(7일 이내)일 때만 D-N 배지, 접수예정은 신청 시작일 표기", () => {
    const soon = renderToStaticMarkup(
      <LivingSection
        items={[
          stay({ id: "u1", applicationEnd: "2026-09-30" }), // 오늘(테스트 실행일 기준) 이후면 D-N
          stay({ id: "u2" }),
          stay({ id: "u3", status: "접수예정", applicationStart: "2026-12-01", applicationEnd: "2026-12-20" }),
        ]}
      />,
    );
    // applicationEnd 12.31 인 기본 행은 임박이 아니다 → 배지는 최대 1개
    expect((soon.match(/D-\d+|오늘 마감/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(soon).toContain("12.1부터 신청");
    expect(soon).toContain("접수예정");
  });

  it("사진일 때만 출처 표기 — 폴백 일러스트엔 붙지 않는다", () => {
    const photo = "https://www.greendaero.go.kr/svc/common/board/img/att-abc.do";
    const html = renderToStaticMarkup(
      <LivingSection items={[stay({ id: "p1", imageUrl: photo }), stay({ id: "p2" }), stay({ id: "p3" })]} />,
    );
    expect(html.match(/사진: 그린대로/g)?.length).toBe(1);
  });

  it("pickLivingStays — 마감 제외·접수중 우선·마감 가까운 순·상한 8", () => {
    const picked = pickLivingStays([
      stay({ id: "closed", status: "마감", applicationEnd: "2026-09-01" }),
      stay({ id: "soonPlanned", status: "접수예정", applicationEnd: "2026-10-05" }),
      stay({ id: "openLate", applicationEnd: "2026-10-20" }),
      stay({ id: "openEarly", applicationEnd: "2026-10-10" }),
    ]);
    expect(picked.map((e) => e.id)).toEqual(["openEarly", "openLate", "soonPlanned"]);

    const many = Array.from({ length: 12 }, (_, i) => stay({ id: `m${i}` }));
    expect(pickLivingStays(many)).toHaveLength(LIVING_MAX);
  });
});
