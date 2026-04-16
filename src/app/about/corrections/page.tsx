import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  FileEdit,
  Calendar,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import s from "../disclaimer/page.module.css";

export const metadata: Metadata = {
  title: "데이터 정정 이력 | 이랑",
  description:
    "이랑 서비스의 데이터 정정 이력을 확인하세요. 발견된 오류와 수정 내역을 투명하게 공개해요.",
};

interface CorrectionEntry {
  date: string;
  field: string;
  description: string;
}

const CORRECTIONS: CorrectionEntry[] = [
  {
    date: "2026-04-16",
    field: "지원사업 상태 표시",
    description:
      "Supabase 경로에서 신청 기간 기반 상태 자동 계산(deriveStatus)이 누락되어, 일부 모집중 사업이 '마감'으로 표시되던 문제를 수정했어요.",
  },
  {
    date: "2026-04-12",
    field: "작물 수익 데이터",
    description:
      "농촌진흥청 농산물소득자료집 원본과 비교 검증 후, 일부 작물의 수익 범위 표기를 보정했어요.",
  },
  {
    date: "2026-04-10",
    field: "지원사업 외부 링크",
    description:
      "만료된 도메인(도메인 파킹 전환)과 소프트 404 페이지를 감지하여 14건의 외부 링크를 정정했어요.",
  },
];

export default function CorrectionsPage() {
  return (
    <div className={s.page}>
      <Link href="/about" className={s.backLink}>
        <ArrowLeft size={16} />
        소개 페이지로
      </Link>

      <header className={s.header}>
        <span className={s.badge}>
          <FileEdit size={14} />
          데이터 품질
        </span>
        <h1 className={s.title}>데이터 정정 이력</h1>
        <p className={s.subtitle}>
          이랑은 데이터 오류를 발견하면 즉시 수정하고, 정정 내역을 투명하게
          공개해요.
        </p>
      </header>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Calendar size={18} />
          <h2 className={s.sectionTitle}>최근 정정 내역</h2>
        </div>
        <div className={s.sourceList}>
          {CORRECTIONS.map((entry) => (
            <div key={`${entry.date}-${entry.field}`} className={s.sourceItem}>
              <span className={s.sourceName}>
                {entry.date} · {entry.field}
              </span>
              <span className={s.sourceNote}>{entry.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <MessageSquare size={18} />
          <h2 className={s.sectionTitle}>오류를 발견하셨나요?</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            잘못된 정보나 오래된 데이터를 발견하시면 알려주세요. 확인 후 빠르게
            수정하겠습니다.
          </p>
          <div className={s.callout}>
            <div>
              <strong>피드백 보내기</strong>
              <span>
                페이지 하단의 피드백 버튼을 이용하시거나, 이메일로 알려주세요.
              </span>
            </div>
          </div>
        </div>
      </section>

      <Link href="/about/disclaimer" className={s.backLink}>
        면책고지 전문 보기 <ArrowRight size={14} />
      </Link>
    </div>
  );
}
