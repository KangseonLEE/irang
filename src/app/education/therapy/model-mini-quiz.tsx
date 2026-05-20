"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, RefreshCcw, Sparkles } from "lucide-react";
import s from "./page.module.css";

/* ──────────────────────────────────────────────────────────────────────────
   미니 진단 — 어느 모델이 나에게?
   3 질문 라디오 → 점수 합산 → healing | social 추천
   URL `?recommended=healing|social` 동기 (deep link)
   ────────────────────────────────────────────────────────────────────────── */

type Recommended = "healing" | "social";

type ModelAnswer = Recommended; // 각 옵션이 부여하는 점수의 모델

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    value: ModelAnswer;
  }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "qualification",
    question: "치유농업사 자격증(142시간 교육·시험)을 취득할 의향이 있으세요?",
    options: [
      { label: "네, 자격증을 취득해서 전문성을 갖추고 싶어요", value: "healing" },
      { label: "자격증 없이도 시작할 수 있는 길을 찾고 싶어요", value: "social" },
    ],
  },
  {
    id: "form",
    question: "농장을 어떤 형태로 운영하고 싶으세요?",
    options: [
      { label: "개인이나 가족 단위로 직접 운영하고 싶어요", value: "healing" },
      { label: "법인이나 협동조합 형태로 함께 운영하고 싶어요", value: "social" },
    ],
  },
  {
    id: "target",
    question: "어떤 분들을 주로 만나고 싶으세요?",
    options: [
      { label: "건강 회복을 원하는 일반인·직장인·고령자", value: "healing" },
      { label: "장애인·고령농·다문화 등 돌봄이 필요한 분들", value: "social" },
    ],
  },
];

function isRecommended(v: string | null | undefined): v is Recommended {
  return v === "healing" || v === "social";
}

export function ModelMiniQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRecommended = searchParams.get("recommended");

  // 답변 상태: questionId → "healing" | "social"
  const [answers, setAnswers] = useState<Record<string, ModelAnswer>>({});
  // 첫 선택 모델 (동점 시 우선)
  const [firstPick, setFirstPick] = useState<ModelAnswer | null>(null);

  // URL deep link로 진입한 경우 결과 표시 (답변은 비어 있어도 highlight)
  const recommendedFromUrl: Recommended | null = useMemo(
    () => (isRecommended(urlRecommended) ? urlRecommended : null),
    [urlRecommended]
  );

  // 답변 기반 추천 계산
  const computed: Recommended | null = useMemo(() => {
    const total = Object.values(answers).length;
    if (total === 0) return null;
    let healing = 0;
    let social = 0;
    Object.values(answers).forEach((v) => {
      if (v === "healing") healing += 1;
      else social += 1;
    });
    if (healing > social) return "healing";
    if (social > healing) return "social";
    return firstPick; // 동점 시 첫 선택 우선 (null이면 표시 안 함)
  }, [answers, firstPick]);

  // 최종 highlight 대상: 답변이 있으면 computed, 없으면 URL
  const recommended: Recommended | null =
    Object.keys(answers).length > 0 ? computed : recommendedFromUrl;

  // 진행률
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);
  const completed = answered === QUESTIONS.length;

  // 답변 변경 시 URL 동기
  useEffect(() => {
    if (!completed || !computed) return;
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("recommended") === computed) return;
    params.set("recommended", computed);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [completed, computed, router, searchParams]);

  const handleSelect = useCallback(
    (qid: string, value: ModelAnswer) => {
      setAnswers((prev) => ({ ...prev, [qid]: value }));
      setFirstPick((prev) => prev ?? value);
    },
    []
  );

  const handleReset = useCallback(() => {
    setAnswers({});
    setFirstPick(null);
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("recommended")) {
      params.delete("recommended");
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    }
  }, [router, searchParams]);

  return (
    <div className={s.quizWrap}>
      {/* 진단 UI */}
      <div className={s.quizCard}>
        <div className={s.quizHead}>
          <div className={s.quizHeadText}>
            <span className={s.quizLabel}>
              <Sparkles size={14} aria-hidden="true" />
              미니 진단
            </span>
            <p className={s.quizGuide}>
              3가지만 골라 보세요. 어울리는 모델을 추천해 드릴게요.
            </p>
          </div>
          {answered > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className={s.quizReset}
              aria-label="진단 다시 시작"
            >
              <RefreshCcw size={12} aria-hidden="true" />
              다시 시작
            </button>
          )}
        </div>

        <div
          className={s.quizProgress}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="진단 진행률"
        >
          <span
            className={s.quizProgressBar}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        <span className={s.quizProgressLabel}>
          {answered} / {QUESTIONS.length}
        </span>

        <ol className={s.quizQuestions}>
          {QUESTIONS.map((q, idx) => {
            const current = answers[q.id];
            return (
              <li key={q.id} className={s.quizQuestion}>
                <p className={s.quizQuestionText}>
                  <span className={s.quizQuestionNum} aria-hidden="true">
                    Q{idx + 1}
                  </span>
                  {q.question}
                </p>
                <div
                  className={s.quizOptions}
                  role="radiogroup"
                  aria-label={q.question}
                >
                  {q.options.map((opt) => {
                    const selected = current === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleSelect(q.id, opt.value)}
                        className={`${s.quizOption} ${selected ? s.quizOptionSelected : ""}`}
                      >
                        <span className={s.quizOptionDot} aria-hidden="true" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>

        {recommended && (
          <p className={s.quizResult} aria-live="polite">
            <Sparkles size={14} aria-hidden="true" />
            아래
            <strong>
              {recommended === "healing" ? " 치유농업 " : " 사회적 농업 "}
            </strong>
            카드를 추천해 드릴게요.
          </p>
        )}
      </div>

      {/* 결과 카드 (highlight 동기) */}
      <div className={s.modelChoice}>
        <Link
          href="/education/therapy?tab=healing"
          className={`${s.modelCard} ${recommended === "healing" ? s.modelCardHighlight : ""}`}
          aria-current={recommended === "healing" ? "true" : undefined}
        >
          {recommended === "healing" && (
            <span className={s.modelCardBadge} aria-hidden="true">
              추천
            </span>
          )}
          <div className={s.modelCardHead}>
            <h3 className={s.modelCardTitle}>치유농업이 맞아요</h3>
            <ChevronRight size={20} className={s.modelCardArrow} aria-hidden="true" />
          </div>
          <p className={s.modelCardBody}>
            자격증을 취득해서 전문성을 기반으로 농장을 운영하고 싶다면, 또는 농업과 사람의
            회복을 결합하는 일에 끌린다면 치유농업이에요.
          </p>
          <div className={s.modelCardTags}>
            <span className={s.modelCardTag}>자격증 필수</span>
            <span className={s.modelCardTag}>개인 운영 가능</span>
            <span className={s.modelCardTag}>건강 회복</span>
          </div>
        </Link>

        <Link
          href="/education/therapy?tab=social"
          className={`${s.modelCard} ${recommended === "social" ? s.modelCardHighlight : ""}`}
          aria-current={recommended === "social" ? "true" : undefined}
        >
          {recommended === "social" && (
            <span className={s.modelCardBadge} aria-hidden="true">
              추천
            </span>
          )}
          <div className={s.modelCardHead}>
            <h3 className={s.modelCardTitle}>사회적 농업이 맞아요</h3>
            <ChevronRight size={20} className={s.modelCardArrow} aria-hidden="true" />
          </div>
          <p className={s.modelCardBody}>
            복지·돌봄 영역에 관심이 있고 법인·조합 형태로 농장을 운영할 수 있다면, 또는 마을
            공동체 사업과 결합하고 싶다면 사회적 농업이에요.
          </p>
          <div className={s.modelCardTags}>
            <span className={s.modelCardTag}>법인 형태</span>
            <span className={s.modelCardTag}>국비 70%</span>
            <span className={s.modelCardTag}>돌봄·고용</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
