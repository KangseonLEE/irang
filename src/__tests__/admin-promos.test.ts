import { describe, expect, it } from "vitest";
import {
  PROMO_STATUS_LABELS,
  kstDate,
  promoPeriodLabel,
  promoStatus,
  toPromoPayload,
  validatePromo,
  type PromoFormValues,
} from "@/app/admin/promos/promo-rules";

/**
 * 홍보 팝업 운영 규칙 (2026-09-29) — 노출 상태 판정과 폼 검증.
 * 날짜는 전부 KST 문자열 비교라 UTC 로 밀리지 않아야 한다.
 */

const base = { active: true, startsAt: "2026-10-01", until: "2026-11-15" };

describe("promoStatus", () => {
  it("기간 안이면 노출 중", () => {
    expect(promoStatus(base, "2026-10-01")).toBe("live");
    expect(promoStatus(base, "2026-11-15")).toBe("live");
  });

  it("시작 전이면 예정, 종료 다음 날부터 종료", () => {
    expect(promoStatus(base, "2026-09-30")).toBe("scheduled");
    expect(promoStatus(base, "2026-11-16")).toBe("ended");
  });

  it("비활성은 기간과 무관하게 비활성", () => {
    expect(promoStatus({ ...base, active: false }, "2026-10-15")).toBe("inactive");
    expect(promoStatus({ ...base, active: false }, "2026-09-01")).toBe("inactive");
  });

  it("시작일이 비면 이미 시작한 것으로 본다", () => {
    expect(promoStatus({ ...base, startsAt: null }, "2026-01-01")).toBe("live");
    expect(promoPeriodLabel({ startsAt: null, until: "2026-11-15" })).toBe("즉시 ~ 2026-11-15");
  });

  it("kstDate 는 한국 밤 시간에도 그 날짜를 준다", () => {
    // 2026-11-15 23:30 KST = 2026-11-15T14:30Z
    expect(kstDate(new Date("2026-11-15T14:30:00Z"))).toBe("2026-11-15");
    // 2026-11-16 00:30 KST — UTC 로는 아직 15일
    expect(kstDate(new Date("2026-11-15T15:30:00Z"))).toBe("2026-11-16");
  });

  it("상태 라벨은 카피 톤(~합니다 금지)을 지킨다", () => {
    for (const label of Object.values(PROMO_STATUS_LABELS)) {
      expect(label).not.toMatch(/합니다|입니다/);
    }
  });
});

const valid: PromoFormValues = {
  id: "gafi-masil-2026",
  org: "경기도 귀농귀촌지원센터",
  title: "재능으로 잇는 마실짝꿍",
  tagline: "도시민의 재능 × 주민의 삶",
  image: "/promo/gafi-masil-2026.webp",
  imageWidth: 600,
  imageHeight: 851,
  alt: "포스터",
  facts: [{ label: "문의", value: "1800-8114", href: "tel:18008114" }],
  recruitClosed: false,
  note: "",
  href: "https://www.refarmgg.or.kr/",
  startsAt: "2026-10-01",
  until: "2026-11-15",
  active: true,
  sortOrder: 0,
};

describe("validatePromo", () => {
  it("제대로 채우면 오류가 없다", () => {
    expect(validatePromo(valid, true)).toEqual({});
  });

  it("필수값이 비면 각각 안내가 붙는다", () => {
    const e = validatePromo({ ...valid, org: "", title: "", image: "", alt: "", until: "" }, true);
    expect(Object.keys(e).sort()).toEqual(["alt", "image", "org", "title", "until"]);
  });

  it("종료가 시작보다 빠르면 막는다", () => {
    const e = validatePromo({ ...valid, startsAt: "2026-11-20", until: "2026-11-15" }, true);
    expect(e.until).toContain("빨라요");
  });

  it("id 는 신규일 때만 슬러그 규칙을 검사한다", () => {
    expect(validatePromo({ ...valid, id: "대문자 안돼요" }, true).id).toBeTruthy();
    expect(validatePromo({ ...valid, id: "legacy id" }, false).id).toBeUndefined();
  });

  it("https 아닌 상세 링크·마감인데 빈 안내는 막는다", () => {
    expect(validatePromo({ ...valid, href: "http://x.kr" }, true).href).toBeTruthy();
    expect(validatePromo({ ...valid, recruitClosed: true, note: "  " }, true).note).toBeTruthy();
  });

  it("정보 행은 라벨·내용이 짝이어야 한다", () => {
    expect(validatePromo({ ...valid, facts: [{ label: "문의", value: "" }] }, true).facts).toBeTruthy();
    expect(validatePromo({ ...valid, facts: [{ label: "", value: "" }] }, true).facts).toBeUndefined();
  });
});

describe("toPromoPayload", () => {
  it("빈 행·공백을 걷어내고 빈 시작일은 null 로 보낸다", () => {
    const payload = toPromoPayload({
      ...valid,
      startsAt: "",
      title: "  제목  ",
      facts: [
        { label: " 문의 ", value: " 1800-8114 ", href: " tel:18008114 " },
        { label: "", value: "" },
      ],
    });
    expect(payload.startsAt).toBeNull();
    expect(payload.title).toBe("제목");
    expect(payload.facts).toEqual([{ label: "문의", value: "1800-8114", href: "tel:18008114" }]);
  });

  it("href 가 비면 키 자체를 넣지 않는다", () => {
    const payload = toPromoPayload({ ...valid, facts: [{ label: "주최", value: "경기도", href: "" }] });
    expect(payload.facts[0]).not.toHaveProperty("href");
  });
});

describe("parsePromoApiError", () => {
  it("검증 실패는 필드에 붙고, facts[0] 같은 인덱스도 facts 로 모인다", async () => {
    const { parsePromoApiError } = await import("@/app/admin/promos/promo-rules");
    const parsed = parsePromoApiError(400, {
      error: "validation",
      errors: [
        { field: "href", message: "https:// 여야 해요" },
        { field: "facts[0].href", message: "tel: 이어야 해요" },
      ],
    });
    expect(parsed.setup).toBe(false);
    expect(parsed.fieldErrors.href).toContain("https");
    expect(parsed.fieldErrors.facts).toContain("tel");
  });

  it("503 마이그레이션 미적용은 '설정' 문제로 구분한다", async () => {
    const { parsePromoApiError } = await import("@/app/admin/promos/promo-rules");
    const parsed = parsePromoApiError(503, {
      error: "migration-pending",
      message: "promo_popups 마이그레이션이 아직 적용되지 않았어요.",
    });
    expect(parsed.setup).toBe(true);
    expect(parsed.message).toContain("마이그레이션");
    expect(parsed.fieldErrors).toEqual({});
  });

  it("중복 id(409)는 id 칸에 안내가 붙는다", async () => {
    const { parsePromoApiError } = await import("@/app/admin/promos/promo-rules");
    const parsed = parsePromoApiError(409, {
      error: "duplicate",
      errors: [{ field: "id", message: "이미 같은 id 의 팝업이 있어요" }],
    });
    expect(parsed.fieldErrors.id).toContain("이미");
    expect(parsed.setup).toBe(false);
  });
});
