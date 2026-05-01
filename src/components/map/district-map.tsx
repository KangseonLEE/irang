"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GuMapLocation } from "@/lib/data/district-maps";
import { getGuByIds } from "@/lib/data/gus";
import s from "./province-map.module.css";

interface DistrictMapProps {
  /** 시/도 ID (예: "gyeonggi") */
  provinceId: string;
  /** 시군구 ID (예: "suwon") */
  sigunguId: string;
  /** 구 SVG 경계 데이터 */
  gus: GuMapLocation[];
  /** SVG viewBox */
  viewBox: string;
}

/**
 * 시 상세 페이지용 구 인터랙티브 지도.
 * ProvinceMap과 동일한 호버/클릭/툴팁 패턴.
 */
export function DistrictMap({
  provinceId,
  sigunguId,
  gus,
  viewBox,
}: DistrictMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleClick = useCallback(
    (guId: string) => {
      router.push(`/regions/${provinceId}/${sigunguId}/${guId}`);
    },
    [router, provinceId, sigunguId],
  );

  const handleMouseEnter = useCallback(
    (guId: string) => {
      setHoveredId(guId);
      router.prefetch(`/regions/${provinceId}/${sigunguId}/${guId}`);
    },
    [router, provinceId, sigunguId],
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

  // 구 ID → GuDistrict 데이터 매핑
  const guDataMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getGuByIds>>();
    for (const g of gus) {
      map.set(g.guId, getGuByIds(provinceId, sigunguId, g.guId));
    }
    return map;
  }, [gus, provinceId, sigunguId]);

  const hoveredGu = hoveredId ? guDataMap.get(hoveredId) ?? null : null;

  // viewBox에서 구 영역만 추출 (전체 도 viewBox에서 구 영역으로 crop)
  const croppedViewBox = useMemo(() => {
    const fallback = { str: viewBox, width: 800, height: 800 };
    if (gus.length === 0) return fallback;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const g of gus) {
      const numbers = g.path.match(/-?\d+(?:\.\d+)?/g);
      if (!numbers) continue;
      for (let i = 0; i < numbers.length - 1; i += 2) {
        const x = parseFloat(numbers[i]);
        const y = parseFloat(numbers[i + 1]);
        if (!isNaN(x) && !isNaN(y)) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!isFinite(minX)) return fallback;

    const padding = 30;
    const vbX = Math.max(0, minX - padding);
    const vbY = Math.max(0, minY - padding);
    const vbW = maxX - minX + padding * 2;
    const vbH = maxY - minY + padding * 2;

    return {
      str: `${Math.round(vbX)} ${Math.round(vbY)} ${Math.round(vbW)} ${Math.round(vbH)}`,
      width: vbW,
      height: vbH,
    };
  }, [gus, viewBox]);

  /* ── 모바일/데스크탑 분기 + 컨테이너 픽셀 폭 추적 ──
     모바일: 단일 비율 (0.014)로 충분 (사용자 "모바일은 건들지 마" 명시)
     데스크탑: ux-design-architect 권고대로 path별 동적 fontSize 계산 */
  const [isDesktop, setIsDesktop] = useState(false);
  const [containerWidth, setContainerWidth] = useState(560);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth || 560);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** 구 path의 viewBox 단위 width 측정 (좌표 파싱, getBBox 불필요) */
  const getPathWidthVu = useCallback((path: string): number => {
    const numbers = path.match(/-?\d+(?:\.\d+)?/g);
    if (!numbers) return 0;
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < numbers.length - 1; i += 2) {
      const x = parseFloat(numbers[i]);
      if (!isNaN(x)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    if (!isFinite(minX)) return 0;
    return maxX - minX;
  }, []);

  /** 모바일 단일 fontSize (이전 동작 그대로) */
  const mobileLabelFontSize = useMemo(() => {
    const dim = Math.max(croppedViewBox.width, croppedViewBox.height);
    return Math.max(3, Math.min(14, dim * 0.014));
  }, [croppedViewBox]);

  /** 데스크탑: 각 구 path 폭 × 0.12 / charCount 비율로 화면 픽셀 9~13 사이 폰트 */
  const getDesktopLabelFontSize = useCallback(
    (path: string, charCount: number): number => {
      const pathWidthVu = getPathWidthVu(path);
      const scale = containerWidth / Math.max(croppedViewBox.width, 1);
      const pathWidthPx = pathWidthVu * scale;
      const safeCharCount = Math.max(1, charCount);
      const fsPx = Math.max(9, Math.min(13, (pathWidthPx * 0.12) / safeCharCount));
      return fsPx / Math.max(scale, 0.001); // viewBox 단위로 역산
    },
    [containerWidth, croppedViewBox.width, getPathWidthVu],
  );

  return (
    <div className={s.mapContainer} ref={containerRef}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={croppedViewBox.str}
        className={s.svg}
        role="img"
        aria-label="구 지도"
      >
        {gus.map((g) => {
          const isActive = hoveredId === g.guId;
          return (
            <path
              key={g.guId}
              d={g.path}
              className={`${s.region} ${isActive ? s.regionActive : ""}`}
              onClick={() => handleClick(g.guId)}
              onMouseEnter={() => handleMouseEnter(g.guId)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              role="button"
              tabIndex={0}
              aria-label={`${g.name} 상세 보기`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(g.guId);
                }
              }}
            />
          );
        })}

        {gus.map((g) => {
          const isActive = hoveredId === g.guId;
          const guData = guDataMap.get(g.guId);
          const label = guData?.shortName ?? g.name.replace(/구$/, "");
          const fsVu = isDesktop
            ? getDesktopLabelFontSize(g.path, label.length)
            : mobileLabelFontSize;
          return (
            <text
              key={`label-${g.guId}`}
              x={g.labelX}
              y={g.labelY}
              className={`${s.label} ${s.labelDistrict} ${isActive ? s.labelActive : ""}`}
              style={{ "--district-label-size": `${fsVu}px` } as React.CSSProperties}
            >
              {label}
            </text>
          );
        })}
      </svg>

      {hoveredGu && tooltipPos && (
        <div
          className={s.tooltip}
          style={{ left: tooltipPos.x, top: tooltipPos.y + 16 }}
        >
          <span className={s.tooltipName}>{hoveredGu.name}</span>
          <span className={s.tooltipDesc}>{hoveredGu.description}</span>
          {hoveredGu.highlights.length > 0 && (
            <div className={s.tooltipTags}>
              {hoveredGu.highlights.slice(0, 3).map((tag) => (
                <span key={tag} className={s.tooltipTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {hoveredGu.mainCrops.length > 0 && (
            <span className={s.tooltipCrops}>
              🌱 {hoveredGu.mainCrops.slice(0, 3).join(" · ")}
            </span>
          )}
          <span className={s.tooltipHint}>클릭하여 자세히 보기</span>
        </div>
      )}
    </div>
  );
}
