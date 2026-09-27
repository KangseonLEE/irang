"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { SectionPager } from "@/components/ui/section-pager";
import s from "./related-crops-card.module.css";

/** 페이지 렌더에서 직렬화해 내려주는 작물 한 줄 (Server → Client 경계는 값만) */
export interface RelatedCrop {
  name: string;
  /** 작물 상세가 있는 경우에만 — 없으면 정적 표시 */
  id?: string;
  emoji?: string;
  category?: string;
  difficulty?: string;
}

const PER_PAGE = 5;

/**
 * 관련 작물 카드 (2026-09-27).
 *
 * 작물 범용 지원사업은 relatedCrops 가 55개라 사이드바가 1,000px 넘게 늘어나고,
 * 그 아래 있던 원문 링크가 데스크탑 y≈4,051px 로 밀려 "원문 링크가 없다"는 리포트가 됐다.
 * 5개씩 나눠 카드 높이를 고정하고, 전체 개수는 제목 옆 배지로 알린다.
 */
export function RelatedCropsCard({ crops, bare = false }: { crops: RelatedCrop[]; /** 사이드 탭 패널 안 — 카드 껍데기·제목 없이 */ bare?: boolean }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(crops.length / PER_PAGE);
  const visible = crops.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className={bare ? s.bare : s.card}>
      {!bare && (
      <div className={s.cardHeader}>
        <h2 className={s.cardTitle}>
          <Leaf size={16} aria-hidden="true" />
          관련 작물
          <span className={s.count}>{crops.length}</span>
        </h2>
      </div>
      )}
      {bare && <p className={s.bareCount}>이 사업과 이어지는 작물 {crops.length}종이에요.</p>}
      <div className={bare ? s.bareContent : s.cardContent}>
        <ul className={s.cropList}>
          {visible.map((crop) =>
            crop.id ? (
              <li key={crop.name} className={s.cropRow}>
                <Link href={`/crops/${crop.id}`} className={s.cropItem}>
                  <span className={s.cropEmoji} aria-hidden="true">
                    {crop.emoji}
                  </span>
                  <span className={s.cropItemText}>
                    <span className={s.cropItemName}>{crop.name}</span>
                    <span className={s.cropItemSub}>
                      {crop.category} · {crop.difficulty}
                    </span>
                  </span>
                  <ArrowRight size={14} className={s.cropArrow} aria-hidden="true" />
                </Link>
              </li>
            ) : (
              <li key={crop.name} className={s.cropRow}>
                <span className={s.cropItemStatic}>
                  <span className={s.cropEmojiMuted} aria-hidden="true">
                    🌱
                  </span>
                  <span className={s.cropItemText}>
                    <span className={s.cropItemName}>{crop.name}</span>
                  </span>
                </span>
              </li>
            ),
          )}
        </ul>

        {pageCount > 1 && (
          <div className={s.pagerWrap}>
            <SectionPager
              page={page}
              total={pageCount}
              onChange={setPage}
              ariaLabel="관련 작물 페이지"
            />
          </div>
        )}
      </div>
    </div>
  );
}
