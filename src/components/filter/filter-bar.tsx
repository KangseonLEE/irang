import Link from "next/link";
import { Search } from "lucide-react";
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

// ─── 레이아웃 컴포넌트 ───

/** 필터 바 — 카드 형태의 외부 래퍼 */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className={s.filterBar}>{children}</div>;
}

/** 가로 스크롤 가능한 필터 그룹 행 */
export function FilterRow({ children }: { children: React.ReactNode }) {
  return <div className={s.filterRow}>{children}</div>;
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
  /** 현재 선택된 값 (undefined = 전체) */
  currentValue: string | undefined;
  /** 전체 활성 필터 상태 (URL 빌딩용) */
  currentFilters: Record<string, string | undefined>;
  /** 페이지 base path (예: "/crops") */
  basePath: string;
}

/** 라벨 + pill 목록으로 구성된 단일 필터 그룹 */
export function FilterGroup({
  label,
  paramKey,
  options,
  currentValue,
  currentFilters,
  basePath,
}: FilterGroupProps) {
  return (
    <div className={s.filterGroup}>
      <span className={s.filterLabel}>{label}</span>
      <div className={s.filterPills}>
        <Link
          href={buildFilterUrl(basePath, currentFilters, paramKey, undefined)}
          className={!currentValue ? s.pillActive : s.pill}
        >
          전체
        </Link>
        {options.map((opt) => (
          <Link
            key={opt}
            href={buildFilterUrl(basePath, currentFilters, paramKey, opt)}
            className={currentValue === opt ? s.pillActive : s.pill}
          >
            {opt}
          </Link>
        ))}
      </div>
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
}

/** 검색 폼 + 선택적 숫자 입력 + 선택적 토글 + 초기화 링크 */
export function FilterActions({
  basePath,
  currentFilters,
  searchPlaceholder = "검색...",
  searchParamKey = "q",
  toggle,
  numberInput,
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
        <Search size={16} className={s.searchIcon} />
        <input
          type="text"
          name={searchParamKey}
          defaultValue={currentFilters[searchParamKey] ?? ""}
          placeholder={searchPlaceholder}
          className={s.searchInput}
        />
      </form>

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

      {/* 초기화 */}
      <Link href={basePath} className={s.resetLink}>
        초기화
      </Link>
    </div>
  );
}
