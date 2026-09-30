import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Phone } from "lucide-react";

import type { EntityPanel, PanelChipLine } from "@/lib/data/entity-panel";
import { getCropImageSrc, hasCropIllustration } from "@/lib/crop-image";
import { StatusBadge } from "@/components/ui/status-badge";

import s from "./knowledge-panel.module.css";

/**
 * 엔티티 지식 패널 — 검색어가 시·도·시·군·구·지원사업·교육·행사 하나로 특정될 때
 * 결과 최상단에 그 실체의 요약을 메인으로 그린다 (2026-09-30 회장 지시).
 *
 * 작물 지식 패널(`CropKnowledgePanel`)과 **같은 스타일시트**를 쓴다 — 프레임·톤이 한 벌이어야
 * 사용자가 "이게 이 검색의 답"이라는 위계를 같은 방식으로 읽는다.
 *
 * 다섯 종류가 한 컴포넌트를 쓰는 이유: 블록 구성(요약·사실 그리드·칩 라인·목록·센터·원문·다음 행동)이
 * 같고 채워지는 값만 다르다. 종류별로 컴포넌트를 만들면 같은 프레임이 다섯 벌이 된다.
 */

/** 안전한 외부 URL만 통과 — 허용 프로토콜 밖이면 링크를 만들지 않는다 (result-card 와 같은 가드) */
function safeHttpUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function ChipLine({ line }: { line: PanelChipLine }) {
  const hasContent = (line.chips?.length ?? 0) > 0 || (line.links?.length ?? 0) > 0;
  if (!hasContent) return null;
  return (
    <div className={s.line}>
      <span className={s.lineLabel}>{line.label}</span>
      <div className={s.chips}>
        {line.chips?.map((chip) => (
          <span key={chip} className={s.regionChip}>
            {chip}
          </span>
        ))}
        {line.links?.map((link) => (
          <Link key={link.href} href={link.href} className={s.sitelink}>
            {link.label}
          </Link>
        ))}
        {line.overflow != null && line.overflow > 0 && (
          <span className={s.overflowCount}>+{line.overflow}</span>
        )}
      </div>
    </div>
  );
}

export function EntityKnowledgePanel({ panel }: { panel: EntityPanel }) {
  const source = panel.source ? safeHttpUrl(panel.source.href) : null;
  const centerSite = panel.center ? safeHttpUrl(panel.center.url) : null;

  return (
    <section
      className={s.panel}
      aria-label={`${panel.title} 요약`}
      data-search-result={`panel:${panel.kind}`}
    >
      <div className={s.head}>
        <span className={s.emoji} aria-hidden="true">
          {panel.icon}
        </span>
        <div className={s.headText}>
          {panel.overline && <span className={s.overline}>{panel.overline}</span>}
          <div className={s.headTop}>
            <h2 className={s.name}>{panel.title}</h2>
            {panel.statusLabel && <StatusBadge status={panel.statusLabel} />}
          </div>
          {panel.meta && <span className={s.meta}>{panel.meta}</span>}
        </div>
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

      {panel.bullets.length > 0 && (
        <ul className={s.bullets}>
          {panel.bullets.map((b) => (
            <li key={b} className={s.bullet}>
              {b}
            </li>
          ))}
        </ul>
      )}

      {panel.lines.map((line) => (
        <ChipLine key={line.label} line={line} />
      ))}

      {panel.crops.length > 0 && (
        <div className={s.group}>
          <div className={s.groupHead}>
            <h3 className={s.groupLabel}>추천 작물</h3>
          </div>
          <div className={s.cropCards}>
            {panel.crops.map((crop) => (
              <Link key={crop.id} href={`/crops/${crop.id}`} className={s.cropCard}>
                <span className={s.cropThumb} aria-hidden="true">
                  {hasCropIllustration(crop.id) ? (
                    <Image src={getCropImageSrc(crop.id)} alt="" width={32} height={32} />
                  ) : (
                    crop.emoji
                  )}
                </span>
                <span className={s.cropName}>{crop.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {panel.groups.map((group) => (
        <div key={group.label} className={s.group}>
          <div className={s.groupHead}>
            <h3 className={s.groupLabel}>{group.label}</h3>
            {group.more && (
              <Link href={group.more.href} className={s.groupMore}>
                {group.more.label} →
              </Link>
            )}
          </div>
          <ul className={s.groupList}>
            {group.items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={s.groupItem}>
                  <span className={s.groupItemBody}>
                    <span className={s.groupItemTitle}>{item.title}</span>
                    {item.meta && <span className={s.groupItemMeta}>{item.meta}</span>}
                  </span>
                  {item.status && <StatusBadge status={item.status} />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {panel.center && (
        <div className={s.center}>
          <span className={s.centerName}>
            {panel.center.name}
            {panel.center.notice && (
              <span className={s.centerNotice}>{panel.center.notice}</span>
            )}
          </span>
          <div className={s.centerActions}>
            {panel.center.phone && (
              <a
                href={`tel:${panel.center.phone.replace(/[^0-9+]/g, "")}`}
                className={s.centerAction}
              >
                <Phone size={13} aria-hidden="true" />
                {panel.center.phone}
              </a>
            )}
            {centerSite && (
              <a
                href={centerSite}
                target="_blank"
                rel="noopener noreferrer"
                className={s.centerAction}
                aria-label={`${panel.center.name} 홈페이지 (새 창)`}
              >
                <ExternalLink size={13} aria-hidden="true" />
                홈페이지
              </a>
            )}
          </div>
        </div>
      )}

      {source && panel.source && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className={s.sourceLink}
        >
          {panel.source.label}
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}

      <div className={s.ctas}>
        {panel.ctas.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className={cta.primary ? s.ctaPrimary : s.cta}
          >
            {cta.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
