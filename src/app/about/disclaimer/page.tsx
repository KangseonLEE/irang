import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  Database,
  Phone,
  ExternalLink,
  MessageSquare,
  Shield,
} from "lucide-react";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "이용 안내 및 면책 고지",
  description:
    "이랑은 공공데이터 기반 귀농 정보 큐레이션 서비스예요. 데이터 출처, 정확성, 이용 시 유의사항을 안내해요.",
  alternates: { canonical: "/about/disclaimer" },
};

const dataSources = [
  {
    name: "농촌진흥청 농산물소득자료집",
    note: "국가승인통계 제143002호",
  },
  {
    name: "통계청 KOSIS",
    note: "인구, 귀농·귀촌 통계",
  },
  {
    name: "기상청 종관기상관측(ASOS)",
    note: "공공데이터포털 경유",
  },
  {
    name: "통계지리정보서비스(SGIS)",
    note: "인구 밀도, 지리 통계",
  },
  {
    name: "건강보험심사평가원",
    note: "의료기관 현황",
  },
  {
    name: "교육부 NEIS",
    note: "학교 정보",
  },
  {
    name: "각 지방자치단체",
    note: "귀농·귀촌 지원사업 공고",
  },
];

export default function DisclaimerPage() {
  return (
    <div className={s.page}>
      <Link href="/" className={s.backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        홈으로 돌아가기
      </Link>

      <div className={s.header}>
        <span className={s.badge}>
          <Info size={14} aria-hidden="true" />
          참고용 정보 서비스
        </span>
        <h1 className={s.title}>이용 안내 및 면책 고지</h1>
        <p className={s.subtitle}>
          이랑을 이용하기 전에 아래 내용을 확인해 주세요.
        </p>
      </div>

      {/* 1. 서비스 안내 */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Shield size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>서비스 안내</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            <AutoGlossary text="이랑은 귀농을 준비하는 분들을 위한 정보 큐레이션 서비스예요." />
          </p>
          <p>
            <AutoGlossary text="공공데이터포털, 농촌진흥청, 통계청, 기상청 등 공공기관이 제공하는 데이터를 정리해서 보여드려요." />
          </p>
          <p className={s.highlight}>
            정부 기관이나 지방자치단체의 공식 서비스가 아니에요.
          </p>
        </div>
      </section>

      {/* 2. 데이터 정확성 */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Database size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>데이터 정확성</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            모든 데이터는 출처 기관의 공식 자료를 기반으로 해요.
          </p>
          <p>
            데이터 갱신 시점에 따라 최신 정보와 차이가 있을 수 있어요.
          </p>
          <p className={s.highlight}>
            <AutoGlossary text="통계 수치, 지원사업 내용, 교육 일정 등은 반드시 해당 기관에서 직접 확인해 주세요." />
          </p>
        </div>
      </section>

      {/* 3. 의사결정 관련 */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Phone size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>의사결정 관련</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑에서 제공하는 정보는 참고 자료예요.
          </p>
          <p>
            <AutoGlossary text="귀농·귀촌과 관련된 중요한 결정은 전문 상담을 받아보시는 걸 권해요." />
          </p>
          <div className={s.callout}>
            <Phone size={16} aria-hidden="true" />
            <div>
              <strong>귀농귀촌종합센터</strong>
              <span className={s.calloutPhone}>1899-9097</span>
            </div>
          </div>
          <p>
            투자, 부동산, 영농 계획 등 재정적 결정에 대한 책임은 이용자 본인에게 있어요.
          </p>
        </div>
      </section>

      {/* 4. 외부 링크 */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <ExternalLink size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>외부 링크</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑에서 연결되는 외부 사이트의 내용은 해당 사이트의 책임이에요.
          </p>
          <p>
            외부 링크의 유효성은 주기적으로 확인하지만, 링크가 변경되거나 삭제될 수 있어요.
          </p>
        </div>
      </section>

      {/* 5. 데이터 출처 */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Database size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>데이터 출처</h2>
        </div>
        <div className={s.sectionBody}>
          <ul className={s.sourceList}>
            {dataSources.map((source) => (
              <li key={source.name} className={s.sourceItem}>
                <span className={s.sourceName}>{source.name}</span>
                <span className={s.sourceNote}>{source.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. 문의 */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <MessageSquare size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>문의</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            데이터 오류나 개선 제안은 언제든 환영해요.
          </p>
          <p>
            서비스 내 피드백 기능을 이용하시거나,{" "}
            <Link href="/about/corrections">정정 이력 페이지</Link>에서
            지금까지의 수정 내역을 확인하실 수 있어요.
          </p>
          <p>
            <Link href="/terms">이용약관</Link>도 함께 확인해 주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
