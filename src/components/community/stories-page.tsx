import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { CommunityNotes } from "@/components/community/community-notes";
import type { NoteTargetType } from "@/lib/community/types";
import { BreadcrumbJsonLd, type BreadcrumbItem } from "@/components/seo/breadcrumb-jsonld";
import s from "./stories-page.module.css";

interface Props {
  targetType: NoteTargetType;
  targetId: string;
  /** 제목·문구에 쓰는 이름 (예: "전라남도", "감") */
  label: string;
  /** 돌아갈 상세 페이지 */
  backHref: string;
  backLabel: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * 현장 이야기 전용 화면 (2026-09-17).
 *
 * 상세 페이지 맨 아래 섹션의 "전체 보기 →" 가 여기로 온다. 상세 페이지는 본문이 길어
 * 이야기가 문서 69~85% 지점에 묻히므로, 이야기만 보고 싶은 사람에게 짧은 화면을 준다.
 * 목록·작성 UI 는 상세와 같은 CommunityNotes 를 그대로 쓴다 — 두 화면이 어긋날 일이 없다.
 */
export function StoriesPage({ targetType, targetId, label, backHref, backLabel, breadcrumbs }: Props) {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Link href={backHref} className={s.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        {backLabel}
      </Link>
      <header className={s.header}>
        <span className={s.overline}>
          <MessageSquareText size={14} aria-hidden="true" />
          현장 이야기
        </span>
        <h1 className={s.title}>{label}, 먼저 겪은 사람들의 한마디</h1>
        <p className={s.desc}>
          공공데이터가 담지 못하는 현장 감각이에요. 살아보거나 알아보는 중이라면 한마디
          남겨 주세요.
        </p>
      </header>
      <CommunityNotes targetType={targetType} targetId={targetId} targetLabel={label} />
    </div>
  );
}

/** 전용 화면 메타데이터 — UGC 가 적을 땐 얇은 페이지라 색인하지 않고 상세를 canonical 로 */
export function storiesMetadata(label: string, canonicalPath: string): Metadata {
  return {
    title: `${label} 현장 이야기 | 이랑`,
    description: `${label}에 대해 먼저 겪은 사람들의 한마디. 검토를 거쳐 게시돼요.`,
    robots: { index: false, follow: true },
    alternates: { canonical: canonicalPath },
  };
}
