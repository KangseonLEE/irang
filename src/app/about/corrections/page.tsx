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
  alternates: { canonical: "/about/corrections" },
};

interface CorrectionEntry {
  date: string;
  field: string;
  description: string;
}

const CORRECTIONS: CorrectionEntry[] = [
  {
    date: "2026-05-09",
    field: "농촌 소식 데이터 2026 갱신 + 마감 공고 자동 숨김",
    description:
      "랜딩 ‘농촌 소식’ 5종 카테고리(뉴스·교육·행사·지원·정책)의 정적 폴백 데이터를 2026년 1~5월 기준 최신 기사·모집 공고로 전면 재작성했어요. 각 항목에 출처별 OG 요약과 썸네일을 정적으로 박아 두었고, 교육·행사 카테고리에서 ‘수료식·신청 종료’ 등 마감 키워드 또는 12개월+ 지난 항목은 자동으로 숨김 처리됩니다.",
  },
  {
    date: "2026-05-09",
    field: "귀농인 인터뷰 인용 정책 정비",
    description:
      "본인 명시 동의 없이 게재되어 있던 인터뷰 본문(이야기·동기·어려움·조언)을 일괄 제거하고, 미동의자의 카드는 원문 기사로 직접 이동하도록 변경했어요. 본인 정정·삭제 요청 채널을 페이지 하단에 명시하고 약관 제4조에 인용 정책을 명문화했어요.",
  },
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
            데이터 오류, 외부 링크 문제, 본인 정보 정정·삭제 요청까지 — 어떤 종류든
            알려주시면 영업일 3일 안에 확인하고 처리해 드려요.
          </p>
          <div className={s.callout}>
            <div>
              <strong>피드백 보내기</strong>
              <a
                href={`mailto:loyal3270@gmail.com?subject=${encodeURIComponent("[이랑] 데이터 정정 요청")}`}
                className={s.calloutPhone}
              >
                loyal3270@gmail.com
              </a>
              <span style={{ display: "block", marginTop: 4 }}>
                메일 제목과 본문에 어느 페이지의 어떤 데이터인지 적어주시면 빠르게 처리돼요.
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
