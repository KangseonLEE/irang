import { describe, it, expect } from "vitest";

import { PROVINCES } from "@/lib/data/regions";
import {
  PROVINCE_SSOT_NAMES,
  NATIONWIDE,
  normalizeRegion,
  mapAreaName,
  isSsotRegion,
  regionLabel,
} from "@/lib/region-normalize";
import * as denoRegion from "../../supabase/functions/_shared/region";
import {
  DB_REGION_VALUES,
  SOURCE_REGION_SAMPLES,
} from "./fixtures/db-region-values";

describe("region-normalize — SSOT 정합", () => {
  it("PROVINCE_SSOT_NAMES가 PROVINCES.name과 1:1로 일치한다", () => {
    expect([...PROVINCE_SSOT_NAMES].sort()).toEqual(
      PROVINCES.map((p) => p.name).sort(),
    );
  });

  it("신표기(강원특별자치도·전북특별자치도)는 SSOT에 존재하지 않는다", () => {
    const names = PROVINCES.map((p) => p.name);
    expect(names).not.toContain("강원특별자치도");
    expect(names).not.toContain("전북특별자치도");
  });

  it("모든 시·도 정식 명칭·약칭이 자기 자신으로 귀결된다", () => {
    for (const p of PROVINCES) {
      expect(normalizeRegion(p.name).region).toBe(p.name);
      expect(normalizeRegion(p.shortName).region).toBe(p.name);
    }
  });
});

describe("region-normalize — DB 실측 값 전수", () => {
  it("2026-09-29 DB distinct region 78종이 전부 SSOT로 귀결된다", () => {
    const offenders: string[] = [];
    for (const [raw] of DB_REGION_VALUES) {
      const { region } = normalizeRegion(raw);
      if (!isSsotRegion(region)) offenders.push(`${raw} → ${region}`);
    }
    expect(offenders).toEqual([]);
  });

  it("'시도 시군' 복합 표기는 시·도로 정규화하고 시·군을 보존한다", () => {
    expect(normalizeRegion("전북 진안")).toEqual({
      region: "전라북도",
      sigungu: "진안",
      matched: true,
    });
    expect(normalizeRegion("전남 해남")).toEqual({
      region: "전라남도",
      sigungu: "해남",
      matched: true,
    });
    expect(normalizeRegion("경기 양평")).toEqual({
      region: "경기도",
      sigungu: "양평",
      matched: true,
    });
  });

  it("DB 값 중 시·군 정보가 있던 행은 sigungu가 채워진다", () => {
    const withSigungu = DB_REGION_VALUES.filter(([raw]) => raw.includes(" "));
    expect(withSigungu.length).toBeGreaterThan(0);
    for (const [raw] of withSigungu) {
      expect(normalizeRegion(raw).sigungu).not.toBeNull();
    }
  });
});

describe("region-normalize — 외부 수집 소스 표기", () => {
  it.each(SOURCE_REGION_SAMPLES)(
    "%s → %s / %s",
    (raw, expectedRegion, expectedSigungu) => {
      const got = normalizeRegion(raw);
      expect(got.region).toBe(expectedRegion);
      expect(got.sigungu).toBe(expectedSigungu);
    },
  );

  it("전남광주통합특별시는 뒤따르는 자치구 여부로 전남·광주를 가른다", () => {
    for (const gu of ["동구", "서구", "남구", "북구", "광산구"]) {
      expect(normalizeRegion(`전남광주통합특별시 ${gu}`).region).toBe("광주광역시");
    }
    for (const sgg of ["해남군", "순천시", "나주시"]) {
      expect(normalizeRegion(`전남광주통합특별시 ${sgg}`).region).toBe("전라남도");
    }
  });

  it("경기 광주시는 광주광역시로 새지 않는다", () => {
    expect(normalizeRegion("경기 광주시")).toEqual({
      region: "경기도",
      sigungu: "광주시",
      matched: true,
    });
  });

  it("알 수 없는 값은 원문 통과가 아니라 전국 버킷으로 떨어진다", () => {
    for (const raw of ["몰라요", "ABC", "테스트지역"]) {
      const got = normalizeRegion(raw);
      expect(got.region).toBe(NATIONWIDE);
      expect(got.matched).toBe(false);
      expect(isSsotRegion(got.region)).toBe(true);
    }
  });

  it("주소 뒤에 더 붙는 읍·면 토큰은 시·군·구로 오인하지 않는다", () => {
    // 실제 주소는 시·군·구가 먼저 오므로, 접미사 없는 토큰 뒤에 주소가 더 있으면 읍·면 이하다.
    expect(normalizeRegion("경기 공도읍 대신두길 13").sigungu).toBeNull();
    expect(normalizeRegion("서울 역삼동 123-4").sigungu).toBeNull();
    // 반대로 남은 토큰이 하나뿐이면 "안동"·"정읍"처럼 시·군 약칭으로 본다.
    expect(normalizeRegion("경북 안동").sigungu).toBe("안동");
    expect(normalizeRegion("전북 정읍").sigungu).toBe("정읍");
    expect(normalizeRegion("충북 영동").sigungu).toBe("영동");
  });

  it("regionLabel은 시·군이 있을 때만 붙인다", () => {
    expect(regionLabel("전라북도", "진안")).toBe("전라북도 진안");
    expect(regionLabel("전국", null)).toBe("전국");
  });

  it("mapAreaName은 항상 SSOT 값을 돌려준다 (기존 호출부 호환)", () => {
    expect(mapAreaName("전남")).toBe("전라남도");
    expect(mapAreaName("강원특별자치도")).toBe("강원도");
    expect(mapAreaName("전국")).toBe("전국");
    expect(isSsotRegion(mapAreaName("아무값"))).toBe(true);
  });
});

describe("region-normalize — Deno 미러 패리티", () => {
  const corpus = [
    ...DB_REGION_VALUES.map(([raw]) => raw),
    ...SOURCE_REGION_SAMPLES.map(([raw]) => raw),
    ...PROVINCES.flatMap((p) => [p.name, p.shortName]),
    "전남광주통합특별시 광산구",
    "전남광주통합특별시 해남군",
    "경기 광주시",
    "비대면",
    "몰라요",
    "",
    "  전북   진안  ",
  ];

  it("Deno 미러(supabase/functions/_shared/region.ts)가 동일 결과를 낸다", () => {
    for (const raw of corpus) {
      expect({ raw, ...denoRegion.normalizeRegion(raw) }).toEqual({
        raw,
        ...normalizeRegion(raw),
      });
    }
  });

  it("두 구현의 SSOT 이름 목록이 같다", () => {
    expect([...denoRegion.PROVINCE_SSOT_NAMES]).toEqual([...PROVINCE_SSOT_NAMES]);
    expect(denoRegion.NATIONWIDE).toBe(NATIONWIDE);
  });
});
