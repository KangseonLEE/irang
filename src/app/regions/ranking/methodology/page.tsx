// /regions/ranking/methodology — 차원별 점수 산식 공개 (Phase 4)
//
// 사용자 신뢰 확보. 회장 작업철학 #1 (데이터 근거) 직접 부합.
// 5차원 각각의 데이터 출처 + 정규화 방식 + 갱신 주기 + 누락 시군구를 명시.

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { DataSource } from "@/components/ui/data-source";
import { POPULAR_RETURN_FARM_CODES } from "@/lib/data/popular-tags";
import { DIMENSION_SCORES } from "@/lib/data/dimension-scores";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "점수는 어떻게 만들었나요? — 산식 공개",
  description:
    "이랑의 차원별 점수가 어떤 데이터로 어떻게 계산되는지 자세히 보여드려요. 모두 공공 데이터 기반이에요.",
  alternates: { canonical: "/regions/ranking/methodology" },
};

export const revalidate = 86400;

const DIMENSIONS = [
  {
    label: "인구 추세",
    desc: "최근 5년 동안 인구가 늘었는지 줄었는지를 보여드려요.",
    source: "통계청 SGIS 인구통계 (5년치)",
    formula:
      "(가장 최근 인구 - 5년 전 인구) / 5년 전 인구 × 100 = 변화율(%)",
    normalize:
      "변화율을 0~100 점수로 바꿔요. -10% 이하면 0점, +5% 이상이면 100점, 그 사이는 일정하게 펼쳐요.",
    note: "+1% 이상이면 ‘회복 중’, -5% 이하면 ‘가속 감소’, 그 사이는 ‘안정’으로 표시해요.",
    cycle: "1년에 한 번 갱신",
  },
  {
    label: "농가 활성도",
    desc: "그 지역에 농가가 얼마나 활발한지를 인구 대비로 보여드려요.",
    source: "통계청 SGIS 농림어업총조사 (2020년)",
    formula: "인구 1만 명당 농가 수 = 농가 수 / (인구 / 10,000)",
    normalize:
      "전국 시군구를 줄 세워서 위에서 몇 %인지를 1~100점으로 표시해요. 점수가 높을수록 농업이 활발해요.",
    note: "도시 자치구는 농가 통계가 따로 잡히지 않아 빠져 있어요.",
    cycle: "5년에 한 번 갱신 (농림어업총조사 주기)",
  },
  {
    label: "의료 인프라",
    desc: "그 지역에 의료기관이 인구 대비 얼마나 많은지를 보여드려요.",
    source: "건강보험심사평가원 의료기관 정보",
    formula: "인구 1만 명당 의료기관 수 = 의료기관 수 / (인구 / 10,000)",
    normalize:
      "전국 시군구를 줄 세워서 위에서 몇 %인지를 1~100점으로 표시해요.",
    note: null,
    cycle: "1년에 한 번 갱신",
  },
  {
    label: "학교 인프라",
    desc: "초·중·고 학교가 인구 대비 얼마나 많은지를 보여드려요.",
    source: "교육부 NEIS 학교정보",
    formula: "인구 1만 명당 학교 수 = 학교 수 / (인구 / 10,000)",
    normalize:
      "전국 시군구를 줄 세워서 위에서 몇 %인지를 1~100점으로 표시해요.",
    note: "군위군은 행정구역이 바뀌면서 NEIS에 등록되지 않아 학교 점수가 빠져 있어요.",
    cycle: "1년에 한 번 갱신",
  },
  {
    label: "귀농 활성도",
    desc: "그 지역에 귀농 인구가 얼마나 들어왔는지를 인구 대비로 보여드려요.",
    source: "통계청 KOSIS 귀농어·귀촌인 통계 (2024년)",
    formula: "귀농 인구 수 / 그 지역 전체 인구 × 100 = 귀농 비율(%)",
    normalize:
      "전국 시군구를 줄 세워서 위에서 몇 %인지를 1~100점으로 표시해요.",
    note: "도시 자치구는 귀농 통계가 따로 잡히지 않아 빠져 있어요.",
    cycle: "1년에 한 번 갱신",
  },
] as const;

export default function MethodologyPage() {
  const totalSigungu = DIMENSION_SCORES.length;
  const popularCount = POPULAR_RETURN_FARM_CODES.size;

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "지역 탐색", href: "/regions" },
          { name: "차원별 점수", href: "/regions/ranking" },
          {
            name: "산식 공개",
            href: "/regions/ranking/methodology",
          },
        ]}
      />

      <PageHeader
        icon={<Icon icon={BookOpen} size="lg" />}
        label="차원별 점수"
        title="점수는 어떻게 만들었나요?"
        description="이랑의 점수는 모두 공공 데이터를 그대로 가공한 거예요. 임의로 만든 추정값은 쓰지 않아요."
      />

      {/* 원칙 */}
      <section className={s.principleBox} aria-label="점수 원칙">
        <h2 className={s.principleTitle}>점수를 만들 때 지키는 원칙</h2>
        <ul className={s.principleList}>
          <li>임의로 만든 추정값은 쓰지 않아요. 공공 통계가 있는 데이터만 점수로 바꿔요.</li>
          <li>
            차원별로 따로 보여드려요. 종합 한 점으로 묶지 않아요. 사람마다 중요하게
            보는 항목이 다르기 때문이에요.
          </li>
          <li>
            데이터가 없는 시군구는 그 차원을 표시하지 않아요. 0점으로 처리해
            오해를 만들지 않아요.
          </li>
          <li>
            정규화는 "전국에서 어디쯤인지(상위 N%)"로 통일했어요. 점수 해석이
            한결 같도록요.
          </li>
        </ul>
      </section>

      {/* 차원별 상세 */}
      <section aria-label="차원별 상세">
        <h2 className={s.sectionTitle}>5가지 차원 자세히 보기</h2>
        <div className={s.dimList}>
          {DIMENSIONS.map((d) => (
            <article key={d.label} className={s.dimCard}>
              <h3 className={s.dimLabel}>{d.label}</h3>
              <p className={s.dimDesc}>{d.desc}</p>
              <dl className={s.dimMeta}>
                <div>
                  <dt>데이터 출처</dt>
                  <dd>{d.source}</dd>
                </div>
                <div>
                  <dt>계산 방식</dt>
                  <dd>{d.formula}</dd>
                </div>
                <div>
                  <dt>점수로 바꾸기</dt>
                  <dd>{d.normalize}</dd>
                </div>
                <div>
                  <dt>갱신 주기</dt>
                  <dd>{d.cycle}</dd>
                </div>
              </dl>
              {d.note && <p className={s.dimNote}>📌 {d.note}</p>}
            </article>
          ))}
        </div>
      </section>

      {/* 귀농인기 라벨 */}
      <section className={s.principleBox} aria-label="귀농인기 라벨 기준">
        <h2 className={s.principleTitle}>‘귀농인기’ 라벨은 어떻게 정해지나요?</h2>
        <p className={s.principleText}>
          이전에는 손으로 표시한 라벨이었지만, 객관성을 높이기 위해{" "}
          <strong>KOSIS 귀농 인구 비율 전국 상위 25%</strong>를 자동으로
          ‘귀농인기’로 표시해요. 현재 기준 <strong>{popularCount}개</strong> 시군구가
          해당돼요.
        </p>
      </section>

      {/* 통계 요약 */}
      <section className={s.principleBox} aria-label="통계">
        <h2 className={s.principleTitle}>전체 통계</h2>
        <p className={s.principleText}>
          현재 <strong>{totalSigungu}개</strong> 시군구의 차원별 점수가 만들어져
          있어요. 데이터가 갱신되면 자동으로 점수도 새로 계산돼요.
        </p>
      </section>

      <p className={s.backLink}>
        <Link href="/regions/ranking">← 차원별 점수 랭킹으로 돌아가기</Link>
      </p>

      <DataSource source="통계청 SGIS · 농림어업총조사 · 심평원 · 교육부 NEIS · KOSIS" />
    </div>
  );
}
