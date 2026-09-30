import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getEventImage, regionFallbackImage } from "@/lib/events/event-image";
import { PROVINCES } from "@/lib/data/regions";

describe("event image resolver", () => {
  it("그린대로 마을 사진이 있으면 사진 + 출처", () => {
    const img = getEventImage({ imageUrl: "https://www.greendaero.go.kr/svc/common/board/img/att-abc.do", region: "전라남도", title: "다산초당권역마을 농촌에서 살아보기" });
    expect(img.isPhoto).toBe(true);
    expect(img.credit).toContain("그린대로");
    expect(img.alt).toContain("다산초당권역마을");
  });
  it("허용 호스트 밖 URL 은 사진으로 쓰지 않는다", () => {
    expect(getEventImage({ imageUrl: "https://evil.example/x.jpg", region: "경기도", title: "t" }).isPhoto).toBe(false);
  });
  it("사진이 없으면 시·도 배경 일러스트, 17장 전부 실존", () => {
    for (const p of PROVINCES) {
      const src = regionFallbackImage(p.name);
      expect(src).toBe(`/images/regions/${p.id}.webp`);
      expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
    }
    expect(regionFallbackImage("전국")).toBe("/images/regions/gangwon.webp");
    expect(getEventImage({ region: "충청북도", title: "t" }).alt).toBe("");
  });
});
