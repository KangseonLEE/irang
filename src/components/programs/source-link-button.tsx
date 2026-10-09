import { ExternalLink } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import {
  buildSearchFallback,
  extractDomain,
  safeHttpUrl,
} from "@/components/ui/external-link-block";
import { sourceButtonLabel, sourceHost } from "@/lib/source-label";
import s from "./source-link-button.module.css";

interface SourceLinkButtonProps {
  /** 원문 공고 URL */
  href: string;
  /** 링크 상태 — broken 이면 검색 폴백으로 대체 */
  linkStatus?: "active" | "broken" | "unverified";
  /** 검색 폴백 쿼리에 쓰는 공고 제목 */
  title?: string;
}

/**
 * 제목 영역 원문 바로가기 버튼 (2026-09-27).
 *
 * 배경: 원문 링크가 사이드바 맨 아래(관련 작물 55개 뒤, 데스크탑 y≈4,051px)에만 있어
 * "원문 링크가 없다"는 리포트가 나왔다. 상세 페이지에서 가장 자주 쓰는 행동이므로
 * 첫 화면에 둔다. 사이드바 "원문 확인" 카드(ExternalLinkBlock — 도메인 배지·면책 안내)는
 * 그대로 두고 맨 위로 올린다 — 여기는 행동, 거기는 맥락.
 *
 * 깨진 링크는 ExternalLinkBlock 과 **같은 목적지**(site: 검색)로 보낸다.
 * external_click 계측은 전역 OutboundClickTracker 가 위임 수집하므로 여기서 달지 않는다.
 */
export function SourceLinkButton({
  href,
  linkStatus = "active",
  title,
}: SourceLinkButtonProps) {
  const safeHref = safeHttpUrl(href);
  const broken = safeHref === null || linkStatus === "broken";

  if (broken) {
    const domain = extractDomain(href);
    return (
      <a
        href={buildSearchFallback(domain, title)}
        target="_blank"
        rel="noopener" referrerPolicy="origin"
        className={s.button}
      >
        <Search size={16} aria-hidden="true" />
        원문 검색으로 찾기
      </a>
    );
  }

  const label = sourceButtonLabel(href);
  const host = sourceHost(href);
  /* 도메인 텍스트는 버튼 옆에 노출하지 않는다 (9/28 회장) — 목적지는 aria-label 로만 알리고
     화면에는 라벨만 남긴다. 도메인 칩·안내문은 사이드 "원문 확인" 카드(ExternalLinkBlock)가 든다. */
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener" referrerPolicy="origin"
      className={s.button}
      aria-label={`${label} (${host}, 새 창)`}
    >
      <ExternalLink size={16} aria-hidden="true" />
      {label}
    </a>
  );
}
