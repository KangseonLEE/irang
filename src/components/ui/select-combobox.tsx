"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import s from "./select-combobox.module.css";

export interface SelectComboboxOption {
  /** 값 (빈 문자열 허용 — "전체" 같은 기본 옵션) */
  value: string;
  /** 목록·트리거에 노출되는 라벨 */
  label: string;
  /** 라벨 오른쪽 보조 설명 (선택) */
  hint?: string;
  /** 그룹 헤더로 묶을 이름 (선택) */
  group?: string;
  /** 선택 불가 */
  disabled?: boolean;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectComboboxOption[];
  /** 선택값이 없을 때 트리거에 보여줄 문구 */
  placeholder?: string;
  ariaLabel?: string;
  /** 외부 라벨 element의 id (ariaLabel 대신) */
  labelledBy?: string;
  /** 검색창 노출 여부. "auto"(기본) → 옵션 8개 이상일 때만 노출 */
  searchable?: boolean | "auto";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  /** 라벨 외에 검색 대상으로 삼을 문자열 (예: 시군구 shortName) */
  matchKeys?: (opt: SelectComboboxOption) => string[];
}

/** searchable="auto" 기준 — 옵션이 이 개수 이상이면 검색창 노출 */
const AUTO_SEARCH_THRESHOLD = 8;
const PANEL_GAP = 6;
const VIEWPORT_EDGE = 8;
const MIN_PANEL_WIDTH = 240;

function normalize(text: string) {
  return text.trim().toLowerCase();
}

/**
 * 브랜드 디자인 셀렉트 + 타이핑 검색 공용 컴포넌트.
 *
 * native <select>는 OS 기본 팝업이 떠 브랜드와 어긋나고 검색도 불가능해 이 컴포넌트로 대체한다.
 * 드롭다운 패널은 항상 document.body 포털로 렌더 — 카드(overflow: hidden)·모달 안에서도
 * 잘리지 않게 하려는 목적. 위치는 트리거 좌표 기준으로 계산하고 스크롤·리사이즈마다 재계산한다.
 */
export function SelectCombobox({
  value,
  onChange,
  options,
  placeholder = "선택해 주세요",
  ariaLabel,
  labelledBy,
  searchable = "auto",
  size = "md",
  disabled = false,
  className,
  matchKeys,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const baseId = useId();
  const listId = `${baseId}-list`;

  const showSearch =
    searchable === "auto" ? options.length >= AUTO_SEARCH_THRESHOLD : searchable;

  const selected = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return options;
    return options.filter((opt) => {
      const keys = [opt.label, opt.hint ?? "", ...(matchKeys?.(opt) ?? [])];
      return keys.some((key) => normalize(key).includes(q));
    });
  }, [options, query, matchKeys]);

  // filtered가 줄어들어 activeIndex가 범위를 벗어나도 render에서 보정 (effect·setState 불필요)
  const safeActive =
    filtered.length === 0 ? -1 : Math.min(activeIndex, filtered.length - 1);

  /** 그룹 헤더를 섞은 렌더 순서 목록 */
  const rendered = useMemo(() => {
    const rows: Array<
      | { kind: "group"; label: string }
      | { kind: "option"; opt: SelectComboboxOption; index: number }
    > = [];
    let lastGroup: string | undefined;
    filtered.forEach((opt, index) => {
      if (opt.group && opt.group !== lastGroup) {
        rows.push({ kind: "group", label: opt.group });
        lastGroup = opt.group;
      }
      rows.push({ kind: "option", opt, index });
    });
    return rows;
  }, [filtered]);

  const closePanel = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openPanel = useCallback(() => {
    if (disabled) return;
    setQuery("");
    const idx = options.findIndex((opt) => opt.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  }, [disabled, options, value]);

  const selectOption = useCallback(
    (opt: SelectComboboxOption) => {
      if (opt.disabled) return;
      closePanel(true);
      if (opt.value !== value) onChange(opt.value);
    },
    [closePanel, onChange, value],
  );

  /** 트리거 좌표 기준 포털 패널 위치 계산 (아래 공간 부족 시 위로 플립) */
  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;

    const width = Math.min(
      Math.max(rect.width, MIN_PANEL_WIDTH),
      vw - VIEWPORT_EDGE * 2,
    );
    panel.style.width = `${width}px`;

    const height = panel.offsetHeight;
    const spaceBelow = vh - rect.bottom - PANEL_GAP - VIEWPORT_EDGE;
    const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_EDGE;
    const placeUp = height > spaceBelow && spaceAbove > spaceBelow;

    const rawTop = placeUp ? rect.top - PANEL_GAP - height : rect.bottom + PANEL_GAP;
    const top = Math.max(
      VIEWPORT_EDGE,
      Math.min(rawTop, vh - height - VIEWPORT_EDGE),
    );
    const left = Math.max(
      VIEWPORT_EDGE,
      Math.min(rect.left, vw - width - VIEWPORT_EDGE),
    );

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    panel.dataset.placement = placeUp ? "up" : "down";
    panel.dataset.ready = "true";
  }, []);

  // 위치 계산 + 스크롤·리사이즈 재계산 (query 변화로 높이가 바뀌어도 재계산)
  useEffect(() => {
    if (!open) return;
    positionPanel();

    const handle = () => positionPanel();
    // capture: true — 조상 스크롤 컨테이너(카드 그리드 등)까지 잡기 위해
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    window.visualViewport?.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
      window.visualViewport?.removeEventListener("resize", handle);
    };
  }, [open, query, positionPanel]);

  // 열릴 때 포커스. 모바일(hover: none)은 가상 키보드가 패널을 가려 자동 포커스 금지
  useEffect(() => {
    if (!open) return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (showSearch && canHover) inputRef.current?.focus();
    else listRef.current?.focus();
  }, [open, showSearch]);

  // 하이라이트 항목을 시야 안으로
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, safeActive, query]);

  // 바깥 클릭 시 닫기 (포커스는 뺏지 않음)
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closePanel(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, closePanel]);

  const moveActive = useCallback(
    (next: number) => {
      if (filtered.length === 0) return;
      const clamped = Math.max(0, Math.min(next, filtered.length - 1));
      setActiveIndex((prev) => (prev === clamped ? prev : clamped));
    },
    [filtered.length],
  );

  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveActive(safeActive + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveActive(safeActive - 1);
          break;
        case "Home":
          e.preventDefault();
          moveActive(0);
          break;
        case "End":
          e.preventDefault();
          moveActive(filtered.length - 1);
          break;
        case "Enter": {
          e.preventDefault();
          const opt = filtered[safeActive];
          if (opt) selectOption(opt);
          break;
        }
        case "Escape":
          e.preventDefault();
          closePanel(true);
          break;
        case "Tab":
          // 패널이 포털이라 Tab 순서가 어긋난다 — 닫고 트리거로 되돌린다
          e.preventDefault();
          closePanel(true);
          break;
        default:
          break;
      }
    },
    [closePanel, filtered, moveActive, safeActive, selectOption],
  );

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPanel();
      }
    },
    [openPanel],
  );

  const activeId = safeActive >= 0 ? `${listId}-opt-${safeActive}` : undefined;

  const list = (
    <div
      ref={listRef}
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-activedescendant={showSearch ? undefined : activeId}
      tabIndex={showSearch ? -1 : 0}
      className={s.list}
    >
      {rendered.map((row) =>
        row.kind === "group" ? (
          <div key={`g-${row.label}`} className={s.groupLabel}>
            {row.label}
          </div>
        ) : (
          <button
            key={row.opt.value || "__empty__"}
            type="button"
            id={`${listId}-opt-${row.index}`}
            role="option"
            aria-selected={row.opt.value === value}
            aria-disabled={row.opt.disabled || undefined}
            data-active={row.index === safeActive || undefined}
            className={s.option}
            tabIndex={-1}
            onClick={() => selectOption(row.opt)}
            onMouseMove={() => moveActive(row.index)}
          >
            <span className={s.optionLabel}>{row.opt.label}</span>
            {row.opt.hint && <span className={s.optionHint}>{row.opt.hint}</span>}
            {row.opt.value === value && (
              <Check size={16} className={s.optionCheck} aria-hidden="true" />
            )}
          </button>
        ),
      )}
      {filtered.length === 0 && <p className={s.noResult}>찾는 항목이 없어요</p>}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[s.trigger, className].filter(Boolean).join(" ")}
        data-size={size}
        data-open={open || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        disabled={disabled}
        onClick={() => (open ? closePanel(false) : openPanel())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={selected ? s.triggerValue : s.triggerPlaceholder}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={s.triggerIcon} aria-hidden="true" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className={s.panel}
            onKeyDown={handlePanelKeyDown}
          >
            {showSearch && (
              <div className={s.searchRow}>
                <Search size={16} className={s.searchIcon} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  className={s.searchInput}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  aria-label="검색"
                  autoComplete="off"
                  placeholder="검색"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                />
              </div>
            )}
            {list}
          </div>,
          document.body,
        )}
    </>
  );
}
