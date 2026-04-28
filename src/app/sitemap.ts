import type { MetadataRoute } from "next";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import { interviews } from "@/lib/data/landing";

const BASE_URL = "https://irangfarm.com";

/**
 * sitemap index 생성 — 카테고리별 분할로 Google 크롤링 효율화
 *
 * Google은 sitemap index의 각 sitemap을 독립적으로 크롤링하므로,
 * 중요한 카테고리(핵심 페이지, 지역)가 먼저 색인될 가능성이 높아진다.
 */
export async function generateSitemaps() {
  return [
    { id: "core" },      // 핵심 정적 페이지 + 가이드
    { id: "regions" },   // 시도 + 시군구 (246건)
    { id: "content" },   // 작물 + 프로그램 + 교육 + 행사 + 인터뷰
  ];
}

export default function sitemap({
  id,
}: {
  id: string;
}): MetadataRoute.Sitemap {
  const now = new Date();

  switch (id) {
    case "core":
      return getCorePages(now);
    case "regions":
      return getRegionPages(now);
    case "content":
      return getContentPages(now);
    default:
      return [];
  }
}

// ── 핵심 정적 페이지 (priority 0.7~1.0) ──
function getCorePages(now: Date): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/regions`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/crops`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/education`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/assess`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/costs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/interviews`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/match`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/guides/preparation`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/guides/budget-50s`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/guides/solo-farming`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/guides/failure-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/guides/beginner-crops`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/regions/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/regions/centers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/crops/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/programs/roadmap`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/stats/population`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/stats/satisfaction`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/stats/youth`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/about/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/about/corrections`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}

// ── 지역 페이지 (시도 → 시군구) ──
function getRegionPages(now: Date): MetadataRoute.Sitemap {
  const provinces: MetadataRoute.Sitemap = PROVINCES.map((p) => ({
    url: `${BASE_URL}/regions/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const sigungus: MetadataRoute.Sitemap = SIGUNGUS.map((sg) => ({
    url: `${BASE_URL}/regions/${sg.sidoId}/${sg.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...provinces, ...sigungus];
}

// ── 콘텐츠 페이지 (작물 + 프로그램 + 교육 + 행사 + 인터뷰) ──
function getContentPages(now: Date): MetadataRoute.Sitemap {
  const crops: MetadataRoute.Sitemap = CROPS.map((c) => ({
    url: `${BASE_URL}/crops/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const programs: MetadataRoute.Sitemap = PROGRAMS.map((p) => ({
    url: `${BASE_URL}/programs/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const education: MetadataRoute.Sitemap = EDUCATION_COURSES.map((e) => ({
    url: `${BASE_URL}/education/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const events: MetadataRoute.Sitemap = EVENTS.map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const interviewPages: MetadataRoute.Sitemap = interviews.map((i) => ({
    url: `${BASE_URL}/interviews/${i.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...crops, ...programs, ...education, ...events, ...interviewPages];
}
