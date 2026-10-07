import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { GLOSSARY_ENTRIES, CATEGORY_LABELS } from "@/lib/data/glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { shareMetadata } from "@/lib/seo/share-metadata";
import { GlossaryClient } from "./glossary-client";
import s from "./page.module.css";

/* 용어 수는 배열에서 센다 — "107개"로 박혀 있던 동안 실제 용어는 165~168개였다(10/6 QA 중 확인, CLAUDE.md 수치 하드코딩 금지) */
const TERM_COUNT = GLOSSARY_ENTRIES.length;
const TITLE = `귀농 농업 용어집 — ha, 10a, 적산온도 등 ${TERM_COUNT}개`;
const DESCRIPTION = `귀농·귀촌 준비 중 만나는 농업 용어를 쉽게 정리했어요. ha, 10a, 적산온도, 객토 등 ${TERM_COUNT}개 용어를 카테고리별로 검색할 수 있어요.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["농업 용어", "귀농 용어", "ha 뜻", "10a 뜻", "적산온도", "농업 사전"],
  alternates: { canonical: "/glossary" },
  // 공유 카드 — 페이지 openGraph 가 없으면 레이아웃의 사이트 기본 제목·설명이 그대로 나갔다(10/6 QA Q2-W3)
  ...shareMetadata({ title: `${TITLE} | 이랑`, description: DESCRIPTION, path: "/glossary" }),
};

export default function GlossaryPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "농업 용어집", href: "/glossary" }]} />
      <PageHeader
        icon={<Icon icon={BookOpen} size="md" />}
        label="Glossary"
        title="농업 용어집"
        description="처음 만나는 농업 용어, 쉽게 알아보세요."
      />
      <GlossaryClient
        entries={GLOSSARY_ENTRIES}
        categoryLabels={CATEGORY_LABELS}
      />
    </div>
  );
}
