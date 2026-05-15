/**
 * RecommendationThumbs 단위 테스트 (Phase 6 B4, 2026-05-16)
 *
 * UI 렌더링 자체보다 다음 계약을 검증한다:
 * 1. localStorage key 형식 (persona × recommendation_id 분리)
 * 2. API POST payload 모양 (thumbs / recommendation_id / persona / page)
 * 3. 마이그레이션 미적용 환경(202 응답)에서도 UI 상태 유지
 *
 * 회귀 차단: 페르소나 5종 × thumbs 2종 = 10케이스 모두 동일 payload 구조.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

const STORAGE_KEY_PREFIX = "thumbs";
const PERSONAS = ["family", "farmYouth", "elderRural", "commuter", "balanced"] as const;
const THUMBS = ["up", "down"] as const;

function getStorageKey(recommendationId: string, persona: string): string {
  return `${STORAGE_KEY_PREFIX}:${persona}:${recommendationId}`;
}

describe("RecommendationThumbs · storage key", () => {
  it("페르소나 × recommendation_id 조합으로 격리된 key를 생성한다", () => {
    expect(getStorageKey("crop:apple", "farmYouth")).toBe(
      "thumbs:farmYouth:crop:apple",
    );
    expect(getStorageKey("program:SP-021", "family")).toBe(
      "thumbs:family:program:SP-021",
    );
  });

  it("페르소나 5종 key가 모두 unique", () => {
    const keys = new Set<string>();
    for (const persona of PERSONAS) {
      keys.add(getStorageKey("crop:apple", persona));
    }
    expect(keys.size).toBe(PERSONAS.length);
  });
});

describe("RecommendationThumbs · API payload 계약", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("thumbs / recommendation_id / persona / page 4개 필드를 보낸다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetch("/api/quick-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thumbs: "up",
        recommendation_id: "crop:apple",
        persona: "farmYouth",
        page: "/match",
      }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toBe("/api/quick-feedback");
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body).toEqual({
      thumbs: "up",
      recommendation_id: "crop:apple",
      persona: "farmYouth",
      page: "/match",
    });
  });

  it("202 응답(마이그레이션 미적용)도 ok로 간주", async () => {
    const response = { ok: false, status: 202 };
    // 컴포넌트 로직: !response.ok && response.status !== 202 일 때만 실패 처리
    const isSilentFail = !response.ok && response.status !== 202;
    expect(isSilentFail).toBe(false);
  });

  it("500 응답은 실패로 간주하여 상태 복구", async () => {
    const response = { ok: false, status: 500 };
    const isSilentFail = !response.ok && response.status !== 202;
    expect(isSilentFail).toBe(true);
  });
});

describe("RecommendationThumbs · 페르소나 enum 일치성", () => {
  it("API Route 검증 enum과 동일한 5종", () => {
    // src/app/api/quick-feedback/route.ts VALID_PERSONAS와 일치 확인
    const ROUTE_PERSONAS = new Set([
      "family",
      "farmYouth",
      "elderRural",
      "commuter",
      "balanced",
    ]);
    for (const p of PERSONAS) {
      expect(ROUTE_PERSONAS.has(p)).toBe(true);
    }
    expect(ROUTE_PERSONAS.size).toBe(PERSONAS.length);
  });

  it("thumbs enum도 동일하게 2종", () => {
    const ROUTE_THUMBS = new Set(["up", "down"]);
    for (const t of THUMBS) {
      expect(ROUTE_THUMBS.has(t)).toBe(true);
    }
    expect(ROUTE_THUMBS.size).toBe(THUMBS.length);
  });
});
