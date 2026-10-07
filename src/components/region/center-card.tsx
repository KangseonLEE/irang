import { Fragment } from "react";
import { ExternalLink, Phone, MapPin } from "lucide-react";
import { centerFallbackNotice, type Center } from "@/lib/data/centers";
import { centerNameSegments } from "./center-name";
import s from "./center-card.module.css";

/** 붙여 쓴 기관명에 줄바꿈 지점(<wbr>)을 넣는다 — 2단 카드에서 넘치거나 한 글자만 남던 것 (10/6 QA2) */
function CenterName({ name }: { name: string }) {
  return (
    <>
      {centerNameSegments(name).map((segment, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {segment}
        </Fragment>
      ))}
    </>
  );
}

interface CenterCardProps {
  center: Center;
  /** 카드 상단 라벨 표시 여부 (허브 페이지에서만 시·도명 표시) */
  showSidoLabel?: boolean;
  /**
   * 표시 밀도
   * - default: 홈페이지로 연결되는 단일 디자인 카드. 시·도 거점 센터용.
   * - compact: 테이블 행형 (이름 / 전화 pill / 홈페이지). 시·군 리스트용.
   */
  variant?: "default" | "compact";
}

export function CenterCard({
  center,
  showSidoLabel = false,
  variant = "default",
}: CenterCardProps) {
  const fallbackNotice = centerFallbackNotice(center);

  if (variant === "compact") {
    return (
      <article className={s.compactCard}>
        <div className={s.compactMain}>
          <h3 className={s.compactName}>
            <CenterName name={center.name} />
          </h3>
          {fallbackNotice && (
            <span className={s.fallbackNotice}>{fallbackNotice}</span>
          )}
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
      <h3 className={s.name}>
        <CenterName name={center.name} />
      </h3>

      {fallbackNotice && <p className={s.fallbackNotice}>{fallbackNotice}</p>}

      {center.address && (
        <p className={s.address}>
          <MapPin size={13} aria-hidden="true" className={s.addressIcon} />
          {center.address}
        </p>
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
    </article>
  );
}
