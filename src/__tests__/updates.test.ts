import { describe, it, expect } from "vitest";
import { UPDATES, LATEST_UPDATE_ID } from "@/lib/data/updates";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^\d{8}-[a-z0-9-]+$/;
const VALID_TAGS = ["기능", "개선", "수정", "데이터"];

describe("UPDATES 데이터 계약", () => {
  it("항목이 8건 이상 있다", () => {
    expect(UPDATES.length).toBeGreaterThanOrEqual(8);
  });

  it("date는 모두 YYYY-MM-DD 형식이고 실제 존재하는 날짜다", () => {
    for (const item of UPDATES) {
      expect(item.date, item.id).toMatch(DATE_RE);
      const parsed = new Date(`${item.date}T00:00:00+09:00`);
      expect(Number.isNaN(parsed.getTime()), item.id).toBe(false);
    }
  });

  it("최신순(date 내림차순)으로 정렬돼 있다", () => {
    for (let i = 1; i < UPDATES.length; i += 1) {
      expect(
        UPDATES[i - 1].date >= UPDATES[i].date,
        `${UPDATES[i - 1].id} → ${UPDATES[i].id}`,
      ).toBe(true);
    }
  });

  it("id는 YYYYMMDD-slug 형식이며 date와 앞자리가 일치한다", () => {
    for (const item of UPDATES) {
      expect(item.id).toMatch(ID_RE);
      expect(item.id.slice(0, 8), item.id).toBe(item.date.replace(/-/g, ""));
    }
  });

  it("id가 중복되지 않는다", () => {
    const ids = UPDATES.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("LATEST_UPDATE_ID는 첫 항목의 id다", () => {
    expect(LATEST_UPDATE_ID).toBe(UPDATES[0].id);
  });

  it("title·summary가 비어 있지 않고 tag가 4종 중 하나다", () => {
    for (const item of UPDATES) {
      expect(item.title.trim().length, item.id).toBeGreaterThan(0);
      expect(item.summary.trim().length, item.id).toBeGreaterThan(0);
      expect(VALID_TAGS, item.id).toContain(item.tag);
    }
  });

  it("href가 있으면 내부 절대 경로다", () => {
    for (const item of UPDATES) {
      if (item.href) expect(item.href, item.id).toMatch(/^\//);
    }
  });

  it("카피 톤 — '~합니다/입니다' 종결을 쓰지 않는다", () => {
    for (const item of UPDATES) {
      const text = `${item.title} ${item.summary}`;
      expect(text, item.id).not.toMatch(/(합니다|입니다)/);
    }
  });
});
