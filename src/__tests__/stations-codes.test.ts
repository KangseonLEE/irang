/**
 * 관측소 표(stations.ts)의 시·도 코드 = 시·도 표(PROVINCES) — 10/7 전수 대조
 *
 * 강원·경남·경북·제주 교육청 코드와 대구 심평원 코드가 다른 시·도 것으로 들어가 /regions/compare 인프라가
 * 강원 춘천 학교 0개교·경북 영주 학교 0개교·대구 수성 의료기관 0개소로 나왔다. 비교 화면은 이제 PROVINCES 코드를
 * 쓰지만, 두 표가 다시 갈라지지 않게 같은지 본다.
 */

import { describe, expect, it } from "vitest";

import { PROVINCES } from "@/lib/data/regions";
import { STATIONS } from "@/lib/data/stations";
import { hiraCountRequests } from "@/lib/api/hira";

describe("관측소 표 ↔ 시·도 표 코드", () => {
  for (const st of STATIONS) {
    it(`${st.stnId} ${st.name}`, () => {
      const p = PROVINCES.find((x) => x.name === st.province);
      expect(p, st.province).toBeDefined();
      expect([st.sgisCode, st.hiraSidoCd, st.eduCode]).toEqual([p!.sgisCode, p!.hiraSidoCd, p!.eduCode]);
    });
  }

  it("시·도마다 대표 관측소가 그 시·도 관측소다", () => {
    for (const p of PROVINCES) {
      const st = STATIONS.find((s) => s.stnId === p.representativeStationId);
      expect(st?.province, p.id).toBe(p.name);
    }
  });
});

describe("hiraCountRequests — 앱이 심평원에 보내는 요청 묶음 (프록시 예열 목록)", () => {
  it("광주 = 통합 코드 아래 5구, 전남 = 통합 전체 + 광주 5구(빼기용), 세종 = 410000, 그 밖 = 시·도 그대로", () => {
    expect(hiraCountRequests("240000").map((r) => `${r.sidoCd}:${r.sgguCd}`)).toEqual([
      "360000:360801", "360000:360802", "360000:360803", "360000:360804", "360000:360805",
    ]);
    expect(hiraCountRequests("360000")).toHaveLength(6);
    expect(hiraCountRequests("290000")).toEqual([{ sidoCd: "410000" }]);
    expect(hiraCountRequests("230000")).toEqual([{ sidoCd: "230000" }]);
  });

  it("구가 있는 시는 구 전부, 시 아래 구 상세(single)는 그 구 하나", () => {
    expect(hiraCountRequests("310000", "310604")).toHaveLength(4);
    expect(hiraCountRequests("310000", "310604", { single: true })).toEqual([{ sidoCd: "310000", sgguCd: "310604" }]);
    expect(hiraCountRequests("310000", "312504")).toHaveLength(5); // 화성 시 단위 + 4구
  });
});

describe("seoulAreaCompare — 작은 구가 '0.0배'로 보이지 않는다", () => {
  it("서울보다 크면 배, 작으면 %, 1% 미만은 '1% 미만'", async () => {
    const { seoulAreaCompare } = await import("@/lib/format");
    expect(seoulAreaCompare(614.06)).toEqual({ ratio: "약 1.0배", sentence: "서울의 약 1.0배" });
    expect(seoulAreaCompare(22.4)).toEqual({ ratio: "약 4%", sentence: "서울 면적의 약 4%" });
    expect(seoulAreaCompare(125.82).sentence).toBe("서울 면적의 약 21%");
    expect(seoulAreaCompare(2.83).sentence).toBe("서울 면적의 1% 미만");
  });
});
