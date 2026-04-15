import { ExternalLink, Phone, MapPin } from "lucide-react";
import type { Center } from "@/lib/data/centers";
import s from "./center-card.module.css";

interface CenterCardProps {
  center: Center;
  /** 카드 상단 라벨 표시 여부 (허브 페이지에서만 시·도명 표시) */
  showSidoLabel?: boolean;
}

/** 폴백(전용 도메인 부재) 케이스를 sidoSlug + name 단서로 판정 */
function isFallback(center: Center): boolean {
  const fallbackSlugs = ["chungbuk", "chungnam", "gangwon", "jeju"];
  return fallbackSlugs.includes(center.sidoSlug);
}

export function CenterCard({ center, showSidoLabel = false }: CenterCardProps) {
  const fallback = isFallback(center);

  return (
    <article className={s.card}>
      {showSidoLabel && <span className={s.sidoLabel}>{center.sido}</span>}
      <h3 className={s.name}>{center.name}</h3>

      <ul className={s.metaList}>
        {center.phone && (
          <li className={s.metaItem}>
            <Phone size={14} aria-hidden="true" className={s.metaIcon} />
            <a href={`tel:${center.phone.replace(/[^0-9]/g, "")}`} className={s.metaLink}>
              {center.phone}
            </a>
          </li>
        )}
        {center.address && (
          <li className={s.metaItem}>
            <MapPin size={14} aria-hidden="true" className={s.metaIcon} />
            <span>{center.address}</span>
          </li>
        )}
      </ul>

      <a
        href={center.url}
        target="_blank"
        rel="noopener noreferrer"
        className={s.cta}
      >
        공식 홈페이지 바로가기
        <ExternalLink size={14} aria-hidden="true" />
      </a>

      {fallback && (
        <p className={s.fallbackNote}>
          ※ 전용 센터 도메인이 없어 도청·농업기술원 페이지로 연결돼요.
        </p>
      )}
    </article>
  );
}
