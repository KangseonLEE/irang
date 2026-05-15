import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import type { FAQPage } from "schema-dts";
import { ServiceGateway } from "./service-gateway";

export const metadata: Metadata = {
  title: "나에게 맞는 귀농 — 1분 빠른 점검부터 14문항 정밀 진단까지",
  description:
    "1분이면 끝나는 빠른 점검, 14문항 적합도 진단, 10문항 유형 진단. 나에게 맞는 지역·작물·지원 사업까지 데이터 기반으로 추천해 드려요.",
  keywords: [
    "귀농 유형",
    "귀농 진단",
    "귀농 테스트",
    "귀촌 귀산촌 차이",
    "귀농 적합도",
    "맞춤 지역 추천",
    "내 상황 점검",
    "빠른 자기 점검",
    "1분 귀농 점검",
  ],
  alternates: { canonical: "/match" },
};

export default function MatchPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "맞춤 매칭", href: "/match" }]} />
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "빠른 점검은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "연령·가족·농업 의향·자본 4문항으로 약 1분이면 내 귀농 윤곽을 잡을 수 있어요. 결과로 맞춤 지역·작물·지원 사업을 한번에 추천해 드려요.",
              },
            },
            {
              "@type": "Question",
              name: "귀농 적합도 진단은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "동기·재정·가족·경험·적응력 5가지 차원으로 약 4분이면 나의 귀농 준비도를 점검할 수 있어요. 부족한 차원과 함께 국가지원 트랙을 추천해 드려요.",
              },
            },
            {
              "@type": "Question",
              name: "귀농 지역은 어떻게 선택하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "기후, 지원사업, 생활 인프라, 재배 작물을 종합적으로 비교하는 것이 좋아요. 이랑의 지역 비교 기능으로 최대 3곳을 한눈에 비교할 수 있어요.",
              },
            },
          ],
        }}
      />
      <Suspense>
        <ServiceGateway />
      </Suspense>
    </>
  );
}
