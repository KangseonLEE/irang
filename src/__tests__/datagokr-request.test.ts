import { describe, it, expect } from "vitest";
import { buildDataGoKrRequest, isDataGoKrProxied } from "@/lib/api/_datagokr";

/**
 * 8/30 data.go.kr 프록시 스위치 — 프록시 env가 있으면 Worker로, 없으면 직접 호출(키 포함).
 * 키가 프록시 URL에 새지 않는 것이 핵심 계약.
 */
const PATH = "1360000/AsosDalyInfoService/getWthrDataList";

describe("buildDataGoKrRequest", () => {
  it("프록시 env가 있으면 Worker URL + 시크릿 헤더, serviceKey 없음", () => {
    const req = buildDataGoKrRequest(PATH, { stnIds: "108", numOfRows: "1" }, {
      DATA_GO_KR_PROXY_URL: "https://irang-proxy.example.workers.dev/",
      DATA_GO_KR_PROXY_SECRET: "s3cret",
      DATA_GO_KR_API_KEY: "REALKEY",
    });
    expect(req?.url).toBe("https://irang-proxy.example.workers.dev/proxy/" + PATH + "?stnIds=108&numOfRows=1");
    expect(req?.url).not.toContain("REALKEY");
    expect(req?.headers).toEqual({ "x-irang-proxy-secret": "s3cret" });
  });

  it("프록시 env가 없으면 직접 호출 + serviceKey", () => {
    const req = buildDataGoKrRequest(PATH, { stnIds: "108" }, { DATA_GO_KR_API_KEY: "REALKEY" });
    expect(req?.url).toBe("https://apis.data.go.kr/" + PATH + "?serviceKey=REALKEY&stnIds=108");
    expect(req?.headers).toEqual({});
  });

  it("프록시 URL만 있고 시크릿이 없으면 직접 호출로 폴백, 키도 없으면 null", () => {
    expect(buildDataGoKrRequest(PATH, {}, { DATA_GO_KR_PROXY_URL: "https://x.workers.dev" })).toBeNull();
    expect(isDataGoKrProxied({ DATA_GO_KR_PROXY_URL: "https://x.workers.dev" })).toBe(false);
    expect(isDataGoKrProxied({ DATA_GO_KR_PROXY_URL: "https://x.workers.dev", DATA_GO_KR_PROXY_SECRET: "s" })).toBe(true);
  });
});
