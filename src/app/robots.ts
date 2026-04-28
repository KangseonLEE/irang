import type { MetadataRoute } from "next";

const BASE_URL = "https://irangfarm.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: [
      `${BASE_URL}/sitemap/core.xml`,
      `${BASE_URL}/sitemap/regions.xml`,
      `${BASE_URL}/sitemap/content.xml`,
    ],
  };
}
