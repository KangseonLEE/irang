import { ExternalLink, Shield, AlertCircle, Search, Monitor } from "lucide-react";
import s from "./external-link-block.module.css";

interface ExternalLinkBlockProps {
  /** 외부 URL */
  href: string;
  /** 버튼 라벨 (기본: "원문 페이지 방문") */
  label?: string;
  /** 링크 상태 — broken이면 폴백 UI 표시 */
  linkStatus?: "active" | "broken" | "unverified";
  /** 검색 폴백용 제목 (broken 상태에서 Google 검색에 사용) */
  title?: string;
}

/** URL에서 도메인 추출 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** .go.kr / .or.kr 등 공공기관 도메인 여부 */
function isGovDomain(domain: string): boolean {
  return /\.(go|or|ac|re)\.kr$/.test(domain);
}

/** 검색 폴백 URL 생성 */
function buildSearchFallback(domain: string, title?: string): string {
  const query = title
    ? `site:${domain} ${title}`
    : `site:${domain}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** 원문 외부 링크 블록 — 도메인 배지 + 면책 안내 포함 */
export function ExternalLinkBlock({
  href,
  label = "원문 페이지 방문",
  linkStatus = "active",
  title,
}: ExternalLinkBlockProps) {
  const domain = extractDomain(href);
  const isGov = isGovDomain(domain);

  // ── 링크가 깨진 경우 ──
  if (linkStatus === "broken") {
    const searchUrl = buildSearchFallback(domain, title);
    return (
      <div className={s.block}>
        <div className={s.brokenNotice}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>원문 페이지가 현재 연결되지 않습니다.</span>
        </div>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={s.searchFallback}
        >
          <Search size={16} aria-hidden="true" />
          검색으로 찾아보기
        </a>

        <div className={s.meta}>
          <span className={s.domainBadge}>{domain}</span>
        </div>

        <p className={s.notice}>
          원문 페이지가 변경되었거나 삭제되었습니다. 위 검색 링크를 통해 기관
          사이트에서 직접 확인하시거나, 이랑에 저장된 내용을 참고하세요.
        </p>
      </div>
    );
  }

  // ── 확인 필요 상태 ──
  if (linkStatus === "unverified") {
    return (
      <div className={s.block}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={s.buttonCaution}
        >
          <ExternalLink size={16} aria-hidden="true" />
          {label}
        </a>

        <div className={s.meta}>
          {isGov ? (
            <span className={s.govBadge} aria-label="공식 정부 도메인">
              <Shield size={12} aria-hidden="true" />
              {domain}
            </span>
          ) : (
            <span className={s.domainBadge}>{domain}</span>
          )}
        </div>

        <p className={s.noticeCaution}>
          이 링크는 최근 변경이 확인되었습니다. 페이지 내용이 다를 수 있으니
          기관 홈페이지에서 직접 검색을 권장합니다.
        </p>

        {isGov && (
          <p className={s.desktopHint}>
            <Monitor size={14} aria-hidden="true" />
            일부 정부·공공기관 사이트는 모바일 화면에 최적화되어 있지 않습니다. 원문 확인은 PC 환경을 권장합니다.
          </p>
        )}
      </div>
    );
  }

  // ── 정상 상태 (기본) ──
  return (
    <div className={s.block}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={s.button}
      >
        <ExternalLink size={16} aria-hidden="true" />
        {label}
      </a>

      <div className={s.meta}>
        {isGov && (
          <span className={s.govBadge} aria-label="공식 정부 도메인">
            <Shield size={12} aria-hidden="true" />
            {domain}
          </span>
        )}
        {!isGov && (
          <span className={s.domainBadge}>
            {domain}
          </span>
        )}
      </div>

      <p className={s.notice}>
        {isGov
          ? "정부·공공기관 원문 사이트로 연결됩니다. 모집 종료 후 원문이 삭제될 수 있으며, 이 경우 이랑에 저장된 내용을 참고하세요."
          : "외부 사이트로 연결됩니다. 페이지가 변경되었을 수 있으며, 이 경우 이랑에 저장된 내용을 참고하세요."}
      </p>

      {isGov && (
        <p className={s.desktopHint}>
          <Monitor size={14} aria-hidden="true" />
          일부 정부·공공기관 사이트는 모바일 화면에 최적화되어 있지 않습니다. 원문 확인은 PC 환경을 권장합니다.
        </p>
      )}
    </div>
  );
}
