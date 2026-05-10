"use client";

import { useState, useId } from "react";
import { Map, LayoutGrid } from "lucide-react";
import { ProvinceMapWithToggle } from "@/components/map/province-map-with-toggle";
import { SigunguList } from "@/app/regions/[id]/sigungu-list";
import type { SigunguMapLocation } from "@/lib/data/province-maps";
import s from "./sigungu-explorer.module.css";

interface SigunguItem {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  mainCrops: string[];
}

interface SigunguExplorerProps {
  provinceId: string;
  /** 검색·페이지네이션용 시군구 데이터 */
  sigungus: SigunguItem[];
  /** 지도 데이터 (없으면 카드 뷰로 강제) */
  mapData: {
    viewBox: string;
    sigungus: SigunguMapLocation[];
  } | null;
  /** 인구밀도 (명/km²) — sigunguId 키 */
  populationDensityMap: Record<string, number>;
  /** 농가밀도 (호/km²) — sigunguId 키 */
  farmDensityMap: Record<string, number>;
}

type View = "map" | "card";

/**
 * 시·군·구 통합 탐색 컴포넌트.
 * 같은 시군구 데이터를 두 가지 방식(지도 / 카드 리스트)으로 보여주는 view 토글을 제공한다.
 *
 * - 기본 뷰: map (시각적 인상 우선, 회장 결재)
 * - 지도 데이터가 없는 시도(혹시 모를 미생성 케이스)는 카드 강제
 * - 토글 상태는 클라이언트 한정 — URL 쿼리 사용 X (SSR로 map이 즉시 보여야 자연스러움)
 */
export function SigunguExplorer({
  provinceId,
  sigungus,
  mapData,
  populationDensityMap,
  farmDensityMap,
}: SigunguExplorerProps) {
  const hasMap = mapData !== null;
  const [view, setView] = useState<View>(hasMap ? "map" : "card");
  const groupId = useId();

  return (
    <div className={s.wrap}>
      <div
        className={s.viewToggle}
        role="radiogroup"
        aria-label="시·군·구 표시 방식"
      >
        <button
          type="button"
          role="radio"
          aria-checked={view === "map"}
          className={`${s.toggleBtn} ${view === "map" ? s.toggleBtnActive : ""}`}
          onClick={() => setView("map")}
          disabled={!hasMap}
          id={`${groupId}-map`}
        >
          <Map size={14} aria-hidden="true" />
          <span>지도</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={view === "card"}
          className={`${s.toggleBtn} ${view === "card" ? s.toggleBtnActive : ""}`}
          onClick={() => setView("card")}
          id={`${groupId}-card`}
        >
          <LayoutGrid size={14} aria-hidden="true" />
          <span>카드</span>
        </button>
      </div>

      {view === "map" && hasMap && mapData && (
        <ProvinceMapWithToggle
          provinceId={provinceId}
          sigungus={mapData.sigungus}
          viewBox={mapData.viewBox}
          populationDensityMap={populationDensityMap}
          farmDensityMap={farmDensityMap}
        />
      )}

      {view === "card" && (
        <SigunguList provinceId={provinceId} sigungus={sigungus} />
      )}
    </div>
  );
}
