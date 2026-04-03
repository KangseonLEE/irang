"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAP_LOCATIONS,
  KOREA_MAP_VIEWBOX,
  SVG_TO_PROVINCE_ID,
  SVG_ID_LABELS,
} from "@/lib/data/korea-map";
import { PROVINCES } from "@/lib/data/regions";
import s from "./korea-map.module.css";

/**
 * 각 SVG 지역의 라벨 위치 (viewBox 기준 좌표)
 * - SVG path의 시각적 중심에 맞춰 수동 조정
 */
const LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
  seoul: { x: 154, y: 129 },
  gyeonggi: { x: 155, y: 185 },
  incheon: { x: 100, y: 160 },
  gangwon: { x: 276, y: 109 },
  "north-chungcheong": { x: 245, y: 235 },
  sejong: { x: 177, y: 250 },
  daejeon: { x: 192, y: 274 },
  "south-chungcheong": { x: 135, y: 268 },
  "north-jeolla": { x: 168, y: 345 },
  gwangju: { x: 140, y: 408 },
  "south-jeolla": { x: 140, y: 460 },
  "north-gyeongsang": { x: 340, y: 270 },
  daegu: { x: 301, y: 335 },
  "south-gyeongsang": { x: 290, y: 400 },
  busan: { x: 355, y: 410 },
  ulsan: { x: 364, y: 365 },
  jeju: { x: 111, y: 609 },
};

interface KoreaMapProps {
  /** 외부에서 선택된 province ID (하이라이트용) */
  selectedProvinceId?: string | null;
  /** 호버 시 콜백 (province ID) */
  onHover?: (provinceId: string | null) => void;
}

export function KoreaMap({ selectedProvinceId, onHover }: KoreaMapProps) {
  const router = useRouter();
  const [hoveredSvgId, setHoveredSvgId] = useState<string | null>(null);

  // province ID → SVG ID 역매핑 (하이라이트용)
  const provinceToSvgIds = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [svgId, provId] of Object.entries(SVG_TO_PROVINCE_ID)) {
      if (!map[provId]) map[provId] = [];
      map[provId].push(svgId);
    }
    return map;
  }, []);

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
    },
    [onHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredSvgId(null);
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

  return (
    <div className={s.mapContainer}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={KOREA_MAP_VIEWBOX}
        className={s.svg}
        role="img"
        aria-label="대한민국 지역 지도"
      >
        {/* 지역 path들 */}
        {MAP_LOCATIONS.map((loc) => {
          const isHighlighted = highlightedSvgIds.has(loc.svgId);
          return (
            <path
              key={loc.svgId}
              d={loc.path}
              className={`${s.region} ${isHighlighted ? s.regionActive : ""}`}
              onClick={() => handleClick(loc.svgId)}
              onMouseEnter={() => handleMouseEnter(loc.svgId)}
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

      {/* 호버 툴팁 */}
      {hoveredProvince && (
        <div className={s.tooltip}>
          <span className={s.tooltipName}>{hoveredProvince.shortName}</span>
          <span className={s.tooltipDesc}>{hoveredProvince.description}</span>
          <span className={s.tooltipHint}>클릭하여 자세히 보기</span>
        </div>
      )}
    </div>
  );
}
