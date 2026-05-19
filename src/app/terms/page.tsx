import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Info, Database, Shield, Quote } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import s from "../about/disclaimer/page.module.css";

export const metadata: Metadata = {
  title: "이용약관 | 이랑",
  description: "이랑 서비스 이용약관. 정보의 참고성, 면책 사항, 데이터 출처에 대한 안내예요.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "이용약관", href: "/terms" }]} />
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
            이랑은 농촌 정착을 고려하는 분들을 위해 공공데이터를 가공·정리하여
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
            이랑에서 보여드리는 모든 정보는 공공데이터 및 제3자 출처를 가공한
            <strong> 참고 자료</strong>예요.
          </p>
          <div className={s.highlight}>
            이랑은 정보의 최신성·완결성·정확성을 보장하지 않아요. 지원사업
            신청, 정착지 선택 등 중요한 결정은 반드시 해당 기관이나 전문가에게
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
            <Link href="/about/corrections" className={`${s.backLink} ${s.inlineLink}`}>
              정정 요청
            </Link>
            을 보내주세요.
          </p>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Quote size={18} />
          <h2 className={s.sectionTitle}>제4조 (정착 인터뷰 인용 정책)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이랑은 농민신문·서울신문·KBC광주방송 등 공인 언론에 보도된
            정착 인터뷰 일부를 큐레이션하여 소개해요. 인용 범위와 처리
            방식은 다음과 같아요.
          </p>
          <ul className={s.sourceList}>
            <li className={s.sourceItem}>
              <span className={s.sourceName}>인용 범위</span>
              <span>
                실명·지역·작물·직업 등 사실 정보와 짧은 발언 인용(저작권법
                제28조 공정이용 범위). 출처 매체명·게재일·원문 링크를 함께
                표기해요.
              </span>
            </li>
            <li className={s.sourceItem}>
              <span className={s.sourceName}>본문 풀텍스트 게재</span>
              <span>
                본인이 명시적으로 동의해 주신 경우에만 상세 페이지에 본문을
                게재해요. 동의 일자를 데이터에 기록하고, 미동의자의 카드를
                누르면 원문 기사로 직접 이동해요.
              </span>
            </li>
            <li className={s.sourceItem}>
              <span className={s.sourceName}>정정·삭제 요청</span>
              <span>
                본인 정보가 잘못 표시됐거나 게재 중단을 원하시면{" "}
                <a href="mailto:loyal3270@gmail.com" className={`${s.backLink} ${s.inlineLink}`}>
                  loyal3270@gmail.com
                </a>{" "}
                또는{" "}
                <Link href="/about/corrections" className={`${s.backLink} ${s.inlineLink}`}>
                  정정 요청 폼
                </Link>
                으로 연락해 주세요. 영업일 3일 안에 처리해 드려요.
              </span>
            </li>
          </ul>
          <div className={s.highlight}>
            원문 기사 저작권은 각 언론사에 있어요. 이랑은 큐레이션을 위한
            인용을 제공할 뿐이며, 원문 전문 복제·재배포는 하지 않아요.
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Info size={18} />
          <h2 className={s.sectionTitle}>제5조 (외부 링크)</h2>
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
          <h2 className={s.sectionTitle}>제6조 (약관 변경)</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            이 약관은 서비스 개선에 따라 변경될 수 있으며, 변경 시 이 페이지를
            통해 공지해요.
          </p>
          <p className={s.sourceNote}>
            최종 수정일: 2026년 5월 9일
          </p>
        </div>
      </section>
    </div>
  );
}
