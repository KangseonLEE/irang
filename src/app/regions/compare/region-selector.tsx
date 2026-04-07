"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { Station } from "@/lib/data/stations";
import s from "./region-selector.module.css";

const MAX_SELECTION = 3;

interface RegionSelectorProps {
  stations: Station[];
  selectedIds: string[];
}

export function RegionSelector({ stations, selectedIds }: RegionSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [swapMessage, setSwapMessage] = useState("");
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleStation = useCallback(
    (stnId: string) => {
      let newIds: string[];

      if (selectedIds.includes(stnId)) {
        // 최소 1개는 선택 유지
        if (selectedIds.length <= 1) return;
        newIds = selectedIds.filter((id) => id !== stnId);
      } else {
        // 최대 3개까지 선택 — 초과 시 안내 메시지
        if (selectedIds.length >= MAX_SELECTION) {
          if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
          setSwapMessage(`최대 ${MAX_SELECTION}개까지만 비교할 수 있습니다. 기존 선택을 해제한 후 다시 시도해주세요.`);
          messageTimerRef.current = setTimeout(() => setSwapMessage(""), 3000);
          return;
        }
        newIds = [...selectedIds, stnId];
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("stations", newIds.join(","));
      router.push(`/regions/compare?${params.toString()}`);
    },
    [selectedIds, searchParams, router],
  );

  // 도별 그룹핑
  const grouped = stations.reduce<Record<string, Station[]>>((acc, station) => {
    const key = station.province
      .replace(/특별자치도|광역시|특별시/, "")
      .slice(0, 2);
    if (!acc[key]) acc[key] = [];
    acc[key].push(station);
    return acc;
  }, {});

  return (
    <div className={s.card} role="group" aria-label="비교할 지역 선택">
      <div className={s.header}>
        <p className={s.title}>
          비교할 지역 선택{" "}
          <span className={s.titleHint}>(최대 {MAX_SELECTION}개)</span>
        </p>
        <span className={s.counter} aria-live="polite">
          {selectedIds.length}/{MAX_SELECTION} 선택됨
        </span>
      </div>

      {/* 최대 선택 초과 시 교체 피드백 (시각 + 스크린리더) */}
      <div aria-live="polite" aria-atomic="true" className={s.srOnly}>
        {swapMessage}
      </div>
      {swapMessage && (
        <p className={s.swapMessage}>{swapMessage}</p>
      )}

      <div className={s.groups}>
        {Object.entries(grouped).map(([province, groupStations]) => (
          <div key={province} className={s.group}>
            <span className={s.groupLabel}>{province}</span>
            {groupStations.map((station) => {
              const isSelected = selectedIds.includes(station.stnId);
              return (
                <button
                  key={station.stnId}
                  type="button"
                  onClick={() => toggleStation(station.stnId)}
                  className={isSelected ? s.chipSelected : s.chipDefault}
                  aria-pressed={isSelected}
                >
                  {station.name}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
