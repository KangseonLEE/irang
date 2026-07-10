/**
 * crawl-grouping.ts 단위 테스트 (2026-07-09 회장 결재)
 *
 * 배경:
 *   sync-data.yml 일일 크롤이 support_programs·education_courses에 crawl-* row를 적재한다.
 *   하나의 모사업("청년농업인 영농정착지원사업 2차")이 시·군별 공고로 쪼개져
 *   지역만 다른 카드가 6~7건 반복 노출되던 문제를 정규화 기반 그룹핑으로 해소한다.
 *
 * 검증 목표:
 *   1) 정규화 — 연도·차수·지역·괄호·공고 동작어를 제거해 동일 모사업 변형이 같은 stem으로 수렴
 *   2) 대표 선정 — 활성(모집중) 우선 → 마감 임박순, 활성 없으면 최신
 *   3) 정적 SP-*·rda-* row는 그룹핑 대상 제외
 *   4) 그룹 크기 1이면 그룹핑하지 않음(crawlGroup 미부착)
 *   5) 원본 순서 보존
 */

import { describe, it, expect } from "vitest";
import {
  normalizeCrawlTitle,
  isCrawlRow,
  groupCrawlRows,
  type CrawlGroupable,
} from "@/lib/crawl-grouping";

/** 라이브 support_programs에서 관측된 "영농정착 2차" 실제 제목 변형 (2026-07-09) */
const YEONGNONG_VARIANTS = [
  "2026년 청년농업인 영농정착 지원사업 2차 선발 안내",
  "2026년 청년농업인 영농정착지원사업 2차 모집 공고",
  "2026년 청년농업인 영농정착지원사업 2차 모집 공고(예정)",
  "2026년 청년농업인 영농정착지원사업 2차 신청 안내",
  "2026년 청년농업인 영농정착지원사업 대상자 모집 안내(2차)",
  "2026년 청년농업인 영농정착지원사업 대상자 모집(2차) 공고",
  "2026년 청년농업인영농정착지원 사업대상자 2차 선발 알림",
];

/** 라이브 education_courses에서 관측된 "기초영농기술교육 4~5차" 실제 제목 변형 */
const GICHO_VARIANTS = [
  "2026년 신규농업인 기초영농기술교육 계획(4~5차) 알림",
  "농업기술원 「신규농업인 기초영농기술교육(4~5차) 교육」 교육생 모집",
  "2026년 신규농업인 기초영농기술교육 신청 알림",
  "신규농업인 기초영농기술교육(4~5차) 신청안내",
];

describe("normalizeCrawlTitle — 동일 모사업 변형 수렴", () => {
  it("영농정착 2차 7개 변형이 모두 같은 stem으로 수렴한다", () => {
    const stems = new Set(YEONGNONG_VARIANTS.map(normalizeCrawlTitle));
    expect(stems.size).toBe(1);
    // 빈 문자열(그룹핑 제외)로 수렴하면 안 됨
    expect([...stems][0]).not.toBe("");
  });

  it("기초영농기술교육 4개 변형이 모두 같은 stem으로 수렴한다", () => {
    const stems = new Set(GICHO_VARIANTS.map(normalizeCrawlTitle));
    expect(stems.size).toBe(1);
    expect([...stems][0]).not.toBe("");
  });

  it("연도·차수·지역 접두를 제거한다", () => {
    const a = normalizeCrawlTitle("2026년 전남 해남 청년농업인 영농정착지원사업 2차 모집");
    const b = normalizeCrawlTitle("청년농업인 영농정착지원사업 신청");
    expect(a).toBe(b);
  });

  it("() [] 부가 설명은 제거하고 「」 사업명 래핑은 내용을 보존한다", () => {
    // 「」 안 사업명은 남아야 하고, () 안 차수/부가어는 사라져야 한다
    const wrapped = normalizeCrawlTitle("「신규농업인 기초영농기술교육(4~5차) 교육」 교육생 모집");
    const plain = normalizeCrawlTitle("신규농업인 기초영농기술교육 신청 알림");
    expect(wrapped).toBe(plain);
  });

  it("서로 다른 모사업은 다른 stem을 가진다", () => {
    const yeongnong = normalizeCrawlTitle(YEONGNONG_VARIANTS[0]);
    const startup = normalizeCrawlTitle("2026년 청년농업인 스타트업(초기창업) 지원사업 신청 안내");
    const gicho = normalizeCrawlTitle(GICHO_VARIANTS[0]);
    expect(new Set([yeongnong, startup, gicho]).size).toBe(3);
  });

  it("초-일반 stem(교육/교육과정 등)은 빈 문자열로 그룹핑에서 제외한다", () => {
    expect(normalizeCrawlTitle("2026년 미래농업교육원 교육과정 수강생 모집")).toBe("");
    expect(normalizeCrawlTitle("7월 교육 안내")).toBe("");
  });
});

describe("isCrawlRow", () => {
  it("crawl 접두 id만 크롤 row로 판정한다", () => {
    expect(isCrawlRow("crawl-rda-programs-abc123")).toBe(true);
    expect(isCrawlRow("crawl-agrix-programs-xyz")).toBe(true);
    expect(isCrawlRow("SP-020")).toBe(false);
    expect(isCrawlRow("ED-001")).toBe(false);
    expect(isCrawlRow("rda-1234")).toBe(false);
  });
});

/** 테스트용 크롤 row 팩토리 */
function row(
  id: string,
  title: string,
  region: string,
  status: CrawlGroupable["status"],
  applicationEnd: string,
  createdAt?: string,
): CrawlGroupable {
  return { id, title, region, status, applicationEnd, createdAt };
}

describe("groupCrawlRows — 그룹핑 동작", () => {
  it("동일 모사업 크롤 row를 대표 1건으로 묶고 나머지를 others로 부착한다", () => {
    const rows = YEONGNONG_VARIANTS.map((t, i) =>
      row(`crawl-rda-programs-${i}`, t, `지역${i}`, "모집중", "2026-07-10"),
    );
    const out = groupCrawlRows(rows);
    expect(out).toHaveLength(1);
    expect(out[0].crawlGroup).toBeDefined();
    expect(out[0].crawlGroup!.size).toBe(7);
    expect(out[0].crawlGroup!.others).toHaveLength(6);
  });

  it("대표는 활성(모집중) 중 마감 임박순으로 선정된다", () => {
    const rows = [
      row("crawl-a", YEONGNONG_VARIANTS[0], "A", "마감", "2026-06-01"),
      row("crawl-b", YEONGNONG_VARIANTS[1], "B", "모집중", "2026-09-30"),
      row("crawl-c", YEONGNONG_VARIANTS[2], "C", "모집중", "2026-07-10"), // 가장 임박
      row("crawl-d", YEONGNONG_VARIANTS[3], "D", "모집예정", "2026-06-20"),
    ];
    const out = groupCrawlRows(rows);
    expect(out).toHaveLength(1);
    // 모집중 우선 → 그 중 마감 임박(2026-07-10)인 crawl-c가 대표
    expect(out[0].id).toBe("crawl-c");
    expect(out[0].crawlGroup!.size).toBe(4);
  });

  it("활성 멤버가 없으면(전부 마감) 최신 등록순으로 대표를 선정한다", () => {
    const rows = [
      row("crawl-a", YEONGNONG_VARIANTS[0], "A", "마감", "2026-06-01", "2026-05-01"),
      row("crawl-b", YEONGNONG_VARIANTS[1], "B", "마감", "2026-06-02", "2026-06-10"), // 최신
      row("crawl-c", YEONGNONG_VARIANTS[2], "C", "마감", "2026-06-03", "2026-05-20"),
    ];
    const out = groupCrawlRows(rows);
    expect(out[0].id).toBe("crawl-b");
  });

  it("정적 SP-* row는 제목이 같아도 그룹핑하지 않는다", () => {
    const rows = [
      row("SP-020", YEONGNONG_VARIANTS[0], "전국", "모집중", "2026-07-10"),
      row("SP-021", YEONGNONG_VARIANTS[1], "전국", "모집중", "2026-07-10"),
    ];
    const out = groupCrawlRows(rows);
    expect(out).toHaveLength(2);
    expect(out.every((r) => r.crawlGroup === undefined)).toBe(true);
  });

  it("크롤 row가 그룹 크기 1이면 crawlGroup을 부착하지 않는다", () => {
    const rows = [
      row("crawl-solo", "2026년 농업용 면세유 유가연동 보조금 지원사업 안내", "전북 남원", "모집중", "2026-10-31"),
    ];
    const out = groupCrawlRows(rows);
    expect(out).toHaveLength(1);
    expect(out[0].crawlGroup).toBeUndefined();
  });

  it("정적 row와 크롤 그룹이 섞여도 원본 순서를 보존한다", () => {
    const rows = [
      row("SP-001", "정착 지원금", "전국", "모집중", "2026-08-01"),
      row("crawl-a", YEONGNONG_VARIANTS[0], "A", "모집중", "2026-07-10"),
      row("SP-002", "귀농 융자", "전국", "모집중", "2026-08-05"),
      row("crawl-b", YEONGNONG_VARIANTS[1], "B", "모집중", "2026-07-10"),
    ];
    const out = groupCrawlRows(rows);
    // 크롤 그룹은 최초 등장 위치(index 1)에 대표 1건 → SP-001, 대표, SP-002 순
    expect(out.map((r) => r.id)).toEqual(["SP-001", "crawl-a", "SP-002"]);
  });

  it("서로 다른 모사업 크롤 그룹은 각각 별도로 묶인다", () => {
    const rows = [
      ...YEONGNONG_VARIANTS.slice(0, 3).map((t, i) => row(`crawl-y${i}`, t, `Y${i}`, "모집중", "2026-07-10")),
      ...GICHO_VARIANTS.slice(0, 2).map((t, i) => row(`crawl-g${i}`, t, `G${i}`, "모집중", "2026-08-01")),
    ];
    const out = groupCrawlRows(rows);
    expect(out).toHaveLength(2);
    const sizes = out.map((r) => r.crawlGroup!.size).sort();
    expect(sizes).toEqual([2, 3]);
  });
});
