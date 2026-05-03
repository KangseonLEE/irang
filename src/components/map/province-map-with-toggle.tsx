"use client";

import { useState, useId } from "react";
import { Users, Tractor } from "lucide-react";
import { ProvinceMap } from "./province-map";
import type { SigunguMapLocation } from "@/lib/data/province-maps";
import s from "./province-map-with-toggle.module.css";

interface ProvinceMapWithToggleProps {
  provinceId: string;
  sigungus: SigunguMapLocation[];
  viewBox: string;
  /** 인구밀도 (명/km²) — sigunguId 키 */
  populationDensityMap: Record<string, number>;
  /** 농가밀도 (호/km²) — sigunguId 키 */
  farmDensityMap: Record<string, number>;
}

type Mode = "population" | "farm";

/**
 * 시도 상세 페이지의 시군구 지도.
 * 인구밀도 ↔ 농가밀도 토글을 제공한다.
 */
export function ProvinceMapWithToggle({
  provinceId,
  sigungus,
  viewBox,
  populationDensityMap,
  farmDensityMap,
}: ProvinceMapWithToggleProps) {
  const [mode, setMode] = useState<Mode>("population");
  const groupId = useId();

  const hasFarmData = Object.keys(farmDensityMap).length > 0;
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
    <div className={s.wrapper}>
      <div
        className={s.toggleBar}
        role="radiogroup"
        aria-label="지도 표시 기준"
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === "population"}
          className={`${s.toggleBtn} ${mode === "population" ? s.toggleBtnActive : ""}`}
          onClick={() => setMode("population")}
          id={`${groupId}-pop`}
        >
          <Users size={14} aria-hidden="true" />
          <span>인구밀도</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "farm"}
          className={`${s.toggleBtn} ${mode === "farm" ? s.toggleBtnActive : ""}`}
          onClick={() => setMode("farm")}
          disabled={!hasFarmData}
          id={`${groupId}-farm`}
        >
          <Tractor size={14} aria-hidden="true" />
          <span>농가밀도</span>
        </button>
      </div>
      <ProvinceMap
        provinceId={provinceId}
        sigungus={sigungus}
        viewBox={viewBox}
        densityMap={activeMap}
        densityLabel={label}
        densityUnit={unit}
        densityFormat={format}
      />
    </div>
  );
}
