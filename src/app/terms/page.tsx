import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Info, Database, Shield } from "lucide-react";
import s from "../about/disclaimer/page.module.css";

export const metadata: Metadata = {
  title: "이용약관 | 이랑",
  description: "이랑 서비스 이용약관. 정보의 참고성, 면책 사항, 데이터 출처에 대한 안내예요.",
};

export default function TermsPage() {
  return (
    <div className={s.page}>
      <Link href="/about" className={s.backLink}>
        <ArrowLeft size={16} />
        소개 페이지로
      </Link>

      <header className={s.header}>
        <span className={s.badge}>
          <Scale size={14} />
          이용약관
        </span>
        <h1 className={s.title}>이용약관</h1>
        <p className={s.subtitle}>
          이랑 서비스를 이용하기 전에 아래 약관을 확인해 주세요.
        </p>
      </header>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Info size={18} />
          <h2 className={s.sectionTitle}>제1조 (서비스 개요)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑은 귀농을 고려하는 분들을 위해 공공데이터를 가공·정리하여
            제공하는 정보 큐레이션 서비스예요. 정부·지자체의 공식 서비스가
            아니며, 별도의 회원가입 없이 이용할 수 있어요.
          </p>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Database size={18} />
          <h2 className={s.sectionTitle}>제2조 (정보의 참고성)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑이 제공하는 모든 정보는 공공데이터 및 제3자 출처를 가공한
            <strong> 참고 자료</strong>예요.
          </p>
          <div className={s.highlight}>
            이랑은 정보의 최신성·완결성·정확성을 보장하지 않아요. 지원사업
            신청, 귀농지 선택 등 중요한 결정은 반드시 해당 기관이나 전문가에게
            직접 확인해 주세요.
          </div>
          <p>
            이랑을 통해 얻은 정보로 발생한 경제적·시간적 손실에 대해 이랑은
            책임을 지지 않아요.
          </p>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Shield size={18} />
          <h2 className={s.sectionTitle}>제3조 (데이터 출처와 갱신)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑은 기상청, 통계청(KOSIS·SGIS), 농촌진흥청, 건강보험심사평가원,
            교육부(NEIS), 각 지자체 공고 등 공공데이터를 활용해요.
          </p>
          <p>
            데이터는 주기적으로 갱신하지만, 원본 데이터 변경과 이랑 반영 사이에
            시차가 있을 수 있어요. 데이터 오류를 발견하시면{" "}
            <Link href="/about/corrections" className={s.backLink} style={{ display: "inline" }}>
              정정 요청
            </Link>
            을 보내주세요.
          </p>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Info size={18} />
          <h2 className={s.sectionTitle}>제4조 (외부 링크)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑은 정부·지자체 등 외부 사이트 링크를 제공하지만, 해당 사이트의
            내용이나 이용 과정에서 발생하는 문제에 대해서는 책임을 지지 않아요.
          </p>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Info size={18} />
          <h2 className={s.sectionTitle}>제5조 (약관 변경)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이 약관은 서비스 개선에 따라 변경될 수 있으며, 변경 시 이 페이지를
            통해 공지해요.
          </p>
          <p className={s.sourceNote}>
            최종 수정일: 2026년 4월 16일
          </p>
        </div>
      </section>
    </div>
  );
}
