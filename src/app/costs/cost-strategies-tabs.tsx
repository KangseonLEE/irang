"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Banknote } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import type { CostStrategy } from "@/lib/data/cost-by-type";
import s from "./page.module.css";

export interface StrategyWithStatus {
  strategy: CostStrategy;
  status: string | null;
}

interface Props {
  active: StrategyWithStatus[];
  closed: StrategyWithStatus[];
}

type TabKey = "active" | "closed";

/**
 * 비용 절감 전략 — 모집중/마감 탭 분리 컴포넌트
 * - active 탭: 외부 링크·조언·모집중·모집예정·null 카드
 * - closed 탭: status="마감" 카드 (참고용 안내문 포함)
 */
export default function CostStrategiesTabs({ active, closed }: Props) {
  const [tab, setTab] = useState<TabKey>("active");
  const hasClosed = closed.length > 0;
  const items = tab === "active" ? active : closed;

  return (
    <div>
      <div role="tablist" aria-label="모집 상태 탭" className={s.strategyTabs}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "active"}
          className={`${s.strategyTab} ${tab === "active" ? s.strategyTabActive : ""}`}
          onClick={() => setTab("active")}
        >
          지금 활용 가능
          <span className={s.strategyTabCount}>{active.length}</span>
        </button>
        {hasClosed && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === "closed"}
            className={`${s.strategyTab} ${tab === "closed" ? s.strategyTabActive : ""}`}
            onClick={() => setTab("closed")}
          >
            마감 (참고용)
            <span className={s.strategyTabCount}>{closed.length}</span>
          </button>
        )}
      </div>

      {tab === "closed" && (
        <p className={s.closedNotice}>
          지금은 신청이 마감됐지만 매년 정기 모집되는 사업이에요. 다음 회차 때
          참고할 수 있도록 내용을 정리해뒀어요.
        </p>
      )}

      <div className={s.strategies}>
        {items.map(({ strategy, status }, i) => (
          <StrategyCard
            key={`${tab}-${i}`}
            strategy={strategy}
            status={status}
            muted={tab === "closed"}
          />
        ))}
      </div>
    </div>
  );
}

function StrategyCard({
  strategy,
  status,
  muted,
}: {
  strategy: CostStrategy;
  status: string | null;
  muted?: boolean;
}) {
  const isExternal = !!strategy.external;
  const externalHost = isExternal
    ? strategy.href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
    : null;
  const className = muted
    ? `${s.strategyCard} ${s.strategyCardMuted}`
    : s.strategyCard;

  const inner = (
    <>
      <div className={s.strategyTop}>
        <h3 className={s.strategyTitle}>
          {strategy.title}
          {isExternal && (
            <span className={s.externalBadge}>
              외부 <ArrowUpRight size={11} aria-hidden="true" />
            </span>
          )}
        </h3>
        <div className={s.strategyBadges}>
          {status && <StatusBadge status={status} />}
          {strategy.type && <SupportTypeBadge type={strategy.type} />}
        </div>
      </div>
      <p className={s.strategyDesc}>{strategy.desc}</p>
      <div className={s.strategyBottom}>
        <span className={s.strategySaving}>
          <Banknote size={14} />
          {strategy.saving}
        </span>
        {isExternal ? (
          <span className={s.externalHost}>
            {externalHost}
            <ArrowUpRight size={14} className={s.strategyArrow} aria-hidden="true" />
          </span>
        ) : (
          <ArrowRight size={14} className={s.strategyArrow} aria-hidden="true" />
        )}
      </div>
    </>
  );

  return isExternal ? (
    <a
      href={strategy.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`${strategy.title} — 외부 사이트(${externalHost})에서 새 창으로 열림`}
    >
      {inner}
    </a>
  ) : (
    <Link href={strategy.href} className={className}>
      {inner}
    </Link>
  );
}
