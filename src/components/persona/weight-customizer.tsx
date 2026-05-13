"use client";

/**
 * WeightCustomizer — Phase 6 B1 D2
 *
 * 5차원 가중치 슬라이더 UI. URL `?w=...` + localStorage 양방향 동기화.
 *
 * 회장 결재 (2026-05-13, B1 D2):
 *   - 슬라이더 5개 (0~100% 절대값) + 합계 100 자동 조정 (한 값 변경 시 나머지 4개 비율 유지)
 *   - URL 우선, LS 폴백 (마운트 시 URL이 없으면 LS 복원해 URL 갱신)
 *   - 기본값 복원 버튼 (현재 base persona 기본 가중치로)
 *
 * race 함정 회피 (메모리 feedback_use_optimistic_race.md):
 *   - useState + useRef(latest) 패턴으로 빠른 연속 변경 시 stale closure 방지
 *   - router.replace는 100ms debounce (슬라이더 끌 때마다 RSC 폭격 방지)
 *   - 시각 피드백(슬라이더 위치·합계 pill)은 setState 기반 즉시 반영
 *
 * Server↔Client 경계 (체크리스트 H):
 *   - 이 컴포넌트는 자체 완결 Client Component
 *   - 부모(Server)는 baseId/initialWeights/customWeights를 props로 전달만
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// useRef는 debounce timer용으로 유지
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  type Persona,
  type PersonaId,
  type PersonaWeights,
} from "@/lib/data/personas";
import {
  WEIGHT_KEYS_ORDERED,
  WEIGHT_PARAM_KEY,
  normalizeWeights,
  serializeWeights,
  parseWeightsParam,
  isSameWeights,
} from "@/lib/persona-weights-custom";
import s from "./weight-customizer.module.css";

interface WeightCustomizerProps {
  /** 현재 base 페르소나 (라벨·기본값 복원에 사용) */
  basePersona: Persona;
  /** 현재 화면에 반영된 가중치 (SSR이 URL·LS 합성 결과로 전달) */
  currentWeights: PersonaWeights;
  /** 현재 커스텀 모드인지 (false면 base 기본 가중치와 동일) */
  isCustom: boolean;
}

const LABELS: Record<keyof PersonaWeights, string> = {
  populationTrend: "인구 추세",
  farmActivity: "농가",
  medical: "의료",
  school: "학교",
  returnFarm: "귀농",
};

const STORAGE_KEY_PREFIX = "irang:ranking:weights:";

/**
 * 한 차원의 값을 newValue로 변경할 때, 나머지 4차원이 비율을 유지하면서
 * 합 100을 맞추도록 자동 조정.
 *
 * - 나머지 4개 합이 0이면 균등 분배 ((100 - newValue) / 4)
 * - 각 값은 정수, 반올림 오차는 마지막 차원에서 보정
 */
function rebalance(
  prev: PersonaWeights,
  changedKey: keyof PersonaWeights,
  newValue: number,
): PersonaWeights {
  const clamped = Math.max(0, Math.min(100, Math.round(newValue)));
  const otherKeys = WEIGHT_KEYS_ORDERED.filter((k) => k !== changedKey);
  const otherSum = otherKeys.reduce((acc, k) => acc + prev[k], 0);
  const remaining = 100 - clamped;

  const result = {} as PersonaWeights;
  result[changedKey] = clamped;

  if (remaining === 0) {
    // 한 슬라이더가 100 → 나머지 0
    otherKeys.forEach((k) => {
      result[k] = 0;
    });
    return result;
  }

  if (otherSum === 0) {
    // 나머지가 모두 0 → 균등 분배
    const each = Math.floor(remaining / otherKeys.length);
    const leftover = remaining - each * otherKeys.length;
    otherKeys.forEach((k, i) => {
      result[k] = each + (i < leftover ? 1 : 0);
    });
    return result;
  }

  // 나머지 4개를 현재 비율 유지하며 remaining으로 스케일
  const scaled = otherKeys.map((k) => (prev[k] * remaining) / otherSum);
  const rounded = scaled.map((v) => Math.round(v));
  let total = rounded.reduce((acc, v) => acc + v, 0);

  // 반올림 오차 보정 — 가장 큰 값부터 ±1
  let safety = 10;
  while (total !== remaining && safety > 0) {
    const diff = remaining - total;
    const step = diff > 0 ? 1 : -1;
    // 음수 안 되도록 가드
    const idx =
      step > 0
        ? rounded.indexOf(Math.max(...rounded))
        : rounded.findIndex((v) => v > 0);
    if (idx < 0) break;
    rounded[idx] += step;
    total += step;
    safety -= 1;
  }

  otherKeys.forEach((k, i) => {
    result[k] = rounded[i];
  });
  return result;
}

export function WeightCustomizer({
  basePersona,
  currentWeights,
  isCustom,
}: WeightCustomizerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 시각용 상태 (즉시 반응) — SSR로 들어온 currentWeights를 초기값으로
  const [weights, setWeights] = useState<PersonaWeights>(currentWeights);
  // props 변화 추적용 — render 중 비교해 SSR sync (React 공식 패턴, useEffect 회피)
  const [prevPropsWeights, setPrevPropsWeights] =
    useState<PersonaWeights>(currentWeights);

  // SSR로 들어온 props가 바뀌면 (페르소나 전환·시도 필터 변경 등) 동기화
  // useEffect 대신 render 중 비교 — react-hooks/set-state-in-effect 준수
  if (!isSameWeights(currentWeights, prevPropsWeights)) {
    setPrevPropsWeights(currentWeights);
    setWeights(currentWeights);
  }

  // localStorage 복원 — 마운트 1회만, URL `?w=`가 없을 때만
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    // URL에 이미 ?w가 있으면 LS 복원하지 않음 (URL이 진실의 원천)
    const urlW = searchParams.get(WEIGHT_PARAM_KEY);
    if (urlW) return;

    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(
        STORAGE_KEY_PREFIX + basePersona.id,
      );
      if (!stored) return;
      const parsed = parseWeightsParam(stored);
      if (!parsed) return;
      const normalized = normalizeWeights(parsed);
      // LS 값이 base 기본 가중치와 같으면 복원 의미 없음
      if (isSameWeights(normalized, basePersona.weights)) return;

      // URL 갱신만 (다음 useEffect[currentWeights]에서 자동 반영)
      const params = new URLSearchParams(searchParams.toString());
      params.set(WEIGHT_PARAM_KEY, serializeWeights(normalized));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } catch {
      // LS 접근 실패 (private mode 등) — 조용히 무시
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL 갱신 (debounce)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushUrl = useCallback(
    (next: PersonaWeights) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const normalized = normalizeWeights(next);
        const serialized = serializeWeights(normalized);

        const params = new URLSearchParams(searchParams.toString());

        // base 기본 가중치와 동일하면 URL에서 w 제거 (커스텀 해제)
        if (isSameWeights(normalized, basePersona.weights)) {
          params.delete(WEIGHT_PARAM_KEY);
        } else {
          params.set(WEIGHT_PARAM_KEY, serialized);
        }

        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

        // LS는 항상 저장 (다음 방문 복원용)
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              STORAGE_KEY_PREFIX + basePersona.id,
              serialized,
            );
          } catch {
            // ignore
          }
        }
      }, 180);
    },
    [router, pathname, searchParams, basePersona],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (key: keyof PersonaWeights, value: number) => {
      // setState callback으로 prev를 받아 stale closure 회피 (race 함정)
      setWeights((prev) => {
        const next = rebalance(prev, key, value);
        flushUrl(next);
        return next;
      });
    },
    [flushUrl],
  );

  const handleReset = useCallback(() => {
    const reset = { ...basePersona.weights };
    setWeights(reset);
    flushUrl(reset);
  }, [basePersona.weights, flushUrl]);

  const sum = useMemo(
    () => WEIGHT_KEYS_ORDERED.reduce((acc, k) => acc + weights[k], 0),
    [weights],
  );

  const canReset = isCustom || !isSameWeights(weights, basePersona.weights);

  return (
    <section className={s.card} aria-label="가중치 직접 조정">
      <div className={s.header}>
        <div className={s.titleBox}>
          <h3 className={s.title}>내 기준으로 점수 다시 보기</h3>
          <p className={s.subtitle}>
            5차원 비중을 직접 바꿔 보세요. 합계는 자동으로 100이 돼요.
          </p>
        </div>
        <span className={s.sumPill} aria-live="polite">
          {sum}
          <span className={s.sumPillUnit}>/100</span>
        </span>
      </div>

      <div className={s.list}>
        {WEIGHT_KEYS_ORDERED.map((key) => {
          const value = weights[key];
          return (
            <div key={key} className={s.row}>
              <div className={s.rowHeader}>
                <span className={s.rowLabel}>{LABELS[key]}</span>
                <span className={s.rowValue} aria-live="off">
                  {value}
                  <span className={s.rowValueUnit}>%</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                className={s.range}
                style={{ ["--fill" as string]: `${value}%` }}
                aria-label={`${LABELS[key]} 비중`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
              />
            </div>
          );
        })}
      </div>

      <div className={s.footer}>
        <p className={s.hint}>
          {isCustom
            ? `‘${basePersona.label}’ 기본값에서 직접 조정한 상태예요.`
            : `‘${basePersona.label}’ 기본 가중치예요.`}
        </p>
        <button
          type="button"
          className={s.resetBtn}
          onClick={handleReset}
          disabled={!canReset}
          aria-label="기본값 복원"
        >
          <RotateCcw size={14} aria-hidden="true" />
          기본값 복원
        </button>
      </div>
    </section>
  );
}

export type { PersonaId };
