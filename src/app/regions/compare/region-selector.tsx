"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { X, MapPin, ChevronDown, Loader2 } from "lucide-react";
import type { Station } from "@/lib/data/stations";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import s from "./region-selector.module.css";

const MAX_SELECTION = 3;

interface RegionSelectorProps {
  /** 모든 station 메타 (기상 관측소) — backward compat */
  stations: Station[];
  /** 현재 선택된 region IDs ("seoul" 또는 "jeonnam:suncheon-si") */
  selectedRegionIds: string[];
  /** canonical URL param ("?regions=...") */
  canonicalParam: string;
}

/**
 * 2026-05-11 Phase C: 시도 + 시군구 통합 선택 UI.
 *
 * - 시도 chip 클릭 → 시도 선택 (URL `?regions=jeonnam`)
 * - 선택된 시도 chip의 ▾ 버튼 클릭 → 시군구 dropdown 열림
 * - 시군구 클릭 → URL `?regions=jeonnam:suncheon-si`
 * - 시도 자체로 돌아가려면 chip의 시도명 부분 다시 클릭
 *
 * URL: 신규 `?regions=` 사용. 기존 `?stations=`도 page.tsx에서 backward 호환.
 */
export function RegionSelector({
  selectedRegionIds,
  canonicalParam,
}: RegionSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [swapMessage, setSwapMessage] = useState("");
  const [openSigunguFor, setOpenSigunguFor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2026-05-11: useOptimistic — chip 클릭 즉시 selected 표시.
  // SSR 응답 (5s cold) 기다리지 않고 즉각 시각 피드백.
  const [optimisticIds, setOptimisticIds] = useOptimistic<string[], string[]>(
    selectedRegionIds,
    (_, next) => next,
  );

  const pushSelection = useCallback(
    (newIds: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("stations"); // backward param 제거
      if (newIds.length === 0) {
        params.delete("regions");
      } else {
        params.set("regions", newIds.join(","));
      }
      const qs = params.toString();
      // startTransition 내부에서 optimistic + push 동시 실행 → 즉각 피드백
      startTransition(() => {
        setOptimisticIds(newIds);
        router.push(qs ? `/regions/compare?${qs}` : "/regions/compare");
      });
    },
    [searchParams, router, setOptimisticIds],
  );

  const toggleProvince = useCallback(
    (provinceId: string) => {
      // optimisticIds 기준 — chip 클릭 직후 연쇄 클릭도 즉각 반영
      const existingIdx = optimisticIds.findIndex(
        (id) => id === provinceId || id.startsWith(`${provinceId}:`),
      );

      if (existingIdx >= 0) {
        // 이미 선택 — 해제
        pushSelection(optimisticIds.filter((_, i) => i !== existingIdx));
        setOpenSigunguFor(null);
        return;
      }

      if (optimisticIds.length >= MAX_SELECTION) {
        if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        setSwapMessage(
          `최대 ${MAX_SELECTION}곳까지 비교할 수 있어요. 먼저 하나를 해제해 주세요.`,
        );
        messageTimerRef.current = setTimeout(() => setSwapMessage(""), 3000);
        return;
      }

      pushSelection([...optimisticIds, provinceId]);
    },
    [optimisticIds, pushSelection],
  );

  const selectSigungu = useCallback(
    (provinceId: string, sigunguId: string | null) => {
      const newId = sigunguId ? `${provinceId}:${sigunguId}` : provinceId;
      const existingIdx = optimisticIds.findIndex(
        (id) => id === provinceId || id.startsWith(`${provinceId}:`),
      );
      const newIds = [...optimisticIds];
      if (existingIdx >= 0) {
        newIds[existingIdx] = newId;
      } else {
        newIds.push(newId);
      }
      pushSelection(newIds);
      setOpenSigunguFor(null);
    },
    [optimisticIds, pushSelection],
  );

  const clearAll = useCallback(() => {
    pushSelection([]);
    setOpenSigunguFor(null);
  }, [pushSelection]);

  // 시도별 시군구 매핑 (메모이즈)
  const sigungusByProvince = useMemo(() => {
    const map = new Map<string, typeof SIGUNGUS>();
    for (const sg of SIGUNGUS) {
      const arr = map.get(sg.sidoId) ?? [];
      arr.push(sg);
      map.set(sg.sidoId, arr);
    }
    return map;
  }, []);

  // 선택된 region 표시용 — optimisticIds 기준 (즉각 반영)
  const selectedDisplays = optimisticIds.map((id) => {
    const [provinceId, sigunguId] = id.split(":");
    const province = PROVINCES.find((p) => p.id === provinceId);
    const sigungu = sigunguId
      ? SIGUNGUS.find((sg) => sg.id === sigunguId && sg.sidoId === provinceId)
      : null;
    return { id, provinceId, province, sigungu };
  });

  return (
    <div className={s.card} role="group" aria-label="비교할 지역 선택">
      <div className={s.header}>
        <p className={s.title}>
          비교할 지역 선택{" "}
          <span className={s.titleHint}>(최대 {MAX_SELECTION}곳, 시·군·구까지)</span>
        </p>
        <div className={s.headerRight}>
          {isPending && (
            <span className={s.loadingHint} aria-live="polite">
              <Loader2 size={14} className={s.spinner} aria-hidden="true" />
              불러오는 중
            </span>
          )}
          <span className={s.counter} aria-live="polite">
            {optimisticIds.length}/{MAX_SELECTION} 선택됨
          </span>
          {optimisticIds.length > 0 && (
            <button
              type="button"
              className={s.clearAllBtn}
              onClick={clearAll}
              disabled={isPending}
            >
              모두 지우기
            </button>
          )}
        </div>
      </div>

      {/* 선택된 chip 요약 */}
      {selectedDisplays.length > 0 ? (
        <div className={s.selectedSummary} aria-label="선택된 지역">
          {selectedDisplays.map((d) => {
            if (!d.province) return null;
            const sigungus = sigungusByProvince.get(d.provinceId) ?? [];
            const isOpen = openSigunguFor === d.id;
            return (
              <div key={d.id} className={s.selectedChipWrap}>
                <button
                  type="button"
                  className={s.selectedChip}
                  onClick={() => toggleProvince(d.provinceId)}
                  aria-label={`${d.province.shortName}${d.sigungu ? ` ${d.sigungu.shortName}` : ""} 선택 해제`}
                >
                  <MapPin size={12} aria-hidden="true" />
                  <span>
                    {d.province.shortName}
                    {d.sigungu && ` ${d.sigungu.shortName}`}
                  </span>
                  <X size={14} aria-hidden="true" />
                </button>
                {sigungus.length > 0 && (
                  <button
                    type="button"
                    className={s.sigunguToggle}
                    onClick={() =>
                      setOpenSigunguFor(isOpen ? null : d.id)
                    }
                    aria-expanded={isOpen}
                    aria-label={`${d.province.shortName} 시·군·구 선택 ${isOpen ? "닫기" : "열기"}`}
                  >
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : undefined,
                        transition: "transform 0.15s",
                      }}
                    />
                  </button>
                )}
                {isOpen && sigungus.length > 0 && (
                  <div className={s.sigunguDropdown} role="listbox">
                    <button
                      type="button"
                      className={
                        d.sigungu === null
                          ? s.sigunguOptionSelected
                          : s.sigunguOption
                      }
                      onClick={() => selectSigungu(d.provinceId, null)}
                    >
                      {d.province.shortName} 전체 (시·도 단위)
                    </button>
                    {sigungus.map((sg) => (
                      <button
                        key={sg.id}
                        type="button"
                        className={
                          d.sigungu?.id === sg.id
                            ? s.sigunguOptionSelected
                            : s.sigunguOption
                        }
                        onClick={() => selectSigungu(d.provinceId, sg.id)}
                      >
                        {sg.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className={s.emptyPrompt}>
          아래에서 시·도를 골라 주세요. 선택한 시·도의 ▾ 버튼으로 시·군·구까지 좁힐 수 있어요.
        </p>
      )}

      <div aria-live="polite" aria-atomic="true" className={s.srOnly}>
        {swapMessage}
      </div>
      {swapMessage && <p className={s.swapMessage}>{swapMessage}</p>}

      {/* 시도 그리드 — 17개 시도 균등 */}
      <div className={s.provinceGrid}>
        {PROVINCES.map((province) => {
          const isSelected = optimisticIds.some(
            (id) => id === province.id || id.startsWith(`${province.id}:`),
          );
          return (
            <button
              key={province.id}
              type="button"
              onClick={() => toggleProvince(province.id)}
              className={isSelected ? s.provinceChipSelected : s.provinceChip}
              aria-pressed={isSelected}
            >
              {province.shortName}
            </button>
          );
        })}
      </div>

      {/* canonical hint (debug용·미사용 — fall through prop) */}
      {canonicalParam && <span className={s.srOnly}>{canonicalParam}</span>}
    </div>
  );
}
