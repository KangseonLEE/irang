import { SITEMAP_IDS, SITE_URL } from "@/lib/seo/sitemap-ids";

/**
 * /sitemap.xml → (next.config beforeFiles 리라이트) → 여기. 분할 사이트맵 3개를 묶은 목록(sitemapindex) (2026-10-06).
 * 실제 URL 목록은 app/sitemap.ts 가 /sitemap/{core,regions,content}.xml 로 낸다.
 */
export const dynamic = "force-static";

export function GET() {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...SITEMAP_IDS.map((id) => `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>`),
    "</sitemapindex>",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
