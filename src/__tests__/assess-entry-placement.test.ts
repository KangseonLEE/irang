import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// 10/14 진단 진입 위쪽 배치 테스트(11/1 M7 판정까지) — 자리가 조용히 밀려나지 않게 고정
const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("진단 진입 배치", () => {
  it("작물 상세: 개요 안(장점과 단점보다 앞)에 crop_detail_top, 하단 crop_detail 도 유지", () => {
    const src = read("app/crops/[id]/page.tsx");
    const top = src.indexOf('from="crop_detail_top"');
    expect(top).toBeGreaterThan(src.indexOf('id="overview"'));
    expect(top).toBeLessThan(src.indexOf("<ProsConsSection"));
    expect(src).toContain('from="crop_detail"');
  });
  it("지원사업 상세: 기본 정보 섹션 안(자격 조건보다 앞)에 program_detail_top, 하단 program_detail 도 유지", () => {
    const src = read("app/programs/[id]/page.tsx");
    const top = src.indexOf('from="program_detail_top"');
    expect(top).toBeGreaterThan(src.indexOf(">기본 정보</h2>"));
    expect(top).toBeLessThan(src.indexOf(">자격 조건</h2>"));
    expect(src).toContain('from="program_detail"');
  });
  it("초보 작물 가이드: 추천 작물 목록보다 앞에 guide_beginner_crops", () => {
    const src = read("app/guides/beginner-crops/page.tsx");
    const cta = src.indexOf('from="guide_beginner_crops"');
    expect(cta).toBeGreaterThan(-1);
    expect(cta).toBeLessThan(src.indexOf("s.cropsSection"));
  });
});
