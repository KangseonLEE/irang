import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { ADMIN_SECTIONS } from "@/lib/admin/config";

/**
 * 배지는 notifications 의 item.key 와 ADMIN_SECTIONS.key 를 문자열로 매칭한다.
 * 키가 어긋나면 알림은 종에만 뜨고 사이드바·탭 배지는 조용히 안 보인다 → 소스에서 키를 뽑아 대조.
 */
const source = readFileSync("src/lib/admin/notifications.ts", "utf8");

describe("어드민 처리 대기 알림 (9/3)", () => {
  it("알림 item.key 가 전부 실제 어드민 섹션 키다", () => {
    const keys = [...source.matchAll(/key:\s*"([a-z-]+)"/g)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(0);
    const sectionKeys = new Set(ADMIN_SECTIONS.map((s) => s.key));
    for (const key of keys) expect(sectionKeys.has(key), key).toBe(true);
  });

  it("알림 href 가 해당 섹션 경로로 시작한다", () => {
    const pairs = [...source.matchAll(/key:\s*"([a-z-]+)",[\s\S]{0,160}?href:\s*"([^"]+)"/g)];
    expect(pairs.length).toBeGreaterThan(0);
    for (const [, key, href] of pairs) {
      const section = ADMIN_SECTIONS.find((s) => s.key === key)!;
      expect(href.startsWith(section.href), `${key} → ${href}`).toBe(true);
    }
  });
});
