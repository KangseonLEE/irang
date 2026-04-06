import type { MetadataRoute } from "next";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";

const BASE_URL = "https://irang-wheat.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ── 정적 페이지 ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/regions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/regions/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/programs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/crops`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/education`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/match`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ];

  // ── 동적 페이지: 지역 상세 ──
  const regionPages: MetadataRoute.Sitemap = PROVINCES.map((p) => ({
    url: `${BASE_URL}/regions/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ── 동적 페이지: 시/군/구 상세 ──
  const sigunguPages: MetadataRoute.Sitemap = SIGUNGUS.map((sg) => ({
    url: `${BASE_URL}/regions/${sg.sidoId}/${sg.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ── 동적 페이지: 작물 상세 ──
  const cropPages: MetadataRoute.Sitemap = CROPS.map((c) => ({
    url: `${BASE_URL}/crops/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ── 동적 페이지: 지원사업 상세 (정적 데이터만, RDA 동적 데이터 제외) ──
  const programPages: MetadataRoute.Sitemap = PROGRAMS.map((p) => ({
    url: `${BASE_URL}/programs/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ── 동적 페이지: 교육 상세 ──
  const educationPages: MetadataRoute.Sitemap = EDUCATION_COURSES.map((e) => ({
    url: `${BASE_URL}/education/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ── 동적 페이지: 행사 상세 ──
  const eventPages: MetadataRoute.Sitemap = EVENTS.map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...regionPages,
    ...sigunguPages,
    ...cropPages,
    ...programPages,
    ...educationPages,
    ...eventPages,
  ];
}
