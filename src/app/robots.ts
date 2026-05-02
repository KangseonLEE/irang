import type { MetadataRoute } from "next";

const BASE_URL = "https://irangfarm.com";

// 학습용으로 우리 데이터를 긁어가는 크롤러 — Vercel data transfer만 소모하고 SEO에는 도움 안 됨.
// Googlebot/Bingbot 같은 검색용 봇은 그대로 허용 (검색 노출에 필요).
const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "CCBot",
  "Bytespider",
  "PerplexityBot",
  "Meta-ExternalAgent",
  "Applebot-Extended",
  "Diffbot",
  "Omgilibot",
  "ImagesiftBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 봇이 따라갈 필요 없는 경로 — transfer 낭비 방지
        // /admin: 인증 페이지 (어차피 redirect)
        // /a, /r: 진단/매칭 결과 단축 URL (사용자별, 공유 전용)
        // /assess/r, /assess/result: 진단·매칭 결과 페이지 (사용자별, OG 이미지 변환 비용 큼)
        // /search?q=...: 검색 결과 페이지 — query 조합 무한, 봇 무한 크롤 위험
        // /{list}?...: list 페이지 필터 query 조합 차단 — list 자체는 허용, ?param=만 차단
        //   (봇이 ?type=A&region=B 조합을 무한 시도해 매번 SSR 호출 → transfer 폭증)
        //   /events, /programs, /education, /crops 자체는 sitemap에 등록되어 SEO 정상 노출
        disallow: [
          "/api/",
          "/admin/",
          "/a/",
          "/r/",
          "/assess/r/",
          "/assess/result/",
          "/search",
          "/events?",
          "/programs?",
          "/education?",
          "/crops?",
        ],
      },
      ...AI_TRAINING_CRAWLERS.map((bot) => ({
        userAgent: bot,
        disallow: "/",
      })),
    ],
    sitemap: [
      `${BASE_URL}/sitemap/core.xml`,
      `${BASE_URL}/sitemap/regions.xml`,
      `${BASE_URL}/sitemap/content.xml`,
    ],
  };
}
