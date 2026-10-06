import type { MetadataRoute } from "next";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS, loadPrograms } from "@/lib/data/programs";
import { EDUCATION_COURSES, filterEducationAsync } from "@/lib/data/education";
import { EVENTS, filterEventsAsync } from "@/lib/data/events";
import { interviews, hasFullStory } from "@/lib/data/landing";
import { RELEASE_GROUPS } from "@/lib/data/updates";
import { CORRECTIONS } from "@/lib/data/corrections";
import { START_LANES } from "@/lib/data/journey-lanes";
import { SITEMAP_IDS, SITE_URL as BASE_URL } from "@/lib/seo/sitemap-ids";

/**
 * 사이트맵 — 3개로 나눠 /sitemap/{core,regions,content}.xml, 목록은 /sitemap.xml (app/sitemap.xml/route.ts).
 *
 * 2026-10-06 개편 (GSC 9월 분석, 회장 "다 진행하자"):
 * - lastmod 는 실제로 바뀐 날짜를 아는 항목에만 싣는다. 종전엔 빌드 시각(6/2 고정)을 431개 중 422개에 똑같이 찍어
 *   배포할 때마다 "전부 방금 바뀜"이 됐다(10/2~10/6 배포 3회). 구글은 일관되게 정확한 lastmod 만 쓰고,
 *   부정확하면 무시한다 — 모르는 날짜를 지어내느니 빼는 게 낫다. 지금 날짜를 아는 건 업데이트 소식·정정 이력뿐.
 * - 수집(DB) 지원사업·교육·체험 중 마감 안 된 것을 넣는다. 종전엔 정적 배열만이라 실제로 검색에 노출되던
 *   수집 행 상세(그린대로 살아보기 등)가 빠져 있었다. 큐레이션 정적 항목은 마감이어도 남긴다(연례 사업·다음 회차 검색).
 * - 빠져 있던 정적 페이지(교육/치유농업, 가이드 2종)와 구(區) 상세를 넣고, /match 로 넘기기만 하는 /assess 는 뺀다.
 */

/** DB 행을 6시간마다 반영 — 랜딩 ISR 과 같은 주기 */
export const revalidate = 21600;

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;

  switch (id) {
    case "core":
      return getCorePages();
    case "regions":
      return getRegionPages();
    case "content":
      return getContentPages();
    default:
      return [];
  }
}

/** "2026-10-05" 들 중 가장 늦은 날 → KST 자정 */
function latestKstDate(dates: readonly string[]): Date | undefined {
  const latest = [...dates].sort().at(-1);
  return latest ? new Date(`${latest}T00:00:00+09:00`) : undefined;
}

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const page = (path: string, changeFrequency: Freq, priority: number, lastModified?: Date) => ({
  url: `${BASE_URL}${path}`,
  ...(lastModified ? { lastModified } : {}),
  changeFrequency,
  priority,
});

// ── 핵심 정적 페이지 (priority 0.7~1.0) ──
function getCorePages(): MetadataRoute.Sitemap {
  return [
    page("", "weekly", 1.0),
    page("/regions", "monthly", 0.9),
    page("/crops", "monthly", 0.9),
    page("/programs", "weekly", 0.9),
    page("/education", "weekly", 0.8),
    page("/education/therapy", "monthly", 0.6),
    page("/events", "weekly", 0.8),
    /* /assess 는 /match?mode=assess 로 넘기기만 하는 페이지라 싣지 않는다 — 도착지 /match 가 있다 */
    page("/costs", "monthly", 0.8),
    page("/guide", "monthly", 0.8),
    page("/guide/shelter", "monthly", 0.6),
    page("/guide/track-compare", "monthly", 0.6),
    page("/interviews", "monthly", 0.7),
    page("/match", "monthly", 0.7),
    page("/guides", "monthly", 0.7),
    page("/guides/preparation", "monthly", 0.7),
    page("/guides/budget-50s", "monthly", 0.7),
    page("/guides/solo-farming", "monthly", 0.7),
    page("/guides/failure-cases", "monthly", 0.7),
    page("/guides/beginner-crops", "monthly", 0.7),
    page("/regions/compare", "monthly", 0.7),
    page("/regions/centers", "monthly", 0.7),
    page("/regions/ranking", "monthly", 0.7),
    page("/regions/ranking/methodology", "monthly", 0.5),
    page("/crops/compare", "monthly", 0.7),
    /* 시작 유형 비교 + 레인 허브 (9/29) — 히어로 게이트의 도착지 */
    page("/start", "monthly", 0.8),
    ...START_LANES.map((l) => page(`/start/${l.id}`, "monthly", 0.8)),
    page("/programs/roadmap", "monthly", 0.7),
    /* canonical은 /stats 단일. 5탭(?tab=)은 같은 페이지의 변형이라 따로 싣지 않는다(중복 문서 회피) */
    page("/stats", "monthly", 0.7),
    page("/glossary", "monthly", 0.5),
    /* /search 는 robots disallow (검색어 조합이 무한 — 봇 무한 크롤 방지) */
    page("/about", "yearly", 0.3),
    page("/about/disclaimer", "yearly", 0.2),
    page("/about/corrections", "monthly", 0.2, latestKstDate(CORRECTIONS.map((c) => c.date))),
    page("/about/updates", "weekly", 0.3, latestKstDate(RELEASE_GROUPS.map((r) => r.date))),
    ...RELEASE_GROUPS.map((r) =>
      page(`/about/updates/${r.date}`, "monthly", 0.2, new Date(`${r.date}T00:00:00+09:00`)),
    ),
    page("/terms", "yearly", 0.2),
  ];
}

// ── 지역 페이지 (시·도 → 시·군·구 → 구) ──
function getRegionPages(): MetadataRoute.Sitemap {
  return [
    ...PROVINCES.map((p) => page(`/regions/${p.id}`, "monthly", 0.7)),
    ...SIGUNGUS.map((sg) => page(`/regions/${sg.sidoId}/${sg.id}`, "monthly", 0.5)),
    /* 시 아래 구(수원 장안구 등) — 상세가 있고 색인 가능한데 빠져 있었다 */
    ...GUS.map((g) => page(`/regions/${g.sidoId}/${g.parentSigunguId}/${g.id}`, "monthly", 0.4)),
  ];
}

// ── 콘텐츠 페이지 (작물 + 지원사업 + 교육 + 체험 + 인터뷰) ──
async function getContentPages(): Promise<MetadataRoute.Sitemap> {
  const crops = CROPS.map((c) => page(`/crops/${c.id}`, "monthly", 0.6));

  // 큐레이션 정적 항목은 전부 + 수집(DB) 행은 마감 안 된 것만. 실패하면 로더가 정적 데이터로 떨어진다
  const [{ programs: loadedPrograms }, { courses }, { events }] = await Promise.all([
    loadPrograms(),
    filterEducationAsync({}),
    filterEventsAsync({}),
  ]);
  const staticProgramIds = new Set(PROGRAMS.map((p) => p.id));
  const programIds = new Set<string>(staticProgramIds);
  for (const p of loadedPrograms) {
    if (staticProgramIds.has(p.id) || p.status !== "마감") programIds.add(p.id);
  }
  const educationIds = new Set<string>([...EDUCATION_COURSES.map((e) => e.id), ...courses.map((c) => c.id)]);
  const eventIds = new Set<string>([...EVENTS.map((e) => e.id), ...events.map((e) => e.id)]);

  return [
    ...crops,
    ...[...programIds].map((id) => page(`/programs/${id}`, "weekly", 0.6)),
    ...[...educationIds].map((id) => page(`/education/${id}`, "weekly", 0.6)),
    ...[...eventIds].map((id) => page(`/events/${id}`, "weekly", 0.5)),
    // 본문 동의자만 (미동의자는 원문 기사로 넘기므로 색인 의미 없음)
    ...interviews.filter(hasFullStory).map((i) => page(`/interviews/${i.id}`, "monthly", 0.6)),
  ];
}
