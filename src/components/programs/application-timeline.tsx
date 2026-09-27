"use client";

import { Calendar, Clock } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import s from "./application-timeline.module.css";

interface ApplicationTimelineProps {
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
  /** 상태 배지 라벨 SSOT — programStatusLabel(program) 결과 ("정기 접수"·"공고 발표 예정" 포함) */
  statusLabel: string;
  /** 연례 창구형 접수 시기 문구 (9999 페어일 때 "공고 발표 예정" 대신) */
  applicationCycle?: string | null;
  /** 확인처 — 담당 기관 */
  organization: string;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getDaysText(days: number): string {
  if (days === 0) return "오늘";
  if (days === 1) return "내일";
  return `${days}일`;
}

const ALWAYS_OPEN = "9999-12-31";

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

/**
 * 신청 기간 위젯 (2026-09-27 재구성).
 *
 * 9999 페어(정기 접수·공고 미발표)·상시 모집·실일자 세 경우 모두 같은 행 구조로 읽힌다:
 * 상태 / 접수 시기 / 확인처 / 안내. 이전에는 "정기 접수 — 정확한 일자는…"처럼
 * 한 문장에 상태·시기·안내를 다 밀어 넣어 훑어 읽기가 어려웠다.
 *
 * "use client" 인 이유: D-day·진행률을 **보는 사람의 오늘** 기준으로 계산한다
 * (ISR revalidate 24h 이므로 서버에서 계산하면 최대 하루 묵는다).
 */
export function ApplicationTimeline({
  applicationStart,
  applicationEnd,
  status,
  statusLabel,
  applicationCycle,
  organization,
}: ApplicationTimelineProps) {
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
            <StatusBadge status={statusLabel} />
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

  // ── 실일자 ──
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(applicationStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(applicationEnd);
  end.setHours(23, 59, 59, 999);

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const progress = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 0;

  const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / 86400000);
  const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / 86400000);

  return (
    <div className={s.wrap}>
      {header}

      <dl className={s.rows}>
        <Row label="상태" center>
          <StatusBadge status={statusLabel} />
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
          className={`${s.barFill} ${status === "모집중" ? s.barActive : status === "모집예정" ? s.barUpcoming : s.barClosed}`}
          style={{ width: `${progress}%` }}
        />
        {status === "모집중" && progress > 0 && progress < 100 && (
          <div className={s.barMarker} style={{ left: `${progress}%` }} />
        )}
      </div>

      <div className={s.info}>
        <Icon icon={Clock} size="xs" />
        {status === "모집중" && daysUntilEnd > 0 && (
          <span>마감까지 <strong>{getDaysText(daysUntilEnd)}</strong> 남았어요</span>
        )}
        {status === "모집중" && daysUntilEnd <= 0 && (
          <span>오늘 마감이에요</span>
        )}
        {status === "모집예정" && daysUntilStart > 0 && (
          <span>접수 시작까지 <strong>{getDaysText(daysUntilStart)}</strong> 남았어요</span>
        )}
        {status === "모집예정" && daysUntilStart <= 0 && (
          <span>곧 접수가 시작돼요</span>
        )}
        {status === "마감" && (
          <span>접수가 마감되었어요</span>
        )}
      </div>

      <p className={s.notice}>{NOTICE}</p>
    </div>
  );
}
