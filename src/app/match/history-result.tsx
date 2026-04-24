/**
 * 이전 진단 결과 뷰어 — localStorage 데이터로 결과 재구성
 *
 * Supabase 의존 없이 localStorage에 저장된 farmTypeId, regionIds, cropIds로
 * 결과 화면을 재구성합니다. history에서 클릭한 결과가 Supabase에 없어도 동작.
 */

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  RotateCcw,
  FileText,
  Calculator,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { FARM_TYPES, migrateFarmTypeId } from "@/lib/data/match-questions";
import type { FarmTypeId } from "@/lib/data/match-questions";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { deriveStatus } from "@/lib/program-status";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { PersonalizedRoadmap } from "@/components/match/personalized-roadmap";
import s from "./match-wizard.module.css";

/** 상태 우선순위 (모집중 > 모집예정 > 마감) */
const STATUS_PRIORITY: Record<string, number> = {
  "모집중": 0,
  "모집예정": 1,
  "마감": 2,
};

interface HistoryResultProps {
  farmTypeId: FarmTypeId;
  regionIds: string[];
  cropIds: string[];
  onBack: () => void;
}

export function HistoryResult({
  farmTypeId,
  regionIds,
  cropIds,
  onBack,
}: HistoryResultProps) {
  const migratedId = migrateFarmTypeId(farmTypeId);
  const farmType = FARM_TYPES.find((t) => t.id === migratedId);

  if (!farmType) return null;

  const topRegions = regionIds
    .map((rid) => {
      const p = PROVINCES.find((prov) => prov.id === rid);
      return p
        ? { id: rid, name: p.shortName, description: p.description }
        : null;
    })
    .filter((r): r is NonNullable<typeof r> => r != null);

  const topCrops = cropIds
    .map((cid) => CROPS.find((c) => c.id === cid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const programs = farmType.programIds
    .map((pid) => PROGRAMS.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({
      ...p,
      status: deriveStatus(p.applicationStart, p.applicationEnd),
    }))
    .sort(
      (a, b) =>
        (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9)
    );

  return (
    <div className={s.page}>
      {/* 유형 카드 */}
      <div className={s.farmTypeCard}>
        <span className={s.farmTypeEmoji}>{farmType.emoji}</span>
        <span className={s.farmTypeOverline}>나의 귀농 유형</span>
        <h1 className={s.farmTypeLabel}>{farmType.label}</h1>
        <p className={s.farmTypeTagline}>{farmType.tagline}</p>
        <p className={s.farmTypeDesc}>{farmType.description}</p>
        <div className={s.farmTypeTraits}>
          {farmType.traits.map((t) => (
            <span key={t} className={s.farmTypeTrait}>
              #{t}
            </span>
          ))}
        </div>
      </div>

      <ReferenceNotice text="유형 분류와 추천 정보는 공공데이터 기반 참고 가이드예요. 최종 결정은 현지 방문과 전문가 상담을 권장해요." />

      {/* 추천 지역 */}
      {topRegions.length > 0 && (
        <section className={s.resultSection}>
          <h2 className={s.resultSectionTitle}>
            <MapPin size={18} />
            {farmType.label}에 어울리는 지역
          </h2>
          <div className={s.resultCards}>
            {topRegions.map((r, i) => (
              <Link
                key={r.id}
                href={`/regions/${r.id}`}
                className={s.resultCard}
              >
                <div className={s.resultCardRank}>{i + 1}</div>
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
      )}

      {/* 추천 작물 */}
      {topCrops.length > 0 && (
        <section className={s.resultSection}>
          <h2 className={s.resultSectionTitle}>
            <Sprout size={18} />
            {farmType.label}에 적합한 작물
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
        <section className={`${s.resultSection} ${s.programSection}`}>
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
                      매년 유사 시기에 재공고되는 사업이에요
                    </p>
                  )}
                  <div className={s.programCardMeta}>
                    <span className={s.programCardBadge}>
                      {prog.supportType}
                    </span>
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

      {/* 맞춤 로드맵 */}
      <PersonalizedRoadmap
        farmTypeId={farmType.id}
        farmTypeLabel={farmType.label}
      />

      {/* 비용 계산 바로가기 */}
      <Link href="/costs#simulator" className={s.costCtaCard}>
        <div className={s.costCtaIcon}>
          <Calculator size={20} />
        </div>
        <div className={s.costCtaBody}>
          <h3 className={s.costCtaTitle}>귀농 비용, 얼마나 들까?</h3>
          <p className={s.costCtaDesc}>
            연령·작물·규모별 예상 비용을 바로 계산해 보세요
          </p>
        </div>
        <ArrowRight size={16} className={s.costCtaArrow} />
      </Link>

      {/* 액션 버튼 */}
      <div className={s.resultActions}>
        <button onClick={onBack} className={s.resetBtn}>
          <RotateCcw size={16} />
          목록으로 돌아가기
        </button>
        <Link href="/regions" className={s.exploreBtn}>
          전체 지역 탐색
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
