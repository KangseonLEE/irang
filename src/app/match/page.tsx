import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import { ServiceGateway } from "./service-gateway";

export const metadata: Metadata = {
  title: "귀농 어디가 좋을까 — 맞춤 지역·작물 매칭",
  description:
    "내 나이, 예산, 관심 작물에 맞는 귀농 지역을 찾아보세요. 데이터 기반 맞춤 추천으로 귀농 후보지를 비교할 수 있어요.",
};

export default function MatchPage() {
  return (
    <>
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
