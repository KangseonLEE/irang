import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { Icon } from "@/components/ui/icon";
import s from "./filter-bar.module.css";

// ─── 유틸리티 ───

/** 현재 활성 필터를 유지하면서 특정 필터만 변경하는 URL 생성 */
export function buildFilterUrl(
  basePath: string,
  current: Record<string, string | undefined>,
  key: string,
  value: string | undefined,
): string {
  const params = new URLSearchParams();
  const merged = { ...current, [key]: value };
  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== "전체") {
      params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * 복수 선택 chip의 토글 URL 생성 — option을 현재 선택 집합에 toggle.
 * - 선택 중인 옵션 클릭 → 제거
 * - 선택 안 된 옵션 클릭 → 추가
 * - 비어지면 key 자체 제거
 * - 값 정렬은 enum options 순서 유지 (URL 안정성)
 */
function buildMultiToggleUrl(
  basePath: string,
  current: Record<string, string | undefined>,
  key: string,
  option: string,
  allOptions: readonly string[],
): string {
  const currentRaw = current[key];
  const set = new Set(
    currentRaw ? currentRaw.split(",").filter(Boolean) : [],
  );
  if (set.has(option)) set.delete(option);
  else set.add(option);
  const ordered = allOptions.filter((o) => set.has(o));
  const next = ordered.length > 0 ? ordered.join(",") : undefined;
  return buildFilterUrl(basePath, current, key, next);
}

// ─── 레이아웃 컴포넌트 ───

/** 필터 바 — 카드 형태의 외부 래퍼 */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className={s.filterBar}>{children}</div>;
}

/**
 * 가로 스크롤 가능한 필터 그룹 행.
 * mobileColumns=2 prop으로 모바일(<640px) 2열 그리드 레이아웃 사용 (chip 많은 페이지 가독성↑).
 * 기본(미지정 또는 1)은 기존 inline-flex 가로 스크롤.
 */
export function FilterRow({
  children,
  mobileColumns,
}: {
  children: React.ReactNode;
  mobileColumns?: 1 | 2;
}) {
  const cls =
    mobileColumns === 2 ? `${s.filterRow} ${s.filterRowGrid2}` : s.filterRow;
  return <div className={cls}>{children}</div>;
}

/** 구분선 */
export function FilterDivider() {
  return <hr className={s.filterDivider} />;
}

// ─── 필터 그룹 ───

interface FilterGroupProps {
  /** 필터 라벨 (예: "카테고리", "지역") */
  label: string;
  /** URL searchParam 키 (예: "category", "region") */
  paramKey: string;
  /** 선택 가능한 옵션 배열 ("전체" 제외) */
  options: readonly string[];
  /** 현재 선택된 값 (단일: string / 복수: comma-CSV, undefined = 전체) */
  currentValue: string | undefined;
  /** 전체 활성 필터 상태 (URL 빌딩용) */
  currentFilters: Record<string, string | undefined>;
  /** 페이지 base path (예: "/crops") */
  basePath: string;
  /** 옵션 ID → 표시 라벨 매핑 (예: { family: "자녀 양육" }) — 영문 ID에 한글 라벨 표시용 */
  optionLabels?: Record<string, string>;
  /** 모바일 한정 드롭다운 토글로 표시 (chip 많은 페이지용). 640px+ 항상 펼침. 기본 false */
  collapsibleOnMobile?: boolean;
  /**
   * 복수 선택 모드. 기본 false (단일 선택).
   * - currentValue: comma-CSV ("healing,social")
   * - chip 클릭 → 해당 옵션 toggle (선택 ↔ 해제)
   * - "전체" 클릭 → 전부 해제
   * - 선택된 옵션 개수를 summary 라벨에 표시 (collapsibleOnMobile 동반 시)
   */
  multiple?: boolean;
}

/** 라벨 + pill 목록으로 구성된 단일 필터 그룹 */
export function FilterGroup({
  label,
  paramKey,
  options,
  currentValue,
  currentFilters,
  basePath,
  optionLabels,
  collapsibleOnMobile = false,
  multiple = false,
}: FilterGroupProps) {
  // 복수 선택 모드: currentValue를 CSV로 파싱, 그 외엔 단일값
  const selectedSet = multiple
    ? new Set(currentValue ? currentValue.split(",").filter(Boolean) : [])
    : null;

  const isActive = (opt: string) =>
    multiple ? selectedSet!.has(opt) : currentValue === opt;

  const hrefFor = (opt: string) =>
    multiple
      ? buildMultiToggleUrl(basePath, currentFilters, paramKey, opt, options)
      : buildFilterUrl(basePath, currentFilters, paramKey, opt);

  const allCleared = multiple ? selectedSet!.size === 0 : !currentValue;

  const pills = (
    <>
      <Link
        href={buildFilterUrl(basePath, currentFilters, paramKey, undefined)}
        className={allCleared ? s.pillActive : s.pill}
      >
        전체
      </Link>
      {options.map((opt) => (
        <Link
          key={opt}
          href={hrefFor(opt)}
          className={isActive(opt) ? s.pillActive : s.pill}
          aria-pressed={multiple ? isActive(opt) : undefined}
        >
          {optionLabels?.[opt] ?? opt}
        </Link>
      ))}
    </>
  );

  if (collapsibleOnMobile) {
    // 요약 라벨: 단일은 옵션명, 복수는 첫 옵션 + "외 N" 또는 "N개 선택"
    let activeLabel: string;
    if (multiple) {
      const selected = Array.from(selectedSet!);
      if (selected.length === 0) {
        activeLabel = "전체";
      } else if (selected.length === 1) {
        activeLabel = optionLabels?.[selected[0]] ?? selected[0];
      } else {
        const firstLabel = optionLabels?.[selected[0]] ?? selected[0];
        activeLabel = `${firstLabel} 외 ${selected.length - 1}`;
      }
    } else {
      activeLabel = currentValue
        ? optionLabels?.[currentValue] ?? currentValue
        : "전체";
    }
    return (
      <details className={s.collapsibleGroup}>
        <summary className={s.collapsibleSummary}>
          <span className={s.collapsibleLabel}>{label}</span>
          <span className={s.collapsibleSelection}>{activeLabel}</span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={s.collapsibleChevron}
          />
        </summary>
        <div className={s.filterPills}>{pills}</div>
      </details>
    );
  }

  return (
    <div className={s.filterGroup}>
      <span className={s.filterLabel}>{label}</span>
      <div className={s.filterPills}>{pills}</div>
    </div>
  );
}

// ─── 필터 액션 (검색 + 토글 + 초기화) ───

interface FilterActionsProps {
  /** 페이지 base path (예: "/crops") */
  basePath: string;
  /** 전체 활성 필터 상태 */
  currentFilters: Record<string, string | undefined>;
  /** 검색 placeholder 텍스트 */
  searchPlaceholder?: string;
  /** 검색 URL param 키 (기본 "q") */
  searchParamKey?: string;
  /** 토글 버튼 (예: 마감 포함) — 없으면 렌더링하지 않음 */
  toggle?: {
    paramKey: string;
    label: string;
    isActive: boolean;
  };
  /** 숫자 입력 필드 (예: 나이) — 없으면 렌더링하지 않음 */
  numberInput?: {
    paramKey: string;
    label: string;
    placeholder?: string;
    min?: number;
    max?: number;
  };
  /**
   * 검색창 row 우측 보조 컨트롤 슬롯 (초기화 직전).
   * 5/22 회장 결재 — /crops 재배 캘린더 trigger 버튼 통합 패턴.
   * 페이지 특수 인터랙션(예: 재배 캘린더 모달 trigger)을 추가할 때 사용.
   */
  extraAction?: React.ReactNode;
}

/** 검색 폼 + 선택적 숫자 입력 + 선택적 토글 + 선택적 extraAction + 초기화 링크 */
export function FilterActions({
  basePath,
  currentFilters,
  searchPlaceholder = "검색...",
  searchParamKey = "q",
  toggle,
  numberInput,
  extraAction,
}: FilterActionsProps) {
  return (
    <div className={s.filterActions}>
      {/* 검색 폼 — 기존 필터를 hidden input으로 유지 */}
      <form className={s.searchForm} action={basePath} method="get">
        {Object.entries(currentFilters).map(([k, v]) =>
          v && k !== searchParamKey ? (
            <input key={k} type="hidden" name={k} value={v} />
          ) : null,
        )}
        <Icon icon={Search} size="md" className={s.searchIcon} />
        <input
          type="text"
          name={searchParamKey}
          defaultValue={currentFilters[searchParamKey] ?? ""}
          placeholder={searchPlaceholder}
          className={s.searchInput}
        />
      </form>

      {/* 보조 컨트롤 — 모바일에서 2행 분리 */}
      <div className={s.filterSecondary}>
        {/* 선택적 숫자 입력 (예: 나이) */}
        {numberInput && (
          <form className={s.numberForm} action={basePath} method="get">
            {Object.entries(currentFilters).map(([k, v]) =>
              v && k !== numberInput.paramKey ? (
                <input key={k} type="hidden" name={k} value={v} />
              ) : null,
            )}
            <label className={s.numberLabel}>{numberInput.label}</label>
            <input
              type="number"
              name={numberInput.paramKey}
              defaultValue={currentFilters[numberInput.paramKey] ?? ""}
              placeholder={numberInput.placeholder}
              min={numberInput.min}
              max={numberInput.max}
              className={s.numberInput}
            />
          </form>
        )}

        {/* 선택적 토글 (예: 마감 포함) */}
        {toggle && (
          <Link
            href={buildFilterUrl(
              basePath,
              currentFilters,
              toggle.paramKey,
              toggle.isActive ? undefined : "1",
            )}
            className={toggle.isActive ? s.toggleActive : s.toggle}
          >
            {toggle.label}
          </Link>
        )}

        {/* 페이지 특수 슬롯 (예: 재배 캘린더 trigger) */}
        {extraAction}

        {/* 초기화 */}
        <Link href={basePath} className={s.resetLink}>
          초기화
        </Link>
      </div>
    </div>
  );
}
