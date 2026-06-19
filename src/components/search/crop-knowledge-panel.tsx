import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CropPanel } from "@/lib/data/search-index";
import { PROVINCES } from "@/lib/data/regions";

import s from "./crop-knowledge-panel.module.css";

/** 시도 정식명 → 짧은 표기 (칩 노출용) */
function shortenRegion(name: string): string {
  return PROVINCES.find((pv) => pv.name === name)?.shortName ?? name;
}

interface CropKnowledgePanelProps {
  panel: CropPanel;
}

/**
 * 작물 지식 패널 (Knowledge Panel) — 단일 작물 정확 검색 시 엔티티 요약.
 * 핵심 fact 그리드 + 주산지 + 섹션 바로가기(sitelinks) + 관련작물.
 */
export function CropKnowledgePanel({ panel }: CropKnowledgePanelProps) {
  return (
    <section className={s.panel} aria-label={`${panel.cropName} 요약`}>
      <div className={s.head}>
        <span className={s.emoji} aria-hidden="true">
          {panel.emoji}
        </span>
        <div className={s.headText}>
          <h2 className={s.name}>{panel.cropName}</h2>
          <span className={s.meta}>
            {panel.category} · 난이도 {panel.difficulty}
          </span>
        </div>
        <Link href={`/crops/${panel.cropId}`} className={s.detailLink}>
          상세
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {panel.summary && <p className={s.summary}>{panel.summary}</p>}

      {panel.facts.length > 0 && (
        <dl className={s.factGrid}>
          {panel.facts.map((f) => (
            <div key={f.label} className={s.factRow}>
              <dt className={s.factLabel}>{f.label}</dt>
              <dd className={s.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {panel.regions.length > 0 && (
        <div className={s.line}>
          <span className={s.lineLabel}>주산지</span>
          <div className={s.chips}>
            {panel.regions.map((r) => (
              <span key={r} className={s.regionChip}>
                {shortenRegion(r)}
              </span>
            ))}
          </div>
        </div>
      )}

      {panel.sitelinks.length > 0 && (
        <div className={s.line}>
          <span className={s.lineLabel}>바로가기</span>
          <div className={s.sitelinks}>
            {panel.sitelinks.map((link) => (
              <Link key={link.label} href={link.href} className={s.sitelink}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {panel.relatedCrops.length > 0 && (
        <div className={s.line}>
          <span className={s.lineLabel}>관련작물</span>
          <div className={s.chips}>
            {panel.relatedCrops.map((c) => (
              <Link key={c.id} href={`/crops/${c.id}`} className={s.relatedChip}>
                <span aria-hidden="true">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
