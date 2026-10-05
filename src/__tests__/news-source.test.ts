import { describe, expect, it } from "vitest";
import { UNKNOWN_SOURCE, cleanSiteName, extractSource, isRuralRelevant } from "@/lib/api/news";

/**
 * 랜딩 "농촌 소식" 언론사 표기·관련도 (2026-10-05).
 * 종전: 지도에 없는 언론사를 호스트 끝에서 두 번째 조각으로 적어 "dynews.co.kr" → "co", "imaeil.com" → "imaeil"
 * (카테고리 5개 50건 중 41건). 또 질의어 일부만 맞은 무관 기사(인도 민법·스페인 관광 등) 8건이 섞였다.
 */
describe("extractSource — 주소로 아는 언론사만, 모르면 '뉴스'", () => {
  it("지도에 있는 언론사(하위 도메인 포함)", () => {
    expect(extractSource("https://www.chosun.com/a/1")).toBe("조선일보");
    expect(extractSource("https://www.yna.co.kr/view/AKR1")).toBe("연합뉴스");
    expect(extractSource("https://dream.kotra.or.kr/x")).toBe("KOTRA");
    expect(extractSource("https://www.ktv.go.kr/news/1")).toBe("KTV");
  });

  it("모르는 .co.kr·.com 은 주소 조각('co'·'imaeil')이 아니라 '뉴스'", () => {
    for (const url of [
      "https://www.dynews.co.kr/news/1",
      "https://www.shinailbo.co.kr/news/1",
      "https://www.imaeil.com/page/1",
      "https://www.gokorea.kr/news/1",
    ]) {
      const s = extractSource(url);
      expect(s, url).toBe(UNKNOWN_SOURCE);
      expect(s, url).not.toMatch(/^(co|or|go|ne|kr|[a-z0-9-]+)$/);
    }
    expect(extractSource("not a url")).toBe(UNKNOWN_SOURCE);
  });
});

describe("cleanSiteName — 기사 페이지가 밝힌 이름을 화면용으로", () => {
  it("보통 이름은 그대로, 네이버 꼬리표는 뗀다", () => {
    expect(cleanSiteName("동양일보")).toBe("동양일보");
    expect(cleanSiteName("  경남도민일보 ")).toBe("경남도민일보");
    expect(cleanSiteName("매일신문 | 네이버")).toBe("매일신문");
    expect(cleanSiteName("M&amp;N뉴스")).toBe("M&N뉴스");
  });

  it("쓸 수 없는 값은 버린다 — 주소·깨진 인코딩·플랫폼 이름", () => {
    expect(cleanSiteName("ktv.go.kr")).toBeUndefined();
    expect(cleanSiteName("https://www.example.co.kr/")).toBeUndefined();
    expect(cleanSiteName("��吏寃쎌���臾�")).toBeUndefined();
    expect(cleanSiteName("ë§¤ì¼ì‹ ë¬¸")).toBeUndefined();
    expect(cleanSiteName("네이버 뉴스")).toBeUndefined();
    expect(cleanSiteName("")).toBeUndefined();
  });

  it("수식어가 붙어 길면 마지막 낱말", () => {
    expect(cleanSiteName("종교신문 1위 크리스천투데이")).toBe("크리스천투데이");
  });
});

describe("isRuralRelevant — 귀농·농촌 맥락이 없는 기사는 뺀다", () => {
  it("10/5 실제로 섞였던 무관 기사", () => {
    expect(isRuralRelevant("인도, 통일민법 제정하는 주 늘면서 무슬림 반발 우려", "교회 출석의 이유는 신앙의 연수(年數)에 관계없이")).toBe(false);
    expect(isRuralRelevant("2026년 스페인 관광산업 정보", "스페인의 관광산업은 해안 휴양, 도시 관광, 문화유산, 미식, 축제")).toBe(false);
    expect(isRuralRelevant("[구미 24시] '준비된 첨단도시' 구미, AI로봇 등 4대 성장엔진", "휴머노이드 로봇 양산체계와 AI 데이터센터")).toBe(false);
  });

  it("귀농·농업·농촌 기사는 남긴다(제목이나 요약 어디든)", () => {
    expect(isRuralRelevant("\"농사는 현장에서 배운다\"…서천 신규농업인 영농 정착 교육")).toBe(true);
    expect(isRuralRelevant("가을은 축제의 계절", "먹거리·꽃에 이색 체험까지, 농촌 마을 곳곳에서")).toBe(true);
    expect(isRuralRelevant("귀촌 가구 늘어")).toBe(true);
    expect(isRuralRelevant("청년 스마트팜 자립기반")).toBe(true);
  });
});
