import { describe, it, expect } from "vitest";
import {
  buildEventFacts,
  cardTitle,
  distinctLocation,
  distinctTarget,
  durationLabel,
  eventTypeChip,
  formatDotRange,
  isBoilerplateDescription,
  meaningfulCost,
  recruitLabel,
  regionHref,
  regionLabel,
} from "@/components/events/event-fields";
import type { FarmEvent } from "@/lib/data/events";

const stay: FarmEvent = {
  id: "stay-1",
  title: "다산초당권역마을 농촌에서 살아보기 (귀촌형)",
  region: "전라남도",
  sigungu: "강진군",
  organization: "전남 강진군",
  type: "팜스테이",
  date: "2026-10-01",
  dateEnd: "2026-11-13",
  applicationStart: "2026-08-19",
  applicationEnd: "2026-09-30",
  location: "전라남도 강진군",
  cost: "상세 공고 참조",
  description: "그린대로 농촌에서 살아보기에서 수집했어요. 그린대로(농식품부) 집계 기준이에요.",
  capacity: 6,
  target: "농촌에서 살아보기 귀촌형",
  url: "https://www.greendaero.go.kr/",
  status: "접수중",
  moveInDate: "2026-10-01",
  households: 4,
};

const expo: FarmEvent = {
  id: "expo-1",
  title: "2026 수원 케이팜",
  region: "경기도",
  organization: "케이팜 운영위원회",
  type: "박람회",
  date: "2026-10-29",
  dateEnd: "2026-10-31",
  applicationStart: "2026-09-01",
  applicationEnd: "2026-10-28",
  location: "수원컨벤션센터",
  cost: "무료 (사전등록)",
  description: "전시부스와 상담 프로그램이 함께 열리는 귀농귀촌 박람회예요.",
  capacity: null,
  target: "귀농·귀촌 희망자",
  url: "https://example.com",
  status: "접수중",
};

describe("유형 칩", () => {
  it("villageType 이 있으면 그 값", () => {
    expect(eventTypeChip({ ...stay, villageType: "프로젝트형" })).toBe("프로젝트형");
  });
  it("없으면 제목·대상에서 마을 유형을 뽑는다", () => {
    expect(eventTypeChip(stay)).toBe("귀촌형");
  });
  it("마을 유형이 없으면 행사 유형", () => {
    expect(eventTypeChip(expo)).toBe("박람회");
  });
});

describe("카드 제목", () => {
  it("칩과 겹치는 꼬리 유형 표기를 뗀다", () => {
    expect(cardTitle(stay)).toBe("다산초당권역마을 농촌에서 살아보기");
  });
  it("꼬리 표기가 없으면 원문 그대로", () => {
    expect(cardTitle(expo)).toBe("2026 수원 케이팜");
  });
});

describe("지역 표기·링크", () => {
  it("시·도 약칭 + 시·군·구", () => {
    expect(regionLabel(stay)).toBe("전남 강진군");
    expect(regionLabel(expo)).toBe("경기도");
  });
  it("시·군·구가 있으면 시·군·구 상세, 없으면 시·도 상세", () => {
    expect(regionHref(stay)).toBe("/regions/jeonnam/gangjin");
    expect(regionHref(expo)).toBe("/regions/gyeonggi");
    expect(regionHref({ region: "전국", sigungu: undefined })).toBeNull();
  });
});

describe("기간·인원 표기", () => {
  it("점 표기 범위", () => {
    expect(formatDotRange("2026-10-01", "2026-11-13")).toBe("2026.10.01 ~ 11.13");
    expect(formatDotRange("2026-12-20", "2027-01-15")).toBe("2026.12.20 ~ 2027.01.15");
    expect(formatDotRange("2026-10-01", "2026-10-01")).toBe("2026.10.01");
    expect(formatDotRange(undefined, "2026-10-01")).toBe("~ 2026.10.01");
    expect(formatDotRange("9999-12-31", "9999-12-31")).toBeNull();
  });
  it("기간 길이 — 며칠 비워야 하는지", () => {
    expect(durationLabel("2026-10-01", "2026-10-01")).toBe("하루");
    expect(durationLabel("2026-10-01", "2026-10-03")).toBe("3일");
    expect(durationLabel("2026-10-01", "2026-11-13")).toBe("약 6주");
    expect(durationLabel("2026-10-01", "2027-01-31")).toBe("약 4개월");
    expect(durationLabel("2026-10-05", "2026-10-01")).toBeNull();
  });
  it("가구 + 인원, 0 은 표기하지 않음", () => {
    expect(recruitLabel({ households: 4, capacity: 6 })).toBe("4가구 6명");
    expect(recruitLabel({ households: null, capacity: 20 })).toBe("20명");
    expect(recruitLabel({ households: 1, capacity: 0 })).toBe("1가구");
    expect(recruitLabel({ households: null, capacity: null })).toBeNull();
  });
});

describe("상투적인 값은 숨긴다", () => {
  it("비용 채움값", () => {
    expect(meaningfulCost("상세 공고 참조")).toBeNull();
    expect(meaningfulCost("추후 공지")).toBeNull();
    expect(meaningfulCost("무료 (사전등록)")).toBe("무료 (사전등록)");
  });
  it("지역과 같은 장소", () => {
    expect(distinctLocation(stay)).toBeNull();
    expect(distinctLocation(expo)).toBe("수원컨벤션센터");
  });
  it("유형 칩과 같은 대상", () => {
    expect(distinctTarget(stay)).toBeNull();
    expect(distinctTarget(expo)).toBe("귀농·귀촌 희망자");
  });
  it("수집 안내 상투 문구", () => {
    expect(isBoilerplateDescription(stay.description)).toBe(true);
    expect(isBoilerplateDescription(expo.description)).toBe(false);
    expect(isBoilerplateDescription("")).toBe(true);
  });
});

describe("사실 행 조립", () => {
  it("살아보기 카드 — 입주·신청·운영·인원 4줄", () => {
    const facts = buildEventFacts(stay, "card");
    expect(facts.map((f) => f.label)).toEqual(["입주 가능일", "신청 기간", "운영 기간", "모집 인원"]);
    expect(facts[2].value).toBe("2026.10.01 ~ 11.13 (약 6주)");
    expect(facts[3].value).toBe("4가구 6명");
  });
  it("그 외 유형 카드 — 일정·접수·장소·정원", () => {
    const facts = buildEventFacts(expo, "card");
    expect(facts.map((f) => f.label)).toEqual(["행사 일정", "접수 기간", "장소"]);
  });
  it("상세는 지역·주최를 더하고 지역엔 링크를 붙인다", () => {
    const facts = buildEventFacts(stay, "detail");
    const labels = facts.map((f) => f.label);
    expect(labels).toContain("지역");
    expect(labels).toContain("주최");
    // 상투적인 비용·중복 대상·중복 장소는 상세에서도 행을 만들지 않는다
    expect(labels).not.toContain("비용");
    expect(labels).not.toContain("대상");
    expect(labels).not.toContain("장소");
    expect(facts.find((f) => f.label === "지역")?.href).toBe("/regions/jeonnam/gangjin");
  });
  it("값이 없는 행은 만들지 않는다 (입주 가능일 미수집)", () => {
    const facts = buildEventFacts({ ...stay, moveInDate: undefined }, "card");
    expect(facts.map((f) => f.label)).not.toContain("입주 가능일");
  });
});
