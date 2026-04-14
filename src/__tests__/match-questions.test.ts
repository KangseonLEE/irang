/**
 * match-questions.ts 유닛 테스트
 *
 * 질문 데이터 무결성 + 유효성 검증 헬퍼 동작 확인
 */

import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  FARM_TYPES,
  isValidOptionId,
} from "@/lib/data/match-questions";

// ─── 질문 데이터 무결성 ───

describe("QUESTIONS 데이터 무결성", () => {
  it("5개 질문이 존재한다", () => {
    expect(QUESTIONS).toHaveLength(5);
  });

  it("모든 질문은 고유한 ID를 갖는다", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 질문은 최소 2개 이상의 옵션을 갖는다", () => {
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("모든 옵션은 id, label, icon을 갖는다", () => {
    for (const q of QUESTIONS) {
      for (const opt of q.options) {
        expect(opt).toHaveProperty("id");
        expect(opt).toHaveProperty("label");
        expect(opt).toHaveProperty("icon");
        expect(typeof opt.id).toBe("string");
        expect(typeof opt.label).toBe("string");
      }
    }
  });

  it("각 질문 내 옵션 ID는 고유하다", () => {
    for (const q of QUESTIONS) {
      const optIds = q.options.map((o) => o.id);
      expect(new Set(optIds).size).toBe(optIds.length);
    }
  });

  it("필수 질문 ID가 존재한다 (experience, climate, priority, lifestyle, crop-type)", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(ids).toContain("experience");
    expect(ids).toContain("climate");
    expect(ids).toContain("priority");
    expect(ids).toContain("lifestyle");
    expect(ids).toContain("crop-type");
  });
});

// ─── FARM_TYPES 데이터 무결성 ───

describe("FARM_TYPES 데이터 무결성", () => {
  it("4가지 귀농 유형이 존재한다", () => {
    expect(FARM_TYPES).toHaveLength(4);
  });

  it("모든 유형은 고유한 ID를 갖는다", () => {
    const ids = FARM_TYPES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 유형은 필수 필드를 갖는다", () => {
    for (const type of FARM_TYPES) {
      expect(type).toHaveProperty("id");
      expect(type).toHaveProperty("label");
      expect(type).toHaveProperty("emoji");
      expect(type).toHaveProperty("tagline");
      expect(type).toHaveProperty("description");
      expect(type).toHaveProperty("traits");
      expect(type).toHaveProperty("programIds");
      expect(Array.isArray(type.traits)).toBe(true);
      expect(Array.isArray(type.programIds)).toBe(true);
    }
  });

  it("모든 유형은 최소 1개의 추천 프로그램을 갖는다", () => {
    for (const type of FARM_TYPES) {
      expect(type.programIds.length).toBeGreaterThan(0);
    }
  });
});

// ─── isValidOptionId ───

describe("isValidOptionId", () => {
  it("유효한 질문-옵션 조합은 true를 반환한다", () => {
    expect(isValidOptionId("climate", "warm")).toBe(true);
    expect(isValidOptionId("experience", "none")).toBe(true);
  });

  it("존재하지 않는 옵션은 false를 반환한다", () => {
    expect(isValidOptionId("climate", "nonexistent")).toBe(false);
  });

  it("존재하지 않는 질문은 false를 반환한다", () => {
    expect(isValidOptionId("nonexistent", "warm")).toBe(false);
  });
});
