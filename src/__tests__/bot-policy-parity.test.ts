import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 봇 정책은 두 계층에 있다 — CF Worker(cloudflare-workers/bot-detection, 캐시 앞)와 middleware(오리진).
 * 9/30: 미들웨어만 고쳐 "코드는 옳은데 라이브는 그대로"(Sentry 웹훅 503). 10/6: Worker 에만
 * Google-InspectionTool 이 빠져 GSC URL 검사·색인 요청이 503. 두 목록이 같아야 한다.
 * robots.txt 의 학습 크롤러 차단 명단은 차단 목록 안에 있어야 하고, AI 검색 로봇은 허용 쪽에 있어야 한다(10/6 회장 결재).
 */

const read = (...p: string[]) => readFileSync(join(process.cwd(), ...p), "utf8");
const middleware = read("middleware.ts");
const worker = read("cloudflare-workers", "bot-detection", "index.js");
const robots = read("src", "app", "robots.ts");

/** `const NAME = [ /a/i, /b/i ]` → ["a", "b"] (정규식 본문, 소문자) */
function patterns(src: string, name: string): string[] {
  const m = src.match(new RegExp(`const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!m) throw new Error(`${name} 를 찾지 못했어요`);
  return [...m[1].matchAll(/\/([^/\n]+)\/i/g)].map((x) => x[1].toLowerCase()).sort();
}

const AI_SEARCH_BOTS = ["oai-searchbot", "chatgpt-user", "claude-searchbot", "claude-user", "perplexitybot", "perplexity-user"];

describe("Worker ↔ middleware 봇 목록 일치", () => {
  it.each(["BLOCKED_BOT_PATTERNS", "VERIFIED_BOT_PATTERNS", "HEADLESS_BROWSER_PATTERNS"])("%s", (name) => {
    expect(patterns(worker, name)).toEqual(patterns(middleware, name));
  });

  it("GSC 도구(URL 검사·색인 요청)는 지역 차단을 통과한다", () => {
    const verified = patterns(worker, "VERIFIED_BOT_PATTERNS");
    for (const g of ["googlebot", "google-inspectiontool", "googleother"]) expect(verified).toContain(g);
  });
});

describe("AI 검색 로봇은 허용, 학습 로봇은 차단 (10/6)", () => {
  const blocked = patterns(middleware, "BLOCKED_BOT_PATTERNS");
  const verified = patterns(middleware, "VERIFIED_BOT_PATTERNS");
  const robotsList = (robots.match(/const AI_TRAINING_CRAWLERS = \[([\s\S]*?)\];/)?.[1] ?? "")
    .match(/"([^"]+)"/g)!
    .map((s) => s.slice(1, -1).toLowerCase());

  it("AI 검색 로봇: 허용 목록에 있고, 차단 목록·robots 학습 명단엔 없다", () => {
    for (const bot of AI_SEARCH_BOTS) {
      expect(verified, bot).toContain(bot);
      expect(blocked.some((b) => bot.includes(b)), bot).toBe(false);
      expect(robotsList, bot).not.toContain(bot);
    }
  });

  it("학습 로봇: robots 에서 막는 이름은 모두 UA 차단 목록에도 있다", () => {
    expect(robotsList).toEqual(expect.arrayContaining(["gptbot", "claudebot", "google-extended", "ccbot"]));
    for (const bot of robotsList) expect(blocked, bot).toContain(bot);
  });
});

describe("robots.txt 출력 (운영)", () => {
  it("사이트맵 목록이 먼저, PerplexityBot 은 학습 차단 명단에 없다", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.resetModules();
    const { default: robots } = await import("@/app/robots");
    const r = robots();
    const sitemaps = Array.isArray(r.sitemap) ? r.sitemap : [r.sitemap];
    expect(sitemaps[0]).toBe("https://irangfarm.com/sitemap.xml");
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const disallowAll = rules.filter((x) => x.disallow === "/").map((x) => String(x.userAgent).toLowerCase());
    expect(disallowAll).toContain("gptbot");
    for (const bot of AI_SEARCH_BOTS) expect(disallowAll, bot).not.toContain(bot);
    vi.unstubAllEnvs();
  });
});
