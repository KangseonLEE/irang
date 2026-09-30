import { describe, expect, it } from "vitest";
import {
  CENTERS,
  centerFallbackNotice,
  getSigunguCenter,
} from "@/lib/data/centers";

/**
 * 센터 이름은 사용자 화면(검색 엔티티 패널·지역 상세·검색 센터 카드)에 그대로 노출된다.
 * 내부 용어("폴백")가 이름에 섞이면 그대로 보이므로, 구조는 fallbackOf/fallbackReason 필드로만 표현한다.
 */
describe("centers — 광역 기관 안내 항목", () => {
  it("사용자 노출 필드에 내부 용어가 없다", () => {
    const leaked = CENTERS.filter((c) =>
      [c.name, c.sido, c.sigungu ?? "", c.address ?? ""].some((v) =>
        /폴백|fallback/i.test(v),
      ),
    );
    expect(leaked.map((c) => c.id)).toEqual([]);
  });

  it("광역 기관 안내 항목은 6건이고 전부 시·군·구 항목이다", () => {
    const fallbacks = CENTERS.filter((c) => c.fallbackOf);
    expect(fallbacks).toHaveLength(6);
    expect(fallbacks.map((c) => c.id).sort()).toEqual([
      "daegu-suseong-sigungu",
      "daejeon-dong-gu-daejeon-sigungu",
      "daejeon-seo-gu-daejeon-sigungu",
      "gangwon-hoengseong-sigungu",
      "gwangju-dong-gu-gwangju-sigungu",
      "ulsan-nam-gu-ulsan-sigungu",
    ]);
    for (const c of fallbacks) {
      expect(c.category).toBe("sigungu");
      expect(c.sigungu).toBeTruthy();
      // 사유 없는 fallbackOf 금지 — 안내 문구가 근거 없이 나가지 않게
      expect(c.fallbackReason).toBeDefined();
    }
  });

  it("fallbackReason 은 fallbackOf 가 있을 때만 쓴다", () => {
    const orphan = CENTERS.filter((c) => c.fallbackReason && !c.fallbackOf);
    expect(orphan.map((c) => c.id)).toEqual([]);
  });

  it("안내 문구는 광역시는 '시 센터', 도는 '도 센터'로 읽힌다", () => {
    const suseong = getSigunguCenter("suseong");
    expect(suseong?.name).toBe("대구광역시 농업기술센터");
    expect(centerFallbackNotice(suseong!)).toBe(
      "수성구 자체 센터가 없어 시 센터로 안내해요",
    );

    const hoengseong = getSigunguCenter("hoengseong");
    expect(hoengseong?.name).toBe("강원특별자치도청 귀농귀촌 안내");
    expect(centerFallbackNotice(hoengseong!)).toBe(
      "횡성군 전용 센터를 확인하지 못해 도 센터로 안내해요",
    );
  });

  it("일반 센터는 안내 문구가 없다", () => {
    const chuncheon = getSigunguCenter("chuncheon");
    expect(chuncheon).toBeDefined();
    expect(chuncheon?.fallbackOf).toBeUndefined();
    expect(centerFallbackNotice(chuncheon!)).toBeUndefined();
  });

  it("안내 문구는 모두 '해요'로 끝난다 (카피 톤)", () => {
    for (const c of CENTERS.filter((x) => x.fallbackOf)) {
      expect(centerFallbackNotice(c)).toMatch(/해요$/);
    }
  });

  it("시·도 참조 필드는 PROVINCES SSOT 구표기를 쓴다 (기관명만 신표기 예외)", () => {
    const hoengseong = getSigunguCenter("hoengseong")!;
    expect(hoengseong.sido).toBe("강원");
    expect(hoengseong.sidoSlug).toBe("gangwon");
    // sido/sigungu 어디에도 신표기가 새지 않음
    const newNaming = CENTERS.filter((c) =>
      /특별자치도/.test(`${c.sido}${c.sigungu ?? ""}`),
    );
    expect(newNaming.map((c) => c.id)).toEqual([]);
  });
});
