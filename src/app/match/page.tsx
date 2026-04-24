import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import type { FAQPage } from "schema-dts";
import { ServiceGateway } from "./service-gateway";

export const metadata: Metadata = {
  title: "나에게 맞는 귀농 유형은? — 귀농 유형 진단",
  description:
    "귀농형, 귀촌형, 스마트팜형… 나에게 맞는 귀농 유형을 찾아보세요. 유형에 따라 적합한 지역, 작물, 지원사업까지 한눈에 확인할 수 있어요.",
  keywords: ["귀농 유형", "귀농 진단", "귀농 테스트", "귀촌 귀산촌 차이", "귀농 적합도"],
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
              name: "귀농 지역은 어떻게 선택하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "기후, 지원사업, 생활 인프라, 재배 작물을 종합적으로 비교하는 것이 좋아요. 이랑의 지역 비교 기능으로 최대 3곳을 한눈에 비교할 수 있어요.",
              },
            },
            {
              "@type": "Question",
              name: "귀농 적합도 진단은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "나이, 가족 구성, 예산, 관심 분야 등을 입력하면 데이터 기반으로 맞춤 지역과 작물을 추천해 드려요. 약 5분이면 결과를 확인할 수 있어요.",
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
