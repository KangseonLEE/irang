"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { CropInfo } from "@/lib/data/crops";
import s from "./crop-selector.module.css";

const MAX_SELECTION = 3;

interface CropSelectorProps {
  crops: CropInfo[];
  selectedIds: string[];
}

export function CropSelector({ crops, selectedIds }: CropSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [swapMessage, setSwapMessage] = useState("");
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSwapFeedback = useCallback(
    (replacedName: string, newName: string) => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      setSwapMessage(
        `최대 ${MAX_SELECTION}개까지 선택할 수 있어요. "${replacedName}" 대신 "${newName}"(으)로 교체했어요.`,
      );
      messageTimerRef.current = setTimeout(() => setSwapMessage(""), 3000);
    },
    [],
  );

  const toggleCrop = useCallback(
    (cropId: string) => {
      let newIds: string[];

      if (selectedIds.includes(cropId)) {
        if (selectedIds.length <= 1) return;
        newIds = selectedIds.filter((id) => id !== cropId);
      } else {
        if (selectedIds.length >= MAX_SELECTION) {
          const replacedId = selectedIds[0];
          const replacedCrop = crops.find((c) => c.id === replacedId);
          const newCrop = crops.find((c) => c.id === cropId);
          newIds = [...selectedIds.slice(1), cropId];
          if (replacedCrop && newCrop) {
            showSwapFeedback(replacedCrop.name, newCrop.name);
          }
        } else {
          newIds = [...selectedIds, cropId];
        }
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("ids", newIds.join(","));
      router.push(`/crops/compare?${params.toString()}`);
    },
    [selectedIds, searchParams, router, crops, showSwapFeedback],
  );

  // 카테고리별 그룹핑
  const grouped = crops.reduce<Record<string, CropInfo[]>>((acc, crop) => {
    if (!acc[crop.category]) acc[crop.category] = [];
    acc[crop.category].push(crop);
    return acc;
  }, {});

  const categoryOrder = ["식량", "채소", "과수", "특용"];

  return (
    <div className={s.card} role="group" aria-label="비교할 작물 선택">
      <div className={s.header}>
        <p className={s.title}>
          비교할 작물 선택{" "}
          <span className={s.titleHint}>(최대 {MAX_SELECTION}개)</span>
        </p>
        <span className={s.counter} aria-live="polite">
          {selectedIds.length}/{MAX_SELECTION} 선택됨
        </span>
      </div>

      <div aria-live="polite" aria-atomic="true" className={s.srOnly}>
        {swapMessage}
      </div>
      {swapMessage && <p className={s.swapMessage}>{swapMessage}</p>}

      <div className={s.groups}>
        {categoryOrder.map((category) => {
          const groupCrops = grouped[category];
          if (!groupCrops) return null;
          return (
            <div key={category} className={s.group}>
              <span className={s.groupLabel}>{category}</span>
              {groupCrops.map((crop) => {
                const isSelected = selectedIds.includes(crop.id);
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
          );
        })}
      </div>
    </div>
  );
}
