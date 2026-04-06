"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAP_LOCATIONS,
  KOREA_MAP_VIEWBOX,
  SVG_TO_PROVINCE_ID,
  SVG_ID_LABELS,
} from "@/lib/data/korea-map";
import { PROVINCES } from "@/lib/data/regions";
import { getDensityColor, getDensityRange } from "@/lib/map-utils";
import s from "./korea-map.module.css";

/**
 * 각 SVG 지역의 라벨 위치 (viewBox 115 0 450 760 기준 좌표)
 * 본토 최대 sub-path의 bounding-box centroid 기반 + 겹침 방지 수동 보정
 */
const LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
  // ── 수도권 (겹침 방지 수동 보정) ──
  seoul: { x: 259, y: 146 },
  gyeonggi: { x: 305, y: 178 },    // 서울 우하단, 경기 본토 중심
  incheon: { x: 218, y: 165 },     // bbox 중앙(227,156)에서 서울과 간격 확보
  // ── 나머지: bbox 정중앙 그대로 ──
  gangwon: { x: 398, y: 110 },
  "north-chungcheong": { x: 340, y: 260 },
  sejong: { x: 291, y: 283 },
  daejeon: { x: 306, y: 315 },
  "south-chungcheong": { x: 248, y: 290 },
  "north-jeolla": { x: 279, y: 399 },
  gwangju: { x: 241, y: 478 },
  "south-jeolla": { x: 257, y: 515 },
  "north-gyeongsang": { x: 450, y: 311 },
  daegu: { x: 435, y: 387 },
  "south-gyeongsang": { x: 418, y: 453 },
  busan: { x: 492, y: 469 },
  ulsan: { x: 510, y: 426 },
  jeju: { x: 207, y: 723 },
};

interface KoreaMapProps {
  /** 외부에서 선택된 province ID (하이라이트용) */
  selectedProvinceId?: string | null;
  /** 호버 시 콜백 (province ID) */
  onHover?: (provinceId: string | null) => void;
  /** 시/도별 인구밀도 (명/km²) — provinceId 키 */
  densityMap?: Record<string, number>;
  /** 지도 하단 범례 표시 여부 (기본 true) */
  showLegend?: boolean;
}

export function KoreaMap({ selectedProvinceId, onHover, densityMap, showLegend = true }: KoreaMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSvgId, setHoveredSvgId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // province ID → SVG ID 역매핑 (하이라이트용)
  const provinceToSvgIds = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [svgId, provId] of Object.entries(SVG_TO_PROVINCE_ID)) {
      if (!map[provId]) map[provId] = [];
      map[provId].push(svgId);
    }
    return map;
  }, []);

  // 밀도 색상 계산 (svgId → fill color)
  const densityColors = useMemo(() => {
    if (!densityMap || Object.keys(densityMap).length === 0) return null;
    const { min, max } = getDensityRange(densityMap);
    const colors: Record<string, string> = {};
    for (const [svgId, provId] of Object.entries(SVG_TO_PROVINCE_ID)) {
      const density = densityMap[provId];
      if (density != null) {
        colors[svgId] = getDensityColor(density, min, max);
      }
    }
    return colors;
  }, [densityMap]);

  const handleClick = useCallback(
    (svgId: string) => {
      const provinceId = SVG_TO_PROVINCE_ID[svgId];
      if (provinceId) {
        router.push(`/regions/${provinceId}`);
      }
    },
    [router]
  );

  const handleMouseEnter = useCallback(
    (svgId: string) => {
      setHoveredSvgId(svgId);
      const provinceId = SVG_TO_PROVINCE_ID[svgId];
      onHover?.(provinceId ?? null);
      // 호버 시 상세 페이지 프리페치 — 클릭 시 즉시 전환
      if (provinceId) {
        router.prefetch(`/regions/${provinceId}`);
      }
    },
    [onHover, router]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredSvgId(null);
    setTooltipPos(null);
    onHover?.(null);
  }, [onHover]);

  // 현재 하이라이트해야 할 SVG ID 목록
  const highlightedSvgIds = useMemo(() => {
    const ids = new Set<string>();

    // 호버된 지역 + 같은 province에 속한 지역들
    if (hoveredSvgId) {
      const provId = SVG_TO_PROVINCE_ID[hoveredSvgId];
      if (provId && provinceToSvgIds[provId]) {
        provinceToSvgIds[provId].forEach((id) => ids.add(id));
      }
    }

    // 외부 선택된 province ID에 속한 지역들
    if (selectedProvinceId && provinceToSvgIds[selectedProvinceId]) {
      provinceToSvgIds[selectedProvinceId].forEach((id) => ids.add(id));
    }

    return ids;
  }, [hoveredSvgId, selectedProvinceId, provinceToSvgIds]);

  // 호버된 지역의 province 정보
  const hoveredProvince = useMemo(() => {
    if (!hoveredSvgId) return null;
    const provId = SVG_TO_PROVINCE_ID[hoveredSvgId];
    return PROVINCES.find((p) => p.id === provId) ?? null;
  }, [hoveredSvgId]);

  // 호버된 지역의 밀도 값
  const hoveredDensity = useMemo(() => {
    if (!hoveredProvince || !densityMap) return null;
    return densityMap[hoveredProvince.id] ?? null;
  }, [hoveredProvince, densityMap]);

  return (
    <div className={s.mapContainer} ref={containerRef}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={KOREA_MAP_VIEWBOX}
        className={s.svg}
        role="img"
        aria-label="대한민국 지역 지도 — 인구밀도 기준 색상"
      >
        {/* 지역 path들 */}
        {MAP_LOCATIONS.map((loc) => {
          const isHighlighted = highlightedSvgIds.has(loc.svgId);
          const densityFill = densityColors?.[loc.svgId];
          return (
            <path
              key={loc.svgId}
              d={loc.path}
              className={`${s.region} ${isHighlighted ? s.regionActive : ""}`}
              style={
                densityFill && !isHighlighted
                  ? ({ "--density-fill": densityFill } as React.CSSProperties)
                  : undefined
              }
              onClick={() => handleClick(loc.svgId)}
              onMouseEnter={() => handleMouseEnter(loc.svgId)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`${SVG_ID_LABELS[loc.svgId]} 지역 보기`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(loc.svgId);
                }
              }}
            />
          );
        })}

        {/* 지역 라벨 */}
        {MAP_LOCATIONS.map((loc) => {
          const pos = LABEL_POSITIONS[loc.svgId];
          if (!pos) return null;
          const isHighlighted = highlightedSvgIds.has(loc.svgId);
          return (
            <text
              key={`label-${loc.svgId}`}
              x={pos.x}
              y={pos.y}
              className={`${s.label} ${isHighlighted ? s.labelActive : ""}`}
              pointerEvents="none"
            >
              {SVG_ID_LABELS[loc.svgId]}
            </text>
          );
        })}
      </svg>

      {/* 밀도 범례 */}
      {showLegend && densityMap && Object.keys(densityMap).length > 0 && (
        <div className={s.legend}>
          <span className={s.legendLabel}>낮음</span>
          <div className={s.legendBar} />
          <span className={s.legendLabel}>높음</span>
          <span className={s.legendCaption}>인구밀도 (명/km²)</span>
        </div>
      )}

      {/* 호버 툴팁 — 마우스 위치 아래에 표시 */}
      {hoveredProvince && tooltipPos && (
        <div
          className={s.tooltip}
          style={{ left: tooltipPos.x, top: tooltipPos.y + 16 }}
        >
          <span className={s.tooltipName}>{hoveredProvince.shortName}</span>
          <span className={s.tooltipDesc}>{hoveredProvince.description}</span>
          {hoveredDensity !== null && (
            <span className={s.tooltipDensity}>
              인구밀도 {Math.round(hoveredDensity).toLocaleString()}명/km²
            </span>
          )}
          <span className={s.tooltipHint}>클릭하여 자세히 보기</span>
        </div>
      )}
    </div>
  );
}
