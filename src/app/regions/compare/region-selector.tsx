"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";
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

  const pushSelection = useCallback(
    (newIds: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newIds.length === 0) {
        params.delete("stations");
      } else {
        params.set("stations", newIds.join(","));
      }
      const qs = params.toString();
      router.push(qs ? `/regions/compare?${qs}` : "/regions/compare");
    },
    [searchParams, router],
  );

  const toggleStation = useCallback(
    (stnId: string) => {
      let newIds: string[];

      if (selectedIds.includes(stnId)) {
        // 선택 전부 해제 허용 (첫 진입 UX 일관성)
        newIds = selectedIds.filter((id) => id !== stnId);
      } else {
        // 최대 3개까지 선택 — 초과 시 안내 메시지
        if (selectedIds.length >= MAX_SELECTION) {
          if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
          setSwapMessage(`최대 ${MAX_SELECTION}곳까지 비교할 수 있어요. 먼저 하나를 해제해 주세요.`);
          messageTimerRef.current = setTimeout(() => setSwapMessage(""), 3000);
          return;
        }
        newIds = [...selectedIds, stnId];
      }

      pushSelection(newIds);
    },
    [selectedIds, pushSelection],
  );

  const clearAll = useCallback(() => {
    pushSelection([]);
  }, [pushSelection]);

  const selectedStations = selectedIds
    .map((id) => stations.find((st) => st.stnId === id))
    .filter((st): st is Station => st != null);

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
          <span className={s.titleHint}>(최대 {MAX_SELECTION}곳)</span>
        </p>
        <div className={s.headerRight}>
          <span className={s.counter} aria-live="polite">
            {selectedIds.length}/{MAX_SELECTION} 선택됨
          </span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className={s.clearAllBtn}
              onClick={clearAll}
            >
              모두 지우기
            </button>
          )}
        </div>
      </div>

      {/* 선택된 칩 요약 — 빠른 해제 영역 */}
      {selectedStations.length > 0 ? (
        <div className={s.selectedSummary} aria-label="선택된 지역">
          {selectedStations.map((st) => (
            <button
              key={st.stnId}
              type="button"
              className={s.selectedChip}
              onClick={() => toggleStation(st.stnId)}
              aria-label={`${st.name} 선택 해제`}
            >
              <span>{st.name}</span>
              <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <p className={s.emptyPrompt}>
          아래에서 비교할 지역을 골라 주세요.
        </p>
      )}

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
