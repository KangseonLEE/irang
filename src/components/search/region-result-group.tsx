import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import type { SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";

import { lookupRegionFromHref } from "./region-lookup";
import { ResultCard } from "./result-card";
import s from "./region-result-group.module.css";

/** 순위를 들고 다니는 지역 아이템 — 계측 라벨 `<type>:<순위>` 는 섹션 기준 1-based */
export interface RankedItem {
  item: SearchItem;
  rank: number;
}

/** 압축 행 한 줄 */
interface CompactRow extends RankedItem {
  name: string;
  description: string;
  crops: string[];
  /** 시·도 약칭 — 헤더 없는 평면 묶음에서만 접두로 노출 */
  sidoPrefix?: string;
  /** 상위 시·군 이름 (구) */
  parentName?: string;
}

type Block =
  | { kind: "card"; key: string; ranked: RankedItem }
  | { kind: "sido"; key: string; provinceId: string; label: string; rows: CompactRow[] }
  | { kind: "flat"; key: string; rows: CompactRow[] }
  | { kind: "station"; key: string; rows: CompactRow[] };

/** 압축을 켜는 하한 — 2건 이하는 카드 그대로가 더 눈에 띈다 */
const COMPACT_MIN_ROWS = 3;

/**
 * 지역 결과 — 시·도별 압축 묶음 (Phase C, 2026-09-26)
 *
 * "중구"·"동구" 처럼 동음이의 시·군·구가 6~30건 나오는 검색에서 같은 크기 카드가 세로로 쌓이면
 * 어느 시·도의 중구인지 한 줄씩 읽어야 했다. 압축 행으로 묶으면 같은 세로 공간에 두 배가 들어가고
 * "어느 도에 있나"가 스캔 한 번에 보인다.
 *
 * 묶는 방식은 건수에 따라 셋:
 *   - 시·군·구 3건 미만        → 압축하지 않는다 (정확 일치 1건이 행으로 작아지면 손해)
 *   - 한 시·도에 2건 이상      → 시·도 헤더 + 행 (헤더 우측 "비교하기")
 *   - 시·도마다 1건씩("중구")  → 헤더 없이 "서울 중구" 접두 행 (헤더가 행보다 많아지는 것 방지)
 *
 * 묶음 순서는 **첫 등장 순** — 관련도 신호(searchAll 정렬)를 보존한다.
 * 시·도 자체 카드·판정 실패 항목은 기존 `ResultCard` 그대로.
 */
export function RegionResultGroup({
  items,
  query,
  highlightCls,
  trackType = "region",
}: {
  items: RankedItem[];
  query: string;
  highlightCls: string;
  /** 계측 라벨의 타입 부분 — 직답 블록에서는 "pinned" */
  trackType?: string;
}): ReactNode {
  const looked = items.map((ranked) => ({
    ranked,
    info: ranked.item.id.startsWith("sub-region-hint-")
      ? ({ kind: "unknown" } as const)
      : lookupRegionFromHref(ranked.item.href),
  }));

  // 시·도별 시·군·구 건수 — 헤더를 달 만한 묶음인지 판정
  const perProvince = new Map<string, number>();
  let compactable = 0;
  for (const { info } of looked) {
    if ((info.kind === "sigungu" || info.kind === "gu") && info.provinceId) {
      perProvince.set(info.provinceId, (perProvince.get(info.provinceId) ?? 0) + 1);
      compactable += 1;
    }
  }
  const compress = compactable >= COMPACT_MIN_ROWS;

  const blocks: Block[] = [];
  const sidoIndex = new Map<string, Extract<Block, { kind: "sido" }>>();
  let stationBlock: Extract<Block, { kind: "station" }> | null = null;

  for (const { ranked, info } of looked) {
    const { item } = ranked;
    const key = `${item.type}-${item.id}`;

    if (info.kind === "station" && info.data) {
      const row: CompactRow = {
        ...ranked,
        name: item.title,
        description: info.data.description ?? item.subtitle,
        crops: [],
      };
      if (stationBlock) {
        stationBlock.rows.push(row);
      } else {
        stationBlock = { kind: "station", key: `station-${key}`, rows: [row] };
        blocks.push(stationBlock);
      }
      continue;
    }

    const groupable =
      compress && (info.kind === "sigungu" || info.kind === "gu") && info.data && info.provinceId;

    if (groupable && info.data && info.provinceId) {
      const many = (perProvince.get(info.provinceId) ?? 0) >= 2;
      const row: CompactRow = {
        ...ranked,
        name: item.title,
        description: info.data.description ?? item.subtitle,
        crops: (info.data.mainCrops ?? []).slice(0, 2),
        parentName: info.data.parentName,
        sidoPrefix: many ? undefined : info.data.provinceName,
      };

      if (many) {
        const existing = sidoIndex.get(info.provinceId);
        if (existing) {
          existing.rows.push(row);
        } else {
          const block: Extract<Block, { kind: "sido" }> = {
            kind: "sido",
            key: `sido-${info.provinceId}`,
            provinceId: info.provinceId,
            label: info.data.provinceName,
            rows: [row],
          };
          sidoIndex.set(info.provinceId, block);
          blocks.push(block);
        }
      } else {
        const last = blocks[blocks.length - 1];
        if (last?.kind === "flat") {
          last.rows.push(row);
        } else {
          blocks.push({ kind: "flat", key: `flat-${key}`, rows: [row] });
        }
      }
      continue;
    }

    // 시·도 자체 카드 · 안내 카드 · 판정 실패 · 압축 하한 미달 — 풍부 카드 그대로
    blocks.push({ kind: "card", key, ranked });
  }

  // 카드가 아닌 묶음은 **하나의 패널**로 이어 붙인다 — 묶음마다 테두리·여백을 두면
  // 12건에서 세로가 오히려 늘어난다(실측 945px → 목표 모바일 1화면 700px 이내).
  type Segment =
    | { kind: "card"; block: Extract<Block, { kind: "card" }> }
    | { kind: "panel"; blocks: Exclude<Block, { kind: "card" }>[] };
  const merged: Segment[] = [];
  for (const block of blocks) {
    if (block.kind === "card") {
      merged.push({ kind: "card", block });
      continue;
    }
    const last = merged[merged.length - 1];
    if (last?.kind === "panel") last.blocks.push(block);
    else merged.push({ kind: "panel", blocks: [block] });
  }
  const renderRows = (rows: CompactRow[]) => (
    <ul className={s.rows}>
      {rows.map((row) => (
        <li
          key={`${row.item.type}-${row.item.id}`}
          className={s.row}
          data-search-result={`${trackType}:${row.rank}`}
        >
          <Link href={row.item.href} className={s.rowLink} aria-label={row.name}>
            {row.sidoPrefix && <span className={s.rowSido}>{row.sidoPrefix}</span>}
            <span className={s.rowName}>{highlightMatch(row.name, query, highlightCls)}</span>
          </Link>
          {row.parentName && <span className={s.rowParent}>{row.parentName}</span>}
          <span className={s.rowDesc}>{highlightMatch(row.description, query, highlightCls)}</span>
          {row.crops.length > 0 && (
            <span className={s.rowCrops}>
              {row.crops.map((c) => (
                <span key={c} className={s.rowCrop}>{c}</span>
              ))}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={s.blocks}>
      {merged.map((seg, segIdx) => {
        if (seg.kind === "card") {
          return (
            <ResultCard
              key={seg.block.key}
              item={seg.block.ranked.item}
              query={query}
              highlightCls={highlightCls}
              rank={seg.block.ranked.rank}
              trackType={trackType}
            />
          );
        }

        return (
          <div key={`panel-${segIdx}`} className={s.panel}>
            {seg.blocks.map((block) => {
              if (block.kind === "flat") {
                return <div key={block.key}>{renderRows(block.rows)}</div>;
              }
              const isStation = block.kind === "station";
              return (
                <div key={block.key}>
                  <div className={s.groupHead}>
                    <h3 className={s.groupTitle}>
                      {isStation ? "기상 관측소" : block.label}
                      <span className={s.groupCount}>{block.rows.length}곳</span>
                    </h3>
                    {!isStation && (
                      <Link
                        href={`/regions/compare?regions=${block.provinceId}`}
                        className={s.compareLink}
                        aria-label={`${block.label} 지역 비교하기`}
                      >
                        비교하기
                        <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                  {renderRows(block.rows)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
