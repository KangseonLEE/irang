import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { GLOSSARY_ENTRIES, CATEGORY_LABELS } from "@/lib/data/glossary";
import { GlossaryClient } from "./glossary-client";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "농업 용어집",
  description: "귀농 준비에 필요한 농업 용어를 쉽게 알아보세요.",
};

export default function GlossaryPage() {
  return (
    <div className={s.page}>
      <header className={s.pageHeader}>
        <span className={s.headerOverline}>
          <BookOpen size={16} aria-hidden="true" />
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
