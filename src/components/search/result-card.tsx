import Link from "next/link";
import Image from "next/image";
import { ExternalLink, CalendarDays, Phone } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import type { SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import { CROPS } from "@/lib/data/crops";
import { getCropImageSrc, hasCropIllustration } from "@/lib/crop-image";
import { getProgramById } from "@/lib/data/programs";
import { getEducationById } from "@/lib/data/education";
import { getEventById } from "@/lib/data/events";
import { CENTERS } from "@/lib/data/centers";
import { interviews } from "@/lib/data/landing";
import { glossaryMap, CATEGORY_LABELS } from "@/lib/data/glossary";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

import { lookupRegionFromHref } from "./region-lookup";
import { InterviewResultCard } from "./interview-result-card";

import s from "./result-card.module.css";

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** 날짜 문자열을 "M.D" 또는 "M.D ~ M.D" 형식으로 포맷 */
function formatDateRange(start: string, end: string | null): string {
  const fmt = (raw: string): string | null => {
    const r = raw.replace(/-/g, "");
    if (r.length !== 8) return null;
    if (r.startsWith("9999")) return null;
    return `${Number(r.slice(4, 6))}.${Number(r.slice(6, 8))}`;
  };
  const s1 = fmt(start);
  if (!s1) return "";
  if (!end) return s1;
  const s2 = fmt(end);
  if (!s2 || s2 === s1) return s1;
  return `${s1} ~ ${s2}`;
}

/**
 * 안전한 외부 URL만 통과 (2026-09-17 보안 점검과 같은 가드).
 * 허용 프로토콜 밖이면 링크를 만들지 않는다 — React 19 는 `javascript:` 에 렌더 예외를 던져
 * XSS 보다 **가용성**이 먼저 깨진다.
 */
function safeHttpUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * 일정형 메타 행 (Phase C, 2026-09-26) — 교육·체험행사가 같은 행 구조를 쓴다.
 * 순서는 사용자가 먼저 묻는 것부터: 기간 → 지역·장소 → 유형·대상 → 정원.
 * (이전엔 두 렌더러가 지역 먼저/기간 먼저로 갈라져 같은 정보가 다른 자리에 있었다.)
 */
interface ScheduleMeta {
  /** "3.1 ~ 5.2" 또는 "4주 과정" */
  period?: string;
  /** 시·도 또는 "전국" */
  region?: string;
  /** 개최 장소 (체험·행사) */
  place?: string;
  /** 유형·대상 — primary 칩 */
  tags?: (string | undefined)[];
  /** 수준 등 보조 칩 */
  muted?: (string | undefined)[];
  capacity?: number | null;
}

function renderScheduleMeta({ period, region, place, tags, muted, capacity }: ScheduleMeta): ReactNode {
  const chips = (tags ?? []).filter(Boolean) as string[];
  const mutedChips = (muted ?? []).filter(Boolean) as string[];
  const rest: ReactNode[] = [];
  if (region) rest.push(<span key="region" className={s.metaChipMuted}>{region}</span>);
  if (place) rest.push(<span key="place" className={s.metaItem}>{place}</span>);
  for (const t of chips) rest.push(<span key={`t-${t}`} className={s.metaChip}>{t}</span>);
  for (const m of mutedChips) rest.push(<span key={`m-${m}`} className={s.metaChipMuted}>{m}</span>);
  if (capacity != null && capacity > 0) {
    rest.push(<span key="cap" className={s.metaItem}>정원 {capacity}명</span>);
  }

  return (
    <div className={s.metaRow}>
      {period && (
        <span className={s.metaPeriod}>
          <CalendarDays size={14} aria-hidden="true" />
          {period}
        </span>
      )}
      {rest.map((node, i) => (
        <Fragment key={i}>
          {(period || i > 0) && <span className={s.metaSep} aria-hidden="true">·</span>}
          {node}
        </Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------

interface ResultCardProps {
  item: SearchItem;
  query: string;
  highlightCls: string;
  /** 섹션 안 1-based 순위 — 계측 라벨 `<type>:<rank>` 에 쓰인다 */
  rank?: number;
  /** 계측 라벨의 타입 부분 override (결과 없음 힌트 카드는 "hint") */
  trackType?: string;
}

export function ResultCard({ item, query, highlightCls, rank, trackType }: ResultCardProps) {
  const track = rank != null ? `${trackType ?? item.type}:${rank}` : undefined;

  // 시드 6종 안내 카드 — 별도 분기 (badge "안내" + id prefix)
  if (item.id.startsWith("sub-region-hint-")) {
    return renderHintCard(item, query, highlightCls, track);
  }

  switch (item.type) {
    case "crop":
      return renderCropCard(item, query, highlightCls, track);
    case "region":
      return renderRegionCard(item, query, highlightCls, track);
    case "program":
      return renderProgramCard(item, query, highlightCls, track);
    case "education":
      return renderEducationCard(item, query, highlightCls, track);
    case "event":
      return renderEventCard(item, query, highlightCls, track);
    case "interview":
      return renderInterviewCard(item, query, highlightCls, track);
    case "center":
      return renderCenterCard(item, query, highlightCls, track);
    case "glossary":
      return renderGlossaryCard(item, query, highlightCls, track);
    case "guide":
    case "land":
    default:
      return renderSimpleCard(item, query, highlightCls, track);
  }
}

// ---------------------------------------------------------------------------
// type별 렌더러
// ---------------------------------------------------------------------------

/** 단순 카드 (guide·land·fallback) — 기존 외형 유지 */
function renderSimpleCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  return wrapCard(
    item,
    s.cardBase,
    <>
      <span className={s.iconBox}>{item.icon}</span>
      <div className={s.simpleBody}>
        {titleLink(item, item.title, s.stretchLink, (
          <span className={s.simpleTitle}>
            {highlightMatch(item.title, query, highlightCls)}
          </span>
        ))}
        <span className={s.simpleSubtitle}>
          {highlightMatch(item.subtitle, query, highlightCls)}
        </span>
      </div>
      {item.external && <span className={s.externalBadge}><ExternalLink size={12} aria-hidden="true" />외부</span>}
      {item.badge && !item.external && <span className={s.badge}>{item.badge}</span>}
    </>,
    track,
  );
}

/** 시드 안내 카드 (sub-region-hint) */
function renderHintCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  return wrapCard(
    item,
    `${s.cardRich} ${s.cardHint}`,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, item.title, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(item.subtitle, query, highlightCls)}</span>
      <span className={`${s.badge} ${s.badgeHint}`}>안내</span>
    </>,
    track,
  );
}

/** 작물 카드 — 가로형 요약 (emoji + name + description + category + difficulty) */
function renderCropCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const crop = CROPS.find((c) => c.id === item.id);
  if (!crop) return renderSimpleCard(item, query, highlightCls, track);

  return wrapCard(
    item,
    s.cardRich,
    <>
      {hasCropIllustration(crop.id) ? (
        <span className={s.iconBoxThumb} aria-hidden="true">
          <Image src={getCropImageSrc(crop.id)} alt="" width={44} height={44} />
        </span>
      ) : (
        <span className={s.iconBox} aria-hidden="true">{crop.emoji}</span>
      )}
      {richTitle(item, crop.name, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(crop.description, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <DifficultyBadge level={crop.difficulty} size="sm" />
      </div>
      <span className={s.badge}>{crop.category}</span>
    </>,
    track,
  );
}

/** 지역 카드 — 시도·시군구·구·관측소 분기 */
function renderRegionCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const looked = lookupRegionFromHref(item.href);
  if (looked.kind === "unknown" || !looked.data) {
    return renderSimpleCard(item, query, highlightCls, track);
  }
  const d = looked.data;

  // 시·도 — 시·군·구 수 + 대표 작물로 "이 안에 무엇이 있나"를 먼저 보여준다
  if (looked.kind === "province") {
    return wrapCard(
      item,
      s.cardRich,
      <>
        <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
        {richTitle(item, item.title, query, highlightCls)}
        <span className={s.subtitle}>{highlightMatch(d.description ?? "", query, highlightCls)}</span>
        <div className={s.metaRow}>
          <span className={s.metaChipMuted}>{d.provinceFullName ?? d.provinceName}</span>
          {d.sigunguCount != null && d.sigunguCount > 0 && (
            <>
              <span className={s.metaSep}>·</span>
              <span className={s.metaItem}>시·군·구 {d.sigunguCount}곳</span>
            </>
          )}
          {(d.mainCrops ?? []).length > 0 && (
            <>
              <span className={s.metaSep}>·</span>
              {(d.mainCrops ?? []).map((c) => (
                <span key={c} className={s.metaChip}>{c}</span>
              ))}
            </>
          )}
        </div>
      </>,
      track,
    );
  }

  if (looked.kind === "station") {
    return wrapCard(
      item,
      s.cardRich,
      <>
        <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
        {richTitle(item, item.title, query, highlightCls)}
        <span className={s.subtitle}>{highlightMatch(d.description ?? "", query, highlightCls)}</span>
        <div className={s.metaRow}>
          <span className={s.metaChipMuted}>{d.provinceName}</span>
          <span className={s.metaSep}>·</span>
          <span className={s.metaItem}>기상 관측소</span>
        </div>
      </>,
      track,
    );
  }

  // 시·군·구 · 구
  const crops = d.mainCrops?.slice(0, 2) ?? [];
  const totalCrops = d.mainCrops?.length ?? 0;
  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, item.title, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(d.description ?? "", query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChipMuted}>{d.provinceName}</span>
        {d.parentName && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{d.parentName}</span>
          </>
        )}
        {crops.length > 0 && (
          <>
            <span className={s.metaSep}>·</span>
            {crops.map((c) => (
              <span key={c} className={s.metaChip}>{c}</span>
            ))}
            {totalCrops > crops.length && (
              <span className={s.metaItem}>+{totalCrops - crops.length}</span>
            )}
          </>
        )}
      </div>
    </>,
    track,
  );
}

/** 지원사업 카드 — status + 지원금액 hero + 지역 + 지원유형 + 마감 임박 */
function renderProgramCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const prog = getProgramById(item.id);
  if (!prog) return renderSimpleCard(item, query, highlightCls, track);

  // supportAmount 텍스트가 너무 길면 1줄 truncate — CSS에서 line-clamp 처리.
  const amount = prog.supportAmount?.trim();

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, prog.title, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(item.subtitle, query, highlightCls)}</span>
      {amount && (
        <span className={s.supportAmount}>{highlightMatch(amount, query, highlightCls)}</span>
      )}
      <div className={s.metaRow}>
        <span className={s.metaChipMuted}>{prog.region}</span>
        <span className={s.metaSep}>·</span>
        <SupportTypeBadge type={prog.supportType} />
      </div>
      <div className={s.statusCorner}>
        <DeadlineBadge applicationEnd={prog.applicationEnd} status={prog.status} />
        <StatusBadge status={prog.status} />
      </div>
    </>,
    track,
  );
}

/** 교육 카드 — organization + 일정형 메타 행(기간·지역·유형·정원) */
function renderEducationCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const edu = getEducationById(item.id);
  if (!edu) return renderSimpleCard(item, query, highlightCls, track);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, edu.title, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(edu.organization, query, highlightCls)}</span>
      {renderScheduleMeta({
        period: edu.duration || formatDateRange(edu.applicationStart, edu.applicationEnd),
        region: edu.region,
        tags: [edu.type],
        muted: [edu.level],
        capacity: edu.capacity,
      })}
      <div className={s.statusCorner}>
        <StatusBadge status={edu.status} />
      </div>
    </>,
    track,
  );
}

/** 체험·행사 카드 — 일정형 메타 행(행사일·지역·장소·대상) */
function renderEventCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const ev = getEventById(item.id);
  if (!ev) return renderSimpleCard(item, query, highlightCls, track);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, ev.title, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(item.subtitle, query, highlightCls)}</span>
      {renderScheduleMeta({
        period: formatDateRange(ev.date, ev.dateEnd),
        region: ev.region,
        place: ev.location,
        tags: [ev.target],
      })}
      <div className={s.statusCorner}>
        <StatusBadge status={ev.status} />
      </div>
    </>,
    track,
  );
}

/** 인터뷰 — 인물 카드 전용 컴포넌트에 위임 (일러 썸네일 + 인용구) */
function renderInterviewCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const iv = interviews.find((p) => p.id === item.id);
  if (!iv) return renderSimpleCard(item, query, highlightCls, track);
  return (
    <InterviewResultCard
      person={iv}
      href={item.href}
      query={query}
      highlightCls={highlightCls}
      track={track}
    />
  );
}

/**
 * 지자체 센터 카드 — 지역 + 보조 액션(전화·홈페이지).
 * 제목은 센터 목록(내부)으로 가고, 전화·홈페이지는 stretched link 위에 올려 따로 눌린다.
 */
function renderCenterCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const ctr = CENTERS.find((c) => c.id === item.id);
  if (!ctr) return renderSimpleCard(item, query, highlightCls, track);

  const where = [ctr.sido, ctr.sigungu].filter(Boolean).join(" ");
  const categoryLabel = ctr.category === "sido" ? "광역" : "시·군";
  const site = safeHttpUrl(ctr.url);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, ctr.name, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(where, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChip}>{categoryLabel}</span>
        {ctr.address && (
          <>
            <span className={s.metaSep} aria-hidden="true">·</span>
            <span className={s.metaItem}>
              {ctr.address.length > 28 ? `${ctr.address.slice(0, 28)}…` : ctr.address}
            </span>
          </>
        )}
      </div>
      <div className={s.actionRow}>
        {ctr.phone && (
          <a href={`tel:${ctr.phone.replace(/[^0-9+]/g, "")}`} className={s.cardAction}>
            <Phone size={14} aria-hidden="true" />
            {ctr.phone}
          </a>
        )}
        {site && (
          <a
            href={site}
            target="_blank"
            rel="noopener noreferrer"
            className={s.cardAction}
            aria-label={`${ctr.name} 홈페이지 (새 창)`}
          >
            <ExternalLink size={14} aria-hidden="true" />
            홈페이지
          </a>
        )}
      </div>
    </>,
    track,
  );
}

/** 용어 카드 — 용어 + 카테고리 + 짧은 설명 */
function renderGlossaryCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const entry = glossaryMap.get(item.id);
  if (!entry) return renderSimpleCard(item, query, highlightCls, track);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, entry.term, query, highlightCls)}
      <span className={s.subtitle}>{highlightMatch(entry.shortDesc, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChip}>{CATEGORY_LABELS[entry.category]}</span>
        {entry.aliases && entry.aliases.length > 0 && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>= {entry.aliases.slice(0, 2).join(", ")}</span>
          </>
        )}
      </div>
    </>,
    track,
  );
}

// ---------------------------------------------------------------------------
// 카드 껍데기 — article + 제목 stretched link
// ---------------------------------------------------------------------------

/**
 * 제목 링크. 카드 전체가 클릭 영역이 되도록 `::after` 로 카드를 덮는다(stretched link).
 * 보조 액션(전화·신청·원문)은 `.cardAction` 으로 이 오버레이 위에 올린다.
 *
 * `aria-label` 에는 하이라이트 `<mark>` 를 뺀 평문 제목을 넣는다 — 스크린리더가 잘린
 * 토막으로 읽지 않도록.
 */
function titleLink(
  item: SearchItem,
  titleText: string,
  className: string,
  inner: ReactNode,
): ReactNode {
  if (item.external) {
    const safe = safeHttpUrl(item.href);
    // 허용 프로토콜 밖이면 링크를 만들지 않는다 (렌더 예외 차단)
    if (!safe) return <span className={className}>{inner}</span>;
    return (
      <a
        href={safe}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={titleText}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} aria-label={titleText}>
      {inner}
    </Link>
  );
}

/** 풍부 카드(.cardRich)의 제목 셀 — grid-column 2 + stretched link */
function richTitle(
  item: SearchItem,
  titleText: string,
  query: string,
  highlightCls: string,
): ReactNode {
  return titleLink(
    item,
    titleText,
    s.titleCell,
    <span className={s.title}>{highlightMatch(titleText, query, highlightCls)}</span>,
  );
}

function wrapCard(
  item: SearchItem,
  className: string,
  inner: ReactNode,
  track?: string,
): ReactNode {
  return (
    <article
      key={`${item.type}-${item.id}`}
      className={className}
      data-search-result={track}
    >
      {inner}
    </article>
  );
}
