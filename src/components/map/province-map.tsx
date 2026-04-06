"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SigunguMapLocation } from "@/lib/data/province-maps";
import { getSigunguBySidoAndId } from "@/lib/data/sigungus";
import { getDensityColor, getDensityRange } from "@/lib/map-utils";
import s from "./province-map.module.css";

interface ProvinceMapProps {
  /** 시/도 ID (예: "gangwon") — 라우팅 prefix */
  provinceId: string;
  /** 시군구 SVG 경계 데이터 */
  sigungus: SigunguMapLocation[];
  /** SVG viewBox (예: "0 0 800 666") */
  viewBox: string;
  /** 시군구별 인구밀도 (명/km²) — sigunguId 키 */
  densityMap?: Record<string, number>;
}

/**
 * 시/도 상세 페이지용 시군구 인터랙티브 지도.
 * 대한민국 전체 지도(KoreaMap)와 동일한 호버/클릭/툴팁 패턴.
 * densityMap이 주어지면 인구밀도 기반 Choropleth 색상을 적용한다.
 */
export function ProvinceMap({
  provinceId,
  sigungus,
  viewBox,
  densityMap,
}: ProvinceMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // 밀도 판단 (20개 이상이면 라벨 작게)
  const isDense = sigungus.length >= 20;

  // 밀도 색상 계산 (sigunguId → fill color)
  const densityColors = useMemo(() => {
    if (!densityMap || Object.keys(densityMap).length === 0) return null;
    const { min, max } = getDensityRange(densityMap);
    const colors: Record<string, string> = {};
    for (const sg of sigungus) {
      const density = densityMap[sg.sigunguId];
      if (density != null) {
        colors[sg.sigunguId] = getDensityColor(density, min, max);
      }
    }
    return colors;
  }, [densityMap, sigungus]);

  const handleClick = useCallback(
    (sigunguId: string) => {
      router.push(`/regions/${provinceId}/${sigunguId}`);
    },
    [router, provinceId]
  );

  const handleMouseEnter = useCallback(
    (sigunguId: string) => {
      setHoveredId(sigunguId);
      router.prefetch(`/regions/${provinceId}/${sigunguId}`);
    },
    [router, provinceId]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltipPos(null);
  }, []);

  // 시군구 ID → 상세 데이터 매핑 (라벨 shortName + 호버 툴팁용)
  const sigunguMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSigunguBySidoAndId>>();
    for (const sg of sigungus) {
      map.set(sg.sigunguId, getSigunguBySidoAndId(provinceId, sg.sigunguId));
    }
    return map;
  }, [sigungus, provinceId]);

  // 호버된 시군구 데이터
  const hoveredSigungu = hoveredId ? sigunguMap.get(hoveredId) ?? null : null;

  // 호버된 시군구의 밀도 값
  const hoveredDensity = useMemo(() => {
    if (!hoveredId || !densityMap) return null;
    return densityMap[hoveredId] ?? null;
  }, [hoveredId, densityMap]);

  return (
    <div className={s.mapContainer} ref={containerRef}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        className={s.svg}
        role="img"
        aria-label="시군구 지도 — 인구밀도 기준 색상"
      >
        {/* 시군구 paths */}
        {sigungus.map((sg) => {
          const isActive = hoveredId === sg.sigunguId;
          const densityFill = densityColors?.[sg.sigunguId];
          return (
            <path
              key={sg.sigunguId}
              d={sg.path}
              className={`${s.region} ${isActive ? s.regionActive : ""}`}
              style={
                densityFill && !isActive
                  ? ({ "--density-fill": densityFill } as React.CSSProperties)
                  : undefined
              }
              onClick={() => handleClick(sg.sigunguId)}
              onMouseEnter={() => handleMouseEnter(sg.sigunguId)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`${sg.name} 상세 보기`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(sg.sigunguId);
                }
              }}
            />
          );
        })}

        {/* 라벨 */}
        {sigungus.map((sg) => {
          const isActive = hoveredId === sg.sigunguId;
          const sigunguData = sigunguMap.get(sg.sigunguId);
          const label = sigunguData?.shortName ?? sg.name.replace(/(시|군|구)$/, "");
          return (
            <text
              key={`label-${sg.sigunguId}`}
              x={sg.labelX}
              y={sg.labelY}
              className={`${s.label} ${isDense ? s.labelDense : ""} ${isActive ? s.labelActive : ""}`}
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* 밀도 범례 */}
      {densityMap && Object.keys(densityMap).length > 0 && (
        <div className={s.legend}>
          <span className={s.legendLabel}>낮음</span>
          <div className={s.legendBar} />
          <span className={s.legendLabel}>높음</span>
          <span className={s.legendCaption}>인구밀도 (명/km²)</span>
        </div>
      )}

      {/* 호버 툴팁 */}
      {hoveredSigungu && tooltipPos && (
        <div
          className={s.tooltip}
          style={{ left: tooltipPos.x, top: tooltipPos.y + 16 }}
        >
          <span className={s.tooltipName}>{hoveredSigungu.name}</span>
          <span className={s.tooltipDesc}>{hoveredSigungu.description}</span>
          {hoveredDensity !== null && (
            <span className={s.tooltipDensity}>
              인구밀도 {Math.round(hoveredDensity).toLocaleString()}명/km²
            </span>
          )}
          {hoveredSigungu.highlights.length > 0 && (
            <div className={s.tooltipTags}>
              {hoveredSigungu.highlights.slice(0, 3).map((tag) => (
                <span key={tag} className={s.tooltipTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {hoveredSigungu.mainCrops.length > 0 && (
            <span className={s.tooltipCrops}>
              🌱 {hoveredSigungu.mainCrops.slice(0, 3).join(" · ")}
            </span>
          )}
          <span className={s.tooltipHint}>클릭하여 자세히 보기</span>
        </div>
      )}
    </div>
  );
}
