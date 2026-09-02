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

describe("RELEASE_GROUPS 파생 (목록·상세 페이지)", async () => {
  const { RELEASE_GROUPS, RELEASES, getRelease, releaseTitle } = await import("@/lib/data/updates");

  it("모든 UPDATES 항목이 정확히 한 그룹에 속하고 날짜가 유일하다", () => {
    const dates = RELEASE_GROUPS.map((r) => r.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect(RELEASE_GROUPS.reduce((n, r) => n + r.items.length, 0)).toBe(UPDATES.length);
  });

  it("RELEASES 머리말 날짜는 전부 UPDATES 에 항목이 있다 (고아 머리말 금지)", () => {
    for (const date of Object.keys(RELEASES)) {
      expect(getRelease(date), date).toBeDefined();
    }
  });

  it("행 제목은 비어 있지 않다", () => {
    for (const r of RELEASE_GROUPS) expect(releaseTitle(r).trim().length, r.date).toBeGreaterThan(0);
  });
});

describe("이전/이후 이미지 (회장 9/2: 항목마다 항상 두 장)", async () => {
  const fs = await import("node:fs");
  it("모든 항목에 before·after 가 있고 파일이 public/updates 에 실제로 존재한다", () => {
    for (const item of UPDATES) {
      expect(item.media, item.id).toBeDefined();
      for (const src of [item.media.before, item.media.after]) {
        expect(src, item.id).toMatch(/^\/updates\/[a-z0-9-]+\.webp$/);
        expect(fs.existsSync(`public${src}`), `${item.id}: ${src}`).toBe(true);
      }
      expect(item.media.caption.trim().length, item.id).toBeGreaterThan(0);
    }
  });
});
