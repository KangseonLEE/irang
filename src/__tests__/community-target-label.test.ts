import { describe, it, expect } from "vitest";
import {
  TARGET_TYPE_LABELS,
  resolveTargetHref,
  resolveTargetLabel,
} from "@/lib/community/target-label";
import { CROPS } from "@/lib/data/crops";
import { NOTE_TARGET_TYPES } from "@/lib/community/types";

describe("커뮤니티 대상 한글 이름 (9/3 회장 지시)", () => {
  it("작물 id → 한글 이름", () => {
    expect(resolveTargetLabel("crop", "eggplant")).toBe("가지");
    expect(resolveTargetLabel("crop", "strawberry")).toBe("딸기");
  });

  it("모든 작물 id가 한글 이름으로 해석된다 (id 그대로 남는 건 없음)", () => {
    for (const crop of CROPS) {
      expect(resolveTargetLabel("crop", crop.id), crop.id).toBe(crop.name);
    }
  });

  it("지역 id → 시·도 / 시·도 + 시·군·구", () => {
    expect(resolveTargetLabel("region", "gyeongbuk")).toBe("경북");
    expect(resolveTargetLabel("region", "gyeongbuk/yeongju")).toBe("경북 영주시");
  });

  it("다른 시·도의 시·군·구 조합은 시·도까지만 (잘못된 쌍 방어)", () => {
    expect(resolveTargetLabel("region", "jeonnam/yeongju")).toBe("전남");
  });

  it("지원사업은 제목 맵이 있으면 제목, 없으면 id", () => {
    const titles = new Map([["SP-012", "스마트팜 청년창업 보육센터 교육생 모집 (9기)"]]);
    expect(resolveTargetLabel("program", "SP-012", titles)).toContain("스마트팜");
    expect(resolveTargetLabel("program", "SP-999", titles)).toBe("SP-999");
  });

  it("알 수 없는 id는 원본을 그대로 (빈 문자열 금지)", () => {
    expect(resolveTargetLabel("crop", "unknown-crop")).toBe("unknown-crop");
    expect(resolveTargetLabel("region", "atlantis")).toBe("atlantis");
  });

  it("대상 링크와 종류 라벨이 3종 모두 정의돼 있다", () => {
    for (const t of NOTE_TARGET_TYPES) {
      expect(TARGET_TYPE_LABELS[t]).toBeTruthy();
      expect(resolveTargetHref(t, "x")).toMatch(/^\/(crops|programs|regions)\/x$/);
    }
  });
});
