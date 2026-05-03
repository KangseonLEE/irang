import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./crop-rich-card.module.css";

/* ==========================================================================
   CropRichCard — 작물 리치 카드 공통 컴포넌트
   상단 헤더(이미지·이름·재배기) + 분리선 + 수익 영역(숫자 + 가로 바)
   + 노동·난이도 strip + 출처 푸터.
   시도 상세 페이지 "추천 작물" 등 정보 밀도 높은 곳에서 사용.
   ========================================================================== */

type Tone = "positive" | "neutral" | "caution";

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
  laborIntensity?: "낮음" | "보통" | "높음";
  /** 재배 난이도 */
  difficulty?: "쉬움" | "보통" | "어려움";
  /** 수익 데이터 출처 */
  source?: string;
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
}: CropRichCardProps) {
  // 바 길이 — 동적 계산값이라 인라인 style 허용 (체크리스트 C 예외)
  const barWidthPct =
    revenueValue !== null && revenueMax && revenueMax > 0
      ? Math.max(8, Math.min(100, Math.round((revenueValue / revenueMax) * 100)))
      : null;

  const labor = laborTone(laborIntensity);
  const diff = difficultyTone(difficulty);

  return (
    <Link href={href} className={s.card}>
      <div className={s.header}>
        <Image
          src={`/crops/${cropId}.jpg`}
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
            {barWidthPct !== null && (
              <div
                className={s.bar}
                role="img"
                aria-label={`${revenueLabel} (이 섹션 최대 대비 ${barWidthPct}%)`}
              >
                <span
                  className={s.barFill}
                  style={{ ["--bar-width" as string]: `${barWidthPct}%` }}
                />
              </div>
            )}
            <span className={s.barCaption}>
              이 지역 추천 작물 중 상대 비교
            </span>
          </>
        ) : (
          <span className={s.revenueRaw}>{revenueLabel}</span>
        )}
      </div>

      {(laborIntensity || difficulty) && (
        <div className={s.statStrip}>
          <div className={s.statItem}>
            <span className={s.statItemLabel}>노동</span>
            <span className={`${s.statItemValue} ${toneClass(labor)}`}>
              {laborIntensity ?? "—"}
            </span>
          </div>
          <div className={s.statItem}>
            <span className={s.statItemLabel}>난이도</span>
            <span className={`${s.statItemValue} ${toneClass(diff)}`}>
              {difficulty ?? "—"}
            </span>
          </div>
        </div>
      )}

      {source && <p className={s.source}>출처: {source}</p>}
    </Link>
  );
}
