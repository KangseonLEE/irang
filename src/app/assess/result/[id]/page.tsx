/**
 * /assess/result/[id] — 공유 랜딩 페이지
 *
 * - SSR: 결과 데이터를 서버에서 조회하여 OG 메타 태그 생성
 * - 위저드 결과 화면(match-result.tsx)과 동일한 UI로 표시
 * - "나도 진단하기" CTA로 신규 사용자 전환 유도
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  RotateCcw,
  FileText,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { FARM_TYPES, type FarmTypeId } from "@/lib/data/match-questions";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { deriveStatus } from "@/lib/program-status";
import { isValidResultId } from "@/lib/assess-result";
import { getSupabase } from "@/lib/supabase";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { ShareButtons } from "@/components/share/share-buttons";
import s from "@/app/match/match-wizard.module.css";

// ── 데이터 조회 ──

async function getResult(id: string) {
  if (!isValidResultId(id)) return null;

  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("assessment_results")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

// ── OG 메타 태그 ──

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return { title: "결과를 찾을 수 없습니다 | 이랑" };
  }

  const farmType = FARM_TYPES.find(
    (t) => t.id === (result.farm_type_id as FarmTypeId)
  );
  const label = farmType?.label ?? "귀농 유형";
  const emoji = farmType?.emoji ?? "🌾";
  const regions = (result.top_regions as string[])
    .slice(0, 3)
    .map((rid: string) => {
      const p = PROVINCES.find((prov) => prov.id === rid);
      return p?.shortName ?? rid;
    })
    .join(" · ");

  const title = `${emoji} 나의 귀농 유형: ${label}`;
  const description = `추천 지역: ${regions} — 이랑에서 귀농 준비 진단을 받아보세요!`;

  const shortUrl = `https://irang.info/r/${id}`;

  return {
    title: `${title} | 이랑`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: shortUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: shortUrl,
      siteName: "이랑 — 귀농 정보 큐레이션",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ── 페이지 컴포넌트 ──

export const revalidate = 3600; // ISR: 1시간

/** 상태 우선순위 (모집중 > 모집예정 > 마감) */
const STATUS_PRIORITY: Record<string, number> = {
  "모집중": 0,
  "모집예정": 1,
  "마감": 2,
};

export default async function AssessResultPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) notFound();

  const farmType = FARM_TYPES.find(
    (t) => t.id === (result.farm_type_id as FarmTypeId)
  );
  if (!farmType) notFound();

  // 추천 지역 — Province 객체로 매핑
  const topRegions = (result.top_regions as string[]).slice(0, 3).map((rid: string) => {
    const p = PROVINCES.find((prov) => prov.id === rid);
    return { id: rid, name: p?.shortName ?? rid, description: p?.description ?? "" };
  });

  // 추천 작물 — CROPS에서 이름·카테고리·난이도 조회
  const topCrops = (result.top_crops as string[])
    .slice(0, 4)
    .map((cropId: string) => CROPS.find((c) => c.id === cropId))
    .filter((c): c is NonNullable<typeof c> => c != null);

  // 추천 지원사업 — farmType.programIds 기반
  const programs = farmType.programIds
    .map((pid) => PROGRAMS.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({
      ...p,
      status: deriveStatus(p.applicationStart, p.applicationEnd),
    }))
    .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9));

  return (
    <div className={s.page}>
      {/* 유형 카드 — 최상단 */}
      <div className={s.farmTypeCard}>
        <span className={s.farmTypeEmoji}>{farmType.emoji}</span>
        <span className={s.farmTypeOverline}>나의 귀농 준비 결과</span>
        <h1 className={s.farmTypeLabel}>{farmType.label}</h1>
        <p className={s.farmTypeTagline}>{farmType.tagline}</p>
        <p className={s.farmTypeDesc}>{farmType.description}</p>
        <div className={s.farmTypeTraits}>
          {farmType.traits.map((t) => (
            <span key={t} className={s.farmTypeTrait}>#{t}</span>
          ))}
        </div>
      </div>

      {/* 추천 지역 */}
      <section className={s.resultSection}>
        <h2 className={s.resultSectionTitle}>
          <MapPin size={18} />
          추천 지역 Top 3
        </h2>
        <div className={s.resultCards}>
          {topRegions.map((r, i) => (
            <Link
              key={r.id}
              href={`/regions/${r.id}`}
              className={s.resultCard}
            >
              <div className={s.resultCardRank}>
                {i + 1}
              </div>
              <div className={s.resultCardBody}>
                <h3 className={s.resultCardTitle}>{r.name}</h3>
                <p className={s.resultCardDesc}>{r.description}</p>
                <span className={s.resultCardLink}>
                  상세 보기 <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 추천 작물 */}
      {topCrops.length > 0 && (
        <section className={s.resultSection}>
          <h2 className={s.resultSectionTitle}>
            <Sprout size={18} />
            추천 작물
          </h2>
          <div className={s.cropCards}>
            {topCrops.map((crop) => (
              <CropLinkCard
                key={crop.id}
                cropId={crop.id}
                name={crop.name}
                href={`/crops/${crop.id}`}
                meta={`${crop.category} · 난이도 ${crop.difficulty}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 추천 지원사업 */}
      {programs.length > 0 && (
        <section className={s.resultSection}>
          <h2 className={s.resultSectionTitle}>
            <FileText size={18} />
            {farmType.label}에 맞는 지원사업
          </h2>
          <div className={s.programCards}>
            {programs.map((prog) => (
              <Link
                key={prog.id}
                href={`/programs/${prog.id}`}
                className={s.programCard}
              >
                <div className={s.programCardBody}>
                  <div className={s.programCardTitleRow}>
                    <h3 className={s.programCardTitle}>{prog.title}</h3>
                    <span
                      className={
                        prog.status === "마감"
                          ? s.programStatusClosed
                          : s.programStatusOpen
                      }
                    >
                      {prog.status}
                    </span>
                  </div>
                  <p className={s.programCardDesc}>{prog.summary}</p>
                  {prog.status === "마감" && (
                    <p className={s.programClosedHint}>
                      매년 유사 시기에 재공고되는 사업입니다
                    </p>
                  )}
                  <div className={s.programCardMeta}>
                    <span className={s.programCardBadge}>{prog.supportType}</span>
                    <span className={s.programCardRegion}>{prog.region}</span>
                  </div>
                </div>
                <ChevronRight size={16} className={s.programCardArrow} />
              </Link>
            ))}
          </div>
          <Link href="/programs" className={s.programViewAll}>
            전체 지원사업 보기 <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* 공유 버튼 */}
      <ShareButtons resultId={id} farmTypeLabel={farmType.label} />

      {/* CTA: 나도 진단하기 */}
      <section className={s.shareCta}>
        <h2 className={s.shareCtaTitle}>
          나도 귀농 준비 진단 받아보기
        </h2>
        <p className={s.shareCtaDesc}>
          5가지 질문으로 나에게 맞는 귀농 지역과 작물을 추천받으세요
        </p>
        <Link href="/match?utm_source=share&utm_medium=result" className={s.shareCtaBtn}>
          나도 진단하기
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* 이랑 둘러보기 */}
      <div className={s.resultActions}>
        <Link href="/" className={s.exploreBtn}>
          <RotateCcw size={16} />
          이랑 둘러보기
        </Link>
      </div>
    </div>
  );
}
