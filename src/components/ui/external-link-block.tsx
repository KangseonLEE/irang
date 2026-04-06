import { ExternalLink, Shield } from "lucide-react";
import s from "./external-link-block.module.css";

interface ExternalLinkBlockProps {
  /** 외부 URL */
  href: string;
  /** 버튼 라벨 (기본: "원문 페이지 방문") */
  label?: string;
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

/** 원문 외부 링크 블록 — 도메인 배지 + 면책 안내 포함 */
export function ExternalLinkBlock({
  href,
  label = "원문 페이지 방문",
}: ExternalLinkBlockProps) {
  const domain = extractDomain(href);
  const isGov = isGovDomain(domain);

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
    </div>
  );
}
