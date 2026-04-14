"use client";

import { useCallback, useMemo } from "react";
import {
  PaginatedListModal,
  type FilterOption,
} from "./paginated-list-modal";
import s from "./modals.module.css";

interface MedicalItem {
  name: string;
  type: string;
  address: string;
  tel: string;
}

interface MedicalModalProps {
  provinceShortName: string;
  totalCount: number;
  hiraSidoCd: string;
  sgguCd?: string;
}

/** 의료기관 유형 필터 옵션 */
const TYPE_FILTERS: readonly FilterOption[] = [
  { label: "전체", value: "" },
  { label: "상급종합", value: "상급종합" },
  { label: "종합병원", value: "종합병원" },
  { label: "병원", value: "병원" },
  { label: "의원", value: "의원" },
  { label: "한방", value: "한방" },
  { label: "치과", value: "치과" },
  { label: "보건", value: "보건" },
];

export function MedicalModal({
  provinceShortName,
  totalCount,
  hiraSidoCd,
  sgguCd,
}: MedicalModalProps) {
  const params = useMemo(
    () => ({
      sidoCd: hiraSidoCd,
      ...(sgguCd ? { sgguCd } : {}),
    }),
    [hiraSidoCd, sgguCd]
  );

  const renderItem = useCallback(
    (item: MedicalItem) => (
      <div className={s.listItemMain}>
        <span className={s.listItemName}>{item.name}</span>
        <span className={s.listItemMeta}>{item.type}</span>
      </div>
    ),
    []
  );

  const itemKey = useCallback(
    (item: MedicalItem, i: number) => `${item.name}-${i}`,
    []
  );

  /** includes 기반 필터 카운트 (상급종합, 한방 등 부분 매칭) */
  const filterMatchCount = useCallback(
    (typeCount: Record<string, number>, filterValue: string) =>
      Object.entries(typeCount)
        .filter(([type]) => type.includes(filterValue))
        .reduce((sum, [, c]) => sum + c, 0),
    []
  );

  return (
    <PaginatedListModal<MedicalItem>
      provinceShortName={provinceShortName}
      totalCount={totalCount}
      endpoint="/api/medical-list"
      params={params}
      filters={TYPE_FILTERS}
      searchPlaceholder="의료기관명 또는 주소 검색"
      itemLabel="의료기관"
      loadingThreshold={500}
      renderItem={renderItem}
      itemKey={itemKey}
      filterMatchCount={filterMatchCount}
      dataSource="건강보험심사평가원"
    />
  );
}
