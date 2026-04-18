import { ExternalLink, Phone, MapPin } from "lucide-react";
import type { Center } from "@/lib/data/centers";
import s from "./center-card.module.css";

interface CenterCardProps {
  center: Center;
  /** 카드 상단 라벨 표시 여부 (허브 페이지에서만 시·도명 표시) */
  showSidoLabel?: boolean;
  /**
   * 표시 밀도
   * - default: 전화번호 전면 배치 강조 카드. 시·도 거점 센터용.
   * - compact: 테이블 행형 (이름 / 전화 pill / 홈페이지). 시·군 리스트용.
   */
  variant?: "default" | "compact";
}

/** 폴백(전용 도메인 부재) 케이스를 sidoSlug + name 단서로 판정 */
function isFallback(center: Center): boolean {
  const fallbackSlugs = ["chungbuk", "chungnam", "gangwon", "jeju"];
  return fallbackSlugs.includes(center.sidoSlug);
}

export function CenterCard({
  center,
  showSidoLabel = false,
  variant = "default",
}: CenterCardProps) {
  const fallback = isFallback(center);

  if (variant === "compact") {
    return (
      <article className={s.compactCard}>
        <div className={s.compactMain}>
          <h3 className={s.compactName}>{center.name}</h3>
          {center.address && (
            <span className={s.compactAddress}>
              <MapPin size={12} aria-hidden="true" />
              {center.address}
            </span>
          )}
        </div>

        <div className={s.compactActions}>
          {center.phone && (
            <a
              href={`tel:${center.phone.replace(/[^0-9]/g, "")}`}
              className={s.compactPhone}
              aria-label={`${center.name} 전화 걸기 ${center.phone}`}
            >
              <Phone size={13} aria-hidden="true" />
              <span>{center.phone}</span>
            </a>
          )}
          <a
            href={center.url}
            target="_blank"
            rel="noopener noreferrer"
            className={s.compactWeb}
            aria-label={`${center.name} 홈페이지 새 창`}
          >
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className={s.card}>
      {showSidoLabel && <span className={s.sidoLabel}>{center.sido}</span>}
      <h3 className={s.name}>{center.name}</h3>

      {center.phone && (
        <div className={s.phoneBlock}>
          <Phone size={16} aria-hidden="true" className={s.phoneIcon} />
          <span className={s.phoneNumber}>{center.phone}</span>
        </div>
      )}

      {center.address && (
        <p className={s.address}>
          <MapPin size={13} aria-hidden="true" className={s.addressIcon} />
          {center.address}
        </p>
      )}

      <div className={s.cardActions}>
        {center.phone && (
          <a
            href={`tel:${center.phone.replace(/[^0-9]/g, "")}`}
            className={s.callCta}
          >
            <Phone size={14} aria-hidden="true" />
            전화 상담
          </a>
        )}
        <a
          href={center.url}
          target="_blank"
          rel="noopener noreferrer"
          className={s.webCta}
        >
          홈페이지
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      </div>

      {fallback && (
        <p className={s.fallbackNote}>
          ※ 전용 센터 도메인이 없어 도청·농업기술원 페이지로 연결돼요.
        </p>
      )}
    </article>
  );
}
