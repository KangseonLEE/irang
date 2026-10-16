/**
 * 10/16 QA1 🟡-1 — 지도 이동이 SSR 링크가 아니었다.
 * 시·도·시·군·구 지도 path 가 role=button + router.push 라 HTML 에 링크가 없어, 크롤러가
 * 시·군·구·구 상세(들어오는 링크 0 인 사이트맵 URL 중 지역 91쪽)를 못 찾았다. 지금은 SVG 안 <a>.
 *
 * 10/16 QA1 🟡-2 — 의료기관·학교 목록 안내 창이 첫 호출 502 뒤 다시 시도 수단이 없었다.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/regions",
  useSearchParams: () => new URLSearchParams(),
}));

import { KoreaMap } from "@/components/map/korea-map";
import { ProvinceMap } from "@/components/map/province-map";
import { DistrictMap } from "@/components/map/district-map";
import { PaginatedListModal } from "@/app/regions/[id]/modals/paginated-list-modal";
import { loadProvinceMap } from "@/lib/data/province-maps";
import { loadDistrictMap } from "@/lib/data/district-maps";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";

function hrefs(html: string, prefix: string): Set<string> {
  const out = new Set<string>();
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    if (m[1].startsWith(prefix)) out.add(m[1]);
  }
  return out;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("지도 SSR 링크", () => {
  it("/regions 허브 전국 지도 — 17개 시·도 링크가 HTML 에 있다", () => {
    const html = renderToStaticMarkup(<KoreaMap densityMap={{}} showLegend={false} />);
    const links = hrefs(html, "/regions/");
    expect(links.size).toBe(PROVINCES.length);
    for (const p of PROVINCES) expect(links.has(`/regions/${p.id}`)).toBe(true);
    expect(html).not.toContain('role="button"');
  });

  it("시·도 지도 — 경기 31개 시·군 링크가 전부 HTML 에 있고 실재 시·군을 가리킨다", async () => {
    const map = await loadProvinceMap("gyeonggi");
    const html = renderToStaticMarkup(
      <ProvinceMap provinceId="gyeonggi" sigungus={map.sigungus} viewBox={map.viewBox} />,
    );
    const links = hrefs(html, "/regions/gyeonggi/");
    expect(links.size).toBe(map.sigungus.length);
    expect(links.size).toBe(SIGUNGUS.filter((sg) => sg.sidoId === "gyeonggi").length);
    for (const href of links) {
      const id = href.split("/")[3];
      expect(SIGUNGUS.some((sg) => sg.sidoId === "gyeonggi" && sg.id === id)).toBe(true);
    }
    expect(html).not.toContain('role="button"');
  });

  it("도서 칩(울릉)도 링크다", async () => {
    const map = await loadProvinceMap("gyeongbuk");
    const html = renderToStaticMarkup(
      <ProvinceMap provinceId="gyeongbuk" sigungus={map.sigungus} viewBox={map.viewBox} />,
    );
    expect(html).toContain('href="/regions/gyeongbuk/ulleung"');
  });

  it.each([
    ["hwaseong", 4],
    ["bucheon", 3],
  ])("구 지도 — %s 구 %d곳 링크가 HTML 에 있다", async (sigunguId, count) => {
    const map = await loadDistrictMap(sigunguId);
    const html = renderToStaticMarkup(
      <DistrictMap provinceId="gyeonggi" sigunguId={sigunguId} gus={map.gus} viewBox={map.viewBox} />,
    );
    const links = hrefs(html, `/regions/gyeonggi/${sigunguId}/`);
    expect(links.size).toBe(count);
    for (const href of links) {
      const guId = href.split("/")[4];
      expect(GUS.some((g) => g.sidoId === "gyeonggi" && g.parentSigunguId === sigunguId && g.id === guId)).toBe(true);
    }
  });
});

describe("목록 안내 창 다시 시도", () => {
  it("첫 요청 502 → '다시 시도' 버튼 → 같은 쪽을 다시 받아 목록을 보여준다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [{ name: "가나병원", type: "병원", address: "경기도 부천시" }], totalCount: 1 }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PaginatedListModal<{ name: string; type: string; address: string }>
        provinceShortName="부천"
        totalCount={1}
        endpoint="/api/medical-list"
        params={{ sidoCd: "310000", sgguCd: "310303" }}
        filters={[{ label: "전체", value: "" }]}
        searchPlaceholder="검색"
        itemLabel="의료기관"
        renderItem={(item) => <span>{item.name}</span>}
        itemKey={(item) => item.name}
        dataSource="건강보험심사평가원"
      />,
    );

    const retry = await screen.findByRole("button", { name: "다시 시도" });
    expect(screen.getByRole("alert").textContent).toContain("불러오지 못했어요");
    fireEvent.click(retry);

    await waitFor(() => expect(screen.getByText("가나병원")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(fetchMock.mock.calls[1][0]);
    expect(screen.queryByRole("button", { name: "다시 시도" })).toBeNull();
  });
});
