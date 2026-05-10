"use client";

import { useState, useId } from "react";
import { Map, LayoutGrid, Users, Tractor } from "lucide-react";
import {
  ProvinceMapWithToggle,
  type DensityMode,
} from "@/components/map/province-map-with-toggle";
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
 * - 데스크탑(≥1024px): split view — 좌 지도 + 우 카드(검색·페이지네이션) 동시 노출
 *   - 뷰 토글은 hide. 밀도 토글만 노출.
 * - 모바일/태블릿(<1024px): 토글 row로 지도/카드 + 인구/농가 한 줄에 표시
 *   - 카드 뷰 진입 시 밀도 토글 자동 hide (지도가 없으니 의미 없음)
 *   - state는 보존되어 지도 뷰 복귀 시 마지막 모드 유지
 * - 지도 데이터가 없는 시도는 카드 강제 (모바일·데스크탑 모두 토글 row hide)
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
  const [densityMode, setDensityMode] = useState<DensityMode>("population");
  const groupId = useId();
  const hasFarmData = Object.keys(farmDensityMap).length > 0;

  // 카드 영역 (검색 + 리스트 + 페이지네이션) — 모바일/태블릿에서는 view===card 일 때만 보임,
  // 데스크탑(≥1024px)에서는 split layout으로 항상 노출.
  const cardSection = (
    <SigunguList provinceId={provinceId} sigungus={sigungus} compact />
  );

  // 지도 영역 — 모바일/태블릿에서는 view===map 일 때만 보임,
  // 데스크탑에서는 split layout으로 항상 노출.
  const mapSection =
    hasMap && mapData ? (
      <ProvinceMapWithToggle
        provinceId={provinceId}
        sigungus={mapData.sigungus}
        viewBox={mapData.viewBox}
        populationDensityMap={populationDensityMap}
        farmDensityMap={farmDensityMap}
        mode={densityMode}
      />
    ) : null;

  // 밀도 토글 노출 여부:
  // - 데스크탑: 항상 노출 (split이라 지도 뷰가 항상 있음)
  // - 모바일/태블릿: 지도 뷰일 때만 노출. 카드 뷰는 hide.
  // - CSS 미디어쿼리로 데스크탑 노출 처리 — 여기서는 모바일/태블릿 기준의 hide flag만 결정.
  const densityHiddenOnMobile = view === "card";

  return (
    <div className={s.wrap}>
      {/* 컨트롤 row — 모바일/태블릿(<1024px) 전용. 데스크탑에서는 CSS로 hide */}
      {hasMap && (
        <div className={s.controlRow}>
          {/* 좌측: 뷰 토글 — 데스크탑은 hide */}
          <div
            className={`${s.toggle} ${s.viewToggle}`}
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

          {/* 우측: 밀도 토글 — 카드 뷰일 때 모바일에서 hide, 데스크탑은 항상 노출 */}
          <div
            className={`${s.toggle} ${s.densityToggle} ${
              densityHiddenOnMobile ? s.densityHiddenOnMobile : ""
            }`}
            role="radiogroup"
            aria-label="지도 표시 기준"
            aria-hidden={densityHiddenOnMobile ? "true" : undefined}
          >
            <button
              type="button"
              role="radio"
              aria-checked={densityMode === "population"}
              className={`${s.toggleBtn} ${
                densityMode === "population" ? s.toggleBtnActive : ""
              }`}
              onClick={() => setDensityMode("population")}
              id={`${groupId}-pop`}
              tabIndex={densityHiddenOnMobile ? -1 : 0}
            >
              <Users size={14} aria-hidden="true" />
              <span>인구</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={densityMode === "farm"}
              className={`${s.toggleBtn} ${
                densityMode === "farm" ? s.toggleBtnActive : ""
              }`}
              onClick={() => setDensityMode("farm")}
              disabled={!hasFarmData}
              id={`${groupId}-farm`}
              tabIndex={densityHiddenOnMobile ? -1 : 0}
            >
              <Tractor size={14} aria-hidden="true" />
              <span>농가</span>
            </button>
          </div>
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
