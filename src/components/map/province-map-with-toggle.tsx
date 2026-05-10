"use client";

import { ProvinceMap } from "./province-map";
import type { SigunguMapLocation } from "@/lib/data/province-maps";

export type DensityMode = "population" | "farm";

interface ProvinceMapWithToggleProps {
  provinceId: string;
  sigungus: SigunguMapLocation[];
  viewBox: string;
  /** 인구밀도 (명/km²) — sigunguId 키 */
  populationDensityMap: Record<string, number>;
  /** 농가밀도 (호/km²) — sigunguId 키 */
  farmDensityMap: Record<string, number>;
  /** 표시 모드 — 외부 controlled (SigunguExplorer가 관리) */
  mode: DensityMode;
}

/**
 * 시도 상세 페이지의 시군구 지도.
 * 모드 토글 UI는 부모(SigunguExplorer)가 렌더한다 — 뷰 토글과 한 줄 통합.
 */
export function ProvinceMapWithToggle({
  provinceId,
  sigungus,
  viewBox,
  populationDensityMap,
  farmDensityMap,
  mode,
}: ProvinceMapWithToggleProps) {
  const activeMap =
    mode === "farm" ? farmDensityMap : populationDensityMap;
  const label = mode === "farm" ? "농가밀도" : "인구밀도";
  const unit = mode === "farm" ? "호/km²" : "명/km²";
  const format = (v: number) =>
    mode === "farm"
      ? v >= 10
        ? Math.round(v).toLocaleString()
        : v.toFixed(1)
      : Math.round(v).toLocaleString();

  return (
    <ProvinceMap
      provinceId={provinceId}
      sigungus={sigungus}
      viewBox={viewBox}
      densityMap={activeMap}
      densityLabel={label}
      densityUnit={unit}
      densityFormat={format}
    />
  );
}
