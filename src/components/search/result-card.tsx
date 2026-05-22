import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import type { SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import { CROPS } from "@/lib/data/crops";
import { getProgramById } from "@/lib/data/programs";
import { getEducationById } from "@/lib/data/education";
import { getEventById } from "@/lib/data/events";
import { getSigunguById } from "@/lib/data/sigungus";
import { getProvinceById } from "@/lib/data/regions";
import { STATIONS } from "@/lib/data/stations";
import { CENTERS } from "@/lib/data/centers";
import { interviews, INTERVIEW_CATEGORY_LABEL } from "@/lib/data/landing";
import { glossaryMap, CATEGORY_LABELS } from "@/lib/data/glossary";

import s from "./result-card.module.css";

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** YYYY-MM-DD 또는 YYYYMMDD → "D-N" 또는 "오늘 마감" (마감 지난 경우 null) */
function getDeadlineLabel(applicationEnd: string | undefined): string | null {
  if (!applicationEnd) return null;
  const raw = applicationEnd.replace(/-/g, "");
  if (raw.length !== 8) return null;
  // 9999 = 미정 페어
  if (raw.startsWith("9999")) return null;
  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(4, 6)) - 1;
  const d = Number(raw.slice(6, 8));
  const end = new Date(y, m, d);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diff < 0) return null;
  if (diff === 0) return "오늘 마감";
  return `D-${diff}`;
}

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

/** SearchItem id에서 sigungu lookup (id 형식: `${sidoId}-${sigunguId}`) */
function lookupRegionFromId(id: string): {
  kind: "sigungu" | "gu" | "station" | "unknown";
  data?: { provinceName: string; sigunguName?: string; mainCrops?: string[]; description?: string };
} {
  // station: 숫자 ID 만
  if (/^\d+$/.test(id)) {
    const station = STATIONS.find((st) => st.stnId === id);
    if (station) {
      return {
        kind: "station",
        data: { provinceName: station.province, description: station.description },
      };
    }
  }
  // sigungu: "sidoId-sigunguId"
  // gu: "sidoId-sigunguId-guId"
  const parts = id.split("-");
  if (parts.length >= 2) {
    const sidoId = parts[0];
    const sigunguId = parts[1];
    const province = getProvinceById(sidoId);
    const sigungu = getSigunguById(sigunguId);
    if (province && sigungu) {
      return {
        kind: parts.length === 3 ? "gu" : "sigungu",
        data: {
          provinceName: province.shortName ?? province.name,
          sigunguName: sigungu.shortName ?? sigungu.name,
          mainCrops: sigungu.mainCrops,
          description: sigungu.description,
        },
      };
    }
  }
  return { kind: "unknown" };
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------

interface ResultCardProps {
  item: SearchItem;
  query: string;
  highlightCls: string;
}

export function ResultCard({ item, query, highlightCls }: ResultCardProps) {
  // 시드 6종 안내 카드 — 별도 분기 (badge "안내" + id prefix)
  if (item.id.startsWith("sub-region-hint-")) {
    return renderHintCard(item, query, highlightCls);
  }

  switch (item.type) {
    case "crop":
      return renderCropCard(item, query, highlightCls);
    case "region":
      return renderRegionCard(item, query, highlightCls);
    case "program":
      return renderProgramCard(item, query, highlightCls);
    case "education":
      return renderEducationCard(item, query, highlightCls);
    case "event":
      return renderEventCard(item, query, highlightCls);
    case "interview":
      return renderInterviewCard(item, query, highlightCls);
    case "center":
      return renderCenterCard(item, query, highlightCls);
    case "glossary":
      return renderGlossaryCard(item, query, highlightCls);
    case "guide":
    case "land":
    default:
      return renderSimpleCard(item, query, highlightCls);
  }
}

// ---------------------------------------------------------------------------
// type별 렌더러
// ---------------------------------------------------------------------------

/** 단순 카드 (guide·land·fallback) — 기존 외형 유지 */
function renderSimpleCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  return wrapCard(
    item,
    s.cardBase,
    <>
      <span className={s.iconBox}>{item.icon}</span>
      <div className={s.simpleBody}>
        <span className={s.simpleTitle}>
          {highlightMatch(item.title, query, highlightCls)}
        </span>
        <span className={s.simpleSubtitle}>
          {highlightMatch(item.subtitle, query, highlightCls)}
        </span>
      </div>
      {item.external && <span className={s.externalBadge}><ExternalLink size={12} aria-hidden="true" />외부</span>}
      {item.badge && !item.external && <span className={s.badge}>{item.badge}</span>}
    </>,
  );
}

/** 시드 안내 카드 (sub-region-hint) */
function renderHintCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  return wrapCard(
    item,
    `${s.cardRich} ${s.cardHint}`,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      <span className={s.title}>{highlightMatch(item.title, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(item.subtitle, query, highlightCls)}</span>
      <span className={`${s.badge} ${s.badgeHint}`}>안내</span>
    </>,
  );
}

/** 작물 카드 — 가로형 요약 (emoji + name + description + category + difficulty) */
function renderCropCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const crop = CROPS.find((c) => c.id === item.id);
  if (!crop) return renderSimpleCard(item, query, highlightCls);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{crop.emoji}</span>
      <span className={s.title}>{highlightMatch(crop.name, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(crop.description, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChip}>난이도 {crop.difficulty}</span>
      </div>
      <span className={s.badge}>{crop.category}</span>
    </>,
  );
}

/** 지역 카드 — 시도·시군구·구·관측소 분기 */
function renderRegionCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const looked = lookupRegionFromId(item.id);
  // sigungu·gu만 풍부 카드 — station/unknown은 단순 카드로 fallback
  if (looked.kind === "sigungu" || looked.kind === "gu") {
    const d = looked.data!;
    const crops = d.mainCrops?.slice(0, 2) ?? [];
    const totalCrops = d.mainCrops?.length ?? 0;
    return wrapCard(
      item,
      s.cardRich,
      <>
        <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
        <span className={s.title}>{highlightMatch(item.title, query, highlightCls)}</span>
        <span className={s.subtitle}>{highlightMatch(d.description ?? "", query, highlightCls)}</span>
        <div className={s.metaRow}>
          <span className={s.metaChipMuted}>{d.provinceName}</span>
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
    );
  }
  if (looked.kind === "station" && looked.data) {
    const d = looked.data;
    return wrapCard(
      item,
      s.cardRich,
      <>
        <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
        <span className={s.title}>{highlightMatch(item.title, query, highlightCls)}</span>
        <span className={s.subtitle}>{highlightMatch(d.description ?? "", query, highlightCls)}</span>
        <div className={s.metaRow}>
          <span className={s.metaChipMuted}>{d.provinceName}</span>
          <span className={s.metaSep}>·</span>
          <span className={s.metaItem}>기상 관측소</span>
        </div>
      </>,
    );
  }
  return renderSimpleCard(item, query, highlightCls);
}

/** 지원사업 카드 — status + 지원금액 hero + 지역 + 지원유형 + D-N */
function renderProgramCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const prog = getProgramById(item.id);
  if (!prog) return renderSimpleCard(item, query, highlightCls);

  const deadline = getDeadlineLabel(prog.applicationEnd);
  const statusClass =
    prog.status === "모집중"
      ? s.badgeStatusOpen
      : prog.status === "모집예정"
        ? s.badgeStatusUpcoming
        : s.badgeStatusClosed;
  // supportAmount 텍스트가 너무 길면 1줄 truncate — CSS에서 line-clamp 처리.
  const amount = prog.supportAmount?.trim();

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      <span className={s.title}>{highlightMatch(prog.title, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(item.subtitle, query, highlightCls)}</span>
      {amount && (
        <span className={s.supportAmount}>{highlightMatch(amount, query, highlightCls)}</span>
      )}
      <div className={s.metaRow}>
        <span className={s.metaChipMuted}>{prog.region}</span>
        <span className={s.metaSep}>·</span>
        <span className={s.metaChip}>{prog.supportType}</span>
      </div>
      <div className={s.statusCorner}>
        {deadline && (
          <span className={s.badgeDeadline}>{deadline}</span>
        )}
        <span className={`${s.badge} ${statusClass}`}>{prog.status}</span>
      </div>
    </>,
  );
}

/** 교육 카드 — organization + 기간 + 지역 + level + 정원 */
function renderEducationCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const edu = getEducationById(item.id);
  if (!edu) return renderSimpleCard(item, query, highlightCls);

  const period = formatDateRange(edu.applicationStart, edu.applicationEnd);
  const statusClass =
    edu.status === "모집중"
      ? s.badgeStatusOpen
      : edu.status === "모집예정"
        ? s.badgeStatusUpcoming
        : s.badgeStatusClosed;

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      <span className={s.title}>{highlightMatch(edu.title, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(edu.organization, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChipMuted}>{edu.region}</span>
        {edu.duration && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{edu.duration}</span>
          </>
        )}
        {!edu.duration && period && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{period}</span>
          </>
        )}
        <span className={s.metaSep}>·</span>
        <span className={s.metaChip}>{edu.type}</span>
        <span className={s.metaChipMuted}>{edu.level}</span>
        {edu.capacity != null && edu.capacity > 0 && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>정원 {edu.capacity}명</span>
          </>
        )}
      </div>
      <span className={`${s.badge} ${statusClass}`}>{edu.status}</span>
    </>,
  );
}

/** 체험·행사 카드 — 행사일 + 지역 + 장소 + target */
function renderEventCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const ev = getEventById(item.id);
  if (!ev) return renderSimpleCard(item, query, highlightCls);

  const period = formatDateRange(ev.date, ev.dateEnd);
  const statusClass =
    ev.status === "접수중"
      ? s.badgeStatusOpen
      : ev.status === "접수예정"
        ? s.badgeStatusUpcoming
        : s.badgeStatusClosed;

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      <span className={s.title}>{highlightMatch(ev.title, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(item.subtitle, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChipMuted}>{ev.region}</span>
        {ev.location && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{ev.location}</span>
          </>
        )}
        {period && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{period}</span>
          </>
        )}
        {ev.target && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaChip}>{ev.target}</span>
          </>
        )}
      </div>
      <span className={`${s.badge} ${statusClass}`}>{ev.status}</span>
    </>,
  );
}

/** 인터뷰 카드 — 가로형 요약 (이름·지역 + quote + 작물 + 카테고리) */
function renderInterviewCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const iv = interviews.find((p) => p.id === item.id);
  if (!iv) return renderSimpleCard(item, query, highlightCls);

  const titleStr = `${iv.name} · ${iv.region}`;
  const quoteStr = `“${iv.quote}”`;
  const categoryLabel = INTERVIEW_CATEGORY_LABEL[iv.category];

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{"\u{1F464}"}</span>
      <span className={s.title}>{highlightMatch(titleStr, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(quoteStr, query, highlightCls)}</span>
      <div className={s.metaRow}>
        {iv.crop && (
          <>
            <span className={s.metaChip}>{iv.crop}</span>
          </>
        )}
        {iv.age && (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{iv.age}</span>
          </>
        )}
      </div>
      {categoryLabel && <span className={s.badge}>{categoryLabel}</span>}
    </>,
  );
}

/** 지자체 센터 카드 — sido/sigungu + 전화 + 카테고리(광역/시·군) */
function renderCenterCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const ctr = CENTERS.find((c) => c.id === item.id);
  if (!ctr) return renderSimpleCard(item, query, highlightCls);

  const where = [ctr.sido, ctr.sigungu].filter(Boolean).join(" ");
  const categoryLabel = ctr.category === "sido" ? "광역" : "시·군";

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      <span className={s.title}>{highlightMatch(ctr.name, query, highlightCls)}</span>
      <span className={s.subtitle}>{highlightMatch(where, query, highlightCls)}</span>
      <div className={s.metaRow}>
        <span className={s.metaChip}>{categoryLabel}</span>
        {ctr.phone ? (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>{ctr.phone}</span>
          </>
        ) : ctr.address ? (
          <>
            <span className={s.metaSep}>·</span>
            <span className={s.metaItem}>
              {ctr.address.length > 28 ? `${ctr.address.slice(0, 28)}…` : ctr.address}
            </span>
          </>
        ) : null}
      </div>
    </>,
  );
}

/** 용어 카드 — 용어 + 카테고리 + 짧은 설명 */
function renderGlossaryCard(item: SearchItem, query: string, highlightCls: string): ReactNode {
  const entry = glossaryMap.get(item.id);
  if (!entry) return renderSimpleCard(item, query, highlightCls);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      <span className={s.title}>{highlightMatch(entry.term, query, highlightCls)}</span>
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
  );
}

// ---------------------------------------------------------------------------
// Link / a wrapper
// ---------------------------------------------------------------------------

function wrapCard(item: SearchItem, className: string, inner: ReactNode): ReactNode {
  if (item.external) {
    return (
      <a
        key={`${item.type}-${item.id}`}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link key={`${item.type}-${item.id}`} href={item.href} className={className}>
      {inner}
    </Link>
  );
}
