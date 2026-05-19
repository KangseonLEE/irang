// Logical sim for 5 scenarios (D1, wrangler 미설치 환경 대체).
// 동일 정책 로직을 그대로 복제해 verify.

const BLOCKED = [/GPTBot/i, /ClaudeBot/i, /HeadlessChrome/i, /puppeteer/i, /playwright/i];
const VERIFIED = [/Googlebot/i, /Bingbot/i, /Twitterbot/i, /facebookexternalhit/i, /LinkedInBot/i, /Slackbot/i, /ChatGPT-User/i, /Yeti/i, /Daum/i, /NaverBot/i, /AdsBot-Google/i, /Mediapartners-Google/i, /BingPreview/i];

function decide({ ua, country }) {
  const isE2e = ua.includes("irang-e2e/1.0");
  if (BLOCKED.some(r => r.test(ua))) return "block-403";
  if (country && country !== "KR" && !VERIFIED.some(r => r.test(ua)) && !isE2e) return "block-503";
  return "allow";
}

const cases = [
  { name: "1) 한국 사용자 일반 Chrome", ua: "Mozilla/5.0 (Macintosh) Chrome/124.0", country: "KR", expect: "allow" },
  { name: "2) 미국 일반 Chrome (5/14 cache HIT bypass 시나리오)", ua: "Mozilla/5.0 Chrome/124.0", country: "US", expect: "block-503" },
  { name: "3) Googlebot UA + US IP (verified bot)", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", country: "US", expect: "allow" },
  { name: "4) 한국 IPv6 Chrome (5/19 정상 사용자)", ua: "Mozilla/5.0 (Linux; Android 14) Chrome/124.0", country: "KR", expect: "allow" },
  { name: "5) HeadlessChrome (Boydton/Flint Hill bot)", ua: "Mozilla/5.0 HeadlessChrome/124.0", country: "US", expect: "block-403" },
  { name: "6) E2E runner (Sprint B D2 통합)", ua: "irang-e2e/1.0 Playwright", country: "US", expect: "block-403" }, // playwright UA 가 우선 매칭 → 403 — 의도된 동작
  { name: "7) E2E runner 단독 UA", ua: "irang-e2e/1.0 (CI)", country: "US", expect: "allow" },
];

let pass = 0, fail = 0;
for (const c of cases) {
  const got = decide(c);
  const ok = got === c.expect;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name} -> ${got} (expect ${c.expect})`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass}/${pass+fail} PASS`);
process.exit(fail === 0 ? 0 : 1);
