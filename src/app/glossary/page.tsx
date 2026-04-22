import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { GLOSSARY_ENTRIES, CATEGORY_LABELS } from "@/lib/data/glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { GlossaryClient } from "./glossary-client";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 농업 용어집 — ha, 10a, 적산온도 등 107개",
  description:
    "귀농·귀촌 준비 중 만나는 농업 용어를 쉽게 정리했어요. ha, 10a, 적산온도, 객토 등 107개 용어를 카테고리별로 검색할 수 있어요.",
  keywords: ["농업 용어", "귀농 용어", "ha 뜻", "10a 뜻", "적산온도", "농업 사전"],
};

export default function GlossaryPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "농업 용어집", href: "/glossary" }]} />
      <header className={s.pageHeader}>
        <span className={s.headerOverline}>
          <Icon icon={BookOpen} size="md" />
          Glossary
        </span>
        <h1 className={s.headerTitle}>농업 용어집</h1>
        <p className={s.headerDesc}>
          처음 만나는 농업 용어, 쉽게 알아보세요.
        </p>
      </header>
      <GlossaryClient
        entries={GLOSSARY_ENTRIES}
        categoryLabels={CATEGORY_LABELS}
      />
    </div>
  );
}
