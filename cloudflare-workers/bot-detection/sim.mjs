// 로컬 시뮬레이션 — 실제 index.js 의 decide() 를 그대로 호출한다 (2026-09-30: 로직 복제본 → 실코드 import).
// 실행: node cloudflare-workers/bot-detection/sim.mjs
import { __test } from "./index.js";

const req = (ua, country, path = "/") =>
  new Request(`https://irangfarm.com${path}`, { headers: { "user-agent": ua, ...(country ? { "cf-ipcountry": country } : {}) } });

const cases = [
  { name: "1) 한국 사용자 일반 Chrome", r: req("Mozilla/5.0 (Macintosh) Chrome/124.0", "KR"), expect: "allow" },
  { name: "2) 미국 일반 Chrome (cache HIT bypass 시나리오)", r: req("Mozilla/5.0 Chrome/124.0", "US"), expect: "block-503" },
  { name: "3) Googlebot UA + US", r: req("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "US"), expect: "allow" },
  { name: "4) 한국 Android Chrome", r: req("Mozilla/5.0 (Linux; Android 14) Chrome/124.0", "KR"), expect: "allow" },
  { name: "5) HeadlessChrome", r: req("Mozilla/5.0 HeadlessChrome/124.0", "US"), expect: "block-403" },
  { name: "6) E2E UA 에 playwright 포함 → 403 우선 (의도)", r: req("irang-e2e/1.0 Playwright", "US"), expect: "block-403" },
  { name: "7) E2E runner 단독 UA", r: req("irang-e2e/1.0 (CI)", "US"), expect: "allow" },
  { name: "8) Sentry 웹훅 (미국 GCP, 서명 자체 인증)", r: req("sentry/26.10.0.dev0 (https://sentry.io)", "US", "/api/sentry-webhook"), expect: "allow" },
  { name: "9) Sentry UA 로 다른 API 경로", r: req("sentry/26.10.0.dev0 (https://sentry.io)", "US", "/api/assess"), expect: "block-503" },
  { name: "10) Let's Encrypt HTTP-01 검증", r: req("Mozilla/5.0 (compatible; Let's Encrypt validation server; +https://www.letsencrypt.org)", "US", "/.well-known/acme-challenge/abc123"), expect: "allow" },
  { name: "11) 미국 Chrome 이 /.well-known/ 다른 경로", r: req("Mozilla/5.0 Chrome/124.0", "US", "/.well-known/security.txt"), expect: "block-503" },
  { name: "12) 미국 AI 학습 봇이 웹훅 경로 (403 이 우선)", r: req("GPTBot/1.0", "US", "/api/sentry-webhook"), expect: "block-403" },
  { name: "13) 한국 사용자가 웹훅 경로", r: req("Mozilla/5.0 Chrome/124.0", "KR", "/api/sentry-webhook"), expect: "allow" },
  { name: "14) GSC URL 검사 실시간 테스트 (미국)", r: req("Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)", "US"), expect: "allow" },
  { name: "15) ChatGPT 검색 로봇 OAI-SearchBot (미국)", r: req("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot", "US"), expect: "allow" },
  { name: "16) Claude 검색 로봇 Claude-SearchBot (미국)", r: req("Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)", "US"), expect: "allow" },
  { name: "17) Claude-User (미국)", r: req("Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)", "US"), expect: "allow" },
  { name: "18) Perplexity 검색 로봇 (미국)", r: req("Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", "US"), expect: "allow" },
  { name: "19) Perplexity-User (미국)", r: req("Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)", "US"), expect: "allow" },
  { name: "20) 학습 봇 ClaudeBot (한국이어도 403)", r: req("Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)", "KR"), expect: "block-403" },
  { name: "21) 학습 봇 GPTBot (한국이어도 403)", r: req("Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)", "KR"), expect: "block-403" },
];

let pass = 0, fail = 0;
for (const c of cases) {
  const got = __test.decide(c.r);
  const ok = got === c.expect;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name} -> ${got} (expect ${c.expect})`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass}/${pass + fail} PASS`);
process.exit(fail === 0 ? 0 : 1);
