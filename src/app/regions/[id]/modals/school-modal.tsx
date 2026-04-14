"use client";

import { useCallback, useMemo } from "react";
import {
  PaginatedListModal,
  type FilterOption,
} from "./paginated-list-modal";
import s from "./modals.module.css";

interface SchoolItem {
  name: string;
  type: string;
  address: string;
  foundType: string;
}

interface SchoolModalProps {
  provinceShortName: string;
  totalCount: number;
  eduCode: string;
  sigunguName?: string;
}

/** 학교 유형 필터 옵션 */
const SCHOOL_FILTERS: readonly FilterOption[] = [
  { label: "전체", value: "" },
  { label: "초등학교", value: "초등학교" },
  { label: "중학교", value: "중학교" },
  { label: "고등학교", value: "고등학교" },
  { label: "특수학교", value: "특수학교" },
];

export function SchoolModal({
  provinceShortName,
  totalCount,
  eduCode,
  sigunguName,
}: SchoolModalProps) {
  const params = useMemo(
    () => ({
      eduCode,
      ...(sigunguName ? { sigunguName } : {}),
    }),
    [eduCode, sigunguName]
  );

  const renderItem = useCallback(
    (item: SchoolItem) => (
      <div className={s.listItemMain}>
        <span className={s.listItemName}>{item.name}</span>
        <span className={s.listItemMeta}>
          {item.type}
          {item.foundType ? ` · ${item.foundType}` : ""}
        </span>
      </div>
    ),
    []
  );

  const itemKey = useCallback(
    (item: SchoolItem, i: number) => `${item.name}-${i}`,
    []
  );

  /** 학교는 exact match 기반 필터 카운트 */
  const filterMatchCount = useCallback(
    (typeCount: Record<string, number>, filterValue: string) =>
      typeCount[filterValue] ?? 0,
    []
  );

  return (
    <PaginatedListModal<SchoolItem>
      provinceShortName={provinceShortName}
      totalCount={totalCount}
      endpoint="/api/school-list"
      params={params}
      filters={SCHOOL_FILTERS}
      searchPlaceholder="학교명 또는 주소 검색"
      itemLabel="학교"
      loadingThreshold={300}
      renderItem={renderItem}
      itemKey={itemKey}
      filterMatchCount={filterMatchCount}
      dataSource="교육부 NEIS"
    />
  );
}
