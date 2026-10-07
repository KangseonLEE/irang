import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import type { FAQPage } from "schema-dts";
import { GatewayCards, GatewayIntro } from "./gateway-select";
import { ServiceGateway } from "./service-gateway";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "나에게 맞는 농촌 정착 — 1분 빠른 점검부터 14문항 정밀 진단까지",
    description:
      "1분이면 끝나는 빠른 점검, 14문항 적합도 진단, 10문항 유형 진단. 나에게 맞는 지역·작물·지원 사업까지 데이터로 추천해 드려요.",
    path: "/match",
  }),
  keywords: [
    "정착 유형",
    "농촌 정착 진단",
    "농촌 정착 테스트",
    "귀촌 귀산촌 차이",
    "농촌 정착 적합도",
    "맞춤 지역 추천",
    "내 상황 점검",
    "빠른 자기 점검",
    "1분 귀농 점검",
  ],
};

interface PageProps {
  /** 모드를 정하는 키 — gateway-mode.ts resolveGatewayMode */
  searchParams: Promise<{ mode?: string; experience?: string; lifestyle?: string }>;
}

export default async function MatchPage({ searchParams }: PageProps) {
  /* searchParams 를 읽으면 이 페이지는 요청 시 렌더(동적)다 — 게이트웨이의 useSearchParams 가 서버에서 바로 값을 받아
     ?mode= 에 맞는 첫 화면(h1 포함)이 HTML 에 그대로 들어간다. 정적 프리렌더였을 땐 그 훅이 BAILOUT 으로 게이트웨이
     전체를 CSR 로 넘겨 HTML 에는 로딩 스켈레톤만 있었다(5/15~, 10/6 QA Q2-W4). revalidate 는 두지 않는다(동적 페이지). */
  await searchParams;

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
                text: "연령·가족·농업 의향·자본 4문항으로 약 1분이면 정착 윤곽을 잡을 수 있어요. 결과로 맞춤 지역·작물·지원 사업을 한번에 추천해 드려요.",
              },
            },
            {
              "@type": "Question",
              name: "농촌 정착 적합도 진단은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "동기·재정·가족·경험·적응력 5가지 차원으로 약 4분이면 정착 준비도를 점검할 수 있어요. 부족한 차원과 함께 국가지원 트랙을 추천해 드려요.",
              },
            },
            {
              "@type": "Question",
              name: "정착 지역은 어떻게 선택하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "기후, 지원사업, 생활 인프라, 재배 작물을 종합적으로 비교하는 것이 좋아요. 이랑의 지역 비교 기능으로 최대 3곳을 한눈에 비교할 수 있어요.",
              },
            },
          ],
        }}
      />
      <ServiceGateway intro={<GatewayIntro />} cards={<GatewayCards />} />
    </>
  );
}
