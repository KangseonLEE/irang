import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { PROVINCES } from "@/lib/data/regions";
import { getEventImage } from "@/lib/events/event-image";
import { ALWAYS_OPEN, daysUntilDeadline } from "@/lib/program-status";
import type { FarmEvent } from "@/lib/data/events";
import { LivingCarousel, type LivingStay } from "./living-carousel";
import s from "./living-section.module.css";

/** 섹션을 띄우는 최소 카드 수 — 2장 이하면 캐러셀이 아니라 그냥 남은 공고 나열이 된다 */
const MIN_CARDS = 3;

/** 마감 임박 배지를 붙이는 기준 (일). 살아보기는 접수창이 2~6주로 짧아 14일이면 거의 전건이 임박 배지가 된다 */
const URGENT_DAYS = 7;

const SHORT_NAME_BY_PROVINCE = new Map(PROVINCES.map((p) => [p.name, p.shortName]));

/** "2026-09-30" → "9.30" (앞자리 0 없이 — 카드 안에서 가장 짧게 읽히는 형태) */
function mmdd(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return Number.isFinite(m) && Number.isFinite(d) ? `${m}.${d}` : date;
}

/**
 * "청미래마을 농촌에서 살아보기 (귀촌형)" → { name: "청미래마을", type: "귀촌형" }.
 * 수집 원문 제목은 전건이 이 꼴이고, `village_type` 컬럼은 아직 비어 있는 행이 많다 —
 * 컬럼이 있으면 그것을 쓰고, 없으면 제목 괄호에서 읽는다.
 */
function parseTitle(title: string): { name: string; type?: string } {
  let name = title.trim();
  let type: string | undefined;

  const paren = name.match(/\(\s*([^()]*형)\s*\)\s*$/);
  if (paren) {
    type = paren[1].trim();
    name = name.slice(0, paren.index).trim();
  }
  name = name.replace(/농촌에서\s*살아보기/g, " ").replace(/\s{2,}/g, " ").trim();

  return { name: name || title.trim(), type };
}

/** 운영 기간 길이 — "10.1부터 2개월 살아보기". 회장 9/30: 방문자가 먼저 궁금해하는 건 "얼마나 사는지" */
function durationLabel(start: string, end: string | null): string | undefined {
  if (!end) return undefined;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
  if (!Number.isFinite(days) || days <= 0) return undefined;

  let span: string;
  if (days < 10) span = `${days}일`;
  else if (days <= 56) span = `${Math.round(days / 7)}주`;
  else span = `${Math.round(days / 30)}개월`;

  return `${mmdd(start)}부터 ${span} 살아보기`;
}

/** 랜딩 캐러셀 카드 수 상한 — 8장이면 커버플로우 양 끝이 화면 밖으로 잘려 "더 있다"가 읽힌다 */
export const LIVING_MAX = 8;

/**
 * 랜딩에 올릴 살아보기 공고 고르기 (page.tsx 가 호출).
 * 접수중 → 접수예정 순, 같은 상태에선 마감이 가까운 순. 마감 건은 뺀다.
 * 살아보기 접수창은 2~6주로 짧아 마감 임박 건이 오히려 "지금 결정해야 하는 카드"다.
 */
export function pickLivingStays(events: FarmEvent[]): FarmEvent[] {
  const rank = (status: string) => (status === "접수중" ? 0 : status === "접수예정" ? 1 : 2);
  return events
    .filter((e) => e.status !== "마감")
    .slice()
    .sort(
      (a, b) =>
        rank(a.status) - rank(b.status) ||
        (a.applicationEnd ?? a.date).localeCompare(b.applicationEnd ?? b.date),
    )
    .slice(0, LIVING_MAX);
}

/** 카드 1장 = FarmEvent 1건. 표시 문장은 전부 여기서 만든다(클라이언트는 그리기만) */
function toStay(event: FarmEvent): LivingStay {
  const { name, type } = parseTitle(event.title);
  const shortName = SHORT_NAME_BY_PROVINCE.get(event.region);
  const image = getEventImage(event);

  const applicationEnd = event.applicationEnd;
  const openEnded = !applicationEnd || applicationEnd === ALWAYS_OPEN;
  const left = daysUntilDeadline(applicationEnd);

  const urgentLabel =
    event.status === "접수중" && Number.isFinite(left) && left >= 0 && left <= URGENT_DAYS
      ? left === 0
        ? "오늘 마감"
        : `D-${left}`
      : undefined;

  let applyLabel: string | undefined;
  if (openEnded) applyLabel = "상시 모집";
  else if (event.status === "접수예정" && event.applicationStart)
    applyLabel = `${mmdd(event.applicationStart)}부터 신청`;
  else if (left === 0) applyLabel = undefined; // 배지가 "오늘 마감"을 이미 말한다 — 같은 말을 두 번 쓰지 않는다
  else applyLabel = `~${mmdd(applicationEnd)} 마감`;

  const households = event.households ?? 0;
  const capacity = event.capacity ?? 0;
  const capacityLabel =
    households > 0 ? `${households}가구 모집` : capacity > 0 ? `${capacity}명 모집` : undefined;

  return {
    id: event.id,
    villageName: name,
    regionLabel: [shortName ?? event.region, event.sigungu].filter(Boolean).join(" "),
    typeLabel: event.villageType || type,
    status: event.status,
    urgentLabel,
    applyLabel,
    durationLabel: durationLabel(event.date, event.dateEnd),
    capacityLabel,
    image,
  };
}

/**
 * 랜딩 "살아보기" 섹션 (2026-09-30, 회장 지시 — 그린대로 메인 참조).
 *
 * Server Component: 데이터 → 표시 문장 변환까지 끝내고 캐러셀에는 문자열만 넘긴다.
 * PROVINCES(행정구역 SSOT)·상태 산출·날짜 포맷이 클라이언트 번들에 들어가지 않는다.
 *
 * 카드 정보는 참조 화면을 그대로 베끼지 않았다(회장 9/30 추가 지시) — 3040 도시 직장인이
 * "갈 수 있나"를 판단하는 순서대로 ① 상태·마감 임박 ② 지역·마을 ③ 얼마나 사는지 ④ 언제까지·몇 명.
 * 신청 기간은 전체 날짜 대신 "~9.30 마감" 한 조각만 둔다(전체 기간은 상세 페이지 몫).
 */
export function LivingSection({ items }: { items: FarmEvent[] }) {
  if (items.length < MIN_CARDS) return null;

  const stays = items.map(toStay);

  return (
    <section className={s.section} aria-label="농촌에서 살아보기">
      <div className={s.header} data-reveal-x="left">
        <div className={s.heading}>
          <span className={s.eyebrow}>#농촌에서 살아보기</span>
          <h2 className={s.title}>
            <em>살아보고</em> 정하세요
          </h2>
          <p className={s.sub}>이사 전에 마을에서 몇 주 지내 보는 정부 프로그램이에요</p>
        </div>
        <Link href="/events?type=팜스테이" className={s.viewAll} data-track="living:view_all">
          모두 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <LivingCarousel items={stays} />
    </section>
  );
}
