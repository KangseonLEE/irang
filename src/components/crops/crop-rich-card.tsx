import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCropImageSrc } from "@/lib/crop-image";
import s from "./crop-rich-card.module.css";

/* ==========================================================================
   CropRichCard — 작물 리치 카드 공통 컴포넌트
   상단 헤더(이미지·이름·재배기) + 분리선 + 수익 영역(숫자 + 가로 바)
   + 노동·난이도 strip + 출처 푸터.
   시도 상세 페이지 "추천 작물" 등 정보 밀도 높은 곳에서 사용.
   ========================================================================== */

type Tone = "positive" | "neutral" | "caution";
type LaborLevel = "낮음" | "보통" | "높음";
type DifficultyLevel = "쉬움" | "보통" | "어려움";
type FitLevel = "high" | "mid";

interface CropRichCardProps {
  /** 작물 ID (이미지 경로 생성용: /crops/{id}.jpg) */
  cropId: string;
  /** 작물 이름 */
  name: string;
  /** 링크 URL */
  href: string;
  /** 이름 아래 메타 텍스트 (예: "9~5월 재배") */
  meta?: string;
  /** 1,000평 환산 라벨 (예: "1,000평당 약 4,200만원"). 파싱 실패 시 원본 문자열을 넘긴다 */
  revenueLabel: string;
  /** 수익 환산값(만원) — null이면 바 미표시 */
  revenueValue: number | null;
  /** 같은 섹션 내 최대 수익값(만원) — 바 길이 정규화용 */
  revenueMax: number | null;
  /** 노동 강도 — 색상 톤 자동 매핑 */
  laborIntensity?: LaborLevel;
  /** 재배 난이도 */
  difficulty?: DifficultyLevel;
  /** 수익 데이터 출처 */
  source?: string;
  /** 지역 적합도 배지 (시도 상세 페이지의 "추천 작물"에서 활용) */
  fitLevel?: FitLevel;
  /** 적합도 1줄 근거 (예: "전남 산하 5곳에서 재배해요") */
  fitReason?: string;

  // ─ 비교 모드 (선택, 작물 상세 페이지의 "관련 작물" 등) ─
  /**
   * 비교 기준 작물 이름 (예: "딸기").
   * 지정 시 캡션이 "1위 대비"가 아니라 "기준 작물 대비"로 변경됨.
   */
  comparisonName?: string;
  /** 비교 기준 작물의 1,000평 환산 수익(만원) */
  comparisonRevenue?: number | null;
  /** 비교 기준 작물의 노동 강도 */
  comparisonLabor?: LaborLevel;
  /** 비교 기준 작물의 재배 난이도 */
  comparisonDifficulty?: DifficultyLevel;
}

const LABOR_RANK: Record<LaborLevel, number> = { 낮음: 0, 보통: 1, 높음: 2 };
const DIFFICULTY_RANK: Record<DifficultyLevel, number> = {
  쉬움: 0,
  보통: 1,
  어려움: 2,
};

/** "딸기" → "와", "쌀" → "과". 한국어 조사 자동 처리. */
function 와과(name: string): string {
  const last = name.charCodeAt(name.length - 1);
  if (last >= 0xac00 && last <= 0xd7a3) {
    const hasJongseong = (last - 0xac00) % 28 !== 0;
    return hasJongseong ? "과" : "와";
  }
  return "와";
}

function laborComparisonText(
  self?: LaborLevel,
  ref?: LaborLevel,
  refName?: string,
): string | null {
  if (!self || !ref || !refName) return null;
  const diff = LABOR_RANK[self] - LABOR_RANK[ref];
  if (diff < 0) return `${refName}보다 가벼워요`;
  if (diff > 0) return `${refName}보다 무거워요`;
  return `${refName}${와과(refName)} 같아요`;
}

function difficultyComparisonText(
  self?: DifficultyLevel,
  ref?: DifficultyLevel,
  refName?: string,
): string | null {
  if (!self || !ref || !refName) return null;
  const diff = DIFFICULTY_RANK[self] - DIFFICULTY_RANK[ref];
  if (diff < 0) return `${refName}보다 쉬워요`;
  if (diff > 0) return `${refName}보다 어려워요`;
  return `${refName}${와과(refName)} 같아요`;
}

function laborTone(value?: "낮음" | "보통" | "높음"): Tone | undefined {
  if (!value) return undefined;
  if (value === "낮음") return "positive";
  if (value === "보통") return "neutral";
  return "caution";
}

function difficultyTone(value?: "쉬움" | "보통" | "어려움"): Tone | undefined {
  if (!value) return undefined;
  if (value === "쉬움") return "positive";
  if (value === "보통") return "neutral";
  return "caution";
}

function toneClass(tone?: Tone): string {
  if (tone === "positive") return s.tonePositive;
  if (tone === "neutral") return s.toneNeutral;
  if (tone === "caution") return s.toneCaution;
  return "";
}

export function CropRichCard({
  cropId,
  name,
  href,
  meta,
  revenueLabel,
  revenueValue,
  revenueMax,
  laborIntensity,
  difficulty,
  source,
  fitLevel,
  fitReason,
  comparisonName,
  comparisonRevenue,
  comparisonLabor,
  comparisonDifficulty,
}: CropRichCardProps) {
  const isComparisonMode = !!comparisonName;

  // 비교 모드: 기준 작물 수익이 바 길이의 기준 (max=기준 작물). 절대 비교 불가능 시 섹션 max 사용
  const effectiveMax =
    isComparisonMode && comparisonRevenue != null && comparisonRevenue > 0
      ? Math.max(comparisonRevenue, revenueValue ?? 0)
      : revenueMax;

  const realPct =
    revenueValue !== null && effectiveMax && effectiveMax > 0
      ? Math.max(1, Math.min(100, Math.round((revenueValue / effectiveMax) * 100)))
      : null;

  const barWidthPct = realPct !== null ? Math.max(8, realPct) : null;

  // 캡션 — 비교 모드 vs 기존 (1위 대비)
  let barCaption: string | null;
  if (realPct === null) {
    barCaption = null;
  } else if (
    isComparisonMode &&
    revenueValue != null &&
    comparisonRevenue != null
  ) {
    const diff = revenueValue - comparisonRevenue;
    const refName = comparisonName!;
    if (diff > 0) {
      barCaption = `${refName}보다 ${diff.toLocaleString("ko-KR")}만 원 많아요`;
    } else if (diff < 0) {
      barCaption = `${refName}보다 ${Math.abs(diff).toLocaleString("ko-KR")}만 원 적어요`;
    } else {
      barCaption = `${refName}${와과(refName)} 비슷해요`;
    }
  } else if (realPct === 100) {
    barCaption = "이 지역에서 수익이 가장 높아요";
  } else {
    const revenueDiff =
      revenueValue !== null && revenueMax !== null
        ? Math.max(0, revenueMax - revenueValue)
        : null;
    barCaption = `수익 1위보다 ${revenueDiff?.toLocaleString("ko-KR")}만 원 적어요`;
  }

  // 노동·난이도 비교 텍스트 (비교 모드일 때만)
  const laborCompText = isComparisonMode
    ? laborComparisonText(laborIntensity, comparisonLabor, comparisonName)
    : null;
  const difficultyCompText = isComparisonMode
    ? difficultyComparisonText(difficulty, comparisonDifficulty, comparisonName)
    : null;

  const labor = laborTone(laborIntensity);
  const diff = difficultyTone(difficulty);

  return (
    <Link href={href} className={s.card}>
      <div className={s.header}>
        <Image
          src={getCropImageSrc(cropId)}
          alt={name}
          width={48}
          height={48}
          className={s.image}
        />
        <div className={s.headerBody}>
          <span className={s.name}>{name}</span>
          {meta && <span className={s.meta}>{meta}</span>}
        </div>
        <ArrowRight size={14} className={s.arrow} aria-hidden="true" />
      </div>

      <div className={s.divider} aria-hidden="true" />

      <div className={s.revenueBlock}>
        <span className={s.revenueLabel}>예상 수익</span>
        {revenueValue !== null ? (
          <>
            <span className={s.revenueValue}>{revenueLabel}</span>
            {barWidthPct !== null && barCaption !== null && (
              <>
                <div
                  className={s.bar}
                  role="img"
                  aria-label={`${revenueLabel} — ${barCaption}`}
                >
                  <span
                    className={s.barFill}
                    style={{ ["--bar-width" as string]: `${barWidthPct}%` }}
                  />
                </div>
                <span className={s.barCaption}>{barCaption}</span>
              </>
            )}
          </>
        ) : (
          <span className={s.revenueRaw}>{revenueLabel}</span>
        )}
      </div>

      {fitLevel && fitReason && (
        <div
          className={`${s.fitBadge} ${fitLevel === "high" ? s.fitBadgeHigh : s.fitBadgeMid}`}
          aria-label={`지역 적합도 ${fitLevel === "high" ? "높음" : "중간"} — ${fitReason}`}
        >
          <span className={s.fitDot} aria-hidden="true" />
          <span className={s.fitLevel}>
            {fitLevel === "high" ? "적합도 높음" : "적합도 중간"}
          </span>
          <span className={s.fitReason}>{fitReason}</span>
        </div>
      )}

      {(laborIntensity || difficulty) && (
        <div
          className={s.statStrip}
          data-comparison={isComparisonMode ? "true" : undefined}
        >
          <div className={s.statItem}>
            <span className={s.statItemLabel}>노동</span>
            <span className={`${s.statItemValue} ${toneClass(labor)}`}>
              {laborIntensity ?? "—"}
            </span>
            {laborCompText && (
              <span className={s.statComparison}>{laborCompText}</span>
            )}
          </div>
          <div className={s.statItem}>
            <span className={s.statItemLabel}>난이도</span>
            <span className={`${s.statItemValue} ${toneClass(diff)}`}>
              {difficulty ?? "—"}
            </span>
            {difficultyCompText && (
              <span className={s.statComparison}>{difficultyCompText}</span>
            )}
          </div>
        </div>
      )}

      {source && <p className={s.source}>출처: {source}</p>}
    </Link>
  );
}
