import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Wallet,
  User,
  AlertTriangle,
  Sprout,
  ArrowRight,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { CollectionPage } from "schema-dts";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 가이드 모음 | 이랑",
  description:
    "귀농 준비 순서, 50대 귀농 자본, 1인 귀농, 실패 사례, 초보 추천 작물까지 — 상황별 귀농 가이드를 모았어요.",
  keywords: [
    "귀농 가이드",
    "귀농 준비",
    "귀농 비용",
    "50대 귀농",
    "1인 귀농",
    "귀농 절차",
    "귀농 실패 사례",
    "초보 귀농 추천 작물",
  ],
};

const GUIDES = [
  {
    href: "/guides/preparation",
    icon: ClipboardList,
    title: "귀농 준비 순서",
    desc: "정보 수집부터 영농 시작까지, 5단계로 정리했어요.",
    keywords: ["귀농 준비 순서", "귀농 절차", "귀농 준비 체크리스트"],
  },
  {
    href: "/guides/budget-50s",
    icon: Wallet,
    title: "50대 귀농 자본",
    desc: "은퇴 후 귀농, 현실적인 비용과 전략을 알려드려요.",
    keywords: ["50대 귀농 자본", "50대 귀농 비용", "50대 귀농 준비"],
  },
  {
    href: "/guides/solo-farming",
    icon: User,
    title: "1인 귀농",
    desc: "혼자서도 가능한 귀농, 준비가 다를 뿐이에요.",
    keywords: ["1인 귀농", "혼자 귀농", "1인 귀농 가능"],
  },
  {
    href: "/guides/failure-cases",
    icon: AlertTriangle,
    title: "귀농 실패 사례",
    desc: "실패 사례에서 배우는 귀농 준비의 핵심이에요.",
    keywords: ["귀농 실패 사례", "귀농 실패 이유", "귀농 후회"],
  },
  {
    href: "/guides/beginner-crops",
    icon: Sprout,
    title: "초보 추천 작물",
    desc: "난이도 낮고 안정적인 작물로 시작하세요.",
    keywords: ["초보 귀농 추천 작물", "귀농 초보 작물", "쉬운 작물"],
  },
] as const;

export default function GuidesPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd
        items={[{ name: "귀농 가이드", href: "/guides" }]}
      />
      <JsonLd<CollectionPage>
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "귀농 가이드 모음",
          description:
            "귀농 준비 순서, 50대 귀농 자본, 1인 귀농, 실패 사례, 초보 추천 작물까지 — 상황별 귀농 가이드 모음",
          url: "https://irangfarm.com/guides",
        }}
      />

      <header className={s.header}>
        <span className={s.overline}>
          <Icon icon={BookOpen} size="sm" />
          GUIDE
        </span>
        <h1 className={s.title}>상황별 귀농 가이드</h1>
        <p className={s.desc}>
          귀농이 막막할 때, 내 상황에 맞는 가이드부터 읽어보세요.
        </p>
      </header>

      <div className={s.grid}>
        {GUIDES.map((guide) => (
          <Link key={guide.href} href={guide.href} className={s.card}>
            <div className={s.cardIcon}>
              <Icon icon={guide.icon} size="lg" />
            </div>
            <div className={s.cardBody}>
              <h2 className={s.cardTitle}>{guide.title}</h2>
              <p className={s.cardDesc}>{guide.desc}</p>
              <div className={s.cardKeywords}>
                {guide.keywords.map((kw) => (
                  <span key={kw} className={s.keyword}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <Icon icon={ArrowRight} size="md" className={s.cardArrow} />
          </Link>
        ))}
      </div>

      <footer className={s.footer}>
        <p className={s.footerText}>
          더 자세한 단계별 안내가 필요하다면
        </p>
        <Link href="/guide" className={s.footerLink}>
          5단계 프로세스 가이드 보기
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </footer>
    </div>
  );
}
