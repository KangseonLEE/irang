"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { CropInfo } from "@/lib/data/crops";
import s from "./crop-suitability-selector.module.css";

interface CropSuitabilitySelectorProps {
  crops: CropInfo[];
  selectedId: string | null;
}

const CATEGORY_ORDER = ["식량", "채소", "과수", "특용"];

/**
 * 지역 비교 페이지용 작물 선택 칩.
 * 1개만 선택 가능하며, 선택/해제 시 URL의 crop 파라미터를 업데이트합니다.
 */
export function CropSuitabilitySelector({
  crops,
  selectedId,
}: CropSuitabilitySelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleCrop = useCallback(
    (cropId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (selectedId === cropId) {
        // 같은 칩 다시 클릭 → 선택 해제
        params.delete("crop");
      } else {
        params.set("crop", cropId);
      }

      router.push(`/regions/compare?${params.toString()}`, { scroll: false });
    },
    [selectedId, searchParams, router],
  );

  // 카테고리별 그룹핑
  const grouped = crops.reduce<Record<string, CropInfo[]>>((acc, crop) => {
    if (!acc[crop.category]) acc[crop.category] = [];
    acc[crop.category].push(crop);
    return acc;
  }, {});

  return (
    <div className={s.card} role="group" aria-label="적합성 확인할 작물 선택">
      <div className={s.header}>
        <p className={s.title}>
          확인할 작물을 선택하세요
          <span className={s.titleHint}>· 1개만 선택 가능</span>
        </p>
        {selectedId && (
          <span className={s.counter} aria-live="polite">
            선택됨
          </span>
        )}
      </div>

      <div className={s.groups}>
        {CATEGORY_ORDER.map((category) => {
          const groupCrops = grouped[category];
          if (!groupCrops) return null;
          return (
            <div key={category} className={s.group}>
              <span className={s.groupLabel}>{category}</span>
              <div className={s.groupChips}>
                {groupCrops.map((crop) => {
                  const isSelected = selectedId === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleCrop(crop.id)}
                      className={isSelected ? s.chipSelected : s.chipDefault}
                      aria-pressed={isSelected}
                    >
                      <span className={s.chipEmoji}>{crop.emoji}</span>
                      {crop.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
