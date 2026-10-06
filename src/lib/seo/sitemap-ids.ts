/**
 * 분할 사이트맵 id — `app/sitemap.ts`(generateSitemaps → /sitemap/{id}.xml)와
 * `app/sitemap-index.xml/route.ts`(목록 = sitemapindex, next.config 리라이트로 /sitemap.xml 에서 응답)가 같은 목록을 쓴다 (2026-10-06).
 *
 * 분할 뒤 /sitemap.xml 은 404 였다. 구글은 robots.txt 의 Sitemap 줄로 찾지만,
 * 서치 콘솔·네이버 서치어드바이저에 예전 주소(/sitemap.xml)로 등록돼 있으면 그쪽은 실패한다 —
 * 같은 주소에 세 파일을 묶은 목록을 둔다.
 */
export const SITEMAP_IDS = ["core", "regions", "content"] as const;

export const SITE_URL = "https://irangfarm.com";
