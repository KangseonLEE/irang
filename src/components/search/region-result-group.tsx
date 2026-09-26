"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { analytics } from "@/lib/analytics";
import type { SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";

import { lookupRegionFromHref } from "./region-lookup";
import { ResultCard } from "./result-card";
import { SectionPager } from "./section-pager";
import s from "./region-result-group.module.css";

/** 순위를 들고 다니는 지역 아이템 — 계측 라벨 `<type>:<순위>` 는 섹션 기준 1-based */
export interface RankedItem {
  item: SearchItem;
  rank: number;
}

/** 시·군·구 한 줄 */
interface Row extends RankedItem {
  /** React key — `<type>-<id>` */
  key: string;
  name: string;
  description: string;
  crops: string[];
  /** 상위 시·군 이름 (구) */
  parentName?: string;
  /** 묶음 키 — 시·도 id 또는 "station" */
  groupKey: string;
  groupLabel: string;
  /** 비교하기 링크용 — 관측소 묶음은 없다 */
  provinceId?: string;
}

/** 페이지네이션이 세는 단위 — 행만 센다(카드는 뒤따르는 행과 같은 페이지에 붙는다) */
type Unit =
  | { kind: "card"; key: string; ranked: RankedItem }
  | { kind: "row"; key: string; row: Row };

const STATION_KEY = "station";

/**
 * 지역 결과 — 전부 시·도로 묶고 5건씩 페이지로 넘긴다 (회장 결재 2026-09-27)
 *
 * 9/26 판은 40px 압축 행 + "한 시·도에 2건 이상일 때만 묶기"였다. 1건짜리 시·도(포천·예산·안동)가
 * 헤더 없이 순위 자리에 끼어 **묶음 규칙이 읽히지 않았고**, 행이 눌려 손으로 쓰기 불편했다.
 * 이번 판:
 *   - 시·군·구는 건수와 무관하게 전부 시·도 헤더(이름 + "N곳") 아래. "비교하기"는 2곳 이상일 때만.
 *   - 행을 키운다 — 이름 16px/700, 설명 1줄, 우측 작물 칩 2개 + chevron. 행 전체가 링크.
 *   - 한 페이지 5행 + 하단 페이지네이션. 세로를 12건 압축으로 벌던 것을 페이지로 번다.
 * 시·도 자체 카드(직답 hoist)·읍·면·동 안내는 기존대로 풍부 카드, 관측소는 한 묶음.
 *
 * 묶음 순서는 **첫 등장 순** — 관련도 신호(searchAll 정렬)를 보존한다.
 */
export function RegionResultGroup({
  items,
  query,
  highlightCls,
  trackType = "region",
  pageSize,
}: {
  items: RankedItem[];
  query: string;
  highlightCls: string;
  /** 계측 라벨의 타입 부분 — 직답 블록에서는 "pinned" */
  trackType?: string;
  /** 주면 이 행 수마다 페이지를 나눈다. 직답 블록(1~2건)은 주지 않는다 */
  pageSize?: number;
}): ReactNode {
  const { units, groupTotals } = useMemo(() => buildUnits(items), [items]);
  const pages = useMemo(
    () => (pageSize && pageSize > 0 ? paginateUnits(units, pageSize) : [units]),
    [units, pageSize],
  );

  // 검색어·결과가 바뀌면 1페이지로. useEffect 대신 render 중 비교 (React 공식 prop→state sync)
  const resetKey = `${query}|${items.length}|${items[0]?.item.id ?? ""}`;
  const [pageState, setPageState] = useState({ key: resetKey, page: 0 });
  if (pageState.key !== resetKey) setPageState({ key: resetKey, page: 0 });
  const page = Math.min(pageState.key === resetKey ? pageState.page : 0, pages.length - 1);

  const goto = (next: number) => {
    setPageState({ key: resetKey, page: next });
    analytics.searchSectionPage("region", next + 1);
  };

  return (
    <>
      <div className={s.blocks}>
        {toSegments(pages[page] ?? []).map((seg, segIdx) => {
          if (seg.kind === "card") {
            return (
              <ResultCard
                key={seg.unit.key}
                item={seg.unit.ranked.item}
                query={query}
                highlightCls={highlightCls}
                rank={seg.unit.ranked.rank}
                trackType={trackType}
              />
            );
          }

          return (
            <div key={`panel-${segIdx}`} className={s.panel}>
              {seg.groups.map((group) => {
                const isStation = group.key === STATION_KEY;
                const total = groupTotals.get(group.key) ?? group.rows.length;
                return (
                  <div key={`${group.key}-${group.rows[0].key}`} className={s.group}>
                    <div className={s.groupHead}>
                      <h3 className={s.groupTitle}>
                        {group.label}
                        <span className={s.groupCount}>{total}곳</span>
                      </h3>
                      {!isStation && group.provinceId && total >= 2 && (
                        <Link
                          href={`/regions/compare?regions=${group.provinceId}`}
                          className={s.compareLink}
                          aria-label={`${group.label} 지역 비교하기`}
                        >
                          비교하기
                          <ChevronRight size={14} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                    <ul className={s.rows}>
                      {group.rows.map((row) => (
                        <li
                          key={row.key}
                          className={s.row}
                          data-search-result={`${trackType}:${row.rank}`}
                        >
                          <span className={s.rowHead}>
                            <Link
                              href={row.item.href}
                              className={s.rowLink}
                              aria-label={row.name}
                            >
                              {highlightMatch(row.name, query, highlightCls)}
                            </Link>
                            {row.parentName && (
                              <span className={s.rowParent}>{row.parentName}</span>
                            )}
                          </span>
                          <span className={s.rowDesc}>
                            {highlightMatch(row.description, query, highlightCls)}
                          </span>
                          <span className={s.rowMeta}>
                            {row.crops.length > 0 && (
                              <span className={s.rowCrops}>
                                {row.crops.map((c) => (
                                  <span key={c} className={s.rowCrop}>
                                    {c}
                                  </span>
                                ))}
                              </span>
                            )}
                            <ChevronRight
                              size={20}
                              className={s.rowChevron}
                              aria-hidden="true"
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <SectionPager page={page} total={pages.length} onChange={goto} ariaLabel="지역 결과 페이지" />
    </>
  );
}

/**
 * 결과 → 카드/행 시퀀스 + 시·도별 전체 건수(헤더 "N곳" 은 페이지와 무관하게 총계).
 *
 * 같은 시·도의 행은 **첫 등장 위치의 한 묶음으로 모은다** — 순위상 떨어져 있어도 헤더가
 * 두 번 생기지 않는다(9/26 정책 유지). 그래서 유닛 시퀀스는 "묶음 단위로 연속"이고,
 * 페이지를 잘라도 조각난 묶음만 다음 페이지에서 헤더를 다시 얻는다.
 */
function buildUnits(items: RankedItem[]): {
  units: Unit[];
  groupTotals: Map<string, number>;
} {
  type Block =
    | { kind: "card"; key: string; ranked: RankedItem }
    | { kind: "group"; rows: Row[] };

  const blocks: Block[] = [];
  const groupIndex = new Map<string, Extract<Block, { kind: "group" }>>();

  const pushRow = (row: Row) => {
    const existing = groupIndex.get(row.groupKey);
    if (existing) {
      existing.rows.push(row);
      return;
    }
    const block: Extract<Block, { kind: "group" }> = { kind: "group", rows: [row] };
    groupIndex.set(row.groupKey, block);
    blocks.push(block);
  };

  for (const ranked of items) {
    const { item } = ranked;
    const key = `${item.type}-${item.id}`;
    const info = item.id.startsWith("sub-region-hint-")
      ? ({ kind: "unknown" } as const)
      : lookupRegionFromHref(item.href);

    if (info.kind === "station" && info.data) {
      pushRow({
        ...ranked,
        key,
        name: item.title,
        description: info.data.description ?? item.subtitle,
        crops: [],
        groupKey: STATION_KEY,
        groupLabel: "기상 관측소",
      });
      continue;
    }

    if ((info.kind === "sigungu" || info.kind === "gu") && info.data && info.provinceId) {
      pushRow({
        ...ranked,
        key,
        name: item.title,
        description: info.data.description ?? item.subtitle,
        crops: (info.data.mainCrops ?? []).slice(0, 2),
        parentName: info.data.parentName,
        groupKey: info.provinceId,
        groupLabel: info.data.provinceName,
        provinceId: info.provinceId,
      });
      continue;
    }

    // 시·도 자체 카드 · 읍·면·동 안내 · 판정 실패 — 풍부 카드 그대로
    blocks.push({ kind: "card", key, ranked });
  }

  const units: Unit[] = [];
  const groupTotals = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind === "card") {
      units.push({ kind: "card", key: block.key, ranked: block.ranked });
      continue;
    }
    groupTotals.set(block.rows[0].groupKey, block.rows.length);
    for (const row of block.rows) units.push({ kind: "row", key: row.key, row });
  }

  return { units, groupTotals };
}

/**
 * 행 5개마다 페이지를 끊는다. 카드는 세지 않고 뒤따르는 행과 같은 페이지에 붙는다.
 * 시·도 묶음은 잘려도 되고, 잘린 쪽은 다음 페이지에서 헤더가 다시 붙는다(페이지별로 다시 묶으므로).
 */
function paginateUnits(units: Unit[], pageSize: number): Unit[][] {
  const pages: Unit[][] = [];
  let current: Unit[] = [];
  let rows = 0;

  for (const unit of units) {
    if (unit.kind === "row" && rows === pageSize) {
      pages.push(current);
      current = [];
      rows = 0;
    }
    current.push(unit);
    if (unit.kind === "row") rows += 1;
  }
  if (current.length > 0) pages.push(current);
  return pages.length > 0 ? pages : [[]];
}

interface RowGroup {
  key: string;
  label: string;
  provinceId?: string;
  rows: Row[];
}

type Segment =
  | { kind: "card"; unit: Extract<Unit, { kind: "card" }> }
  | { kind: "panel"; groups: RowGroup[] };

/**
 * 한 페이지의 유닛 → 카드 / 묶음 패널 세그먼트.
 *
 * 연속된 행을 묶음 키로 접고, 연속된 묶음들은 **한 장의 패널**로 이어 붙인다 —
 * 묶음마다 테두리·여백을 두면 5행에서도 세로가 불필요하게 늘어난다.
 */
function toSegments(units: Unit[]): Segment[] {
  const segments: Segment[] = [];

  for (const unit of units) {
    if (unit.kind === "card") {
      segments.push({ kind: "card", unit });
      continue;
    }
    const last = segments[segments.length - 1];
    if (last?.kind === "panel") {
      const lastGroup = last.groups[last.groups.length - 1];
      if (lastGroup.key === unit.row.groupKey) {
        lastGroup.rows.push(unit.row);
      } else {
        last.groups.push({
          key: unit.row.groupKey,
          label: unit.row.groupLabel,
          provinceId: unit.row.provinceId,
          rows: [unit.row],
        });
      }
    } else {
      segments.push({
        kind: "panel",
        groups: [
          {
            key: unit.row.groupKey,
            label: unit.row.groupLabel,
            provinceId: unit.row.provinceId,
            rows: [unit.row],
          },
        ],
      });
    }
  }

  return segments;
}

/**
 * 페이지 버튼 창 — 5페이지 이하는 전부, 넘으면 처음·현재±1·마지막.
 * 최대 버튼 5개(+… 2개)로 묶는 이유는 375px 폭에서 "이전/다음"까지 한 줄에 들어가야 해서다.
 */
