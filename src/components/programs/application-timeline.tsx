"use client";

import { Calendar, Clock } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { useKstToday } from "@/lib/hooks/use-kst-today";
import {
  ALWAYS_OPEN,
  daysBetween,
  deriveStatus,
  programStatusLabel,
  type ProgramStatus,
} from "@/lib/program-status";
import s from "./application-timeline.module.css";

interface ApplicationTimelineProps {
  applicationStart: string;
  applicationEnd: string;
  status: ProgramStatus;
  /** 상태 배지 라벨 SSOT — programStatusLabel(program) 결과 ("정기 접수"·"공고 발표 예정" 포함) */
  statusLabel: string;
  /** 연례 창구형 접수 시기 문구 (9999 페어일 때 "공고 발표 예정" 대신) */
  applicationCycle?: string | null;
  /** 확인처 — 담당 기관 */
  organization: string;
  /**
   * 서버가 이 HTML 을 만든 날 — KST YYYY-MM-DD (`kstToday()`).
   * `status`·`statusLabel` 도 이 날 기준으로 계산된 값이어야 한다(같은 서버 렌더에서 함께 넘긴다).
   */
  asOf: string;
}

/** "2026-01-12" → "1/12" — 문자열에서 바로 읽는다. `new Date()` 를 거치면 뉴욕 등에서 하루 밀린다(10/3) */
function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return `${m}/${d}`;
}

const NOTICE = "정확한 일자는 원문 공고에서 확인하세요";

/** 라벨 + 값 한 행 — "—" 로 이어 붙인 한 문장 대신 줄 단위로 읽힌다 (9/27) */
function Row({
  label,
  center,
  children,
}: {
  label: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={center ? s.rowCenter : s.row}>
      <dt className={s.rowLabel}>{label}</dt>
      <dd className={s.rowValue}>{children}</dd>
    </div>
  );
}

/** 진행 막대 아래 한 줄 — D-day 는 달력 일수(마감일 당일 = 0) 기준, 목록 카드의 "마감 D-N" 과 같은 셈 */
function DaysInfo({
  status,
  daysUntilStart,
  daysUntilEnd,
}: {
  status: ProgramStatus;
  daysUntilStart: number;
  daysUntilEnd: number;
}) {
  if (status === "마감") return <span>접수가 마감되었어요</span>;
  if (status === "모집예정") {
    if (daysUntilStart > 1) {
      return (
        <span>
          접수 시작까지 <strong>{daysUntilStart}일</strong> 남았어요
        </span>
      );
    }
    if (daysUntilStart === 1) return <span>내일 접수가 시작돼요</span>;
    return <span>곧 접수가 시작돼요</span>;
  }
  if (daysUntilEnd > 1) {
    return (
      <span>
        마감까지 <strong>{daysUntilEnd}일</strong> 남았어요
      </span>
    );
  }
  if (daysUntilEnd === 1) return <span>내일 마감이에요</span>;
  return <span>오늘 마감이에요</span>;
}

/**
 * 신청 기간 위젯 (2026-09-27 재구성).
 *
 * 9999 페어(정기 접수·공고 미발표)·상시 모집·실일자 세 경우 모두 같은 행 구조로 읽힌다:
 * 상태 / 접수 시기 / 확인처 / 안내. 이전에는 "정기 접수 — 정확한 일자는…"처럼
 * 한 문장에 상태·시기·안내를 다 밀어 넣어 훑어 읽기가 어려웠다.
 *
 * "use client" 인 이유: D-day·진행률을 **보는 사람의 오늘** 기준으로 계산한다
 * (ISR revalidate 24h 이므로 서버에서 계산하면 최대 하루 묵는다).
 *
 * 하이드레이션(10/3, 운영 Sentry #157): 렌더 중 `new Date()` 를 직접 쓰면 스냅샷을 만든 날과
 * 방문한 날이 다를 때 서버 HTML 과 첫 렌더가 어긋나 React #418 이 났다. 이제 첫 렌더는 서버가
 * 넘긴 `asOf` 로 서버와 똑같이 그리고, 오늘이 다르면 직후 한 번 더 그린다(useKstToday).
 * 날짜 계산·표기는 전부 YYYY-MM-DD 문자열 기준이라 브라우저 타임존과 무관하다.
 */
export function ApplicationTimeline({
  applicationStart,
  applicationEnd,
  status,
  statusLabel,
  applicationCycle,
  organization,
  asOf,
}: ApplicationTimelineProps) {
  const today = useKstToday(asOf);
  // 스냅샷과 같은 날이면 서버가 넘긴 상태를 그대로(= 서버 HTML 과 동일), 날이 바뀌었으면 오늘 기준으로 다시 판정
  const sameDay = today === asOf;
  const liveStatus = sameDay
    ? status
    : deriveStatus(applicationStart, applicationEnd, today);
  const liveLabel = sameDay
    ? statusLabel
    : programStatusLabel({ status: liveStatus, applicationStart, applicationEnd, applicationCycle });

  // 9999-12-31 페어 = 상시 모집 또는 공고 발표 예정 — 일자·진행률·D-day 무의미
  const startUnknown = !applicationStart || applicationStart === ALWAYS_OPEN;
  const endOpen = !applicationEnd || applicationEnd === ALWAYS_OPEN;

  const header = (
    <div className={s.header}>
      <Icon icon={Calendar} size="sm" />
      <span className={s.headerLabel}>신청 기간</span>
    </div>
  );

  // ── 정기 접수 · 공고 발표 예정 · 상시 모집 ──
  if (endOpen) {
    const cycle = applicationCycle?.trim();
    const period = startUnknown
      ? cycle
        ? cycle
        : "공고 발표 전이에요"
      : `${formatShortDate(applicationStart)}부터 상시 모집`;

    return (
      <div className={s.wrap}>
        {header}
        <dl className={s.rows}>
          <Row label="상태" center>
            <StatusBadge status={liveLabel} />
          </Row>
          <Row label="접수 시기">{period}</Row>
          <Row label="확인처">{organization}</Row>
        </dl>
        <p className={s.notice}>
          <Icon icon={Clock} size="xs" />
          <span>{NOTICE}</span>
        </p>
      </div>
    );
  }

  // ── 실일자 ── (시작일·마감일 모두 포함한 기간 대비 경과 일수)
  const totalDays = daysBetween(applicationStart, applicationEnd) + 1;
  const elapsedDays = daysBetween(applicationStart, today);
  const progress =
    totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
  const daysUntilStart = daysBetween(today, applicationStart);
  const daysUntilEnd = daysBetween(today, applicationEnd);

  return (
    <div className={s.wrap}>
      {header}

      <dl className={s.rows}>
        <Row label="상태" center>
          <StatusBadge status={liveLabel} />
        </Row>
        <Row label="접수 시기">
          <span className={s.dates}>
            {formatShortDate(applicationStart)}
            <span className={s.dateSep}>~</span>
            {formatShortDate(applicationEnd)}
          </span>
        </Row>
        <Row label="확인처">{organization}</Row>
      </dl>

      <div className={s.bar}>
        <div
          className={`${s.barFill} ${liveStatus === "모집중" ? s.barActive : liveStatus === "모집예정" ? s.barUpcoming : s.barClosed}`}
          style={{ width: `${progress}%` }}
        />
        {liveStatus === "모집중" && progress > 0 && progress < 100 && (
          <div className={s.barMarker} style={{ left: `${progress}%` }} />
        )}
      </div>

      <div className={s.info}>
        <Icon icon={Clock} size="xs" />
        <DaysInfo
          status={liveStatus}
          daysUntilStart={daysUntilStart}
          daysUntilEnd={daysUntilEnd}
        />
      </div>

      <p className={s.notice}>{NOTICE}</p>
    </div>
  );
}
