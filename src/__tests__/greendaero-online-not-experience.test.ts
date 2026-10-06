/**
 * 그린대로 — 순수 비대면 강의는 체험형(farm_events)으로 새지 않는다 (2026-10-06)
 *
 * 사고: "[비대면] … 농촌융복합 6차산업과 농촌체험관광"(팜러닝, eduOperSeNm "비대면교육")이 강의 주제의
 * '농촌체험'에 걸려 farm_events·'일일체험'으로 적재되고, 체험형이라 온라인 판정을 건너뛰어 지역도
 * 교육기관 본사(서울 서초구)로 들어갔다 → /events 에 '일일체험 · 서울' 카드로 노출.
 * 샘플은 2026-10-06 getEdcList 1페이지 라이브 응답에서 그대로 떠왔다.
 */
import { describe, expect, it } from "vitest";
import { mapEduItem } from "../../supabase/functions/_shared/greendaero";

const TODAY = "2026-10-06";

const ONLINE_TOPIC_TOURISM = {
  ednstNm: "팜러닝",
  eduCrseId: "EDUCRSE_000000006752",
  eduDetailCrseId: "EDUDCRSE_00000013815",
  eduDetailCrseNm: "유형특화과정-예비귀촌인",
  atpnCn: "[비대면] 10/31 (주말반 10시~12시) 농촌융복합 6차산업과 농촌체험관광",
  eduspntdBaddr: "서울 서초구 강남대로 27",
  eduRcrtBgngDt: "2026-09-30",
  eduRcrtEndDt: "2026-10-30",
  eduBgngYmd: "20261031",
  eduEndYmd: "20261031",
  eduOperSeNm: "비대면교육",
  eduSeNm: "귀농귀촌아카데미",
  eduTypeNm: "귀촌특화",
  planNope: "40",
};

const OFFLINE_FAMTOUR = {
  ednstNm: "춘천시농업기술센터",
  eduCrseId: "EDUCRSE_000000007999",
  eduDetailCrseId: "EDUDCRSE_00000099999",
  eduDetailCrseNm: "2026 춘천시 귀농귀촌 팸투어_시설원예",
  atpnCn: "2026 춘천시 귀농귀촌팸투어_시설원예",
  eduspntdBaddr: "강원 춘천시 신북읍",
  eduRcrtBgngDt: "2026-09-20",
  eduRcrtEndDt: "2026-10-12",
  eduBgngYmd: "20261015",
  eduEndYmd: "20261015",
  eduOperSeNm: "오프라인(대면교육)",
  eduSeNm: "지자체 귀농귀촌교육",
  eduTypeNm: "지자체 교육 ",
  planNope: "20",
};

describe("greendaero mapEduItem — 순수 비대면 과정은 체험형이 아니다", () => {
  it("'농촌체험관광' 주제의 비대면 강의는 교육(온라인·전국)으로 분류된다", () => {
    const item = mapEduItem(ONLINE_TOPIC_TOURISM, TODAY);
    expect(item?.category).toBe("education");
    expect(item?.eventType).toBeUndefined();
    expect(item?.educationType).toBe("온라인");
    expect(item?.region).toBe("전국");
  });

  it("'농촌체험농장 만들기' 같은 비대면 주제도 교육으로", () => {
    const item = mapEduItem(
      { ...ONLINE_TOPIC_TOURISM, eduDetailCrseId: "EDUDCRSE_00000012345", atpnCn: "[비대면] 1차 농산물을 활용한 농촌체험농장 만들기" },
      TODAY,
    );
    expect(item?.category).toBe("education");
  });

  it("오프라인 팸투어는 그대로 체험형(일일체험)", () => {
    const item = mapEduItem(OFFLINE_FAMTOUR, TODAY);
    expect(item?.category).toBe("events");
    expect(item?.eventType).toBe("일일체험");
  });

  it("비대면+현장실습(혼합) 체험학교는 체험형으로 남는다 — 순수 온라인만 제외", () => {
    const item = mapEduItem(
      { ...OFFLINE_FAMTOUR, eduDetailCrseId: "EDUDCRSE_00000088888", eduDetailCrseNm: "귀농귀촌 체험학교", atpnCn: "체험학교 1기", eduOperSeNm: "비대면교육,현장실습교육" },
      TODAY,
    );
    expect(item?.category).toBe("events");
  });
});

describe("greendaero mapEduItem — 교육 구분(eduSeNm)을 대상 칸에 넣지 않는다", () => {
  it("capacity(→ DB target '교육 대상')가 비어 있다 — 목록 응답엔 대상 필드가 없다", () => {
    expect(mapEduItem(ONLINE_TOPIC_TOURISM, TODAY)?.capacity).toBeUndefined();
    expect(mapEduItem(OFFLINE_FAMTOUR, TODAY)?.capacity).toBeUndefined();
  });
});
