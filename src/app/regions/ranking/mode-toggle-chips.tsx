"use client";

// 결과 페이지 상단 mode 전환 chip (Sprint 2 2026-05-16)
//   - 현재 mode 표시 + 다른 mode로 즉시 전환
//   - "다시 선택하기"로 wizard step 1 진입 (URL param 모두 제거)
//   - 기존 하단 restartCard 제거 → 본 컴포넌트가 그 역할
//
// 회장 결재 Q5 — 상단 mode 전환 chip + 하단 단독 카드 제거

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Target, BarChart3, Sliders, RotateCcw } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { analytics } from "@/lib/analytics";
import s from "./mode-toggle-chips.module.css";

type ChipMode = "persona" | "dimension" | "custom";

interface Props {
  /** 현재 활성 모드 — "custom"은 isCustom 가중치 활성 시 (page.tsx에서 판정) */
  current: ChipMode;
  /** 시도 필터 (있으면 mode 전환 시 유지) */
  sido: string | null;
  /** 현재 선택 — persona id 또는 dim id (mode 전환 시 다음 mode의 기본값으로 사용 안 함; 단순 표시) */
  selectionLabel: string;
}

const MODES: { id: ChipMode; label: string; icon: typeof Target }[] = [
  { id: "persona", label: "스타일 맞춤", icon: Target },
  { id: "dimension", label: "차원별", icon: BarChart3 },
  { id: "custom", label: "맞춤 가중치", icon: Sliders },
];

export function ModeToggleChips({ current, sido, selectionLabel }: Props) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigatingRef = useRef(false);

  const buildUrl = (to: ChipMode): string => {
    const params = new URLSearchParams();
    if (to === "persona") {
      params.set("persona", "balanced");
    } else if (to === "dimension") {
      params.set("dim", "farmActivity");
    } else if (to === "custom") {
      // custom 진입: balanced 기본 가중치 + URL은 그대로 (WeightCustomizer가 ?w= 갱신)
      params.set("persona", "balanced");
    }
    if (sido) params.set("sido", sido);
    return `/regions/ranking?${params.toString()}`;
  };

  const handleSwitch = (to: ChipMode) => {
    if (to === current || navigatingRef.current) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    analytics.rankingModeChipClicked(current, to);
    router.push(buildUrl(to));
  };

  const handleRestart = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    analytics.rankingModeChipClicked(current, "restart");
    router.push("/regions/ranking");
  };

  return (
    <section className={s.bar} aria-label="비교 방식 전환">
      <div className={s.currentLine}>
        <span className={s.currentLabel}>지금</span>
        <strong className={s.currentValue}>{selectionLabel}</strong>
      </div>
      <div className={s.chipRow}>
        {MODES.map((m) => {
          const isActive = m.id === current;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSwitch(m.id)}
              className={`${s.chip} ${isActive ? s.chipActive : ""}`}
              disabled={isActive || isNavigating}
              aria-pressed={isActive}
              aria-label={`${m.label}로 비교 방식 전환`}
            >
              <Icon icon={m.icon} size="sm" />
              <span>{m.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleRestart}
          className={s.restart}
          disabled={isNavigating}
          aria-label="다시 처음부터 선택하기"
        >
          <Icon icon={RotateCcw} size="sm" />
          <span>다시 선택</span>
        </button>
      </div>
    </section>
  );
}
