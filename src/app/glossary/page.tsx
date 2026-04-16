import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { GLOSSARY_ENTRIES, CATEGORY_LABELS } from "@/lib/data/glossary";
import { GlossaryClient } from "./glossary-client";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "농업 용어집",
  description:
    "귀농·귀촌에서 자주 쓰이는 농업 용어를 쉽게 정리했어요. ha, 10a, 적산온도 등 낯선 단어를 검색하세요.",
};

export default function GlossaryPage() {
  return (
    <div className={s.page}>
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
