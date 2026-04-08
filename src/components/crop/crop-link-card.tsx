import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./crop-link-card.module.css";

/* ==========================================================================
   CropLinkCard — 작물 링크 카드 공통 컴포넌트
   이미지(왼) + 이름·메타(중앙) + 화살표(오른) 구성.
   지역 상세, 시군구 상세, 인터뷰 상세, 맞춤 추천 등 모든 곳에서 사용.
   ========================================================================== */

interface CropLinkCardProps {
  /** 작물 ID (이미지 경로 생성용: /crops/{id}.jpg) */
  cropId: string;
  /** 작물 이름 */
  name: string;
  /** 링크 URL (예: /crops/strawberry) */
  href: string;
  /** 이름 아래 메타 텍스트 (예: "과일 · 재배난이도: 쉬움") */
  meta?: string;
}

/**
 * 작물 링크 카드.
 * 왼쪽에 작물 이미지(48×48), 가운데 이름·메타, 오른쪽 화살표.
 * 모든 페이지에서 작물 데이터를 동일한 형태로 표시합니다.
 */
export function CropLinkCard({ cropId, name, href, meta }: CropLinkCardProps) {
  return (
    <Link href={href} className={s.card}>
      <Image
        src={`/crops/${cropId}.jpg`}
        alt={name}
        width={48}
        height={48}
        className={s.image}
      />
      <div className={s.body}>
        <span className={s.name}>{name}</span>
        {meta && <span className={s.meta}>{meta}</span>}
      </div>
      <ArrowRight size={14} className={s.arrow} />
    </Link>
  );
}
