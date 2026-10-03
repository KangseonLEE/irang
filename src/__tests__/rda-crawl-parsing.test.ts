/**
 * RDA 똑똑!청년농부 크롤 파서 (supabase/functions/_shared/crawl-utils.ts) — 2026-10-03 DE-A
 *
 * 배경: sync-crawl 의 rda-programs·rda-education 행이 목록만 읽고
 *   · 주관 기관을 "농촌진흥청"(포털 운영 기관일 뿐)으로
 *   · 접수 시작일을 수집일로
 *   · 요약을 "…에서 수집했어요"(정보량 0)로
 * 채워 운영 DB crawl-rda-* 156행이 오표시였다. 상세 페이지(view.do)의 신청기간·주관기관·요약내용으로
 * 채우고, 상세를 못 받으면 틀린 값 대신 미상으로 두는지 검증한다.
 *
 * fixture: src/__tests__/fixtures/rda/ — 10/3 실측 원문을 목록 표·상세 viewArea 만 잘라 둔 것
 * (전화번호·담당자 메일은 가림). 3개 타깃(rda-programs·rda-education·rda-events) × 정상/누락.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  UNKNOWN_DATE,
  applyRdaDetail,
  decodeHtmlEntities,
  enrichRdaItems,
  extractRdaSummary,
  fetchRdaDetail,
  filterRdaEventItems,
  htmlToTextLines,
  kstToday,
  parseDateRange,
  parseRdaDetailHtml,
  parseRdaListingHtml,
  parseRdaListingTotal,
  windowStatus,
  resolveRdaWindow,
  type CrawledItem,
  type RdaDetailFetch,
} from "../../supabase/functions/_shared/crawl-utils";

const fixture = (name: string) =>
  readFileSync(join(process.cwd(), "src/__tests__/fixtures/rda", name), "utf8");

/** fixture 를 받은 날 — 접수 기간 상태를 이 날짜 기준으로 고정한다 */
const TODAY = "2026-10-03";

const programs = () => parseRdaListingHtml(fixture("listing-programs.html"));
const education = () => parseRdaListingHtml(fixture("listing-education.html"));
const bySid = (items: CrawledItem[], sid: string) => {
  const found = items.find((item) => item.url.endsWith(`sId=${sid}`));
  if (!found) throw new Error(`fixture 에 sId=${sid} 행이 없다`);
  return found;
};
const parsedOk = (html: string) => {
  const parsed = parseRdaDetailHtml(html);
  if (parsed.kind !== "ok") throw new Error(`상세 해석 실패: ${parsed.kind}`);
  return parsed;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RDA 목록 — 목록만으로 채운 값은 틀리지 않아야 한다", () => {
  it("실측 목록 3종의 행 수와 '총 N건'을 읽는다", () => {
    expect(programs()).toHaveLength(6);
    expect(education()).toHaveLength(9);
    expect(parseRdaListingHtml(fixture("listing-all-p1.html"))).toHaveLength(10); // 한 페이지 10행
    expect(parseRdaListingTotal(fixture("listing-programs.html"))).toBe(6);
    expect(parseRdaListingTotal(fixture("listing-education.html"))).toBe(9);
    expect(parseRdaListingTotal(fixture("listing-all-p1.html"))).toBe(15); // → 2페이지만 받는다
  });

  it("주관 기관은 '농촌진흥청'이 아니라 목록의 지역 표기, 시작일은 수집일이 아니라 미상", () => {
    for (const item of [...programs(), ...education()]) {
      expect(item.organization).not.toBe("농촌진흥청");
      expect(item.dateStart).toBe(UNKNOWN_DATE);
      expect(item.dateStart).not.toBe(kstToday());
      expect(item.summary).toBe("");
      expect(item.detailMissing).toBe(true);
    }
    const bonghwa = bySid(programs(), "47040");
    expect(bonghwa.region).toBe("경북 봉화"); // &nbsp; 정리
    expect(bonghwa.organization).toBe("경북 봉화");
    expect(bonghwa.dateEnd).toBe("2026-10-06"); // 목록 마감일은 원문 값
    expect(bonghwa.url).toBe("https://www.rda.go.kr/young/custom/policy/view.do?sId=47040");
    expect(bySid(education(), "47028").url).toBe("https://www.rda.go.kr/young/custom/edu/view.do?sId=47028");
  });

  it("'조회된 데이터가 없습니다' 행과 칸이 모자란 행은 버린다", () => {
    const empty = `<p class="resTxt">총 0건</p><table><tbody>
      <tr><td colspan="7">조회된 데이터가 없습니다.</td></tr>
    </tbody></table>`;
    expect(parseRdaListingHtml(empty)).toEqual([]);
    expect(parseRdaListingTotal(empty)).toBe(0);
    expect(parseRdaListingHtml("<html><body>점검 중</body></html>")).toEqual([]);
  });
});

describe("rda-programs — 상세 보강 (정상)", () => {
  it("봉화 청년창업 스마트팜: 주관 기관·접수 시작일·지원 내용을 원문 값으로", () => {
    const merged = applyRdaDetail(
      bySid(programs(), "47040"),
      parseRdaDetailHtml(fixture("detail-policy-47040.html")),
      TODAY,
    );
    expect(merged.organization).toBe("봉화군농업기술센터");
    expect(merged.dateStart).toBe("2026-09-21"); // 수집일(9/30)이 아니다
    expect(merged.dateEnd).toBe("2026-10-06");
    expect(merged.status).toBe("모집중");
    expect(merged.detailMissing).toBe(false);
    // 라벨 줄만 있는 공고 → 대상 + 사업비
    expect(merged.summary).toContain("만18세 이상 ~ 만45세 미만 청년농업인");
    expect(merged.summary).toContain("개소당 500백만원");
    expect(merged.summary).not.toMatch(/수집|2027년 청년창업 스마트팜 지원사업 신청접수/); // 상투문·제목 반복 없음
  });

  it("남원 면세유: 요약 속 중첩 표에서 잘리지 않고, 표 셀은 요약에 섞지 않는다", () => {
    const parsed = parsedOk(fixture("detail-policy-46824.html"));
    expect(parsed.detail.organization).toBe("남원시청");
    expect(parsed.detail.dateStart).toBe("2026-04-20");
    expect(parsed.detail.dateEnd).toBe("2026-10-31");
    expect(parsed.detail.summary.startsWith("지원내용 : 트랙터, 경운기, 콤바인용 면세경유")).toBe(true);
    expect(parsed.detail.summary).toContain("지원대상 :");

    const html = fixture("detail-policy-46824.html");
    const lines = htmlToTextLines(html.slice(html.search(/<th>요약내용<\/th>/)));
    expect(lines).toContain("6. 신청기간 : 2026.4.20. ~ 10.31."); // 표 뒤 줄까지 이어서 읽는다
    expect(lines).not.toContain("경유"); // 지원단가 표 셀
  });

  it("두 번 인코딩된 &amp;nbsp; 와 '아래와 같이 공고합니다' 머리말을 걸러 낸다", () => {
    expect(decodeHtmlEntities("신청&amp;nbsp;마감 &#39;청년&#39; &lt;b&gt;")).toBe("신청 마감 '청년' <b>");
    const parsed = parsedOk(fixture("detail-policy-46753.html"));
    expect(parsed.detail.organization).toBe("대전광역시농업기술센터");
    expect(parsed.detail.dateStart).toBe("2026-03-23");
    expect(parsed.detail.summary).not.toMatch(/&nbsp;|아래와 같이|붙임/);
    expect(parsed.detail.summary).toContain("신청자격");
  });
});

describe("rda-programs — 상세 누락 (틀린 값 대신 미상)", () => {
  it("상세를 못 받으면 목록 값만: 시작일 미상·주관 기관 지역 표기·요약 빈 문자열", () => {
    const merged = applyRdaDetail(bySid(programs(), "47040"), null, TODAY);
    expect(merged.organization).toBe("경북 봉화");
    expect(merged.dateStart).toBe(UNKNOWN_DATE);
    expect(merged.dateEnd).toBe("2026-10-06"); // 아는 마감일은 버리지 않는다
    expect(merged.status).toBe("모집중"); // 시작 미상 → 마감일만 본다
    expect(merged.summary).toBe("");
    expect(merged.detailMissing).toBe(true);
  });

  it("삭제된 게시글(HTTP 200 + 정상 제목)을 가려낸다", () => {
    expect(parseRdaDetailHtml(fixture("detail-deleted.html")).kind).toBe("deleted");
    const merged = applyRdaDetail(
      bySid(programs(), "46824"),
      parseRdaDetailHtml(fixture("detail-deleted.html")),
      TODAY,
    );
    expect(merged.detailMissing).toBe(true);
    expect(merged.organization).toBe("전북 남원");
  });

  it("상세의 신청기간 칸이 비면 시작일은 미상, 마감일은 목록 값", () => {
    const html = fixture("detail-policy-47040.html").replaceAll(
      "<td>2026-09-21 ~ 2026-10-06</td>",
      "<td></td>",
    );
    const merged = applyRdaDetail(bySid(programs(), "47040"), parseRdaDetailHtml(html), TODAY);
    expect(merged.organization).toBe("봉화군농업기술센터");
    expect(merged.dateStart).toBe(UNKNOWN_DATE);
    expect(merged.dateEnd).toBe("2026-10-06");
  });

  it("마감일을 어디서도 모르면 9999 페어 + 모집예정 (시작만 확정 금지)", () => {
    const html = fixture("detail-policy-47040.html").replaceAll(
      "<td>2026-09-21 ~ 2026-10-06</td>",
      "<td>2026-09-21 ~ </td>",
    );
    const listingOnly = { ...bySid(programs(), "47040"), dateEnd: UNKNOWN_DATE };
    const merged = applyRdaDetail(listingOnly, parseRdaDetailHtml(html), TODAY);
    expect(merged.dateStart).toBe(UNKNOWN_DATE);
    expect(merged.dateEnd).toBe(UNKNOWN_DATE);
    expect(merged.status).toBe("모집예정");
  });

  it("상세의 주관기관 칸이 비면 목록 지역 표기로 — '농촌진흥청'으로 채우지 않는다", () => {
    const html = fixture("detail-policy-47040.html").replaceAll(
      "<td>봉화군농업기술센터</td>",
      "<td></td>",
    );
    const merged = applyRdaDetail(bySid(programs(), "47040"), parseRdaDetailHtml(html), TODAY);
    expect(merged.organization).toBe("경북 봉화");
    expect(merged.dateStart).toBe("2026-09-21");
  });
});

describe("rda-education — 상세 보강 (정상)", () => {
  it("남해 라이브커머스: 접수 기간과 교육 기간을 따로 읽는다", () => {
    const merged = applyRdaDetail(
      bySid(education(), "47028"),
      parseRdaDetailHtml(fixture("detail-edu-47028.html")),
      TODAY,
    );
    expect(merged.organization).toBe("남해군농업기술센터");
    expect(merged.dateStart).toBe("2026-09-16");
    expect(merged.dateEnd).toBe("2026-10-16");
    expect(merged.operationStart).toBe("2026-10-27");
    expect(merged.operationEnd).toBe("2026-10-29");
    expect(merged.summary).toBe(
      "교육내용 : 라이브커머스 이해 및 N밴드 실습 등 · 교육대상 : 도내 희망농업인 30명",
    );
  });

  it("괴산 전기용접: 값이 다음 줄들에 있는 '주요내용'을 잇고, 메일 문장은 요약에 넣지 않는다", () => {
    const parsed = parsedOk(fixture("detail-edu-47036.html"));
    expect(parsed.detail.organization).toBe("괴산군농업기술센터");
    expect(parsed.detail.summary).toBe(
      "주요내용 : 전기용접기초 이론교육(외부강사), 용접 작업시 준수사항 및 안전조치 방법, 전기용접 편철 및 각관 접합실습",
    );
    expect(parsed.detail.summary).not.toContain("@");
  });

  it("청주 근골격계: 공공누리 변경금지 요약은 발췌하지 않고, 제목은 목록 값 그대로 (slug 원천)", () => {
    const listed: CrawledItem = {
      ...bySid(education(), "47028"),
      title: "(접수기간 9. 28. ~ 9. 30.)2026년 여성농업인 근골격계질환 예방 지원교육 참여자 모집",
      url: "https://www.rda.go.kr/young/custom/edu/view.do?sId=47042",
      dateEnd: "2026-09-30",
    };
    const parsed = parsedOk(fixture("detail-edu-47042.html"));
    expect(parsed.detail.licenseRestricted).toBe(true);
    // 10/4 마감 142건 전수 대조: 목록 제목 = 상세 h4. 상세 제목으로 바꾸지 않는다
    expect(parsed.detail.title).toBe(listed.title);
    const merged = applyRdaDetail(listed, parsed, TODAY);
    expect(merged.title).toBe(listed.title);
    expect(merged.summary).toBe("");
    expect(merged.organization).toBe("청주시농업기술센터");
    expect(merged.status).toBe("마감"); // 9/30 마감 → 10/3 기준
  });

  it("연락처(담당자 이름·번호)·첨부파일·게시 시각 줄은 요약에 넣지 않는다 (10/4 마감 142건 실측 유형)", () => {
    const html = [
      "<p>홍길동(041-000-0000)으로 언제든 연락주세요.</p>",
      "<p>전화접수 : 교육운영팀 000-0000~3</p>",
      "<p>제2회여성농업인농기계챌린지기본계획(안)_모집.hwp (246 kb)</p>",
      "<p>모집 계획서.pdf(65.0 kb) /* */바로보기</p>",
      "<p>교육생 명단(괴산군) 1부.</p>",
      "<p>2026년 06월 18일 11시 02분</p>",
    ].join("");
    expect(extractRdaSummary(html, "청년 경진대회").summary).toBe("");
    const withContent = `${html}<p>지원대상 : 관내 청년농업인</p>`;
    expect(extractRdaSummary(withContent, "청년 경진대회").summary).toBe("지원대상 : 관내 청년농업인");
  });

  it("'개요'로 끝나는 소제목은 문장이 아니고, 머리말·소제목만 있으면 빈 요약", () => {
    const html =
      "<p>전북 청년수당 추가 모집 개요</p><p>지원대상: 18~39세 전북거주, 재직 및 구직청년</p>";
    expect(extractRdaSummary(html, "전북청년수당 추가 모집 안내").summary).toBe(
      "지원대상: 18~39세 전북거주, 재직 및 구직청년",
    );
    const prefaceOnly =
      "<p>2026년 사업대상자를 다음과 같이 모집하오니 기간 내 신청하여 주시기 바랍니다.</p><p>추진개요</p>";
    expect(extractRdaSummary(prefaceOnly, "사업대상자 모집").summary).toBe("");
  });

  it("'지원자격 및 요건'·'대 상' 같은 변형 라벨도 대상 줄로 알아보고, '다음 각 호' 값은 건너뛴다", () => {
    const html = [
      "<p>벤치마팅 대상자 모집 공고</p>",
      "<p>신청자격 : 다음 각 호의 요건을 모두 충족하는 자</p>",
      "<p>지원자격 및 요건 : 만18세 이상 만40세 미만 농업인</p>",
    ].join("");
    expect(extractRdaSummary(html, "벤치마킹 대상자 모집 공고").summary).toBe(
      "지원자격 및 요건 : 만18세 이상 만40세 미만 농업인",
    );
    expect(extractRdaSummary("<p>대 상 : 관내 농업인</p>", "교육").summary).toBe("대 상 : 관내 농업인");
  });

  it("본문의 '용도 변경 금지' 같은 조건 문구는 공공누리 제한으로 오인하지 않는다", () => {
    const { summary, licenseRestricted } = extractRdaSummary(
      "<p>지원내용 : 농지 매입 자금 지원</p><p>※ 지원 농지는 5년간 용도 변경 금지</p>",
      "농지 매입 지원",
    );
    expect(licenseRestricted).toBe(false);
    expect(summary).toBe("지원내용 : 농지 매입 자금 지원");
  });
});

describe("rda-education — 상세 누락", () => {
  it("상세 표가 없는 응답은 해석 불가로 보고 목록 값만 남긴다", () => {
    const parsed = parseRdaDetailHtml("<html><body><main>점검 중입니다</main></body></html>");
    expect(parsed.kind).toBe("unparsable");
    const merged = applyRdaDetail(bySid(education(), "47036"), parsed, TODAY);
    expect(merged.organization).toBe("충북 괴산");
    expect(merged.dateStart).toBe(UNKNOWN_DATE);
    expect(merged.dateEnd).toBe("2026-10-19");
    expect(merged.operationStart).toBeUndefined(); // 교육 일정을 접수 기간으로 지어내지 않는다
    expect(merged.detailMissing).toBe(true);
  });
});

describe("rda-events — 행사 판별과 날짜 요구", () => {
  it("10/3 진행중 목록에는 행사 제목이 없다 (정상 0건)", () => {
    expect(filterRdaEventItems(parseRdaListingHtml(fixture("listing-all-p1.html")))).toEqual([]);
  });

  it("행사 키워드 제목은 유형을 붙여 남기고 같은 제목은 한 번만", () => {
    const base = bySid(education(), "47028");
    const events = filterRdaEventItems([
      { ...base, title: "2026 귀농 정책 설명회 참가자 모집" },
      { ...base, title: "2026 귀농 정책 설명회 참가자 모집", url: `${base.url}0` },
      { ...base, title: "2026년 라이브커머스 교육" },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("설명회");
  });

  it("행사는 운영 날짜(교육기간)가 있을 때만 적재 — 없거나 상세 실패면 뺀다", async () => {
    const base = bySid(education(), "47028");
    const items: CrawledItem[] = [
      { ...base, title: "귀농 설명회 A", url: "https://example.test/with-date" },
      { ...base, title: "귀농 설명회 B", url: "https://example.test/no-date" },
      { ...base, title: "귀농 설명회 C", url: "https://example.test/fail" },
    ];
    const pages: Record<string, RdaDetailFetch> = {
      "https://example.test/with-date": { parsed: parseRdaDetailHtml(fixture("detail-edu-47028.html")), linkStatus: "active" },
      "https://example.test/no-date": { parsed: parseRdaDetailHtml(fixture("detail-policy-47040.html")), linkStatus: "active" },
      "https://example.test/fail": { parsed: null, linkStatus: "unverified" },
    };
    const result = await enrichRdaItems(items, {
      today: TODAY,
      requireOperationDate: true,
      fetchDetail: async (url) => pages[url],
    });
    expect(result.items[0]?.operationStart).toBe("2026-10-27");
    expect(result.items[1]).toBeNull();
    expect(result.items[2]).toBeNull();
    expect(result.dropped).toBe(2);
  });
});

describe("enrichRdaItems — 요청 예산 (Edge Function 150초 보호)", () => {
  const listing = () => programs().slice(0, 3);
  const okPage: RdaDetailFetch = {
    parsed: parseRdaDetailHtml(fixture("detail-policy-47040.html")),
    linkStatus: "active",
  };

  it("건수 예산 밖 항목은 요청하지 않고 목록 값(미상)으로 둔다", async () => {
    const fetchDetail = vi.fn(async () => okPage);
    const result = await enrichRdaItems(listing(), { today: TODAY, maxFetches: 1, fetchDetail, concurrency: 1 });
    expect(fetchDetail).toHaveBeenCalledTimes(1);
    expect(result.fetched).toBe(1);
    expect(result.deferred).toBe(2);
    expect(result.items[0]?.detailMissing).toBe(false);
    expect(result.items[1]?.detailMissing).toBe(true);
    expect(result.items[1]?.dateStart).toBe(UNKNOWN_DATE);
    expect(result.linkStatus.get(listing()[1].url)).toBe("unverified"); // 헬스체크로 다시 받지 않게
  });

  it("시간 예산을 넘기면 남은 항목은 미룬다", async () => {
    let clock = 0;
    const fetchDetail = vi.fn(async () => {
      clock += 40_000;
      return okPage;
    });
    const result = await enrichRdaItems(listing(), {
      today: TODAY,
      timeBudgetMs: 70_000,
      concurrency: 1,
      fetchDetail,
      now: () => clock,
    });
    expect(result.fetched).toBe(2);
    expect(result.deferred).toBe(1);
  });

  it("상세 실패는 세지만 항목은 목록 값으로 남긴다 (행사가 아니면 빼지 않는다)", async () => {
    const result = await enrichRdaItems(listing(), {
      today: TODAY,
      fetchDetail: async () => ({ parsed: null, linkStatus: "broken" }),
    });
    expect(result.failed).toBe(3);
    expect(result.items.every((item) => item?.detailMissing === true)).toBe(true);
    expect(result.items.every((item) => item?.organization !== "농촌진흥청")).toBe(true);
  });
});

describe("fetchRdaDetail — 상세 응답 = 원문 링크 확인", () => {
  const stubFetch = (impl: () => Promise<Response>) => vi.stubGlobal("fetch", vi.fn(impl));

  it("정상 페이지는 active + 해석 결과", async () => {
    stubFetch(async () => new Response(fixture("detail-edu-47028.html"), { status: 200 }));
    const result = await fetchRdaDetail("https://www.rda.go.kr/young/custom/edu/view.do?sId=47028");
    expect(result.linkStatus).toBe("active");
    expect(result.parsed?.kind).toBe("ok");
  });

  it("삭제된 게시글은 HTTP 200 이어도 broken", async () => {
    stubFetch(async () => new Response(fixture("detail-deleted.html"), { status: 200 }));
    const result = await fetchRdaDetail("https://www.rda.go.kr/young/custom/edu/view.do?sId=99999999");
    expect(result.linkStatus).toBe("broken");
    expect(result.parsed?.kind).toBe("deleted");
  });

  it("HTTP 오류는 broken, 네트워크 오류·타임아웃은 unverified", async () => {
    stubFetch(async () => new Response("", { status: 404 }));
    expect((await fetchRdaDetail("https://x.test/a")).linkStatus).toBe("broken");
    stubFetch(async () => {
      throw new Error("timeout");
    });
    const failed = await fetchRdaDetail("https://x.test/b");
    expect(failed.linkStatus).toBe("unverified");
    expect(failed.parsed).toBeNull();
  });
});

describe("날짜·상태 규칙", () => {
  it("신청기간 문자열을 읽는다 (없는 날짜는 버린다)", () => {
    expect(parseDateRange("2026-09-21 ~ 2026-10-06")).toEqual({ start: "2026-09-21", end: "2026-10-06" });
    expect(parseDateRange("~ 2026-09-30")).toEqual({ start: undefined, end: "2026-09-30" });
    expect(parseDateRange("2026.9.21 ~")).toEqual({ start: "2026-09-21", end: undefined });
    expect(parseDateRange("2026-10-06")).toEqual({ end: "2026-10-06" }); // 날짜 하나 = 마감일
    expect(parseDateRange("2026-02-30 ~ 2026-03-10")).toEqual({ start: undefined, end: "2026-03-10" });
    expect(parseDateRange("")).toEqual({});
  });

  it("마감일이 없으면 시작일만 확정하지 않는다 (가드 #3)", () => {
    expect(resolveRdaWindow("2026-09-21", "2026-10-06", undefined)).toEqual({ start: "2026-09-21", end: "2026-10-06" });
    expect(resolveRdaWindow(undefined, undefined, "2026-10-06")).toEqual({ start: UNKNOWN_DATE, end: "2026-10-06" });
    expect(resolveRdaWindow("2026-09-21", undefined, undefined)).toEqual({ start: UNKNOWN_DATE, end: UNKNOWN_DATE });
    expect(resolveRdaWindow("2026-11-01", "2026-10-06", undefined)).toEqual({ start: UNKNOWN_DATE, end: "2026-10-06" });
  });

  it("상태는 확정된 접수 기간과 KST 오늘로 매긴다", () => {
    expect(windowStatus("2026-09-21", "2026-10-06", TODAY)).toBe("모집중");
    expect(windowStatus("2026-10-05", "2026-10-30", TODAY)).toBe("모집예정");
    expect(windowStatus("2026-09-01", "2026-10-02", TODAY)).toBe("마감");
    expect(windowStatus(UNKNOWN_DATE, "2026-10-06", TODAY)).toBe("모집중");
    expect(windowStatus(UNKNOWN_DATE, UNKNOWN_DATE, TODAY)).toBe("모집예정");
    // UTC 자정~오전 9시에도 한국 날짜
    expect(kstToday(Date.UTC(2026, 9, 2, 16, 30))).toBe("2026-10-03");
  });
});
