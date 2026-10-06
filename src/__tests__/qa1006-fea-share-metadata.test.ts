/**
 * 10/6 QA1 Q2-W3 — 지역·비교 화면의 공유 카드(og/twitter)가 그 페이지의 제목·설명·주소를 쓴다.
 *
 * 종전: 시·군·구 229쪽·구 32쪽·/regions·/regions/compare·/regions/ranking·/regions/centers 가
 * 사이트 기본 og:title/description 을 물려받고 og:url 도 없었다. 시·도는 og:title 이 "전남 농촌 정착 정보"로
 * 10/6 "귀농" 제목과 어긋났다.
 */
import { describe, expect, it } from "vitest";
import type { Metadata } from "next";

function expectCardMatchesPage(meta: Metadata, path: string) {
  const title = typeof meta.title === "string" ? meta.title : "";
  expect(title, "문서 제목").not.toBe("");
  const og = meta.openGraph as { title?: string; description?: string; url?: string } | undefined;
  const tw = meta.twitter as { title?: string; description?: string } | undefined;
  expect(og?.title).toBe(`${title} | 이랑`);
  expect(og?.description).toBe(meta.description);
  expect(og?.url).toBe(path);
  expect(tw?.title).toBe(`${title} | 이랑`);
  expect(tw?.description).toBe(meta.description);
  expect(meta.alternates?.canonical).toBe(path);
}

describe("정적 metadata 페이지", () => {
  it.each([
    ["/regions", () => import("@/app/regions/page")],
    ["/regions/compare", () => import("@/app/regions/compare/page")],
    ["/regions/ranking", () => import("@/app/regions/ranking/page")],
    ["/regions/ranking/methodology", () => import("@/app/regions/ranking/methodology/page")],
    ["/regions/centers", () => import("@/app/regions/centers/page")],
    ["/crops/compare", () => import("@/app/crops/compare/page")],
  ] as const)("%s", async (path, load) => {
    const mod = await load();
    expectCardMatchesPage(mod.metadata, path);
  });
});

describe("generateMetadata 페이지", () => {
  it("시·도 — og:title 이 '귀농' 문서 제목과 같다", async () => {
    const { generateMetadata } = await import("@/app/regions/[id]/page");
    const meta = await generateMetadata({ params: Promise.resolve({ id: "jeonnam" }) });
    expect(meta.title).toBe("전남 귀농 — 지원사업·정착금·기후·작물 정보");
    expectCardMatchesPage(meta, "/regions/jeonnam");
  });

  it("시·군·구", async () => {
    const { generateMetadata } = await import("@/app/regions/[id]/[sigungu]/page");
    const meta = await generateMetadata({ params: Promise.resolve({ id: "gyeonggi", sigungu: "gapyeong" }) });
    expect(meta.title).toBe("경기 가평군 귀농 — 지원사업·작물·인프라");
    expectCardMatchesPage(meta, "/regions/gyeonggi/gapyeong");
    expect(meta.keywords).toContain("가평군 귀농");
  });

  it("구", async () => {
    const { generateMetadata } = await import("@/app/regions/[id]/[sigungu]/[gu]/page");
    const { GUS } = await import("@/lib/data/gus");
    const gu = GUS[0];
    const meta = await generateMetadata({
      params: Promise.resolve({ id: gu.sidoId, sigungu: gu.parentSigunguId, gu: gu.id }),
    });
    expectCardMatchesPage(meta, `/regions/${gu.sidoId}/${gu.parentSigunguId}/${gu.id}`);
  });
});
