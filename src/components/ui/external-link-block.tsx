import { ExternalLink, AlertCircle } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
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

/**
 * 안전한 외부 URL만 통과 (2026-09-17 보안 점검).
 *
 * href 는 큐레이션 데이터(정적 + Supabase)에서 오지만, `javascript:`·`data:` 가 한 번
 * 섞이면 React 19 는 렌더 중 **예외를 던져 페이지 전체가 죽는다**(경고가 아니라 차단).
 * 즉 여기서는 XSS 보다 가용성이 먼저 걸린다 — 허용 프로토콜 밖이면 링크를 렌더하지 않는다.
 */
export function safeHttpUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** URL에서 도메인 추출 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 검색 폴백 URL 생성 */
export function buildSearchFallback(domain: string, title?: string): string {
  const query = title
    ? `site:${domain} ${title}`
    : `site:${domain}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * 원문 외부 링크 블록 — **버튼 하나**가 기본 (2026-09-28 회장, 상세 3종 전역).
 *
 * 도메인 배지·기관 실드·"외부 사이트로 연결돼요…" 안내문·PC 권장 힌트를 모두 뺐다.
 * 같은 내용이 버튼 문구와 푸터 면책 고지에 이미 있어 카드가 길어지기만 했다.
 * 링크 상태 경고(깨짐·변경 확인)는 **버튼이 실패할 이유**를 설명하므로 남긴다.
 */
export function ExternalLinkBlock({
  href,
  label = "원문 페이지 보러가기",
  linkStatus = "active",
  title,
}: ExternalLinkBlockProps) {
  const domain = extractDomain(href);
  const safeHref = safeHttpUrl(href);

  // ── 프로토콜이 http(s)가 아니면 깨진 링크와 같이 취급 (검색 폴백) ──
  const effectiveStatus = safeHref === null ? "broken" : linkStatus;

  // ── 링크가 깨진 경우 ──
  if (effectiveStatus === "broken") {
    const searchUrl = buildSearchFallback(domain, title);
    return (
      <div className={s.block}>
        <div className={s.brokenNotice}>
          <AlertCircle size={16} aria-hidden="true" />
          <span>원문 페이지가 현재 연결되지 않아요.</span>
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

        <p className={s.notice}>
          원문 페이지가 변경되었거나 삭제되었어요. 위 검색 링크를 통해 기관
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
          href={safeHref ?? href}
          target="_blank"
          rel="noopener noreferrer"
          className={s.buttonCaution}
        >
          <ExternalLink size={16} aria-hidden="true" />
          {label}
        </a>

        <p className={s.noticeCaution}>
          이 링크는 최근 변경이 확인되었어요. 페이지 내용이 다를 수 있으니
          기관 홈페이지에서 직접 검색을 권장해요.
        </p>
      </div>
    );
  }

  // ── 정상 상태 (기본) ──
  return (
    <div className={s.block}>
      <a
        href={safeHref ?? href}
        target="_blank"
        rel="noopener noreferrer"
        className={s.button}
      >
        <ExternalLink size={16} aria-hidden="true" />
        {label}
      </a>
    </div>
  );
}
