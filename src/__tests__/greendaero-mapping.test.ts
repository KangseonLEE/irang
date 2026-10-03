import { describe, it, expect } from "vitest";

import {
  toIsoDate,
  statusFromWindow,
  isExperienceProgram,
  resolveEventType,
  resolveEducationType,
  buildEduTitle,
  dedupKey,
  mapEduItem,
  mapLiveItem,
  SOURCE_NOTE,
} from "../../supabase/functions/_shared/greendaero";
import { normalizeRegion, isSsotRegion } from "@/lib/region-normalize";

const TODAY = "2026-09-29";

/** 2026-09-29 라이브 응답에서 그대로 떠온 샘플 */
const EDU_LECTURE = {
  ednstNm: "농협창업농지원센터",
  eduCrseId: "EDUCRSE_000000006060",
  eduDetailCrseId: "EDUDCRSE_00000013314",
  eduDetailCrseNm: "2026년 농업일자리 탐색교육(4h) (대면)",
  atpnCn: "(대면) 땅끝농협 농업일자리 탐색교육 1기 13:00 ~17:00",
  eduspntdBaddr: "전남광주통합특별시 해남군 송지면 산정1길 80",
  eduRcrtBgngDt: "2026-09-01",
  eduRcrtEndDt: "2026-09-29",
  eduBgngYmd: "20260930",
  eduEndYmd: "20260930",
  eduOperSeNm: "오프라인(대면교육)",
  eduSeNm: "농업일자리탐색(4h)",
  eduTypeNm: "농업일자리탐색",
  planNope: "30",
};

const EDU_EXPERIENCE = {
  ednstNm: "경기도귀농귀촌지원센터",
  eduCrseId: "EDUCRSE_000000007620",
  eduDetailCrseId: "EDUDCRSE_00000013165",
  eduDetailCrseNm: "경기 귀농귀촌디딤돌",
  atpnCn: "귀농귀촌디딤돌 _ 재능으로잇는 마실짝꿍(연천)",
  eduspntdBaddr: "경기 연천군 군남면 군남로 833",
  eduRcrtBgngDt: "2026-08-24",
  eduRcrtEndDt: "2026-10-09",
  eduBgngYmd: "20261017",
  eduEndYmd: "20261115",
  eduOperSeNm: "오프라인(대면교육),현장실습교육",
  eduSeNm: "지자체 귀농귀촌교육",
  eduTypeNm: "지자체 교육 ",
  planNope: "15",
};

const EDU_ONLINE = {
  ednstNm: "팜러닝",
  eduCrseId: "EDUCRSE_000000006762",
  eduDetailCrseId: "EDUDCRSE_00000013018",
  eduDetailCrseNm: "유형특화과정-청년귀촌인",
  atpnCn: "[비대면] 9/30 (야간반19시~21시) 농촌 창업 아이템 발굴 실전",
  eduspntdBaddr: "서울 서초구 강남대로 27",
  eduRcrtBgngDt: "2026-08-06",
  eduRcrtEndDt: "2026-09-29",
  eduBgngYmd: "20260930",
  eduEndYmd: "20260930",
  eduOperSeNm: "비대면교육",
  eduSeNm: "귀농귀촌아카데미",
  eduTypeNm: "귀촌특화",
  planNope: "100",
};

const LIVE_VILLAGE = {
  vlg_oper_mngno: "RRO_110852",
  vlg_mngno: "RRT_0000000193",
  vlg_nm: "칠갑산산꽃마을",
  sgg_nm: "충청남도 청양군",
  vlg_type_cd: "TOTY02",
  vlg_type_dtl_cd: "TODT03",
  vlg_state: 2,
  aply_bgng_ymd: "20260825",
  aply_end_ymd: "20260929",
  oper_bgng_ymd: "20261001",
  oper_end_ymd: "20261114",
  rcrt_nope: "6",
};

describe("greendaero — 날짜·상태 유틸", () => {
  it("YYYYMMDD와 ISO를 모두 ISO로 맞춘다", () => {
    expect(toIsoDate("20260930")).toBe("2026-09-30");
    expect(toIsoDate("2026-09-30")).toBe("2026-09-30");
    expect(toIsoDate("")).toBeUndefined();
    expect(toIsoDate(null)).toBeUndefined();
    expect(toIsoDate("2026")).toBeUndefined();
  });

  it("접수 기간으로 상태를 가른다", () => {
    expect(statusFromWindow("2026-09-01", "2026-09-29", TODAY)).toBe("모집중");
    expect(statusFromWindow("2026-10-01", "2026-10-30", TODAY)).toBe("모집예정");
    expect(statusFromWindow("2026-08-01", "2026-09-28", TODAY)).toBe("마감");
  });

  it("접수 기간을 모르면 모집중으로 단정하지 않는다", () => {
    // null을 0/현재로 뭉개면 마감된 공고가 '모집중'으로 노출된다 (CASE-07 계열)
    expect(statusFromWindow(undefined, undefined, TODAY)).toBe("모집예정");
  });
});

describe("greendaero — 강의형 / 체험형 분류", () => {
  it("숙박·현장 체류형만 체험으로 본다", () => {
    expect(isExperienceProgram("경기 귀농귀촌디딤돌", "마실짝꿍")).toBe(true);
    expect(isExperienceProgram("2026 춘천시 귀농귀촌 팸투어_시설원예")).toBe(true);
    expect(isExperienceProgram("경기도 농촌 한 달 체험(하반기)")).toBe(true);
    expect(isExperienceProgram("2026년 귀농귀촌체험학교")).toBe(true);
  });

  it("'체험교육'처럼 실습 붙은 강의형은 체험으로 새지 않는다", () => {
    // 2026-09-29 실측: 맨 "체험" 키워드 하나로 25건이 farm_events로 잘못 갔다
    expect(
      isExperienceProgram("[지역특화(트렌드)]농업일자리 체험교육(이론 : 비대면)(실습 : 대면)"),
    ).toBe(false);
    expect(isExperienceProgram("2026년 농업일자리 탐색교육(4h) (대면)")).toBe(false);
    expect(isExperienceProgram("제11기 내일을 여는 발효학교")).toBe(false);
  });

  it("체험 유형을 farm_events 어휘로 매핑한다", () => {
    expect(resolveEventType("경기 귀농귀촌디딤돌 마실짝꿍")).toBe("살아보기");
    expect(resolveEventType("칠갑산산꽃마을 농촌에서 살아보기")).toBe("살아보기");
    expect(resolveEventType("경기도 농촌 한 달 체험")).toBe("살아보기");
    expect(resolveEventType("2026 춘천시 귀농귀촌 팸투어")).toBe("일일체험");
    expect(resolveEventType("귀농 설명회")).toBe("설명회");
    expect(resolveEventType("귀농귀촌 박람회")).toBe("박람회");
  });
});

describe("greendaero — 교육 운영 형태", () => {
  it("'비대면교육'이 '대면교육'을 포함하는 함정에 걸리지 않는다", () => {
    expect(resolveEducationType("비대면교육")).toBe("온라인");
    expect(resolveEducationType("오프라인(대면교육)")).toBe("오프라인");
    expect(resolveEducationType("오프라인(대면교육),현장실습교육")).toBe("오프라인");
    expect(resolveEducationType("비대면교육,현장실습교육")).toBe("혼합");
    expect(resolveEducationType("오프라인+비대면")).toBe("혼합");
    expect(resolveEducationType("현장실습교육")).toBe("오프라인");
  });
});

describe("greendaero — 제목 조립", () => {
  it("사업명과 프로그램명을 ' · '로 잇는다", () => {
    expect(buildEduTitle("경기 귀농귀촌디딤돌", "재능으로 잇는 마실짝꿍")).toBe(
      "경기 귀농귀촌디딤돌 · 재능으로 잇는 마실짝꿍",
    );
  });

  it("한쪽이 다른 쪽을 포함하면 더 구체적인 쪽만 남긴다", () => {
    expect(
      buildEduTitle("2026 춘천시 귀농귀촌 팸투어_시설원예", "2026 춘천시 귀농귀촌팸투어_시설원예"),
    ).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예");
  });

  it("한쪽이 비면 나머지만 쓴다", () => {
    expect(buildEduTitle("발효학교", null)).toBe("발효학교");
    expect(buildEduTitle(null, "발효학교")).toBe("발효학교");
  });
});

describe("greendaero — 교육 항목 매핑", () => {
  it("강의형은 education_courses로, 지역은 SSOT로 귀결된다", () => {
    const item = mapEduItem(EDU_LECTURE, TODAY)!;
    expect(item.category).toBe("education");
    expect(item.educationType).toBe("오프라인");
    expect(item.eventType).toBeUndefined();
    // "전남광주통합특별시 해남군" → 전라남도 해남군
    const { region, sigungu } = normalizeRegion(item.region);
    expect(region).toBe("전라남도");
    expect(sigungu).toBe("해남군");
    expect(isSsotRegion(region)).toBe(true);
    expect(item.organization).toBe("농협창업농지원센터");
    expect(item.dateStart).toBe("2026-09-01");
    expect(item.dateEnd).toBe("2026-09-29");
    expect(item.operationStart).toBe("2026-09-30");
    expect(item.capacityCount).toBe(30);
    expect(item.status).toBe("모집중");
  });

  it("체험형은 farm_events로 가고 eventType이 붙는다", () => {
    const item = mapEduItem(EDU_EXPERIENCE, TODAY)!;
    expect(item.category).toBe("events");
    expect(item.eventType).toBe("살아보기");
    expect(item.educationType).toBeUndefined();
    expect(item.title).toBe(
      "경기 귀농귀촌디딤돌 · 귀농귀촌디딤돌 _ 재능으로잇는 마실짝꿍(연천)",
    );
    expect(normalizeRegion(item.region).region).toBe("경기도");
  });

  it("접수 마감일 불일치 대비 안내 문구를 항상 붙인다", () => {
    // 그린대로 ~2026-10-09 vs 연천군 원문 ~2026-09-28 (2026-09-29 실측)
    const item = mapEduItem(EDU_EXPERIENCE, TODAY)!;
    expect(item.dateEnd).toBe("2026-10-09");
    expect(item.note).toContain("원문 공고");
    expect(item.note).toBe(SOURCE_NOTE);
  });

  it("순수 비대면 과정은 교육기관 본사 주소 대신 전국으로 둔다", () => {
    const item = mapEduItem(EDU_ONLINE, TODAY)!;
    expect(item.educationType).toBe("온라인");
    expect(item.region).toBe("전국");
  });

  it("slug 원천 키는 eduCrseId가 아니라 eduDetailCrseId다", () => {
    // 같은 eduCrseId가 회차마다 재사용되므로 detail id가 아니면 회차가 서로 덮어쓴다
    const a = mapEduItem({ ...EDU_ONLINE, eduDetailCrseId: "EDUDCRSE_1" }, TODAY)!;
    const b = mapEduItem({ ...EDU_ONLINE, eduDetailCrseId: "EDUDCRSE_2" }, TODAY)!;
    expect(a.sourceKey).toBe("EDUDCRSE_1");
    expect(b.sourceKey).toBe("EDUDCRSE_2");
    expect(a.sourceKey).not.toBe(b.sourceKey);
  });

  it("상세 딥링크는 seq1·seq2 GET 파라미터로 만든다", () => {
    const item = mapEduItem(EDU_LECTURE, TODAY)!;
    expect(item.url).toBe(
      "https://www.greendaero.go.kr/svc/rfph/edc/offline/front/applicationDetail.do?seq1=EDUCRSE_000000006060&seq2=EDUDCRSE_00000013314",
    );
  });

  it("식별자가 없으면 버린다", () => {
    expect(mapEduItem({ ...EDU_LECTURE, eduDetailCrseId: "" }, TODAY)).toBeNull();
    expect(mapEduItem({ ...EDU_LECTURE, eduCrseId: null }, TODAY)).toBeNull();
  });
});

describe("greendaero — 살아보기 매핑", () => {
  it("전건 farm_events 살아보기로 간다", () => {
    const item = mapLiveItem(LIVE_VILLAGE, TODAY)!;
    expect(item.category).toBe("events");
    expect(item.eventType).toBe("살아보기");
    expect(item.title).toBe("칠갑산산꽃마을 농촌에서 살아보기 (귀촌형)");
    expect(normalizeRegion(item.region)).toEqual({
      region: "충청남도",
      sigungu: "청양군",
      matched: true,
    });
    expect(item.dateStart).toBe("2026-08-25");
    expect(item.dateEnd).toBe("2026-09-29");
    expect(item.operationStart).toBe("2026-10-01");
    expect(item.operationEnd).toBe("2026-11-14");
    expect(item.capacityCount).toBe(6);
    expect(item.sourceKey).toBe("RRO_110852");
  });

  it("신표기 시·도도 SSOT로 귀결된다", () => {
    const item = mapLiveItem({ ...LIVE_VILLAGE, sgg_nm: "전남광주통합특별시 장성군" }, TODAY)!;
    expect(normalizeRegion(item.region).region).toBe("전라남도");
    const gw = mapLiveItem({ ...LIVE_VILLAGE, sgg_nm: "강원특별자치도 홍천군" }, TODAY)!;
    expect(normalizeRegion(gw.region).region).toBe("강원도");
  });

  it("상세가 POST 전용이라 목록 URL로 보내고 안내를 덧붙인다", () => {
    const item = mapLiveItem(LIVE_VILLAGE, TODAY)!;
    expect(item.url).toBe(
      "https://www.greendaero.go.kr/svc/rfph/edc/live/front/apply/list.do",
    );
    expect(item.note).toContain("농촌에서 살아보기");
  });
});

describe("greendaero — 중복 가드", () => {
  it("제목+주관+접수기간이 같으면 같은 키다", () => {
    const a = mapEduItem(EDU_LECTURE, TODAY)!;
    const b = mapEduItem({ ...EDU_LECTURE, eduDetailCrseId: "EDUDCRSE_other" }, TODAY)!;
    expect(dedupKey(a)).toBe(dedupKey(b));
  });

  it("회차가 달라 접수 기간이 다르면 별개로 본다", () => {
    const a = mapEduItem(EDU_LECTURE, TODAY)!;
    const b = mapEduItem({ ...EDU_LECTURE, eduRcrtEndDt: "2026-10-05" }, TODAY)!;
    expect(dedupKey(a)).not.toBe(dedupKey(b));
  });

  it("G-1: 한 항목은 교육·행사 중 한 곳에만 간다", () => {
    for (const raw of [EDU_LECTURE, EDU_EXPERIENCE, EDU_ONLINE]) {
      const item = mapEduItem(raw, TODAY)!;
      const isEvent = item.category === "events";
      expect(isEvent ? item.eventType : item.educationType).toBeTruthy();
      expect(isEvent ? item.educationType : item.eventType).toBeUndefined();
    }
  });
});
