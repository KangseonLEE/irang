import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import type { SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import { CROPS } from "@/lib/data/crops";
import { getCropImageSrc, hasCropIllustration } from "@/lib/crop-image";
import { getProgramById } from "@/lib/data/programs";
import { getEducationById } from "@/lib/data/education";
import { getEventById } from "@/lib/data/events";
import { getSigunguBySidoAndId, getSigungusBySidoId } from "@/lib/data/sigungus";
import { getGuByIds } from "@/lib/data/gus";
import { getProvinceById } from "@/lib/data/regions";
import { STATIONS } from "@/lib/data/stations";
import { CENTERS } from "@/lib/data/centers";
import { interviews, INTERVIEW_CATEGORY_LABEL } from "@/lib/data/landing";
import { glossaryMap, CATEGORY_LABELS } from "@/lib/data/glossary";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

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

interface RegionLookup {
  kind: "province" | "sigungu" | "gu" | "station" | "unknown";
  data?: {
    /** 시·도 약칭 */
    provinceName: string;
    /** 시·도 정식 명칭 (province 카드에서만 사용) */
    provinceFullName?: string;
    /** 상위 시·군·구 이름 (구 카드) */
    parentName?: string;
    mainCrops?: string[];
    description?: string;
    /** 소속 시·군·구 수 (province 카드) */
    sigunguCount?: number;
  };
}

/**
 * SearchItem 의 href 로 지역 종류를 판정한다.
 *
 * id 의 하이픈 split 은 못 쓴다 — `jung-gu-seoul`·`gwangju-gg`·`goseong-gw`·`sejong-si` 처럼
 * **id 자체에 하이픈이 든 시·군·구 31건과 구 32건 전부**가 어긋나 풍부 카드로 못 그렸다
 * (`province-jeonnam` 시·도 hoist 도 마찬가지). href 는 라우트 구조라 경계가 명확하다.
 *
 *   /regions/{sido}                    → 시·도
 *   /regions/{sido}/{sigungu}          → 시·군·구
 *   /regions/{sido}/{sigungu}/{gu}     → 구
 *   /regions?stations={stnId}          → 기상 관측소
 */
function lookupRegionFromHref(href: string): RegionLookup {
  const [path, queryString] = href.split("?");

  if (path === "/regions" && queryString) {
    const stnId = new URLSearchParams(queryString).get("stations");
    const station = stnId ? STATIONS.find((st) => st.stnId === stnId) : undefined;
    if (station) {
      return {
        kind: "station",
        data: { provinceName: station.province, description: station.description },
      };
    }
    return { kind: "unknown" };
  }

  const segs = path.split("/").filter(Boolean);
  if (segs[0] !== "regions" || segs.length < 2) return { kind: "unknown" };

  const province = getProvinceById(segs[1]);
  if (!province) return { kind: "unknown" };
  const provinceName = province.shortName ?? province.name;

  // 시·도 — 소속 시·군·구 수 + 대표 작물(빈도 상위)
  if (segs.length === 2) {
    const sigungus = getSigungusBySidoId(province.id);
    const freq = new Map<string, number>();
    for (const sg of sigungus) {
      for (const crop of sg.mainCrops) freq.set(crop, (freq.get(crop) ?? 0) + 1);
    }
    const mainCrops = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([crop]) => crop);
    return {
      kind: "province",
      data: {
        provinceName,
        provinceFullName: province.name,
        description: province.description,
        mainCrops,
        sigunguCount: sigungus.length,
      },
    };
  }

  const sigungu = getSigunguBySidoAndId(province.id, segs[2]);
  if (!sigungu) return { kind: "unknown" };

  // 구 — 자기 설명·작물을 쓰고, 메타에 상위 시 이름을 함께 노출
  if (segs.length >= 4) {
    const gu = getGuByIds(province.id, sigungu.id, segs[3]);
    if (!gu) return { kind: "unknown" };
    return {
      kind: "gu",
      data: {
        provinceName,
        parentName: sigungu.shortName ?? sigungu.name,
        description: gu.description,
        mainCrops: gu.mainCrops,
      },
    };
  }

  return {
    kind: "sigungu",
    data: {
      provinceName,
      description: sigungu.description,
      mainCrops: sigungu.mainCrops,
    },
  };
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

/** 교육 카드 — organization + 기간 + 지역 + level + 정원 */
function renderEducationCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const edu = getEducationById(item.id);
  if (!edu) return renderSimpleCard(item, query, highlightCls, track);

  const period = formatDateRange(edu.applicationStart, edu.applicationEnd);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, edu.title, query, highlightCls)}
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
      <div className={s.statusCorner}>
        <StatusBadge status={edu.status} />
      </div>
    </>,
    track,
  );
}

/** 체험·행사 카드 — 행사일 + 지역 + 장소 + target */
function renderEventCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const ev = getEventById(item.id);
  if (!ev) return renderSimpleCard(item, query, highlightCls, track);

  const period = formatDateRange(ev.date, ev.dateEnd);

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, ev.title, query, highlightCls)}
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
      <div className={s.statusCorner}>
        <StatusBadge status={ev.status} />
      </div>
    </>,
    track,
  );
}

/** 인터뷰 카드 — 가로형 요약 (이름·지역 + quote + 작물 + 카테고리) */
function renderInterviewCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const iv = interviews.find((p) => p.id === item.id);
  if (!iv) return renderSimpleCard(item, query, highlightCls, track);

  const titleStr = `${iv.name} · ${iv.region}`;
  const quoteStr = `“${iv.quote}”`;
  const categoryLabel = INTERVIEW_CATEGORY_LABEL[iv.category];

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{"\u{1F464}"}</span>
      {richTitle(item, titleStr, query, highlightCls)}
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
    track,
  );
}

/** 지자체 센터 카드 — sido/sigungu + 전화 + 카테고리(광역/시·군) */
function renderCenterCard(item: SearchItem, query: string, highlightCls: string, track?: string): ReactNode {
  const ctr = CENTERS.find((c) => c.id === item.id);
  if (!ctr) return renderSimpleCard(item, query, highlightCls, track);

  const where = [ctr.sido, ctr.sigungu].filter(Boolean).join(" ");
  const categoryLabel = ctr.category === "sido" ? "광역" : "시·군";

  return wrapCard(
    item,
    s.cardRich,
    <>
      <span className={s.iconBox} aria-hidden="true">{item.icon}</span>
      {richTitle(item, ctr.name, query, highlightCls)}
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
