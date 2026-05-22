"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SigunguMapLocation } from "@/lib/data/province-maps";
import { getSigunguBySidoAndId } from "@/lib/data/sigungus";
import { getEnrichedHighlights } from "@/lib/data/popular-tags";
import { getDensityColor, getDensityRange } from "@/lib/map-utils";
import s from "./province-map.module.css";

/**
 * 본토와 떨어진 도서 시군구 ID — 본토 viewBox에서 제외하고 별도 inset으로 표시.
 * 본토만 viewBox에 잡혀 본토 시·군이 크게 보임.
 * 5/10 추가: 경북 울릉도가 viewBox를 800까지 늘려 본토가 작게 보이는 이슈.
 * 5/22 추가: 전남 신안군이 다도해 1004개 섬으로 viewBox 좌측 광역 차지 → 본토 축소 (회장 라이브 발견).
 */
const ISLAND_SIGUNGUS: Record<string, ReadonlySet<string>> = {
  gyeongbuk: new Set(["ulleung"]),
  jeonnam: new Set(["sinan"]),
  // TODO: 다른 시·도 도서 점검 후 추가 (인천 옹진·강화, 충남 태안 도서 등)
};

/** SVG path "d" 문자열에서 모든 (x, y) 좌표 페어 추출 */
function extractPathCoords(d: string): Array<{ x: number; y: number }> {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers) return [];
  const coords: Array<{ x: number; y: number }> = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const x = parseFloat(numbers[i]);
    const y = parseFloat(numbers[i + 1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      coords.push({ x, y });
    }
  }
  return coords;
}

/** 시군구 path 모음의 bounding box 계산 */
function computeBoundingBox(items: SigunguMapLocation[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const item of items) {
    for (const c of extractPathCoords(item.path)) {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.x > maxX) maxX = c.x;
      if (c.y > maxY) maxY = c.y;
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

interface ProvinceMapProps {
  /** 시/도 ID (예: "gangwon") — 라우팅 prefix */
  provinceId: string;
  /** 시군구 SVG 경계 데이터 */
  sigungus: SigunguMapLocation[];
  /** SVG viewBox (예: "0 0 800 666") */
  viewBox: string;
  /** 시군구별 밀도 값 — sigunguId 키 */
  densityMap?: Record<string, number>;
  /** 범례·툴팁 라벨 (기본: "인구밀도") */
  densityLabel?: string;
  /** 단위 (기본: "명/km²") */
  densityUnit?: string;
  /** 값 포맷터 (기본: 정수 + 천 단위 콤마) */
  densityFormat?: (value: number) => string;
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
  densityLabel = "인구밀도",
  densityUnit = "명/km²",
  densityFormat,
}: ProvinceMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // 본토와 도서 분리 — 도서는 SVG에서 빼고 별도 hint 칩으로 표시
  const islandIds = ISLAND_SIGUNGUS[provinceId] ?? null;
  const mainSigungus = useMemo(
    () => (islandIds ? sigungus.filter((sg) => !islandIds.has(sg.sigunguId)) : sigungus),
    [sigungus, islandIds],
  );
  const islandSigungus = useMemo(
    () => (islandIds ? sigungus.filter((sg) => islandIds.has(sg.sigunguId)) : []),
    [sigungus, islandIds],
  );

  // 본토 bounding box로 viewBox 동적 계산 — 본토 시·군이 크게 보임
  const computedViewBox = useMemo(() => {
    if (islandSigungus.length === 0) return viewBox;
    const bb = computeBoundingBox(mainSigungus);
    if (!bb) return viewBox;
    const w = bb.maxX - bb.minX;
    const h = bb.maxY - bb.minY;
    const pad = Math.max(w, h) * 0.05; // 5% 패딩
    return `${bb.minX - pad} ${bb.minY - pad} ${w + pad * 2} ${h + pad * 2}`;
  }, [mainSigungus, islandSigungus, viewBox]);

  // 밀도 판단 (20개 이상이면 라벨 작게) — 본토 기준
  const isDense = mainSigungus.length >= 20;

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
  // 도서 포함 — 호버 시 데이터 조회용
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
        viewBox={computedViewBox}
        className={s.svg}
        role="img"
        aria-label="시군구 지도 — 인구밀도 기준 색상"
      >
        {/* 시군구 paths — 본토만. 도서는 별도 칩으로 표시 */}
        {mainSigungus.map((sg) => {
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

        {/* 라벨 — 본토만 */}
        {mainSigungus.map((sg) => {
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

      {/* 도서 안내 칩 — 본토 viewBox에서 빠진 도서 시·군 (예: 울릉도) */}
      {islandSigungus.length > 0 && (
        <div className={s.islandsHint}>
          <span className={s.islandsLabel}>이 지역의 섬:</span>
          {islandSigungus.map((sg) => (
            <button
              key={sg.sigunguId}
              type="button"
              className={s.islandChip}
              onClick={() => handleClick(sg.sigunguId)}
              onMouseEnter={() => handleMouseEnter(sg.sigunguId)}
            >
              {sg.name}
            </button>
          ))}
        </div>
      )}

      {/* 밀도 범례 */}
      {densityMap && Object.keys(densityMap).length > 0 && (
        <div className={s.legend}>
          <span className={s.legendLabel}>낮음</span>
          <div className={s.legendBar} />
          <span className={s.legendLabel}>높음</span>
          <span className={s.legendCaption}>
            {densityLabel} ({densityUnit})
          </span>
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
              {densityLabel}{" "}
              {densityFormat
                ? densityFormat(hoveredDensity)
                : Math.round(hoveredDensity).toLocaleString()}
              {densityUnit}
            </span>
          )}
          {(() => {
            const enriched = getEnrichedHighlights(
              hoveredSigungu.sgisCode,
              hoveredSigungu.highlights,
            );
            if (enriched.length === 0) return null;
            return (
              <div className={s.tooltipTags}>
                {enriched.slice(0, 3).map((tag) => (
                  <span key={tag} className={s.tooltipTag}>
                    {tag}
                  </span>
                ))}
              </div>
            );
          })()}
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
