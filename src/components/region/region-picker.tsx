"use client";

/**
 * RegionPicker — 시·도 → 시·군·구 순서로 목록에서 골라 들어가는 2단 선택 (2026-10-02 회장 지시).
 *
 * 랜딩 "지도에서 내 지역 찾기"의 모바일(<768) 진입 UI. 시·도 칩 17개 나열 대신
 * [시·도 ▾][시·군·구 ▾][→] 한 줄로 고른다.
 *
 * - 공용 SelectCombobox 2개 재사용(포털 목록·키보드·IME 가드·터치에서 자동 포커스 없음 → 키보드가 안 뜬다).
 *   RegionSearch(입력창 + 드롭다운 트리)는 입력창 포커스가 곧 가상 키보드라 모바일에선 목록이 키보드에 가린다.
 * - 이동은 <Link> — 클릭 위임 계측(LandingClickTracker)이 data-track 으로 잡는다.
 * - 시·군·구 데이터는 서버가 필요한 필드만 추려 props 로 넘긴다(sigungus.ts 75KB 를 클라이언트 번들에 싣지 않게).
 * - useSearchParams 미사용 → Suspense bailout 없음.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SelectCombobox, type SelectComboboxOption } from "@/components/ui/select-combobox";
import s from "./region-picker.module.css";

export interface RegionPickerProvince {
  id: string;
  shortName: string;
}

export interface RegionPickerSigungu {
  sidoId: string;
  id: string;
  name: string;
  shortName: string;
}

interface Props {
  provinces: readonly RegionPickerProvince[];
  sigungus: readonly RegionPickerSigungu[];
  /** data-track 접두 — 예: "region_map" → "region_map:pick:gyeonggi/gapyeong" */
  trackPrefix?: string;
  className?: string;
}

export function RegionPicker({ provinces, sigungus, trackPrefix, className }: Props) {
  const [sidoId, setSidoId] = useState("");
  const [sigunguId, setSigunguId] = useState("");

  const sidoOptions = useMemo<SelectComboboxOption[]>(
    () => provinces.map((p) => ({ value: p.id, label: p.shortName })),
    [provinces],
  );

  const province = provinces.find((p) => p.id === sidoId);

  const sigunguOptions = useMemo<SelectComboboxOption[]>(() => {
    if (!province) return [];
    return [
      { value: "", label: `${province.shortName} 전체` },
      ...sigungus
        .filter((sg) => sg.sidoId === province.id)
        .map((sg) => ({ value: sg.id, label: sg.name })),
    ];
  }, [province, sigungus]);

  /** "충주"처럼 약칭으로 쳐도 잡히게 */
  const shortById = useMemo(() => new Map(sigungus.map((sg) => [sg.id, sg.shortName])), [sigungus]);
  const matchKeys = useMemo(
    () => (opt: SelectComboboxOption) => {
      const short = shortById.get(opt.value);
      return short ? [short] : [];
    },
    [shortById],
  );

  const sigungu = sigunguId ? sigungus.find((sg) => sg.id === sigunguId && sg.sidoId === sidoId) : undefined;
  const href = province ? (sigungu ? `/regions/${province.id}/${sigungu.id}` : `/regions/${province.id}`) : null;
  const goLabel = province ? (sigungu ? `${province.shortName} ${sigungu.name} 보기` : `${province.shortName} 전체 보기`) : "";

  return (
    <div className={className ? `${s.picker} ${className}` : s.picker} role="group" aria-label="시·도와 시·군·구 고르기">
      <SelectCombobox
        value={sidoId}
        onChange={(next) => {
          setSidoId(next);
          setSigunguId("");
        }}
        options={sidoOptions}
        placeholder="시·도"
        ariaLabel="시·도 선택"
        className={s.select}
      />
      <SelectCombobox
        value={sigunguId}
        onChange={setSigunguId}
        options={sigunguOptions}
        placeholder="시·군·구"
        ariaLabel={province ? `${province.shortName} 시·군·구 선택` : "시·군·구 선택 (시·도를 먼저 골라 주세요)"}
        matchKeys={matchKeys}
        disabled={!province}
        className={s.select}
      />
      {href ? (
        <Link
          href={href}
          className={s.go}
          aria-label={goLabel}
          title={goLabel}
          prefetch={false}
          data-track={trackPrefix ? `${trackPrefix}:pick:${province?.id}${sigungu ? `/${sigungu.id}` : ""}` : undefined}
        >
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <button type="button" className={s.go} disabled aria-label="시·도를 먼저 골라 주세요">
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
