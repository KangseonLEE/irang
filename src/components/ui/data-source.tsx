import { ExternalLink } from "lucide-react";
import s from "./data-source.module.css";

interface DataSourceProps {
  /** 출처 기관/데이터셋 이름 (e.g., "농림축산식품부 2025 귀농귀촌 실태조사") */
  source: string;
  /** 부가 설명 (e.g., "항목을 누르면 네이버 지도에서 확인할 수 있습니다") */
  note?: string;
  /** 외부 링크 URL (optional — 링크가 있으면 클릭 가능한 출처 표시) */
  href?: string;
  /** 시각적 변형: caption (기본, 작은 회색 텍스트) | badge (작은 뱃지 스타일) */
  variant?: "caption" | "badge";
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 데이터 출처 통합 표시 컴포넌트
 *
 * 사이트 전체에서 일관된 출처 표기를 위해 사용합니다.
 * - caption (기본): 차트, 카드, 모달 하단의 작은 출처 텍스트
 * - badge: 페이지 상단의 출처 뱃지 (e.g., 작물 상세 브레드크럼 옆)
 */
export function DataSource({
  source,
  note,
  href,
  variant = "caption",
  className,
}: DataSourceProps) {
  if (variant === "badge") {
    return (
      <span className={`${s.badge} ${className ?? ""}`}>
        출처: {source}
      </span>
    );
  }

  // caption variant (default)
  return (
    <p className={`${s.caption} ${className ?? ""}`}>
      출처: {source}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={s.link}
        >
          {extractDomain(href)} <ExternalLink size={10} />
        </a>
      )}
      {note && (
        <span className={s.note}> · {note}</span>
      )}
    </p>
  );
}

/** URL에서 도메인만 추출 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
