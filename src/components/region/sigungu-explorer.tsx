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
 * 같은 시군구 데이터를 두 가지 방식(지도 / 카드 리스트)으로 보여준다.
 *
 * - 데스크탑(≥1024px): split view — 좌 지도 + 우 카드(검색·페이지네이션) 동시 노출, 토글 hide
 * - 모바일/태블릿(<1024px): 토글로 지도/카드 전환 (기본 map)
 * - 지도 데이터가 없는 시도는 카드 강제 (모바일에서도 토글 hide)
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

  // 카드 영역 (검색 + 리스트 + 페이지네이션) — 모바일/태블릿에서는 view===card 일 때만 보임,
  // 데스크탑(≥1024px)에서는 split layout으로 항상 노출.
  const cardSection = (
    <SigunguList provinceId={provinceId} sigungus={sigungus} compact />
  );

  // 지도 영역 — 모바일/태블릿에서는 view===map 일 때만 보임,
  // 데스크탑에서는 split layout으로 항상 노출.
  const mapSection = hasMap && mapData
    ? (
      <ProvinceMapWithToggle
        provinceId={provinceId}
        sigungus={mapData.sigungus}
        viewBox={mapData.viewBox}
        populationDensityMap={populationDensityMap}
        farmDensityMap={farmDensityMap}
      />
    )
    : null;

  return (
    <div className={s.wrap}>
      {/* 토글: 모바일/태블릿(<1024px) 전용. 데스크탑에서는 CSS로 hide */}
      {hasMap && (
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
      )}

      {/* 데스크탑(≥1024px) split: 두 영역 모두 노출. 모바일/태블릿: data-view 기준 한 영역만 노출 */}
      <div className={s.split} data-view={view}>
        {hasMap && <div className={s.mapPane}>{mapSection}</div>}
        <div className={s.cardPane}>{cardSection}</div>
      </div>
    </div>
  );
}
