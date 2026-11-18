/**
 * watchman §6 — 기한 있는 공지 보류(2026-11-18 회장 B안). 보류한 공지만 빠지고(오탐 방지),
 * 다른 공지가 섞이거나 기한이 지나면 다시 센다(누락 방지).
 */
import { describe, expect, it } from "vitest";
import { ackedPackages, type AuditAck, type AuditVuln } from "../../scripts/watchman/audit-ack";

const PICO = "https://github.com/advisories/GHSA-fc5q-39xc-vjpf";
const ACKS: AuditAck[] = [{ advisory: PICO, until: "2026-12-15", reason: "t" }];

/** 11/18 npm audit --omit=dev 실제 사슬 */
const LIVE: Record<string, AuditVuln> = {
  "@rollup/plugin-commonjs": { severity: "high", via: ["@rollup/pluginutils", "fdir", "picomatch"] },
  "@rollup/pluginutils": { severity: "high", via: ["picomatch"] },
  "@sentry/bundler-plugins": { severity: "moderate", via: ["glob"] },
  "@sentry/nextjs": { severity: "high", via: ["@rollup/plugin-commonjs", "@sentry/bundler-plugins", "@sentry/webpack-plugin"] },
  "@sentry/webpack-plugin": { severity: "moderate", via: ["@sentry/bundler-plugins"] },
  fdir: { severity: "high", via: ["picomatch"] },
  glob: { severity: "moderate", via: [{ url: "https://github.com/advisories/GHSA-3g3m-2fjr-6pw4", severity: "moderate" }, "minimatch"] },
  minimatch: { severity: "moderate", via: [{ url: "https://github.com/advisories/GHSA-g3hv-75wg-m249", severity: "moderate" }] },
  next: { severity: "moderate", via: [{ url: "https://github.com/advisories/GHSA-mfr8-8qww-v76h", severity: "moderate" }] },
  picomatch: { severity: "high", via: [{ url: PICO, severity: "high" }] },
};
const HIGHS = ["@rollup/plugin-commonjs", "@rollup/pluginutils", "@sentry/nextjs", "fdir", "picomatch"];

describe("보류 — 기한 안", () => {
  it("11/18 실제 사슬: high 5건 전부 보류, moderate 는 손대지 않음", () => {
    const acked = ackedPackages(LIVE, ACKS, "2026-11-18");
    expect(HIGHS.every((h) => acked.has(h))).toBe(true);
    expect(acked.has("glob") || acked.has("next")).toBe(false);
  });
  it("기한 당일까지는 보류", () => {
    expect(ackedPackages(LIVE, ACKS, "2026-12-15").has("picomatch")).toBe(true);
  });
});

describe("다시 센다", () => {
  it("기한 다음 날", () => {
    expect(ackedPackages(LIVE, ACKS, "2026-12-16").size).toBe(0);
  });
  it("같은 사슬에 보류 안 한 high 공지가 새로 섞이면 그 경로의 패키지는 센다", () => {
    const v = { ...LIVE, fdir: { severity: "high", via: ["picomatch", { url: "https://github.com/advisories/GHSA-new", severity: "high" }] } };
    const acked = ackedPackages(v, ACKS, "2026-11-18");
    expect(acked.has("fdir")).toBe(false);
    expect(acked.has("@rollup/plugin-commonjs")).toBe(false);
    expect(acked.has("@sentry/nextjs")).toBe(false);
    expect(acked.has("@rollup/pluginutils")).toBe(true);
  });
  it("무관한 새 high 패키지는 보류되지 않음", () => {
    const v = { ...LIVE, undici: { severity: "high", via: [{ url: "https://github.com/advisories/GHSA-x", severity: "high" }] } };
    expect(ackedPackages(v, ACKS, "2026-11-18").has("undici")).toBe(false);
  });
});
